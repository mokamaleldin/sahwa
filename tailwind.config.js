/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#752026',
          dark: '#350E15',
          gold: '#D6AD63',
          accent: '#D6AD63',
          background: '#F2E9E2',
          paper: '#F2E9E2',
          muted: '#765C5E',
          line: '#DCCDC7',
        },
      },
      fontFamily: {
        heading: ['Milan Display', 'Milan Display Black', 'IBM Plex Sans Arabic', 'sans-serif'],
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
        body: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
