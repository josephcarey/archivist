#!/usr/bin/env node
// fetch-url.js — fetch a URL and return clean markdown
// Usage: node scripts/fetch-url.js <url>
// Output: clean markdown printed to stdout

const fetch = require('node-fetch');
const TurndownService = require('turndown');

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/fetch-url.js <url>');
  process.exit(1);
}

async function main() {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; archivist/1.0)'
      },
      timeout: 15000
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

  // Strip script/style tags before converting
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });

  // Remove link-only noise (nav items etc)
  td.addRule('remove-empty-links', {
    filter: node => node.nodeName === 'A' && !node.textContent.trim(),
    replacement: () => ''
  });

  const markdown = td.turndown(cleaned);
  process.stdout.write(`# Source: ${url}\n\n${markdown}\n`);
}

main();
