/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#0E172A",
        secondary: {
          DEFAULT: "#BE185D",
          light: "#db2777",
          dark: "#9d174d",
        },
        brand: {
          400: "#f472b6",
          500: "#BE185D",
          600: "#9d174d",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-hover": "0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(190,24,93,0.4)",
        "brand-glow": "0 0 20px rgba(190,24,93,0.4), 0 0 60px rgba(190,24,93,0.15)",
        "btn-glow": "0 4px 15px rgba(190,24,93,0.5)",
      },
    },
  },
  plugins: [],
};
