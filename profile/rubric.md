# Rubric — How to Evaluate a Source (neutral dimensions)

This rubric captures **facts**: neutral, audience-agnostic measurements of a source, recorded at
**ingest** time. It deliberately does **not** decide whether we should adopt/trial/watch something
— that is a *values* judgment made later, at build time, through `profile/lens.md`.

> **Why the split?** Facts are permanent and shared; the values-driven signal changes with the
> lens. Keeping the dimension scores neutral means the same source can be re-judged under a
> different lens (or an updated stance) **without re-ingesting**. See
> [`lens.md`](lens.md) and the "Facts, values, judgments" section of `ROADMAP.md`.

When ingesting a source, score each dimension and record the result in an `## Evaluation` section
on the source page (placed after `## Summary`). Score honestly and neutrally — describe the
source *as it is*, not whether it fits our current priorities.

---

## Dimensions (score each 1–5, neutral facts)

- **Novelty** — how new/original is the contribution? (1 = rehash, 5 = genuinely new)
- **Credibility** — source authority, evidence quality, reproducibility (1 = unverified claim, 5 = strong evidence / reputable)
- **Relevance** — fit to this instance's domain (1 = tangential, 5 = core to the domain)
- **Maturity** — how ready is it? (1 = idea/preprint, 5 = production-proven)
- **Cost/efficiency** — resource + money cost to run or adopt (1 = very expensive/heavy, 5 = very cheap/light)

These are observations about the source, not decisions about it. A source can score 5 on Novelty
and 1 on Maturity — that is a neutral fact, not yet a recommendation.

## Evaluation block format

Add this to each source page (facts only — no signal tag here):

```markdown
## Evaluation

| Dimension | Score | Note |
|-----------|-------|------|
| Novelty | N/5 | ... |
| Credibility | N/5 | ... |
| Relevance | N/5 | ... |
| Maturity | N/5 | ... |
| Cost/efficiency | N/5 | ... |
```

## What is NOT in this rubric

The **signal** (`adopt` / `trial` / `watch` / `hold` / `deprecated`) is a *values* call, not a
fact. It is assigned by the interpretation builder at build time using `profile/lens.md`, and it
lives in the generated watchlist — **not** in the neutral `## Evaluation` block. Do not hand-write
a signal into the Evaluation table.

(During the interim before the interpretation builder exists, a signal may be noted separately,
but treat it as provisional and lens-derived, never as a neutral fact.)

---

Notes:
- Be honest and specific in the notes; a low score with a clear reason is more useful than a
  generous one.
- If a source cites a technique/tool that isn't yet documented here, note it — it becomes a
  local *research-direction* hint the interpretation build can pick up.
