'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Megaphone, RefreshCw, UsersRound } from 'lucide-react';
import { useApp } from '@/components/AppProviders';
import { actionGateConfigured, ACTION_GATE_ADDRESS, contractConfigured } from '@/lib/config';
import { readChain, readChainAt, sendChain, sendChainAt } from '@/lib/chain';
import { asNumber, isWallet, shortAddress, type Announcement, type CommunitySpace, type Permission } from '@/lib/model';

function normalizeSpace(value: Record<string, unknown>): CommunitySpace {
  return { space_id: String(value.space_id ?? ''), name: String(value.name ?? ''), founder: String(value.founder ?? ''), members: Array.isArray(value.members) ? value.members.map(String) : [], member_count: asNumber(value.member_count), created_at: asNumber(value.created_at) };
}

function normalizePermission(value: Record<string, unknown>): Permission {
  return { exists: Boolean(value.exists), applied: Boolean(value.applied), effective: Boolean(value.effective), active: Boolean(value.active), space_id: String(value.space_id ?? ''), recipient_wallet: String(value.recipient_wallet ?? ''), permission_scope: String(value.permission_scope ?? ''), action_type: String(value.action_type ?? ''), expires_at: asNumber(value.expires_at), version: asNumber(value.version), action_digest: String(value.action_digest ?? ''), applied_at: asNumber(value.applied_at), reason: String(value.reason ?? '') };
}

function normalizeAnnouncement(value: Record<string, unknown>): Announcement {
  return { id: String(value.id ?? ''), space_id: String(value.space_id ?? ''), author: String(value.author ?? ''), content: String(value.content ?? ''), content_digest: String(value.content_digest ?? ''), published_at: asNumber(value.published_at), authorization_version: asNumber(value.authorization_version) };
}

