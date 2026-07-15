#!/usr/bin/env node
// fetch-url.js — thin CLI wrapper over lib/fetch (also exposed as the url source adapter).
// Usage: node scripts/fetch-url.js <url>   → clean markdown on stdout.
const { fetchUrl } = require('./lib/fetch');
const path = require('path');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/fetch-url.js <url>');
  process.exit(1);
}

fetchUrl(url).then(({ markdown, status, hash, cachePath }) => {
  console.error(`[archivist] ${status.toUpperCase()} — ${url}`);
  if (cachePath) {
    console.error(`[archivist] cached: ${path.relative(process.cwd(), cachePath)} (hash ${hash.slice(0, 12)})`);
  }
  process.stdout.write(markdown);
}).catch(err => {
  console.error(`Failed to fetch URL: ${err.message}`);
  process.exit(1);
});
