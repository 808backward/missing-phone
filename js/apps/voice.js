/* 음성 메모: 녹음 목록, 재생 버튼 + 진행 바 + 받아쓰기
 * story 의 VOICE 항목에 src 가 있으면 실제 오디오를 재생하고, 없으면 진행 바만 움직인다 */
import { VOICE } from '../story.js';
import { GLYPH } from '../icons.js';
import { $, esc, rich } from '../util.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default {
  theme: 'dark',
  open(nav) {
    nav.push({
      title: '모든 녹음',
      className: 'vm-view',
      render(el) {
        let openIndex = null;
        let playing = null; // { index, start, offset, raf, audio }

        el.innerHTML = `<ul class="vm-list">${VOICE.map((v, i) => `
          <li class="vm-item" data-i="${i}">
            <div class="vm-head"><b>${esc(v.title)}</b><div><time>${esc(v.date)}</time><span>${fmt(v.duration)}</span></div></div>
            <div class="vm-player">
              <div class="vm-bar"><i></i></div>
              <div class="vm-times"><span class="vm-pos">0:00</span><span>-${fmt(v.duration)}</span></div>
              <button class="vm-play" data-play="${i}" aria-label="재생">${GLYPH.play}</button>
              <p class="vm-transcript">${rich(v.transcript ?? '')}</p>
            </div>
          </li>`).join('')}</ul>`;

        const item = (i) => $(`[data-i="${i}"]`, el);

        function stop() {
          if (!playing) return;
          cancelAnimationFrame(playing.raf);
          playing.audio?.pause();
          $('.vm-play', item(playing.index)).innerHTML = GLYPH.play;
          playing = null;
        }

        function play(i) {
          const v = VOICE[i];
          const li = item(i);
          const bar = $('.vm-bar i', li);
          const pos = $('.vm-pos', li);
          let audio = null;
          if (v.src) {
            audio = new Audio(v.src);
            audio.play().catch(() => {});
          }
          playing = { index: i, start: performance.now(), audio, raf: 0 };
          $('.vm-play', li).innerHTML = GLYPH.pause;
          const step = () => {
            const t = audio ? audio.currentTime : (performance.now() - playing.start) / 1000;
            const ratio = Math.min(1, t / v.duration);
            bar.style.width = `${ratio * 100}%`;
            pos.textContent = fmt(t);
            if (ratio >= 1) { stop(); return; }
            playing.raf = requestAnimationFrame(step);
          };
          step();
        }

        el.addEventListener('click', (e) => {
          const playBtn = e.target.closest('[data-play]');
          if (playBtn) {
            const i = +playBtn.dataset.play;
            const was = playing?.index;
            stop();
            if (was !== i) play(i);
            return;
          }
          const li = e.target.closest('.vm-head')?.parentElement;
          if (!li) return;
          const i = +li.dataset.i;
          if (openIndex !== null) item(openIndex).classList.remove('is-open');
          if (openIndex === i) { openIndex = null; return; }
          openIndex = i;
          li.classList.add('is-open');
        });

        return stop;
      },
    });
  },
};
