import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const source = await readFile(new URL('../src/lib/birth-profile.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
const helper = new Module('birth-profile'); helper.require = createRequire(import.meta.url); helper._compile(compiled.outputText, 'birth-profile.cjs');
const { parseBirthProfile } = helper.exports;
const details = { date: '1990-06-15', time: '14:30', place: { label: 'New York, United States', lat: 40.7128, lon: -74.006 }, consent: true };

test('saving requires explicit consent and valid local birth details', () => {
  for (const change of [{ consent: false }, { consent: 'true' }, { consent: undefined }, { date: '2026-02-30' }, { date: '1899-12-31' }, { date: '2999-01-01' }, { time: '24:00' }, { time: '12:99' }, { place: { ...details.place, lat: Infinity } }, { place: { ...details.place, lon: 181 } }, { place: { ...details.place, label: '' } }]) assert.throws(() => parseBirthProfile({ ...details, ...change }));
  const result = parseBirthProfile({ ...details, user_id: 'some-other-user', timezone: 'Fake/Zone' });
  assert.equal(result.timezone, 'America/New_York');
  assert.equal(result.time, '14:30');
  assert.equal(result.user_id, undefined);
});

test('birth profile SQL enforces owner isolation, consent, deletion, and account cascade', async () => {
  const db = new PGlite();
  const first = '00000000-0000-4000-8000-000000000001';
  const second = '00000000-0000-4000-8000-000000000002';
  const insert = `insert into public.birth_profiles(user_id,birth_date,birth_time,place_label,latitude,longitude,timezone,storage_consent,consent_version) values ($1,'1990-06-15','14:30','New York',40.7128,-74.006,'America/New_York',$2,'birth-details-v1')`;
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema public,auth to anon,authenticated;
      insert into auth.users values ('${first}'),('${second}');`);
    await db.exec(await readFile(new URL('../supabase/migrations/202609200012_birth_profiles.sql', import.meta.url), 'utf8'));
    await db.exec('set role authenticated;');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [first]);
    await assert.rejects(db.query(insert, [first, false]), error => error.code === '23514');
    await assert.rejects(db.query(insert, [first, null]), error => error.code === '23502');
    await assert.rejects(db.query(insert, [second, true]), error => error.code === '42501');
    await db.query(insert, [first, true]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [second]);
    assert.equal((await db.query('select * from public.birth_profiles')).rows.length, 0);
    assert.equal((await db.query('delete from public.birth_profiles returning user_id')).rows.length, 0);
    assert.equal((await db.query("update public.birth_profiles set place_label='Hidden' returning user_id")).rows.length, 0);
    await db.query(insert, [second, true]);
    await assert.rejects(db.query('update public.birth_profiles set user_id=$1', [first]), error => ['42501','23505'].includes(error.code));
    await db.query("update public.birth_profiles set birth_time='15:45'");
    assert.equal((await db.query('select birth_time from public.birth_profiles')).rows[0].birth_time, '15:45:00');
    await db.query('delete from public.birth_profiles');
    assert.equal((await db.query('select * from public.birth_profiles')).rows.length, 0);
    await db.exec('reset role; set role anon;');
    for (const sql of ['select * from public.birth_profiles', 'delete from public.birth_profiles']) await assert.rejects(db.query(sql), error => error.code === '42501');
    await db.exec('reset role;');
    assert.equal((await db.query('select * from public.birth_profiles')).rows.length, 1);
    await db.query('delete from auth.users where id=$1', [first]);
    assert.equal((await db.query('select * from public.birth_profiles')).rows.length, 0);
  } finally { await db.close(); }
});
