import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('public service titles expose approved reviews without private service fields', async () => {
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
    for (const name of ['202609060001_accounts.sql', '202609060002_reviews.sql', '202609070003_public_review_services.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const { rows: [user] } = await db.query("insert into auth.users(id,email) values(gen_random_uuid(),'private@example.test') returning id");
    const expected = [];
    for (const status of ['approved', 'pending', 'rejected', 'hidden', 'withdrawn']) {
      const { rows: [service] } = await db.query(`insert into public.service_instances
        (customer_id, service_slug, service_title, verification_note, verified_by)
        values ($1,'mini-reading','Mini Reading','Private payment reference',$1) returning id`, [user.id]);
      const { rows: [review] } = await db.query('insert into public.reviews(service_instance_id,customer_id,status) values($1,$2,$3) returning id', [service.id, user.id, status]);
      if (status === 'approved') expected.push({ review_id: review.id, service_title: 'Mini Reading' });
    }
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      assert.deepEqual((await db.query('select * from public.public_review_services')).rows, expected);
      await assert.rejects(db.query('select verification_note from public.public_review_services'), e => e.code === '42703');
      assert.equal((await db.query("select has_table_privilege(current_user, 'public.public_review_services', 'UPDATE') as allowed")).rows[0].allowed, false);
      await assert.rejects(db.query("update public.public_review_services set service_title='Forged'"), e => ['42501', '55000'].includes(e.code));
      if (role === 'anon') await assert.rejects(db.query('select * from public.service_instances'), e => e.code === '42501');
      await db.exec('reset role');
    }
    await db.exec('update public.service_instances set revoked_at = now()');
    await db.exec('set role anon');
    assert.equal((await db.query('select * from public.public_review_services')).rows.length, 0);
  } finally { await db.close(); }
});
