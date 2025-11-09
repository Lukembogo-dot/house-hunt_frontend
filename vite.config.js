import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Import the plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // 2. Add the VitePWA plugin
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'House Hunt Kenya',
        short_name: 'HouseHunt',
        description: 'Find properties for sale and rent in Kenya, plus local service reviews.',
        theme_color: '#2563EB', // Your site's blue brand color
        background_color: '#ffffff', // Splash screen background
        start_url: '/',
        display: 'standalone', // Makes it feel like a native app
        icons: [
          {
            src: 'icons/icon-192x192.png', // Path from the public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png', // Path from the public folder
            sizes: '512x512',
            type: 'image/png'
          },
          {
            // This is the icon used for the "maskable" feature
            src: 'icons/icon-512x512.png', // Path from the public folder
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})