/* 잠금화면 + 암호 입력 */
import { PASSCODE, CLOCK, LOCK_NOTIFICATIONS } from './story.js';
import { state, changed } from './state.js';
import { show } from './router.js';
import { play } from './audio.js';
import { icon } from './icons.js';
import { $, $$, esc, drag, animate, vibrate } from './util.js';

const LETTERS = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };

export function initLock() {
  const lock = $('#lock');
  const content = $('.lock__content', lock);

  $('[data-date]', lock).textContent = CLOCK.date;
  $('.lock__notifs', lock).innerHTML = LOCK_NOTIFICATIONS.map((n) => `
    <li class="notif">
      <div class="notif__icon">${icon(n.app)}</div>
      <div class="notif__main">
        <div class="notif__top"><b>${esc(n.title)}</b><time>${esc(n.time)}</time></div>
        <p class="notif__body">${esc(n.body)}</p>
      </div>
    </li>`).join('');

  // 위로 쓸어 올리거나 탭하면 암호 화면
  drag(lock, {
    start() { content.classList.add('dragging'); },
    move(dx, dy) {
      if (dy < 0) content.style.transform = `translateY(${dy * 0.6}px)`;
    },
    end(dx, dy) {
      content.classList.remove('dragging');
      content.style.transform = '';
      const tap = Math.abs(dx) < 8 && Math.abs(dy) < 8;
      if (dy < -60 || tap) show('passcode', 'up');
    },
  });

  $('[data-lock="flash"]', lock).addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('on');
    vibrate(10);
  });
  $('[data-lock="camera"]', lock).addEventListener('click', (e) => animate(e.currentTarget, 'wiggle', 600));

  initPasscode();
}

function initPasscode() {
  const root = $('#passcode');
  const dots = $('.pass__dots', root);
  const pad = $('.pass__pad', root);
  const cancel = $('[data-pass="cancel"]', root);
  let code = '';
  let busy = false;

  pad.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => `
    <button class="key${n === 0 ? ' key--zero' : ''}" data-key="${n}">
      <b>${n}</b>${LETTERS[n] ? `<small>${LETTERS[n]}</small>` : ''}
    </button>`).join('');

  const render = () => {
    $$('i', dots).forEach((d, i) => d.classList.toggle('on', i < code.length));
    cancel.textContent = code ? '지우기' : '취소';
  };

  // 누르는 순간 반응하도록 pointerdown 에서 입력
  pad.addEventListener('pointerdown', (e) => {
    const key = e.target.closest('[data-key]');
    if (!key || busy || code.length >= 4) return;
    key.classList.add('pressed');
    play('key');
    code += key.dataset.key;
    render();
    if (code.length === 4) setTimeout(submit, 160);
  });
  const release = () => $$('.key.pressed', pad).forEach((k) => k.classList.remove('pressed'));
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => pad.addEventListener(t, release));

  function submit() {
    if (code === PASSCODE) {
      busy = true;
      play('unlock');
      state.unlocked = true;
      changed({ type: 'unlock' });
      show('home', 'unlock');
      setTimeout(() => { code = ''; busy = false; render(); }, 600);
      return;
    }
    busy = true;
    vibrate([60, 40, 60]);
    animate(dots, 'shake', 600).then(() => {
      code = '';
      busy = false;
      render();
    });
  }

  cancel.addEventListener('click', () => {
    if (code) {
      code = code.slice(0, -1);
      render();
    } else {
      show('lock', 'down');
    }
  });
  $('[data-pass="sos"]', root).addEventListener('click', (e) => animate(e.currentTarget, 'wiggle', 600));
}
