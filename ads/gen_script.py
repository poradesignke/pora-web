import json
C = json.load(open('campaigns.json'))
GEO = {'SK': 2703, 'CZ': 2203, 'PL': 2616, 'AT': 2040}
LANG = {'sk': 1033, 'cs': 1021, 'pl': 1030, 'de': 1001}
META = {
 'SK – Interiérový dizajn': dict(geo=['SK'], lang=['sk'], cap=1.2, path=('interierovy','dizajn')),
 'CZ – Interiérový design': dict(geo=['CZ'], lang=['cs'], cap=1.2, path=('interierovy','design')),
 'PL – Projektowanie wnętrz': dict(geo=['PL'], lang=['pl'], cap=1.0, path=('projektowanie','wnetrz')),
 'AT – Innenarchitektur Wien': dict(geo=['AT'], lang=['de'], cap=3.0, path=('innenarchitekt','wien')),
 'SK+CZ – Apartmány v zahraničí': dict(geo=['SK','CZ'], lang=['sk','cs'], cap=1.0, path=('apartman','zahranicie')),
}
CITY_H = {'sk': 'Interiérový dizajn {c}', 'cs': 'Interiérový design {c}', 'pl': 'Projektowanie wnętrz {c}', 'de': 'Innenarchitekt {c}'}
out = []
for c in C:
    m = META[c['name']]
    lang0 = m['lang'][0]
    groups = []
    for g in c['groups']:
        heads = list(c['headlines'])
        city = g['name'].split('– ')[-1]
        if city not in ('všeobecné', 'gastro a komercia', 'Chorvátsko', 'Dubaj'):
            h = CITY_H[lang0].format(c=city)
            if len(h) <= 30:
                heads[0] = h
        kws = [k.strip('"') for k in g['keywords']]
        groups.append(dict(name=g['name'], url=g['url'], kws=kws, heads=heads, descs=c['descriptions']))
    out.append(dict(name=c['name'], budget=c['budget_day'], cap=m['cap'], geo=[GEO[x] for x in m['geo']], lang=[LANG[x] for x in m['lang']],
                    neg=sorted(set(c['negatives'])), path=m['path'], groups=groups))
data = json.dumps(out, ensure_ascii=False)
js = r'''/**
 * PORA – vytvorenie kampaní Google Ads (vyhľadávanie). Všetko sa vytvorí POZASTAVENÉ.
 * Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Autorizovať → Náhľad (Preview) → Spustiť (Run).
 */
var DATA = ''' + data + r''';

function main() {
  var cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  var R = function (t, id) { return 'customers/' + cid + '/' + t + '/' + id; };
  var tmp = -1, ops = [];
  DATA.forEach(function (c) {
    var bud = R('campaignBudgets', tmp--), campId = tmp--, camp = R('campaigns', campId);
    ops.push({ campaignBudgetOperation: { create: { resourceName: bud, name: 'PORA ' + c.name + ' ' + Date.now(), amountMicros: Math.round(c.budget * 1e6), deliveryMethod: 'STANDARD', explicitlyShared: false } } });
    ops.push({ campaignOperation: { create: {
      resourceName: camp, name: 'PORA ' + c.name, status: 'PAUSED', advertisingChannelType: 'SEARCH', campaignBudget: bud,
      networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false, targetContentNetwork: false, targetPartnerSearchNetwork: false },
      targetSpend: { cpcBidCeilingMicros: Math.round(c.cap * 1e6) },
      geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE' },
      containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING' } } });
    c.geo.forEach(function (g) { ops.push({ campaignCriterionOperation: { create: { resourceName: R('campaignCriteria', campId + '~' + g), campaign: camp, location: { geoTargetConstant: 'geoTargetConstants/' + g } } } }); });
    c.lang.forEach(function (l) { ops.push({ campaignCriterionOperation: { create: { resourceName: R('campaignCriteria', campId + '~' + l), campaign: camp, language: { languageConstant: 'languageConstants/' + l } } } }); });
    c.neg.forEach(function (n) { ops.push({ campaignCriterionOperation: { create: { campaign: camp, negative: true, keyword: { text: n, matchType: 'PHRASE' } } } }); });
    c.groups.forEach(function (g) {
      var ag = R('adGroups', tmp--);
      ops.push({ adGroupOperation: { create: { resourceName: ag, campaign: camp, name: g.name, status: 'ENABLED', type: 'SEARCH_STANDARD' } } });
      g.kws.forEach(function (k) { ops.push({ adGroupCriterionOperation: { create: { adGroup: ag, status: 'ENABLED', keyword: { text: k, matchType: 'PHRASE' } } } }); });
      ops.push({ adGroupAdOperation: { create: { adGroup: ag, status: 'ENABLED', ad: { finalUrls: [g.url],
        responsiveSearchAd: { headlines: g.heads.map(function (h) { return { text: h }; }), descriptions: g.descs.map(function (d) { return { text: d }; }), path1: c.path[0], path2: c.path[1] } } } } });
    });
  });
  // konverzia: vyžiadaná cenová ponuka v chate
  ops.push({ conversionActionOperation: { create: { name: 'PORA – cenová ponuka (chat)', type: 'WEBPAGE', category: 'SUBMIT_LEAD_FORM', status: 'ENABLED', countingType: 'ONE_PER_CLICK', valueSettings: { defaultValue: 50, defaultCurrencyCode: 'EUR', alwaysUseDefaultValue: true } } } });
  Logger.log('Operácií: ' + ops.length);
  var res = AdsApp.mutateAll(ops, { partialFailure: false });
  var ok = 0, bad = 0;
  res.forEach(function (r) { if (r.isSuccessful()) ok++; else { bad++; Logger.log('CHYBA: ' + r.getErrorMessages().join(' | ')); } });
  Logger.log('Hotovo. Úspešné: ' + ok + ', chyby: ' + bad);
  try {
    var it = AdsApp.search("SELECT conversion_action.name, conversion_action.tag_snippets FROM conversion_action WHERE conversion_action.name = 'PORA – cenová ponuka (chat)'");
    while (it.hasNext()) { var row = it.next(); Logger.log('TAG: ' + JSON.stringify(row.conversionAction.tagSnippets).slice(0, 1500)); }
  } catch (e) { Logger.log('Tag snippet: ' + e); }
}
'''
open('pora_kampane.js', 'w').write(js)
print(len(js), 'bytes;', sum(len(g['kws']) for c in out for g in c['groups']), 'keywords;', sum(len(c['groups']) for c in out), 'ad groups')
