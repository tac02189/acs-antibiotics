# Codex peer review — v0.8.4, 2026-10-20

The required review before the v0.8.4 commit. It is single-engine (Codex), and it is not clinical
verification; no clinical content changed. Thiago asked: "make the dark mode background black;
adjust other colors if needed", then "keep it, review and deploy" after the screenshots. The
dark token block in `src/index.css` moved from slate to a black canvas with neutral greys.

- **How it ran.** Through the `codex-review` agent: `codex exec`, `gpt-6-astra`, reasoning effort
  high, Codex v0.162.1, header `sandbox: read-only`, run from the session scratchpad. The packet
  went in on stdin; Codex's log shows three shell commands, all arithmetic.
- **The packet.** The uncommitted diff (`src/index.css`, `CLAUDE.md`, `docs/HISTORY.md`,
  `package*.json`) and the full text of `tailwind.config.js`, `tests/theme.test.js`, `index.html`,
  `src/lib/theme.js`, `vite.config.js`, `src/App.jsx` and all 13 files in `src/components/`, plus a
  README excerpt: 20 files, 3,659 numbered lines. The agent checked each file's line count and last
  line before sending; Codex reported the same total and the end marker, and its cited lines
  matched the tree.
- **What it reviewed** was the first version: chip 44 44 44, rule 51 51 51, rule-soft 40 40 40.
  The dispositions below describe what changed after it.

**Nothing below was dismissed.**

## Codex's findings (as relayed by the review agent, Codex's wording)

Codex found no failing text pair and no wrong contrast number.

1. **Low — Inner dividers become harder to distinguish.** `src/index.css:119–120`;
   `OpenFracturesView.jsx:22,85,98,111,115`; `shared.jsx:142`; `DrugsView.jsx:184`. The matrix
   omits decorative `rule` and `rule-soft` boundaries. The weakest case is the open-fracture
   sub-bullet's `border-rule-soft` when its background becomes the amber wash.

   | Boundary / adjacent surface | Old ratio | New ratio |
   |---|---:|---:|
   | `rule-soft` / amber wash | 1.293 | 1.016 |
   | `rule-soft` / card | 1.263 | 1.156 |
   | `rule-soft` / well | 1.541 | 1.424 |
   | `rule` / card | 1.413 | 1.349 |
   | `rule` / paper or well | 1.724 | 1.662 |

   The amber sub-bullet's neutral left border is now effectively indistinguishable by luminance.
   Indentation and the amber inset ring still provide other cues. The other reductions affect
   table/list separators, card outlines, and the bottom navigation's top border
   (`BottomNav.jsx:18`). These are visual regressions, not automatically WCAG failures for
   decorative lines.

2. **Low — Chips lose surface separation.** `src/index.css:104`; `SourceView.jsx:33,52`;
   `IndicationsView.jsx:204`. Chip / card 1.413 → 1.220; chip / paper 1.724 → 1.504. The Source
   icon tile and hash box blend more closely into their card. The Indications instruction aside
   also loses separation from the canvas. Their text remains readable.

3. **Low — README still describes the current theme as slate.** `README.md:71`: "Switches to a
   dark slate scheme" contradicts the new black/neutral palette.

4. **Low — The new documentation overstates removal of blue tint.** `src/index.css:92–93`;
   `CLAUDE.md:423–425`; `docs/HISTORY.md:830–834`. "Nothing on the page is tinted blue" is too
   broad: `--hue-elective` remains sky blue, RGB(56,189,248), rendered by section spines and
   By-drug markers. Describe base surfaces, text and neutral lines as no longer slate-tinted.

5. **Informational — Plate separation weakens in some contexts, while remaining adequate.**
   `src/index.css:145,149`; `shared.jsx:280`. Plate fill / card 1.291 → 1.108; plate edge / plate
   fill 5.240 → 4.781; plate edge / amber wash 4.157 → 3.792. Every plate still gets the inset
   edge, which exceeds 3:1 against those surfaces; edge / card improves 4.060 → 4.315, edge / well
   4.954 → 5.317. A visibility tradeoff, not a blocking defect.

Also reported fine: every quoted ratio recomputes and rounds correctly; `hover:bg-well` on a card
row becomes more distinguishable (1.220 → 1.232); `bg-card/70` over the amber and rose washes
improves every text pair on it; the bottom nav, the sticky section head under the bar (the phone
gold rule, the `bar-raised` tab row from `sm`), the PDF viewer, theme-color, the manifest and print
are consistent. Clinical flag, verbatim: "No clinical value changes appear in the diff. Existing
clinical examples in comments at `OpenFracturesView.jsx:5` and `shared.jsx:453–454,523` are flagged
without assessing their correctness." (Comments this diff does not touch.)

## Dispositions

1. **Fixed.** `rule` 51 → 56 (#383838) and `rule-soft` 40 → 46 (#2E2E2E). Now rule / card 1.453 and
   rule / paper 1.791 (old slate 1.413 and 1.724); rule-soft / card 1.255 and / well 1.546 (old
   1.263 and 1.541). Rule-soft on the amber wash is 1.103 (old 1.293): that sub-bullet's boundary
   when washed is its `ring-warn-line` inset ring, which the Allergy toggle adds with the wash.
2. **Fixed.** `chip` 44 → 56, the colour of `rule`, as slate-700 was both in the old dark block.
   Chip / card 1.453, chip / paper 1.791 (old 1.413 and 1.724). Text on the chip: soft 7.9, prose
   9.3, accent 7.9, accent-hi 9.3, focus 6.3.
3. **Fixed.** README now says "a black dark scheme".
4. **Fixed.** The `src/index.css` comment, `CLAUDE.md` and `docs/HISTORY.md` now say no surface,
   text or line is slate-tinted, and the comment adds that the section hues and tones keep their
   colours.
5. **Kept.** The plate stays #111 in both schemes (a UI invariant); its 1px edge is what sets it off
   the card, at 4.3:1.

The fixed values were not re-reviewed. `npm test` (158) and the contrast matrix pass with them, and
the preview showed them applied in dark at 375px.
