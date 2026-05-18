import type { OpenMeteoDaily } from '@shared/types';

interface DatePickerBarProps {
  daily: OpenMeteoDaily;
  todayStr: string;
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DatePickerBar({ daily, todayStr, selectedDate, onSelect }: DatePickerBarProps) {
  const todayIdx = daily.time.indexOf(todayStr);
  if (todayIdx < 0) return null;

  const dates = daily.time.slice(todayIdx, todayIdx + 10);

  return (
    <div className="border-b border-divider bg-surface">
      <div
        className="max-w-[1100px] mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <span className="text-xs font-bold text-text-muted uppercase tracking-widest whitespace-nowrap flex-shrink-0 mr-1">
          Plan for
        </span>
        {dates.map(dateStr => {
          const isToday  = dateStr === todayStr;
          const isActive = dateStr === selectedDate;
          const i  = daily.time.indexOf(dateStr);
          const d  = new Date(dateStr + 'T12:00:00');
          const dayLbl  = isToday ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' });
          const dateLbl = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          const mm = daily.precipitation_sum[i] ?? 0;
          const rainLbl = mm > 0.5 ? `${mm.toFixed(1)}mm` : '';

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-md border flex-shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'border-primary bg-primary-highlight'
                  : 'border-transparent bg-transparent hover:bg-surface-offset'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                {dayLbl}
              </span>
              <span className={`text-xs ${isActive ? 'text-primary' : 'text-text-faint'}`}>
                {dateLbl}
              </span>
              <span className="font-semibold min-h-3" style={{ fontSize: 9, color: '#5b9bd5' }}>
                {rainLbl}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
