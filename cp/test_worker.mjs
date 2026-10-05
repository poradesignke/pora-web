import fs from 'fs';
import { chromium } from 'playwright';
const store=new Map();
globalThis.caches={default:{match:async k=>store.get(k.url),put:async(k,v)=>{store.set(k.url,v)}}};
const sent=[];let step=0;const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{
  url=String(url);
  if(url.includes('api.anthropic.com')){const b=JSON.parse(init.body);step++;
    if(step===1) return new Response(JSON.stringify({stop_reason:'tool_use',content:[{type:'text',text:'Overím cenu.'},{type:'tool_use',id:'t1',name:'calculate_quote',input:{area_m2:205.4,need:'navrh_realizacia'}}]}),{status:200});
    if(step===2){const tr=b.messages.at(-1).content[0];console.log('TOOL calculate_quote ->',tr.content);
      return new Response(JSON.stringify({stop_reason:'tool_use',content:[{type:'tool_use',id:'t2',name:'submit_offer',input:{client_name:'Ján Test',email:'jan@example.com',project_type:'byt',location:'Prešov',area_m2:205.4,need:'navrh_realizacia',structural_change:true,heritage:false,gdpr_consent:true,language:'sk'}}]}),{status:200});}
    const tr=b.messages.at(-1).content[0];console.log('TOOL submit_offer ->',tr.content);
    return new Response(JSON.stringify({stop_reason:'end_turn',content:[{type:'text',text:'Hotovo, ponuka je na ceste.'}]}),{status:200});}
  if(url.includes('/browser-run/pdf')){const b=JSON.parse(init.body);const html=b.html.replaceAll('https://www.pora.sk/cp/','http://localhost:8790/');
    const p=await browser.newPage();await p.setContent(html,{waitUntil:'networkidle'});const pdf=await p.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});await p.close();
    return new Response(pdf,{status:200,headers:{'content-type':'application/pdf'}});}
  if(url.includes('api.brevo.com')){const b=JSON.parse(init.body);sent.push(b);return new Response('{"messageId":"x"}',{status:201});}
  return realFetch(url,init);
};
const W=(await import('./worker/worker.js')).default;
const env={ANTHROPIC_API_KEY:'k',BREVO_API_KEY:'b',CF_API_TOKEN:'c',CF_ACCOUNT_ID:'acc',SIGNING_SECRET:'s3cr3t-s3cr3t',OWNER_EMAIL:'info@pora.sk',AUTO_SEND:'false'};
const r=await W.fetch(new Request('https://pora-asistent.example.workers.dev/chat',{method:'POST',headers:{Origin:'https://www.pora.sk','content-type':'application/json'},body:JSON.stringify({messages:[{role:'assistant',content:'Ahoj'},{role:'user',content:'Áno, súhlasím, pošlite ponuku.'}]})}),env);
console.log('CHAT',r.status,await r.text(),r.headers.get('access-control-allow-origin'));
console.log('MAILS',sent.map(m=>[m.to[0].email,m.subject,(m.attachment||[]).map(a=>a.name+':'+a.content.length)]));
const link=sent[0].htmlContent.match(/href="([^"]+\/approve\?t=[^"]+)"/)[1];
const g=await W.fetch(new Request(link),env);console.log('APPROVE GET',g.status,(await g.text()).includes('Odoslať klientovi'));
const t=new URL(link).searchParams.get('t');const fd=new FormData();fd.set('t',t);
const po=await W.fetch(new Request(new URL(link).origin+'/approve',{method:'POST',body:fd}),env);console.log('APPROVE POST',po.status,(await po.text()).includes('Odoslané'));
const po2=await W.fetch(new Request(new URL(link).origin+'/approve',{method:'POST',body:(()=>{const f=new FormData();f.set('t',t);return f})()}),env);console.log('APPROVE again',(await po2.text()).includes('už bola'));
console.log('MAILS',sent.map(m=>[m.to[0].email,m.cc?.[0]?.email,m.subject]));
fs.writeFileSync('test_offer.pdf',Buffer.from(sent[1].attachment[0].content,'base64'));
const bad=await W.fetch(new Request(new URL(link).origin+'/approve?t='+t.slice(0,-3)+'abc'),env);console.log('TAMPER',(await bad.text()).includes('neplatný'));
const noorig=await W.fetch(new Request('https://x/chat',{method:'POST',body:'{}'}),env);console.log('NO ORIGIN',noorig.status);
await browser.close();
