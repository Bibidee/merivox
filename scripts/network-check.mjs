import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const config=fs.readFileSync(path.join(root,'lib','config.ts'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const contract=fs.readFileSync(path.join(root,'contracts','merivox.py'),'utf8');
const expectedId = 61999;
const expectedRpc = 'https://studio.genlayer.com/api';
if(!config.includes(String(expectedId)) || !config.includes(expectedRpc)) throw new Error('Missing required Studionet configuration');
if(pkg.devDependencies?.genlayer!=='0.39.1')throw new Error('GenLayer CLI is not pinned to 0.39.1');
if(!contract.includes('class Merivox('))throw new Error('Missing Merivox contract');
function scan(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){if(['node_modules','.next','out','.git','.pytest_cache','.venv','.venv312'].includes(entry.name)||entry.name.startsWith('.venv'))continue;const f=path.join(folder,entry.name);if(entry.isDirectory())scan(f);else if(/\.(ts|tsx|py|mjs|json|md)$/.test(f)&& !f.endsWith('network-check.mjs') && !f.endsWith('CODEX_BUILD_PROMPT.md')){const s=fs.readFileSync(f,'utf8');if(/61997|studio.dev|studio-dev/i.test(s))throw new Error(`Forbidden network reference in ${path.relative(root,f)}`);}}}
scan(root);
console.log('Network/config static audit passed: Studionet 61999, pinned local CLI 0.39.1');
