'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowRight, ChartNoAxesColumn, CheckCircle2, Clock3, GitMerge, LockKeyhole, RefreshCw, Vote, WalletCards } from 'lucide-react';
import { readChain, sendChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { asNumber, remaining, shortAddress, type AlignmentState, type Choice, type MemberStatus, type Nomination, type Result, type Round, type Tally, type RoundStatus } from '@/lib/model';
import { useApp } from './AppProviders';
import { ChoiceMap } from './ChoiceMap';
import { PhaseRibbon } from './PhaseRibbon';
import { useRoundId } from './ChainRound';

type Stage = 'align' | 'ballot' | 'outcome';

function normalizeRound(value: Round): Round {
  const raw = value as unknown as Record<string, unknown>;
  return {
    ...value,
    status: String(raw.status ?? 'NOMINATING') as RoundStatus,
    members: Array.isArray(raw.members) ? raw.members.map(String) : [],
    nomination_ids: Array.isArray(raw.nomination_ids) ? raw.nomination_ids.map(String) : [],
    choice_ids: Array.isArray(raw.choice_ids) ? raw.choice_ids.map(String) : [],
    tie_choice_ids: Array.isArray(raw.tie_choice_ids) ? raw.tie_choice_ids.map(String) : [],
    member_count: asNumber(raw.member_count), quorum: asNumber(raw.quorum), nomination_close: asNumber(raw.nomination_close),
    alignment_close: asNumber(raw.alignment_close), ballot_close: asNumber(raw.ballot_close), created_at: asNumber(raw.created_at),
    ballot_opened_at: asNumber(raw.ballot_opened_at), finalized_at: asNumber(raw.finalized_at), alignment_cursor: asNumber(raw.alignment_cursor),
    voter_count: asNumber(raw.voter_count), nomination_count: asNumber(raw.nomination_count), choice_count: asNumber(raw.choice_count),
    last_alignment_at: asNumber(raw.last_alignment_at), winner_choice_id: String(raw.winner_choice_id ?? ''), result_reason: String(raw.result_reason ?? ''),
  };
}

function normalizeAlignment(value: AlignmentState): AlignmentState {
  const raw = value as unknown as Record<string, unknown>;
  return { status: String(raw.status ?? 'NOMINATING') as RoundStatus, cursor: asNumber(raw.cursor), total: asNumber(raw.total), pending_id: String(raw.pending_id ?? ''), alignment_close: asNumber(raw.alignment_close), last_alignment_at: asNumber(raw.last_alignment_at), last_judgment: String(raw.last_judgment ?? '') };
}

function normalizeMember(value: MemberStatus): MemberStatus {
  const raw = value as unknown as Record<string, unknown>;
  return { eligible: Boolean(raw.eligible), nominated: Boolean(raw.nominated), voted: Boolean(raw.voted), choice_id: String(raw.choice_id ?? '') };
}

function normalizeTally(value: Tally): Tally {
  const raw = value as unknown as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? raw.items as Array<Record<string, unknown>> : [];
  return { items: items.map(item => ({ choice_id: String(item.choice_id ?? ''), votes: asNumber(item.votes), nomination_ids: Array.isArray(item.nomination_ids) ? item.nomination_ids.map(String) : [] })), voter_count: asNumber(raw.voter_count), quorum: asNumber(raw.quorum) };
}

function normalizeResult(value: Result): Result {
  const raw = value as unknown as Record<string, unknown>;
  return { finalized: Boolean(raw.finalized), status: String(raw.status ?? 'NOMINATING') as RoundStatus, winner_choice_id: String(raw.winner_choice_id ?? ''), tie_choice_ids: Array.isArray(raw.tie_choice_ids) ? raw.tie_choice_ids.map(String) : [], voter_count: asNumber(raw.voter_count), quorum: asNumber(raw.quorum), finalized_at: asNumber(raw.finalized_at), reason: String(raw.reason ?? '') };
}

function actionError(error: unknown) { return error instanceof Error ? error.message : 'The transaction could not be completed.'; }

export function StagePages({ stage }: { stage: Stage }) {
  const id = useRoundId();
  const { account, networkOK, connect, requireWallet, updateTx } = useApp();
  const [round, setRound] = useState<Round | null>(null);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [alignment, setAlignment] = useState<AlignmentState | null>(null);
  const [member, setMember] = useState<MemberStatus | null>(null);
  const [tally, setTally] = useState<Tally | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState('');

  const reload = useCallback(async () => {
    if (!id || !contractConfigured()) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const next = normalizeRound(await readChain<Round>('get_round', [id]));
      const [nextNominations, nextChoices] = await Promise.all([
        Promise.all(next.nomination_ids.map(nominationId => readChain<Nomination>('get_alternative', [nominationId]))),
        Promise.all(next.choice_ids.map(choiceId => readChain<Choice>('get_choice', [choiceId]))),
      ]);
      setRound(next); setNominations(nextNominations); setChoices(nextChoices);
      if (stage === 'align') setAlignment(normalizeAlignment(await readChain<AlignmentState>('get_alignment', [id])));
      if (stage === 'ballot') {
        if (account) setMember(normalizeMember(await readChain<MemberStatus>('get_member_status', [id, account])));
        setTally(normalizeTally(await readChain<Tally>('get_tally', [id])));
      }
      if (stage === 'outcome') {
        setTally(normalizeTally(await readChain<Tally>('get_tally', [id])));
        setResult(normalizeResult(await readChain<Result>('get_result', [id])));
      }
    } catch (err) { setError(actionError(err)); }
    finally { setLoading(false); }
  }, [account, id, stage]);

  useEffect(() => { void reload(); }, [reload]);

  const action = async (label: string, functionName: string, args: unknown[]) => {
    setBusy(true); setError('');
    try {
      const wallet = await requireWallet();
      await sendChain(wallet.account, wallet.provider, functionName, args, (phase, hash, detail) => updateTx(label, phase, hash, detail));
      await reload();
    } catch (err) { setError(actionError(err)); }
    finally { setBusy(false); }
  };

  const meta = {
    align: { eyebrow: 'ALIGNMENT ROOM', title: 'Find the real choices.', description: 'Independent validator consensus compares each alternative with frozen canonical anchors.', icon: <GitMerge/> },
    ballot: { eyebrow: 'THE VOTING ROOM', title: 'One voice. One choice.', description: 'Vote on the frozen canonical ballot. Every eligible wallet can cast exactly one public vote.', icon: <Vote/> },
    outcome: { eyebrow: 'DECISION REPLAY', title: 'Show how the choice was made.', description: 'Read the final tally, quorum result and original nomination mappings directly from the contract.', icon: <ChartNoAxesColumn/> },
  }[stage];

  if (!contractConfigured()) return <div className="container interior"><div className="eyebrow">LIVE ROUND</div><h1 className="page-title">Awaiting deployment.</h1><p className="lede">This screen is intentionally empty until a real Studionet contract address is configured.</p><Link href="/" className="text-arrow">Return to Discover <ArrowRight size={16}/></Link></div>;

  return <div className="container interior">
    <Link href={`/round?id=${encodeURIComponent(id)}`} className="text-arrow"><ArrowLeft size={16}/> Back to round</Link>
    <div className="eyebrow">{meta.eyebrow} / ROUND {id || '…'}</div>
    <div className="page-head-line"><div><h1 className="page-title">{meta.title}</h1><p className="lede">{round?.question ?? meta.description}</p></div><span className="stage-icon">{meta.icon}</span></div>
    {round && <PhaseRibbon status={round.status}/>} 
    {loading && !round && <div className="loading-card"><RefreshCw size={18} className="spin"/> Reading canonical round state…</div>}
    {error && <div className="error-box" role="alert">{error}<button className="text-arrow" onClick={() => void reload()}>Retry</button></div>}
    {round && stage === 'align' && <AlignmentRoom round={round} nominations={nominations} choices={choices} alignment={alignment} busy={busy} now={Math.floor(Date.now() / 1000)} onAction={action} />}
    {round && stage === 'ballot' && <BallotRoom round={round} choices={choices} tally={tally} member={member} account={account} networkOK={networkOK} busy={busy} selected={selected} setSelected={setSelected} onConnect={connect} onAction={action} />}
    {round && stage === 'outcome' && <OutcomeRoom round={round} nominations={nominations} choices={choices} tally={tally} result={result} busy={busy} now={Math.floor(Date.now() / 1000)} onAction={action} />}
    <Link href="/method" className="text-arrow">Understand the decision mechanism <ArrowRight size={16}/></Link>
  </div>;
}

