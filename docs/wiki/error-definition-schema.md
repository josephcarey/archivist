---
title: Error Definition Schema
tags: [mastery, errors, schema, json, engineering-standard]
sources: [mastery-standard-error-codes-repo]
created: 2026-05-07
updated: 2026-05-07
---

# Error Definition Schema

## Summary

Each error in the [mastery-standard-error-codes repo](wiki/mastery-standard-error-codes-repo.md) is defined as a JSON object conforming to the `ErrorDefinition` interface. Errors are grouped into named **error collections** (one JSON file per collection), and collections are grouped into **package definitions** (one folder per domain). The NX `standards-enforcement` plugin validates all definitions against this schema before any packages are built.

## Key Concepts

- Error name (key): PascalCase string, unique within the collection (e.g. `DispatchDriverLookupError`)
- `code`: required — standard error code string matching `DDD-T-EEEEE` format
- `message`: required — either a plain string or a templated object with `content`, `paramNames`, `paramExamples`
- `docsDescription`: optional but recommended — internal description of when/why the error occurs
- `allowedStatus`: optional, deprecated — was used to indicate failure mode (`FAILURE`, `PARTIAL_SUCCESS`, `TRANSIENT_FAILURE`)
- Codes must be **globally unique** across the entire repo — enforced at build time

## Details

### TypeScript Interface

```typescript
interface ErrorDefinition {
  code: string                        // e.g. "601-1-52001"
  message:
    | string                          // simple message
    | {
        content: string               // message with %s placeholders
        paramExamples: unknown[]      // example values for each param
        paramNames: string[]          // names of the parameters
      }
  docsDescription?: string            // human description for documentation
  allowedStatus?: ErrorStatusType[]   // deprecated
}
```

### Simple Message Example

```json
{
  "DispatchDriverDuplicateRepositionError": {
    "code": "601-1-32024",
    "message": "Cannot create a Reposition while another Reposition is active or in transit",
    "docsDescription": "Occurs when dispatching a driver already engaged in a reposition activity.",
    "allowedStatus": ["FAILURE"]
  }
}
```

### Templated Message Example

Use `%s` as positional placeholders in `content`. Provide matching `paramNames` and `paramExamples`:

```json
{
  "DispatchFacilityLookupError": {
    "code": "601-1-52002",
    "message": {
      "content": "Facility not found - %s",
      "paramExamples": ["facilityId"],
      "paramNames": ["id"]
    },
    "docsDescription": "Triggered when the system fails to locate the specified facility.",
    "allowedStatus": ["FAILURE"]
  }
}
```

### Hierarchy

```
Package Definition  (= one domain folder in errors/)
  └── Error Collection  (= one .json file)
        └── Error Definition  (= one key/value pair in the JSON)
```

### Enforcement

Two NX executors run automatically before packages are built:

- **`error-schema`** executor — validates every definition against the schema; build fails on violations
- **`dedupe-codes`** executor — checks that every `code` value is unique globally across all domains; build fails on duplicates

This means a team cannot accidentally reuse a code already claimed by another domain.

### `allowedStatus` (Deprecated)

The `allowedStatus` field accepted values from the `ErrorStatusType` enum (`FAILURE`, `PARTIAL_SUCCESS`, `TRANSIENT_FAILURE`). It is marked deprecated due to lack of use but still appears in existing error definitions.

## Related Pages

- [mastery-standard-error-codes (Repo)](wiki/mastery-standard-error-codes-repo.md)
- [Standard Errors Repo](wiki/standard-errors-repo.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)

## Sources

- Cloned repo: `raw/repos/mastery-standard-error-codes`
- `tools/package-generator/src/types.ts`
- `errors/core-load/1-dispatch.json` (example)
- `errors/external-api/1-load.json` (example)
