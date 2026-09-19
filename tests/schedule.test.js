// schedule.test.js — node:test + node:assert, ES modules.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getNextWednesday,
  buildScheduleDates,
  formatISODate,
} from '../assets/js/schedule.js';

test('getNextWednesday returns a Wednesday (day index 3)', () => {
  // Try each day of a known week; result must always be a Wednesday.
  for (let offset = 0; offset < 7; offset += 1) {
    const d = new Date(2025, 0, 1 + offset); // Jan 1 2025 is a Wednesday
    const wed = getNextWednesday(d);
    assert.equal(wed.getDay(), 3, `next Wednesday for offset ${offset}`);
    assert.ok(wed.getTime() >= new Date(2025, 0, 1 + offset).getTime() - 1);
  }
});

test('getNextWednesday returns same date when input is a Wednesday', () => {
  const wed = new Date(2025, 0, 1); // Wednesday
  const result = getNextWednesday(wed);
  assert.equal(formatISODate(result), '2025-01-01');
});

test('buildScheduleDates yields 16 entries: correct 4-week main/shorts layout', () => {
  const start = new Date(2025, 0, 1); // Wed
  const schedule = buildScheduleDates(start);
  assert.equal(schedule.length, 16);

  assert.equal(schedule.filter((e) => e.type === 'main').length, 8);
  assert.equal(schedule.filter((e) => e.type === 'shorts').length, 8);

  // Per-week cadence and type mapping.
  for (let week = 1; week <= 4; week += 1) {
    const wk = schedule.filter((e) => e.week === week);
    assert.deepEqual(
      wk.map((e) => e.day),
      ['Wed', 'Thu', 'Fri', 'Sat'],
    );
    assert.deepEqual(
      wk.map((e) => e.type),
      ['main', 'shorts', 'main', 'shorts'],
    );
  }
});

test('buildScheduleDates dates are chronological and correctly spaced', () => {
  const start = new Date(2025, 0, 1);
  const schedule = buildScheduleDates(start);
  // Week 1: Wed Jan 1, Thu Jan 2, Fri Jan 3, Sat Jan 4.
  assert.equal(formatISODate(schedule[0].date), '2025-01-01');
  assert.equal(formatISODate(schedule[1].date), '2025-01-02');
  assert.equal(formatISODate(schedule[2].date), '2025-01-03');
  assert.equal(formatISODate(schedule[3].date), '2025-01-04');
  // Week 2 starts a week later.
  assert.equal(formatISODate(schedule[4].date), '2025-01-08');
  // Week 4 Saturday.
  assert.equal(formatISODate(schedule[15].date), '2025-01-25');

  for (let i = 1; i < schedule.length; i += 1) {
    assert.ok(schedule[i].date.getTime() >= schedule[i - 1].date.getTime());
  }
});

test('formatISODate pads month and day', () => {
  assert.equal(formatISODate(new Date(2025, 2, 5)), '2025-03-05');
  assert.equal(formatISODate(new Date(2025, 11, 31)), '2025-12-31');
});
