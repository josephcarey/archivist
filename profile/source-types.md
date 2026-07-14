# Source Types

Recognized source kinds for this instance and how each should be fetched and handled during
ingest. The engine's fetch scripts are generic; this file tells the maintainer how to treat
each kind for the AI-research domain.

---

## Paper (arXiv / preprint / journal)

- **Fetch:** `node scripts/fetch-url.js <url>` (PDF: `node scripts/extract-pdf.js <path>`)
- **Handle:** create a `source` page + a `concept` page for the core technique/model. Capture
  the claim, method, results, and limitations. Tag `paper` + the relevant category tag.
- **Evaluate:** weight Novelty and Credibility heavily; note reproducibility.

## Repo (git repository)

- **Fetch:** `node scripts/clone-repo.js <git-url>` → clones into `raw/repos/`
- **Handle:** document structure, purpose, notable packages, and how it fits the ecosystem.
  Use a repo-specific page; for monorepos, note key packages individually.
- **Evaluate:** weight Maturity and Relevance; note activity/maintenance and license.

## Blog / article

- **Fetch:** `node scripts/fetch-url.js <url>` (clean-extract into predictable md)
- **Handle:** summarize the argument; extract concrete claims and link to primary sources.
  Tag by topic + `source`.
- **Evaluate:** weight Credibility (is it evidence-backed or opinion?) and Relevance.

## Release notes / changelog

- **Fetch:** `node scripts/fetch-url.js <url>`
- **Handle:** capture what changed, why it matters, and what to watch next. Update the
  relevant `model`/`product` concept page rather than creating a new page when one exists.
- **Evaluate:** weight Watch-level; almost always tag `watch` on active products.

---

Notes:
- Whichever kind, always produce/refresh at least one `concept` page so knowledge accretes on
  stable entities rather than scattering across one-off source pages.
- Prefer updating an existing concept page over creating a duplicate.
