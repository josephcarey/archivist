# Outstanding To Dos

See `ROADMAP.md` for the vision and phased plan. This file tracks the concrete work items,
grouped by phase.

## Phase 1 — Profile seam ✅

- [x] Create `profile/` with `profile.md`, `taxonomy.md`, `rubric.md`, `source-types.md`
- [x] Move domain-specific conventions out of `AGENTS.md` into `profile/`
- [x] Make the engine read the profile instead of hardcoding conventions
- [x] Author the AI-research profile content
- [x] Slight rewrite of base files to reference the profile

## Phase 2 — Ingest hardening ✅

- [x] Ingest hashing to detect changed sources
- [x] `defuddle` for clean sources — pull the full clean source in a predictable md format
- [x] Command to grab new versions of each git repo and compare/diff the notes
- [x] Handle monorepo packages gracefully (per-package notes)
- [x] Repo-specific folder layout
- [x] Add mermaid diagrams to generated pages
- [ ] Apply the profile evaluation rubric during ingest — verify in practice on a real source

## Phase 3 — Pipeline & extension foundation

- [x] Host the repo on GitHub with Actions available (prerequisite — done)
- [ ] Formalize the ingest → build → publish pipeline (ingest = neutral facts / build = lensed judgment)
- [ ] Define the extension manifest + discovery/registry and the three kinds
- [ ] Retrofit `fetch-url` / `clone-repo` / `extract-pdf` as source adapters (no behavior change)
- [ ] Reframe the current docsify setup as the built-in site publisher
- [ ] Split `profile/rubric.md`: measurable dimensions (facts at ingest) vs weighting/signal (lens-driven)
- [ ] Introduce `profile/lens.md` (single lens now; structured for `lens/*.md` multi-lens later)

## Phase 4 — Builders: interpretation, watchlist, research directions, digest

- [x] Interpretation builder — facts × lens → derived outputs (re-runnable without re-ingesting)
- [x] Watchlist builder → `watchlist.json` + "Recommendations & Watchlist" page (adopt/trial/watch)
- [x] Research-directions builder → derived "Research Directions" page of lens-driven gaps
- [x] Ingest-time local gap hints (undocumented cited concepts)
- [x] Digest builder → `llms.txt` / `index.json` (machine-readable map for local agents)

## Phase 5 — Site publisher → GitHub Pages

- [x] Docsify reframed as a publisher extension (`extensions/publishers/docsify`)
- [x] GitHub Pages deploy workflow (`.github/workflows/pages.yml`) — builds derived artifacts then deploys `docs/`
- [x] Keep local `serve` as the preview mode of the same publisher (`./start.sh` / `publish docsify serve`)
- [ ] One-time: enable Pages (Settings → Pages → Source: GitHub Actions) — human step

## Phase 6 — Automated ingestion

- [x] PR ingest-check: Action detects new/changed sources on a PR and comments a report (`.github/workflows/ingest.yml` + `scripts/report.js`)
- [x] **Authoring model decided: local/human `/ingest` for now** — the ingest-check flags what changed; a human runs `/ingest` in the CLI and pushes the pages. Zero new CI infra/cost (fits budget-grind).
- [x] **CI page-authoring via GitHub Copilot coding agent** — wired up: `copilot-setup-steps.yml` prepares the env (Node + deps + smoke test), an **Ingest a source** issue form (`.github/ISSUE_TEMPLATE/ingest.yml`) is the trigger (assign to Copilot), and AGENTS.md documents the CI-authoring flow + firewall note. Human steps: assign issues to Copilot; allowlist domains for URL/repo fetches.
- [ ] Scheduled AI-article feed adapter (ingest + summarize) — needs feed source + summarization depth decision (revisit alongside the Copilot-agent authoring step)
- [ ] archivist-specific skills/agents (ingest agent, lint agent, PR-ingest persona)

## Phase 7 — MCP publisher (later)

- [ ] MCP server exposing `search` / `get_page` / `list_watchlist` over the digest

## Backlog & future (unsequenced)

- [ ] Proactive source discovery — "research a subject → find sources → register → ingest" (consumes curated research directions)
- [ ] Multi-lens support — per-audience stances (`lens/personal.md`, `lens/work.md`, `lens/studio.md`) over shared facts
- [ ] Wiki information architecture — sidebar/organization rework (after transition)
- [ ] Starter / seed source packs — bootstrap an instance from a defined source list (low priority)
- [ ] Evaluate `rtk` (github.com/rtk-ai/rtk) for cheaper LLM tool calls (speculative)

## Open questions / raw notes

- What makes a wiki a wiki? What am I looking for when I use it?
- Possible discovery-mode shape: research subjects (abstract) → grab clean local copies → process into wiki
- Broader "use the best models / context economy / lazy skill loading" tooling lives at studio level, not this repo
