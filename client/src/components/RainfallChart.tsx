import type { CSSProperties } from 'react';
import type { OpenMeteoDaily } from '@shared/types';

interface RainfallChartProps {
  daily: OpenMeteoDaily;
  todayIdx: number;
  scoreDateIdx: number;
  todayStr: string;
  selectedDate: string;
}

function barStyle(
  isToday: boolean,
  isFuture: boolean,
  isBeyond: boolean,
  isSelected: boolean
): CSSProperties {
  const base = 'var(--color-primary)';
  if (isBeyond)                    return { background: base, opacity: 0.2 };
  if (isFuture)                    return { background: 'var(--color-text-faint)', opacity: 0.4 };
  if (isSelected && !isToday)      return { background: base, opacity: 1, filter: 'brightness(1.4)' };
  if (isToday)                     return { background: base, opacity: 1 };
  return                                  { background: base, opacity: 0.65 };
}

export function RainfallChart({
  daily,
  todayIdx,
  scoreDateIdx,
  todayStr,
  selectedDate,
}: RainfallChartProps) {
  const precipValues = daily.precipitation_sum.map(v => v ?? 0);
  const maxPrecip = Math.max(...precipValues, 1);
  const selectedD = new Date(selectedDate + 'T12:00:00');

  return (
    <div className="flex items-end gap-[3px] h-[60px]">
      {daily.time.map((dateStr, i) => {
        const mm = precipValues[i] ?? 0;
        const pct = Math.max(2, (mm / maxPrecip) * 100);
        const isSelected = dateStr === selectedDate;
        const isToday    = dateStr === todayStr;
        const isFuture   = todayIdx >= 0 && i > todayIdx;
        const isBeyond   = scoreDateIdx >= 0 && i > scoreDateIdx;
        const d = new Date(dateStr + 'T12:00:00');
        const lbl = isToday
          ? 'Today'
          : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });

        return (
          <div
            key={dateStr}
            className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end"
            title={`${dateStr}: ${mm.toFixed(1)}mm`}
          >
            <div
              className="w-full rounded-t-[2px] min-h-[2px] transition-all duration-500"
              style={{ height: `${pct}%`, ...barStyle(isToday, isFuture, isBeyond, isSelected) }}
            />
            <div
              className={`text-center leading-tight whitespace-nowrap ${
                isSelected ? 'text-primary font-bold' : 'text-text-faint'
              }`}
              style={{ fontSize: 9 }}
            >
              {isSelected && !isToday
                ? selectedD.toLocaleDateString('en-GB', { weekday: 'short' })
                : lbl}
            </div>
          </div>
        );
      })}
    </div>
  );
}
