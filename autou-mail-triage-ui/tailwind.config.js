/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#0a9dff', 600: '#007dde', 700: '#0062b1' },
      },
      boxShadow: { card: '0 10px 20px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.08)' },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
}
