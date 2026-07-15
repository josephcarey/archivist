// wiki.js — parse archivist wiki pages into structured facts.
//
// Neutral facts only: frontmatter, summary, tags, the Evaluation dimension
// scores, and any explicit research-gap hints. No judgment happens here.

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./manifest');

const WIKI_DIR = path.join(ROOT, 'docs', 'wiki');

// Canonical dimension keys used by the lens weighting.
const DIMENSION_ALIASES = {
  novelty: 'novelty',
  credibility: 'credibility',
  relevance: 'relevance',
  maturity: 'maturity',
  'cost/efficiency': 'cost',
  'cost/efficency': 'cost',
  cost: 'cost',
  'cost efficiency': 'cost',
  'watch-level': 'watchLevel',
};

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      data[key] = val;
    }
  }
  return { data, body: text.slice(m[0].length) };
}

function sectionText(body, heading) {
  const lines = body.split('\n');
  const target = heading.toLowerCase();
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.*?)\s*$/);
    if (m && m[1].toLowerCase() === target) { start = i + 1; break; }
  }
  if (start === -1) return null;
  const out = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

function firstParagraph(text) {
  if (!text) return '';
  for (const block of text.split(/\n\s*\n/)) {
    const t = block.trim();
    if (t) return t.replace(/\s+/g, ' ');
  }
  return '';
}

// Parse an "## Evaluation" markdown table into { dimension: score } neutral facts.
function parseEvaluation(body) {
  const section = sectionText(body, 'Evaluation');
  if (!section) return null;
  const scores = {};
  for (const line of section.split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const dim = cells[0].toLowerCase().replace(/\*/g, '').trim();
    const key = DIMENSION_ALIASES[dim];
    if (!key) continue;
    const scoreMatch = cells[1].match(/([0-5](?:\.\d+)?)/);
    if (scoreMatch) scores[key] = parseFloat(scoreMatch[1]);
  }
  return Object.keys(scores).length ? scores : null;
}

// Collect research-gap hints: `<!-- gap: ... -->` comments or a `## Gaps` section.
function parseGapHints(body) {
  const hints = [];
  const re = /<!--\s*gap:\s*(.+?)\s*-->/gi;
  let m;
  while ((m = re.exec(body))) hints.push(m[1].trim());
  const gaps = sectionText(body, 'Gaps');
  if (gaps) {
    for (const line of gaps.split('\n')) {
      const b = line.match(/^[-*]\s+(.*)$/);
      if (b) hints.push(b[1].trim());
    }
  }
  return hints;
}

function slugFromFile(file) {
  return path.basename(file, '.md');
}

// Load every wiki page as a structured, neutral fact record.
function loadPages() {
  if (!fs.existsSync(WIKI_DIR)) return [];
  const pages = [];
  for (const file of fs.readdirSync(WIKI_DIR)) {
    if (!file.endsWith('.md')) continue;
    const full = path.join(WIKI_DIR, file);
    const text = fs.readFileSync(full, 'utf-8');
    const { data, body } = parseFrontmatter(text);
    pages.push({
      slug: slugFromFile(file),
      file: `wiki/${file}`,
      title: data.title || slugFromFile(file),
      tags: data.tags || [],
      sources: data.sources || [],
      created: data.created || null,
      updated: data.updated || null,
      generated: data.generated === 'true' || data.generated === true,
      summary: firstParagraph(sectionText(body, 'Summary')),
      scores: parseEvaluation(body),
      gapHints: parseGapHints(body),
    });
  }
  pages.sort((a, b) => a.slug.localeCompare(b.slug));
  return pages;
}

module.exports = { WIKI_DIR, loadPages, parseFrontmatter, sectionText, firstParagraph, parseEvaluation, parseGapHints };
