---
title: DSLs as LLM Interfaces
tags: [technique, agent, concept]
sources: [llm-and-dsls]
created: 2026-08-11
updated: 2026-08-11
---

# DSLs as LLM Interfaces

## Summary

A reusable design thesis: the most reliable way to make an LLM generate correct output is not a
better prompt but a **smaller, validated surface**. Constrain what can be said (a DSL or a clean
set of abstractions), give the constrained surface a deterministic validator, and let the
validator's domain-level errors drive an agentic generate-check-repair loop. The durable
artifact this produces is the DSL program itself, not the prompt that generated it.

## Key Concepts

- **Constrain the surface** — reduce the space of valid outputs (a DSL, a narrow API, a schema)
  so that a handful of in-context examples is enough for the LLM to reliably reproduce correct
  syntax and structure. A general-purpose language admits too much variation for this to work.
- **Validator-as-harness** — pair the constrained surface with a deterministic checker (parser,
  JSON schema, type checker, compiler, or a hand-written semantic validator). This turns
  "generate once and hope" into "generate, validate, repair" — an agent loop that needs no human
  in the middle.
- **Domain-level errors** — the validator's failure messages should speak in terms the LLM (and
  a human) can act on directly ("you cannot select an action before choosing a client"), not
  leak implementation details like stack traces. Error quality determines whether the repair
  loop actually converges.
- **Illegal states unrepresentable** — the strongest version of this constrains the surface so
  hard that invalid sequences fail to even parse/compile/type-check (progressive/staged builder
  interfaces, discriminated unions, schema `oneOf`/`required`). The weaker but still useful
  version is a runtime semantic validator that cross-checks references after the fact.
- **DSL-as-source-of-truth** — once the constrained surface exists, the generated artifact
  (not the prompt that made it) is what gets read, diffed, reviewed, and hand-edited later. This
  only holds if the artifact is dense and free of incidental boilerplate — otherwise you're back
  to needing the prompt to regenerate it.
- **The two-phase pattern** — Phase 1: LLM as brainstorming partner, helping design the DSL/
  abstraction itself (iterative, human owns the decisions). Phase 2: once the vocabulary is
  fixed, LLM as a dependable natural-language front end to it, because the vocabulary supplies
  both grounding context and the validator that checks the result.

## Details

This thesis generalizes the specific examples in [LLMs and DSLs](llm-and-dsls.md) (PlantUML
step-markers, Tickloom's semantic model, the internal Java scenario DSL) into a pattern
applicable wherever an LLM is asked to produce a structured artifact rather than free-form code
or prose:

1. Identify the domain concepts and give them names (a semantic model / ubiquitous language).
2. Build or reuse a syntax for expressing those concepts that admits far fewer valid strings than
   a general-purpose language would (a DSL, or at minimum a narrowly-scoped API/schema).
3. Attach a deterministic validator to that syntax — ideally one that already exists for free
   (a host-language compiler for an internal DSL, a JSON Schema validator for a data format).
4. Make the validator's errors legible at the domain level so an agent (or a human) can repair
   from them without inspecting internals.
5. Treat the resulting artifact, not the prompt, as what gets committed, reviewed, and evolved.

The pattern degrades gracefully: even without a bespoke DSL, a well-named library of types and
methods gives an LLM a smaller state space to hallucinate in than an unconstrained language does.
The cost is real and upfront — designing and maintaining the DSL/semantic model — so the payoff
concentrates in surfaces that are genuinely small, stable, and used repeatedly.

## Related Pages

- [LLMs and DSLs (Unmesh Joshi, Martin Fowler)](llm-and-dsls.md) — the source article this
  concept is extracted from, with concrete worked examples.
- [Entity Monorepo Pattern](entity-monorepo-pattern.md) — an in-house worked example that
  implements most of this thesis (validated `entity.json`, deterministic validator, generated
  artifact as source of truth) but is missing the Phase 2 natural-language front door.

## Sources

- Derived from [LLMs and DSLs](https://martinfowler.com/articles/llm-and-dsls.html) (Unmesh
  Joshi, martinfowler.com).
