// genrePresets.js
//
// SunoFlow curated genre preset dictionary for the Suno v6 prompt engine.
// Pure data + a tiny helper. NO DOM access — safe to import in node:test.
//
// ============================================================================
// HOW TO ADD A NEW PRESET (read this first, future-you)
// ============================================================================
// The user keeps sending real Suno prompt examples. Each example maps onto ONE
// preset object below. To add a new genre, copy an existing object in the right
// pool (EMOTIONAL for Wed "Deep & Narrative", ENERGETIC for Fri "Weekend Upbeat
// & Viral") and fill in every field. The prompt engine assembles the exact
// ground-truth structure from these fields:
//
//   "K-Pop <genre> at <BPM> BPM in <Key>, <productionPhrase>,
//    <instruments joined>, <one vocalCharacterization>, <dynamicCurve>,
//    <finishingTags joined>"
//
// So keep the wording in each field CONCISE and comma-safe (no stray commas
// inside a single instrument/tag unless you intend a new tag).
//
// ----------------------------------------------------------------------------
// SCHEMA — every preset object MUST provide these fields:
// ----------------------------------------------------------------------------
//   genre                : string  — the label placed after "K-Pop " in the
//                                     style prompt (e.g. "Nostalgic 90s R&B
//                                     Ballad", "EDM Hip-Hop Festival Anthem").
//   bpmRange             : [min,max] — inclusive BPM band; engine picks within.
//   keys                 : string[] — compatible musical keys, e.g.
//                                     "G minor", "Ab Major", "E Major".
//   productionPhrase     : string  — mastering/production quality clause, e.g.
//                                     "Master-grade audiophile production".
//   instruments          : string[] — instrumentation tags, comma-joined in the
//                                     prompt (e.g. "808 sub-bass",
//                                     "punchy EDM kick drum").
//   vocalCharacterizations : string[] — full phrases INCLUDING mix position,
//                                     e.g. "The male lead vocal is mixed up
//                                     front, delivering an energetic rap flow".
//                                     Engine picks one per track.
//   dynamicCurve         : string  — arrangement/dynamics clause, e.g. "starts
//                                     sparse in verses, builds with aggressive
//                                     snare rolls, explodes into a heavy drop".
//   finishingTags        : string[] — closing quality tags drawn from the
//                                     observed set: "zero volume pumping",
//                                     "flawless transitions",
//                                     "wide 3D stereo panning",
//                                     "warm analog tape saturation", etc.
//   moodWords            : string[] — curated MOOD keywords for the v6 Mood
//                                     field. Kept DISTINCT from the style tags
//                                     so Mood reads differently from Style.
//   excludeExtra         : string[] — genre-contrast exclude tokens specific to
//                                     this genre (e.g. a ballad excludes
//                                     "fast", "edm", "rock", "harsh drums").
//   vocalGender          : "Female"|"Male"|"Duet"|"Instrumental"
//   weirdnessRange       : [min,max] — 0-100. Emotional/pop lower (~20-45),
//                                     energetic/experimental higher (up to ~85).
//   styleInfluenceRange  : [min,max] — 0-100, default band ~60-80.
//   lyricStructure       : string[] — section hints for the Lyrics guidance
//                                     (e.g. "Intro", "Verse 1", "Pre-Chorus",
//                                     "Chorus (hook)", "Bridge", "Outro").
// ============================================================================

/**
 * Shared degradation tokens excluded from EVERY track. The prompt engine
 * appends each preset's `excludeExtra` genre-contrast tokens after these.
 * Sourced from the recurring negative tokens across the four ground-truth
 * examples (vocal fry, scratchy voice, robotic, autotune, volume pumping,
 * muddy mix, off-beat, boring/long intro).
 */
export const DEFAULT_EXCLUDE = [
  'vocal fry',
  'scratchy voice',
  'robotic',
  'autotune',
  'volume pumping',
  'muddy mix',
  'off-beat',
  'boring intro',
];

/**
 * EMOTIONAL pool — Wednesday "Deep & Narrative" main tracks.
 * Warm, intimate, narrative-driven. Wording anchored on the ground-truth
 * R&B ballad, acoustic indie funk, and warm acoustic folk examples.
 */
