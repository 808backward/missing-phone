/* =====================================================================
 *  story.js — 스토리 데이터
 *  이 파일만 고쳐도 대사, 연락처, 암호, 이벤트 흐름이 전부 바뀝니다.
 *
 *  공통 규칙
 *   - 문자열 안의 \n 은 화면에서 줄바꿈으로 표시됩니다.
 *   - 시간은 화면에 보이는 그대로 적습니다. 예) '오후 8:58', '어제', '7월 20일'
 *   - 대화 메시지의 from
 *       'me'   = 폰 주인(서진)이 보낸 메시지 (오른쪽 말풍선)
 *       'them' = 1:1 대화 상대
 *       그 밖  = 단체방의 members 에 정의한 키
 *   - { date: '...' } 항목은 날짜 구분선입니다.
 *   - 채팅방/문자방 id 는 톡과 메시지를 통틀어 겹치지 않게 지어 주세요.
 *     (이벤트 조건에서 id 로 방을 찾습니다)
 *
 *  설정: 헤어진 전 애인 '서진'의 휴대폰을 '도현'(플레이어)이 주웠다.
 *        오늘(10월 19일)은 도현의 생일, 서진은 금요일에 리스본으로 떠난다.
 * ===================================================================== */

/** 잠금 해제 암호 — 숫자 4자리 문자열 */
export const PASSCODE = '0719';

/** 폰 주인 */
export const OWNER = { name: '한서진', initials: '서진' };

/**
 * 시계
 *  date  : 잠금화면 날짜
 *  start : 첫 화면의 시각(24시간제). 이후 실제 시간 흐름대로 1분씩 지나갑니다.
 */
export const CLOCK = { date: '10월 19일 월요일', start: '21:24' };

/** 진행 옵션 */
export const OPTIONS = {
  readDelay: 2500, // 채팅방에 이만큼(ms) 머물고 맨 아래까지 보면 '다 읽음'으로 처리
};

/**
 * 효과음 파일 (audio/ 폴더). null 이면 Web Audio 로 합성한 소리를 씁니다.
 * 예) ring: 'audio/ring.mp3'
 */
export const AUDIO = {
  key: null, // 키패드 클릭
  unlock: null, // 잠금 해제
  ring: null, // 전화 벨소리 (반복 재생)
  notify: null, // 알림 배너
  receive: null, // 보고 있는 방에 메시지 도착
  send: null, // 메시지 보냄
  alarm: null, // 알람 (반복 재생)
};

/** 잠금화면에 쌓여 있는 알림 — 암호 힌트를 여기에 숨겨 두었습니다 */
export const LOCK_NOTIFICATIONS = [
  { app: 'kakao', title: '지원', body: '아 그리고 비번 아직도 너네 처음 만난 날(7/19)이더라. 이제 좀 바꿔 🙄', time: '41분 전' },
  { app: 'phone', title: '부재중 전화', body: '엄마', time: '3시간 전' },
];

/* ---------------------------------------------------------------------
 *  홈 화면
 *   grid  : 4열 아이콘 순서
 *   dock  : 하단 Dock 4개
 *   names : 아이콘 이름 (바꾸고 싶으면 여기서)
 *   badges: 고정 숫자 배지 (톡/메시지/전화 배지는 자동 계산)
 *  내용이 없는 앱(camera, appstore, maps, wallet, health)은 누르면 흔들리기만 합니다.
 * ------------------------------------------------------------------- */
export const HOME = {
  grid: ['calendar', 'photos', 'camera', 'clock', 'weather', 'memo', 'voice', 'youtube', 'browser', 'appstore', 'maps', 'settings', 'wallet', 'health'],
  dock: ['phone', 'messages', 'kakao', 'translate'],
  names: {
    phone: '전화', messages: '메시지', kakao: '톡', translate: '번역',
    calendar: '캘린더', photos: '사진', camera: '카메라', clock: '시계',
    weather: '날씨', memo: '메모', voice: '음성 메모', youtube: '튜브',
    browser: '브라우저', appstore: '앱 스토어', maps: '지도', settings: '설정',
    wallet: '지갑', health: '건강',
  },
  badges: { appstore: 2, settings: 1 },
};

