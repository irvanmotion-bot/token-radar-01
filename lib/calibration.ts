// Comps calibration: how the radar turns the snapshot's own token-bearing protocols into the
// multiple it prices a would-be launch with.
//
// The idea: a protocol that already trades tells us what the market pays for a dollar of TVL in
// that category. The radar prices a still-untokenised protocol in the same category with the same
// multiple — not with a constant someone made up. That is the "fitted" step the value model was
// missing: every multiple is read out of the snapshot, never hardcoded to a name.
//
//   for each category:  multiple = median( mcap_usd / tvl_usd ) over token-bearing protocols
//                       in that category, dropping outliers outside [0.002, 10]
//   fallback:           the median over every sane token-bearing protocol (~0.20)
//
// Why median, not mean: the ratio is heavy-tailed. One CEX with a 400x multiple or one liquid
// staking wrapper at 0.004x would drag a mean far from what a typical launch actually fetches.
// The median is the market's "typical" multiple, robust to those extremes, and it is the honest
// anchor for a model that must not pretend to more precision than the snapshot carries.

export interface Calibration {
  /** Median mcap/tvl per category, only for categories with at least 3 sane observations. */
  byCategory: Map<string, number>;
  /** The global fallback: median over every sane token-bearing protocol. */
  fallback: number;
  /** How many token-bearing protocols fed the fit, for the dashboard's transparency line. */
  fittedCount: number;
  /** The sane range each ratio must fall in before it is counted. */
  floor: number;
  cap: number;
  /** Minimum observations a category needs to keep its own multiple. */
  minObs: number;
}

/** A category's mcap/tvl multiple under the calibration, or the fallback when unmeasured. */
export function multipleFor(cal: Calibration, category: string | null): number {
  const key = category ?? 'Other';
  return cal.byCategory.get(key) ?? cal.fallback;
}

/** A human label for where a multiple came from, for the dashboard's detail view. */
export function multipleSource(cal: Calibration, category: string | null): string {
  const key = category ?? 'Other';
  return cal.byCategory.has(key) ? `fitted from ${key} tokens` : 'global median';
}

/** Build the calibration from a snapshot's protocols. */
export function calibrate(protocols: { mcap_usd: number | null; tvl_usd: number; category: string | null }[]): Calibration {
  const floor = 0.002;
  const cap = 10;
  const minObs = 3;
  const buckets = new Map<string, number[]>();
  for (const p of protocols) {
    if (p.mcap_usd === null || p.mcap_usd <= 0) continue;
    if (p.tvl_usd <= 0) continue;
    const ratio = p.mcap_usd / p.tvl_usd;
    if (ratio < floor || ratio > cap) continue;
    const key = p.category ?? 'Other';
    const list = buckets.get(key);
    if (list) list.push(ratio);
    else buckets.set(key, [ratio]);
  }
  const byCategory = new Map<string, number>();
  const all = [];
  for (const [key, list] of buckets) {
    all.push(...list);
    if (list.length >= minObs) byCategory.set(key, median(list));
  }
  const fallback = median(all);
  return { byCategory, fallback, fittedCount: all.length, floor, cap, minObs };
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
