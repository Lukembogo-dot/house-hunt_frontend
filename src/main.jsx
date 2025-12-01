// src/main.jsx (UPDATED)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx' 

// ✅ 1. Import GoogleOAuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

import ReactGA from 'react-ga4';

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
  console.log("GA4 Initialized with ID:", gaMeasurementId);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ 2. Wrap the entire app with GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>
              <FeatureFlagProvider>
                <App />
              </FeatureFlagProvider>
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)