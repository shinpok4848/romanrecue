// sectionMoodEngine.js
// Pure section-aware direction profiles, normalization, rendering, and validation.
// This module owns presentation-safe English cue metadata; Korean lyric lines stay
// untouched and no caller needs to parse the flattened Suno Style prompt.

export const CUE_KINDS = Object.freeze([
  'performance',
  'arrangement',
  'production',
  'transition',
  'termination',
]);

export const CUE_PLACEMENTS = Object.freeze(['before-lines', 'after-line']);

export const DIRECTION_TEXT_LIMITS = Object.freeze({
  descriptor: 90,
  cue: 135,
  short: 105,
});

const CUE_KIND_SET = new Set(CUE_KINDS);
const CUE_PLACEMENT_SET = new Set(CUE_PLACEMENTS);
const CUE_KEYS = new Set([
  'kind',
  'placement',
  'text',
  'afterLine',
  'inheritToShorts',
  'shortText',
]);

export const NON_VOCAL_SECTIONS = Object.freeze([
  'Interlude',
  'Instrumental',
  'Solo',
  'Guitar Solo',
  'Key Change',
  'End',
  'Fade Out',
]);

const NON_VOCAL_SET = new Set(NON_VOCAL_SECTIONS);
const FORBIDDEN_WRAPPERS = /[\p{Ps}\p{Pe}<>]/gu;
const DIRECTION_SYNTAX_INJECTION = /[\r\n\u2028\u2029\p{Ps}\p{Pe}<>]/u;
const CONTROL_OR_LINE_SEPARATOR = /[\p{Cc}\p{Cf}\u2028\u2029]/gu;
const LYRIC_LINE_INJECTION = /[\p{Cc}\p{Cf}\u2028\u2029\p{Ps}\p{Pe}<>]/u;
const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/u;
const LATIN_LETTER = /[A-Za-z]/u;

function codePointLength(value) {
  return Array.from(value).length;
}

function truncateAtWord(value, maxLength) {
  const points = Array.from(value);
  if (points.length <= maxLength) return value;
  const clipped = points.slice(0, maxLength + 1).join('');
  const boundary = clipped.lastIndexOf(' ');
  const cut = boundary >= Math.floor(maxLength * 0.65)
    ? clipped.slice(0, boundary)
    : points.slice(0, maxLength).join('');
  return cut.replace(/[,:;\-–—]+$/u, '').trim();
}

function canonicalDirectionText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(CONTROL_OR_LINE_SEPARATOR, ' ')
    .replace(FORBIDDEN_WRAPPERS, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Canonicalize imported direction text without touching Korean lyric lines.
 * Bracket-like wrappers and parentheses are removed because renderLyrics owns
 * the only presentation wrappers. Import normalization retains a hard cap.
 */
export function normalizeDirectionText(value, maxLength = DIRECTION_TEXT_LIMITS.cue) {
  return truncateAtWord(canonicalDirectionText(value), maxLength);
}

function completeDirectionText(value, maxLength, label) {
  const candidates = Array.isArray(value) ? value : [value];
  for (const candidate of candidates) {
    const normalized = canonicalDirectionText(candidate);
    if (normalized && codePointLength(normalized) <= maxLength) return normalized;
  }
  throw new RangeError(`No complete ${label} fits within ${maxLength} characters`);
}

function isCanonicalEnglishDirection(value, maxLength) {
  return typeof value === 'string'
    && value.length > 0
    && codePointLength(value) <= maxLength
    && value === normalizeDirectionText(value, maxLength)
    && LATIN_LETTER.test(value)
    && !HANGUL.test(value);
}

function directionDescriptor(value) {
  const normalized = completeDirectionText(
    value,
    DIRECTION_TEXT_LIMITS.descriptor,
    'section descriptor',
  );
  return `${normalized.charAt(0).toLocaleUpperCase('en-US')}${normalized.slice(1)}`;
}

function directionCue(kind, text, options = {}) {
  const cue = {
    kind,
    placement: options.placement || 'before-lines',
    text: completeDirectionText(text, DIRECTION_TEXT_LIMITS.cue, `${kind} cue`),
  };
  if (cue.placement === 'after-line') cue.afterLine = options.afterLine;
  if (options.inheritToShorts === true) cue.inheritToShorts = true;
  if (options.shortText) {
    cue.shortText = completeDirectionText(
      options.shortText,
      DIRECTION_TEXT_LIMITS.short,
      `${kind} Short cue`,
    );
  }
  return cue;
}

function normalizedComparable(value) {
  return normalizeDirectionText(value, DIRECTION_TEXT_LIMITS.cue).toLocaleLowerCase('en-US');
}

export function isNonVocalSection(section) {
  return NON_VOCAL_SET.has(section);
}

export function sectionHasDirectionMetadata(section) {
  if (!section || typeof section !== 'object' || Array.isArray(section)) return false;
  return Object.prototype.hasOwnProperty.call(section, 'headerDescriptor')
    || Object.prototype.hasOwnProperty.call(section, 'shortHeaderDescriptor')
    || Object.prototype.hasOwnProperty.call(section, 'cues');
}

/** Reject wrapper or multiline syntax before benign import normalization. */
export function hasDirectionSyntaxInjection(sections) {
  if (!Array.isArray(sections)) return false;
  return sections.some((section) => {
    const values = [section?.headerDescriptor, section?.shortHeaderDescriptor];
    if (Array.isArray(section?.cues)) {
      for (const cue of section.cues) values.push(cue?.text, cue?.shortText);
    }
    return values.some((value) =>
      typeof value === 'string'
      && DIRECTION_SYNTAX_INJECTION.test(value.normalize('NFKC')));
  });
}

/** Canonicalize benign imported metadata on a clone, never lyric lines. */
export function normalizeLyricSectionDirections(sections) {
  if (!Array.isArray(sections)) return sections;
  return sections.map((section) => {
    if (!section || typeof section !== 'object' || Array.isArray(section)) return section;
    const normalized = { ...section };
    if (typeof section.headerDescriptor === 'string') {
      normalized.headerDescriptor = normalizeDirectionText(
        section.headerDescriptor,
        DIRECTION_TEXT_LIMITS.descriptor,
      );
    }
    if (typeof section.shortHeaderDescriptor === 'string') {
      normalized.shortHeaderDescriptor = normalizeDirectionText(
        section.shortHeaderDescriptor,
        DIRECTION_TEXT_LIMITS.descriptor,
      );
    }
    if (Array.isArray(section.cues)) {
      normalized.cues = section.cues.map((cue) => {
        if (!cue || typeof cue !== 'object' || Array.isArray(cue)) return cue;
        const normalizedCue = { ...cue };
        if (typeof cue.text === 'string') {
          normalizedCue.text = normalizeDirectionText(cue.text, DIRECTION_TEXT_LIMITS.cue);
        }
        if (typeof cue.shortText === 'string') {
          normalizedCue.shortText = normalizeDirectionText(
            cue.shortText,
            DIRECTION_TEXT_LIMITS.short,
          );
        }
        return normalizedCue;
      });
    }
    return normalized;
  });
}

function isValidCue(cue, section) {
  if (!cue || typeof cue !== 'object' || Array.isArray(cue)) return false;
  if (Object.keys(cue).some((key) => !CUE_KEYS.has(key))
    || !CUE_KIND_SET.has(cue.kind)
    || !CUE_PLACEMENT_SET.has(cue.placement)
    || !isCanonicalEnglishDirection(cue.text, DIRECTION_TEXT_LIMITS.cue)) return false;

  if (Object.prototype.hasOwnProperty.call(cue, 'inheritToShorts')
    && typeof cue.inheritToShorts !== 'boolean') return false;
  if (Object.prototype.hasOwnProperty.call(cue, 'shortText')) {
    if (cue.inheritToShorts !== true
      || !isCanonicalEnglishDirection(cue.shortText, DIRECTION_TEXT_LIMITS.short)) return false;
  }

  const lines = Array.isArray(section.lines) ? section.lines : [];
  const nonVocal = isNonVocalSection(section.section);
  if (cue.placement === 'before-lines') {
    if (Object.prototype.hasOwnProperty.call(cue, 'afterLine')) return false;
  } else if (cue.kind !== 'transition'
    || nonVocal
    || !Number.isInteger(cue.afterLine)
    || cue.afterLine < 1
    || cue.afterLine >= lines.length) return false;

  const cueTexts = [cue.text, cue.shortText]
    .filter(Boolean)
    .map(normalizedComparable);
  return lines.every((line) => !cueTexts.includes(normalizedComparable(line)));
}

/**
 * Validate optional additive direction metadata. Cue-less v2 sections remain
 * compatible; once any section is enriched, every section must carry 1-3 cues.
 */
export function inspectLyricSectionDirections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { valid: false, enriched: false };
  }
  const enrichedFlags = sections.map(sectionHasDirectionMetadata);
  const enriched = enrichedFlags.some(Boolean);
  if (!enriched) return { valid: true, enriched: false };
  if (!enrichedFlags.every(Boolean)) return { valid: false, enriched: true };

  const valid = sections.every((section) => {
    const lines = Array.isArray(section?.lines) ? section.lines : [];
    const nonVocal = isNonVocalSection(section?.section);
    if (!Array.isArray(section?.cues)
      || section.cues.length < 1
      || section.cues.length > 3
      || typeof section.isVocal !== 'boolean'
      || section.isVocal !== !nonVocal
      || (nonVocal && lines.length !== 0)
      || (!nonVocal && lines.length === 0)
      || (!nonVocal && lines.some((line) =>
        !HANGUL.test(String(line))
        || String(line) !== String(line).trim()
        || LYRIC_LINE_INJECTION.test(String(line).normalize('NFKC'))))
      || !section.cues.every((cue) => isValidCue(cue, section))) return false;

    if (Object.prototype.hasOwnProperty.call(section, 'headerDescriptor')
      && !isCanonicalEnglishDirection(
        section.headerDescriptor,
        DIRECTION_TEXT_LIMITS.descriptor,
      )) return false;
    if (Object.prototype.hasOwnProperty.call(section, 'shortHeaderDescriptor')
      && !isCanonicalEnglishDirection(
        section.shortHeaderDescriptor,
        DIRECTION_TEXT_LIMITS.descriptor,
      )) return false;
    return true;
  });

  return { valid, enriched: true };
}

