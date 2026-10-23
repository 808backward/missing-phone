/* 상단 알림 배너(#toast)와 메시지 도착 처리 */
import { state, addMessage, getChat, chatKey } from './state.js';
import { play } from './audio.js';
import { openApp } from './router.js';
import { APPS } from './registry.js';
import { icon } from './icons.js';
import { $, esc, drag, vibrate } from './util.js';

const el = $('#toast');
let hideTimer = null;
let onTap = null;

drag(el, {
  move(dx, dy) {
    if (dy < 0) el.style.transform = `translateY(${dy}px)`;
  },
  end(dx, dy) {
    el.style.transform = '';
    if (dy < -24) hide();
    else if (Math.abs(dy) < 8 && Math.abs(dx) < 8) {
      const tap = onTap;
      hide();
      tap?.();
    }
  },
});

export function toast({ app, title, body, tap }) {
  el.innerHTML = `
    <div class="toast__icon">${icon(app)}</div>
    <div class="toast__main">
      <div class="toast__top"><span>${esc(APPS[app]?.name ?? '')}</span><time>지금</time></div>
      <strong>${esc(title)}</strong>
      <p>${esc(body)}</p>
    </div>`;
  onTap = tap;
  el.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, 5000);
}

export function hide() {
  clearTimeout(hideTimer);
  onTap = null;
  el.classList.remove('show');
  hideTimer = setTimeout(() => el.classList.add('hidden'), 450);
}

/**
 * 대화방에 메시지를 넣는다.
 * 상대 메시지이고 그 방을 보고 있지 않으면 배너 + 알림음, 보고 있으면 수신음만.
 */
export function deliver(kind, id, msg, meta) {
  addMessage(kind, id, msg, meta);
  if (msg.from === 'me') return;
  if (state.viewing === chatKey(kind, id)) {
    play('receive');
    return;
  }
  play('notify');
  vibrate(150);
  const chat = getChat(kind, id);
  const sender = chat.members?.[msg.from]?.name;
  toast({
    app: kind,
    title: chat.name,
    body: sender ? `${sender}: ${msg.text}` : msg.text,
    tap: () => openApp(kind, { chat: id }),
  });
}
