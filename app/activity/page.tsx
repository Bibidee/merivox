'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCcw, Search } from 'lucide-react';
import { readChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { asNumber, normalizeStatus, type RoundStatus } from '@/lib/model';
import { readAllPages } from '@/lib/rounds';

type Summary = { id: string; question: string; status: RoundStatus; member_count: number; nomination_count: number; choice_count: number; voter_count: number };
const filters: Array<{ label: string; value: 'ALL' | 'LIVE' | 'VOTING' | 'FINAL' }> = [{ label: 'All rounds', value: 'ALL' }, { label: 'In motion', value: 'LIVE' }, { label: 'Voting', value: 'VOTING' }, { label: 'Finalized', value: 'FINAL' }];
function isFinal(status: RoundStatus) { return ['DECIDED', 'TIED', 'NO_QUORUM', 'CANCELLED'].includes(status); }
function isLive(status: RoundStatus) { return ['NOMINATING', 'RECONCILING', 'BALLOT_READY'].includes(status); }
function statusClass(status: RoundStatus) { return status === 'VOTING' ? 'status-voting' : isFinal(status) ? 'status-final' : isLive(status) ? 'status-live' : ''; }

export default function Activity() {
  const [items, setItems] = useState<Summary[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'VOTING' | 'FINAL'>('ALL');
  async function load() {
    if (!contractConfigured()) { setBusy(false); return; }
    setBusy(true); setError('');
    try {
      const raw = await readAllPages((offset, limit) => readChain<Array<Record<string, unknown>>>('list_rounds', [BigInt(offset), BigInt(limit)]));
      setItems(raw.map(item => ({ id: String(item.id ?? ''), question: String(item.question ?? ''), status: normalizeStatus(item.status), member_count: asNumber(item.member_count), nomination_count: asNumber(item.nomination_count), choice_count: asNumber(item.choice_count), voter_count: asNumber(item.voter_count) })));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not read rounds from Studionet.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  const visible = useMemo(() => items.filter(item => {
    const matchesFilter = filter === 'ALL' || filter === 'LIVE' && isLive(item.status) || filter === 'VOTING' && item.status === 'VOTING' || filter === 'FINAL' && isFinal(item.status);
    return matchesFilter && item.question.toLowerCase().includes(query.toLowerCase().trim());
  }), [filter, items, query]);

  return <div className="page narrow">
    <div className="page-header"><div><div className="kicker">Public register / round directory</div><h1 className="page-title">Decisions in <em>motion.</em></h1><p className="lede">Every round is a readable public record. Browse the live state, then open its workspace or replay.</p></div><button className="btn btn-quiet" onClick={() => void load()} disabled={busy}><RefreshCcw size={15} /> Refresh</button></div>
    <div className="directory-toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions" aria-label="Search rounds" /></div><div className="filter-row" role="group" aria-label="Round phase filters">{filters.map(item => <button key={item.value} className={'filter-btn ' + (filter === item.value ? 'active' : '')} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div></div>
    {error && <div className="error-box" role="alert">{error}<button className="text-arrow" onClick={() => void load()}>Retry</button></div>}
    {!contractConfigured() ? <div className="empty-state"><h3>Contract connection is not configured.</h3><p>The directory only presents public contract state, never invented sample rounds.</p></div> : busy && items.length === 0 ? <div className="loading-card">Reading rounds from Studionet…</div> : visible.length === 0 ? <div className="empty-state"><h3>{items.length === 0 ? 'No public rounds yet.' : 'No rounds match this view.'}</h3><p>{items.length === 0 ? 'Create a decision to establish the first public record.' : 'Try another phase filter or search term.'}</p></div> : <div className="directory-list">{visible.map(item => <Link className="directory-card" href={'/round?id=' + encodeURIComponent(item.id)} key={item.id}><span className="directory-index">ROUND {item.id.padStart(3, '0')}</span><div><h3>{item.question}</h3><p>{item.member_count} members · {item.nomination_count} alternatives · {item.choice_count} choices · {item.voter_count} votes</p></div><span className={'status-pill ' + statusClass(item.status)}>{item.status.replaceAll('_', ' ')}</span><ArrowRight size={17} /></Link>)}</div>}
  </div>;
}
