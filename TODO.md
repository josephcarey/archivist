# Outstanding To Dos

See `ROADMAP.md` for the vision and phased plan. This file tracks the concrete work items,
grouped by phase.

## Repo setup (one-time human steps)

These are GitHub-side settings the automation depends on. Do them once on the hosted repo:

- [ ] **Enable GitHub Pages** — Settings → Pages → Source: **GitHub Actions**. Lets
  `.github/workflows/pages.yml` deploy the site.
- [ ] **Allow Actions to open PRs** — Settings → Actions → General → Workflow permissions →
  check **"Allow GitHub Actions to create and approve pull requests."** Required for the
  scheduled feed (`feed.yml`) to open its `feed/discovery` PR.
- [ ] **Firewall allowlist for fetching** — the Copilot coding agent (and CI feed/ingest fetches)
  run behind a network firewall. To let it fetch external URLs / clone remote repos, add the
  domains to Settings → Copilot → coding agent (firewall allowlist), **or** commit the source
  under `raw/files/` so it can be read offline. Files already in `raw/` need no network access.
- [ ] **Assign ingest work to Copilot** — to author pages in CI, open an *Ingest a source* issue
  (or a `raw/**` PR) and assign it to **Copilot**. (Ongoing, not one-time, but same setup family.)

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
- [ ] One-time: enable Pages (Settings → Pages → Source: GitHub Actions) — see **Repo setup** above

## Phase 6 — Automated ingestion

- [x] PR ingest-check: Action detects new/changed sources on a PR and comments a report (`.github/workflows/ingest.yml` + `scripts/report.js`)
- [x] **Authoring model decided: local/human `/ingest` for now** — the ingest-check flags what changed; a human runs `/ingest` in the CLI and pushes the pages. Zero new CI infra/cost (fits budget-grind).
- [x] **CI page-authoring via GitHub Copilot coding agent** — wired up: `copilot-setup-steps.yml` prepares the env (Node + deps + smoke test), an **Ingest a source** issue form (`.github/ISSUE_TEMPLATE/ingest.yml`) is the trigger (assign to Copilot), and AGENTS.md documents the CI-authoring flow + firewall note. Human steps: assign issues to Copilot; allowlist domains for URL/repo fetches.
- [x] Scheduled feed discovery (discovery-only): `scripts/feed.js` polls `profile/feeds.md`, appends new candidates to the queue, `.github/workflows/feed.yml` opens a weekly PR. `scripts/seed-catalog.js` imports a curated catalog + autodiscovers each source's RSS feed. Seeded from meta-claude's catalog (43 articles, 8 blog feeds).
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
