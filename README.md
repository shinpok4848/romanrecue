# SunoFlow v2

SunoFlow는 **테마 한 줄 → 이중언어 제목 + 완성형 한글 가사 + Suno v6 패키지**로 확장하는 브라우저 기반 공개형 월간 송라이팅 엔진입니다. 단순 키워드 조합이나 영어 작사 가이드가 아니라, 하나의 큐레이션된 콘셉트에서 제목·훅·장면·감정선·Mood·사운드·가사를 함께 파생합니다.

SunoFlow는 Suno API와 연결하지 않습니다. 사용자가 결과를 복사해 자신의 Suno 계정에서 직접 곡을 생성하는 플래너이며, 음악 생성이나 업로드를 대신 수행하지 않습니다.

## 월간 결과

한 번 생성하면 4주 동안 정확히 **16개 항목**이 만들어집니다.

| 요일 | 항목 | 규칙 |
| --- | --- | --- |
| 수요일 | 본편 / Full | Deep & Narrative 프리셋 풀 |
| 목요일 | Shorts | 같은 주 수요일 본편의 마지막 강한 훅에서 파생 |
| 금요일 | 본편 / Full | Weekend Upbeat & Viral 프리셋 풀 |
| 토요일 | Shorts | 같은 주 금요일 본편의 마지막 강한 훅에서 파생 |

즉, 매월 **본편 8곡 + 연결된 Shorts 8개**입니다. Shorts는 별도 콘셉트를 임의 생성하지 않고 부모 곡의 제목 코어, 콘셉트, 장르, BPM, Key, 보컬, Mood, Exclude를 그대로 상속합니다. 부모의 마지막 `Chorus`, `Final Chorus`, `Hook`, 또는 `Drop`에서 제목이 포함된 2–4개 연속 가사 줄을 정확히 복사합니다.

## 본편에 포함되는 Suno v6 패키지

각 본편은 다음 정보를 모두 저장하고 화면에서 개별 복사할 수 있습니다.

- 큐레이션된 **한글/영문 제목 쌍**과 정제된 사용자 테마 cue
- 제목의 한글 코어가 그대로 들어간 **대표 훅 문장**
- 한 장면, 감정선, 한글 키워드, 영문 프로덕션 cue를 담은 공유 콘셉트
- 장르별 **정확한 canonical 구조**와 전체 한글 가사
- Suno v6 **Style Prompt**, **Exclude Prompt**, 별도 **Mood**
- BPM, Key, 실제 선택된 vocal phrase와 일치하는 vocal gender
- Weirdness, Style Influence
- 구조 선택 이유와 실제 편곡 결정을 담은 프로듀서 처방
- 상태(`Planned → Generated → Published`)와 공개 일정

Style Prompt는 다음 spine을 유지합니다.

```text
K-Pop <genre> at <BPM> BPM in <Key>, <master-grade production>, <instruments>, <selected vocal mixed up front>, <dynamic curve>, <finishing tags>, <curated concept cue>
```

Mood는 Suno v6의 독립 입력란에 맞게 Style과 분리하며, 프리셋의 감정어와 콘셉트의 감정어를 결합합니다. Exclude는 공통 기술적 문제(클리핑, 펌핑, 탁한 믹스, 위상 문제, 과압축 등)와 장르 대비 요소를 중복 없이 합칩니다.

## 완성형 한글 가사 규칙

`assets/js/lyricsEngine.js`는 독립 단어를 무작위 연결하지 않습니다. 큐레이션된 장면별 완성 문장 bank와 구조 역할을 조합해 다음 규칙을 적용합니다.

- 모든 보컬 섹션에는 같은 `[Female singer]`, `[Male singer]`, 또는 duet 태그를 반복합니다.
- 모든 `Chorus`, `Final Chorus`, `Hook`, `Drop`에 `titleKo`가 포함된 같은 핵심 훅을 둡니다.
- Verse 1은 4줄의 구체적 장면, Verse 2는 행동/시점을 바꾼 3줄 또는 5줄입니다.
- Pre-Chorus는 전체 제목 훅을 아끼고 상승만 만듭니다.
- Build up은 정확히 두 개의 짧아지는 상승 문장으로 다음 Drop 또는 UK Garage의 Chorus에 연결됩니다.
- Bridge는 서사의 관점을 실제로 뒤집습니다.
- Instrumental, Solo, Guitar Solo, Interlude, Key Change, End, Fade Out에는 가사를 넣지 않습니다.
- Whisper/Belting은 K-Ballad와 OST/Cinematic에서만 한 쌍으로 사용합니다.
- Key Change는 최대 한 번, 반드시 Final Chorus 바로 앞에만 둡니다.
- Intro는 짧은 cold open, Outro는 차분한 해결이며 마지막 `[End]` 또는 `[Fade Out]`은 구조 그대로 유지합니다.

## 15개 canonical 구조

`assets/js/structureProfiles.js`의 순서와 태그는 제품 계약입니다.

