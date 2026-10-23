/* 사진: 썸네일 그리드 → 전체화면 (아래로 쓸어내리면 닫힘)
 * 실제 이미지가 없을 때는 story 의 art 키로 간단한 일러스트를 그린다 */
import { PHOTOS } from '../story.js';
import { applyTheme } from '../router.js';
import { $, esc, drag, animate } from '../util.js';

/* 일러스트 (viewBox 0 0 100 100) */
const ART = {
  bench: `<circle cx="78" cy="22" r="7" fill="#f5f0d8" opacity=".9"/>
    <rect x="0" y="72" width="100" height="28" fill="#141a33"/>
    <g fill="#0b0f1f"><rect x="20" y="52" width="60" height="5" rx="1.5"/><rect x="20" y="60" width="60" height="5" rx="1.5"/><rect x="18" y="66" width="64" height="4" rx="1"/>
    <rect x="24" y="70" width="4" height="12"/><rect x="72" y="70" width="4" height="12"/></g>
    <g fill="#f2b8c6"><circle cx="64" cy="62" r="3"/><circle cx="68" cy="61" r="3.3"/><circle cx="66" cy="58" r="3"/></g>
    <path d="M62 66l4-6 4 6z" fill="#7aa36b"/>`,
  bouquet: `<g transform="translate(50 46)">${[[-12, -6], [0, -12], [12, -6], [-6, 4], [7, 4], [0, -2]].map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${9 - (i % 2)}" fill="${i % 2 ? '#f48fb1' : '#f8bbd0'}"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ec6f9a"/>`).join('')}</g>
    <path d="M40 56 50 88 60 56z" fill="#efe6d8"/><path d="M44 66h12" stroke="#e8c27b" stroke-width="3"/>`,
  river: `<circle cx="50" cy="58" r="14" fill="#ffd27a"/><rect x="0" y="60" width="100" height="40" fill="#3e2f6b"/>
    <g stroke="#ffd27a" stroke-width="1.5" stroke-linecap="round" opacity=".7"><path d="M38 66h24M42 72h16M46 78h8"/></g>
    <path d="M0 58h18l2-6 4 6h20l3-10 3 10h50v4H0z" fill="#2a2048"/>`,
  ticket: `<rect x="12" y="30" width="76" height="40" rx="5" fill="#fff"/><path d="M66 30v40" stroke="#c9d6e8" stroke-dasharray="3 3"/>
    <text x="38" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#1d3a6b" font-family="Arial">ICN → LIS</text>
    <text x="38" y="61" text-anchor="middle" font-size="5.5" fill="#6b7a90" font-family="Arial">HA703 · 23 OCT · 10:40</text>
    <g fill="#1d3a6b">${Array.from({ length: 9 }, (_, i) => `<rect x="${70 + i * 1.8}" y="40" width="${i % 3 ? 0.8 : 1.3}" height="20"/>`).join('')}</g>`,
  city: `<g>${[[8, 40, 16], [26, 30, 14], [42, 45, 18], [62, 34, 14], [78, 42, 16]].map(([x, h, w]) =>
    `<rect x="${x}" y="${100 - h - 20}" width="${w}" height="${h}" fill="#fff5e6"/><path d="M${x - 1} ${100 - h - 20}h${w + 2}l-${w / 2 + 1} -7z" fill="#d9634a"/>`).join('')}</g>
    <rect x="0" y="80" width="100" height="20" fill="#c9773f"/><rect x="34" y="72" width="22" height="9" rx="2" fill="#f6c453"/>`,
  cat: `<ellipse cx="50" cy="66" rx="22" ry="16" fill="#fff"/><circle cx="50" cy="44" r="14" fill="#fff"/>
    <path d="M38 36l2-12 8 8zM62 36l-2-12-8 8z" fill="#fff"/>
    <g fill="#333"><circle cx="45" cy="44" r="1.8"/><circle cx="55" cy="44" r="1.8"/></g><path d="M48 49l2 1.5 2-1.5" stroke="#e48a9a" stroke-width="1.4" fill="none"/>`,
  letter: `<rect x="22" y="18" width="56" height="66" rx="2" fill="#fffdf6" transform="rotate(-4 50 50)"/>
    <g stroke="#9c8e70" stroke-width="1.2" stroke-linecap="round" transform="rotate(-4 50 50)"><path d="M30 30h26M30 38h40M30 45h36M30 52h40M30 59h22"/><path d="M30 66h30" stroke-dasharray="2 3"/></g>`,
  street: `<g fill="#ffd27a" opacity=".85"><circle cx="20" cy="30" r="2"/><circle cx="50" cy="26" r="2"/><circle cx="80" cy="30" r="2"/></g>
    <g stroke="#3b4a60" stroke-width="1.5"><path d="M20 32v60M50 28v64M80 32v60"/></g>
    <path d="M30 100 46 60h8l16 40z" fill="#1b2433"/><circle cx="50" cy="72" r="2.5" fill="#0b0f16"/><rect x="48.4" y="74" width="3.2" height="9" rx="1.5" fill="#0b0f16"/>`,
  moon: `<path d="M60 22a24 24 0 1 0 14 40 20 20 0 0 1-14-40z" fill="#f4efd8"/>
    <g fill="#fff">${[[14, 18], [28, 74], [82, 16], [88, 70], [20, 50], [70, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>`,
  cake: `<rect x="26" y="52" width="48" height="26" rx="4" fill="#fff"/><path d="M26 58c6 4 10-2 16 0s10 4 16 0 10-2 16 0" stroke="#f48fb1" stroke-width="3" fill="none"/>
    <rect x="20" y="78" width="60" height="4" rx="2" fill="#e9c7a0"/>
    ${[36, 44, 52, 60].map((x) => `<rect x="${x}" y="40" width="2.4" height="12" fill="#8ec5ff"/><ellipse cx="${x + 1.2}" cy="37" rx="1.8" ry="3" fill="#ffb340"/>`).join('')}`,
  sea: `<rect x="0" y="54" width="100" height="46" fill="#2e6fc4"/><path d="M0 60c10-4 20 4 30 0s20-4 30 0 20 4 40 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>
    <rect x="0" y="82" width="100" height="18" fill="#f1dcae"/><circle cx="76" cy="26" r="8" fill="#fff6c9"/>`,
  coffee: `<g fill="#fff"><path d="M24 44h22l-3 26H27z"/><path d="M54 44h22l-3 26H57z"/></g>
    <g fill="#7a4b2a"><ellipse cx="35" cy="45" rx="10" ry="2.5"/><ellipse cx="65" cy="45" rx="10" ry="2.5"/></g>
    <path d="M33 38c-2-4 2-6 0-10M63 38c-2-4 2-6 0-10" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>
    <rect x="10" y="70" width="80" height="4" rx="2" fill="#8a5d3b"/>`,
};

export function photoArt(p) {
  if (p.src) return `<img src="${esc(p.src)}" alt="${esc(p.caption)}">`;
  return `<div class="ph-art" style="background:linear-gradient(160deg, ${p.colors[0]}, ${p.colors[1]})">
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${ART[p.art] ?? ''}</svg></div>`;
}

function openViewer(appEl, index) {
  const p = PHOTOS[index];
  const viewer = document.createElement('div');
  viewer.className = 'photo-viewer';
  viewer.innerHTML = `
    <div class="photo-viewer__top"><button data-close>닫기</button><span>${esc(p.date)}</span><span></span></div>
    <div class="photo-viewer__img">${photoArt(p)}</div>
    ${p.caption ? `<div class="photo-viewer__caption">${esc(p.caption)}</div>` : ''}
    <div class="photo-viewer__hint">아래로 쓸어내려 닫기</div>`;
  appEl.append(viewer);
  animate(viewer, 'photo-in', 500);
  const phone = document.getElementById('phone');
  phone.dataset.theme = 'dark'; // 검은 배경 위 상태바는 흰색
  const img = $('.photo-viewer__img', viewer);

  const close = () => {
    viewer.classList.add('is-closing');
    applyTheme();
    setTimeout(() => viewer.remove(), 280);
  };
  $('[data-close]', viewer).addEventListener('click', close);
  drag(viewer, {
    move(dx, dy) {
      if (dy <= 0) return;
      img.style.transform = `translate(${dx * 0.4}px, ${dy}px) scale(${Math.max(0.7, 1 - dy / 900)})`;
      viewer.style.setProperty('--fade', Math.max(0, 1 - dy / 400));
    },
    end(dx, dy) {
      if (dy > 110) {
        close();
        return;
      }
      img.style.transform = '';
      viewer.style.setProperty('--fade', 1);
    },
  });
  return close;
}

export default {
  theme: 'light',
  open(nav) {
    nav.push({
      title: '최근 항목',
      className: 'photos-view',
      render(el) {
        el.innerHTML = `
          <div class="photos-grid">${PHOTOS.map((p, i) => `<button class="photo-thumb" data-i="${i}">${photoArt(p)}</button>`).join('')}</div>
          <p class="photos-count">사진 ${PHOTOS.length}장</p>`;
        let closeViewer = null;
        el.addEventListener('click', (e) => {
          const t = e.target.closest('[data-i]');
          if (t) closeViewer = openViewer(document.getElementById('app'), +t.dataset.i);
        });
        return () => closeViewer?.();
      },
    });
  },
};
