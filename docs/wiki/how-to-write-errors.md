---
title: How to Write Error Definitions
tags: [mastery, errors, how-to, json, engineering-standard]
sources: [mastery-standard-error-codes-repo, mastery-confluence-standard-errors]
created: 2026-05-07
updated: 2026-05-07
---

# How to Write Error Definitions

## Summary

Error definitions live as JSON files in `errors/<your-domain>/` in the [mastery-standard-error-codes repo](wiki/mastery-standard-error-codes-repo.md). Each file is an error collection — a flat JSON object where keys are PascalCase error names and values are error definitions. The build system enforces schema correctness and global code uniqueness automatically.

## Key Concepts

- One JSON file = one error collection (group by feature area, e.g. `1-dispatch.json`)
- Error names are PascalCase and should be descriptive (e.g. `DispatchFacilityNotFoundError`)
- Two message formats: plain string, or templated object with `%s` placeholders
- Type `0` = unknown/system error; type `1` = known/validation error
- Codes must be globally unique — the build will fail if you duplicate one
- `docsDescription` is what surfaces in client-facing API docs — always fill it in
- `allowedStatus: ["FAILURE"]` is deprecated but include it to match existing conventions

## Details

### Simple Error (no variables)

Use a plain string for `message` when the error text is always the same:

```json
{
  "DispatchDuplicateRepositionError": {
    "code": "601-1-32024",
    "message": "Cannot create a Reposition while another Reposition is active.",
    "docsDescription": "Fired when a driver already has an active reposition.",
    "allowedStatus": ["FAILURE"]
  }
}
```

### Error With Variables

Use the templated object format when the message includes dynamic values (IDs, input values, etc.). Use `%s` as positional placeholders in `content`:

```json
{
  "DispatchFacilityNotFoundError": {
    "code": "601-1-52002",
    "message": {
      "content": "Facility not found - %s",
      "paramNames": ["id"],
      "paramExamples": ["facilityId"]
    },
    "docsDescription": "Triggered when the specified facility cannot be located.",
    "allowedStatus": ["FAILURE"]
  }
}
```

`paramNames` are the variable names used in code; `paramExamples` are example values shown in documentation.

### Choosing a Code

Code format: `domain-type-errorcode`

1. **Domain identifier** — three digits, self-assigned. Register yours in the Domain Codes Registration doc before you start. Don't pre-reserve large ranges.
2. **Type indicator** — `0` for unknown/system errors (outermost catch blocks), `1` for known/validation errors (the vast majority).
3. **Error code** — typically five digits. Pick a numbering strategy for your domain and stick to it. Some teams use the first digit to indicate a sub-area:

| Range | Category (example from core-load) |
|-------|-----------------------------------|
| `00000` | Generic / fallback |
| `10000` | Record not found |
| `20000` | Data integrity |
| `30000` | Validation |
| `40000` | Application error |
| `50000` | Lookup error |
| `60000` | Dependency error |

This is a convention, not a requirement — adopt it if your domain will have many errors.

### File Naming

Name your JSON files to reflect their type indicator and feature area:

```
errors/my-domain/
  0-my-domain.json       ← unknown/system errors (type 0)
  1-dispatch.json        ← known dispatch errors (type 1)
  1-load-stops.json      ← known load stop errors (type 1)
```

### Full Example Collection

```json
{
  "DispatchDriverNotFoundError": {
    "code": "601-1-52001",
    "message": {
      "content": "Driver not found - %s",
      "paramNames": ["id"],
      "paramExamples": ["driverId"]
    },
    "docsDescription": "The specified driver ID could not be located.",
    "allowedStatus": ["FAILURE"]
  },
  "DispatchDuplicateRepositionError": {
    "code": "601-1-32024",
    "message": "Cannot create a Reposition while another Reposition is active.",
    "docsDescription": "Fired when a driver already has an active reposition.",
    "allowedStatus": ["FAILURE"]
  },
  "DispatchUnknownError": {
    "code": "601-0-00000",
    "message": "An unexpected error occurred during dispatch.",
    "docsDescription": "Generic fallback for unexpected dispatch failures.",
    "allowedStatus": ["FAILURE"]
  }
}
```

### Things to Remember

- **Clients rely on `code`, not `message`** — messages can and do change; codes are stable
- **`docsDescription` is client-facing** — write it clearly, as if explaining to an integration engineer
- **Don't reuse codes** — the `dedupe-codes` executor will fail your build if you do
- **Don't edit generated files** — `packages/<domain>/lib/errors/` is auto-generated; edit only `errors/<domain>/`
- After adding errors, run `yarn generate` then `yarn build` to verify before opening a PR

## Related Pages

- [Error Definition Schema](wiki/error-definition-schema.md)
- [mastery-standard-error-codes (Repo)](wiki/mastery-standard-error-codes-repo.md)
- [Standard Errors Repo](wiki/standard-errors-repo.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)
- [Working with Standard Errors](wiki/mastery-standard-errors.md)

## Sources

- Cloned repo: `raw/repos/mastery-standard-error-codes`
- [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)