/** Render section descriptors and cues; all text remains plain text. */
export function renderLyrics(lyricSections) {
  const sections = Array.isArray(lyricSections) ? lyricSections : [];
  return sections.map((item) => {
    const descriptor = item?.headerDescriptor
      ? normalizeDirectionText(item.headerDescriptor, DIRECTION_TEXT_LIMITS.descriptor)
      : '';
    const header = `[${String(item?.section ?? '')}${descriptor ? `: ${descriptor}` : ''}]`;
    const lines = [header];
    if (item?.vocalTag) lines.push(String(item.vocalTag));
    if (item?.performanceTag) lines.push(`[${String(item.performanceTag)}]`);

    const cues = Array.isArray(item?.cues) ? item.cues : [];
    for (const cue of cues) {
      if (cue?.placement !== 'before-lines') continue;
      const text = normalizeDirectionText(cue.text, DIRECTION_TEXT_LIMITS.cue);
      if (text) lines.push(`(${text})`);
    }

    const lyricLines = Array.isArray(item?.lines) ? item.lines : [];
    lyricLines.forEach((line, index) => {
      lines.push(String(line));
      for (const cue of cues) {
        if (cue?.placement !== 'after-line' || cue.afterLine !== index + 1) continue;
        const text = normalizeDirectionText(cue.text, DIRECTION_TEXT_LIMITS.cue);
        if (text) lines.push(`(${text})`);
      }
    });
    return lines.join('\n');
  }).join('\n\n');
}

// Every stable preset owns a structured performance vocabulary and explicit
// instrument-role indices. Instruments are always selected from the effective
// preset passed by the caller, including palette adaptations.
const VOCAL_DELIVERY_ROLES = Object.freeze([
  'opening',
  'verse',
  'preHookBuild',
  'standardHook',
  'peakHook',
  'bridge',
  'outro',
]);

function roleDeliveries(deliveries) {
  if (!deliveries || typeof deliveries !== 'object' || Array.isArray(deliveries)
    || Object.keys(deliveries).length !== VOCAL_DELIVERY_ROLES.length
    || VOCAL_DELIVERY_ROLES.some((role) =>
      typeof deliveries[role] !== 'string' || !deliveries[role].trim())) {
    throw new TypeError('Every vocal delivery profile must define all section roles');
  }
  return Object.freeze({ ...deliveries });
}

