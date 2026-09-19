// promptEngine.js
// Pure SunoFlow v2 package generator. It combines a canonical structure,
// curated bilingual concept, full Korean lyrics, v6 prompt fields, parameters,
// producer notes, and a parent-derived Shorts package with no DOM or network.

import { DEFAULT_EXCLUDE, EMOTIONAL, ENERGETIC } from './genrePresets.js';
import { buildScheduleDates, formatISODate, getNextWednesday } from './schedule.js';
import { buildTrackConcept, sanitizeThemeCue } from './conceptPalettes.js';
import { getStructureProfile, formatStructure } from './structureProfiles.js';
import { buildFullLyrics, buildShortLyrics } from './lyricsEngine.js';
import {
  buildRotation,
  createNamedRng,
  intInRange,
  mulberry32,
  normalizeSeed,
  pick,
} from './seededRandom.js';

export const DEFAULT_SEED = 20240101;
export const ENGINE_VERSION = '2.0.0';
export const SCHEMA_VERSION = 2;

// Compatibility exports used by existing integrations and tests.
export { intInRange, mulberry32, pick, sanitizeThemeCue };

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

function uniqueTokens(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const token = String(raw ?? '').replace(/\s+/g, ' ').trim();
    const identity = token.toLocaleLowerCase('en-US');
    if (token && !seen.has(identity)) {
      seen.add(identity);
      result.push(token);
    }
  }
  return result;
}

function inferVocalGender(phrase, fallback = 'Female') {
  const normalized = String(phrase ?? '').toLocaleLowerCase('en-US');
  if (normalized.includes('duet') || (normalized.includes('female') && normalized.includes('male'))) return 'Duet';
  if (normalized.includes('female')) return 'Female';
  if (normalized.includes('male')) return 'Male';
  return fallback;
}

function vocalChoicesFor(preset) {
  if (Array.isArray(preset.vocalOptions) && preset.vocalOptions.length > 0) {
    return preset.vocalOptions;
  }
  return (preset.vocalCharacterizations || []).map((phrase) => ({
    phrase,
    gender: inferVocalGender(phrase, preset.vocalGender),
  }));
}

function conceptCueFrom(value) {
  if (value && typeof value === 'object') return value;
  const userThemeCue = sanitizeThemeCue(value);
  return {
    englishProductionCue: userThemeCue ? `production colored by ${userThemeCue}` : '',
    moodKeywords: userThemeCue ? [`${userThemeCue} atmosphere`] : [],
    userThemeCue,
  };
}

/**
 * Assemble the proven v6 style spine and return every structured selection.
 * @returns {{stylePrompt:string,bpm:number,key:string,vocalPhrase:string,vocalGender:string}}
 */
