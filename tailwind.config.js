/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Chakra Petch: geometric, chamfered display face in the spirit of
        // monitor and defibrillator UIs. Barlow: low-contrast grotesque for
        // clinical prose. IBM Plex Mono: tabular numerals for doses.
        display: ['"Chakra Petch"', '"Barlow"', "system-ui", "sans-serif"],
        sans: ['"Barlow"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Theme tokens live in src/index.css as CSS variables. Tailwind only
        // exposes them by name here.
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        well: "rgb(var(--well) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        rulestrong: "rgb(var(--rule-strong) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        deepgold: "rgb(var(--deepgold) / <alpha-value>)",
        hue: "rgb(var(--hue) / <alpha-value>)",
        "hazard-amber": "#FFD600",
        "signal-red": "#FF453A",
        "signal-teal": "#00E5FF",
        "signal-blue": "#38BDF8",
        "signal-violet": "#C084FC",
      },
      boxShadow: {
        card: "0 0 0 1px rgb(var(--rule)), 0 4px 20px -2px rgba(0, 0, 0, 0.7)",
        "glow-cyan": "0 0 16px rgba(0, 229, 255, 0.35)",
        "glow-amber": "0 0 16px rgba(255, 214, 0, 0.4)",
        "glow-red": "0 0 16px rgba(255, 69, 58, 0.4)",
      },
    },
  },
  plugins: [],
};
