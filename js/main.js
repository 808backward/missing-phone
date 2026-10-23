/* 진입점 — 화면 맞춤, 시계, 제스처, 이벤트 액션 연결 */
import * as audio from './audio.js';
import * as events from './events.js';
import { on, clockText, setChoices, chatKey } from './state.js';
import { currentScreen, closeApp, show } from './router.js';
import { initLock } from './lock.js';
import { initHome } from './home.js';
import { deliver } from './notify.js';
import { incomingCall, alarm, ending } from './call.js';
import { $, $$, drag, setScale, wait } from './util.js';

const phone = $('#phone');
const PHONE_W = 390;
const PHONE_H = 844;

/* ---------- 디스플레이: 모바일은 꽉 차게, PC 는 축소해서 가운데 ---------- */
function fit() {
  const vv = window.visualViewport;
  // 모바일 키보드가 올라오면 보이는 영역(visualViewport)에 폰을 맞춰 입력창이 키보드 위에 붙게 한다
  phone.style.setProperty('--vvh', `${vv ? vv.height : innerHeight}px`);
  phone.style.setProperty('--vvt', `${vv ? vv.offsetTop : 0}px`);
  const desktop = innerWidth >= 600;
  const scale = desktop ? Math.min(1, (innerHeight - 40) / PHONE_H, (innerWidth - 40) / PHONE_W) : 1;
  phone.style.setProperty('--scale', scale);
  setScale(scale);
}
fit();
addEventListener('resize', fit);
window.visualViewport?.addEventListener('resize', fit);
window.visualViewport?.addEventListener('scroll', fit);

/* ---------- 시계 ---------- */
function renderClock() {
  const t = clockText();
  $$('[data-clock]').forEach((el) => { if (el.textContent !== t) el.textContent = t; });
}
renderClock();
setInterval(renderClock, 1000);
on('tick', renderClock);

/* ---------- 하단 홈 인디케이터: 위로 쓸어 올리면 홈 ---------- */
drag($('#gesture'), {
  end(dx, dy) {
    if (!$('#call').classList.contains('hidden')) return;
    const swipe = dy < -30;
    const tap = Math.abs(dx) < 8 && Math.abs(dy) < 8;
    if (!swipe && !tap) return;
    if (currentScreen() === 'app') closeApp();
    else if (currentScreen() === 'lock') show('passcode', 'up');
  },
});

/* ---------- 스토리 이벤트 액션 ---------- */
async function sendSeries(kind, id, p) {
  const meta = { name: p.name, number: p.number, color: p.color };
  for (const [i, m] of p.messages.entries()) {
    const msg = typeof m === 'string' ? { text: m } : m;
    if (i) await wait(msg.delay ?? 1600);
    deliver(kind, id, { from: msg.from ?? p.from ?? 'them', text: msg.text }, meta);
  }
  if (p.choices) setChoices(chatKey(kind, id), p.choices);
}

events.defineAction('call', (p) => incomingCall(p));
events.defineAction('message', (p) => sendSeries('messages', p.thread, p));
events.defineAction('kakao', (p) => sendSeries('kakao', p.chat, p));
events.defineAction('alarm', (p) => alarm(p));
events.defineAction('end', (p) => ending(p));

/* ---------- 시작 ---------- */
audio.init();
initLock();
initHome();
events.start();

// 핀치 줌·더블탭 확대 방지 (iOS 는 user-scalable=no 를 무시하기도 함)
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
