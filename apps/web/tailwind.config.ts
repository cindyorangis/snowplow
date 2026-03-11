/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0a1628',
          blue: '#0078D4',
          ice: '#e0f2fe',
        },
      },
    },
  },
}
