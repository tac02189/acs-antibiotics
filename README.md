# ACS Antibiotic Guide

Bedside reference for the **MU Health Acute Care Surgery Antibiotic Surgical Prophylaxis and Empiric
Treatment Practice Management Guideline** (review date October 2026), built for emergency physicians
and residents looking up what the surgical services' guideline calls for — the preferred antibiotic,
its dose, the alternative if the patient is allergic to it, and the duration — by indication, on a
phone.

Live: https://acs-antibiotics.web.app

> **Status.** v0.8.0 (2026-10-16) moved the app to the October 2026 edition, a different document
> from the December 2025 one it was built on. Every value was transcribed from the new PDF, and the
> verifier re-checks all of it on every build (see *Verification* for what it cannot: labels, aliases,
> drug metadata and whether the PDF is right). Codex checked the new transcription against the
> PDF's page images (`docs/reviews/2026-10-16-codex-v080-pdf-review.md`). That is a transcription
> check, not clinical verification, so the "pending physician verification" banner is shown again
> until a physician has read the new transcription.

## What it covers

| View | Source pages | Content |
|---|---|---|
| Indications | 2–4 | The four PMG tables — Trauma, Emergency General Surgery and Elective Surgery (surgical prophylaxis) and Empiric Therapy (acute infections) — 40 rows, searchable, with an **Allergy** toggle that highlights the PMG's "Alternative Antibiotic(s) if Allergy to Preferred" column. The PDF's rows name drugs only; the dose beside each drug is looked up in the dosing table for the row's section, and the app says so |
| Open fractures | 5 | 30-minute ED timing, Gustilo-Anderson classification, regimen by type with each penicillin-allergy regimen under its type, contamination, duration |
| Dosing | 3–4 | The surgical-prophylaxis dosing and OR-redosing table with the re-dosing rules beside it, and the empiric dosing table with its adult / normal-renal-function footnote |
| By drug | — | Every agent the PMG names: the rows that prefer it, the rows whose allergy column names it, its open-fracture regimens, its dosing-table rows |
| Source | 1, 6–8 | The PDF itself (cached offline), what was changed or could not be verified, the introduction and the 35 references |

The December 2025 edition's fever-workup flowchart, pediatric dosing, debridement and femoral-shaft
rules and antibiogram pages are not in the October 2026 edition, and went from the app with it.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # data-shape, search and routing tests + the verifier's planted-error controls
npm run verify     # re-check src/data/pmg.js against the PDF in public/ (source.file)
npm run build      # test → verify → vite build (any failure stops the build)
npm run deploy     # build, then firebase deploy --only hosting
```

Node 22 or newer. Deploying needs the Firebase CLI, which is not a project dependency: install it once
per machine with `npm install -g firebase-tools` and sign in with `firebase login` (interactive). The
portfolio's root `CLAUDE.md` records where that credential lives and why. Browser previews inside Claude
Code use `.claude/launch.json`
(`acs-antibiotics-dev` on 5173, `acs-antibiotics-preview` on 4173, both through the absolute
`node.exe` wrapper — see the root `CLAUDE.md`, Machine Portability Rule 3).

## Architecture

React 18 + Vite 5, Tailwind 3, lucide-react, vite-plugin-pwa (Workbox). No router dependency:
`src/lib/route.js` is a hash router (`#/`, `#/i/<indication>`, `#/s/<section>`, `#/fractures`,
`#/dosing`, `#/drugs/<Drug>`, `#/source`). No Firebase SDK — Hosting only. Fonts
(Source Sans 3, JetBrains Mono) are self-hosted via `@fontsource` so the app is fully usable
offline once installed.

