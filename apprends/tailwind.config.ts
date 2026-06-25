import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        french: {
          blue:   "#002395",
          white:  "#FFFFFF",
          red:    "#ED2939",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "flame-pulse": "flame 1.5s ease-in-out infinite",
        "slide-up":    "slideUp 0.3s ease-out",
        "fade-in":     "fadeIn 0.4s ease-out",
        "bounce-in":   "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "confetti":    "confetti 1s ease-out forwards",
      },
      keyframes: {
        flame: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%":      { transform: "scale(1.15) rotate(2deg)" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0.3)",   opacity: "0" },
          "50%":  { transform: "scale(1.05)" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)",     opacity: "1" },
        },
        confetti: {
          "0%":   { transform: "translateY(-10px) rotate(0deg)",   opacity: "1" },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