/** 연락처 (전화 앱 > 연락처 탭) */
export const CONTACTS = [
  { name: '김 팀장님', number: '010-5521-3380' },
  { name: '꽃집 오월', number: '02-335-0519' },
  { name: '도현', number: '010-7719-2048' },
  { name: '민재', number: '010-3302-1187' },
  { name: '엄마', number: '010-4410-6620' },
  { name: '유나', number: '010-9183-4471' },
  { name: '지원', number: '010-2208-5531' },
];

/* ---------------------------------------------------------------------
 *  톡 (카톡풍 메신저)
 *   unread      : 처음에 보이는 안 읽은 개수 (방을 열면 사라짐)
 *   listTime    : 목록에 보일 시간 (없으면 마지막 메시지 시간)
 *   color/avatar: 프로필 배경색 / 프로필 글자(없으면 이름 첫 글자)
 *   members     : 단체방 참여자
 *   unreadCount : 내가 보낸 메시지 옆 '읽지 않은 사람 수' 숫자
 *   choices     : 처음부터 보이는 답장 선택지 (이벤트로도 추가 가능)
 * ------------------------------------------------------------------- */
export const KAKAO = [
  {
    id: 'jiwon',
    name: '지원',
    color: '#f4a7bb',
    unread: 3,
    messages: [
      { date: '2026년 10월 19일 월요일' },
      { from: 'them', text: '오늘 도현이 생일이지', time: '오후 7:48' },
      { from: 'me', text: '응', time: '오후 7:48' },
      { from: 'them', text: '그래서. 연락할 거야?', time: '오후 7:49' },
      { from: 'me', text: '모르겠어. 일단 꽃은 샀어', time: '오후 8:10' },
      { from: 'me', text: '그 벤치 가 있으려고. 9시 반에 알람 맞춰놨어\n그때까지 아무 일 없으면 내가 먼저 연락할 거야', time: '오후 8:10' },
      { from: 'them', text: '야 걔가 거길 올 거라고 생각하는 거야?', time: '오후 8:11' },
      { from: 'me', text: '아니. 그냥… 거기서 하고 싶어서', time: '오후 8:12' },
      { from: 'them', text: '출국 전에 말 안 하면 평생 후회한다 너', time: '오후 8:40' },
      { from: 'them', text: '그 편지라도 보내. 메모장에 써놨다며', time: '오후 8:40' },
      { from: 'them', text: '아 그리고 비번 아직도 너네 처음 만난 날(7/19)이더라. 이제 좀 바꿔 🙄', time: '오후 8:43' },
    ],
  },
  {
    id: 'team',
    name: '디자인팀 🔥',
    color: '#8fb8ff',
    avatar: '팀',
    unread: 5,
    listTime: '오후 6:41',
    members: {
      kim: { name: '김 팀장', color: '#9ccfa4' },
      yuna: { name: '유나', color: '#ffd28a' },
      minjae: { name: '민재', color: '#b7a8f0' },
    },
    messages: [
      { date: '2026년 10월 19일 월요일' },
      { from: 'kim', text: '내일 오전 회의 10시로 당겨졌어요', time: '오후 5:02' },
      { from: 'yuna', text: '넵!', time: '오후 5:03' },
      { from: 'minjae', text: '확인했습니다', time: '오후 5:03' },
      { from: 'kim', text: '그리고 서진님 마지막 출근 목요일 맞죠?', time: '오후 5:10' },
      { from: 'me', text: '네 팀장님, 목요일까지 인수인계 마무리할게요', time: '오후 5:11' },
      { from: 'yuna', text: '흑흑 서진님 가지 마요 😭', time: '오후 6:30' },
      { from: 'yuna', text: '리스본 가서도 단톡 꼭 봐주세요', time: '오후 6:30' },
      { from: 'minjae', text: '송별회 사진 앨범에 올려뒀어요', time: '오후 6:35' },
      { from: 'kim', text: '다들 고생 많았어요. 오늘은 일찍들 들어가요', time: '오후 6:41' },
      { from: 'kim', text: '서진님은 특히 일찍!', time: '오후 6:41' },
    ],
  },
  {
    id: 'mom',
    name: '엄마',
    color: '#ffb38a',
    unread: 1,
    messages: [
      { date: '2026년 10월 18일 일요일' },
      { from: 'them', text: '서진아 목요일에 와서 자고 가', time: '오후 7:40' },
      { from: 'them', text: '김치랑 멸치볶음 싸놨다 캐리어 자리 남겨둬', time: '오후 7:40' },
      { from: 'me', text: '엄마 거기 포르투갈이야 김치 냄새 나면 쫓겨나', time: '오후 8:02' },
      { from: 'them', text: '😂😂', time: '오후 8:03' },
      { date: '2026년 10월 19일 월요일' },
      { from: 'them', text: '아까 왜 전화 안 받아. 공항 몇 시 비행기니', time: '오후 6:21' },
    ],
  },
  {
    id: 'minjae',
    name: '민재',
    color: '#b7a8f0',
    messages: [
      { date: '2026년 10월 19일 월요일' },
      { from: 'them', text: '서진씨 오늘 저녁에 잠깐 시간 돼요?', time: '오후 5:14' },
      { from: 'them', text: '할 말이 좀 있어서요', time: '오후 5:14' },
      { from: 'me', text: '아 오늘은 안 될 것 같아요. 가볼 데가 있어서요', time: '오후 5:18' },
      { from: 'them', text: '…그 사람 만나러 가요?', time: '오후 5:19' },
      { from: 'me', text: '그냥 생일이라서요. 축하한다는 말만 하려고요', time: '오후 5:20' },
      { from: 'them', text: '그렇구나. 잘 다녀와요', time: '오후 5:20' },
    ],
  },
  {
    id: 'dohyun',
    name: '도현',
    color: '#9fb4c8',
    listTime: '7월 20일',
    messages: [
      { date: '2026년 7월 19일 일요일' },
      { from: 'them', text: '오늘 딱 1년이네', time: '오후 11:02' },
      { from: 'me', text: '응', time: '오후 11:40' },
      { from: 'them', text: '내일 얘기 좀 하자. 제대로', time: '오후 11:41' },
      { date: '2026년 7월 20일 월요일' },
      { from: 'me', text: '어제 한 말들, 진심 아니었던 거 알아', time: '오후 4:15' },
      { from: 'me', text: '그래도 우리 여기까지인 것 같아', time: '오후 4:15' },
      { from: 'them', text: '…알겠어', time: '오후 6:52' },
      { from: 'them', text: '잘 지내', time: '오후 6:52' },
      { from: 'me', text: '너도.', time: '오후 9:30' },
    ],
  },
];

