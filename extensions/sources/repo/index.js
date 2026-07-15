// repo source adapter — handles git repository URLs.
const { cloneRepo } = require('../../../scripts/lib/clone');

module.exports = {
  name: 'repo',
  kind: 'source',
  match(input) {
    return /\.git$/i.test(input) ||
      /^git@/i.test(input) ||
      /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\//i.test(input);
  },
  // Returns { id, name, status, head, markdown, ... }
  async run(input) {
    return cloneRepo(input);
  },
};
