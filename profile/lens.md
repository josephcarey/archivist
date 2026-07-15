# Lens — What We Value (the interpretation stance)

This is the **values layer**. It is deliberately separate from the facts captured during
ingest. Ingest records what a source *objectively says* (neutral, permanent, audience-agnostic).
This lens records what *we care about* — the stance through which those facts are interpreted at
**build time** to produce judgments (the watchlist) and research directions (gaps).

Because the lens is separate config, it can change without re-fetching anything: edit this file,
re-run the interpretation build, and every judgment is regenerated from the same facts.

> **Design note — multi-lens:** today this is the single active lens. The model is designed so
> that multiple lenses (`lens/personal.md`, `lens/work.md`, `lens/studio.md`) can later sit over
> the same shared facts, each producing its own watchlist. Build single-lens first; keep this
> file's shape lens-swappable.

---

## Stance

**Budget grind.** We optimize for durable, cost-efficient capability — not for being on the
bleeding edge. We would rather have a mature, well-understood tool that captures 90% of the value
cheaply than chase the last 2% of SOTA at a large cost in money, tokens, or operational
complexity.

## What we weight up (raises signal)

- **Cost-efficiency** — strong value per dollar / per token. Cheap-to-run wins.
- **Maturity & stability** — production-proven, well-documented, unlikely to churn under us.
- **Operational simplicity** — few moving parts, easy to self-host or adopt, low lock-in.
- **Openness** — open weights / open source / permissive licensing, all else equal.
- **Reproducibility** — claims we can verify and results we can re-run.
- **Longevity** — likely to still matter in a year; not a hype spike.

## What we weight down (lowers signal)

- **Marginal SOTA gains** — small benchmark wins at large cost. Discounted heavily.
- **Bleeding-edge fragility** — preview/unstable APIs, fast-moving things likely to break.
- **High cost or heavy resource demand** — expensive to run or operate.
- **Lock-in** — proprietary-only, hard to migrate off.
- **Hype without substance** — attention that isn't backed by evidence or adoption.

## How the lens maps facts → signal

At build time, the interpretation builder reads each source's **Evaluation** facts (the neutral
dimension scores from `rubric.md`) and assigns a **signal** through this lens:

- `adopt` — high on the dimensions we weight up (cost-efficiency, maturity, relevance), low risk.
  Something we'd actually use on a budget-grind footing now.
- `trial` — promising and relevant but not yet mature/proven; worth a bounded experiment.
- `watch` — matters to track, but not act on yet (immature, expensive, or still hype-driven).
- `hold` — relevant context, no action; we know about it, we're not moving on it.
- `deprecated` — superseded or abandoned.

The **same facts** could yield a different signal under a different lens (e.g. a "chase-SOTA"
lens would upgrade marginal-gain frontier tools that this lens holds at `watch`). That is the
point of keeping facts and lens apart.

## How the lens suggests research directions

Interpretation also emits **research directions** — lens-driven gaps in what we know. Examples
this lens would surface:

- "We have 3 cheap self-hostable inference tools documented; a 4th covering X would let us drop
  a paid dependency — worth finding sources on X."
- "Our cost/perf pages are thin on quantization tradeoffs — a budget-grind blind spot."

Archivist only *suggests* these (as a derived page). The **human curates** which become real
pulls into `raw/`. `raw/` stays sacred.

---

Notes:
- Keep this file about *values and weighting*, not about *what a source objectively says* — that
  belongs in the wiki facts, not here.
- When the stance changes, edit here and re-run the interpretation build; do not re-ingest.
