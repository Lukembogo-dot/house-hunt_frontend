import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios'; // Make sure this points to your API client

// 1. Create the context
const FeatureFlagContext = createContext({});

/**
 * This is the Provider component.
 * We will wrap our entire application in this.
 * It fetches the public flags once and provides them to all children.
 */
export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches the public, ENABLED-ONLY flags from your API
    apiClient.get('/features/public')
      .then(res => {
        setFlags(res.data);
      })
      .catch(err => {
        console.error("Failed to load feature flags", err);
        // On error, we set flags to an empty object so the app doesn't crash
        setFlags({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Show a loading state or null while fetching to prevent flicker
  if (loading) {
    return null; // Or a full-page loader if you prefer
  }

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * This is the custom hook.
 * Any component can call useFeatureFlag('my-feature-key')
 * and it will return true (unlocked) or false (locked).
 */
export function useFeatureFlag(key) {
  const flags = useContext(FeatureFlagContext);
  // Returns true only if the key exists and is explicitly true
  return flags[key] === true; 
}