/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 4px 0 rgba(60,38,20,0.07), 0 1px 2px -1px rgba(60,38,20,0.05)',
        'card-md': '0 4px 16px 0 rgba(60,38,20,0.10), 0 2px 4px -1px rgba(60,38,20,0.06)',
        'card-lg': '0 8px 28px 0 rgba(60,38,20,0.13), 0 4px 8px -2px rgba(60,38,20,0.08)',
        'glass':   '0 8px 32px 0 rgba(60,38,20,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
        'modal':   '0 24px 64px 0 rgba(30,22,16,0.30)',
      },
      colors: {
        // Earth / warm brown tones — structural & text
        brand: {
          50:  '#faf7f3',
          100: '#f0e9de',
          200: '#ddd0be',
          300: '#c4ae93',
          400: '#a68d70',
          500: '#7c6554',
          600: '#634f40',
          700: '#4a3a2e',
          800: '#32261e',
          900: '#1e1610',
        },
        // Terracotta / clay — CTAs & highlights
        azure: {
          50:  '#fdf5f0',
          100: '#fae8d8',
          200: '#f4cdb0',
          300: '#eca97e',
          400: '#e0814d',
          500: '#c96338',
          600: '#ac4f29',
          700: '#8e3d1d',
          800: '#702d12',
          900: '#521f09',
        },
      },
    },
  },
  plugins: [],
};
