/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",  // Blue-500
        secondary: "#4f46e5", // Indigo-600
        accent: "#10b981",   // Emerald-500
        background: "#f9fafb", // Gray-50
        text: "#1f2937",     // Gray-800
      },
    },
  },
  plugins: [],
}
