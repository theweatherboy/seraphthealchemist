import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
test('Birth Chart migration supports all visibility toggles and preserves saved settings', async () => {
 const db = new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create function public.is_sanctuary_admin() returns boolean language sql stable as $$ select coalesce(current_setting('test.admin',true),'false')='true' $$;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202609160011_navigation_visibility.sql',import.meta.url),'utf8'));
 await db.exec("update public.navigation_visibility set is_visible=false where href='/grimoire'");
 const migration=await readFile(new URL('../supabase/migrations/202610010019_birth_chart_navigation.sql',import.meta.url),'utf8');
 await db.exec(migration);
 assert.equal((await db.query("select is_visible from public.navigation_visibility where href='/grimoire'")).rows[0].is_visible,false);
 assert.equal((await db.query('select count(*)::integer as count from public.navigation_visibility')).rows[0].count,12);
 await db.exec("set role authenticated; select set_config('test.admin','true',false)");
 for(const href of ['/','/about','/services','/birth-chart','/grimoire','/reviews','/forge','/support','/contact','/account']) {
 for(const visible of [false,true]) {
 const {rows}=await db.query('update public.navigation_visibility set is_visible=$1 where href=$2 returning is_visible',[visible,href]);
 assert.deepEqual(rows,[{is_visible:visible}],href);
 }
 }
 await db.exec("update public.navigation_visibility set is_visible=false where href='/birth-chart'; reset role");
 await db.exec(migration);
 assert.equal((await db.query("select is_visible from public.navigation_visibility where href='/birth-chart'")).rows[0].is_visible,false);
 await db.exec("set role authenticated; select set_config('test.admin','false',false)");
 assert.equal((await db.query("update public.navigation_visibility set is_visible=true where href='/birth-chart' returning href")).rows.length,0);
 await db.exec('reset role; set role anon');
 assert.equal((await db.query("select is_visible from public.navigation_visibility where href='/birth-chart'")).rows[0].is_visible,false);
 await assert.rejects(db.exec("update public.navigation_visibility set is_visible=true where href='/birth-chart'"),e=>e.code==='42501');
 } finally { await db.close(); }
});
