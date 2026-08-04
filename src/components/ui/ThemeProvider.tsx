'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUIStore, type ThemePreference } from '@/lib/stores/ui-store';

export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemMatchesDark(): boolean {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themePreference = useUIStore((s) => s.themePreference);
  const setThemePreference = useUIStore((s) => s.setThemePreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const applyTheme = () => {
      const resolved =
        themePreference === 'system'
          ? systemMatchesDark()
            ? 'dark'
            : 'light'
          : themePreference;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    applyTheme();

    if (themePreference === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{ themePreference, resolvedTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme doit être utilisé à l’intérieur de <ThemeProvider>');
  }
  return ctx;
}
