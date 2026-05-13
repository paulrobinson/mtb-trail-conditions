import { useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { useQueryClient } from '@tanstack/react-query';
import { getTodayStr } from '@/lib/utils';
import { TRAIL_CENTRES } from '@shared/centres';
import { DatePickerBar } from '@/components/DatePickerBar';
import { TrailCard } from '@/components/TrailCard';
import { Button } from '@/components/ui/button';

export function Home() {
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const { data, isLoading, isError, error } = useWeather();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-text-muted">
        <div className="w-9 h-9 rounded-full border-[3px] border-border border-t-primary animate-spin" />
        <p className="text-sm max-w-[36ch] text-center">
          Fetching weather data for your trail centres…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-text-muted">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm max-w-[36ch] text-center">
          Unable to fetch weather data: {error.message}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['weather'] })}
          className="mt-2"
        >
          Try again
        </Button>
      </div>
    );
  }

  const firstWeather = data?.centres[0]?.weather;

  return (
    <>
      {firstWeather && (
        <DatePickerBar
          daily={firstWeather.daily}
          todayStr={getTodayStr()}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      )}

      <main className="py-8 pb-16">
        <div className="max-w-[1100px] mx-auto px-4 grid gap-8">
          {data?.centres.map(({ id, weather, drainageFactor }) => {
            const centre = TRAIL_CENTRES.find(c => c.id === id);
            if (!centre) return null;
            return (
              <TrailCard
                key={id}
                centre={centre}
                weatherData={weather}
                drainageFactor={drainageFactor}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            );
          })}
        </div>
      </main>

      <footer className="border-t border-divider px-6 py-6 text-center space-y-1">
        <p className="text-xs text-text-faint">
          Weather data from{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener" className="text-primary hover:underline">
            Open-Meteo
          </a>
          {' '}— free, open-source, no API key required. Condition scoring based on rainfall
          accumulation, drainage characteristics, and temperature. For planning purposes only —
          always ride to your ability.
        </p>
        <p className="text-xs text-text-faint opacity-60">
          Built{' '}
          {new Date(__BUILD_TIME__).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </footer>
    </>
  );
}
