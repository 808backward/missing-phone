/* 채팅방 화면 — 톡/메시지 공용 (말풍선 모양은 각 앱이 style.renderMessage 로 정한다) */
import { OPTIONS } from '../story.js';
import { getChat, chatKey, openChat, closeChat, markRead, setChoices, addChosen, on } from '../state.js';
import { deliver } from '../notify.js';
import { play } from '../audio.js';
import { esc, wait } from '../util.js';

/**
 * @param {'kakao'|'messages'} kind
 * @param {string} id
 * @param {object} style
 *   className, theme, bg, accent
 *   renderMessage(m, i, list, chat) → html
 *   composer(chat) → 입력창 html (input 하나 포함)
 *   mine          → 내가 보낸 메시지에 덧붙일 필드 (예: { unreadCount: 1 })
 */
export function chatRoom(kind, id, style) {
  const key = chatKey(kind, id);
  const chat = getChat(kind, id);
  return {
    title: chat?.name ?? '',
    className: `room ${style.className ?? ''}`,
    theme: style.theme,
    bg: style.bg,
    accent: style.accent,
    render(el) {
      el.innerHTML = `
        <div class="room__scroll"><div class="room__list"></div></div>
        <div class="room__choices hidden"></div>
        <form class="composer" autocomplete="off">${style.composer(chat)}</form>`;
      const scroller = el.querySelector('.room__scroll');
      const list = el.querySelector('.room__list');
      const choicesEl = el.querySelector('.room__choices');
      const form = el.querySelector('form');
      const input = form.querySelector('input');

      openChat(key);

      const atBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 30;
      const toBottom = () => { scroller.scrollTop = scroller.scrollHeight; };

      const draw = () => {
        const c = getChat(kind, id);
        list.innerHTML = c.messages.map((m, i, all) => style.renderMessage(m, i, all, c)).join('');
        choicesEl.innerHTML = (c.choices ?? [])
          .map((o, i) => `<button type="button" data-choice="${i}">${esc(o.text)}</button>`)
          .join('');
        choicesEl.classList.toggle('hidden', !c.choices);
        toBottom();
      };
      draw();

      // '끝까지 읽음' = readDelay 이상 머물렀고, 맨 아래까지 보고 있을 때
      let dwelled = false;
      const tryRead = () => { if (dwelled && atBottom()) markRead(key); };
      const dwellTimer = setTimeout(() => { dwelled = true; tryRead(); }, OPTIONS.readDelay);
      scroller.addEventListener('scroll', tryRead, { passive: true });

      choicesEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-choice]');
        const option = btn && getChat(kind, id).choices?.[+btn.dataset.choice];
        if (option) choose(kind, id, option, style);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        send(kind, id, text, style);
      });

      // 키보드가 올라와 화면이 줄어들면 마지막 메시지가 보이게
      const onResize = () => toBottom();
      window.visualViewport?.addEventListener('resize', onResize);
      const off = on('change', (what) => {
        if (what.key === key && what.type !== 'read') draw();
      });

      return () => {
        off();
        clearTimeout(dwellTimer);
        window.visualViewport?.removeEventListener('resize', onResize);
        input.blur();
        closeChat(key);
      };
    },
  };
}

function send(kind, id, text, style) {
  deliver(kind, id, { from: 'me', text, ...style.mine });
  play('send');
}

/** 선택지 → 내 말풍선 → 상대 답장들(시간차) → 선택 기록(이벤트 트리거) */
async function choose(kind, id, option, style) {
  const key = chatKey(kind, id);
  setChoices(key, null);
  if (option.send !== false) send(kind, id, option.text, style);
  for (const r of option.replies ?? []) {
    const reply = typeof r === 'string' ? { text: r } : r;
    await wait(reply.delay ?? 1500);
    deliver(kind, id, { from: reply.from ?? 'them', text: reply.text });
  }
  addChosen(key, option.id);
}
