/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // we'll use class strategy for dark mode (or let tailwind infer from media)
  theme: {
    extend: {},
  },
  plugins: [],
}