export const PRESET_DIRECTION_PROFILES = Object.freeze({
  'nostalgic-90s-rnb': {
    rhythm: 'laid-back neo-soul pocket',
    harmony: 'lush natural background harmonies',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'intimate, conversational, measured long-breath phrasing',
        verse: 'intimate, conversational, controlled long-breath storytelling',
        preHookBuild: 'intimate long-breath phrasing with gradually widening intensity',
        standardHook: 'open, soulful long-breath phrasing with restrained melisma',
        peakHook: 'powerful, soulful long-breath phrasing with rich harmony',
        bridge: 'emotionally open, conversational soul phrasing',
        outro: 'intimate, restrained long-breath phrasing',
      }),
      Female: roleDeliveries({
        opening: 'intimate, velvety, measured melismatic phrasing',
        verse: 'intimate, velvety, controlled storytelling with gentle melisma',
        preHookBuild: 'velvety phrasing with gradually widening intensity',
        standardHook: 'open, soulful, velvety phrasing with measured melisma',
        peakHook: 'powerful, velvety soul phrasing with expressive melisma',
        bridge: 'emotionally open, velvety soul phrasing',
        outro: 'intimate, restrained, velvety phrasing',
      }),
    },
    instruments: { opening: [0], verse: [0], verseLift: [1], rise: [2, 0], hook: [0, 1, 2], bridge: [1, 0], outro: [0, 2], solo: [0, 1] },
  },
  'acoustic-indie-funk': {
    rhythm: 'syncopated acoustic funk groove',
    harmony: 'natural human choir with raw organic harmony',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'warm, conversational, measured rhythmic phrasing',
        verse: 'warm, controlled, highly rhythmic storytelling',
        preHookBuild: 'warm rhythmic phrasing with playful gathering tension',
        standardHook: 'open, strong, highly rhythmic phrasing',
        peakHook: 'energetic, full-hearted, highly rhythmic phrasing',
        bridge: 'emotionally open, conversational rhythmic phrasing',
        outro: 'warm, restrained, conversational phrasing',
      }),
      Female: roleDeliveries({
        opening: 'warm, playful, measured syncopated phrasing',
        verse: 'warm, controlled, playful syncopated storytelling',
        preHookBuild: 'playful syncopated phrasing with gathering tension',
        standardHook: 'open, strong, playful syncopated phrasing',
        peakHook: 'energetic, full-hearted, syncopated phrasing',
        bridge: 'emotionally open, playful syncopated phrasing',
        outro: 'warm, restrained, playful phrasing',
      }),
    },
    instruments: { opening: [0, 2], verse: [0], verseLift: [1], rise: [2, 1], hook: [0, 1, 2], bridge: [1, 0], outro: [0, 2], solo: [0, 1] },
  },
  'warm-acoustic-folk': {
    rhythm: 'gentle acoustic folk pulse',
    harmony: 'organic acoustic choir with clean natural voices',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'soft, breathy, cheerful encouraging phrasing',
        verse: 'breathy, controlled, encouraging storytelling',
        preHookBuild: 'encouraging phrasing with a gradually opening register',
        standardHook: 'open, cheerful, encouraging sing-along phrasing',
        peakHook: 'strong, full-hearted, encouraging sing-along phrasing',
        bridge: 'emotionally open, breathy, sincere phrasing',
        outro: 'soft, restrained, encouraging phrasing',
      }),
      Male: roleDeliveries({
        opening: 'soft, breathy, gentle encouraging phrasing',
        verse: 'breathy, controlled, gentle storytelling',
        preHookBuild: 'gentle encouraging phrasing with a gradually opening register',
        standardHook: 'open, warm, encouraging sing-along phrasing',
        peakHook: 'strong, full-hearted, encouraging sing-along phrasing',
        bridge: 'emotionally open, breathy, gentle phrasing',
        outro: 'soft, restrained, gentle encouraging phrasing',
      }),
    },
    instruments: { opening: [0, 1], verse: [0], verseLift: [2], rise: [1, 2], hook: [0, 1, 2], bridge: [0, 2], outro: [0, 1], solo: [0, 2] },
  },
  'cinematic-ballad': {
    rhythm: 'widescreen cinematic ballad arc',
    harmony: 'lush cinematic vocal harmonies',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'emotive, fragile whisper-close phrasing',
        verse: 'emotive, intimate, controlled phrasing',
        preHookBuild: 'emotive phrasing with a gradually widening register',
        standardHook: 'emotionally open, controlled cinematic phrasing',
        peakHook: 'emotive, controlled soaring belt phrasing',
        bridge: 'deep, resonant, emotionally open phrasing',
        outro: 'soft, restrained, resolved phrasing',
      }),
      Male: roleDeliveries({
        opening: 'emotive, restrained whisper-close phrasing',
        verse: 'emotive, restrained, controlled phrasing',
        preHookBuild: 'emotive phrasing with a gradually widening register',
        standardHook: 'emotionally open, controlled cinematic phrasing',
        peakHook: 'powerful, controlled soaring belt phrasing',
        bridge: 'deep, resonant, emotionally open phrasing',
        outro: 'soft, restrained, resolved phrasing',
      }),
    },
    phraseContexts: [
      {
        terms: ['determined', 'uplifting'],
        deliveryByRole: roleDeliveries({
          opening: 'clear, determined whisper-close phrasing',
          verse: 'clear, grounded, controlled phrasing',
          preHookBuild: 'determined phrasing with a steadily widening register',
          standardHook: 'open, uplifting, controlled phrasing',
          peakHook: 'clear, controlled uplifting belt phrasing',
          bridge: 'deep, resolute, emotionally open phrasing',
          outro: 'assured, warm, restrained phrasing',
        }),
      },
      {
        terms: ['grounded', 'resolve'],
        deliveryByRole: roleDeliveries({
          opening: 'grounded, resolute whisper-close phrasing',
          verse: 'grounded, resolute, controlled phrasing',
          preHookBuild: 'resolute phrasing with a steadily widening register',
          standardHook: 'open, determined, controlled phrasing',
          peakHook: 'grounded, controlled uplifting belt phrasing',
          bridge: 'deep, resolute, emotionally open phrasing',
          outro: 'grounded, assured, restrained phrasing',
        }),
      },
    ],
    instruments: { opening: [0], verse: [0], verseLift: [1], rise: [1, 3], hook: [0, 1, 2], bridge: [0, 1], outro: [0, 1], solo: [1, 2] },
  },
  'city-pop': {
    rhythm: 'breezy city-pop pocket',
    harmony: 'clean layered backing vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'silky, breezy, measured legato phrasing',
        verse: 'silky, controlled, breezy legato storytelling',
        preHookBuild: 'silky legato phrasing with gradually brightening intensity',
        standardHook: 'open, strong, silky legato phrasing',
        peakHook: 'radiant, confident, silky legato phrasing',
        bridge: 'emotionally open, silky legato phrasing',
        outro: 'soft, restrained, silky legato phrasing',
      }),
      Male: roleDeliveries({
        opening: 'smooth, measured night-drive phrasing',
        verse: 'smooth, controlled, nostalgic night-drive storytelling',
        preHookBuild: 'smooth phrasing with gradually brightening intensity',
        standardHook: 'open, strong, smooth night-drive phrasing',
        peakHook: 'radiant, confident, smooth night-drive phrasing',
        bridge: 'emotionally open, smooth nostalgic phrasing',
        outro: 'soft, restrained, smooth night-drive phrasing',
      }),
    },
    instruments: { opening: [0, 2], verse: [0], verseLift: [1], rise: [3, 1], hook: [0, 1, 2], bridge: [0, 3], outro: [0, 2], solo: [2, 0] },
  },
  'lofi-bedroom-vocal': {
    rhythm: 'unhurried lo-fi pocket',
    harmony: 'soft close-miked harmony doubles',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'soft, hushed, intimate phrasing',
        verse: 'soft, intimate, controlled phrasing',
        preHookBuild: 'soft intimate phrasing with a gently opening register',
        standardHook: 'warm, open, intimate phrasing',
        peakHook: 'softly emphatic, warm, intimate phrasing',
        bridge: 'emotionally open, hushed, intimate phrasing',
        outro: 'soft, stripped, restrained intimate phrasing',
      }),
      Male: roleDeliveries({
        opening: 'soft, half-spoken, intimate phrasing',
        verse: 'soft, half-spoken, controlled phrasing',
        preHookBuild: 'half-spoken phrasing with a gently opening register',
        standardHook: 'warm, open, intimate phrasing',
        peakHook: 'softly emphatic, warm, intimate phrasing',
        bridge: 'emotionally open, half-spoken intimate phrasing',
        outro: 'soft, stripped, restrained half-spoken phrasing',
      }),
    },
    instruments: { opening: [0, 3], verse: [0], verseLift: [1], rise: [2, 0], hook: [0, 1, 2], bridge: [1, 0], outro: [0, 3], solo: [0, 1] },
  },
  'airy-indie-pop': {
    rhythm: 'airy indie-pop pulse',
    harmony: 'clean layered backing vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'bright, heartfelt, measured airy phrasing',
        verse: 'bright, heartfelt, controlled airy storytelling',
        preHookBuild: 'heartfelt airy phrasing with gradually widening intensity',
        standardHook: 'open, strong, bright airy phrasing',
        peakHook: 'radiant, full-hearted, bright airy phrasing',
        bridge: 'emotionally open, heartfelt airy phrasing',
        outro: 'soft, restrained, heartfelt airy phrasing',
      }),
      Male: roleDeliveries({
        opening: 'bright, heartfelt, measured airy phrasing',
        verse: 'bright, heartfelt, controlled airy storytelling',
        preHookBuild: 'heartfelt airy phrasing with gradually widening intensity',
        standardHook: 'open, strong, bright airy phrasing',
        peakHook: 'radiant, full-hearted, bright airy phrasing',
        bridge: 'emotionally open, heartfelt airy phrasing',
        outro: 'soft, restrained, heartfelt airy phrasing',
      }),
    },
    instruments: { opening: [0, 3], verse: [0], verseLift: [1], rise: [2, 3], hook: [0, 1, 2], bridge: [1, 0], outro: [0, 3], solo: [0, 1] },
  },
  'modern-k-ballad': {
    rhythm: 'restrained K-ballad rise',
    harmony: 'lush controlled ballad harmonies',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'pristine whisper-close phrasing',
        verse: 'pristine, intimate, controlled phrasing',
        preHookBuild: 'pristine phrasing with a gradually widening register',
        standardHook: 'emotionally open, controlled resonant phrasing',
        peakHook: 'pristine, controlled soaring belt phrasing',
        bridge: 'deep, resonant, emotionally open phrasing',
        outro: 'pristine, soft, restrained phrasing',
      }),
      Male: roleDeliveries({
        opening: 'pristine whisper-close phrasing',
        verse: 'pristine, intimate, controlled phrasing',
        preHookBuild: 'pristine phrasing with a gradually widening register',
        standardHook: 'emotionally open, controlled resonant phrasing',
        peakHook: 'pristine, controlled soaring belt phrasing',
        bridge: 'deep, resonant, emotionally open phrasing',
        outro: 'pristine, soft, restrained phrasing',
      }),
    },
    phraseContexts: [
      {
        terms: ['grounded', 'resolute'],
        deliveryByRole: roleDeliveries({
          opening: 'pristine, grounded, resolute whisper-close phrasing',
          verse: 'pristine, grounded, controlled phrasing',
          preHookBuild: 'resolute phrasing with a steadily widening register',
          standardHook: 'open, determined, controlled uplifting phrasing',
          peakHook: 'pristine, controlled uplifting belt phrasing',
          bridge: 'deep, resolute, emotionally open phrasing',
          outro: 'pristine, grounded, assured restrained phrasing',
        }),
      },
      {
        terms: ['determined', 'uplifting'],
        deliveryByRole: roleDeliveries({
          opening: 'clear, determined whisper-close phrasing',
          verse: 'clear, determined, controlled phrasing',
          preHookBuild: 'determined phrasing with a steadily widening register',
          standardHook: 'open, uplifting, controlled phrasing',
          peakHook: 'clear, controlled uplifting belt phrasing',
          bridge: 'deep, determined, emotionally open phrasing',
          outro: 'clear, assured, restrained phrasing',
        }),
      },
    ],
    instruments: { opening: [0], verse: [0], verseLift: [1], rise: [2, 3], hook: [0, 1, 3], bridge: [1, 0], outro: [0, 1], solo: [0, 1] },
  },
  'midnight-jazz-swing': {
    rhythm: 'buoyant live swing pocket',
    harmony: 'natural call-and-response vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'smoky, clean, relaxed swing phrasing',
        verse: 'smoky, clean, controlled storytelling with natural swing',
        preHookBuild: 'smoky, clean phrasing with gathering swing tension',
        standardHook: 'open, strong, naturally swung phrasing',
        peakHook: 'full-bodied, expressive, naturally swung phrasing',
        bridge: 'emotionally open, smoky jazz phrasing',
        outro: 'soft, restrained, smoky swing phrasing',
      }),
      Male: roleDeliveries({
        opening: 'warm, agile, relaxed conversational swing phrasing',
        verse: 'warm, agile, controlled conversational storytelling',
        preHookBuild: 'agile conversational phrasing with gathering swing tension',
        standardHook: 'open, strong, agile swing phrasing',
        peakHook: 'full-bodied, expressive, agile swing phrasing',
        bridge: 'emotionally open, conversational jazz phrasing',
        outro: 'soft, restrained, warm swing phrasing',
      }),
    },
    instruments: { opening: [1, 2], verse: [2], verseLift: [0], rise: [1, 0], hook: [0, 1, 2], bridge: [2, 0], outro: [2, 1], solo: [2, 3] },
  },
  'edm-hiphop-festival': {
    rhythm: 'staccato festival hip-hop drive',
    harmony: 'tight rhythmic chant stack',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'energetic, clipped rap phrasing',
        verse: 'energetic, controlled rap flow with rhythmic staccato diction',
        preHookBuild: 'accelerating staccato rap phrasing',
        standardHook: 'strong rhythmic chant delivery with crisp staccato attack',
        peakHook: 'explosive festival chant delivery with crisp staccato attack',
        bridge: 'emotionally open rhythmic rap phrasing with a reset cadence',
        outro: 'stripped, controlled rap phrasing',
      }),
      Female: roleDeliveries({
        opening: 'fierce, clipped rap phrasing',
        verse: 'fierce, controlled rap flow with rhythmic staccato diction',
        preHookBuild: 'accelerating fierce rap phrasing',
        standardHook: 'strong rhythmic chant delivery with crisp staccato attack',
        peakHook: 'explosive festival chant delivery with crisp staccato attack',
        bridge: 'emotionally open fierce rap phrasing with a reset cadence',
        outro: 'stripped, controlled fierce rap phrasing',
      }),
    },
    instruments: { opening: [1, 2], verse: [0], verseLift: [1], rise: [1, 0], hook: [0, 1, 2], bridge: [0, 2], outro: [1, 0], solo: [2, 0] },
  },
  'neon-synthwave': {
    rhythm: 'driving retro pulse',
    harmony: 'clean layered neon backing vocals',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'confident, measured neon-night phrasing',
        verse: 'confident, controlled driving neon-night phrasing',
        preHookBuild: 'driving neon-night phrasing with gradually widening intensity',
        standardHook: 'open, strong, confident neon-night phrasing',
        peakHook: 'powerful, expansive, confident neon-night phrasing',
        bridge: 'emotionally open, confident neon-night phrasing',
        outro: 'restrained, calm neon-night phrasing',
      }),
      Female: roleDeliveries({
        opening: 'confident, measured neon-night phrasing',
        verse: 'confident, controlled driving neon-night phrasing',
        preHookBuild: 'driving neon-night phrasing with gradually widening intensity',
        standardHook: 'open, strong, confident neon-night phrasing',
        peakHook: 'confident, soaring neon-night phrasing',
        bridge: 'emotionally open, confident neon-night phrasing',
        outro: 'restrained, calm neon-night phrasing',
      }),
    },
    instruments: { opening: [3, 1], verse: [3], verseLift: [2], rise: [1, 2], hook: [0, 1, 2], bridge: [3, 0], outro: [3, 1], solo: [0, 3] },
  },
  'festival-dance-pop': {
    rhythm: 'four-on-the-floor dance-pop drive',
    harmony: 'clean layered festival backing vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'bright, infectious, measured punchy topline phrasing',
        verse: 'bright, controlled, rhythmic punchy topline phrasing',
        preHookBuild: 'punchy topline phrasing with crisp gathering intensity',
        standardHook: 'open, strong, infectious punchy topline phrasing',
        peakHook: 'powerful, infectious, punchy topline phrasing',
        bridge: 'emotionally open, bright rhythmic phrasing',
        outro: 'restrained, bright, clean topline phrasing',
      }),
      Male: roleDeliveries({
        opening: 'bright, infectious, measured punchy topline phrasing',
        verse: 'bright, controlled, rhythmic punchy topline phrasing',
        preHookBuild: 'punchy topline phrasing with crisp gathering intensity',
        standardHook: 'open, strong, infectious punchy topline phrasing',
        peakHook: 'powerful, infectious, punchy topline phrasing',
        bridge: 'emotionally open, bright rhythmic phrasing',
        outro: 'restrained, bright, clean topline phrasing',
      }),
    },
    instruments: { opening: [2, 1], verse: [2], verseLift: [3], rise: [1, 3], hook: [0, 1, 3], bridge: [2, 0], outro: [2, 1], solo: [2, 0] },
  },
  'analog-nu-disco': {
    rhythm: 'buoyant analog disco groove',
    harmony: 'warm natural call-and-response vocals',
    deliveryByGender: {
      Duet: roleDeliveries({
        opening: 'warm, natural, measured call-and-response phrasing',
        verse: 'warm, controlled line-trading with groovy swagger',
        preHookBuild: 'tightening call-and-response phrasing with gathering lift',
        standardHook: 'open, strong call-and-response phrasing with groovy swagger',
        peakHook: 'jubilant, unified call-and-response phrasing with groovy swagger',
        bridge: 'emotionally open, unified duet phrasing',
        outro: 'soft, restrained alternating duet phrasing',
      }),
      Female: roleDeliveries({
        opening: 'warm, confident, measured disco phrasing',
        verse: 'warm, controlled disco storytelling with groovy swagger',
        preHookBuild: 'confident disco phrasing with gathering lift',
        standardHook: 'open, strong disco phrasing with groovy swagger',
        peakHook: 'jubilant, confident disco phrasing with groovy swagger',
        bridge: 'emotionally open, warm confident disco phrasing',
        outro: 'soft, restrained disco phrasing',
      }),
    },
    instruments: { opening: [0, 3], verse: [0], verseLift: [2], rise: [1, 3], hook: [0, 1, 2], bridge: [2, 0], outro: [0, 3], solo: [0, 1] },
  },
  'modern-electro-pop': {
    rhythm: 'crisp electro-pop syncopation',
    harmony: 'clean layered backing vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'punchy, catchy, measured rhythmic phrasing',
        verse: 'punchy, controlled, rhythmic phrasing',
        preHookBuild: 'crisp rhythmic phrasing with gathering syncopation',
        standardHook: 'open, strong, catchy rhythmic phrasing',
        peakHook: 'powerful, catchy, rhythmic phrasing',
        bridge: 'emotionally open, punchy melodic phrasing',
        outro: 'restrained, clean rhythmic phrasing',
      }),
      Male: roleDeliveries({
        opening: 'punchy, catchy, measured rhythmic phrasing',
        verse: 'punchy, controlled, rhythmic phrasing',
        preHookBuild: 'crisp rhythmic phrasing with gathering syncopation',
        standardHook: 'open, strong, catchy rhythmic phrasing',
        peakHook: 'powerful, catchy, rhythmic phrasing',
        bridge: 'emotionally open, punchy melodic phrasing',
        outro: 'restrained, clean rhythmic phrasing',
      }),
    },
    instruments: { opening: [2, 1], verse: [1], verseLift: [0], rise: [1, 0], hook: [0, 1, 2], bridge: [0, 2], outro: [2, 1], solo: [2, 0] },
  },
  'stadium-rock-band': {
    rhythm: 'driving live rock pulse',
    harmony: 'raw live gang vocals',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'powerful, measured clean-grit phrasing',
        verse: 'controlled clean-grit storytelling phrasing',
        preHookBuild: 'clean-grit phrasing with rising power',
        standardHook: 'open, strong, anthemic clean-grit phrasing',
        peakHook: 'powerful anthemic belt phrasing with clean grit',
        bridge: 'emotionally open clean-grit phrasing',
        outro: 'restrained clean-grit phrasing',
      }),
      Female: roleDeliveries({
        opening: 'powerful, measured clean-grit phrasing',
        verse: 'controlled clean-grit storytelling phrasing',
        preHookBuild: 'clean-grit phrasing with rising power',
        standardHook: 'open, strong, anthemic clean-grit phrasing',
        peakHook: 'powerful anthemic belt phrasing with clean grit',
        bridge: 'emotionally open clean-grit phrasing',
        outro: 'restrained clean-grit phrasing',
      }),
    },
    instruments: { opening: [1, 2], verse: [0], verseLift: [3], rise: [2, 1], hook: [0, 2, 3], bridge: [3, 0], outro: [0, 2], solo: [0, 3] },
  },
  'seoul-night-trap': {
    rhythm: 'precise triplet trap pocket',
    harmony: 'compact rhythmic chant response',
    deliveryByGender: {
      Male: roleDeliveries({
        opening: 'dry, precise, spoken-tag phrasing',
        verse: 'dry, precise, controlled conversational rap phrasing',
        preHookBuild: 'dry, precise rap phrasing with a tightening cadence',
        standardHook: 'strong, compact melodic-hook phrasing with a rhythmic chant response',
        peakHook: 'forceful melodic-hook phrasing with a focused chant response',
        bridge: 'emotionally open rap-to-melodic phrasing with a changed cadence',
        outro: 'stripped, controlled conversational rap phrasing',
      }),
      Female: roleDeliveries({
        opening: 'dry, agile, confident spoken-tag phrasing',
        verse: 'dry, agile, controlled confident rap phrasing',
        preHookBuild: 'dry, agile rap phrasing with a tightening cadence',
        standardHook: 'strong, compact melodic-hook phrasing with a rhythmic chant response',
        peakHook: 'forceful melodic-hook phrasing with a focused chant response',
        bridge: 'emotionally open rap-to-melodic phrasing with a changed cadence',
        outro: 'stripped, controlled confident rap phrasing',
      }),
    },
    instruments: { opening: [3, 2], verse: [0], verseLift: [1], rise: [1, 2], hook: [0, 1, 2], bridge: [3, 0], outro: [3, 2], solo: [3, 0] },
  },
  'modern-korean-trot': {
    rhythm: 'spirited modern trot pulse',
    harmony: 'clear live call-and-response vocals',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'resonant, measured phrasing with clear Korean melodic turns',
        verse: 'resonant, controlled storytelling with tasteful Korean melodic turns',
        preHookBuild: 'resonant melodic turns with a gathering emotional lift',
        standardHook: 'open, strong, resonant refrain phrasing',
        peakHook: 'powerful resonant refrain phrasing with expressive melodic turns',
        bridge: 'emotionally open, resonant phrasing with tasteful melodic turns',
        outro: 'restrained resonant phrasing with gentle melodic turns',
      }),
      Male: roleDeliveries({
        opening: 'resonant, measured phrasing with clear Korean melodic turns',
        verse: 'resonant, controlled storytelling with tasteful Korean melodic turns',
        preHookBuild: 'resonant melodic turns with a gathering emotional lift',
        standardHook: 'open, strong, resonant refrain phrasing',
        peakHook: 'powerful resonant refrain phrasing with expressive melodic turns',
        bridge: 'emotionally open, resonant phrasing with tasteful melodic turns',
        outro: 'restrained resonant phrasing with gentle melodic turns',
      }),
    },
    instruments: { opening: [0, 4], verse: [0], verseLift: [2], rise: [1, 3], hook: [0, 1, 2], bridge: [2, 0], outro: [0, 1], solo: [0, 3] },
  },
  'two-step-uk-garage': {
    rhythm: 'shuffling two-step syncopation',
    harmony: 'clean rhythmic chant and response',
    deliveryByGender: {
      Female: roleDeliveries({
        opening: 'soulful, nimble, measured syncopated phrasing',
        verse: 'soulful, nimble, controlled syncopated phrasing',
        preHookBuild: 'tightening soulful syncopated phrasing',
        standardHook: 'open, strong, soulful chorus phrasing with crisp response',
        peakHook: 'powerful, soulful, syncopated chorus phrasing',
        bridge: 'emotionally open, soulful nimble phrasing',
        outro: 'stripped, restrained, soulful syncopated phrasing',
      }),
      Male: roleDeliveries({
        opening: 'soulful, nimble, measured syncopated phrasing',
        verse: 'soulful, nimble, controlled syncopated phrasing',
        preHookBuild: 'tightening soulful syncopated phrasing',
        standardHook: 'open, strong, soulful chorus phrasing with crisp response',
        peakHook: 'powerful, soulful, syncopated chorus phrasing',
        bridge: 'emotionally open, soulful nimble phrasing',
        outro: 'stripped, restrained, soulful syncopated phrasing',
      }),
    },
    instruments: { opening: [2, 0], verse: [2], verseLift: [1], rise: [0, 1], hook: [0, 1, 2], bridge: [1, 2], outro: [2, 0], solo: [2, 1] },
  },
});

