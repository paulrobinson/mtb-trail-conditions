import { z } from 'zod';

export const openMeteoDailySchema = z.object({
  time: z.array(z.string()),
  precipitation_sum: z.array(z.number().nullable()),
  temperature_2m_max: z.array(z.number().nullable()),
  temperature_2m_min: z.array(z.number().nullable()),
  temperature_2m_mean: z.array(z.number().nullable()),
  wind_speed_10m_max: z.array(z.number().nullable()),
  wind_direction_10m_dominant: z.array(z.number().nullable()),
  precipitation_probability_max: z.array(z.number().nullable()),
});

export const openMeteoCurrentSchema = z.object({
  temperature_2m: z.number(),
  precipitation: z.number(),
  wind_speed_10m: z.number(),
  wind_direction_10m: z.number(),
  weather_code: z.number(),
});

export const openMeteoResponseSchema = z.object({
  daily: openMeteoDailySchema,
  current: openMeteoCurrentSchema,
});

export const centreWeatherSchema = z.object({
  id: z.string(),
  weather: openMeteoResponseSchema,
  cachedAt: z.string(),
});

export const weatherApiResponseSchema = z.object({
  centres: z.array(centreWeatherSchema),
});