export const EMOTIONAL = [
  {
    genre: 'Nostalgic 90s R&B Ballad',
    bpmRange: [68, 84],
    keys: ['Ab Major', 'Db Major', 'Eb Major', 'F minor'],
    productionPhrase:
      'Ultra-high resolution, master-grade audiophile production focusing on intimate room acoustics',
    instruments: [
      'vintage Rhodes Mark I electric piano',
      'smooth deep upright bass groove',
      'gentle brushed snare drums',
      'lush background vocal harmonies',
    ],
    vocalCharacterizations: [
      'The male lead vocal is deeply atmospheric, conversational, and meticulously forward in the mix, delivering a long-breath prose-like rhythm entirely free of vocal fry',
      'The female lead vocal is intimate, velvety, and forward in the mix, gliding through smooth melismatic runs entirely free of vocal fry',
    ],
    dynamicCurve:
      'strict 4-bar phrasing that swells gently into lush harmony-stacked choruses and settles back for the verses',
    finishingTags: [
      'zero volume pumping',
      'cozy and warm analog tape saturation vibe',
      'wide 3D stereo panning',
    ],
    moodWords: ['nostalgic', 'intimate', 'tender', 'late-night', 'bittersweet', 'romantic'],
    excludeExtra: ['fast', 'edm', 'rock', 'electronic synths', 'harsh drums'],
    vocalGender: 'Male',
    weirdnessRange: [20, 38],
    styleInfluenceRange: [62, 80],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Bridge', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'Acoustic Indie Singer-Songwriter Funk Groove',
    bpmRange: [88, 102],
    keys: ['E Major', 'A Major', 'D Major', 'G Major'],
    productionPhrase:
      'pristine audiophile production with stable sidechain compression and zero volume pumping',
    instruments: [
      'highly syncopated fingerpicked acoustic guitar',
      'warm upright bass',
      'snappy cajon',
      'intimate acoustic room resonance',
    ],
    vocalCharacterizations: [
      'The male lead vocal is conversational, warm, and highly rhythmic, moving through staccato playfulness, soaring emotion, and a whispery rhythmic outro',
      'The female lead vocal is warm and playful, forward in the mix, weaving syncopated phrasing into a whispery rhythmic outro',
    ],
    dynamicCurve:
      'flawless 4-bar loops carrying a catchy syncopated hook that lifts from playful verses into a soaring chorus',
    finishingTags: [
      'zero volume pumping',
      '100% natural human choir',
      'organic acoustic backing vocals',
      'clean natural voices',
    ],
    moodWords: ['playful', 'warm', 'groovy', 'heartfelt', 'sunlit', 'carefree'],
    excludeExtra: [
      'vocoder',
      'synth choir',
      'electronic vocals',
      'artificial choir',
      'EDM choir',
      'pitch correction',
      'synthetic voices',
      'slow',
      'sad ballad',
      'heavy rock',
    ],
    vocalGender: 'Male',
    weirdnessRange: [24, 42],
    styleInfluenceRange: [60, 78],
    lyricStructure: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Bridge', 'Whispery Outro'],
  },
  {
    genre: 'Warm Acoustic Folk',
    bpmRange: [68, 82],
    keys: ['G Major', 'C Major', 'D Major', 'A Major'],
    productionPhrase:
      'Pristine audiophile production featuring sidechain compression on the instrumental for a clear vocal ducking effect',
    instruments: [
      'fingerpicked nylon guitar',
      'soft cajon',
      'warm brushed percussion',
    ],
    vocalCharacterizations: [
      'The female lead vocal is strictly forward in the mix, breathy, cheerful, and encouraging, entirely free of vocal fry',
      'The male lead vocal is strictly forward in the mix, breathy, gentle, and encouraging, entirely free of vocal fry',
    ],
    dynamicCurve:
      'flawless 4-bar loops with a gentle build from an intimate verse into an uplifting sing-along chorus',
    finishingTags: ['zero volume pumping', 'ultra-crisp acoustic resonance', 'wide 3D stereo panning'],
    moodWords: ['hopeful', 'cozy', 'uplifting', 'gentle', 'sincere', 'sunrise-warm'],
    excludeExtra: ['upbeat', 'EDM', 'loud drums', 'heavy distortion'],
    vocalGender: 'Female',
    weirdnessRange: [20, 36],
    styleInfluenceRange: [60, 78],
    lyricStructure: ['Intro', 'Verse 1', 'Chorus (sing-along hook)', 'Verse 2', 'Chorus', 'Soft Outro'],
  },
  {
    genre: 'Cinematic Ballad',
    bpmRange: [56, 76],
    keys: ['C minor', 'D minor', 'Bb Major', 'F Major'],
    productionPhrase:
      'Master-grade audiophile production with a wide cinematic orchestral hall image',
    instruments: [
      'expressive grand piano',
      'lush sweeping strings',
      'warm french horn',
      'soft timpani swells',
    ],
    vocalCharacterizations: [
      'The female lead vocal is emotive and forward in the mix, building from a fragile whisper into a soaring belted climax entirely free of vocal fry',
      'The male lead vocal is emotive and forward in the mix, rising from a restrained croon into a powerful climactic belt entirely free of vocal fry',
    ],
    dynamicCurve:
      'starts sparse and fragile in the verses, swells with layered strings in the pre-chorus, and blooms into a sweeping orchestral climax',
    finishingTags: ['zero volume pumping', 'flawless transitions', 'wide 3D stereo panning'],
    moodWords: ['epic', 'melancholic', 'sweeping', 'dramatic', 'yearning', 'tearful'],
    excludeExtra: ['fast', 'edm', 'harsh drums', 'distorted guitar', 'trap hi-hats'],
    vocalGender: 'Female',
    weirdnessRange: [30, 50],
    styleInfluenceRange: [66, 84],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (emotional peak)', 'Verse 2', 'Bridge (climax)', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'City Pop',
    bpmRange: [96, 116],
    keys: ['F Major', 'Bb Major', 'A Major', 'E Major'],
    productionPhrase:
      'Master-grade audiophile production with lush 80s analog warmth and punchy gated reverb',
    instruments: [
      'chorus-drenched electric piano',
      'slap bass groove',
      'clean funk guitar',
      'analog synth brass',
    ],
    vocalCharacterizations: [
      'The female lead vocal is silky and forward in the mix, gliding through breezy legato phrasing entirely free of vocal fry',
      'The male lead vocal is smooth and forward in the mix, delivering a nostalgic nightdrive croon entirely free of vocal fry',
    ],
    dynamicCurve:
      'a steady groovy verse that lifts into a bright, shimmering chorus with layered synth-brass hits',
    finishingTags: ['zero volume pumping', 'warm analog tape saturation', 'wide 3D stereo panning'],
    moodWords: ['retro', 'breezy', 'urban nightdrive', 'romantic', 'neon', 'wistful'],
    excludeExtra: ['heavy rock', 'harsh distortion', 'trap drums', 'lo-fi noise'],
    vocalGender: 'Female',
    weirdnessRange: [28, 46],
    styleInfluenceRange: [64, 80],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Bridge', 'Chorus', 'Outro'],
  },
  {
    genre: 'Lofi',
    bpmRange: [70, 88],
    keys: ['C Major', 'A minor', 'F Major', 'D minor'],
    productionPhrase:
      'warm audiophile lo-fi production with cozy tape hiss and gentle sidechained warmth',
    instruments: [
      'dusty Rhodes chords',
      'mellow upright bass',
      'boom-bap brushed drums',
      'soft vinyl crackle',
    ],
    vocalCharacterizations: [
      'The female lead vocal is soft, hushed, and forward in the mix, half-sung and intimate entirely free of vocal fry',
      'The male lead vocal is soft, hushed, and forward in the mix, half-spoken and intimate entirely free of vocal fry',
    ],
    dynamicCurve:
      'a relaxed looping groove with subtle rises, never breaking the mellow late-night mood',
    finishingTags: ['zero volume pumping', 'warm analog tape saturation', 'wide 3D stereo panning'],
    moodWords: ['calm', 'introspective', 'rainy', 'study-mood', 'dreamy', 'mellow'],
    excludeExtra: ['fast', 'edm', 'harsh drums', 'loud distortion', 'aggressive'],
    vocalGender: 'Female',
    weirdnessRange: [30, 52],
    styleInfluenceRange: [60, 76],
    lyricStructure: ['Intro', 'Verse (mellow)', 'Hook', 'Verse', 'Hook', 'Fade Outro'],
  },
  {
    genre: 'Indie Pop',
    bpmRange: [92, 118],
    keys: ['D Major', 'G Major', 'A Major', 'E Major'],
    productionPhrase:
      'pristine audiophile production with airy reverb and gentle sidechain compression',
    instruments: [
      'jangly clean electric guitar',
      'soft analog synth pad',
      'live drum kit',
      'shimmering tambourine',
    ],
    vocalCharacterizations: [
      'The female lead vocal is bright and forward in the mix, heartfelt and slightly hazy entirely free of vocal fry',
      'The male lead vocal is bright and forward in the mix, heartfelt and slightly hazy entirely free of vocal fry',
    ],
    dynamicCurve:
      'an understated verse that opens up into a wide, anthemic, hook-driven chorus',
    finishingTags: ['zero volume pumping', 'flawless transitions', 'wide 3D stereo panning'],
    moodWords: ['nostalgic', 'bittersweet', 'hazy', 'heartfelt', 'youthful', 'wistful'],
    excludeExtra: ['heavy rock', 'harsh distortion', 'trap drums', 'aggressive edm'],
    vocalGender: 'Female',
    weirdnessRange: [24, 44],
    styleInfluenceRange: [60, 78],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Bridge', 'Final Chorus', 'Outro'],
  },
];

