import { describe, it, expect } from 'vitest';
import { rainfallWindow } from './RainfallChart';

describe('rainfallWindow', () => {
  // 21-day dataset: indices 0–20, todayIdx = 14 (14 past days, 7 forecast)
  const totalDays = 21;
  const todayIdx = 14;

  it('centres on selected day: 5 before, selected, 2 after', () => {
    const scoreDateIdx = 14; // today is selected
    const { startIdx, endIdx } = rainfallWindow(totalDays, scoreDateIdx, todayIdx);
    expect(startIdx).toBe(9);  // 14 - 5
    expect(endIdx).toBe(17);   // 14 + 3
    expect(endIdx - startIdx).toBe(8); // 8 bars total
  });

  it('selects a future date 3 days from today', () => {
    const scoreDateIdx = 17; // todayIdx + 3
    const { startIdx, endIdx } = rainfallWindow(totalDays, scoreDateIdx, todayIdx);
    expect(startIdx).toBe(12); // 17 - 5
    expect(endIdx).toBe(20);   // 17 + 3
  });

  it('clamps startIdx to 0 when selected is near the beginning', () => {
    const scoreDateIdx = 3;
    const { startIdx, endIdx } = rainfallWindow(totalDays, scoreDateIdx, todayIdx);
    expect(startIdx).toBe(0);  // clamped from 3-5=-2
    expect(endIdx).toBe(6);    // 3 + 3
  });

  it('clamps endIdx to totalDays when selected is near the end', () => {
    const scoreDateIdx = 20; // last day
    const { startIdx, endIdx } = rainfallWindow(totalDays, scoreDateIdx, todayIdx);
    expect(startIdx).toBe(15); // 20 - 5
    expect(endIdx).toBe(21);   // clamped to totalDays
  });

  it('falls back to todayIdx when scoreDateIdx is -1', () => {
    const { startIdx, endIdx } = rainfallWindow(totalDays, -1, todayIdx);
    expect(startIdx).toBe(9);  // todayIdx - 5
    expect(endIdx).toBe(17);   // todayIdx + 3
  });

  it('falls back to 0 when both indices are -1', () => {
    const { startIdx, endIdx } = rainfallWindow(totalDays, -1, -1);
    expect(startIdx).toBe(0);
    expect(endIdx).toBe(3);
  });
});
