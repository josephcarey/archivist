---
title: Working with Standard Errors
tags: [mastery, errors, external-api, graphql, kafka, engineering-standard]
sources: [mastery-confluence-standard-errors]
created: 2026-05-07
updated: 2026-05-07
---

# Working with Standard Errors

## Summary

This Mastery Confluence doc defines the standard error format used across MasterMind's distributed services. It exists because distributed development had produced inconsistent error shapes across GraphQL calls and Kafka topics, making errors unpredictable for both internal teams and external clients. It builds on the Core Engineering error modeling spec and details what External API expects to receive from domain teams.

Source: [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)

## Key Concepts

- Error codes follow the format `domain-type-code` (e.g. `999-1-23456`) — see [Error Code Format](wiki/mastery-error-code-format.md)
- Two type indicators: `0` (unknown/system error) and `1` (known/validation error)
- Errors must include `code`, `message`, and `timestamp` fields
- GraphQL errors: primary format uses `extensions.code/message/timestamp`; alternative format wraps in `extensions.masteryStandardError`
- Timestamps: accept Unix epoch (ms) or unzoned ISO-8601 UTC (e.g. `2007-12-03T10:15:30.000Z`)
- Messages are **not** immutable — clients must not rely on message text, only on codes
- Two registration paths: the [Standard Errors Repo](wiki/standard-errors-repo.md) (preferred) or Manual Approval via `#external-api-innersourcing`
- External API wraps unknown downstream errors in a generic standard error before passing to clients

## Details

### Why This Standard Exists

Before this standard, there was no consistent error shape across GraphQL responses or Kafka topics. This made:
- Internal teams unable to predict error formats from other services
- External API unable to pass consistent errors to clients
- Client-facing error documentation impossible to maintain

### Error Fields

| Field | Description |
|-------|-------------|
| `code` | `domain-type-errorcode` string, e.g. `999-1-23456` |
| `message` | Human-readable description; may contain variables (IDs, input values); **can change** |
| `timestamp` | When the error occurred; Unix epoch ms OR ISO-8601 UTC |

### GraphQL — Primary Format

Errors go in `errors[]` at the root of the GQL response. Each error object must have an `extensions` property containing `code`, `message`, and `timestamp`:

```json
{
  "data": {},
  "errors": [
    {
      "extensions": {
        "code": "999-1-23456",
        "message": "Unable to brew coffee; target resource is a tea pot.",
        "timestamp": "2007-12-03T10:15:30.000Z"
      }
    }
  ]
}
```

`message` may also appear on the error object directly (format 1b); External API checks `extensions.message` first.

A `subgraphOrigin` (soon to be renamed `service`) property within `extensions` is also required by the Core Engineering spec for full compliance.

### GraphQL — Alternative Format

Only for domains with downstream consumers already depending on existing non-standard codes. Wraps the standard error inside `extensions.masteryStandardError`:

```json
{
  "errors": [
    {
      "extensions": {
        "code": "UNABLE_TO_BREW_COFFEE",
        "masteryStandardError": {
          "code": "999-1-23456",
          "message": "Unable to brew coffee; target resource is a tea pot.",
          "timestamp": "2007-12-03T10:15:30.000Z"
        }
      }
    }
  ]
}
```

This format is **temporary** — teams should migrate to Primary Format as legacy dependencies are removed.

### Registering Errors

All client-visible errors must be registered with External API. Two paths:

1. **Standard Errors Repo** (preferred) — see [Standard Errors Repo](wiki/standard-errors-repo.md)
2. **Manual Approval** — post to `#external-api-innersourcing` with code, message, internal description. SLA: response same business day, review within 3 business days.

### Migration from Legacy Codes

Legacy format used a shared five-digit code space — now obsolete. Common migration path: carry the same five-digit code as the error code portion of the new standard format:

```
Legacy:         55555
Standard:   123-1-55555
```

Legacy codes cannot be removed until clients have migrated and both client teams and External API sign off.

### System Errors

Not all errors are suitable for clients. For unknown/system errors, External API wraps them in a generic type-`0` standard error before forwarding, using a message that identifies which call failed without exposing internals.

## Related Pages

- [Error Code Format](wiki/mastery-error-code-format.md)
- [Standard Errors Repo](wiki/standard-errors-repo.md)

## Sources

- [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)
