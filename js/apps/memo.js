/* 메모: 목록 → 본문 */
import { MEMOS } from '../story.js';
import { GLYPH } from '../icons.js';
import { esc, rich } from '../util.js';

const ACCENT = '#d9a400';

const detail = (m) => ({
  title: '',
  bg: '#fff',
  accent: ACCENT,
  className: 'memo-detail',
  render(el) {
    el.innerHTML = `
      <div class="memo-date">${esc(m.date)}</div>
      <h2>${esc(m.title)}</h2>
      <p>${rich(m.body)}</p>`;
  },
});

export default {
  theme: 'light',
  bg: '#f2f2f7',
  accent: ACCENT,
  open(nav) {
    nav.push({
      title: '메모',
      className: 'memo-list',
      render(el) {
        el.innerHTML = `
          <div class="search-field">${GLYPH.search}<span>검색</span></div>
          <h3 class="group-title">iCloud</h3>
          <ul class="group">${MEMOS.map((m, i) => `
            <li class="memo-item" data-i="${i}">
              <b>${esc(m.title)}</b>
              <p><time>${esc(m.date)}</time> ${esc(m.body.split('\n').find((l) => l.trim() && l.trim() !== m.title) ?? '')}</p>
            </li>`).join('')}</ul>
          <div class="memo-count">메모 ${MEMOS.length}개</div>`;
        el.addEventListener('click', (e) => {
          const item = e.target.closest('[data-i]');
          if (item) nav.push(detail(MEMOS[+item.dataset.i]));
        });
      },
    });
  },
};
