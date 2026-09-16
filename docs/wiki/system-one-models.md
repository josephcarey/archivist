---
title: System One Models
tags: [model, technique, concept]
sources: [jev-launch-typesafe, jev-structured-output-goedecke]
created: 2026-09-16
updated: 2026-09-16
---

# System One Models

## Summary

"System One Models" is TypeSafe AI's name for a class of AI models built to make fast, structured
decisions that software can consume directly. Instead of generating text autoregressively, a
System One model evaluates a **state** against typed **questions** and returns typed values with
calibrated probabilities in a single parallel forward pass. The name references Daniel Kahneman's
fast, intuitive "System 1" thinking (as opposed to slow, deliberative "System 2" reasoning). Jev
is the first System One model.

## Key Concepts

- **Fast, focused judgments** — the model's job is the kind of gut-check a knowledgeable person
  could make in a few seconds, not extended reasoning.
- **Calibrated decisions** — probabilities are trained to reflect uncertainty against outcomes;
  calibration is a property of *groups* of predictions, not a guarantee any single answer is
  correct.
- **No generation** — System One models do not write replies, code, or explanations; the answer
  space is defined up front via primitives (Choice / Score / Noul).
- **Parallel, isolated evaluation** — each question is evaluated independently against the same
  state, so questions don't interfere ("context rot") and latency barely grows with question
  count.
- **RLCD (Reinforcement Learning for Calibrated Decisions)** — the training method TypeSafe
  contrasts with RLHF (human preference) and RLVR (verifiable rewards); it optimizes for
  epistemically honest probabilities on decision tasks.
- **Composed in code** — decompose complex judgments into atomic questions, then combine typed
  answers with deterministic logic, weighting factors with your own coefficients.

## Details

### Contrast with LLMs

| | LLMs | System One Models |
|---|------|-------------------|
| Trained with | RLHF / RLVR | RLCD |
| Optimizes for | Preferred text / verifiable outputs | Calibrated decisions |
| Output | Strings (parse + validate) | Typed values + probabilities |
| Sampling | Sequential (token-by-token) | Parallel (single pass) |
| Failure modes | Hallucination, type errors, "off the rails" | Constrained to schema; can still choose wrong |
| Best for | Human-in-the-loop, open-ended, verifiable problems | "Smart if-statements," routing, scoring, real-time |

### Where it fits

System One models are positioned as a decision layer *inside* ordinary software: classify, route,
score, extract, guardrail, or branch where hand-written logic is too brittle but a full LLM is too
slow, expensive, or unpredictable. Confidence scores let code act automatically when certain and
escalate to a human — or a slower reasoning ("System Two") model — when not.

### Open questions

- **Calibration evidence** — whether the probabilities are meaningfully better-calibrated than raw
  LLM logits is not yet publicly demonstrated
  ([Goedecke's critique](wiki/jev-structured-output-goedecke.md)).
- **Intelligence ceiling** — with no test-time compute, this class may cap near non-reasoning-LLM
  intelligence; it is framed by skeptics as an *inference/interface* advance, not a new scaling
  axis.

<!-- gap: RLCD training methodology is unpublished; how calibration is optimized is unknown. -->

## Related Pages

- [Jev](wiki/jev.md)
- [TypeSafe AI](wiki/typesafe-ai.md)
- [Structured Output](wiki/structured-output.md)
- [Introducing System One Models & Jev (TypeSafe AI)](wiki/jev-launch-typesafe.md)
- [Jev means structured output is interesting again](wiki/jev-structured-output-goedecke.md)

## Sources

- TypeSafe docs — System One: <https://docs.typesafe.ai/concepts/system-one>
- TypeSafe docs — Introduction: <https://docs.typesafe.ai/>
- TypeSafe launch post: <https://typesafe.ai/blog/introducing-system-one-models-and-jev>
