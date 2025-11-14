// src/main.jsx (UPDATED)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
// This import is now corrected to .jsx
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx' // <-- 1. IMPORT THE NEW PROVIDER

// 1. Import ReactGA
import ReactGA from 'react-ga4';

// 2. Get the Measurement ID from the .env file
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// 3. Initialize GA4
if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
  console.log("GA4 Initialized with ID:", gaMeasurementId);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            {/* 2. WRAP THE APP WITH THE FEATURE FLAG PROVIDER */}
            <FeatureFlagProvider>
              <App />
            </FeatureFlagProvider>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)