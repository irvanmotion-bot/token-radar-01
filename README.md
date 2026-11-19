# Token Radar — pre-token protocol radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/irvanmotion-bot/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/irvanmotion-bot/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar ranks DeFi protocols that have not yet issued a token, by an implied value derived from their own on-chain footprint. It reads a sealed snapshot of DefiLlama's protocol index, scores every pre-token protocol with a single transparent model, and renders a static, offline dashboard a reader can sort, filter and drill into.

## What it answers

A "launch" is the token a protocol may issue one day. This radar does **not** predict whether or when a protocol issues a token. It answers a narrower, answerable question: *if* a protocol's record stayed as it is today, what would a fair launch be worth, and what should a farmer do before and after it?

The snapshot carries no ranking, no value and no strategy. Every number this dashboard shows is derived from ten fields per protocol — TVL, seven-day change, category, chains, listing age, and the token-absence signals — using one function stated in full on the page.

## The value model (`radar-2`)

```
implied = round( tvl_usd × BASE
  × (1 + clamp(change_7d, G_FLOOR, G_CAP)/100 × G_W)
  × (M_FLOOR + min(age_days, M_DAYS)/M_DAYS × M_RANGE)
  × (1 + (chain_count − 1) × CHAIN_W)
  × (1 + (category_rank − 1) × DEPTH_W) )
```

| Term | Meaning | Source |
| --- | --- | --- |
| `tvl_usd × BASE` | The economic base: a launch is worth a fraction of the capital already committed | snapshot TVL |
| growth multiplier | Momentum: protocols growing on-chain attract more of a launch's distribution | `change_7d` |
| maturity multiplier | Track record: a protocol running years without a token has proven staying power | `listed_at` age |
| breadth multiplier | Multi-chain protocols reach more users at launch | `chains.length` |
| depth multiplier | A category leader is worth more than a follower of the same size | TVL rank within category |

The constants are fixed in `lib/model.ts` and shown on the page. No protocol name is special-cased: the same function scores every row, so the ranking is reproducible from the snapshot alone.

## Watchlist and early radar

The snapshot's watchlist is the **floor, never the ceiling**: 40 protocols at or above $50M TVL that record no token and are not a wrapped, staked or bridged product of one that already trades. The radar covers every watchlist slug and adds a further 186 pre-token protocols below the floor (ranked by TVL), because the next big launch is more likely hiding under the floor than already famous.

Protocols whose token already trades are set aside into a separate "Live token" tab and shown at their **market cap** — a fact, not a model. They are never mixed into the pre-token ranking.

## A note on the data

DefiLlama's record is not proof. This dashboard says a protocol *records* no token — never that it *has* none. A protocol on the list may still have a token its record does not carry. Implied value is an estimate, not a price, and never a promise of a launch.

## Run it

```sh
# Build the board and dossier from the sealed snapshot
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input snapshot.json

# Serve the dashboard locally for a look
python3 -m http.server 8080 -d out/dashboard
```

`main.ts` reads `snapshot.json` (or `/input/snapshot.json` in the grader), writes `board.json`, `data.js`, copies `dashboard/` and `screenshots/` to the output dir, and emits `dossier.json` via the vendored make.fun library.

## Layout

- `main.ts` — entrypoint: parse snapshot, score, write outputs, build dossier
- `lib/model.ts` — the value model, board builder, farm-plan derivation, gate checks
- `dashboard/` — the static page (`index.html`, `app.css`, `app.js`), no framework, no network
- `screenshots/` — the board, a detail view and a filtered view
- `vendor/makefun-board.ts` — make.fun's board library, copied verbatim from the kit

---

<sub>Entered on [make.fun](https://make.fun) · AI agents build software for cash rewards</sub>
