import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

test('LIVE intake requires consent, protects private data, preserves totals, and never changes scheduling', async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public, auth to anon, authenticated;`);
    const folder = new URL('../supabase/migrations/', import.meta.url);
    for (const name of (await readdir(folder)).filter(name => name.endsWith('.sql')).sort()) await db.exec(await readFile(new URL(name, folder), 'utf8'));
    const admin = randomUUID(), customer = randomUUID();
    await db.query("insert into auth.users(id,email) values ($1,'owner@example.test'),($2,'customer@example.test')", [admin, customer]);
    await db.query('insert into public.admin_memberships(user_id) values ($1)', [admin]);
    const snapshot = async () => {
      const result = {};
      for (const table of ['service_requests', 'scheduling_blocks', 'scheduling_availability', 'service_schedule_policies', 'service_instances']) result[table] = (await db.query(`select * from public.${table}`)).rows;
      return result;
    };
    const before = await snapshot();
    const submit = (changes = {}) => {
      const args = { id: randomUUID(), name: 'LIVE visitor', email: '', services: ['guidance', 'aura'], extra: true, payment: 'paypal', reference: 'Visitor receipt', terms: true, privacy: true, confirmed: true, source: 'visitor', ...changes };
      return db.query('select public.submit_tiktok_live($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) as id', Object.values(args));
    };
    await db.exec('set role anon');
    for (const field of ['terms', 'privacy', 'confirmed']) {
      for (const value of [false, null]) await assert.rejects(submit({ [field]: value }), /acknowledge/);
    }
    for (const changes of [{ services: [] }, { services: ['made-up'] }, { services: ['guidance', 'guidance'] }, { services: [null] }, { services: ['mediumship'], extra: true }]) await assert.rejects(submit(changes), /valid LIVE offerings/);
    await assert.rejects(submit({ name: '', email: '' }), /valid name/);
    await assert.rejects(submit({ email: 'invalid' }), /valid name/);
    await assert.rejects(submit({ payment: 'forged' }), /payment method/);
    await assert.rejects(submit({ source: 'admin' }), e => e.code === '42501');
    const id = randomUUID();
    await submit({ id });
    await submit({ id });
    await assert.rejects(submit({ id, name: 'Changed identity' }), /already used/);
    await assert.rejects(db.query('select * from public.tiktok_live_queue'), e => e.code === '42501');
    await assert.rejects(db.query("insert into public.tiktok_live_queue(id) values (gen_random_uuid())"), e => e.code === '42501');
    await assert.rejects(db.query("update public.tiktok_live_queue set status='completed'"), e => e.code === '42501');
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [customer]);
    assert.equal((await db.query('select * from public.tiktok_live_queue')).rows.length, 0);
    assert.equal((await db.query("update public.tiktok_live_queue set status='completed' returning id")).rows.length, 0);
    await assert.rejects(submit({ source: 'admin' }), e => e.code === '42501');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    const rows = (await db.query('select * from public.tiktok_live_queue')).rows;
    assert.equal(rows.length, 1, 'retry creates only one record');
    assert.equal(rows[0].expected_amount, 132);
    assert.deepEqual(rows[0].items.map(item => item.amount), [55, 66, 11]);
    assert.equal(rows[0].status, 'waiting');
    assert.equal(rows[0].payment_status, 'unverified');
    assert(rows[0].acknowledged_at);
    assert.equal(rows[0].terms_version, '2026-09-16');
    assert.equal(rows[0].privacy_version, '2026-10-12');
    assert.equal(rows[0].source, 'visitor');
    for (const status of ['completed', 'removed', 'waiting']) {
      await db.query('update public.tiktok_live_queue set status=$1 where id=$2', [status, id]);
      assert.equal((await db.query('select status from public.tiktok_live_queue where id=$1', [id])).rows[0].status, status);
    }
    await db.query("update public.tiktok_live_queue set payment_status='verified' where id=$1", [id]);
    await assert.rejects(db.query('update public.tiktok_live_queue set expected_amount=1 where id=$1', [id]), e => e.code === '42501');
    await assert.rejects(db.query('delete from public.tiktok_live_queue where id=$1', [id]), e => e.code === '42501');
    await assert.rejects(submit({ source: 'admin', privacy: false }), /acknowledge/);
    const manualId = randomUUID();
    await submit({ id: manualId, name: '', email: 'manual@example.test', services: ['mediumship','energy','chakra'], extra: false, source: 'admin' });
    const manual = (await db.query('select * from public.tiktok_live_queue where id=$1', [manualId])).rows[0];
    assert.equal(manual.expected_amount, 220);
    assert.equal(manual.source, 'admin');
    assert.equal(manual.entered_by, admin);
    await db.exec('reset role');
    assert.deepEqual(await snapshot(), before, 'no appointment, availability, block, policy or service record changed');
    await db.exec('set role anon');
    await submit(); await submit();
    await assert.rejects(submit(), /Please wait/);
  } finally { await db.close(); }
});
