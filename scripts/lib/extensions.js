// extensions.js — discovery + loading for archivist extensions.
//
// Extensions are the pluggable capabilities of the pipeline. Each lives in a
// folder under extensions/<group>/<name>/ with:
//   - extension.json  — manifest: { name, kind, entry, description, enabled, schedule? }
//   - <entry>         — a CommonJS module implementing the kind's interface
//
// Kinds and their interface:
//   - source     → { match(input): boolean, run(input): Promise<{id,title,markdown,status,...}> }
//   - builder    → { build(ctx): Promise<{ written: string[] }> }
//   - publisher  → { publish(ctx): Promise<void> }
//
// Discovery is by scanning the extensions/ tree, so adding an extension never
// requires touching the engine. A manifest may set "enabled": false to opt out.

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./manifest');

const EXTENSIONS_DIR = path.join(ROOT, 'extensions');
const VALID_KINDS = ['source', 'builder', 'publisher'];

// Scan the extensions tree and return every manifest found, with its folder.
function discover() {
  const found = [];
  if (!fs.existsSync(EXTENSIONS_DIR)) return found;

  for (const group of fs.readdirSync(EXTENSIONS_DIR, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupDir = path.join(EXTENSIONS_DIR, group.name);
    for (const ext of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!ext.isDirectory()) continue;
      const dir = path.join(groupDir, ext.name);
      const manifestPath = path.join(dir, 'extension.json');
      if (!fs.existsSync(manifestPath)) continue;
      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch (err) {
        console.error(`[archivist] skipping ${path.relative(ROOT, manifestPath)}: ${err.message}`);
        continue;
      }
      if (!VALID_KINDS.includes(manifest.kind)) {
        console.error(`[archivist] skipping ${manifest.name || dir}: invalid kind "${manifest.kind}"`);
        continue;
      }
      found.push({ manifest, dir, group: group.name });
    }
  }
  return found;
}

// Load enabled extensions of a given kind, requiring their entry module.
// Returns [ { name, kind, manifest, dir, module } ] sorted by manifest.order then name.
function load({ kind } = {}) {
  const out = [];
  for (const { manifest, dir, group } of discover()) {
    if (manifest.enabled === false) continue;
    if (kind && manifest.kind !== kind) continue;
    const entry = path.join(dir, manifest.entry || 'index.js');
    if (!fs.existsSync(entry)) {
      console.error(`[archivist] ${manifest.name}: entry not found (${manifest.entry || 'index.js'})`);
      continue;
    }
    let mod;
    try {
      mod = require(entry);
    } catch (err) {
      console.error(`[archivist] ${manifest.name}: failed to load — ${err.message}`);
      continue;
    }
    out.push({ name: manifest.name, kind: manifest.kind, manifest, dir, group, module: mod });
  }
  out.sort((a, b) => (a.manifest.order ?? 100) - (b.manifest.order ?? 100) || a.name.localeCompare(b.name));
  return out;
}

// Find the first enabled source adapter whose match() accepts the input.
function matchSource(input) {
  for (const ext of load({ kind: 'source' })) {
    try {
      if (ext.module.match && ext.module.match(input)) return ext;
    } catch { /* ignore a misbehaving matcher */ }
  }
  return null;
}

module.exports = { EXTENSIONS_DIR, VALID_KINDS, discover, load, matchSource };
