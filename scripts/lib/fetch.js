// fetch.js — core web-page fetch + clean-markdown extraction.
//
// Extracted from the fetch-url CLI so both the CLI wrapper
// (scripts/fetch-url.js) and the url source adapter
// (extensions/sources/url) share one implementation.
//
// Uses Defuddle (article extraction) with a Turndown fallback. Caches a clean
// copy under .archivist/cache/url/<slug>.md, hashes the content, and records
// change-detection state in the manifest.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const TurndownService = require('turndown');
const { sha256, checkAndRecord, CACHE_DIR } = require('./manifest');

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

async function defuddleExtract(html, url) {
  // Defuddle's node entry is ESM-only; load it dynamically from CommonJS.
  const { JSDOM } = require('jsdom');
  const mod = await import('defuddle/node');
  const dom = new JSDOM(html, { url });
  const result = await mod.Defuddle(dom, url, { markdown: true });
  return { title: result.title || null, markdown: result.content || '' };
}

// Fetch a URL and return normalized markdown + change-detection metadata.
// Returns { id, title, markdown, status, hash, cachePath }.
async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; archivist/1.0)' },
    timeout: 20000,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const html = await res.text();

  let extracted;
  try {
    extracted = await defuddleExtract(html, url);
    if (!extracted.markdown || extracted.markdown.trim().length < 40) {
      extracted = turndownFallback(html);
    }
  } catch (err) {
    console.error(`(defuddle failed, using fallback: ${err.message})`);
    extracted = turndownFallback(html);
  }

  const title = extracted.title || url;
  const body = extracted.markdown.trim();
  const markdown = `# Source: ${title}\n\n> ${url}\n\n${body}\n`;

  const hash = sha256(body);
  const id = `url:${url}`;
  const status = checkAndRecord(id, hash, { type: 'url', title });

  const urlCacheDir = path.join(CACHE_DIR, 'url');
  if (!fs.existsSync(urlCacheDir)) fs.mkdirSync(urlCacheDir, { recursive: true });
  const cachePath = path.join(urlCacheDir, `${slugify(url)}.md`);
  fs.writeFileSync(cachePath, markdown);

  return { id, title, markdown, status, hash, cachePath };
}

module.exports = { fetchUrl, slugify };
