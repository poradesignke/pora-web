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

const XMAS = `VIANOČNÁ PONUKA (platí len do 31. 12. 2026): Od 1. 1. 2027 sa ceny zvyšujú – Balík Mini z 2 490 € na 2 990 € bez DPH a Variant 1 Design zo 4 990 € na 5 590 € bez DPH (príplatky za m² a Variant 2 Realizácia sa nemenia). Vianočný voucher PORA: kto urobí záväznú objednávku návrhu interiéru do 31. 12. 2026, má garantované ceny roku 2026, aj keď práce na návrhu začnú až v roku 2027. Voucher je vhodný aj ako darček, štúdio ho pošle e-mailom v PDF. Ak sa klient pýta na voucher alebo vianočnú ponuku, stručne to vysvetli, priprav mu bežnú cenovú ponuku za ceny roku 2026 a povedz, že o voucher požiada tlačidlom „Vianočný voucher“ na webe pora.sk (krátky formulár) alebo e-mailom na info@pora.sk; štúdio mu po potvrdení objednávky pošle voucher v PDF s jedinečným kódom, platný do 31. 3. 2027. Nesľubuj zľavu – nejde o zľavu, ale o zachovanie súčasných cien. Konzultácie v tejto ponuke nepropaguj. V cenových ponukách počítaj naďalej s cenami roku 2026.`;
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

