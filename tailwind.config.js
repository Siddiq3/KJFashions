/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f0',
          100: '#fbe8df',
          500: '#c0522a',
          600: '#a8431f',
          700: '#8c3519',
        },
        gold: {
          400: '#f5c842',
          500: '#e6b800',
        },
        store: {
          dark: '#1a0a00',
          cream: '#fdf8f3',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(26, 10, 0, 0.09)',
      },
    },
  },
  plugins: [],
};
