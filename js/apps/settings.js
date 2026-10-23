/* 설정 — 모양만 있는 간단한 화면 */
import { OWNER } from '../story.js';
import { GLYPH } from '../icons.js';
import { esc } from '../util.js';

const GROUPS = [
  [
    { label: '에어플레인 모드', color: '#ff9500', toggle: false },
    { label: 'Wi-Fi', color: '#007aff', value: 'home_5G' },
    { label: 'Bluetooth', color: '#007aff', value: '켬' },
    { label: '셀룰러', color: '#34c759' },
    { label: '개인용 핫스팟', color: '#34c759', value: '끔' },
  ],
  [
    { label: '알림', color: '#ff3b30' },
    { label: '사운드 및 햅틱', color: '#ff2d55' },
    { label: '집중 모드', color: '#5856d6', value: '무음' },
    { label: '스크린 타임', color: '#5856d6' },
  ],
  [
    { label: '일반', color: '#8e8e93', badge: 1 },
    { label: '제어 센터', color: '#8e8e93' },
    { label: '디스플레이 및 밝기', color: '#007aff' },
    { label: '배경화면', color: '#32ade6' },
    { label: 'Face ID 및 암호', color: '#34c759' },
    { label: '배터리', color: '#34c759' },
  ],
];

const row = (r) => `
  <li class="set-row">
    <span class="set-ico" style="background:${r.color}"></span>
    <span class="set-label">${esc(r.label)}</span>
    ${r.toggle !== undefined ? `<button class="switch${r.toggle ? ' on' : ''}" data-toggle></button>` : `
      ${r.badge ? `<span class="set-badge">${r.badge}</span>` : ''}
      <span class="set-value">${esc(r.value ?? '')}</span><i class="set-chev">${GLYPH.chevron}</i>`}
  </li>`;

export default {
  theme: 'light',
  bg: '#f2f2f7',
  open(nav) {
    nav.push({
      title: '설정',
      className: 'set-view',
      render(el) {
        el.innerHTML = `
          <div class="search-field">${GLYPH.search}<span>검색</span></div>
          <ul class="group">
            <li class="set-profile">
              <span class="set-avatar">${esc(OWNER.initials)}</span>
              <div><b>${esc(OWNER.name)}</b><small>계정, 클라우드, 미디어 및 구입 항목</small></div>
              <i class="set-chev">${GLYPH.chevron}</i>
            </li>
          </ul>
          ${GROUPS.map((g) => `<ul class="group">${g.map(row).join('')}</ul>`).join('')}`;
        el.addEventListener('click', (e) => {
          const sw = e.target.closest('[data-toggle]');
          if (sw) sw.classList.toggle('on');
        });
      },
    });
  },
};
