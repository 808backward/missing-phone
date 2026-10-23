/* 번역 — 최근 번역 기록을 보여주는 화면 */
import { TRANSLATE } from '../story.js';
import { GLYPH } from '../icons.js';
import { esc } from '../util.js';

export default {
  theme: 'light',
  bg: '#f2f2f7',
  open(nav) {
    nav.push({
      title: '번역',
      className: 'tr-view',
      render(el) {
        const [latest, ...rest] = TRANSLATE.history;
        el.innerHTML = `
          <div class="tr-langs"><span>${esc(TRANSLATE.from)}</span><i>${GLYPH.swap}</i><span>${esc(TRANSLATE.to)}</span></div>
          <section class="tr-card">
            <small>${esc(TRANSLATE.from)}</small>
            <p class="tr-src">${esc(latest.src)}</p>
            <hr>
            <small class="tr-to">${esc(TRANSLATE.to)}</small>
            <p class="tr-dst">${esc(latest.dst)}</p>
          </section>
          <h3 class="group-title">최근</h3>
          <ul class="group">${rest.map((h) => `
            <li class="tr-row"><b>${esc(h.src)}</b><small>${esc(h.dst)}</small></li>`).join('')}</ul>`;
      },
    });
  },
};
