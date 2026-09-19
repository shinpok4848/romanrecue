// promptEngine.test.js — node:test + node:assert, ES modules.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateMonthlyPlan,
  formatCopyAllSettings,
  buildExcludePrompt,
  mulberry32,
  intInRange,
  pick,
  DEFAULT_SEED,
} from '../assets/js/promptEngine.js';
import { EMOTIONAL, ENERGETIC, DEFAULT_EXCLUDE } from '../assets/js/genrePresets.js';

const FIXED_WED = new Date(2025, 0, 1); // Wed Jan 1, 2025
const genreLabels = (pool) => new Set(pool.map((p) => p.genre));

test('mulberry32 is deterministic and in [0,1)', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 5; i += 1) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
});

test('intInRange and pick stay within bounds', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 50; i += 1) {
    const n = intInRange(rng, 10, 20);
    assert.ok(n >= 10 && n <= 20 && Number.isInteger(n));
  }
  const rng2 = mulberry32(9);
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < 20; i += 1) {
    assert.ok(arr.includes(pick(rng2, arr)));
  }
});

test('plan has exactly 16 tracks: 8 main + 8 shorts', () => {
  const plan = generateMonthlyPlan({ theme: 'Autumn Dawn', startWednesday: FIXED_WED });
  assert.equal(plan.tracks.length, 16);
  assert.equal(plan.tracks.filter((t) => t.type === 'main').length, 8);
  assert.equal(plan.tracks.filter((t) => t.type === 'shorts').length, 8);
});

test('correct Wed/Thu/Fri/Sat distribution across 4 weeks', () => {
  const plan = generateMonthlyPlan({ theme: 'Neon', startWednesday: FIXED_WED });
  const byDay = (d) => plan.tracks.filter((t) => t.day === d);
  for (const day of ['Wed', 'Thu', 'Fri', 'Sat']) {
    assert.equal(byDay(day).length, 4, `expected 4 ${day} tracks`);
  }
  assert.deepEqual(
    byDay('Wed').map((t) => t.type),
    ['main', 'main', 'main', 'main'],
  );
  assert.deepEqual(
    byDay('Thu').map((t) => t.type),
    ['shorts', 'shorts', 'shorts', 'shorts'],
  );
});

test('Wed mains from EMOTIONAL, Fri mains from ENERGETIC', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  const emo = genreLabels(EMOTIONAL);
  const ene = genreLabels(ENERGETIC);
  for (const t of plan.tracks.filter((t) => t.day === 'Wed')) {
    assert.ok(emo.has(t.genre), `Wed genre ${t.genre} should be emotional`);
  }
  for (const t of plan.tracks.filter((t) => t.day === 'Fri')) {
    assert.ok(ene.has(t.genre), `Fri genre ${t.genre} should be energetic`);
  }
});

test('shorts link to same-week parent with matching genre', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  const byId = new Map(plan.tracks.map((t) => [t.id, t]));
  for (const s of plan.tracks.filter((t) => t.type === 'shorts')) {
    assert.ok(s.linkedTrackId, 'short must reference a parent id');
    const parent = byId.get(s.linkedTrackId);
    assert.ok(parent, 'parent must exist');
    assert.equal(parent.type, 'main');
    assert.equal(parent.week, s.week);
    assert.equal(parent.genre, s.genre);
    // Thu -> Wed, Sat -> Fri
    assert.equal(parent.day, s.day === 'Thu' ? 'Wed' : 'Fri');
  }
});

test('main stylePrompt matches the ground-truth structure', () => {
  const plan = generateMonthlyPlan({ theme: 'Autumn Dawn', startWednesday: FIXED_WED });
  for (const t of plan.tracks.filter((t) => t.type === 'main')) {
    assert.ok(t.stylePrompt.startsWith('K-Pop '), 'starts with "K-Pop "');
    assert.ok(/ \d+ BPM /.test(t.stylePrompt) || / \d+ BPM,/.test(t.stylePrompt), 'contains BPM');
    assert.ok(t.stylePrompt.includes(' in '), 'contains " in "');
    assert.ok(t.stylePrompt.includes(','), 'is comma-joined');
    assert.ok(!/\n/.test(t.stylePrompt), 'is a single line');
    const finishing = ['zero volume pumping', 'flawless transitions', 'wide 3D stereo panning', 'warm analog tape saturation'];
    assert.ok(finishing.some((tag) => t.stylePrompt.includes(tag)), 'has a finishing tag');
  }
});

test('excludePrompt combines degradation tokens and genre-contrast tokens', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  for (const t of plan.tracks) {
    assert.ok(t.excludePrompt.includes('vocal fry'));
    assert.ok(t.excludePrompt.includes('muddy mix'));
  }
  // Genre-contrast: each preset's excludeExtra tokens appear for its main track.
  const mains = plan.tracks.filter((t) => t.type === 'main');
  for (const t of mains) {
    const preset = [...EMOTIONAL, ...ENERGETIC].find((p) => p.genre === t.genre);
    assert.ok(preset, 'preset found');
    assert.ok(
      preset.excludeExtra.some((tok) => t.excludePrompt.includes(tok)),
      `${t.genre} exclude should contain a genre-contrast token`,
    );
  }
});

