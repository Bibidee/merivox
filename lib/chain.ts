import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, type GenLayerTransaction, type TransactionHash } from 'genlayer-js/types';
import { contractConfigured, CONTRACT_ADDRESS, explorerTx } from './config';
import type { Eip1193 } from './wallet';
import type { TxPhase } from './model';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const client = () => createClient({ chain: studionet });

export async function readChain<T>(functionName: string, args: unknown[] = []): Promise<T> {
  if (!contractConfigured()) throw new Error('Contract is not deployed/configured yet.');
  return await client().readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never,
    jsonSafeReturn: true,
  }) as T;
}

function transactionState(tx: GenLayerTransaction | null | undefined) {
  return tx?.statusName ?? (typeof tx?.status === 'string' ? tx.status : 'PENDING');
}

const terminalFailure = new Set(['UNDETERMINED', 'CANCELED', 'LEADER_TIMEOUT', 'VALIDATORS_TIMEOUT']);

/**
 * Send through the injected wallet and wait for GenLayer finality. ACCEPTED is
 * intentionally exposed as provisional; callers reread contract state only
 * after this function reports FINALIZED.
 */
export async function sendChain(
  account: `0x${string}`,
  provider: Eip1193,
  functionName: string,
  args: unknown[],
  update: (phase: TxPhase, hash?: string, detail?: string) => void,
) {
  if (!contractConfigured()) throw new Error('No deployed contract is configured.');
  update('SIGNING');
  const instance = createClient({ chain: studionet, account, provider: provider as never });
  const hash = String(await instance.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never,
    value: BigInt(0),
  })) as unknown as TransactionHash;
  update('SUBMITTED', hash, 'Broadcast to Studionet');

  for (let attempt = 0; attempt < 180; attempt += 1) {
    await wait(6500);
    let tx: GenLayerTransaction | null = null;
    try {
      tx = await client().getTransaction({ hash });
    } catch {
      if (attempt > 10) update('UNDETERMINED', hash, 'The explorer has not returned a transaction receipt.');
      continue;
    }
    const state = transactionState(tx);
    if (state === 'ACCEPTED') {
      update('ACCEPTED', hash, 'Provisional consensus accepted; waiting for finality');
      continue;
    }
    if (terminalFailure.has(state)) {
      update(state === 'UNDETERMINED' ? 'UNDETERMINED' : 'FAILED', hash, `Transaction ended with ${state}`);
      throw new Error(`Transaction ended with ${state}.`);
    }
    if (state === 'FINALIZED') {
      if (tx.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
        update('FAILED', hash, 'Finalized with a contract execution error');
        throw new Error('The finalized transaction returned a contract execution error.');
      }
      update('FINALIZED', hash, 'Finalized; rereading canonical contract state');
      return { hash, url: explorerTx(hash), receipt: tx };
    }
    update('SUBMITTED', hash, `Network status: ${state}`);
  }

  update('UNDETERMINED', hash, 'Finality was not confirmed within the observation window.');
  throw new Error('Finality was not confirmed. Check the explorer before retrying.');
}
