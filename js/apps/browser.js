/* 브라우저 (Chrome풍): 검색창, 최근 검색어 → 검색 결과 */
import { BROWSER } from '../story.js';
import { GLYPH, icon } from '../icons.js';
import { esc } from '../util.js';

const results = (query) => ({
  title: query,
  className: 'br-results',
  render(el) {
    const list = BROWSER.results[query] ?? [];
    el.innerHTML = `
      <div class="br-bar">${GLYPH.search}<span>${esc(query)}</span></div>
      ${list.length ? list.map((r) => `
        <article class="br-result">
          <small>${esc(r.site)}</small>
          <h3>${esc(r.title)}</h3>
          <p>${esc(r.snippet)}</p>
        </article>`).join('') : '<p class="br-empty">검색 결과를 불러올 수 없습니다.<br>네트워크 연결을 확인하세요.</p>'}`;
  },
});

export default {
  theme: 'light',
  accent: '#1a73e8',
  open(nav) {
    nav.push({
      title: '새 탭',
      className: 'br-view',
      action: { html: '<span class="br-tabs">2</span>' },
      render(el) {
        el.innerHTML = `
          <div class="br-logo">${icon('browser')}</div>
          <div class="br-bar br-bar--big">${GLYPH.search}<span>검색어 또는 URL 입력</span>${GLYPH.mic}</div>
          <h3 class="br-section">최근 검색</h3>
          <ul class="br-recent">${BROWSER.recent.map((q) => `
            <li data-q="${esc(q)}">${GLYPH.clock}<span>${esc(q)}</span></li>`).join('')}</ul>`;
        el.addEventListener('click', (e) => {
          const item = e.target.closest('[data-q]');
          if (item) nav.push(results(item.dataset.q));
        });
      },
    });
  },
};
