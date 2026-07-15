// url source adapter — handles http(s) URLs.
const { fetchUrl } = require('../../../scripts/lib/fetch');

module.exports = {
  name: 'url',
  kind: 'source',
  match(input) {
    return /^https?:\/\//i.test(input) && !/\.git$/i.test(input);
  },
  // Returns { id, title, markdown, status, ... }
  async run(input) {
    return fetchUrl(input);
  },
};
