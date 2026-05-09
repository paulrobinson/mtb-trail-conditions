import type { OpenMeteoDaily } from '@shared/types';
import { weatherIcon, windDirLabel } from '@/lib/utils';

interface ForecastStripProps {
  daily: OpenMeteoDaily;
  todayIdx: number;
  selectedDate: string;
  todayStr: string;
  onSelect: (date: string) => void;
}

export function ForecastStrip({ daily, todayIdx, selectedDate, todayStr, onSelect }: ForecastStripProps) {
  const forecastStart = todayIdx >= 0 ? todayIdx : 0;
  const sliceDates = daily.time.slice(forecastStart, forecastStart + 7);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
      {sliceDates.map((dateStr, fi) => {
        const i = forecastStart + fi;
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === todayStr;
        const d = new Date(dateStr + 'T12:00:00');
        const dayLabel  = isToday ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' });
        const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const mm   = daily.precipitation_sum[i] ?? 0;
        const tMax = Math.round(daily.temperature_2m_max[i] ?? 0);
        const tMin = Math.round(daily.temperature_2m_min[i] ?? 0);
        const wMax = Math.round(daily.wind_speed_10m_max[i] ?? 0);
        const wDir = windDirLabel(daily.wind_direction_10m_dominant[i] ?? 0);
        const prob = daily.precipitation_probability_max[i] ?? 0;
        const icon = weatherIcon(mm, wMax, tMax);

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onSelect(dateStr)}
            className={`flex-shrink-0 min-w-[70px] flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-center border transition-colors cursor-pointer ${
              isSelected
                ? 'border-primary bg-primary-highlight'
                : 'border-transparent bg-surface-2 hover:border-primary/40 hover:bg-primary-highlight/40'
            }`}
          >
            <div className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-text-muted'}`}>
              {dayLabel}
            </div>
            <div className="text-xs text-text-faint">{dateLabel}</div>
            <div className="text-[1.4rem] leading-none">{icon}</div>
            <div className="flex gap-1 items-baseline">
              <span className="text-sm font-bold text-text">{tMax}°</span>
              <span className="text-xs text-text-muted">{tMin}°</span>
            </div>
            {mm > 0.2 ? (
              <div className="text-xs font-semibold" style={{ color: '#5b9bd5' }}>
                {mm.toFixed(1)}mm{' '}
                <span className="opacity-70">{prob}%</span>
              </div>
            ) : (
              <div className="text-xs font-semibold opacity-30" style={{ color: '#5b9bd5' }}>
                Dry
              </div>
            )}
            <div className="text-text-faint" style={{ fontSize: 9 }}>
              {wMax} km/h {wDir}
            </div>
          </button>
        );
      })}
    </div>
  );
}
