/**
 * PORA – fokus na Slovensko a západ (spustiť raz, bezpečné aj opakovane):
 * 1) rozpočet „PORA SK – Interiérový dizajn“ = 14 €/deň (pôvodných 10 € + 2,50 € z Poľska + 1,50 € z Rakúska)
 * 2) v SK kampani zvýhodní západné kraje: Bratislavský +40 %, Trnavský +25 %, Nitriansky +20 %, Trenčiansky +15 %
 *    (úprava ponuky podľa oblasti – pri stratégii Maximalizovať kliknutia ju Google uplatňuje)
 * Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Overiť → Spustiť bez ukážky → Denníky.
 */
var SK_BUDGET = 14;
var BOOST = { 'Bratislava Region': 1.40, 'Trnava Region': 1.25, 'Nitra Region': 1.20, 'Trencin Region': 1.15 };

function main() {
  var it = AdsApp.campaigns().withCondition("Name STARTS_WITH 'PORA SK – Interi'").withCondition('Status != REMOVED').get();
  if (!it.hasNext()) { Logger.log('CHYBA: SK kampaň nenájdená'); return; }
  var c = it.next();
  var before = c.getBudget().getAmount();
  c.getBudget().setAmount(SK_BUDGET);
  Logger.log('Rozpočet ' + c.getName() + ': ' + before + ' € → ' + SK_BUDGET + ' €/deň');

  // existujúce cielenie oblastí v kampani
  var have = {};
  var lIt = c.targeting().targetedLocations().get();
  while (lIt.hasNext()) { var l = lIt.next(); have[l.getName()] = l; }
  Logger.log('Aktuálne oblasti: ' + Object.keys(have).join(', '));

  // vyhľadanie ID krajov SK
  var ids = {};
  var g = AdsApp.search("SELECT geo_target_constant.id, geo_target_constant.name, geo_target_constant.canonical_name FROM geo_target_constant " +
    "WHERE geo_target_constant.country_code = 'SK' AND geo_target_constant.target_type = 'Region'");
  while (g.hasNext()) { var r = g.next().geoTargetConstant; ids[r.name] = r.id; }
  Logger.log('Kraje v Google: ' + Object.keys(ids).join(', '));

  Object.keys(BOOST).forEach(function (name) {
    var id = ids[name];
    if (!id) { // tolerancia na diakritiku / názov
      var norm = function (s) { return s.toLowerCase().replace(/[čc]/g, 'c').replace(/[í]/g, 'i').replace(/[áä]/g, 'a').replace(/[^a-z]/g, ''); };
      var key = norm(name.split(' ')[0]).slice(0, 5);
      Object.keys(ids).forEach(function (n) { if (!id && norm(n).indexOf(key) === 0) id = ids[n]; });
    }
    if (!id) { Logger.log('CHYBA: kraj nenájdený: ' + name); return; }
    if (have[name]) { have[name].setBidModifier(BOOST[name]); Logger.log('Upravené: ' + name + ' ' + Math.round((BOOST[name] - 1) * 100) + ' %'); return; }
    var op = c.addLocation(Number(id), BOOST[name]);
    Logger.log((op.isSuccessful() ? 'Pridané: ' : 'CHYBA: ') + name + ' +' + Math.round((BOOST[name] - 1) * 100) + ' %' + (op.isSuccessful() ? '' : ' – ' + op.getErrors().join('; ')));
  });
  Logger.log('Hotovo.');
}
