#!/usr/bin/env node
// status.js — report ingest status of local sources vs the manifest.
// Usage: node scripts/status.js
//
// Scans raw/files/ and raw/repos/ and compares each source's current hash
// against .archivist/manifest.json, reporting new / changed / unchanged.
// URLs are not fetched here; their last-known state is read from the manifest.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, sha256, loadManifest, classify } = require('./lib/manifest');

const RAW_FILES = path.join(ROOT, 'raw', 'files');
const RAW_REPOS = path.join(ROOT, 'raw', 'repos');

function hashFile(p) {
  return sha256(fs.readFileSync(p));
}

function repoHead(dir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return null;
  }
}

function listReal(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.'));
}

function main() {
  const manifest = loadManifest();
  const rows = [];

  // Local files
  for (const e of listReal(RAW_FILES)) {
    if (e.isDirectory()) continue;
    const id = `file:raw/files/${e.name}`;
    const status = classify(manifest, id, hashFile(path.join(RAW_FILES, e.name)));
    rows.push({ id, type: 'file', status });
  }

  // Repos (compare current HEAD sha)
  for (const e of listReal(RAW_REPOS)) {
    if (!e.isDirectory()) continue;
    const head = repoHead(path.join(RAW_REPOS, e.name));
    const id = `repo:${e.name}`;
    const status = head ? classify(manifest, id, head) : 'unknown';
    rows.push({ id, type: 'repo', status });
  }

  // URLs recorded in the manifest (last-known only)
  for (const [id, entry] of Object.entries(manifest.sources)) {
    if (entry.type === 'url') {
      rows.push({ id, type: 'url', status: 'recorded' });
    }
  }

  if (rows.length === 0) {
    console.log('No sources found in raw/ and no entries in the manifest.');
    return;
  }

  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad('STATUS', 12) + pad('TYPE', 8) + 'SOURCE');
  console.log('-'.repeat(60));
  const order = { new: 0, changed: 1, recorded: 2, unchanged: 3, unknown: 4 };
  rows.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  for (const r of rows) {
    console.log(pad(r.status, 12) + pad(r.type, 8) + r.id);
  }

  const changed = rows.filter(r => r.status === 'new' || r.status === 'changed');
  console.log('\n' + `${changed.length} source(s) need ingest (new or changed).`);
}

main();
