import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F2F6FB",
          100: "#E3EBF6",
          200: "#C7D7EC",
          300: "#A1BBDD",
          400: "#7297C8",
          500: "#4F76AC",
          600: "#395C90",
          700: "#2B4877",
          800: "#1B3A6B",
          900: "#142C52",
          950: "#0C1B33",
          DEFAULT: "#1B3A6B",
        },
        accent: {
          50: "#FEF4F0",
          100: "#FDE5DE",
          200: "#FAC8BA",
          300: "#F5A28B",
          400: "#EF7150",
          500: "#E8401C",
          600: "#CF3212",
          700: "#AC2A10",
          800: "#8A2410",
          900: "#712112",
          DEFAULT: "#E8401C",
        },
        // Teintes sombres "asphalte" pour la landing
        asphalt: {
          950: "#080A0D",
          900: "#0B0E13",
          850: "#0F131A",
          800: "#141922",
          700: "#1B212C",
          600: "#232B38",
          500: "#323C4C",
        },
        surface: "#F8FAFC",
        ink: "#0F172A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 6px rgba(15, 23, 42, 0.05)",
        raised:
          "0 2px 4px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(15, 23, 42, 0.08)",
        modal:
          "0 4px 8px rgba(15, 23, 42, 0.08), 0 20px 60px rgba(15, 23, 42, 0.2)",
        glow: "0 10px 40px -8px rgba(232, 64, 28, 0.55)",
        "glow-sm": "0 6px 22px -6px rgba(232, 64, 28, 0.5)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(200%)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        "sweep": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out both",
        marquee: "marquee 32s linear infinite",
        "marquee-slow": "marquee 55s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        sweep: "sweep 14s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
