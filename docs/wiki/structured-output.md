---
title: Structured Output
tags: [technique, concept]
sources: [jev-launch-typesafe, jev-structured-output-goedecke]
created: 2026-09-16
updated: 2026-09-16
---

# Structured Output

## Summary

Structured output is the practice of getting an AI model to return typed, schema-conforming values
(rather than free-form prose) that software can consume directly. It spans a spectrum: from
grammar-constrained decoding bolted onto ordinary LLMs, to prefill + single-token constrained
sampling, to purpose-built models like [Jev](wiki/jev.md) that *only* emit structured decisions.
The [Jev launch](wiki/jev-launch-typesafe.md) and
[Goedecke's response](wiki/jev-structured-output-goedecke.md) together make this a live debate
about how much of the value is the model vs. the inference strategy.

## Key Concepts

- **Grammar-constrained decoding** — the LLM decodes autoregressively as usual, but the sampler
  discards tokens that would violate the target grammar/schema (e.g., can't emit `]` before `[`).
  Flexible (arbitrary JSON) but still token-by-token, hence slow.
- **Prefill + single-token constraint** — prefill the response (e.g., `"choice": "`) and generate
  a single token restricted to the allowed choices. Because inputs are ingested in parallel and
  choices can be batched, this is much faster than emitting a full blob; it can't do long-form
  structured output but captures much of the speed/consistency benefit.
- **Purpose-built structured models (System One)** — a model trained to emit only structured
  decisions in a single parallel pass, e.g. Jev. Guarantees schema conformance by construction and
  attaches calibrated probabilities/confidence.
- **Type-safety vs. correctness** — constraining outputs to a schema removes type errors and
  out-of-schema hallucinations, but does **not** guarantee the *right* choice is made.
- **Confidence/calibration** — structured decisions can carry a probability distribution over the
  option space; its shape (peaked vs. flat) signals certainty and can gate act/confirm/escalate
  behavior in code.

## Details

### The moat debate

The launch post frames dedicated structured-output models as a genuinely new primitive with a
training moat (RLCD) and unique properties ("can't hallucinate," "calibrated," "free output").
[Goedecke](wiki/jev-structured-output-goedecke.md) counters that fast structured output is largely
achievable today with existing open models via prefill + constrained decoding, and demonstrated a
~2–3× speedup himself on `Qwen2.5-1.5B-Instruct`. The open question is whether training a model
*specifically* for structured decisions yields meaningfully better accuracy/calibration than
retrofitting an LLM.

### Why it matters

Both sources agree on the upside: cheap, low-latency structured decisions could be a new building
block — injecting ~100 ms of intelligence at decision points inside ordinary programs (routing,
scoring, extraction, guardrails, real-time control) rather than wrapping everything in a chatbot.

## Related Pages

- [Jev](wiki/jev.md)
- [System One Models](wiki/system-one-models.md)
- [Introducing System One Models & Jev (TypeSafe AI)](wiki/jev-launch-typesafe.md)
- [Jev means structured output is interesting again](wiki/jev-structured-output-goedecke.md)

## Sources

- Sean Goedecke: <https://www.seangoedecke.com/jev-means-structured-output-is-interesting-again/>
- TypeSafe launch post: <https://typesafe.ai/blog/introducing-system-one-models-and-jev>
- TypeSafe docs: <https://docs.typesafe.ai/>
