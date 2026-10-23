/* 효과음 — Web Audio API. 파일이 있으면 미리 decode, 없으면 오실레이터로 합성 */
import { AUDIO } from './story.js';

const AC = window.AudioContext || window.webkitAudioContext;
const NOOP = { stop() {} };
const buffers = {};
const loops = new Set();
let ctx = null;
let master = null;

export function init() {
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  for (const [name, url] of Object.entries(AUDIO)) {
    if (!url) continue;
    fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
      .then((buf) => { buffers[name] = buf; })
      .catch(() => console.info(`[audio] ${url} 을(를) 불러오지 못해 합성음을 사용합니다`));
  }

  // 모바일 자동재생 제한: 첫 터치 때 AudioContext 를 깨운다
  const resume = () => { if (ctx.state !== 'running') ctx.resume(); };
  addEventListener('pointerdown', resume, true);
  addEventListener('touchend', resume, true);
  addEventListener('keydown', resume, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoops(); });
}

/** 소리를 재생하고 { stop() } 을 돌려준다. loop 소리는 stopLoops() 로 한꺼번에 멈출 수 있다 */
export function play(name, { loop = false, volume = 1 } = {}) {
  if (!ctx) return NOOP;
  if (ctx.state !== 'running') ctx.resume();

  const out = ctx.createGain();
  out.gain.value = volume;
  out.connect(master);
  let stopSource = null;

  if (buffers[name]) {
    const src = ctx.createBufferSource();
    src.buffer = buffers[name];
    src.loop = loop;
    src.connect(out);
    src.start();
    stopSource = () => { try { src.stop(); } catch { /* 이미 멈춤 */ } };
  } else {
    const synth = SYNTH[name];
    if (!synth) return NOOP;
    let next = ctx.currentTime + 0.02;
    const period = synth(out, next);
    if (loop) {
      next += period;
      // 0.6초 앞까지 패턴을 계속 예약
      const id = setInterval(() => {
        while (next < ctx.currentTime + 0.6) {
          synth(out, next);
          next += period;
        }
      }, 120);
      stopSource = () => clearInterval(id);
    }
  }

  const handle = {
    stopped: false,
    stop() {
      if (handle.stopped) return;
      handle.stopped = true;
      loops.delete(handle);
      stopSource?.();
      const t = ctx.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + 0.06);
      setTimeout(() => out.disconnect(), 200);
    },
  };
  if (loop) loops.add(handle);
  return handle;
}

/** 반복 재생 중인 소리(벨소리, 알람)를 모두 멈춘다 */
export function stopLoops() {
  [...loops].forEach((h) => h.stop());
}

/* ---------- 합성음 ---------- */
function tone(out, t, freq, { type = 'sine', dur = 0.2, vol = 0.25, attack = 0.005, to } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** 각 함수는 시각 t 에 패턴을 예약하고, 반복 주기(초)를 돌려준다 */
const SYNTH = {
  key(out, t) {
    tone(out, t, 1500, { type: 'triangle', dur: 0.045, vol: 0.12, attack: 0.002 });
    return 0.06;
  },
  unlock(out, t) {
    tone(out, t, 760, { type: 'triangle', dur: 0.09, vol: 0.12 });
    tone(out, t + 0.07, 1520, { type: 'triangle', dur: 0.14, vol: 0.1 });
    return 0.25;
  },
  send(out, t) {
    tone(out, t, 520, { dur: 0.18, vol: 0.14, to: 1250 });
    return 0.2;
  },
  receive(out, t) {
    tone(out, t, 1320, { dur: 0.16, vol: 0.13 });
    tone(out, t + 0.1, 1760, { dur: 0.22, vol: 0.11 });
    return 0.35;
  },
  notify(out, t) {
    [1319, 1568, 2093].forEach((f, i) => tone(out, t + i * 0.13, f, { dur: 0.32, vol: 0.17 }));
    return 0.7;
  },
  ring(out, t) {
    // 마림바 느낌의 6음 프레이즈를 두 번
    const notes = [659, 831, 988, 1319, 988, 831];
    for (const offset of [0, 1.05]) {
      notes.forEach((f, i) => {
        const at = t + offset + i * 0.14;
        tone(out, at, f, { dur: 0.45, vol: 0.22 });
        tone(out, at, f * 4, { dur: 0.08, vol: 0.035 });
      });
    }
    return 2.9;
  },
  alarm(out, t) {
    for (let i = 0; i < 4; i++) {
      tone(out, t + i * 0.16, 1046, { type: 'square', dur: 0.1, vol: 0.05 });
      tone(out, t + i * 0.16, 2093, { dur: 0.1, vol: 0.06 });
    }
    return 1.15;
  },
};