async function renderPdf(env, offer) { return renderHtmlPdf(env, offerHTML(offer, ASSETS), { format: 'a4', printBackground: true, preferCSSPageSize: true }); }
async function renderHtmlPdf(env, pageHtml, pdfOptions) {
  const body = JSON.stringify({ html: pageHtml, pdfOptions, gotoOptions: { waitUntil: 'networkidle0', timeout: 20000 } });
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

// ── Strážca nákladov: odhad útraty (konzervatívne ceny v USD / 1M tokenov), denný strop, limit na IP, e-mail Tomovi ──
const PRICE = { in: 5, out: 25, cw: 6.25, cr: 0.5 };
const DAY_ALERT = 1;   // $ za deň → upozornenie e-mailom
const DAY_STOP = 3;     // $ za deň → asistent sa na zvyšok dňa vypne
const MONTH_ALERT = 8;                                 // $ za mesiac → upozornenie
const IP_HOUR = 30, IP_DAY = 80;                       // max. správ z jednej IP
const MAX_ATT_SENT = 2;                                // koľko príloh posielať modelu naraz
const ckey = (k) => new Request('https://pora-asistent/meter/' + k);
async function cget(k) { const r = await caches.default.match(ckey(k)); return r ? Number(await r.text()) || 0 : 0; }
async function cset(k, v, ttl) { await caches.default.put(ckey(k), new Response(String(v), { headers: { 'cache-control': 'max-age=' + ttl } })); }
const today = () => new Date().toISOString().slice(0, 10), month = () => today().slice(0, 7);
async function meter(env, u) {
  if (!u) return;
  const usd = ((u.input_tokens || 0) * PRICE.in + (u.output_tokens || 0) * PRICE.out + (u.cache_creation_input_tokens || 0) * PRICE.cw + (u.cache_read_input_tokens || 0) * PRICE.cr) / 1e6;
  const d = (await cget('d/' + today())) + usd, m = (await cget('m/' + month())) + usd;
  await cset('d/' + today(), d.toFixed(5), 172800); await cset('m/' + month(), m.toFixed(5), 3456000);
  const alert = async (flag, subj, txt) => { if (await cget('f/' + flag)) return; await cset('f/' + flag, 1, flag.startsWith('m') ? 3456000 : 172800);
    await notifyOwner(env, subj, `<p style="font:15px sans-serif">${txt}</p><p style="font:15px sans-serif">Odhad útraty dnes: <b>$${d.toFixed(2)}</b>, tento mesiac: <b>$${m.toFixed(2)}</b> (konzervatívny odhad, skutočnosť je skôr nižšia).<br>Skutočný stav kreditu: <a href="https://platform.claude.com/settings/billing">platform.claude.com → Billing</a>.</p>`); };
  if (d >= DAY_STOP) await alert('ds/' + today(), 'Denný strop dosiahnutý – asistent pozastavený do polnoci', `Asistent dnes minul viac ako $${DAY_STOP}. Do konca dňa (UTC) neodpovedá, web ukáže klientom náhradný formulár. Ak to nie je bežná návštevnosť, môže ísť o zneužitie.`);
  else if (d >= DAY_ALERT) await alert('da/' + today(), 'Vyššia útrata dnes', `Asistent dnes minul viac ako $${DAY_ALERT} – viac ako bežne. Pri $${DAY_STOP} sa sám vypne do polnoci.`);
  if (m >= MONTH_ALERT) await alert('ma/' + month(), 'Mesačná útrata prekročila $' + MONTH_ALERT, `Za mesiac ${month()} asistent minul viac ako $${MONTH_ALERT}. Skontrolujte kredit.`);
}
async function guard(req) {
  if (await cget('d/' + today()) >= DAY_STOP) return 'day';
  const ip = req.headers.get('CF-Connecting-IP') || 'x', h = new Date().toISOString().slice(0, 13);
  const a = (await cget('ih/' + ip + '/' + h)) + 1, b = (await cget('id/' + ip + '/' + today())) + 1;
  await cset('ih/' + ip + '/' + h, a, 3700); await cset('id/' + ip + '/' + today(), b, 90000);
  return a > IP_HOUR || b > IP_DAY ? 'ip' : null;
}

async function anthropic(env, payload) {
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json(); if (!r.ok) { const e = new Error(j?.error?.message || ('HTTP ' + r.status)); e.status = r.status; throw e; }
  try { await meter(env, j.usage); } catch (_) {}
  return j;
}


// ── Vianočný voucher 2026: dopyt z webu → e-mail štúdiu s tlačidlom → po potvrdení PDF voucher klientovi → QR overenie ──
const V_UNTIL = '2027-03-31', V_UNTIL_SK = '31. 3. 2027', V_END = Date.parse('2027-04-01T00:00:00+02:00');
const V_PACKS = { design: { name: 'Design', desc: 'Návrh interiéru do 100 m²', price: '4 990 €' }, mini: { name: 'Mini', desc: 'Návrh interiéru do 20 m²', price: '2 490 €' } };
const vPage = (title, inner) => html(`<!doctype html><html lang="sk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escH(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=DM+Sans:wght@400;500;700&display=swap"><body style="margin:0;background:#EFEDE8;color:#111113;font:16px/1.5 'DM Sans',system-ui,sans-serif"><div style="max-width:560px;margin:0 auto;padding:28px 18px 48px"><a href="https://www.pora.sk/"><img src="https://www.pora.sk/img/logo-coral.png" alt="PORA" style="height:34px"></a>${inner}</div></body></html>`);
const vH = (t) => `<h1 style="font:900 44px/.95 'Big Shoulders Display','Arial Narrow',sans-serif;text-transform:uppercase;margin:22px 0 12px">${t}</h1>`;
const vBtn = 'display:inline-block;font:900 20px/1 \'Big Shoulders Display\',\'Arial Narrow\',sans-serif;letter-spacing:.04em;text-transform:uppercase;background:#D1FF05;color:#111113;border:2px solid #111113;border-radius:999px;padding:15px 24px;text-decoration:none;cursor:pointer';
const vRow = (k, v) => `<tr><td style="padding:7px 16px 7px 0;color:#5A575F;vertical-align:top">${escH(k)}</td><td style="padding:7px 0"><b>${escH(v)}</b></td></tr>`;
async function vVerify(env, t) { const [p, sg] = String(t || '').split('.'); if (!p || !sg || sg !== await hmac(env.SIGNING_SECRET, p)) return null; try { const o = JSON.parse(unb64url(p)); return o && o.k === 'pv27' ? { o, sg } : null; } catch (_) { return null; } }
const vCode = (sg) => { const c = sg.toUpperCase().replace(/[^A-Z0-9]/g, 'X'); return 'PV27-' + c.slice(0, 4) + '-' + c.slice(4, 8); };

// 1) dopyt z formulára na webe
async function voucherRequest(req, env, url) {
  const c = cors(req); if (!c['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403);
  let b; try { b = await req.json(); } catch (_) { return json({ error: 'bad json' }, 400, c); }
  const ip = req.headers.get('CF-Connecting-IP') || 'x', k = 'lead/' + ip + '/' + today(), n = (await cget(k)) + 1;
  await cset(k, n, 90000); if (n > 10) return json({ error: 'rate' }, 429, c);
  const f = (b && typeof b.fields === 'object' && b.fields) || {}, S = (x, m) => String(x ?? '').trim().slice(0, m);
  const r = { name: S(f.meno, 80), email: S(f.email, 200), phone: S(f.telefon, 40), pack: /mini/i.test(S(f.balik, 60)) ? 'mini' : /design/i.test(S(f.balik, 60)) ? 'design' : '', gift: /^(áno|ano|yes|true)$/i.test(S(f.darcek, 10)), note: S(f.poznamka, 1500), lang: S(f.jazyk, 2) === 'en' ? 'en' : 'sk' };
  if (!r.name || !isEmail(r.email)) return json({ error: 'email' }, 400, c);
  const t = await sign(env, { exp: Date.now() + 45 * 864e5, vr: r });
  const link = url.origin + '/voucher/issue?t=' + encodeURIComponent(t);
  try {
    await sendMail(env, { to: env.OWNER_EMAIL, replyTo: r.email, subject: 'VIANOČNÝ VOUCHER – dopyt z webu (' + r.name + ')',
      htmlBody: `<div style="font:15px/1.5 Arial,sans-serif"><p>Nový záujem o vianočný voucher. Odpoveďou na tento e-mail píšete priamo klientovi.</p><table style="border-collapse:collapse">${vRow('Meno', r.name)}${vRow('E-mail', r.email)}${vRow('Telefón', r.phone || '–')}${vRow('Balík', r.pack ? V_PACKS[r.pack].name + ' – ' + V_PACKS[r.pack].price + ' bez DPH' : 'ešte nevie, poradiť')}${vRow('Darček', r.gift ? 'áno, voucher na meno obdarovaného' : 'nie')}${vRow('Poznámka', r.note || '–')}</table><p style="margin:22px 0"><a href="${escH(link)}" style="${vBtn}">Vystaviť a poslať voucher →</a></p><p style="color:#666">Tlačidlo otvorí stránku, kde skontrolujete meno a balík. Voucher v PDF potom odíde klientovi a kópia vám. Odkaz platí 45 dní.</p></div>` });
  } catch (e) { return json({ error: 'mail' }, 502, c); }
  return json({ success: true }, 200, c);
}

// 2) potvrdenie štúdiom → vystavenie a odoslanie PDF
async function voucherIssue(req, env, url) {
  let fd = null; if (req.method === 'POST') fd = await req.formData();
  const t = url.searchParams.get('t') || (fd ? fd.get('t') : '');
  const p = await verify(env, t);
  if (!p || !p.vr) return vPage('PORA – voucher', vH('Odkaz je neplatný alebo vypršal') + '<p>Požiadajte klienta o nový dopyt cez web.</p>');
  const r = p.vr, inp = 'width:100%;box-sizing:border-box;font:16px sans-serif;padding:11px 12px;border:1.5px solid #111113;border-radius:10px;margin:4px 0 14px;background:#fff';
  const key = new Request('https://pora-asistent/voucher/' + (await hmac(env.SIGNING_SECRET, String(t))).slice(0, 24)), cache = caches.default;
  if (req.method !== 'POST') {
    const done = await cache.match(key);
    return vPage('PORA – vystaviť voucher', vH('Vystaviť voucher') + (done ? '<p style="background:#fff;border:1.5px solid #111;border-radius:10px;padding:10px 12px"><b>Pozor:</b> z tohto dopytu už bol voucher odoslaný (' + escH(await done.text()) + '). Ďalším odoslaním vznikne nový voucher s iným kódom.</p>' : '') +
      `<table style="border-collapse:collapse;margin-bottom:16px">${vRow('Objednávateľ', r.name)}${vRow('E-mail', r.email)}${vRow('Telefón', r.phone || '–')}${vRow('Darček', r.gift ? 'áno' : 'nie')}${vRow('Poznámka', r.note || '–')}</table>
      <form method="post"><input type="hidden" name="t" value="${escH(t)}">
      <label>Meno na voucheri<input name="name" required maxlength="40" value="${escH(r.gift ? '' : r.name)}" placeholder="${r.gift ? 'meno obdarovaného' : ''}" style="${inp}"></label>
      <label>Darček od (nepovinné)<input name="from" maxlength="40" value="${escH(r.gift ? r.name : '')}" style="${inp}"></label>
      <label>Balík<select name="pack" style="${inp}"><option value="design"${r.pack !== 'mini' ? ' selected' : ''}>Design – 4 990 € bez DPH (do 100 m²)</option><option value="mini"${r.pack === 'mini' ? ' selected' : ''}>Mini – 2 490 € bez DPH (do 20 m²)</option></select></label>
      <p>Voucher v PDF odíde na <b>${escH(r.email)}</b>, kópia na ${escH(env.OWNER_EMAIL)}. Platnosť: do ${V_UNTIL_SK}.</p>
      <button style="${vBtn}">Vystaviť a poslať voucher →</button></form>`);
  }
  const name = String(fd.get('name') || '').trim().slice(0, 40), from = String(fd.get('from') || '').trim().slice(0, 40), pack = fd.get('pack') === 'mini' ? 'mini' : 'design';
  if (!name) return vPage('PORA – voucher', vH('Chýba meno na voucheri') + '<p>Vráťte sa späť a doplňte ho.</p>');
  const d = new Date(Date.now() + 3600e3), z = (x) => String(x).padStart(2, '0'), number = String(d.getUTCFullYear()).slice(2) + z(d.getUTCMonth() + 1) + z(d.getUTCDate()) + '-' + z(d.getUTCHours()) + z(d.getUTCMinutes());
  const vt = await sign(env, { k: 'pv27', n: name, g: from, p: pack, c: number, u: V_UNTIL }), sg = vt.split('.')[1], code = vCode(sg), vurl = url.origin + '/v?t=' + vt, P = V_PACKS[pack];
  let pdf;
  try { pdf = b64(await renderHtmlPdf(env, voucherHTML({ name, gift: from ? 'Darček od: ' + from : '', pack: P.name, packdesc: P.desc, price: P.price, code, number, url: vurl }), { printBackground: true, preferCSSPageSize: true, width: '200mm', height: '100mm' })); }
  catch (e) { return vPage('PORA – voucher', vH('PDF sa nepodarilo vytvoriť') + '<p>Skúste to prosím o minútu znova (tlačidlo Späť a odoslať ešte raz). Nič nebolo odoslané.</p><p style="color:#666;font-size:13px">' + escH(String(e.message || e).slice(0, 300)) + '</p>'); }
  const en = r.lang === 'en';
  await sendMail(env, { to: r.email, cc: env.OWNER_EMAIL, subject: (en ? 'Your PORA Christmas voucher ' : 'Váš vianočný voucher PORA ') + code,
    htmlBody: `<div style="font:15px/1.6 Arial,sans-serif;color:#111">${en
      ? `<p>Hello,</p><p>thank you for your order. Your PORA Christmas voucher is attached as a PDF. It guarantees the 2026 price of the ${P.name} package (${P.price} excl. VAT).</p><p><b>Voucher code:</b> ${code}<br><b>Valid until:</b> 31 March 2027</p><p>To use it, contact us by that date at info@pora.sk or +421 903 494 977 and send us the voucher code. You can check the voucher any time here: <a href="${escH(vurl)}">verify voucher</a>.</p><p>PORA s.r.o.</p>`
      : `<p>Dobrý deň,</p><p>ďakujeme za objednávku. V prílohe posielame vianočný voucher PORA v PDF. Garantuje cenu balíka ${P.name} z cenníka 2026 (${P.price} bez DPH).</p><p><b>Kód vouchera:</b> ${code}<br><b>Platnosť:</b> do ${V_UNTIL_SK}</p><p>Pri uplatnení sa nám do tohto dátumu ozvite na info@pora.sk alebo +421 903 494 977 a pošlite kód vouchera. Pravosť a platnosť si kedykoľvek overíte tu: <a href="${escH(vurl)}">overiť voucher</a>.</p><p>PORA s.r.o.</p>`}</div>`,
    attachments: [{ name: `PORA_vianocny_voucher_${code}.pdf`, content: pdf }] });
  await cache.put(key, new Response(code + ', ' + name, { headers: { 'cache-control': 'max-age=4000000' } }));
  return vPage('PORA – voucher odoslaný', vH('Voucher odoslaný ✓') + `<table style="border-collapse:collapse">${vRow('Kód', code)}${vRow('Číslo', number)}${vRow('Meno na voucheri', name)}${vRow('Balík', P.name + ' – ' + P.price + ' bez DPH')}${vRow('Odoslané na', r.email)}${vRow('Platí do', V_UNTIL_SK)}</table><p>Kópia s PDF prišla aj na ${escH(env.OWNER_EMAIL)}. Ten e-mail si uschovajte, slúži ako evidencia vystavených voucherov.</p>`);
}

// 3) QR overenie pravosti a platnosti
async function voucherCheck(req, env, url) {
  const v = await vVerify(env, url.searchParams.get('t'));
  if (!v) return vPage('PORA – overenie vouchera', vH('Tento voucher nepoznáme') + '<p style="background:#EF5A45;color:#fff;border-radius:12px;padding:12px 14px;font-weight:700">Kód nie je platný. Voucher nebol vystavený štúdiom PORA alebo bol upravený.</p><p>Ak si myslíte, že ide o omyl, napíšte nám na info@pora.sk.</p>');
  const o = v.o, code = vCode(v.sg), P = V_PACKS[o.p] || V_PACKS.design, ok = Date.now() < V_END;
  const parts = String(o.n || '').trim().split(/\s+/), shown = parts.length > 1 ? parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.' : parts[0] || '';
  const mail = 'mailto:info@pora.sk?subject=' + encodeURIComponent('Uplatnenie vianočného vouchera ' + code) + '&body=' + encodeURIComponent('Dobrý deň,\nchcem uplatniť vianočný voucher ' + code + '.\n\nMeno:\nTelefón:\nPriestor a mesto:\n');
  return vPage('PORA – overenie vouchera', vH(ok ? 'Pravý a platný' : 'Platnosť vypršala') +
    `<p style="background:${ok ? '#D1FF05' : '#EF5A45'};color:${ok ? '#111113' : '#fff'};border:2px solid #111113;border-radius:14px;padding:13px 15px;font-weight:700;margin:0 0 18px">${ok ? 'Voucher vystavilo štúdio PORA a je platný do ' + V_UNTIL_SK + '.' : 'Voucher je pravý, ale jeho platnosť skončila ' + V_UNTIL_SK + '. Platí aktuálny cenník.'}</p>
    <table style="border-collapse:collapse;margin-bottom:20px">${vRow('Kód vouchera', code)}${vRow('Číslo', o.c)}${vRow('Vystavený pre', shown)}${vRow('Balík', P.name + ' – ' + P.desc.toLowerCase())}${vRow('Garantovaná cena', P.price + ' bez DPH (cenník 2026)')}${vRow('Platí do', V_UNTIL_SK)}</table>
    ${ok ? `<p><a href="${escH(mail)}" style="${vBtn}">Chcem voucher uplatniť →</a></p><p style="color:#5A575F">Tlačidlo otvorí e-mail s vyplneným kódom. Môžete aj zavolať na +421 903 494 977 alebo napísať na info@pora.sk a poslať kód vouchera.</p>` : '<p>Radi vám pripravíme novú cenovú ponuku: <a href="https://www.pora.sk/#ponuka">pora.sk</a>.</p>'}
    <p style="color:#5A575F;font-size:14px;border-top:1px solid #CFCBC3;padding-top:14px;margin-top:22px">Voucher je na meno, dá sa uplatniť raz a nie je platobným prostriedkom. Úplné podmienky sú na zadnej strane vouchera. PORA s.r.o., IČO 53834691, Košice.</p>`);
}

// Dopyty z formulárov na webe (kontakt, vianočný voucher) → e-mail štúdiu cez Brevo
async function lead(req, env) {
  const c = cors(req); if (!c['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403);
  let b; try { b = await req.json(); } catch (_) { return json({ error: 'bad json' }, 400, c); }
  const ip = req.headers.get('CF-Connecting-IP') || 'x', k = 'lead/' + ip + '/' + today(), n = (await cget(k)) + 1;
  await cset(k, n, 90000); if (n > 10) return json({ error: 'rate' }, 429, c);
  const f = (b && typeof b.fields === 'object' && b.fields) || {}, email = String(f.email || '').trim().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'email' }, 400, c);
  const rows = Object.keys(f).slice(0, 12).map((x) => `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top">${escH(String(x).slice(0, 40))}</td><td style="padding:6px 0"><b>${escH(String(f[x] ?? '').slice(0, 3000)).replace(/\n/g, '<br>')}</b></td></tr>`).join('');
  try {
    await sendMail(env, { to: env.OWNER_EMAIL, replyTo: email, subject: String(b.subject || 'Dopyt z webu pora.sk').slice(0, 150),
      htmlBody: `<div style="font:15px/1.5 Arial,sans-serif"><p>Nový dopyt z webu pora.sk. Odpovedzte priamo na tento e-mail, odpoveď pôjde klientovi.</p><table style="border-collapse:collapse">${rows}</table></div>` });
  } catch (e) { return json({ error: 'mail' }, 502, c); }
  return json({ success: true }, 200, c);
}

async function chat(req, env, url, ectx) {
  const c = cors(req); if (!c['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403);
  let body; try { body = await req.json(); } catch (_) { return json({ error: 'bad json' }, 400, c); }
  const g = await guard(req); if (g) return json({ error: g === 'day' ? 'unavailable' : 'rate' }, g === 'day' ? 503 : 429, c);
  const hist = (Array.isArray(body.messages) ? body.messages : []).slice(-MAX_TURNS)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => { const o = { role: m.role, content: m.content.slice(0, 3000) }; const a = m.att;
      if (m.role === 'user' && a && a.data && /^(application\/pdf|image\/(png|jpeg|webp))$/.test(a.type) && a.data.length * 0.75 <= MAX_ATTACH)
        o.content = [a.type === 'application/pdf' ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.data } } : { type: 'image', source: { type: 'base64', media_type: a.type, data: a.data } }, { type: 'text', text: o.content + `\n[Klient priložil súbor: ${String(a.name || '').slice(0, 80)}]` }];
      return o; });
  // posielaj modelu len posledné MAX_ATT_SENT prílohy, staršie nahraď textovou poznámkou
  let nAtt = 0; for (let i = hist.length - 1; i >= 0; i--) if (Array.isArray(hist[i].content) && ++nAtt > MAX_ATT_SENT) hist[i].content = hist[i].content[1].text;
  if (!hist.length || hist[hist.length - 1].role !== 'user') return json({ error: 'empty' }, 400, c);
  while (hist[0] && hist[0].role !== 'user') hist.shift();
  // cache: posledný blok so súborom (aby sa pôdorys neplatil v každom kroku naplno)
  for (let i = hist.length - 1; i >= 0; i--) { if (Array.isArray(hist[i].content)) { hist[i].content[0].cache_control = { type: 'ephemeral' }; break; } }
  const ctx = { origin: url.origin, submitted: body.submitted ? 'pending' : null, wait: (p) => ectx.waitUntil(p), transcript: Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [] };
  const messages = hist; let text = '';
  try {
    for (let i = 0; i < 5; i++) {
      const res = await anthropic(env, { model: MODEL, max_tokens: 3000, thinking: { type: 'between_tools' }, output_config: { effort: 'medium' }, system: [{ type: 'text', text: SYSTEM_SK, cache_control: { type: 'ephemeral' } }, ...(Date.now() < Date.parse('2027-01-01T00:00:00+01:00') ? [{ type: 'text', text: XMAS }] : []), { type: 'text', text: body.lang === 'en' ? 'JAZYK: klient je na ANGLICKEJ verzii webu. Odpovedaj výhradne po anglicky – aj na krátke alebo nejednoznačné správy (ok, yes, thanks). Prepni na iný jazyk iba vtedy, keď klient napíše celú vetu v tom jazyku.' : 'JAZYK: klient je na SLOVENSKEJ verzii webu. Odpovedaj po slovensky – aj na krátke alebo nejednoznačné správy (ok, áno). Prepni na iný jazyk iba vtedy, keď klient napíše celú vetu v tom jazyku.' }], tools: TOOLS, messages });
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
      if (url.pathname === '/lead' && req.method === 'POST') return await lead(req, env);
      if (url.pathname === '/voucher' && req.method === 'POST') return await voucherRequest(req, env, url);
      if (url.pathname === '/voucher/issue') return await voucherIssue(req, env, url);
      if (url.pathname === '/v') return await voucherCheck(req, env, url);
      if (url.pathname === '/approve') return await approve(req, env, url);
      if (url.pathname === '/health') return json({ ok: true, build: '2026-11-16c', model: MODEL, spend: { today: Number((await cget('d/' + today())).toFixed(2)), month: Number((await cget('m/' + month())).toFixed(2)), stop: DAY_STOP }, config: { anthropic: !!env.ANTHROPIC_API_KEY, brevo: !!env.BREVO_API_KEY, pdf: !!(env.CF_API_TOKEN && env.CF_ACCOUNT_ID), signing: !!env.SIGNING_SECRET, owner: env.OWNER_EMAIL || null, auto: env.AUTO_SEND || 'false' } });
      return json({ ok: true, service: 'PORA asistent' });
    } catch (e) { return json({ error: 'server', detail: String(e).slice(0, 300) }, 500, cors(req)); }
  },
};
