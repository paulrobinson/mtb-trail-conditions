import { useState, useEffect } from 'react';
import { Router, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Header } from '@/components/Header';
import { Home } from '@/pages/Home';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('mtb-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'dark';
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mtb-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <Route path="/" component={Home} />
      </Router>
    </QueryClientProvider>
  );
}
