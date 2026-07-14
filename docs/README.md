# Welcome to archivist

**archivist** is your personal knowledge base — a wiki that an AI builds and maintains for you.

You bring the sources. The AI does the filing.

---

## How it works

1. **Add a source** — paste a URL, drop a file into `raw/files/`, or point to a git repo
2. **Tell OpenCode to ingest it** — type `/ingest <url or filepath>` in your OpenCode session
3. **Browse the results** — the wiki updates automatically with new pages, cross-links, and summaries
4. **Ask questions** — type `/query what do I know about X` and get an answer synthesized from everything in your wiki

---

## Quick start

```
/ingest https://example.com/some-article
/query what are the key ideas from that article?
/lint
```

---

## Navigation

- [Index](index.md) — catalog of all wiki pages
- [Log](log.md) — history of every ingest and query

This instance's focus is defined in `profile/` (domain, taxonomy, evaluation rubric, and
source types). The engine itself is domain-agnostic — rewrite the profile to point archivist
at a different subject.

---

## Example pages

These pages were created as examples to show what the wiki looks like after a few ingests:

- [The History of Fermentation](wiki/example-source.md) — example ingested article
- [Fermentation](wiki/fermentation.md) — example concept page
