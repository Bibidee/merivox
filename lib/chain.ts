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
const activeWrites = new Set<string>();

export type ApplicationVerifier = (receipt: GenLayerTransaction) => Promise<string | void>;

function argumentKey(value: unknown): string {
  return JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? `${item}n` : item);
}

export function extractContractReturn(receipt: GenLayerTransaction): unknown {
  const leader = (receipt.consensus_data?.leader_receipt?.[0] ?? {}) as Record<string, unknown>;
  const result = leader.result as Record<string, unknown> | undefined;
  const payload = result?.payload as Record<string, unknown> | undefined;
  const readable = payload?.readable;
  if (typeof readable !== 'string') return undefined;
  try { return JSON.parse(readable); } catch { return readable; }
}

export async function recoverTransaction(hash: string): Promise<{ phase: TxPhase; detail: string }> {
  const tx = await client().getTransaction({ hash: hash as TransactionHash });
  const state = transactionState(tx);
  if (state === 'FINALIZED') {
    if (tx.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) return { phase: 'FAILED', detail: 'Finalized with a contract execution error' };
    return { phase: 'FINALIZED', detail: 'Protocol finality recovered; refresh the affected round to verify application state' };
  }
  if (state === 'ACCEPTED') return { phase: 'ACCEPTED', detail: 'Provisional consensus accepted; waiting for finality' };
  if (terminalFailure.has(state)) return { phase: state === 'UNDETERMINED' ? 'UNDETERMINED' : 'FAILED', detail: `Transaction ended with ${state}` };
  return { phase: 'SUBMITTED', detail: `Network status recovered: ${state}` };
}

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
  verify?: ApplicationVerifier,
) {
  if (!contractConfigured()) throw new Error('No deployed contract is configured.');
  const key = `${functionName}:${argumentKey(args)}`;
  if (activeWrites.has(key)) throw new Error('This exact transaction is already in progress. Check transaction activity before retrying.');
  activeWrites.add(key);
  try {
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
        if (attempt > 10) update('UNDETERMINED', hash, 'The network has not returned a transaction receipt. Do not submit another copy; refresh and inspect this hash.');
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
        update('FINALIZED', hash, 'Finalized; verifying the canonical application state');
        if (verify) {
          let detail: string | void = undefined;
          let lastError: unknown;
          for (let verificationAttempt = 0; verificationAttempt < 6; verificationAttempt += 1) {
            try {
              detail = await verify(tx);
              lastError = undefined;
              break;
            } catch (error) {
              lastError = error;
              if (verificationAttempt < 5) await wait(2000);
            }
          }
          if (lastError) {
            update('UNDETERMINED', hash, 'Finality is confirmed, but application-state readback was not verified. Refresh and inspect this transaction before retrying.');
            throw new Error(`Finality was confirmed but application state could not be verified: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
          }
          update('VERIFIED', hash, detail || 'Finalized and verified in canonical contract state');
        }
        return { hash, url: explorerTx(hash), receipt: tx, returnValue: extractContractReturn(tx) };
      }
      update('SUBMITTED', hash, `Network status: ${state}`);
    }

    update('UNDETERMINED', hash, 'Finality was not confirmed within the observation window. Check transaction activity before retrying.');
    throw new Error('Finality was not confirmed. Check the explorer before retrying.');
  } finally {
    activeWrites.delete(key);
  }
}