/* ---------------------------------------------------------------------
 *  메시지 (iMessage풍 문자)
 *   number    : 있으면 입력창이 '문자 메시지', 없으면 'iMessage'
 *   readLabel : 내가 보낸 마지막 말풍선 아래 표시 (예: '읽음 8월 2일')
 * ------------------------------------------------------------------- */
export const MESSAGES = [
  {
    id: 'flower',
    name: '꽃집 오월',
    number: '02-335-0519',
    listTime: '오후 3:58',
    messages: [
      { date: '오늘 오후 3:58' },
      { from: 'them', text: '[Web발신]\n[꽃집 오월] 한서진 고객님, 예약하신 작약 꽃다발 오늘 20:00부터 픽업 가능합니다.\n리본 문구는 말씀하신 대로 비워두었습니다.' },
    ],
  },
  {
    id: 'airline',
    name: '하늘항공',
    number: '1588-0703',
    listTime: '어제',
    messages: [
      { date: '어제 오전 11:20' },
      { from: 'them', text: '[Web발신]\n[하늘항공] 한서진님 10/23(금) 10:40 인천(ICN)→리스본(LIS) HA703편 예약이 확정되었습니다. (편도)' },
    ],
  },
  {
    id: 'dohyun-sms',
    name: '도현',
    listTime: '8월 2일',
    readLabel: '읽음 8월 2일',
    messages: [
      { date: '2026. 8. 2. (일) 오전 2:14' },
      { from: 'me', text: '자?' },
    ],
  },
];

