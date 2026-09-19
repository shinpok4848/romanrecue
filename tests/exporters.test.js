// exporters.test.js — node:test + node:assert, ES modules.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  toJSON,
  fromJSON,
  toCSV,
  buildYouTubeDescription,
  toMarkdownTable,
} from '../assets/js/exporters.js';
import {
  serialize,
  deserialize,
  savePlan,
  loadPlan,
  clearPlan,
} from '../assets/js/storage.js';
import { generateMonthlyPlan } from '../assets/js/promptEngine.js';

const FIXED_WED = new Date(2025, 0, 1);
const makePlan = () =>
  generateMonthlyPlan({ theme: 'Autumn, Dawn', startWednesday: FIXED_WED, seed: 999 });

test('JSON round-trip preserves the plan', () => {
  const plan = makePlan();
  const restored = fromJSON(toJSON(plan));
  assert.deepEqual(restored, plan);
});

test('CSV has a header + 16 rows and quotes fields containing commas', () => {
  const plan = makePlan();
  const csv = toCSV(plan);
  const lines = csv.split('\n');
  assert.equal(lines.length, 17, 'header + 16 track rows');
  assert.ok(lines[0].startsWith('week,day,type,releaseDate,status,title'));

  // The style prompt contains commas, so its field must be quoted.
  const dataLines = lines.slice(1);
  assert.ok(
    dataLines.every((l) => l.includes('"')),
    'rows with comma-bearing prompts are quoted',
  );
  // The theme "Autumn, Dawn" has an internal comma -> must be quoted, not split.
  assert.ok(csv.includes('"'), 'commas inside fields are escaped by quoting');
});

test('CSV escapes embedded double quotes by doubling them', () => {
  const plan = {
    tracks: [
      {
        week: 1,
        day: 'Wed',
        type: 'main',
        releaseDate: '2025-01-01',
        status: 'Planned',
        title: 'A "quoted" title',
        stylePrompt: 'x, y',
        excludePrompt: 'a',
        mood: 'm',
        vocalGender: 'Male',
        weirdness: 30,
        styleInfluence: 70,
      },
    ],
  };
  const csv = toCSV(plan);
  assert.ok(csv.includes('"A ""quoted"" title"'));
});

test('buildYouTubeDescription contains the title and a Suno note', () => {
  const plan = makePlan();
  const track = plan.tracks[0];
  const desc = buildYouTubeDescription(track);
  assert.ok(desc.includes(track.title));
  assert.ok(/Suno AI/i.test(desc), 'mentions Suno AI');
  assert.ok(desc.includes('#'), 'has hashtags');
});

test('toMarkdownTable is well-formed (header + separator + 16 rows)', () => {
  const plan = makePlan();
  const md = toMarkdownTable(plan);
  const lines = md.split('\n');
  assert.equal(lines.length, 18, 'header + separator + 16 rows');
  assert.ok(lines[0].startsWith('| Week | Day |'));
  assert.match(lines[1], /^\| --- \|/);
  for (const line of lines) {
    assert.ok(line.startsWith('|') && line.endsWith('|'));
  }
  // No raw newline leaks into a cell (all cells single-line).
  assert.equal(lines.filter((l) => l.startsWith('|')).length, lines.length);
});

test('toMarkdownTable escapes pipe characters in cells', () => {
  const plan = { tracks: [{ week: 1, day: 'Wed', type: 'main', releaseDate: 'd', status: 's', title: 'a|b', stylePrompt: 'x', mood: 'm' }] };
  const md = toMarkdownTable(plan);
  assert.ok(md.includes('a\\|b'));
});

test('storage serialize/deserialize round-trip (pure, no browser)', () => {
  const plan = makePlan();
  const restored = deserialize(serialize(plan));
  assert.deepEqual(restored, plan);
});

test('deserialize returns null for empty/invalid input', () => {
  assert.equal(deserialize(''), null);
  assert.equal(deserialize(null), null);
  assert.equal(deserialize('not json'), null);
});

test('savePlan/loadPlan/clearPlan degrade gracefully without localStorage', () => {
  // node has no localStorage -> functions must not throw and return falsy/null.
  assert.equal(savePlan(makePlan()), false);
  assert.equal(loadPlan(), null);
  assert.equal(clearPlan(), false);
});

test('storage functions work against a mock localStorage', () => {
  const store = new Map();
  const mock = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.localStorage = mock;
  try {
    const plan = makePlan();
    assert.equal(savePlan(plan), true);
    assert.deepEqual(loadPlan(), plan);
    assert.equal(clearPlan(), true);
    assert.equal(loadPlan(), null);
  } finally {
    delete globalThis.localStorage;
  }
});
