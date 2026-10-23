/* 앱 목록 — 모듈이 없는 앱은 열리지 않고 아이콘만 흔들린다 */
import { HOME } from './story.js';
import kakao from './apps/kakao.js';
import messages from './apps/messages.js';
import phone from './apps/phone.js';
import memo from './apps/memo.js';
import calendar from './apps/calendar.js';
import clock from './apps/clock.js';
import photos from './apps/photos.js';
import youtube from './apps/youtube.js';
import browser from './apps/browser.js';
import voice from './apps/voice.js';
import weather from './apps/weather.js';
import settings from './apps/settings.js';
import translate from './apps/translate.js';

const MODULES = { kakao, messages, phone, memo, calendar, clock, photos, youtube, browser, voice, weather, settings, translate };
const IDS = [...HOME.grid, ...HOME.dock];

export const APPS = Object.fromEntries(
  IDS.map((id) => [id, { id, name: HOME.names[id] ?? id, module: MODULES[id] ?? null }]),
);
