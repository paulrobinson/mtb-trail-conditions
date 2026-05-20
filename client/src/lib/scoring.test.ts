import { describe, it, expect } from 'vitest';
import { scoreConditions } from './scoring';
import type { TrailCentre } from '@shared/types';

const CENTRE: TrailCentre = {
  id: 'test',
  name: 'Test Centre',
  location: 'Somewhere, UK',
  lat: 55.0,
  lon: -3.0,
  timezone: 'Europe/London',
  note: '',
};

function makeDaily(precipMm: number[], tempMean = 10, wind = 10) {
  return {
    precipitation_sum:   precipMm.map(v => v),
    temperature_2m_mean: precipMm.map(() => tempMean),
    wind_speed_10m_max:  precipMm.map(() => wind),
  };
}

describe('scoreConditions — centre-level thresholds', () => {
  it('returns good/Dry when there has been no rain', () => {
    const result = scoreConditions(CENTRE, makeDaily(new Array(14).fill(0)), 0.5);
    expect(result.conditionKey).toBe('good');
    expect(result.conditionLabel).toBe('Dry');
  });

  it('returns avoid/Boggy after sustained heavy rain', () => {
    const result = scoreConditions(CENTRE, makeDaily(new Array(14).fill(10)), 0.5);
    expect(result.conditionKey).toBe('avoid');
    expect(result.conditionLabel).toBe('Boggy');
  });

  it('recent rain weighs more than old rain', () => {
    const oldRain  = makeDaily([...new Array(11).fill(5), 0, 0, 0]);
    const newRain  = makeDaily([...new Array(11).fill(0), 5, 5, 5]);
    const scoreOld = scoreConditions(CENTRE, oldRain, 0.5);
    const scoreNew = scoreConditions(CENTRE, newRain, 0.5);
    expect(scoreNew.saturationPct).toBeGreaterThan(scoreOld.saturationPct);
  });
});

describe('scoreConditions — all four terrain classes always present', () => {
  it('always returns exactly four terrain class rows', () => {
    const result = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3)), 0.5);
    expect(result.trailConditions).toHaveLength(4);
    const classes = result.trailConditions.map(t => t.terrainClass);
    expect(classes).toEqual(['engineered', 'reinforced', 'natural-improved', 'natural']);
  });
});

describe('scoreConditions — drainageFactor effect', () => {
  const rain = makeDaily(new Array(14).fill(3));

  it('higher drainageFactor gives lower saturation', () => {
    const rockySite = scoreConditions(CENTRE, rain, 0.75);
    const claySite  = scoreConditions(CENTRE, rain, 0.25);
    expect(rockySite.saturationPct).toBeLessThan(claySite.saturationPct);
  });

  it('extremes: best-draining vs worst-draining geology differ noticeably', () => {
    const chalk = scoreConditions(CENTRE, rain, 0.85);
    const peat  = scoreConditions(CENTRE, rain, 0.20);
    expect(peat.saturationPct - chalk.saturationPct).toBeGreaterThan(10);
  });
});

describe('scoreConditions — TerrainClass sensitivity ordering', () => {
  it('engineered always scores better than or equal to natural on the same rain', () => {
    const result = scoreConditions(CENTRE, makeDaily(new Array(14).fill(4)), 0.5);
    const order: Record<string, number> = { good: 0, tacky: 1, boggy: 2, avoid: 3 };
    const byClass = Object.fromEntries(result.trailConditions.map(t => [t.terrainClass, t.statusClass]));
    expect(order[byClass['engineered']]).toBeLessThanOrEqual(order[byClass['reinforced']]);
    expect(order[byClass['reinforced']]).toBeLessThanOrEqual(order[byClass['natural-improved']]);
    expect(order[byClass['natural-improved']]).toBeLessThanOrEqual(order[byClass['natural']]);
  });
});

describe('scoreConditions — temperature and wind adjustments', () => {
  it('freezing temps increase saturation', () => {
    const cold   = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), -2), 0.5);
    const normal = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), 10), 0.5);
    expect(cold.saturationPct).toBeGreaterThan(normal.saturationPct);
  });

  it('warm temps reduce saturation', () => {
    const warm   = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), 15), 0.5);
    const normal = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), 10), 0.5);
    expect(warm.saturationPct).toBeLessThan(normal.saturationPct);
  });

  it('high wind reduces saturation', () => {
    const windy = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), 10, 30), 0.5);
    const calm  = scoreConditions(CENTRE, makeDaily(new Array(14).fill(3), 10, 5),  0.5);
    expect(windy.saturationPct).toBeLessThan(calm.saturationPct);
  });
});

describe('scoreConditions — stats', () => {
  it('dryStreak counts consecutive dry days from the end', () => {
    const result = scoreConditions(CENTRE, makeDaily([5, 5, 5, 0, 0, 0]), 0.5);
    expect(result.dryStreak).toBe(3);
  });

  it('totalLast7 sums the final 7 days', () => {
    const precip = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const result = scoreConditions(CENTRE, makeDaily(precip), 0.5);
    expect(result.totalLast7).toBe((8 + 9 + 10 + 11 + 12 + 13 + 14).toFixed(1));
  });
});
