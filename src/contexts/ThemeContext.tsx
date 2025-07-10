import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '../types';

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#14B8A6',
  accentColor: '#F97316'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        // Validate that the parsed theme has the required structure
        if (parsedTheme && typeof parsedTheme === 'object' && 
            parsedTheme.mode && parsedTheme.primaryColor && 
            parsedTheme.secondaryColor && parsedTheme.accentColor) {
          return parsedTheme;
        }
      } catch (error) {
        // If parsing fails or theme is invalid, fall back to default
        console.warn('Invalid theme data in localStorage, using default theme');
      }
    }
    return defaultTheme;
  });

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const toggleMode = () => {
    setTheme(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  };

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
  }, [theme]);

  const value = {
    theme,
    updateTheme,
    toggleMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};