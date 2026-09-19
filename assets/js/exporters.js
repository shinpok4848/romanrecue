// exporters.js
//
// Pure serialization helpers for a monthly plan. Every function returns a
// STRING (or parses one); the actual file download / clipboard write belongs to
// the UI layer. NO DOM access — importable in node:test.

/**
 * Serialize a plan to pretty-printed JSON.
 * @param {object} plan
 * @returns {string}
 */
export function toJSON(plan) {
  return JSON.stringify(plan, null, 2);
}

/**
 * Parse a plan from a JSON string. Throws on invalid JSON (caller handles it).
 * @param {string} str
 * @returns {object}
 */
export function fromJSON(str) {
  return JSON.parse(str);
}

/** CSV columns, in order. */
const CSV_COLUMNS = [
  'week',
  'day',
  'type',
  'releaseDate',
  'status',
  'title',
  'stylePrompt',
  'excludePrompt',
  'mood',
  'vocalGender',
  'weirdness',
  'styleInfluence',
];

/**
 * Escape a single CSV field: wrap in double quotes when it contains a comma,
 * quote, or newline, doubling any embedded quotes.
 * @param {*} value
 * @returns {string}
 */
function escapeCSVField(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialize a plan's tracks to CSV: a header row plus one row per track.
 * @param {object} plan
 * @returns {string}
 */
export function toCSV(plan) {
  const tracks = (plan && plan.tracks) || [];
  const rows = [CSV_COLUMNS.join(',')];
  for (const track of tracks) {
    const row = CSV_COLUMNS.map((col) => escapeCSVField(track[col]));
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

/**
 * Build a copy-ready YouTube description for a single track: the title, the
 * key track details, a note that the audio was generated with Suno AI, and
 * hashtags.
 * @param {object} track
 * @returns {string}
 */
export function buildYouTubeDescription(track) {
  const lines = [
    track.title,
    '',
    `🎵 Genre: ${track.genre || 'K-Pop'}`,
    `📅 Release: ${track.releaseDate}`,
    `🎚️ Mood: ${track.mood}`,
    '',
    '🤖 Audio generated with Suno AI.',
    'Planned and organized with SunoFlow.',
    '',
  ];

  const tags = new Set();
  if (track.genre) tags.add(track.genre.replace(/[^a-zA-Z0-9]+/g, ''));
  tags.add('KPop');
  tags.add('SunoAI');
  tags.add('AIMusic');
  if (track.type === 'shorts') tags.add('Shorts');
  if (track.type === 'shorts' && track.shortsHookGuide) {
    for (const h of track.shortsHookGuide.captionHashtags || []) tags.add(h);
  }
  lines.push([...tags].map((t) => `#${t}`).join(' '));

  return lines.join('\n');
}

/**
 * Render a plan as a well-formed GitHub-flavoured Markdown table. Pipe
 * characters inside cell text are escaped so the table stays valid.
 * @param {object} plan
 * @returns {string}
 */
export function toMarkdownTable(plan) {
  const tracks = (plan && plan.tracks) || [];
  const headers = ['Week', 'Day', 'Type', 'Release', 'Status', 'Title', 'Style', 'Mood'];
  const escapeCell = (v) => (v == null ? '' : String(v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' '));

  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
  for (const t of tracks) {
    const cells = [
      t.week,
      t.day,
      t.type,
      t.releaseDate,
      t.status,
      t.title,
      t.stylePrompt,
      t.mood,
    ].map(escapeCell);
    lines.push(`| ${cells.join(' | ')} |`);
  }
  return lines.join('\n');
}
