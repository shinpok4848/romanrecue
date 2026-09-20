// exporters.js
// Pure lossless JSON plus human-oriented CSV, Markdown, and YouTube outputs.
// No DOM, network, framework, or package dependency.

import { formatStructure } from './structureProfiles.js';

export function toJSON(plan) {
  return JSON.stringify(plan, null, 2);
}

export function fromJSON(str) {
  return JSON.parse(str);
}

// v1 columns remain in their original order; v2 fields are appended so saved
// spreadsheet workflows do not shift existing columns.
const CSV_COLUMNS = [
  ['week', (track) => track.week],
  ['day', (track) => track.day],
  ['type', (track) => track.type],
  ['releaseDate', (track) => track.releaseDate],
  ['status', (track) => track.status],
  ['title', (track) => track.title],
  ['stylePrompt', (track) => track.stylePrompt],
  ['excludePrompt', (track) => track.excludePrompt],
  ['mood', (track) => track.mood],
  ['vocalGender', (track) => track.vocalGender],
  ['weirdness', (track) => track.weirdness],
  ['styleInfluence', (track) => track.styleInfluence],
  ['id', (track) => track.id],
  ['linkedTrackId', (track) => track.linkedTrackId],
  ['presetId', (track) => track.presetId],
  ['structureId', (track) => track.structureId],
  ['titleKo', (track) => track.titleKo],
  ['titleEn', (track) => track.titleEn],
  ['paletteId', (track) => track.concept?.paletteId],
  ['conceptScene', (track) => track.concept?.scene],
  ['conceptEmotionalArc', (track) => track.concept?.emotionalArc],
  ['bpm', (track) => track.bpm],
  ['key', (track) => track.key],
  ['vocalPhrase', (track) => track.vocalPhrase],
  ['structure', (track) => Array.isArray(track.structure) ? formatStructure(track.structure) : track.structure],
  ['structureRationale', (track) => track.structureRationale],
  ['producerPrescription', (track) => track.producerPrescription],
  ['lyrics', (track) => track.lyrics ?? track.lyricsGuide],
  ['strongestHookTag', (track) => track.strongestHookTag],
  ['shortsSourceSection', (track) => track.shortsHookGuide?.sourceSection],
  ['shortsExcerpt', (track) => track.shortsHookGuide?.excerpt],
];

function escapeCSVField(value) {
  // RFC-style quoted fields may contain CR and LF. Normalize embedded lyric
  // line endings to CR so each logical record remains one LF-delimited line;
  // spreadsheet readers still render those quoted fields as multiline cells.
  const str = value == null ? '' : String(value).replace(/\r\n|\n|\r/g, '\r');
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCSV(plan) {
  const tracks = Array.isArray(plan?.tracks) ? plan.tracks : [];
  const rows = [CSV_COLUMNS.map(([name]) => name).join(',')];
  for (const track of tracks) {
    rows.push(CSV_COLUMNS.map(([, read]) => escapeCSVField(read(track))).join(','));
  }
  return rows.join('\n');
}

function escapeTableCell(value) {
  return value == null
    ? ''
    : String(value).replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' ');
}

/** Stable compact table retained as a compatibility helper. */
export function toMarkdownTable(plan) {
  const tracks = Array.isArray(plan?.tracks) ? plan.tracks : [];
  const headers = ['Week', 'Day', 'Type', 'Release', 'Status', 'Title', 'Style', 'Mood'];
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
  for (const track of tracks) {
    const cells = [
      track.week,
      track.day,
      track.type,
      track.releaseDate,
      track.status,
      track.title,
      track.stylePrompt,
      track.mood,
    ].map(escapeTableCell);
    lines.push(`| ${cells.join(' | ')} |`);
  }
  return lines.join('\n');
}