/* ---------------------------------------------------------------------
 *  전화 > 최근 기록  (type: 'incoming' | 'outgoing' | 'missed')
 *  이벤트로 걸려온 전화는 자동으로 맨 위에 추가됩니다.
 * ------------------------------------------------------------------- */
export const PHONE_RECENTS = [
  { name: '도현', type: 'outgoing', label: '휴대전화 · 취소됨', time: '오후 9:12' },
  { name: '엄마', type: 'missed', label: '휴대전화', time: '오후 6:20', count: 2 },
  { name: '꽃집 오월', type: 'incoming', label: '유선전화', time: '오후 4:02' },
  { name: '지원', type: 'outgoing', label: '휴대전화', time: '어제' },
  { name: '김 팀장님', type: 'incoming', label: '휴대전화', time: '어제' },
  { name: '하늘항공', type: 'outgoing', label: '유선전화', time: '토요일' },
  { name: '엄마', type: 'incoming', label: '휴대전화', time: '토요일' },
];

/** 메모 — 위에서부터 목록 순서 */
export const MEMOS = [
  {
    title: '보내지 못한 편지',
    date: '오후 9:05',
    body: '도현아.\n\n생일 축하해. 이 한 마디 하려고 석 달을 고민했어.\n\n그날 내가 먼저 끝내자고 한 거, 네가 미워서가 아니었어. 리스본 일 제안받은 걸 말하면 네가 다 내려놓고 따라오겠다고 할까 봐. 그게 무서웠어.\n\n금요일에 떠나. 한 달일지 일 년일지 모르겠어.\n\n떠나기 전에 딱 한 번만, 우리 처음 만난 그 벤치에서 보고 싶었어.\n\n(아직 못 보냄)',
  },
  {
    title: '10/19',
    date: '오후 6:47',
    body: '- 꽃 픽업 (오월, 8시)\n- 망원 벤치 9시\n- 9시 30분 알람 = 마지막 용기\n- 연락하지 말기\n- …하면 안 되나?',
  },
  {
    title: '리스본 짐',
    date: '어제',
    body: '여권 / 비자 서류\n멀티어댑터\n상비약\n엄마 반찬 (최소한만…)\n카메라, 필름 3롤\n그 사람이 준 머플러는 두고 가기\n→ 아니 가져가기',
  },
  {
    title: '지원 생일 선물',
    date: '2026. 9. 28.',
    body: '향초 말고 다른 거\n작년에 갖고 싶다던 필름카메라 스트랩',
  },
];

/* ---------------------------------------------------------------------
 *  캘린더 — 2026년 10월 / 오늘 19일
 *   events 의 키는 날짜(일), 값은 일정 목록
 * ------------------------------------------------------------------- */
export const CALENDAR = {
  year: 2026,
  month: 10,
  today: 19,
  events: {
    3: [{ time: '하루 종일', title: '지원 생일 🎂', color: '#ff2d55' }],
    10: [{ time: '오전 10:00', title: '팀 워크숍', color: '#007aff' }],
    16: [{ time: '오후 7:00', title: '디자인팀 송별회', color: '#007aff' }],
    19: [
      { time: '하루 종일', title: '도현 생일', color: '#ff9500' },
      { time: '오후 8:00', title: '꽃 픽업 – 오월', color: '#34c759' },
      { time: '오후 9:00', title: '망원 한강공원 벤치', color: '#af52de' },
    ],
    22: [{ time: '오후 7:00', title: '엄마 집', color: '#34c759' }],
    23: [{ time: '오전 10:40', title: '출국 ✈️ ICN → LIS', color: '#ff3b30' }],
    26: [{ time: '오전 9:30', title: '리스본 첫 출근', color: '#007aff' }],
  },
};

