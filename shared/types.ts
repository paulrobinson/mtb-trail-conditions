export type TrailGrade = 'green' | 'blue' | 'red' | 'black' | 'orange' | 'natural';
export type SurfaceType = 'hardpack' | 'mixed' | 'loam' | 'loam-rock' | 'clay-loam' | 'natural';
export type ConditionKey = 'good' | 'tacky' | 'boggy' | 'avoid';

export interface Trail {
  grade: TrailGrade;
  label: string;
  name: string;
  surfaceType: SurfaceType;
}

export interface TrailCentre {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  timezone: string;
  note: string;
  trails: Trail[];
  drainageFactor: number;
  surfaceSensitivity: Partial<Record<SurfaceType, number>>;
}

export interface OpenMeteoDaily {
  time: string[];
  precipitation_sum: (number | null)[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  temperature_2m_mean: (number | null)[];
  wind_speed_10m_max: (number | null)[];
  wind_direction_10m_dominant: (number | null)[];
  precipitation_probability_max: (number | null)[];
}

export interface OpenMeteoCurrent {
  temperature_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
}

export interface OpenMeteoResponse {
  daily: OpenMeteoDaily;
  current: OpenMeteoCurrent;
}

export interface CentreWeather {
  id: string;
  weather: OpenMeteoResponse;
  cachedAt: string;
}

export interface WeatherApiResponse {
  centres: CentreWeather[];
}

export interface ScoredTrail extends Trail {
  status: string;
  statusClass: ConditionKey;
}

export interface ConditionResult {
  conditionKey: ConditionKey;
  conditionLabel: string;
  trailConditions: ScoredTrail[];
  saturationPct: number;
  totalLast7: string;
  totalLast14: string;
  dryStreak: number;
}
