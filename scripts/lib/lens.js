// lens.js — read the values lens and turn neutral facts into a signal.
//
// The lens is profile/lens.md. Its machine-readable weighting lives in the
// first ```json block. This module is the ONLY place facts become judgments,
// which keeps the facts/values separation honest.

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./manifest');

const LENS_PATH = path.join(ROOT, 'profile', 'lens.md');

const DEFAULT_LENS = {
  stance: 'default',
  weights: { novelty: 0.2, credibility: 0.2, relevance: 0.2, maturity: 0.2, cost: 0.2 },
  thresholds: { adopt: 3.5, trial: 3.0, watch: 2.5 },
  guards: { adoptMinMaturity: 4, adoptMinCost: 3, trialMinRelevance: 3 },
};

function loadLens() {
  if (!fs.existsSync(LENS_PATH)) return { ...DEFAULT_LENS };
  const text = fs.readFileSync(LENS_PATH, 'utf-8');
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return { ...DEFAULT_LENS };
  try {
    const parsed = JSON.parse(m[1]);
    return {
      stance: parsed.stance || DEFAULT_LENS.stance,
      weights: { ...DEFAULT_LENS.weights, ...(parsed.weights || {}) },
      thresholds: { ...DEFAULT_LENS.thresholds, ...(parsed.thresholds || {}) },
      guards: { ...DEFAULT_LENS.guards, ...(parsed.guards || {}) },
    };
  } catch (err) {
    console.error(`[archivist] could not parse lens weighting (${err.message}); using defaults.`);
    return { ...DEFAULT_LENS };
  }
}

// Weighted average of the dimension scores on the 1–5 scale.
function score(scores, lens) {
  const w = lens.weights;
  let total = 0, wsum = 0;
  for (const key of Object.keys(w)) {
    if (typeof scores[key] === 'number') {
      total += w[key] * scores[key];
      wsum += w[key];
    }
  }
  return wsum ? total / wsum : null;
}

// Turn neutral scores (+ optional tags) into a signal through the lens.
// Returns { signal, score, reason }.
function judge(scores, lens, { tags = [] } = {}) {
  if (tags.map(t => t.toLowerCase()).includes('deprecated')) {
    return { signal: 'deprecated', score: null, reason: 'tagged deprecated' };
  }
  const s = scores ? score(scores, lens) : null;
  if (s === null) {
    return { signal: 'unscored', score: null, reason: 'no Evaluation scores on page' };
  }
  const { thresholds: th, guards: g } = lens;
  const rounded = Math.round(s * 100) / 100;
  const mat = scores.maturity ?? 0;
  const cost = scores.cost ?? 0;
  const rel = scores.relevance ?? 0;

  if (s >= th.adopt && mat >= g.adoptMinMaturity && cost >= g.adoptMinCost) {
    return { signal: 'adopt', score: rounded, reason: `weighted ${rounded} with maturity ${mat}, cost ${cost}` };
  }
  if (s >= th.trial && rel >= g.trialMinRelevance) {
    return { signal: 'trial', score: rounded, reason: `weighted ${rounded}, relevance ${rel}, not yet mature/cheap enough to adopt` };
  }
  if (s >= th.watch) {
    return { signal: 'watch', score: rounded, reason: `weighted ${rounded} — track, don't act yet` };
  }
  return { signal: 'hold', score: rounded, reason: `weighted ${rounded} below watch threshold` };
}

module.exports = { LENS_PATH, loadLens, score, judge, DEFAULT_LENS };
