import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

test('catalog management is admin-only and keeps booking duration and limits in sync', async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
    `);
    const folder = new URL('../supabase/migrations/', import.meta.url);
    for (const name of (await readdir(folder)).filter(name => name.endsWith('.sql')).sort()) {
      await db.exec(await readFile(new URL(name, folder), 'utf8'));
    }
    const admin = '00000000-0000-4000-8000-000000000001';
    const customer = '00000000-0000-4000-8000-000000000002';
    await db.query('insert into auth.users(id) values ($1), ($2)', [admin, customer]);
    await db.query('insert into public.admin_memberships(user_id) values ($1)', [admin]);
    assert.deepEqual((await db.query("select service_slug, duration_minutes from public.service_schedule_policies where service_slug in ('mini-cord-cut','mediumship','psychic-reading') order by service_slug")).rows, [
      { service_slug: 'mediumship', duration_minutes: 15 },
      { service_slug: 'mini-cord-cut', duration_minutes: 15 },
      { service_slug: 'psychic-reading', duration_minutes: 10 },
    ]);

    const insert = `insert into public.service_catalog(slug,title,subtitle,description,price,duration,category,is_active,is_deleted)
      values ('mini-cord-cut','Mini Cord Cut','A Moment to Release','A focused cord-cutting session.',66,'15 min','healer',true,false)`;
    await db.exec('set role anon');
    assert.deepEqual((await db.query('select * from public.service_catalog')).rows, []);
    await assert.rejects(db.exec(insert), error => error.code === '42501');
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [customer]);
    await assert.rejects(db.exec(insert), error => error.code === '42501');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [admin]);
    await db.exec(insert);
    await db.exec("update public.service_schedule_policies set buffer_minutes = 10, max_per_day = 2, is_bookable = true where service_slug = 'mini-cord-cut'");
    await db.exec("update public.service_catalog set price = 77, title = 'Updated Cord Cut', duration = '45 min' where slug='mini-cord-cut'");
    assert.deepEqual((await db.query("select duration_minutes, buffer_minutes, max_per_day, is_bookable from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows, [
      { duration_minutes: 45, buffer_minutes: 10, max_per_day: 2, is_bookable: true },
    ]);
    await db.exec("update public.service_catalog set duration = '1 hour' where slug='mini-cord-cut'");
    assert.equal((await db.query("select duration_minutes from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows[0].duration_minutes, 60);
    await db.exec("update public.service_catalog set duration = '15-30 min' where slug='mini-cord-cut'");
    assert.equal((await db.query("select duration_minutes from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows[0].duration_minutes, 30);

    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [customer]);
    assert.equal((await db.query("update public.service_catalog set price = 1 returning slug")).rows.length, 0);
    assert.equal((await db.query("update public.service_catalog set is_active = false returning slug")).rows.length, 0);
    await db.exec('reset role; set role anon');
    assert.deepEqual((await db.query('select title, price from public.service_catalog')).rows, [{ title: 'Updated Cord Cut', price: '77.00' }]);
    await assert.rejects(db.exec("delete from public.service_catalog where slug='mini-cord-cut'"), error => error.code === '42501');
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [admin]);
    await db.exec("update public.service_catalog set is_active = false where slug='mini-cord-cut'");
    assert.equal((await db.query("select is_bookable from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows[0].is_bookable, false);
    await db.exec("update public.service_catalog set is_active = true where slug='mini-cord-cut'");
    assert.equal((await db.query("select is_bookable from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows[0].is_bookable, true);
    await db.exec("update public.service_catalog set is_deleted = true where slug='mini-cord-cut'");
    assert.equal((await db.query("select is_bookable from public.service_schedule_policies where service_slug='mini-cord-cut'")).rows[0].is_bookable, false);
  } finally { await db.close(); }
});
