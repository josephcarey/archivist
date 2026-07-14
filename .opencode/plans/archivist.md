# archivist — Project Plan

## Goal

Implement the Karpathy LLM-wiki pattern in a minimal, non-engineer-friendly setup.
OpenCode is the AI agent. Docsify is the viewer. Node.js is the only runtime dependency.

## Architecture

```
archivist/
├── AGENTS.md               # schema: OpenCode's role + workflows
├── start.sh                # ./start.sh → launches wiki in browser
├── .gitignore
├── docs/                   # docsify root
│   ├── index.html          # docsify config
│   ├── README.md           # home/welcome page
│   ├── _sidebar.md         # auto-maintained nav
│   ├── index.md            # catalog of all wiki pages
│   ├── log.md              # append-only operation log
│   └── wiki/               # LLM-written pages
├── raw/
│   ├── urls.md             # user lists URLs here
│   ├── files/              # drop PDFs, txt, md here
│   └── repos/              # cloned git repos
└── scripts/
    ├── package.json
    ├── extract-pdf.js      # PDF → text
    ├── fetch-url.js        # URL → clean markdown
    └── clone-repo.js       # git clone + summarize
```

## Key decisions

- Node.js only (no Python)
- npm packages: pdf-parse, node-fetch, turndown, simple-git
- docsify for zero-build wiki viewing (with search plugin)
- AGENTS.md is the schema document
- index.md is the search surface (no embeddings)
- Example pages use fermentation as placeholder topic

## Status

- [x] Directories created
- [x] .opencode/plans/archivist.md
- [x] AGENTS.md
- [x] start.sh
- [x] .gitignore
- [x] scripts/package.json
- [x] scripts/extract-pdf.js
- [x] scripts/fetch-url.js
- [x] scripts/clone-repo.js
- [x] raw/urls.md
- [x] raw/files/.gitkeep
- [x] raw/repos/.gitkeep
- [x] docs/index.html
- [x] docs/README.md
- [x] docs/_sidebar.md
- [x] docs/index.md
- [x] docs/log.md
- [x] docs/wiki/example-source.md
- [x] docs/wiki/fermentation.md