export default function CommunityPage() {
  const { account, networkOK, requireWallet, updateTx } = useApp();
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [selected, setSelected] = useState('');
  const [permission, setPermission] = useState<Permission | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [spaceId, setSpaceId] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [members, setMembers] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');

  const loadSpaces = useCallback(async () => {
    if (!contractConfigured()) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const items = await readChain<Array<Record<string, unknown>>>('list_spaces', [BigInt(0), BigInt(25)]);
      const normalized = items.map(normalizeSpace);
      setSpaces(normalized);
      setSelected(current => current && normalized.some(item => item.space_id === current) ? current : normalized[0]?.space_id ?? '');
    } catch (err) { setError(err instanceof Error ? err.message : 'Community spaces could not be read.'); }
    finally { setLoading(false); }
  }, []);

  const loadSelected = useCallback(async () => {
    if (!selected || !contractConfigured()) { setPermission(null); setAnnouncements([]); return; }
    try {
      const nextAnnouncements = actionGateConfigured() ? await readChainAt<Array<Record<string, unknown>>>(ACTION_GATE_ADDRESS, 'list_announcements', [selected, BigInt(0), BigInt(25)]) : [];
      setAnnouncements(nextAnnouncements.map(normalizeAnnouncement));
      if (account && actionGateConfigured()) setPermission(normalizePermission(await readChainAt<Record<string, unknown>>(ACTION_GATE_ADDRESS, 'get_permission', [selected, account])));
      else setPermission(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Community publication state could not be read.'); }
  }, [account, selected]);

  useEffect(() => { void loadSpaces(); }, [loadSpaces]);
  useEffect(() => { void loadSelected(); }, [loadSelected]);

  const createSpace = async () => {
    const roster = [...new Set(members.split(/[\s,;]+/).map(item => item.trim()).filter(Boolean))];
    if (!/^[a-z0-9][a-z0-9_-]{2,63}$/.test(spaceId)) { setError('Use a lowercase community ID with 3–64 letters, numbers, hyphens, or underscores.'); return; }
    if (spaceName.trim().length < 3) { setError('Community name must contain at least 3 characters.'); return; }
    if (roster.length < 3 || roster.length > 25 || roster.some(item => !isWallet(item)) || !account || !roster.some(item => item.toLowerCase() === account.toLowerCase())) { setError('Use 3–25 valid wallets, including the connected founder.'); return; }
    setBusy(true); setError(''); setSuccess('');
    try {
      const wallet = await requireWallet();
      await sendChain(wallet.account, wallet.provider, 'create_space', [spaceId, spaceName.trim(), roster], (phase, hash, detail) => updateTx('Create community space', phase, hash, detail), async () => {
        const created = await readChain<CommunitySpace>('get_space', [spaceId]);
        if (created.space_id !== spaceId || created.member_count !== roster.length) throw new Error('Community space did not read back with its frozen roster.');
        return `Community ${spaceId} verified on Studionet`;
      });
      setSuccess(`Community ${spaceId} is now immutable and readable from Studionet.`);
      setSpaceId(''); setSpaceName(''); setMembers(''); await loadSpaces(); setSelected(spaceId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Community space could not be created.'); }
    finally { setBusy(false); }
  };

  const publish = async () => {
    if (!selected || !permission?.effective || !content.trim() || !actionGateConfigured()) { setError('Only an effective on-chain publisher permission can publish an announcement.'); return; }
    setBusy(true); setError(''); setSuccess('');
    try {
      const wallet = await requireWallet();
      await sendChainAt(wallet.account, wallet.provider, 'publish_announcement', [selected, content.trim()], (phase, hash, detail) => updateTx('Publish community announcement', phase, hash, detail), async () => {
        const items = await readChainAt<Array<Record<string, unknown>>>(ACTION_GATE_ADDRESS, 'list_announcements', [selected, BigInt(0), BigInt(25)]);
        if (!items.some(item => String(item.content ?? '') === content.trim() && String(item.author ?? '').toLowerCase() === wallet.account.toLowerCase())) throw new Error('Announcement did not read back from the ActionGate append-only log.');
        return 'Announcement finalized and verified in the ActionGate log';
      }, ACTION_GATE_ADDRESS);
      setContent(''); setSuccess('Announcement finalized and verified in the immutable publication log.'); await loadSelected();
    } catch (err) { setError(err instanceof Error ? err.message : 'Announcement could not be published.'); }
    finally { setBusy(false); }
  };

  if (!contractConfigured()) return <div className="page narrow"><div className="kicker">Community spaces</div><h1 className="page-title">Awaiting <em>deployment.</em></h1><p className="lede">Community spaces become live once the Merivox contract address is configured.</p><Link href="/" className="text-arrow"><ArrowLeft size={15} /> Return to floor</Link></div>;
  const current = spaces.find(space => space.space_id === selected);
  return <div className="page">
    <div className="page-header"><div><div className="kicker">Communities / governed publication</div><h1 className="page-title">Give the community a <em>voice.</em></h1><p className="lede">Spaces freeze their roster on creation. Official announcements can only be published after an approved Merivox action reaches the ActionGate.</p></div><Link className="text-arrow" href="/"><ArrowLeft size={15} /> Back to floor</Link></div>
    {error && <div className="error-box" role="alert">{error}<button className="text-arrow" onClick={() => { setError(''); void loadSelected(); }}>Retry</button></div>}
    {success && <div className="success-box"><CheckCircle2 size={17} /> {success}</div>}
    <div className="community-grid">
      <section className="board-panel"><div className="board-head"><div><div className="section-kicker">IMMUTABLE SPACES</div><h2>Choose a community.</h2></div><button className="btn btn-quiet" onClick={() => void loadSpaces()}><RefreshCw size={15} /> Refresh</button></div>{loading ? <div className="loading-card"><RefreshCw size={17} className="spin" /> Reading spaces…</div> : spaces.length === 0 ? <div className="empty-state"><h3>No community spaces yet.</h3><p>Create the first frozen roster below.</p></div> : <div className="directory-list">{spaces.map(space => <button key={space.space_id} className={'directory-card community-select ' + (space.space_id === selected ? 'selected' : '')} onClick={() => setSelected(space.space_id)}><span className="directory-index">{space.space_id}</span><div><h3>{space.name}</h3><p>{space.member_count} frozen members · founder {shortAddress(space.founder)}</p></div><ArrowRight size={17} /></button>)}</div>}
        {current && <div className="space-detail"><div className="section-kicker">{current.space_id} / FROZEN ROSTER</div><h3>{current.name}</h3><div className="member-chips">{current.members.map(member => <span key={member}>{shortAddress(member)}</span>)}</div><Link className="text-arrow" href={'/new?binding=1&space=' + encodeURIComponent(current.space_id)}>Create a governed action round <ArrowRight size={15} /></Link></div>}
      </section>
      <aside className="round-sidebar"><div className="section-kicker">CREATE A SPACE</div><h3>Start with a frozen roster.</h3><div className="form-fields"><label>Community ID<input value={spaceId} onChange={event => setSpaceId(event.target.value.toLowerCase())} placeholder="builders" /></label><label>Community name<input value={spaceName} onChange={event => setSpaceName(event.target.value)} placeholder="Builders Guild" /></label><label>Member wallets<textarea rows={5} value={members} onChange={event => setMembers(event.target.value)} placeholder="0x…\n0x…\n0x…" /></label><p className="muted">The connected wallet must be included. Membership cannot be edited after creation.</p><button className="btn btn-dark full" disabled={busy || !account || !networkOK} onClick={() => void createSpace()}><UsersRound size={16} /> Sign and create space</button></div></aside>
    </div>
    {current && <section className="publication-panel"><div className="board-head"><div><div className="section-kicker">ACTIONGATE / {current.space_id}</div><h2>Official announcements</h2></div><Megaphone size={22} /></div>{!actionGateConfigured() ? <div className="stage-alert"><LockKeyhole size={18} /><div><b>ActionGate address is not configured.</b><p>Publication remains disabled until the deployed two-contract pair is configured.</p></div></div> : <>{permission && <div className={'permission-card ' + (permission.effective ? 'effective' : '')}><div><span className="section-kicker">YOUR PUBLISHER PERMISSION</span><h3>{permission.effective ? 'Effective on-chain' : permission.reason.replaceAll('_', ' ')}</h3></div><div><b>{permission.version || '—'}</b><small>authorization version</small></div><div><b>{permission.expires_at ? new Date(permission.expires_at * 1000).toLocaleString() : '—'}</b><small>expiry</small></div></div>}{permission?.effective && <div className="publish-row"><textarea rows={3} maxLength={2000} value={content} onChange={event => setContent(event.target.value)} placeholder="Share an official update with the community…" /><button className="btn btn-dark" disabled={busy || !content.trim()} onClick={() => void publish()}>Publish and verify <Megaphone size={16} /></button></div>}<div className="announcement-list">{announcements.length === 0 ? <div className="empty-state"><p>No announcements have been published for this space.</p></div> : announcements.map(item => <article className="announcement-card" key={item.id}><div><span>ANNOUNCEMENT {item.id}</span><small>{new Date(item.published_at * 1000).toLocaleString()} · {shortAddress(item.author)}</small></div><p>{item.content}</p><code>{item.content_digest}</code></article>)}</div></> }</section>}
  </div>;
}
