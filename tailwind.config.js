/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ This is the crucial change
  theme: {
    extend: {
      fontFamily: {
        // This ensures your custom font is available
        inter: ['"Inter"', 'sans-serif'], 
      },
    },
  },
  plugins: [
    require('tailwindcss-3d'), // ✅ Added 3D plugin
  ],
}