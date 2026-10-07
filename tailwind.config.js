/** @type {import('tailwindcss').Config} */

// Every colour is a theme token: an RGB-triplet CSS variable defined for both
// schemes in src/index.css. Components never use fixed palette colours
// (text-white, text-slate-500, bg-black…), because those cannot change with the
// theme; tests/theme.test.js fails the build if one appears.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // One workhorse face, as in the Pediatric CPG app: headings differ by
        // weight, not family. JetBrains Mono for doses, as in the Antibiogram.
        sans: ['"Source Sans 3 Variable"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Page surfaces
        paper: token("paper"),
        card: token("card"),
        well: token("well"),
        chip: token("chip"),
        // The brand bar: Mizzou black in both schemes, as in the Antibiogram
        // and the Pediatric CPG. Its own text and field colours live here.
        bar: {
          DEFAULT: token("bar"),
          raised: token("bar-raised"),
          well: token("bar-well"),
          "well-hi": token("bar-well-hi"),
          line: token("bar-line"),
          rule: token("bar-rule"),
          text: token("bar-text"),
          soft: token("bar-text-soft"),
          muted: token("bar-text-muted"),
        },
        // Text, strongest to quietest. faint is decoration only (chevrons,
        // dots, dividers): it does not reach 4.5:1 on the page surfaces.
        ink: token("ink"),
        prose: token("prose"),
        soft: token("soft"),
        muted: token("muted"),
        faint: token("faint"),
        // Lines: rule for cards, rule-soft for row dividers, rule-strong for
        // control boundaries (3:1 on every page surface)
        rule: {
          DEFAULT: token("rule"),
          soft: token("rule-soft"),
          strong: token("rule-strong"),
        },
        // Mizzou gold: the brand bar's accents, the switched-on Alternatives
        // pill and the active navigation mark. deepgold is the gold that reads
        // on a light surface (icons and 2px marks, never body text).
        gold: token("gold"),
        deepgold: token("deepgold"),
        "on-gold": token("on-gold"),
        // Teal: links, interactive text, solid buttons and the focus ring
        accent: {
          DEFAULT: token("accent"),
          hi: token("accent-hi"),
          fill: token("accent-fill"),
          "fill-hi": token("accent-fill-hi"),
          soft: token("accent-soft"),
          line: token("accent-line"),
        },
        "on-accent": token("on-accent"),
        // Tones, each a wash, a line, an ink and a mark (its label and icon
        // colour), after the Pediatric CPG's warning / danger / success cards.
        warn: {
          bg: token("warn-bg"),
          line: token("warn-line"),
          ink: token("warn-ink"),
          mark: token("warn-mark"),
        },
        danger: {
          bg: token("danger-bg"),
          line: token("danger-line"),
          ink: token("danger-ink"),
          mark: token("danger-mark"),
        },
        good: {
          bg: token("good-bg"),
          line: token("good-line"),
          ink: token("good-ink"),
          mark: token("good-mark"),
        },
        // Section hue, set per <section> via --hue: the dot beside a section
        // label, nothing else
        hue: token("hue"),
      },
    },
  },
  plugins: [],
};