export function buildStylePrompt(preset, themeOrConcept, rng = mulberry32(DEFAULT_SEED)) {
  const concept = conceptCueFrom(themeOrConcept);
  const bpm = intInRange(rng, preset.bpmRange[0], preset.bpmRange[1]);
  const key = pick(rng, preset.keys);
  const vocalOption = pick(rng, vocalChoicesFor(preset)) || {
    phrase: 'The lead vocal is mixed up front with natural detail',
    gender: preset.vocalGender || 'Female',
  };
  const vocalPhrase = vocalOption.phrase;
  const vocalGender = vocalOption.gender || inferVocalGender(vocalPhrase, preset.vocalGender);

  const segments = [
    `K-Pop ${preset.genre} at ${bpm} BPM in ${key}`,
    preset.productionPhrase,
    preset.instruments.join(', '),
    vocalPhrase,
    preset.dynamicCurve,
    preset.finishingTags.join(', '),
    concept.englishProductionCue ? `curated concept cue: ${concept.englishProductionCue}` : '',
  ];

  return {
    stylePrompt: segments
      .map((segment) => String(segment ?? '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(', '),
    bpm,
    key,
    vocalPhrase,
    vocalGender,
  };
}

/** Shared technical negatives plus preset-specific genre contrasts. */
export function buildExcludePrompt(preset) {
  return uniqueTokens([...DEFAULT_EXCLUDE, ...(preset.excludeExtra || [])]).join(', ');
}

/** Dedicated Suno v6 Mood, intentionally separate from the Style prompt. */
export function buildMood(preset, themeOrConcept, rng = mulberry32(DEFAULT_SEED)) {
  const concept = conceptCueFrom(themeOrConcept);
  const presetWords = [...(preset.moodWords || [])];
  if (presetWords.length > 4) presetWords.splice(Math.floor(rng() * presetWords.length), 1);
  return uniqueTokens([...presetWords, ...(concept.moodKeywords || [])]).join(', ');
}

/** Legacy helper retained for callers; v2 mains store their full lyrics here. */
export function buildLyricsGuide(preset, theme, variant) {
  const cue = sanitizeThemeCue(theme) || '월간 테마';
  if (variant === 'shorts') {
    return `15-30s parent-derived hook excerpt for ${cue}; use the exact 2-4 Korean source lines stored in shortsHookGuide.`;
  }
  return `Theme: ${cue}. Structure: ${formatStructure(getStructureProfile(preset.structureId).sections)}.`;
}

function genreHashtag(genre) {
  return String(genre ?? '').replace(/[^a-zA-Z0-9]+/g, '') || 'KPop';
}

function cloneConcept(concept) {
  return {
    ...concept,
    koreanKeywords: [...(concept.koreanKeywords || [])],
    moodKeywords: [...(concept.moodKeywords || [])],
  };
}

function buildMainTrack({ preset, lane, theme, seed, ordinal, base }) {
  const concept = buildTrackConcept({ theme, seed, ordinal, lane });
  const profile = getStructureProfile(preset.structureId);
  const style = buildStylePrompt(preset, concept, createNamedRng(seed, 'style', base.id));
  const parameterRng = createNamedRng(seed, 'parameters', base.id);
  const weirdness = clampPercent(
    intInRange(parameterRng, preset.weirdnessRange[0], preset.weirdnessRange[1]),
  );
  const styleInfluence = clampPercent(
    intInRange(parameterRng, preset.styleInfluenceRange[0], preset.styleInfluenceRange[1]),
  );
  const mood = buildMood(preset, concept, createNamedRng(seed, 'mood', base.id));
  const lyricPackage = buildFullLyrics({
    profile,
    concept,
    vocalGender: style.vocalGender,
    rng: createNamedRng(seed, 'lyrics', base.id),
  });

  return {
    ...base,
    type: 'main',
    linkedTrackId: null,
    lane,
    presetId: preset.id,
    structureId: profile.id,
    structureName: `${profile.nameKo} / ${profile.nameEn}`,
    genre: preset.genre,
    title: concept.title,
    titleKo: concept.titleKo,
    titleEn: concept.titleEn,
    concept,
    bpm: style.bpm,
    key: style.key,
    vocalPhrase: style.vocalPhrase,
    vocalGender: style.vocalGender,
    stylePrompt: style.stylePrompt,
    excludePrompt: buildExcludePrompt(preset),
    mood,
    structure: [...profile.sections],
    structureRationale: profile.rationale,
    producerPrescription: profile.producerPrescription,
    energyArc: profile.rules.energyArc,
    strongestHookTag: profile.strongestHookTag,
    lyricSections: lyricPackage.lyricSections,
    lyrics: lyricPackage.lyrics,
    // Main v2 compatibility alias: this is full Korean copy, not guidance.
    lyricsGuide: lyricPackage.lyrics,
    weirdness,
    styleInfluence,
    shortsHookGuide: null,
  };
}

function buildShortStylePrompt(preset, parent) {
  return [
    `K-Pop ${parent.genre} at ${parent.bpm} BPM in ${parent.key}`,
    preset.productionPhrase,
    preset.instruments.join(', '),
    parent.vocalPhrase,
    `hook-first vertical edit sourced from the parent ${parent.strongestHookTag}`,
    preset.finishingTags.join(', '),
    `curated concept cue: ${parent.concept.englishProductionCue}`,
  ]
    .map((segment) => String(segment ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(', ');
}

/** Derive a Short without random draws or presentation-text parsing. */
function buildShortsTrack({ preset, parent, lane, base }) {
  const shortLyrics = buildShortLyrics(parent);
  const isEmotional = lane === 'emotional';
  const highlightSection = `15-30s ${shortLyrics.sourceSection} killing part — exact parent lyric excerpt`;
  const videoHookIdea = isEmotional
    ? `9:16 close-up moving from ${parent.concept.scene} toward a calm emotional reveal`
    : `9:16 beat-synced motion built around ${parent.concept.scene} and the first hook hit`;
  const captionHashtags = uniqueTokens([
    genreHashtag(parent.genre),
    'Shorts',
    'SunoAI',
    isEmotional ? 'EmotionalMusic' : 'ViralBeat',
  ]);

  return {
    ...base,
    type: 'shorts',
    linkedTrackId: parent.id,
    lane,
    presetId: parent.presetId,
    structureId: parent.structureId,
    structureName: parent.structureName,
    genre: parent.genre,
    title: `${parent.title} · Shorts`,
    titleKo: parent.titleKo,
    titleEn: parent.titleEn,
    concept: cloneConcept(parent.concept),
    bpm: parent.bpm,
    key: parent.key,
    vocalPhrase: parent.vocalPhrase,
    vocalGender: parent.vocalGender,
    stylePrompt: buildShortStylePrompt(preset, parent),
    excludePrompt: parent.excludePrompt,
    mood: parent.mood,
    structure: shortLyrics.lyricSections.map((section) => section.section),
    parentStructure: [...parent.structure],
    structureRationale: `부모 곡의 마지막 ${shortLyrics.sourceSection}에서 제목 훅이 포함된 연속 가사만 추출해 즉시 몰입시키는 숏폼 구조다.`,
    producerPrescription: `부모 곡의 ${parent.bpm} BPM, ${parent.key}, 보컬, Mood, Exclude를 그대로 유지하고 15-30초 안에 훅부터 시작해 여백 없이 [End]로 닫는다.`,
    energyArc: 'immediate parent hook peak -> concise clean ending',
    strongestHookTag: shortLyrics.sourceSection,
    lyricSections: shortLyrics.lyricSections,
    lyrics: shortLyrics.lyrics,
    // Compatibility field deliberately retains the literal duration token.
    lyricsGuide: `15-30s exact excerpt from parent ${shortLyrics.sourceSection}:\n${shortLyrics.lyrics}`,
    weirdness: parent.weirdness,
    styleInfluence: parent.styleInfluence,
    shortsHookGuide: {
      highlightSection,
      sourceSection: shortLyrics.sourceSection,
      sourceTrackId: parent.id,
      excerpt: shortLyrics.excerpt,
      excerptLines: [...shortLyrics.excerptLines],
      videoHookIdea,
      captionHashtags,
    },
  };
}

/**
 * Generate exactly four weeks: eight full v2 packages and eight linked Shorts.
 * Every random concern has a named stream, and every Short is a pure projection
 * of its parent.
 */
export function generateMonthlyPlan(input = {}) {
  const seed = normalizeSeed(input.seed, DEFAULT_SEED);
  const theme = input.theme != null ? String(input.theme) : '';
  const startWednesday = getNextWednesday(input.startWednesday ?? new Date());
  const schedule = buildScheduleDates(startWednesday);
  const emotionalRotation = buildRotation(
    createNamedRng(seed, 'genre-rotation', 'emotional'),
    EMOTIONAL.length,
  );
  const energeticRotation = buildRotation(
    createNamedRng(seed, 'genre-rotation', 'energetic'),
    ENERGETIC.length,
  );

  const mainByWeek = {};
  const presetByWeek = {};
  const tracksById = {};
  let mainOrdinal = 0;

  for (const entry of schedule) {
    if (entry.type !== 'main') continue;
    const weekIndex = entry.week - 1;
    const isWednesday = entry.day === 'Wed';
    const preset = isWednesday
      ? EMOTIONAL[emotionalRotation[weekIndex]]
      : ENERGETIC[energeticRotation[weekIndex]];
    const lane = isWednesday ? 'emotional' : 'energetic';
    const id = `w${entry.week}-${entry.day.toLocaleLowerCase('en-US')}-main`;
    const track = buildMainTrack({
      preset,
      lane,
      theme,
      seed,
      ordinal: mainOrdinal,
      base: {
        id,
        week: entry.week,
        day: entry.day,
        releaseDate: formatISODate(entry.date),
        status: 'Planned',
      },
    });
    mainOrdinal += 1;
    tracksById[id] = track;
    mainByWeek[entry.week] ||= {};
    presetByWeek[entry.week] ||= {};
    mainByWeek[entry.week][entry.day] = track;
    presetByWeek[entry.week][entry.day] = preset;
  }

  const tracks = [];
  for (const entry of schedule) {
    if (entry.type === 'main') {
      tracks.push(tracksById[`w${entry.week}-${entry.day.toLocaleLowerCase('en-US')}-main`]);
      continue;
    }
    const parentDay = entry.day === 'Thu' ? 'Wed' : 'Fri';
    const parent = mainByWeek[entry.week][parentDay];
    const preset = presetByWeek[entry.week][parentDay];
    tracks.push(buildShortsTrack({
      preset,
      parent,
      lane: entry.day === 'Thu' ? 'emotional' : 'energetic',
      base: {
        id: `w${entry.week}-${entry.day.toLocaleLowerCase('en-US')}-shorts`,
        week: entry.week,
        day: entry.day,
        releaseDate: formatISODate(entry.date),
        status: 'Planned',
      },
    }));
  }

  return {
    id: `plan-${seed}-${formatISODate(startWednesday)}`,
    schemaVersion: SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
    generatorVersion: ENGINE_VERSION,
    theme,
    themeCue: sanitizeThemeCue(theme),
    seed,
    startDate: formatISODate(startWednesday),
    // Stable by design so identical explicit inputs are deeply equal.
    createdAt: new Date(0).toISOString(),
    tracks,
  };
}

/** Complete copy-ready Suno package text with legacy-safe fallbacks. */
export function formatCopyAllSettings(track) {
  const lyrics = track.lyrics ?? track.lyricsGuide ?? '';
  const structure = Array.isArray(track.structure)
    ? formatStructure(track.structure)
    : String(track.structure ?? 'Legacy structure not recorded');
  const lines = [
    `Title: ${track.title ?? ''}`,
    `Korean Title: ${track.titleKo ?? 'Legacy title only'}`,
    `English Title: ${track.titleEn ?? 'Legacy title only'}`,
    `Style: ${track.stylePrompt ?? ''}`,
    `Exclude: ${track.excludePrompt ?? ''}`,
    `Mood: ${track.mood ?? ''}`,
    `Lyrics: ${lyrics}`,
    `Structure: ${structure}`,
    `Rationale: ${track.structureRationale ?? 'Legacy plan — not recorded'}`,
    `Prescription: ${track.producerPrescription ?? 'Legacy plan — not recorded'}`,
    `Vocal: ${track.vocalGender ?? ''}`,
    `Vocal Phrase: ${track.vocalPhrase ?? 'Legacy plan — not recorded'}`,
    `BPM: ${track.bpm ?? 'Legacy plan — embedded in Style'}`,
    `Key: ${track.key ?? 'Legacy plan — embedded in Style'}`,
    `Weirdness: ${track.weirdness ?? ''}%`,
    `Style Influence: ${track.styleInfluence ?? ''}%`,
  ];

  if (track.type === 'shorts' && track.shortsHookGuide) {
    const guide = track.shortsHookGuide;
    const hashtags = (guide.captionHashtags || []).map((tag) => `#${tag}`).join(' ');
    lines.push(
      '',
      'Hook Guide:',
      `  Source: ${guide.sourceSection || guide.highlightSection || ''}`,
      `  Exact Excerpt:\n${guide.excerpt || ''}`,
      `  Highlight: ${guide.highlightSection || ''}`,
      `  Video Hook: ${guide.videoHookIdea || ''}`,
      `  Hashtags: ${hashtags}`,
    );
  }

  return lines.join('\n');
}
