# Log

An append-only record of every ingest, query, and lint pass.

---

## [2026-05-07] ingest | The History of Fermentation
- Source: `raw/files/fermentation-history.md` (example placeholder)
- Pages created: `wiki/example-source.md`, `wiki/fermentation.md`
- Pages updated: `index.md`, `_sidebar.md`
- Summary: Ingested an overview article on fermentation history; created a source summary page and a concept page for fermentation.

## [2026-05-07] ingest | Working with Standard Errors
- Source: https://masterysys.atlassian.net/wiki/spaces/EN/pages/4165107965/Working+with+Standard+Errors
- Pages created: `wiki/mastery-standard-errors.md`, `wiki/mastery-error-code-format.md`, `wiki/standard-errors-repo.md`
- Pages updated: `index.md`, `_sidebar.md`
- Summary: Ingested Mastery Confluence doc on the standard error format; created source summary, error code format concept page, and standard errors repo concept page.

## [2026-05-07] ingest | mastery-standard-error-codes (Repo)
- Source: git@github.com:masterysystems/mastery-standard-error-codes.git → `raw/repos/mastery-standard-error-codes`
- Pages created: `wiki/mastery-standard-error-codes-repo.md`, `wiki/error-definition-schema.md`
- Pages updated: `wiki/standard-errors-repo.md` (added cross-links + repo source), `index.md`, `_sidebar.md`
- Summary: Cloned the standard error codes NX monorepo; documented its structure, domain packages, JSON error definition schema, and release process.

## [2026-05-07] ingest | external-api-vendor-invoice (Repo)
- Source: git@github.com:masterysystems/external-api-vendor-invoice.git → `raw/repos/external-api-vendor-invoice`
- Pages created: `wiki/external-api-vendor-invoice-repo.md`
- Pages updated: `index.md`, `_sidebar.md`
- Summary: Cloned the vendor invoice NX monorepo; documented its async and sync ingress flows, package roles, API endpoint, RBAC, Kafka topics, reply shapes, and DDT term maps.

## [2026-05-07] ingest | mastery-ingress-api (Repo)
- Source: git@github.com:masterysystems/mastery-ingress-api.git → `raw/repos/mastery-ingress-api`
- Pages created: `wiki/mastery-ingress-api-repo.md`
- Pages updated: `index.md`, `_sidebar.md`
- Summary: Cloned the central ingress API; documented its ~25 service domains, dual Kafka/DAPR transport, versioning, OAS architecture, validation hooks, plugin registry, and local dev setup.

## [2026-05-07] query | What's the best format for me to write errors?
- Answer filed as: `wiki/how-to-write-errors.md`
- Summary: Synthesized a how-to guide covering simple vs templated error JSON, code numbering strategy, file naming conventions, and common pitfalls.
