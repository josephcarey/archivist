// pdf source adapter — handles local .pdf file paths.
const { extractPdf } = require('../../../scripts/lib/extract');

module.exports = {
  name: 'pdf',
  kind: 'source',
  match(input) {
    return /\.pdf$/i.test(input) && !/^https?:\/\//i.test(input);
  },
  // Returns { id, title, markdown, status, ... }
  async run(input) {
    return extractPdf(input);
  },
};
