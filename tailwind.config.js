/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: true,
  variants: {
    width: ['responsive', 'hover', 'focus'],
  },
  plugins: [require('tailwind-scrollbar'), require('@tailwindcss/line-clamp')],
};