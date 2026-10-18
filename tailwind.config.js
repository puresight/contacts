/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Triad generated from seed #4f46e5 with chroma.js (OKLCH).
        // momentum = +240deg (teal) -> progress/completion
        momentum: {
          50: '#d3fcf0',
          100: '#bbf7e5',
          200: '#95ecd3',
          300: '#5fceb2',
          400: '#1eb193',
          500: '#009275',
          600: '#007a5e',
          700: '#006148',
          800: '#004934',
          900: '#003423',
          950: '#002113',
        },
        // attention = +120deg (burnt orange) -> alerts/unread/timers
        attention: {
          50: '#ffe6d6',
          100: '#ffd7c0',
          200: '#ffbf9f',
          300: '#ff9873',
          400: '#e4744a',
          500: '#c45223',
          600: '#a93800',
          700: '#8b2100',
          800: '#6c0d00',
          900: '#510000',
          950: '#370000',
        },
        // slate recolor: slate baseline tinted with ~5% primary purple (OKLCH)
        slate: {
          50: '#f5f7ff',
          100: '#ebeefb',
          200: '#e0e3f4',
          300: '#cacee4',
          400: '#a0a4bb',
          500: '#767a8f',
          600: '#5b5f71',
          700: '#434656',
          800: '#2d2f3d',
          900: '#1a1c29',
          950: '#0b0d17',
        },
      },
      boxShadow: {
        glow: '0 0 20px -3px rgb(79 70 229 / 0.08)',
        'glow-lg': '0 0 24px -4px rgb(79 70 229 / 0.22)',
      },
    },
  },
  plugins: [],
};
