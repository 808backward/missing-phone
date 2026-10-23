# 주운 휴대폰 (missing-phone)

벤치에서 주운 휴대폰을 몰래 들여다보는 인터랙티브 스토리 웹사이트입니다.
iOS처럼 생긴 화면에서 잠금을 풀고, 앱을 둘러보는 동안 전화·문자·알람이 이어지며 이야기가 진행됩니다.

- 순수 HTML + CSS + 바닐라 JavaScript (ES 모듈). 빌드 도구·서버·DB 없음
- 이미지와 아이콘은 모두 직접 그린 SVG/CSS이고, 효과음은 Web Audio로 합성합니다

## 로컬에서 실행

ES 모듈을 쓰기 때문에 `index.html` 을 더블클릭(file://)하면 동작하지 않습니다. 정적 서버로 띄워 주세요.

```bash
npx serve .
# 또는
python -m http.server 8000
```

- 모바일 너비(600px 미만): 화면을 가득 채웁니다
- PC(600px 이상): 390×844 폰을 가운데 두고 창 높이에 맞춰 축소합니다

새로고침하면 진행 상황이 초기화되고 처음부터 다시 시작합니다.

## 스토리 고치기 — `js/story.js`

대사, 연락처, 암호, 이벤트 조건은 모두 [js/story.js](js/story.js) 한 파일에 있습니다. 항목마다 주석으로 형식을 적어 두었습니다.

| 바꾸고 싶은 것 | 항목 |
| --- | --- |
| 잠금 암호 | `PASSCODE` (숫자 4자리 문자열) |
| 잠금화면 날짜 / 시작 시각 | `CLOCK` |
| 잠금화면 알림 (암호 힌트) | `LOCK_NOTIFICATIONS` |
| 홈 아이콘 순서 · 이름 · 배지 | `HOME` |
| 톡 채팅방 | `KAKAO` |
| 문자 | `MESSAGES` |
| 최근 통화 / 연락처 | `PHONE_RECENTS`, `CONTACTS` |
| 메모 · 캘린더 · 알람 | `MEMOS`, `CALENDAR`, `ALARMS` |
| 사진 · 튜브 · 브라우저 · 음성 메모 · 날씨 · 번역 | `PHOTOS`, `YOUTUBE`, `BROWSER`, `VOICE`, `WEATHER`, `TRANSLATE` |
| 이야기 흐름 | `EVENTS` |
| 효과음 파일 | `AUDIO` (비워 두면 합성음) |

### 대화 메시지 형식

```js
{ date: '2026년 10월 19일 월요일' },             // 날짜 구분선
{ from: 'them', text: '오늘 생일이지', time: '오후 7:48' },
{ from: 'me', text: '응', time: '오후 7:48' },     // 폰 주인이 보낸 말풍선
```

단체방은 `members` 에 참여자를 정의하고 `from` 에 그 키를 씁니다.

### 이벤트 체인 형식

```js
{
  id: 'call_unknown',
  trigger: { type: 'appsOpened', count: 3 },  // 서로 다른 앱 3개를 열면
  delay: 1800,                                // 1.8초 뒤
  action: 'call',                             // 전화가 온다
  payload: { number: '010-0000-0000', ringMs: 4000 },
},
{
  id: 'sms_first',
  trigger: { type: 'after', event: 'call_unknown', delay: 2500 }, // 전화가 끝나고 2.5초 뒤
  action: 'message',
  payload: { thread: 'unknown', name: '010-0000-0000', messages: ['주우신 분 계세요?'] },
},
```

| trigger | 의미 |
| --- | --- |
| `{ type: 'unlock' }` | 잠금 해제 |
| `{ type: 'appsOpened', count }` | 서로 다른 앱을 N개 열었을 때 |
| `{ type: 'appOpened', app }` | 특정 앱을 열었을 때 |
| `{ type: 'chatRead', chat }` | 그 방을 끝까지 읽었을 때 (`OPTIONS.readDelay` 이상 머물고 맨 아래까지) |
| `{ type: 'after', event, delay }` | 다른 이벤트가 끝나고 delay ms 뒤 |
| `{ type: 'choice', chat, option? }` | 그 방에서 선택지를 골랐을 때 |
| `{ type: 'any', of: [...] }` | 여러 조건 중 하나라도 먼저 충족되면 |

| action | payload |
| --- | --- |
| `call` | `number`, `name?`, `ringMs?`, `answer?: { lines }` — 안 받으면 부재중으로 기록 |
| `message` | `thread`, `name?`, `number?`, `messages`, `choices?` — 문자 + 알림 배너 |
| `kakao` | `chat`, `messages`, `choices?` — 톡 + 알림 배너 |
| `alarm` | `time`, `label`, `ringMs?` — 시계를 맞추고 알람이 울림 |
| `end` | `title`, `text` — 엔딩 카드 |

`when: { done: 'id', chosen: 'chat:option' }` 으로 추가 조건을 걸 수 있습니다(분기 엔딩에 사용).
이벤트는 차례로 하나씩 실행되므로, 전화가 울리는 동안 다른 이벤트는 기다립니다.

## Netlify 배포

이 레포는 빌드 과정이 없는 정적 사이트라 폴더째 올리면 바로 동작합니다.

**GitHub 연동 (자동 배포)**

1. [Netlify](https://app.netlify.com) → **Add new site → Import an existing project**
2. GitHub 에서 `808backward/missing-phone` 선택
3. Build command 는 비워 두고, Publish directory 는 `.` (루트)
4. **Deploy** — 이후 `main` 브랜치에 push 할 때마다 자동으로 다시 배포됩니다

**수동 배포**: Netlify 대시보드의 **Deploys** 탭에 이 폴더를 드래그 앤 드롭해도 됩니다.

## 파일 구조

```
index.html          화면 섹션 (상태바, 잠금, 암호, 홈, 앱, 전화, 알림, 홈 인디케이터)
css/
  base.css          폰 프레임, 상태바, 배너, 공통 애니메이션
  lock.css          잠금화면 · 암호 키패드
  home.css          홈 그리드 · Dock
  apps.css          앱 공통 프레임과 앱별 화면
  call.css          전화 수신 · 알람 · 엔딩
js/
  story.js          스토리 데이터 (여기만 고치면 됨)
  state.js          진행 상태 (sessionStorage, 새로고침 시 초기화) · 시계
  events.js         이벤트 체인 실행
  router.js         화면 전환, 앱 열기/닫기, 앱 내부 화면 스택
  audio.js          Web Audio 효과음 (파일 decode 또는 합성)
  main.js           진입점: 화면 맞춤, 제스처, 이벤트 액션 연결
  lock.js           잠금화면 · 암호
  home.js           홈 화면 · 배지
  notify.js         알림 배너, 메시지 도착 처리
  call.js           전화 · 알람 · 엔딩 오버레이
  icons.js          앱 아이콘 SVG
  registry.js       앱 목록
  util.js           공용 도우미 (드래그 제스처 등)
  apps/             앱별 화면 (chat.js 는 톡/메시지 공용 채팅방)
images/             사진 앱에 쓸 실제 이미지 (선택)
audio/              효과음 파일 (선택)
```
