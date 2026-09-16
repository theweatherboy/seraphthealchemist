import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

test('booking choices are optional, private, atomic, and marketing can be withdrawn', async () => {
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
    const first = '00000000-0000-4000-8000-000000000001';
    const second = '00000000-0000-4000-8000-000000000002';
    await db.query("insert into auth.users(id,email) values ($1,'first@example.test'), ($2,'second@example.test')", [first, second]);
    await db.exec("insert into public.scheduling_availability(weekday,starts_at,ends_at,timezone) select extract(dow from current_date + 2)::smallint,'09:00','17:00','UTC'");
    await db.exec('set role anon');
    await assert.rejects(db.exec('select public.withdraw_marketing_consent()'), e => e.code === '42501');
    await assert.rejects(db.exec('select recording_opt_in from public.service_requests'), e => e.code === '42501');
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [first]);
    const book = (hour, recording = false, ai = false, email = false, sms = false, phone = null) => db.query(`
      select public.book_service_request_with_preferences('mini-cord-cut','Mini Cord Cut',
      (current_date + 2 + make_time($1,0,0)) at time zone 'UTC','UTC','paypal','Receipt-123',null,$2,$3,$4,$5,$6) as id`,
      [hour, phone, recording, ai, email, sms]);
    await assert.rejects(book(10, true, true, true, true), /phone number is required/);
    assert.equal((await db.query('select id from public.service_requests')).rows.length, 0, 'invalid preferences do not create a booking');
    const { rows: [ordinary] } = await book(10);
    const { rows: [chosen] } = await book(11, true, false, true, true, '+1 512 555 0100');
    const fields = 'recording_opt_in, ai_notes_opt_in, marketing_email_opt_in, marketing_sms_opt_in';
    assert.deepEqual((await db.query(`select ${fields} from public.service_requests where id=$1`, [ordinary.id])).rows[0], {
      recording_opt_in: false, ai_notes_opt_in: false, marketing_email_opt_in: false, marketing_sms_opt_in: false,
    });
    assert.deepEqual((await db.query(`select ${fields} from public.service_requests where id=$1`, [chosen.id])).rows[0], {
      recording_opt_in: true, ai_notes_opt_in: false, marketing_email_opt_in: true, marketing_sms_opt_in: true,
    });
    const { rows: [record] } = await db.query('select preferences_recorded_at,preferences_version from public.service_requests where id=$1', [chosen.id]);
    assert(record.preferences_recorded_at);
    assert.equal(record.preferences_version, '2026-09-16');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [second]);
    assert.equal((await db.query('select id from public.service_requests')).rows.length, 0, 'another customer cannot read these records');
    const { rows: [other] } = await book(12, false, true, true);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [first]);
    await db.exec('select public.withdraw_marketing_consent()');
    assert.deepEqual((await db.query(`select ${fields} from public.service_requests where id=$1`, [chosen.id])).rows[0], {
      recording_opt_in: true, ai_notes_opt_in: false, marketing_email_opt_in: false, marketing_sms_opt_in: false,
    });
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [second]);
    assert.equal((await db.query('select marketing_email_opt_in from public.service_requests where id=$1', [other.id])).rows[0].marketing_email_opt_in, true, 'withdrawal only affects the caller');
  } finally { await db.close(); }
});
