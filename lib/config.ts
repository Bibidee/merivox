export const CHAIN_ID=61999;
export const CHAIN_HEX=`0x${CHAIN_ID.toString(16)}`;
export const RPC_URL='https://studio.genlayer.com/api';
export const EXPLORER_URL='https://explorer-studio.genlayer.com';
export const CONTRACT_ADDRESS=(process.env.NEXT_PUBLIC_MERIVOX_CONTRACT??'0x0000000000000000000000000000000000000000') as `0x${string}`;
export function contractConfigured(){return /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)&&!/^0x0{40}$/.test(CONTRACT_ADDRESS.toLowerCase());}
export const NETWORK_DETAILS={chainId:CHAIN_HEX,chainName:'GenLayer Studionet',nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER_URL]};
export const explorerTx=(hash:string)=>`${EXPLORER_URL}/tx/${encodeURIComponent(hash)}`;
