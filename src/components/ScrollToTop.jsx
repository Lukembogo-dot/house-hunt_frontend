// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // This hook gives us the current page's location object
  const { pathname } = useLocation();

  // This effect runs every time the 'pathname' (the URL) changes
  useEffect(() => {
    // Scroll the window to the top-left corner
    window.scrollTo(0, 0);
  }, [pathname]); // The effect's dependency is the pathname

  // This component doesn't render any visible UI
  return null;
}

export default ScrollToTop;