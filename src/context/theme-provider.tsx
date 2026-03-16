'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = {
  name: string;
  color: string;
  values: {
    '--primary': string;
    '--primary-foreground': string;
    '--ring': string;
  };
};

export const themes: Theme[] = [
  { name: 'emerald', color: '#10b981', values: { '--primary': '183 96% 32%', '--primary-foreground': '210 40% 98%', '--ring': '183 96% 32%' } },
  { name: 'slate', color: '#64748b', values: { '--primary': '220 13% 47%', '--primary-foreground': '210 40% 98%', '--ring': '220 13% 47%' } },
  { name: 'sky', color: '#38bdf8', values: { '--primary': '199 98% 62%', '--primary-foreground': '210 40% 98%', '--ring': '199 98% 62%' } },
  { name: 'blue', color: '#3b82f6', values: { '--primary': '217 91% 60%', '--primary-foreground': '210 40% 98%', '--ring': '217 91% 60%' } },
  { name: 'green', color: '#22c55e', values: { '--primary': '142 76% 36%', '--primary-foreground': '210 40% 98%', '--ring': '142 76% 36%' } },
  { name: 'red', color: '#ef4444', values: { '--primary': '0 84% 60%', '--primary-foreground': '210 40% 98%', '--ring': '0 84% 60%' } },
  { name: 'orange', color: '#f97316', values: { '--primary': '25 95% 53%', '--primary-foreground': '210 40% 98%', '--ring': '25 95% 53%' } },
  { name: 'purple', color: '#8b5cf6', values: { '--primary': '262 88% 66%', '--primary-foreground': '210 40% 98%', '--ring': '262 88% 66%' } },
  { name: 'pink', color: '#ec4899', values: { '--primary': '336 95% 64%', '--primary-foreground': '210 40% 98%', '--ring': '336 95% 64%' } },
  { name: 'cyan', color: '#22d3ee', values: { '--primary': '188 85% 53%', '--primary-foreground': '210 40% 98%', '--ring': '188 85% 53%' } },
  { name: 'yellow', color: '#facc15', values: { '--primary': '48 96% 53%', '--primary-foreground': '30 40% 10%', '--ring': '48 96% 53%' } },
  { name: 'indigo', color: '#374151', values: { '--primary': '221 14% 26%', '--primary-foreground': '210 40% 98%', '--ring': '221 14% 26%' } },
];

type ThemeContextType = {
  theme: string;
  setTheme: (name: string) => void;
  themes: Theme[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, _setTheme] = useState('emerald');

  const applyTheme = useCallback((name: string) => {
    const selectedTheme = themes.find(t => t.name === name);
    if (!selectedTheme) return;

    const root = document.documentElement;
    Object.entries(selectedTheme.values).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem('app-theme', name);
    _setTheme(name);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      applyTheme(savedTheme);
    } else {
      applyTheme('emerald');
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
