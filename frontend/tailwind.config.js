/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '200': '200px',
        '150': '150px',
      },
      height: {
        '200': '200px',
        '150': '150px',
      },
      maxWidth: {
        '8xl': '90rem',
        '9xl': '95rem',
      },
      screens: {
        '3xl': '1920px', // or any width you want for 3xl
      },
      colors: {
        primaryText: '#1D1128', // Custom text color
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // Custom font
        nunito: ['Nunito Sans', 'sans-serif'],
      },
      scale: {
        '101': '1.01',
        '102': '1.02',
        '103': '1.03',
        '104': '1.04',
      }
    },
  },
  plugins: [],
}