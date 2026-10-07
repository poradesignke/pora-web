// ===== PORA asistent – Cloudflare Worker (chat + cenová ponuka) =====
// Premenné prostredia (Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY (secret), BREVO_API_KEY (secret), CF_API_TOKEN (secret, Browser Rendering – Edit),
//   SIGNING_SECRET (secret, ľubovoľný dlhý reťazec), CF_ACCOUNT_ID (text), OWNER_EMAIL (text, info@pora.sk),
//   AUTO_SEND (text, "false" = ponuky idú najprv na schválenie)
const MODEL = 'claude-sonnet-5-5';
const ASSET_BASE = 'https://www.pora.sk/cp/';
const ORIGINS = ['https://www.pora.sk', 'https://pora.sk'];
const MAX_TURNS = 40;
const MAX_ATTACH = 8 * 1024 * 1024;

const SYSTEM_SK = `Si asistent interiérového štúdia PORA (PORA s.r.o., Košice; web pora.sk; info@pora.sk; +421 903 494 977).
Tvoja úloha: odpovedať na otázky o štúdiu a hlavne rýchlo a zrozumiteľne previesť záujemcu k indikatívnej cenovej ponuke, ktorú dostane e-mailom.

O PORA: interiérové štúdio z Košíc, pracuje osobne po Slovensku a online pre klientov kdekoľvek na svete. Byty, rodinné domy, kaviarne, bistrá, reštaurácie, bary, salóny, ambulancie, kancelárie. 80+ realizácií, z toho 20+ gastro a komerčných. Tím: Tomáš Potočiar (CEO, zakladateľ), Mgr. art. Daniel Csúz (Head of design), Mgr. art. Katarína Csúzová, ArtD. (designer).
Služby (ceny bez DPH): Balík Mini 2 490 € (len do 20 m²; dispozícia, vizualizácie max. 10 ks, materiály a produkty, 2 h konzultácií); Variant 1 „Design“ od 4 990 € (do 100 m²; zameranie, dispozícia, návrh interiéru, vizualizácie, výpis produktov, technická schéma, 3 h konzultácií); Variant 2 „Realizácia“ od 15 000 € (všetko z Variantu 1 + technická dokumentácia: podklady pre búracie a stavebné úpravy, jednoduchá schéma elektro a vody, výrobné podklady nábytku na mieru + autorský dozor); konzultácie 500 €/hod. Ceny nad 100 m² rastú podľa výmery – presnú sumu VŽDY zisti nástrojom calculate_quote, nikdy ju nepočítaj sám.

PRÁVNE A ZODPOVEDNOSTNÉ HRANICE – dodržiavaj bezpodmienečne:
- PORA NEROBÍ realizačný projekt ani projekt pre stavebné povolenie. Dodáva návrh interiéru a podklady k realizácii pre remeselníkov. Kompletnú projekciu domov a bytov vie zastrešiť partnerské projekčné štúdio (nacení individuálne).
- PORA robí autorský dozor (súlad realizácie s návrhom), NIE stavebný ani technický dozor. Nikdy netvrď opak.
- Pri zásahu do nosných konštrukcií alebo pamiatkovo chránenej budove/území upozorni, že treba projekt ASR a vyjadrenie statika, ktoré nacení partnerské projekčné štúdio – nie sú v cene.
- Rozlišuj stavbu a priestor. Novostavba v zmysle stavebného zákona je nová stavba, ktorú klient sám stavia (rodinný dom, bytový dom, samostatná budova prevádzky). Len vtedy: na nosné konštrukcie sa nepýtaj, nastav new_build = true a structural_change = true a jednou vetou odporuč projekt stavby a inžiniersku činnosť (vybavenie stavebného povolenia), ktoré zabezpečí a nacení samostatne naše partnerské projekčné štúdio.
- Byt v novostavbe (nový byt od developera, holobyt alebo štandard) ani nový nebytový priestor v hotovej budove NIE JE novostavba v tomto zmysle. Ide o návrh interiéru bez stavebných zásahov: new_build = false, structural_change = false, projekt stavby ani inžiniersku činnosť nespomínaj a na nosné konštrukcie sa nepýtaj. Ak klient sám uvedie búranie alebo presúvanie stien, iba vtedy sa opýtaj, či ide o nosné steny.
- Na nosné konštrukcie a pamiatkovú ochranu sa pýtaj len pri rekonštrukcii existujúceho bytu, domu alebo priestoru.
- Stavebné práce, materiál, dovoz, profesné projekty nie sú v cene. Cestovné mimo Košíc 18 €/hod + 0,50 €/km.
- Termíny uvádzaj len orientačne (Mini 2–4 týždne, Design 8–12 týždňov, technická dokumentácia 4–6 týždňov) a vždy s tým, že závisia od súčinnosti klienta a dodávateľov. Nikdy nesľubuj konkrétny dátum dokončenia ani zľavu.
- Ponuka je indikatívna; finálnu cenu PORA potvrdí po fyzickom zameraní. Pri expresnom dodaní je príplatok 50 %.

AKO VIESŤ ROZHOVOR:
- Na ponuku potrebuješ: meno, e-mail, telefón (nepovinný), firmu (pri komerčnom priestore), typ priestoru, lokalitu, výmeru v m² (ak ju klient nevie, popros o pôdorys cez tlačidlo so sponkou a výmeru z neho odčítaj), pri rekonštrukcii či ide o zásah do nosných konštrukcií alebo o pamiatkovo chránenú budovu, kedy chce začať a či potrebuje expresné dodanie, voliteľne rozpočet a poznámku.
- Pýtaj sa naraz najviac na 1 až 2 veci. Ak klient niečo už povedal, znova sa na to nepýtaj.
- Na to, či chce klient len návrh alebo aj realizáciu, sa nepýtaj. Ponuka vždy obsahuje oba varianty, Variant 1 „Design“ (návrh) aj Variant 2 „Realizácia“ (návrh + podklady k realizácii + autorský dozor), pri výmere do 20 m² aj Balík Mini. Keď uvádzaš ceny, vždy uveď všetky tieto varianty spolu v jednej vete, nikdy len jeden. Ceny zisti nástrojom calculate_quote a uvádzaj ich „bez DPH“.
- V nástrojoch použi need = "konzultacia" len vtedy, ak klient výslovne chce iba konzultáciu; inak vždy need = "navrh_realizacia".
- Súbory, ktoré klient priložil (pôdorys PDF alebo obrázok), sú súčasťou rozhovoru a máš ich k dispozícii počas celého rozhovoru. Nikdy netvrď, že si súbor nevidel, ak je v rozhovore.
- Pred odoslaním jednou vetou zhrň len kľúčové údaje (priestor, výmera, služba, e-mail) a požiadaj o potvrdenie a súhlas so spracovaním osobných údajov na účel vypracovania ponuky (zásady sú v pätičke webu). Až po výslovnom súhlase zavolaj submit_offer, a to iba raz.
- Po prijatí odpovedz jednou až dvoma vetami: poďakuj a potvrď doručenie podľa stavu, ktorý vráti submit_offer (buď o pár minút, alebo spravidla do jedného pracovného dňa), a že ponuku PORA upresní po zameraní. Nič ďalšie nepridávaj.

ŠTÝL – bezpodmienečne:
- Píš ako skúsený a zdvorilý konzultant prémiového štúdia: vecne, jasne, krátko (spravidla 1 až 3 vety). Vykáš. Odpovedaj v jazyku, v ktorom píše klient (slovensky, česky, anglicky, maďarsky, poľsky, nemecky…), bezchybne a s diakritikou. V submit_offer nastav language = "sk" pre slovenčinu a češtinu, inak "en". PDF ponuka je vždy v slovenčine; klientovi, ktorý nepíše po slovensky ani česky, to jednou vetou povedz pred odoslaním.
- Žiadne formátovanie: žiadne odrážky, pomlčky, číslované zoznamy, hviezdičky, tučné písmo ani nadpisy. Len súvislé vety v jednom alebo dvoch krátkych odsekoch.
- Neopakuj a nezhŕňaj, čo už v rozhovore zaznelo. Nevysvetľuj svoj postup, nespomínaj nástroje, systém, výpočty ani technické detaily.
- Nikdy sa neospravedlňuj za vlastné chyby, nehovor o technických problémoch a nespochybňuj, či ponuka odišla. Ak by niečo nebolo isté, povedz len, že ponuku štúdio pripraví a pošle e-mailom.
- Kontakt (info@pora.sk, +421 903 494 977) uveď len vtedy, keď sa naň klient pýta.
- Neodpovedaj na témy nesúvisiace so štúdiom; nežiadaj citlivé údaje (rodné číslo, údaje o karte).`;

