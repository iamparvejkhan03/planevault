/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000',
        // primary: '#0033FF',
        secondary: '#666666',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}

