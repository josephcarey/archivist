---
title: "LLMs and DSLs (Unmesh Joshi, Martin Fowler)"
tags: [technique, source]
sources: [llm-and-dsls]
created: 2026-08-11
updated: 2026-08-11
---

# LLMs and DSLs (Unmesh Joshi, Martin Fowler)

## Summary

An article by Unmesh Joshi, published on Martin Fowler's site, arguing that Domain-Specific
Languages (DSLs) — and clean abstractions more broadly — are what make LLMs reliable code
generators. Because upfront specification is impossible and design is discovered through
implementation, the LLM's most durable role is helping build a small, constrained vocabulary
(a DSL or semantic model); once that vocabulary exists, the LLM becomes a dependable
natural-language front end to it, checked by the DSL's own deterministic validator. The
generated DSL artifact — not the prompt — becomes the thing humans maintain.

## Key Concepts

- **Upfront-spec impossibility** — a specification is a starting hypothesis, not a finished
  blueprint; real constraints and edge cases surface only during implementation.
- **Design is discovered through implementation**, not through reviewing generated code —
  writing forces concrete decisions that reviewing does not.
- **DSLs strip variation** — a general-purpose language has many valid ways to express the same
  intent; a DSL has few, so a handful of in-context examples reliably yields correct output.
- **The validator is the agentic harness** — a DSL ships with a deterministic checker (parser,
  JSON schema, type checker, compiler). An agent can generate, run it past the validator, and
  repair from the error without a human in the loop.
