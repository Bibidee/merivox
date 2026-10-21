'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, LockKeyhole, UsersRound } from 'lucide-react';
import { useApp } from '@/components/AppProviders';
import { readChain, sendChain } from '@/lib/chain';
import { contractConfigured } from '@/lib/config';
import { MIN_ROUND_AFTER_NOMINATION_SECONDS, ROUND_RULES, isWallet, shortAddress, validateQuestion, type CommunitySpace } from '@/lib/model';

const localInput = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 16);
const now = () => localInput(Date.now() + ROUND_RULES.minCreationLeadSeconds * 1000);
const steps = ['The question', 'The roster', 'The window'];

export default function NewRound() {
  const { account, networkOK, requireWallet, updateTx } = useApp();
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState('');
  const [members, setMembers] = useState('');
  const [nominations, setNominations] = useState('');
  const [deadline, setDeadline] = useState('');
  const [quorum, setQuorum] = useState(2);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [roundId, setRoundId] = useState('');
  const [bindingMode, setBindingMode] = useState(false);
  const [spaceId, setSpaceId] = useState('');
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const roster = [...new Set(members.split(/[\s,;]+/).map(value => value.trim()).filter(Boolean))];
  const eligible = Boolean(account && roster.some(value => value.toLowerCase() === account.toLowerCase()));
  useEffect(() => { const params = new URLSearchParams(window.location.search); if (params.get('binding') === '1') { setBindingMode(true); setSpaceId(params.get('space') ?? ''); } }, []);
  useEffect(() => { if (!contractConfigured()) return; void readChain<Array<Record<string, unknown>>>('list_spaces', [BigInt(0), BigInt(25)]).then(items => setSpaces(items.map(item => ({ space_id: String(item.space_id ?? ''), name: String(item.name ?? ''), founder: String(item.founder ?? ''), members: Array.isArray(item.members) ? item.members.map(String) : [], member_count: Number(item.member_count ?? 0), created_at: Number(item.created_at ?? 0) })))).catch(() => setSpaces([])); }, []);

  const next = () => {
    const issue = step === 0 ? validateQuestion(question) : step === 1
      ? bindingMode ? !spaceId ? 'Choose a community space for this governed action round.' : null
        : roster.length < 3 || roster.length > 25 ? 'Use 3–25 eligible wallets.'
          : roster.some(value => !isWallet(value)) ? 'Each roster item must be an EVM address.'
            : !eligible ? 'The round creator must be on the roster.' : null
      : null;
    if (issue) { setError(issue); return; }
    setError(''); setStep(value => Math.min(2, value + 1));
  };
  const submit = async () => {
    setError('');
    const nominationClose = Math.floor(new Date(nominations).getTime() / 1000);
    const ballotClose = Math.floor(new Date(deadline).getTime() / 1000);
    if (!nominationClose || !ballotClose || nominationClose <= Date.now() / 1000 + ROUND_RULES.minCreationLeadSeconds || ballotClose <= nominationClose + MIN_ROUND_AFTER_NOMINATION_SECONDS) { setError(`Set nomination close at least 10 minutes from now, and ballot close at least ${Math.ceil(MIN_ROUND_AFTER_NOMINATION_SECONDS / 60)} minutes after nominations (${ROUND_RULES.maxNominations} alternatives × bounded validator time, plus 15 minutes of voting).`); return; }
    if (!bindingMode && (quorum < 1 || quorum > roster.length)) { setError('Quorum must be between 1 and number of members.'); return; }
    setBusy(true);
    try {
      const wallet = await requireWallet();
      const functionName = bindingMode ? 'create_binding_round' : 'create_round';
      const args = bindingMode ? [spaceId, question.trim(), BigInt(nominationClose), BigInt(ballotClose)] : [question.trim(), roster, BigInt(nominationClose), BigInt(ballotClose), BigInt(quorum)];
      const result = await sendChain(wallet.account, wallet.provider, functionName, args, (phase, hash, detail) => { updateTx(bindingMode ? 'Create governed action round' : 'Create decision round', phase, hash, detail); if (phase === 'VERIFIED' && hash) setTxHash(hash); }, async receipt => {
        const value = receipt.consensus_data?.leader_receipt?.[0]?.result as { payload?: { readable?: unknown } } | undefined;
        const readable = value?.payload?.readable;
        let createdId = '';
        if (typeof readable === 'string') {
          try { createdId = String(JSON.parse(readable)); } catch { createdId = readable; }
        }
        if (!createdId || !/^\d+$/.test(createdId)) throw new Error('The finalized receipt did not return a canonical round ID.');
        const created = await readChain<Record<string, unknown>>('get_round', [createdId]);
        if (String(created.question ?? '') !== question.trim() || String(created.status ?? '') !== 'NOMINATING' || (bindingMode && String(created.space_id ?? '') !== spaceId)) throw new Error('The returned round ID did not read back as the newly created canonical round.');
        return `Application state verified for round ${createdId}`;
      });
      setTxHash(result.hash);
      const createdId = typeof result.returnValue === 'string' ? result.returnValue : String(result.returnValue ?? '');
      if (!/^\d+$/.test(createdId)) throw new Error('Round creation finalized without a usable canonical round ID. No duplicate transaction was submitted.');
      setRoundId(createdId);
    } catch (err) { setError(err instanceof Error ? err.message : 'The round could not be created.'); }
    finally { setBusy(false); }
  };

  return <div className="page">
    <div className="page-header"><div><div className="kicker">Builder / immutable round setup</div><h1 className="page-title">Give the question a <em>fair start.</em></h1><p className="lede">Define the question, the eligible voices, and the window. You will review the exact conditions before anything is signed.</p></div><Link className="text-arrow" href="/"><ArrowLeft size={15} /> Back to floor</Link></div>
    <div className="builder-grid">
      <section>
        <div className="stepper" aria-label="Round creation steps">{steps.map((label, index) => <button key={label} className={index === step ? 'current' : index < step ? 'done' : ''} onClick={() => index < step && setStep(index)} aria-current={index === step ? 'step' : undefined}><b>0{index + 1}</b><span>{label}</span></button>)}</div>
        <div className="form-card">
          {step === 0 && <><div className="form-tag">01 / DEFINE THE CHOICE</div><h2>What needs deciding?</h2><p>Ask one neutral, actionable question. The wording becomes permanent when the round is created.</p><div className="mode-switch"><button className={!bindingMode ? 'active' : ''} onClick={() => setBindingMode(false)}>Community choice</button><button className={bindingMode ? 'active' : ''} onClick={() => setBindingMode(true)}>Governed action</button></div><div className="form-fields"><label>Decision question<textarea rows={5} maxLength={320} value={question} onChange={event => setQuestion(event.target.value)} placeholder={bindingMode ? 'Who should be allowed to publish official community announcements?' : 'What should our community build together next?'} /><span className="field-hint">{question.length}/320 characters · minimum 15</span></label></div></>}
          {step === 1 && (bindingMode ? <><div className="form-tag">02 / IMMUTABLE COMMUNITY</div><h2>Which community decides?</h2><p>Binding rounds use the community&apos;s frozen roster and a two-thirds quorum. Create a space first if this is your first governed action.</p><div className="form-fields"><label>Community space<select value={spaceId} onChange={event => setSpaceId(event.target.value)}><option value="">Choose a space</option>{spaces.map(space => <option key={space.space_id} value={space.space_id}>{space.name} · {space.space_id} · {space.member_count} members</option>)}</select></label><Link className="text-arrow" href="/community">Open community spaces <ArrowRight size={15} /></Link></div></> : <><div className="form-tag">02 / ELIGIBLE MEMBERS</div><h2>Who gets a voice?</h2><p>Use wallet addresses as the frozen eligibility roster. The creator must be included.</p><div className="form-fields"><label>Eligible wallet addresses<textarea rows={8} value={members} onChange={event => setMembers(event.target.value)} placeholder={'0x…\n0x…\n0x…'} /><span className="field-hint">One address per line · {roster.length} unique entries · 3–25 required</span></label><div className="inline-note"><UsersRound size={17} />{account ? 'Connected creator: ' + shortAddress(account) + (eligible ? ' · included' : ' · add this wallet to continue') : 'Connect a wallet before signing; it must be on the roster.'}</div></div></>)}
          {step === 2 && <><div className="form-tag">03 / IMMUTABLE WINDOW</div><h2>Set the pace.</h2><p>Nominations close first. Alignment reserves {Math.ceil(MIN_ROUND_AFTER_NOMINATION_SECONDS / 60 - ROUND_RULES.minVotingWindowSeconds / 60)} minutes for every bounded reconciliation path, followed by at least 15 minutes of voting.</p><div className="form-fields"><label><span>Nomination close</span><input type="datetime-local" value={nominations} min={now()} onChange={event => setNominations(event.target.value)} /></label><label><span>Final voting deadline</span><input type="datetime-local" value={deadline} min={nominations ? localInput(new Date(nominations).getTime() + MIN_ROUND_AFTER_NOMINATION_SECONDS * 1000) : undefined} onChange={event => setDeadline(event.target.value)} /></label>{!bindingMode && <label><span>Required participation / quorum</span><input type="number" min={1} max={roster.length || 1} value={quorum} onChange={event => setQuorum(Number(event.target.value))} /><span className="field-hint">At least {quorum} eligible members must vote.</span></label>}{bindingMode && <div className="inline-note"><LockKeyhole size={17} />Quorum is fixed at two-thirds of the selected community roster.</div>}<div className="immutable-note"><LockKeyhole size={17} />Question, community or roster, deadlines, and quorum are immutable after creation.</div></div></>}
          {error && <div className="error-box" role="alert">{error}</div>}
          <div className="form-actions"><button className="btn btn-quiet" onClick={() => step > 0 ? setStep(value => value - 1) : undefined} disabled={step === 0 || busy}><ArrowLeft size={15} /> Back</button><div className="right">{step < 2 ? <button className="btn btn-dark" onClick={next}>Continue <ArrowRight size={16} /></button> : <button className="btn btn-dark" disabled={busy || !account || !networkOK || !contractConfigured()} onClick={() => void submit()}>{busy ? 'Awaiting finality…' : 'Sign and create round'} <ArrowUpRight size={16} /></button>}</div></div>
          {txHash && <div className="success-box"><CheckCircle2 size={17} /> Round creation verified on Studionet.<span>{txHash}</span>{roundId && <Link className="text-arrow" href={'/round?id=' + encodeURIComponent(roundId)}>Open round {roundId} <ArrowRight size={15} /></Link>}</div>}
        </div>
      </section>
      <aside className="builder-aside"><div className="kicker">Review / before signing</div><h3 className={question ? '' : 'empty'}>{question || 'Your question will appear here.'}</h3><div className="review-list"><div className="review-row"><span>Round type</span><b>{bindingMode ? 'Governed action' : 'Community choice'}</b></div><div className="review-row"><span>{bindingMode ? 'Community space' : 'Eligible wallets'}</span><b>{bindingMode ? (spaceId || 'Not set') : (roster.length || 'Not set')}</b></div><div className="review-row"><span>Quorum</span><b>{bindingMode ? 'Two-thirds' : quorum}</b></div><div className="review-row"><span>Nominations close</span><b>{nominations ? new Date(nominations).toLocaleString() : 'Not set'}</b></div><div className="review-row"><span>Voting deadline</span><b>{deadline ? new Date(deadline).toLocaleString() : 'Not set'}</b></div></div><div className="immutable-note"><CalendarClock size={17} />Review the conditions carefully. Merivox has no administrator who can rewrite a live round.</div></aside>
    </div>
  </div>;
}
