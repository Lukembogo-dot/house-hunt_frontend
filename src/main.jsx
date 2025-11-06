import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx' // ✅ 1. Import new provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider> {/* ✅ 2. Wrap your App */}
          <App />
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)