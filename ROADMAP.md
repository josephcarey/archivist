# Roadmap — Archivist

Ideas and directions scoped to this project that aren't yet ready for kanban cards.
Items here have some confidence behind them but lack the detail or priority to schedule.
Promote to the kanban board when ready to act on.

---

## Vision

Archivist is a **git-native knowledge commons**: sources arrive by PR, an agent ingests
and evaluates them locally, and the resulting wiki is committed back — so personal, work,
and studio contexts can all consult a single shared brain of "what we generally know."

The first instance targets **AI research & things-to-watch**, but the engine itself stays
domain-agnostic.

## Architecture — one repo, profile seam (decided)

Everything lives in **one shared repo** (single source of truth). The abstraction is an
*internal seam*, not a second repo. Three layers:

| Layer | Location | Abstract or specific |
|-------|----------|----------------------|
| **Engine** | `AGENTS.md`, `scripts/`, `docs/` shell, ingest/query/lint ops, PR automation | Abstract — never hardcodes "AI" |
| **Profile** | `profile/` (the seam) | Names this instance's domain, taxonomy, source types, eval rubric |
| **Content** | `raw/`, `docs/wiki/` | Specific — the AI knowledge itself |

Rule: **all domain specifics are quarantined in `profile/`.** The engine reads the profile;
it never mentions the domain. Re-instancing = copy repo, rewrite `profile/`, clear
`raw/` + `docs/wiki/`. This keeps the door open to later extract an `archivist-core`
template repo with minimal rework, without paying the multi-repo tax today.

Proposed `profile/` contents:
- `profile.md` — domain statement ("this instance = AI research & things to watch")
- `taxonomy.md` — default tags/categories (models, agents, evals, infra, safety, tooling, papers, people, orgs)
- `rubric.md` — how to evaluate a source (novelty, credibility, relevance, watch-level, maturity)
- `source-types.md` — recognized source kinds (paper/arXiv, repo, blog/article, release notes) and how each is handled

## Phased plan

### Phase 1 — Extract the profile seam
- Introduce `profile/` and move all domain-specific conventions out of `AGENTS.md` into it.
- Make the engine (`AGENTS.md` + scripts) read the profile rather than hardcode conventions.
- Author the AI-work profile (`profile.md`, `taxonomy.md`, `rubric.md`, `source-types.md`).
- Low risk; unblocks everything else.

### Phase 2 — Ingest hardening
- Content hashing on ingest to detect changed sources (skip/refresh intelligently).
- `defuddle` (or similar) for clean article extraction into a predictable md format.
- Graceful repo + monorepo handling (per-repo folders, package-level notes).
- Apply the profile's evaluation rubric during ingest.
- Command to refresh git-repo sources and diff against existing notes.

### Phase 3 — PR automation (fully automated ingest)
- GitHub Action fires when a PR adds/changes a source in `raw/`.
- An agent runner ingests, generates/updates wiki pages, evaluates, and commits back onto
  the PR branch; human reviews and merges.
- **Dependency:** repo must be hosted on GitHub with Actions enabled + an agent runner
  (e.g. Copilot coding agent triggered on PRs). Currently the repo host is local/unknown —
  hosting is a prerequisite for this phase.

### Phase 4 — Shared consumption
- Make "consult what we know" easy across personal/work/studio.
- Maintain a digest / "Things to Watch" page automatically.
- Publish the docsify site as the shared read surface everyone points at.
- Streamlined `/query` entry point over the whole wiki.

## Open questions
- Where does the agent runner for Phase 3 live, and which model(s)?
- Do personal/work/studio each open PRs against the one repo, or is there a submission queue?
- Retention/versioning: how do we handle a source that changes upstream over time?

