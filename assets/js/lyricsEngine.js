// lyricsEngine.js
// Produces complete copy-ready Korean lyrics from a canonical structure and one
// shared concept. Section choices use an isolated seeded stream supplied by the
// caller; authored line banks keep the result narrative rather than word salad.

import { getConceptLineBank } from './conceptPalettes.js';

const NON_VOCAL = new Set([
  'Interlude',
  'Instrumental',
  'Solo',
  'Guitar Solo',
  'Key Change',
  'End',
  'Fade Out',
]);

const PRE_CHORUS_LINES = [
  '아직 다 말하지 않은 마음을 한 박자 뒤에 두고',
  '낮게 고른 숨 사이로 다음 문이 열리면',
  '이름 붙이지 않은 떨림만 조금 더 키워',
  '가까워진 순간 앞에서 발끝을 잠시 멈춰',
  '작은 심장 소리가 빈 공간을 채울 때',
  '마지막 한마디는 빛이 올 때까지 아껴 둬',
];

const BUILD_UP_LINES = [
  '낮게 시작한 숨을 한 칸씩 위로 올려',
  '두 손을 펴',
  '빠르게 뛰는 박자에 망설임을 벗어',
  '지금 더 높이',
  '모든 불빛을 하나의 순간에 모아',
  '바로 지금',
];

function buildUpPairsFor(bank) {
  const authored = bank?.buildUp;
  const usable = Array.isArray(authored)
    && authored.length >= 6
    && authored.length % 2 === 0
    && authored.every((line) => typeof line === 'string' && line.trim());
  const lines = usable ? authored : BUILD_UP_LINES;
  const pairs = [];
  for (let index = 0; index < lines.length; index += 2) {
    pairs.push([lines[index], lines[index + 1]]);
  }
  return pairs;
}

function resolveBridgeResolution(template, titleKo) {
  const fallback = `${titleKo}, 그 이름으로 다음 장을 열어`;
  if (typeof template !== 'string' || !template.includes('{titleKo}')) return fallback;
  const resolved = template.split('{titleKo}').join(titleKo).trim();
  if (!resolved || !resolved.includes(titleKo) || /[{}]/.test(resolved)) return fallback;
  return resolved;
}

export function singerTagForGender(vocalGender) {
  if (vocalGender === 'Male') return '[Male singer]';
  if (vocalGender === 'Duet') return '[Female and Male duet]';
  return '[Female singer]';
}

function sectionEnergy(section) {
  if (section === 'Intro' || /^Verse(?:\s|$)/.test(section)) return 'sparse';
  if (section === 'Pre-Chorus' || section === 'Build up') return 'builds';
  if (section === 'Chorus' || section === 'Final Chorus' || section === 'Hook' || section === 'Drop') return 'explodes / emotional peak';
  if (section === 'Bridge') return 'turns then rebuilds';
  if (section === 'Outro' || section === 'End' || section === 'Fade Out') return 'calmer ending';
  return 'breathing room';
}

function rotate(values, offset) {
  if (!values.length) return [];
  const start = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(start), ...values.slice(0, start)];
}

function isVerseOne(section, verseOccurrence) {
  return section === 'Verse 1' || (section === 'Verse' && verseOccurrence === 0);
}

function isVerseTwo(section, verseOccurrence) {
  return section === 'Verse 2' || (section === 'Verse' && verseOccurrence > 0);
}

function hookPhraseFor(concept) {
  const phrase = String(concept.hookPhrase || '').trim();
  if (phrase.includes(concept.titleKo)) return phrase;
  return `${concept.titleKo}, 오늘의 마음을 밝혀`;
}

