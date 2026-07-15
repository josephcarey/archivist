'use strict';

// Feed discovery helpers: load the domain feed config (profile/feeds.md), fetch and parse
// RSS/Atom feeds, autodiscover a site's feed from a page URL, and read/append the ingest
// queue (raw/urls.md). Deterministic and dependency-light (node-fetch + jsdom, both already
// used elsewhere). No LLM, no tokens.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const FEEDS_FILE = path.join(ROOT, 'profile', 'feeds.md');
const URLS_FILE = path.join(ROOT, 'raw', 'urls.md');

const UA = 'archivist-feed/1.0 (+https://github.com/josephcarey/archivist)';

const DEFAULT_CONFIG = {
  feeds: [],
  filters: { includeKeywords: [], excludeKeywords: [] },
  maxPerRun: 25,
};

// Parse the first ```json block out of profile/feeds.md (same convention as lens.md).
function loadFeedConfig(file = FEEDS_FILE) {
  if (!fs.existsSync(file)) return { ...DEFAULT_CONFIG };
  const text = fs.readFileSync(file, 'utf-8');
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return { ...DEFAULT_CONFIG };
  let cfg;
  try {
    cfg = JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`profile/feeds.md JSON block is invalid: ${e.message}`);
  }
  return {
    feeds: Array.isArray(cfg.feeds) ? cfg.feeds : [],
    filters: {
      includeKeywords: (cfg.filters && cfg.filters.includeKeywords) || [],
      excludeKeywords: (cfg.filters && cfg.filters.excludeKeywords) || [],
    },
    maxPerRun: Number.isFinite(cfg.maxPerRun) ? cfg.maxPerRun : 25,
  };
}

async function httpGet(url, accept) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: accept || '*/*' },
    redirect: 'follow',
    timeout: 20000,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function textOf(el, sel) {
  const node = el.querySelector(sel);
  return node ? node.textContent.trim() : '';
}

// Parse an RSS 2.0 or Atom feed into normalized entries.
function parseFeed(xml, sourceName) {
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  const doc = dom.window.document;
  const entries = [];

  // RSS: <item><title/><link>text</link><pubDate/>
  for (const item of doc.querySelectorAll('item')) {
    const title = textOf(item, 'title');
    let link = textOf(item, 'link');
    if (!link) {
      const guid = item.querySelector('guid');
      if (guid && /^https?:\/\//.test(guid.textContent.trim())) link = guid.textContent.trim();
    }
    const published = textOf(item, 'pubDate') || textOf(item, 'date');
    if (link) entries.push({ title, url: link.trim(), published, source: sourceName });
  }

  // Atom: <entry><title/><link href=".."/><updated/>
  for (const entry of doc.querySelectorAll('entry')) {
    const title = textOf(entry, 'title');
    let href = '';
    const links = [...entry.querySelectorAll('link')];
    const alt = links.find(l => (l.getAttribute('rel') || 'alternate') === 'alternate') || links[0];
    if (alt) href = alt.getAttribute('href') || '';
    const published = textOf(entry, 'updated') || textOf(entry, 'published');
    if (href) entries.push({ title, url: href.trim(), published, source: sourceName });
  }

  return entries;
}

async function fetchFeed(feed) {
  const xml = await httpGet(feed.url, 'application/rss+xml, application/atom+xml, application/xml, text/xml');
  return parseFeed(xml, feed.name || feed.url);
}

// Given a web page URL, try to discover its RSS/Atom feed: first via <link rel="alternate">
// autodiscovery, then via a few conventional paths (/feed, /rss, /atom, Substack /feed).
async function discoverFeed(pageUrl) {
  const found = [];
  try {
    const html = await httpGet(pageUrl, 'text/html');
    const dom = new JSDOM(html);
    for (const link of dom.window.document.querySelectorAll('link[rel~="alternate"]')) {
      const type = (link.getAttribute('type') || '').toLowerCase();
      const href = link.getAttribute('href');
      if (!href) continue;
      if (type.includes('oembed') || /oembed|sitemap/i.test(href)) continue;
      if (type.includes('rss') || type.includes('atom') || type.includes('xml')) {
        found.push(new URL(href, pageUrl).href);
      }
    }
  } catch (_) {
    /* fall through to conventional paths */
  }
  if (found.length) return [...new Set(found)];

  let origin;
  try {
    origin = new URL(pageUrl).origin;
  } catch (_) {
    return [];
  }
  for (const p of ['/feed', '/rss', '/atom.xml', '/feed.xml', '/rss.xml', '/index.xml']) {
    const candidate = origin + p;
    try {
      const body = await httpGet(candidate, 'application/rss+xml, application/atom+xml, application/xml');
      if (/<(rss|feed)[\s>]/i.test(body)) {
        found.push(candidate);
        break;
      }
    } catch (_) {
      /* try next */
    }
  }
  return [...new Set(found)];
}

// --- ingest queue (raw/urls.md) --------------------------------------------

const QUEUE_MARKER = '<!-- Add URLs below this line, one per line -->';

function readQueuedUrls(file = URLS_FILE) {
  if (!fs.existsSync(file)) return new Set();
  const urls = new Set();
  for (const raw of fs.readFileSync(file, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('<!--')) continue;
    const md = line.match(/\]\((https?:\/\/[^\s)]+)\)/);
    const bare = line.match(/(https?:\/\/\S+)/);
    if (md) urls.add(md[1]);
    else if (bare) urls.add(bare[1]);
  }
  return urls;
}

// Append candidate entries ({title,url,source}) under the queue marker, deduped against
// what's already queued. Returns the list actually appended.
function appendToQueue(entries, { file = URLS_FILE, existing } = {}) {
  const have = existing || readQueuedUrls(file);
  const seen = new Set();
  const fresh = [];
  for (const e of entries) {
    if (!e.url || have.has(e.url) || seen.has(e.url)) continue;
    seen.add(e.url);
    fresh.push(e);
  }
  if (!fresh.length) return [];

  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : `# URLs to Ingest\n\n## Queue\n\n${QUEUE_MARKER}\n`;
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = fresh.map(e => {
    const title = (e.title || e.url).replace(/\s+/g, ' ').trim();
    const src = e.source ? ` <!-- feed: ${e.source} ${stamp} -->` : '';
    return `- [${title}](${e.url})${src}`;
  });
  const block = lines.join('\n') + '\n';

  if (text.includes(QUEUE_MARKER)) {
    text = text.replace(QUEUE_MARKER, `${QUEUE_MARKER}\n${block}`);
  } else {
    text = text.replace(/\s*$/, '\n') + '\n' + block;
  }
  fs.writeFileSync(file, text);
  return fresh;
}

function applyFilters(entries, filters = {}) {
  const inc = (filters.includeKeywords || []).map(s => s.toLowerCase());
  const exc = (filters.excludeKeywords || []).map(s => s.toLowerCase());
  return entries.filter(e => {
    const hay = `${e.title || ''}`.toLowerCase();
    if (exc.some(k => hay.includes(k))) return false;
    if (inc.length && !inc.some(k => hay.includes(k))) return false;
    return true;
  });
}

module.exports = {
  loadFeedConfig,
  fetchFeed,
  parseFeed,
  discoverFeed,
  readQueuedUrls,
  appendToQueue,
  applyFilters,
  FEEDS_FILE,
  URLS_FILE,
};
