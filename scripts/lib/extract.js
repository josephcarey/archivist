// extract.js — core PDF text extraction.
//
// Extracted from the extract-pdf CLI so both the CLI wrapper
// (scripts/extract-pdf.js) and the pdf source adapter
// (extensions/sources/pdf) share one implementation.

const fs = require('fs');
const path = require('path');
const { sha256, checkAndRecord, ROOT } = require('./manifest');

// Extract text from a PDF and record change-detection metadata.
// Returns { id, title, markdown, status, hash }.
async function extractPdf(filePath) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(absPath);

  const hash = sha256(dataBuffer);
  let relId = path.relative(ROOT, absPath);
  if (relId.startsWith('..')) relId = absPath; // outside repo
  const id = `file:${relId}`;
  const title = path.basename(absPath);
  const status = checkAndRecord(id, hash, { type: 'file', title });

  const data = await pdfParse(dataBuffer);
  return { id, title, markdown: data.text, status, hash };
}

module.exports = { extractPdf };