// All 15 canonical structure families have explicit movement rules. These are
// descriptive profiles only; the canonical section strings and order remain in
// structureProfiles.js and are never rewritten here.
export const STRUCTURE_DIRECTION_PROFILES = Object.freeze({
  pop: { opening: 'stable 4-bar cold open', verseTwo: 'changed texture and fresh story movement', hook: 'wide three-stage chorus lift', bridge: 'clear breath before the last lift', breather: 'concise 4-bar reset', ending: 'clean intentional stop' },
  'k-ballad': { opening: 'restrained 4-bar opening', verseTwo: 'longer emotional perspective with changed texture', hook: 'measured rise toward one final release', bridge: 'deep breath before the single modulation', breather: 'quiet 4-bar orchestral breath', ending: 'still, intentional stop' },
  'emotional-rnb': { opening: 'immediate hook cold open', verseTwo: 'new conversational angle over a changed pocket', hook: 'hook-first harmony arc', bridge: 'neo-soul breath before the final hook', breather: 'lyric-free 4-bar pocket', ending: 'warm intentional stop' },
  'city-pop': { opening: 'stable 4-bar neon motif', verseTwo: 'new night-drive scene with brighter texture', hook: 'shimmering chorus return', bridge: 'smooth breath before the last glide', breather: 'clear 4-bar solo window', ending: 'calm full fade' },
  'acoustic-folk': { opening: 'short stable 4-bar acoustic opening', verseTwo: 'new action and changed acoustic texture', hook: 'intimate sing-along rise', bridge: 'natural breath before the communal return', breather: 'organic 4-bar breathing space', ending: 'small clean stop' },
  'indie-alternative': { opening: 'distinct stable 4-bar cold open', verseTwo: 'different length and contrasting texture', hook: 'direct chorus lift with rough edges intact', bridge: 'unforced breath before the instrumental turn', breather: 'focused 4-bar instrumental release', ending: 'settled clean stop' },
  'dance-edm': { opening: 'immediate 4-bar festival cold open', verseTwo: 'new cadence over a leaner second-verse texture', hook: 'three paired tension-and-drop peaks', bridge: 'sharp breath before the last build', breather: 'tight 4-bar tension reset', ending: 'clean festival stop' },
  'hip-hop-trap': { opening: 'one-line vocal-tag cold open', verseTwo: 'changed flow, length, and narrative angle', hook: 'compact repeated hook escalation', bridge: 'cadence break before the final hook', breather: 'minimal 4-bar beat pocket', ending: 'dry intentional stop' },
  'rock-band': { opening: 'stable 4-bar signature riff', verseTwo: 'new action over a changed guitar layer', hook: 'three live-band chorus surges', bridge: 'band breath after the solo', breather: 'clear 4-bar live solo', ending: 'decisive band stop' },
  'lo-fi': { opening: 'tiny stable 4-bar room-tone opening', verseTwo: 'changed action and alternate short verse length', hook: 'two gentle chorus lifts', bridge: 'unhurried room breath', breather: 'lyric-free 4-bar room pocket', ending: 'quiet full fade' },
  'ost-cinematic': { opening: 'fragile stable 4-bar piano opening', verseTwo: 'broader scene with changed orchestral texture', hook: 'widening cinematic chorus arc', bridge: 'suspended breath before one modulation', breather: 'lyric-free 4-bar cinematic breath', ending: 'resolved orchestral stop' },
  trot: { opening: 'short stable 4-bar signature rhythm', verseTwo: 'new action and changed live-band color', hook: 'three clear refrain lifts', bridge: 'sentimental breath before the last refrain', breather: 'clear 4-bar live-band turn', ending: 'bright intentional stop' },
  'jazz-swing': { opening: 'short stable 4-bar count-in feel', verseTwo: 'new story angle over changed comping', hook: 'two memorable swing refrains', bridge: 'live-room breath between statements', breather: 'distinct 4-bar improvised solo', ending: 'soft live-room stop' },
  'synthwave-retro': { opening: 'stable 4-bar arpeggiated cold open', verseTwo: 'new motion scene with changed pulse texture', hook: 'wide recurring neon chorus', bridge: 'suspended retro breath before the final return', breather: 'focused 4-bar synth passage', ending: 'calm full fade' },
  'uk-garage': { opening: 'short stable 4-bar chopped cold open', verseTwo: 'new syncopated cadence over changed two-step texture', hook: 'build-to-chorus release without a drop', bridge: 'spacious breath before the instrumental turn', breather: 'clear 4-bar two-step instrumental', ending: 'tight intentional stop' },
});

