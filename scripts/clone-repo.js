#!/usr/bin/env node
// clone-repo.js — clone a git repo and summarize its structure.
// Usage: node scripts/clone-repo.js <git-url>
// Output: file tree + README + detected packages (for monorepos).
// Clones into raw/repos/<repo-name>/.
//
// Records the repo HEAD sha in the manifest for change detection.

const path = require('path');
const fs = require('fs');
const { simpleGit } = require('simple-git');
const { checkAndRecord } = require('./lib/manifest');

const repoUrl = process.argv[2];

if (!repoUrl) {
  console.error('Usage: node scripts/clone-repo.js <git-url>');
  process.exit(1);
}

const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');
const reposDir = path.resolve(__dirname, '../raw/repos');
const destDir = path.join(reposDir, repoName);

function walkDir(dir, prefix = '', lines = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
    .sort((a, b) => {
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

// Detect workspace packages so monorepos can be documented per-package.
function detectPackages(dir) {
  const packages = [];
  const seen = new Set();

  const addPkg = (pkgDir) => {
    const pkgJson = path.join(pkgDir, 'package.json');
    if (!fs.existsSync(pkgJson)) return;
    const rel = path.relative(dir, pkgDir) || '.';
    if (seen.has(rel)) return;
    seen.add(rel);
    try {
      const meta = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
      packages.push({ path: rel, name: meta.name || rel, description: meta.description || '' });
    } catch {
      packages.push({ path: rel, name: rel, description: '' });
    }
  };

  // Glob-free: scan common workspace roots one level deep.
  const roots = ['packages', 'apps', 'services', 'libs'];
  for (const root of roots) {
    const rootDir = path.join(dir, root);
    if (fs.existsSync(rootDir) && fs.statSync(rootDir).isDirectory()) {
      for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
        if (entry.isDirectory()) addPkg(path.join(rootDir, entry.name));
      }
    }
  }
  return packages;
}

function isMonorepo(dir) {
  if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return true;
  if (fs.existsSync(path.join(dir, 'nx.json')) || fs.existsSync(path.join(dir, 'lerna.json'))) return true;
  const pkgJson = path.join(dir, 'package.json');
  if (fs.existsSync(pkgJson)) {
    try {
      const meta = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
      if (meta.workspaces) return true;
    } catch { /* ignore */ }
  }
  return false;
}

async function main() {
  const git = simpleGit();
  if (fs.existsSync(destDir)) {
    console.log(`Repository already exists at ${destDir} — pulling latest changes...\n`);
    await simpleGit(destDir).pull();
  } else {
    console.log(`Cloning ${repoUrl} into ${destDir}...\n`);
    await git.clone(repoUrl, destDir, ['--depth', '1']);
    console.log('Clone complete.\n');
  }

  // Record HEAD for change detection.
  let head = null;
  try {
    head = (await simpleGit(destDir).revparse(['HEAD'])).trim();
  } catch { /* ignore */ }
  if (head) {
    const status = checkAndRecord(`repo:${repoName}`, head, { type: 'repo', title: repoName });
    console.log(`[archivist] ${status.toUpperCase()} — repo ${repoName} @ ${head.slice(0, 12)}\n`);
  }

  console.log(`## Repository: ${repoName}`);
  console.log(`Source: ${repoUrl}\n`);
  console.log('## File Tree\n');
  console.log(`${repoName}/`);
  console.log(walkDir(destDir).join('\n'));
  console.log('');

  // Monorepo packages
  if (isMonorepo(destDir)) {
    const packages = detectPackages(destDir);
    console.log('## Packages (monorepo)\n');
    if (packages.length) {
      console.log('Document notable packages individually:\n');
      for (const p of packages) {
        console.log(`- **${p.name}** (\`${p.path}\`)${p.description ? ` — ${p.description}` : ''}`);
      }
    } else {
      console.log('(Monorepo detected but no packages found under packages/apps/services/libs)');
    }
    console.log('');
  }

  const readmePath = findReadme(destDir);
  if (readmePath) {
    console.log('## README\n');
    const readme = fs.readFileSync(readmePath, 'utf-8');
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
