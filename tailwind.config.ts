import type { Config } from 'tailwindcss';

export default {
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-offset': 'var(--color-surface-offset)',
        divider: 'var(--color-divider)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-faint': 'var(--color-text-faint)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-active': 'var(--color-primary-active)',
        'primary-highlight': 'var(--color-primary-highlight)',
        good: 'var(--color-good)',
        'good-bg': 'var(--color-good-bg)',
        tacky: 'var(--color-tacky)',
        'tacky-bg': 'var(--color-tacky-bg)',
        boggy: 'var(--color-boggy)',
        'boggy-bg': 'var(--color-boggy-bg)',
        avoid: 'var(--color-avoid)',
        'avoid-bg': 'var(--color-avoid-bg)',
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'Helvetica Neue', 'sans-serif'],
        body: ['Satoshi', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
} satisfies Config;