const PALETTE_DIRECTION_PROFILES = Object.freeze({
  'dawn-night': { emotional: 'blue-hour restraint', energetic: 'luminous night motion', transition: 'gently luminous', bridge: 'a reflective turn toward morning', peak: 'Luminous emotional peak' },
  'season-nostalgia': { emotional: 'weathered seasonal warmth', energetic: 'bright present-tense nostalgia', transition: 'warmly unfolding', bridge: 'a present-tense turn', peak: 'Warm present-tense peak' },
  'drive-freedom': { emotional: 'open-road calm', energetic: 'liberating horizon motion', transition: 'forward-moving', bridge: 'a wide-open breath', peak: 'Maximum open-road lift' },
  'love-separation': { emotional: 'dignified intimate longing', energetic: 'clear cathartic motion', transition: 'tenderly rising', bridge: 'a dignified emotional turn', peak: 'Cathartic emotional peak' },
  'healing-growth': { emotional: 'patient grounded hope', energetic: 'steady hopeful motion', transition: 'gently strengthening', bridge: 'an unhurried inward turn', peak: 'Grounded hopeful peak' },
  'comfort-embrace': { emotional: 'patient blanket-warm reassurance', energetic: 'warm supportive motion', transition: 'softly opening', bridge: 'a patient reassuring breath', peak: 'Fullest warm reassuring lift' },
  'encouragement-forward': { emotional: 'determined hopeful motion', energetic: 'communal forward momentum', transition: 'steadily rising', bridge: 'a shared breath before moving forward', peak: 'Maximum communal energy' },
  'everyday-happiness': { emotional: 'sunlit present-tense playfulness', energetic: 'buoyant shared celebration', transition: 'playfully brightening', bridge: 'a smiling present-moment turn', peak: 'Maximum celebratory joy' },
  'city-neon': { emotional: 'intimate neon reflection', energetic: 'metropolitan night motion', transition: 'sleekly rising', bridge: 'a rooftop-sized breath', peak: 'Maximum neon-city lift' },
  'dream-cosmos': { emotional: 'weightless cosmic wonder', energetic: 'expansive orbital motion', transition: 'weightlessly widening', bridge: 'a suspended cosmic breath', peak: 'Widescreen orbital peak' },
  'ocean-travel': { emotional: 'salt-air reflection', energetic: 'horizon-bound travel motion', transition: 'openly rolling', bridge: 'a tide-like breath and turn', peak: 'Maximum horizon lift' },
});

