/* 진행 상태 — sessionStorage 에 저장하되, 새로고침하면 처음부터 다시 시작한다 */
import { CLOCK, KAKAO, MESSAGES, ALARMS } from './story.js';

const KEY = 'missing-phone';
try { sessionStorage.removeItem(KEY); } catch { /* 저장소 차단 환경 */ }

/* ---------- 간단한 이벤트 버스 ---------- */
const listeners = {};
export function on(type, fn) {
  (listeners[type] ||= new Set()).add(fn);
  return () => listeners[type].delete(fn);
}
export function emit(type, data) {
  listeners[type]?.forEach((fn) => fn(data));
}

export const state = {
  unlocked: false,
  opened: [], // 열어 본 앱 id
  done: {}, // 이벤트 id → 끝난 시각(ms)
  read: {}, // 'kakao:jiwon' → 끝까지 읽음
  unread: {}, // 채팅 키 → 안 읽은 개수
  added: {}, // 채팅 키 → 이벤트/답장으로 추가된 메시지
  threads: {}, // 이벤트로 새로 생긴 대화방
  bump: {}, // 채팅 키 → 최근 활동 순번 (목록 정렬)
  choices: {}, // 채팅 키 → 지금 보이는 선택지
  chosen: {}, // 채팅 키 → 고른 선택지 id 목록
  recents: [], // 이벤트로 추가된 통화 기록
  missedBadge: 0,
  alarms: {}, // 알람 id → 켜짐 여부
  viewing: null, // 지금 열려 있는 채팅 키
};

/** 상태를 저장하고 'change' 를 알린다. what 으로 무엇이 바뀌었는지 전달 */
export function changed(what = {}) {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 무시 */ }
  emit('change', what);
}

/* ---------- 시계: story 의 시작 시각부터 실제 시간만큼 흐른다 ---------- */
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
let clockBase = toMinutes(CLOCK.start);
let clockStart = Date.now();

export const minutes = () => (clockBase + Math.floor((Date.now() - clockStart) / 60000)) % 1440;

/** 시계를 앞으로 돌린다 (알람 연출용). 이미 지난 시각이면 그대로 둔다 */
export function setClock(hhmm) {
  const target = toMinutes(hhmm);
  if (target <= minutes()) return;
  clockBase = target;
  clockStart = Date.now();
  emit('tick');
}

/** '9:47' */
export function clockText(min = minutes()) {
  const h = Math.floor(min / 60);
  return `${h % 12 || 12}:${String(min % 60).padStart(2, '0')}`;
}
/** '오후 9:47' */
export const timeLabel = (min = minutes()) => `${min < 720 ? '오전' : '오후'} ${clockText(min)}`;
export const alarmParts = (hhmm) => {
  const min = toMinutes(hhmm);
  return { ampm: min < 720 ? '오전' : '오후', time: clockText(min) };
};

/* ---------- 채팅 (톡 / 메시지 공용) ---------- */
const BASE = { kakao: KAKAO, messages: MESSAGES };
export const chatKey = (kind, id) => `${kind}:${id}`;

for (const kind of Object.keys(BASE)) {
  for (const c of BASE[kind]) {
    const key = chatKey(kind, c.id);
    if (c.unread) state.unread[key] = c.unread;
    if (c.choices) state.choices[key] = c.choices;
  }
}
for (const a of ALARMS) state.alarms[a.id] = a.on;

function compose(kind, c, order) {
  const key = chatKey(kind, c.id);
  const added = state.added[key] || [];
  const messages = [...(c.messages || []), ...added];
  const last = [...messages].reverse().find((m) => m.text);
  return {
    ...c,
    kind,
    key,
    order,
    messages,
    last,
    listTime: added.length ? last.time : c.listTime ?? last?.time ?? '',
    unread: state.unread[key] || 0,
    choices: state.choices[key] || null,
  };
}

/** 최근 활동 순으로 정렬된 대화 목록 */
export function chatList(kind) {
  const list = BASE[kind].map((c, i) => compose(kind, c, i));
  for (const t of Object.values(state.threads)) if (t.kind === kind) list.push(compose(kind, t, -1));
  return list.sort((a, b) => (state.bump[b.key] || 0) - (state.bump[a.key] || 0) || a.order - b.order);
}

export function getChat(kind, id) {
  const c = BASE[kind].find((x) => x.id === id) || state.threads[chatKey(kind, id)];
  return c ? compose(kind, c, 0) : null;
}

let bumpSeq = 0;
export function addMessage(kind, id, msg, meta = {}) {
  const key = chatKey(kind, id);
  if (!getChat(kind, id)) {
    state.threads[key] = { kind, id, name: meta.name || id, number: meta.number, color: meta.color, messages: [] };
  }
  const added = (state.added[key] ||= []);
  // 문자 앱은 새 대화가 시작될 때 시간 구분선을 넣는다
  if (kind === 'messages' && !added.length) added.push({ date: `오늘 ${timeLabel()}` });
  // 톡: 상대가 답하면 내가 보낸 메시지의 '1' 이 사라진다
  if (kind === 'kakao' && msg.from !== 'me') added.forEach((m) => { if (m.from === 'me') m.unreadCount = 0; });
  added.push({ time: timeLabel(), ...msg });
  if (msg.from !== 'me' && state.viewing !== key) state.unread[key] = (state.unread[key] || 0) + 1;
  state.bump[key] = ++bumpSeq;
  changed({ type: 'message', key });
}

export function openChat(key) {
  state.viewing = key;
  if (state.unread[key]) {
    state.unread[key] = 0;
    changed({ type: 'read', key });
  }
}
export function closeChat(key) {
  if (state.viewing === key) state.viewing = null;
}
export function markRead(key) {
  if (state.read[key]) return;
  state.read[key] = true;
  changed({ type: 'read', key });
}
export function setChoices(key, choices) {
  state.choices[key] = choices;
  changed({ type: 'choices', key });
}
export function addChosen(key, id) {
  (state.chosen[key] ||= []).push(id);
  changed({ type: 'chosen', key });
}
export const unreadTotal = (kind) => chatList(kind).reduce((n, c) => n + c.unread, 0);

/* ---------- 그 밖의 상태 ---------- */
export function markAppOpened(id) {
  if (state.opened.includes(id)) return;
  state.opened.push(id);
  changed({ type: 'app', id });
}
export function addRecent(r) {
  state.recents.unshift(r);
  if (r.type === 'missed') state.missedBadge++;
  changed({ type: 'recent' });
}
