import fs from 'fs';
import { chromium } from 'playwright';
import { quote } from './pricing.js';
import { offerHTML } from './offer.js';
const uri=(f,m)=>`data:${m};base64,`+fs.readFileSync(f).toString('base64');
const A={fonts:{heebo:uri('heebo.ttf','font/ttf'),lekton:uri('lekton.ttf','font/ttf'),lektonBold:uri('lekton-bold.ttf','font/ttf')},logo:uri('logo.png','image/png'),
 team:{tomas:uri('team_tomas.jpg','image/jpeg'),daniel:uri('team_daniel.jpg','image/jpeg'),katarina:uri('team_katarina.jpg','image/jpeg')}};
const cases=[
 {file:'vzor_byt_128m2.pdf',number:'0510202601',projectName:'Návrh interiéru bytu 128 m² – Vzorový klient',quote:quote({need:'navrh_realizacia',m2:128.4}),flags:{structural:true}},
 {file:'vzor_konzultacia_18m2.pdf',number:'0510202602',projectName:'Návrh kancelárie 18 m² – Vzorový klient',quote:quote({need:'konzultacia',m2:18})},
];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const c of cases){const p=await b.newPage();await p.setContent(offerHTML({...c,date:'2026-10-05'},A),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
 await p.pdf({path:c.file,format:'A4',printBackground:true,preferCSSPageSize:true});console.log(c.file,JSON.stringify(c.quote.rows.map(r=>[r.key,r.net,r.gross])));await p.close();}
await b.close();
