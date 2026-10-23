/* 시계: 알람 목록 + 토글 (알람이 울리는 연출은 call.js / story 이벤트) */
import { ALARMS } from '../story.js';
import { state, changed, alarmParts } from '../state.js';
import { GLYPH } from '../icons.js';
import { esc } from '../util.js';

const TABS = ['세계 시계', '알람', '스톱워치', '타이머'];

export default {
  theme: 'dark',
  accent: '#ff9f0a',
  open(nav) {
    nav.push({
      title: '알람',
      className: 'clock-view',
      action: { html: GLYPH.plus },
      render(el) {
        const draw = () => {
          el.innerHTML = `
            <div class="clock-content">
              <h3 class="clock-section">알람</h3>
              <ul>${ALARMS.map((a) => {
                const on = state.alarms[a.id];
                const { ampm, time } = alarmParts(a.time);
                return `
                  <li class="alarm-row${on ? '' : ' is-off'}">
                    <div>
                      <div class="alarm-row__time"><small>${ampm}</small>${time}</div>
                      <div class="alarm-row__label">${esc(a.label)}${a.repeat ? `, ${esc(a.repeat)}` : ''}</div>
                    </div>
                    <button class="switch${on ? ' on' : ''}" data-alarm="${a.id}" aria-label="알람 켜기/끄기"></button>
                  </li>`;
              }).join('')}</ul>
            </div>
            <nav class="tabbar tabbar--dark">${TABS.map((t) => `<button class="${t === '알람' ? 'on' : ''}">${GLYPH.clock}<span>${t}</span></button>`).join('')}</nav>`;
        };
        draw();
        el.addEventListener('click', (e) => {
          const sw = e.target.closest('[data-alarm]');
          if (!sw) return;
          state.alarms[sw.dataset.alarm] = !state.alarms[sw.dataset.alarm];
          changed({ type: 'alarm' });
          draw();
        });
      },
    });
  },
};
