'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { readChain, sendChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { useApp } from './AppProviders';
import { PhaseRibbon } from './PhaseRibbon';
import { isWallet, remaining, shortAddress, validateNomination, type ActionType, type RoundStatus } from '@/lib/model';

type ChainRound = { id: string; creator: string; question: string; status: RoundStatus; members: string[]; member_count: number; quorum: number; nomination_close: number; alignment_close: number; ballot_close: number; created_at: number; nomination_ids: string[]; choice_ids: string[]; nomination_count: number; choice_count: number; voter_count: number; binding?: boolean; space_id?: string; action_status?: string };
type ChainAlternative = { id: string; title: string; details: string; author: string; audience: string; delivery: string; timing: string; judgment: string; binding?: boolean; action_type?: ActionType | string; recipient_wallet?: string; permission_scope?: string; expires_at?: number; action_digest?: string };

export function useRoundId() {
  const [id, setId] = useState('');
  useEffect(() => { setId(new URLSearchParams(window.location.search).get('id') ?? ''); }, []);
  return id;
}

export function RoundWorkspace() {
  const id = useRoundId();
  const { account, networkOK, requireWallet, updateTx } = useApp();
  const [record, setRecord] = useState<ChainRound | null>(null);
  const [alts, setAlts] = useState<ChainAlternative[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showNom, setShowNom] = useState(false);
  const [form, setForm] = useState({ title: '', details: '', audience: '', delivery: '', timing: '', actionType: 'GRANT_PUBLISHER' as ActionType, recipientWallet: '', permissionScope: 'PUBLISHER', expiresAt: '' });
  const nowSeconds = Math.floor(Date.now() / 1000);

  const reload = useCallback(async () => {
    if (!id || !contractConfigured()) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const round = await readChain<ChainRound>('get_round', [id]);
      setRecord(round);
      setAlts(await Promise.all((round.nomination_ids ?? []).map(nominationId => readChain<ChainAlternative>('get_alternative', [nominationId]))));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not read this round.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void reload(); }, [reload]);

  const submit = async () => {
    const issue = validateNomination(form.title, form.details);
    if (issue) { setError(issue); return; }
    const expiry = form.actionType === 'REVOKE_PUBLISHER' ? 0 : Math.floor(new Date(form.expiresAt).getTime() / 1000);
    if (record?.binding && !isWallet(form.recipientWallet)) { setError('Binding actions require a valid recipient wallet.'); return; }
    if (record?.binding && form.actionType === 'GRANT_PUBLISHER' && (!expiry || expiry <= nowSeconds)) { setError('Publisher grants need a future expiry.'); return; }
    setBusy(true); setError('');
    try {
      const wallet = await requireWallet();
      const functionName = record?.binding ? 'nominate_binding' : 'nominate';
      const args = record?.binding
        ? [id, form.title.trim(), form.details.trim(), form.audience.trim(), form.delivery.trim(), form.timing.trim(), form.actionType, form.recipientWallet.trim(), form.permissionScope.trim(), BigInt(expiry)]
        : [id, form.title.trim(), form.details.trim(), form.audience.trim(), form.delivery.trim(), form.timing.trim()];
      await sendChain(wallet.account, wallet.provider, functionName, args, (phase, hash, detail) => updateTx(record?.binding ? 'Nominate governed action' : 'Nominate idea', phase, hash, detail));
      setShowNom(false); setForm({ title: '', details: '', audience: '', delivery: '', timing: '', actionType: 'GRANT_PUBLISHER', recipientWallet: '', permissionScope: 'PUBLISHER', expiresAt: '' }); await reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'The nomination could not be submitted.'); }
    finally { setBusy(false); }
  };
  const begin = async () => {
    setBusy(true); setError('');
    try {
      const wallet = await requireWallet();
      await sendChain(wallet.account, wallet.provider, 'begin_alignment', [id], (phase, hash, detail) => updateTx('Begin alignment', phase, hash, detail));
      await reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'Alignment could not begin.'); }
    finally { setBusy(false); }
  };

  if (!contractConfigured()) return <div className="page narrow"><div className="kicker">Live round</div><h1 className="page-title">Awaiting <em>deployment.</em></h1><p className="lede">Round details become available after a real Studionet contract address is configured.</p><Link href="/" className="text-arrow">Return to the decision floor <ArrowRight size={15} /></Link></div>;
  return <div className="page">
    {loading && !record ? <div className="loading-card"><RefreshCw className="spin" size={17} /> Reading canonical round state…</div> : error && !record ? <div className="error-box">{error}<button className="text-arrow" onClick={() => void reload()}>Retry</button></div> : record ? <>
      <div className="round-hero"><div><div className="kicker">Round {id || '…'} / workspace</div><h1>{record.question}</h1><p className="lede">A public working surface for nominations, reconciliation, and the final ballot.</p></div><div className="round-actions"><button className="btn btn-quiet" onClick={() => void reload()}><RefreshCw size={15} /> Refresh</button>{record.status === 'NOMINATING' && <button className="btn btn-dark" onClick={() => setShowNom(value => !value)}><Plus size={16} /> Add an idea</button>}</div></div>
      <div className="metric-strip"><div className="metric"><b>{record.member_count}</b><span>Eligible wallets</span></div><div className="metric"><b>{record.nomination_count}</b><span>Alternatives</span></div><div className="metric"><b>{record.choice_count}</b><span>Choices</span></div><div className="metric"><b>{record.voter_count}</b><span>Votes</span></div><div className="metric"><b>{record.quorum}</b><span>Quorum</span></div></div>
      <PhaseRibbon status={record.status} />
      <div className="workspace-grid"><section className="board-panel"><div className="board-head"><div><div className="section-kicker">The proposal board</div><h2>Every idea stays in the room.</h2></div><span className="side-state">{record.status.replaceAll('_', ' ')}</span></div>
        {error && <div className="error-box" role="alert">{error}</div>}
        {showNom && <div className="nomination-panel"><div className="form-tag">{record.binding ? 'GOVERNED ACTION TICKET' : 'NEW PROPOSAL TICKET'}</div><h3>{record.binding ? 'Nominate the exact action' : 'Nominate an alternative'}</h3><label>Short title<input value={form.title} maxLength={100} onChange={event => setForm({ ...form, title: event.target.value })} placeholder={record.binding ? 'Grant publishing rights to the community editor' : 'Beginner developer workshop'} /></label><label>What will happen and why?<textarea value={form.details} rows={4} maxLength={800} onChange={event => setForm({ ...form, details: event.target.value })} placeholder="Describe the proposed action, not only the topic." /></label><div className="two-inputs"><label>Who is it for?<input value={form.audience} maxLength={180} onChange={event => setForm({ ...form, audience: event.target.value })} /></label><label>What will be delivered?<input value={form.delivery} maxLength={180} onChange={event => setForm({ ...form, delivery: event.target.value })} /></label></div><label>Timing or constraints<input value={form.timing} maxLength={180} onChange={event => setForm({ ...form, timing: event.target.value })} /></label>{record.binding && <div className="action-envelope"><div className="section-kicker">IMMUTABLE ACTION ENVELOPE</div><div className="two-inputs"><label>Action<select value={form.actionType} onChange={event => setForm({ ...form, actionType: event.target.value as ActionType })}><option value="GRANT_PUBLISHER">Grant publisher</option><option value="REVOKE_PUBLISHER">Revoke publisher</option></select></label><label>Permission scope<input value={form.permissionScope} maxLength={32} onChange={event => setForm({ ...form, permissionScope: event.target.value.toUpperCase() })} /></label></div><label>Recipient wallet<input value={form.recipientWallet} onChange={event => setForm({ ...form, recipientWallet: event.target.value })} placeholder="0x…" /></label>{form.actionType === 'GRANT_PUBLISHER' && <label>Grant expiry<input type="datetime-local" value={form.expiresAt} min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} onChange={event => setForm({ ...form, expiresAt: event.target.value })} /></label>}<p className="muted">Every field is hashed into the contract-enforced authorization envelope. It cannot be changed after nomination.</p></div>}<p className="muted">Submission is immutable. Your account can nominate once for this round.</p><button disabled={busy || !account || !networkOK} className="btn btn-dark" onClick={() => void submit()}>{busy ? 'Waiting for finality…' : 'Sign and submit idea'} <ArrowRight size={16} /></button></div>}
        {alts.length === 0 ? <div className="empty-board"><h3>Nothing on the board yet.</h3><p>Eligible members can submit ideas while nominations remain open.</p></div> : <div className="idea-list">{alts.map((item, index) => <article className="idea-card" key={item.id}><div className="idea-card-head"><span>IDEA {String(index + 1).padStart(2, '0')}</span><span>{item.judgment || 'UNREVIEWED'}</span></div><h3>{item.title}</h3><p>{item.details}</p><small>By {shortAddress(item.author)}</small><div className="idea-details">{item.audience && <span className="idea-detail">Audience: {item.audience}</span>}{item.delivery && <span className="idea-detail">Delivery: {item.delivery}</span>}{item.timing && <span className="idea-detail">Timing: {item.timing}</span>}{item.binding && <span className="idea-detail">{item.action_type} · {shortAddress(item.recipient_wallet ?? '')}</span>}</div></article>)}</div>}
      </section><aside className="round-sidebar"><div className="section-kicker">Round conditions</div><div className="side-list"><div className="side-row"><span>Current state</span><b>{record.status.replaceAll('_', ' ')}</b></div><div className="side-row"><span>Nominations</span><b>{remaining(record.nomination_close, nowSeconds)}</b></div><div className="side-row"><span>Alignment close</span><b>{new Date(record.alignment_close * 1000).toLocaleString()}</b></div><div className="side-row"><span>Ballot close</span><b>{new Date(record.ballot_close * 1000).toLocaleString()}</b></div></div>{record.status === 'NOMINATING' && <button onClick={() => void begin()} disabled={busy || nowSeconds < record.nomination_close} className="btn btn-dark full">{nowSeconds < record.nomination_close ? 'Nominations still open' : 'Begin alignment'} <ArrowRight size={16} /></button>}<Link className="aside-link" href={'/align?id=' + encodeURIComponent(id)}>Inspect the Choice Map <ArrowRight size={15} /></Link><Link className="aside-link" href={'/ballot?id=' + encodeURIComponent(id)}>Open voting room <ArrowRight size={15} /></Link><Link className="aside-link" href={'/outcome?id=' + encodeURIComponent(id)}>View outcome replay <ArrowRight size={15} /></Link></aside></div>
    </> : null}
  </div>;
}
