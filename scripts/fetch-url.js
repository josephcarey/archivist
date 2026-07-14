#!/usr/bin/env node
// fetch-url.js — fetch a URL and return clean markdown.
// Usage: node scripts/fetch-url.js <url>
// Output: clean markdown printed to stdout.
//
// Uses Defuddle (article extraction) with a Turndown fallback. Saves a clean
// copy under .archivist/cache/url/<slug>.md, hashes the content, and records
// change-detection state in the manifest (new / changed / unchanged).

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const TurndownService = require('turndown');
const { sha256, checkAndRecord, CACHE_DIR } = require('./lib/manifest');

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/fetch-url.js <url>');
  process.exit(1);
}

function slugify(u) {
  return u
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .toLowerCase();
}

function turndownFallback(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });
  td.addRule('remove-empty-links', {
    filter: node => node.nodeName === 'A' && !node.textContent.trim(),
    replacement: () => '',
  });
  return { title: null, markdown: td.turndown(cleaned) };
}

async function defuddleExtract(html) {
  // Defuddle's node entry is ESM-only; load it dynamically from CommonJS.
  const { JSDOM } = require('jsdom');
  const mod = await import('defuddle/node');
  const dom = new JSDOM(html, { url });
  const result = await mod.Defuddle(dom, url, { markdown: true });
  return { title: result.title || null, markdown: result.content || '' };
}

async function main() {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; archivist/1.0)' },
      timeout: 20000,
    });
  } catch (err) {
    console.error(`Failed to fetch URL: ${err.message}`);
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${url}`);
    process.exit(1);
  }

  const html = await res.text();

  let extracted;
  try {
    extracted = await defuddleExtract(html);
    if (!extracted.markdown || extracted.markdown.trim().length < 40) {
      // Defuddle found too little; fall back.
      extracted = turndownFallback(html);
    }
  } catch (err) {
    console.error(`(defuddle failed, using fallback: ${err.message})`);
    extracted = turndownFallback(html);
  }

  const title = extracted.title || url;
  const body = extracted.markdown.trim();
  const doc = `# Source: ${title}\n\n> ${url}\n\n${body}\n`;

  // Hash the extracted body for change detection.
  const hash = sha256(body);
  const id = `url:${url}`;
  const status = checkAndRecord(id, hash, { type: 'url', title });

  // Cache a clean copy in a predictable location.
  const urlCacheDir = path.join(CACHE_DIR, 'url');
  if (!fs.existsSync(urlCacheDir)) fs.mkdirSync(urlCacheDir, { recursive: true });
  const cachePath = path.join(urlCacheDir, `${slugify(url)}.md`);
  fs.writeFileSync(cachePath, doc);

  // Status banner to stderr so stdout stays clean markdown.
  console.error(`[archivist] ${status.toUpperCase()} — ${url}`);
  console.error(`[archivist] cached: ${path.relative(process.cwd(), cachePath)} (hash ${hash.slice(0, 12)})`);

  process.stdout.write(doc);
}

main();