/** 시계 > 알람 */
export const ALARMS = [
  { id: 'weekday', time: '07:30', label: '알람', repeat: '주중', on: true },
  { id: 'weekday2', time: '07:40', label: '진짜 일어나기', repeat: '주중', on: false },
  { id: 'bench', time: '21:30', label: '말하기. 생일 축하한다고.', repeat: '', on: true },
  { id: 'flight', time: '06:00', label: '공항 가는 날', repeat: '10월 23일', on: true },
];

/* ---------------------------------------------------------------------
 *  사진
 *   art   : 그림 종류 (bouquet, bench, river, ticket, cake, coffee, cat, city, moon, letter, sea, street)
 *   colors: 배경 그라디언트 [위, 아래]
 *   src   : 실제 이미지를 쓰려면 'images/파일명.jpg' (있으면 art 대신 표시)
 * ------------------------------------------------------------------- */
export const PHOTOS = [
  { art: 'bench', colors: ['#1d2346', '#4d3b6b'], caption: '그 벤치. 아직 그대로 있네', date: '오늘 오후 9:01' },
  { art: 'bouquet', colors: ['#fbe3e8', '#f2b8c6'], caption: '작약. 리본은 비워 달라고 했다', date: '오늘 오후 8:04' },
  { art: 'river', colors: ['#ff9a6b', '#5b3f8c'], caption: '망원 한강, 오늘 노을', date: '오늘 오후 6:12' },
  { art: 'ticket', colors: ['#dfe9f5', '#a9c1e0'], caption: 'ICN → LIS 편도', date: '어제' },
  { art: 'city', colors: ['#ffd9a8', '#f08a5d'], caption: '리스본 숙소 (사진이랑 다를 듯)', date: '10월 15일' },
  { art: 'cat', colors: ['#f6efe4', '#e2d3bf'], caption: '지원이네 두부', date: '10월 3일' },
  { art: 'letter', colors: ['#f7f1e3', '#e6d9bd'], caption: '쓰다 만 편지 1', date: '9월 21일' },
  { art: 'street', colors: ['#2a3a4f', '#11161f'], caption: '혼자 걸은 날', date: '8월 2일' },
  { art: 'moon', colors: ['#0d1430', '#26305e'], caption: '', date: '7월 20일' },
  { art: 'cake', colors: ['#ffe7c2', '#ffc58f'], caption: '작년 오늘. 초 27개 꽂다가 포기', date: '2025년 10월 19일' },
  { art: 'sea', colors: ['#8fd3f4', '#3a7bd5'], caption: '첫 여행, 강릉', date: '2025년 8월 15일' },
  { art: 'coffee', colors: ['#e9d8c4', '#b98b63'], caption: '처음 만난 날. 망원동 카페', date: '2025년 7월 19일' },
];

/** 튜브 (YouTube풍) */
export const YOUTUBE = {
  query: '헤어진 사람 생일 연락',
  recent: ['리스본 브이로그', '이별 후 연락 타이밍', '망원 한강공원 야경', '생일 축하 노래 어쿠스틱'],
  videos: [
    { title: '헤어진 연인 생일, 연락해도 될까? | 새벽 연애 상담', channel: '새벽 세 시 라디오', meta: '조회수 48만회 · 2주 전', duration: '18:42', colors: ['#2b2d6e', '#c84b7a'] },
    { title: '[playlist] 끝내 하지 못한 말 | 새벽 감성 어쿠스틱', channel: '무드 서랍', meta: '조회수 112만회 · 8개월 전', duration: '1:02:17', colors: ['#3d2b1f', '#d39b5f'] },
    { title: '리스본 한 달 살기 vlog 🇵🇹 노란 트램, 에그타르트, 그리고 혼자', channel: '여름의 일기', meta: '조회수 23만회 · 3개월 전', duration: '24:05', colors: ['#f6c453', '#e0603f'] },
    { title: '망원 한강공원 밤 산책 4K | 바람 소리만', channel: '서울 걷기', meta: '조회수 9.1만회 · 1년 전', duration: '45:00', colors: ['#0f1b3d', '#3e5c9a'] },
  ],
};

