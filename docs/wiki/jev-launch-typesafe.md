---
title: "Introducing System One Models & Jev (TypeSafe AI)"
tags: [model, product, org, technique, source]
sources: [jev-launch-typesafe]
created: 2026-09-16
updated: 2026-09-16
---

# Introducing System One Models & Jev (TypeSafe AI)

## Summary

The launch announcement from TypeSafe AI (founder Diogo Almeida, ex-OpenAI) introducing
**System One Models** — a new class of frontier models built to make fast, structured decisions
that software can consume directly — and their first public model, **Jev**. Jev takes
unstructured input plus a typed schema and returns typed, probabilistic decisions in a single
parallel forward pass, trading away free-form text generation for speed, calibrated confidence,
and guaranteed type-safety. The post frames Jev as "a frontier-intelligence function call:
unstructured state in, typed probabilistic decisions out."

## Evaluation

| Dimension | Score | Note |
|-----------|-------|------|
| Novelty | 5/5 | New model class, a parallel (non-autoregressive) sampler for structured output, and a new training method (RLCD). Positioned as a distinct inference paradigm, not an incremental LLM. |
| Credibility | 3/5 | First-party vendor announcement; founder has relevant OpenAI pedigree and publishes pricing + workflow evals. But benchmarks are self-run (from team laptops), reference answers come from competitor models, and several claims (unsubsidized pricing) are acknowledged as currently unfalsifiable. |
| Relevance | 5/5 | Squarely in-domain: frontier models, inference efficiency, agent/workflow tooling. |
| Maturity | 2/5 | Early access with a waitlist; service is West-Coast-only; evals run from laptops. Not production-proven. |
| Cost/efficiency | 5/5 | Claims $0.042 / MTok input (free output), 70–500 ms end-to-end latency, and 40–200× speed / up to ~444× cost advantage vs. frontier LLMs on structured "System One" queries. |

## Key Concepts

- **System One Model** — a model class named after Kahneman's fast, intuitive "System 1"
  thinking; optimized for fast, focused, structured judgments rather than deliberative text.
- **Jev** — TypeSafe's first System One model, named after economist William Stanley Jevons
  (Jevons paradox: cheaper intelligence unlocks orders of magnitude more use cases).
- **Typed probabilistic decisions** — outputs are type-safe structured values with calibrated
  probabilities and confidence scores; the model "never makes type errors" and "can't
  hallucinate" a value outside the defined schema.
- **Parallel sampling** — all outputs are generated in one query rather than token-by-token,
  which is where the speed and cost advantages come from.
- **RLCD (Reinforcement Learning for Calibrated Decisions)** — TypeSafe's training method,
  contrasted with RLHF and RLVR; optimizes for epistemically honest probabilities.
- **Target use cases** — "smart if-statements" / AI-powered workflows, map-reduce over big
  data, real-time applications (e.g., a bot playing Doom, Wikiracing), and verifying/guarding
  LLM prompts and outputs.

## Details

### The core claim

Existing LLMs are optimized (via RLHF/RLVR) to produce **strings** autoregressively. Strings are
maximally flexible but must be parsed and validated to be used by software, carry hallucination
and type-error risk, and are slow because each token needs a forward pass. Jev instead emits
**type-safe structured values** whose shape is [defined in advance](https://docs.typesafe.ai/),
generated in parallel. The pitch: similar intelligence to frontier LLMs on "System One"-shaped
tasks, at two orders of magnitude more speed and efficiency.

### Evidence presented

- **Side-by-side demo** vs. GPT-5.6 Terra, showing parallel probability output.
- **Workflow evals** ([evals.typesafe.ai](https://evals.typesafe.ai/)): a novel eval that fixes a
  "correct" compute graph (a workflow in code) and uses the average of the largest external
  models (GPT-6 Astra and Fable 5.1) as reference probabilities. Jev is claimed to own the
  Pareto frontier by nearly two orders of magnitude — source of the "193.6× faster, 444.6×
  cheaper" homepage numbers.
- **Type-safety / hallucination**: schema matching is guaranteed, so type-error and
  schema-hallucination rates are 0% by construction (not empirical).

The post is candid about caveats: evals were built by TypeSafe's own capabilities team, the
reference models bias toward OpenAI/Anthropic answers, and the LLM baselines are forced through a
[System One adapter](https://github.com/typesafe-ai/system-one-adapter-python) that constrains
them to structured decisions.

<!-- gap: RLCD (Reinforcement Learning for Calibrated Decisions) training details are not public — how calibration is actually optimized is unstated. -->

## Related Pages

- [Jev](wiki/jev.md)
- [System One Models](wiki/system-one-models.md)
- [TypeSafe AI](wiki/typesafe-ai.md)
- [Structured Output](wiki/structured-output.md)
- [Jev means structured output is interesting again](wiki/jev-structured-output-goedecke.md)

## Sources

- TypeSafe AI blog: <https://typesafe.ai/blog/introducing-system-one-models-and-jev>
- Company site: <https://typesafe.ai/>
- Docs: <https://docs.typesafe.ai/>
- Workflow evals: <https://evals.typesafe.ai/>
