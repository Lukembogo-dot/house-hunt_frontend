// src/main.jsx (UPDATED: Added Vercel Analytics)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx' 
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactGA from 'react-ga4';

// ✅ 1. Import Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
  console.log("GA4 Initialized with ID:", gaMeasurementId);
}

// ⚠️ PASTE YOUR FULL GOOGLE CLIENT ID INSIDE THE QUOTES BELOW ⚠️
const GOOGLE_CLIENT_ID = "454827380731-thk71v8cp7tqs3pqdh......apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>
              <FeatureFlagProvider>
                <App />
                {/* ✅ 2. Add the Analytics Component here */}
                <Analytics />
              </FeatureFlagProvider>
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)