/** Render structured lyric sections without ever interpreting text as markup. */
export function renderLyrics(lyricSections) {
  const blocks = lyricSections.map((item) => {
    const lines = [`[${item.section}]`];
    if (item.vocalTag) lines.push(item.vocalTag);
    if (item.performanceTag) lines.push(`[${item.performanceTag}]`);
    lines.push(...item.lines);
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}

/**
 * Generate full Korean lyrics in the profile's exact section sequence.
 * @param {{profile:object, concept:object, vocalGender:string, rng:()=>number}} input
 */
export function buildFullLyrics({ profile, concept, vocalGender, rng }) {
  const bank = getConceptLineBank(concept.paletteId);
  const singerTag = singerTagForGender(vocalGender);
  const hookPhrase = hookPhraseFor(concept);
  const sections = profile.sections;
  const strongestIndex = sections.reduce(
    (last, section, index) => (section === profile.strongestHookTag ? index : last),
    -1,
  );
  const verseTwoLength = rng() < 0.5 ? 3 : 5;
  const introOffset = Math.floor(rng() * bank.intro.length);
  const verseOneOffset = Math.floor(rng() * bank.verse1.length);
  const verseTwoOffset = Math.floor(rng() * bank.verse2.length);
  const bridgeVariant = rng() < 0.5 ? 'opening' : 'closing';
  const outroOffset = Math.floor(rng() * bank.outro.length);
  const chorusOffset = Math.floor(rng() * bank.chorus.length);
  const chantOffset = Math.floor(rng() * bank.chant.length);
  const preOffset = Math.floor(rng() * PRE_CHORUS_LINES.length);
  const buildUpPairs = buildUpPairsFor(bank);
  const buildOffset = Math.floor(rng() * buildUpPairs.length);
  const chorusLines = rotate(bank.chorus, chorusOffset);
  const chantLines = rotate(bank.chant, chantOffset);
  const preLines = rotate(PRE_CHORUS_LINES, preOffset);
  const buildPairs = rotate(buildUpPairs, buildOffset);

  let verseOccurrence = 0;
  let chorusCursor = 0;
  let chantCursor = 0;
  let preCursor = 0;
  let buildCursor = 0;

  const lyricSections = sections.map((section, index) => {
    const occurrence = sections.slice(0, index + 1).filter((value) => value === section).length;
    const isNonVocal = NON_VOCAL.has(section);
    const result = {
      section,
      occurrence,
      isVocal: !isNonVocal,
      vocalTag: isNonVocal ? null : singerTag,
      performanceTag: null,
      energy: sectionEnergy(section),
      arrangement: isNonVocal
        ? 'instrumental breathing room; no lyric lines'
        : 'lead vocal mixed up front over sparse backing',
      isStrongestHook: index === strongestIndex,
      lines: [],
    };

    if (isNonVocal) return result;

    if (section === 'Intro') {
      result.lines = [bank.intro[introOffset]];
      result.arrangement = 'short cold-open vocal over one sparse motif';
    } else if (isVerseOne(section, verseOccurrence)) {
      const sceneLine = `${concept.scene}, 그 장면 앞에 잠시 멈춰 서`;
      result.lines = [
        sceneLine,
        ...rotate(bank.verse1, verseOneOffset).slice(0, 3),
      ];
      result.arrangement = 'four-line concrete scene; lead vocal up front and backing sparse';
      verseOccurrence += 1;
    } else if (isVerseTwo(section, verseOccurrence)) {
      result.lines = rotate(bank.verse2, verseTwoOffset).slice(0, verseTwoLength);
      result.arrangement = `${verseTwoLength}-line story development with changed action and texture`;
      verseOccurrence += 1;
    } else if (section === 'Pre-Chorus') {
      result.lines = preLines.slice(preCursor, preCursor + 3);
      preCursor += 3;
      result.arrangement = 'withhold the title hook while harmony and register lift';
    } else if (section === 'Build up') {
      result.lines = [...buildPairs[buildCursor % buildPairs.length]];
      buildCursor += 1;
      result.arrangement = `two rising lines resolving directly into ${profile.rules.hookResolution === 'build-up-to-drop' ? 'Drop' : 'Chorus'}`;
    } else if (section === 'Chorus' || section === 'Final Chorus') {
      // Four cold-open R&B choruses still fit the nine authored support lines;
      // each occurrence gets two unique lines plus the repeatable title hook.
      const supportCount = 2;
      result.lines = [hookPhrase, ...chorusLines.slice(chorusCursor, chorusCursor + supportCount)];
      chorusCursor += supportCount;
      result.arrangement = section === 'Final Chorus'
        ? 'resolved emotional peak with the exact title hook'
        : 'full-band lift contrasting the sparse verse with the exact title hook';
    } else if (section === 'Hook' || section === 'Drop') {
      result.lines = [hookPhrase, ...chantLines.slice(chantCursor, chantCursor + 2)];
      chantCursor += 2;
      result.arrangement = section === 'Drop'
        ? 'chantable title hook over the peak drop'
        : 'compact chantable title hook with sparse gaps';
    } else if (section === 'Bridge') {
      const bridgeLines = bridgeVariant === 'opening'
        ? bank.bridge.slice(0, 3)
        : [bank.bridge[0], ...bank.bridge.slice(-2)];
      result.lines = [
        ...bridgeLines,
        resolveBridgeResolution(bank.bridgeResolution, concept.titleKo),
      ];
      result.arrangement = 'genuine narrative turn and harmonic transition before the final peak';
    } else if (section === 'Outro') {
      result.lines = [
        bank.outro[outroOffset],
        `${concept.titleKo}, 그 여운을 품고 천천히 숨을 고른다`,
      ];
      result.arrangement = 'calm resolution with reduced backing';
    }

    return result;
  });

  const contrast = profile.rules.vocalContrast;
  if (contrast?.soft && contrast?.peak) {
    const firstVocal = lyricSections.find((section) => section.isVocal);
    const peak = lyricSections.find((section) => section.isStrongestHook);
    if (firstVocal && peak) {
      firstVocal.performanceTag = contrast.soft;
      peak.performanceTag = contrast.peak;
    }
  }

  return {
    lyricSections,
    lyrics: renderLyrics(lyricSections),
    strongestHookSection: lyricSections[strongestIndex] || null,
  };
}

/** Find the final strongest hook section from a generated parent track. */
export function findStrongestHookSection(track) {
  const sections = Array.isArray(track?.lyricSections) ? track.lyricSections : [];
  return sections.find((section) => section.isStrongestHook)
    || [...sections].reverse().find((section) => ['Final Chorus', 'Chorus', 'Hook', 'Drop'].includes(section.section))
    || null;
}

/** Extract 2-4 consecutive source lines, always starting with the title hook. */
export function extractStrongestHook(track) {
  const source = findStrongestHookSection(track);
  if (!source || !Array.isArray(source.lines)) {
    return { sourceSection: 'Hook', excerptLines: [], excerpt: '' };
  }
  const titleIndex = source.lines.findIndex((line) => String(line).includes(track.titleKo));
  const start = titleIndex >= 0 ? titleIndex : 0;
  const excerptLines = source.lines.slice(start, start + 4);
  if (excerptLines.length < 2 && source.lines.length >= 2) {
    excerptLines.push(...source.lines.slice(0, 2 - excerptLines.length));
  }
  return {
    sourceSection: source.section,
    excerptLines,
    excerpt: excerptLines.join('\n'),
  };
}

/** Build clean Shorts lyrics directly from the parent's strongest hook. */
export function buildShortLyrics(parent) {
  const { sourceSection, excerptLines, excerpt } = extractStrongestHook(parent);
  const vocalTag = singerTagForGender(parent.vocalGender);
  const lyrics = [
    `[${sourceSection}]`,
    vocalTag,
    ...excerptLines,
    '',
    '[End]',
  ].join('\n');
  return {
    sourceSection,
    excerptLines,
    excerpt,
    lyrics,
    lyricSections: [
      { section: sourceSection, occurrence: 1, isVocal: true, vocalTag, performanceTag: null, energy: 'immediate hook peak', arrangement: '2-4 consecutive lines copied exactly from parent', isStrongestHook: true, lines: [...excerptLines] },
      { section: 'End', occurrence: 1, isVocal: false, vocalTag: null, performanceTag: null, energy: 'clean ending', arrangement: 'explicit short-form termination', isStrongestHook: false, lines: [] },
    ],
  };
}
