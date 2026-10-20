'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, GitMerge, RefreshCcw, Vote } from 'lucide-react';
import { ChoiceMap } from '@/components/ChoiceMap';
import { readChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { asNumber, normalizeStatus, type RoundStatus } from '@/lib/model';

type RoundSummary = { id: string; question: string; status: RoundStatus; member_count: number; nomination_count: number; choice_count: number; voter_count: number };

function statusLabel(status: RoundStatus) { return status.replaceAll('_', ' '); }
function statusClass(status: RoundStatus) {
  if (status === 'VOTING') return 'status-voting';
  if (status === 'DECIDED' || status === 'TIED' || status === 'NO_QUORUM') return 'status-final';
  if (status === 'RECONCILING' || status === 'BALLOT_READY') return 'status-live';
  return '';
}

export default function Home() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRounds() {
    if (!contractConfigured()) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const raw = await readChain<Array<Record<string, unknown>>>('list_rounds', [BigInt(0), BigInt(8)]);
      setRounds(raw.map(item => ({
        id: String(item.id ?? ''), question: String(item.question ?? ''), status: normalizeStatus(item.status),
        member_count: asNumber(item.member_count), nomination_count: asNumber(item.nomination_count),
        choice_count: asNumber(item.choice_count), voter_count: asNumber(item.voter_count),
      })));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not read recent decisions.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadRounds(); }, []);

  return <div className="page">
    <div className="page-header-row">
      <div><div className="kicker">Decision floor / public studio</div><h1 className="page-title">Make room for <em>better choices.</em></h1><p className="lede">Merivox helps real groups turn overlapping ideas into a ballot they can understand, inspect, and own.</p></div>
      <Link className="btn btn-dark" href="/new">Create a decision <ArrowUpRight size={16} /></Link>
    </div>

    <section className="floor-top">
      <div className="welcome-panel"><div className="kicker">The decision studio</div><h1>Start with the question.<br /><em>Keep every voice.</em></h1><p>Set the people, the window, and the conditions. Then let validator consensus clarify the choices before the group votes.</p><Link className="btn" href="/new" style={{ background: 'var(--yellow)', color: 'var(--navy)' }}>Open the builder <ArrowRight size={16} /></Link></div>
      <div className="station-panel"><div className="panel-label"><span>How a round moves</span><span>03 stations</span></div><div className="station-list"><div className="station-row"><span className="station-number">01</span><div><b>Gather alternatives</b><span>Original wording stays visible.</span></div></div><div className="station-line" /><div className="station-row"><span className="station-number">02</span><div><b>Reconcile with evidence</b><span>Validators compare intent.</span></div></div><div className="station-line" /><div className="station-row"><span className="station-number">03</span><div><b>Freeze the ballot</b><span>One wallet, one public vote.</span></div></div></div></div>
    </section>

    <section className="decision-flow" aria-label="Merivox decision flow">
      <div className="flow-node"><small>01 / Nominations</small><b>Proposal tickets</b><span>Original wording stays visible.</span></div>
      <div className="flow-arrow"><GitMerge size={20} /><span>align</span><ArrowRight size={17} /></div>
      <div className="flow-node blue"><small>02 / Consensus</small><b>Choice Map</b><span>Equivalence is explicit.</span></div>
      <div className="flow-arrow"><Vote size={20} /><span>vote</span><ArrowRight size={17} /></div>
      <div className="flow-node yellow"><small>03 / Outcome</small><b>Public ballot</b><span>Results are final on-chain.</span></div>
    </section>

    <section className="floor-grid">
      <div className="rounds-panel">
        <div className="panel-head"><div><h2>Recent rounds</h2><p>Public contract reads from Studionet.</p></div><button className="icon-button" onClick={() => void loadRounds()} aria-label="Refresh recent rounds"><RefreshCcw size={16} /></button></div>
        {error && <div className="error-box" role="alert">{error}</div>}
        {!contractConfigured() ? <div className="empty-state"><h3>Contract connection is not configured.</h3><p>This floor will fill with public rounds when a deployed address is present.</p></div> : loading ? <div className="empty-state"><p>Reading recent rounds…</p></div> : rounds.length === 0 ? <div className="empty-state"><h3>No rounds yet.</h3><p>Start the first decision and it will appear here.</p></div> : <div className="round-list">{rounds.map(round => <Link href={'/round?id=' + encodeURIComponent(round.id)} className="round-row" key={round.id}><span className="round-id">ROUND {round.id.padStart(3, '0')}</span><div><strong>{round.question}</strong><small>{round.member_count} members · {round.nomination_count} alternatives · {round.voter_count} votes</small></div><span className={'status-pill ' + statusClass(round.status)}>{statusLabel(round.status)}</span><ArrowRight size={16} /></Link>)}</div>}
      </div>
      <aside className="insight-panel"><div className="kicker">The Merivox difference</div><h2>Good process leaves a trail.</h2><div className="insight-list"><div className="insight-item"><span className="insight-num">01</span><div><b>Nothing disappears.</b><p>Every original submission remains mapped to the final choice or explicit uncertainty.</p></div></div><div className="insight-item"><span className="insight-num">02</span><div><b>No silent interpretation.</b><p>Validator alignment is consensus-bound, and ambiguity stays visible.</p></div></div><div className="insight-item"><span className="insight-num">03</span><div><b>No invisible admin.</b><p>Roster, deadlines, votes, and finality are enforced by the contract.</p></div></div></div><Link className="text-arrow" href="/method">Read the method <ArrowRight size={15} /></Link></aside>
    </section>

    <section className="concept-band"><span className="section-kicker">A signature experience / concept preview</span><ChoiceMap /></section>
  </div>;
}
