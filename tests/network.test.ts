import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAIN_ID,RPC_URL,contractConfigured,CHAIN_HEX} from '../lib/config.ts';
test('hard pinned public network',()=>{assert.equal(CHAIN_ID,61999);assert.equal(CHAIN_HEX,'0xf22f');assert.equal(RPC_URL,'https://studio.genlayer.com/api');});
test('zero address is not treated as deployed',()=>{if(!process.env.NEXT_PUBLIC_MERIVOX_CONTRACT)assert.equal(contractConfigured(),false);});
