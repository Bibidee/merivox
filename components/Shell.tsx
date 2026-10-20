'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState,type ReactNode} from 'react';
import {ArrowUpRight,ChevronDown,Menu,X,Wallet,LogOut,AlertTriangle} from 'lucide-react';
import {useApp} from './AppProviders';
import {contractConfigured} from '@/lib/config';
import {shortAddress} from '@/lib/model';
const NAV=[['/','Discover'],['/activity','Decisions'],['/method','The method']];
export function Shell({children}:{children:ReactNode}){const path=usePathname();const [menu,setMenu]=useState(false),[walletMenu,setWalletMenu]=useState(false);const{account,networkOK,connecting,connect,disconnect,switchChain,error}=useApp();return <div className="app-shell">
 <header className="topbar"><div className="container top-inner">
 <Link href="/" className="brand" aria-label="Merivox home"><span className="brand-symbol"><span/><span/><span/></span><span>merivox<span className="brand-stop">.</span></span></Link>
 <nav className="desktop-nav" aria-label="Main navigation">{NAV.map(([href,label])=><Link key={href} className={path===href?'nav-on':''} href={href}>{label}</Link>)}</nav>
 <div className="top-right"><span className="chain-chip"><i/> Studionet <b>61999</b></span><div className="wallet-wrap">
 <button className="wallet-toggle" onClick={()=>account?setWalletMenu(!walletMenu):void connect()} aria-expanded={walletMenu}><Wallet size={15}/>{connecting?'Connecting…':account?shortAddress(account):'Connect wallet'}{account&&<ChevronDown size={14}/>}</button>
 {walletMenu&&account&&<div className="wallet-popover"><strong>Connected account</strong><code>{account}</code><p>{networkOK?'Studionet 61999 ready':'Wrong network. Transactions are disabled.'}</p>{!networkOK&&<button className="small-btn" onClick={()=>void switchChain()}>Switch to Studionet</button>}<button className="small-btn ghost" onClick={()=>{disconnect();setWalletMenu(false)}}><LogOut size={14}/> Disconnect from app</button></div>}
 </div><button className="mobile-menu-btn" onClick={()=>setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div>
 </div>{menu&&<nav className="mobile-nav">{NAV.map(([href,label])=><Link href={href} onClick={()=>setMenu(false)} key={href}>{label}</Link>)}</nav>}</header>
 {!contractConfigured()&&<div className="preview-banner"><AlertTriangle size={14}/> SOURCE HANDOFF PREVIEW — No deployed contract configured. Example content is illustrative, not live data.</div>}
 {error&&<div className="session-error" role="alert">{error}</div>}
 <main>{children}</main>
 <footer className="footer"><div className="container footer-inner"><div className="footer-title">merivox<span>.</span><p>Better choices start before the ballot.</p></div><div className="footer-side"><span>GENLAYER STUDIONET / 61999</span><span>PUBLIC BALLOTS · CONSENSUS-BOUND ALIGNMENT</span></div><Link href="/method">The method <ArrowUpRight size={15}/></Link></div></footer>
 </div>}
