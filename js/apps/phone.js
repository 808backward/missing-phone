/* 전화: 최근 기록 / 연락처 / 키패드 */
import { PHONE_RECENTS, CONTACTS } from '../story.js';
import { state, changed, on } from '../state.js';
import { GLYPH } from '../icons.js';
import { esc, wiggle } from '../util.js';

const TABS = [
  { id: 'recents', label: '최근 기록', title: '최근 기록' },
  { id: 'contacts', label: '연락처', title: '연락처' },
  { id: 'keypad', label: '키패드', title: '' },
];
const TAB_ICONS = {
  recents: GLYPH.clock,
  contacts: '<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.6" fill="currentColor"/><path d="M3.5 17c.8-3.3 3.3-5 6.5-5s5.7 1.7 6.5 5z" fill="currentColor"/></svg>',
  keypad: `<svg viewBox="0 0 20 20">${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<circle cx="${4 + c * 6}" cy="${3.5 + r * 5.5}" r="1.9" fill="currentColor"/>`)).join('')}</svg>`,
};
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

function recents(filter) {
  const all = [...state.recents, ...PHONE_RECENTS].filter((r) => filter === 'all' || r.type === 'missed');
  return `
    <div class="segmented" data-nodrag>
      <button data-filter="all" class="${filter === 'all' ? 'on' : ''}">전체</button>
      <button data-filter="missed" class="${filter === 'missed' ? 'on' : ''}">부재중</button>
    </div>
    <ul class="ph-list">${all.map((r) => `
      <li class="ph-row${r.type === 'missed' ? ' is-missed' : ''}">
        <span class="ph-kind">${r.type === 'outgoing' ? GLYPH.outgoing : ''}</span>
        <div class="ph-main"><b>${esc(r.name)}${r.count > 1 ? ` (${r.count})` : ''}</b><small>${esc(r.label ?? '휴대전화')}</small></div>
        <time>${esc(r.time)}</time>
        <span class="ph-info">${GLYPH.info}</span>
      </li>`).join('')}</ul>`;
}

const contacts = () => `
  <div class="search-field">${GLYPH.search}<span>검색</span></div>
  <ul class="ph-contacts">${CONTACTS.map((c) => `
    <li><b>${esc(c.name)}</b><small>${esc(c.number)}</small></li>`).join('')}</ul>`;

const keypad = (number) => `
  <div class="ph-keypad">
    <div class="ph-number">${esc(number)}</div>
    <div class="ph-keys">${KEYS.map((k) => `<button class="ph-key" data-digit="${k}">${k}</button>`).join('')}</div>
    <button class="ph-call" data-call>${GLYPH.handset}</button>
  </div>`;

function phoneView() {
  let tab = 'recents';
  let filter = 'all';
  let number = '';
  return {
    title: '최근 기록',
    className: 'ph-view',
    render(el, nav) {
      const draw = () => {
        const content = tab === 'recents' ? recents(filter) : tab === 'contacts' ? contacts() : keypad(number);
        el.innerHTML = `
          <div class="ph-content">${content}</div>
          <nav class="tabbar">${TABS.map((t) => `
            <button data-tab="${t.id}" class="${t.id === tab ? 'on' : ''}">${TAB_ICONS[t.id]}<span>${t.label}</span></button>`).join('')}
          </nav>`;
      };
      draw();
      el.addEventListener('click', (e) => {
        const t = e.target.closest('[data-tab]');
        const f = e.target.closest('[data-filter]');
        const d = e.target.closest('[data-digit]');
        if (t) {
          tab = t.dataset.tab;
          nav.setTitle(TABS.find((x) => x.id === tab).title);
        } else if (f) {
          filter = f.dataset.filter;
        } else if (d) {
          number = (number + d.dataset.digit).slice(0, 13);
        } else if (e.target.closest('[data-call]')) {
          wiggle(e.target.closest('[data-call]'));
          return;
        } else return;
        draw();
      });
      return on('change', (w) => { if (w.type === 'recent') draw(); });
    },
  };
}

export default {
  theme: 'light',
  open(nav) {
    state.missedBadge = 0;
    changed({ type: 'badge' });
    nav.push(phoneView());
  },
};