function AlignmentRoom({ round, nominations, choices, alignment, busy, now, onAction }: { round: Round; nominations: Nomination[]; choices: Choice[]; alignment: AlignmentState | null; busy: boolean; now: number; onAction: (label: string, functionName: string, args: unknown[]) => Promise<void> }) {
  const pending = nominations.find(item => item.id === alignment?.pending_id);
  const deadline = alignment?.alignment_close ?? round.alignment_close;
  const canClose = round.status === 'RECONCILING' && now >= deadline;
  return <>
    <div className="stage-alert"><LockKeyhole size={19}/><div><b>Canonical anchors are frozen as they are created.</b><p>Validators compare new submissions only with those anchors. A disagreement or unavailable consensus never silently merges ideas.</p></div></div>
    <div className="stage-control-row"><div><span className="section-kicker">RECONCILIATION PROGRESS</span><strong>{alignment?.cursor ?? round.alignment_cursor} / {alignment?.total ?? round.nomination_count} alternatives assigned</strong><p>{round.status === 'RECONCILING' ? `${remaining(deadline, now)} for alignment` : `Round state: ${round.status.replaceAll('_', ' ')}`}</p></div><div className="control-actions">
      {round.status === 'RECONCILING' && (canClose ? <button className="btn btn-dark" disabled={busy} onClick={() => void onAction('Close alignment', 'close_alignment', [round.id])}>Close with explicit fallbacks <ArrowRight size={16}/></button> : <button className="btn btn-dark" disabled={busy || !pending} onClick={() => void onAction('Reconcile next alternative', 'reconcile_next', [round.id])}>Reconcile next <GitMerge size={16}/></button>)}
      {round.status === 'BALLOT_READY' && <button className="btn btn-dark" disabled={busy} onClick={() => void onAction('Open canonical ballot', 'open_ballot', [round.id])}>Open ballot <ArrowRight size={16}/></button>}
    </div></div>
    {pending && round.status === 'RECONCILING' && <div className="pending-card"><span className="section-kicker">NEXT ALTERNATIVE</span><h3>{pending.title}</h3><p>{pending.details}</p><small>Consensus attempt {pending.attempts + 1} of 3 · independently compared against canonical anchors</small></div>}
    <ChoiceMap nominations={nominations} choices={choices} live />
    {round.status === 'BALLOT_READY' && <div className="feature-note"><CheckCircle2 size={20}/><div><h3>The ballot is ready to freeze.</h3><p>Opening the ballot moves the round to VOTING and makes these choices immutable for public one-wallet-one-vote participation.</p></div></div>}
    {round.status === 'VOTING' && <div className="feature-note"><Clock3 size={20}/><div><h3>Voting is open.</h3><p>Continue in the voting room. The Choice Map above remains the provenance for every ballot option.</p><Link href={`/ballot?id=${encodeURIComponent(round.id)}`} className="text-arrow">Go to voting room <ArrowRight size={15}/></Link></div></div>}
  </>;
}

