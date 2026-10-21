/**
 * PORA – optimalizácia kampaní na výťažok (spustiť raz, je bezpečné spustiť aj opakovane):
 * 1) oblasti: zobrazovať len ľuďom, ktorí SÚ v cieľovej krajine (nie tým, čo sa o ňu len zaujímajú)
 * 2) vylučujúce kľúčové slová (zdieľaný zoznam) – odfiltruje študentov, hľadačov práce, „zadarmo“, IKEA a pod.
 * 3) značka PORA pripnutá na 1. nadpis, popisy (callouts) a sitelinky pre každú kampaň v jej jazyku
 * Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Autorizovať → Spustiť → Denníky.
 */
var NEGATIVES = [
  // SK
  'zadarmo', 'zdarma', 'kurz', 'kurzy', 'škola', 'štúdium', 'študovať', 'práca', 'brigáda', 'plat', 'program', 'softvér', 'aplikácia', 'app',
  'ikea', 'jysk', 'pinterest', 'obrázky', 'fotky', 'diplomová', 'bakalárska', 'pdf', 'kniha', 'definícia', 'čo je', 'ako sa stať', 'wikipedia',
  // CZ
  'práce', 'brigáda', 'kurzy online', 'vysoká škola', 'co je', 'jak se stát', 'zdarma online',
  // PL
  'za darmo', 'darmowy', 'kurs', 'kursy', 'szkoła', 'studia', 'praca', 'zarobki', 'program do', 'aplikacja', 'co to jest', 'jak zostać',
  // DE/AT
  'kostenlos', 'gratis', 'ausbildung', 'studium', 'job', 'jobs', 'gehalt', 'software', 'lehre', 'was ist', 'wie werde ich'
];
var CALLOUTS = {
  'SK': ['Cenová ponuka na počkanie', '80+ realizácií', '3D vizualizácie', 'Autorský dozor'],
  'CZ': ['Cenová nabídka ihned', '80+ realizací', '3D vizualizace', 'Autorský dozor'],
  'PL': ['Wycena od ręki', '80+ realizacji', 'Wizualizacje 3D', 'Nadzór autorski'],
  'AT': ['Richtangebot sofort', '80+ Projekte', '3D-Visualisierungen', 'Beratung auch online']
};
var SITELINKS = {
  'SK': [['Naše realizácie', 'https://www.pora.sk/projekty/'], ['Cenová ponuka', 'https://www.pora.sk/'],
         ['Kde pôsobíme', 'https://www.pora.sk/interierovy-dizajn/'], ['Apartmány v zahraničí', 'https://www.pora.sk/interier-apartmanu-v-zahranici/']],
  'CZ': [['Naše realizace', 'https://www.pora.sk/projekty/'], ['Interiérový design Praha', 'https://www.pora.sk/cs/praha/'],
         ['Interiérový design Brno', 'https://www.pora.sk/cs/brno/'], ['Apartmán v zahraničí', 'https://www.pora.sk/cs/interier-apartmanu-v-zahranici/']],
  'PL': [['Nasze realizacje', 'https://www.pora.sk/projekty/'], ['Projektowanie Kraków', 'https://www.pora.sk/pl/krakow/'],
         ['Projektowanie Warszawa', 'https://www.pora.sk/pl/warszawa/'], ['Projektowanie Rzeszów', 'https://www.pora.sk/pl/rzeszow/']],
  'AT': [['Unsere Projekte', 'https://www.pora.sk/projekty/'], ['Innenarchitekt Wien', 'https://www.pora.sk/de/wien/'],
         ['Studio PORA', 'https://www.pora.sk/de/'], ['English version', 'https://www.pora.sk/en/']]
};
function langOf(name) {
  if (name.indexOf('PORA CZ') === 0) return 'CZ';
  if (name.indexOf('PORA PL') === 0) return 'PL';
  if (name.indexOf('PORA AT') === 0) return 'AT';
  return 'SK';
}
function report(label, res) {
  var ok = 0, bad = 0;
  res.forEach(function (r) { if (r.isSuccessful()) ok++; else { bad++; Logger.log('CHYBA (' + label + '): ' + r.getErrorMessages().join(' | ')); } });
  Logger.log(label + ': úspešné ' + ok + ', chyby ' + bad);
}
function main() {
  var cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  var R = function (t, id) { return 'customers/' + cid + '/' + t + '/' + id; };
  var camps = [];
  var cIt = AdsApp.campaigns().withCondition("Name STARTS_WITH 'PORA '").withCondition("Status != REMOVED").get();
  while (cIt.hasNext()) camps.push(cIt.next());
  Logger.log('Kampane: ' + camps.map(function (c) { return c.getName(); }).join(' | '));

  // 1) Oblasti – len prítomnosť
  var geoOps = camps.map(function (c) {
    return { campaignOperation: { update: { resourceName: R('campaigns', c.getId()), geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE' } },
      updateMask: 'geo_target_type_setting.positive_geo_target_type' } };
  });
  report('Oblasti = prítomnosť', AdsApp.mutateAll(geoOps, { partialFailure: true }));

  // 2) Zdieľaný zoznam vylučujúcich slov
  var LIST = 'PORA – vylúčenia (nekupujúci)';
  var list = null, lIt = AdsApp.negativeKeywordLists().withCondition("Name = '" + LIST + "'").get();
  if (lIt.hasNext()) list = lIt.next();
  else { var op = AdsApp.newNegativeKeywordListBuilder().withName(LIST).build(); if (op.isSuccessful()) list = op.getResult(); else Logger.log('CHYBA zoznam: ' + op.getErrors().join('; ')); }
  if (list) {
    var have = {}; var kIt = list.negativeKeywords().get(); while (kIt.hasNext()) have[kIt.next().getText()] = 1;
    var add = NEGATIVES.filter(function (k) { return !have[k]; });
    if (add.length) list.addNegativeKeywords(add);
    camps.forEach(function (c) { c.addNegativeKeywordList(list); });
    Logger.log('Vylučujúce slová: pridané ' + add.length + ', zoznam priradený k ' + camps.length + ' kampaniam');
  }

  // 3) Pripnutie značky
  var adOps = [];
  var it = AdsApp.search("SELECT campaign.name, ad_group_ad.ad.id, ad_group_ad.ad.responsive_search_ad.headlines FROM ad_group_ad " +
    "WHERE campaign.name LIKE 'PORA %' AND ad_group_ad.status != 'REMOVED' AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'");
  while (it.hasNext()) {
    var row = it.next();
    var hs = row.adGroupAd.ad.responsiveSearchAd.headlines;
    if (hs.some(function (h) { return h.pinnedField === 'HEADLINE_1'; })) continue;
    hs = hs.map(function (h) { return { text: h.text }; });
    var pick = -1;
    hs.forEach(function (h, i) { if (pick < 0 && /PORA/.test(h.text)) pick = i; });
    if (pick < 0) { Logger.log('Bez nadpisu PORA: ' + row.campaign.name); continue; }
    hs[pick].pinnedField = 'HEADLINE_1';
    adOps.push({ adOperation: { update: { resourceName: R('ads', row.adGroupAd.ad.id), responsiveSearchAd: { headlines: hs } }, updateMask: 'responsive_search_ad.headlines' } });
  }
  if (adOps.length) report('Pripnutie PORA', AdsApp.mutateAll(adOps, { partialFailure: true })); else Logger.log('Pripnutie PORA: už hotové');

  // 4) Popisy a sitelinky – len kampaniam, ktoré ich ešte nemajú
  var hasAsset = {};
  var aIt = AdsApp.search("SELECT campaign.id, campaign_asset.field_type FROM campaign_asset WHERE campaign_asset.field_type IN ('CALLOUT','SITELINK') AND campaign_asset.status != 'REMOVED'");
  while (aIt.hasNext()) { var a = aIt.next(); hasAsset[a.campaign.id + ':' + a.campaignAsset.fieldType] = 1; }
  var assetOps = [], tmp = -1;
  camps.forEach(function (c) {
    var L = langOf(c.getName()), camp = R('campaigns', c.getId());
    if (!hasAsset[c.getId() + ':CALLOUT']) CALLOUTS[L].forEach(function (t) {
      var a = R('assets', tmp--);
      assetOps.push({ assetOperation: { create: { resourceName: a, calloutAsset: { calloutText: t } } } });
      assetOps.push({ campaignAssetOperation: { create: { campaign: camp, asset: a, fieldType: 'CALLOUT' } } });
    });
    if (!hasAsset[c.getId() + ':SITELINK']) SITELINKS[L].forEach(function (s) {
      var a = R('assets', tmp--);
      assetOps.push({ assetOperation: { create: { resourceName: a, finalUrls: [s[1]], sitelinkAsset: { linkText: s[0] } } } });
      assetOps.push({ campaignAssetOperation: { create: { campaign: camp, asset: a, fieldType: 'SITELINK' } } });
    });
  });
  if (assetOps.length) report('Popisy a sitelinky', AdsApp.mutateAll(assetOps, { partialFailure: false })); else Logger.log('Popisy a sitelinky: už hotové');
  Logger.log('Hotovo.');
}
