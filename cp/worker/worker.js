// AUTO-GENERATED from pricing.js + offer.js + voucher.js + worker/main.js – 2026-11-16T19:36:00.156Z
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
  ${d.flags?.newBuild ? `<p class="hl">Pri novostavbe je potrebný projekt stavby (vrátane statiky a profesných projektov) a inžinierska činnosť, t. j. vybavenie stavebného povolenia. Tieto služby zabezpečí a nacení samostatne naše partnerské projekčné štúdio a nie sú súčasťou tejto ponuky.</p>` : ''}
  ${struct && !d.flags?.newBuild ? `<p class="hl">Pri zásahu do nosných konštrukcií alebo pri stavbe v pamiatkovo chránenom území či budove je potrebné počítať s projektom ASR a vyjadrením statika. Tieto služby nacení individuálne naše partnerské projekčné štúdio a nie sú súčasťou tejto ponuky.</p>` : ''}
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

// PORA – šablóna vianočného vouchera (2 strany 200 × 100 mm). Generované z návrhu schváleného Tomom 16. 11. 2026.
const VOUCHER_TPL = "<!doctype html><html lang=\"sk\"><head><meta charset=\"utf-8\"><title>Vianočný voucher PORA {{code}}</title><link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@500&display=swap\"><style>\n/* Layout: návrh vouchera ako dve karty 2:1 (predná a zadná strana) pod sebou, okolo len tichý popis. Voucher má pevné farby značky, stránka sa prispôsobí téme. */\n:root{\n  --bg:#EFEDE8; --fg:#111113; --muted:#5A575F; --line:#CFCBC3;\n  --lime:#D1FF05; --coral:#EF5A45; --violet:#7548A8; --ink:#111113; --paper:#FAF9F6;\n  --display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;\n  --body:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;\n  --mono:'DM Mono',ui-monospace,'SF Mono',Consolas,monospace;\n}\n@media (prefers-color-scheme: dark){ :root:not([data-theme=\"light\"]){ --bg:#141416; --fg:#F0EEE9; --muted:#A7A4AC; --line:#33323A; color-scheme:dark } }\n:root[data-theme=\"dark\"]{ --bg:#141416; --fg:#F0EEE9; --muted:#A7A4AC; --line:#33323A; color-scheme:dark }\nbody{background:var(--bg);color:var(--fg);font:16px/1.5 var(--body);padding-block:28px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n.page{max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:26px}\nheader h1{font:900 clamp(34px,6vw,58px)/.95 var(--display);text-transform:uppercase;letter-spacing:.01em;margin:0 0 8px;text-wrap:balance}\nheader p{margin:0;color:var(--muted);max-width:65ch}\n.lab{font:500 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);display:flex;gap:10px;align-items:center;margin-bottom:10px}\n.lab::before{content:\"\";width:8px;height:8px;border-radius:50%;background:var(--coral)}\n\n/* ── voucher ── */\n.v{container-type:inline-size;width:100%;aspect-ratio:2/1;max-width:100%;position:relative;border-radius:1.6cqw;overflow:hidden;color:var(--ink);box-shadow:0 1.2cqw 3cqw rgba(0,0,0,.22);font-family:var(--body)}\n.v canvas.g{position:absolute;inset:0;width:100%;height:100%}\n.front{background:var(--paper);display:grid;grid-template-columns:1fr 27cqw}\n.main{position:relative;padding:3.2cqw 4cqw 3.4cqw 4.6cqw;display:flex;flex-direction:column;min-width:0}\n.brand{display:flex;justify-content:space-between;align-items:center;font:500 1.2cqw/1 var(--body);letter-spacing:.2em;text-transform:uppercase}\n.brand .tag{background:#FFFFFF;box-shadow:0 0 0 .12cqw var(--ink);padding:.8cqw 1.3cqw;border-radius:99cqw}\n.logo{display:block;height:3.4cqw;width:auto}\n.main{background:#F3F1EB}\n.sk{position:absolute;inset:0;width:100%;height:100%}\n.sk path{fill:none;stroke:#B4D600;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;opacity:.5;vector-effect:non-scaling-stroke}\n.hd{position:relative;display:block;width:60cqw;height:30cqw;margin:.4cqw 0 0 -1.6cqw}\n.tree{position:absolute;right:2.6cqw;top:9.6cqw;width:11cqw;transform:rotate(6deg);filter:drop-shadow(0 0 1.2cqw rgba(209,255,5,.75))}\n.fields{margin:auto -4cqw -3.4cqw -4.6cqw;display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:1.6cqw;background:var(--paper);border-top:.3cqw solid var(--ink);padding:1.5cqw 4cqw 2.5cqw 4.6cqw}\n.f small{display:block;font:500 1.05cqw/1 var(--body);letter-spacing:.16em;text-transform:uppercase;color:#55535A;margin-bottom:.7cqw}\n.f b{display:block;font:900 2.7cqw/1 var(--display);letter-spacing:.02em;text-transform:uppercase}\n.f i{display:block;font:400 1.15cqw/1.3 var(--body);font-style:normal;color:#3A383E;margin-top:.45cqw}\n.micro{position:absolute;left:0;right:0;bottom:.5cqw;font:500 .62cqw/1 var(--mono);letter-spacing:.12em;white-space:nowrap;overflow:hidden;color:#6b6870;text-transform:uppercase;padding-left:4.6cqw}\n.stub{position:relative;background:var(--violet);color:var(--paper);padding:3.4cqw 2.6cqw 2.6cqw;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.2cqw}\n.stub::before{content:\"\";position:absolute;left:-.2cqw;top:0;bottom:0;border-left:.4cqw dotted var(--paper)}\n.stub::after{content:\"\";position:absolute;left:-1.5cqw;top:-1.5cqw;width:3cqw;height:3cqw;border-radius:50%;background:var(--bg);box-shadow:0 53cqw 0 var(--bg)}\n.qr{width:13.5cqw;height:13.5cqw;background:var(--paper);border-radius:.8cqw;padding:.8cqw;display:grid;place-items:center}\n.qr svg{width:100%;height:100%;display:block}\n.qr span{font:500 1cqw/1.3 var(--mono);color:var(--ink)}\n.code{font:500 1.75cqw/1.2 var(--mono);letter-spacing:.06em;background:var(--ink);color:var(--lime);padding:.7cqw 1cqw;border-radius:.5cqw;white-space:nowrap}\n.stub small{font:500 1.02cqw/1.35 var(--body);letter-spacing:.1em;text-transform:uppercase;opacity:.9}\n.seal{position:absolute;right:1.4cqw;bottom:1.4cqw;width:7.4cqw;height:7.4cqw;border-radius:50%;background:conic-gradient(from 40deg,#D1FF05,#7CF3FF,#B58CFF,#FF7AC8,#FFD36B,#D1FF05);display:grid;place-items:center;box-shadow:inset 0 0 0 .25cqw rgba(255,255,255,.75),0 .2cqw .8cqw rgba(0,0,0,.35)}\n.seal::before{content:\"\";position:absolute;inset:.9cqw;border-radius:50%;border:.14cqw dashed rgba(17,17,19,.7)}\n.seal svg{width:54%;height:54%}\n.no{position:absolute;left:2.6cqw;bottom:2.2cqw;font:500 1.05cqw/1.3 var(--mono);text-align:left;opacity:.92}\n.vzor{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-24deg);font:900 15cqw/1 var(--display);letter-spacing:.08em;color:rgba(239,90,69,.16);pointer-events:none;white-space:nowrap}\n\n.back{background:var(--ink);color:var(--paper);display:grid;grid-template-columns:27cqw 1fr}\n.bl{position:relative;background:var(--lime);color:var(--ink);padding:3.6cqw 2.8cqw;display:flex;flex-direction:column;gap:1.4cqw}\n.bl h2{margin:0;font:900 5.2cqw/.88 var(--display);text-transform:uppercase}\n.bl p{margin:0;font:500 1.3cqw/1.4 var(--body)}\n.bl .until{margin-top:auto;border-top:.22cqw solid var(--ink);padding-top:1.3cqw}\n.bl .until small{display:block;font:500 1.02cqw/1 var(--body);letter-spacing:.16em;text-transform:uppercase;margin-bottom:.6cqw}\n.bl .until b{font:900 4.2cqw/.9 var(--display);white-space:nowrap}\n.br{position:relative;padding:3.4cqw 4cqw 2.6cqw 3.6cqw;display:flex;flex-direction:column;min-width:0}\n.br h3{margin:0 0 1.4cqw;font:900 2.5cqw/1 var(--display);letter-spacing:.06em;text-transform:uppercase;color:var(--lime)}\n.br ol{margin:0;padding:0;list-style:none;counter-reset:r;display:grid;grid-template-columns:1fr 1fr;gap:1.05cqw 2.6cqw}\n.br li{counter-increment:r;position:relative;padding-left:2.5cqw;font:400 1.14cqw/1.38 var(--body);color:#E6E3DD}\n.br li::before{content:counter(r);position:absolute;left:0;top:-.1cqw;font:900 1.9cqw/1 var(--display);color:var(--coral)}\n.br li b{color:#fff;font-weight:700}\n.how{margin-top:auto;padding-top:1.6cqw}\n.how h3{margin-bottom:1cqw}\n.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:2cqw}\n.steps div{display:flex;gap:1cqw;align-items:flex-start}\n.steps b{flex:none;width:2.6cqw;height:2.6cqw;border-radius:50%;background:var(--lime);color:var(--ink);display:grid;place-items:center;font:900 1.7cqw/1 var(--display)}\n.steps span{font:400 1.14cqw/1.38 var(--body);color:#E6E3DD}\n.foot{margin-top:1.6cqw;display:flex;justify-content:space-between;gap:2cqw;border-top:.14cqw solid #44424A;padding-top:1.1cqw;font:500 1.02cqw/1.3 var(--body);letter-spacing:.08em;text-transform:uppercase;color:#B9B6BE}\n.notes{border-top:1px solid var(--line);padding-top:20px;display:grid;gap:8px;color:var(--muted);font-size:15px;max-width:70ch}\n.notes b{color:var(--fg)}\n\n@page{size:200mm 100mm;margin:0}\nhtml,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n:root{--bg:#fff}\n.v{width:200mm;height:100mm;aspect-ratio:auto;border-radius:0;box-shadow:none;page-break-after:always;break-after:page}\n.v.back{page-break-after:auto;break-after:auto}\n</style></head><body><div class=\"v front\" id=\"front\">\n      <div class=\"main\">\n        <svg class=\"sk\" viewBox=\"0 0 1200 900\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><path d=\"M4.6 281.2 L7.5 279.9 L11.3 283.0 L8.1 292.6 L4.6 290.7 L4.0 284.3 M13.5 282.5 L23.5 283.6 L24.9 299.8 L8.7 294.9 L8.5 286.1 L12.7 282.1 M3.6 297.7 L8.5 297.3 L5.4 311.4 L1.5 311.8 L3.1 297.8 M26.1 291.3 L34.0 292.4 L33.9 297.5 L30.4 299.2 L24.0 293.2 M1.2 319.1 L4.7 316.9 L5.8 321.4 L14.9 320.6 L11.8 323.0 L12.8 330.2 L12.1 332.2 L5.1 330.6 L1.5 320.9 M359.9 51.8 L343.0 56.7 L315.7 71.8 L299.3 85.9 L289.0 101.4 L298.5 87.8 L312.5 74.8 L346.1 55.7 L360.2 51.0 L379.8 51.8 L406.4 56.5 L428.8 66.5 L458.0 91.1 L478.6 117.5 L493.1 152.2 L486.1 132.1 L471.0 102.6 L438.9 73.2 L420.7 61.4 L389.3 53.6 L360.8 50.9 M11.3 341.4 L14.1 339.9 L17.6 344.7 L15.2 362.6 L13.3 361.6 L11.3 341.3 M8.3 337.1 L13.2 335.1 L10.2 338.8 L8.9 342.6 L12.0 349.2 L14.0 366.9 L12.2 437.4 L5.7 438.8 L4.5 337.3 L8.7 336.9 M20.3 341.8 L24.1 339.9 L31.2 346.0 L31.9 370.6 L27.5 373.6 L25.8 373.2 L26.9 368.7 L24.8 366.8 L23.7 353.8 L25.5 375.3 L22.7 381.6 L25.4 388.0 L17.0 389.0 L15.9 361.1 L17.2 344.2 L19.0 343.2 M107.6 319.3 L98.1 324.7 L90.0 335.6 L89.4 349.4 L95.9 356.1 L105.0 353.6 L113.8 340.2 L116.1 328.7 L112.8 321.4 L108.0 320.0 M107.0 319.6 L111.3 318.4 L113.9 323.5 L116.4 333.9 L110.2 348.4 L99.5 356.0 L97.4 356.0 L89.3 349.2 L90.1 335.3 L99.7 324.6 L106.2 320.2 M93.0 299.1 L99.3 297.6 L130.5 316.5 L140.5 329.8 L140.0 342.7 L134.5 354.6 L121.1 366.5 L104.2 374.5 L87.7 373.2 L77.3 371.6 L71.9 364.8 L68.2 354.2 L70.5 328.0 L88.3 306.6 L92.3 298.6 M38.0 368.3 L41.2 367.6 L42.3 371.1 L42.1 411.3 L30.3 409.4 L25.5 405.5 L12.5 406.1 L14.6 401.2 L21.4 400.3 L19.1 395.2 L21.7 388.4 L28.2 390.9 L32.9 396.3 L37.1 397.1 L37.6 393.9 L33.4 386.3 L24.2 383.6 L24.3 377.4 L36.3 368.3 M15.5 407.7 L21.7 406.2 L24.5 409.4 L23.0 426.0 L22.4 426.8 L24.1 430.3 L18.8 434.7 L15.1 431.9 L14.4 409.6 M25.5 408.6 L28.0 408.4 L30.5 410.8 L28.0 431.5 L25.0 431.4 L24.3 410.0 M29.8 409.2 L35.1 409.9 L37.8 415.6 L36.8 426.6 L41.3 431.9 L35.8 433.9 L28.7 433.3 L29.4 410.9 M139.6 346.2 L142.9 345.8 L140.3 359.2 L141.5 376.0 L120.2 373.0 L112.9 397.6 L108.9 398.3 L105.4 387.6 L89.6 378.7 L88.9 375.4 L102.5 373.4 L121.9 367.2 L134.4 357.1 L139.2 347.5 M70.1 372.5 L87.4 375.9 L105.5 389.6 L108.4 399.6 L101.7 411.8 L85.8 418.1 L68.5 417.7 L66.9 414.9 L67.9 380.8 L70.0 374.0 M142.1 303.4 L172.0 305.6 L179.4 335.4 L180.5 334.3 L183.0 325.1 L179.5 308.1 L193.4 306.1 L195.4 307.7 L196.8 358.1 L194.8 373.7 L178.6 375.4 L166.0 350.1 L162.4 352.6 L164.1 371.4 L161.2 373.8 L144.7 374.1 L140.9 367.9 L142.8 348.2 L141.7 305.9 M20.2 433.8 L26.4 432.0 L32.3 435.4 L30.8 438.5 L45.3 452.5 L44.0 461.9 L37.8 461.9 L31.8 451.7 L36.0 460.8 L31.0 461.1 L23.3 453.4 L24.3 448.9 L19.8 447.6 L10.7 442.7 L10.8 437.8 L19.1 434.6 M37.3 234.8 L35.5 237.1 L41.6 237.1 L46.1 242.0 L45.5 295.9 L43.2 298.4 L38.2 299.0 L26.7 290.3 L28.6 280.6 L26.9 291.1 L23.5 290.8 L24.0 277.1 L32.3 279.4 L37.5 283.5 L36.8 289.1 L39.9 284.8 L36.9 284.3 L33.9 280.1 L25.6 276.5 L1.6 279.5 L2.7 260.4 L0.2 255.1 L0.9 256.9 L3.7 283.9 L0.6 306.5 L0.6 306.6 L0.0 335.2 L2.5 336.0 L1.0 350.8 L0.6 340.7 L2.4 339.5 L6.6 372.1 L5.5 436.2 L-1.2 435.8 L0.3 439.4 L2.5 437.5 L5.1 440.7 L7.4 439.0 L25.8 457.3 L25.0 461.1 L18.6 462.8 L13.5 451.0 L8.8 446.0 L24.7 471.3 L24.4 481.1 L42.4 516.0 L40.3 527.9 L29.6 537.6 L22.0 554.2 L16.5 559.0 L19.3 558.7 L30.1 538.2 L40.3 530.3 L40.8 516.1 L47.0 513.1 L52.4 517.0 L47.6 512.8 L41.7 514.4 L30.5 498.3 L22.9 481.8 L22.6 462.7 L28.3 468.5 L35.7 494.1 L39.7 502.7 L51.2 510.3 L41.7 500.9 L32.9 487.4 L31.2 474.8 L35.0 470.7 L38.4 472.5 L37.0 476.1 L43.0 468.8 L55.0 481.7 L84.0 507.8 L55.3 481.3 L47.4 470.4 L52.2 468.9 L78.7 476.3 L114.8 511.4 L120.0 512.0 L126.4 523.7 L129.2 522.2 L137.8 530.9 L135.5 525.6 L137.5 519.3 L159.6 517.7 L196.4 519.3 L200.8 517.2 L179.3 517.9 L175.6 518.4 L172.4 518.0 L125.4 522.6 L121.0 515.5 L123.2 509.2 L130.9 510.6 L142.6 503.6 L149.2 506.1 L157.2 504.3 L174.2 506.1 L169.6 504.2 L142.1 504.0 L135.9 508.8 L124.7 505.8 L119.8 489.0 L109.1 480.7 L107.1 472.7 L134.5 470.4 L137.8 467.4 L138.2 440.9 L140.8 439.6 L147.4 439.3 L145.1 442.2 L144.5 468.2 L157.2 468.6 L158.4 460.3 L162.5 460.8 L162.3 469.5 L171.8 467.8 L175.4 458.4 L178.6 458.8 L178.2 467.7 L207.3 465.5 L207.6 457.1 L210.3 459.5 L212.2 465.3 L229.3 465.6 L234.3 461.3 L233.9 452.7 L220.2 454.2 L219.5 451.3 L220.5 448.5 L230.7 445.6 L230.3 441.1 L220.6 440.5 L218.6 434.9 L222.9 432.2 L238.4 434.6 L239.0 422.6 L214.1 420.9 L201.3 379.3 L239.7 379.7 L235.8 365.8 L220.1 364.5 L216.4 354.8 L230.5 353.0 L231.1 342.4 L218.9 340.6 L218.2 337.6 L217.9 328.7 L241.0 328.6 L239.1 313.8 L218.8 309.9 L201.2 310.7 L201.3 379.6 L198.0 379.5 L189.4 378.4 L191.2 373.8 L195.9 374.6 L196.2 315.8 L195.3 306.8 L185.5 305.8 L180.7 308.4 L183.2 325.1 L181.5 328.7 L179.4 330.1 L175.1 304.8 L141.5 302.8 L142.1 322.2 L139.0 322.5 L132.9 315.6 L100.4 297.8 L90.3 299.8 L86.5 305.5 L76.2 317.8 L70.4 327.9 L67.7 356.3 L74.9 370.9 L68.3 372.5 L67.4 381.3 L67.0 413.6 L69.4 418.0 L71.8 419.8 L67.5 453.1 L70.6 453.5 L84.1 448.4 L93.7 454.0 L100.6 463.5 L86.7 465.4 L49.9 451.1 L43.0 448.9 L37.2 442.0 L42.4 439.6 L40.7 433.8 L41.7 431.9 L46.0 314.3 L47.4 313.9 L53.9 319.8 L60.1 321.7 L59.6 422.5 L60.7 320.3 L54.5 319.9 L45.5 309.8 L47.8 303.9 L43.6 366.7 L36.4 369.0 L30.9 368.3 L31.5 345.5 L19.8 337.3 L24.5 332.5 L19.1 325.5 L22.5 319.9 L21.1 324.6 L18.4 322.9 L18.0 320.1 L22.6 315.2 L24.9 318.2 L32.8 324.2 L37.8 310.9 L37.6 304.3 L32.8 303.5 L33.3 299.1 L44.2 299.2 L45.8 296.7 L46.0 238.4 L38.2 236.8 M129.1 384.0 L124.7 390.8 L126.1 394.9 L132.1 396.7 L130.2 384.8 M119.6 374.4 L135.7 371.9 L139.2 374.8 L139.6 387.2 L138.1 415.2 L132.7 415.7 L132.0 407.7 L124.7 404.3 L122.4 405.3 L118.1 417.4 L104.6 417.3 L119.0 374.2 M100.8 413.3 L103.0 413.3 L104.2 417.9 L108.2 419.2 L107.8 439.0 L105.3 437.5 L96.4 420.4 L87.1 419.8 L87.0 417.6 L99.8 413.3 M162.5 354.0 L168.6 354.6 L175.6 373.5 L180.9 375.3 L176.4 402.1 L173.4 413.9 L162.4 412.9 L161.6 396.1 L174.4 379.0 L173.6 378.6 L163.5 375.5 L164.4 370.7 L162.0 354.6 M202.2 309.4 L219.0 309.0 L239.8 314.5 L241.0 327.8 L217.8 326.7 L218.9 339.7 L228.7 341.2 L231.4 351.6 L216.8 353.4 L218.5 363.1 L228.8 365.2 L236.0 367.3 L238.9 373.3 L238.0 380.2 L200.4 377.2 L201.7 311.6 M142.3 377.3 L148.1 376.3 L153.8 382.2 L160.4 375.7 L174.0 377.8 L161.8 393.7 L161.3 419.0 L148.9 418.7 L147.7 417.4 L148.3 390.9 L141.7 378.3 M124.2 404.6 L126.6 404.5 L132.1 407.7 L132.3 419.1 L127.5 421.1 L118.4 419.5 L123.2 405.7 M138.9 382.9 L141.7 381.6 L147.4 391.7 L149.0 413.6 L146.8 419.0 L141.9 419.3 L140.5 415.1 L138.6 383.5 M81.6 436.2 L87.0 434.3 L90.7 443.4 L90.4 445.9 L84.6 447.0 L81.0 444.2 L82.5 435.7 M72.4 421.6 L95.5 419.9 L98.4 423.9 L109.5 446.4 L108.6 456.3 L114.5 466.6 L113.8 470.4 L107.7 472.0 L99.6 459.0 L88.7 450.7 L91.5 443.7 L86.5 433.9 L81.2 433.1 L82.6 446.6 L75.4 453.0 L67.6 453.5 L72.1 423.3 M189.1 385.9 L187.8 397.8 L192.8 397.4 L190.9 388.8 L188.6 387.3 M188.7 389.2 L192.3 390.4 L192.3 398.3 L187.9 397.3 L187.5 391.3 M30.6 463.4 L43.3 460.9 L61.8 466.2 L90.7 476.7 L119.8 511.5 L116.9 510.7 L89.6 482.3 L79.6 477.7 L53.6 469.1 L35.3 471.4 L30.6 466.5 L32.7 464.4 M107.5 442.8 L114.9 440.6 L119.2 443.9 L117.8 465.3 L110.1 458.9 L106.9 441.7 M272.3 318.9 L270.1 320.8 L270.1 451.5 L270.9 323.3 L272.8 319.2 L323.9 325.8 L329.3 328.0 L318.9 324.1 L273.4 319.4 M140.9 419.8 L159.3 421.6 L166.2 428.7 L159.0 433.7 L148.5 431.4 L144.3 439.2 L138.1 440.1 L138.6 465.7 L133.0 470.9 L122.6 470.9 L117.9 468.2 L118.8 443.2 L116.6 439.8 L109.3 439.1 L107.6 422.4 L139.2 420.4 M179.5 379.0 L189.3 378.0 L200.7 380.3 L213.1 417.2 L211.8 419.5 L200.3 421.5 L196.8 417.2 L195.2 405.5 L188.1 406.6 L186.8 416.8 L174.5 415.9 L180.1 379.7 M44.4 452.4 L51.0 451.5 L91.8 466.9 L101.1 464.9 L109.6 480.3 L120.6 489.9 L122.4 497.1 L122.9 507.1 L118.1 507.6 L91.3 478.1 L73.7 469.0 L47.4 462.6 L45.2 451.9 M150.9 434.3 L157.3 435.9 L157.1 470.0 L145.2 467.5 L145.0 444.8 L149.6 442.0 L150.0 435.9 M160.6 431.5 L164.4 430.3 L165.5 435.5 L161.2 455.5 L158.1 457.2 L156.6 444.1 L162.0 432.2 M188.4 408.3 L195.1 407.8 L197.7 418.9 L203.2 421.1 L203.1 425.6 L196.1 421.7 L191.6 431.1 L188.2 429.5 L186.8 423.2 L187.9 408.5 M10.1 562.2 L0.8 563.4 L7.6 562.9 L8.0 567.0 L-0.2 568.1 L6.7 566.9 L7.3 568.8 L14.4 563.0 L9.9 561.3 M166.3 421.2 L186.8 421.7 L189.5 435.6 L192.1 434.3 L195.8 423.5 L208.2 424.1 L206.7 466.4 L198.1 467.2 L197.5 465.3 L201.6 447.7 L198.4 448.6 L193.4 463.7 L180.6 467.6 L177.8 465.2 L178.2 438.3 L176.8 439.2 L172.6 467.5 L171.3 468.4 L162.4 467.0 L160.1 454.1 L165.5 436.1 L167.1 422.8 M55.4 520.2 L48.2 525.8 L46.0 533.3 L34.1 544.1 L29.1 551.4 L34.4 542.9 L43.5 536.0 L52.0 534.8 L66.8 531.5 L97.8 532.5 L126.8 529.2 L98.1 534.5 L67.7 530.3 L46.5 535.8 L48.6 529.5 L62.6 526.5 L63.5 523.8 L55.3 520.1 M225.4 422.0 L237.4 421.3 L239.4 422.5 L237.4 434.3 L217.8 434.7 L218.7 439.5 L228.2 440.6 L230.2 442.6 L230.1 446.7 L220.7 447.9 L219.9 453.1 L233.1 453.4 L233.8 461.5 L231.2 463.4 L212.2 463.2 L208.7 457.9 L211.4 422.5 L225.1 420.6 M489.9 211.0 L495.9 210.0 L655.0 249.0 L654.5 258.6 L652.6 262.6 L523.8 234.4 L483.6 255.9 L467.6 253.2 L467.4 248.0 L479.7 231.7 L489.6 212.3 M107.0 520.4 L118.8 526.4 L110.0 520.4 M140.3 551.4 L91.7 553.2 L47.8 559.1 L17.9 566.3 L9.0 571.5 L-0.6 578.9 L24.4 564.4 L59.1 556.4 L104.7 553.4 L170.2 550.9 L141.4 551.1 M282.3 440.1 L301.2 446.7 L300.4 443.8 L292.9 441.3 L283.3 440.0 M305.6 327.4 L307.5 442.9 L302.0 446.8 L301.3 480.8 L302.2 452.5 L305.5 449.9 L307.5 500.9 L304.2 502.4 L296.1 503.2 L294.9 500.6 L298.6 496.2 L296.0 478.8 L294.3 476.6 L278.0 473.3 L292.8 475.2 L296.4 482.5 L297.3 498.0 L293.0 503.5 L287.8 503.6 L286.6 488.9 L273.1 475.4 L273.3 472.6 L267.7 472.2 L267.8 460.9 L269.9 510.6 L219.3 521.0 L183.0 533.4 L179.3 531.9 L174.2 523.9 L155.5 523.6 L170.0 524.0 L177.4 526.5 L179.1 534.1 L173.4 539.6 L171.6 544.3 L180.6 550.9 L203.8 557.6 L239.1 562.7 L216.0 560.2 L186.1 554.5 L176.5 549.6 L172.4 542.2 L185.3 531.0 L220.0 521.4 L274.2 510.7 L302.5 508.3 L299.2 508.1 L300.3 503.9 L304.5 503.8 L309.4 508.1 L317.2 506.8 L316.0 504.4 L308.1 499.4 L307.8 447.6 L304.3 446.4 L307.0 444.6 L306.7 328.1 M989.8 -0.7 L888.4 50.5 L892.1 51.1 L891.6 53.7 L841.4 79.3 L839.9 77.9 L836.6 81.5 L808.2 97.4 L912.2 44.8 L916.8 43.9 L915.2 219.5 L920.6 215.8 L919.9 50.5 L923.1 49.2 L922.9 40.7 L937.6 33.1 L939.8 27.6 L996.4 1.3 L989.9 0.2 M410.8 396.7 L417.4 395.3 L418.0 404.1 L417.6 397.5 L411.7 396.0 M269.9 479.1 L274.0 476.9 L287.0 492.5 L289.6 500.4 L284.8 510.3 L280.4 509.8 L279.3 504.9 L269.2 504.5 L269.2 479.2 M468.5 378.4 L405.4 387.3 L467.0 378.4 L472.7 379.5 L472.3 385.4 L472.9 379.2 L468.7 379.2 M31.4 673.2 L0.8 678.1 L32.9 672.6 M64.5 590.3 L78.9 596.3 L105.4 599.0 L204.7 600.2 L231.2 606.5 L227.7 605.0 L229.5 603.2 L221.9 604.0 L186.1 599.8 L105.0 598.9 L78.4 595.9 L75.9 593.5 L65.6 591.1 M291.6 503.8 L295.9 502.3 L299.0 506.7 L286.8 509.1 L285.8 504.5 L291.0 504.0 M322.7 420.6 L322.6 468.7 L320.5 470.8 L324.1 475.2 L321.1 481.3 L323.2 480.5 L323.4 498.3 L320.7 500.7 L319.7 503.6 L325.1 507.0 L364.4 504.3 L384.8 506.7 L375.8 506.8 L374.2 503.3 L329.4 506.9 L322.6 504.2 L322.3 421.2 L335.4 420.0 L324.6 420.6 M50.4 658.8 L70.9 658.0 L73.7 663.4 L69.2 666.7 L49.2 669.6 L49.6 659.9 M75.9 672.4 L76.0 684.0 L72.5 687.3 L74.7 689.9 L80.3 686.3 L81.8 675.7 L78.2 677.0 L76.7 672.7 M77.6 679.0 L80.6 678.8 L80.7 686.0 L74.8 689.8 L73.2 685.5 L78.0 679.6 M162.6 554.8 L135.4 557.9 L146.2 558.1 L147.4 561.0 L150.7 557.3 L158.2 557.2 L158.1 559.9 L163.8 560.1 L166.2 558.0 L175.1 555.3 L189.0 564.8 L227.9 573.6 L229.1 576.6 L237.3 574.6 L275.0 580.6 L275.5 582.4 L251.7 584.5 L244.5 582.3 L241.7 585.0 L243.4 582.4 L259.7 584.7 L272.1 583.8 L275.1 589.9 L284.9 589.7 L294.5 593.3 L293.0 595.5 L283.4 596.7 L273.3 602.5 L261.9 601.1 L269.7 603.7 L275.6 602.6 L282.9 598.5 L294.5 594.7 L303.9 597.2 L306.7 590.7 L317.0 588.8 L322.0 580.1 L360.8 576.2 L333.5 579.3 L238.5 577.3 L205.5 570.2 L175.1 557.1 L163.4 555.9 M465.1 386.9 L471.2 386.9 L470.6 394.5 L455.3 402.7 L447.0 419.9 L456.2 402.8 L464.5 398.1 L472.1 399.4 L470.8 423.0 L464.2 425.0 L462.4 422.5 L455.0 427.6 L455.1 431.8 L460.6 430.8 L463.5 437.5 L461.4 429.3 L456.2 429.2 L456.3 428.5 L457.4 425.6 L471.2 426.3 L470.8 451.9 L463.6 454.2 L461.9 460.2 L458.2 464.7 L458.1 467.5 L465.1 453.3 L471.4 453.8 L471.9 487.4 L461.6 485.6 L461.2 480.9 L465.5 479.6 L463.6 479.5 L461.9 474.9 L466.9 475.1 L462.6 471.6 L463.1 481.3 L458.4 484.5 L434.7 480.3 L434.2 472.6 L436.7 470.6 L451.5 464.9 L451.8 457.0 L447.4 459.4 L448.9 464.4 L446.7 466.8 L438.5 468.1 L433.9 471.4 L431.0 479.4 L411.9 478.2 L407.4 473.7 L406.7 466.0 L410.2 464.4 L406.4 464.1 L406.8 437.4 L414.2 438.8 L421.6 450.0 L419.8 455.1 L412.9 463.6 L419.8 455.4 L421.4 450.8 L417.0 441.8 L406.8 434.1 L406.7 392.7 L409.5 391.1 L464.3 386.8 M456.6 444.3 L452.7 450.0 L446.3 450.5 L445.8 454.6 L447.3 449.5 L454.6 451.6 L455.9 445.1 M369.0 512.6 L372.1 512.1 L376.5 515.6 L374.5 526.2 L368.6 525.2 L370.4 513.1 M-0.2 629.9 L15.4 647.2 L37.3 656.3 L37.8 661.5 L0.6 667.9 L30.2 662.3 L39.2 662.9 L37.6 776.2 L18.0 899.9 L38.6 776.4 L37.5 658.7 L49.2 659.9 L45.1 763.2 L47.8 763.0 L58.1 756.9 L69.3 757.1 L69.4 759.0 L61.0 763.2 L62.8 767.2 L60.5 780.4 L58.9 801.0 L56.8 804.6 L64.4 764.4 L70.1 758.5 L73.3 760.0 L66.9 817.3 L73.1 763.3 L77.7 759.6 L72.7 758.7 L68.3 752.9 L47.8 761.8 L43.2 759.1 L49.5 670.9 L70.1 667.6 L75.0 657.5 L80.1 658.2 L81.8 665.6 L127.1 656.3 L170.4 652.5 L83.3 663.9 L82.8 659.4 L86.8 656.8 L131.8 652.3 L202.5 640.9 L211.0 643.6 L210.1 736.0 L220.8 899.6 L209.2 737.6 L209.2 639.4 L108.7 655.7 L46.0 658.7 L19.5 648.8 L0.4 629.2 M369.2 513.5 L369.5 525.1 L371.9 527.7 L374.9 525.7 L378.4 516.8 L374.7 512.3 L370.0 511.5 M552.2 401.3 L552.6 407.7 L549.9 409.9 L578.1 410.8 L576.0 401.4 L555.0 400.0 M554.3 401.6 L576.0 400.4 L576.8 410.6 L554.2 412.2 L553.7 401.3 M274.6 580.4 L320.2 579.4 L321.0 582.8 L314.5 589.6 L287.7 592.7 L288.3 591.2 L276.0 590.1 L275.9 580.9 M521.7 237.2 L531.2 235.9 L653.2 262.3 L654.2 315.1 L656.5 319.3 L657.4 325.4 L655.1 330.8 L653.5 366.1 L655.4 372.9 L654.2 375.6 L653.5 548.7 L649.3 549.7 L640.6 546.7 L602.6 547.9 L564.4 551.1 L558.4 553.5 L553.2 557.9 L554.3 575.0 L529.6 580.8 L520.3 579.5 L503.0 570.2 L503.0 561.3 L524.1 551.8 L541.8 542.3 L547.1 532.7 L546.2 525.3 L542.6 520.1 L519.2 513.4 L504.6 503.1 L487.3 498.1 L443.3 497.9 L407.0 503.5 L400.0 502.9 L400.6 495.4 L402.9 494.9 L400.3 493.2 L402.2 479.8 L410.0 482.9 L408.9 496.4 L408.2 497.6 L409.7 498.1 L409.4 482.1 L417.8 483.3 L420.2 489.1 L421.3 484.0 L438.6 486.8 L425.7 486.3 L425.5 478.7 L471.0 486.3 L469.7 386.6 L468.5 384.6 L406.7 391.4 L404.3 479.1 L402.4 479.4 L400.4 276.1 L435.0 269.3 L450.4 262.8 L464.0 251.9 L482.6 255.1 L520.3 237.1 M685.1 329.1 L695.8 328.5 L698.4 329.6 L699.2 334.6 L692.8 337.4 L690.8 380.3 L684.6 376.0 L685.2 339.0 L679.9 338.6 L680.3 334.7 L676.3 330.9 L684.1 330.2 M317.2 595.0 L319.0 602.9 L313.9 612.2 L238.6 626.3 L232.2 625.1 L218.6 637.5 L217.0 716.4 L218.4 639.6 L221.2 635.8 L314.2 619.4 L315.0 615.3 L313.0 620.2 L232.0 634.8 L226.6 633.5 L233.6 625.8 L315.5 613.2 L317.6 595.0 M224.3 642.0 L242.5 643.4 L257.0 649.5 L263.0 653.7 L270.2 668.0 L265.9 657.0 L256.5 647.1 L225.9 642.4 M44.0 768.3 L43.9 783.4 L24.0 899.4 L44.9 782.6 L44.1 768.7 M172.1 737.3 L114.9 750.9 L173.4 737.3 M162.8 756.4 L153.8 758.8 L150.8 763.9 L158.7 763.8 L163.2 755.9 M864.4 289.5 L867.9 287.1 L871.3 289.7 L871.2 301.6 L861.8 298.3 L862.6 294.7 L868.8 292.4 L863.9 292.2 L864.3 288.7 M698.9 398.3 L704.4 398.2 L703.6 430.7 L698.1 428.1 L699.5 399.1 M709.7 404.0 L714.5 403.5 L713.3 422.3 L709.9 421.0 L711.1 403.4 M271.5 685.5 L263.1 696.1 L248.7 710.9 L217.0 723.8 L227.9 898.4 L217.7 723.7 L249.0 709.5 L262.6 697.2 L272.8 685.9 M494.4 563.2 L436.9 572.8 L365.7 576.3 L431.4 572.7 L437.2 577.0 L439.3 596.4 L446.8 592.4 L487.9 590.3 L487.4 587.8 L485.0 590.2 L456.6 590.8 L438.6 594.8 L434.6 574.7 L445.2 571.7 L484.2 575.0 L493.9 579.5 L496.3 588.7 L499.0 587.8 L500.2 585.1 L497.2 584.9 L498.8 581.0 L497.7 561.6 L494.0 562.0 M484.4 564.8 L487.3 563.5 L497.8 569.4 L499.7 579.0 L494.6 579.8 L482.9 575.4 L457.0 571.4 L458.8 570.5 L483.6 564.9 M-0.1 88.6 L0.5 92.8 L274.9 158.9 L277.8 161.7 L282.0 184.5 L292.3 208.6 L308.7 232.6 L322.0 246.4 L340.3 258.8 L359.5 267.9 L379.4 273.4 L399.1 276.2 L400.5 503.8 L420.7 501.4 L421.6 504.3 L507.9 510.2 L423.0 503.1 L425.6 499.8 L443.7 498.4 L488.3 498.8 L504.7 502.9 L516.0 512.3 L542.3 519.8 L547.0 525.2 L546.0 531.5 L538.5 543.9 L523.8 552.9 L499.5 561.4 L503.2 561.0 L506.0 587.3 L524.0 586.7 L505.8 588.1 L504.9 574.0 L523.9 581.1 L557.5 575.7 L553.4 570.0 L554.4 559.6 L558.5 553.5 L568.3 549.7 L604.4 547.4 L639.9 547.1 L652.6 550.7 L654.4 547.7 L683.9 542.3 L683.7 545.4 L654.1 552.9 L688.4 545.4 L685.8 543.6 L653.7 547.0 L653.2 542.9 L663.5 538.2 L689.4 537.4 L688.6 526.7 L692.2 524.1 L757.1 535.1 L760.8 537.6 L739.6 540.0 L728.8 543.8 L706.0 545.7 L699.9 553.1 L663.5 559.4 L664.8 564.5 L665.7 558.9 L690.7 553.2 L705.9 552.6 L703.6 548.3 L705.2 546.4 L730.8 542.5 L740.1 538.3 L766.3 540.1 L810.1 530.8 L820.3 530.8 L824.4 532.3 L824.2 536.3 L823.1 532.8 L831.1 526.2 L837.5 529.1 L836.2 534.8 L840.1 532.7 L852.8 537.3 L850.7 572.4 L848.5 577.3 L852.5 574.2 L852.4 570.3 L859.3 576.2 L854.4 569.4 L854.4 539.4 L858.4 535.1 L875.3 535.3 L878.1 538.6 L902.4 541.1 L904.1 548.3 L898.2 570.7 L891.0 571.9 L887.6 575.5 L895.5 576.4 L899.9 570.2 L915.1 482.8 L961.9 482.7 L918.5 481.2 L920.0 402.6 L918.9 409.1 L915.7 409.8 L909.4 409.9 L900.7 401.2 L893.6 399.8 L894.6 395.6 L905.5 392.3 L904.7 383.3 L916.3 380.3 L917.6 355.2 L910.1 355.9 L899.8 365.7 L891.0 359.6 L890.8 366.3 L886.2 372.8 L881.1 376.7 L882.2 381.5 L879.3 384.4 L879.1 390.5 L874.9 394.0 L873.8 393.0 L874.3 376.5 L869.6 372.9 L870.8 367.2 L857.0 367.5 L851.5 339.2 L843.0 332.1 L831.0 330.9 L819.0 335.7 L805.0 347.5 L802.9 353.5 L803.8 370.5 L809.3 389.0 L812.3 390.5 L811.1 399.2 L821.9 420.1 L825.5 421.1 L829.8 415.0 L840.1 419.0 L839.9 416.4 L834.0 406.7 L826.6 409.9 L821.8 403.9 L821.4 401.8 L825.8 401.0 L826.4 398.3 L829.7 397.2 L832.5 402.8 L834.5 400.3 L838.8 400.0 L850.1 405.2 L851.6 412.3 L849.4 415.4 L845.1 416.1 L849.7 416.3 L854.6 406.7 L866.9 409.1 L867.4 411.3 L860.1 412.5 L860.1 417.4 L874.1 431.5 L876.8 441.9 L858.1 444.0 L857.8 447.0 L866.3 455.4 L868.0 462.0 L863.8 464.4 L854.9 465.6 L854.0 471.1 L865.4 473.5 L854.2 468.9 L854.5 466.3 L863.7 464.6 L908.7 462.2 L909.7 460.8 L907.3 462.3 L868.1 463.9 L866.0 453.7 L859.3 444.3 L870.4 444.0 L872.8 445.0 L873.2 444.2 L890.3 445.8 L891.7 444.3 L896.5 442.7 L899.3 448.6 L887.9 455.0 L875.3 456.4 L884.9 454.8 L888.3 457.7 L896.1 452.3 L901.0 444.8 L877.5 442.2 L880.8 416.9 L886.6 416.3 L895.5 422.1 L901.3 422.6 L902.5 418.5 L913.7 418.5 L915.6 412.3 L919.0 413.7 L918.0 463.1 L913.9 464.8 L917.0 481.1 L914.5 483.2 L903.8 539.7 L870.9 534.1 L875.5 526.8 L885.7 525.0 L885.9 519.2 L871.4 507.6 L871.1 499.0 L876.2 500.5 L877.2 508.0 L876.9 495.3 L883.6 488.2 L891.6 486.4 L891.3 478.9 L867.4 475.1 L863.8 478.7 L855.0 476.9 L844.1 477.3 L836.6 473.5 L809.3 468.6 L812.9 453.1 L824.6 455.3 L833.1 452.7 L839.8 465.4 L832.6 452.7 L825.7 453.5 L813.8 451.9 L810.3 467.8 L802.6 471.3 L802.2 474.6 L806.1 468.9 L837.2 473.3 L840.1 476.3 L846.5 478.1 L863.7 479.5 L880.8 488.5 L880.6 492.3 L875.4 498.0 L871.3 496.8 L824.6 496.2 L823.8 506.4 L822.4 506.9 L821.2 512.0 L813.7 520.3 L822.9 511.4 L853.7 507.9 L872.6 511.4 L874.3 522.1 L871.4 523.3 L874.1 525.5 L872.7 529.1 L853.9 528.8 L848.3 532.0 L845.4 528.6 L833.5 528.7 L830.1 523.4 L819.6 527.7 L813.0 523.1 L810.2 525.7 L771.1 531.9 L763.7 537.2 L738.3 531.0 L737.9 526.0 L761.5 529.2 L740.0 526.1 L738.8 519.3 L736.4 490.9 L773.2 495.8 L777.0 504.9 L773.9 497.4 L775.1 493.8 L783.8 492.9 L787.5 498.1 L791.3 495.9 L788.3 496.7 L784.7 493.5 L763.4 494.2 L743.2 491.9 L735.0 488.5 L691.6 483.1 L684.3 481.1 L658.3 481.0 L657.2 484.7 L654.3 484.5 L655.0 475.5 L683.9 474.5 L698.9 481.1 L737.2 478.9 L795.2 485.2 L804.5 487.1 L804.3 485.3 L797.3 485.3 L795.3 481.1 L798.9 481.1 L746.3 475.8 L742.7 474.6 L794.3 479.4 L794.2 484.7 L783.6 485.6 L739.0 480.0 L737.4 459.2 L740.3 451.4 L746.7 448.3 L739.9 444.2 L738.5 437.8 L738.0 445.5 L741.5 446.8 L740.8 453.0 L732.5 462.4 L719.7 479.8 L703.3 478.6 L703.2 475.2 L715.7 475.4 L702.8 474.9 L699.6 459.1 L707.8 450.3 L715.7 447.0 L712.8 445.9 L714.9 442.3 L720.0 445.2 L716.5 449.3 L723.7 449.4 L720.8 445.1 L729.9 441.8 L719.4 443.7 L712.8 440.5 L709.7 441.5 L690.6 462.3 L691.5 464.5 L704.2 448.0 L707.1 450.4 L691.0 470.9 L690.8 474.0 L696.1 464.3 L698.8 464.2 L700.0 480.2 L685.1 475.7 L657.0 474.2 L655.7 450.3 L653.5 450.0 L653.8 354.0 L660.0 354.4 L660.8 378.1 L658.6 381.7 L660.9 423.1 L658.9 428.1 L658.2 434.4 L662.9 434.5 L658.5 433.1 L657.4 429.6 L662.0 427.1 L660.3 391.0 L661.8 386.3 L659.8 383.0 L661.6 381.1 L659.6 370.7 L663.0 370.7 L665.0 355.1 L661.7 348.4 L665.7 346.6 L663.9 342.1 L668.0 339.9 L683.5 341.3 L683.9 404.5 L682.0 408.4 L683.8 411.7 L684.1 397.4 L686.1 393.4 L684.6 393.1 L682.4 382.5 L687.6 378.8 L688.0 385.4 L692.1 387.1 L689.4 431.6 L684.5 430.0 L684.2 431.5 L692.0 428.8 L693.0 388.0 L688.5 385.1 L688.5 380.5 L692.7 380.2 L693.2 339.1 L696.8 336.3 L698.6 337.3 L697.4 382.6 L699.7 396.8 L697.6 430.2 L713.6 431.1 L714.7 433.6 L707.7 436.8 L679.8 437.4 L671.2 442.9 L657.7 443.7 L660.8 445.3 L662.3 444.0 L669.1 444.2 L681.4 437.6 L681.9 444.0 L686.7 447.8 L696.9 435.9 L713.3 435.9 L713.7 431.0 L722.1 427.6 L715.4 427.4 L713.6 385.3 L713.7 400.2 L710.2 403.4 L709.7 398.0 L706.6 397.1 L706.9 345.8 L704.3 349.2 L706.6 394.2 L702.3 397.6 L699.1 388.3 L699.0 310.2 L704.0 304.7 L710.8 307.0 L710.2 323.7 L711.8 303.2 L737.7 300.8 L739.7 427.2 L736.6 429.8 L733.9 428.8 L731.3 407.1 L734.2 428.2 L722.3 425.9 L736.0 430.6 L738.4 432.9 L785.7 433.7 L787.4 429.0 L788.1 311.2 L791.2 312.3 L742.0 302.3 L738.0 299.7 L737.3 301.2 L706.9 305.2 L700.7 306.8 L697.9 327.8 L676.8 328.8 L677.5 339.5 L672.9 339.7 L671.0 336.8 L669.9 339.5 L655.8 344.0 L655.1 332.9 L659.3 328.3 L657.3 318.7 L665.6 312.9 L689.7 308.5 L660.0 316.0 L653.8 313.9 L653.9 269.9 L660.3 269.7 L666.1 265.2 L680.7 269.2 L684.0 274.0 L684.4 271.7 L688.9 268.6 L692.7 263.7 L687.5 270.4 L669.5 264.3 L662.0 267.2 L655.8 267.3 L656.6 249.1 L736.0 266.1 L737.9 270.6 L740.6 266.8 L858.0 292.2 L862.0 297.3 L858.1 297.7 L856.1 295.7 L857.1 317.9 L862.1 320.5 L861.3 332.2 L864.4 333.1 L867.0 347.3 L870.0 343.8 L871.3 331.5 L869.0 329.7 L868.0 320.5 L876.7 299.1 L873.1 294.1 L873.6 283.5 L866.2 280.1 L862.8 276.1 L861.1 276.3 L860.0 284.7 L857.0 285.0 L856.1 290.1 L851.6 292.3 L738.9 265.3 L739.2 127.9 L734.6 126.4 L734.3 130.1 L699.7 146.8 L703.6 147.9 L702.7 151.2 L671.9 165.7 L726.8 139.4 L735.6 138.6 L734.5 216.1 L736.4 218.8 L736.2 265.1 L490.9 210.2 L486.7 220.1 L474.8 239.6 L455.3 258.8 L425.2 272.7 L395.0 275.4 L359.8 267.4 L342.1 259.6 L322.5 246.1 L308.7 230.9 L291.3 208.1 L283.2 184.1 L276.4 158.0 L65.0 107.8 L63.8 105.7 L60.4 106.4 L54.0 104.3 L52.4 102.2 L48.8 104.3 L40.7 102.0 L39.6 99.2 L36.3 100.6 L29.8 99.3 L28.1 95.7 L26.3 97.2 L17.2 97.5 L14.1 93.9 L9.9 95.2 L1.1 90.3 M808.6 346.2 L812.0 344.8 L811.2 373.4 L806.8 376.1 L803.5 353.8 L807.8 346.6 M739.2 303.4 L746.4 302.0 L786.9 311.1 L785.4 359.3 L788.3 360.1 L787.5 371.8 L784.4 373.6 L783.7 392.9 L789.4 395.8 L784.3 399.0 L788.8 399.9 L788.4 430.1 L784.8 435.9 L771.0 434.7 L739.7 433.2 L738.2 431.5 L741.1 423.1 L739.3 422.8 L740.8 408.1 L737.7 403.6 L739.0 303.1 M913.8 265.8 L919.8 264.9 L917.6 267.7 L916.7 349.8 L902.4 343.1 L889.7 331.8 L881.9 315.5 L884.4 296.8 L888.5 289.3 L898.5 275.4 L912.0 264.3 M685.1 436.7 L693.0 436.4 L692.5 442.2 L688.4 445.9 L680.4 444.0 L683.3 436.7 M828.8 331.1 L839.7 332.2 L850.4 339.0 L856.2 360.4 L855.3 364.3 L847.6 359.5 L843.3 367.6 L846.9 368.4 L848.4 371.0 L836.6 376.0 L832.5 370.2 L835.1 366.5 L841.2 364.8 L841.9 358.7 L837.7 357.8 L835.5 362.5 L832.4 366.0 L831.0 373.4 L841.1 375.3 L848.1 372.9 L854.3 366.1 L860.4 369.7 L868.0 365.6 L869.6 373.9 L873.9 377.3 L873.9 389.9 L868.2 392.7 L864.6 384.3 L862.0 383.2 L851.1 388.7 L846.0 398.2 L821.7 398.0 L822.3 407.4 L817.2 411.3 L811.8 397.2 L811.3 342.0 L819.3 335.4 L828.7 332.3 M932.1 260.3 L958.5 259.2 L975.3 270.4 L988.1 289.8 L989.5 310.6 L979.2 329.7 L966.0 343.4 L952.2 353.1 L920.6 354.0 L919.8 351.6 L919.5 262.3 L932.2 261.3 M732.0 464.8 L737.3 464.2 L737.2 479.2 L724.2 477.4 L730.3 466.3 M824.3 408.5 L836.9 410.9 L838.6 414.3 L832.6 416.7 L824.0 414.0 L823.2 409.3 M842.6 398.3 L849.8 398.0 L854.0 400.5 L854.7 403.2 L845.7 403.6 L841.9 398.5 M643.6 556.3 L627.4 563.8 L603.8 573.1 L560.6 583.2 L532.2 587.0 L560.9 582.1 L603.5 573.4 L643.3 557.3 M667.1 483.5 L684.6 482.2 L701.9 487.7 L736.6 489.8 L738.0 521.9 L732.4 525.5 L715.8 523.2 L711.6 507.7 L714.3 511.3 L713.8 520.3 L709.6 521.9 L713.1 522.1 L712.3 525.1 L707.0 526.5 L704.7 497.4 L702.0 494.6 L700.9 488.9 L702.1 500.1 L689.7 499.0 L691.0 524.0 L685.2 526.5 L667.1 525.5 L665.0 521.5 L658.0 523.7 L656.6 519.4 L654.1 520.4 L651.5 513.1 L653.9 488.2 L667.2 483.2 M814.8 429.7 L797.7 434.9 L792.4 433.1 L799.2 435.1 L817.9 431.2 L818.4 435.1 L814.9 441.0 L808.9 440.7 L810.5 446.8 L808.7 442.8 L816.9 439.2 L817.2 430.4 L816.2 431.1 M657.4 526.0 L688.3 530.4 L689.0 537.6 L656.6 539.4 L656.4 527.6 M690.7 500.7 L704.8 500.9 L704.9 523.5 L702.2 525.1 L694.7 524.8 L693.0 520.5 L697.0 520.5 L690.6 517.0 L689.9 500.5 M1195.5 180.5 L1191.0 182.6 L1190.8 204.6 L1192.9 184.9 L1198.6 182.6 L1198.3 181.8 L1195.9 182.1 M907.1 358.4 L916.7 355.9 L917.3 358.2 L915.9 364.5 L911.4 363.0 L910.7 366.6 L917.4 371.2 L913.7 374.5 L916.3 379.4 L903.1 384.6 L906.2 388.3 L903.4 393.3 L892.2 395.1 L891.4 399.2 L878.7 404.5 L890.1 406.2 L895.4 399.9 L900.0 401.3 L902.7 406.4 L914.0 410.2 L912.3 417.8 L901.3 418.7 L900.9 422.8 L895.6 423.8 L890.3 417.0 L879.6 415.1 L878.3 412.7 L874.9 416.2 L869.3 409.1 L858.1 405.4 L855.7 401.7 L846.4 396.6 L851.8 388.3 L858.3 387.9 L863.1 389.6 L867.3 400.9 L873.4 400.0 L874.1 396.6 L882.7 388.8 L879.9 386.5 L883.2 376.1 L886.8 373.9 L893.4 363.0 L899.9 366.8 L907.6 357.4 M889.0 400.0 L893.1 401.0 L889.6 405.4 L881.2 406.1 L882.2 402.9 L888.4 400.8 M860.7 413.1 L866.9 411.8 L872.2 423.5 L868.7 425.0 L861.7 420.9 L859.6 415.2 M962.6 352.5 L966.7 351.5 L965.2 362.3 L963.0 361.9 L963.7 352.6 M712.9 523.5 L731.2 524.5 L736.5 526.1 L738.0 530.3 L723.6 529.9 L714.6 528.0 L712.9 525.3 M976.9 357.4 L980.1 357.2 L981.3 368.0 L977.6 367.6 L976.8 359.4 M807.2 474.1 L821.6 477.5 L806.9 474.8 M662.4 565.1 L662.3 581.5 L655.0 598.1 L662.4 581.5 L662.9 566.1 M436.1 597.0 L433.1 608.0 L436.1 616.4 L441.1 627.4 L438.2 733.4 L441.5 738.4 L430.2 818.8 L407.8 831.3 L373.3 842.4 L337.6 844.4 L318.8 841.1 L304.4 836.8 L296.5 828.8 L288.5 815.9 L288.8 801.0 L296.9 761.9 L294.3 741.0 L297.0 762.8 L292.1 786.9 L288.5 817.0 L291.6 824.6 L303.0 834.4 L302.4 838.9 L294.2 833.9 L284.6 821.4 L280.9 802.7 L282.1 813.0 L287.2 828.0 L302.2 841.6 L327.8 846.8 L308.1 843.1 L302.9 837.7 L306.8 836.4 L318.8 841.7 L337.1 844.3 L373.1 843.1 L409.9 831.7 L432.3 819.0 L432.3 843.1 L424.2 899.2 L431.6 830.8 L436.4 821.3 L432.1 817.1 L441.3 739.7 L441.6 634.1 L442.1 630.6 L446.9 629.5 L435.2 615.1 L432.2 605.6 L436.8 597.8 M965.3 364.7 L967.9 365.5 L967.6 396.4 L963.0 395.3 L963.3 365.5 M963.8 400.2 L967.8 401.3 L967.9 414.6 L964.0 413.8 L963.6 401.3 M1117.7 294.0 L1121.9 291.4 L1125.3 300.1 L1123.0 323.7 L1119.7 321.7 L1117.6 293.9 M1024.3 362.8 L1031.5 364.9 L1031.5 373.4 L1026.5 371.6 L1026.4 366.7 L1023.3 363.6 M985.5 320.5 L988.4 320.1 L989.2 346.0 L993.0 362.8 L993.9 369.7 L990.6 371.7 L993.9 395.2 L989.0 395.6 L989.4 401.0 L992.9 465.2 L983.4 465.6 L981.8 464.0 L981.6 450.6 L978.2 448.3 L976.6 449.4 L977.7 459.8 L969.2 461.4 L967.9 441.6 L964.9 438.2 L968.3 442.8 L966.8 460.5 L965.3 464.2 L963.1 462.5 L962.8 444.9 L957.4 437.4 L953.9 411.6 L955.7 393.3 L955.0 350.9 L963.0 347.0 L964.9 430.9 L966.8 431.6 L966.7 343.9 L972.0 341.1 L976.9 349.6 L977.0 439.1 L979.0 438.4 L980.5 433.4 L982.1 362.6 L976.4 334.1 L984.3 329.9 L984.0 325.0 L984.9 322.6 M825.7 497.7 L836.8 496.4 L837.1 497.9 L838.2 506.8 L826.5 510.8 L824.4 498.9 M805.1 527.5 L809.7 526.4 L811.4 529.5 L771.5 538.8 L768.1 539.0 L768.8 532.4 L804.4 527.5 M998.6 383.7 L1002.5 383.6 L1004.7 407.9 L996.5 406.8 L997.5 385.1 M1100.2 294.7 L1108.4 295.9 L1107.6 300.5 L1104.9 303.5 L1107.2 308.0 L1106.5 342.6 L1100.0 374.1 L1100.9 389.8 L1095.9 395.8 L1090.1 418.3 L1092.6 449.3 L1090.0 458.4 L1085.9 456.7 L1084.8 420.5 L1086.8 396.5 L1092.1 391.0 L1096.5 362.5 L1092.7 354.3 L1095.3 336.6 L1092.9 322.9 L1089.4 320.3 L1086.0 325.6 L1078.3 326.2 L1075.5 340.6 L1067.1 343.6 L1064.5 430.3 L1062.7 431.4 L1059.6 413.1 L1059.5 398.0 L1062.4 391.5 L1060.4 343.6 L1053.4 346.9 L1053.8 367.4 L1050.2 367.1 L1047.6 318.0 L1041.0 315.4 L1032.6 318.4 L1025.3 314.1 L1016.7 314.4 L1011.5 311.0 L1009.7 314.7 L1035.5 320.0 L1035.7 368.6 L1032.2 370.3 L1029.3 359.3 L1024.5 361.4 L1017.0 360.6 L1025.4 362.1 L1024.4 370.6 L1016.8 371.0 L1022.3 371.7 L1023.2 376.7 L1020.8 378.4 L1020.4 402.1 L1017.4 439.2 L1020.1 466.2 L1017.0 469.6 L1013.5 452.3 L1014.8 437.7 L1012.8 419.3 L1016.3 404.1 L1012.2 386.7 L1013.8 368.1 L1014.4 365.6 L1010.0 360.6 L1008.8 315.8 L1000.6 318.4 L999.7 349.6 L1001.6 368.3 L996.7 368.0 L993.4 364.6 L992.2 352.2 L989.7 346.6 L988.7 333.9 L990.2 334.0 L989.3 332.8 L987.8 310.8 L990.9 309.1 L1100.1 295.0 M1004.1 316.8 L1006.2 316.0 L1008.9 317.9 L1009.7 358.8 L1004.7 361.2 L1009.5 360.8 L1012.9 364.8 L1012.2 386.9 L1016.3 404.2 L1013.7 420.3 L1016.1 429.8 L1013.0 443.8 L1015.5 467.3 L1012.9 468.1 L1005.9 467.2 L1007.5 434.5 L1004.2 421.6 L1002.7 420.2 L1005.3 407.5 L1001.6 388.8 L1002.4 375.9 L1001.3 376.0 L1003.5 365.2 L1000.6 361.2 L1002.8 318.4 M653.5 601.4 L635.9 621.4 L636.0 648.3 L638.9 653.0 L640.6 680.5 L642.0 680.0 L643.4 660.4 L639.9 649.0 L643.7 639.1 L641.3 622.6 L639.3 618.2 L649.5 607.6 L654.3 606.5 L671.3 612.4 L653.3 605.9 L655.1 601.8 M933.9 260.0 L912.8 265.5 L895.1 277.0 L884.1 298.4 L882.9 314.6 L889.7 332.9 L899.0 342.6 L917.3 350.4 L917.7 353.4 L953.3 353.4 L953.7 382.2 L955.3 386.0 L952.0 431.7 L953.7 464.3 L998.1 465.9 L997.5 433.1 L1001.3 431.4 L1002.9 465.8 L1000.2 466.7 L1019.2 469.6 L1030.5 474.7 L1107.2 479.9 L1108.9 463.6 L1121.7 462.8 L1128.4 459.7 L1160.9 421.0 L1171.9 415.3 L1161.1 412.4 L1153.3 416.0 L1152.1 412.7 L1155.0 410.9 L1150.2 412.8 L1144.2 405.0 L1137.4 404.0 L1131.5 397.3 L1125.2 396.6 L1125.1 298.5 L1122.1 291.1 L992.5 309.8 L988.2 305.7 L986.8 283.9 L971.9 266.6 L958.0 260.4 L935.0 260.6 M1054.6 345.4 L1060.1 343.7 L1062.9 351.0 L1062.1 373.2 L1059.7 375.6 L1057.4 375.0 L1054.6 372.9 L1055.4 356.6 L1053.4 356.0 L1055.6 344.4 M838.1 497.1 L851.4 497.8 L851.8 505.6 L841.8 508.2 L838.4 499.7 M866.5 476.2 L889.0 478.6 L890.2 485.2 L880.7 486.9 L865.2 481.0 L866.1 478.2 M1079.2 328.1 L1084.8 326.4 L1085.5 329.1 L1085.8 369.4 L1081.1 368.3 L1081.6 372.4 L1077.4 373.6 L1076.7 363.0 L1078.2 361.2 L1081.8 348.4 L1078.1 346.7 L1079.0 337.0 L1076.8 332.6 L1081.3 332.1 L1079.6 327.2 M1087.3 321.6 L1091.5 320.9 L1093.9 324.1 L1096.4 331.9 L1093.3 350.4 L1094.1 361.6 L1092.7 377.6 L1088.7 377.7 L1085.8 372.9 L1087.3 322.7 M856.2 497.9 L869.4 498.1 L870.0 508.1 L855.5 507.1 L854.3 499.8 M953.6 430.0 L957.4 430.2 L958.5 437.5 L962.9 445.7 L961.7 453.1 L952.4 443.5 L953.7 432.3 M995.8 371.6 L999.2 369.2 L1001.2 372.9 L996.5 387.3 L996.8 409.1 L1002.3 409.1 L1003.1 413.1 L1002.4 428.4 L996.3 431.8 L996.1 438.5 L998.6 449.3 L998.6 465.7 L994.2 465.6 L992.2 462.1 L990.5 421.3 L993.1 420.9 L991.3 380.1 L995.0 378.8 L996.2 371.1 M497.0 640.3 L473.0 655.2 L450.4 672.6 L451.4 714.5 L459.1 714.5 L453.2 723.2 L460.2 766.2 L459.5 783.9 L450.0 801.1 L443.7 809.4 L440.0 808.0 L443.8 810.7 L450.0 801.7 L458.6 782.8 L457.0 766.7 L453.8 723.0 L466.3 713.4 L503.7 731.1 L476.0 719.0 L460.0 708.5 L458.3 702.1 L460.4 693.3 L457.6 702.7 L459.2 711.9 L456.0 713.2 L452.0 712.9 L450.7 673.5 L474.2 653.4 L499.2 640.0 L551.0 643.4 L573.8 641.9 L575.7 730.2 L573.0 735.9 L560.7 735.8 L558.9 744.9 L560.6 738.6 L563.4 737.1 L570.1 745.8 L570.9 744.0 L574.9 745.3 L578.0 825.7 L575.6 830.0 L569.3 831.0 L573.8 841.3 L574.0 859.5 L572.8 834.9 L576.9 834.1 L578.0 837.9 L582.5 899.5 L573.5 763.3 L576.9 715.8 L574.6 642.1 L551.0 643.4 L499.3 641.2 M1039.3 316.5 L1043.9 315.7 L1048.2 317.6 L1049.2 327.4 L1049.3 377.6 L1048.3 395.0 L1050.4 450.1 L1049.6 475.9 L1044.8 472.7 L1045.9 395.9 L1045.7 474.0 L1034.8 473.7 L1035.9 326.9 L1037.7 316.4 M818.8 535.6 L818.7 547.7 L819.2 536.4 M1120.0 341.6 L1123.6 340.6 L1125.6 344.0 L1123.5 350.7 L1118.7 349.3 L1120.3 343.6 M953.5 453.8 L960.5 453.3 L959.8 463.2 L953.1 463.0 L952.5 455.1 M1082.2 372.5 L1085.2 372.4 L1087.1 374.3 L1084.8 378.8 L1075.8 380.2 L1072.6 374.5 L1079.5 373.6 L1081.0 375.0 L1081.6 372.6 M1068.9 343.9 L1072.5 341.9 L1075.2 345.5 L1072.5 381.3 L1075.8 382.6 L1075.3 408.8 L1072.1 440.2 L1063.7 440.2 L1066.1 391.0 L1066.5 343.6 M1001.8 428.7 L1005.5 429.0 L1006.7 438.4 L1002.9 437.5 L1001.7 430.5 M1022.0 378.8 L1023.8 378.9 L1026.7 382.3 L1028.8 380.4 L1032.2 380.3 L1028.9 412.2 L1030.2 470.2 L1028.2 472.9 L1021.3 469.1 L1021.8 461.1 L1020.5 461.7 L1023.7 454.5 L1018.6 449.5 L1018.9 440.6 L1023.9 440.6 L1019.4 438.4 L1020.1 429.4 L1022.9 427.4 L1019.7 419.2 L1025.0 417.8 L1021.5 415.3 L1021.1 412.9 L1025.0 410.9 L1025.3 406.8 L1021.5 406.1 L1021.8 401.9 L1024.7 403.5 L1020.8 397.2 L1020.8 379.1 M873.9 513.0 L879.9 512.6 L884.3 519.8 L884.9 524.1 L875.2 526.9 L874.7 513.7 M1056.0 377.2 L1059.9 377.5 L1063.2 382.4 L1062.2 391.7 L1059.6 397.0 L1059.6 414.9 L1063.2 435.1 L1061.2 442.1 L1055.5 437.7 L1052.6 425.8 L1051.0 403.0 L1053.0 400.4 L1052.5 399.1 L1052.0 390.1 L1052.3 384.6 L1051.3 381.3 L1055.6 378.6 M854.6 530.2 L869.0 528.7 L871.7 534.0 L860.0 533.7 L854.7 531.7 M736.5 590.2 L736.6 639.1 L733.6 641.3 L712.3 633.7 L735.6 641.9 L737.7 640.5 L736.5 591.1 M377.3 859.2 L375.1 862.4 L381.0 867.4 L382.2 861.7 L384.9 862.2 L376.9 858.9 M565.4 736.0 L572.0 734.4 L574.2 742.5 L570.6 744.1 L566.1 736.6 M1031.8 390.2 L1036.4 390.8 L1035.4 462.9 L1033.4 471.2 L1031.7 470.4 L1028.4 435.6 L1031.7 391.0 M1120.5 355.4 L1124.7 354.4 L1125.6 398.3 L1124.1 401.3 L1116.1 402.8 L1113.0 400.6 L1113.7 373.7 L1116.6 359.5 L1120.6 356.6 M1002.8 452.0 L1006.7 452.1 L1005.9 467.4 L1003.1 467.3 L1002.1 453.5 M639.9 688.8 L640.3 716.2 L641.7 715.5 L639.0 691.5 M964.4 487.1 L974.6 486.6 L975.2 488.5 L964.6 490.7 L963.4 488.1 M564.0 747.4 L558.2 778.2 L562.0 776.8 L563.8 774.5 L561.1 773.3 L563.5 747.6 M1110.4 294.3 L1115.0 293.7 L1119.7 301.7 L1122.0 341.6 L1112.8 372.9 L1115.1 396.3 L1112.0 398.3 L1114.5 402.2 L1115.1 420.5 L1110.6 425.6 L1103.1 422.3 L1102.7 392.9 L1103.3 441.1 L1103.5 448.7 L1102.0 435.0 L1109.0 437.7 L1110.3 457.7 L1104.4 457.0 L1103.6 471.9 L1101.4 475.5 L1098.6 475.4 L1095.9 464.4 L1098.0 463.2 L1100.7 454.9 L1091.1 452.7 L1093.8 432.7 L1091.8 418.2 L1095.0 407.3 L1094.1 397.5 L1097.9 397.4 L1099.8 390.9 L1099.6 375.8 L1108.5 337.8 L1104.8 312.8 L1109.2 294.8 M1048.1 423.0 L1052.2 423.8 L1054.8 437.7 L1059.1 441.7 L1054.3 475.1 L1049.6 474.8 L1048.3 424.2 M978.7 483.7 L1005.3 484.2 L1006.7 485.3 L995.1 488.3 L978.6 487.5 L977.7 484.4 M1084.6 376.5 L1088.5 376.9 L1088.1 384.4 L1092.3 386.0 L1092.2 389.9 L1086.5 396.7 L1085.0 420.6 L1086.6 465.0 L1091.0 472.0 L1089.4 478.7 L1078.7 477.3 L1078.1 470.0 L1080.3 469.6 L1077.6 463.2 L1079.5 452.1 L1076.8 451.0 L1073.8 410.8 L1078.1 381.3 L1084.9 377.5 M950.6 509.7 L954.6 510.1 L953.6 531.7 L950.5 528.6 L950.6 509.8 M1117.0 405.2 L1120.7 403.6 L1123.9 407.0 L1123.3 416.1 L1115.6 417.8 L1114.3 405.2 M954.9 506.9 L965.3 507.6 L967.7 519.5 L973.0 520.4 L975.3 524.0 L955.4 528.8 L955.0 508.3 M1058.2 447.8 L1061.4 446.3 L1063.0 448.4 L1064.8 445.7 L1068.7 447.5 L1065.4 476.7 L1057.5 475.2 L1058.9 460.6 L1060.6 465.5 L1055.0 464.9 L1057.5 447.5 M1132.4 409.4 L1145.1 408.9 L1148.2 412.9 L1130.1 414.4 L1130.2 410.9 L1132.6 410.7 M1069.4 445.8 L1073.7 445.4 L1075.8 447.9 L1076.3 464.0 L1074.3 478.1 L1066.5 476.9 L1069.9 447.4 M772.3 653.5 L775.5 652.6 L787.7 657.9 L790.3 661.5 L781.3 660.5 L773.1 654.9 M580.9 747.3 L583.0 824.7 L587.7 833.4 L583.0 825.4 L580.8 749.6 M1136.1 413.6 L1149.4 414.2 L1154.4 416.0 L1155.8 418.6 L1129.4 452.3 L1115.7 459.2 L1112.9 460.2 L1109.6 456.8 L1108.7 429.5 L1116.9 419.0 L1133.9 414.0 M993.6 521.8 L1009.9 521.9 L1009.0 548.5 L973.6 536.8 L977.3 539.5 L998.2 545.2 L1003.7 550.2 L1003.2 553.1 L967.6 541.6 L958.8 542.3 L954.0 536.0 L953.8 530.9 L960.9 525.7 L980.2 523.6 L980.6 521.9 L993.2 522.1 M1091.1 458.5 L1094.9 459.0 L1097.9 462.0 L1096.3 474.9 L1091.7 478.0 L1090.1 477.4 L1090.9 470.9 L1088.2 467.8 L1089.0 460.7 M1011.6 512.7 L1023.4 513.6 L1024.3 525.1 L1021.7 525.3 L1011.5 525.7 L1010.6 514.4 M951.1 538.9 L954.2 537.6 L956.0 541.8 L967.1 541.6 L998.2 552.4 L997.0 555.3 L973.7 550.7 L979.5 588.4 L975.1 595.0 L948.6 594.7 L954.6 542.9 L952.7 568.2 L949.7 569.6 L947.3 560.8 L950.9 538.2 M647.1 756.3 L647.7 764.9 L651.5 768.7 L656.2 812.5 L651.4 766.8 L646.7 757.9 M1127.5 452.3 L1130.3 452.9 L1133.4 455.3 L1121.6 463.4 L1117.8 463.5 L1117.2 460.2 L1127.4 452.7 M947.0 601.5 L945.1 606.0 L942.6 607.4 L944.5 611.7 L947.9 610.5 L946.2 601.9 M1186.8 274.0 L1187.4 500.5 L1184.0 502.6 L1183.1 497.2 L1182.8 502.2 L1178.0 507.9 L1168.4 509.9 L1148.5 510.4 L1125.5 505.4 L1122.8 510.3 L1166.6 515.4 L1181.7 515.1 L1185.7 517.0 L1182.9 521.7 L1164.0 521.6 L1186.9 523.2 L1187.5 583.3 L1185.6 585.5 L1066.2 567.2 L1063.4 549.3 L1061.5 511.8 L1031.4 512.3 L1026.7 515.6 L1021.9 512.5 L1007.2 515.3 L1006.6 512.8 L1001.0 512.6 L991.4 517.1 L999.6 513.1 L1006.5 513.6 L1005.4 520.8 L969.7 520.4 L966.9 507.1 L952.0 505.2 L947.9 495.3 L963.8 491.0 L1002.1 493.0 L1006.5 496.7 L1003.9 493.1 L977.0 490.1 L976.8 488.3 L1007.2 487.5 L1008.8 483.3 L964.0 483.4 L962.4 491.7 L948.2 494.1 L951.0 503.9 L951.4 540.1 L949.2 559.2 L946.7 559.4 L945.3 594.3 L919.9 591.8 L920.4 485.5 L918.9 601.2 L916.3 606.1 L902.1 606.6 L886.4 602.4 L878.1 590.6 L877.9 583.7 L878.1 596.5 L861.2 594.4 L881.8 599.7 L890.4 603.8 L914.8 607.5 L915.2 702.4 L912.4 703.7 L876.6 690.8 L912.8 704.2 L918.6 708.2 L914.6 709.9 L825.6 675.1 L824.6 674.2 L820.4 674.3 L817.0 669.3 L808.3 670.2 L804.4 664.5 L771.4 651.3 L770.9 653.2 L762.3 651.8 L1198.6 816.4 L919.8 712.0 L921.9 708.5 L1045.8 752.4 L1193.5 808.4 L1092.2 769.4 L925.1 709.9 L919.7 704.5 L919.1 607.5 L923.3 605.5 L921.6 594.2 L930.6 592.9 L949.1 598.1 L976.9 594.8 L979.3 588.4 L975.1 555.2 L980.8 553.1 L1000.5 557.9 L1009.9 556.0 L1011.2 527.0 L1024.9 527.0 L1035.6 532.7 L1026.7 527.3 L1026.8 516.4 L1029.6 513.8 L1059.0 513.1 L1061.2 548.5 L1052.7 551.7 L1051.8 551.9 L1060.2 554.7 L1062.0 564.0 L1029.0 560.4 L1025.7 557.2 L1025.3 555.3 L1021.6 558.9 L1014.9 558.3 L1013.5 560.0 L1024.5 562.7 L1022.5 603.5 L1027.2 603.7 L1027.8 561.8 L1059.1 567.2 L1062.1 571.4 L1064.1 573.4 L1068.4 599.5 L1067.7 610.0 L1073.1 620.9 L1069.4 622.7 L1076.0 625.3 L1073.7 617.3 L1066.4 567.8 L1186.6 587.9 L1186.4 595.3 L1173.8 592.1 L1191.6 594.1 L1191.6 577.8 L1192.0 574.7 L1198.5 577.6 L1192.3 576.0 L1189.1 578.5 L1186.8 573.2 L1187.1 273.7 M1129.8 508.1 L1139.2 508.4 L1142.6 511.4 L1134.0 512.4 L1130.0 512.1 L1130.4 508.5 M660.6 815.5 L660.0 826.5 L646.6 820.9 L661.1 829.0 L669.3 829.0 L698.8 850.1 L671.5 829.1 L661.6 827.2 L660.5 816.3 M636.2 848.2 L636.1 850.9 L638.5 853.7 L637.0 849.1 L642.1 849.7 L637.4 847.5 M1142.9 510.6 L1157.2 509.3 L1161.2 510.0 L1161.9 513.8 L1144.5 513.3 L1143.8 511.0 M1010.4 559.3 L1012.9 626.6 L1008.2 627.1 L1008.9 629.6 L1004.0 631.7 L989.9 625.8 L1003.6 631.7 L1015.4 632.4 L1012.8 614.1 L1010.5 560.8 M1175.0 508.6 L1180.4 507.2 L1177.5 516.1 L1171.2 514.0 L1175.6 510.5 M1182.0 501.9 L1186.9 502.5 L1185.7 516.1 L1181.4 514.5 L1181.7 504.6 M1012.0 894.2 L1012.8 898.5 L1013.7 894.4 L1022.0 899.8 L1012.7 893.6\"/></svg>\n        <div class=\"brand\" style=\"position:relative\"><img class=\"logo\" alt=\"PORA\" src=\"https://www.pora.sk/img/logo-coral.png\"><span class=\"tag\">Vianoce 2026 · garancia cien</span></div>\n        <canvas class=\"hd\" id=\"hd\" role=\"img\" aria-label=\"F***ing cool voucher.\"></canvas><img id=\"ph\" alt=\"\" style=\"display:none\" src=\"https://www.pora.sk/img/ads/carskeho_1_ls.jpg\">\n        <svg class=\"tree\" viewBox=\"0 0 100 214\" aria-hidden=\"true\"><g fill=\"#D1FF05\" stroke=\"#111113\" stroke-width=\"3\" stroke-linejoin=\"round\"><path d=\"M50 30 74 80H26z\"/><path d=\"M50 60 84 126H16z\"/><path d=\"M50 102 94 176H6z\"/></g><rect x=\"44\" y=\"176\" width=\"12\" height=\"12\" fill=\"#111113\"/><g fill=\"none\" stroke=\"#7548A8\" stroke-width=\"4\" stroke-linecap=\"round\"><path d=\"M33 68q17 12 34-3\"/><path d=\"M26 110q24 16 48-4\"/><path d=\"M17 158q33 18 66-5\"/></g><path d=\"M50 4v26M37 17h26\" stroke=\"#EF5A45\" stroke-width=\"8\" stroke-linecap=\"round\"/><g stroke=\"#111113\" stroke-width=\"1.6\"><circle cx=\"42\" cy=\"56\" r=\"4.5\" fill=\"#EF5A45\"/><circle cx=\"60\" cy=\"84\" r=\"4.5\" fill=\"#FAF9F6\"/><circle cx=\"36\" cy=\"96\" r=\"5\" fill=\"#FF4FA3\"/><circle cx=\"66\" cy=\"118\" r=\"5\" fill=\"#EF5A45\"/><circle cx=\"30\" cy=\"140\" r=\"5\" fill=\"#FAF9F6\"/><circle cx=\"54\" cy=\"150\" r=\"5.5\" fill=\"#FF4FA3\"/><circle cx=\"78\" cy=\"162\" r=\"5\" fill=\"#EF5A45\"/></g><path d=\"M34 188h32l-5 22H39z\" fill=\"#111113\"/></svg>\n        <div class=\"fields\" style=\"position:relative\"><canvas class=\"g\" data-c=\"#111113\" data-a=\".08\"></canvas>\n          <div class=\"f\"><small>Vystavený pre</small><b>{{name}}</b><i>{{gift}}</i></div>\n          <div class=\"f\"><small>Balík</small><b>{{pack}}</b><i>{{packdesc}}</i></div>\n          <div class=\"f\"><small>Garantovaná cena</small><b>{{price}}</b><i>bez DPH · cenník 2026</i></div>\n        </div>\n        <div class=\"micro\" id=\"micro\"></div>\n      </div>\n      <div class=\"stub\">\n        <div class=\"qr\" id=\"qr\"><span>QR</span></div>\n        <div class=\"code\">{{code}}</div>\n        <small>Naskenujte a overte pravosť</small>\n        <div class=\"no\">Č. {{number}}<br>Platí do 31. 3. 2027</div>\n        <div class=\"seal\" title=\"Ochranná známka\"><svg viewBox=\"0 0 40 40\" aria-hidden=\"true\"><path d=\"M14 2h12v12h12v12H26v12H14V26H2V14h12z\" fill=\"#111113\"/></svg></div>\n      </div>\n      \n    </div><div class=\"v back\">\n      <div class=\"bl\">\n        <h2>Pravidlá hry</h2>\n        <p>Staré ceny, nový interiér. Tento voucher drží cenu roku 2026, aj keď začneme navrhovať až po Novom roku.</p>\n        <div class=\"until\"><small>Uplatnite najneskôr</small><b>31. 3. 2027</b></div>\n      </div>\n      <div class=\"br\">\n        <canvas class=\"g\" data-c=\"#D1FF05\" data-a=\".06\"></canvas>\n        <h3 style=\"position:relative\">Podmienky použitia</h3>\n        <ol style=\"position:relative\">\n          <li>Voucher potvrdzuje <b>záväznú objednávku</b> návrhu interiéru prijatú štúdiom PORA do 31. 12. 2026.</li>\n          <li>Garantuje <b>cenu balíka z prednej strany</b> podľa cenníka 2026, bez DPH.</li>\n          <li><b>Platí do 31. 3. 2027.</b> Dovtedy treba začať spoluprácu: úvodné stretnutie alebo zameranie a podpis zmluvy.</li>\n          <li>Po tomto dátume voucher <b>bez náhrady prepadá</b> a platí aktuálny cenník.</li>\n          <li>Rozsah: Mini do 20 m², Design do 100 m². Väčšia plocha sa dopočíta podľa cenníka 2026.</li>\n          <li>Je vystavený <b>na meno</b>. Darovať ho môžete, zmenu mena nahláste pred uplatnením.</li>\n          <li>Každý voucher má <b>jedinečný kód</b> evidovaný v štúdiu a dá sa uplatniť len raz. Kópia bez platného kódu je neplatná.</li>\n          <li>Nie je platobný prostriedok a nedá sa vymeniť za peniaze. Nevzťahuje sa na Variant 2 Realizácia, materiál ani práce tretích strán.</li>\n        </ol>\n        <div class=\"how\" style=\"position:relative\"><h3>Ako voucher uplatniť</h3><div class=\"steps\"><div><b>1</b><span>Naskenujte QR kód na prednej strane. Ukáže, že voucher je pravý a dokedy platí.</span></div><div><b>2</b><span>Ozvite sa nám do 31. 3. 2027 e-mailom alebo telefonicky a pošlite kód vouchera.</span></div><div><b>3</b><span>Dohodneme úvodné stretnutie a v zmluve vám potvrdíme cenu z vouchera.</span></div></div></div>\n        <div class=\"foot\" style=\"position:relative\"><span>info@pora.sk · +421 903 494 977 · www.pora.sk</span><span>PORA s.r.o. · IČO 53834691 · Košice</span></div>\n      </div>\n    </div><script src=\"https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js\"></script><script>\n(function(){\n  // mikrotext s kódom\n  var m=document.getElementById('micro'),t='';for(var i=0;i<40;i++)t+='PORA PLUS · {{code}} · F***ING COOL INTERIORS · ';m.textContent=t;\n  // nápis ako na webe: hrubý obrys okolo písmen, okraje „roztrhané“ šumom; pod hviezdičkami priehľad na fotku\n  function noiseField(w,h,cell,seed){var gw=Math.ceil(w/cell)+2,gh=Math.ceil(h/cell)+2,g=new Float32Array(gw*gh),s=seed,i;for(i=0;i<g.length;i++){s=(s*16807)%2147483647;g[i]=s/2147483647*2-1;}\n    return function(x,y){var fx=x/cell,fy=y/cell,ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),i=iy*gw+ix;return (g[i]*(1-sx)+g[i+1]*sx)*(1-sy)+(g[i+gw]*(1-sx)+g[i+gw+1]*sx)*sy;};}\n  function headline(){var c=document.getElementById('hd'),r=c.getBoundingClientRect();if(!r.width)return;var d=Math.min(2.5,Math.max(1.5,window.devicePixelRatio||1)),W=Math.round(r.width*d),H=Math.round(r.height*d);\n    var F='\"Big Shoulders Display\",\"Arial Narrow\",Impact,sans-serif',mk=function(){return document.createElement('canvas');};\n    var m=mk();m.width=W;m.height=H;var g=m.getContext('2d');g.font='900 100px '+F;var wRef=Math.max(g.measureText('VOUCHER.').width,g.measureText('F***ING').width)/100;\n    var lh=.95,s=Math.min(W/(wRef*1.12),H/(3*lh+.3)),bx=s*.2,ys=[s*.98,s*(.98+lh),s*(.98+2*lh)];\n    function cool(ctx,x,y,fill,stroke){ctx.font='900 '+s+'px '+F;var wC=ctx.measureText('C').width,wO=ctx.measureText('O').width;ctx.fillStyle=fill;\n      var put=function(ch,X,Y){if(stroke)ctx.strokeText(ch,X,Y);ctx.fillText(ch,X,Y);},cx=x;put('C',cx,y);cx+=wC;put('O',cx,y);cx+=wO;\n      var ox=cx-s*.09;ctx.save();ctx.translate(ox+wO*.7,y);ctx.rotate(22*Math.PI/180);put('O',-wO*.7,0);ctx.restore();cx=ox+wO+s*.155;put('L',cx,y);cx+=ctx.measureText('L').width;return cx-x;}\n    function words(ctx,fill,stroke){ctx.font='900 '+s+'px '+F;ctx.fillStyle=fill;[['F***ING',0],['VOUCHER.',2]].forEach(function(a){if(stroke)ctx.strokeText(a[0],bx,ys[a[1]]);ctx.fillText(a[0],bx,ys[a[1]]);});}\n    // maska roztrhaného papiera\n    g.textBaseline='alphabetic';g.lineJoin='round';g.lineCap='round';g.lineWidth=s*.2;g.strokeStyle='#000';words(g,'#000',true);cool(g,bx,ys[1],'#000',true);\n    var src=g.getImageData(0,0,W,H),out=g.createImageData(W,H),a=src.data,o=out.data;\n    var n1=noiseField(W,H,Math.max(4,s*.16),7),n2=noiseField(W,H,Math.max(2,s*.045),91),n3=noiseField(W,H,Math.max(4,s*.16),33),n4=noiseField(W,H,Math.max(2,s*.045),57),A1=s*.05,A2=s*.018,x,y;\n    for(y=0;y<H;y++)for(x=0;x<W;x++){var X=(x+n1(x,y)*A1+n2(x,y)*A2)|0,Y=(y+n3(x,y)*A1+n4(x,y)*A2)|0;if(X<0||Y<0||X>=W||Y>=H)continue;if(a[(Y*W+X)*4+3]>110){var q=(y*W+x)*4;o[q]=250;o[q+1]=249;o[q+2]=246;o[q+3]=255;}}\n    g.clearRect(0,0,W,H);g.putImageData(out,0,0);\n    // výsledok\n    c.width=W;c.height=H;var ctx=c.getContext('2d');ctx.clearRect(0,0,W,H);ctx.textBaseline='alphabetic';ctx.font='900 '+s+'px '+F;\n    var ph=document.getElementById('ph'),wF=ctx.measureText('F').width,wS=ctx.measureText('***').width;\n    if(ph&&ph.complete&&ph.naturalWidth){var hx=bx+wF-s*.06,hy=ys[0]-s*.5,hw=wS+s*.12,hh=s*.62,k=Math.max(hw/ph.naturalWidth,hh/ph.naturalHeight)*2.6;\n      ctx.save();ctx.beginPath();ctx.rect(hx,hy,hw,hh);ctx.clip();ctx.drawImage(ph,hx-ph.naturalWidth*k*.3,hy-ph.naturalHeight*k*.38,ph.naturalWidth*k,ph.naturalHeight*k);\n      var gr=ctx.createLinearGradient(0,hy,0,hy+hh*.5);gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(hx,hy,hw,hh);ctx.restore();}\n    ctx.save();ctx.shadowColor='rgba(0,0,0,.34)';ctx.shadowBlur=s*.06;ctx.shadowOffsetY=s*.03;ctx.drawImage(m,0,0);ctx.restore();\n    words(ctx,'#111113');var cap=s*.74,wc=cool(ctx,-99999,0,'#000');ctx.fillStyle='#D1FF05';ctx.fillRect(bx-s*.04,ys[1]-cap*.4,wc+s*.08,cap*.3);cool(ctx,bx,ys[1],'#111113');}\n  headline();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(headline);if(document.fonts&&document.fonts.load)document.fonts.load('900 40px \"Big Shoulders Display\"').then(headline);\n  var phi=document.getElementById('ph');if(phi&&!phi.complete)phi.addEventListener('load',headline);var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(headline,150);});\n  // QR\n  try{var q=qrcode(0,'M');q.addData('{{url}}');q.make();document.getElementById('qr').innerHTML=q.createSvgTag({cellSize:4,margin:0,scalable:true});}catch(e){}\n  // vlnkový ochranný raster (guilloche)\n  function draw(c){var r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);if(!r.width)return;c.width=r.width*d;c.height=r.height*d;var x=c.getContext('2d');x.scale(d,d);\n    x.strokeStyle=c.dataset.c;x.globalAlpha=+c.dataset.a;x.lineWidth=.7;var W=r.width,H=r.height;\n    for(var k=0;k<26;k++){x.beginPath();for(var px=0;px<=W;px+=4){var y=H*(.08+k*.035)+Math.sin(px/W*Math.PI*6+k*.55)*H*.045+Math.sin(px/W*Math.PI*17+k*1.3)*H*.012;px?x.lineTo(px,y):x.moveTo(px,y);}x.stroke();}}\n  var cs=[].slice.call(document.querySelectorAll('canvas.g')),go=function(){cs.forEach(draw);};go();\n  if(window.ResizeObserver)new ResizeObserver(go).observe(document.getElementById('front'));else addEventListener('resize',go);\n})();\n</script></body></html>";
function voucherHTML(v) {
  const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return VOUCHER_TPL.replace(/\{\{(\w+)\}\}/g, (m, k) => e(v[k]));
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
