// Chain metadata and distribution helpers for the radar.
//
// The snapshot names each protocol's chains by DefiLlama's display names ("Ethereum", "Solana",
// "Arbitrum" and so on). This module maps those names to a stable, compact picture a dashboard can
// show: a short label, a tier that reflects how much launch-ready liquidity a chain typically
// carries, and a rough ordinal used to order a protocol's chain list for display. It is derived
// from public chain-ecosystem knowledge, not from the snapshot, and it only affects presentation
// and the breadth term's human-readable description — never the ranked value itself, which stays a
// pure function of the snapshot's own ten fields.
//
// The tier bands are deliberately coarse (major / established / emerging / niche) so the label
// stays honest and never pretends to be a precise liquidity figure the snapshot does not contain.

export interface ChainInfo {
  /** DefiLlama's display name, as the snapshot writes it. */
  name: string;
  /** A short human label, safe for a table cell. */
  label: string;
  /** 3 = major, 2 = established, 1 = emerging, 0 = niche. */
  tier: number;
}

const CHAIN_INDEX: Record<string, ChainInfo> = {
  Ethereum: { name: 'Ethereum', label: 'ETH', tier: 3 },
  Solana: { name: 'Solana', label: 'SOL', tier: 3 },
  'BNB Chain': { name: 'BNB Chain', label: 'BNB', tier: 2 },
  Base: { name: 'Base', label: 'BASE', tier: 2 },
  Arbitrum: { name: 'Arbitrum', label: 'ARB', tier: 2 },
  Optimism: { name: 'Optimism', label: 'OP', tier: 2 },
  Polygon: { name: 'Polygon', label: 'POLY', tier: 2 },
  Avalanche: { name: 'Avalanche', label: 'AVAX', tier: 2 },
  Tron: { name: 'Tron', label: 'TRX', tier: 2 },
  Sui: { name: 'Sui', label: 'SUI', tier: 2 },
  Aptos: { name: 'Aptos', label: 'APT', tier: 1 },
  Hyperliquid: { name: 'Hyperliquid', label: 'HYPE', tier: 1 },
  Mantle: { name: 'Mantle', label: 'MNT', tier: 1 },
  Linea: { name: 'Linea', label: 'LINEA', tier: 1 },
  Scroll: { name: 'Scroll', label: 'SCROLL', tier: 1 },
  zkSync: { name: 'zkSync', label: 'ZKS', tier: 1 },
  Blast: { name: 'Blast', label: 'BLAST', tier: 1 },
  Mode: { name: 'Mode', label: 'MODE', tier: 1 },
  Sei: { name: 'Sei', label: 'SEI', tier: 1 },
  Injective: { name: 'Injective', label: 'INJ', tier: 1 },
  Starknet: { name: 'Starknet', label: 'STRK', tier: 1 },
  Monad: { name: 'Monad', label: 'MONAD', tier: 0 },
  Berachain: { name: 'Berachain', label: 'BERA', tier: 0 },
  Unichain: { name: 'Unichain', label: 'UNI', tier: 0 },
  Ink: { name: 'Ink', label: 'INK', tier: 0 },
  Abstract: { name: 'Abstract', label: 'ABS', tier: 0 },
  Sonic: { name: 'Sonic', label: 'S', tier: 0 },
  Flare: { name: 'Flare', label: 'FLR', tier: 0 },
  Worldchain: { name: 'Worldchain', label: 'WLD', tier: 0 },
  Corn: { name: 'Corn', label: 'CORN', tier: 0 },
  Kaia: { name: 'Kaia', label: 'KAIA', tier: 0 },
};

/** The display name a snapshot writes for a chain, or a neutral fallback. */
export function chainInfo(name: string): ChainInfo {
  return CHAIN_INDEX[name] ?? { name, label: name.slice(0, 4).toUpperCase(), tier: 0 };
}

/** Order a protocol's chains for display: higher tier first, then alphabetically. */
export function orderChains(chains: string[]): ChainInfo[] {
  return chains
    .map((c) => chainInfo(c))
    .sort((a, b) => b.tier - a.tier || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** A one-line summary of where a protocol lives, e.g. "ETH, BASE +11". */
export function chainSummary(chains: string[]): string {
  if (chains.length === 0) return 'an unnamed chain';
  const ordered = orderChains(chains);
  const head = ordered.slice(0, 2).map((c) => c.label).join(', ');
  const rest = ordered.length - 2;
  return rest > 0 ? `${head} +${rest}` : head;
}

/** The highest tier among a protocol's chains, 0..3; used only for display, never for value. */
export function topTier(chains: string[]): number {
  return chains.reduce((best, c) => Math.max(best, chainInfo(c).tier), 0);
}
