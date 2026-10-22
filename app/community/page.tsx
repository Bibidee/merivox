'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Clock3, LockKeyhole, Megaphone, RefreshCw, UsersRound } from 'lucide-react';
import { useApp } from '@/components/AppProviders';
import { actionGateConfigured, ACTION_GATE_ADDRESS, contractConfigured } from '@/lib/config';
import { extractContractReturn, readChain, readChainAt, sendChain, sendChainAt } from '@/lib/chain';
import { asNumber, isWallet, normalizeStatus, shortAddress, type Announcement, type CommunitySpace, type GovernanceRoundSummary, type Permission } from '@/lib/model';
import { readAllPages } from '@/lib/rounds';
import { verifyAnnouncementReadback } from '@/lib/verification';

function normalizeSpace(value: Record<string, unknown>): CommunitySpace {
  return { space_id: String(value.space_id ?? ''), name: String(value.name ?? ''), founder: String(value.founder ?? ''), members: Array.isArray(value.members) ? value.members.map(String) : [], member_count: asNumber(value.member_count), created_at: asNumber(value.created_at) };
}

function normalizePermission(value: Record<string, unknown>): Permission {
  return { exists: Boolean(value.exists), applied: Boolean(value.applied), effective: Boolean(value.effective), active: Boolean(value.active), space_id: String(value.space_id ?? ''), recipient_wallet: String(value.recipient_wallet ?? ''), permission_scope: String(value.permission_scope ?? ''), action_type: String(value.action_type ?? ''), expires_at: asNumber(value.expires_at), version: asNumber(value.version), action_digest: String(value.action_digest ?? ''), applied_at: asNumber(value.applied_at), reason: String(value.reason ?? ''), readable: value.readable === undefined ? true : Boolean(value.readable) };
}

function normalizeAnnouncement(value: Record<string, unknown>): Announcement {
  return { id: String(value.id ?? ''), space_id: String(value.space_id ?? ''), author: String(value.author ?? ''), content: String(value.content ?? ''), content_digest: String(value.content_digest ?? ''), published_at: asNumber(value.published_at), authorization_version: asNumber(value.authorization_version) };
}

function normalizeGovernanceRound(value: Record<string, unknown>): GovernanceRoundSummary {
  return { id: String(value.id ?? ''), question: String(value.question ?? ''), status: normalizeStatus(value.status), action_status: String(value.action_status ?? 'NOT_AUTHORIZED'), member_count: asNumber(value.member_count), nomination_count: asNumber(value.nomination_count), choice_count: asNumber(value.choice_count), voter_count: asNumber(value.voter_count), space_id: String(value.space_id ?? ''), binding: Boolean(value.binding) };
}

function permissionLabel(permission: Permission) {
  if (permission.readable === false) return 'Read unavailable';
  if (!permission.exists) return 'Never authorized';
  if (permission.reason === 'EXPIRED') return 'Expired';
  if (permission.reason === 'REVOKED') return 'Revoked';
  if (permission.reason === 'SUPERSEDED') return 'Superseded';
  if (permission.effective) return 'Active and effective';
  return permission.reason.replaceAll('_', ' ') || 'Pending application';
}