function fencedText(value) {
  const content = String(value ?? '');
  const runs = content.match(/`+/g) || [];
  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}text\n${content}\n${fence}`;
}

/** Full Markdown export: scan-friendly summary followed by complete packages. */
export function toMarkdown(plan) {
  const tracks = Array.isArray(plan?.tracks) ? plan.tracks : [];
  const summary = toMarkdownTable(plan);
  const lines = [
    '# SunoFlow Monthly Package',
    '',
    `- Schema: ${plan?.schemaVersion ?? 'Legacy v1'}`,
    `- Engine: ${plan?.engineVersion ?? 'Legacy'}`,
    `- Theme: ${plan?.theme ?? ''}`,
    `- Start: ${plan?.startDate ?? ''}`,
    '',
    '## Release Summary',
    '',
    summary,
  ];

  for (const track of tracks) {
    const lyrics = track.lyrics ?? track.lyricsGuide ?? '';
    const legacy = !track.lyrics && !track.structureId;
    lines.push(
      '',
      `## W${track.week} ${track.day} · ${track.type === 'main' ? 'Full Track' : 'Shorts'}`,
      '',
      `**Title:** ${track.title ?? ''}`,
      `**Genre:** ${track.genre ?? 'K-Pop'}`,
      `**Release / Status:** ${track.releaseDate ?? ''} · ${track.status ?? ''}`,
      `**BPM / Key / Vocal:** ${track.bpm ?? 'Legacy'} / ${track.key ?? 'Legacy'} / ${track.vocalGender ?? ''}`,
      `**Weirdness / Style Influence:** ${track.weirdness ?? ''}% / ${track.styleInfluence ?? ''}%`,
      '',
      '### Suno v6 Fields',
      '',
      `**Style:** ${track.stylePrompt ?? ''}`,
      '',
      `**Exclude:** ${track.excludePrompt ?? ''}`,
      '',
      `**Mood:** ${track.mood ?? ''}`,
    );

    if (!legacy) {
      lines.push(
        '',
        '### Structure & Production',
        '',
        `**Structure:** ${Array.isArray(track.structure) ? formatStructure(track.structure) : track.structure ?? ''}`,
        '',
        `**Rationale:** ${track.structureRationale ?? ''}`,
        '',
        `**Prescription:** ${track.producerPrescription ?? ''}`,
      );
    }

    if (track.type === 'shorts' && track.shortsHookGuide?.excerpt) {
      lines.push('', '### Exact Shorts Excerpt', '', fencedText(track.shortsHookGuide.excerpt));
    }

    lines.push(
      '',
      legacy ? '### Legacy English Lyrics Guidance' : '### Complete Korean Lyrics',
      '',
      fencedText(lyrics),
    );
  }

  return lines.join('\n');
}

function mainLyricExcerpt(track) {
  const sections = Array.isArray(track?.lyricSections) ? track.lyricSections : [];
  const source = sections.find((section) => section.isStrongestHook)
    || [...sections].reverse().find((section) => ['Final Chorus', 'Chorus', 'Hook', 'Drop'].includes(section.section));
  return Array.isArray(source?.lines) ? source.lines.slice(0, 4).join('\n') : '';
}

function youtubeLyricExcerpt(track) {
  if (track.type === 'shorts' && track.shortsHookGuide?.excerpt) {
    return track.shortsHookGuide.excerpt;
  }
  return mainLyricExcerpt(track);
}

function hashtagToken(value) {
  return String(value ?? '').replace(/[^a-zA-Z0-9가-힣]+/g, '');
}

export function buildYouTubeDescription(track) {
  const lines = [
    track.title ?? '',
    '',
    `🎵 장르 / Genre: ${track.genre || 'K-Pop'}`,
    `📅 공개 / Release: ${track.releaseDate ?? ''}`,
    `🎚️ Mood: ${track.mood ?? ''}`,
  ];

  const excerpt = youtubeLyricExcerpt(track);
  if (excerpt && /[가-힣]/.test(excerpt)) {
    lines.push('', '🎤 가사 하이라이트', excerpt);
  }

  lines.push(
    '',
    '🤖 Audio generated by the creator with Suno AI.',
    '🧭 Song package planned with SunoFlow — no API connection.',
    '',
  );

  const seen = new Set();
  const tags = [];
  const addTag = (value) => {
    const token = hashtagToken(value);
    const identity = token.toLocaleLowerCase('en-US');
    if (token && !seen.has(identity)) {
      seen.add(identity);
      tags.push(token);
    }
  };
  addTag(track.genre);
  addTag('KPop');
  addTag('SunoAI');
  addTag('AIMusic');
  if (track.type === 'shorts') addTag('Shorts');
  for (const tag of track.shortsHookGuide?.captionHashtags || []) addTag(tag);
  lines.push(tags.map((tag) => `#${tag}`).join(' '));

  return lines.join('\n');
}
