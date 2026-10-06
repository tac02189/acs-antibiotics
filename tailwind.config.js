/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"IBM Plex Sans"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Theme tokens live in src/index.css as CSS variables so that light and
        // dark are one stylesheet. Tailwind only exposes them by name here.
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        deepgold: "rgb(var(--deepgold) / <alpha-value>)",
        hue: "rgb(var(--hue) / <alpha-value>)",
      },
      boxShadow: {
        card: "0 1px 0 rgb(var(--ink) / 0.06), 0 8px 24px -16px rgb(var(--ink) / 0.35)",
      },
    },
  },
  plugins: [],
};
