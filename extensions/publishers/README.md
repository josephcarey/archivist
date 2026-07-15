# Publisher extensions

**Publishers** run in the pipeline's `publish` stage. They expose built artifacts + the wiki on
a surface (a website, an API, an MCP server). Publishers read; they don't change the wiki.

Each publisher is a folder here with an `extension.json` manifest (`"kind": "publisher"`) and an
entry module exporting:

```js
module.exports = {
  name: 'my-publisher',
  kind: 'publisher',
  async publish(ctx) {
    // ...deploy / serve / expose...
  },
};
```

Run all enabled publishers with `node scripts/pipeline.js publish`.

Planned: the docsify **site publisher** (Phase 5, local preview + GitHub Pages) and an **MCP
publisher** (Phase 7).
