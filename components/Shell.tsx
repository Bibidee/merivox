'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, CircleHelp, LayoutDashboard, ListChecks, LogOut, Menu, Plus, Radio, UsersRound, Wallet, X } from 'lucide-react';
import { useApp } from './AppProviders';
import { contractConfigured } from '@/lib/config';
import { shortAddress } from '@/lib/model';

const NAV = [
  { href: '/', label: 'Decision floor', icon: LayoutDashboard },
  { href: '/activity', label: 'Rounds', icon: ListChecks },
  { href: '/community', label: 'Communities', icon: UsersRound },
  { href: '/method', label: 'Method', icon: CircleHelp },
];

function isActive(path: string, href: string) {
  return href === '/' ? path === '/' : path.startsWith(href);
}

function WalletControl({ dark = false, mobile = false }: { dark?: boolean; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const { account, networkOK, connecting, connect, disconnect, switchChain } = useApp();
  return <div className={['wallet-wrap', dark ? 'rail-wallet' : ''].join(' ')}>
    <button className="wallet-toggle" onClick={() => account ? setOpen(value => !value) : void connect()} aria-expanded={open}>
      <Wallet size={15} />
      <span>{connecting ? 'Connecting…' : account ? shortAddress(account) : mobile ? 'Connect' : 'Connect wallet'}</span>
      {account && <ChevronDown size={14} />}
    </button>
    {open && account && <div className="wallet-popover">
      <strong>Connected account</strong>
      <code>{account}</code>
      <p>{networkOK ? 'Studionet 61999 ready' : 'Wrong network. Transactions are disabled.'}</p>
      {!networkOK && <button className="small-btn" onClick={() => void switchChain()}>Switch to Studionet</button>}
      <button className="small-btn ghost" onClick={() => { disconnect(); setOpen(false); }}><LogOut size={14} /> Disconnect from app</button>
    </div>}
  </div>;
}

function Brand() {
  return <Link href="/" className="rail-brand" aria-label="Merivox decision floor">
    <span className="brand-symbol"><span /><span /><span /></span>
    <span>merivox<span className="brand-stop">.</span></span>
  </Link>;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const { error } = useApp();

  return <div className="app-shell">
    <aside className="nav-rail">
      <Brand />
      <div className="rail-kicker">Decision studio</div>
      <nav className="rail-nav" aria-label="Main navigation">
        {NAV.map(({ href, label, icon: Icon }) => <Link key={href} className={'rail-link ' + (isActive(path, href) ? 'active' : '')} href={href}><Icon />{label}</Link>)}
      </nav>
      <Link className="rail-create" href="/new"><Plus size={17} /> Create a decision</Link>
      <div className="rail-foot">
        <div className="rail-network"><span className="network-dot" /> <span>STUDIONET<br />CHAIN 61999</span><Radio size={14} /></div>
        <WalletControl dark />
      </div>
    </aside>

    <div className="shell-content">
      <header className="mobile-topbar">
        <Brand />
        <div className="mobile-actions">
          <WalletControl mobile />
          <button className="menu-trigger" onClick={() => setMenu(value => !value)} aria-label="Toggle navigation" aria-expanded={menu}>{menu ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>
      {menu && <nav className="mobile-menu" aria-label="Mobile navigation">
        {NAV.map(({ href, label }) => <Link key={href} className={isActive(path, href) ? 'active' : ''} href={href} onClick={() => setMenu(false)}>{label}</Link>)}
        <Link href="/new" onClick={() => setMenu(false)}>Create a decision <Plus size={14} /></Link>
      </nav>}
      {!contractConfigured() && <div className="preview-banner"><AlertTriangle size={14} /> SOURCE HANDOFF PREVIEW — No deployed contract configured. Example content is illustrative, not live data.</div>}
      {error && <div className="session-error" role="alert">{error}</div>}
      <main>{children}</main>
      <footer className="footer"><div className="footer-inner"><div className="footer-title">merivox<span>.</span><p>Better choices start before the ballot.</p></div><div className="footer-side"><span>GENLAYER STUDIONET / 61999</span><span>PUBLIC BALLOTS · CONSENSUS-BOUND ALIGNMENT</span></div><Link href="/method" className="text-arrow">The method <ChevronDown size={15} style={{ transform: 'rotate(-90deg)' }} /></Link></div></footer>
    </div>
  </div>;
}
