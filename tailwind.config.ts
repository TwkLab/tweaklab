import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        twk: {
          bg: "#050605",
          surface: "#0A0D0A",
          card: "#0F140F",
          "card-hover": "#151C15",
          border: "#1C261C",
          "border-subtle": "#121A12",
          "border-glow": "#00FF8844",
          green: "#00FF88",
          "green-hover": "#00D976",
          "green-dark": "#009E52",
          text: "#F5F7F5",
          muted: "#9CA3AF",
          dim: "#6B7280",
          cyber: "#00E5FF",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      boxShadow: {
        "twk-glow": "0 0 25px -5px rgba(0, 255, 136, 0.25)",
        "twk-glow-sm": "0 0 14px -3px rgba(0, 255, 136, 0.3)",
        "twk-glow-lg": "0 0 50px -10px rgba(0, 255, 136, 0.35)",
        "twk-card": "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "Consolas",
          "Monaco",
          "Courier New",
          "monospace",
        ],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle at 1px 1px, rgba(0, 255, 136, 0.05) 1px, transparent 0)",
        "matrix-gradient": "linear-gradient(to bottom, rgba(0, 255, 136, 0.03), transparent)",
        "hero-radial": "radial-gradient(circle 800px at 50% -100px, rgba(0, 255, 136, 0.12), transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;

