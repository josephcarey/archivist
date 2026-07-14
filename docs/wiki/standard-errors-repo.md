---
title: Standard Errors Repo
tags: [mastery, errors, engineering-standard, external-api, github]
sources: [mastery-confluence-standard-errors, mastery-standard-error-codes-repo]
created: 2026-05-07
updated: 2026-05-07
---

# Standard Errors Repo

## Summary

The `mastery-standard-error-codes` GitHub repo is the preferred way for Mastery domain teams to register and manage their client-visible error codes. It gives teams full ownership over their own codes, removes the need for External API review on individual errors, and provides auto-generated npm (Node) and NuGet (.NET) packages for use in services. It serves as the source of truth for errors that clients may receive.

Repo: [mastery-standard-error-codes](https://github.com/masterysystems/mastery-standard-error-codes)

## Key Concepts

- Preferred over the manual approval process — faster, no External API review required per error
- Organized by domain identifier (each domain owns its own package/folder)
- Provides packages for Node and .NET
- New packages are cut automatically when PRs are merged
- The only PR requiring Core Engineering / External API review is the initial codeowners setup
- Supports message templating (variables embedded in error messages)
- Teams must request repo access from Core Engineering if they don't have it

## Details

### Setup Steps

1. Request access to the repo from Core Engineering (if needed)
2. Follow the README to set up locally and create your domain package
3. Your domain package should cover either:
   - All errors with a given domain identifier, or
   - All errors your domain manages
4. Add your domain as codeowners for your package — **this is the only PR that needs Core Engineering / External API review**
5. Add errors, reviewed internally per your domain's practices
6. Merged PRs automatically cut new packages
7. Consume via the Node or .NET packages in your services

### Recommended Rollout Pattern

For teams just getting started, a pragmatic sequence:

1. Discuss and define useful errors within Engineering, BA, and Product
2. Meanwhile: create domain folder and add one **generic fallback error** that all your services can throw
3. Update services to return the generic error (good for getting familiar with the format)
4. Once precise errors are defined, add them to the domain folder
5. Implement precise errors in services

This lets teams ship standard-error-shaped responses immediately, then refine the codes over time.

### Message Templating

The repo supports templating variables into error messages (e.g. `Unable to find load with ID {loadId}`). Messages are not considered immutable — clients should rely on `code`, not `message` text.

### vs. Manual Approval Process

| | Standard Errors Repo | Manual Approval |
|---|---|---|
| External API review per error | No | Yes |
| Speed | Fast | SLA: 3 business days per round |
| Ownership | Domain team | External API adds to api-developer-portal |
| Packages generated | Yes (auto) | No |
| Recommended | Yes | Only if repo isn't an option |

## Related Pages

- [mastery-standard-error-codes (Repo)](wiki/mastery-standard-error-codes-repo.md)
- [Error Definition Schema](wiki/error-definition-schema.md)
- [Working with Standard Errors](wiki/mastery-standard-errors.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)

## Sources

- [Confluence — Working with Standard Errors](https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors)
- Cloned repo: `raw/repos/mastery-standard-error-codes`
