---
title: Entity Monorepo Pattern
tags: [technique, tooling, concept]
sources: [llm-and-dsls]
created: 2026-08-11
updated: 2026-08-11
---

# Entity Monorepo Pattern

## Summary

`masterysystems/jc-test-entity-monorepo` (public name `external-api-widget-v1-0`) is an in-house
reference/template monorepo that generates a full four-service event-driven system (sync API,
async API, orchestrator, hydrator) from one hand-authored, schema-validated `entity.json` file.
Read as a worked example of [DSLs as LLM Interfaces](dsls-as-llm-interfaces.md), it embodies the
DSL-plus-validator-plus-source-of-truth structure closely — with the deterministic parts working
well, but with the LLM-facing half of the pattern (Phase 2, error quality, generate-validate-repair
loop) largely unbuilt.

## Key Concepts

- **`entity.json` is the DSL** — a single declarative file (per entity, e.g. `widget.entity.json`)
  describing identifiers, CRUD operations, Kafka topics/bindings, GraphQL hydration fields, and
  feature-flag/escape-hatch toggles. This is the "few in-context examples reliably generate
  correct output" surface from the source article, in JSON form rather than a custom syntax.
  Example: [`widget.entity.json`](https://github.com/masterysystems/jc-test-entity-monorepo/blob/main/widget.entity.json).
- **`entity.schema.json` is the semantic model** — a JSON Schema that formally defines what a
  valid `entity.json` looks like (required fields, operation enums, topic shape). This plays the
  role Tickloom's `Replica`/`Network`/`Storage`/`Clock` seams play in the source article: a fixed
  vocabulary the generator (and, potentially, an LLM) is grounded in.
- **A dependency-free deterministic validator is the harness** — `tools/entity-monorepo-tools/lib/validate.mjs`
  validates a candidate `entity.json` against the schema *and* runs additional semantic
  cross-reference checks (e.g. topic bindings referencing topics that exist, hydrate fields
  referencing declared identifiers). This is the generate-and-check harness the source article
  describes, but currently used to gate the *generator*, not an LLM-driven authoring loop.
- **CI freshness/determinism gates keep the generated artifact canonical** — `ci:freshness`
  (`tools/entity-monorepo-tools/freshness-gate.mjs`), `check-gen`/`check-build`-style tasks, and
  `verify:determinism` re-run the generator against the committed `entity.json` and fail the
  build if the emitted repo tree differs from what's checked in. This is the DSL-as-source-of-truth
  idea enforced mechanically: the generated services are never hand-edited; `entity.json` is.
- **Vendored, regenerate-only generated tooling** — `tools/entity-monorepo-tools/` itself is
  emitted verbatim by the generator into every converted repo and is explicitly "upstream-owned
  and regenerate-only" (see its README) — a stronger, repo-wide version of "the generated
  artifact is what's maintained," applied to the tooling layer as well as the application code.

## Details

### How the pieces map onto the source article's pattern

| Source article concept | Entity monorepo equivalent |
|---|---|
| DSL that strips variation | `entity.json` — a handful of fields (identifiers, operations, topics, graph hydration) instead of hand-writing four services' worth of Kafka/GraphQL/Fastify plumbing |
| DSL's deterministic validator | `entity.schema.json` (JSON Schema) + `validate.mjs` (schema validation + semantic cross-ref checks) |
| Domain-level errors | Partially present — schema validation errors are largely structural (JSON Schema violations), not phrased as "you referenced topic X which doesn't exist" in every case (see gaps below) |
| Illegal states unrepresentable | Enforced via JSON Schema constraints (enums for `operations`, required properties) rather than a progressive builder API, since the DSL is declarative data, not a fluent internal DSL |
| DSL as source of truth | Strongly enforced — `ci:freshness` / determinism gates fail CI if the generated service tree drifts from what `entity.json` would emit; generated code under `tools/entity-monorepo-tools/` is explicitly marked "do not hand-edit" |
| Two-phase LLM pattern | Only Phase 1 (a human designs `entity.json`, the generator/schema is the discovered abstraction) is present. Phase 2 — an LLM turning a natural-language request into a valid `entity.json` — is not wired up |

### What ships today

- **`widget.entity.json`** — the one golden example, describing a synthetic `Widget` entity:
  `create`/`patch`/`delete` operations, six Kafka topics (ingress, ingress-dlq, result,
  result-dlq, reply, reply-dlq) with producer/consumer bindings per service, GraphQL
  `hydrateFields`, and escape hatches (`redisCache`, `circuitBreaker`, `dlq`, etc.) as boolean
  toggles.
- **`tools/entity-monorepo-tools/generate-entity.mjs`** and **`lib/emit.mjs`/`emit-services.mjs`/
  `emit-tooling.mjs`** — the generator that turns a validated `entity.json` into the four
  `apps/` services and shared `packages/`.
- **`tools/entity-monorepo-tools/lib/validate.mjs`** (+ `validate.test.mjs`) — schema validation
  plus semantic checks, run before generation.
- **`package.json` scripts** — `ci:freshness`, `verify:conventions`, `verify:determinism`,
  `verify:boundaries`, `verify:fuzz`, `verify:roundtrip`, `verify:dogfood`, chained into a single
  `ci` script (`nx run-many -t build && ci:freshness && verify:conventions`) — a battery of
  determinism/drift guards well beyond what the source article's DSL examples describe.

### Gaps relative to the DSLs-as-LLM-interfaces thesis

- **No natural-language front door (Phase 2 missing).** There is no LLM-facing tool that turns
  "add a `sku` identifier and a `reserve` operation to the Widget entity" into a diffed
  `entity.json`. The DSL exists and is validated, but nothing yet plays the role PlantUML's
  step-marker prompt or the Tickloom scenario-DSL prompt play in the source article.
- **Only one golden example shipped.** `widget.entity.json` is the sole worked instance. The
  source article's claim that "a few in-context examples are enough" is untested here — there
  isn't yet a second or third entity example to see whether an LLM (or a human) could
  generalize the pattern from examples alone versus needing the schema/docs.
- **No explicit generate → validate → repair loop.** `validate.mjs` is invoked as a build/CI
  gate, not as a harness an agent iterates against. Nothing currently automates "attempt an
  edit, run the validator, feed the failure back, retry."
- **Validator errors are structural, not domain-level.** Schema-validation failures surface as
  JSON Schema violation messages (wrong type, missing required property) rather than "nearest
  match" suggestions or domain-phrased guidance (e.g. "the topic `pvt.external-api.ingress.widget-v1-0.result` referenced by `hyd` isn't declared in `topics.list`" would be more actionable than a generic schema mismatch). Closing this gap would materially improve suitability for an LLM-driven repair loop, per the source article's emphasis on domain-level errors.

## Related Pages

- [DSLs as LLM Interfaces](dsls-as-llm-interfaces.md) — the general thesis this repo is a worked
  (partial) instance of.
- [LLMs and DSLs (Unmesh Joshi, Martin Fowler)](llm-and-dsls.md) — the source article.

## Sources

- [masterysystems/jc-test-entity-monorepo](https://github.com/masterysystems/jc-test-entity-monorepo)
  — repository root, `README.md`, `widget.entity.json`, `entity.schema.json`,
  `tools/entity-monorepo-tools/` (README, `lib/validate.mjs`, `freshness-gate.mjs`).
