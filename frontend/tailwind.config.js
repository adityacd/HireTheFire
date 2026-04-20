/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-hover": "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(99,102,241,0.3)",
        "brand-glow": "0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)",
        "btn-glow": "0 4px 15px rgba(99,102,241,0.5)",
      },
    },
  },
  plugins: [],
};
