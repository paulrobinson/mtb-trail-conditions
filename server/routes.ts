import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { weatherCache } from './db/schema.js';
import { getGeologyForCentre } from './geology.js';
import { TRAIL_CENTRES } from '../shared/centres.js';
import { openMeteoResponseSchema } from '../shared/schema.js';
import type { OpenMeteoResponse, WeatherApiResponse } from '../shared/types.js';

const router = Router();

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

async function fetchFromOpenMeteo(centreId: string): Promise<OpenMeteoResponse> {
  const centre = TRAIL_CENTRES.find(c => c.id === centreId);
  if (!centre) throw new Error(`Unknown centre: ${centreId}`);

  const params = new URLSearchParams({
    latitude: String(centre.lat),
    longitude: String(centre.lon),
    timezone: centre.timezone,
    past_days: '14',
    forecast_days: '10',
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

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status} for ${centre.name}`);

  const raw = await res.json();
  return openMeteoResponseSchema.parse(raw);
}

async function getWeatherForCentre(centreId: string): Promise<{ weather: OpenMeteoResponse; cachedAt: string }> {
  const now = Date.now();
  const cached = db.select().from(weatherCache).where(eq(weatherCache.centreId, centreId)).get();

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      weather: JSON.parse(cached.data) as OpenMeteoResponse,
      cachedAt: new Date(cached.fetchedAt).toISOString(),
    };
  }

  const weather = await fetchFromOpenMeteo(centreId);
  const dataJson = JSON.stringify(weather);

  db.insert(weatherCache)
    .values({ centreId, data: dataJson, fetchedAt: now })
    .onConflictDoUpdate({ target: weatherCache.centreId, set: { data: dataJson, fetchedAt: now } })
    .run();

  return { weather, cachedAt: new Date(now).toISOString() };
}

router.get('/weather', async (_req, res) => {
  try {
    const results = await Promise.all(
      TRAIL_CENTRES.map(async c => {
        const [{ weather, cachedAt }, drainageFactor] = await Promise.all([
          getWeatherForCentre(c.id),
          getGeologyForCentre(c.id),
        ]);
        return { id: c.id, weather, cachedAt, drainageFactor };
      })
    );

    const body: WeatherApiResponse = { centres: results };
    res.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: message });
  }
});

export default router;
