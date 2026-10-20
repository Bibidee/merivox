import test from 'node:test';
import assert from 'node:assert/strict';
import {validateQuestion,validateNomination,remaining,isWallet,normalizeStatus} from '../lib/model.ts';
test('refuse trivial or oversized decision questions',()=>{assert.ok(validateQuestion('short'));assert.equal(validateQuestion('What should this community do next?'),null);assert.ok(validateQuestion('x'.repeat(321)));});
test('proposal entry is bounded',()=>{assert.ok(validateNomination('hi','ok'));assert.equal(validateNomination('Developer workshop','A hands-on introductory workshop for the new developers.'),null);});
test('EVM account shape',()=>{assert.equal(isWallet('0x'+'a'.repeat(40)),true);assert.equal(isWallet('0x'+'a'.repeat(39)),false);});
test('deadline and status formatting',()=>{assert.equal(remaining(90,100),'Deadline reached');assert.equal(normalizeStatus('TIED'),'TIED');});
