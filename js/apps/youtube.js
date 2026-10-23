/* 튜브 (YouTube풍): 검색어, 최근 검색, 영상 목록 → 재생 화면 */
import { YOUTUBE } from '../story.js';
import { GLYPH } from '../icons.js';
import { esc } from '../util.js';

const thumb = (v) => `
  <div class="yt-thumb" style="background:linear-gradient(135deg, ${v.colors[0]}, ${v.colors[1]})">
    <span class="yt-thumb__title">${esc(v.title.split('|')[0])}</span>
    <span class="yt-duration">${esc(v.duration)}</span>
  </div>`;

const player = (v) => ({
  title: '',
  className: 'yt-player',
  render(el) {
    el.innerHTML = `
      <div class="yt-screen" style="background:linear-gradient(135deg, ${v.colors[0]}, ${v.colors[1]})">
        <button class="yt-play" aria-label="재생">${GLYPH.play}</button>
        <div class="yt-progress"><i></i></div>
      </div>
      <div class="yt-info">
        <h2>${esc(v.title)}</h2>
        <p>${esc(v.meta)}</p>
        <div class="yt-channel"><span class="yt-ch-ava">${esc(v.channel[0])}</span><b>${esc(v.channel)}</b><button class="yt-sub">구독</button></div>
      </div>`;
    const btn = el.querySelector('.yt-play');
    btn.addEventListener('click', () => {
      const playing = el.classList.toggle('is-playing');
      btn.innerHTML = playing ? GLYPH.pause : GLYPH.play;
    });
  },
});

export default {
  theme: 'light',
  accent: '#0f0f0f',
  open(nav) {
    nav.push({
      title: '튜브',
      className: 'yt-view',
      render(el) {
        el.innerHTML = `
          <div class="yt-search">${GLYPH.search}<span>${esc(YOUTUBE.query)}</span></div>
          <div class="yt-chips">${YOUTUBE.recent.map((q) => `<span class="yt-chip">${GLYPH.clock}${esc(q)}</span>`).join('')}</div>
          <ul class="yt-list">${YOUTUBE.videos.map((v, i) => `
            <li class="yt-item" data-i="${i}">
              ${thumb(v)}
              <div class="yt-item__info">
                <span class="yt-ch-ava">${esc(v.channel[0])}</span>
                <div><b>${esc(v.title)}</b><small>${esc(v.channel)} · ${esc(v.meta)}</small></div>
              </div>
            </li>`).join('')}</ul>`;
        el.addEventListener('click', (e) => {
          const item = e.target.closest('[data-i]');
          if (item) nav.push(player(YOUTUBE.videos[+item.dataset.i]));
        });
      },
    });
  },
};