function paletteDirection(concept, lane) {
  const profile = PALETTE_DIRECTION_PROFILES[concept?.paletteId]
    || PALETTE_DIRECTION_PROFILES['dawn-night'];
  return {
    ...profile,
    tone: profile[lane] || profile.emotional,
  };
}

function vocalSubject(vocalGender) {
  if (vocalGender === 'Male') return 'Male lead';
  if (vocalGender === 'Duet') return 'Female and male duet';
  return 'Female lead';
}

function vocalRoleForSection(section, context) {
  if (!section?.isVocal) return null;
  const sectionName = section.section;
  const isHook = ['Chorus', 'Final Chorus', 'Hook', 'Drop'].includes(sectionName);
  if (sectionName === 'Final Chorus' || section.isStrongestHook) return 'peakHook';
  if (sectionName === 'Intro' || (isHook && context.index === 0)) return 'opening';
  if (isVerseOne(sectionName, section.occurrence)
    || isVerseTwo(sectionName, section.occurrence)) return 'verse';
  if (sectionName === 'Pre-Chorus' || sectionName === 'Build up') return 'preHookBuild';
  if (isHook) return 'standardHook';
  if (sectionName === 'Bridge') return 'bridge';
  if (sectionName === 'Outro') return 'outro';
  throw new TypeError(`Missing vocal delivery role for section ${sectionName || 'unknown'}`);
}

function assertDeliveryScope(delivery, role, performanceTag) {
  const whisper = /\bwhisper/iu.test(delivery);
  const belt = /\bbelt(?:ed|ing)?\b/iu.test(delivery);
  const peakTechnique = belt || /\bsoar(?:ed|ing)?\b/iu.test(delivery);
  if (whisper && role !== 'opening') {
    throw new TypeError(`Whisper delivery cannot be used for ${role}`);
  }
  if (peakTechnique && role !== 'peakHook') {
    throw new TypeError(`Peak vocal technique cannot be used for ${role}`);
  }
  if ((role === 'verse' || role === 'outro')
    && /\b(?:maximum|rising)\b/iu.test(delivery)) {
    throw new TypeError(`Rising or maximum delivery cannot be used for ${role}`);
  }
  if (performanceTag === 'Whisper' && (!whisper || role !== 'opening')) {
    throw new TypeError('Whisper tag must use opening whisper delivery');
  }
  if (performanceTag === 'Belting' && (!belt || role !== 'peakHook')) {
    throw new TypeError('Belting tag must use peak-hook belt delivery');
  }
}

function vocalDelivery(presetProfile, context, role) {
  const normalizedPhrase = String(context.vocalPhrase ?? '').toLocaleLowerCase('en-US');
  const contextual = presetProfile.phraseContexts?.find(({ terms }) =>
    terms.every((term) => normalizedPhrase.includes(term)));
  const fallbackRoles = presetProfile.deliveryByGender[context.vocalGender]
    || presetProfile.deliveryByGender.Female
    || presetProfile.deliveryByGender.Male
    || Object.values(presetProfile.deliveryByGender)[0];
  const delivery = contextual?.deliveryByRole?.[role] || fallbackRoles?.[role];
  if (typeof delivery !== 'string' || !delivery.trim()) {
    throw new TypeError(`Missing ${role || 'unknown'} vocal delivery`);
  }
  assertDeliveryScope(delivery, role, context.performanceTag);
  return normalizedPhrase.includes('mixed up front')
    ? `${delivery}, mixed up front`
    : delivery;
}

function roleIndices(presetProfile, role, occurrence = 1) {
  const configured = presetProfile.instruments[role]
    || presetProfile.instruments.hook
    || [0];
  if (configured.length < 2) return configured;
  if (role === 'solo') {
    return occurrence % 2 === 0 ? [...configured].reverse() : configured;
  }
  if (role === 'hook') {
    const offset = Math.max(0, occurrence - 1) % configured.length;
    return [...configured.slice(offset), ...configured.slice(0, offset)];
  }
  return configured;
}

function instrumentUnitCount(value) {
  return String(value).split(/\s+and\s+/iu).length;
}

function instrumentsFor(preset, presetProfile, role, count = 2, occurrence = 1) {
  const available = Array.isArray(preset?.instruments) ? preset.instruments : [];
  const selected = [];
  let selectedUnits = 0;
  for (const index of roleIndices(presetProfile, role, occurrence)) {
    const instrument = available[index];
    const units = instrumentUnitCount(instrument);
    if (typeof instrument === 'string'
      && instrument.trim()
      && !selected.includes(instrument)
      && selectedUnits + units <= count) {
      selected.push(instrument);
      selectedUnits += units;
      if (selectedUnits >= count) break;
    }
  }
  if (selected.length === 0) {
    const fallback = available.find((instrument) =>
      typeof instrument === 'string'
      && instrument.trim()
      && instrumentUnitCount(instrument) <= count);
    if (fallback) selected.push(fallback);
  }
  return selected;
}

function joinNatural(values) {
  if (values.length < 2) return values[0] || 'the selected arrangement';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;
}

function isVerseOne(section, occurrence) {
  return section === 'Verse 1' || (section === 'Verse' && occurrence === 1);
}

