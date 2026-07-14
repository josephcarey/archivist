# Outstanding To Dos

See `ROADMAP.md` for the vision and phased plan. This file tracks the concrete work items,
grouped by phase.

## Phase 1 — Profile seam

- [x] Create `profile/` with `profile.md`, `taxonomy.md`, `rubric.md`, `source-types.md`
- [x] Move domain-specific conventions out of `AGENTS.md` into `profile/`
- [x] Make the engine read the profile instead of hardcoding conventions
- [x] Author the AI-research profile content
- [x] Slight rewrite of base files to reference the profile

## Phase 2 — Ingest hardening

- [x] Ingest hashing to detect changed sources
- [x] `defuddle` (or similar) for clean sources — pull the full clean source in a predictable md format
- [x] Command to grab new versions of each git repo and compare/diff the notes
- [x] Handle monorepo packages gracefully (per-package notes)
- [x] Repo-specific folder layout
- [ ] Apply the profile evaluation rubric during ingest (engine convention wired in Phase 1; verify in practice)
- [x] Add mermaid diagrams to generated pages

## Phase 3 — PR automation

- [ ] Host the repo on GitHub with Actions enabled (prerequisite)
- [ ] Action to detect new/changed sources on a PR
- [ ] Agent runner to ingest + commit wiki pages back onto the PR branch
- [ ] Skills and agents to keep this cleaner and use the best models
- [ ] Mirror Dan's approach to avoiding reading full skills into context unless needed

## Phase 4 — Shared consumption

- [ ] Rearrange sidebar (wiki pages on top, technical docs below; log/guides placement)
- [ ] Auto-maintained digest / "Things to Watch" page
- [ ] Publish the docsify site as the shared read surface
- [ ] Streamlined `/query` entry point over the whole wiki

## Open questions / raw notes

- What makes a wiki a wiki? What am I looking for when I use it?
- Roll a starter based on API — a series of sources you pull down (environments page,
  release notes, confluence docs, repos, services list, guide diagrams).
- Possible ingest pipeline shape:
  - Research subjects (abstract — go find sources, register them in "sources to be read")
  - Grab local copies of sources in cleaned-up md
  - Process sources into wiki
- Add rtk by default