/** 브라우저 (Chrome풍) — results 는 최근 검색어를 눌렀을 때 보일 결과 */
export const BROWSER = {
  recent: ['헤어진 연인 생일 연락 해도 될까', '리스본 한 달 살기 물가', '작약 꽃말', '망원 한강공원 벤치 몇 시까지', '보내지 못한 편지 보내는 법'],
  results: {
    '작약 꽃말': [
      { site: '꽃말 사전', title: '작약 - 꽃말과 유래', snippet: '수줍음, 그리고 오래 머뭇거린 마음. 늦봄에 피어 오래 가지 않는 꽃이라 선물할 땐 "지금"이라는 뜻을 담기도 합니다.' },
      { site: '플라워 매거진', title: '고백할 때 주면 좋은 꽃 7가지', snippet: '말로 하기 어려운 마음이 있을 때, 작약은 이름보다 먼저 마음을 전합니다…' },
    ],
    '헤어진 연인 생일 연락 해도 될까': [
      { site: '연애 커뮤니티', title: '헤어진 지 3개월, 생일 연락 해도 되나요?', snippet: '답글 214 · "하고 싶은 말이 축하뿐이라면 해도 돼요. 다른 말도 하고 싶다면… 더더욱 하세요."' },
    ],
  },
};

/** 음성 메모 — duration 은 초, transcript 는 재생 중 아래에 보이는 글 */
export const VOICE = [
  { title: '망원동 벤치', date: '오늘', duration: 38, transcript: '(바람 소리)\n…도현아. 생일 축하해.\n아니, 이렇게 말하면 안 되는데.\n다시 할게.' },
  { title: '새로운 녹음 7', date: '오늘', duration: 6, transcript: '(한숨)' },
  { title: '포르투갈어 연습', date: '어제', duration: 21, transcript: 'Obrigada.\nQuero ver-te outra vez.\n…이거 맞나?' },
  { title: '팀 회의 10/16', date: '10월 16일', duration: 134, transcript: '— 회의 녹음 —' },
];

/** 날씨 */
export const WEATHER = {
  city: '마포구',
  temp: 14,
  condition: '대체로 맑음',
  high: 18,
  low: 9,
  hourly: [
    { time: '지금', icon: 'moon', temp: 14 },
    { time: '22시', icon: 'moon', temp: 13 },
    { time: '23시', icon: 'cloud', temp: 12 },
    { time: '0시', icon: 'cloud', temp: 11 },
    { time: '1시', icon: 'cloud', temp: 11 },
    { time: '2시', icon: 'moon', temp: 10 },
  ],
  daily: [
    { day: '오늘', icon: 'sun', low: 9, high: 18 },
    { day: '화', icon: 'cloud', low: 10, high: 19 },
    { day: '수', icon: 'rain', low: 8, high: 15 },
    { day: '목', icon: 'cloud', low: 7, high: 16 },
    { day: '금', icon: 'sun', low: 6, high: 17 },
  ],
};

/** 번역 — 최근 번역 기록 */
export const TRANSLATE = {
  from: '한국어',
  to: '포르투갈어',
  history: [
    { src: '다시 만나고 싶어', dst: 'Quero ver-te outra vez.' },
    { src: '생일 축하해', dst: 'Feliz aniversário.' },
    { src: '미안해. 그때 말 못 해서', dst: 'Desculpa por não ter dito naquela altura.' },
  ],
};