function isVerseTwo(section, occurrence) {
  return section === 'Verse 2' || (section === 'Verse' && occurrence > 1);
}

function maximumPeakLabel(peak) {
  const normalized = String(peak || 'emotional lift')
    .replace(/^maximum\s+/iu, '')
    .replace(/^fullest\s+/iu, '');
  return `Maximum ${normalized.toLocaleLowerCase('en-US')}`;
}

function lyricFreeBreather(value) {
  return /\blyric-free\b/iu.test(value) ? value : `lyric-free ${value}`;
}

function ordinalWord(value) {
  return ['first', 'second', 'third', 'fourth'][Math.max(1, value) - 1]
    || `${value}th`;
}

function hookStage(section, context) {
  if (section.section === 'Final Chorus' || section.isStrongestHook) return 'strongest';
  if (context.index === 0) return 'cold-open';
  return section.occurrence === 1 ? 'initial' : 'expanded';
}

function hookDescriptor(section, context, semantic, harmony) {
  const stage = hookStage(section, context);
  if (section.section === 'Final Chorus') {
    return `${maximumPeakLabel(semantic.peak)}, ${harmony}`;
  }
  if (stage === 'strongest') return `${semantic.peak}, ${harmony}`;
  if (stage === 'cold-open') return `Immediate ${harmony} hook`;
  if (stage === 'expanded') {
    return `Expanded ${ordinalWord(section.occurrence)}-return ${harmony}`;
  }
  return `Focused first-statement ${harmony}`;
}

function hookDirections(section, context, profiles, delivery) {
  const { preset, bpm, key, vocalGender } = context;
  const { presetProfile, semantic } = profiles;
  const subject = vocalSubject(vocalGender);
  const coreDelivery = delivery.replace(/, mixed up front$/u, '');
  const selectedInstruments = instrumentsFor(
    preset,
    presetProfile,
    'hook',
    2,
    section.occurrence,
  );
  const instruments = joinNatural(selectedInstruments);
  const anchor = selectedInstruments[0] || 'the selected arrangement';
  const stage = hookStage(section, context);
  const ordinal = ordinalWord(section.occurrence);
  let arrangementText;
  if (stage === 'cold-open') {
    arrangementText = [
      `Open the title hook immediately at ${bpm} BPM in ${key} with ${instruments}`,
      `Open the title hook immediately at ${bpm} BPM in ${key} with ${anchor}`,
    ];
  } else if (stage === 'strongest') {
    arrangementText = [
      `Drive the strongest title-hook peak with ${instruments}`,
      `Drive the strongest title-hook peak with ${anchor}`,
    ];
  } else if (stage === 'expanded') {
    arrangementText = [
      `Widen the ${ordinal} title-hook return with ${instruments}`,
      `Widen the ${ordinal} title-hook return with ${anchor}`,
    ];
  } else {
    arrangementText = [
      `Establish the first title-hook statement with ${instruments}`,
      `Establish the first title-hook statement with ${anchor}`,
    ];
  }
  const performanceText = [
    `${subject} delivers ${coreDelivery}`,
    `${subject} delivers ${delivery}`,
  ];

  return {
    headerDescriptor: directionDescriptor([
      hookDescriptor(section, context, semantic, presetProfile.harmony),
      `${stage === 'strongest' ? semantic.peak : semantic.tone} hook`,
    ]),
    shortHeaderDescriptor: directionDescriptor([
      `Immediate ${presetProfile.harmony} hook`,
      'Immediate focused hook',
    ]),
    cues: [
      directionCue('arrangement', arrangementText, {
        inheritToShorts: true,
        shortText: [
          `Immediate ${presetProfile.rhythm} hook with ${anchor}`,
          `Immediate hook with ${anchor}`,
        ],
      }),
      directionCue('performance', performanceText, {
        inheritToShorts: true,
        shortText: [
          `${subject} with ${presetProfile.harmony}`,
          `${subject} with focused hook harmony`,
        ],
      }),
    ],
  };
}

