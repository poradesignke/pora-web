/**
 * PORA – diagnostika: presné dôvody, prečo sa kampane/reklamy/kľúčové slová nezobrazujú.
 * Nič nemení, len číta. Spustenie: Nástroje → Hromadné akcie → Skripty → + → vložiť → Autorizovať → Spustiť → Denníky.
 */
function main() {
  function q(label, gaql) {
    Logger.log('==== ' + label + ' ====');
    try {
      var it = AdsApp.search(gaql);
      var n = 0;
      while (it.hasNext()) { Logger.log(JSON.stringify(it.next())); n++; }
      if (!n) Logger.log('(žiadne riadky)');
    } catch (e) { Logger.log('CHYBA: ' + e); }
  }
  var acc = AdsApp.currentAccount();
  Logger.log('Účet: ' + acc.getCustomerId() + ' | ' + acc.getName() + ' | mena ' + acc.getCurrencyCode() + ' | pásmo ' + acc.getTimeZone());

  q('ÚČET', "SELECT customer.id, customer.status, customer.descriptive_name, customer.auto_tagging_enabled, customer.has_partners_badge, customer.manager, customer.test_account, customer.optimization_score, customer.pay_per_conversion_eligibility_failure_reasons FROM customer");

  q('KAMPANE – stav a dôvody', "SELECT campaign.id, campaign.name, campaign.status, campaign.serving_status, campaign.primary_status, campaign.primary_status_reasons, campaign.start_date, campaign.end_date, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign.network_settings.target_google_search, campaign.network_settings.target_search_network, campaign.network_settings.target_content_network, campaign.geo_target_type_setting.positive_geo_target_type, campaign_budget.amount_micros, campaign_budget.status, campaign.payment_mode, campaign.experiment_type FROM campaign WHERE campaign.status != 'REMOVED'");

  q('REKLAMNÉ SKUPINY', "SELECT campaign.name, ad_group.id, ad_group.name, ad_group.status, ad_group.primary_status, ad_group.primary_status_reasons, ad_group.type, ad_group.cpc_bid_micros FROM ad_group WHERE campaign.status != 'REMOVED' AND ad_group.status != 'REMOVED'");

  q('REKLAMY – stav, schválenie, dôvody', "SELECT campaign.name, ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.review_status, ad_group_ad.policy_summary.policy_topic_entries, ad_group_ad.primary_status, ad_group_ad.primary_status_reasons, ad_group_ad.ad_strength FROM ad_group_ad WHERE campaign.status != 'REMOVED' AND ad_group_ad.status != 'REMOVED'");

  q('KĽÚČOVÉ SLOVÁ – stav, schválenie, kvalita', "SELECT campaign.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group_criterion.approval_status, ad_group_criterion.system_serving_status, ad_group_criterion.primary_status, ad_group_criterion.primary_status_reasons, ad_group_criterion.quality_info.quality_score FROM keyword_view WHERE campaign.status != 'REMOVED' AND ad_group_criterion.status != 'REMOVED'");

  q('CIELENIE – oblasti', "SELECT campaign.name, campaign_criterion.location.geo_target_constant, campaign_criterion.negative FROM campaign_criterion WHERE campaign_criterion.type = 'LOCATION' AND campaign.status != 'REMOVED'");
  q('CIELENIE – jazyky', "SELECT campaign.name, campaign_criterion.language.language_constant FROM campaign_criterion WHERE campaign_criterion.type = 'LANGUAGE' AND campaign.status != 'REMOVED'");
  q('CIELENIE – časový rozvrh (ak existuje, môže blokovať)', "SELECT campaign.name, campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour, campaign_criterion.ad_schedule.end_hour FROM campaign_criterion WHERE campaign_criterion.type = 'AD_SCHEDULE' AND campaign.status != 'REMOVED'");
  q('CIELENIE – vylúčenia zariadení/publík', "SELECT campaign.name, campaign_criterion.type, campaign_criterion.negative, campaign_criterion.bid_modifier FROM campaign_criterion WHERE campaign_criterion.type IN ('DEVICE','USER_LIST','USER_INTEREST','AGE_RANGE','GENDER','INCOME_RANGE','PARENTAL_STATUS') AND campaign.status != 'REMOVED'");
  q('VYLUČUJÚCE KĽÚČOVÉ SLOVÁ (kampaň)', "SELECT campaign.name, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion WHERE campaign_criterion.type = 'KEYWORD' AND campaign_criterion.negative = TRUE AND campaign.status != 'REMOVED'");
  q('ZDIEĽANÉ ZOZNAMY vylučujúcich slov', "SELECT shared_set.name, shared_set.type, shared_set.status, shared_set.member_count FROM shared_set WHERE shared_set.status != 'REMOVED'");

  q('FAKTURÁCIA – nastavenie', "SELECT billing_setup.id, billing_setup.status, billing_setup.start_date_time, billing_setup.end_date_time, billing_setup.payments_account_info.payments_account_name FROM billing_setup");

  q('ŠTATISTIKY AUKCIÍ 30 dní (kampane)', "SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.search_impression_share, metrics.search_budget_lost_impression_share, metrics.search_rank_lost_impression_share FROM campaign WHERE campaign.status != 'REMOVED' AND segments.date DURING LAST_30_DAYS");

  Logger.log('Hotovo. Skopírujte celý denník a pošlite ho.');
}
