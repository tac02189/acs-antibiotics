# ACS Antibiotic Guide — design notes (variant: Claude)

One of three independent redesign attempts (Claude, Codex, Gemini) from the same brief, 2026-10-07.
The brief: professional, MU-themed; diagnoses more obviously distinct from one another; the
medications and dosing stand out.

## Direction

Keep the house look the Pediatric CPG and Antibiogram apps share (black brand bar, light slate
canvas, white hairline cards, Source Sans 3 and JetBrains Mono, the Peds tone cards, light default
with an opt-in dark scheme) and add two things of this app's own:

- **The dose plate.** Mizzou black with the drug name in white and the dose, route and frequency
  in gold mono: the brand bar's own colours, spent on the one thing the reader came for. Every
  medication in the app sits on a plate. A collapsed row shows one small plate per drug,
  `[Cefazolin 2 g Q8H] + [Metronidazole 500 mg Q12H]`; the expanded row's Regimen, the
  open-fracture regimens, the dosing table's adult and pediatric cells and the By-drug lists all use
  the same surface, so a medication reads the same way wherever it appears. Gold is only legible as
  text on black (3.3:1 on white), which is why the plate is black in both schemes; in dark it gets a
  slate-600 edge so it still reads as a plate on a slate-800 card.
- **The section spine.** Each of the four sections runs a 4px rule in its own hue down the left
  edge of its head and of its list, and the section head (title 18px bold, count and page on the
  right) sticks just under the brand bar while its rows scroll past. The hues are a step deeper
  than before in light (rose/amber/sky/violet 600 instead of 500) so a 4px rule carries them.

Within a section, rows are set apart by a stronger divider (`rule` instead of `rule-soft`), a
16px bold title, a little more height, and the plates themselves, which give the list a regular
title-then-plate rhythm.

## What changed

- `src/index.css`: five `plate*` tokens in both schemes; light hues deepened to the 600s; the print
  block keeps a plate as an outlined box and un-sticks the section heads.
- `tailwind.config.js`: the `plate` colour family.
- `src/components/shared.jsx`: `Plate`, `DosePlate`; `Regimen` and `OrderLine` render on a plate
  (16px name, 16px gold mono dose, "plus" in the soft grey); `RegimenInline` renders pills, wrapping
  as units with the "+" attached to the pill it introduces, and now shows route, note and footnote
  marks when a regimen has them (the open-fracture regimens in By drug); `SectionHead` replaces
  `SectionLabel` (spine, sticky option); `Group` takes `spine`; dividers are `rule`.
- `IndicationsView.jsx`: sticky section heads with the spine, pill summaries, 16px titles, Field
  values in medium ink, `scroll-mt-12` on rows so a deep link lands under the stuck head.
- `DosingView.jsx`, `DrugsView.jsx`: dose cells on plates; 18px drug titles.
- `OpenFracturesView.jsx`: regimens on plates; the trauma spine on the "Antimicrobial by type"
  card. `FeverWorkupView.jsx`: the page hue's spine on the three branch cards.
- `tests/theme.test.js`: four pairs added to the contrast matrix (plate-ink, plate-soft and
  plate-dose on the plate at 4.5:1; the focus ring on the plate at 3:1). Nothing removed or
  loosened.

Nothing in `src/data/pmg.js`, `src/lib`, `src/main.jsx`, `scripts/`, `vite.config.js` or
`index.html` changed. Behaviour, routes, ids, the Alternatives semantics and the verification
notice are as they were.

## How the goals are met

1. **Medications and dosing stand out.** The plate is the highest-contrast object on every
   screen: 19:1 white names and 11.6:1 gold doses on black, against a page whose other text is
   slate on white. On the home list the plates are what the eye picks out while scrolling; on the
   Dosing page the whole table is plates.
2. **Diagnoses and sections are distinct.** Section = hue spine + sticky head; row = 16px bold
   title, stronger divider, its plates. Scrolling the Trauma list shows a rose rule down the left
   the whole way, and "Trauma 12 · p.1" stays pinned under the search field until the Emergency
   General Surgery head pushes it off.
3. **Professional and MU-themed.** Black and gold are used exactly where the brand uses them (the
   bar, the active tab mark, now the plate); everything else stays the quiet slate-and-white
   reference look. No new fonts, no gradients, no motion beyond the expand/collapse.

## Checked

- `npm test` (83 tests) and `npm run build` green.
- In the preview at 375px, light and dark: home, the expanded Abdominal trauma row, Dosing, Open
  fractures, By drug (Cefazolin). No console errors. Plates and pills wrap without horizontal
  scroll; "Pharmacy to dose Pharmacy to dose" wraps inside its pill.
- Still to check at 320, 360 and 768px and with enlarged text (headless captures to follow).

## For a human to look at

- Whether gold-on-black mono at 13px (the pills) is comfortable under bright ED lighting on a
  real phone; the expanded plate's 16px doses are the fallback size if not.
- Whether 34 black plates on the home list feel heavy. The alternative within this direction is to
  keep the plate only for the expanded Regimen and the Dosing page, and set the collapsed pills as
  outlined chips with gold doses on black only for the dose token.
- The sticky section head costs ~44px of a 812px screen while scrolling a section.
