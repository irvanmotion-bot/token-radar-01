// Farm-plan policy: how the radar turns a protocol's snapshot record into concrete, costed,
// timed steps a farmer can actually follow. This is a deliberate upgrade over a one-size-fits-all
// plan: it reads the protocol's category, TVL tier, chain count, age and growth to decide how much
// capital to commit, how long to hold, and which single action best signals genuine usage.
//
// The plan is always derived, never hardcoded to a protocol name. A name appears only inside the
// action sentence, as the place the farmer acts on. Costs are honest order-of-magnitude figures,
// never promises of a return.

import type { SnapshotProtocol } from './model.ts';

/** One step of a farm plan, with an action, its cost and its time. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** Capital commitment (USD) by TVL tier: bigger protocols tolerate a larger position. */
function capitalFor(tvlUsd: number): number {
  if (tvlUsd >= 5_000_000_000) return 250;
  if (tvlUsd >= 1_000_000_000) return 150;
  if (tvlUsd >= 100_000_000) return 100;
  return 50;
}

/** Holding window (days) by protocol age: younger protocols get a longer qualifying window. */
function holdDaysFor(ageDays: number | null): number {
  if (ageDays === null) return 30;
  if (ageDays < 180) return 60;
  if (ageDays < 365) return 45;
  return 30;
}

/** Weekly activity cadence: high-growth protocols reward more frequent touchpoints. */
function weeklyActionFor(change7d: number | null): string {
  if (change7d !== null && change7d >= 20) return 'twice a week';
  if (change7d !== null && change7d <= -20) return 'every two weeks';
  return 'each week';
}

/** The single most on-chain-legible action for a category, in the farmer's own words. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.`;
  if (c.includes('dex') || c.includes('yield') || c.includes('leveraged farm')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and use the bridged funds in its app.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedge.`;
  if (c.includes('prediction')) return `Fund $${capital} and place one market position on ${name}.`;
  if (c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and keep the shares.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.`;
  if (c.includes('rwa')) return `Mint $${capital} of the protocol's yield asset on ${chain} and hold it.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}

/** The primary chain, or a neutral phrase when the snapshot names none. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** Assemble the full plan: wallet hygiene, entry, cadence, hold, claim and logging. */
export function farmPlan(p: SnapshotProtocol, ageDays: number | null): FarmStep[] {
  const chain = chainOf(p);
  const capital = capitalFor(p.tvl_usd);
  const hold = holdDaysFor(ageDays);
  const cadence = weeklyActionFor(p.change_7d);
  const action = actionFor(p, capital, chain);
  return [
    { text: `Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline.`, cost: 'under $3 of gas for the first transaction', time: '5 minutes' },
    { text: action, cost: `$${capital} of capital and about $${capital >= 150 ? 8 : 4} of gas`, time: '15 minutes to set up' },
    { text: `Make one qualifying action ${cadence}, such as a deposit, a borrow, a swap or a vote.`, cost: 'about $2 of gas per action', time: '10 minutes per action' },
    { text: `Hold the position for at least ${hold} days so the activity is counted in more than one snapshot.`, cost: `the $${capital} stays in the position`, time: `${hold} days` },
    { text: `Before you withdraw, open the protocol's own points or rewards page and claim only from the link it publishes.`, cost: 'no fee to check, and never pay to claim', time: '10 minutes' },
    { text: `Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.`, cost: 'nothing but the log', time: '5 minutes' },
  ];
}
