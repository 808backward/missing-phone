/* 공용 도우미 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);
/** 이스케이프 + 줄바꿈(\n) → <br> */
export const rich = (s = '') => esc(s).replace(/\n/g, '<br>');

/* PC에서 폰을 transform: scale 로 축소해 보여줄 때 드래그 거리를 보정하기 위한 값 */
let scale = 1;
export const getScale = () => scale;
export const setScale = (s) => { scale = s; };

/** 클래스를 붙여 CSS 애니메이션을 한 번 재생하고, 끝나면 클래스를 떼고 resolve */
export function animate(el, cls, fallback = 800) {
  return new Promise((resolve) => {
    let done = false;
    const onEnd = (e) => { if (e.target === el) finish(); };
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener('animationend', onEnd);
      el.classList.remove(cls);
      resolve();
    };
    el.classList.remove(cls);
    void el.offsetWidth; // 같은 애니메이션을 연속으로 재생할 수 있게 리플로우
    el.classList.add(cls);
    el.addEventListener('animationend', onEnd);
    setTimeout(finish, fallback);
  });
}

export const wiggle = (el) => el && animate(el, 'wiggle', 600);

/**
 * 드래그 제스처 (Pointer Events, 없으면 Touch Events)
 * 콜백 인자 (dx, dy, event) 는 화면 축소 비율을 보정한 폰 좌표 기준 이동량
 * 버튼/입력창 위에서 시작한 드래그는 무시합니다.
 */
export function drag(el, { start, move, end } = {}) {
  let sx = 0, sy = 0, active = false;
  const down = (x, y, e) => { active = true; sx = x; sy = y; start?.(e); };
  const over = (x, y, e) => { if (active) move?.((x - sx) / scale, (y - sy) / scale, e); };
  const up = (x, y, e) => {
    if (!active) return;
    active = false;
    end?.((x - sx) / scale, (y - sy) / scale, e);
  };
  const ignored = (e) => e.target.closest('button, input, textarea, a, [data-nodrag]');

  if (window.PointerEvent) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || ignored(e)) return;
      down(e.clientX, e.clientY, e);
      try { el.setPointerCapture(e.pointerId); } catch { /* 일부 브라우저 미지원 */ }
    });
    el.addEventListener('pointermove', (e) => over(e.clientX, e.clientY, e));
    el.addEventListener('pointerup', (e) => up(e.clientX, e.clientY, e));
    el.addEventListener('pointercancel', (e) => up(sx, sy, e));
  } else {
    el.addEventListener('touchstart', (e) => {
      if (ignored(e)) return;
      const t = e.touches[0];
      down(t.clientX, t.clientY, e);
    }, { passive: true });
    el.addEventListener('touchmove', (e) => { const t = e.touches[0]; over(t.clientX, t.clientY, e); }, { passive: true });
    el.addEventListener('touchend', (e) => { const t = e.changedTouches[0]; up(t.clientX, t.clientY, e); });
    el.addEventListener('touchcancel', (e) => up(sx, sy, e));
  }
}

/** 짧은 진동 (지원하는 기기에서만) */
export function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch { /* 사용자 제스처 전에는 막힐 수 있음 */ }
}
