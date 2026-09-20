// conceptPalettes.js
// Curated bilingual semantic palettes. Korean/English title pairs are authored
// data, never machine-translated. Unknown user themes select a seeded fallback
// palette while the sanitized original theme remains visible as a title cue.

import { createNamedRng } from './seededRandom.js';

function palette(data) {
  return {
    ...data,
    aliases: {
      ko: [...(data.aliasesKo || [])],
      en: [...(data.aliasesEn || [])],
    },
  };
}

export const CONCEPT_PALETTES = [
  palette({
    id: 'dawn-night',
    nameKo: '새벽과 밤',
    nameEn: 'Dawn / Night',
    aliasesKo: ['새벽', '밤', '밤공기', '야간', '달빛', '해질녘', '아침'],
    aliasesEn: ['dawn', 'night', 'midnight', 'moonlight', 'sunrise', 'twilight', 'blue hour'],
    emotionalArc: '밤의 고립에서 작은 빛을 발견하고 스스로 아침 쪽으로 걸어 나가는 변화',
    koreanKeywords: ['푸른 새벽', '첫차', '가로등', '아침의 용기'],
    moodKeywords: ['푸른 새벽의 고요', '어둠 끝의 기대'],
    englishProductionCue: 'blue-hour intimacy opening into a luminous sunrise release',
    variants: [
      { id: 'edge-of-dawn', titleKo: '새벽의 끝', titleEn: "At Dawn's Edge", hookPhrase: '새벽의 끝, 나는 빛 쪽으로 가', scene: '첫차가 떠난 푸른 정류장과 젖은 유리창' },
      { id: 'first-bus-light', titleKo: '첫차의 불빛', titleEn: 'First Bus Light', hookPhrase: '첫차의 불빛, 내일을 먼저 비춰 줘', scene: '빈 정류장으로 돌아오는 첫차의 헤드라이트' },
      { id: 'blue-hour-letter', titleKo: '푸른 시간의 편지', titleEn: 'Letter from Blue Hour', hookPhrase: '푸른 시간의 편지, 이제 내가 답할게', scene: '동트기 전 창가에 남겨 둔 접히지 않은 편지' },
      { id: 'before-the-sun', titleKo: '해 뜨기 전 우리', titleEn: 'Us Before Sunrise', hookPhrase: '해 뜨기 전 우리, 한 걸음만 더 가자', scene: '해가 오르기 직전 강변을 나란히 걷는 두 사람' },
      { id: 'night-turns-gold', titleKo: '금빛으로 바뀐 밤', titleEn: 'When Night Turns Gold', hookPhrase: '금빛으로 바뀐 밤, 내 마음도 깨어나', scene: '닫힌 상점 셔터 위로 번지는 첫 햇살' },
      { id: 'quiet-sunrise', titleKo: '조용한 일출', titleEn: 'Quiet Sunrise', hookPhrase: '조용한 일출, 서두르지 않아도 돼', scene: '아무도 없는 옥상 난간 너머 천천히 밝아지는 하늘' },
      { id: 'last-streetlamp', titleKo: '마지막 가로등', titleEn: 'The Last Streetlamp', hookPhrase: '마지막 가로등, 나의 밤을 놓아 줘', scene: '아침빛 속에서 하나씩 꺼지는 골목 가로등' },
      { id: 'morning-finds-me', titleKo: '아침이 나를 찾을 때', titleEn: 'When Morning Finds Me', hookPhrase: '아침이 나를 찾을 때, 나는 여기 서 있을게', scene: '밤새 걷던 발끝에 아침 그림자가 닿는 순간' },
    ],
    lineBank: {
      intro: ['푸른 새벽이 창문 끝을 가볍게 두드려', '마지막 별 하나가 골목 위에 머물러'],
      verse1: ['첫차가 떠난 정류장에 혼자 남아', '젖은 유리 너머 가로등을 세어 보고', '식어 가는 종이컵을 두 손으로 감싸며', '말하지 못한 오늘의 첫 문장을 고른다'],
      verse2: ['신호가 바뀌자 나는 자리에서 일어나', '강바람 묻은 골목을 천천히 건너고', '잠든 이름 대신 내 발소리를 들어', '닫힌 빵집 셔터에 번진 햇빛을 따라', '어제와 다른 방향의 버스에 올라탄다'],
      chorus: ['어둠이 길어도 발끝은 길을 기억해', '작은 창마다 새로운 하루가 켜져', '숨겨 둔 목소리가 하늘 가까이 번져', '늦은 마음까지 따뜻하게 밝혀 줘', '검은 유리 위에 우리의 색을 그려', '한숨의 자리에 환한 숨을 채워', '돌아보지 않아도 별은 뒤에 남아', '오늘의 문을 두 손으로 열어', '아침보다 먼저 서로를 알아봐'],
      chant: ['한 걸음 더, 빛을 따라', '눈을 들어, 길은 열려', '지금 여기, 밤을 넘어', '더 크게, 마음을 밝혀', '멈추지 마, 아침 가까이', '우리의 숨, 하늘 끝까지'],
      bridge: ['그때 꺼진 줄 알았던 창 하나가 켜지고', '기다림도 길을 만드는 일임을 알았어', '밤을 이기려 하지 않고 품에 안으니', '내 안의 작은 아침이 먼저 문을 연다'],
      outro: ['첫 햇살 곁에 긴 밤을 조용히 내려놓아', '멀어지는 첫차 소리와 함께 숨을 고른다'],
    },
  }),
  palette({
    id: 'season-nostalgia',
    nameKo: '계절과 향수',
    nameEn: 'Season / Nostalgia',
    aliasesKo: ['계절', '봄', '여름', '가을', '겨울', '추억', '향수', '첫눈', '초가을'],
    aliasesEn: ['season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'nostalgia', 'memory', 'first snow'],
    emotionalArc: '빛바랜 계절의 기억을 따라가다 과거를 붙잡는 대신 현재의 온기로 간직하는 변화',
    koreanKeywords: ['낡은 사진', '은행잎', '계절 냄새', '다시 걷는 길'],
    moodKeywords: ['계절의 그리움', '따뜻한 회상'],
    englishProductionCue: 'weathered seasonal nostalgia blooming into present-tense warmth',
    variants: [
      { id: 'season-left-behind', titleKo: '두고 온 계절', titleEn: 'The Season We Left', hookPhrase: '두고 온 계절, 오늘은 웃으며 부를게', scene: '은행잎이 쌓인 오래된 학교 담장' },
      { id: 'october-postcard', titleKo: '시월의 엽서', titleEn: 'October Postcard', hookPhrase: '시월의 엽서, 늦은 안부를 전해 줘', scene: '주소가 흐려진 엽서와 가을 우체통' },
      { id: 'first-snow-memory', titleKo: '첫눈의 기억', titleEn: 'Memory of First Snow', hookPhrase: '첫눈의 기억, 녹아도 마음엔 남아', scene: '버스 창에 기대 바라본 첫눈 내리는 골목' },
      { id: 'summer-in-pocket', titleKo: '주머니 속 여름', titleEn: 'Summer in My Pocket', hookPhrase: '주머니 속 여름, 아직 따뜻하게 빛나', scene: '모래가 남은 재킷 주머니와 바랜 영화표' },
      { id: 'returning-spring', titleKo: '돌아오는 봄', titleEn: 'Spring Comes Back', hookPhrase: '돌아오는 봄, 우리도 다시 피어나', scene: '눈 녹은 화단에서 고개를 든 작은 새싹' },
      { id: 'faded-calendar', titleKo: '빛바랜 달력', titleEn: 'Faded Calendar', hookPhrase: '빛바랜 달력, 그날을 이제 넘길게', scene: '지난 날짜에 동그라미가 남은 벽걸이 달력' },
      { id: 'scent-of-september', titleKo: '구월의 향기', titleEn: 'Scent of September', hookPhrase: '구월의 향기, 한 번 더 나를 데려가', scene: '비 온 뒤 운동장에 번지는 초가을 흙냄새' },
      { id: 'four-seasons-later', titleKo: '네 번의 계절 뒤에', titleEn: 'Four Seasons Later', hookPhrase: '네 번의 계절 뒤에, 나는 나를 다시 만나', scene: '사계절 사진이 꽂힌 작은 창가 앨범' },
    ],
    lineBank: {
      intro: ['오래된 달력에서 마른 잎 하나가 떨어져', '비 온 뒤 계절 냄새가 문틈으로 돌아와'],
      verse1: ['은행잎 쌓인 학교 담장을 천천히 따라가', '빛바랜 사진 속 운동화 끈을 다시 바라보고', '문 닫은 문방구 유리에 비친 나를 세우며', '그때 못한 인사를 입안에서 조용히 읽는다'],
      verse2: ['나는 낡은 앨범을 가방 깊이 넣고', '새로 생긴 카페 앞 횡단보도를 건너', '추억이 아닌 오늘의 얼굴을 사진에 담아', '익숙한 골목 끝 낯선 꽃 이름을 묻고', '빈 페이지 위에 이번 계절의 날짜를 쓴다'],
      chorus: ['바람은 지난 이름을 부드럽게 넘겨', '낡은 장면마다 지금의 온기가 번져', '잊는 대신 환하게 간직할 수 있어', '돌아갈 수 없어도 다시 걸을 수 있어', '시간의 모서리가 둥글게 닳아 가', '서늘한 공기 속 두 손은 더 따뜻해', '어제의 우리에게 오늘을 보여 줄게', '새로운 창가에도 같은 햇살이 내려', '계절은 떠나도 마음은 자라나'],
      chant: ['한 장 더, 오늘을 넘겨', '바람 따라, 다시 걸어', '손을 펴, 계절을 안아', '지금부터, 새로 피어나', '우리의 날, 여기 남아', '한 번 더, 환하게 웃어'],
      bridge: ['사진 밖의 내가 먼저 환하게 웃었고', '그리움은 돌아가라는 말이 아니었어', '지나온 날들이 내 등을 밀어 주자', '나는 현재의 문을 망설임 없이 연다'],
      outro: ['낡은 앨범을 덮고 창문을 조금 열어 둬', '새 계절의 냄새 속에 오늘 날짜를 적는다'],
    },
  }),
  palette({
    id: 'drive-freedom',
    nameKo: '드라이브와 자유',
    nameEn: 'Drive / Freedom',
    aliasesKo: ['드라이브', '주말 드라이브', '운전', '도로', '자유', '질주', '고속도로', '여행길'],
    aliasesEn: ['drive', 'driving', 'road trip', 'freedom', 'highway', 'weekend drive', 'open road'],
    emotionalArc: '막힌 일상과 망설임을 출발선 뒤에 두고 열린 도로에서 자기 방향을 선택하는 해방',
    koreanKeywords: ['열린 도로', '차창 바람', '초록 신호', '자유의 속도'],
    moodKeywords: ['탁 트인 해방감', '주말의 설렘'],
    englishProductionCue: 'open-road momentum with windscreen sparkle and a liberating horizon lift',
    variants: [
      { id: 'green-light', titleKo: '초록 신호', titleEn: 'Green Light', hookPhrase: '초록 신호, 이제 우리를 멈추지 마', scene: '새벽 교차로에서 바뀌는 첫 초록불' },
      { id: 'weekend-highway', titleKo: '주말의 고속도로', titleEn: 'Weekend Highway', hookPhrase: '주말의 고속도로, 끝까지 우리답게 달려', scene: '도시 끝 톨게이트를 빠져나가는 토요일 차창' },
      { id: 'windows-down', titleKo: '창문을 내려', titleEn: 'Windows Down', hookPhrase: '창문을 내려, 자유가 먼저 들어오게', scene: '해안도로에서 바람이 가득 들어오는 열린 창문' },
      { id: 'no-map-tonight', titleKo: '지도 없는 밤', titleEn: 'No Map Tonight', hookPhrase: '지도 없는 밤, 마음 가는 쪽으로 달려', scene: '내비게이션을 끄고 만난 낯선 야간 국도' },
      { id: 'beyond-the-exit', titleKo: '다음 출구 너머', titleEn: 'Beyond the Next Exit', hookPhrase: '다음 출구 너머, 새로운 우리가 기다려', scene: '노을 아래 멀어지는 고속도로 출구 표지판' },
      { id: 'full-tank-heart', titleKo: '가득 찬 마음', titleEn: 'A Full Tank Heart', hookPhrase: '가득 찬 마음, 오늘을 전부 달려 보자', scene: '작은 주유소 불빛 아래 가득 채운 연료계' },
      { id: 'road-to-us', titleKo: '우리에게 가는 길', titleEn: 'The Road to Us', hookPhrase: '우리에게 가는 길, 돌아가도 괜찮아', scene: '산길 커브마다 가까워지는 두 사람의 웃음' },
      { id: 'horizon-radio', titleKo: '수평선 라디오', titleEn: 'Horizon Radio', hookPhrase: '수평선 라디오, 이 노래를 더 크게 틀어', scene: '바다와 맞닿은 도로에서 잡히는 오래된 라디오' },
    ],
    lineBank: {
      intro: ['시동 소리 하나로 잠든 거리가 깨어나', '라디오 첫 박자가 차창 위로 튀어 올라'],
      verse1: ['새벽 교차로 흰 정지선 앞에 차를 세워', '대시보드 위 식은 커피를 한 모금 마시고', '도시의 마지막 불빛을 거울 뒤로 밀어 두며', '초록으로 바뀔 순간만 두 손으로 기다린다'],
      verse2: ['신호가 열리자 우리는 강 쪽으로 방향을 틀어', '내비게이션이 모르는 작은 길을 고르고', '창문을 내려 서로의 웃음을 바람에 풀어', '멀어진 빌딩 대신 낮은 구름을 세어 가며', '처음 보는 수평선에 우리의 속도를 맞춘다'],
      chorus: ['차선 끝의 햇빛이 두 눈 가득 번져 와', '정해진 답보다 선명한 바람을 믿어', '돌아가는 길마저 우리의 길이 돼', '멈춘 마음의 엔진이 다시 크게 울려', '도시의 소음은 거울 속 점으로 멀어져', '열린 창 사이로 새로운 이름이 들어와', '오늘의 방향은 우리가 직접 정해', '가벼워진 어깨 위로 하늘이 넓어져', '끝이 안 보여서 더 환하게 웃을 수 있어'],
      chant: ['달려가, 더 멀리', '손을 들어, 바람 높이', '지금 출발, 뒤는 보지 마', '크게 틀어, 우리의 노래', '길을 열어, 마음대로', '한 번 더, 수평선까지'],
      bridge: ['길을 잃은 줄 알았던 작은 커브 너머', '우리가 원한 풍경이 먼저 손을 흔들어', '빠르게 가는 것보다 함께 고르는 방향이', '자유라는 말을 가장 정확하게 들려준다'],
      outro: ['엔진을 낮추고 바다 앞에 잠시 차를 세워', '따뜻한 보닛 곁에서 긴 숨을 함께 고른다'],
    },
  }),
  palette({
    id: 'love-separation',
    nameKo: '사랑과 이별',
    nameEn: 'Love / Separation',
    aliasesKo: ['사랑', '이별', '헤어짐', '그리움', '연인', '작별', '보고 싶어'],
    aliasesEn: ['love', 'breakup', 'separation', 'goodbye', 'longing', 'farewell', 'heartbreak'],
    emotionalArc: '남겨진 흔적을 정면으로 바라보고 상대를 원망하지 않은 채 자기 목소리로 작별하는 수용',
    koreanKeywords: ['빈 의자', '읽지 않은 메시지', '마지막 역', '다정한 작별'],
    moodKeywords: ['다정한 그리움', '절제된 이별'],
    englishProductionCue: 'intimate heartbreak expanding into a dignified cathartic release',
    variants: [
      { id: 'empty-seat', titleKo: '네가 없는 자리', titleEn: 'The Place You Left', hookPhrase: '네가 없는 자리, 이제 내가 나를 안을게', scene: '마주 앉던 카페 창가의 비어 있는 의자' },
      { id: 'last-platform', titleKo: '마지막 승강장', titleEn: 'The Last Platform', hookPhrase: '마지막 승강장, 늦은 작별을 내려놓아', scene: '막차가 떠난 뒤 불이 남은 지하철 승강장' },
      { id: 'unread-goodbye', titleKo: '읽지 못한 안녕', titleEn: 'Unread Goodbye', hookPhrase: '읽지 못한 안녕, 오늘은 끝까지 말할게', scene: '전송하지 못한 메시지가 켜진 휴대전화 화면' },
      { id: 'half-of-umbrella', titleKo: '우산의 빈 쪽', titleEn: 'The Empty Half', hookPhrase: '우산의 빈 쪽, 빗물보다 네가 고여', scene: '한쪽 어깨만 젖는 넓은 검은 우산' },
      { id: 'after-your-name', titleKo: '네 이름 다음', titleEn: 'After Your Name', hookPhrase: '네 이름 다음, 이제 내 이름을 써 내려가', scene: '두 이름이 적혔던 예약표와 빈 서명란' },
      { id: 'gentle-farewell', titleKo: '다정한 작별', titleEn: 'A Tender Farewell', hookPhrase: '다정한 작별, 미워하지 않고 보낼게', scene: '현관 앞에 가지런히 놓인 마지막 상자' },
      { id: 'room-with-echoes', titleKo: '메아리만 남은 방', titleEn: 'A Room of Echoes', hookPhrase: '메아리만 남은 방, 내 목소리로 채울게', scene: '액자를 내린 벽과 크게 들리는 혼자만의 발소리' },
      { id: 'we-were-spring', titleKo: '우리는 봄이었다', titleEn: 'We Were Spring', hookPhrase: '우리는 봄이었다, 그래서 충분히 빛났어', scene: '꽃잎이 붙은 오래된 두 사람의 사진' },
    ],
    lineBank: {
      intro: ['네가 쓰던 컵 옆으로 아침빛이 비껴가', '막차가 떠난 자리엔 안내음만 남아'],
      verse1: ['마주 앉던 카페 창가에 혼자 자리를 잡아', '식지 않은 의자 등받이를 손끝으로 만지고', '읽지 못한 메시지의 시간을 다시 확인하며', '끝내 보내지 못한 한 문장을 천천히 지운다'],
      verse2: ['나는 두 개였던 컵 중 하나를 찬장에 넣고', '네가 고른 커튼을 활짝 걷어 올려', '우리 사진 대신 오늘의 하늘을 바라봐', '비어 있던 서랍에 나의 노트를 놓고', '현관문을 열어 혼자의 저녁을 맞으러 간다'],
      chorus: ['남은 온기까지 억지로 지우진 않을게', '사랑한 시간은 잘못이 아니었으니', '울음이 지나간 자리에도 숨은 이어져', '돌아오지 않아도 나는 걸어갈 수 있어', '너를 부르던 입술로 나를 불러 볼게', '빈 의자 곁에 새로운 햇살이 앉아', '마지막 장면을 다정하게 접어 두고', '서로의 내일을 멀리서 밝혀 줄게', '끝이라는 문 뒤에도 하루는 시작돼'],
      chant: ['안녕 이제, 놓아줄게', '한 걸음 더, 나를 향해', '울어도 돼, 다시 숨 쉬어', '이제부터, 나의 이름', '손을 펴, 밤을 보내', '한 번 더, 나를 안아'],
      bridge: ['문득 너 없는 침묵이 두렵지 않아지고', '혼자 낸 발소리도 노래가 될 수 있었어', '우리의 끝을 실패라고 부르지 않으니', '닫힌 문보다 열린 창이 먼저 보인다'],
      outro: ['빈 컵을 씻어 엎어 두고 불을 낮춰', '잘 자라는 마지막 인사를 나에게 건넨다'],
    },
  }),
  palette({
    id: 'healing-growth',
    nameKo: '치유와 성장',
    nameEn: 'Healing / Growth',
    aliasesKo: ['힐링', '치유', '회복', '성장', '새출발', '괜찮아'],
    aliasesEn: ['healing', 'growth', 'recover', 'recovery', 'new beginning', 'bloom'],
    emotionalArc: '상처를 숨기던 상태에서 작은 돌봄을 반복해 스스로의 속도로 다시 피어나는 회복',
    koreanKeywords: ['금 간 화분', '새잎', '느린 호흡', '다시 피는 마음'],
    moodKeywords: ['포근한 회복', '조용한 용기'],
    englishProductionCue: 'tender close-mic healing that gradually opens into grounded hope',
    variants: [
      { id: 'new-leaf', titleKo: '새잎의 약속', titleEn: 'Promise of a New Leaf', hookPhrase: '새잎의 약속, 느려도 나는 자라나', scene: '금이 간 화분 틈에서 올라온 작은 새잎' },
      { id: 'breathing-room', titleKo: '숨 쉴 자리', titleEn: 'Room to Breathe', hookPhrase: '숨 쉴 자리, 오늘은 나를 위해 남겨 둬', scene: '커튼을 걷은 조용한 방과 열린 창문' },
      { id: 'mended-light', titleKo: '기워 낸 빛', titleEn: 'Mended Light', hookPhrase: '기워 낸 빛, 금 간 마음 사이로 번져', scene: '깨진 유리 조각을 잇듯 벽에 번지는 오후 햇살' },
      { id: 'one-more-step', titleKo: '한 걸음의 용기', titleEn: 'Courage in One Step', hookPhrase: '한 걸음의 용기, 오늘의 나를 데려가', scene: '현관 앞 운동화와 처음 내딛는 산책길' },
      { id: 'slow-bloom', titleKo: '천천히 피는 중', titleEn: 'Blooming Slowly', hookPhrase: '천천히 피는 중, 서두르지 않아도 빛나', scene: '비 온 뒤 늦게 꽃망울을 연 베란다 화분' },
      { id: 'warm-bandage', titleKo: '마음의 붕대', titleEn: 'Bandage for the Heart', hookPhrase: '마음의 붕대, 아픈 곳을 숨기지 않을게', scene: '약상자 옆에 놓인 따뜻한 차 한 잔' },
      { id: 'after-the-rain', titleKo: '비가 그친 자리', titleEn: 'Where the Rain Ended', hookPhrase: '비가 그친 자리, 맑은 내가 다시 보여', scene: '빗물이 마르는 놀이터 벤치와 작은 무지개' },
      { id: 'my-own-pace', titleKo: '나의 속도로', titleEn: 'At My Own Pace', hookPhrase: '나의 속도로, 멈춰도 다시 갈 수 있어', scene: '사람 없는 강변 산책로와 느린 발걸음' },
    ],
    lineBank: {
      intro: ['커튼을 걷자 작은 먼지까지 빛나 보여', '금 간 화분 곁에 새잎 하나 고개를 들어'],
      verse1: ['오래 닫아 둔 창문 앞에 의자를 놓고', '식은 손을 따뜻한 찻잔 둘레에 모아', '괜찮다는 말 대신 느린 숨을 세어 보며', '금이 간 화분에 오늘의 물을 조금 붓는다'],
      verse2: ['나는 현관 앞 운동화의 먼지를 털고', '사람 적은 강변으로 천천히 걸어가', '넘어지지 않는 법보다 일어나는 법을 배우며', '작은 새잎의 방향으로 얼굴을 돌리고', '내일의 나에게 짧은 응원 한 줄을 남긴다'],
      chorus: ['아픈 마음도 숨 쉬면 조금씩 자라나', '느린 걸음마다 단단한 길이 생겨', '금이 간 틈으로 따뜻한 빛이 들어와', '완벽하지 않아도 오늘은 충분해', '나를 기다리는 법을 이제 배워 가', '작은 용기가 두 어깨를 감싸 안아', '멈춘 날들까지 성장의 뿌리가 돼', '다시 웃는 연습이 노래로 이어져', '내 속도로 피어난 색을 믿어 볼게'],
      chant: ['천천히, 숨을 쉬어', '괜찮아, 다시 걸어', '한 걸음 더, 나를 믿어', '손을 펴, 빛을 받아', '오늘부터, 나의 속도', '다시 한번, 피어나'],
      bridge: ['문득 흉터가 나를 망친 선이 아니라', '여기까지 온 길을 그린 지도처럼 보여', '강해져야만 괜찮은 것은 아니라는 걸', '약한 목소리로도 분명하게 말해 본다'],
      outro: ['열어 둔 창으로 저녁바람이 천천히 들어와', '새잎 곁에 앉아 오늘의 숨을 편히 놓는다'],
    },
  }),
  palette({
    id: 'comfort-embrace',
    nameKo: '위로와 안식',
    nameEn: 'Comfort / Reassurance',
    aliasesKo: ['위로곡', '위로 노래', '위로', '안심', '안식', '다독임', '쉬어도 돼', '울어도 돼'],
    aliasesEn: ['comfort', 'comfort song', 'reassurance', 'reassuring', 'consolation', 'rest and reassurance', 'soothing comfort'],
    emotionalArc: '지친 마음을 고치거나 재촉하지 않고 울음과 침묵을 허락하며 따뜻한 방 안에서 함께 쉬는 안도',
    koreanKeywords: ['창가의 빗소리', '포근한 담요', '따뜻한 찻잔', '낮게 켠 스탠드', '느리게 고른 숨'],
    moodKeywords: ['조용한 위로', '포근한 안도', '울어도 되는 밤'],
    englishProductionCue: 'intimate close-miked reassurance over hushed piano, brushed textures, and blanket-warm room ambience',
    compatiblePresetIdsByLane: {
      emotional: ['nostalgic-90s-rnb', 'warm-acoustic-folk', 'city-pop', 'lofi-bedroom-vocal', 'modern-k-ballad', 'midnight-jazz-swing'],
      energetic: ['neon-synthwave', 'festival-dance-pop', 'analog-nu-disco', 'modern-electro-pop', 'modern-korean-trot'],
    },
    englishProductionCueByLane: {
      emotional: 'close-miked reassurance with felt-piano warmth, brushed detail, patient breathing room, and an intimate gentle release',
      energetic: 'warm supportive pop lift with rounded drums, open-hearted hooks, and bright motion that never turns confrontational',
    },
    blockedMoodTerms: ['aggressive', 'explosive', 'hype', 'rebellious', 'defiant', 'raw', 'stadium', 'party', 'tearful', 'heartbroken'],
    variants: [
      { id: 'restful-night', titleKo: '쉬어도 되는 밤', titleEn: 'A Night to Rest', hookPhrase: '쉬어도 되는 밤, 오늘은 아무것도 이기지 않아도 돼', scene: '빗방울이 천천히 흐르는 창문과 낮게 켜 둔 주황빛 스탠드' },
      { id: 'tears-are-welcome', titleKo: '울어도 괜찮은 방', titleEn: 'A Room for Tears', hookPhrase: '울어도 괜찮은 방, 참았던 마음을 가만히 놓아', scene: '휴지 한 장과 따뜻한 찻잔을 놓아 둔 작은 방의 나무 탁자' },
      { id: 'blanket-heart', titleKo: '담요 같은 마음', titleEn: 'A Heart Like a Blanket', hookPhrase: '담요 같은 마음, 떨리는 어깨까지 포근히 감싸', scene: '소파 팔걸이에 접힌 크림색 담요와 나란히 놓인 두 개의 쿠션' },
      { id: 'warm-sip', titleKo: '따뜻한 한 모금', titleEn: 'One Warm Sip', hookPhrase: '따뜻한 한 모금, 굳은 숨이 천천히 풀리게', scene: '김이 오르는 머그잔을 두 손으로 감싼 비 오는 저녁 창가' },
      { id: 'beside-your-breath', titleKo: '네 숨 곁에', titleEn: 'Beside Your Breath', hookPhrase: '네 숨 곁에, 말없이 같은 박자로 머물게', scene: '어두운 침대 곁 작은 의자와 고르게 오르내리는 이불 끝' },
      { id: 'rain-at-window', titleKo: '비가 머무는 창가', titleEn: 'Rain at the Window', hookPhrase: '비가 머무는 창가, 그칠 때를 정하지 않아도 돼', scene: '빗물이 긴 선을 그리는 유리와 창틀 위의 작은 화분' },
      { id: 'light-left-on', titleKo: '말없이 켜 둔 불', titleEn: 'The Light Left On', hookPhrase: '말없이 켜 둔 불, 돌아볼 때 언제나 여기 있어', scene: '늦은 밤 현관 틈으로 새어 나오는 부드러운 노란 불빛' },
      { id: 'enough-for-today', titleKo: '오늘은 여기까지', titleEn: 'Enough for Today', hookPhrase: '오늘은 여기까지, 남은 일은 내일에게 맡겨 둬', scene: '덮어 둔 공책과 알람을 끈 휴대전화 옆의 식어 가는 차' },
    ],
    lineBank: {
      intro: ['창문을 타는 빗소리가 방 안의 속도를 낮춰', '낮게 켠 스탠드 불빛이 접은 담요 위에 머물러'],
      verse1: ['젖은 우산을 현관에 기대고 조용히 앉아', '따뜻한 찻잔 둘레를 식은 손으로 감싸고', '참아 둔 눈물이 볼을 지나가도록 내버려 둔 채', '괜찮다는 대답 대신 천천히 숨을 나눈다'],
      verse2: ['나는 커튼을 반쯤 닫아 빗빛을 부드럽게 만들고', '휴지 한 장과 빈 의자를 네 가까이에 놓아', '말이 나오지 않으면 주전자 소리만 함께 듣고', '무거운 어깨 아래 담요 끝을 가만히 여며 주며', '오늘의 남은 일은 내일에게 조용히 맡겨 둔다'],
      chorus: ['잘하려 애쓰지 않아도 이 방은 너를 품어', '참았던 울음이 흘러도 누구도 재촉하지 않아', '고른 숨 하나마다 따뜻한 자리가 생겨', '젖은 마음 곁에 작은 찻잔의 온기가 머물러', '대답 없는 시간도 그대로 충분히 다정해', '긴 밤을 건너지 않아도 지금 여기 쉬어 가', '흔들린 목소리까지 담요처럼 감싸 줄게', '비가 그칠 때를 정하지 말고 창가에 기대어', '아무 말 없이도 네 곁의 불을 켜 둘게'],
      chant: ['쉬어 가도 돼, 이 밤 안에서', '울어도 돼, 내가 곁에 있어', '천천히 숨, 하나 둘', '따뜻한 방, 포근한 담요', '오늘은 여기, 그대로 있어', '괜찮지 않아도, 괜찮아'],
      bridge: ['눈물을 닦으라는 말 대신 손수건을 건네고', '침묵도 함께 있을 수 있는 대화임을 알았어', '나아질 시간을 약속하지 않아도 괜찮아서', '우리는 빗소리 곁에 오래 가만히 머문다'],
      buildUp: [
        '고르게 이어진 숨 위로 작은 온기가 포개져',
        '이 빛 곁에',
        '담요 끝의 따뜻함이 두 어깨 사이로 번져',
        '같은 숨으로',
        '낮게 켠 불빛과 찻잔의 김이 한곳에 모여',
        '네 곁에 오래',
      ],
      bridgeResolution: '{titleKo}, 네 숨 곁에서 오늘도 조용히 함께 머물게',
      outro: ['식은 찻잔을 내려놓고 담요를 턱밑까지 올려', '빗소리가 잦아들지 않아도 편히 눈을 감는다'],
    },
  }),
  palette({
    id: 'encouragement-forward',
    nameKo: '응원과 전진',
    nameEn: 'Encouragement / Forward Motion',
    aliasesKo: ['응원곡', '응원 노래', '응원', '힘내', '파이팅', '할 수 있어', '격려', '동기부여', '도전', '용기', '전진'],
    aliasesEn: ['encouragement', 'encouragement song', 'motivation', 'motivational', 'courage', 'you can do it', 'keep going', 'fighting', 'cheer anthem'],
    emotionalArc: '망설이는 출발선에서 신발끈을 다시 묶고 넘어져도 친구들의 함성과 함께 일어나 앞으로 달리는 연대',
    koreanKeywords: ['흰 출발선', '단단한 신발끈', '흙 묻은 무릎', '이름을 부르는 친구들', '관중석의 함성'],
    moodKeywords: ['벅찬 응원', '전진하는 용기', '함께 뛰는 열기'],
    englishProductionCue: 'driving live drums, rising brass, and gang-vocal calls shaped for stadium-scale forward momentum',
    compatiblePresetIdsByLane: {
      emotional: ['acoustic-indie-funk', 'warm-acoustic-folk', 'cinematic-ballad', 'airy-indie-pop', 'modern-k-ballad', 'city-pop'],
      energetic: ['edm-hiphop-festival', 'festival-dance-pop', 'modern-electro-pop', 'stadium-rock-band', 'seoul-night-trap', 'modern-korean-trot', 'two-step-uk-garage'],
    },
    englishProductionCueByLane: {
      emotional: 'determined acoustic-to-cinematic lift with steady live drums, resilient vocals, and hopeful forward motion',
      energetic: 'driving live drums, rising brass, gang-vocal calls, and stadium-scale forward momentum',
    },
    blockedMoodTerms: ['hushed', 'quiet', 'sleepy', 'rainy', 'mellow', 'tearful', 'heartbroken'],
    styleAdaptationsByLane: {
      emotional: {
        'cinematic-ballad': {
          vocalOptions: [
            { gender: 'Female', phrase: 'The female lead vocal is clear, determined, and mixed up front, growing from grounded resolve into a controlled uplifting belt entirely free of vocal fry' },
            { gender: 'Male', phrase: 'The male lead vocal is clear, determined, and mixed up front, growing from grounded resolve into a controlled uplifting belt entirely free of vocal fry' },
          ],
          dynamicCurve: 'starts with focused piano resolve, adds strings and a steady pulse, opens after the key change into an uplifting final peak, then lands with assured warmth',
        },
        'modern-k-ballad': {
          vocalOptions: [
            { gender: 'Female', phrase: 'The female lead vocal is pristine and mixed up front, grounded and resolute in the opening before a controlled uplifting final belt' },
            { gender: 'Male', phrase: 'The male lead vocal is pristine and mixed up front, grounded and resolute in the opening before a controlled uplifting final belt' },
          ],
          dynamicCurve: 'starts with focused piano and restrained live drums, builds through resolute choruses and a turning bridge, uses one key change for an uplifting final peak, then lands with steady warmth',
        },
      },
    },
    variants: [
      { id: 'our-starting-line', titleKo: '출발선의 우리', titleEn: 'Us at the Starting Line', hookPhrase: '출발선의 우리, 하나 둘 셋 앞으로 뛰어', scene: '아침 운동장의 흰 선과 나란히 놓인 두 개의 스타팅 블록' },
      { id: 'laces-tied-again', titleKo: '다시 묶은 신발끈', titleEn: 'Laces Tied Again', hookPhrase: '다시 묶은 신발끈, 이번 걸음은 더 힘차게', scene: '흙 묻은 운동화 위로 단단히 당겨 묶은 파란 끈' },
      { id: 'call-your-name', titleKo: '네 이름을 외쳐', titleEn: 'Call Out Your Name', hookPhrase: '네 이름을 외쳐, 관중석 끝까지 힘이 닿게', scene: '친구들이 이름 적힌 손팻말을 높이 든 운동장 관중석' },
      { id: 'one-step-forward', titleKo: '한 걸음 앞으로', titleEn: 'One Step Forward', hookPhrase: '한 걸음 앞으로, 작은 시작이 길을 열어', scene: '초록 신호 아래 첫발을 내딛는 러닝 트랙의 운동화' },
      { id: 'rise-together', titleKo: '넘어져도 함께', titleEn: 'Together When We Fall', hookPhrase: '넘어져도 함께, 손을 잡고 다시 일어나', scene: '비 온 트랙 위에서 한 선수가 다른 선수의 손을 잡아 주는 순간' },
      { id: 'fighting-today', titleKo: '오늘도 파이팅', titleEn: 'One More Cheer Today', hookPhrase: '오늘도 파이팅, 두 손을 높이 마주쳐', scene: '출발 직전 원을 만든 친구들이 운동장 한가운데서 손을 포갠 모습' },
      { id: 'heart-runs-on', titleKo: '끝까지 뛰는 마음', titleEn: 'A Heart That Runs On', hookPhrase: '끝까지 뛰는 마음, 숨이 차도 서로를 불러', scene: '노을 진 마지막 직선 주로를 나란히 달리는 네 사람' },
      { id: 'roar-we-made', titleKo: '우리가 만든 함성', titleEn: 'The Roar We Make', hookPhrase: '우리가 만든 함성, 닫힌 지붕까지 울려 퍼져', scene: '휴대전화 불빛과 깃발이 물결치는 실내 경기장 스탠드' },
    ],
    lineBank: {
      intro: ['출발선의 흰 줄 위로 운동화 앞코를 맞춰', '관중석의 손뼉이 심장 박자처럼 번져 와'],
      verse1: ['새벽 운동장 출발선에 두 발을 나란히 놓고', '풀린 신발끈을 단단한 매듭으로 다시 묶어', '넘어져 묻은 무릎의 흙을 손바닥으로 털며', '친구들이 부르는 내 이름 쪽으로 고개를 든다'],
      verse2: ['호각이 울리자 우리는 같은 방향으로 뛰어', '가파른 코너마다 서로의 등을 밀어 주고', '한 사람이 넘어지면 모두가 걸음을 늦춰', '다시 선 발끝에 더 큰 함성을 모아 주며', '마지막 깃발까지 나란히 팔을 흔들어 간다'],
      chorus: ['시작을 알리는 소리가 가슴 깊이 울려', '작은 한 걸음이 오늘의 거리를 바꿔', '넘어진 자리에서 더 단단히 땅을 딛어', '친구의 목소리가 두 다리에 힘을 보태', '우리의 함성이 높은 관중석까지 번져', '앞을 향한 두 눈에 새로운 길이 열려', '혼자보다 함께라서 더 멀리 뛸 수 있어', '숨이 차오를수록 박수는 더 커져 가', '마지막 선 너머에도 다음 출발이 기다려'],
      chant: ['하나 둘 셋, 앞으로', '힘내 힘내, 같이 가', '파이팅, 이름을 외쳐', '할 수 있어, 다시 일어나', '손을 높이, 함성 크게', '우리 함께, 끝까지 가'],
      bridge: ['넘어지지 않는 사람이 강한 게 아니라', '손을 내밀고 다시 서는 우리가 강해서', '관중석에서 들려온 수많은 이름들이', '혼자였던 도전을 우리의 길로 바꿔 놓는다'],
      buildUp: [
        '맞잡은 손의 박자를 하나 둘 더 크게 맞춰',
        '앞으로 한 걸음',
        '관중석의 이름들이 북소리 위로 번져',
        '더 크게 외쳐',
        '우리의 발끝과 함성을 출발선에 모아',
        '지금 함께 뛰어',
      ],
      bridgeResolution: '{titleKo}, 함께 외치며 다음 도전의 첫발을 힘차게 내디뎌',
      outro: ['결승선 곁에서 묶은 신발끈을 천천히 풀고', '서로의 어깨를 두드리며 다음 시작을 약속한다'],
    },
  }),
  palette({
    id: 'everyday-happiness',
    nameKo: '일상의 행복',
    nameEn: 'Everyday Happiness / Joy',
    aliasesKo: ['행복한 음악', '행복한음악', '행복한 노래', '행복', '기쁨', '좋은 날', '즐거움', '소확행', '작은 축제'],
    aliasesEn: ['happiness', 'happy music', 'happy song', 'joy', 'joyful music', 'good day', 'everyday happiness', 'small celebration'],
    emotionalArc: '아침 햇살과 갓 구운 빵 냄새를 알아차린 기쁨이 손뼉과 친구들의 웃음으로 번져 평범한 하루 자체가 작은 축제가 되는 흐름',
    koreanKeywords: ['식탁 위 햇살', '갓 구운 빵', '손뼉 소리', '친구들의 웃음', '창가의 레몬에이드'],
    moodKeywords: ['햇살 같은 기쁨', '가벼운 들뜸', '함께 웃는 행복'],
    englishProductionCue: 'bright acoustic-pop polish with handclaps, buoyant bass, sunlit guitars, and a communal singalong lift',
    compatiblePresetIdsByLane: {
      emotional: ['acoustic-indie-funk', 'warm-acoustic-folk', 'city-pop', 'airy-indie-pop', 'midnight-jazz-swing'],
      energetic: ['festival-dance-pop', 'analog-nu-disco', 'modern-electro-pop', 'modern-korean-trot', 'two-step-uk-garage'],
    },
    englishProductionCueByLane: {
      emotional: 'sunlit organic pop with acoustic sparkle, easy handclaps, smiling vocals, and present-tense warmth',
      energetic: 'celebratory pop motion with buoyant bass, bright handclaps, colorful hooks, and communal singalong joy',
    },
    blockedMoodTerms: ['aggressive', 'hype', 'rebellious', 'defiant', 'raw', 'heartbroken', 'tearful', 'melancholic', 'rainy', 'dark', 'restless'],
    variants: [
      { id: 'spoonful-of-sunlight', titleKo: '햇살 한 스푼', titleEn: 'A Spoonful of Sunlight', hookPhrase: '햇살 한 스푼, 오늘의 커피 위에 살짝 얹어', scene: '아침 식탁의 흰 머그잔과 잼 병 사이로 길게 들어온 햇살' },
      { id: 'fresh-baked-morning', titleKo: '갓 구운 아침', titleEn: 'Fresh-Baked Morning', hookPhrase: '갓 구운 아침, 빵 냄새 따라 웃음이 깨어나', scene: '동네 빵집 유리문 안쪽에 놓인 따뜻한 식빵과 김 서린 창' },
      { id: 'clapping-afternoon', titleKo: '박수 치는 오후', titleEn: 'An Afternoon That Claps', hookPhrase: '박수 치는 오후, 손바닥마다 리듬이 피어나', scene: '공원 돗자리 위에서 박자에 맞춰 손뼉 치는 친구들' },
      { id: 'today-is-good', titleKo: '오늘은 좋은 날', titleEn: 'Today Is a Good Day', hookPhrase: '오늘은 좋은 날, 열린 창마다 노래가 번져', scene: '파란 커튼이 흔들리는 창문과 맑게 갠 동네 지붕들' },
      { id: 'laughter-at-the-table', titleKo: '웃음이 번진 식탁', titleEn: 'Laughter Around the Table', hookPhrase: '웃음이 번진 식탁, 작은 접시까지 축제가 돼', scene: '색색의 과일 접시와 레몬에이드가 놓인 긴 나무 식탁' },
      { id: 'pocket-sized-festival', titleKo: '주머니 속 축제', titleEn: 'Pocket-Sized Celebration', hookPhrase: '주머니 속 축제, 동전처럼 반짝이는 기쁨을 꺼내', scene: '종이 꽃가루와 작은 사탕이 가득 든 청재킷 주머니' },
      { id: 'open-window-saturday', titleKo: '창문을 연 토요일', titleEn: 'Open-Window Saturday', hookPhrase: '창문을 연 토요일, 바람과 함께 춤을 시작해', scene: '빨래가 흔들리는 베란다와 활짝 열린 토요일 아침 창문' },
      { id: 'neighborhood-dance', titleKo: '우리 동네 춤', titleEn: 'Our Neighborhood Dance', hookPhrase: '우리 동네 춤, 골목 모퉁이까지 발을 맞춰', scene: '분필 그림이 가득한 골목에서 스피커를 둘러싸고 춤추는 이웃들' },
    ],
    lineBank: {
      intro: ['식탁 위 햇살이 노란 잼 병을 반짝이게 해', '동네 빵집 문이 열리자 고소한 아침이 번져'],
      verse1: ['창문을 활짝 열고 맑은 바람을 먼저 들여', '갓 구운 식빵 위에 딸기잼을 둥글게 바르고', '라디오 첫 노래에 슬리퍼 발끝을 맞추며', '머그잔 그림자 옆에 작은 미소를 내려놓는다'],
      verse2: ['나는 과일과 레몬에이드를 바구니에 담고', '친구들이 기다리는 공원 돗자리로 달려가', '종이컵을 부딪치며 오늘의 안부를 나눠', '누군가 친 박수에 모두 같은 박자를 얹고', '노을이 올 때까지 잔디 위에서 웃음을 이어 간다'],
      chorus: ['평범한 오늘이 이미 눈부시게 반짝여', '바삭한 빵 소리도 근사한 리듬이 돼', '창문을 지난 햇살이 두 볼 위에서 춤춰', '마주친 웃음마다 작은 축제가 열려', '손뼉을 한 번 치면 골목까지 노래해', '달콤한 과일 향이 바람을 따라 번져', '함께 있는 식탁은 무엇보다 풍성해', '좋아하는 순간을 지금 크게 불러 봐', '집으로 가는 길에도 기쁨이 콧노래가 돼'],
      chant: ['손뼉 쳐, 짝짝', '웃어 봐, 하하', '햇살 아래, 빙글빙글', '좋은 날, 같이 노래해', '하나 둘 셋, 작은 축제', '우리 모두, 기분 좋게'],
      bridge: ['특별한 초대장도 화려한 촛불도 없지만', '빵을 나누고 눈을 맞춘 이 순간을 보니', '행복은 멀리서 찾아오는 손님이 아니라', '이미 우리 식탁에 앉아 함께 웃고 있었어'],
      buildUp: [
        '손뼉 위에 햇살 한 줌 반짝이게 포개',
        '짝짝 더 환하게',
        '빵 냄새와 웃음소리 같은 박자에 모여',
        '빙글 함께 춤춰',
        '친구들의 목소리가 골목 끝까지 번져',
        '지금 이 축제',
      ],
      bridgeResolution: '{titleKo}, 웃음이 번진 바로 이 순간을 함께 오래 노래해',
      outro: ['빈 접시를 포개며 남은 노래를 낮게 흥얼거려', '주머니에 든 햇살 한 조각과 집으로 걸어간다'],
    },
  }),
  palette({
    id: 'city-neon',
    nameKo: '도시와 네온',
    nameEn: 'City / Neon',
    aliasesKo: ['도시', '네온', '서울', '골목', '야경', '빌딩', '지하철', '번화가'],
    aliasesEn: ['city', 'neon', 'downtown', 'skyline', 'urban', 'subway', 'streetlight'],
    emotionalArc: '익명적인 도시 소음 속에서 자신만의 리듬과 한 사람의 신호를 찾아 연결되는 밤',
    koreanKeywords: ['네온 횡단보도', '막차', '옥상', '도시의 심장'],
    moodKeywords: ['네온빛 설렘', '도시의 고독'],
    englishProductionCue: 'neon metropolitan pulse with glassy reflections and an after-hours lift',
    variants: [
      { id: 'neon-crosswalk', titleKo: '네온 횡단보도', titleEn: 'Neon Crosswalk', hookPhrase: '네온 횡단보도, 우리 신호에 맞춰 건너', scene: '비에 젖은 번화가 횡단보도와 반사된 간판빛' },
      { id: 'last-train-heart', titleKo: '막차의 심장', titleEn: 'Heart of the Last Train', hookPhrase: '막차의 심장, 같은 박자로 뛰어 줘', scene: '자정 직전 지하철 창에 겹친 두 얼굴' },
      { id: 'rooftop-frequency', titleKo: '옥상의 주파수', titleEn: 'Rooftop Frequency', hookPhrase: '옥상의 주파수, 너의 목소리를 잡았어', scene: '안테나와 빌딩 불빛이 펼쳐진 늦은 옥상' },
      { id: 'glass-city', titleKo: '유리로 된 도시', titleEn: 'City Made of Glass', hookPhrase: '유리로 된 도시, 우리 빛은 깨지지 않아', scene: '고층 빌딩 유리마다 겹쳐 비친 밤거리' },
      { id: 'alley-sign', titleKo: '골목 끝 간판', titleEn: 'Sign at the Alley End', hookPhrase: '골목 끝 간판, 너를 찾는 불빛이 켜져', scene: '작은 심야 식당의 깜박이는 붉은 간판' },
      { id: 'two-am-seoul', titleKo: '새벽 두 시의 서울', titleEn: 'Seoul at 2 AM', hookPhrase: '새벽 두 시의 서울, 잠들지 말고 춤춰 줘', scene: '택시 불빛이 흐르는 새벽 두 시의 큰길' },
      { id: 'signal-in-the-rain', titleKo: '빗속의 신호', titleEn: 'Signal in the Rain', hookPhrase: '빗속의 신호, 흐려져도 널 알아봐', scene: '우산 사이로 깜박이는 보행자 신호등' },
      { id: 'city-knows-us', titleKo: '도시가 우릴 알 때', titleEn: 'When the City Knows Us', hookPhrase: '도시가 우릴 알 때, 모든 창이 노래해', scene: '불 켜진 수백 개 창문 아래 마주 선 두 사람' },
    ],
    lineBank: {
      intro: ['젖은 아스팔트 위로 분홍 간판이 흔들려', '막차 안내음이 유리 터널을 깨워'],
      verse1: ['비가 고인 횡단보도 앞에 우산을 세우고', '택시 불빛이 흐르는 큰길을 오래 바라봐', '유리 빌딩마다 겹쳐진 내 표정을 지나', '깜박이는 보행자 신호에 발끝을 맞춘다'],
      verse2: ['신호가 켜지자 나는 군중 사이를 건너', '작은 심야 식당 문을 밀고 들어가', '창가의 낯선 리듬에 손가락을 두드리며', '옥상으로 이어진 좁은 계단을 올라', '도시의 수많은 창 중 너의 불빛을 찾아낸다'],
      chorus: ['회색 밤 위로 우리의 색이 번져 가', '차가운 유리도 이 박자에 따뜻해져', '수많은 소음 속 네 숨을 알아들을게', '꺼진 간판 사이 새로운 리듬이 켜져', '낯선 얼굴들도 같은 순간을 지나', '막차보다 늦게 마음이 도착해', '빌딩의 그림자를 춤추듯 넘어가', '도시의 심장이 두 발 아래 울려', '오늘 밤만큼은 우리가 길의 주인이야'],
      chant: ['불을 켜, 네온 높이', '한 발 더, 신호 따라', '지금 여기, 도시의 밤', '크게 뛰어, 같은 박자', '손을 들어, 창문 너머', '멈추지 마, 새벽까지'],
      bridge: ['옥상 문을 여니 소음이 한순간 멀어지고', '수백 개 창문이 각자의 외로움을 밝혀', '혼자인 줄 알았던 작은 불빛들이 모여', '하나의 도시를 만든다는 걸 처음 알아본다'],
      outro: ['네온이 꺼진 골목에서 걸음을 조금 늦춰', '첫 지하철 바람 곁에 도시의 숨을 놓는다'],
    },
  }),
  palette({
    id: 'dream-cosmos',
    nameKo: '꿈과 우주',
    nameEn: 'Dream / Cosmos',
    aliasesKo: ['꿈', '우주', '별', '별빛', '은하', '행성', '궤도', '달'],
    aliasesEn: ['dream', 'cosmos', 'space', 'star', 'starlight', 'galaxy', 'orbit', 'moon'],
    emotionalArc: '작아 보이던 소망을 우주의 좌표처럼 선명히 받아들이고 두려움 너머로 발사하는 확장',
    koreanKeywords: ['옥상 별자리', '종이 로켓', '은하', '우리의 궤도'],
    moodKeywords: ['우주적 경이', '꿈결 같은 희망'],
    englishProductionCue: 'weightless cosmic wonder rising toward a widescreen orbital climax',
    variants: [
      { id: 'paper-rocket', titleKo: '종이 로켓', titleEn: 'Paper Rocket', hookPhrase: '종이 로켓, 작은 꿈을 우주까지 올려', scene: '옥상 난간에서 접어 날리는 종이 로켓' },
      { id: 'our-orbit', titleKo: '우리의 궤도', titleEn: 'Our Orbit', hookPhrase: '우리의 궤도, 멀어져도 다시 만나', scene: '별자리 앱 위로 겹쳐지는 두 손의 좌표' },
      { id: 'galaxy-window', titleKo: '은하의 창문', titleEn: 'Window to the Galaxy', hookPhrase: '은하의 창문, 닫힌 꿈을 활짝 열어', scene: '불 꺼진 방 천장에 흐르는 은하 프로젝터' },
      { id: 'moonlit-signal', titleKo: '달빛 신호', titleEn: 'Moonlit Signal', hookPhrase: '달빛 신호, 먼 곳의 나에게 닿아 줘', scene: '라디오 안테나 끝에 걸린 둥근 달' },
      { id: 'constellation-name', titleKo: '별자리의 이름', titleEn: 'Name of a Constellation', hookPhrase: '별자리의 이름, 오늘은 우리로 정할게', scene: '옥상 바닥에 분필로 이어 그린 별자리' },
      { id: 'zero-gravity-heart', titleKo: '무중력의 마음', titleEn: 'Zero Gravity Heart', hookPhrase: '무중력의 마음, 두려움까지 띄워 보내', scene: '천천히 떠오르는 꿈속 방과 열린 창' },
      { id: 'beyond-mars', titleKo: '화성보다 멀리', titleEn: 'Farther Than Mars', hookPhrase: '화성보다 멀리, 상상한 만큼 날아가', scene: '낡은 과학책의 화성 사진과 연필로 그린 항로' },
      { id: 'stars-remember', titleKo: '별은 기억해', titleEn: 'The Stars Remember', hookPhrase: '별은 기억해, 우리가 포기하지 않은 밤', scene: '도시 불이 꺼진 뒤 선명해진 겨울 별자리' },
    ],
    lineBank: {
      intro: ['옥상 안테나 끝에 둥근 달이 걸려', '불 꺼진 천장 위로 작은 은하가 흘러'],
      verse1: ['낡은 과학책을 들고 옥상 문을 밀어', '분필로 그린 별자리를 바닥에 이어 보고', '주머니 속 종이 로켓의 날개를 다시 접으며', '아무에게도 말 못 한 좌표를 하늘에 찍는다'],
      verse2: ['나는 휴대전화의 도시 불빛을 잠시 끄고', '망원경을 가장 어두운 하늘로 돌려', '멀리 있는 별 대신 내 눈동자를 들여다봐', '두려움에 붙여 둔 무거운 이름을 떼고', '상상한 궤도 위로 첫 신호를 힘껏 보낸다'],
      chorus: ['작은 꿈도 밤을 건너면 별이 될 수 있어', '끝없는 어둠은 더 넓은 배경일 뿐이야', '우리의 목소리가 은하 가장자리에 닿아', '떨어진 소원까지 새로운 궤도를 그려', '지구의 소음보다 심장 소리를 믿어', '멀리 갈수록 서로의 빛은 선명해져', '두 손에 쥔 용기가 중력을 밀어내', '이름 없던 별에 오늘을 새겨 넣어', '돌아올 좌표는 언제나 마음에 있어'],
      chant: ['날아가, 별 너머로', '손을 뻗어, 우주 가까이', '지금 발사, 꿈을 높이', '한 번 더, 궤도 위로', '빛을 켜, 어둠 멀리', '우리의 별, 끝까지'],
      bridge: ['망원경을 내려놓자 바로 곁의 네 눈에', '찾고 있던 우주가 조용히 반짝이고 있었어', '멀리 가야만 꿈이 되는 것은 아니라서', '여기 선 두 발로도 무한을 시작할 수 있어'],
      outro: ['종이 로켓 하나를 난간 곁에 세워 두고', '아침별이 사라질 때 천천히 눈을 감는다'],
    },
  }),
  palette({
    id: 'ocean-travel',
    nameKo: '바다와 여행',
    nameEn: 'Ocean / Travel',
    aliasesKo: ['바다', '여행', '파도', '항해', '해변', '섬', '항구', '수평선'],
    aliasesEn: ['ocean', 'sea', 'travel', 'wave', 'voyage', 'beach', 'island', 'harbor'],
    emotionalArc: '익숙한 항구의 망설임에서 출발해 파도와 낯선 풍경을 받아들이고 돌아갈 자신만의 좌표를 얻는 여정',
    koreanKeywords: ['새벽 항구', '파도', '승선권', '수평선'],
    moodKeywords: ['바닷바람의 설렘', '여행의 여운'],
    englishProductionCue: 'salt-air travelogue motion expanding toward a sunlit horizon',
    variants: [
      { id: 'one-way-to-sea', titleKo: '바다행 편도', titleEn: 'One Way to the Sea', hookPhrase: '바다행 편도, 오늘은 돌아오지 않아도 돼', scene: '새벽역 매표창구와 바다행 승선권' },
      { id: 'wave-postcard', titleKo: '파도의 엽서', titleEn: 'Postcard from the Waves', hookPhrase: '파도의 엽서, 먼 곳의 안부를 실어 와', scene: '젖은 모래 위로 밀려온 파란 엽서' },
      { id: 'harbor-morning', titleKo: '항구의 아침', titleEn: 'Harbor Morning', hookPhrase: '항구의 아침, 묶인 마음을 풀어 줘', scene: '밧줄을 푸는 작은 배와 갈매기 소리' },
      { id: 'island-between-us', titleKo: '우리 사이의 섬', titleEn: 'The Island Between Us', hookPhrase: '우리 사이의 섬, 천천히 헤엄쳐 만나', scene: '두 해안 사이 외롭게 떠 있는 작은 섬' },
      { id: 'blue-ticket', titleKo: '푸른 승선권', titleEn: 'Blue Boarding Pass', hookPhrase: '푸른 승선권, 새로운 이름을 데려가', scene: '소금기 묻은 손에 쥔 파란 배표' },
      { id: 'horizon-line', titleKo: '수평선 한 줄', titleEn: 'One Line of Horizon', hookPhrase: '수평선 한 줄, 복잡한 마음을 곧게 펴', scene: '구름 없이 길게 이어진 저녁 수평선' },
      { id: 'seashell-compass', titleKo: '조개껍데기 나침반', titleEn: 'Seashell Compass', hookPhrase: '조개껍데기 나침반, 마음이 가는 곳을 가리켜', scene: '손바닥 위 조개와 모래에 그린 방향표' },
      { id: 'returning-tide', titleKo: '돌아오는 물결', titleEn: 'The Returning Tide', hookPhrase: '돌아오는 물결, 멀리 간 나를 안아 줘', scene: '해 질 녘 빈 발자국을 덮는 밀물' },
    ],
    lineBank: {
      intro: ['새벽 항구에 낮은 뱃고동이 길게 울려', '창문 틈의 소금바람이 지도를 펼쳐'],
      verse1: ['불 꺼진 매표창구 앞에 배낭을 내려놓고', '손바닥보다 작은 승선권을 오래 바라봐', '묶인 배 옆에서 갈매기 소리를 세어 가며', '떠나지 못한 이유를 파도에게 조용히 묻는다'],
      verse2: ['밧줄이 풀리자 나는 갑판 끝으로 걸어가', '익숙한 지붕들이 점이 될 때까지 바라보고', '젖은 머리카락을 바닷바람에 맡겨', '처음 만난 여행자와 따뜻한 귤을 나누며', '지도 밖 푸른 여백에 나의 좌표를 새로 적는다'],
      chorus: ['파도가 밀려올수록 마음은 가벼워져', '수평선 너머에도 우리의 길은 이어져', '짠 바람이 오래 묶인 매듭을 풀어', '낯선 항구마다 새로운 내가 내려', '돌아갈 곳을 알아서 더 멀리 갈 수 있어', '푸른 물결 위로 두려움을 띄워 보내', '작은 배의 흔들림도 리듬이 되어', '여행의 끝보다 지금의 바람을 믿어', '멀어진 해안까지 환한 노래가 닿아'],
      chant: ['파도 따라, 더 멀리', '돛을 올려, 바람 높이', '지금 출항, 수평선으로', '손을 뻗어, 푸른 쪽으로', '한 번 더, 물결 위로', '우리의 길, 바다 끝까지'],
      bridge: ['거센 물결이 잠잠해진 한가운데에서', '도망치듯 떠난 마음을 비로소 마주했어', '목적지가 나를 바꾸는 것이 아니라', '내가 고른 한 걸음이 여행을 만든다는 걸'],
      outro: ['작은 항구 불빛을 멀리서 천천히 바라봐', '접은 지도를 베개 삼아 파도 곁에 눕는다'],
    },
  }),
];

export const PALETTE_BY_ID = Object.fromEntries(
  CONCEPT_PALETTES.map((item) => [item.id, item]),
);

/** Normalize case, compatibility forms, whitespace, and punctuation for matching. */
export function normalizeTheme(theme) {
  return String(theme ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sanitize a user cue for display without pretending to translate it. */
export function sanitizeThemeCue(theme) {
  return String(theme ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[,，、]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .trim();
}

const KOREAN_ALIAS_SUFFIXES = new Set([
  '은', '는', '이', '가', '을', '를', '과', '와', '의', '에', '에서',
  '에게', '으로', '로', '도', '만', '부터', '까지', '처럼', '보다',
  // Explicitly musical/visual compounds that preserve the alias meaning.
  '속', '빛', '길', '밤', '노래', '여행', '감성', '풍경',
]);

function attachedKoreanAliasScore(normalizedTheme, normalizedAlias) {
  if (!normalizedAlias || normalizedAlias.includes(' ')) return 0;
  for (const token of normalizedTheme.split(' ')) {
    if (!token.startsWith(normalizedAlias) || token === normalizedAlias) continue;
    const suffix = token.slice(normalizedAlias.length);
    if (KOREAN_ALIAS_SUFFIXES.has(suffix)) return 8 + normalizedAlias.length;
  }
  return 0;
}

function aliasScore(normalizedTheme, alias, allowAttachedKoreanMatch = false) {
  const normalizedAlias = normalizeTheme(alias);
  if (!normalizedAlias || !normalizedTheme) return 0;
  if (normalizedTheme === normalizedAlias) return 100 + normalizedAlias.length;
  const boundedTheme = ` ${normalizedTheme} `;
  const boundedAlias = ` ${normalizedAlias} `;
  if (boundedTheme.includes(boundedAlias)) return 24 + normalizedAlias.length;
  // Korean particles attach without spaces. Only explicitly recognized
  // particles/semantic compounds are accepted: arbitrary substring matching
  // would make 달리기, 배달, 특별한 collide with 달/별.
  if (allowAttachedKoreanMatch) {
    return attachedKoreanAliasScore(normalizedTheme, normalizedAlias);
  }
  return 0;
}

const LANE_PALETTE_PREFERENCES = {
  // Lower numbers mean a stronger lane identity. Dedicated quick-mode words
  // take intentional ownership in a three-way compound, while shifted legacy
  // tiers preserve their previous ordering and semantic regressions.
  emotional: new Map([
    ['comfort-embrace', 0],
    ['love-separation', 1],
    ['healing-growth', 1],
    ['season-nostalgia', 1],
    ['dawn-night', 1],
    ['encouragement-forward', 1],
    ['everyday-happiness', 1],
    ['dream-cosmos', 2],
    ['ocean-travel', 2],
  ]),
  energetic: new Map([
    ['encouragement-forward', 0],
    ['drive-freedom', 1],
    ['city-neon', 1],
    ['comfort-embrace', 1],
    ['everyday-happiness', 1],
    ['dream-cosmos', 2],
    ['ocean-travel', 2],
  ]),
  // Balanced matching otherwise remains score-led. These three explicit modes
  // alone need a deterministic preference when all are present together.
  balanced: new Map([
    ['everyday-happiness', 0],
    ['comfort-embrace', 1],
    ['encouragement-forward', 1],
  ]),
};

const UNKNOWN_THEME_FALLBACKS = {
  // Distinctive fantasy/cosmic concepts require an explicit alias; they are
  // intentionally excluded from generic fallback so ordinary unknown words do
  // not receive an unrelated space narrative by chance.
  emotional: new Set([
    'dawn-night',
    'season-nostalgia',
    'love-separation',
    'healing-growth',
    'ocean-travel',
  ]),
  energetic: new Set([
    'drive-freedom',
    'city-neon',
    'ocean-travel',
  ]),
  balanced: new Set([
    'dawn-night',
    'season-nostalgia',
    'drive-freedom',
    'love-separation',
    'healing-growth',
    'city-neon',
    'ocean-travel',
  ]),
};

/**
 * Resolve one semantic palette. When a compound monthly theme contains several
 * concepts, lane affinity separates Wednesday's narrative songs from Friday's
 * high-motion songs without discarding the user's words. A single matched
 * concept still governs both lanes. Unknown themes use a lane-aware seeded
 * fallback rather than pretending to translate the input.
 */
export function matchThemePalette(theme, seed = 20240101, lane = 'balanced') {
  const normalized = normalizeTheme(theme);
  const scored = CONCEPT_PALETTES.map((item) => ({
    item,
    score: item.aliasesKo.reduce(
      (total, alias) => total + aliasScore(normalized, alias, true),
      0,
    ) + item.aliasesEn.reduce(
      (total, alias) => total + aliasScore(normalized, alias, false),
      0,
    ),
  }));
  const matched = scored.filter(({ score }) => score > 0);
  let candidates;

  if (matched.length === 1) {
    candidates = matched.map(({ item }) => item);
  } else if (matched.length > 1) {
    const preferred = LANE_PALETTE_PREFERENCES[lane];
    const laneMatches = preferred
      ? matched.filter(({ item }) => preferred.has(item.id))
      : [];
    // If the theme contains concepts for both programming lanes, lane identity
    // wins before raw alias count. Within the same affinity tier, specificity
    // still decides. If this lane has no matching affinity, keep all matches.
    const strongestAffinity = laneMatches.length > 0
      ? Math.min(...laneMatches.map(({ item }) => preferred.get(item.id)))
      : null;
    const eligible = strongestAffinity == null
      ? matched
      : laneMatches.filter(({ item }) => preferred.get(item.id) === strongestAffinity);
    const highest = Math.max(...eligible.map(({ score }) => score));
    candidates = eligible
      .filter(({ score }) => score === highest)
      .map(({ item }) => item);
  } else {
    const fallback = UNKNOWN_THEME_FALLBACKS[lane] || UNKNOWN_THEME_FALLBACKS.balanced;
    candidates = CONCEPT_PALETTES.filter(({ id }) => fallback.has(id));
  }

  const rng = createNamedRng(
    seed,
    'concept-palette',
    normalized || 'empty-theme',
    lane,
  );
  return candidates[Math.floor(rng() * candidates.length)];
}

/**
 * Build one coherent concept for a full track. Ordinals rotate through all
 * eight authored title variants, so a month cannot collapse to one title.
 */
export function buildTrackConcept({
  theme = '',
  seed = 20240101,
  ordinal = 0,
  lane = 'balanced',
  resolvedPalette = null,
} = {}) {
  const selectedPalette = resolvedPalette || matchThemePalette(theme, seed, lane);
  const rng = createNamedRng(seed, 'concept-title', selectedPalette.id);
  const offset = Math.floor(rng() * selectedPalette.variants.length);
  const variantIndex = (offset + Math.max(0, Math.trunc(ordinal))) % selectedPalette.variants.length;
  const variant = selectedPalette.variants[variantIndex];
  const userThemeCue = sanitizeThemeCue(theme);
  const title = `${variant.titleKo} (${variant.titleEn}${userThemeCue ? ` · ${userThemeCue}` : ''})`;

  return {
    paletteId: selectedPalette.id,
    paletteNameKo: selectedPalette.nameKo,
    paletteNameEn: selectedPalette.nameEn,
    lane,
    variantId: variant.id,
    titleKo: variant.titleKo,
    titleEn: variant.titleEn,
    title,
    hookPhrase: variant.hookPhrase,
    scene: variant.scene,
    imagery: variant.scene,
    emotionalArc: selectedPalette.emotionalArc,
    koreanKeywords: [...selectedPalette.koreanKeywords],
    moodKeywords: [...selectedPalette.moodKeywords],
    englishProductionCue: selectedPalette.englishProductionCueByLane?.[lane]
      || selectedPalette.englishProductionCue,
    userThemeCue,
  };
}

export function getConceptLineBank(paletteId) {
  return PALETTE_BY_ID[paletteId]?.lineBank || PALETTE_BY_ID['dawn-night'].lineBank;
}
