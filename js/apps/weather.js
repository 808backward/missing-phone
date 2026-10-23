/* 날씨 */
import { WEATHER } from '../story.js';
import { weatherGlyph } from '../icons.js';
import { esc } from '../util.js';

export default {
  theme: 'dark',
  // 위쪽 12%를 단색으로 두어 상단바(#app 배경)와 화면 배경의 이음새가 보이지 않게
  bg: 'linear-gradient(180deg, #1b2a4e 0%, #1b2a4e 12%, #2f4374 55%, #4b5d8f 100%)',
  accent: '#fff',
  open(nav) {
    const w = WEATHER;
    const span = Math.max(...w.daily.map((d) => d.high)) - Math.min(...w.daily.map((d) => d.low));
    const min = Math.min(...w.daily.map((d) => d.low));
    nav.push({
      title: '',
      className: 'wx-view',
      barClass: 'app__bar--clear',
      render(el) {
        el.innerHTML = `
          <div class="wx-now">
            <small>나의 위치</small>
            <h2>${esc(w.city)}</h2>
            <div class="wx-temp">${w.temp}°</div>
            <p>${esc(w.condition)}</p>
            <p>최고:${w.high}° 최저:${w.low}°</p>
          </div>
          <section class="wx-card">
            <p class="wx-card__note">오늘 밤 대체로 맑겠습니다. 한강 주변은 바람이 다소 강합니다.</p>
            <div class="wx-hourly">${w.hourly.map((h) => `
              <div><small>${esc(h.time)}</small>${weatherGlyph(h.icon)}<b>${h.temp}°</b></div>`).join('')}</div>
          </section>
          <section class="wx-card">
            <h3>5일간의 일기예보</h3>
            ${w.daily.map((d) => `
              <div class="wx-day">
                <span>${esc(d.day)}</span>${weatherGlyph(d.icon)}
                <small>${d.low}°</small>
                <div class="wx-range"><i style="left:${((d.low - min) / span) * 100}%;right:${100 - ((d.high - min) / span) * 100}%"></i></div>
                <b>${d.high}°</b>
              </div>`).join('')}
          </section>`;
      },
    });
  },
};
