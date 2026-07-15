// docsify publisher — the human-facing site surface.
//
// docsify serves docs/ as a static site directly from markdown (no build step
// for the site itself). This publisher has two modes:
//   - validate (default, used by `pipeline publish`): confirm docs/ is
//     deploy-ready and report the target. Non-blocking, safe in CI.
//   - serve: start a local preview server (`node scripts/pipeline.js publish
//     docsify -- serve`, or just use ./start.sh).
//
// Actual deployment to GitHub Pages is performed by .github/workflows/pages.yml,
// which runs the build stage first so derived pages exist, then deploys docs/.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ROOT } = require('../../../scripts/lib/manifest');

const DOCS = path.join(ROOT, 'docs');

function validate() {
  const problems = [];
  for (const required of ['index.html', 'README.md', '_sidebar.md']) {
    if (!fs.existsSync(path.join(DOCS, required))) problems.push(`missing docs/${required}`);
  }
  if (problems.length) {
    console.error('[archivist] docsify site NOT ready:');
    for (const p of problems) console.error(`  - ${p}`);
    throw new Error('docsify site is not deploy-ready');
  }
  console.error('[archivist] docsify site is deploy-ready (docs/).');
  console.error('[archivist] deploy: GitHub Pages via .github/workflows/pages.yml on push to main.');
  console.error('[archivist] preview locally: ./start.sh  (or: docsify serve docs)');
}

function serve() {
  console.error('[archivist] starting docsify preview at http://localhost:3000 (Ctrl+C to stop)…');
  const child = spawn('docsify', ['serve', DOCS], { stdio: 'inherit' });
  child.on('error', (err) => {
    console.error(`[archivist] could not start docsify (${err.message}). Install with: npm i -g docsify-cli`);
    process.exitCode = 1;
  });
}

async function publish(ctx = {}) {
  const mode = (ctx.args && ctx.args[0]) || ctx.mode || 'validate';
  if (mode === 'serve') return serve();
  return validate();
}

module.exports = { name: 'docsify', kind: 'publisher', publish };
