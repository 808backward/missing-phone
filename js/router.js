/* 화면 전환 — lock / passcode / home / app (+ call 오버레이는 call.js) */
import { APPS } from './registry.js';
import { stopLoops } from './audio.js';
import { state, markAppOpened } from './state.js';
import { $, animate, getScale, wiggle } from './util.js';
import { GLYPH } from './icons.js';

const phone = $('#phone');
const screens = { lock: $('#lock'), passcode: $('#passcode'), home: $('#home'), app: $('#app') };
const appEl = screens.app;
const bar = $('.app__bar', appEl);
const backBtn = $('.app__back', appEl);
const titleEl = $('.app__title', appEl);
const actionEl = $('.app__action', appEl);
const body = $('.app__body', appEl);

backBtn.insertAdjacentHTML('afterbegin', GLYPH.chevron);
backBtn.addEventListener('click', () => nav?.pop());

let current = 'lock';
let nav = null;
let appId = null;
let generation = 0; // 닫힘 애니메이션이 새로 연 앱을 지우지 않도록

export const currentScreen = () => current;
export const currentApp = () => appId;

/** 상태바/홈 인디케이터 색 (밝은 앱이면 검정) */
export function applyTheme() {
  let theme = 'dark';
  if (current === 'app' && nav) theme = nav.theme();
  if (!$('#call').classList.contains('hidden')) theme = 'dark';
  phone.dataset.theme = theme;
}

/** 전체 화면 전환. anim: 'up' | 'down' | 'unlock' */
export function show(name, anim) {
  if (name === current) return;
  const from = screens[current];
  const to = screens[name];
  stopLoops();
  current = name;
  to.classList.remove('hidden');
  if (anim) {
    animate(to, `in-${anim}`);
    animate(from, `out-${anim}`).then(() => { if (current !== from.id) from.classList.add('hidden'); });
  } else {
    from.classList.add('hidden');
  }
  applyTheme();
}

/* ---------- 앱 열기 / 닫기 ---------- */
function setOrigin(el) {
  if (!el) {
    appEl.style.transformOrigin = '50% 50%';
    return;
  }
  const p = phone.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const s = getScale();
  const x = (r.left + r.width / 2 - p.left) / s;
  const y = (r.top + r.height / 2 - p.top) / s;
  appEl.style.transformOrigin = `${x}px ${y}px`;
}
const homeIcon = (id) => $(`#home [data-app="${id}"] .icon__img`);

export function openApp(id, params = {}, fromEl = null) {
  const app = APPS[id];
  if (!app) return;
  if (!app.module) {
    wiggle(fromEl ?? homeIcon(id));
    return;
  }
  const switching = current === 'app';
  stopLoops();
  teardown();
  generation++;

  appId = id;
  appEl.dataset.app = id;
  nav = new Nav(app);
  app.module.open(nav, params);
  markAppOpened(id);

  appEl.classList.remove('hidden');
  current = 'app';
  applyTheme();
  if (switching) {
    animate(appEl, 'app-switch', 500);
  } else {
    setOrigin(fromEl ?? homeIcon(id));
    screens.home.classList.add('home--behind');
    animate(appEl, 'app-open', 700);
  }
}

export function closeApp() {
  if (!nav || current !== 'app') return;
  const gen = generation;
  setOrigin(homeIcon(appId));
  stopLoops();
  nav.destroy();
  current = 'home';
  screens.home.classList.remove('hidden', 'home--behind');
  applyTheme();
  animate(appEl, 'app-close', 600).then(() => {
    if (gen !== generation) return;
    appEl.classList.add('hidden');
    teardown();
  });
}

function teardown() {
  nav?.destroy();
  nav = null;
  appId = null;
  body.innerHTML = '';
  state.viewing = null;
}

/* ---------- 앱 안의 화면 스택 ----------
 * view = {
 *   title, theme?: 'light'|'dark', bg?: 색, className?, action?: { html, onClick },
 *   render(el, nav) → 정리 함수(선택)
 * }
 */
class Nav {
  constructor(app) {
    this.app = app;
    this.stack = [];
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }

  theme() {
    return this.top?.view.theme ?? this.app.module.theme ?? 'light';
  }

  bg(view) {
    const theme = view.theme ?? this.app.module.theme;
    return view.bg ?? this.app.module.bg ?? (theme === 'dark' ? '#000' : '#fff');
  }

  push(view, { animate: anim = true } = {}) {
    const prev = this.top;
    const el = document.createElement('div');
    el.className = `view ${view.className ?? ''}`;
    el.style.background = this.bg(view);
    const entry = { view, el, cleanup: null };
    this.stack.push(entry);
    body.append(el);
    entry.cleanup = view.render(el, this) ?? null;
    if (prev) {
      prev.el.classList.add('view--under');
      if (anim) animate(el, 'view-in', 600);
    }
    this.sync();
  }

  pop() {
    if (this.stack.length < 2) {
      closeApp();
      return;
    }
    const leaving = this.stack.pop();
    leaving.cleanup?.();
    leaving.el.classList.add('view--leaving');
    animate(leaving.el, 'view-out', 500).then(() => leaving.el.remove());
    this.top.el.classList.remove('view--under');
    this.sync();
  }

  setTitle(title) {
    this.top.view.title = title;
    titleEl.textContent = title;
  }

  sync() {
    const { view } = this.top;
    const prev = this.stack[this.stack.length - 2];
    titleEl.textContent = view.title ?? '';
    backBtn.querySelector('span').textContent = prev?.view.title || '뒤로';
    bar.className = `app__bar ${view.barClass ?? ''}`;
    appEl.style.setProperty('--app-bg', this.top.el.style.background);
    appEl.style.setProperty('--accent', view.accent ?? this.app.module.accent ?? '');
    actionEl.innerHTML = view.action?.html ?? '';
    actionEl.onclick = view.action?.onClick ?? null;
    applyTheme();
  }

  destroy() {
    this.stack.forEach((e) => e.cleanup?.());
    this.stack = [];
  }
}
