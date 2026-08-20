---
title: "QA Checklist: Reviewing AI-Written Code"
tags: [agent, tooling, technique, analysis]
sources: [agentfield-ai-native-code-review, agentfield-harness-orchestration, pr-af-architecture]
created: 2026-08-20
updated: 2026-08-20
---

# QA Checklist: Reviewing AI-Written Code

## Summary

A practical, tool-agnostic checklist for reviewing code that an AI wrote, distilled
from AgentField's "AI-Native Code Review" essay and the architecture of their
open-source reviewer **PR-AF**. The core idea we adopt: when the same kind of
intelligence writes *and* checks the code, the pull request stops being a pass/fail
correctness gate and becomes a **risk map** — a list of where the risk lives, scored by
dimension, consumed by a human deciding what to attend to. AI-written code also has
its *own* characteristic failure modes that differ from human-written code, so the
review must actively hunt for them rather than reuse a generic checklist.

Use this for our AI/human dev studio and AI/human web agency: run it as an end-of-task
gate (not an inner-loop assistant), and lean hardest on Part B, which targets the ways
AI code fails specifically.

## Key Concepts

- **Discovery is the expensive half; fixing is cheap.** Once a risk is *named* in
  enough detail, fixing it usually takes minutes. So spend effort on finding risks, not
  on certifying their absence — certifying absence was never the affordable part.
- **Risk is a dial, not a verdict.** Each dimension (security, correctness, naming…)
  has its own bar. Security blocks a merge; naming gets logged and ships. Bars are
  visible knobs the team tunes over time, not hidden constants.
- **Split thinking from counting.** Use the model only for judgment ("is this risky?").
  Do anything mechanical — file/dependency mapping, severity scoring, dedup, formatting
  — in plain code, so results are cheap, fast, and *repeatable*.
- **Always add a challenger pass.** A separate step whose only job is to argue *against*
  each finding kills false positives — the #1 complaint about AI reviewers.
- **Check what's missing, not just what's wrong.** Absent tests, absent error handling,
  absent docs, and the requirement that never got built are findings too.
- **Cap every autonomous loop.** "Without caps, adaptive systems become unbounded cost
  sinks." Every self-directed agent needs a hard ceiling on turns, spawned children,
  and dollars.

---

## Part A — Universal review dimensions (any code)

Run these against every change. Each is a *dimension* with its own bar, not a
blanket pass/fail.

- [ ] **Intent match** — does the diff actually do what the PR/description claims?
      Anything claimed but not present? Anything present but not explained?
- [ ] **Blast radius** — which unchanged files depend on what changed? Were the
      most-exposed ones actually looked at?
- [ ] **Compound risk** — do two individually-fine changes combine badly (e.g. one adds
      a nullable return, another dereferences it)? This is the highest-value, hardest
      check — do it deliberately.
- [ ] **Security bar (blocks merge)** — input validation, injection, authz boundaries,
      secret handling on any touched sensitive path.
- [ ] **Failure/rollback** — what happens when an external call fails halfway? Is state
      left consistent? Are there race conditions under concurrency?
- [ ] **Unrelated changes** — is there drive-by cleanup mixed into a feature change that
      should be its own PR?
- [ ] **Coverage gate** — did at least one reviewer look at every meaningful cluster of
      the change? A feature PR with no test review is suspicious by default.

## Part B — AI-code-specific failure modes (the part that matters most for us)

These are the ways AI-written code fails *differently* from human code. Turn scrutiny
**up** whenever the author was an agent.

- [ ] **Hallucinated references** — do every imported module, function, method, and
      config key *actually exist*? AI invents plausible-but-nonexistent APIs.
- [ ] **Tests that assert nothing** — do the tests check meaningful behavior, or do they
      just run and pass? AI loves to produce green tests that verify nothing.
- [ ] **Plausible but architecturally wrong** — is the code locally correct yet in the
      wrong layer, bypassing an existing pattern/abstraction the codebase already has?
- [ ] **Over-abstraction** — did it add interfaces/indirection/config that add complexity
      without earning it? AI over-engineers to look thorough.
- [ ] **Ignored existing conventions** — did it reinvent a helper, validator, or error
      type that already exists? (A flagged "issue" that is actually the project's
      established convention is a false positive — check both directions.)
- [ ] **Confident-but-wrong comments/docs** — do the comments describe what the code
      *actually* does, or a tidy story that drifted from the implementation?
