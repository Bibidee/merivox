import test from 'node:test';
import assert from 'node:assert/strict';
import { readAllPages } from '../lib/rounds.ts';

test('readAllPages reads every full page and stops only on a short page', async () => {
  const calls: Array<[number, number]> = [];
  const result = await readAllPages(async (offset, limit) => {
    calls.push([offset, limit]);
    if (offset === 0) return Array.from({ length: 25 }, (_, index) => index);
    if (offset === 25) return Array.from({ length: 25 }, (_, index) => index + 25);
    return [50];
  });
  assert.deepEqual(calls, [[0, 25], [25, 25], [50, 25]]);
  assert.equal(result.length, 51);
  assert.equal(result[50], 50);
});

test('readAllPages preserves an empty directory', async () => {
  assert.deepEqual(await readAllPages(async () => []), []);
});
