// clone.js — core git-repo clone + structure summary.
//
// Extracted from the clone-repo CLI so both the CLI wrapper
// (scripts/clone-repo.js) and the repo source adapter
// (extensions/sources/repo) share one implementation.

const path = require('path');
const fs = require('fs');
const { simpleGit } = require('simple-git');
const { checkAndRecord } = require('./manifest');

const REPOS_DIR = path.resolve(__dirname, '../../raw/repos');

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

// Clone (or pull) a repo and build a markdown structure summary.
// Returns { id, name, status, head, markdown, logLines }.
async function cloneRepo(repoUrl) {
  const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');
  const destDir = path.join(REPOS_DIR, repoName);
  const logLines = [];
  const log = (s) => logLines.push(s);

  const git = simpleGit();
  if (fs.existsSync(destDir)) {
    log(`Repository already exists at ${destDir} — pulling latest changes...`);
    await simpleGit(destDir).pull();
  } else {
    log(`Cloning ${repoUrl} into ${destDir}...`);
    await git.clone(repoUrl, destDir, ['--depth', '1']);
    log('Clone complete.');
  }

  let head = null;
  try {
    head = (await simpleGit(destDir).revparse(['HEAD'])).trim();
  } catch { /* ignore */ }

  let status = 'unknown';
  if (head) {
    status = checkAndRecord(`repo:${repoName}`, head, { type: 'repo', title: repoName });
  }

  const out = [];
  out.push(`## Repository: ${repoName}`);
  out.push(`Source: ${repoUrl}\n`);
  out.push('## File Tree\n');
  out.push(`${repoName}/`);
  out.push(walkDir(destDir).join('\n'));
  out.push('');

  if (isMonorepo(destDir)) {
    const packages = detectPackages(destDir);
    out.push('## Packages (monorepo)\n');
    if (packages.length) {
      out.push('Document notable packages individually:\n');
      for (const p of packages) {
        out.push(`- **${p.name}** (\`${p.path}\`)${p.description ? ` — ${p.description}` : ''}`);
      }
    } else {
      out.push('(Monorepo detected but no packages found under packages/apps/services/libs)');
    }
    out.push('');
  }

  const readmePath = findReadme(destDir);
  if (readmePath) {
    out.push('## README\n');
    const readme = fs.readFileSync(readmePath, 'utf-8');
    const MAX = 8000;
    if (readme.length > MAX) {
      out.push(readme.slice(0, MAX));
      out.push(`\n... [README truncated at ${MAX} chars — read ${readmePath} for full content]`);
    } else {
      out.push(readme);
    }
  } else {
    out.push('## README\n\n(No README found)');
  }

  return { id: `repo:${repoName}`, name: repoName, status, head, markdown: out.join('\n'), logLines };
}

module.exports = { cloneRepo, REPOS_DIR };
