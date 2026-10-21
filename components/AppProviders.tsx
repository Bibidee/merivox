'use client';
import {createContext,useContext,useCallback,useEffect,useMemo,useState,type ReactNode} from 'react';
import {CHAIN_HEX} from '@/lib/config';
import {getInjected,ensureChain,type Eip1193} from '@/lib/wallet';
import {recoverTransaction} from '@/lib/chain';
import type {Transaction,TxPhase} from '@/lib/model';
type Session={account:`0x${string}`|null;networkOK:boolean;provider:Eip1193|null;connecting:boolean;error:string;connect:()=>Promise<void>;disconnect:()=>void;switchChain:()=>Promise<void>;requireWallet:()=>Promise<{account:`0x${string}`;provider:Eip1193}>;transactions:Transaction[];updateTx:(label:string,phase:TxPhase,hash?:string,detail?:string)=>void;};
const Ctx=createContext<Session|null>(null);
const KEY='merivox:recent-txs';
function storeTx(items:Transaction[]){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,12)));}catch{}}
export function AppProviders({children}:{children:ReactNode}){
 const[account,setAccount]=useState<`0x${string}`|null>(null),[networkOK,setNetworkOK]=useState(false),[provider,setProvider]=useState<Eip1193|null>(null),[connecting,setConnecting]=useState(false),[error,setError]=useState(''),[transactions,setTransactions]=useState<Transaction[]>([]);
 useEffect(()=>{const p=getInjected();setProvider(p);try{const data=localStorage.getItem(KEY);if(data){const saved=JSON.parse(data) as Transaction[];setTransactions(saved);void Promise.all(saved.filter(t=>t.hash.startsWith('0x')&&['SUBMITTED','ACCEPTED','UNDETERMINED'].includes(t.phase)).map(async t=>{try{return {hash:t.hash,...await recoverTransaction(t.hash)};}catch{return null;}})).then(updates=>{const byHash=new Map(updates.filter(Boolean).map(item=>[item!.hash,item!]));if(byHash.size===0)return;setTransactions(cur=>{const next=cur.map(item=>{const recovered=byHash.get(item.hash);return recovered?{...item,phase:recovered.phase,detail:recovered.detail,at:Date.now()}:item;});storeTx(next);return next;});});}}catch{}
 if(!p)return;let active=true;
 const refresh=async()=>{try{const ac=await p.request({method:'eth_accounts'}) as string[];const chain=String(await p.request({method:'eth_chainId'}));if(active){setAccount(ac?.[0] as `0x${string}`||null);setNetworkOK(chain.toLowerCase()===CHAIN_HEX);}}catch{}};
 const onAccounts=(a:unknown)=>setAccount((a as string[])?.[0] as `0x${string}`||null);
 const onChain=(s:unknown)=>setNetworkOK(String(s).toLowerCase()===CHAIN_HEX);
 p.on?.('accountsChanged',onAccounts);p.on?.('chainChanged',onChain);void refresh();return()=>{active=false;p.removeListener?.('accountsChanged',onAccounts);p.removeListener?.('chainChanged',onChain);};},[]);
 const connect=useCallback(async()=>{const p=getInjected();if(!p){setError('No injected wallet detected. Install MetaMask or Rabby.');return;}setConnecting(true);setError('');try{const arr=await p.request({method:'eth_requestAccounts'}) as string[];if(!arr?.[0])throw new Error('No wallet account selected');setProvider(p);setAccount(arr[0] as `0x${string}`);const id=String(await p.request({method:'eth_chainId'}));setNetworkOK(id.toLowerCase()===CHAIN_HEX);}catch(e){setError((e as Error).message||'Wallet connection rejected.');}finally{setConnecting(false);}},[]);
 const disconnect=useCallback(()=>{setAccount(null);setError('');},[]);
 const switchChain=useCallback(async()=>{if(!provider)throw new Error('No wallet connected');setError('');try{await ensureChain(provider);setNetworkOK(true);}catch(e){setError((e as Error).message);throw e;}},[provider]);
 const requireWallet=useCallback(async()=>{if(!account||!provider)throw new Error('Connect a wallet first.');if(!networkOK)throw new Error('Switch the wallet to Studionet (61999) before signing.');const accounts=await provider.request({method:'eth_accounts'}) as string[];if(accounts?.[0]?.toLowerCase()!==account.toLowerCase())throw new Error('Wallet account changed. Reconnect before signing.');return {account,provider};},[account,provider,networkOK]);
 const updateTx=useCallback((label:string,phase:TxPhase,hash?:string,detail?:string)=>setTransactions(cur=>{const next=[{hash:hash||`pending:${label}`,label,phase,detail,at:Date.now()},...cur.filter(t=>t.label!==label||!(['SIGNING','SUBMITTED','ACCEPTED','UNDETERMINED'].includes(t.phase)))].slice(0,12);storeTx(next);return next;}),[]);
 const value=useMemo(()=>({account,networkOK,provider,connecting,error,connect,disconnect,switchChain,requireWallet,transactions,updateTx}),[account,networkOK,provider,connecting,error,connect,disconnect,switchChain,requireWallet,transactions,updateTx]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useApp(){const x=useContext(Ctx);if(!x)throw new Error('AppProviders missing');return x;}
