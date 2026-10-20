import type {Metadata} from 'next';
import './globals.css';
import {AppProviders} from '@/components/AppProviders';
import {Shell} from '@/components/Shell';
import {TransactionDock} from '@/components/TransactionDock';
export const metadata:Metadata={title:'Merivox — The Decision Studio',description:'Form fairer ballots from community proposals with independent GenLayer judgments.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppProviders><Shell>{children}</Shell><TransactionDock/></AppProviders></body></html>}