/* =====================================================================
 *  이벤트 체인
 *
 *  { id, trigger, delay?, when?, action, payload }
 *
 *  trigger (언제 시작할지)
 *   { type: 'unlock' }                              잠금 해제했을 때
 *   { type: 'appsOpened', count: 3 }                서로 다른 앱을 N개 열었을 때
 *   { type: 'appOpened', app: 'memo' }              특정 앱을 열었을 때
 *   { type: 'chatRead', chat: 'jiwon' }             특정 방을 끝까지 읽었을 때
 *   { type: 'after', event: 'id', delay: ms }       다른 이벤트가 끝나고 ms 뒤
 *   { type: 'choice', chat: 'id', option?: 'x' | ['x','y'] }  선택지를 골랐을 때
 *   { type: 'any', of: [trigger, ...] }             여러 조건 중 하나라도 먼저 충족되면
 *
 *  delay  : 조건 충족 후 추가로 기다릴 시간(ms)
 *  when   : 추가 조건 { done: 'id' | [...], chosen: 'chat:option' | [...] }
 *
 *  action / payload
 *   'call'    { number, name?, ringMs?, answer?: { lines: [{ text, delay }] } }
 *             ringMs 동안 안 받으면 부재중으로 끝납니다. 받으면 lines 가 자막처럼 나옵니다.
 *   'message' { thread, name?, number?, messages: [문자열 | { text, delay }], choices? }
 *   'kakao'   { chat, messages: [...], choices? }   (단체방이면 메시지에 from 지정)
 *   'alarm'   { time: 'HH:MM', label, ringMs? }      시계가 time 으로 맞춰지며 알람이 울립니다
 *   'end'     { title, text }                        엔딩 카드
 *
 *  choices: [{ id, text, send?: false, replies: [문자열 | { text, delay }] }]
 *   send: false 면 내 말풍선 없이 replies 만 이어집니다.
 *  이벤트는 하나씩 차례로 실행됩니다 (전화가 끝나야 다음 이벤트).
 * ===================================================================== */
const UNKNOWN = '010-4827-1093'; // 서진이 빌린 휴대폰 번호

