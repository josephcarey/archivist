'use strict';

// One-time seed importer. Given a curated catalog (a URL or a local markdown file), extract
// every article link, append the new ones to the ingest queue (raw/urls.md), and — the useful
// part — autodiscover an RSS/Atom feed for each distinct source so one-off articles from
// writers/series you want to keep reading become ongoing subscriptions in profile/feeds.md.
//
//   node scripts/seed-catalog.js <catalog-url-or-file>              # import + propose feeds (prints)
//   node scripts/seed-catalog.js <catalog-url-or-file> --write-feeds # also append discovered feeds to profile/feeds.md
//   node scripts/seed-catalog.js <catalog-url-or-file> --no-discover # skip feed autodiscovery (faster)
//
// Deterministic, no LLM. Feed autodiscovery makes one HTTP request per source domain.

const fs = require('fs');
const fetch = require('node-fetch');
const {
  appendToQueue, readQueuedUrls, discoverFeed, loadFeedConfig, FEEDS_FILE,
} = require('./lib/feeds');

const UA = 'archivist-seed/1.0 (+https://github.com/josephcarey/archivist)';

async function readSource(arg) {
  if (/^https?:\/\//.test(arg)) {
    const res = await fetch(arg, { headers: { 'User-Agent': UA }, redirect: 'follow', timeout: 20000 });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching catalog ${arg}`);
    return res.text();
  }
  if (!fs.existsSync(arg)) throw new Error(`Catalog file not found: ${arg}`);
  return fs.readFileSync(arg, 'utf-8');
}

// Extract [title](url) markdown links and bare URLs; skip common non-article hosts.
const SKIP_HOSTS = /(^|\.)(github\.com|githubusercontent\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|linkedin\.com)$/i;

function extractArticles(markdown) {
  const out = [];
  const seen = new Set();
  const push = (title, url) => {
    let u;
    try { u = new URL(url); } catch (_) { return; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    const clean = u.href.replace(/#.*$/, '');
    if (seen.has(clean)) return;
    seen.add(clean);
    out.push({ title: (title || clean).replace(/\s+/g, ' ').trim(), url: clean, host: u.host });
  };
  const mdLink = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = mdLink.exec(markdown))) push(m[1], m[2]);
  for (const line of markdown.split('\n')) {
    const bare = line.trim().match(/^(https?:\/\/\S+)$/);
    if (bare) push('', bare[1]);
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const arg = args.find(a => !a.startsWith('--'));
  if (!arg) {
    console.error('Usage: node scripts/seed-catalog.js <catalog-url-or-file> [--write-feeds] [--no-discover]');
    process.exit(2);
  }
  const writeFeeds = args.includes('--write-feeds');
  const discover = !args.includes('--no-discover');

  const markdown = await readSource(arg);
  const articles = extractArticles(markdown).filter(a => !SKIP_HOSTS.test(a.host));

  const existing = readQueuedUrls();
  const added = appendToQueue(articles, { existing });

  console.log(`# Seed import\n`);
  console.log(`Catalog: ${arg}`);
  console.log(`Found ${articles.length} article link(s); appended ${added.length} new to raw/urls.md.\n`);

  if (!discover) {
    process.stderr.write(`SEED_NEW=${added.length}\n`);
    return;
  }

  // Autodiscover one feed per distinct host (use the first article seen for that host).
  const byHost = new Map();
  for (const a of articles) if (!byHost.has(a.host)) byHost.set(a.host, a);

  const cfg = loadFeedConfig();
  const known = new Set(cfg.feeds.map(f => f.url));
  const discovered = [];
  console.log(`## Feed autodiscovery (${byHost.size} source domain(s))\n`);
  for (const [host, a] of byHost) {
    let feeds = [];
    try { feeds = await discoverFeed(a.url); } catch (_) { feeds = []; }
    if (feeds.length) {
      const url = feeds[0];
      const status = known.has(url) ? 'already configured' : 'NEW';
      console.log(`- ${host}: ${url} (${status})`);
      if (!known.has(url)) {
        discovered.push({ name: host, url, tags: ['discovered'] });
        known.add(url);
      }
    } else {
      console.log(`- ${host}: no feed found`);
    }
  }

  if (discovered.length && writeFeeds) {
    appendFeedsToProfile(discovered);
    console.log(`\nAppended ${discovered.length} discovered feed(s) to profile/feeds.md.`);
  } else if (discovered.length) {
    console.log(`\nProposed additions for profile/feeds.md (re-run with --write-feeds to apply):`);
    for (const f of discovered) {
      console.log(`  { "name": ${JSON.stringify(f.name)}, "url": ${JSON.stringify(f.url)}, "tags": ["discovered"] },`);
    }
  }

  process.stderr.write(`SEED_NEW=${added.length}\n`);
}

// Insert discovered feeds into the JSON block's "feeds" array in profile/feeds.md.
function appendFeedsToProfile(feeds) {
  let text = fs.readFileSync(FEEDS_FILE, 'utf-8');
  const block = text.match(/```json\s*([\s\S]*?)```/);
  if (!block) throw new Error('No JSON config block in profile/feeds.md');
  const cfg = JSON.parse(block[1]);
  cfg.feeds = cfg.feeds || [];
  const known = new Set(cfg.feeds.map(f => f.url));
  for (const f of feeds) if (!known.has(f.url)) cfg.feeds.push(f);
  const rebuilt = '```json\n' + JSON.stringify(cfg, null, 2) + '\n```';
  text = text.replace(/```json\s*[\s\S]*?```/, rebuilt);
  fs.writeFileSync(FEEDS_FILE, text);
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
