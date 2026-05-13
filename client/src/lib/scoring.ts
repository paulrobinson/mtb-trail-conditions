import type {
  TrailCentre,
  TerrainClass,
  OpenMeteoResponse,
  ConditionResult,
  ConditionKey,
  ScoredTrail,
} from '@shared/types';

export type ScoringDaily = Pick<
  OpenMeteoResponse['daily'],
  'precipitation_sum' | 'temperature_2m_mean' | 'wind_speed_10m_max'
>;

// How much each terrain class amplifies the weighted rainfall score.
// Lower = drains faster / less sensitive to rain accumulation.
const TERRAIN_SENSITIVITY: Record<TerrainClass, number> = {
  'engineered':       0.30,
  'reinforced':       0.55,
  'natural-improved': 0.85,
  'natural':          1.20,
};

function getDryStreak(precipArr: (number | null)[]): number {
  let streak = 0;
  for (let i = precipArr.length - 1; i >= 0; i--) {
    if ((precipArr[i] ?? 0) < 0.5) streak++;
    else break;
  }
  return streak;
}

/**
 * Score trail conditions from a slice of daily weather data.
 *
 * Algorithm:
 *  1. Weighted rainfall sum over the supplied window:
 *     - last 3 days  → weight 3.0
 *     - days 4–7     → weight 1.5
 *     - days 8+      → weight 0.6
 *  2. drainageFactor (BGS-derived, 0.2–0.85) reduces effective saturation.
 *  3. Temperature and wind adjustments.
 *  4. Per-trail TerrainClass sensitivity scales the score for individual trails.
 *  5. Maps to Dry / Grippy / Muddy / Boggy.
 *
 *  Pass a slice of daily data up to and including the target date.
 *  All totals (last 7d, last 14d, dry streak) are relative to the end of that slice.
 */
export function scoreConditions(
  centre: TrailCentre,
  daily: ScoringDaily,
  drainageFactor: number
): ConditionResult {
  const n = daily.precipitation_sum.length;

  let weightedRain = 0;
  for (let i = 0; i < n; i++) {
    const daysAgo = n - 1 - i;
    const mm = daily.precipitation_sum[i] ?? 0;
    let weight = 0.6;
    if (daysAgo <= 2)      weight = 3.0;
    else if (daysAgo <= 6) weight = 1.5;
    weightedRain += mm * weight * (1 - drainageFactor * (daysAgo / n));
  }

  const recentTemps = daily.temperature_2m_mean.slice(-3);
  const avgTemp = recentTemps.reduce<number>((a, b) => a + (b ?? 0), 0) / recentTemps.length;
  if (avgTemp < 2)       weightedRain *= 1.2;
  else if (avgTemp > 12) weightedRain *= 0.85;

  const recentWind = daily.wind_speed_10m_max.slice(-3);
  const avgWind = recentWind.reduce<number>((a, b) => a + (b ?? 0), 0) / recentWind.length;
  if (avgWind > 25) weightedRain *= 0.9;

  let conditionKey: ConditionKey;
  let conditionLabel: string;
  if (weightedRain < 15)       { conditionKey = 'good';  conditionLabel = 'Dry'; }
  else if (weightedRain < 35)  { conditionKey = 'tacky'; conditionLabel = 'Grippy'; }
  else if (weightedRain < 65)  { conditionKey = 'boggy'; conditionLabel = 'Muddy'; }
  else                         { conditionKey = 'avoid'; conditionLabel = 'Boggy'; }

  // One entry per terrain class, worst (highest) effective score wins
  const CLASS_ORDER: TerrainClass[] = ['engineered', 'reinforced', 'natural-improved', 'natural'];
  const worstByClass = new Map<TerrainClass, number>();
  for (const trail of centre.trails) {
    const effectiveScore = weightedRain * TERRAIN_SENSITIVITY[trail.terrainClass];
    const prev = worstByClass.get(trail.terrainClass) ?? -Infinity;
    if (effectiveScore > prev) worstByClass.set(trail.terrainClass, effectiveScore);
  }

  const trailConditions: ScoredTrail[] = CLASS_ORDER
    .filter(tc => worstByClass.has(tc))
    .map(tc => {
      const effectiveScore = worstByClass.get(tc)!;
      const trail = centre.trails.find(t => t.terrainClass === tc)!;
      let status: string;
      let statusClass: ConditionKey;
      if (effectiveScore < 15)       { status = 'Dry';    statusClass = 'good'; }
      else if (effectiveScore < 35)  { status = 'Grippy'; statusClass = 'tacky'; }
      else if (effectiveScore < 65)  { status = 'Muddy';  statusClass = 'boggy'; }
      else                           { status = 'Boggy';  statusClass = 'avoid'; }
      return { ...trail, status, statusClass };
    });

  const precip = daily.precipitation_sum;
  const totalLast7  = precip.slice(-7).reduce<number>((a, b) => a + (b ?? 0), 0);
  const totalLast14 = precip.reduce<number>((a, b) => a + (b ?? 0), 0);

  return {
    conditionKey,
    conditionLabel,
    trailConditions,
    saturationPct: Math.min(100, Math.round(weightedRain / 80 * 100)),
    totalLast7:  totalLast7.toFixed(1),
    totalLast14: totalLast14.toFixed(1),
    dryStreak:   getDryStreak(precip),
  };
}
