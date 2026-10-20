import { ArrowRight, CheckCircle2, GitMerge, HelpCircle, Layers3 } from 'lucide-react';
import type { Choice, Nomination } from '@/lib/model';
import { shortAddress } from '@/lib/model';

type Props = { nominations?: Nomination[]; choices?: Choice[]; live?: boolean };

const illustrativeNominations: Nomination[] = [
  { id: '01', round_id: 'demo', author: '', title: 'Beginner contract workshop', details: 'Interactive session for new builders', audience: 'New builders', delivery: 'Live workshop', timing: 'Weekend', choice_id: '01', judgment: 'EQUIVALENT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
  { id: '02', round_id: 'demo', author: '', title: 'Intro to deploying contracts', details: 'Guided hands-on session', audience: 'New builders', delivery: 'Live workshop', timing: 'Weekend', choice_id: '01', judgment: 'EQUIVALENT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
  { id: '03', round_id: 'demo', author: '', title: 'Weekend community hackathon', details: 'Team-based competition', audience: 'Mixed experience', delivery: 'Team event', timing: 'Weekend', choice_id: '02', judgment: 'DISTINCT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
];

function details(items: Array<[string, string]>) {
  return items.filter(([, value]) => value).map(([label, value]) => <span className="map-condition" key={label}>{label}: {value}</span>);
}

export function ChoiceMap({ nominations, choices, live = false }: Props) {
  const items = nominations ?? illustrativeNominations;
  const result = choices ?? [];
  const illustrative = !nominations && !choices;
  return <section className="choice-map" aria-label={live ? 'Live contract choice map' : 'Choice Map preview'}>
    <div className="map-head"><span><span className="map-live-dot" /> CHOICE MAP</span><span>{illustrative ? 'CONCEPT PREVIEW / NOT CONTRACT STATE' : 'LIVE CONTRACT DATA'}</span></div>
    <div className="map-body">
      <div className="map-column">
        <div className="map-col-head"><Layers3 size={16} /> Proposal tickets <span>{String(items.length).padStart(2, '0')}</span></div>
        <div className="map-items">
          {items.length === 0 ? <div className="map-empty">No alternatives recorded yet.</div> : items.map((item, index) => <article className={'map-item ' + (index % 3 === 0 ? 'item-one' : index % 3 === 1 ? 'item-two' : 'item-three')} key={item.id}>
            <small>IDEA {String(index + 1).padStart(2, '0')} · {item.judgment || 'UNREVIEWED'}</small>
            <b>{item.title}</b><span>{item.details}</span>
            <div className="map-author"><i /> By {shortAddress(item.author)}</div>
            <div className="map-conditions">{details([['audience', item.audience], ['delivery', item.delivery], ['timing', item.timing]])}</div>
            {item.last_error && <em>{item.last_error}</em>}
          </article>)}
        </div>
      </div>
      <div className="map-bridge"><div className="map-bridge-icon"><GitMerge size={20} /></div><span>Validator<br />alignment</span><ArrowRight size={17} /></div>
      <div className="map-column">
        <div className="map-col-head"><CheckCircle2 size={16} /> Ballot choices <span>{String(result.length || (illustrative ? 2 : 0)).padStart(2, '0')}</span></div>
        <div className="map-items">
          {result.length === 0 && !illustrative && <div className="map-empty">Choices appear as reconciliation advances.</div>}
          {result.map(choice => <article className={'map-item ' + (choice.uncertain ? 'result-uncertain' : 'result-primary')} key={choice.id}>
            <small>{choice.uncertain ? <><HelpCircle size={12} /> UNCERTAIN / EXPLICIT FALLBACK</> : <><CheckCircle2 size={12} /> CANONICAL CHOICE</>}</small>
            <b>{choice.anchor_title}</b><span>{choice.anchor_details}</span>
            <div className="map-conditions">{details([['audience', choice.anchor_audience], ['delivery', choice.anchor_delivery], ['timing', choice.anchor_timing]])}</div>
            <div className="mini-chip">{choice.nomination_ids.length} original submission{choice.nomination_ids.length === 1 ? '' : 's'}</div>
          </article>)}
          {illustrative && <><article className="map-item result-primary"><small><CheckCircle2 size={12} /> CANONICAL CHOICE / ILLUSTRATIVE</small><b>Beginner learning session</b><span>Ideas 01 + 02 become one option only after real consensus.</span><div className="mini-chip">2 original submissions</div></article><article className="map-item result-uncertain"><small><HelpCircle size={12} /> DISTINCT / ILLUSTRATIVE</small><b>Community hackathon</b><span>An independent choice with a different deliverable.</span><div className="mini-chip">1 original submission</div></article></>}
        </div>
      </div>
    </div>
    <div className="map-foot"><span>NO SILENT MERGES</span><span>Every original idea stays visible. Uncertainty stays visible too.</span></div>
  </section>;
}