function BallotRoom({ round, choices, tally, member, account, networkOK, busy, selected, setSelected, onConnect, onAction }: { round: Round; choices: Choice[]; tally: Tally | null; member: MemberStatus | null; account: `0x${string}` | null; networkOK: boolean; busy: boolean; selected: string; setSelected: (value: string) => void; onConnect: () => Promise<void>; onAction: (label: string, functionName: string, args: unknown[]) => Promise<void> }) {
  const counts = useMemo(() => new Map((tally?.items ?? []).map(item => [item.choice_id, item.votes])), [tally]);
  return <>
    <div className="ballot-intro"><div><span className="section-kicker">PUBLIC BALLOT / {round.status}</span><h2>{round.status === 'VOTING' ? 'Choose the outcome you can stand behind.' : 'Voting begins after the ballot is opened.'}</h2><p>{round.voter_count} of {round.member_count} eligible wallets have voted · quorum {round.quorum} · deadline {new Date(round.ballot_close * 1000).toLocaleString()}</p></div><WalletCards size={34}/></div>
    {round.status === 'BALLOT_READY' && <div className="stage-control-row"><div><b>The reconciled ballot is frozen and ready.</b><p>Anyone can verify the choices before voting begins.</p></div><button className="btn btn-dark" disabled={busy} onClick={() => void onAction('Open canonical ballot', 'open_ballot', [round.id])}>Open ballot <ArrowRight size={16}/></button></div>}
    {round.status === 'VOTING' && <div className="vote-panel"><div className="section-kicker">YOUR VOTE</div>{!account ? <><p>Connect the wallet that is on the eligible roster to vote.</p><button className="btn btn-dark" onClick={() => void onConnect()}>Connect wallet <WalletCards size={16}/></button></> : !networkOK ? <p>Switch your wallet to Studionet (61999) before signing.</p> : member && !member.eligible ? <p>This wallet is not on the frozen eligible roster.</p> : member?.voted ? <div className="success-box">Your public vote is recorded for <b>{choices.find(choice => choice.id === member.choice_id)?.anchor_title ?? member.choice_id}</b>.</div> : <><p>Select one canonical choice. The vote is public and cannot be changed.</p><div className="vote-options">{choices.map((choice, index) => <button key={choice.id} className={`vote-option ${selected === choice.id ? 'selected' : ''}`} onClick={() => setSelected(choice.id)}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{choice.anchor_title}</b><small>{choice.anchor_details}</small>{choice.uncertain && <em>Explicit uncertain fallback</em>}</div><i>{selected === choice.id ? 'SELECTED' : 'SELECT'}</i></button>)}</div><button className="btn btn-dark" disabled={busy || !selected} onClick={() => void onAction('Cast public vote', 'vote', [round.id, selected])}>Sign and cast vote <Vote size={16}/></button></>}</div>}
    <div className="public-tally"><div className="section-kicker">PUBLIC TALLY</div><div className="tally-grid">{choices.map(choice => <article key={choice.id}><span>{counts.get(choice.id) ?? 0} vote{(counts.get(choice.id) ?? 0) === 1 ? '' : 's'}</span><b>{choice.anchor_title}</b><small>{choice.nomination_ids.length} original submission{choice.nomination_ids.length === 1 ? '' : 's'}</small></article>)}</div></div>
    {(round.status === 'DECIDED' || round.status === 'TIED' || round.status === 'NO_QUORUM') && <div className="feature-note"><CheckCircle2 size={20}/><div><h3>This round is complete.</h3><p>Review the final result and full Choice Map in the outcome replay.</p><Link href={`/outcome?id=${encodeURIComponent(round.id)}`} className="text-arrow">View outcome <ArrowRight size={15}/></Link></div></div>}
  </>;
}

