import test from 'node:test';
import assert from 'node:assert/strict';
import { extractContractReturn } from '../lib/chain.ts';

test('extractContractReturn uses the finalized leader return payload', () => {
  const receipt = {
    consensus_data: {
      leader_receipt: [{ result: { payload: { readable: '"42"' } } }],
    },
  } as never;
  assert.equal(extractContractReturn(receipt), '42');
});

test('extractContractReturn does not invent an ID from an incomplete receipt', () => {
  assert.equal(extractContractReturn({ consensus_data: { leader_receipt: [] } } as never), undefined);
});
