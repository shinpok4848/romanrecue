// structureProfiles.js
// The 15 canonical SunoFlow song structures. Section labels and order are a
// product contract: generation renders these labels verbatim inside brackets.

const NO_LYRIC_SECTIONS = [
  'Interlude',
  'Instrumental',
  'Solo',
  'Guitar Solo',
  'Key Change',
  'End',
  'Fade Out',
];

function profile({
  id,
  nameKo,
  nameEn,
  sections,
  strongestHookTag,
  rationale,
  producerPrescription,
  hookResolution = 'chorus',
  vocalContrast = null,
}) {
  return {
    id,
    nameKo,
    nameEn,
    name: { ko: nameKo, en: nameEn },
    sections,
    strongestHookTag,
    rationale,
    producerPrescription,
    rules: {
      intro: 'short-cold-open',
      energyArc: 'sparse -> builds -> explodes/emotional peak -> calmer ending',
      vocalMix: 'up-front vocal with sparse backing under vocal sections',
      verse2: 'develop the story with 3 or 5 lines and a changed arrangement',
      transition: 'bridge or designated transition prevents block-like flow',
      hookResolution,
      vocalContrast,
      noLyricSections: NO_LYRIC_SECTIONS,
      termination: sections.at(-1),
    },
  };
}

/** Canonical order is intentionally stable and matches the structure manual. */
export const STRUCTURE_PROFILES = [
  profile({
    id: 'pop',
    nameKo: '팝',
    nameEn: 'Pop',
    sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '짧은 도입과 성긴 벌스 뒤 프리코러스가 긴장을 올려 세 번의 코러스 훅을 점층적으로 각인한다.',
    producerPrescription: '인트로는 콜드 오픈처럼 짧게, 벌스 반주는 비우고 프리코러스에서만 리프트를 만든다. 두 번째 벌스는 시점과 길이를 바꾸며 브리지에서 흐름을 전환하고, 마지막 코러스를 정점으로 만든 뒤 잔잔한 아웃트로와 [End]로 닫는다.',
  }),
  profile({
    id: 'k-ballad',
    nameKo: '케이 발라드',
    nameEn: 'K-Ballad',
    sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Key Change', 'Final Chorus', 'Outro', 'End'],
    strongestHookTag: 'Final Chorus',
    rationale: '절제된 서사에서 브리지로 감정을 뒤집고 단 한 번의 전조 직후 파이널 코러스로 최대 여운을 만든다.',
    producerPrescription: '피아노 중심의 짧은 도입과 성긴 벌스로 시작해 보컬을 전면에 둔다. 초반 [Whisper]와 전조 뒤 [Belting]을 반드시 한 쌍으로만 사용하며, [Key Change]는 한 번만 [Final Chorus] 바로 앞에 둔다. 아웃트로에서 온도를 낮추고 [End]로 끝낸다.',
    vocalContrast: { soft: 'Whisper', peak: 'Belting' },
  }),
  profile({
    id: 'emotional-rnb',
    nameKo: '감성 알앤비 / 네오소울',
    nameEn: 'Emotional R&B / Neo-soul',
    sections: ['Chorus', 'Verse 1', 'Chorus', 'Interlude', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '첫 코러스 콜드 오픈으로 훅을 선점하고 네오소울 벌스와 무가사 인터루드가 보컬의 호흡과 감정 변화를 살린다.',
    producerPrescription: '첫 코러스는 짧고 선명하게 제시하고 벌스의 악기를 성기게 유지한다. [Interlude]는 가사 없이 숨을 만들며, 두 번째 벌스는 행동을 바꾸고 브리지에서 화성을 전환한다. 마지막 코러스 후 차분한 아웃트로와 [End]로 마감한다.',
  }),
  profile({
    id: 'city-pop',
    nameKo: '시티 팝',
    nameEn: 'City Pop',
    sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Solo', 'Chorus', 'Outro', 'Fade Out'],
    strongestHookTag: 'Chorus',
    rationale: '야간 드라이브 그루브를 두 번 끌어올린 뒤 무가사 솔로로 색채를 환기하고 마지막 훅을 페이드아웃으로 남긴다.',
    producerPrescription: '도입은 짧은 신스 리프로 열고 벌스에서는 보컬 뒤 공간을 넓힌다. 프리코러스의 리프트와 코러스의 밝기를 대비시키고 [Solo]에는 가사를 쓰지 않는다. 마지막 코러스 뒤 아웃트로를 낮춰 [Fade Out]으로 명확히 종료한다.',
  }),
  profile({
    id: 'acoustic-folk',
    nameKo: '어쿠스틱 / 포크',
    nameEn: 'Acoustic / Folk',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '간결한 반복 구조가 자연스러운 이야기 전달과 함께 부르기 쉬운 코러스의 친밀함을 극대화한다.',
    producerPrescription: '한두 마디 악기와 짧은 보컬 도입으로 시작하고 벌스는 손에 잡히는 장면을 담는다. 두 번째 벌스의 길이와 동작을 바꾸며 브리지에서 깨달음을 제시한다. 마지막 합창 훅 뒤 작은 아웃트로와 [End]로 닫는다.',
  }),
  profile({
    id: 'indie-alternative',
    nameKo: '인디 / 얼터너티브',
    nameEn: 'Indie / Alternative',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Instrumental', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '직선적인 벌스·코러스 사이 브리지와 무가사 인스트루멘털이 질감 변화와 비정형적인 숨을 만든다.',
    producerPrescription: '짧고 개성 있는 리프로 열되 보컬 구간의 반주는 비운다. 두 번째 벌스는 다른 길이와 악기 층으로 전개하고 브리지 뒤 [Instrumental]은 가사 없이 환기한다. 마지막 코러스를 정점으로 아웃트로와 [End]에서 안정시킨다.',
  }),
  profile({
    id: 'dance-edm',
    nameKo: '댄스 / 이디엠',
    nameEn: 'Dance / EDM',
    sections: ['Intro', 'Verse 1', 'Build up', 'Drop', 'Verse 2', 'Build up', 'Drop', 'Bridge', 'Build up', 'Drop', 'Outro', 'End'],
    strongestHookTag: 'Drop',
    rationale: '세 번의 빌드업과 드롭을 반드시 짝지어 긴장과 폭발을 반복하고 브리지가 마지막 낙차를 더 크게 만든다.',
    producerPrescription: '콜드 오픈 뒤 벌스 킥과 저역을 절제한다. 각 [Build up]은 두 줄로 점점 짧아져 바로 [Drop]으로 해소되어야 하며 드롭 훅은 구호처럼 단순하게 만든다. 브리지로 패턴을 끊고 마지막 드롭을 최대치로 연 뒤 아웃트로와 [End]로 정리한다.',
    hookResolution: 'build-up-to-drop',
  }),
  profile({
    id: 'hip-hop-trap',
    nameKo: '힙합 / 트랩',
    nameEn: 'Hip-hop / Trap',
    sections: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Bridge', 'Hook', 'Outro', 'End'],
    strongestHookTag: 'Hook',
    rationale: '서사 밀도가 높은 두 벌스 사이 짧은 훅을 반복하고 브리지의 플로 전환으로 마지막 훅의 중독성을 높인다.',
    producerPrescription: '도입은 한 문장 태그처럼 짧게, 벌스에서는 808과 드럼을 보컬 아래 성기게 둔다. 두 번째 벌스는 관점과 바 수를 바꾸며 [Hook]은 따라 하기 쉬운 짧은 구호로 만든다. 브리지에서 플로를 반전한 뒤 마지막 훅, 차분한 아웃트로, [End] 순으로 닫는다.',
  }),
  profile({
    id: 'rock-band',
    nameKo: '록 / 밴드',
    nameEn: 'Rock / Band',
    sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Guitar Solo', 'Bridge', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '리프 중심 벌스와 프리코러스의 상승 뒤 코러스를 폭발시키고 기타 솔로와 브리지로 마지막 합창을 준비한다.',
    producerPrescription: '짧은 시그니처 리프로 열고 벌스 기타는 보컬을 가리지 않게 줄인다. 프리코러스에서 드럼과 화음을 들어 올리고 [Guitar Solo]에는 가사를 넣지 않는다. 브리지가 블록감을 끊은 뒤 마지막 코러스를 밴드 정점으로, 아웃트로와 [End]를 명확한 종지로 둔다.',
  }),
  profile({
    id: 'lo-fi',
    nameKo: '로파이',
    nameEn: 'Lo-fi',
    sections: ['Intro', 'Verse', 'Chorus', 'Interlude', 'Verse', 'Chorus', 'Outro', 'Fade Out'],
    strongestHookTag: 'Chorus',
    rationale: '짧은 두 벌스와 코러스 사이 무가사 인터루드가 반복 청취에 맞는 느슨한 호흡과 포근한 여백을 만든다.',
    producerPrescription: '도입은 작은 룸 톤과 한 줄로 제한하고 보컬을 가까이 둔다. 첫 [Verse]는 4줄 장면, 두 번째 [Verse]는 3줄 또는 5줄의 변화된 행동으로 쓴다. [Interlude]는 가사 없이 숨을 주고 마지막 코러스 뒤 아웃트로를 낮춰 [Fade Out]으로 끝낸다.',
  }),
  profile({
    id: 'ost-cinematic',
    nameKo: '오에스티 / 시네마틱',
    nameEn: 'OST / Cinematic',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Interlude', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Key Change', 'Final Chorus', 'Outro', 'End'],
    strongestHookTag: 'Final Chorus',
    rationale: '무가사 인터루드와 브리지가 영화적 호흡을 만들고 단 한 번의 전조 뒤 파이널 코러스가 서사의 절정을 완성한다.',
    producerPrescription: '짧은 피아노 콜드 오픈과 가까운 [Whisper] 보컬로 출발해 오케스트라를 단계적으로 쌓는다. [Interlude]는 무가사, [Key Change]는 한 번만 [Final Chorus] 바로 앞에 두고 그곳에서만 [Belting]으로 짝을 완성한다. 아웃트로를 가라앉혀 [End]로 종결한다.',
    vocalContrast: { soft: 'Whisper', peak: 'Belting' },
  }),
  profile({
    id: 'trot',
    nameKo: '트로트',
    nameEn: 'Trot',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '명료한 두 벌스와 세 번의 후렴이 이야기와 꺾기 멜로디를 쉽게 전달하며 브리지가 마지막 흥을 환기한다.',
    producerPrescription: '도입은 짧은 시그니처 리듬으로 열고 벌스 반주는 보컬 꺾기를 가리지 않게 비운다. 두 번째 벌스는 새로운 행동과 3줄 또는 5줄 길이로 변주하고 브리지에서 정서를 뒤집는다. 마지막 후렴을 최고조로 만든 뒤 아웃트로와 [End]로 또렷하게 끝낸다.',
  }),
  profile({
    id: 'jazz-swing',
    nameKo: '재즈 / 스윙',
    nameEn: 'Jazz / Swing',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Solo', 'Verse 2', 'Chorus', 'Solo', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '보컬 스토리와 두 번의 무가사 솔로가 교대해 스윙의 즉흥성과 충분한 호흡을 확보한다.',
    producerPrescription: '짧은 카운트인 감각으로 열고 보컬 구간의 컴핑을 성기게 유지한다. 두 [Solo]에는 가사를 넣지 않고 서로 다른 악기로 숨을 만든다. 두 번째 벌스는 관점과 길이를 바꾸고 두 번째 코러스를 감정 정점으로 올린 뒤 작은 아웃트로와 [End]로 종지한다.',
  }),
  profile({
    id: 'synthwave-retro',
    nameKo: '신스웨이브 / 레트로',
    nameEn: 'Synthwave / Retro',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Instrumental', 'Bridge', 'Chorus', 'Outro', 'Fade Out'],
    strongestHookTag: 'Chorus',
    rationale: '펄스형 벌스와 넓은 코러스 뒤 무가사 인스트루멘털이 레트로 신스의 색채를 펼치고 페이드아웃 여운을 만든다.',
    producerPrescription: '짧은 아르페지오 콜드 오픈 뒤 벌스 레이어를 절제한다. 두 번째 벌스는 새로운 이동 장면과 다른 길이로 쓰고 [Instrumental]은 가사 없이 신스가 호흡한다. 브리지 뒤 마지막 코러스를 넓게 터뜨린 다음 아웃트로를 낮춰 [Fade Out]으로 닫는다.',
  }),
  profile({
    id: 'uk-garage',
    nameKo: '유케이 개러지',
    nameEn: 'UK Garage',
    sections: ['Intro', 'Verse 1', 'Build up', 'Chorus', 'Verse 2', 'Build up', 'Chorus', 'Bridge', 'Instrumental', 'Chorus', 'Outro', 'End'],
    strongestHookTag: 'Chorus',
    rationale: '스킵 비트의 성긴 벌스에서 빌드업이 드롭 대신 코러스로 해소되고 무가사 인스트루멘털이 마지막 훅의 공간을 만든다.',
    producerPrescription: '짧은 보컬 촙 콜드 오픈과 성긴 투스텝 벌스로 시작한다. 매 [Build up]은 두 줄로 상승하지만 매뉴얼 구조에 드롭이 없으므로 곧바로 [Chorus]에 해소한다. 브리지와 무가사 [Instrumental]로 블록감을 끊고 마지막 코러스 후 아웃트로와 [End]로 마감한다.',
    hookResolution: 'build-up-to-chorus',
  }),
];

export const STRUCTURE_BY_ID = Object.fromEntries(
  STRUCTURE_PROFILES.map((item) => [item.id, item]),
);

export function getStructureProfile(id) {
  return STRUCTURE_BY_ID[id] || STRUCTURE_BY_ID.pop;
}

export function formatStructure(sections) {
  return (Array.isArray(sections) ? sections : []).map((section) => `[${section}]`).join(' → ');
}
