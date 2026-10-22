import test from 'node:test';
import assert from 'node:assert/strict';
import { extractContractReturn, writeFailureDetail } from '../lib/chain.ts';

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

test('wallet rejection is represented as a failed write with actionable detail', () => {
  assert.equal(
    writeFailureDetail(new Error('User rejected the request')),
    'Wallet signature was not accepted: User rejected the request',
  );
  assert.match(writeFailureDetail({}), /Wallet signature was not accepted/);
});
