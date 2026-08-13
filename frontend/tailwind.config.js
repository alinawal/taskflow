/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F7F5',
        surface: '#FFFFFF',
        ink: '#14181F',
        muted: '#6B7280',
        border: '#E3E1DB',
        flow: {
          DEFAULT: '#3B4CCA',
          dark: '#2B3899',
          light: '#EEF0FD',
        },
        signal: {
          DEFAULT: '#E8A33D',
          light: '#FCF1DE',
        },
        moss: {
          DEFAULT: '#3F7D58',
          light: '#E7F2EB',
        },
        rust: {
          DEFAULT: '#C1462F',
          light: '#FBEAE6',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
