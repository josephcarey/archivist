# Rubric — How to Evaluate a Source

When ingesting a source, evaluate it against these dimensions and record the result in an
`## Evaluation` section on the source page (placed after `## Summary`). This is what turns
archivist from a clipping service into a research assistant.

---

## Dimensions (score each 1–5)

- **Novelty** — how new/original is the contribution? (1 = rehash, 5 = genuinely new)
- **Credibility** — source authority, evidence quality, reproducibility (1 = unverified claim, 5 = strong evidence / reputable)
- **Relevance** — fit to this instance's domain and our interests (1 = tangential, 5 = core)
- **Maturity** — how ready is it? (1 = idea/preprint, 5 = production-proven)
- **Watch-level** — how much should we track what happens next? (1 = ignore, 5 = high-priority watch)

## Derived signal

From the scores, assign one **signal tag** (see `taxonomy.md`):

- `adopt` — high credibility + maturity + relevance
- `trial` — promising but unproven (high novelty/relevance, lower maturity)
- `watch` — high watch-level; track future developments (feeds the digest)
- `hold` — relevant context but no action now
- `deprecated` — superseded/abandoned

## Evaluation block format

Add this to each source page:

```markdown
## Evaluation

| Dimension | Score | Note |
|-----------|-------|------|
| Novelty | N/5 | ... |
| Credibility | N/5 | ... |
| Relevance | N/5 | ... |
| Maturity | N/5 | ... |
| Watch-level | N/5 | ... |

**Signal:** `watch` — one-line justification.
```

---

Notes:
- Be honest and specific in the notes; a low score with a clear reason is more useful than a
  generous one.
- If a source is `watch` or higher on watch-level, ensure it is reflected in the
  "Things to Watch" digest (Phase 4).
