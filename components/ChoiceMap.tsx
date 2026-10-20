import { ArrowRight, CheckCircle2, GitMerge, HelpCircle, Layers3 } from 'lucide-react';
import type { Choice, Nomination } from '@/lib/model';

type Props = {
  nominations?: Nomination[];
  choices?: Choice[];
  live?: boolean;
};

const illustrativeNominations: Nomination[] = [
  { id: '01', round_id: 'demo', author: '', title: 'Beginner contract workshop', details: 'Interactive session for new builders', audience: '', delivery: '', timing: '', choice_id: '01', judgment: 'EQUIVALENT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
  { id: '02', round_id: 'demo', author: '', title: 'Intro to deploying contracts', details: 'Guided hands-on session', audience: '', delivery: '', timing: '', choice_id: '01', judgment: 'EQUIVALENT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
  { id: '03', round_id: 'demo', author: '', title: 'Weekend community hackathon', details: 'Team-based competition', audience: '', delivery: '', timing: '', choice_id: '02', judgment: 'DISTINCT', attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0 },
];

export function ChoiceMap({ nominations, choices, live = false }: Props) {
  const items = nominations ?? illustrativeNominations;
  const result = choices ?? [];
  const illustrative = !nominations && !choices;
  return (
    <section className="choice-map" aria-label={live ? 'Live contract choice map' : 'Illustration of proposal alignment'}>
      <div className="map-head">
        <span><span className="map-live-dot"/> THE CHOICE MAP</span>
        <span>{illustrative ? 'VISUAL EXAMPLE / NOT CHAIN DATA' : 'LIVE CONTRACT DATA'}</span>
      </div>
      <div className="map-body">
        <div className="map-col proposal-col">
          <div className="map-col-head"><Layers3 size={17}/> Submitted alternatives <span>{String(items.length).padStart(2, '0')}</span></div>
          {items.length === 0 ? <div className="map-empty">No nominations recorded yet.</div> : items.map((item, index) => (
            <article className={`map-item ${index % 3 === 0 ? 'item-one' : index % 3 === 1 ? 'item-two' : 'item-three'}`} key={item.id}>
              <small>IDEA {String(index + 1).padStart(2, '0')} · {item.judgment}</small>
              <b>{item.title}</b>
              <span>{item.details}</span>
              {item.last_error && <em>{item.last_error}</em>}
            </article>
          ))}
        </div>
        <div className="map-bridge"><div className="map-bridge-icon"><GitMerge size={22}/></div><span>Independent<br/>alignment</span><ArrowRight size={18}/></div>
        <div className="map-col result-col">
          <div className="map-col-head"><CheckCircle2 size={17}/> Ballot-ready choices <span>{String(result.length).padStart(2, '0')}</span></div>
          {result.length === 0 ? <div className="map-empty">Choices appear as reconciliation advances.</div> : result.map(choice => (
            <article className={`map-item ${choice.uncertain ? 'result-uncertain' : 'result-primary'}`} key={choice.id}>
              <small>{choice.uncertain ? <><HelpCircle size={12}/> UNCERTAIN / EXPLICIT FALLBACK</> : <><CheckCircle2 size={12}/> CANONICAL CHOICE</>}</small>
              <b>{choice.anchor_title}</b>
              <span>{choice.anchor_details}</span>
              <div className="mini-chip">{choice.nomination_ids.length} original submission{choice.nomination_ids.length === 1 ? '' : 's'}</div>
            </article>
          ))}
          {illustrative && <><article className="map-item result-primary"><small><CheckCircle2 size={12}/> EQUIVALENT / ILLUSTRATIVE</small><b>Beginner learning session</b><span>Ideas 01 + 02 become one option only after real consensus</span><div className="mini-chip">2 original submissions</div></article><article className="map-item result-secondary"><small><HelpCircle size={12}/> DISTINCT / ILLUSTRATIVE</small><b>Community hackathon</b><span>Independent choice with different deliverable</span></article></>}
        </div>
      </div>
      <div className="map-foot"><span>NO SILENT MERGES</span><span>Every original idea stays visible.</span></div>
    </section>
  );
}
