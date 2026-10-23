/* 톡 (카톡풍 메신저): 채팅 목록 → 채팅방 */
import { chatList, on } from '../state.js';
import { chatRoom } from './chat.js';
import { GLYPH } from '../icons.js';
import { esc, rich } from '../util.js';

const ROOM_BG = '#b2c7da';

const avatar = (name, color, text) =>
  `<div class="kk-ava" style="background:${color ?? '#c7d3e0'}">${esc(text ?? name?.[0] ?? '')}</div>`;

const sameGroup = (a, b) => a && b && !a.date && !b.date && a.from === b.from && a.time === b.time;

function renderMessage(m, i, all, chat) {
  if (m.date) return `<div class="kk-date"><span>${esc(m.date)}</span></div>`;
  const first = !sameGroup(all[i - 1], m);
  const last = !sameGroup(m, all[i + 1]);
  const meta = `<div class="kk-meta">${m.unreadCount ? `<em>${m.unreadCount}</em>` : ''}${last ? `<time>${esc(m.time)}</time>` : ''}</div>`;

  if (m.from === 'me') {
    return `<div class="kk-msg kk-msg--me${first ? ' is-first' : ''}">${meta}<div class="kk-bubble">${rich(m.text)}</div></div>`;
  }
  const who = chat.members?.[m.from] ?? { name: chat.name, color: chat.color };
  return `
    <div class="kk-msg kk-msg--them${first ? ' is-first' : ''}">
      ${first ? avatar(who.name, who.color, who.avatar) : '<div class="kk-ava kk-ava--space"></div>'}
      <div class="kk-col">
        ${first ? `<div class="kk-name">${esc(who.name)}</div>` : ''}
        <div class="kk-row"><div class="kk-bubble">${rich(m.text)}</div>${meta}</div>
      </div>
    </div>`;
}

const composer = () => `
  <button type="button" class="kk-plus" aria-label="더보기">${GLYPH.plus}</button>
  <input type="text" placeholder="메시지 입력" enterkeyhint="send">
  <button type="submit" class="kk-send" aria-label="보내기">${GLYPH.send}</button>`;

const room = (id) => chatRoom('kakao', id, {
  className: 'kk-room',
  theme: 'light',
  bg: ROOM_BG,
  accent: '#1c1c1e',
  renderMessage,
  composer,
  mine: { unreadCount: 1 },
});

function listView() {
  return {
    title: '채팅',
    className: 'kk-list',
    render(el, nav) {
      const draw = () => {
        el.innerHTML = `<ul>${chatList('kakao').map((c) => `
          <li class="kk-item" data-id="${c.id}">
            ${avatar(c.name, c.color, c.avatar)}
            <div class="kk-item__main">
              <div class="kk-item__name">${esc(c.name)}${c.members ? `<span>${Object.keys(c.members).length + 1}</span>` : ''}</div>
              <div class="kk-item__last">${esc(c.last?.text ?? '')}</div>
            </div>
            <div class="kk-item__side">
              <time>${esc(c.listTime)}</time>
              ${c.unread ? `<span class="kk-badge">${c.unread > 99 ? '99+' : c.unread}</span>` : ''}
            </div>
          </li>`).join('')}</ul>`;
      };
      draw();
      el.addEventListener('click', (e) => {
        const item = e.target.closest('[data-id]');
        if (item) nav.push(room(item.dataset.id));
      });
      return on('change', draw);
    },
  };
}

export default {
  theme: 'light',
  accent: '#1c1c1e',
  open(nav, params) {
    nav.push(listView());
    if (params.chat) nav.push(room(params.chat), { animate: false });
  },
};
