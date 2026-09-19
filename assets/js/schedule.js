// schedule.js
//
// Pure Date math for the SunoFlow 4-week release schedule. No DOM, no external
// date libraries — importable in node:test.
//
// Weekly cadence (per the plan):
//   Wed = main, Thu = shorts, Fri = main, Sat = shorts
// Over 4 weeks this yields 16 entries (8 main + 8 shorts).

/** Date.getDay() index for Wednesday (Sun=0 ... Sat=6). */
const WEDNESDAY = 3;

/** Ordered weekly cadence: day + track type + day offset from that week's Wed. */
const WEEK_CADENCE = [
  { day: 'Wed', type: 'main', offset: 0 },
  { day: 'Thu', type: 'shorts', offset: 1 },
  { day: 'Fri', type: 'main', offset: 2 },
  { day: 'Sat', type: 'shorts', offset: 3 },
];

/** Clone a Date and add whole days without mutating the input. */
function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Return the next Wednesday on or after `from` (normalized to local midnight).
 * If `from` is itself a Wednesday, that same calendar date is returned.
 * @param {Date} from
 * @returns {Date}
 */
export function getNextWednesday(from) {
  const source = from instanceof Date ? from : new Date(from);
  const base = new Date(source.getFullYear(), source.getMonth(), source.getDate());
  const diff = (WEDNESDAY - base.getDay() + 7) % 7;
  return addDays(base, diff);
}

/**
 * Build the full 4-week schedule starting from a Wednesday.
 * Returns exactly 16 entries in chronological order.
 * @param {Date} startWednesday
 * @returns {Array<{week:number, day:'Wed'|'Thu'|'Fri'|'Sat', type:'main'|'shorts', date:Date}>}
 */
export function buildScheduleDates(startWednesday) {
  const src = startWednesday instanceof Date ? startWednesday : new Date(startWednesday);
  const start = new Date(src.getFullYear(), src.getMonth(), src.getDate());

  const entries = [];
  for (let week = 1; week <= 4; week += 1) {
    const weekStart = addDays(start, (week - 1) * 7);
    for (const { day, type, offset } of WEEK_CADENCE) {
      entries.push({ week, day, type, date: addDays(weekStart, offset) });
    }
  }
  return entries;
}

/**
 * Format a Date as an ISO yyyy-mm-dd string using the local calendar date.
 * @param {Date} d
 * @returns {string}
 */
export function formatISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
