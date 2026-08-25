import { describe, it, expect } from 'vitest';
import { TRAIL_CENTRES } from '@shared/centres';

describe('TRAIL_CENTRES — data integrity', () => {
  it('has unique ids', () => {
    const ids = TRAIL_CENTRES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every centre has valid UK-ish coordinates and required fields', () => {
    for (const centre of TRAIL_CENTRES) {
      expect(centre.lat).toBeGreaterThan(49);
      expect(centre.lat).toBeLessThan(61);
      expect(centre.lon).toBeGreaterThan(-9);
      expect(centre.lon).toBeLessThan(2);
      expect(centre.timezone).toBe('Europe/London');
      expect(centre.name.length).toBeGreaterThan(0);
      expect(centre.location.length).toBeGreaterThan(0);
      expect(centre.note.length).toBeGreaterThan(0);
    }
  });
});

describe('TRAIL_CENTRES — Thrunton Wood', () => {
  const thrunton = TRAIL_CENTRES.find(c => c.id === 'thrunton');

  it('is present', () => {
    expect(thrunton).toBeDefined();
  });

  it('is located near Rothbury, Northumberland', () => {
    expect(thrunton?.location).toMatch(/Northumberland/);
    expect(thrunton?.lat).toBeCloseTo(55.37, 1);
    expect(thrunton?.lon).toBeCloseTo(-1.88, 1);
  });
});
