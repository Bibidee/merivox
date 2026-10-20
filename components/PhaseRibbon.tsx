import type {RoundStatus} from '@/lib/model';
const phases=['Nominations','Alignment','Ballot','Outcome'];
export function PhaseRibbon({status}:{status:RoundStatus}){const pos=status==='NOMINATING'?0:status==='RECONCILING'?1:status==='BALLOT_READY'||status==='VOTING'?2:3;return <div className="phase-ribbon" aria-label="Decision round progress">{phases.map((p,i)=><div key={p} className={`phase-step ${i===pos?'current':''} ${i<pos?'completed':''}`}><b>0{i+1}</b><span>{p}</span></div>)}</div>}
