// PORA – pravidlá cenotvorby (ceny bez DPH). Rovnaké pre bývanie, gastro aj komerciu.
// Zdroj: Tom, 5. 10. 2026.
export const VAT = 0.23;

export const roundArea = (m2) => Math.round(Number(m2)); // 205,4 -> 205 ; 205,5 -> 206

export function priceMini(m2) {
  return roundArea(m2) <= 20 ? 2490 : null; // nad 20 m² sa Mini neponúka
}

export function priceDesign(m2) {
  const a = roundArea(m2);
  let p = 4990;                                   // do 100 m²
  if (a > 100) p += (Math.min(a, 200) - 100) * 25; // 101–200 m²: +25 €/m²
  if (a > 200) p += (a - 200) * 10;                // nad 200 m²: +10 €/m²
  return p;
}

export function priceRealizacia(m2) {
  const a = roundArea(m2);
  if (a <= 250) return 15000;
  if (a <= 400) return 20000;
  return null;                                     // nad 400 m²: individuálne (schvaľuje Tom)
}

export const PRICE_KONZULTACIA = 500;              // €/hod

// Ktoré varianty patria do ponuky podľa požiadavky klienta.
// need: 'navrh_realizacia' | 'navrh' | 'konzultacia'
export function pickVariants(need, m2) {
  const a = roundArea(m2);
  const v = [];
  if (a <= 20) v.push('mini');
  v.push('design', 'realizacia');
  if (need === 'konzultacia') v.unshift('konzultacia');
  return v;
}

export function quote({ need, m2, consultHours = 1 }) {
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
