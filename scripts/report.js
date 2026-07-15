#!/usr/bin/env node
// report.js — emit a markdown "sources needing ingest" report for CI comments.
//
// Reuses the change-detection manifest: scans raw/files and raw/repos, compares
// against .archivist/manifest.json, and prints a markdown summary to stdout. The
// last line to stderr is `NEEDS_INGEST=<n>` so a workflow can branch on it.
//
// This is the deterministic half of automated ingestion — it flags WHAT changed.
// Authoring the wiki pages from those sources is the agent's job (see AGENTS.md).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, sha256, loadManifest, classify } = require('./lib/manifest');

const RAW_FILES = path.join(ROOT, 'raw', 'files');
const RAW_REPOS = path.join(ROOT, 'raw', 'repos');
const URLS_FILE = path.join(ROOT, 'raw', 'urls.md');

function hashFile(p) { return sha256(fs.readFileSync(p)); }
function repoHead(dir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { return null; }
}
function listReal(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(e => !e.name.startsWith('.'));
}

// Extract candidate URLs from raw/urls.md (bare lines or markdown links).
function listQueuedUrls() {
  if (!fs.existsSync(URLS_FILE)) return [];
  const urls = new Set();
  for (const raw of fs.readFileSync(URLS_FILE, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('<!--')) continue;
    const md = line.match(/\]\((https?:\/\/[^\s)]+)\)/);
    const bare = line.match(/^(https?:\/\/\S+)$/);
    if (md) urls.add(md[1]);
    else if (bare) urls.add(bare[1]);
  }
  return [...urls];
}

function main() {
  const manifest = loadManifest();
  const rows = [];

  for (const e of listReal(RAW_FILES)) {
    if (e.isDirectory()) continue;
    const id = `file:raw/files/${e.name}`;
    rows.push({ id, type: 'file', status: classify(manifest, id, hashFile(path.join(RAW_FILES, e.name))) });
  }
  for (const e of listReal(RAW_REPOS)) {
    if (!e.isDirectory()) continue;
    const head = repoHead(path.join(RAW_REPOS, e.name));
    const id = `repo:${e.name}`;
    rows.push({ id, type: 'repo', status: head ? classify(manifest, id, head) : 'unknown' });
  }

  // Queued URLs: flag any not yet recorded in the manifest as "new".
  for (const url of listQueuedUrls()) {
    const id = `url:${url}`;
    if (!manifest.sources[id]) rows.push({ id, type: 'url', status: 'new' });
  }

  const needs = rows.filter(r => r.status === 'new' || r.status === 'changed');

  const md = [];
  md.push('## 📥 Archivist ingest check');
  md.push('');
  if (needs.length === 0) {
    md.push('No new or changed sources detected in `raw/`. Nothing to ingest. ✅');
  } else {
    md.push(`${needs.length} source(s) are **new or changed** and ready to be folded into the wiki:`);
    md.push('');
    md.push('| Status | Type | Source |');
    md.push('|--------|------|--------|');
    for (const r of needs.sort((a, b) => a.status.localeCompare(b.status))) {
      md.push(`| \`${r.status}\` | ${r.type} | \`${r.id}\` |`);
    }
    md.push('');
    md.push('Run `/ingest` on each (or the automated ingest agent, once configured) to update the wiki, then rebuild derived pages with `node scripts/pipeline.js build`.');
  }
  md.push('');
  md.push('<sub>Deterministic report from `scripts/report.js` — it flags what changed; page authoring is done by the ingest agent.</sub>');

  process.stdout.write(md.join('\n') + '\n');
  console.error(`NEEDS_INGEST=${needs.length}`);
}

main();