1. **Pop** — Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Pre-Chorus → Chorus → Bridge → Chorus → Outro → End
2. **K-Ballad** — Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Chorus → Bridge → Key Change → Final Chorus → Outro → End
3. **Emotional R&B / Neo-soul** — Chorus → Verse 1 → Chorus → Interlude → Verse 2 → Chorus → Bridge → Chorus → Outro → End
4. **City Pop** — Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Pre-Chorus → Chorus → Solo → Chorus → Outro → Fade Out
5. **Acoustic / Folk** — Intro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus → Outro → End
6. **Indie / Alternative** — Intro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Instrumental → Chorus → Outro → End
7. **Dance / EDM** — Intro → Verse 1 → Build up → Drop → Verse 2 → Build up → Drop → Bridge → Build up → Drop → Outro → End
8. **Hip-hop / Trap** — Intro → Verse 1 → Hook → Verse 2 → Hook → Bridge → Hook → Outro → End
9. **Rock / Band** — Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Pre-Chorus → Chorus → Guitar Solo → Bridge → Chorus → Outro → End
10. **Lo-fi** — Intro → Verse → Chorus → Interlude → Verse → Chorus → Outro → Fade Out
11. **OST / Cinematic** — Intro → Verse 1 → Chorus → Interlude → Verse 2 → Pre-Chorus → Chorus → Bridge → Key Change → Final Chorus → Outro → End
12. **Trot** — Intro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus → Outro → End
13. **Jazz / Swing** — Intro → Verse 1 → Chorus → Solo → Verse 2 → Chorus → Solo → Outro → End
14. **Synthwave / Retro** — Intro → Verse 1 → Chorus → Verse 2 → Chorus → Instrumental → Bridge → Chorus → Outro → Fade Out
15. **UK Garage** — Intro → Verse 1 → Build up → Chorus → Verse 2 → Build up → Chorus → Bridge → Instrumental → Chorus → Outro → End

18개 프리셋이 15개 구조 ID를 모두 대표합니다. K-Ballad, Korean Hip-Hop Trap, Modern Korean Trot, Midnight Jazz Swing, UK Garage도 전문 BPM/Key/악기/production/Mood/Exclude/parameter 범위와 함께 포함됩니다.

## 테마와 콘셉트

`assets/js/conceptPalettes.js`에는 최소 다음 여덟 의미 팔레트가 있습니다.

- 새벽/밤 (`dawn-night`)
- 계절/향수 (`season-nostalgia`)
- 드라이브/자유 (`drive-freedom`)
- 사랑/이별 (`love-separation`)
- 치유/성장 (`healing-growth`)
- 도시/네온 (`city-neon`)
- 꿈/우주 (`dream-cosmos`)
- 바다/여행 (`ocean-travel`)

한글·영문 alias를 Unicode/대소문자/공백/문장부호 정규화 후 점수화합니다. 복합 테마가 여러 개념을 포함하면 수요일 감성 트랙과 금요일 에너지 트랙에 맞는 팔레트를 분리합니다. 예를 들어 `초가을 새벽 감성과 주말 드라이브`는 감성 트랙에 계절/새벽 계열, 에너지 트랙에 드라이브 계열을 우선 배정합니다. 알 수 없는 테마는 각 lane에 맞는 seed 기반 팔레트를 고릅니다. 임의 텍스트를 번역했다고 가장하지 않으며, 제목의 한글/영문 코어는 항상 사람이 작성한 쌍입니다. 사용자 테마는 쉼표와 제어 문자를 정리한 suffix/cue로 제목에 남습니다. 각 팔레트에는 8개 제목 변형이 있어 한 달의 본편 8곡이 같은 제목으로 수렴하지 않습니다.

## 결정적 생성과 새 변형

- 코드에서 같은 `{ theme, startWednesday, seed }`를 명시하면 전체 JSON이 deep-equal입니다.
- 장르 회전, 콘셉트/제목, Style/parameter, Mood, 가사 섹션은 stable hash 기반의 독립 named PRNG stream을 사용합니다. 한 영역에 난수 선택을 추가해도 다른 영역의 결과가 연쇄적으로 바뀌지 않습니다.
- 다른 seed는 제목, 프리셋 회전, 보컬/파라미터 또는 가사 변형을 바꿉니다.
- 브라우저의 **새 월간 패키지 생성** 버튼은 매 클릭마다 `crypto.getRandomValues`로 새 seed를 전달합니다. 제한된 구형 환경에서는 시간+고해상도 타이머+counter를 사용합니다.

## Schema와 이전 플랜

새 플랜 루트는 `schemaVersion: 2`와 `engineVersion`을 저장합니다. 트랙은 기존 필드와 함께 `presetId`, `structureId`, `titleKo`, `titleEn`, `concept`, `bpm`, `key`, `vocalPhrase`, `structure`, `structureRationale`, `producerPrescription`, `lyricSections`, `lyrics`를 포함합니다.

