import type { ActionLifecycle, BindingAuthorization } from './model';

export type BindingStateView = Partial<Pick<BindingAuthorization, 'exists' | 'lifecycle' | 'action_status' | 'action_type' | 'expires_at'>> & {
  lifecycle?: string;
  action_status?: string;
};

export function resolveActionLifecycle(roundStatus: string | undefined, binding: BindingStateView | null): string {
  if (binding?.lifecycle) return binding.lifecycle;
  if (binding?.action_status) return binding.action_status;
  return roundStatus || 'NOT_AUTHORIZED';
}

export function canDispatchBinding(input: {
  binding: boolean;
  resultStatus: string | undefined;
  roundActionStatus: string | undefined;
  state: BindingStateView | null;
  now: number;
}): boolean {
  if (!input.binding || input.resultStatus !== 'DECIDED' || input.roundActionStatus !== 'APPROVED' || !input.state || input.state.exists || resolveActionLifecycle(input.roundActionStatus, input.state) !== 'APPROVED') return false;
  if (input.state.action_type === 'GRANT_PUBLISHER' && Number(input.state.expires_at ?? 0) <= input.now) return false;
  return true;
}

export const ACTION_STATUS_COPY: Record<ActionLifecycle, string> = {
  NOT_AUTHORIZED: 'The decision is final, but the protected action did not satisfy the authorization rules.',
  APPROVED: 'The governance result is authorized. It is waiting for a wallet to dispatch the exact immutable envelope.',
  DISPATCHED: 'Merivox submitted the finalized child message. ActionGate has not yet confirmed application.',
  APPLIED: 'ActionGate has independently confirmed the expected recipient, version, digest and effective state.',
  PENDING_RECOVERY: 'The child message is not confirmed yet. A bounded recovery retry may be available after cooldown.',
  SUPERSEDED: 'A newer authorization replaced this action. The older envelope cannot be replayed.',
  EXPIRED: 'The grant window ended before application or recovery. It cannot be dispatched again.',
  NOT_BINDING: 'This is a decision round without a governed action envelope.',
};