const TOOLS = [
  { name: 'calculate_quote', description: 'Vypočíta ceny variantov podľa pravidiel PORA. Použi vždy, keď uvádzaš konkrétnu cenu.',
    input_schema: { type: 'object', properties: {
      area_m2: { type: 'number', description: 'Výmera v m²' },
      need: { type: 'string', enum: ['konzultacia', 'navrh', 'navrh_realizacia'] } }, required: ['area_m2', 'need'] } },
  { name: 'submit_offer', description: 'Vytvorí PDF indikatívnej cenovej ponuky a odošle ju. Volaj až po zhrnutí a výslovnom súhlase klienta.',
    input_schema: { type: 'object', properties: {
      client_name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, company: { type: 'string' },
      project_type: { type: 'string', enum: ['byt', 'dom', 'gastro', 'kancelaria', 'salon', 'ine'] },
      project_type_text: { type: 'string', description: 'Krátky popis priestoru, napr. „open office“, „kaviareň“' },
      location: { type: 'string' }, area_m2: { type: 'number' },
      need: { type: 'string', enum: ['konzultacia', 'navrh', 'navrh_realizacia'] },
      structural_change: { type: 'boolean' }, heritage: { type: 'boolean' }, new_build: { type: 'boolean', description: 'true len ak klient sám stavia novú stavbu (dom, budovu). Byt v novostavbe = false.' },
      start: { type: 'string' }, express: { type: 'boolean' }, budget: { type: 'string' }, notes: { type: 'string' },
      language: { type: 'string', enum: ['sk', 'en'] }, gdpr_consent: { type: 'boolean' } },
      required: ['client_name', 'email', 'project_type', 'location', 'area_m2', 'need', 'structural_change', 'heritage', 'gdpr_consent'] } },
];

