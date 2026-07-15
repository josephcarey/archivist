// research-directions builder — surface gaps in what we know.
//
// The second output of interpretation: "what we're missing that would be
// valuable." Deterministic signals it aggregates:
//   - Explicit gap hints authors leave (`<!-- gap: ... -->` or a `## Gaps` section).
//   - Thin-coverage tags (a domain tag that appears on only one page).
//   - Under-adopted areas (tags with no `adopt`/`trial` signal in the watchlist).
//
// Archivist only SUGGESTS these. The human curates what actually enters raw/.
// Output: docs/wiki/research-directions.md

const fs = require('fs');
const path = require('path');
const { ROOT } = require('../../../scripts/lib/manifest');
const { loadPages } = require('../../../scripts/lib/wiki');
const { loadLens, judge } = require('../../../scripts/lib/lens');

const DOCS = path.join(ROOT, 'docs');

// Structural / page-type tags we don't treat as coverage areas.
const NON_TOPIC_TAGS = new Set(['source', 'concept', 'analysis', 'watchlist']);

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function build() {
  const lens = loadLens();
  const pages = loadPages().filter(p => !p.generated);
  const written = [];

  // 1. Explicit gap hints across all pages.
  const explicit = [];
  for (const p of pages) {
    for (const h of p.gapHints) explicit.push({ hint: h, from: p });
  }

  // 2. Tag coverage.
  const tagPages = {};
  for (const p of pages) {
    for (const t of p.tags) {
      if (NON_TOPIC_TAGS.has(t.toLowerCase())) continue;
      (tagPages[t] ||= []).push(p);
    }
  }
  const thin = Object.entries(tagPages)
    .filter(([, ps]) => ps.length === 1)
    .map(([tag, ps]) => ({ tag, page: ps[0] }))
    .sort((a, b) => a.tag.localeCompare(b.tag));

  // 3. Areas with no actionable signal (no adopt/trial page carries the tag).
  const actionableTags = new Set();
  for (const p of pages) {
    const v = judge(p.scores, lens, { tags: p.tags });
    if (v.signal === 'adopt' || v.signal === 'trial') {
      for (const t of p.tags) if (!NON_TOPIC_TAGS.has(t.toLowerCase())) actionableTags.add(t);
    }
  }
  const noActionable = Object.keys(tagPages)
    .filter(t => tagPages[t].length >= 2 && !actionableTags.has(t))
    .sort();

  const md = [];
  md.push('---');
  md.push('title: Research Directions');
  md.push('tags: [analysis]');
  md.push(`created: ${today()}`);
  md.push(`updated: ${today()}`);
  md.push('generated: true');
  md.push('---');
  md.push('');
  md.push('# Research Directions');
  md.push('');
  md.push('## Summary');
  md.push('');
  md.push(`Derived gaps — "what we're missing that would be valuable" — surfaced through the **${lens.stance}** lens. Archivist only *suggests* these; **you curate** which become real sources in \`raw/\`. This page is generated; re-run \`node scripts/pipeline.js build\` to refresh.`);
  md.push('');

  md.push('## Explicit gap hints');
  md.push('');
  if (explicit.length) {
    md.push('Left by authors during ingest (`<!-- gap: ... -->` or a `## Gaps` section):');
    md.push('');
    for (const e of explicit) md.push(`- ${e.hint} — from [${e.from.title}](${e.from.file})`);
  } else {
    md.push('_None yet. Note undocumented cited techniques during ingest to seed this list._');
  }
  md.push('');

  md.push('## Thinly covered areas');
  md.push('');
  if (thin.length) {
    md.push('Tags that appear on only one page — likely under-explored:');
    md.push('');
    for (const t of thin) md.push(`- \`${t.tag}\` — only [${t.page.title}](${t.page.file})`);
  } else {
    md.push('_No single-page tags._');
  }
  md.push('');

  md.push('## Areas with no actionable signal');
  md.push('');
  if (noActionable.length) {
    md.push('Covered areas where nothing yet rates `adopt`/`trial` under this lens — worth finding something usable:');
    md.push('');
    for (const t of noActionable) md.push(`- \`${t}\` (${tagPages[t].length} pages, none actionable)`);
  } else {
    md.push('_Every multi-page area has at least one actionable item, or there is not enough data yet._');
  }
  md.push('');

  md.push('## Sources');
  md.push('');
  md.push('- Derived from `docs/wiki/` + `profile/lens.md` via the `research-directions` builder.');
  md.push('');

  const pagePath = path.join(DOCS, 'wiki', 'research-directions.md');
  fs.writeFileSync(pagePath, md.join('\n'));
  written.push(path.relative(ROOT, pagePath));

  return { written };
}

module.exports = { name: 'research-directions', kind: 'builder', build };