브라우저 저장 키는 이전과 동일한 **`sunoflow.plan.v1`**입니다. `assets/js/planSchema.js`가 다음 경계를 담당합니다.

- 버전이 없거나 `schemaVersion: 1`인 기존 플랜은 legacy로 불러옵니다.
- legacy의 영어 `lyricsGuide`를 v2 한글 가사로 조용히 위조하지 않으며 카드에 명확히 표시합니다.
- UI는 `lyrics ?? lyricsGuide`를 사용합니다.
- 손상된 구조와 지원 버전보다 미래인 schema는 렌더링 전에 안전하게 거부합니다.

JSON은 전체 구조를 보존하는 canonical 백업입니다. CSV는 기존 12개 컬럼 뒤에 v2 필드를 추가하고 multiline 가사를 quoted cell로 내보냅니다. Markdown은 월간 summary table 뒤에 각 트랙의 전체 구조·프롬프트·가사 섹션을 기록합니다. YouTube 설명은 내부 Exclude/프로듀서 처방 대신 본편의 강한 코러스 또는 Shorts의 정확한 훅 가사 일부를 넣습니다.

## 실행과 배포

SunoFlow는 100% 정적 앱입니다.

- 의존성 및 `npm install` 없음
- build step / bundler 없음
- framework 없음
- CDN 및 runtime external request 없음
- API 및 서버 없음
- plain HTML, hand-written CSS, vanilla JavaScript ES modules

ES module 보안 정책이 브라우저마다 달라 로컬 정적 서버 사용을 권장합니다.

```sh
cd /path/to/romanrecue
python3 -m http.server 8080
```

그 다음 `http://localhost:8080`을 엽니다. 모듈 `file://` 로드를 허용하는 브라우저에서는 `index.html`을 직접 열 수도 있습니다.

GitHub Pages에서는 루트 `index.html`, `.nojekyll`, 상대 경로 asset만 사용합니다. 커밋된 파일이 그대로 배포되며 네트워크 의존성이나 빌드 산출물이 없습니다.

## 화면 사용법

1. 월간 테마 한 줄을 입력합니다.
2. **새 월간 패키지 생성**을 누릅니다.
3. Full/Shorts 필터로 필요한 카드만 봅니다.
4. 긴 필드를 펼쳐 확인하고 Title, Style, Exclude, Mood, Lyrics, Structure, Rationale, Prescription 또는 **Copy All Settings**를 복사합니다.
5. 생성 상태를 `Planned → Generated → Published`로 변경합니다.
6. JSON/CSV/Markdown으로 백업 또는 내보냅니다.

모든 동적 문자열은 `textContent`로 삽입되므로 가져온 테마/가사를 HTML로 실행하지 않습니다.

## 코드 구조

```text
index.html
assets/
  css/styles.css
  js/
    app.js                 # 안전한 DOM 렌더링, clipboard, import/export
    conceptPalettes.js     # 의미 매칭, 8개 bilingual 팔레트, line banks
    exporters.js           # JSON, CSV, Markdown, YouTube
    genrePresets.js        # 18개 stable-ID Suno v6 presets
    lyricsEngine.js        # 구조형 완성 가사와 Shorts excerpt
    planSchema.js          # v1 legacy / v2 / future schema boundary
    promptEngine.js        # 월간 package orchestration
    schedule.js            # 4주 릴리스 날짜
    seededRandom.js        # stable hash + named PRNG streams
    storage.js             # sunoflow.plan.v1 localStorage
    structureProfiles.js   # exact 15 canonical structures
```

## 새 프롬프트 예시를 프리셋에 반영하기

실제 Suno prompt 예시는 `genrePresets.js`의 데이터로 흡수합니다. 새 프리셋은 stable `id`, canonical `structureId`, BPM/Key, instrumentation, master-grade production, 성별이 붙은 vocal options, dynamic curve, finishing tags, Mood words, genre-specific excludes, Weirdness/Style Influence 범위를 모두 가져야 합니다.

프롬프트 예시를 추가하더라도 다음을 깨뜨리면 안 됩니다.

1. 사용자 테마 → 한 콘셉트 → bilingual title → exact title hook → 전체 가사의 의미 일관성
2. 위 15개 구조의 태그와 순서
3. Suno v6 Mood와 Style의 분리
4. 부모 본편에서만 파생하는 Shorts
5. 사용자 직접 곡 생성(no API) 흐름
6. dependency-free GitHub Pages architecture

## 검증

Node 내장 test runner만 사용합니다.

```sh
env -u NODE_OPTIONS node --test
```

모든 JavaScript 모듈의 syntax check:

```sh
for file in assets/js/*.js; do env -u NODE_OPTIONS node --check "$file"; done
```

대표 플랜 검수 시에는 한글 복합 테마와 alias가 없는 테마를 각각 고정 seed로 생성해 제목-훅-가사 일치, 정확한 섹션 순서, Hangul 가사, 부모/Shorts excerpt 동일성, 미해결 템플릿 marker 부재를 확인합니다.
