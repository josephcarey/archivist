---
title: TypeSafe AI
tags: [org, product, concept]
sources: [jev-launch-typesafe]
created: 2026-09-16
updated: 2026-09-16
---

# TypeSafe AI

## Summary

TypeSafe AI is an AI lab founded by **Diogo Almeida** (previously at OpenAI, where he worked on
the instruction-following methods behind ChatGPT). After roughly two years in stealth, TypeSafe
launched publicly with the [System One Model](wiki/system-one-models.md) class and its first
model, [Jev](wiki/jev.md). The company's thesis is that "AI needs an interface software could
depend on" — typed, structured, calibrated decisions instead of free-form text.

## Key Concepts

- **Founder:** Diogo Almeida (ex-OpenAI).
- **Product:** Jev — a System One model exposed via SDKs and an HTTP API
  (`POST /v1/systemone`, default model `jev-latest`).
- **AI primitives:** Choice, Score, and Noul — modular, composable, typed question types.
- **Training method:** RLCD (Reinforcement Learning for Calibrated Decisions).
- **Positioning:** automation-focused stack (new architecture + parallel sampler + RLCD) aimed at
  "AI-powered workflows," real-time apps, big-data map-reduce, and verification/guardrails.
- **Status:** early access / waitlist; service currently West-Coast-based.

## Details

### Surfaces

- Company site: <https://typesafe.ai/>
- Docs: <https://docs.typesafe.ai/> (concepts, primitives, confidence, SDK, HTTP API)
- Workflow evals: <https://evals.typesafe.ai/>
- Playground/console: <https://console.typesafe.ai/>
- System One adapter (open source, wraps LLMs to output structured decisions):
  <https://github.com/typesafe-ai/system-one-adapter-python>

### Claims and credibility

TypeSafe publishes transparent pricing and a novel workflow-eval methodology, but its benchmarks
are self-run and use competitor frontier models (GPT-6 Astra, Fable 5.1) as reference answers.
Independent commentary ([Goedecke](wiki/jev-structured-output-goedecke.md)) considers the team
credible while questioning how defensible the underlying technique is. See the
[launch source page](wiki/jev-launch-typesafe.md) for the full evaluation.

## Related Pages

- [Jev](wiki/jev.md)
- [System One Models](wiki/system-one-models.md)
- [Structured Output](wiki/structured-output.md)
- [Introducing System One Models & Jev (TypeSafe AI)](wiki/jev-launch-typesafe.md)

## Sources

- TypeSafe AI: <https://typesafe.ai/>
- Launch post: <https://typesafe.ai/blog/introducing-system-one-models-and-jev>
- Docs: <https://docs.typesafe.ai/>
