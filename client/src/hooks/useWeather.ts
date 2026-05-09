import { useQuery } from '@tanstack/react-query';
import { weatherApiResponseSchema } from '@shared/schema';
import type { WeatherApiResponse } from '@shared/types';
import { TRAIL_CENTRES } from '@shared/centres';

// When VITE_DIRECT_WEATHER=true (preview/static builds), fetch Open-Meteo
// directly from the browser — no Express backend required.
// Open-Meteo is a public API that allows browser CORS requests.
const DIRECT = import.meta.env.VITE_DIRECT_WEATHER === 'true';

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

async function fetchCentreDirect(centre: (typeof TRAIL_CENTRES)[number]) {
  const params = new URLSearchParams({
    latitude:      String(centre.lat),
    longitude:     String(centre.lon),
    timezone:      centre.timezone,
    past_days:     '14',
    forecast_days: '7',
    daily: [
      'precipitation_sum',
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'precipitation_probability_max',
    ].join(','),
    current: [
      'temperature_2m',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
    ].join(','),
  });
  const res = await fetch(`${OPEN_METEO}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status} for ${centre.name}`);
  return res.json();
}

async function fetchWeather(): Promise<WeatherApiResponse> {
  if (DIRECT) {
    const centres = await Promise.all(
      TRAIL_CENTRES.map(async c => ({
        id:       c.id,
        weather:  await fetchCentreDirect(c),
        cachedAt: new Date().toISOString(),
      }))
    );
    return weatherApiResponseSchema.parse({ centres });
  }

  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return weatherApiResponseSchema.parse(await res.json());
}

const ONE_HOUR = 60 * 60 * 1000;

export function useWeather() {
  return useQuery<WeatherApiResponse, Error>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: ONE_HOUR,
    refetchInterval: ONE_HOUR,
  });
}
