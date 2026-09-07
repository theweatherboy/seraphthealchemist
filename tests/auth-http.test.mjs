import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';

// Run against a production build. Supabase is simulated on loopback; no real
// account, Google login or hosted database is used by these boundary checks.
test('HTTP auth boundaries, OAuth callback and account permissions', { timeout: 90000 }, async () => {
  const userId = '00000000-0000-4000-8000-000000000001';
  const publicId = '00000000-0000-4000-8000-000000000002';
  let isAdmin = false;
  let displayName = 'River';
  let callbackCount = 0;
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated' })}.test-signature`;
  const user = { id: userId, email: 'private@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'google' }, user_metadata: {}, created_at: new Date().toISOString() };
  const backend = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/auth/v1/token') {
      callbackCount++;
      let body = '';
      for await (const chunk of request) body += chunk;
      const input = JSON.parse(body);
      assert(input.code_verifier, 'PKCE verifier is sent during code exchange');
      if (input.auth_code !== 'valid') {
        response.writeHead(400); response.end(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid test code' })); return;
      }
      response.end(JSON.stringify({ access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, user })); return;
    }
    if (request.headers.authorization !== `Bearer ${token}`) {
      response.writeHead(401); response.end(JSON.stringify({ message: 'Invalid test token' })); return;
    }
    if (url.pathname === '/auth/v1/user') { response.end(JSON.stringify(user)); return; }
    if (url.pathname === '/auth/v1/logout') { response.writeHead(204); response.end(); return; }
    if (url.pathname === '/rest/v1/profiles') {
      if (request.method === 'GET' && !url.searchParams.has('id')) {
        assert(isAdmin, 'only the admin page requests the customer list');
        response.end(JSON.stringify([{ id: userId, display_name: displayName }])); return;
      }
      assert.equal(url.searchParams.get('id'), `eq.${userId}`, 'owner filter uses verified session ID');
      if (request.method === 'PATCH') {
        let body = ''; for await (const chunk of request) body += chunk;
        displayName = JSON.parse(body).display_name;
      }
      response.end(JSON.stringify({ id: userId, public_id: publicId, display_name: displayName })); return;
    }
    if (url.pathname === '/rest/v1/admin_memberships') {
      response.end(JSON.stringify(isAdmin ? { user_id: userId } : null)); return;
    }
    if (['/rest/v1/service_instances', '/rest/v1/reviews'].includes(url.pathname)) {
      response.end('[]'); return;
    }
    response.writeHead(404); response.end('{}');
  });
  backend.listen(0, '127.0.0.1');
  await once(backend, 'listening');
  const backendOrigin = `http://127.0.0.1:${backend.address().port}`;
  const port = 4387;
  const origin = `http://localhost:${port}`;
  let app;
  let logs = '';
  const start = async configured => {
    app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
      windowsHide: true,
      // Invalid nonempty aliases suppress even a real NEXT_PUBLIC fallback
      // embedded in a local build, so missing-config tests never contact it.
      env: { ...process.env, SITE_URL: origin, SUPABASE_URL: configured ? backendOrigin : 'disabled', SUPABASE_PUBLISHABLE_KEY: configured ? 'sb_publishable_local_test_only' : 'disabled', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    app.stdout.on('data', chunk => { logs += chunk; });
    app.stderr.on('data', chunk => { logs += chunk; });
    for (let i = 0; i < 100; i++) {
      if (app.exitCode !== null) throw new Error(`Next exited: ${logs}`);
      try { const r = await fetch(`${origin}/login`); if (r.ok) return; } catch { /* wait for readiness */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error(`Next did not start: ${logs}`);
  };
  const stop = async () => {
    if (app && app.exitCode === null) { const stopped = once(app, 'exit'); app.kill(); await stopped; }
  };
  const jar = new Map();
  const request = async (path, options = {}) => {
    const response = await fetch(`${origin}${path}`, {
      ...options, redirect: 'manual', headers: { Cookie: [...jar].map(([k,v])=>`${k}=${v}`).join('; '), ...options.headers },
    });
    for (const cookie of response.headers.getSetCookie()) {
      const part = cookie.split(';')[0]; const split = part.indexOf('=');
      jar.set(part.slice(0, split), part.slice(split + 1));
    }
    return response;
  };
  const submit = async (path, buttonText, values = {}) => {
    const page = await request(path); const html = await page.text();
    const form = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].find(match => match[1].includes(buttonText));
    assert(form, `form ${buttonText} exists; status=${page.status}; unavailable=${html.includes('Account sign-in is coming soon')}; logs=${logs}`);
    const field = form[1].match(/name="(\$ACTION_ID_[^"]+)"/);
    assert(field, 'server action field exists');
    const body = new FormData(); body.set(field[1], '');
    Object.entries(values).forEach(([key, value]) => body.set(key, value));
    return request(path, { method: 'POST', body, headers: { Origin: origin } });
  };
  try {
    await start(false);
    assert.match(await (await request('/login')).text(), /Account sign-in is coming soon/);
    assert.equal((await request('/account')).headers.get('location'), '/login');
    assert.equal((await request('/admin')).headers.get('location'), '/login');
    const callback = await request('/auth/callback?code=untrusted&next=https://evil.example');
    assert.equal(callback.headers.get('location'), `${origin}/login?error=callback`);
    assert.match(callback.headers.get('cache-control'), /no-store/);
    await stop();

    await start(true);
    const login = await submit('/login', 'Continue with Google');
    const authorize = new URL(login.headers.get('location'));
    assert.equal(authorize.origin, backendOrigin);
    assert.equal(authorize.searchParams.get('provider'), 'google');
    assert.equal(authorize.searchParams.get('redirect_to'), `${origin}/auth/callback`);
    assert(login.headers.getSetCookie().some(cookie => /httponly/i.test(cookie)), 'PKCE cookie is HTTP-only');
    const exchange = await request('/auth/callback?code=valid&next=https://evil.example');
    assert.equal(exchange.headers.get('location'), `${origin}/account`, 'untrusted redirect destination is ignored');
    assert.equal(callbackCount, 1);
    const account = await request('/account');
    assert.equal(account.status, 200);
    assert.match(account.headers.get('cache-control'), /private/);
    assert.match(await account.text(), /private@example.test/);
    assert.equal((await request('/admin')).status, 404, 'non-admin cannot open admin screen');
    const invalidName = await submit('/account', 'Save display name', { display_name: 'x' });
    assert.equal(invalidName.headers.get('location'), '/account?error=name');
    const updated = await submit('/account', 'Save display name', { display_name: ' Willow ', id: 'attacker-supplied-id' });
    assert.equal(updated.headers.get('location'), '/account?saved=1');
    assert.equal(displayName, 'Willow');
    isAdmin = true;
    assert.match(await (await request('/admin')).text(), /Your administrator access is confirmed/);
    const logout = await submit('/account', 'Sign out');
    assert.equal(logout.headers.get('location'), '/login?message=signed-out');
    assert.match((await request('/account')).headers.get('location'), /^\/login/);
  } finally {
    await stop();
    backend.closeAllConnections();
    await new Promise(resolve => backend.close(resolve));
  }
});
