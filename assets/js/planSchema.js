// planSchema.js
// Small version boundary shared by storage and JSON import. Missing/explicit v1
// plans remain honest legacy records; v2 is validated without inventing lyrics;
// malformed and future schemas are rejected before reaching the renderer.

import { STRUCTURE_BY_ID } from './structureProfiles.js';
import {
  hasDirectionSyntaxInjection,
  inheritCueForShort,
  inspectLyricSectionDirections,
  normalizeLyricSectionDirections,
  renderLyrics,
  shortEndCue,
} from './sectionMoodEngine.js';

export const CURRENT_SCHEMA_VERSION = 2;
export const LEGACY_SCHEMA_VERSION = 1;

const VALID_TYPES = new Set(['main', 'shorts']);
const VALID_DAYS = new Set(['Wed', 'Thu', 'Fri', 'Sat']);
const VALID_STATUSES = new Set(['Planned', 'Generated', 'Published']);
const VALID_VOCALS = new Set(['Female', 'Male', 'Duet']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isString(value, { nonempty = false } = {}) {
  return typeof value === 'string' && (!nonempty || value.trim().length > 0);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeLineEndings(value) {
  return String(value).replace(/\r\n?/g, '\n');
}

function normalizeV2DirectionMetadata(plan) {
  if (plan.tracks.some((track) =>
    hasDirectionSyntaxInjection(track?.lyricSections))) return null;
  return {
    ...plan,
    tracks: plan.tracks.map((track) => {
      if (!isRecord(track)) return track;
      return {
        ...track,
        lyricSections: normalizeLyricSectionDirections(track.lyricSections),
      };
    }),
  };
}

function hasLegacyTrackShape(track) {
  return isRecord(track)
    && isString(track.id, { nonempty: true })
    && isString(track.title, { nonempty: true })
    && VALID_TYPES.has(track.type)
    && isFiniteNumber(track.week)
    && isString(track.day, { nonempty: true })
    && isString(track.stylePrompt)
    && isString(track.excludePrompt)
    && isString(track.mood)
    && isString(track.lyricsGuide)
    && isString(track.vocalGender)
    && isFiniteNumber(track.weirdness)
    && isFiniteNumber(track.styleInfluence)
    && isString(track.status)
    && isString(track.releaseDate);
}

function hasConceptShape(concept, track) {
  return isRecord(concept)
    && isString(concept.paletteId, { nonempty: true })
    && isString(concept.titleKo, { nonempty: true })
    && isString(concept.titleEn, { nonempty: true })
    && concept.titleKo === track.titleKo
    && concept.titleEn === track.titleEn
    && isString(concept.hookPhrase, { nonempty: true })
    && concept.hookPhrase.includes(track.titleKo)
    && isString(concept.scene, { nonempty: true })
    && isString(concept.emotionalArc, { nonempty: true })
    && Array.isArray(concept.koreanKeywords)
    && isString(concept.englishProductionCue, { nonempty: true });
}

function hasLyricSectionsShape(sections) {
  return Array.isArray(sections)
    && sections.length > 0
    && sections.every((section) => isRecord(section)
      && isString(section.section, { nonempty: true })
      && Array.isArray(section.lines)
      && section.lines.every((line) => isString(line, { nonempty: true })));
}

function expectedVocalTag(vocalGender) {
  if (vocalGender === 'Male') return '[Male singer]';
  if (vocalGender === 'Duet') return '[Female and Male duet]';
  return '[Female singer]';
}

/**
 * Enriched sheets render these tags as directives, so accept only the exact
 * values produced by lyricsEngine. Cue-less v2 plans retain their legacy path.
 */
function hasCanonicalRenderedTags(track) {
  const sections = track.lyricSections;
  const singerTag = expectedVocalTag(track.vocalGender);
  if (!sections.every((section) =>
    section.vocalTag === (section.isVocal ? singerTag : null))) return false;

  if (track.type === 'shorts') {
    return sections.every((section) => section.performanceTag === null);
  }

  const profile = STRUCTURE_BY_ID[track.structureId];
  const contrast = profile?.rules?.vocalContrast;
  if (!contrast) {
    return sections.every((section) => section.performanceTag === null);
  }

  const firstVocalIndex = sections.findIndex((section) => section.isVocal);
  let strongestHookIndex = -1;
  sections.forEach((section, index) => {
    if (section.section === profile.strongestHookTag) strongestHookIndex = index;
  });
  if (firstVocalIndex < 0
    || strongestHookIndex < 0
    || firstVocalIndex === strongestHookIndex) return false;

  return sections.every((section, index) => {
    if (!section.isVocal) return section.performanceTag === null;
    if (index === firstVocalIndex) return section.performanceTag === contrast.soft;
    if (index === strongestHookIndex) return section.performanceTag === contrast.peak;
    return section.performanceTag === null;
  });
}

function expectedEnrichedLyricsGuide(track, renderedLyrics) {
  if (track.type === 'main') return renderedLyrics;
  const sourceSection = track.lyricSections[0]?.section;
  if (!isString(track.strongestHookTag, { nonempty: true })
    || track.strongestHookTag !== sourceSection) return null;
  return `15-30s exact excerpt from parent ${track.strongestHookTag}:\n${renderedLyrics}`;
}

function hasV2TrackShape(track) {
  if (!hasLegacyTrackShape(track)) return false;
  const directionInspection = inspectLyricSectionDirections(track.lyricSections);
  if (!directionInspection.valid) return false;
  if (!VALID_DAYS.has(track.day)
    || !VALID_STATUSES.has(track.status)
    || !Number.isInteger(track.week)
    || track.week < 1
    || track.week > 4
    || track.weirdness < 0
    || track.weirdness > 100
    || track.styleInfluence < 0
    || track.styleInfluence > 100) return false;

  if (!isString(track.genre, { nonempty: true })
    || !isString(track.stylePrompt, { nonempty: true })
    || !isString(track.excludePrompt, { nonempty: true })
    || !isString(track.mood, { nonempty: true })
    || !isString(track.lyricsGuide, { nonempty: true })
    || !isString(track.presetId, { nonempty: true })
    || !isString(track.structureId, { nonempty: true })
    || !STRUCTURE_BY_ID[track.structureId]
    || !isString(track.titleKo, { nonempty: true })
    || !isString(track.titleEn, { nonempty: true })
    || !isFiniteNumber(track.bpm)
    || track.bpm <= 0
    || !isString(track.key, { nonempty: true })
    || !isString(track.vocalPhrase, { nonempty: true })
    || !VALID_VOCALS.has(track.vocalGender)
    || !Array.isArray(track.structure)
    || track.structure.length === 0
    || !track.structure.every((section) => isString(section, { nonempty: true }))
    || !isString(track.structureRationale, { nonempty: true })
    || !isString(track.producerPrescription, { nonempty: true })
    || !isString(track.lyrics, { nonempty: true })
    || !hasLyricSectionsShape(track.lyricSections)
    || track.lyricSections.length !== track.structure.length
    || !track.lyricSections.every((section, index) => section.section === track.structure[index])
    || !hasConceptShape(track.concept, track)) return false;

  if (directionInspection.enriched) {
    if (!hasCanonicalRenderedTags(track)) return false;
    const renderedLyrics = renderLyrics(track.lyricSections);
    const expectedLyricsGuide = expectedEnrichedLyricsGuide(track, renderedLyrics);
    if (expectedLyricsGuide == null
      || normalizeLineEndings(track.lyrics) !== renderedLyrics
      || normalizeLineEndings(track.lyricsGuide) !== expectedLyricsGuide) {
      return false;
    }
  }

  if (track.type === 'main') {
    const canonicalSections = STRUCTURE_BY_ID[track.structureId].sections;
    return track.linkedTrackId == null
      && track.structure.length === canonicalSections.length
      && track.structure.every((section, index) => section === canonicalSections[index]);
  }

  const sourceSection = track.lyricSections[0];
  const endSection = track.lyricSections[1];
  return isString(track.linkedTrackId, { nonempty: true })
    && track.structure.length === 2
    && track.lyricSections.length === 2
    && track.structure[0] === track.shortsHookGuide?.sourceSection
    && track.structure[1] === 'End'
    && sourceSection?.section === track.shortsHookGuide?.sourceSection
    && endSection?.section === 'End'
    && Array.isArray(endSection?.lines)
    && endSection.lines.length === 0
    && isRecord(track.shortsHookGuide)
    && isString(track.shortsHookGuide.excerpt, { nonempty: true })
    && track.shortsHookGuide.excerpt.includes(track.titleKo)
    && Array.isArray(track.shortsHookGuide.excerptLines)
    && track.shortsHookGuide.excerptLines.length >= 2
    && track.shortsHookGuide.excerptLines.length <= 4
    && track.shortsHookGuide.excerptLines.every((line) => isString(line, { nonempty: true }))
    && sourceSection.lines.length === track.shortsHookGuide.excerptLines.length
    && sourceSection.lines.every(
      (line, index) => line === track.shortsHookGuide.excerptLines[index],
    )
    && isString(track.shortsHookGuide.sourceSection, { nonempty: true })
    && isString(track.shortsHookGuide.highlightSection, { nonempty: true })
    && isString(track.shortsHookGuide.videoHookIdea, { nonempty: true })
    && Array.isArray(track.shortsHookGuide.captionHashtags);
}

function strongestHookSection(track) {
  const sections = Array.isArray(track?.lyricSections) ? track.lyricSections : [];
  return sections.find((section) => section.isStrongestHook)
    || [...sections].reverse().find((section) =>
      ['Final Chorus', 'Chorus', 'Hook', 'Drop'].includes(section.section));
}

function isConsecutiveSlice(sourceLines, excerptLines) {
  if (!Array.isArray(sourceLines) || !Array.isArray(excerptLines)) return false;
  if (excerptLines.length < 2 || excerptLines.length > 4) return false;
  for (let start = 0; start <= sourceLines.length - excerptLines.length; start += 1) {
    if (excerptLines.every((line, offset) => line === sourceLines[start + offset])) {
      return true;
    }
  }
  return false;
}

function nextCalendarDay(parentDate, shortDate) {
  const parentTime = Date.parse(`${parentDate}T00:00:00Z`);
  const shortTime = Date.parse(`${shortDate}T00:00:00Z`);
  return Number.isFinite(parentTime)
    && Number.isFinite(shortTime)
    && shortTime - parentTime === 24 * 60 * 60 * 1000;
}

function sameCue(left, right) {
  const fields = ['kind', 'placement', 'text', 'afterLine', 'inheritToShorts', 'shortText'];
  return fields.every((field) =>
    Object.prototype.hasOwnProperty.call(left, field)
      === Object.prototype.hasOwnProperty.call(right, field)
    && left[field] === right[field]);
}

function sameCueList(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((cue, index) => sameCue(cue, right[index]));
}

function validateV2Relationships(plan) {
  if (plan.tracks.length !== 16) return false;
  const ids = new Set(plan.tracks.map((track) => track.id));
  if (ids.size !== plan.tracks.length) return false;

  const directionStates = plan.tracks.map((track) =>
    inspectLyricSectionDirections(track.lyricSections));
  const planIsEnriched = directionStates[0]?.enriched;
  if (!directionStates.every((state) =>
    state.valid && state.enriched === planIsEnriched)) return false;

  const mains = plan.tracks.filter((track) => track.type === 'main');
  const shorts = plan.tracks.filter((track) => track.type === 'shorts');
  if (mains.length !== 8 || shorts.length !== 8) return false;

  const expectedSlots = new Set();
  for (let week = 1; week <= 4; week += 1) {
    expectedSlots.add(`${week}:Wed:main`);
    expectedSlots.add(`${week}:Thu:shorts`);
    expectedSlots.add(`${week}:Fri:main`);
    expectedSlots.add(`${week}:Sat:shorts`);
  }
  const actualSlots = new Set(
    plan.tracks.map((track) => `${track.week}:${track.day}:${track.type}`),
  );
  if (actualSlots.size !== expectedSlots.size
    || [...expectedSlots].some((slot) => !actualSlots.has(slot))) return false;

  const byId = new Map(plan.tracks.map((track) => [track.id, track]));
  return shorts.every((short) => {
    const parent = byId.get(short.linkedTrackId);
    const expectedParentDay = short.day === 'Thu'
      ? 'Wed'
      : short.day === 'Sat' ? 'Fri' : null;
    if (!parent
      || parent.type !== 'main'
      || !expectedParentDay
      || parent.day !== expectedParentDay
      || parent.week !== short.week
      || !nextCalendarDay(parent.releaseDate, short.releaseDate)
      || parent.genre !== short.genre
      || parent.bpm !== short.bpm
      || parent.key !== short.key
      || parent.vocalPhrase !== short.vocalPhrase
      || parent.vocalGender !== short.vocalGender
      || parent.mood !== short.mood
      || parent.excludePrompt !== short.excludePrompt
      || parent.titleKo !== short.titleKo
      || parent.titleEn !== short.titleEn
      || parent.concept.paletteId !== short.concept.paletteId
      || parent.concept.variantId !== short.concept.variantId) return false;

    const source = strongestHookSection(parent);
    if (!source) return false;
    const guide = short.shortsHookGuide;
    const excerptLines = guide.excerptLines;
    const normalizedExcerpt = String(guide.excerpt).replace(/\r\n?|\n/g, '\n').trim();
    const exactExcerpt = excerptLines.join('\n').trim();
    const parentDirectionState = inspectLyricSectionDirections(parent.lyricSections);
    const shortDirectionState = inspectLyricSectionDirections(short.lyricSections);
    if (parentDirectionState.enriched !== shortDirectionState.enriched) return false;

    let directionProjectionMatches = true;
    if (parentDirectionState.enriched) {
      const shortSource = short.lyricSections[0];
      const shortEnd = short.lyricSections[1];
      const expectedHeader = source.shortHeaderDescriptor || source.headerDescriptor;
      const hasExpectedHeader = typeof expectedHeader === 'string';
      const hasActualHeader = Object.prototype.hasOwnProperty.call(
        shortSource,
        'headerDescriptor',
      );
      const expectedCues = source.cues
        .filter((cue) => cue.inheritToShorts === true && cue.placement === 'before-lines')
        .slice(0, 2)
        .map(inheritCueForShort);
      directionProjectionMatches = hasExpectedHeader === hasActualHeader
        && (!hasExpectedHeader || shortSource.headerDescriptor === expectedHeader)
        && !Object.prototype.hasOwnProperty.call(shortSource, 'shortHeaderDescriptor')
        && sameCueList(shortSource.cues, expectedCues)
        && sameCueList(shortEnd.cues, [shortEndCue()]);
    }

    return Boolean(source)
      && source.section === guide.sourceSection
      && isConsecutiveSlice(source.lines, excerptLines)
      && short.lyricSections[0].lines.length === excerptLines.length
      && short.lyricSections[0].lines.every(
        (line, index) => line === excerptLines[index],
      )
      && normalizedExcerpt === exactExcerpt
      && excerptLines.some((line) => line.includes(parent.titleKo))
      && directionProjectionMatches;
  });
}

/** Return a normalized usable plan plus a safe user-facing error code. */
export function inspectPlanSchema(input) {
  if (!isRecord(input)) return { plan: null, error: 'malformed-root', legacy: false };
  const rawVersion = input.schemaVersion;
  if (rawVersion != null && (!Number.isInteger(rawVersion) || rawVersion < 1)) {
    return { plan: null, error: 'invalid-schema-version', legacy: false };
  }
  if (rawVersion > CURRENT_SCHEMA_VERSION) {
    return { plan: null, error: 'future-schema', legacy: false };
  }
  if (!Array.isArray(input.tracks) || input.tracks.length === 0) {
    return { plan: null, error: 'missing-tracks', legacy: rawVersion == null || rawVersion === 1 };
  }

  if (rawVersion == null || rawVersion === LEGACY_SCHEMA_VERSION) {
    if (!input.tracks.every(hasLegacyTrackShape)) {
      return { plan: null, error: 'malformed-legacy-plan', legacy: true };
    }
    return {
      plan: {
        ...input,
        schemaVersion: LEGACY_SCHEMA_VERSION,
        engineVersion: isString(input.engineVersion, { nonempty: true }) ? input.engineVersion : 'legacy-v1',
        legacy: true,
        tracks: input.tracks.map((track) => ({ ...track, legacy: true })),
      },
      error: null,
      legacy: true,
    };
  }

  const normalizedInput = normalizeV2DirectionMetadata(input);
  if (!normalizedInput
    || !isString(normalizedInput.engineVersion, { nonempty: true })
    || !isString(normalizedInput.id, { nonempty: true })
    || !isString(normalizedInput.theme)
    || !isFiniteNumber(normalizedInput.seed)
    || !isString(normalizedInput.startDate, { nonempty: true })
    || !normalizedInput.tracks.every(hasV2TrackShape)
    || !validateV2Relationships(normalizedInput)) {
    return { plan: null, error: 'malformed-v2-plan', legacy: false };
  }

  return { plan: normalizedInput, error: null, legacy: false };
}

export function normalizePlan(input) {
  return inspectPlanSchema(input).plan;
}

export function isValidPlan(input) {
  return Boolean(normalizePlan(input));
}

export function isLegacyPlan(input) {
  return Boolean(input) && (input.legacy === true || input.schemaVersion !== CURRENT_SCHEMA_VERSION);
}