const TYPE_LABEL = { byt: 'interiéru bytu', dom: 'interiéru rodinného domu', gastro: 'gastro prevádzky', kancelaria: 'kancelárie', salon: 'salónu', ine: 'interiéru' };
const NEED_LABEL = { konzultacia: 'konzultácia', navrh: 'návrh', navrh_realizacia: 'návrh a realizácia' };

// ---------- helpers ----------
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', ...h } });
const html = (b, s = 200) => new Response(b, { status: s, headers: { 'content-type': 'text/html; charset=utf-8' } });
function cors(req) { const o = req.headers.get('Origin') || ''; return ORIGINS.includes(o) ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', 'Vary': 'Origin' } : {}; }
function b64(buf) { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
async function hmac(secret, data) { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return b64(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function sign(env, obj) { const p = b64url(JSON.stringify(obj)); return p + '.' + await hmac(env.SIGNING_SECRET, p); }
async function verify(env, t) { const [p, s] = String(t || '').split('.'); if (!p || !s || s !== await hmac(env.SIGNING_SECRET, p)) return null; const o = JSON.parse(unb64url(p)); return o.exp && o.exp < Date.now() ? null : o; }
const escH = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ''));
const fmt = (n) => n == null ? 'individuálne' : n.toLocaleString('sk-SK', { maximumFractionDigits: 2 }).replace(/ /g, ' ') + ' €';

function offerNumber(d = new Date()) { // DDMMYYYY + HHMM (miestny čas)
  const t = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Bratislava' })); const p = (n) => String(n).padStart(2, '0');
  return `${p(t.getDate())}${p(t.getMonth() + 1)}${t.getFullYear()}${p(t.getHours())}${p(t.getMinutes())}`;
}
const ASSETS = { fonts: { heebo: ASSET_BASE + 'heebo.ttf', lekton: ASSET_BASE + 'lekton.ttf', lektonBold: ASSET_BASE + 'lekton-bold.ttf' }, logo: ASSET_BASE + 'logo.png',
  team: { tomas: ASSET_BASE + 'team_tomas.jpg', daniel: ASSET_BASE + 'team_daniel.jpg', katarina: ASSET_BASE + 'team_katarina.jpg' } };

function buildOffer(o) {
  const area = roundArea(o.area_m2);
  const what = o.project_type_text ? o.project_type_text : TYPE_LABEL[o.project_type] || 'interiéru';
  const who = o.company || o.client_name;
  return { number: o.number, date: o.date, projectName: `Návrh ${what} ${area} m² – ${who}`, quote: quote({ need: o.need, m2: area }), flags: { structural: !!o.structural_change || !!o.new_build, heritage: !!o.heritage, newBuild: !!o.new_build } };
}

async function renderPdf(env, offer) {
  const body = JSON.stringify({ html: offerHTML(offer, ASSETS), pdfOptions: { format: 'a4', printBackground: true, preferCSSPageSize: true }, gotoOptions: { waitUntil: 'networkidle0', timeout: 20000 } });
  const errs = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const path of ['browser-rendering', 'browser-run']) {
      const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/${path}/pdf`, { method: 'POST', headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'content-type': 'application/json' }, body });
      if (r.ok && (r.headers.get('content-type') || '').includes('pdf')) return await r.arrayBuffer();
      errs.push(path + ' ' + r.status + ' ' + (await r.text()).slice(0, 300));
    }
    await new Promise((res) => setTimeout(res, 11000)); // free plán: 1 požiadavka / 10 s
  }
  throw new Error('PDF: ' + errs.join(' | '));
}

async function sendMail(env, { to, cc, subject, htmlBody, attachments, replyTo }) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'PORA', email: env.OWNER_EMAIL }, to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}), replyTo: { email: replyTo || env.OWNER_EMAIL }, subject, htmlContent: htmlBody, ...(attachments ? { attachment: attachments } : {}) }) });
  if (!r.ok) throw new Error('MAIL ' + r.status + ' ' + (await r.text()).slice(0, 300));
}

function clientEmail(o) {
  const en = o.language === 'en';
  return en
    ? `<p>Hello ${escH(o.client_name)},</p><p>thank you for your interest in PORA. Please find attached our <b>indicative price offer no. ${o.number}</b> (in Slovak) prepared from the information you provided.</p><p>Prices are excl. VAT and indicative – we will confirm the final offer after measuring the space on site. To order, simply reply with the subject “Záväzná objednávka” and the chosen variant. If you have any questions, just reply to this email or call +421 903 494 977.</p><p>PORA – interior design studio<br><a href="https://www.pora.sk">www.pora.sk</a></p>`
    : `<p>Dobrý deň, ${escH(o.client_name)},</p><p>ďakujeme za záujem o spoluprácu s PORA. V prílohe vám posielame <b>indikatívnu cenovú ponuku č. ${o.number}</b> vypracovanú podľa údajov, ktoré ste nám poskytli.</p><p>Ceny sú uvedené bez DPH a sú orientačné – finálnu ponuku potvrdíme po fyzickom zameraní priestoru. Ak sa rozhodnete pre niektorý z variantov, stačí odpovedať na tento e-mail s predmetom „Záväzná objednávka“ a uviesť zvolený variant. S akoukoľvek otázkou nám pokojne odpíšte alebo zavolajte na +421 903 494 977.</p><p>S pozdravom<br>PORA – interiérové štúdio<br><a href="https://www.pora.sk">www.pora.sk</a></p>`;
}

function ownerSummary(o, offer) {
  const rows = offer.quote.rows.map((r) => `<tr><td>${r.key}</td><td>${r.m2 ?? '-'}</td><td>${fmt(r.net)}</td><td>${fmt(r.gross)}</td></tr>`).join('');
  const f = (k, v) => v ? `<tr><td style="color:#666;padding-right:14px">${k}</td><td>${escH(v)}</td></tr>` : '';
  return `<table style="font:14px sans-serif">${f('Meno', o.client_name)}${f('E-mail', o.email)}${f('Telefón', o.phone)}${f('Firma', o.company)}${f('Priestor', (TYPE_LABEL[o.project_type] || '') + (o.project_type_text ? ' – ' + o.project_type_text : ''))}${f('Lokalita', o.location)}${f('Výmera', o.area_m2 + ' m² (v ponuke ' + roundArea(o.area_m2) + ' m²)')}${f('Potreba', NEED_LABEL[o.need])}${f('Novostavba', o.new_build ? 'ÁNO – odporučiť projekt stavby + inžiniersku činnosť (partner)' : '')}${f('Nosné konštrukcie', o.structural_change ? 'ÁNO' : 'nie')}${f('Pamiatková ochrana', o.heritage ? 'ÁNO' : 'nie')}${f('Začiatok', o.start)}${f('Expres (+50 %)', o.express ? 'ÁNO' : '')}${f('Rozpočet', o.budget)}${f('Poznámka', o.notes)}${f('Jazyk', o.language)}</table>
  <table style="font:14px sans-serif;border-collapse:collapse;margin-top:12px" border="1" cellpadding="6"><tr><th>Variant</th><th>m²</th><th>bez DPH</th><th>s DPH</th></tr>${rows}</table>`;
}

const BRIEF_SYS = `Si interný asistent interiérového štúdia PORA. Z rozhovoru klienta s webovým asistentom priprav stručný interný výcuc pre tím. Píš po slovensky, vecne a presne.
Použi presne tieto tri sekcie, každú s nadpisom na samostatnom riadku začínajúcim "## ":
## Zhrnutie
2 až 4 vety: kto je klient, aký priestor, čo chce a v akom rozsahu.
## Čo klient uviedol
Odrážky začínajúce "- ": všetky konkrétne fakty z rozhovoru (priestor, lokalita, výmera, miestnosti, počet osôb, stav priestoru, štýl a preferencie, požiadavky, obmedzenia, termín, rozpočet, údaje vyčítané z pôdorysu, ktoré asistent v rozhovore spomenul). Ak klient priložil súbory, uveď ich názvy.
## Čo si od klienta vyžiadať
Odrážky začínajúce "- ": konkrétne podklady a informácie, ktoré na začatie práce chýbajú a v rozhovore nezazneli (napr. pôdorys v DWG alebo PDF s kótami, fotografie súčasného stavu, svetlá výška, umiestnenie rozvodov a stúpačiek, inšpirácie, presný termín, fakturačné údaje).
Nevymýšľaj nič, čo v rozhovore nie je. Bez úvodu a záveru, bez tučného písma.`;

function mdLite(t) {
  let out = '', list = false;
  for (const raw of String(t || '').replace(/\*\*/g, '').split('\n')) {
    const l = raw.trim(); if (!l) continue;
    if (/^[-•*]\s+/.test(l)) { if (!list) { out += '<ul style="margin:4px 0 10px">'; list = true; } out += `<li>${escH(l.replace(/^[-•*]\s+/, ''))}</li>`; continue; }
    if (list) { out += '</ul>'; list = false; }
    if (/^#+\s*/.test(l)) out += `<h3 style="font:700 15px sans-serif;margin:16px 0 6px">${escH(l.replace(/^#+\s*/, ''))}</h3>`;
    else out += `<p style="margin:0 0 8px">${escH(l)}</p>`;
  }
  return out + (list ? '</ul>' : '');
}

const MAIL_EXT = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg' };
async function sendBrief(env, o, offer, transcript) {
  const msgs = (Array.isArray(transcript) ? transcript : []).filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
  const files = [], skipped = []; let total = 0;
  for (const m of msgs) {
    const a = m.att; if (m.role !== 'user' || !a || !a.data) continue;
    const ext = MAIL_EXT[a.type]; const size = a.data.length * 0.75;
    const base = String(a.name || 'priloha').replace(/\.[a-z0-9]+$/i, '').replace(/[^\w\-. ]+/g, '_').slice(0, 60) || 'priloha';
    if (ext && total + size <= 9e6) { files.push({ name: `${base}.${ext}`, content: a.data }); total += size; } else skipped.push(a.name || 'príloha');
  }
  const convo = msgs.map((m) => (m.role === 'user' ? 'Klient: ' : 'Asistent: ') + m.content + (m.att && m.att.name ? ` [príloha: ${m.att.name}]` : '')).join('\n\n');
  let brief = '';
  try {
    const facts = { meno: o.client_name, email: o.email, telefon: o.phone, firma: o.company, priestor: o.project_type_text || o.project_type, lokalita: o.location, vymera_m2: o.area_m2, novostavba: o.new_build, nosne: o.structural_change, pamiatka: o.heritage, zaciatok: o.start, expres: o.express, rozpocet: o.budget, poznamka: o.notes };
    const res = await anthropic(env, { model: MODEL, max_tokens: 1500, thinking: { type: 'between_tools' }, output_config: { effort: 'low' }, system: BRIEF_SYS,
      messages: [{ role: 'user', content: `Údaje odoslané do ponuky: ${JSON.stringify(facts)}\n\nRozhovor:\n${convo.slice(-60000)}` }] });
    brief = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  } catch (_) { brief = ''; }
  const who = o.company || o.client_name;
  const chatHtml = msgs.map((m) => `<p style="margin:0 0 10px"><b style="color:${m.role === 'user' ? '#111' : '#777'}">${m.role === 'user' ? 'Klient' : 'Asistent'}:</b> ${escH(m.content).replace(/\n/g, '<br>')}${m.att && m.att.name ? ` <i style="color:#777">[príloha: ${escH(m.att.name)}]</i>` : ''}</p>`).join('');
  const body = `<div style="font:14px/1.5 sans-serif;max-width:760px">
    <p style="font:15px sans-serif">Interný výcuc z chatu k cenovej ponuke č. <b>${escH(o.number)}</b>. Odpoveď na tento e-mail ide priamo klientovi (${escH(o.email)}).</p>
    ${brief ? mdLite(brief) : '<p><i>Automatické zhrnutie sa nepodarilo vytvoriť, nižšie je celý rozhovor.</i></p>'}
    <h3 style="font:700 15px sans-serif;margin:18px 0 6px">Údaje v ponuke</h3>${ownerSummary(o, offer)}
    <h3 style="font:700 15px sans-serif;margin:22px 0 6px">Prílohy od klienta</h3><p>${files.length ? files.map((f) => escH(f.name)).join(', ') + ' (v prílohe tohto e-mailu)' : 'žiadne'}${skipped.length ? '<br>Nepriložené (veľkosť alebo formát): ' + skipped.map(escH).join(', ') : ''}</p>
    <h3 style="font:700 15px sans-serif;margin:22px 0 6px">Celý rozhovor</h3><div style="border-left:3px solid #D1FF05;padding-left:12px">${chatHtml || '<p>—</p>'}</div></div>`;
  const mail = { to: env.OWNER_EMAIL, replyTo: o.email, subject: `[Dopyt] CP ${o.number} – ${who}, ${roundArea(o.area_m2)} m² – výcuc z chatu a podklady`, htmlBody: body };
  try { await sendMail(env, { ...mail, ...(files.length ? { attachments: files } : {}) }); }
  catch (e) { if (!files.length) throw e; await sendMail(env, { ...mail, htmlBody: body + '<p style="color:#b00">Prílohy klienta sa nepodarilo pripojiť k e-mailu.</p>' }); }
}

async function processOffer(env, o, origin) {
  o.number = o.number || offerNumber(); o.date = new Date().toISOString();
  const offer = buildOffer(o);
  const pdf = b64(await renderPdf(env, offer));
  const att = [{ name: `PORA_cenova_ponuka_${o.number}.pdf`, content: pdf }];
  const auto = String(env.AUTO_SEND).toLowerCase() === 'true' && !offer.quote.needsApproval;
  if (auto) {
    await sendMail(env, { to: o.email, cc: env.OWNER_EMAIL, subject: `Cenová ponuka PORA č. ${o.number}`, htmlBody: clientEmail(o), attachments: att });
    return 'sent';
  }
  const token = await sign(env, { o, exp: Date.now() + 30 * 864e5 });
  const link = `${origin}/approve?t=${token}`;
  await sendMail(env, { to: env.OWNER_EMAIL, replyTo: o.email, subject: `[Na schválenie] CP ${o.number} – ${o.company || o.client_name}, ${roundArea(o.area_m2)} m²`,
    htmlBody: `<p style="font:15px sans-serif">Asistent na webe pripravil novú indikatívnu ponuku. PDF je v prílohe.${offer.quote.needsApproval ? '<br><b>Pozor: výmera nad 400 m² – Realizácia je „individuálne“, klientovi ju najprv nacenite.</b>' : ''}</p>${ownerSummary(o, offer)}
    <p style="font:15px sans-serif;margin-top:18px"><a href="${link}" style="background:#D1FF05;color:#111;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Skontrolovať a odoslať klientovi →</a></p>
    <p style="font:13px sans-serif;color:#666">Ak ponuku chcete upraviť, neodosielajte ju cez tlačidlo – odpovedzte klientovi priamo (odpoveď na tento e-mail ide klientovi).</p>`, attachments: att });
  return 'pending';
}

async function runTool(env, name, input, ctx) {
  if (name === 'calculate_quote') {
    const q = quote({ need: input.need, m2: input.area_m2 });
    return { area_m2_rounded: q.area, prices_excl_vat: q.rows.map((r) => ({ variant: r.key, eur_bez_dph: r.net ?? 'individuálne', eur_s_dph: r.gross ?? 'individuálne' })), note: 'Ceny bez DPH, indikatívne, upresnenie po zameraní.' };
  }
  if (name === 'submit_offer') {
    if (!input.gdpr_consent) return { error: 'Chýba súhlas so spracovaním osobných údajov.' };
    if (!isEmail(input.email)) return { error: 'Neplatný e-mail.' };
    if (!(input.area_m2 > 0)) return { error: 'Chýba výmera.' };
    if (ctx.submitted) return { status: 'Ponuka z tohto rozhovoru je už prijatá. Neodosielaj znova.' };
    const data = { ...input }; delete data.number; delete data.date;
    const autoNow = String(env.AUTO_SEND).toLowerCase() === 'true' && !quote({ need: data.need, m2: data.area_m2 }).needsApproval;
    ctx.submitted = autoNow ? 'sent' : 'pending';
    data.number = offerNumber();
    ctx.wait(sendBrief(env, data, buildOffer(data), ctx.transcript).catch(() => {}));
    ctx.wait(processOffer(env, data, ctx.origin).catch((e) => notifyOwner(env, 'Ponuku treba poslať ručne – ' + (data.company || data.client_name), `<p style="font:15px sans-serif">Automatické vytvorenie PDF alebo odoslanie zlyhalo. Klient videl potvrdenie, že ponuka príde e-mailom – pošlite ju prosím ručne.</p><pre>${escH(String(e))}</pre>${ownerSummary(data, buildOffer({ ...data, number: '-', date: '' }))}`)));
    return { status: autoNow ? 'Prijaté. Indikatívna ponuka v PDF príde klientovi na e-mail o pár minút.' : 'Prijaté. Indikatívna ponuka príde klientovi e-mailom spravidla do jedného pracovného dňa (štúdio ju ešte individuálne nacení).' };
  }
  return { error: 'unknown tool' };
}

async function notifyOwner(env, subject, body) { try { await sendMail(env, { to: env.OWNER_EMAIL, subject: '[Asistent PORA] ' + subject, htmlBody: body }); } catch (_) {} }

async function anthropic(env, payload) {
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json(); if (!r.ok) { const e = new Error(j?.error?.message || ('HTTP ' + r.status)); e.status = r.status; throw e; } return j;
}

async function chat(req, env, url, ectx) {
  const c = cors(req); if (!c['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403);
  let body; try { body = await req.json(); } catch (_) { return json({ error: 'bad json' }, 400, c); }
  const hist = (Array.isArray(body.messages) ? body.messages : []).slice(-MAX_TURNS)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => { const o = { role: m.role, content: m.content.slice(0, 3000) }; const a = m.att;
      if (m.role === 'user' && a && a.data && /^(application\/pdf|image\/(png|jpeg|webp))$/.test(a.type) && a.data.length * 0.75 <= MAX_ATTACH)
        o.content = [a.type === 'application/pdf' ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.data } } : { type: 'image', source: { type: 'base64', media_type: a.type, data: a.data } }, { type: 'text', text: o.content + `\n[Klient priložil súbor: ${String(a.name || '').slice(0, 80)}]` }];
      return o; });
  if (!hist.length || hist[hist.length - 1].role !== 'user') return json({ error: 'empty' }, 400, c);
  while (hist[0] && hist[0].role !== 'user') hist.shift();
  // cache: posledný blok so súborom (aby sa pôdorys neplatil v každom kroku naplno)
  for (let i = hist.length - 1; i >= 0; i--) { if (Array.isArray(hist[i].content)) { hist[i].content[0].cache_control = { type: 'ephemeral' }; break; } }
  const ctx = { origin: url.origin, submitted: body.submitted ? 'pending' : null, wait: (p) => ectx.waitUntil(p), transcript: Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [] };
  const messages = hist; let text = '';
  try {
    for (let i = 0; i < 5; i++) {
      const res = await anthropic(env, { model: MODEL, max_tokens: 3000, thinking: { type: 'between_tools' }, output_config: { effort: 'medium' }, system: [{ type: 'text', text: SYSTEM_SK, cache_control: { type: 'ephemeral' } }], tools: TOOLS, messages });
      text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
      if (res.stop_reason === 'tool_use') text = '';
      if (res.stop_reason !== 'tool_use') break;
      messages.push({ role: 'assistant', content: res.content });
      const results = [];
      for (const b of res.content.filter((b) => b.type === 'tool_use')) results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(await runTool(env, b.name, b.input, ctx)) });
      messages.push({ role: 'user', content: results });
    }
  } catch (e) {
    if (/credit|balance|billing/i.test(String(e.message))) {
      const k = new Request('https://pora-asistent/flag/credit'); const cache = caches.default;
      if (!(await cache.match(k))) { await notifyOwner(env, 'Minul sa kredit Claude API', '<p>Asistent na webe nefunguje – dobite kredit na <a href="https://platform.claude.com/settings/billing">platform.claude.com</a>.</p>'); await cache.put(k, new Response('1', { headers: { 'cache-control': 'max-age=43200' } })); }
    }
    return json({ error: 'unavailable' }, 503, c);
  }
  text = text.replace(/\*\*|__|^#+\s*/gm, '').replace(/^\s*[-•*]\s+/gm, '').replace(/\s[–—]\s/g, ', ').trim();
  if (!text) text = ctx.submitted ? (body.lang === 'en' ? (ctx.submitted === 'sent' ? 'Thank you. Your indicative quote will arrive by email in a few minutes.' : 'Thank you. Your indicative quote will arrive by email, usually within one business day.') : (ctx.submitted === 'sent' ? 'Ďakujeme. Indikatívna cenová ponuka vám príde e-mailom o pár minút.' : 'Ďakujeme. Indikatívna cenová ponuka vám príde e-mailom, spravidla do jedného pracovného dňa.')) : '…';
  return json({ reply: text, submitted: ctx.submitted }, 200, c);
}

async function approve(req, env, url) {
  const t = url.searchParams.get('t') || (req.method === 'POST' ? (await req.formData()).get('t') : '');
  const p = await verify(env, t);
  const page = (inner) => html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PORA – schválenie ponuky</title><body style="font:16px/1.5 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px">${inner}</body>`);
  if (!p) return page('<h2>Odkaz je neplatný alebo vypršal.</h2>');
  const o = p.o;
  if (req.method === 'GET') {
    const offer = buildOffer(o);
    return page(`<h2>Cenová ponuka ${escH(o.number)}</h2>${ownerSummary(o, offer)}<p>Klient dostane PDF ponuku (rovnakú ako v prílohe e-mailu) na <b>${escH(o.email)}</b>, kópia príde na ${escH(env.OWNER_EMAIL)}.</p><form method="post"><input type="hidden" name="t" value="${escH(t)}"><button style="font:700 16px sans-serif;background:#D1FF05;border:0;border-radius:999px;padding:14px 22px;cursor:pointer">Odoslať klientovi</button></form>`);
  }
  const key = new Request('https://pora-asistent/sent/' + o.number + '/' + o.email); const cache = caches.default;
  if (await cache.match(key)) return page('<h2>Táto ponuka už bola odoslaná.</h2>');
  const offer = buildOffer(o);
  const pdf = b64(await renderPdf(env, offer));
  await sendMail(env, { to: o.email, cc: env.OWNER_EMAIL, subject: `Cenová ponuka PORA č. ${o.number}`, htmlBody: clientEmail(o), attachments: [{ name: `PORA_cenova_ponuka_${o.number}.pdf`, content: pdf }] });
  await cache.put(key, new Response('1', { headers: { 'cache-control': 'max-age=2592000' } }));
  return page(`<h2>Odoslané ✓</h2><p>Ponuka ${escH(o.number)} odišla na ${escH(o.email)}.</p>`);
}

export default {
  async fetch(req, env, ectx) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    try {
      if (url.pathname === '/chat' && req.method === 'POST') return await chat(req, env, url, ectx);
      if (url.pathname === '/approve') return await approve(req, env, url);
      if (url.pathname === '/health') return json({ ok: true, model: MODEL, config: { anthropic: !!env.ANTHROPIC_API_KEY, brevo: !!env.BREVO_API_KEY, pdf: !!(env.CF_API_TOKEN && env.CF_ACCOUNT_ID), signing: !!env.SIGNING_SECRET, owner: env.OWNER_EMAIL || null, auto: env.AUTO_SEND || 'false' } });
      return json({ ok: true, service: 'PORA asistent' });
    } catch (e) { return json({ error: 'server', detail: String(e).slice(0, 300) }, 500, cors(req)); }
  },
};
