/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["IBM Plex Mono", "monospace"],
        display: ["Orbitron", "sans-serif"],
        mono:    ["IBM Plex Mono", "monospace"],
      },
      colors: {
        primary:   "#080c10",
        mint:      { DEFAULT: "#00ffaa", dim: "#00cc88", dark: "#007a52" },
        purple:    { DEFAULT: "#7b5ea7", light: "#9d7ec9", dark: "#5a4480" },
      },
      boxShadow: {
        glass:       "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,255,170,0.04)",
        "glass-hover":"0 16px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,255,170,0.08), 0 0 0 1px rgba(0,255,170,0.25)",
        "brand-glow":"0 0 20px rgba(0,255,170,0.3), 0 0 60px rgba(0,255,170,0.1)",
        "btn-glow":  "0 4px 15px rgba(0,255,170,0.35)",
      },
    },
  },
  plugins: [],
};