/**
 * ENERGETIC pool — Friday "Weekend Upbeat & Viral" main tracks.
 * High-energy, drop-driven, festival-ready. Wording anchored on the
 * ground-truth EDM Hip-Hop Festival Anthem example.
 */
export const ENERGETIC = [
  {
    genre: 'EDM Hip-Hop Festival Anthem',
    bpmRange: [124, 132],
    keys: ['G minor', 'A minor', 'F minor', 'C minor'],
    productionPhrase: 'Master-grade audiophile production, cold open',
    instruments: [
      'hard-hitting 808 sub-bass',
      'punchy EDM kick drum',
      'wild triumphant Western-style brass stabs',
    ],
    vocalCharacterizations: [
      'The male lead vocal is mixed up front, delivering an energetic rap flow and highly rhythmic staccato chanting',
      'The female lead vocal is mixed up front, delivering a fierce rap flow and highly rhythmic staccato chanting',
    ],
    dynamicCurve:
      'starts sparse during verses, rapidly builds with aggressive snare rolls in the pre-chorus, and explodes into a massive heavy brass drop for the chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'wide 3D stereo panning'],
    moodWords: ['triumphant', 'explosive', 'aggressive', 'euphoric', 'hype', 'stadium'],
    excludeExtra: ['slow', 'sad ballad', 'acoustic', 'rock', 'traditional', 'long intro'],
    vocalGender: 'Male',
    weirdnessRange: [40, 68],
    styleInfluenceRange: [66, 84],
    lyricStructure: ['Cold Open', 'Verse 1 (rap)', 'Pre-Chorus (build)', 'Drop / Chorus (chant hook)', 'Verse 2 (rap)', 'Bridge', 'Final Drop', 'Outro'],
  },
  {
    genre: 'Synthwave',
    bpmRange: [100, 122],
    keys: ['A minor', 'E minor', 'D minor', 'F# minor'],
    productionPhrase: 'Master-grade audiophile production with an 80s neon sheen and punchy compression',
    instruments: [
      'analog synth lead',
      'gated-reverb drums',
      'fat bass synth',
      'arpeggiated synth sequence',
    ],
    vocalCharacterizations: [
      'The male lead vocal is confident and forward in the mix, riding the arpeggios with a driving neon-night energy',
      'The female lead vocal is confident and forward in the mix, soaring over the arpeggios with a driving neon-night energy',
    ],
    dynamicCurve:
      'a pulsing verse groove that surges into a euphoric, wide synth-lead chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'wide 3D stereo panning'],
    moodWords: ['nostalgic', 'driving', 'neon-night', 'euphoric', 'retro-futuristic', 'cinematic'],
    excludeExtra: ['acoustic', 'traditional', 'slow ballad', 'harsh distortion'],
    vocalGender: 'Male',
    weirdnessRange: [42, 66],
    styleInfluenceRange: [64, 82],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Synth Solo', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'Dance-Pop',
    bpmRange: [118, 128],
    keys: ['C Major', 'G Major', 'A minor', 'E minor'],
    productionPhrase: 'bright radio-ready master-grade audiophile production with a wide festival mix',
    instruments: [
      'supersaw synth chords',
      'four-on-the-floor kick',
      'bright pluck synth',
      'layered clap stack',
    ],
    vocalCharacterizations: [
      'The female lead vocal is bright and mixed up front, delivering an infectious, punchy topline hook entirely free of vocal fry',
      'The male lead vocal is bright and mixed up front, delivering an infectious, punchy topline hook entirely free of vocal fry',
    ],
    dynamicCurve:
      'builds tension through a filtered pre-chorus and releases into a huge, euphoric festival chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'wide 3D stereo panning'],
    moodWords: ['uplifting', 'party', 'anthemic', 'euphoric', 'sun-soaked', 'viral'],
    excludeExtra: ['slow', 'sad ballad', 'acoustic', 'traditional', 'long intro'],
    vocalGender: 'Female',
    weirdnessRange: [22, 40],
    styleInfluenceRange: [62, 80],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus (build)', 'Chorus (drop hook)', 'Verse 2', 'Bridge', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'Nu-Disco',
    bpmRange: [110, 124],
    keys: ['F Major', 'Bb Major', 'D minor', 'G minor'],
    productionPhrase: 'warm analog master-grade audiophile production with a vintage disco mix',
    instruments: [
      'funky wah rhythm guitar',
      'lush disco strings',
      'punchy bass synth',
      'live tambourine and congas',
    ],
    vocalCharacterizations: [
      'The duet vocals are warm and forward in the mix, trading call-and-response phrases with groovy swagger entirely free of vocal fry',
      'The female lead vocal is warm and forward in the mix, riding the groove with disco swagger entirely free of vocal fry',
    ],
    dynamicCurve:
      'a relentless four-on-the-floor groove that lifts into a string-stabbed, hands-in-the-air chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'warm analog tape saturation'],
    moodWords: ['groovy', 'feel-good', 'dancefloor', 'sunny', 'funky', 'celebratory'],
    excludeExtra: ['slow ballad', 'acoustic folk', 'heavy metal', 'harsh distortion', 'long intro'],
    vocalGender: 'Duet',
    weirdnessRange: [30, 52],
    styleInfluenceRange: [62, 80],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Breakdown', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'Electro Pop',
    bpmRange: [108, 126],
    keys: ['A minor', 'C Major', 'E minor', 'G Major'],
    productionPhrase: 'crisp digital master-grade audiophile production with punchy transients and a wide modern mix',
    instruments: [
      'crunchy synth bass',
      'glitchy percussion',
      'bright synth stabs',
      'chopped vocal samples',
    ],
    vocalCharacterizations: [
      'The female lead vocal is punchy and mixed up front, alternating catchy hooks with rhythmic vocal chops entirely free of vocal fry',
      'The male lead vocal is punchy and mixed up front, alternating catchy hooks with rhythmic vocal chops entirely free of vocal fry',
    ],
    dynamicCurve:
      'a tight, glitchy verse that snaps into a bold, hook-forward electro chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'wide 3D stereo panning'],
    moodWords: ['energetic', 'catchy', 'playful', 'modern', 'electric', 'bold'],
    excludeExtra: ['slow ballad', 'acoustic', 'traditional', 'muted', 'long intro'],
    vocalGender: 'Female',
    weirdnessRange: [34, 58],
    styleInfluenceRange: [60, 80],
    lyricStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus (hook)', 'Verse 2', 'Bridge', 'Final Chorus', 'Outro'],
  },
  {
    genre: 'Rock',
    bpmRange: [120, 156],
    keys: ['E minor', 'A minor', 'D Major', 'G Major'],
    productionPhrase: 'loud, punchy master-grade audiophile production with wide guitar walls',
    instruments: [
      'driving distorted electric guitars',
      'punchy power-chord riffs',
      'thundering live rock drums',
      'growling bass guitar',
    ],
    vocalCharacterizations: [
      'The male lead vocal is powerful and forward in the mix, belting anthemic hooks with gritty stadium energy (no vocal fry artifacts)',
      'The female lead vocal is powerful and forward in the mix, belting anthemic hooks with gritty stadium energy (no vocal fry artifacts)',
    ],
    dynamicCurve:
      'a tight verse riff that explodes into a wide, anthemic, fist-pumping chorus',
    finishingTags: ['flawless transitions', 'zero volume pumping', 'wide 3D stereo panning'],
    moodWords: ['powerful', 'rebellious', 'high-energy', 'stadium', 'defiant', 'raw'],
    excludeExtra: ['slow ballad', 'acoustic', 'lo-fi', 'trap hi-hats', 'muted'],
    vocalGender: 'Male',
    weirdnessRange: [30, 56],
    styleInfluenceRange: [64, 84],
    lyricStructure: ['Intro riff', 'Verse 1', 'Pre-Chorus', 'Chorus (anthem hook)', 'Verse 2', 'Guitar Solo', 'Final Chorus', 'Outro'],
  },
];

/**
 * Convenience accessor. Returns the preset pool for a given mood.
 * @param {'emotional'|'energetic'} mood
 * @returns {Array<object>}
 */
export function getPool(mood) {
  return mood === 'energetic' ? ENERGETIC : EMOTIONAL;
}
