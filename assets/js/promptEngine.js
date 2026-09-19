// promptEngine.js
//
// Deterministic Suno v6 prompt engine. Pure logic, NO DOM access — importable
// in node:test. Given the same {theme, startWednesday, seed} it always returns
// an identical monthly plan.
//
// The style prompt is assembled to match the user's ground-truth examples:
//   "K-Pop <genre> at <BPM> BPM in <Key>, <productionPhrase>,
//    <instruments joined>, <one vocalCharacterization>, <dynamicCurve>,
//    <finishingTags joined>"
// The theme is woven in as a single concise cue that never breaks the comma
// structure. Each track also emits a dedicated v6 Mood string and Lyrics
// guidance (shorts get a 15-30s highlight hook idea).

import { DEFAULT_EXCLUDE, EMOTIONAL, ENERGETIC } from './genrePresets.js';
import { buildScheduleDates, formatISODate, getNextWednesday } from './schedule.js';

/** Default deterministic seed used when the caller omits one. */
export const DEFAULT_SEED = 20240101;

// ---------------------------------------------------------------------------
// PRNG + small helpers
// ---------------------------------------------------------------------------

/**
 * Deterministic 32-bit PRNG (mulberry32). Returns a function producing floats
 * in [0, 1).
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick an integer in [min, max] inclusive from a PRNG draw.
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function intInRange(rng, min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * Pick one element of an array from a PRNG draw.
 * @template T
 * @param {() => number} rng
 * @param {T[]} arr
 * @returns {T}
 */
export function pick(rng, arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(rng() * arr.length)];
}

/** Clamp a number into the 0-100 range. */
function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

/**
 * Collapse whitespace and strip commas from a free-text theme so it can be
 * woven into the comma-joined style prompt without spawning stray tags.
 */
