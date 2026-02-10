import React, { useEffect, useState } from 'react';
import ThemeContext from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 1. Get theme from localStorage, or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement; // The <html> tag
    root.classList.remove('light', 'dark'); // Clear any existing classes

    if (theme === 'system') {
      // 2. Check OS preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    // 3. Apply the user's chosen theme (light or dark)
    root.classList.add(theme);

  }, [theme]); // Rerun this effect whenever the theme state changes

  const handleSetTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};