- **Errors should be domain-level**, not stack traces (e.g. "you cannot select an action before
  choosing a client"), so the repair loop stays legible.
- **Illegal states unrepresentable** — progressive/staged interfaces make whole classes of
  malformed output fail to compile/validate, rather than surface as runtime surprises.
- **Clean abstractions are a lighter version of the same idea** — even without a bespoke DSL, a
  library's well-named types and methods are a vocabulary the model can be grounded in.
- **The two-phase pattern**: Phase 1, the LLM as brainstorming partner co-designing the DSL/
  abstraction (iterative, human stays in the driver's seat); Phase 2, the LLM as a
  natural-language interface to the now-established vocabulary (dependable, because the
  abstraction supplies both context and harness).
- **The DSL is the source of truth**, not the prompt — the generated artifact is dense,
  boilerplate-free, and remains the thing maintained and re-edited later.

## Details

### The limits of upfront specification and design-by-implementation

Large systems involve many small design decisions that cannot be known in advance. A spec is a
hypothesis; real constraints are discovered iteratively. Reviewing generated code checks intent
but rarely forces the reviewer to wrestle with design decisions the way writing code does. The
author sees LLMs playing two roles depending on whether a domain vocabulary already exists:
brainstorming partner while shaping it, natural-language interface once it's established.

### Why DSLs work so well with LLMs

DSLs (PlantUML, Mermaid, SQL, Kubernetes YAML) are deliberately constrained — a narrow set of
concepts in one domain — so a few in-context examples are enough for an LLM to reliably generate
correct syntax. For an *agent* (LLM in an autonomous generate-and-check loop), the DSL's
deterministic validator (parser/schema/type-checker/compiler) becomes the harness: generate,
validate, repair from a domain-level error, repeat — no human needed in the loop. This is not
free: the advantage holds only while the DSL stays small enough to convey via a few examples, and
there is real upfront cost designing and maintaining the language and its semantic model.

### Example: PlantUML step-markers + slide YAML

Joshi built a small tool combining a step-marked PlantUML extension (`'[step]` comments marking
sequence-diagram steps) with a slide-description YAML consumed by a PowerPoint generator. The
LLM first acted as co-designer of the step-marker convention and YAML shape, then as
natural-language interface, turning prompts like *"Create a slide YAML referring to the diagram
'quorum-write' with title 'Quorum Write Example'"* directly into valid, tool-consumable YAML.
Here the YAML's parsed syntax tree doubles as the semantic model (coupling syntax to execution
semantics — a shortcut that works for simple domains).

### Example: Tickloom — a semantic model for distributed systems

[Tickloom](https://github.com/unmeshjoshi/tickloom) is a framework for building/testing
distributed algorithms (quorum stores, Raft, Paxos). Its abstractions (`Replica`, single-threaded
deterministic `tick()` loop, `quorumRequest`, `countResponseIf`, `MessageType`, `Handler`) settle
threading, timing, and networking as fixed decisions, so prompts like *"implement a quorum-based
key-value store using the Tickloom Replica abstraction..."* stay at the protocol level rather than
re-deciding plumbing every time. The article notes even a clean set of abstractions/vocabulary —
without a bespoke DSL — gives an LLM a similarly small state space to work in (Tickloom's four
seams: `Process`/`Replica`, `Network`, `Storage`, `Clock`).

### Example: internal Java scenario DSL

Writing distributed-system test scenarios directly against Tickloom's testkit (manual `tick()`
loops, futures, byte encoding) buries intent under mechanics and is hard to review. Joshi built
an internal DSL (`QuorumStepBuilder.scenario(...).servers(...).clients(...).steps(...)`) whose
vocabulary is the scenario itself — servers, clients, connections, actions, faults
(`partition(...).from(...)`, `delay(...).byTicks(...)`). Because it's an *internal* DSL in Java,
progressive/staged interfaces make illegal sequences (e.g. an action before selecting a client)
fail to *compile* — the host language's own compiler is the validator, and a malformed generation
comes back as a compile error pinned to the illegal step. A natural-language description of a
failure scenario (e.g. reproducing a DDIA §10.6 non-linearizable quorum read) then maps almost
directly onto the DSL's constrained vocabulary, leaving little room for the LLM to hallucinate.

### Two phases working with LLMs

1. **Phase 1 — designing the abstraction/DSL.** LLM as brainstorming partner: sketches
   alternatives, critiques a design, ports ideas across languages. Iterative and
   feedback-driven; the human owns the design decisions (progressive interfaces, semantic model
   vs. builder separation) because these are exactly the decisions you need to understand.
2. **Phase 2 — natural-language interface to the finished vocabulary.** The LLM becomes a
   dependable generator because the abstraction supplies both the grounding context and the
   checking harness.

### The DSL as the source of truth

Against the trend of treating prompts as the primary source of truth, the article argues a
well-designed DSL flips this: the generated artifact — dense, expressive, free of incidental
boilerplate — is what remains readable and gets maintained. If a Tickloom scenario needs to
change next month, you edit the scenario, not regenerate from a recovered prompt.

## Related Pages

- [DSLs as LLM Interfaces](dsls-as-llm-interfaces.md) — the reusable thesis extracted from this
  article, generalized beyond this one source.
- [Entity Monorepo Pattern](entity-monorepo-pattern.md) — an in-house worked example that
  embodies (and partially deviates from) this pattern.

## Sources

- [LLMs and DSLs](https://martinfowler.com/articles/llm-and-dsls.html) — Unmesh Joshi, via
  martinfowler.com.

## Evaluation

| Dimension | Score | Note |
|-----------|-------|------|
| Novelty | 4/5 | Names and structures a pattern (DSL-as-harness, two-phase LLM role) that's been informally practiced but rarely articulated this precisely. |
| Credibility | 4/5 | Practitioner-authored (Unmesh Joshi), published on martinfowler.com, backed by concrete open-source examples (Tickloom, MADSPlantUMLSteps) rather than only claims. |
| Relevance | 5/5 | Directly core to this instance's domain: agent tooling/patterns for reliable LLM code generation. |
| Maturity | 3/5 | The core idea is production-tested in the author's own projects, but presented as an essay/observation rather than a formalized methodology with broad case studies. |
| Cost/efficiency | 4/5 | The pattern itself is cheap to adopt (no new infra) — the cost is the upfront DSL/semantic-model design effort, which the article flags explicitly. |
