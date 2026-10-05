// AUTO-GENERATED from pricing.js + offer.js + worker/main.js – 2026-10-05T18:43:41.254Z
// PORA – pravidlá cenotvorby (ceny bez DPH). Rovnaké pre bývanie, gastro aj komerciu.
// Zdroj: Tom, 5. 10. 2026.
const VAT = 0.23;

const roundArea = (m2) => Math.round(Number(m2)); // 205,4 -> 205 ; 205,5 -> 206

function priceMini(m2) {
  return roundArea(m2) <= 20 ? 2490 : null; // nad 20 m² sa Mini neponúka
}

function priceDesign(m2) {
  const a = roundArea(m2);
  let p = 4990;                                   // do 100 m²
  if (a > 100) p += (Math.min(a, 200) - 100) * 25; // 101–200 m²: +25 €/m²
  if (a > 200) p += (a - 200) * 10;                // nad 200 m²: +10 €/m²
  return p;
}

function priceRealizacia(m2) {
  const a = roundArea(m2);
  if (a <= 250) return 15000;
  if (a <= 400) return 20000;
  return null;                                     // nad 400 m²: individuálne (schvaľuje Tom)
}

const PRICE_KONZULTACIA = 500;              // €/hod

// Ktoré varianty patria do ponuky podľa požiadavky klienta.
// need: 'navrh_realizacia' | 'navrh' | 'konzultacia'
function pickVariants(need, m2) {
  const a = roundArea(m2);
  const v = [];
  if (a <= 20) v.push('mini');
  v.push('design', 'realizacia');
  if (need === 'konzultacia') v.unshift('konzultacia');
  return v;
}

function quote({ need, m2, consultHours = 1 }) {
  const a = roundArea(m2);
  const rows = pickVariants(need, a).map((k) => {
    const net = k === 'mini' ? priceMini(a)
      : k === 'design' ? priceDesign(a)
      : k === 'realizacia' ? priceRealizacia(a)
      : PRICE_KONZULTACIA * consultHours;
    return { key: k, m2: k === 'konzultacia' ? null : a, net, gross: net == null ? null : Math.round(net * (1 + VAT) * 100) / 100 };
  });
  const needsApproval = rows.some((r) => r.net == null);
  return { area: a, rows, needsApproval };
}

// PORA – HTML šablóna cenovej ponuky (A4), podľa Canva „CP TEMPLATE“.
// offerHTML(data, A) -> kompletné HTML; A = { fonts:{heebo,lekton,lektonBold}, logo, team:{tomas,daniel,katarina} } ako data: URI
const MONTHS = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const eur = (n) => n == null ? 'individuálne' : n.toLocaleString('sk-SK', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).replace(/ /g, ' ') + ' €';