function sanitizeThemeCue(theme) {
  return String(theme || '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Slugify a genre label into a hashtag-safe token. */
function genreHashtag(genre) {
  return String(genre).replace(/[^a-zA-Z0-9]+/g, '');
}

/**
 * Seeded Fisher-Yates rotation of pool indices across 4 weeks. When the pool
 * has >= 4 entries there are no repeats within the month.
 * @param {() => number} rng
 * @param {number} poolSize
 * @returns {number[]} length-4 array of pool indices
 */
function buildRotation(rng, poolSize) {
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const rotation = [];
  for (let week = 0; week < 4; week += 1) {
    rotation.push(indices[week % indices.length]);
  }
  return rotation;
}

// ---------------------------------------------------------------------------
// Prompt field builders
// ---------------------------------------------------------------------------

/**
 * Assemble the ground-truth style prompt as a single comma-joined line.
 * @param {object} preset
 * @param {string} theme
 * @param {() => number} rng
 * @returns {{stylePrompt:string, bpm:number, key:string, vocalPhrase:string}}
 */
export function buildStylePrompt(preset, theme, rng) {
  const bpm = intInRange(rng, preset.bpmRange[0], preset.bpmRange[1]);
  const key = pick(rng, preset.keys);
  const vocalPhrase = pick(rng, preset.vocalCharacterizations);
  const themeCue = sanitizeThemeCue(theme);

  const segments = [
    `K-Pop ${preset.genre} at ${bpm} BPM in ${key}`,
    preset.productionPhrase,
    preset.instruments.join(', '),
    vocalPhrase,
    preset.dynamicCurve,
    preset.finishingTags.join(', '),
  ];

  // Weave the theme as one concise trailing cue so it never breaks structure.
  if (themeCue) {
    segments.push(`inspired by ${themeCue}`);
  }

  const stylePrompt = segments
    .map((s) => String(s).replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0)
    .join(', ');

  return { stylePrompt, bpm, key, vocalPhrase };
}

/**
 * Combine the shared degradation tokens with the preset's genre-contrast
 * excludes into a single comma-joined exclude prompt (deduplicated).
 * @param {object} preset
 * @returns {string}
 */
export function buildExcludePrompt(preset) {
  const tokens = [...DEFAULT_EXCLUDE, ...(preset.excludeExtra || [])];
  const seen = new Set();
  const unique = [];
  for (const raw of tokens) {
    const token = String(raw).replace(/\s+/g, ' ').trim();
    const keyLower = token.toLowerCase();
    if (token && !seen.has(keyLower)) {
      seen.add(keyLower);
      unique.push(token);
    }
  }
  return unique.join(', ');
}

/**
 * Build the dedicated v6 Mood string from the preset's curated mood words plus
 * a light, deterministic theme flavour. Distinct from the style tag list.
 * @param {object} preset
 * @param {string} theme
 * @param {() => number} rng
 * @returns {string}
 */
export function buildMood(preset, theme, rng) {
  const pool = [...preset.moodWords];
  // Deterministically drop one word for variety across weeks/seeds, keeping
  // at least three mood keywords.
  if (pool.length > 3) {
    const dropIdx = Math.floor(rng() * pool.length);
    pool.splice(dropIdx, 1);
  }
  const themeCue = sanitizeThemeCue(theme);
  const words = themeCue ? [...pool, `${themeCue} atmosphere`] : pool;
  return words.join(', ');
}

/**
 * Build section-structured lyric guidance. For shorts, returns a compact
 * 15-30s highlight hook idea instead of the full section breakdown.
 * @param {object} preset
 * @param {string} theme
 * @param {'main'|'shorts'} variant
 * @returns {string}
 */
export function buildLyricsGuide(preset, theme, variant) {
  const themeCue = sanitizeThemeCue(theme) || 'the monthly theme';
  if (variant === 'shorts') {
    return [
      `15-30s highlight hook: open on the catchiest line of the ${preset.genre} chorus.`,
      `Keep it to 2-4 punchy lines about "${themeCue}" that loop cleanly for a vertical Short.`,
      'End on a hook word that invites a rewatch.',
    ].join(' ');
  }
  const sections = preset.lyricStructure
    .map((section) => `[${section}]`)
    .join(' -> ');
  return [
    `Theme: ${themeCue}.`,
    `Suggested section flow: ${sections}.`,
    'Write the hook first, keep verses conversational, and land the emotional payload in the chorus/bridge.',
  ].join(' ');
}

// ---------------------------------------------------------------------------
// Titles
// ---------------------------------------------------------------------------

/**
 * Compose a bilingual (KR / EN) title: a Korean mood label + the English
 * "<theme> <genre>[ Shorts]" descriptor in parentheses.
 */
function buildTitle(theme, mood, genre, variant) {
  // Route the theme through the same comma-stripping/whitespace-collapsing
  // sanitization the other prompt fields use, so a comma-bearing theme cannot
  // leak literal commas into the bilingual title.
  const cleanTheme = sanitizeThemeCue(theme);
  const moodLabel = mood === 'emotional' ? '감성' : '에너지';
  const krSuffix = variant === 'shorts' ? ' 숏츠' : '';
  const enSuffix = variant === 'shorts' ? ' Shorts' : '';
  const kr = `${cleanTheme} ${moodLabel}${krSuffix}`.trim();
  const en = `${cleanTheme} ${genre}${enSuffix}`.trim();
  return `${kr} (${en})`;
}

// ---------------------------------------------------------------------------
// Track builders
// ---------------------------------------------------------------------------

/** Build a full MAIN track from a preset. */
function buildMainTrack(preset, mood, theme, rng, base) {
  const { stylePrompt } = buildStylePrompt(preset, theme, rng);
  const weirdness = clampPercent(intInRange(rng, preset.weirdnessRange[0], preset.weirdnessRange[1]));
  const styleInfluence = clampPercent(
    intInRange(rng, preset.styleInfluenceRange[0], preset.styleInfluenceRange[1]),
  );
  return {
    ...base,
    type: 'main',
    linkedTrackId: null,
    genre: preset.genre,
    title: buildTitle(theme, mood, preset.genre, 'main'),
    stylePrompt,
    excludePrompt: buildExcludePrompt(preset),
    mood: buildMood(preset, theme, rng),
    lyricsGuide: buildLyricsGuide(preset, theme, 'main'),
    vocalGender: preset.vocalGender,
    weirdness,
    styleInfluence,
    shortsHookGuide: null,
  };
}

/**
 * Derive a SHORTS track from a same-week parent MAIN track. Genre/tempo
 * continuity is explicit: the short reuses the parent's genre and BPM.
 */
function buildShortsTrack(preset, parent, mood, theme, base) {
  const parentBpmMatch = parent.stylePrompt.match(/at (\d+) BPM/);
  const bpm = parentBpmMatch ? Number(parentBpmMatch[1]) : preset.bpmRange[0];
  const keyMatch = parent.stylePrompt.match(/ in ([^,]+),/);
  const key = keyMatch ? keyMatch[1].trim() : preset.keys[0];

  const isEmotional = mood === 'emotional';
  const highlightSection = isEmotional
    ? '15-30s chorus/bridge "killing part" — the most emotional vocal hook'
    : '15-30s main drop section — the hardest-hitting groove';
  const videoHookIdea = isEmotional
    ? '9:16 vertical, cinematic slow-motion lyric close-up with soft bokeh'
    : '9:16 vertical, fast-cut beat-synced visuals landing on the drop';
  const captionHashtags = [
    genreHashtag(preset.genre),
    'Shorts',
    'SunoAI',
    isEmotional ? 'EmotionalMusic' : 'ViralBeat',
  ];

  const stylePrompt = [
    `K-Pop ${preset.genre} at ${bpm} BPM in ${key}`,
    preset.productionPhrase,
    `${isEmotional ? 'emotional hook edit' : 'drop-focused edit'} for a vertical Short`,
    preset.finishingTags.join(', '),
  ]
    .map((s) => String(s).replace(/\s+/g, ' ').trim())
    .join(', ');

  return {
    ...base,
    type: 'shorts',
    linkedTrackId: parent.id,
    genre: preset.genre,
    title: buildTitle(theme, mood, preset.genre, 'shorts'),
    stylePrompt,
    excludePrompt: parent.excludePrompt,
    mood: parent.mood,
    lyricsGuide: buildLyricsGuide(preset, theme, 'shorts'),
    vocalGender: parent.vocalGender,
    weirdness: parent.weirdness,
    styleInfluence: parent.styleInfluence,
    shortsHookGuide: { highlightSection, videoHookIdea, captionHashtags },
  };
}

// ---------------------------------------------------------------------------
// Monthly plan
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic monthly plan: 16 tracks over 4 weeks
 * (8 main + 8 shorts). Wednesday mains from EMOTIONAL, Friday mains from
 * ENERGETIC; Thu shorts derive from that week's Wed main, Sat shorts from that
 * week's Fri main (same genre + tempo continuity).
 *
 * @param {{theme?:string, startWednesday?:Date, seed?:number}} [input]
 * @returns {{id:string, theme:string, seed:number, startDate:string, createdAt:string, tracks:object[]}}
 */
export function generateMonthlyPlan(input = {}) {
  const seed = Number.isFinite(input.seed) ? input.seed : DEFAULT_SEED;
  const theme = input.theme != null ? String(input.theme) : '';
  const rng = mulberry32(seed);

  const startWednesday = getNextWednesday(input.startWednesday ?? new Date());
  const schedule = buildScheduleDates(startWednesday);

  const emotionalRotation = buildRotation(rng, EMOTIONAL.length);
  const energeticRotation = buildRotation(rng, ENERGETIC.length);

  // First pass: build main tracks so shorts can link to their parents.
  const mainByWeek = {}; // { [week]: { Wed:track, Fri:track } }
  const presetByWeek = {}; // { [week]: { Wed:preset, Fri:preset } }
  const tracksById = {};

  for (const entry of schedule) {
    if (entry.type !== 'main') continue;
    const weekIdx = entry.week - 1;
    const isWed = entry.day === 'Wed';
    const preset = isWed
      ? EMOTIONAL[emotionalRotation[weekIdx]]
      : ENERGETIC[energeticRotation[weekIdx]];
    const mood = isWed ? 'emotional' : 'energetic';
    const id = `w${entry.week}-${entry.day.toLowerCase()}-main`;
    const base = {
      id,
      week: entry.week,
      day: entry.day,
      releaseDate: formatISODate(entry.date),
      status: 'Planned',
    };
    const track = buildMainTrack(preset, mood, theme, rng, base);
    tracksById[id] = track;
    if (!mainByWeek[entry.week]) mainByWeek[entry.week] = {};
    if (!presetByWeek[entry.week]) presetByWeek[entry.week] = {};
    mainByWeek[entry.week][entry.day] = track;
    presetByWeek[entry.week][entry.day] = preset;
  }

  // Second pass: emit tracks in chronological order, linking shorts to parents.
  const tracks = [];
  for (const entry of schedule) {
    if (entry.type === 'main') {
      tracks.push(tracksById[`w${entry.week}-${entry.day.toLowerCase()}-main`]);
      continue;
    }
    const isThu = entry.day === 'Thu';
    const parentDay = isThu ? 'Wed' : 'Fri';
    const parent = mainByWeek[entry.week][parentDay];
    const preset = presetByWeek[entry.week][parentDay];
    const mood = isThu ? 'emotional' : 'energetic';
    const base = {
      id: `w${entry.week}-${entry.day.toLowerCase()}-shorts`,
      week: entry.week,
      day: entry.day,
      releaseDate: formatISODate(entry.date),
      status: 'Planned',
    };
    tracks.push(buildShortsTrack(preset, parent, mood, theme, base));
  }

  return {
    id: `plan-${seed}-${formatISODate(startWednesday)}`,
    theme,
    seed,
    startDate: formatISODate(startWednesday),
    createdAt: new Date(0).toISOString(),
    tracks,
  };
}

/**
 * Render a Suno-web-ready text block for a track (backs "Copy All Settings").
 * Includes Title / Style / Exclude / Mood / Lyrics / Vocal / Weirdness% /
 * Style Influence%, plus a Hook Guide for shorts.
 * @param {object} track
 * @returns {string}
 */
export function formatCopyAllSettings(track) {
  const lines = [
    `Title: ${track.title}`,
    `Style: ${track.stylePrompt}`,
    `Exclude: ${track.excludePrompt}`,
    `Mood: ${track.mood}`,
    `Lyrics: ${track.lyricsGuide}`,
    `Vocal: ${track.vocalGender}`,
    `Weirdness: ${track.weirdness}%`,
    `Style Influence: ${track.styleInfluence}%`,
  ];

  if (track.type === 'shorts' && track.shortsHookGuide) {
    const g = track.shortsHookGuide;
    const hashtags = (g.captionHashtags || []).map((h) => `#${h}`).join(' ');
    lines.push(
      '',
      'Hook Guide:',
      `  Highlight: ${g.highlightSection}`,
      `  Video Hook: ${g.videoHookIdea}`,
      `  Hashtags: ${hashtags}`,
    );
  }

  return lines.join('\n');
}
