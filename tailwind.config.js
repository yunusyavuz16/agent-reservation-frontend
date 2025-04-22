/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0078D4',
          dark: '#005a9e',
        },
        secondary: {
          light: '#f0f0f0',
          DEFAULT: '#e0e0e0',
          dark: '#c0c0c0',
        }
      }
    },
  },
  plugins: [],
}