const VARIANT = {
  mini: { label: 'Balík MINI', sub: '', title: 'BALÍK MINI', time: '2 - 4 týždne', steps: [
    ['Dispozičné riešenie', 'Návrh funkčného usporiadania priestoru podľa potrieb klienta.', true],
    ['Návrh interiéru', 'Koncepcia priestoru, materiálov, farebnosti, atmosféry a dizajnových riešení.'],
    ['Vizualizácie', 'Fotorealistické zobrazenie návrhu (max. 10 ks).'],
    ['Výpis produktov', 'Prehľad prvkov a produktov použitých v návrhu.'],
    ['Konzultácie', 'Konzultácie v rozsahu 2 hodín.']] },
  design: { label: 'VARIANT 1', sub: 'Design', title: 'VARIANT 1 - DESIGN', time: '8 - 12 týždňov', steps: [
    ['Zameranie priestorov', 'Presné zameranie existujúceho stavu ako podklad pre návrh.'],
    ['Dispozičné riešenie', 'Návrh funkčného usporiadania priestoru podľa potrieb klienta.', true],
    ['Návrh interiéru', 'Koncepcia priestoru, materiálov, farebnosti, atmosféry a dizajnových riešení.'],
    ['Vizualizácie', 'Fotorealistické zobrazenie návrhu.'],
    ['Výpis produktov', 'Prehľad prvkov s orientačnou cenovou kalkuláciou materiálov a zariadenia.'],
    ['Technická schéma', 'Podklady pre realizáciu návrhu.'],
    ['Konzultácie', 'Konzultácie v rozsahu 3 hodín.']] },
  realizacia: { label: 'VARIANT 2', sub: 'Realizácia', title: 'VARIANT 2 - REALIZÁCIA', groups: [
    ['Design', '8 - 12 týždňov', [['', 'Zahŕňa všetky výstupy Variantu 1.']]],
    ['Technická dokumentácia', '4 - 6 týždňov', [
      ['Podklady pre búracie a stavebné úpravy', 'Výkresy úprav priestoru podľa schváleného návrhu.'],
      ['Inštalácie', 'Jednoduchá schéma elektro a vodoinštalácie.'],
      ['Výrobný podklad', 'Podklady pre výrobu nábytku a iných produktov na mieru.']]],
    ['Autorský dozor', 'individuálne - v závislosti od náročnosti a rozsahu projektu', [
      ['Autorský dozor', 'Dohľad nad súladom realizácie s návrhom (nejde o stavebný dozor).', true],
      ['Výjazdy a kontrolné dni', 'Kontrola súladu realizácie s návrhom na mieste.'],
      ['Finálne vzorkovanie', 'Výber materiálov a detailov pred realizáciou.'],
      ['Nákup produktov a materiálov', 'Súčinnosť pri objednávkach podľa návrhu.'],
      ['Súčinnosť s dodávateľmi', 'Komunikácia s remeselníkmi a dodávateľmi v rozsahu autorského dozoru.'],
      ['Skladovanie', 'Možnosť uskladnenia v prípade voľných kapacít.']]]] },
  konzultacia: { label: 'KONZULTÁCIA', sub: '', title: 'KONZULTÁCIA', time: '1 hodina', steps: [
    ['Konzultácia', 'Rozhovor s interiérovým dizajnérom.'],
    ['Posúdenie nápadov', 'Odborná spätná väzba k vášmu projektu.', true],
    ['Odborné odporúčanie', 'Pomoc s výberom materiálov, zariaďovacích prvkov a osvetlenia.'],
    ['Ergonómia', 'Odporúčané rozmery, výšky, umiestnenie prvkov a praktické riešenia.'],
    ['Dodávatelia', 'Kontakty a skúsenosti, ktoré šetria čas aj náklady.']] },
};

function timeline(steps) {
  const rows = [];
  for (let i = 0; i < steps.length; i += 4) rows.push(steps.slice(i, i + 4));
  return rows.map((r) => `<div class="tl" style="--n:${r.length}"><div class="line"></div>${r.map(([h, t, g]) =>
    `<div class="st${g ? ' g' : ''}"><i></i>${h ? `<b>${esc(h)}</b>` : ''}<p>${esc(t)}</p></div>`).join('')}</div>`).join('');
}

const foot = (n, A) => `<div class="foot"><img src="${A.logo}" alt="PORA"><span>PORA | Strana ${n}</span></div>`;

