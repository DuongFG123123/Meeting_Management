/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Bật chế độ Dark Mode (dựa trên class)
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
