import { useQuery } from '@tanstack/react-query';
import { weatherApiResponseSchema } from '@shared/schema';
import type { WeatherApiResponse } from '@shared/types';

async function fetchWeather(): Promise<WeatherApiResponse> {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const raw = await res.json();
  return weatherApiResponseSchema.parse(raw);
}

export function useWeather() {
  return useQuery<WeatherApiResponse, Error>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
  });
}
