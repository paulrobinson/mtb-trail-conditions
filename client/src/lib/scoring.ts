import type {
  TrailCentre,
  OpenMeteoResponse,
  ConditionResult,
  ConditionKey,
  ScoredTrail,
} from '@shared/types';

export type ScoringDaily = Pick<
  OpenMeteoResponse['daily'],
  'precipitation_sum' | 'temperature_2m_mean' | 'wind_speed_10m_max'
>;

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
 *  2. Per-centre drainage factor reduces effective saturation.
 *  3. Temperature and wind adjustments.
 *  4. Maps to Dry / Grippy / Muddy / Boggy.
 *
 *  Pass a slice of daily data up to and including the target date.
 *  All totals (last 7d, last 14d, dry streak) are relative to the end of that slice.
 */
export function scoreConditions(
  centre: TrailCentre,
  daily: ScoringDaily
): ConditionResult {
  const n = daily.precipitation_sum.length;

  let weightedRain = 0;
  for (let i = 0; i < n; i++) {
    const daysAgo = n - 1 - i;
    const mm = daily.precipitation_sum[i] ?? 0;
    let weight = 0.6;
    if (daysAgo <= 2)      weight = 3.0;
    else if (daysAgo <= 6) weight = 1.5;
    weightedRain += mm * weight * (1 - centre.drainageFactor * (daysAgo / n));
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

  const trailConditions: ScoredTrail[] = centre.trails.map(trail => {
    const sensitivity = centre.surfaceSensitivity[trail.surfaceType] ?? 0.7;
    const effectiveScore = weightedRain * sensitivity;
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
