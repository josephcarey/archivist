#!/usr/bin/env node
// refresh-repos.js — pull latest for every repo in raw/repos and report changes.
// Usage: node scripts/refresh-repos.js [repo-name]
//
// For each repo: records the pre-pull HEAD, pulls, and if HEAD moved, prints the
// changed files and commit log between old and new HEAD so the maintainer can
// decide what wiki notes need updating. Updates the manifest with the new HEAD.

const path = require('path');
const fs = require('fs');
const { simpleGit } = require('simple-git');
const { loadManifest, saveManifest, classify, record } = require('./lib/manifest');

const reposDir = path.resolve(__dirname, '../raw/repos');
const only = process.argv[2];

async function refreshOne(repoName, manifest) {
  const dir = path.join(reposDir, repoName);
  const git = simpleGit(dir);
  const before = (await git.revparse(['HEAD'])).trim();
  await git.fetch();
  try {
    await git.pull();
  } catch (err) {
    console.log(`  ! pull failed for ${repoName}: ${err.message}`);
  }
  const after = (await git.revparse(['HEAD'])).trim();

  const status = classify(manifest, `repo:${repoName}`, after);
  record(manifest, `repo:${repoName}`, { type: 'repo', hash: after, title: repoName });

  if (before === after) {
    console.log(`= ${repoName}: no change (${after.slice(0, 12)})`);
    return { repoName, changed: false };
  }

  console.log(`\n▶ ${repoName}: ${before.slice(0, 12)} → ${after.slice(0, 12)} [${status}]`);
  const diff = await git.diff(['--stat', `${before}..${after}`]);
  const log = await git.log({ from: before, to: after });
  console.log('  Commits:');
  for (const c of log.all) {
    console.log(`    - ${c.hash.slice(0, 8)} ${c.message}`);
  }
  console.log('  Changed files:');
  console.log(diff.split('\n').map(l => `    ${l}`).join('\n'));
  return { repoName, changed: true };
}

async function main() {
  if (!fs.existsSync(reposDir)) {
    console.log('No raw/repos directory.');
    return;
  }
  const repos = fs.readdirSync(reposDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .filter(name => !only || name === only);

  if (repos.length === 0) {
    console.log(only ? `Repo not found: ${only}` : 'No repos cloned in raw/repos.');
    return;
  }

  const manifest = loadManifest();
  const results = [];
  for (const repoName of repos) {
    try {
      results.push(await refreshOne(repoName, manifest));
    } catch (err) {
      console.log(`  ! error refreshing ${repoName}: ${err.message}`);
    }
  }
  saveManifest(manifest);

  const changed = results.filter(r => r && r.changed);
  console.log(`\n${changed.length} of ${results.length} repo(s) changed.`);
  if (changed.length) {
    console.log('Review the wiki pages for: ' + changed.map(r => r.repoName).join(', '));
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
