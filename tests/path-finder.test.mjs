import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function loadTs(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const { findPath, pathQuestions } = await loadTs('../src/lib/path-finder.ts');
const { services } = await loadTs('../src/data/services.ts');

test('explicit intention takes priority over a different current feeling', () => {
  const result = findPath([0, 1, 0, 2], services);
  assert.equal(result.matches[0].service.category, 'seer');
  assert.match(result.title, /clarity/);
});

test('uncertain intentions use feelings, but two skipped answers do not invent a match', () => {
  assert.equal(findPath([5, 2, 0, 2], services).matches[0].service.category, 'alchemist');
  const result = findPath([5, 5, 0, 2], services);
  assert.equal(result.matches.length, 0);
  assert.equal(result.next.href, '/contact');
});

test('recommendations use only the supplied public catalog and current prices', () => {
  const available = [{ ...services.find(s => s.category === 'seer'), price: 123, slug: 'updated-service' }];
  const result = findPath([0, 0, 2, 2], available);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].service.price, 123);
  assert.equal(result.next.href, '/services/updated-service');
  assert.equal(findPath([0, 0, 2, 2], []).next.href, '/contact');
});

test('every answer combination produces a starting point and respects the chosen pace', () => {
  for (let goal = 0; goal < pathQuestions[0].options.length; goal++) {
    for (let feeling = 0; feeling < pathQuestions[1].options.length; feeling++) {
      for (let experience = 0; experience < 3; experience++) {
        for (let pace = 0; pace < 3; pace++) {
          const result = findPath([goal, feeling, experience, pace], services);
          assert.ok(result.practice && result.experience && result.next.href);
          assert.ok(result.matches.length <= 2);
          if (pace === 0) assert.equal(result.next.href, '/grimoire');
          if (pace === 1) assert.equal(result.next.href, '/contact');
          for (const match of result.matches) assert.ok(services.includes(match.service));
        }
      }
    }
  }
});
