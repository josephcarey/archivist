---
title: mastery-standard-error-codes (Repo)
tags: [mastery, errors, repo, nx, monorepo, node, dotnet, engineering-standard]
sources: [mastery-standard-error-codes-repo]
created: 2026-05-07
updated: 2026-05-07
---

# mastery-standard-error-codes (Repo)

## Summary

`mastery-standard-error-codes` is a private NX monorepo that serves as the source of truth for all Mastery standard error codes. It contains error definitions in JSON, and uses custom NX generators and executors to automatically produce TypeScript (Node) and .NET packages consumed by domain services. New packages are released automatically via GitHub Actions on PR merge.

Source: `raw/repos/mastery-standard-error-codes` (cloned from `git@github.com:masterysystems/mastery-standard-error-codes.git`)

## Key Concepts

- **Monorepo structure**: `errors/` (JSON definitions) → `packages/` (generated TS) + `dotnet/` (generated C#)
- **Error definition format**: JSON objects with `code`, `message` (string or templated object), `docsDescription`, `allowedStatus`
- **Custom NX tooling**: `tools/package-generator` builds Node and .NET packages; `tools/standards-enforcement` validates schema and deduplicates codes before build
- **Auto-release**: PR title must follow conventional commit format (e.g. `feat(ME-12345): ...`); merge triggers GitHub Action to cut new packages
- **Domains covered**: accounting, accounting-voucher, alchemy (planned-network, spot-quote, tendering), asset-execution, asset-resources, booking-domain, core-load, driver-messaging, external-api, load-execution, ltl-microservice, record-management, seer, stop-events, telematics, wave + test
- **Codeowners**: each domain team owns `errors/<their-domain>/` — only the initial codeowners PR needs Core Engineering / External API review
- **Toolchain**: Node 22, yarn classic (1.x), ASDF recommended for version management

## Details

### Repository Layout

```
errors/<domain>/          ← JSON error definitions (source of truth)
packages/<domain>/lib/    ← Generated TypeScript classes (do not edit manually)
dotnet/Mastery.StandardErrorCodes.<Domain>/  ← Generated .NET classes
tools/package-generator/  ← NX plugin: builds Node + .NET packages from JSON
tools/standards-enforcement/ ← NX plugin: schema validation + dedupe enforcement
```

### Error Definition JSON Structure

Each file in `errors/<domain>/` is an **error collection** — a JSON object where keys are PascalCase error names and values are [Error Definitions](wiki/error-definition-schema.md):

```json
{
  "DispatchDriverLookupError": {
    "code": "601-1-52001",
    "message": {
      "content": "Invalid Driver ID and/or Customer Code, cannot create EMR 0 - %s",
      "paramExamples": ["driverId"],
      "paramNames": ["id"]
    },
    "docsDescription": "This error occurs when the specified driver cannot be located.",
    "allowedStatus": ["FAILURE"]
  }
}
```

Simple (non-templated) messages are also valid:

```json
{
  "DispatchDriverDuplicateRepositionError": {
    "code": "601-1-32024",
    "message": "Cannot create a Reposition while another Reposition is active or in transit",
    "docsDescription": "...",
    "allowedStatus": ["FAILURE"]
  }
}
```

### Domain Packages

| Domain | Error folder | Node package | .NET project |
|--------|-------------|-------------|-------------|
| Accounting | `errors/accounting/` | `packages/accounting/` | `Mastery.StandardErrorCodes.Accounting` |
| Booking Domain | `errors/booking-domain/` | `packages/booking-domain/` | `Mastery.StandardErrorCodes.BookingDomain` |
| Core Load | `errors/core-load/` | `packages/core-load/` | `Mastery.StandardErrorCodes.CoreLoad` |
| External API | `errors/external-api/` | `packages/external-api/` | `Mastery.StandardErrorCodes.ExternalApi` |
| Load Execution | `errors/load-execution/` | `packages/load-execution/` | `Mastery.StandardErrorCodes.LoadExecution` |
| Stop Events | `errors/stop-events/` | `packages/stop-events/` | `Mastery.StandardErrorCodes.StopEvents` |
| Wave | `errors/wave/` | `packages/wave/` | `Mastery.StandardErrorCodes.Wave` |
| *(+ 12 more)* | | | |

### Standards Enforcement

Two NX executors run before build:

- **`dedupe-codes`** — verifies all error codes are globally unique across the entire repo; fails the build if duplicates exist
- **`error-schema`** — validates every error JSON definition against the schema; fails the build on invalid definitions

This prevents duplicate codes across domains and enforces the [Error Definition Schema](wiki/error-definition-schema.md).

### Creating a New Domain Package

1. Create `errors/<domain>/` folder
2. Create an error collection JSON file inside it
3. Add error definitions (see schema)
4. Run `yarn generate` to produce Node + .NET packages
5. Run `yarn build` to verify
6. Add your team to `CODEOWNERS` for `errors/<domain>/` — this is the only PR that needs external review
7. Merge via conventional commit PR title → packages auto-release

### Release Process

- PR title format: `feat(ME-12345): description of change`
- On merge: GitHub Action `release-package.yml` automatically versions and publishes changed packages
- Manual release: run the action manually or `yarn nx release`
- Requires `GITHUB_TOKEN` env var with `package:write` scope for local publishing

## Related Pages

- [Standard Errors Repo](wiki/standard-errors-repo.md)
- [Error Definition Schema](wiki/error-definition-schema.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)
- [Working with Standard Errors](wiki/mastery-standard-errors.md)

## Sources

- Cloned repo: `raw/repos/mastery-standard-error-codes`
- [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)
