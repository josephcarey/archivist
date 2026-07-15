#!/usr/bin/env node
// extract-pdf.js — thin CLI wrapper over lib/extract (also exposed as the pdf source adapter).
// Usage: node scripts/extract-pdf.js <path-to-pdf>   → plain text on stdout.
const { extractPdf } = require('./lib/extract');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/extract-pdf.js <path-to-pdf>');
  process.exit(1);
}

extractPdf(filePath).then(({ markdown, status, hash, id }) => {
  console.error(`[archivist] ${status.toUpperCase()} — ${id.replace(/^file:/, '')} (hash ${hash.slice(0, 12)})`);
  process.stdout.write(markdown);
}).catch(err => {
  console.error(`Failed to extract PDF: ${err.message}`);
  process.exit(1);
});
