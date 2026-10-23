/* 홈 화면: 아이콘 그리드, 검색 pill, Dock, 배지 */
import { HOME } from './story.js';
import { APPS } from './registry.js';
import { state, on, unreadTotal } from './state.js';
import { openApp } from './router.js';
import { icon } from './icons.js';
import { $, $$, esc, wiggle } from './util.js';

const iconHtml = (id, label = true) => `
  <button class="icon" data-app="${id}" aria-label="${esc(APPS[id].name)}">
    <span class="icon__img"><span class="icon__art">${icon(id)}</span><i class="badge"></i></span>
    ${label ? `<span class="icon__label">${esc(APPS[id].name)}</span>` : ''}
  </button>`;

export function initHome() {
  const home = $('#home');
  $('.home__grid', home).innerHTML = HOME.grid.map((id) => iconHtml(id)).join('');
  $('.dock', home).innerHTML = HOME.dock.map((id) => iconHtml(id, false)).join('');

  home.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-app]');
    if (btn) openApp(btn.dataset.app, {}, $('.icon__img', btn));
  });
  $('.home__search', home).addEventListener('click', (e) => wiggle(e.currentTarget));

  updateBadges();
  on('change', updateBadges);
}

function updateBadges() {
  const counts = {
    ...HOME.badges,
    kakao: unreadTotal('kakao'),
    messages: unreadTotal('messages'),
    phone: state.missedBadge,
  };
  $$('#home [data-app]').forEach((btn) => {
    const n = counts[btn.dataset.app] || 0;
    $('.badge', btn).textContent = n ? (n > 99 ? '99+' : n) : '';
  });
}
