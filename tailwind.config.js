/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./index.ts"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Canvas & Surfaces
        canvas: '#F4F5F2',
        'soft-stone': '#ECEEEA',
        surface: '#FFFFFF',
        // Structure
        charcoal: '#1D1F1E',
        'deep-charcoal': '#111412',
        'primary-text': '#161816',
        'granite': '#6B716D',
        'surface-text': '#F3F6F3',
        // Brand
        brand: '#00BB78',
        mint: '#A5FFA7',
        // Accent
        amber: '#E8833A',
      },
      fontFamily: {
        'display': ['Manrope', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['SpaceGrotesk', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'pill': '9999px',
        'btn': '16px',
      },
    },
  },
  plugins: [],
}