function OutcomeRoom({ round, nominations, choices, tally, result, busy, now, onAction }: { round: Round; nominations: Nomination[]; choices: Choice[]; tally: Tally | null; result: Result | null; busy: boolean; now: number; onAction: (label: string, functionName: string, args: unknown[]) => Promise<void> }) {
  const winner = choices.find(choice => choice.id === result?.winner_choice_id);
  const tied = choices.filter(choice => result?.tie_choice_ids?.includes(choice.id));
  const needsFinalize = !result?.finalized && now >= round.ballot_close && ['BALLOT_READY', 'VOTING', 'RECONCILING'].includes(round.status);
  return <>
    <div className={`outcome-hero ${result?.finalized ? 'is-final' : ''}`}><span className="section-kicker">{result?.finalized ? 'FINALIZED ON STUDIONET' : 'OUTCOME / AWAITING FINALITY'}</span><h2>{result?.finalized ? result.status === 'DECIDED' ? winner?.anchor_title ?? 'Decision recorded' : result.status === 'TIED' ? 'The round ended in a tie.' : 'The round did not reach quorum.' : 'The decision is still in motion.'}</h2><p>{result?.finalized ? result.reason?.replaceAll('_', ' ') : `Voting deadline: ${new Date(round.ballot_close * 1000).toLocaleString()}`}</p>{needsFinalize && <button className="btn btn-dark" disabled={busy} onClick={() => void onAction('Finalize decision round', 'finalize', [round.id])}>Finalize on chain <CheckCircle2 size={16}/></button>}</div>
    {result?.finalized && <div className="result-stats"><div><b>{result.voter_count ?? tally?.voter_count ?? 0}</b><span>votes cast</span></div><div><b>{result.quorum ?? tally?.quorum ?? round.quorum}</b><span>quorum required</span></div><div><b>{choices.length}</b><span>canonical choices</span></div></div>}
    {result?.status === 'TIED' && <div className="tie-grid">{tied.map(choice => <article key={choice.id}><span>TIED CHOICE</span><b>{choice.anchor_title}</b><small>{tally?.items.find(item => item.choice_id === choice.id)?.votes ?? 0} votes</small></article>)}</div>}
    <ChoiceMap nominations={nominations} choices={choices} live />
    {result?.finalized && <div className="provenance-card"><div className="section-kicker">VERIFIABLE PROVENANCE</div><p>Result, tally and every alternative-to-choice assignment are read from the Merivox contract. Validators classify semantic equivalence; the contract never selects a winner by AI.</p><div className="provenance-row"><span>Round status</span><b>{round.status}</b></div><div className="provenance-row"><span>Finalized at</span><b>{result.finalized_at ? new Date(result.finalized_at * 1000).toLocaleString() : '—'}</b></div><div className="provenance-row"><span>Original alternatives</span><b>{nominations.length}</b></div></div>}
  </>;
}
