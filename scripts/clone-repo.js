#!/usr/bin/env node
// clone-repo.js — thin CLI wrapper over lib/clone (also exposed as the repo source adapter).
// Usage: node scripts/clone-repo.js <git-url>   → file tree + README + packages on stdout.
const { cloneRepo } = require('./lib/clone');

const repoUrl = process.argv[2];
if (!repoUrl) {
  console.error('Usage: node scripts/clone-repo.js <git-url>');
  process.exit(1);
}

cloneRepo(repoUrl).then(({ markdown, status, head, name, logLines }) => {
  for (const line of logLines) console.log(line);
  console.log('');
  if (head) console.log(`[archivist] ${status.toUpperCase()} — repo ${name} @ ${head.slice(0, 12)}\n`);
  console.log(markdown);
}).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