function directionForSection(section, context, profiles) {
  const { preset, bpm, key, vocalGender, vocalPhrase, index, sections } = context;
  const { presetProfile, structureProfile, semantic } = profiles;
  const subject = vocalSubject(vocalGender);
  const vocalRole = vocalRoleForSection(section, context);
  const delivery = vocalRole
    ? vocalDelivery(presetProfile, {
      vocalGender,
      vocalPhrase,
      performanceTag: section.performanceTag,
    }, vocalRole)
    : '';
  const coreDelivery = delivery.replace(/, mixed up front$/u, '');
  const lineCount = Array.isArray(section.lines) ? section.lines.length : 0;
  const nextSection = sections[index + 1]?.section;

  if (section.section === 'Intro') {
    const selectedOpening = instrumentsFor(preset, presetProfile, 'opening', 2);
    const opening = joinNatural(selectedOpening);
    const anchor = selectedOpening[0] || 'the selected arrangement';
    return {
      headerDescriptor: directionDescriptor(`${semantic.tone} opening`),
      cues: [
        directionCue('arrangement', [
          `Open with ${opening}, ${structureProfile.opening} at ${bpm} BPM in ${key}`,
          `Open with ${anchor} at ${bpm} BPM in ${key}`,
        ]),
        directionCue('performance', [
          `${subject} enters with ${coreDelivery}`,
          `${subject} enters with ${delivery}`,
        ]),
      ],
    };
  }

  if (isVerseOne(section.section, section.occurrence)) {
    const lift = joinNatural(instrumentsFor(preset, presetProfile, 'verseLift', 1));
    return {
      headerDescriptor: directionDescriptor(`${semantic.tone} first verse`),
      cues: [
        directionCue('performance', [
          `${subject} delivers ${delivery}`,
          `${subject} delivers ${coreDelivery}`,
        ]),
        directionCue('transition', `Bring in ${lift} for a ${semantic.transition} rhythmic lift`, {
          placement: 'after-line',
          afterLine: Math.min(2, lineCount - 1),
        }),
      ],
    };
  }

  if (isVerseTwo(section.section, section.occurrence)) {
    const changed = joinNatural(instrumentsFor(preset, presetProfile, 'verseLift', 1));
    return {
      headerDescriptor: directionDescriptor([
        `${structureProfile.verseTwo}, ${semantic.tone}`,
        `${semantic.tone} changed-texture verse`,
      ]),
      cues: [
        directionCue('performance', `${subject} changes cadence with ${coreDelivery}`),
        directionCue('transition', `Add ${changed} for a ${semantic.transition} texture shift`, {
          placement: 'after-line',
          afterLine: Math.min(2, lineCount - 1),
        }),
      ],
    };
  }

  if (section.section === 'Pre-Chorus') {
    const selectedRise = instrumentsFor(preset, presetProfile, 'rise', 2);
    const rise = joinNatural(selectedRise);
    const anchor = selectedRise[0] || 'the selected arrangement';
    return {
      headerDescriptor: directionDescriptor(`${semantic.transition} pre-hook rise`),
      cues: [
        directionCue('arrangement', [
          `Raise ${rise} at ${bpm} BPM while withholding the title hook`,
          `Raise ${anchor} at ${bpm} BPM while withholding the title hook`,
        ]),
        directionCue('performance', [
          `${subject} opens the register with ${coreDelivery}`,
          `${subject} opens the register with ${delivery}`,
        ]),
      ],
    };
  }

  if (section.section === 'Chorus' || section.section === 'Final Chorus') {
    return hookDirections(section, context, profiles, delivery);
  }

  if (section.section === 'Hook' || section.section === 'Drop') {
    const hook = hookDirections(section, context, profiles, delivery);
    const role = section.section === 'Drop' ? 'Drop' : 'Hook';
    const stage = hookStage(section, context);
    const ordinal = ordinalWord(section.occurrence);
    const descriptor = stage === 'strongest'
      ? semantic.peak
      : stage === 'cold-open'
        ? `Immediate chantable ${role.toLocaleLowerCase('en-US')}`
        : stage === 'expanded'
          ? `Expanded ${ordinal}-return chantable peak`
          : 'Focused first chantable peak';
    hook.headerDescriptor = directionDescriptor(`${descriptor}, ${presetProfile.harmony}`);
    hook.shortHeaderDescriptor = directionDescriptor(`Immediate chantable ${role.toLocaleLowerCase('en-US')}`);
    const movement = stage === 'strongest'
      ? `Lock the strongest ${role.toLocaleLowerCase('en-US')}`
      : stage === 'expanded'
        ? `Widen the ${ordinal} ${role.toLocaleLowerCase('en-US')} return`
        : stage === 'cold-open'
          ? `Cold-open on the first ${role.toLocaleLowerCase('en-US')}`
          : `Establish the first ${role.toLocaleLowerCase('en-US')}`;
    const selectedHook = instrumentsFor(
      preset,
      presetProfile,
      'hook',
      2,
      section.occurrence,
    );
    const hookInstruments = joinNatural(selectedHook);
    const hookAnchor = selectedHook[0] || 'the selected arrangement';
    hook.cues[0] = directionCue(
      'arrangement',
      [
        `${movement} with ${hookInstruments}`,
        `${movement} with ${hookAnchor}`,
      ],
      {
        inheritToShorts: true,
        shortText: [
          `Immediate ${presetProfile.rhythm} ${role.toLocaleLowerCase('en-US')} with ${hookAnchor}`,
          `Immediate ${role.toLocaleLowerCase('en-US')} with ${hookAnchor}`,
        ],
      },
    );
    return hook;
  }

  if (section.section === 'Build up') {
    const selectedRise = instrumentsFor(preset, presetProfile, 'rise', 2);
    const anchor = selectedRise[0] || 'the selected arrangement';
    if (!nextSection) throw new TypeError('Build up must lead to a canonical next section');
    return {
      headerDescriptor: directionDescriptor(`${semantic.transition} two-line tension rise`),
      cues: [
        directionCue('performance', [
          `Let ${anchor} rise across two lines at ${bpm} BPM under ${coreDelivery}`,
          `Shape two rising lines with ${coreDelivery} at ${bpm} BPM`,
        ]),
        directionCue('transition', `Use the second line as the pickup into ${nextSection}`),
      ],
    };
  }

  if (section.section === 'Bridge') {
    const reduced = joinNatural(instrumentsFor(preset, presetProfile, 'bridge', 1));
    const swell = joinNatural(instrumentsFor(preset, presetProfile, 'bridge', 2).slice(-1));
    return {
      headerDescriptor: directionDescriptor([
        `${semantic.bridge}, ${structureProfile.bridge}`,
        semantic.bridge,
      ]),
      cues: [
        directionCue('arrangement', `Pull back to ${reduced} for a clear bridge breath`),
        directionCue('performance', [
          `${subject} leans into ${coreDelivery}`,
          `${subject} leans into ${delivery}`,
        ]),
        directionCue('transition', `Let ${swell} swell beneath the ${subject.toLocaleLowerCase('en-US')}`, {
          placement: 'after-line',
          afterLine: Math.min(2, lineCount - 1),
        }),
      ],
    };
  }

  if (section.section === 'Interlude') {
    const selectedFocus = instrumentsFor(preset, presetProfile, 'solo', 2, section.occurrence);
    const focus = joinNatural(selectedFocus);
    const anchor = selectedFocus[0] || 'the selected arrangement';
    return {
      cues: [
        directionCue('arrangement', [
          `Give ${focus} a ${lyricFreeBreather(structureProfile.breather)}`,
          `Give ${anchor} a concise lyric-free 4-bar breath`,
        ]),
        directionCue('production', `Leave a clear 4-bar breath before ${nextSection || 'the return'}`),
      ],
    };
  }

  if (section.section === 'Instrumental') {
    const selectedFocus = instrumentsFor(preset, presetProfile, 'solo', 2, section.occurrence);
    const focus = joinNatural(selectedFocus);
    const anchor = selectedFocus[0] || 'the selected arrangement';
    return {
      headerDescriptor: directionDescriptor('Focused instrumental breathing space'),
      cues: [
        directionCue('arrangement', [
          `Let ${focus} lead a ${lyricFreeBreather(structureProfile.breather)}`,
          `Let ${anchor} lead a concise lyric-free 4-bar passage`,
        ]),
        directionCue('transition', `Resolve the 4-bar phrase into ${nextSection || 'the vocal return'}`),
      ],
    };
  }

  if (section.section === 'Solo') {
    const focus = instrumentsFor(preset, presetProfile, 'solo', 2, section.occurrence);
    return {
      headerDescriptor: directionDescriptor(`${focus[0] || 'Featured'} 4-bar solo`),
      cues: [
        directionCue('arrangement', `Let ${focus[0] || 'the featured voice'} take a concise lyric-free 4-bar solo`),
        directionCue(
          'production',
          focus[1]
            ? `Keep ${focus[1]} understated beneath the solo`
            : 'Leave open space beneath the solo',
        ),
      ],
    };
  }

  if (section.section === 'Guitar Solo') {
    const actualGuitar = (preset.instruments || []).find((instrument) =>
      String(instrument).toLocaleLowerCase('en-US').includes('guitar'));
    const support = instrumentsFor(preset, presetProfile, 'solo', 2, section.occurrence)
      .find((instrument) => instrument !== actualGuitar);
    return {
      headerDescriptor: directionDescriptor('Focused 4-bar guitar solo'),
      cues: [
        directionCue('arrangement', `Let ${actualGuitar || preset.instruments?.[0]} take a concise lyric-free 4-bar solo`),
        directionCue('production', `Keep ${support || preset.instruments?.[0]} understated beneath the guitar solo`),
      ],
    };
  }

  if (section.section === 'Key Change') {
    return {
      cues: [
        directionCue('transition', 'Lift once into Final Chorus without naming a target key', {
          placement: 'before-lines',
        }),
      ],
    };
  }

  if (section.section === 'Outro') {
    const selectedOutro = instrumentsFor(preset, presetProfile, 'outro', 2);
    const outro = joinNatural(selectedOutro);
    const anchor = selectedOutro[0] || 'the selected arrangement';
    return {
      cues: [
        directionCue('arrangement', [
          `Reduce ${outro} for a calm, unhurried release`,
          `Reduce ${anchor} for a calm, unhurried release`,
        ]),
        directionCue('performance', [
          `${subject} settles into ${coreDelivery}`,
          `${subject} settles into ${delivery}`,
        ]),
      ],
    };
  }

  if (section.section === 'Fade Out') {
    const selectedOutro = instrumentsFor(preset, presetProfile, 'outro', 2);
    const outro = joinNatural(selectedOutro);
    const anchor = selectedOutro[0] || 'the selected arrangement';
    return {
      cues: [
        directionCue('termination', [
          `Take ${outro} into a smooth pump-free fade to silence with stable tonal balance and no abrupt cut`,
          `Take ${anchor} into a smooth pump-free fade to silence with stable tonal balance and no abrupt cut`,
        ]),
      ],
    };
  }

  if (section.section === 'End') {
    return {
      cues: [
        directionCue('termination', `Make a ${structureProfile.ending} with no tail or auto-extension`),
      ],
    };
  }

  // Canonical profiles currently exhaust every section above. Keeping a safe,
  // explicit production cue prevents a future vocal tag from being uncued.
  return {
    cues: [
      directionCue('production', `Keep this section concise in the ${presetProfile.rhythm}`),
    ],
  };
}

/**
 * Add structured directions without changing canonical section strings, order,
 * existing metadata, or lyric lines.
 */
export function enrichLyricSections(lyricSections, input) {
  const presetProfile = PRESET_DIRECTION_PROFILES[input?.preset?.id];
  const structureProfile = STRUCTURE_DIRECTION_PROFILES[input?.profile?.id];
  if (!presetProfile) throw new TypeError(`Missing section direction profile for preset ${input?.preset?.id || 'unknown'}`);
  if (!structureProfile) throw new TypeError(`Missing section direction profile for structure ${input?.profile?.id || 'unknown'}`);

  const sections = lyricSections.map((section) => ({
    ...section,
    lines: [...section.lines],
  }));
  const semantic = paletteDirection(input.concept, input.lane);
  return sections.map((section, index) => {
    const direction = directionForSection(
      section,
      { ...input, sections, index },
      { presetProfile, structureProfile, semantic },
    );
    return {
      ...section,
      ...direction,
    };
  });
}

/** Build a Short cue from a validated parent cue without carrying mid-line state. */
export function inheritCueForShort(cue) {
  return directionCue(cue.kind, cue.shortText || cue.text, {
    placement: 'before-lines',
  });
}

/** One concise, Short-specific hard stop. */
export function shortEndCue() {
  return directionCue(
    'termination',
    'Hard-stop the Short after the hook with no tail or auto-extension',
  );
}
