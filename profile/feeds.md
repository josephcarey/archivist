---
title: Feeds
tags: [profile, feeds, discovery]
updated: 2026-07-15
---

# Feeds

The scheduled **discovery feed** polls the sources listed here, finds new entries, and appends
the new URLs to `raw/urls.md` (the ingest queue) via a pull request. It does **not** author wiki
pages — that stays a separate `/ingest` step (local or the Copilot coding agent). Discovery is
deterministic and free; authoring is where tokens are spent, so it stays gated.

Feeds are **domain-specific**, so they live here in `profile/` (the domain seam), like the lens.
To retarget archivist at another domain, rewrite this list.

## How to edit

- Add or remove entries in the `feeds` array of the JSON block below.
- `filters.includeKeywords` — if non-empty, an entry's title must match at least one (case-insensitive).
- `filters.excludeKeywords` — an entry matching any of these is dropped.
- `maxPerRun` — hard cap on new candidates appended per run, newest first (keeps a noisy feed from flooding the queue).
- Run `node scripts/seed-catalog.js <catalog-url-or-file>` to import a curated list of articles
  into the queue **and** autodiscover the RSS feed for each source, printing proposed additions
  for this file (so one-off articles from writers/series become ongoing subscriptions).

## Config

```json
{
  "feeds": [
    { "name": "Simon Willison", "url": "https://simonwillison.net/atom/everything/", "tags": ["blog", "practitioner"] },
    { "name": "Martin Fowler", "url": "https://martinfowler.com/feed.atom", "tags": ["blog", "methodology"] },
    { "name": "Adam Tornhill", "url": "https://adamtornhill.substack.com/feed", "tags": ["blog", "code-quality"] },
    { "name": "Daniel Schleicher", "url": "https://www.danielschleicher.com/feed.xml", "tags": ["blog", "spec-driven"] },
    { "name": "Addy Osmani", "url": "https://addyosmani.com/rss.xml", "tags": ["blog", "practitioner"] },
    { "name": "Hamel Husain", "url": "https://hamel.dev/index.xml", "tags": ["blog", "evaluation"] },
    { "name": "Boris Tane", "url": "https://boristane.com/rss.xml", "tags": ["blog", "practitioner"] },
    { "name": "The AI Corner", "url": "https://www.the-ai-corner.com/feed", "tags": ["blog", "practitioner"] },
    { "name": "Domain Language (Eric Evans)", "url": "https://www.domainlanguage.com/feed/", "tags": ["blog", "ddd"] },
    { "name": "Trensee", "url": "https://www.trensee.com/feed", "tags": ["blog", "practitioner"] }
  ],
  "filters": {
    "includeKeywords": [],
    "excludeKeywords": []
  },
  "maxPerRun": 25
}
```

> The blog feeds beyond the first two were **autodiscovered** from
> [meta-claude's source catalog](https://github.com/suzbot/meta-claude) — a curated list of
> AI-collaboration practitioner writing — via `scripts/seed-catalog.js`, so the writers/series
> in that catalog keep flowing into the queue.
