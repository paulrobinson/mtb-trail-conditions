import type { ReactNode } from 'react';
import type { TrailCentre, OpenMeteoResponse } from '@shared/types';
import { scoreConditions } from '@/lib/scoring';
import { getTodayStr, formatLongDate } from '@/lib/utils';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { ConditionBadge } from '@/components/ConditionBadge';
import { SaturationMeter } from '@/components/SaturationMeter';
import { TrailTypesList } from '@/components/TrailTypesList';
import { ForecastStrip } from '@/components/ForecastStrip';
import { RainfallChart } from '@/components/RainfallChart';

interface TrailCardProps {
  centre: TrailCentre;
  weatherData: OpenMeteoResponse;
  selectedDate: string;
}

export function TrailCard({ centre, weatherData, selectedDate }: TrailCardProps) {
  const today  = getTodayStr();
  const days   = weatherData.daily;
  const n      = days.time.length;
  const isToday = selectedDate === today;

  const todayIdx     = days.time.indexOf(today);
  const scoreDateIdx = days.time.indexOf(selectedDate);
  const sliceEnd     = scoreDateIdx >= 0 ? scoreDateIdx + 1 : (todayIdx >= 0 ? todayIdx + 1 : n);

  const score = scoreConditions(centre, {
    precipitation_sum:   days.precipitation_sum.slice(0, sliceEnd),
    temperature_2m_mean: days.temperature_2m_mean.slice(0, sliceEnd),
    wind_speed_10m_max:  days.wind_speed_10m_max.slice(0, sliceEnd),
  });

  const scoreDateLabel = isToday
    ? "Today's conditions"
    : 'Projected for ' + formatLongDate(selectedDate);

  // Stats for the selected day
  const selI    = scoreDateIdx >= 0 ? scoreDateIdx : (todayIdx >= 0 ? todayIdx : 0);
  const selTemp = Math.round(days.temperature_2m_max[selI] ?? 0);
  const selWind = Math.round(days.wind_speed_10m_max[selI] ?? 0);
  const selMm   = (days.precipitation_sum[selI] ?? 0).toFixed(1);
  const selProb = days.precipitation_probability_max[selI] ?? 0;
  const cur     = weatherData.current;

  return (
    <Card data-centre={centre.id}>

      {/* ── Header ─────────────────────────────────── */}
      <CardHeader>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            {centre.location}
          </span>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-text leading-tight">
            {centre.name}
          </h2>
          <p className="text-xs text-text-faint mt-1">{centre.note}</p>
        </div>
        <ConditionBadge
          conditionKey={score.conditionKey}
          conditionLabel={score.conditionLabel}
          scoreDateLabel={scoreDateLabel}
        />
      </CardHeader>

      {/* ── Two-column body ────────────────────────── */}
      <div className="grid grid-cols-2 max-[700px]:grid-cols-1 min-w-0">

        {/* Left: saturation + trail types */}
        <div className="p-5 px-6 min-w-0 overflow-hidden">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
            Ground Saturation
          </p>
          <SaturationMeter
            saturationPct={score.saturationPct}
            totalLast7={score.totalLast7}
            totalLast14={score.totalLast14}
            dryStreak={score.dryStreak}
          />
          <div className="mt-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
              Trail Types
            </p>
            <TrailTypesList trailConditions={score.trailConditions} />
          </div>
        </div>

        {/* Right: forecast + day stats */}
        <div className="p-5 px-6 min-w-0 overflow-hidden border-l border-divider max-[700px]:border-l-0 max-[700px]:border-t max-[700px]:border-divider">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
            7-Day Forecast
          </p>
          <ForecastStrip
            daily={days}
            todayIdx={todayIdx}
            selectedDate={selectedDate}
            todayStr={today}
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {isToday ? (
              <>
                <StatPill>Now: <strong>{Math.round(cur.temperature_2m)}°C</strong></StatPill>
                <StatPill>Wind: <strong>{Math.round(cur.wind_speed_10m)} km/h</strong></StatPill>
              </>
            ) : (
              <>
                <StatPill>High: <strong>{selTemp}°C</strong></StatPill>
                <StatPill>Wind: <strong>{selWind} km/h</strong></StatPill>
                <StatPill>Rain: <strong>{selMm}mm</strong> <span className="opacity-60">{selProb}%</span></StatPill>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Rainfall chart ─────────────────────────── */}
      <CardFooter>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
          Rainfall — Past 7 Days
          {!isToday && (
            <span className="normal-case font-normal text-primary"> · Selected day highlighted</span>
          )}
        </p>
        <div className="mt-3">
          <RainfallChart
            daily={days}
            todayIdx={todayIdx}
            scoreDateIdx={scoreDateIdx}
            todayStr={today}
            selectedDate={selectedDate}
          />
        </div>
      </CardFooter>
    </Card>
  );
}

function StatPill({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-2 text-xs text-text-muted [&_strong]:text-text [&_strong]:font-bold">
      {children}
    </div>
  );
}