- [ ] **Silent scope drift** — did it quietly do more (or less) than asked, and narrate
      it as complete?
- [ ] **Copy-paste inconsistency** — repeated near-identical blocks that should share a
      path, or one of N call sites left un-updated.

## Part C — Process guardrails (how we run the review, not what we check)

- [ ] **Per-task plan, not a fixed template** — generate the specific things to check
      for *this* change before reviewing. A migration needs "rollback safety / data
      integrity"; a logging refactor needs "behavior preserved / no files missed."
- [ ] **Challenger pass ran** — every finding survived an explicit attempt to invalidate
      it (safe behavior? intended? existing mitigation? weak evidence?).
- [ ] **Evidence-grounded** — each finding cites the actual code (file + line + snippet),
      not a vibe. Ungrounded findings are pruned.
- [ ] **Deterministic scoring** — severity/priority computed by rule, so the same
      findings always score the same. Humans read the map; code makes the number.
- [ ] **Hard caps set** — the autonomous review has an explicit ceiling (max sub-agents,
      max depth, max spend) before it runs unattended on a repo.
- [ ] **Human owns the merge** — the review outputs a risk map; a named person makes the
      call and carries accountability. No agent merges on its own judgment.

## Details

### The four jobs a pull request was actually doing

AgentField's framing: the PR gate was never only a correctness check — it bundled four
jobs that traveled together because review was slow: **correctness**, **knowledge
transfer**, **risk visibility**, and **distributed accountability**. When AI writes the
code, that bundle comes apart unevenly — correctness becomes cheap and parallel,
knowledge transfer goes one-way, risk visibility becomes *more* load-bearing, and
accountability stays put (no AI can yet bear it). This checklist reorganizes review
around the jobs that got *harder*, not the one (correctness) that got cheap.

### Why a checklist per task beats one fixed template

PR-AF's central move is a *planner* that reads the specific change and writes the
review questions for it, then spawns one small reviewer per question in parallel. There
is exactly one reviewer definition; the planner creates N instances by handing each a
different runtime-crafted prompt (no hardcoded "security/style/perf" menu). A fixed list
would never generate "check the Stripe rollback on line 47" or "did the logging refactor
miss any of the 20 files." For our repeated workflows (client onboarding, PR review,
content QA), a generate-the-checklist step produces more relevant coverage and catches
the weird, change-specific stuff.

### Why the challenger pass is the highest-leverage single trick

Noise is what makes teams ignore an AI reviewer. PR-AF runs a dedicated **adversary**
agent that tries to shoot down every finding — "is this pre-existing? is this the
project's own convention? is the severity overblown?" — and then feeds that verdict into
deterministic scoring: findings the adversary confirms get a severity **boost**, findings
it successfully challenges get a **discount**, and traps it uncovers become new findings.
We can bolt this onto *anything* an AI produces (a review, a plan, a client proposal):
add a cheap second pass whose only job is to try to falsify the first. What survives is
trustworthy.

### Verify outcomes, don't control process

The harness-orchestration essay's throughline: as the unit of work gains agency, you
can't dictate its steps — you must **verify its outcomes and govern its boundaries**.
Their orchestrator "defines roles, not steps," and QA/reviewer harnesses evaluate code
they didn't write. Practically, "verification scales with agency": the more autonomous
the author, the more review, testing, and integration infrastructure you need around it.
That is exactly why an end-of-task gate — not tighter inner-loop control — is the right
shape for reviewing agent output.

### Caveats on the source

- PR-AF is built as a pipeline gate (its config caps a run at ~60 minutes; the doc notes
  "real reviews measure 60-70 min"), not a live inner-loop assistant. Adopt the
  *patterns*; treat it as an end-of-task gate.
- Its performance claims are self-reported by the vendor. Believe the design, not a
  leaderboard number.
- The tool runs on AgentField's platform; the patterns here are portable and require no
  such dependency. (PR-AF, AgentField, and SWE-AF are Apache 2.0.)

## Related Pages

- [Wiki Index](index.md) — no dedicated agent-orchestration or evaluation concept pages
  exist yet; cross-link them here as they are added.

## Sources

- AgentField, "How an AI-Native Engineering Team Does Code Review":
  `https://agentfield.ai/blog/ai-native-code-review`
- AgentField, "What Is Harness Orchestration":
  `https://agentfield.ai/blog/what-is-harness-orchestration`
- PR-AF architecture:
  `https://github.com/Agent-Field/pr-af/blob/main/docs/ARCHITECTURE.md`
