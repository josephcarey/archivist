---
title: Mastery Error Code Format
tags: [mastery, errors, error-codes, engineering-standard, external-api]
sources: [mastery-confluence-standard-errors]
created: 2026-05-07
updated: 2026-05-07
---

# Mastery Error Code Format

## Summary

The Mastery standard error code is a three-part string of the form `domain-type-errorcode` (e.g. `999-1-23456`). It uniquely identifies any error that may be returned by a MasterMind service, making errors predictable and parseable for both internal systems and external clients. The format is defined in the Core Engineering error modeling spec and enforced by External API.

## Key Concepts

- Format: `DDD-T-EEEEE` — domain identifier, type indicator, error code
- Validated by regex: `([0-9]{3})-([0-9]{1})-([0-9]{3,7})`
- Domain identifiers are self-assigned; registered in the Domain Codes Registration doc
- Only two type indicators currently: `0` (unknown/system) and `1` (known/validation)
- Error code is 3–7 digits, typically exactly 5
- Messages are **not** immutable — code is the stable identifier, not the message text

## Details

### Structure

```
  999  -  1  -  23456
  ───     ─     ─────
   │      │       └── Error code: 3–7 digits, identifies the specific error
   │      └────────── Type indicator: 0 = unknown, 1 = known
   └───────────────── Domain identifier: 3 digits, self-assigned per domain
```

### Type Indicators

| Type | Meaning | When to use |
|------|---------|-------------|
| `0` | Unknown / system error | Outermost catch blocks; something unexpected went wrong |
| `1` | Known / validation error | Data validation, business logic failures, entity not found |

More types are planned (e.g. retriable errors, partial successes) but not yet defined.

### Domain Identifiers

Three-digit codes, self-assigned by each domain team. Registered in the [Domain Codes Registration & Class Definition](https://masterysys.atlassian.net/wiki/spaces/EN) doc. Teams should reserve only what they have immediate plans for — do not pre-reserve large ranges.

### Error Code (third segment)

3–7 digits, typically 5. Strategy for assignment is per-domain:
- Some domains use the first digit to indicate a sub-domain
- Others simply increment from `00001`

If using the [Standard Errors Repo](wiki/standard-errors-repo.md), the code is fully owned and defined by the domain. If using the manual process, it is subject to External API review.

### Messages

The `message` field provides a human-readable description, potentially including embedded variables (entity IDs, invalid input values). Messages **can and do change** — clients and internal systems must not rely on message text for logic. Only the `code` is stable.

### Timestamp

Errors must include a timestamp indicating when the error occurred. Two accepted formats:
- Unix epoch in milliseconds (e.g. `1701598530000`)
- Unzoned ISO-8601 UTC (e.g. `2007-12-03T10:15:30.000Z`) — preferred across most of Mastery

External API converts timestamps to Unix epoch ms before passing to clients.

## Related Pages

- [Working with Standard Errors](wiki/mastery-standard-errors.md)
- [Standard Errors Repo](wiki/standard-errors-repo.md)

## Sources

- [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)
