/* 메시지 (iMessage풍): 대화 목록 → 대화 */
import { chatList, on } from '../state.js';
import { chatRoom } from './chat.js';
import { GLYPH } from '../icons.js';
import { esc, rich } from '../util.js';

const initials = (name) => (/^[\d+\-\s]+$/.test(name) ? '' : name.slice(0, 2));
const avatar = (name) => `<div class="im-ava">${esc(initials(name)) || '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.2" fill="#fff"/><path d="M4.5 20.5c1.2-4 4-5.8 7.5-5.8s6.3 1.8 7.5 5.8" fill="#fff"/></svg>'}</div>`;

function renderMessage(m, i, all, chat) {
  if (m.date) return `<div class="im-date">${esc(m.date)}</div>`;
  const next = all[i + 1];
  const tail = !next || next.date || next.from !== m.from;
  const side = m.from === 'me' ? 'me' : 'them';
  // 읽음 표시: 대화의 마지막 말풍선이 내 것일 때만
  const isLast = !all.slice(i + 1).some((x) => x.from);
  const label = side === 'me' && isLast && chat.readLabel ? `<div class="im-receipt">${esc(chat.readLabel)}</div>` : '';
  return `<div class="im-msg im-msg--${side}${tail ? ' has-tail' : ''}"><div class="im-bubble">${rich(m.text)}</div></div>${label}`;
}

const composer = (chat) => `
  <button type="button" class="im-plus" aria-label="더보기">${GLYPH.plus}</button>
  <div class="im-field">
    <input type="text" placeholder="${chat?.number ? '문자 메시지' : 'iMessage'}" enterkeyhint="send">
    <button type="submit" class="im-send" aria-label="보내기">${GLYPH.send}</button>
  </div>`;

const room = (id) => chatRoom('messages', id, {
  className: 'im-room',
  theme: 'light',
  bg: '#fff',
  renderMessage,
  composer,
});

function listView() {
  return {
    title: '메시지',
    className: 'im-list',
    render(el, nav) {
      const draw = () => {
        el.innerHTML = `
          <div class="search-field">${GLYPH.search}<span>검색</span></div>
          <ul>${chatList('messages').map((c) => `
            <li class="im-item" data-id="${c.id}">
              <span class="im-dot${c.unread ? ' on' : ''}"></span>
              ${avatar(c.name)}
              <div class="im-item__main">
                <div class="im-item__top"><b>${esc(c.name)}</b><time>${esc(c.listTime)}</time><i>${GLYPH.chevron}</i></div>
                <p>${esc(c.last?.text ?? '')}</p>
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
  open(nav, params) {
    nav.push(listView());
    if (params.chat) nav.push(room(params.chat), { animate: false });
  },
};
