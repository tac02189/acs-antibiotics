/** @type {import('tailwindcss').Config} */

// Every colour is a theme token: an RGB-triplet CSS variable defined for both
// schemes in src/index.css. Components never use fixed palette colours
// (text-white, text-cyan-400, bg-black…), because those cannot change with the
// theme; tests/theme.test.js fails the build if one appears.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

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
        // Surfaces
        paper: token("paper"),
        card: token("card"),
        well: token("well"),
        readout: token("readout"),
        lcd: token("lcd"),
        bar: token("bar"),
        sunk: token("sunk"),
        // Text, strongest to quietest
        ink: token("ink"),
        prose: token("prose"),
        soft: token("soft"),
        muted: token("muted"),
        // Lines
        rule: token("rule"),
        rulestrong: token("rule-strong"),
        // Cyan accent: labels, links, icons; "hi" for active and hover
        accent: {
          DEFAULT: token("accent"),
          hi: token("accent-hi"),
          fill: token("accent-fill"),
          "fill-hi": token("accent-fill-hi"),
        },
        "on-accent": token("on-accent"),
        // Emerald readout: dose numerals, and the few labels that share them
        dose: token("dose"),
        // Hazard amber marks the alternative column, footnote marks, the
        // "plus" connectors and the focus ring. hazard-amber and gold are the
        // same token. The switched-on Alternatives control is a bright fill in
        // both schemes (black text on it), so hazard-fill stays fixed.
        gold: token("gold"),
        "hazard-amber": token("gold"),
        "hazard-ink": token("hazard-ink"),
        "hazard-edge": token("hazard-edge"),
        "hazard-edge-dim": token("hazard-edge-dim"),
        "hazard-fill": "#FFD600",
        deepgold: token("deepgold"),
        "signal-red": token("signal-red"),
        "signal-violet": token("signal-violet"),
        // Washes, always used with an alpha
        "tint-amber": token("tint-amber"),
        "tint-red": token("tint-red"),
        "tint-cyan": token("tint-cyan"),
        // Section hue, set per <section> via --hue
        hue: token("hue"),
        // The verification notice: the same amber in both schemes
        "amber-bg": token("amber-bg"),
        "amber-ink": token("amber-ink"),
        "amber-line": token("amber-line"),
      },
      boxShadow: {
        card: "var(--shadow-card)",
        dock: "var(--shadow-dock)",
        readout: "var(--glow-readout)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-amber": "var(--glow-amber)",
        "glow-red": "var(--glow-red)",
      },
    },
  },
  plugins: [],
};
