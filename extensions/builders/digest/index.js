// digest builder — compile a compact, machine-readable map of the wiki.
//
// Outputs (the agent-consumption "(c)" door):
//   docs/index.json  — structured list of every page (title, tags, summary, path)
//   docs/llms.txt    — a plain-text digest agents can read directly
//
// Purely mechanical: reads neutral facts, derives no judgment.

const fs = require('fs');
const path = require('path');
const { ROOT } = require('../../../scripts/lib/manifest');
const { loadPages } = require('../../../scripts/lib/wiki');

const DOCS = path.join(ROOT, 'docs');

async function build() {
  const pages = loadPages();
  const written = [];

  const index = {
    generated: new Date().toISOString(),
    count: pages.length,
    pages: pages.map(p => ({
      title: p.title,
      slug: p.slug,
      path: p.file,
      tags: p.tags,
      sources: p.sources,
      updated: p.updated,
      summary: p.summary,
    })),
  };
  const indexPath = path.join(DOCS, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
  written.push(path.relative(ROOT, indexPath));

  const lines = [];
  lines.push('# Archivist digest');
  lines.push('');
  lines.push(`> Machine-readable map of the wiki for local agents. Generated ${index.generated}.`);
  lines.push(`> ${pages.length} page(s). Read a page at docs/<path>.`);
  lines.push('');
  for (const p of pages) {
    lines.push(`## ${p.title}`);
    lines.push(`- path: docs/${p.file}`);
    if (p.tags.length) lines.push(`- tags: ${p.tags.join(', ')}`);
    if (p.summary) lines.push(`- summary: ${p.summary}`);
    lines.push('');
  }
  const llmsPath = path.join(DOCS, 'llms.txt');
  fs.writeFileSync(llmsPath, lines.join('\n'));
  written.push(path.relative(ROOT, llmsPath));

  return { written };
}

module.exports = { name: 'digest', kind: 'builder', build };
