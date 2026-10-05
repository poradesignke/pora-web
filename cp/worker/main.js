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
Tvoja úloha: odpovedať na otázky o štúdiu a hlavne zrozumiteľne previesť záujemcu k indikatívnej cenovej ponuke (CP), ktorú dostane e-mailom.

O PORA: interiérové štúdio z Košíc, pracuje osobne po Slovensku a online pre klientov kdekoľvek na svete. Byty, rodinné domy, kaviarne, bistrá, reštaurácie, bary, salóny, ambulancie, kancelárie. 80+ realizácií, z toho 20+ gastro a komerčných. Tím: Tomáš Potočiar (CEO, zakladateľ), Mgr. art. Daniel Csúz (Head of design), Mgr. art. Katarína Csúzová, ArtD. (designer).
Služby (ceny bez DPH): Balík Mini 2 490 € (len do 20 m²; dispozícia, vizualizácie max. 10 ks, materiály a produkty, 2 h konzultácií); Variant 1 „Design“ od 4 990 € (do 100 m²; zameranie, dispozícia, návrh interiéru, vizualizácie, výpis produktov, technická schéma, 3 h konzultácií); Variant 2 „Realizácia“ od 15 000 € (všetko z Variantu 1 + technická dokumentácia: podklady pre búracie a stavebné úpravy, jednoduchá schéma elektro a vody, výrobné podklady nábytku na mieru + autorský dozor); konzultácie 500 €/hod. Ceny nad 100 m² rastú podľa výmery – presnú sumu VŽDY zisti nástrojom calculate_quote, nikdy ju nepočítaj sám.

PRÁVNE A ZODPOVEDNOSTNÉ HRANICE – dodržiavaj bezpodmienečne:
- PORA NEROBÍ realizačný projekt ani projekt pre stavebné povolenie. Dodáva návrh interiéru a podklady k realizácii pre remeselníkov. Kompletnú projekciu domov a bytov vie zastrešiť partnerské projekčné štúdio (nacení individuálne).
- PORA robí autorský dozor (súlad realizácie s návrhom), NIE stavebný ani technický dozor. Nikdy netvrď opak.
- Pri zásahu do nosných konštrukcií alebo pamiatkovo chránenej budove/území upozorni, že treba projekt ASR a vyjadrenie statika, ktoré nacení partnerské projekčné štúdio – nie sú v cene.
- Stavebné práce, materiál, dovoz, profesné projekty nie sú v cene. Cestovné mimo Košíc 18 €/hod + 0,50 €/km.
- Termíny uvádzaj len orientačne (Mini 2–4 týždne, Design 8–12 týždňov, technická dokumentácia 4–6 týždňov) a vždy s tým, že závisia od súčinnosti klienta a dodávateľov. Nikdy nesľubuj konkrétny dátum dokončenia ani zľavu.
- Ponuka je indikatívna; finálnu cenu PORA potvrdí po fyzickom zameraní. Pri expresnom dodaní je príplatok 50 %.

AKO VIESŤ ROZHOVOR:
- Píš stručne a priateľsky, v jazyku klienta (slovensky, ak píše po anglicky, tak anglicky). Pýtaj sa naraz najviac 1–2 veci.
- Na ponuku potrebuješ: (1) meno, (2) e-mail, (3) telefón – nepovinný, (4) firmu – ak ide o komerčný priestor, (5) typ priestoru (byt, dom, gastro, kancelária, salón, iné), (6) lokalitu (mesto/krajina), (7) výmeru v m² – ak ju klient nevie, popros o pôdorys (PDF alebo fotku cez tlačidlo s kancelárskou sponkou) a výmeru z neho odčítaj; ak ju nevieš spoľahlivo určiť, opýtaj sa, (8) čo potrebuje: len konzultáciu / návrh / návrh a realizáciu (podklady + autorský dozor), (9) či sa plánuje zásah do nosných konštrukcií a či ide o pamiatkovo chránenú budovu, (10) kedy chce začať a či potrebuje expresné dodanie, (11) voliteľne orientačný rozpočet na realizáciu a poznámku.
- Keď poznáš výmeru a potrebu, môžeš orientačné ceny ukázať (cez calculate_quote, vždy „bez DPH“).
- Pred odoslaním krátko zhrň údaje a požiadaj o potvrdenie a o súhlas so spracovaním osobných údajov na účel vypracovania ponuky (zásady sú v pätičke webu). Až po výslovnom súhlase zavolaj submit_offer.
- Po odoslaní povedz, že indikatívna ponuka príde na zadaný e-mail čoskoro (zvyčajne v ten istý alebo nasledujúci pracovný deň) a že ju PORA upresní po zameraní.
- Neodpovedaj na témy nesúvisiace so štúdiom; nezadávaj ani nežiadaj citlivé údaje (rodné číslo, údaje o karte).`;

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
      structural_change: { type: 'boolean' }, heritage: { type: 'boolean' },
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
  return { number: o.number, date: o.date, projectName: `Návrh ${what} ${area} m² – ${who}`, quote: quote({ need: o.need, m2: area }), flags: { structural: !!o.structural_change, heritage: !!o.heritage } };
}

async function renderPdf(env, offer) {
  const body = JSON.stringify({ html: offerHTML(offer, ASSETS), pdfOptions: { format: 'a4', printBackground: true, preferCSSPageSize: true }, gotoOptions: { waitUntil: 'networkidle0', timeout: 45000 } });
  for (const path of ['browser-run', 'browser-rendering']) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/${path}/pdf`, { method: 'POST', headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'content-type': 'application/json' }, body });
    if (r.ok && (r.headers.get('content-type') || '').includes('pdf')) return await r.arrayBuffer();
    if (r.status !== 404) throw new Error('PDF ' + r.status + ' ' + (await r.text()).slice(0, 300));
  }
  throw new Error('PDF endpoint not found');
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
  return `<table style="font:14px sans-serif">${f('Meno', o.client_name)}${f('E-mail', o.email)}${f('Telefón', o.phone)}${f('Firma', o.company)}${f('Priestor', (TYPE_LABEL[o.project_type] || '') + (o.project_type_text ? ' – ' + o.project_type_text : ''))}${f('Lokalita', o.location)}${f('Výmera', o.area_m2 + ' m² (v ponuke ' + roundArea(o.area_m2) + ' m²)')}${f('Potreba', NEED_LABEL[o.need])}${f('Nosné konštrukcie', o.structural_change ? 'ÁNO' : 'nie')}${f('Pamiatková ochrana', o.heritage ? 'ÁNO' : 'nie')}${f('Začiatok', o.start)}${f('Expres (+50 %)', o.express ? 'ÁNO' : '')}${f('Rozpočet', o.budget)}${f('Poznámka', o.notes)}${f('Jazyk', o.language)}</table>
  <table style="font:14px sans-serif;border-collapse:collapse;margin-top:12px" border="1" cellpadding="6"><tr><th>Variant</th><th>m²</th><th>bez DPH</th><th>s DPH</th></tr>${rows}</table>`;
}

