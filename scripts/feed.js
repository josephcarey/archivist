'use strict';

// Scheduled discovery feed. Polls the feeds in profile/feeds.md, applies keyword filters
// and the per-run cap, dedupes against the existing queue, and appends new candidate URLs
// to raw/urls.md. Prints a human summary to stdout and FEED_NEW=<n> to stderr (for CI).
//
// Discovery only: it never authors wiki pages. Authoring stays an /ingest step.
//
//   node scripts/feed.js            # poll + append to the queue
//   node scripts/feed.js --dry-run  # report what would be added, write nothing

const { loadFeedConfig, fetchFeed, applyFilters, appendToQueue, readQueuedUrls } = require('./lib/feeds');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const cfg = loadFeedConfig();

  if (!cfg.feeds.length) {
    console.log('No feeds configured in profile/feeds.md.');
    process.stderr.write('FEED_NEW=0\n');
    return;
  }

  const existing = readQueuedUrls();
  const collected = [];
  const errors = [];

  for (const feed of cfg.feeds) {
    try {
      const entries = await fetchFeed(feed);
      collected.push(...entries);
    } catch (e) {
      errors.push(`- ${feed.name || feed.url}: ${e.message}`);
    }
  }

  // Filter, drop already-queued, dedupe, newest first, cap.
  let candidates = applyFilters(collected, cfg.filters).filter(e => !existing.has(e.url));
  const seen = new Set();
  candidates = candidates.filter(e => (seen.has(e.url) ? false : seen.add(e.url)));
  candidates = candidates.slice(0, cfg.maxPerRun);

  const added = dryRun ? candidates : appendToQueue(candidates, { existing });

  console.log(`# Feed discovery\n`);
  console.log(`Polled ${cfg.feeds.length} feed(s); found ${collected.length} entries; ` +
    `${added.length} new candidate(s)${dryRun ? ' (dry run — nothing written)' : ' appended to raw/urls.md'}.\n`);
  if (added.length) {
    for (const e of added) console.log(`- [${(e.title || e.url).trim()}](${e.url}) — ${e.source}`);
  }
  if (errors.length) {
    console.log(`\n## Feeds that errored\n`);
    console.log(errors.join('\n'));
  }

  process.stderr.write(`FEED_NEW=${added.length}\n`);
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.stderr.write('FEED_NEW=0\n');
  process.exit(1);
});
