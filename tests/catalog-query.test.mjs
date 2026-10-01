import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/catalog-query.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { readCatalogWithRetry } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
test('transient catalog failure recovers with current data', async () => {
 let calls=0;const current={status:200,error:null,data:[{price:88,is_active:false}]};
 const result=await readCatalogWithRetry(async()=>++calls===1?{status:0,error:{message:'fetch failed'}}:current,async()=>{});
 assert.equal(calls,2);assert.equal(result,current);
});
test('permission errors are not retried or replaced', async () => {
 let calls=0;const denied={status:403,error:{code:'42501',message:'denied'}};
 assert.equal(await readCatalogWithRetry(async()=>{calls++;return denied;},async()=>{}),denied);assert.equal(calls,1);
});
test('persistent outage stops after three attempts',async()=>{
 let calls=0;const failure={status:503,error:{message:'unavailable'}};
 assert.equal(await readCatalogWithRetry(async()=>{calls++;return failure;},async()=>{}),failure);assert.equal(calls,3);
});
