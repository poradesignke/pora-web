/**
 * PORA – čistenie hľadaných výrazov + kontrola konverznej akcie (bezpečné spustiť opakovane).
 * 1) doplní vylučujúce slová do zoznamu „PORA – vylúčenia (nekupujúci)“ (vrátane variantov bez diakritiky,
 *    lebo vylučujúce slová sa na varianty bez mäkčeňov NEaplikujú)
 * 2) vypíše konverzné akcie a ich štítky (label), aby sa dalo overiť, že sedia s kódom na webe
 * Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Overiť → Spustiť bez ukážky → Denníky.
 */
var ADD = [
  // DIY a „urob si sám“ hľadania
  'ai', 'aplikacia', 'aplikácia na', 'online zdarma', 'navrh interieru zdarma', 'návrh interiéru zdarma',
  'program na', 'planner', 'ikea planner', 'homestyler', 'roomstyler', 'sketchup', 'planner 5d',
  // bez diakritiky (dopĺňa slová z prvého zoznamu)
  'skola', 'studium', 'studovat', 'praca', 'brigada', 'softver', 'obrazky', 'fotky', 'diplomova', 'bakalarska', 'definicia', 'co je', 'ako sa stat',
  'prace', 'jak se stat', 'skola interieru',
  // PL / AT – inšpiračné weby a médiá
  'dezeen', 'archdaily', 'pinterest', 'houzz', 'inspiracje', 'inspiration'
];
var LIST = 'PORA – vylúčenia (nekupujúci)';

function main() {
  var it = AdsApp.negativeKeywordLists().withCondition("Name = '" + LIST + "'").get();
  if (!it.hasNext()) { Logger.log('CHYBA: zoznam „' + LIST + '“ neexistuje – najprv spustite pora-optimalizacia.js'); }
  else {
    var list = it.next(), have = {}, k = list.negativeKeywords().get();
    while (k.hasNext()) have[k.next().getText().toLowerCase()] = 1;
    var add = ADD.filter(function (w) { return !have[w.toLowerCase()]; });
    if (add.length) list.addNegativeKeywords(add);
    Logger.log('Vylučujúce slová: pridané ' + add.length + ' (' + add.join(', ') + ')');
  }

  Logger.log('==== KONVERZNÉ AKCIE ====');
  var q = AdsApp.search("SELECT conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.type, " +
    "conversion_action.category, conversion_action.primary_for_goal, conversion_action.tag_snippets " +
    "FROM conversion_action WHERE conversion_action.status != 'REMOVED'");
  while (q.hasNext()) {
    var r = q.next().conversionAction, label = '';
    (r.tagSnippets || []).forEach(function (s) {
      var m = String(s.eventSnippet || '').match(/send_to': ?'([^']+)'/);
      if (m) label = m[1];
    });
    Logger.log([r.name, r.status, r.type, r.category, r.primaryForGoal ? 'PRIMÁRNA' : 'sekundárna', label || '(bez štítka)'].join(' | '));
  }
  Logger.log('Na webe je: AW-726283074/JrDNCOPCjpMdEMLmqNoC. Hotovo.');
}