test('buildExcludePrompt deduplicates overlapping tokens', () => {
  const preset = { excludeExtra: ['vocal fry', 'fast', 'FAST'] };
  const result = buildExcludePrompt(preset);
  const tokens = result.split(', ');
  // 'vocal fry' already in DEFAULT_EXCLUDE, 'fast'/'FAST' collapse to one.
  assert.equal(tokens.filter((x) => x.toLowerCase() === 'vocal fry').length, 1);
  assert.equal(tokens.filter((x) => x.toLowerCase() === 'fast').length, 1);
  assert.ok(DEFAULT_EXCLUDE.every((tok) => result.includes(tok)));
});

test('every track has a non-empty Mood distinct from stylePrompt', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  for (const t of plan.tracks) {
    assert.ok(typeof t.mood === 'string' && t.mood.length > 0, 'mood non-empty');
    assert.notEqual(t.mood, t.stylePrompt, 'mood distinct from style');
  }
});

test('every track has non-empty lyricsGuide; shorts mention a 15-30s hook', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  for (const t of plan.tracks) {
    assert.ok(typeof t.lyricsGuide === 'string' && t.lyricsGuide.length > 0);
  }
  for (const s of plan.tracks.filter((t) => t.type === 'shorts')) {
    assert.ok(/15-30s/.test(s.lyricsGuide), 'shorts lyrics mention 15-30s hook');
    assert.ok(s.shortsHookGuide && s.shortsHookGuide.highlightSection.length > 0);
  }
});

test('weirdness and styleInfluence stay within 0-100 and preset ranges', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  for (const t of plan.tracks.filter((t) => t.type === 'main')) {
    const preset = [...EMOTIONAL, ...ENERGETIC].find((p) => p.genre === t.genre);
    assert.ok(t.weirdness >= 0 && t.weirdness <= 100);
    assert.ok(t.styleInfluence >= 0 && t.styleInfluence <= 100);
    assert.ok(t.weirdness >= preset.weirdnessRange[0] && t.weirdness <= preset.weirdnessRange[1]);
    assert.ok(
      t.styleInfluence >= preset.styleInfluenceRange[0] &&
        t.styleInfluence <= preset.styleInfluenceRange[1],
    );
  }
});

test('deterministic for same seed, varied for different seed', () => {
  const a = generateMonthlyPlan({ theme: 'X', startWednesday: FIXED_WED, seed: 123 });
  const b = generateMonthlyPlan({ theme: 'X', startWednesday: FIXED_WED, seed: 123 });
  const c = generateMonthlyPlan({ theme: 'X', startWednesday: FIXED_WED, seed: 456 });
  assert.deepEqual(a.tracks, b.tracks, 'same seed => identical plan');
  assert.notDeepEqual(a.tracks, c.tracks, 'different seed => different plan');
});

test('plan varies across the 4 weeks (non-repeating genre rotation)', () => {
  const plan = generateMonthlyPlan({ theme: 'Y', startWednesday: FIXED_WED, seed: DEFAULT_SEED });
  const wedGenres = plan.tracks.filter((t) => t.day === 'Wed').map((t) => t.genre);
  const friGenres = plan.tracks.filter((t) => t.day === 'Fri').map((t) => t.genre);
  assert.equal(new Set(wedGenres).size, 4, 'Wed genres are non-repeating');
  assert.equal(new Set(friGenres).size, 4, 'Fri genres are non-repeating');
});

test('title strips commas from a comma-bearing theme', () => {
  const plan = generateMonthlyPlan({ theme: 'a, b', startWednesday: FIXED_WED });
  for (const t of plan.tracks) {
    assert.ok(!t.title.includes('a, b'), 'verbatim comma theme must not appear in title');
    assert.ok(!t.title.includes(','), 'title must not contain a comma introduced by the theme');
    assert.ok(t.title.includes('a b'), 'title should contain the collapsed "a b" form');
  }
  // A comma-only theme must not leak stray commas into the title either.
  const commaOnly = generateMonthlyPlan({ theme: ',,,', startWednesday: FIXED_WED });
  for (const t of commaOnly.tracks) {
    assert.ok(!t.title.includes(','), 'comma-only theme must not leak commas into title');
  }
});

test('formatCopyAllSettings includes Mood and Lyrics lines', () => {
  const plan = generateMonthlyPlan({ theme: 'Test', startWednesday: FIXED_WED });
  const main = plan.tracks.find((t) => t.type === 'main');
  const shorts = plan.tracks.find((t) => t.type === 'shorts');

  const mainBlock = formatCopyAllSettings(main);
  assert.ok(mainBlock.includes('Mood:'));
  assert.ok(mainBlock.includes('Lyrics:'));
  assert.ok(mainBlock.includes('Style:'));
  assert.ok(mainBlock.includes('Exclude:'));
  assert.ok(mainBlock.includes('Weirdness:'));

  const shortsBlock = formatCopyAllSettings(shorts);
  assert.ok(shortsBlock.includes('Mood:'));
  assert.ok(shortsBlock.includes('Lyrics:'));
  assert.ok(shortsBlock.includes('Hook Guide:'));
});
