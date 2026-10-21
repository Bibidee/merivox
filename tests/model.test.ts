import test from 'node:test';
import assert from 'node:assert/strict';
import {validateQuestion,validateNomination,remaining,isWallet,normalizeStatus,MIN_ALIGNMENT_WINDOW_SECONDS,MIN_ROUND_AFTER_NOMINATION_SECONDS,ROUND_RULES} from '../lib/model.ts';
test('refuse trivial or oversized decision questions',()=>{assert.ok(validateQuestion('short'));assert.equal(validateQuestion('What should this community do next?'),null);assert.ok(validateQuestion('x'.repeat(321)));});
test('proposal entry is bounded',()=>{assert.ok(validateNomination('hi','ok'));assert.equal(validateNomination('Developer workshop','A hands-on introductory workshop for the new developers.'),null);});
test('EVM account shape',()=>{assert.equal(isWallet('0x'+'a'.repeat(40)),true);assert.equal(isWallet('0x'+'a'.repeat(39)),false);});
test('deadline and status formatting',()=>{assert.equal(remaining(90,100),'Deadline reached');assert.equal(normalizeStatus('TIED'),'TIED');});
test('round timing reserves every bounded reconciliation path',()=>{assert.equal(MIN_ALIGNMENT_WINDOW_SECONDS,8*(3*60+120));assert.equal(MIN_ROUND_AFTER_NOMINATION_SECONDS,MIN_ALIGNMENT_WINDOW_SECONDS+15*60);assert.equal(ROUND_RULES.maxReconciliationAttempts,3);assert.equal(ROUND_RULES.reconciliationCooldownSeconds,60);});
