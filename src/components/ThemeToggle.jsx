import React from 'react';
import useTheme from '../hooks/useTheme';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  // Check the *effective* theme, resolving 'system'
  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    // Toggle between light and dark
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
    </button>
  );
};

export default ThemeToggle;