**Design** (v0.6.0): the look shared by the [Pediatric CPG](https://pediatric-cpg.web.app) and
[MUHC Antibiogram](https://muhc-antibiogram.web.app) apps, at Thiago's request — a Mizzou-black
brand bar with gold accents, a light slate canvas, white cards with hairline borders, Source Sans 3
throughout with JetBrains Mono for doses, teal links, amber / rose / emerald tone cards, and a bottom
thumb bar on phones — plus two things of this app's own, chosen on 2026-10-07 from three variants
built independently by Claude, Codex and Gemini (`docs/design/`): every medication sits on a **dose
plate**, Mizzou black with the drug in white and the dose in gold mono, so the regimen is the first
thing the eye lands on; and each section of the indication list runs a 4px **spine** in its own hue
down its left edge, with the section title stuck under the search bar while its rows scroll. Each
indication is its own card. The sections start collapsed, and tapping a section's title opens or
collapses it (starting a search opens every section with a match, and a link to an indication
opens its section). The
sticky black header holds the search field, the gold Allergy pill and, from 640px, the tab row.
Light is the default; a sun/moon button in the brand bar switches to a dark slate scheme under the
same bar and the same black plates, remembered on the device. Every colour is a theme token, and a
test keeps fixed colours out of the components and checks contrast for the pairs they use. Every
font size is a step of one short scale (11–36px), which a test checks in the source. Numbers are
kept on the same line as their units. Print flips to white in either scheme, plates included. The
project `CLAUDE.md` lists the invariants (what was borrowed from which app, the plate and the spine,
no animation beyond expand/collapse, no invented labels, how the two schemes are kept in step, the
type scale).

```
src/data/pmg.js          ← every clinical value, transcribed from the PDF (read its header comment)
src/lib/dosing.js        ← the dose shown beside a drug on an indication row: a lookup in the matching dosing table (the empiric one for a drug the prophylaxis table does not list)
src/lib/search.js        ← tokenised AND search over names, aliases, drugs, brands, dose lines, alternatives
src/lib/route.js         ← hash routing
src/lib/theme.js         ← light/dark switch (index.html applies the saved scheme before first paint)
src/lib/text.js          ← display-only no-break spaces: a number stays with its unit
src/index.css            ← both colour schemes as CSS variables, plus print
src/components/*         ← one file per view, Header / BottomNav / Footer / VerificationNotice (rendered again since v0.8.0), plus shared.jsx (cards, groups, section heads, tone cards, dose plates and pills) and PdfButton / PdfCanvasViewer (the in-app PDF viewer)
scripts/verify-pmg.mjs   ← PDF ⇄ data verification (below)
scripts/gen-icons.mjs    ← regenerates public/*.png from assets/icon-source.png (Thiago's artwork)
tests/pmg.test.js        ← shape, labels, the dose lookup, the open-fracture route, search, routing
tests/theme.test.js      ← no fixed colours in components; both schemes complete and legible
tests/type.test.js       ← every font size is a step of the type scale
tests/text.test.js       ← the no-break helpers change only spaces, for every string in the data
tests/verify-controls.test.js ← 107 planted errors the verifier must catch
docs/reviews/             ← peer reviews, verbatim, with dispositions
public/MU-ACS-Antibiotic-PMG-2026-10-<hash>.pdf ← the source, served and precached (filename carries its sha256 prefix)
```

### Phone layout and spacing (v0.4.0)

Moved from the project `CLAUDE.md` on 2026-10-07: the per-element description of the v0.4.0 spacing
pass and its measurements against v0.3.1. `CLAUDE.md` keeps only the layout invariants to re-check.
v0.5.0 restyled the app later the same day (see *Design* above), so this describes v0.4.0 as built;
the field layout, the N/A placeholder box, the search field's clear button, `text-wrap: pretty` and
the 11px nav labels carried over, the notice and the "plus" connector were redrawn.

- **Phone spacing (v0.4.0).**
  - The Duration, Redose and alternative fields, and the open-fracture durations, put the label above
    the value below `sm`, so the value gets the card's full width. From `sm` up they sit side by side,
    each label on its value's baseline.
  - A section header gives its title the whole row; the count chip sits at the end of the blurb, or
    beside the title while searching (under it when both do not fit).
  - The verification notice is in the sans face.
  - N/A cards hold an empty box where the chevron would be, so page chips line up down the list.
  - The search field hides the browser's own clear button, which showed a second ✕ while typing. It
    reserves room on the right for the app's ✕ only while that is shown (`pr-12`, otherwise `pr-3`),
    and ends a cut-short placeholder in an ellipsis.
  - The "plus" connector carries its own spacing, evenly above and below; regimen lists add none.
  - `text-wrap: pretty` on `body` makes a lone last word less likely in Chrome 117+ and Safari 26+;
    other browsers wrap as before.
  - Bottom-nav labels are 11px with tight tracking.
  - Measured with headless Chrome 154 on 2026-10-06, against a rebuild of v0.3.1. These cannot be
    reproduced from the source alone:
    - no horizontal scroll at 320, 360, 375 or 768px, in either scheme;
    - the notice takes two lines at 360 and 375px, down from three;
    - an Appendicitis Duration value took seven lines in the old 6.5rem column;
    - "Indications" (51px bold) fits its 53px nav cell at 320px;
    - the tab row is 731px of 744 at 768px and up.

## Verification — how the data is tied to the PDF

`scripts/verify-pmg.mjs` re-reads the PDF with pdf.js and checks `src/data/pmg.js` against it in
**both directions**. It was rewritten for the October 2026 edition (v0.8.0).

0. **Source binding.** The PDF in `public/` must hash to `source.sha256`, carry that hash in its
   filename, and have `source.pages` pages; every page's running header must carry
   `source.reviewDate`; page 1 must be the title and the four introductory paragraphs, whole and in
   order, and nothing else.
1. **Indication tables (pages 2–4).** Rows **and** columns are rebuilt from the tables' own cell
   borders (thin filled rectangles in the PDF's drawing operators), so a cell is read only from the
   cell it is printed in. Every PDF row must match exactly one data entry and vice-versa (a
   bijection), on the data's page, under the printed section title the data names, below that
   section's four printed column headers; the preferred, alternative and duration cells must equal
   the data after normalisation (case, whitespace, dashes, `2 g` = `2g`). A section's `kind`, which
   picks the dosing table its doses come from, must be the one its printed title names.
2. **Dosing tables (pages 3–4).** Both rebuilt from their borders; every cell of every row, the
   headers and the titles must equal the data exactly, comparison signs included. Word draws page
   3's "≥ 120 kg" as an underlined ">": the underline is a rectangle of its own, which the reader
   finds and turns into "≥", so the data must say "≥". The empiric table is printed as two halves
   side by side, then a row of dashes, then its footnote; all three are checked.
3. **Re-dosing rules (page 3).** The two headed lists left of the prophylaxis table, each compared as
   an ordered list.
4. **Open fractures (page 5).** The Gustilo-Anderson table rebuilt from its borders; the timing rule
   anchored between its heading and the next one; the selection and contamination bullets compared
   as ordered lists **with their levels**, so each "If penicillin allergy" sub-bullet is bound to the
   bullet it is printed under; the durations. The regimen the app displays must re-state the printed
   bullet exactly once the route is set aside (the PDF prints no route there; the app shows IV for
   every drug, at Thiago's direction, which `tests/pmg.test.js` pins).
5. **References (pages 6–8).** All 35 as one run, in order, from the "Reference" heading to the end of
   page 8, each page's running header excluded; every URL in the data must be a link annotation on
   the page its reference starts on.

Word splits a word into two text items where its formatting changes ("Metronidazol" in bold, then
"e 500 mg"); the reader joins items with a space only where the PDF has one, so the text it compares
is the text a reader sees.

It fails outright when the structure it finds is not the PDF's (14 + 6 + 6 + 14 rows, 8 and 19 dosing
rows, 3 fracture types with 3 subtypes, 35 references…), so a thin or empty dataset cannot print PASS.
`tests/verify-controls.test.js` corrupts copies of the data 107 different ways — a changed or reordered
drug, a dropped partner, per-drug alternatives swapped, an "or" choice turned into a combination, the
cefazolin "≥" read as ">", a redosing interval changed, rows swapped across the empiric table's two
halves, a footnote cut short, an allergy regimen moved to the other fracture type, a whole regimen
held in the dose field, a section's dosing table flipped, a reference out of order, a DOI digit… —
and asserts each is caught with an error that names the right thing, and that each mutation actually
changed something. **Re-run them after any edit to the verifier.** A verifier that cannot be shown to
fail is not evidence; the first version of this one passed 38 of 38 planted wrong-data edits in the
2026-10-06 peer review (`docs/reviews/`), which is why it works this way.

**What this does not cover:** the dose the app shows beside a drug on an indication row (the PDF's rows
name drugs only; `src/lib/dosing.js` looks each one up in the matching dosing table, or in the empiric table for a drug the prophylaxis table does not list, and
`tests/pmg.test.js` tests the lookup), the `short` display labels (a test checks they use only words
from the PDF row name, keep its negations and are unique) and `aliases` (search hints), the
app-authored brand/class table, and — above all — whether the PDF itself is right. The Source page
lists the places where the document disagrees with itself so a physician can look at them.

## Deploy

Firebase Hosting, project and site `acs-antibiotics`, canonical URL https://acs-antibiotics.web.app.
`npm run deploy` runs the tests and the verifier before building. After deploying, compare the live
`index-*.js`, CSS and `sw.js` hashes with `dist/` — "Deploy complete" is not verification.
`firebase.json` has no rewrites at all: the app is hash-routed, so `/` is the only server path that is
ever real, and a missing asset 404s instead of being answered with HTML that a service worker could
cache under an asset URL.

## Annual update

1. Replace the PDF in `public/` (delete the old one), naming it with the first 12 hex digits of its
   `sha256sum`; update `source.file`, `source.sha256`, `source.pages` and `source.reviewDate` in
   `src/data/pmg.js`.
2. Re-transcribe what changed, with the rendered pages open beside the extracted text
   (`docs/reviews/2026-10-08-pdf-crosscheck/render.mjs` renders pages through headless Chrome; pass it
   a Windows-style folder path, or every page times out).
3. `npm run verify` — fix every disagreement it reports. If a table moved, adjust `REGIONS` in
   `scripts/verify-pmg.mjs` and re-run the controls; if the document was restructured, as in October
   2026, the verifier and its controls are rewritten with it.
4. Render the banner (`src/components/VerificationNotice.jsx`, from `App.jsx` under `<Header />`)
   until a physician has read the transcription against the new PDF, then remove it at their word and
   note the sign-off in `CLAUDE.md`.
5. `npm run deploy`, tag.
