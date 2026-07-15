#!/usr/bin/env node
// pipeline.js — the archivist engine's stage runner.
//
// The engine is a thin ingest → build → publish pipeline. Capabilities plug in
// as extensions (see extensions/ and scripts/lib/extensions.js). This runner
// dispatches a stage to its enabled extensions.
//
// Usage:
//   node scripts/pipeline.js ingest <url|path|git-url>   # neutral facts → stdout markdown
//   node scripts/pipeline.js build                       # run builders (facts × lens → artifacts)
//   node scripts/pipeline.js publish [name]              # run publishers (expose artifacts)
//   node scripts/pipeline.js list                        # list discovered extensions
//
// Contract: ingest captures NEUTRAL FACTS. Interpretation/judgment happens in
// the build stage through profile/lens.md — never at ingest.

const { load, matchSource, discover } = require('./lib/extensions');

async function ingest(input) {
  if (!input) {
    console.error('Usage: node scripts/pipeline.js ingest <url|path|git-url>');
    process.exit(1);
  }
  const ext = matchSource(input);
  if (!ext) {
    console.error(`[archivist] no source adapter matched: ${input}`);
    console.error('Enabled source adapters:');
    for (const s of load({ kind: 'source' })) {
      console.error(`  - ${s.name}: ${s.manifest.description || ''}`);
    }
    process.exit(1);
  }
  const result = await ext.module.run(input);
  const status = (result.status || 'unknown').toUpperCase();
  console.error(`[archivist] ingest via "${ext.name}" adapter — ${status} — ${result.id || input}`);
  process.stdout.write(result.markdown || '');
  if (result.markdown && !result.markdown.endsWith('\n')) process.stdout.write('\n');
}

async function build() {
  const builders = load({ kind: 'builder' });
  if (builders.length === 0) {
    console.error('[archivist] no builder extensions enabled yet.');
    return;
  }
  for (const b of builders) {
    console.error(`[archivist] build → ${b.name}`);
    const res = (await b.module.build({})) || {};
    for (const w of res.written || []) console.error(`  wrote ${w}`);
  }
}

async function publish(name, args) {
  let publishers = load({ kind: 'publisher' });
  if (name) publishers = publishers.filter(p => p.name === name);
  if (publishers.length === 0) {
    console.error(name
      ? `[archivist] no publisher named "${name}".`
      : '[archivist] no publisher extensions enabled yet.');
    return;
  }
  for (const p of publishers) {
    console.error(`[archivist] publish → ${p.name}`);
    await p.module.publish({ args: args || [] });
  }
}

function list() {
  const all = discover();
  if (all.length === 0) {
    console.log('No extensions found under extensions/.');
    return;
  }
  const byKind = { source: [], builder: [], publisher: [] };
  for (const { manifest } of all) (byKind[manifest.kind] || (byKind[manifest.kind] = [])).push(manifest);
  for (const kind of ['source', 'builder', 'publisher']) {
    console.log(`\n${kind.toUpperCase()}S`);
    if (byKind[kind].length === 0) { console.log('  (none)'); continue; }
    for (const m of byKind[kind].sort((a, b) => a.name.localeCompare(b.name))) {
      const state = m.enabled === false ? ' [disabled]' : '';
      console.log(`  - ${m.name}${state} — ${m.description || ''}`);
    }
  }
}

async function main() {
  const [stage, ...rest] = process.argv.slice(2);
  switch (stage) {
    case 'ingest': return ingest(rest[0]);
    case 'build': return build();
    case 'publish': return publish(rest[0], rest.slice(1));
    case 'list': return list();
    default:
      console.error('Usage: node scripts/pipeline.js <ingest|build|publish|list> [args]');
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
