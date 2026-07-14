#!/usr/bin/env node
// clone-repo.js — clone a git repo and summarize its structure
// Usage: node scripts/clone-repo.js <git-url>
// Output: file tree + README content printed to stdout
// Clones into raw/repos/<repo-name>/

const path = require('path');
const fs = require('fs');
const { simpleGit } = require('simple-git');

const repoUrl = process.argv[2];

if (!repoUrl) {
  console.error('Usage: node scripts/clone-repo.js <git-url>');
  process.exit(1);
}

// Derive repo name from URL
const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');
const reposDir = path.resolve(__dirname, '../raw/repos');
const destDir = path.join(reposDir, repoName);

async function walkDir(dir, prefix = '', lines = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
    .sort((a, b) => {
      // Directories first
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}`);
    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      // Only recurse 2 levels deep to keep output manageable
      if (newPrefix.split('│').length <= 3) {
        walkDir(path.join(dir, entry.name), newPrefix, lines);
      }
    }
  }
  return lines;
}

function findReadme(dir) {
  const candidates = ['README.md', 'readme.md', 'README.txt', 'README'];
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  if (fs.existsSync(destDir)) {
    console.log(`Repository already exists at ${destDir} — pulling latest changes...\n`);
    const git = simpleGit(destDir);
    await git.pull();
  } else {
    console.log(`Cloning ${repoUrl} into ${destDir}...\n`);
    const git = simpleGit();
    await git.clone(repoUrl, destDir, ['--depth', '1']);
    console.log('Clone complete.\n');
  }

  // Print file tree
  console.log(`## Repository: ${repoName}`);
  console.log(`Source: ${repoUrl}\n`);
  console.log('## File Tree\n');
  console.log(`${repoName}/`);
  const lines = await walkDir(destDir);
  console.log(lines.join('\n'));
  console.log('');

  // Print README
  const readmePath = findReadme(destDir);
  if (readmePath) {
    console.log('## README\n');
    const readme = fs.readFileSync(readmePath, 'utf-8');
    // Truncate very long READMEs
    const MAX = 8000;
    if (readme.length > MAX) {
      console.log(readme.slice(0, MAX));
      console.log(`\n... [README truncated at ${MAX} chars — read ${readmePath} for full content]`);
    } else {
      console.log(readme);
    }
  } else {
    console.log('## README\n\n(No README found)');
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
