import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const SUN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MOON_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const REFRESH_ICON = (spinning: boolean) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={spinning ? 'animate-spin' : ''}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>
);

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  async function handleRefresh() {
    setSpinning(true);
    await queryClient.invalidateQueries({ queryKey: ['weather'] });
    setSpinning(false);
  }

  return (
    <header className="sticky top-0 z-[100] bg-bg border-b border-divider backdrop-blur-sm">
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 no-underline text-text">
          <svg aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect width="36" height="36" rx="8" fill="var(--color-primary)" opacity="0.15"/>
            <path d="M4 28 L11 14 L17 22 L22 11 L32 28 Z" fill="var(--color-primary)" opacity="0.8"/>
            <rect x="7"  y="30" width="4" height="2" rx="1" fill="var(--color-primary)"/>
            <rect x="13" y="30" width="4" height="2" rx="1" fill="var(--color-primary)"/>
            <rect x="19" y="30" width="4" height="2" rx="1" fill="var(--color-primary)"/>
            <rect x="25" y="30" width="4" height="2" rx="1" fill="var(--color-primary)"/>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-text">Trail Check</span>
            <span className="text-xs text-text-muted font-medium tracking-widest uppercase mt-0.5">MTB Conditions</span>
          </div>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={spinning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-primary text-white hover:opacity-90 active:opacity-75 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Refresh weather data"
          >
            {REFRESH_ICON(spinning)}
            Refresh
          </button>
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-surface-offset text-text-muted hover:bg-divider hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? SUN_ICON : MOON_ICON}
          </button>
        </div>
      </div>
    </header>
  );
}
