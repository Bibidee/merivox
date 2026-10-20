'use client';
import {useState} from 'react';
import {Activity,ChevronDown,ExternalLink} from 'lucide-react';
import {useApp} from './AppProviders';
import {explorerTx} from '@/lib/config';
export function TransactionDock(){const {transactions}=useApp();const[expanded,setExpanded]=useState(false);if(transactions.length===0)return null;return <section className="tx-dock" aria-label="Transaction activity"><button onClick={()=>setExpanded(v=>!v)}><Activity size={15}/><strong>Transaction activity</strong><span className="tx-dot"/>{transactions[0].phase}<ChevronDown size={16}/></button>{expanded&&<div className="tx-list">{transactions.map((t,i)=><div className="tx-row" key={t.hash+t.at+i}><div><b>{t.label}</b><p>{t.detail??'Awaiting protocol update'}</p><small>{t.phase==='ACCEPTED'?'Provisional, not finalized':t.phase}</small></div>{t.hash.startsWith('0x')&&<a href={explorerTx(t.hash)} target="_blank" rel="noreferrer">Explorer <ExternalLink size={12}/></a>}</div>)}</div>}</section>}
