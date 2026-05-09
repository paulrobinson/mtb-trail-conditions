import type { CSSProperties } from 'react';
import type { OpenMeteoDaily } from '@shared/types';

interface RainfallChartProps {
  daily: OpenMeteoDaily;
  todayIdx: number;
  scoreDateIdx: number;
  todayStr: string;
  selectedDate: string;
}

export function rainfallWindow(
  totalDays: number,
  scoreDateIdx: number,
  todayIdx: number,
): { startIdx: number; endIdx: number } {
  const centerIdx = scoreDateIdx >= 0 ? scoreDateIdx : (todayIdx >= 0 ? todayIdx : 0);
  const startIdx = Math.max(0, centerIdx - 5);
  const endIdx = Math.min(totalDays, centerIdx + 3); // +2 days after selected = +3 exclusive
  return { startIdx, endIdx };
}

function barStyle(isForecast: boolean, isSelected: boolean): CSSProperties {
  if (isSelected) {
    return { background: 'var(--color-primary)', opacity: 1 };
  }
  if (isForecast) {
    return { background: 'var(--color-text-faint)', opacity: 0.55 };
  }
  return { background: 'var(--color-primary)', opacity: 0.65 };
}

export function RainfallChart({
  daily,
  todayIdx,
  scoreDateIdx,
  todayStr,
  selectedDate,
}: RainfallChartProps) {
  const { startIdx, endIdx } = rainfallWindow(daily.time.length, scoreDateIdx, todayIdx);
  const times   = daily.time.slice(startIdx, endIdx);
  const precips = daily.precipitation_sum.slice(startIdx, endIdx);

  const precipValues = precips.map(v => v ?? 0);
  const maxPrecip    = Math.max(...precipValues, 1);

  const hasActual    = times.some((_, i) => (startIdx + i) <= todayIdx);
  const hasForecasts = times.some((_, i) => (startIdx + i) > todayIdx);

  const days = times.map((dateStr, i) => {
    const i_orig     = startIdx + i;
    const mm         = precipValues[i] ?? 0;
    const pct        = Math.max(2, (mm / maxPrecip) * 100);
    const isSelected = dateStr === selectedDate;
    const isToday    = dateStr === todayStr;
    const isForecast = todayIdx >= 0 && i_orig > todayIdx;
    const d          = new Date(dateStr + 'T12:00:00');
    const weekday    = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayMonth   = isToday ? 'Today' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
    return { dateStr, mm, pct, isSelected, isForecast, weekday, dayMonth };
  });

  return (
    <div className="overflow-x-auto">
      {/* Bars */}
      <div className="flex items-end gap-[3px] h-[56px] min-w-[200px]">
        {days.map(({ dateStr, mm, pct, isSelected, isForecast }) => (
          <div key={dateStr} className="flex-1 h-full flex flex-col justify-end">
            <div
              className="w-full rounded-t-[2px] min-h-[2px] transition-all duration-500"
              style={{ height: `${pct}%`, ...barStyle(isForecast, isSelected) }}
              title={`${dateStr}: ${mm.toFixed(1)}mm (${isForecast ? 'forecast' : 'actual'})`}
            />
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-[3px] mt-1">
        {days.map(({ dateStr, isSelected, isForecast, weekday, dayMonth }) => (
          <div
            key={dateStr}
            className={`flex-1 text-center leading-none whitespace-nowrap ${
              isSelected
                ? 'text-primary font-bold underline underline-offset-2'
                : isForecast
                ? 'text-text-faint opacity-60'
                : 'text-text-faint'
            }`}
            style={{ fontSize: 9 }}
          >
            <div>{weekday}</div>
            <div>{dayMonth}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2 justify-end" style={{ fontSize: 9 }}>
        {hasActual && (
          <span className="flex items-center gap-1 text-text-faint">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'var(--color-primary)', opacity: 0.65 }}
            />
            Actual
          </span>
        )}
        {hasForecasts && (
          <span className="flex items-center gap-1 text-text-faint">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'var(--color-text-faint)', opacity: 0.55 }}
            />
            Forecast
          </span>
        )}
        <span className="flex items-center gap-1 text-primary font-bold underline underline-offset-2">
          Selected
        </span>
      </div>
    </div>
  );
}