export const EVENTS = [
  {
    // 1. 앱 3개를 둘러보면 모르는 번호로 전화가 온다
    id: 'call_unknown',
    trigger: { type: 'appsOpened', count: 3 },
    delay: 1800,
    action: 'call',
    payload: {
      number: UNKNOWN,
      ringMs: 4000,
      answer: {
        lines: [
          { text: '(바람 소리)', delay: 900 },
          { text: '…여보세요?', delay: 1500 },
          { text: '그 폰… 제 거예요. 혹시 지금—', delay: 1900 },
          { text: '(통화가 끊겼다)', delay: 1700 },
        ],
      },
    },
  },
  {
    // 2. 전화가 끝나고 잠시 뒤 문자
    id: 'sms_first',
    trigger: { type: 'after', event: 'call_unknown', delay: 2500 },
    action: 'message',
    payload: {
      thread: 'unknown',
      name: UNKNOWN,
      number: UNKNOWN,
      messages: [
        '안녕하세요. 지금 갖고 계신 휴대폰 주인이에요.',
        { text: '망원 한강공원 벤치에 두고 온 것 같아요.\n혹시 주우셨다면 이 번호로 연락 부탁드려요 🙏', delay: 1600 },
      ],
    },
  },
  {
    // 3. 지원이와의 톡을 끝까지 읽으면 (또는 45초가 지나면) 지원이가 눈치챈다
    id: 'kakao_jiwon',
    trigger: { type: 'any', of: [{ type: 'chatRead', chat: 'jiwon' }, { type: 'after', event: 'sms_first', delay: 45000 }] },
    when: { done: 'sms_first' },
    delay: 2000,
    action: 'kakao',
    payload: {
      chat: 'jiwon',
      messages: [
        '?? 서진아 폰 찾았어?',
        { text: '방금 내 톡 1 다 사라졌는데', delay: 1300 },
        { text: '…서진이 아니죠? 누구세요?', delay: 2000 },
      ],
      choices: [
        { id: 'tell', text: '서진이 폰 주운 사람이에요.', replies: ['헐 감사합니다 ㅠㅠ', '서진이한테 바로 말할게요!!'] },
        { id: 'silent', text: '(읽기만 하고 답하지 않는다)', send: false, replies: [{ text: '…뭐야 읽씹?', delay: 2600 }] },
      ],
    },
  },
  {
    // 4. 서진이 플레이어의 정체를 짐작한다
    id: 'sms_guess',
    trigger: { type: 'after', event: 'kakao_jiwon', delay: 6000 },
    action: 'message',
    payload: {
      thread: 'unknown',
      messages: [
        '지원이가 그러는데, 누가 내 폰을 열었대.',
        { text: '비밀번호 아는 사람… 한 명밖에 없는데.', delay: 2200 },
        { text: '도현이지?', delay: 2400 },
      ],
      choices: [
        { id: 'yes', text: '응, 나야.', replies: ['…그럴 줄 알았어.', { text: '하필 오늘, 하필 그 벤치에서 네가 줍냐.', delay: 2200 }] },
        { id: 'no', text: '아니요. 주운 사람입니다.', replies: ['아… 죄송해요. 제가 착각했나 봐요.', { text: '폰은 잘 좀 보관해 주세요.', delay: 2000 }] },
      ],
    },
  },
  {
    // 5. 서진이 맞춰둔 21:30 알람이 울린다
    id: 'alarm_bench',
    trigger: { type: 'choice', chat: 'unknown' },
    delay: 6000,
    action: 'alarm',
    payload: { time: '21:30', label: '말하기. 생일 축하한다고.', ringMs: 9000 },
  },
  {
    // 6-a. '응, 나야'를 골랐을 때
    id: 'sms_after_yes',
    trigger: { type: 'after', event: 'alarm_bench', delay: 2500 },
    when: { chosen: 'unknown:yes' },
    action: 'message',
    payload: {
      thread: 'unknown',
      messages: [
        '방금 알람 울렸지?',
        { text: '그거 너한테 말하려고 맞춰둔 거야.', delay: 2000 },
        { text: '생일 축하해, 도현아.', delay: 2400 },
        { text: '나 아직 공원 앞 편의점이야. 가지러 가도 돼?', delay: 2600 },
      ],
      choices: [
        { id: 'wait', text: '벤치에서 기다릴게.', replies: ['응. 금방 갈게.', { text: '이번엔 도망 안 갈게.', delay: 2000 }] },
        { id: 'go', text: '거기 있어. 내가 갈게.', replies: ['…응.', { text: '기다릴게. 이번엔 내가.', delay: 2000 }] },
      ],
    },
  },
  {
    // 6-b. '주운 사람입니다'를 골랐을 때
    id: 'sms_after_no',
    trigger: { type: 'after', event: 'alarm_bench', delay: 2500 },
    when: { chosen: 'unknown:no' },
    action: 'message',
    payload: {
      thread: 'unknown',
      messages: [
        '방금 알람 울렸죠?',
        { text: '원래 오늘 누구한테 생일 축하한다고 말하려고 맞춰둔 거였어요.', delay: 2200 },
        { text: '말투가 꼭 그 사람 같아서 착각했나 봐요.', delay: 2400 },
        { text: '…아니면, 맞는데 모르는 척하는 거야?', delay: 3000 },
      ],
      choices: [
        { id: 'meet', text: '…맞아. 벤치에서 기다릴게.', replies: ['알았어.', { text: '지금 갈게.', delay: 1800 }] },
        { id: 'leave', text: '폰은 편의점에 맡겨둘게요.', replies: ['…네. 감사합니다.'] },
      ],
    },
  },
  {
    id: 'end_together',
    trigger: { type: 'choice', chat: 'unknown', option: ['wait', 'go', 'meet'] },
    delay: 3500,
    action: 'end',
    payload: {
      title: '21:58, 그 벤치',
      text: '휴대폰은 주인에게 돌아갔다.\n작약 꽃다발과, 보내지 못한 편지도 함께.\n\n금요일의 비행기는 그대로 떠나겠지만\n이번엔 아무도 먼저 "잘 지내"라고 말하지 않았다.',
    },
  },
  {
    id: 'end_alone',
    trigger: { type: 'choice', chat: 'unknown', option: 'leave' },
    delay: 3000,
    action: 'end',
    payload: {
      title: '다음 날 아침',
      text: '편의점 카운터에 휴대폰 하나가 맡겨졌다.\n메모장 속 편지는 끝내 전송되지 않았다.\n\n…정말 그걸로 괜찮았어?',
    },
  },
];
