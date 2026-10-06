/**
 * PORA – zapnutie nových kampaní (len tie, ktorých názov začína "PORA ").
 * Staré kampane z roku 2019 sa nemenia.
 */
function main() {
  var it = AdsApp.campaigns().withCondition("Name STARTS_WITH 'PORA '").withCondition('Status = PAUSED').get();
  var n = 0;
  while (it.hasNext()) {
    var c = it.next();
    c.enable();
    n++;
    Logger.log('Zapnutá: ' + c.getName() + ' (' + c.getBudget().getAmount() + ' €/deň)');
  }
  Logger.log('Hotovo. Zapnutých kampaní: ' + n);
}
