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
        // Navy du logo Fiavo (quasi-noir, désaturé) — brand, texte, boutons
        primary: {
          50: "#F3F5F9",
          100: "#E4E9F1",
          200: "#C6D0E0",
          300: "#9FADC6",
          400: "#6B7C9C",
          500: "#485874",
          600: "#33405C",
          700: "#232F45",
          800: "#1A2338",
          900: "#121A2A",
          950: "#0B111D",
          DEFAULT: "#1A2338",
        },
        // Orange du logo Fiavo (#F26419) — accent, CTA, liens
        accent: {
          50: "#FEF4EC",
          100: "#FDE3D2",
          200: "#FAC5A2",
          300: "#F7A06B",
          400: "#F47F3A",
          500: "#F26419",
          600: "#DA5210",
          700: "#B54110",
          800: "#8F3413",
          900: "#742D14",
          DEFAULT: "#F26419",
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
        glow: "0 10px 40px -8px rgba(242, 100, 25, 0.55)",
        "glow-sm": "0 6px 22px -6px rgba(242, 100, 25, 0.5)",
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
