#!/usr/bin/env node
// extract-pdf.js — extract text from a PDF file.
// Usage: node scripts/extract-pdf.js <path-to-pdf>
// Output: plain text printed to stdout.
//
// Hashes the PDF bytes and records change-detection state in the manifest.

const fs = require('fs');
const path = require('path');
const { sha256, checkAndRecord, ROOT } = require('./lib/manifest');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node scripts/extract-pdf.js <path-to-pdf>');
  process.exit(1);
}

const absPath = path.resolve(filePath);

if (!fs.existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const pdfParse = require('pdf-parse');
const dataBuffer = fs.readFileSync(absPath);

const hash = sha256(dataBuffer);
let relId = path.relative(ROOT, absPath);
if (relId.startsWith('..')) relId = absPath; // outside repo
const id = `file:${relId}`;
const status = checkAndRecord(id, hash, { type: 'file', title: path.basename(absPath) });
console.error(`[archivist] ${status.toUpperCase()} — ${relId} (hash ${hash.slice(0, 12)})`);

pdfParse(dataBuffer).then(data => {
  process.stdout.write(data.text);
}).catch(err => {
  console.error(`Failed to extract PDF: ${err.message}`);
  process.exit(1);
});
