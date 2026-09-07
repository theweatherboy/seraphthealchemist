import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('account migration protects private profiles and admin membership', async () => {
  const db = new PGlite();
  const first = '00000000-0000-4000-8000-000000000001';
  const second = '00000000-0000-4000-8000-000000000002';
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
      insert into auth.users values ('${first}', 'private@example.test', '{"role":"admin","full_name":"Private name"}');
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202609060001_accounts.sql', import.meta.url), 'utf8'));
    await db.query('insert into auth.users (id, email) values ($1, $2)', [second, 'second@example.test']);
    const profiles = await db.query('select * from public.profiles');
    assert.equal(profiles.rows.length, 2, 'backfill and new-user trigger both provision profiles');
    assert(profiles.rows.every(row => row.display_name === 'Sanctuary member'), 'Google metadata is not published');
    assert.notEqual(profiles.rows[0].public_id, profiles.rows[1].public_id);
    assert.equal((await db.query('select * from public.admin_memberships')).rows.length, 0, 'metadata cannot bootstrap admin');
    await db.query('insert into public.admin_memberships(user_id) values ($1)', [second]);

    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [first]);
    assert.equal((await db.query('select * from public.profiles')).rows.length, 1, 'RLS filters other customers');
    assert.equal((await db.query('select * from public.admin_memberships')).rows.length, 0, 'other memberships are private');
    await db.query('update public.profiles set display_name = $1 where id = $2', ['River', first]);
    assert.equal((await db.query('select display_name from public.profiles')).rows[0].display_name, 'River');
    const crossUser = await db.query('update public.profiles set display_name = $1 where id = $2 returning id', ['Intruder', second]);
    assert.equal(crossUser.rows.length, 0, 'cannot edit another customer');
    for (const query of [
      `insert into public.admin_memberships(user_id) values ('${first}')`,
      `update public.profiles set id = '${second}'`,
      'update public.profiles set public_id = gen_random_uuid()',
      "update public.profiles set created_at = '2020-01-01'",
      'delete from public.profiles',
      'delete from public.admin_memberships',
      'select public.create_sanctuary_profile()',
    ]) {
      await assert.rejects(db.query(query), error => error.code === '42501', query);
    }
    await assert.rejects(db.query("update public.profiles set display_name = 'x'"), error => error.code === '23514');
    await assert.rejects(db.query("update public.profiles set display_name = E'Bad\\nname'"), error => error.code === '23514');

    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [second]);
    assert.equal((await db.query('select * from public.admin_memberships')).rows[0].user_id, second);
    await assert.rejects(db.query(`insert into public.admin_memberships(user_id) values ('${first}')`), error => error.code === '42501', 'even an admin cannot grant membership through the public API');
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query('select * from public.profiles'), error => error.code === '42501');
    await assert.rejects(db.query('select * from public.admin_memberships'), error => error.code === '42501');
    await db.exec('reset role;');
    await db.query('delete from auth.users where id = $1', [second]);
    assert.equal((await db.query('select * from public.admin_memberships')).rows.length, 0);
    assert.equal((await db.query('select * from public.profiles')).rows.length, 1);
  } finally {
    await db.close();
  }
});
