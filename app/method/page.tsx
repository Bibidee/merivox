import Link from 'next/link';
import { ArrowUpRight, GitMerge, LockKeyhole, ShieldCheck, Vote, AlertCircle } from 'lucide-react';

export default function Method() {
  return <div className="page narrow">
    <div className="kicker">The Merivox method / plain language</div>
    <h1 className="page-title">A fair count starts with a <em>fair ballot.</em></h1>
    <p className="lede">Merivox gives communities a shared process for moving from many proposals to a public, inspectable choice. The contract keeps the rules and history; validator consensus only helps clarify semantic overlap.</p>
    <div className="method-cards">
      <article className="method-card"><span>01 / PEOPLE</span><GitMerge /><h2>Contribute alternatives</h2><p>Eligible wallets submit immutable, actionable proposals before the nomination deadline. Each member remains accountable for their own wording.</p></article>
      <article className="method-card"><span>02 / INTERPRETATION</span><ShieldCheck /><h2>Align independently</h2><p>GenLayer validators compare a new proposal with frozen canonical anchors. The protocol records consensus, disagreement, and timeout fallback explicitly.</p></article>
      <article className="method-card"><span>03 / CHOICE</span><Vote /><h2>Freeze the ballot</h2><p>Once choices are reconciled, the ballot opens. Each eligible wallet can cast one public vote, and the tally remains readable on-chain.</p></article>
      <article className="method-card"><span>04 / FINALITY</span><LockKeyhole /><h2>Replay the outcome</h2><p>Finalization records the result, quorum, ties or no-quorum state, and the mapping from every original alternative to a ballot choice.</p></article>
    </div>
    <div className="boundaries"><AlertCircle size={24} /><div><h2>What Merivox does not claim</h2><p>Wallet addresses do not prove unique real-world identities. Validator judgments can be wrong or inconclusive, so ambiguous and unresolved outcomes remain visible. The product records what members selected; it does not guarantee that a winning action is completed.</p></div></div>
    <Link className="btn btn-dark" href="/new">Begin a new round <ArrowUpRight size={16} /></Link>
  </div>;
}
