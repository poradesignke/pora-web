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

export function offerHTML(d, A) {
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
