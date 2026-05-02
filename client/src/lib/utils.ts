import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function windDirLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function weatherIcon(precipSum: number, windMax: number, tempMax: number): string {
  if (precipSum > 10)  return '🌧️';
  if (precipSum > 3)   return '🌦️';
  if (precipSum > 0.5) return '🌂';
  if (windMax > 40)    return '💨';
  if (tempMax < 2)     return '❄️';
  if (tempMax > 18)    return '☀️';
  return '⛅';
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
  });
}

export function formatLongDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function formatWeekday(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
}
