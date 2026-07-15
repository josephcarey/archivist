# Profile — AI Research & Things to Watch

This file defines **what this archivist instance is about**. The engine (`AGENTS.md` and
`scripts/`) is domain-agnostic; everything domain-specific lives here in `profile/`.
To re-instance archivist for a different domain, rewrite the files in `profile/` and clear
`raw/` + `docs/wiki/`. The engine does not change.

---

## Domain

A personal + shared knowledge base and research assistant for **AI work and things to watch
in that space** — models, agents, evaluations, infrastructure, tooling, safety, notable
papers, people, and organizations.

## Purpose

Standardize what we generally know across **personal, work, and studio** contexts, so any of
them can consult a single shared brain. Sources arrive by PR, are ingested and evaluated
locally, and the resulting wiki is committed back.

## Audience

Practitioners and decision-makers who need a fast, trustworthy read on: what's new, what's
credible, what's worth adopting, and what's worth watching.

## What belongs here

- Frontier and open models, and how they compare
- Agent frameworks, patterns, and tooling
- Evaluation methods, benchmarks, and their caveats
- Infrastructure, serving, and cost/perf tradeoffs
- Safety, alignment, and governance developments
- Notable papers, releases, people, and orgs to track

## What does NOT belong here

- General non-AI topics (spin up a separate instance instead)
- Secrets, credentials, or proprietary data that shouldn't live in a shared repo

## Profile files

- `profile.md` — this file: domain, purpose, scope
- `taxonomy.md` — default tags and categories for pages
- `rubric.md` — how to evaluate a source on ingest (neutral fact dimensions)
- `lens.md` — the values/stance through which facts are interpreted at build time
- `source-types.md` — recognized source kinds and how each is handled
