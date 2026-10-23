/* 캘린더: 월간 달력 + 선택한 날의 일정 */
import { CALENDAR } from '../story.js';
import { esc } from '../util.js';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function monthGrid(selected) {
  const { year, month, today, events } = CALENDAR;
  const first = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: first }, () => '<span></span>');
  for (let d = 1; d <= days; d++) {
    const dow = (first + d - 1) % 7;
    const cls = ['cal-day', d === today && 'is-today', d === selected && 'is-selected', (dow === 0 || dow === 6) && 'is-weekend']
      .filter(Boolean).join(' ');
    const dots = (events[d] ?? []).slice(0, 3).map((e) => `<i style="background:${e.color}"></i>`).join('');
    cells.push(`<button class="${cls}" data-day="${d}"><b>${d}</b><span class="cal-dots">${dots}</span></button>`);
  }
  return cells.join('');
}

function agenda(day) {
  const { month, events } = CALENDAR;
  const list = events[day] ?? [];
  return `
    <h3 class="cal-agenda__title">${month}월 ${day}일</h3>
    ${list.length ? list.map((e) => `
      <div class="cal-event" style="--c:${e.color}">
        <div><b>${esc(e.title)}</b></div>
        <time>${esc(e.time)}</time>
      </div>`).join('') : '<p class="cal-empty">일정 없음</p>'}`;
}

export default {
  theme: 'light',
  accent: '#ff3b30',
  open(nav) {
    let selected = CALENDAR.today;
    nav.push({
      title: `${CALENDAR.year}년 ${CALENDAR.month}월`,
      className: 'cal-view',
      render(el) {
        const draw = () => {
          el.innerHTML = `
            <div class="cal-month">${CALENDAR.month}월</div>
            <div class="cal-week">${WEEK.map((w) => `<span>${w}</span>`).join('')}</div>
            <div class="cal-grid">${monthGrid(selected)}</div>
            <div class="cal-agenda">${agenda(selected)}</div>`;
        };
        draw();
        el.addEventListener('click', (e) => {
          const d = e.target.closest('[data-day]');
          if (!d) return;
          selected = +d.dataset.day;
          draw();
        });
      },
    });
  },
};
