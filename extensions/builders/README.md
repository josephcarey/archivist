# Builder extensions

**Builders** run in the pipeline's `build` stage. They read the markdown wiki (neutral facts)
and, via `profile/lens.md`, derive artifacts — they never mutate facts.

Each builder is a folder here with an `extension.json` manifest (`"kind": "builder"`) and an
entry module exporting:

```js
module.exports = {
  name: 'my-builder',
  kind: 'builder',
  async build(ctx) {
    // ...write artifacts under docs/ or .archivist/...
    return { written: ['docs/...'] };
  },
};
```

Run all enabled builders with `node scripts/pipeline.js build`.

Planned (Phase 4): interpretation/watchlist, research-directions, and digest builders.
