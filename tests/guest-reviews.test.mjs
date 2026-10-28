import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('guest reviews stay private until an admin approves them', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
    `);
    for (const name of ['202609060001_accounts.sql', '202609060002_reviews.sql', '202610280001_guest_reviews.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const { rows: [admin] } = await db.query("insert into auth.users(id,email) values(gen_random_uuid(),'admin@example.test') returning id");
    const { rows: [member] } = await db.query("insert into auth.users(id,email) values(gen_random_uuid(),'member@example.test') returning id");
    await db.query('insert into public.admin_memberships(user_id) values($1)', [admin.id]);

    await db.exec('set role anon');
    assert.equal((await db.query("select has_table_privilege(current_user, 'public.guest_reviews', 'INSERT') as allowed")).rows[0].allowed, false);
    await assert.rejects(db.query("insert into public.guest_reviews(first_name,last_name,rating,body) values('A','B',5,'This is a long enough review body.')"), e => e.code === '42501');
    const { rows: [submitted] } = await db.query("select public.submit_guest_review('Jane','Doe','Tarot reading',4::smallint,'This reading was thoughtful and helpful.') as id");
    assert.equal((await db.query('select * from public.guest_reviews')).rows.length, 0);
    await assert.rejects(db.query("select public.moderate_guest_review($1,'approved')", [submitted.id]));
    await db.exec('reset role');

    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [member.id]);
    assert.equal((await db.query('select * from public.guest_reviews')).rows.length, 0);
    await assert.rejects(db.query("select public.moderate_guest_review($1,'approved')", [submitted.id]));
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin.id]);
    assert.equal((await db.query('select * from public.guest_reviews')).rows.length, 1);
    await db.query("select public.moderate_guest_review($1,'approved')", [submitted.id]);
    await db.exec('reset role');

    await db.exec('set role anon');
    const { rows } = await db.query('select first_name,last_name,service_title,rating,body from public.guest_reviews');
    assert.deepEqual(rows, [{ first_name: 'Jane', last_name: 'Doe', service_title: 'Tarot reading', rating: 4, body: 'This reading was thoughtful and helpful.' }]);
  } finally { await db.close(); }
});