async function processOffer(env, o, origin) {
  o.number = offerNumber(); o.date = new Date().toISOString();
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
    if (ctx.submitted) return { error: 'Ponuka už bola v tomto rozhovore odoslaná.' };
    try { const st = await processOffer(env, input, ctx.origin); ctx.submitted = st; return { status: st === 'sent' ? 'odoslané klientovi' : 'prijaté – ponuka bude odoslaná po kontrole štúdiom' }; }
    catch (e) { ctx.error = String(e); await notifyOwner(env, 'Chyba pri vytváraní ponuky', `<pre>${escH(String(e))}</pre><pre>${escH(JSON.stringify(input, null, 1))}</pre>`); return { error: 'Technická chyba – štúdio údaje dostalo a ozve sa e-mailom.' }; }
  }
  return { error: 'unknown tool' };
}

async function notifyOwner(env, subject, body) { try { await sendMail(env, { to: env.OWNER_EMAIL, subject: '[Asistent PORA] ' + subject, htmlBody: body }); } catch (_) {} }

async function anthropic(env, payload) {
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json(); if (!r.ok) { const e = new Error(j?.error?.message || ('HTTP ' + r.status)); e.status = r.status; throw e; } return j;
}

async function chat(req, env, url) {
  const c = cors(req); if (!c['Access-Control-Allow-Origin']) return json({ error: 'origin' }, 403);
  let body; try { body = await req.json(); } catch (_) { return json({ error: 'bad json' }, 400, c); }
  const hist = (Array.isArray(body.messages) ? body.messages : []).slice(-MAX_TURNS)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }));
  if (!hist.length || hist[hist.length - 1].role !== 'user') return json({ error: 'empty' }, 400, c);
  while (hist[0] && hist[0].role !== 'user') hist.shift();
  const a = body.attachment;
  if (a && a.data && /^(application\/pdf|image\/(png|jpeg|webp))$/.test(a.type) && a.data.length * 0.75 <= MAX_ATTACH) {
    const last = hist[hist.length - 1];
    last.content = [a.type === 'application/pdf' ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.data } } : { type: 'image', source: { type: 'base64', media_type: a.type, data: a.data } }, { type: 'text', text: last.content + `\n[Klient priložil súbor: ${String(a.name || '').slice(0, 80)}]` }];
  }
  const ctx = { origin: url.origin, submitted: null };
  const messages = hist; let text = '';
  try {
    for (let i = 0; i < 5; i++) {
      const res = await anthropic(env, { model: MODEL, max_tokens: 900, system: [{ type: 'text', text: SYSTEM_SK, cache_control: { type: 'ephemeral' } }], tools: TOOLS, messages });
      text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
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
  return json({ reply: text || '…', submitted: ctx.submitted }, 200, c);
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
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    try {
      if (url.pathname === '/chat' && req.method === 'POST') return await chat(req, env, url);
      if (url.pathname === '/approve') return await approve(req, env, url);
      if (url.pathname === '/health') return json({ ok: true, model: MODEL, config: { anthropic: !!env.ANTHROPIC_API_KEY, brevo: !!env.BREVO_API_KEY, pdf: !!(env.CF_API_TOKEN && env.CF_ACCOUNT_ID), signing: !!env.SIGNING_SECRET, owner: env.OWNER_EMAIL || null, auto: env.AUTO_SEND || 'false' } });
      return json({ ok: true, service: 'PORA asistent' });
    } catch (e) { return json({ error: 'server', detail: String(e).slice(0, 300) }, 500, cors(req)); }
  },
};
