/* 스토리 이벤트 엔진 — story.js 의 EVENTS 를 상태 변화에 맞춰 실행한다 */
import { EVENTS } from './story.js';
import { state, on, changed } from './state.js';

const actions = {};
const scheduled = new Set();
let queue = Promise.resolve(); // 이벤트는 하나씩 차례로 (전화가 끝나야 다음 이벤트)

export const defineAction = (name, fn) => { actions[name] = fn; };

export function start() {
  on('change', check);
  check();
}

const keysFor = (obj, chat) => Object.keys(obj).filter((k) => k.split(':')[1] === chat && obj[k]);
const chosenIn = (chat) => keysFor(state.chosen, chat).flatMap((k) => state.chosen[k]);

/** 트리거가 충족됐으면 앞으로 기다릴 시간(ms), 아니면 null */
function waitFor(t) {
  switch (t.type) {
    case 'unlock': return state.unlocked ? 0 : null;
    case 'appsOpened': return state.opened.length >= (t.count ?? 3) ? 0 : null;
    case 'appOpened': return state.opened.includes(t.app) ? 0 : null;
    case 'chatRead': return keysFor(state.read, t.chat).length ? 0 : null;
    case 'choice': {
      const options = t.option ? [].concat(t.option) : null;
      return chosenIn(t.chat).some((id) => !options || options.includes(id)) ? 0 : null;
    }
    case 'after':
      return t.event in state.done ? Math.max(0, state.done[t.event] + (t.delay ?? 0) - Date.now()) : null;
    case 'any': {
      const waits = t.of.map(waitFor).filter((w) => w !== null);
      return waits.length ? Math.min(...waits) : null;
    }
    default:
      console.warn('[events] 알 수 없는 trigger', t);
      return null;
  }
}

function allowed(when) {
  if (!when) return true;
  if (when.done && ![].concat(when.done).every((id) => id in state.done)) return false;
  for (const c of [].concat(when.chosen ?? [])) {
    const [chat, option] = c.split(':');
    if (!chosenIn(chat).includes(option)) return false;
  }
  return true;
}

function check() {
  for (const ev of EVENTS) {
    if (scheduled.has(ev.id) || !allowed(ev.when)) continue;
    const w = waitFor(ev.trigger);
    if (w === null) continue;
    scheduled.add(ev.id);
    setTimeout(() => { queue = queue.then(() => run(ev)); }, w + (ev.delay ?? 0));
  }
}

async function run(ev) {
  try {
    await actions[ev.action]?.(ev.payload ?? {}, ev);
  } catch (err) {
    console.error(`[events] ${ev.id}`, err);
  }
  state.done[ev.id] = Date.now();
  changed({ type: 'event', id: ev.id });
}
