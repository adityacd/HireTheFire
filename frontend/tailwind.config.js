/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#39FF14",
        "neon-dim": "#28b30e",
        dark: "#141a14",
        "dark-card": "#1a221a",
        "dark-border": "#243024",
      },
      boxShadow: {
        neon: "0 0 6px #39FF14, 0 0 20px #39FF1440",
        "neon-sm": "0 0 4px #39FF14, 0 0 10px #39FF1430",
        "neon-lg": "0 0 10px #39FF14, 0 0 40px #39FF1450",
      },
    },
  },
  plugins: [],
};
