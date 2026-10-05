import fs from 'fs';
const strip=s=>s.replace(/^export\s+(const|function|async function)/gm,'$1');
const out=`// AUTO-GENERATED from pricing.js + offer.js + worker/main.js – ${new Date().toISOString()}\n`+strip(fs.readFileSync('pricing.js','utf8'))+'\n'+strip(fs.readFileSync('offer.js','utf8'))+'\n'+fs.readFileSync('worker/main.js','utf8');
fs.writeFileSync('worker/worker.js',out);console.log('worker.js',out.length,'bytes');
