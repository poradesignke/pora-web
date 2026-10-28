/**
 * PORA – všetko na Slovensko (spustiť raz):
 * 1) pozastaví AT, CZ, PL a Apartmány v zahraničí (nič nemaže, dajú sa kedykoľvek zapnúť)
 * 2) rozpočet „PORA SK – Interiérový dizajn“ = 22,50 €/deň (celý doterajší rozpočet)
 * 3) pridá do SK kampane 2 nové reklamy s inými uhlami (cena hneď / odvážny dizajn) – Google ich bude striedať s pôvodnou
 * 4) vypíše ID merania konverzií a štítky – potrebujem ich na opravu merania dopytov na webe
 * Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Overiť → Spustiť bez ukážky → pošlite mi Denníky.
 */
var PAUSE = ['PORA AT', 'PORA CZ', 'PORA PL', 'PORA SK+CZ'];
var SK_BUDGET = 22.5;
var URL = 'https://www.pora.sk/interierovy-dizajn/';
var ADS = [
  { // A – cena hneď
    h: ['Návrh interiéru s cenou hneď', 'Cenová ponuka do 2 minút', 'Interiérový dizajn PORA', 'Byty, domy aj gastro',
        'Návrh od 2 490 € bez DPH', '80+ realizácií od roku 2015', '3D vizualizácie interiéru', 'Autorský dozor na stavbe',
        'Bez záväzkov a bez čakania', 'Spýtajte sa nášho asistenta'],
    d: ['Napíšte pár údajov o priestore a orientačnú cenovú ponuku v PDF dostanete hneď e-mailom.',
        'Navrhujeme byty, domy aj gastro. Vizualizácie, podklady k realizácii a autorský dozor.',
        'Košice aj celé Slovensko, konzultácie osobne alebo online. Pozrite si naše realizácie.'],
    p1: 'cena', p2: 'hned' },
  { // B – odvážny dizajn
    h: ['Interiér, ktorý nie je nudný', 'Odvážne interiéry na mieru', 'Navrhneme váš byt či dom', 'Štúdio PORA Košice',
        'Žiadny katalógový interiér', 'Vizualizácia skôr než kúpite', 'Dizajn, ktorý si zapamätáte', 'Variant Design od 4 990 €',
        'Kaviarne, bistrá a salóny', 'Pozrite si 25 realizácií'],
    d: ['Nehľadáme univerzálne riešenia. Každý priestor má svoj príbeh a my mu dáme tvár.',
        'Od konceptu cez vizualizácie a podklady pre remeselníkov až po autorský dozor na stavbe.',
        'Cenu návrhu vám náš asistent na webe vypočíta hneď. Konzultácia osobne alebo online.'],
    p1: 'dizajn', p2: 'na-mieru' }
];

function main() {
  var cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  // 1) pozastavenie
  var it = AdsApp.campaigns().withCondition("Status = ENABLED").get();
  while (it.hasNext()) {
    var c = it.next(), n = c.getName();
    if (PAUSE.some(function (p) { return n.indexOf(p) === 0; })) { c.pause(); Logger.log('Pozastavené: ' + n); }
  }
  // 2) rozpočet SK
  var sk = AdsApp.campaigns().withCondition("Name STARTS_WITH 'PORA SK – Interi'").get();
  if (!sk.hasNext()) { Logger.log('CHYBA: SK kampaň nenájdená'); return; }
  var skc = sk.next();
  Logger.log('Rozpočet SK: ' + skc.getBudget().getAmount() + ' → ' + SK_BUDGET + ' €/deň');
  skc.getBudget().setAmount(SK_BUDGET);
  // 3) nové reklamy do všeobecnej reklamnej skupiny SK
  var ag = null, agIt = skc.adGroups().withCondition("Status = ENABLED").get();
  while (agIt.hasNext()) { var g = agIt.next(); if (/v.eobecn/i.test(g.getName())) ag = g; if (!ag) ag = g; }
  if (ag) {
    var ops = ADS.map(function (a) {
      return { adGroupAdOperation: { create: { adGroup: 'customers/' + cid + '/adGroups/' + ag.getId(), status: 'ENABLED',
        ad: { finalUrls: [URL], responsiveSearchAd: { headlines: a.h.map(function (t) { return { text: t }; }),
          descriptions: a.d.map(function (t) { return { text: t }; }), path1: a.p1, path2: a.p2 } } } } };
    });
    var res = AdsApp.mutateAll(ops, { partialFailure: true });
    res.forEach(function (r, i) { Logger.log('Nová reklama ' + 'AB'[i] + ' → ' + ag.getName() + ': ' + (r.isSuccessful() ? 'OK' : 'CHYBA ' + r.getErrorMessages().join(' | '))); });
  }
  // 4) meranie konverzií
  var q = AdsApp.search("SELECT customer.conversion_tracking_setting.conversion_tracking_id FROM customer");
  if (q.hasNext()) Logger.log('ID merania účtu: AW-' + q.next().customer.conversionTrackingSetting.conversionTrackingId);
  var a2 = AdsApp.search("SELECT conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.tag_snippets FROM conversion_action WHERE conversion_action.status = 'ENABLED'");
  while (a2.hasNext()) {
    var r = a2.next().conversionAction, s = '';
    (r.tagSnippets || []).forEach(function (t) { var m = String(t.eventSnippet || '').match(/send_to'?:\s*'([^']+)'/); if (m) s = m[1]; });
    Logger.log('Konverzia: ' + r.name + ' | ' + (s || '(bez štítka)'));
  }
  Logger.log('Na webe je: AW-726283074/JrDNCOPCjpMdEMLmqNoC. Hotovo.');
}
