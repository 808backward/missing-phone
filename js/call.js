/* 전화 수신 · 알람 · 엔딩 오버레이 (#call) */
import { play, stopLoops } from './audio.js';
import { addRecent, clockText, setClock, timeLabel } from './state.js';
import { applyTheme } from './router.js';
import { GLYPH } from './icons.js';
import { $, esc, rich, wait, vibrate } from './util.js';

const root = $('#call');

function open(mode, html) {
  root.className = `call call--${mode}`;
  root.innerHTML = `<div class="call__bg"></div>${html}`;
  applyTheme();
}
function close() {
  root.className = 'hidden';
  root.innerHTML = '';
  root.onclick = null;
  applyTheme();
}

/** 울리는 동안 반복 진동. 멈추는 함수를 돌려준다 */
function vibrateLoop(pattern) {
  if (!navigator.vibrate) return () => {};
  const total = pattern.reduce((a, b) => a + b, 0);
  vibrate(pattern);
  const id = setInterval(() => vibrate(pattern), total);
  return () => { clearInterval(id); vibrate(0); };
}

const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

/** 전화 수신. 끝나면 'missed' | 'answered' 로 resolve */
export function incomingCall(p) {
  return new Promise((resolve) => {
    open('ringing', `
      <div class="call__info">
        <div class="call__name">${esc(p.name ?? p.number)}</div>
        <div class="call__sub">${esc(p.label ?? '휴대전화 · 수신 전화')}</div>
      </div>
      <div class="call__captions"></div>
      <div class="call__actions">
        <div class="call__act call__act--decline"><button class="call__btn call__btn--decline" data-act="decline" aria-label="거절">${GLYPH.handset}</button><span>거절</span></div>
        <div class="call__act call__act--accept"><button class="call__btn call__btn--accept" data-act="accept" aria-label="응답">${GLYPH.handset}</button><span>응답</span></div>
      </div>`);

    const sub = $('.call__sub', root);
    const captions = $('.call__captions', root);
    const ring = play('ring', { loop: true });
    const stopVibe = vibrateLoop([500, 300, 500, 1200]);
    const ringTimer = setTimeout(() => end('missed'), p.ringMs ?? 4000);
    let finished = false;
    let tick = null;
    let seconds = 0;

    const stopRinging = () => {
      ring.stop();
      stopVibe();
      clearTimeout(ringTimer);
    };

    async function answer() {
      stopRinging();
      root.classList.replace('call--ringing', 'call--active');
      sub.textContent = '00:00';
      tick = setInterval(() => { sub.textContent = fmt(++seconds); }, 1000);
      for (const line of p.answer?.lines ?? [{ text: '…', delay: 1500 }]) {
        await wait(line.delay ?? 1600);
        if (finished) return;
        captions.insertAdjacentHTML('beforeend', `<p>${rich(line.text)}</p>`);
      }
      await wait(1200);
      end('answered');
    }

    function end(result) {
      if (finished) return;
      finished = true;
      stopRinging();
      clearInterval(tick);
      root.classList.add('call--ended');
      sub.textContent = result === 'missed' ? '부재중 전화' : '통화 종료';
      addRecent({
        name: p.name ?? p.number,
        type: result === 'missed' ? 'missed' : 'incoming',
        label: result === 'missed' ? '휴대전화' : `휴대전화 · ${fmt(seconds)}`,
        time: timeLabel(),
      });
      setTimeout(() => { close(); resolve(result); }, 1000);
    }

    root.onclick = (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'accept') answer();
      else if (act === 'decline' || act === 'hangup') end(seconds || root.classList.contains('call--active') ? 'answered' : 'missed');
    };
  });
}

/** 알람. 시계를 payload.time 으로 맞추고 울린다. 끄거나 ringMs 가 지나면 resolve */
export function alarm(p) {
  if (p.time) setClock(p.time);
  return new Promise((resolve) => {
    open('alarm', `
      <div class="alarm__head">
        <div class="alarm__time">${clockText()}</div>
        <div class="alarm__label">${esc(p.label ?? '알람')}</div>
      </div>
      <div class="alarm__actions">
        <button class="alarm__snooze" data-act="stop">다시 알림</button>
        <button class="alarm__stop" data-act="stop">중단</button>
      </div>`);
    const sound = play('alarm', { loop: true });
    const stopVibe = vibrateLoop([800, 600]);
    const timer = setTimeout(stop, p.ringMs ?? 9000);
    function stop() {
      clearTimeout(timer);
      sound.stop();
      stopVibe();
      close();
      resolve();
    }
    root.onclick = (e) => { if (e.target.closest('[data-act]')) stop(); };
  });
}

/** 엔딩 카드 */
export function ending(p) {
  stopLoops();
  open('end', `
    <div class="end__card">
      <small>ENDING</small>
      <h2>${esc(p.title ?? '')}</h2>
      <p>${rich(p.text ?? '')}</p>
      <div class="end__actions">
        <button class="end__restart" data-act="restart">처음부터 다시</button>
        <button class="end__stay" data-act="stay">계속 둘러보기</button>
      </div>
    </div>`);
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'restart') location.reload();
    if (act === 'stay') close();
  };
}
