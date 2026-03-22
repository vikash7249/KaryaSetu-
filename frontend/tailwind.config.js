/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EDEAFD', 100: '#C9C3F9', 200: '#A59CF5',
          300: '#8175F1', 400: '#5D4EED', 500: '#4A3BD6',
          600: '#3728BF', 700: '#2618A8',
        },
      },
    },
  },
  plugins: [],
};
