import {CHAIN_HEX,NETWORK_DETAILS} from './config';
export interface Eip1193 {request(args:{method:string;params?:unknown[]}):Promise<unknown>;on?(e:string,fn:(arg:unknown)=>void):void;removeListener?(e:string,fn:(arg:unknown)=>void):void;}
export const getInjected=():Eip1193|null=>typeof window==='undefined'?null:((window as Window&{ethereum?:Eip1193}).ethereum??null);
export async function ensureChain(provider:Eip1193){const chain=String(await provider.request({method:'eth_chainId'}));if(chain.toLowerCase()===CHAIN_HEX.toLowerCase())return;
 try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN_HEX}]});}
 catch(e){const code=Number((e as {code?:number})?.code);if(code!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[NETWORK_DETAILS]});await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN_HEX}]});}}
