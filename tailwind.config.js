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
        'card':    '0 1px 3px 0 rgba(0,96,122,0.06), 0 1px 2px -1px rgba(0,96,122,0.04)',
        'card-md': '0 4px 12px 0 rgba(0,96,122,0.10), 0 2px 4px -1px rgba(0,96,122,0.06)',
        'card-lg': '0 8px 24px 0 rgba(0,96,122,0.13), 0 4px 8px -2px rgba(0,96,122,0.08)',
        'modal':   '0 20px 60px 0 rgba(0,31,42,0.22)',
      },
      colors: {
        // Pantone 3035 C — dark teal, structural / sidebar
        brand: {
          50:  '#f0f9fb',
          100: '#d0eef5',
          200: '#a1dded',
          300: '#5fc6e0',
          400: '#2aadc8',
          500: '#00607A',
          600: '#005168',
          700: '#004055',
          800: '#003040',
          900: '#001f2a',
        },
        // Pantone Process Blue C — bright blue, CTAs / highlights
        azure: {
          50:  '#f0f7ff',
          100: '#d0eaf8',
          200: '#a1d5f0',
          300: '#5ab8e6',
          400: '#1e9dd7',
          500: '#0085CA',
          600: '#006fab',
          700: '#00568a',
          800: '#003f6a',
          900: '#002a47',
        },
      },
    },
  },
  plugins: [],
};