function offerHTML(d, A) {
  const date = d.date ? new Date(d.date) : new Date();
  const month = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  const pages = [];
  // 1 titulka
  pages.push(`<section class="pg cover"><div class="top"><img class="lg" src="${A.logo}" alt="PORA"><span class="mo">${month}</span></div>
  <h1>Cenová<br>ponuka</h1>
  <div class="cb"><div><p>Vyhotovil:<br>PORA s.r.o.</p><p>Ponuka č.:<br>${esc(d.number)}</p></div>
  <div class="r"><p>pora.sk<br>info@pora.sk<br>+421 903 494 977<br>Československej armády 1,<br>040 01 Košice</p></div></div></section>`);
  // 2 tím
  const T = [['TOMÁŠ POTOČIAR', 'CEO', A.team.tomas, 'Zakladateľ spoločnosti. Určuje strategické smerovanie firmy, vedie realizácie a dohliada na kvalitu projektov vrátane autorského dozoru.', true],
    ['MGR. ART. DANIEL CSÚZ', 'HEAD OF DESIGN', A.team.daniel, 'Zastrešuje riadenie projektov na úrovni dizajnovej sekcie. Riadi komunikáciu s klientom, tvorbu konceptov a celkové smerovanie dizajnu.'],
    ['MGR. ART. KATARÍNA CSÚZOVÁ, ART.D', 'DESIGNER', A.team.katarina, 'Navrhuje interiéry v celom rozsahu až po spracovanie technickej dokumentácie. Spolupracuje na vývoji projektov v rámci dizajnérskeho tímu.']];
  pages.push(`<section class="pg team"><div class="hd"><h2>TÍM</h2><img class="lg sm" src="${A.logo}" alt="PORA"></div>
  <div class="tm">${T.map(([n, r, img, t, g]) => `<div><b class="${g ? 'gr' : ''}">${n}</b><small class="${g ? 'gr' : ''}">${r}</small><img src="${img}" alt="${n}"><p>${t}</p></div>`).join('')}</div>
  <div class="appr"><p><b>Náš prístup:</b> Pracujeme s konceptom, ktorý presahuje bežný rámec interiéru.</p><p>Hľadáme napätie, kontrast a moment prekvapenia, ktorý dáva priestoru vlastnú identitu.</p></div>
  <div class="foot nolg"><span>PORA | Strana 2</span></div></section>`);
  // 3 ceny
  const q = d.quote;
  pages.push(`<section class="pg"><h2>CENY SLUŽIEB</h2><h3>NÁZOV PROJEKTU:</h3><p class="pn">${esc(d.projectName)}</p>
  <h4>PREHĽAD PONÚKANÝCH SLUŽIEB</h4>
  <table><thead><tr><th>SLUŽBA</th><th>m²</th><th>Cena celkom (bez DPH)</th><th>Cena celkom (s DPH)</th></tr></thead><tbody>
  ${q.rows.map((r) => { const v = VARIANT[r.key]; return `<tr><td class="sv">${v.label}${v.sub ? `<br>${v.sub}` : ''}</td><td>${r.m2 ?? '-'}</td><td>${eur(r.net)}${r.key === 'konzultacia' ? ' / hod.' : ''}</td><td>${eur(r.gross)}${r.key === 'konzultacia' ? ' / hod.' : ''}</td></tr>`; }).join('')}
  </tbody></table>
  <div class="notes"><p class="ind">Ide o <b>indikatívnu cenovú ponuku</b> vypracovanú na základe údajov poskytnutých klientom. Výmera a rozsah budú overené pri fyzickom zameraní priestoru, na základe ktorého vám ponuku upresníme.</p>
  <p>V prípade výberu jednej z alternatív Vás prosíme o potvrdenie e-mailom s predmetom „Záväzná objednávka“, pričom uveďte zvolenú alternatívu.</p>
  <p>Projekt bude zaradený do časového harmonogramu po úhrade zálohovej platby vo výške 100 %. Termín začatia prác stanovujeme individuálne pred finálnym potvrdením cenovej ponuky.</p>
  <p>V prípade požiadavky na expresné dodanie služby si účtujeme príplatok vo výške 50 % z ceny služby.</p></div>${foot(3, A)}</section>`);
  // varianty
  let n = 4;
  for (const r of q.rows) {
    const v = VARIANT[r.key];
    if (v.groups) {
      pages.push(`<section class="pg"><h2>OBSAH VARIANTNÝCH RIEŠENÍ</h2><div class="vh"><h3>${v.title}</h3></div>
      ${v.groups.map(([g, t, st]) => `<div class="grp"><div class="gh"><b>${g}</b><span>${esc(t)}</span></div>${st.length === 1 && !st[0][0] ? `<p class="plain">${esc(st[0][1])}</p>` : timeline(st)}</div>`).join('')}
      ${foot(n++, A)}</section>`);
    } else {
      pages.push(`<section class="pg"><h2>OBSAH VARIANTNÝCH RIEŠENÍ</h2><div class="vh"><h3>${v.title}</h3><span>${v.time}</span></div>${timeline(v.steps)}${foot(n++, A)}</section>`);
    }
  }
  // podmienky
  const struct = d.flags?.structural || d.flags?.heritage;
  pages.push(`<section class="pg"><h2>ROZSAH SLUŽBY A CENOVÉ PODMIENKY</h2><div class="cond">
  <p>Uvedená cena sa vzťahuje výhradne na poskytované služby, ktoré sú detailne špecifikované v jednotlivých variantných riešeniach.</p>
  <p>Nejedná sa o projekt pre účely stavebného povolenia ani o realizačný projekt. V prípade záujmu je možné tieto služby zabezpečiť samostatne prostredníctvom vybranej projekčnej spoločnosti.</p>
  ${struct ? `<p class="hl">Pri zásahu do nosných konštrukcií alebo pri stavbe v pamiatkovo chránenom území či budove je potrebné počítať s projektom ASR a vyjadrením statika. Tieto služby nacení individuálne naše partnerské projekčné štúdio a nie sú súčasťou tejto ponuky.</p>` : ''}
  <p>Autorský dozor predstavuje dohľad nad súladom realizácie so schváleným návrhom. Nejde o stavebný dozor ani o technický dozor stavebníka.</p>
  <p>V cene nie sú zahrnuté stavebné práce ani jednotlivé profesné projekty (napr. architektúra, elektro, plyn, statika, zdravotechnika), búracie práce, dovoz, odvoz a materiál. Tieto položky sa oceňujú individuálne na základe obhliadky priestoru a aktuálnych trhových cien, ktoré sa môžu v čase meniť.</p>
  <p>Uvedené termíny sú orientačné a závisia od včasnej súčinnosti klienta a od dodacích lehôt tretích strán (dodávatelia, výrobcovia, remeselníci).</p>
  <p class="g">Cestovné náklady hradí klient podľa skutočného počtu výjazdov. Štandardná sadzba je 18 €/hod. + 0,50 €/km. Cena zahŕňa PHM, diaľničné poplatky a amortizáciu vozidla. Uvedené platí pre projekty realizované mimo Košíc.</p></div>
  <h2 class="mt">SÚHLAS A DOPLŇUJÚCE USTANOVENIA</h2><div class="cond"><p>Akceptáciou cenovej ponuky udeľujete spoločnosti PORA s. r. o. súhlas na vyhotovovanie a zverejňovanie foto a video dokumentácie diela na účely marketingovej komunikácie, v súlade s autorským zákonom č. 618/2003 Z. z.</p></div>
  ${foot(n, A)}</section>`);

  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>Cenová ponuka ${esc(d.number)} – PORA</title><style>
@font-face{font-family:Heebo;src:url(${A.fonts.heebo}) format('truetype');font-weight:100 900}
@font-face{font-family:Lekton;src:url(${A.fonts.lekton}) format('truetype');font-weight:400}
@font-face{font-family:Lekton;src:url(${A.fonts.lektonBold}) format('truetype');font-weight:700}
@page{size:A4;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#fff;color:#111}
body{font-family:Lekton,monospace;font-size:9.6pt;line-height:1.42}
.pg{position:relative;width:210mm;height:297mm;padding:22mm 20mm 20mm 23mm;page-break-after:always;overflow:hidden}
.pg:last-child{page-break-after:auto}
h1,h2,h3,h4,b,th,.sv{font-family:Heebo,sans-serif}
h1{font-weight:800;font-size:44pt;line-height:1.28;margin:58mm 0 0;letter-spacing:-.01em}
h2{font-weight:800;font-size:17pt;margin:0;letter-spacing:-.005em}
h2.mt{margin-top:16mm}
h3{font-weight:700;font-size:12.5pt;margin:5mm 0 0}
h4{font-weight:700;font-size:12pt;color:#7ED957;margin:16mm 0 4mm;letter-spacing:.01em}
.gr,.g{color:#7ED957}
.lg{height:10mm;width:auto}.lg.sm{height:5.4mm}
.top{display:flex;justify-content:space-between;align-items:flex-start}.mo{color:#7ED957;font-size:9pt}
.cb{position:absolute;left:23mm;right:20mm;bottom:22mm;display:flex;justify-content:space-between;font-size:9.6pt}
.cb p{margin:0 0 5mm}.cb .r{text-align:right}
.hd{display:flex;justify-content:space-between;align-items:center}
.tm{display:grid;grid-template-columns:repeat(3,1fr);gap:7mm;margin-top:16mm}
.tm b{display:block;font-size:8.6pt;min-height:9mm;line-height:1.25}.tm small{display:block;font-size:7.6pt;letter-spacing:.06em;margin:1mm 0 5mm}
.tm img{width:100%;aspect-ratio:3/4;object-fit:cover;filter:grayscale(1)}
.tm p{font-family:Lekton;font-weight:700;font-size:8.2pt;margin:6mm 0 0;line-height:1.38}
.appr{position:absolute;left:23mm;bottom:20mm;width:95mm;background:#f2f2f2;padding:6mm;font-size:8.2pt}.appr p{margin:0 0 3mm}
.foot{position:absolute;left:23mm;right:20mm;bottom:14mm;display:flex;justify-content:space-between;align-items:center;font-size:8.4pt}
.foot img{height:4.6mm}.foot.nolg{justify-content:flex-end;bottom:22mm}
.pn{font-size:8.6pt;margin:2mm 0 0}
table{width:100%;border-collapse:collapse;border-top:1.4pt solid #111;font-size:8.6pt;margin-top:2mm}
th{font-size:7.8pt;font-weight:700;padding:7mm 2mm 4mm;text-align:center;border-bottom:.8pt solid #111}
td{text-align:center;padding:4.2mm 2mm;border-bottom:.8pt solid #111}
td.sv{background:#efefef;font-weight:700;font-size:7.8pt;width:30%}
.notes{margin-top:9mm;font-size:8.8pt}.notes p{margin:0 0 4mm}.notes .ind{border-left:2.4pt solid #7ED957;padding-left:3mm}
.vh{display:flex;justify-content:space-between;align-items:baseline}.vh h3{margin-top:5mm}.vh span{font-weight:700;font-size:8.6pt}
.tl{position:relative;display:grid;grid-template-columns:repeat(4,1fr);margin-top:12mm;width:calc(var(--n)/4*100% + (4 - var(--n))*0mm)}
.tl .line{position:absolute;left:1mm;right:0;top:0;height:1.6pt;background:#111;transform:translateY(-50%)}
.tl[style*="--n:1"]{width:25%;grid-template-columns:1fr}.tl[style*="--n:2"]{width:50%;grid-template-columns:repeat(2,1fr)}.tl[style*="--n:3"]{width:75%;grid-template-columns:repeat(3,1fr)}
.st{position:relative;padding:5mm 3mm 0 0}.st i{position:absolute;left:0;top:0;width:3.4mm;height:3.4mm;border-radius:50%;background:#111;transform:translateY(-50%)}
.st b{display:block;font-size:8.4pt;line-height:1.2;margin-bottom:3mm}.st p{margin:0;font-size:8pt;line-height:1.38}
.st.g b,.st.g p{color:#7ED957}
.grp{margin-top:9mm}.gh{display:flex;justify-content:space-between;gap:6mm}.gh b{font-size:8.6pt}.gh span{font-weight:700;font-size:8.2pt;text-align:right;max-width:60%}
.plain{font-size:8pt;margin:3mm 0 0;max-width:40mm}
.grp .tl{margin-top:9mm}
.cond{margin-top:7mm;font-size:8.8pt}.cond p{margin:0 0 4.4mm}.cond .hl{border-left:2.4pt solid #111;padding-left:3mm;font-weight:700}
</style></head><body>${pages.join('\n')}</body></html>`;
}

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
- Stavebné práce, materiál, dovoz, profesné projekty nie sú v cene. Cestovné mimo Košíc 18 €/hod + 0,50 €/km.
- Termíny uvádzaj len orientačne (Mini 2–4 týždne, Design 8–12 týždňov, technická dokumentácia 4–6 týždňov) a vždy s tým, že závisia od súčinnosti klienta a dodávateľov. Nikdy nesľubuj konkrétny dátum dokončenia ani zľavu.
- Ponuka je indikatívna; finálnu cenu PORA potvrdí po fyzickom zameraní. Pri expresnom dodaní je príplatok 50 %.

AKO VIESŤ ROZHOVOR:
- Na ponuku potrebuješ: meno, e-mail, telefón (nepovinný), firmu (pri komerčnom priestore), typ priestoru, lokalitu, výmeru v m² (ak ju klient nevie, popros o pôdorys cez tlačidlo so sponkou a výmeru z neho odčítaj), čo potrebuje (konzultácia / návrh / návrh a realizácia), či ide o zásah do nosných konštrukcií alebo pamiatkovo chránenú budovu, kedy chce začať a či potrebuje expresné dodanie, voliteľne rozpočet a poznámku.
- Pýtaj sa naraz najviac na 1 až 2 veci. Ak klient niečo už povedal, znova sa na to nepýtaj.
- Na to, či chce klient len návrh alebo aj realizáciu, sa nepýtaj. Ponuka vždy obsahuje oba varianty, Variant 1 „Design“ (návrh) aj Variant 2 „Realizácia“ (návrh + podklady k realizácii + autorský dozor), pri výmere do 20 m² aj Balík Mini. Keď uvádzaš ceny, vždy uveď všetky tieto varianty spolu v jednej vete, nikdy len jeden. Ceny zisti nástrojom calculate_quote a uvádzaj ich „bez DPH“.
- V nástrojoch použi need = "konzultacia" len vtedy, ak klient výslovne chce iba konzultáciu; inak vždy need = "navrh_realizacia".
- Súbory, ktoré klient priložil (pôdorys PDF alebo obrázok), sú súčasťou rozhovoru a máš ich k dispozícii počas celého rozhovoru. Nikdy netvrď, že si súbor nevidel, ak je v rozhovore.
- Pred odoslaním jednou vetou zhrň len kľúčové údaje (priestor, výmera, služba, e-mail) a požiadaj o potvrdenie a súhlas so spracovaním osobných údajov na účel vypracovania ponuky (zásady sú v pätičke webu). Až po výslovnom súhlase zavolaj submit_offer, a to iba raz.
- Po prijatí odpovedz jednou až dvoma vetami: poďakuj, potvrď, že indikatívna cenová ponuka príde na uvedený e-mail spravidla do jedného pracovného dňa a že ju PORA upresní po zameraní. Nič ďalšie nepridávaj.

ŠTÝL – bezpodmienečne:
- Píš ako skúsený a zdvorilý konzultant prémiového štúdia: vecne, jasne, krátko (spravidla 1 až 3 vety). Vykáš. Bezchybná spisovná slovenčina s diakritikou (alebo angličtina, ak klient píše po anglicky).
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
    if (ctx.submitted) return { status: 'Ponuka z tohto rozhovoru je už prijatá. Neodosielaj znova.' };
    const data = { ...input }; delete data.number; delete data.date;
    ctx.submitted = 'pending';
    ctx.wait(processOffer(env, data, ctx.origin).catch((e) => notifyOwner(env, 'Ponuku treba poslať ručne – ' + (data.company || data.client_name), `<p style="font:15px sans-serif">Automatické vytvorenie PDF alebo odoslanie zlyhalo. Klient videl potvrdenie, že ponuka príde e-mailom – pošlite ju prosím ručne.</p><pre>${escH(String(e))}</pre>${ownerSummary(data, buildOffer({ ...data, number: '-', date: '' }))}`)));
    return { status: 'Prijaté. Indikatívna ponuka príde klientovi e-mailom.' };
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
  const ctx = { origin: url.origin, submitted: body.submitted ? 'pending' : null, wait: (p) => ectx.waitUntil(p) };
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
  if (!text) text = ctx.submitted ? (body.lang === 'en' ? 'Thank you. Your indicative quote will arrive by email, usually within one business day.' : 'Ďakujeme. Indikatívna cenová ponuka vám príde e-mailom, spravidla do jedného pracovného dňa.') : '…';
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