export default function CommunityPage() {
  const { account, networkOK, requireWallet, updateTx } = useApp();
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [selected, setSelected] = useState('');
  const [permission, setPermission] = useState<Permission | null>(null);
  const [rosterPermissions, setRosterPermissions] = useState<Permission[]>([]);
  const [governanceRounds, setGovernanceRounds] = useState<GovernanceRoundSummary[]>([]);
  const [selectedLoading, setSelectedLoading] = useState(false);
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
      const items = await readAllPages((offset, limit) => readChain<Array<Record<string, unknown>>>('list_spaces', [BigInt(offset), BigInt(limit)]));
      const normalized = items.map(normalizeSpace);
      setSpaces(normalized);
      setSelected(current => current && normalized.some(item => item.space_id === current) ? current : normalized[0]?.space_id ?? '');
    } catch (err) { setError(err instanceof Error ? err.message : 'Community spaces could not be read.'); }
    finally { setLoading(false); }
  }, []);

  const loadSelected = useCallback(async () => {
    const current = spaces.find(space => space.space_id === selected);
    if (!selected || !current || !contractConfigured()) { setPermission(null); setRosterPermissions([]); setGovernanceRounds([]); setAnnouncements([]); return; }
    setSelectedLoading(true); setError('');
    try {
      const rawRounds = await readAllPages((offset, limit) => readChain<Array<Record<string, unknown>>>('list_rounds', [BigInt(offset), BigInt(limit)]));
      setGovernanceRounds(rawRounds.map(normalizeGovernanceRound).filter(item => item.binding && item.space_id === selected));
      const nextAnnouncements = actionGateConfigured() ? await readAllPages((offset, limit) => readChainAt<Array<Record<string, unknown>>>(ACTION_GATE_ADDRESS, 'list_announcements', [selected, BigInt(offset), BigInt(limit)])) : [];
      setAnnouncements(nextAnnouncements.map(normalizeAnnouncement));
      if (!actionGateConfigured()) { setPermission(null); setRosterPermissions([]); return; }
      const nextPermissions: Permission[] = [];
      for (const member of current.members) {
        try {
          const next = normalizePermission(await readChainAt<Record<string, unknown>>(ACTION_GATE_ADDRESS, 'get_permission', [selected, member]));
          nextPermissions.push({ ...next, recipient_wallet: member, readable: true });
        } catch {
          nextPermissions.push({ exists: false, applied: false, effective: false, active: false, recipient_wallet: member, expires_at: 0, version: 0, action_digest: '', reason: 'READ_UNAVAILABLE', readable: false });
        }
      }
      setRosterPermissions(nextPermissions);
      setPermission(account ? nextPermissions.find(item => item.recipient_wallet?.toLowerCase() === account.toLowerCase()) ?? null : null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Community publication state could not be read.'); }
    finally { setSelectedLoading(false); }
  }, [account, selected, spaces]);

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
      const expectedContent = content.trim();
      const expectedAuthorizationVersion = permission.version;
      await sendChainAt(wallet.account, wallet.provider, 'publish_announcement', [selected, expectedContent], (phase, hash, detail) => updateTx('Publish community announcement', phase, hash, detail), async receipt => verifyAnnouncementReadback({
        returnedId: extractContractReturn(receipt),
        expectedSpaceId: selected,
        expectedAuthor: wallet.account,
        expectedContent,
        expectedAuthorizationVersion,
        readAnnouncement: announcementId => readChainAt<Record<string, unknown>>(ACTION_GATE_ADDRESS, 'get_announcement', [announcementId]),
      }), ACTION_GATE_ADDRESS);
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
        {current && <div className="space-detail"><div className="section-kicker">{current.space_id} / FROZEN ROSTER</div><h3>{current.name}</h3><p className="muted">Immutable ID <code>{current.space_id}</code> · founder <code>{current.founder}</code></p><div className="member-chips">{current.members.map(member => <span key={member}>{shortAddress(member)}</span>)}</div><Link className="text-arrow" href={'/new?binding=1&space=' + encodeURIComponent(current.space_id)}>Create a governed action round <ArrowRight size={15} /></Link></div>}
      </section>
      <aside className="round-sidebar"><div className="section-kicker">CREATE A SPACE</div><h3>Start with a frozen roster.</h3><div className="form-fields"><label>Community ID<input value={spaceId} onChange={event => setSpaceId(event.target.value.toLowerCase())} placeholder="builders" /></label><label>Community name<input value={spaceName} onChange={event => setSpaceName(event.target.value)} placeholder="Builders Guild" /></label><label>Member wallets<textarea rows={5} value={members} onChange={event => setMembers(event.target.value)} placeholder="0x…\n0x…\n0x…" /></label><p className="muted">The connected wallet must be included. Membership cannot be edited after creation.</p><button className="btn btn-dark full" disabled={busy || !account || !networkOK} onClick={() => void createSpace()}><UsersRound size={16} /> Sign and create space</button></div></aside>
    </div>
    {current && <>
      <section className="publication-panel"><div className="board-head"><div><div className="section-kicker">ACTIONGATE / {current.space_id}</div><h2>Publisher permissions</h2></div><UsersRound size={22} /></div>{selectedLoading && <div className="loading-card"><Clock3 size={17} className="spin" /> Reading authoritative roster state…</div>}{!actionGateConfigured() ? <div className="stage-alert"><LockKeyhole size={18} /><div><b>ActionGate address is not configured.</b><p>Permission and publication state cannot be inferred until the deployed two-contract pair is configured.</p></div></div> : <><div className="permission-roster"><div className="section-kicker">FROZEN ROSTER / AUTHORITATIVE READBACK</div>{rosterPermissions.length === 0 ? <p className="muted">No permission records were read for this community.</p> : rosterPermissions.map(item => <article className={'permission-card ' + (item.effective ? 'effective' : '')} key={item.recipient_wallet}><div><span className="section-kicker">{shortAddress(item.recipient_wallet ?? '')}</span><h3>{permissionLabel(item)}</h3></div><div><b>{item.version || '—'}</b><small>authorization version</small></div><div><b>{item.expires_at ? new Date(item.expires_at * 1000).toLocaleString() : '—'}</b><small>grant expiry</small></div><div className="permission-meta"><span>{item.permission_scope || '—'} · {item.action_type ? item.action_type.replaceAll('_', ' ') : '—'}</span><span>{item.applied ? 'Applied' : item.readable === false ? 'Unavailable' : 'Not applied'}</span></div></article>)}</div>{account && !permission && <div className="stage-alert"><CircleAlert size={18} /><div><b>This wallet is not on the frozen roster.</b><p>Publication is disabled because no authoritative permission record exists for the connected account.</p></div></div>}{permission && <div className={'permission-card current-permission ' + (permission.effective ? 'effective' : '')}><div><span className="section-kicker">CONNECTED WALLET</span><h3>{permissionLabel(permission)}</h3><p>{permission.recipient_wallet ? shortAddress(permission.recipient_wallet) : 'No connected wallet'}</p></div><div><b>{permission.version || '—'}</b><small>authorization version</small></div><div><b>{permission.expires_at ? new Date(permission.expires_at * 1000).toLocaleString() : '—'}</b><small>grant expiry</small></div></div>}{permission?.effective && <div className="publish-row"><textarea rows={3} maxLength={2000} value={content} onChange={event => setContent(event.target.value)} placeholder="Share an official update with the community…" /><button className="btn btn-dark" disabled={busy || !content.trim()} onClick={() => void publish()}>Publish and verify <Megaphone size={16} /></button></div>}</>}</section>
      <section className="board-panel community-history"><div className="board-head"><div><div className="section-kicker">MERIVOX / {current.space_id}</div><h2>Governed decisions</h2></div><Link className="text-arrow" href={'/new?binding=1&space=' + encodeURIComponent(current.space_id)}>Create round <ArrowRight size={15} /></Link></div>{governanceRounds.length === 0 ? <div className="empty-state"><p>No binding governance rounds have been recorded for this community.</p></div> : <div className="directory-list">{governanceRounds.map(item => <Link className="directory-card" href={'/round?id=' + encodeURIComponent(item.id)} key={item.id}><span className="directory-index">ROUND {item.id.padStart(3, '0')}</span><div><h3>{item.question}</h3><p>{item.member_count} frozen members · {item.voter_count} votes · {item.choice_count} choices</p></div><span className="status-pill status-final">{item.status.replaceAll('_', ' ')} · {item.action_status.replaceAll('_', ' ')}</span><ArrowRight size={17} /></Link>)}</div>}</section>
      <section className="publication-panel"><div className="board-head"><div><div className="section-kicker">APPEND-ONLY LOG / {current.space_id}</div><h2>Official announcements</h2></div><Megaphone size={22} /></div><div className="announcement-list">{announcements.length === 0 ? <div className="empty-state"><p>No announcements have been published for this space.</p></div> : announcements.map(item => <article className="announcement-card" key={item.id}><div><span>ANNOUNCEMENT {item.id}</span><small>{new Date(item.published_at * 1000).toLocaleString()} · {shortAddress(item.author)} · version {item.authorization_version}</small></div><p>{item.content}</p><code>{item.content_digest}</code></article>)}</div></section>
    </>}
  </div>;
}
