'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { readChain, sendChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { useApp } from './AppProviders';
import { PhaseRibbon } from './PhaseRibbon';
import { remaining, shortAddress, validateNomination, type RoundStatus } from '@/lib/model';

type ChainRound = { id: string; creator: string; question: string; status: RoundStatus; members: string[]; member_count: number; quorum: number; nomination_close: number; alignment_close: number; ballot_close: number; created_at: number; nomination_ids: string[]; choice_ids: string[]; nomination_count: number; choice_count: number; voter_count: number };
type ChainAlternative = { id: string; title: string; details: string; author: string; audience: string; delivery: string; timing: string; judgment: string };

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
  const [form, setForm] = useState({ title: '', details: '', audience: '', delivery: '', timing: '' });
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
    setBusy(true); setError('');
    try {
      const wallet = await requireWallet();
      await sendChain(wallet.account, wallet.provider, 'nominate', [id, form.title.trim(), form.details.trim(), form.audience.trim(), form.delivery.trim(), form.timing.trim()], (phase, hash, detail) => updateTx('Nominate idea', phase, hash, detail));
      setShowNom(false); setForm({ title: '', details: '', audience: '', delivery: '', timing: '' }); await reload();
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
        {showNom && <div className="nomination-panel"><div className="form-tag">NEW PROPOSAL TICKET</div><h3>Nominate an alternative</h3><label>Short title<input value={form.title} maxLength={100} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Beginner developer workshop" /></label><label>What will happen and why?<textarea value={form.details} rows={4} maxLength={800} onChange={event => setForm({ ...form, details: event.target.value })} placeholder="Describe the proposed action, not only the topic." /></label><div className="two-inputs"><label>Who is it for?<input value={form.audience} maxLength={180} onChange={event => setForm({ ...form, audience: event.target.value })} /></label><label>What will be delivered?<input value={form.delivery} maxLength={180} onChange={event => setForm({ ...form, delivery: event.target.value })} /></label></div><label>Timing or constraints<input value={form.timing} maxLength={180} onChange={event => setForm({ ...form, timing: event.target.value })} /></label><p className="muted">Submission is immutable. Your account can nominate once for this round.</p><button disabled={busy || !account || !networkOK} className="btn btn-dark" onClick={() => void submit()}>{busy ? 'Waiting for finality…' : 'Sign and submit idea'} <ArrowRight size={16} /></button></div>}
        {alts.length === 0 ? <div className="empty-board"><h3>Nothing on the board yet.</h3><p>Eligible members can submit ideas while nominations remain open.</p></div> : <div className="idea-list">{alts.map((item, index) => <article className="idea-card" key={item.id}><div className="idea-card-head"><span>IDEA {String(index + 1).padStart(2, '0')}</span><span>{item.judgment || 'UNREVIEWED'}</span></div><h3>{item.title}</h3><p>{item.details}</p><small>By {shortAddress(item.author)}</small><div className="idea-details">{item.audience && <span className="idea-detail">Audience: {item.audience}</span>}{item.delivery && <span className="idea-detail">Delivery: {item.delivery}</span>}{item.timing && <span className="idea-detail">Timing: {item.timing}</span>}</div></article>)}</div>}
      </section><aside className="round-sidebar"><div className="section-kicker">Round conditions</div><div className="side-list"><div className="side-row"><span>Current state</span><b>{record.status.replaceAll('_', ' ')}</b></div><div className="side-row"><span>Nominations</span><b>{remaining(record.nomination_close, nowSeconds)}</b></div><div className="side-row"><span>Alignment close</span><b>{new Date(record.alignment_close * 1000).toLocaleString()}</b></div><div className="side-row"><span>Ballot close</span><b>{new Date(record.ballot_close * 1000).toLocaleString()}</b></div></div>{record.status === 'NOMINATING' && <button onClick={() => void begin()} disabled={busy || nowSeconds < record.nomination_close} className="btn btn-dark full">{nowSeconds < record.nomination_close ? 'Nominations still open' : 'Begin alignment'} <ArrowRight size={16} /></button>}<Link className="aside-link" href={'/align?id=' + encodeURIComponent(id)}>Inspect the Choice Map <ArrowRight size={15} /></Link><Link className="aside-link" href={'/ballot?id=' + encodeURIComponent(id)}>Open voting room <ArrowRight size={15} /></Link><Link className="aside-link" href={'/outcome?id=' + encodeURIComponent(id)}>View outcome replay <ArrowRight size={15} /></Link></aside></div>
    </> : null}
  </div>;
}
