// manifest.js — shared change-detection helpers for archivist ingest scripts.
//
// The manifest records a content hash per ingested source so the engine can tell
// whether a source is new, changed, or unchanged since it was last ingested.
// It lives at .archivist/manifest.json (tracked in git so the shared repo knows
// what has been ingested).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const ARCHIVIST_DIR = path.join(ROOT, '.archivist');
const MANIFEST_PATH = path.join(ARCHIVIST_DIR, 'manifest.json');
const CACHE_DIR = path.join(ARCHIVIST_DIR, 'cache');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function ensureDirs() {
  if (!fs.existsSync(ARCHIVIST_DIR)) fs.mkdirSync(ARCHIVIST_DIR, { recursive: true });
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, sources: {} };
  }
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.sources) parsed.sources = {};
    return parsed;
  } catch (err) {
    console.error(`Warning: could not parse manifest (${err.message}); starting fresh.`);
    return { version: 1, sources: {} };
  }
}

function saveManifest(manifest) {
  ensureDirs();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

// Classify a source's current hash against what the manifest last recorded.
// Returns 'new' | 'changed' | 'unchanged'.
function classify(manifest, id, hash) {
  const entry = manifest.sources[id];
  if (!entry) return 'new';
  return entry.hash === hash ? 'unchanged' : 'changed';
}

// Record (or update) a source in the manifest. Preserves the original
// ingestedAt; always refreshes hash + lastSeenAt.
function record(manifest, id, { type, hash, title, extra } = {}) {
  const now = new Date().toISOString();
  const existing = manifest.sources[id] || {};
  manifest.sources[id] = {
    type: type || existing.type || 'unknown',
    hash,
    title: title || existing.title,
    ingestedAt: existing.ingestedAt || now,
    lastSeenAt: now,
    ...(extra || {}),
  };
  return manifest.sources[id];
}

// Convenience: classify, print a status line, record, and save in one call.
// Returns the classification.
function checkAndRecord(id, hash, meta = {}) {
  const manifest = loadManifest();
  const status = classify(manifest, id, hash);
  record(manifest, id, { hash, ...meta });
  saveManifest(manifest);
  return status;
}

module.exports = {
  ROOT,
  ARCHIVIST_DIR,
  MANIFEST_PATH,
  CACHE_DIR,
  sha256,
  ensureDirs,
  loadManifest,
  saveManifest,
  classify,
  record,
  checkAndRecord,
};
