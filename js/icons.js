/* 앱 아이콘 — 실제 브랜드 로고가 아닌 오리지널 SVG. 60×60 좌표계 */
import { CALENDAR } from './story.js';

let uid = 0;
const grad = (id, a, b, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const bg = (fill) => `<rect width="60" height="60" fill="${fill}"/>`;

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const PETALS = ['#f9b52b', '#f37b2b', '#ef3f5a', '#c43a8c', '#7a4bd0', '#3a8ae8', '#3ec2c4', '#7cc83f'];

const ICONS = {
  phone: (u) => `<defs>${grad(u, '#6df48a', '#1fbf45')}</defs>${bg(`url(#${u})`)}
    <path fill="#fff" d="M22.3 14.6c1.1-.6 2.4-.3 3.1.7l3.3 4.8c.7 1 .5 2.4-.4 3.2l-2.4 2c1.7 3.8 4.8 6.9 8.6 8.6l2-2.4c.8-.9 2.2-1.1 3.2-.4l4.8 3.3c1 .7 1.3 2 .7 3.1l-1.8 2.9c-1 1.6-2.9 2.3-4.7 1.9-10.5-2.5-18.1-10.1-20.6-20.6-.4-1.8.3-3.7 1.9-4.7z"/>`,
  messages: (u) => `<defs>${grad(u, '#6df48a', '#1fbf45')}</defs>${bg(`url(#${u})`)}
    <ellipse cx="30" cy="28.5" rx="19" ry="15.5" fill="#fff"/><path fill="#fff" d="M16.5 36.5c-.6 3.6-2.4 6.2-5 7.6 5.2.4 9.6-1.4 12.3-4.3z"/>`,
  kakao: () => `${bg('#fee500')}
    <ellipse cx="30" cy="28" rx="19.5" ry="15.5" fill="#3a1d1d"/><path fill="#3a1d1d" d="M19.5 37.5l-3.2 8.3 9.4-5.6z"/>
    <g fill="#fee500"><circle cx="22.5" cy="28" r="2.4"/><circle cx="30" cy="28" r="2.4"/><circle cx="37.5" cy="28" r="2.4"/></g>`,
  translate: (u) => `<defs>${grad(u, '#1a3e9c', '#0a1f5c')}</defs>${bg(`url(#${u})`)}
    <rect x="10" y="12" width="24" height="24" rx="6" fill="#fff"/>
    <text x="22" y="30.5" text-anchor="middle" font-size="16" font-weight="700" fill="#0a1f5c" font-family="Arial, sans-serif">A</text>
    <rect x="26" y="24" width="24" height="24" rx="6" fill="#3d7bff" stroke="#0a1f5c" stroke-width="2"/>
    <text x="38" y="41.5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">가</text>`,
  calendar: () => {
    const { year, month, today } = CALENDAR;
    const weekday = WEEKDAYS[new Date(year, month - 1, today).getDay()];
    return `${bg('#fff')}
      <text x="30" y="17" text-anchor="middle" font-size="9.5" font-weight="600" fill="#ff3b30">${weekday}</text>
      <text x="30" y="46" text-anchor="middle" font-size="31" font-weight="300" fill="#111" font-family="-apple-system, Helvetica, Arial, sans-serif">${today}</text>`;
  },
  photos: () => `${bg('#fff')}<g style="mix-blend-mode:multiply">${PETALS.map(
    (c, i) => `<ellipse cx="30" cy="19.5" rx="5.6" ry="10.2" fill="${c}" opacity=".88" transform="rotate(${i * 45} 30 30)"/>`,
  ).join('')}</g>`,
  camera: (u) => `<defs>${grad(u, '#e9e9eb', '#b4b4b9')}</defs>${bg(`url(#${u})`)}
    <rect x="9" y="19" width="42" height="27" rx="6" fill="#2c2c2e"/><rect x="23" y="15" width="14" height="6" rx="2" fill="#2c2c2e"/>
    <circle cx="30" cy="32.5" r="9" fill="#48484a" stroke="#8e8e93" stroke-width="1.5"/><circle cx="30" cy="32.5" r="4.5" fill="#111"/>
    <circle cx="44.5" cy="24.5" r="1.6" fill="#ffd60a"/>`,
  clock: () => `${bg('#111')}<circle cx="30" cy="30" r="24" fill="#fff"/>
    <g stroke="#111" stroke-width="1.6" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) =>
      `<line x1="30" y1="9.5" x2="30" y2="12" transform="rotate(${i * 30} 30 30)"/>`).join('')}</g>
    <line x1="30" y1="30" x2="30" y2="17" stroke="#111" stroke-width="2.6" stroke-linecap="round" transform="rotate(285 30 30)"/>
    <line x1="30" y1="30" x2="30" y2="13" stroke="#111" stroke-width="2" stroke-linecap="round" transform="rotate(144 30 30)"/>
    <line x1="30" y1="34" x2="30" y2="12" stroke="#ff9500" stroke-width="1.1" transform="rotate(40 30 30)"/>
    <circle cx="30" cy="30" r="1.8" fill="#ff9500"/>`,
  weather: (u) => `<defs>${grad(u, '#49a6ff', '#1564d6')}</defs>${bg(`url(#${u})`)}
    <circle cx="24" cy="24" r="9.5" fill="#ffd60a"/>
    <g fill="#fff"><circle cx="30" cy="37" r="7.5"/><circle cx="39" cy="33" r="9"/><circle cx="47" cy="38.5" r="6"/><rect x="24" y="37" width="28" height="8.5" rx="4.2"/></g>`,
  memo: (u) => `<defs>${grad(u, '#ffdf5d', '#f6be19')}</defs>${bg('#fff')}<rect width="60" height="16" fill="url(#${u})"/>
    <path d="M6 19.5h48" stroke="#d1d1d6" stroke-width="1" stroke-dasharray="1.5 2"/>
    <path d="M9 28h42M9 36h42M9 44h30" stroke="#c7c7cc" stroke-width="1.6" stroke-linecap="round"/>`,
  voice: () => `${bg('#111')}<g stroke-linecap="round" stroke-width="2.6">${
    [6, 12, 20, 9, 26, 15, 30, 12, 18, 8, 22, 10].map((h, i) =>
      `<line x1="${8.5 + i * 3.9}" y1="${30 - h / 2}" x2="${8.5 + i * 3.9}" y2="${30 + h / 2}" stroke="${i < 6 ? '#ff453a' : '#fff'}"/>`).join('')
  }</g>`,
  youtube: (u) => `<defs>${grad(u, '#ff5a4f', '#d4121f')}</defs>${bg(`url(#${u})`)}
    <circle cx="30" cy="30" r="15" fill="none" stroke="#fff" stroke-width="2.6" opacity=".9"/>
    <path fill="#fff" d="M26 22.5c0-1.2 1.3-1.9 2.3-1.3l10.8 7.5c.9.6.9 2 0 2.6l-10.8 7.5c-1 .7-2.3 0-2.3-1.3z"/>`,
  browser: () => `${bg('#fff')}
    <g fill="none" stroke-width="10" transform="rotate(-30 30 30)">
      <circle cx="30" cy="30" r="15" stroke="#ea4335" stroke-dasharray="31.4 94.2"/>
      <circle cx="30" cy="30" r="15" stroke="#fbbc05" stroke-dasharray="31.4 94.2" stroke-dashoffset="-31.4"/>
      <circle cx="30" cy="30" r="15" stroke="#34a853" stroke-dasharray="31.4 94.2" stroke-dashoffset="-62.8"/>
    </g>
    <circle cx="30" cy="30" r="9.5" fill="#fff"/><circle cx="30" cy="30" r="7" fill="#1a73e8"/>`,
  appstore: (u) => `<defs>${grad(u, '#2bc0ff', '#0a64f0')}</defs>${bg(`url(#${u})`)}
    <g stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M31.5 15.5 19 40M28.5 15.5 41 40M15 33h30"/></g>`,
  maps: () => `${bg('#e8f2dc')}
    <path d="M0 40 L60 22 V35 L0 53z" fill="#cfe5b5"/><path d="M38 0h22v20c-8 2-15-4-22-20z" fill="#9fd3f0"/>
    <path d="M-2 47 L62 27" stroke="#fff" stroke-width="7"/><path d="M-2 47 L62 27" stroke="#ffcf3f" stroke-width="2.5"/>
    <path d="M18 0 L28 60" stroke="#fff" stroke-width="5"/>
    <circle cx="36" cy="26" r="6.5" fill="#0a7cff" stroke="#fff" stroke-width="2.5"/>`,
  settings: (u) => `<defs>${grad(u, '#aeaeb3', '#77777c')}</defs>${bg(`url(#${u})`)}
    <circle cx="30" cy="30" r="17" fill="none" stroke="#3a3a3c" stroke-width="6" stroke-dasharray="4.2 2.92"/>
    <circle cx="30" cy="30" r="14" fill="#3a3a3c"/><circle cx="30" cy="30" r="9.5" fill="#8e8e93"/><circle cx="30" cy="30" r="4.5" fill="#3a3a3c"/>`,
  wallet: () => `${bg('#111')}
    <rect x="10" y="12" width="40" height="26" rx="4" fill="#ffb340"/><rect x="10" y="18" width="40" height="26" rx="4" fill="#30d158"/>
    <rect x="10" y="24" width="40" height="26" rx="4" fill="#0a84ff"/>
    <path d="M8 31h14c2 0 3 4 8 4s6-4 8-4h14v16a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5z" fill="#3a3a3c"/>`,
  health: () => `${bg('#fff')}
    <path fill="#ff2d55" d="M42 15.5c-4.3 0-7.3 2.6-8.6 5-1.3-2.4-4.3-5-8.6-5-5 0-9 4-9 9.4 0 9.2 13.4 16.8 17.6 19 4.2-2.2 17.6-9.8 17.6-19 0-5.4-4-9.4-9-9.4z" transform="translate(-3 2)"/>`,
};

/** 앱 아이콘 SVG 문자열 */
export function icon(id) {
  const draw = ICONS[id] ?? (() => bg('#8e8e93'));
  return `<svg viewBox="0 0 60 60" aria-hidden="true">${draw(`g${++uid}`)}</svg>`;
}

/* 상태바·버튼 등에 쓰는 작은 글리프 */
export const GLYPH = {
  chevron: '<svg viewBox="0 0 12 21" aria-hidden="true"><path d="M10.5 1.5 2 10.5l8.5 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  handset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 3.2c.6-.4 1.4-.2 1.8.4l2 2.9c.4.6.3 1.4-.2 1.9l-1.5 1.2c1 2.3 2.9 4.2 5.2 5.2l1.2-1.5c.5-.6 1.3-.7 1.9-.2l2.9 2c.6.4.8 1.2.4 1.8l-1.1 1.8c-.6 1-1.8 1.4-2.9 1.1C9.8 18.3 5.7 14.2 4.2 7.7c-.3-1.1.1-2.3 1.1-2.9z"/></svg>',
  search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.8" cy="6.8" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10.6 10.6 3.9 3.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M5 3.2c0-.9 1-1.4 1.7-.9l10 6.8c.7.4.7 1.4 0 1.8l-10 6.8c-.7.5-1.7 0-1.7-.9z"/></svg>',
  pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="3" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="11.8" y="3" width="4.2" height="14" rx="1.2" fill="currentColor"/></svg>',
  info: '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="6.8" r="1.2" fill="currentColor"/><path d="M11 9.6v6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  outgoing: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M5 3h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5 12 5.5l6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 5.5V10l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  mic: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="2" width="6" height="11" rx="3" fill="currentColor"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  swap: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7h13l-3.5-3.5M17 13H4l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/** 날씨 아이콘 (sun / moon / cloud / rain) */
export function weatherGlyph(kind) {
  const cloud = '<g fill="#fff"><circle cx="9" cy="14" r="4"/><circle cx="14" cy="11.5" r="5"/><circle cx="18.5" cy="14.5" r="3.5"/><rect x="5" y="14" width="17" height="4.5" rx="2.2"/></g>';
  const art = {
    sun: '<circle cx="12" cy="12" r="5" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g>',
    moon: '<path fill="#f2f2f7" d="M15.5 3.5a8.5 8.5 0 1 0 5 13.6A7 7 0 0 1 15.5 3.5z"/>',
    cloud,
    rain: `${cloud}<g stroke="#64d2ff" stroke-width="1.8" stroke-linecap="round"><path d="M9 21l-1 2M14 21l-1 2M19 21l-1 2"/></g>`,
  }[kind] ?? cloud;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${art}</svg>`;
}
