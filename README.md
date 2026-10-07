# ACS Antibiotic Guide

Bedside reference for the **MU Health Acute Care Surgery Antibiotic Practice Management Guideline**
(original publication date December 2025), built for emergency physicians and residents looking up
what the surgical services' guideline calls for — regimen, dose, frequency, duration, intra-operative
redosing and the penicillin-allergy alternative — by indication, on a phone.

Live: https://acs-antibiotics.web.app

> **Status: transcription pending physician verification.** Every value was transcribed from the
> source PDF and is re-checked against it mechanically on every build (see *Verification*), but no
> clinician has yet signed the transcription off. The app says so in a banner until that happens.

## What it covers

| View | Source pages | Content |
|---|---|---|
| Indications | 1–2 | The four PMG tables — Trauma, Emergency General Surgery, Elective Surgery, ICU & General Floor — 34 rows, searchable, with an **Alternatives** toggle that highlights the PMG's "PNC Allergy/Alternative" column (which also carries contamination escalation and MRSA add-ons, and is labelled as the PDF labels it) |
| Open fractures | 3–4 | 30-minute ED timing, Gustilo-Anderson classification, regimen by type and contamination, duration, debridement timing, femoral-shaft sequencing |
| Dosing | 4 | Adult (≥15 y) and pediatric dosing table for cefazolin, cefepime, metronidazole and vancomycin |
| Fever workup | 5 | The infectious-workup flowchart (suspected pneumonia / central line / UTI) as structured steps, plus the three NHSN reference-standard links |
| By drug | — | Every agent the PMG names: where it is first-line, where it is the alternative, its dosing-table row |
| Source | 1, 12 | The PDF itself (cached offline), what was corrected or could not be verified, the antibiogram pointer and the 13 references |

Pages 6–11 of the PDF reproduce the January–December 2024 antibiogram. The
[MUHC Antibiogram](https://muhc-antibiogram.web.app) app carries the newer 2025 dataset, so the
guide links there instead of duplicating superseded tables.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # data-shape, search and routing tests + the verifier's planted-error controls
npm run verify     # re-check src/data/pmg.js against public/MU-ACS-Antibiotic-PMG-2025-12.pdf
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
`#/dosing`, `#/workup`, `#/drugs/<Drug>`, `#/source`). No Firebase SDK — Hosting only. Fonts
(Source Sans 3, JetBrains Mono) are self-hosted via `@fontsource` so the app is fully usable
offline once installed.

**Design** (v0.5.0): the look shared by the [Pediatric CPG](https://pediatric-cpg.web.app) and
[MUHC Antibiogram](https://muhc-antibiogram.web.app) apps, at Thiago's request — a Mizzou-black
brand bar with gold accents, a light slate canvas, white cards with hairline borders, Source Sans 3
throughout with JetBrains Mono for doses, teal links, amber / rose / emerald tone cards, and a bottom
thumb bar on phones. The sticky black header holds the search field, the gold Alternatives pill and,
from 640px, the tab row. Light is the default; a sun/moon button in the brand bar switches to a dark
slate scheme under the same bar, remembered on the device. Every colour is a theme token, and a test
keeps fixed colours out of the components and checks contrast for the pairs they use. Every font size
is a step of one short scale (11–42px), which a test checks in the source. Numbers are kept on the
same line as their units. Print flips to white in either scheme. The project `CLAUDE.md` lists the
invariants (what was borrowed from which app, no animation beyond expand/collapse, no invented
labels, how the two schemes are kept in step, the type scale).

```
src/data/pmg.js          ← every clinical value, transcribed from the PDF (read its header comment)
src/lib/search.js        ← tokenised AND search over names, aliases, drugs, brands, alternatives
src/lib/route.js         ← hash routing
src/lib/theme.js         ← light/dark switch (index.html applies the saved scheme before first paint)
src/lib/text.js          ← display-only no-break spaces: a number stays with its unit
src/index.css            ← both colour schemes as CSS variables, plus print
src/components/*         ← one file per view, Header / VerificationNotice / BottomNav / Footer, plus shared.jsx (cards, groups, tone cards, order lines, PDF link)
scripts/verify-pmg.mjs   ← PDF ⇄ data verification (below)
scripts/gen-icons.mjs    ← regenerates public/*.png from assets/icon-source.png (Thiago's artwork)
tests/pmg.test.js        ← shape, search, routing
tests/theme.test.js      ← no fixed colours in components; both schemes complete and legible
tests/type.test.js       ← every font size is a step of the type scale
tests/text.test.js       ← the no-break helpers change only spaces, for every string in the data
tests/verify-controls.test.js ← 54 planted errors the verifier must catch
docs/reviews/             ← peer reviews, verbatim, with dispositions
public/MU-ACS-Antibiotic-PMG-2025-12-<hash>.pdf ← the source, served and precached (filename carries its sha256 prefix)
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
**both directions**:

0. **Source binding.** The PDF in `public/` must hash to `source.sha256`, carry that hash in its
   filename, and have `source.pages` pages.
1. **Indication tables (pages 1–2).** Row bands are rebuilt from the table's own horizontal cell
   borders and the seven columns from measured x-positions. Every PDF row carrying an indication
   name must match exactly one data entry and vice-versa (a bijection — the one cut-off label,
   "…Urologic Instr", is matched by its exact printed text and nothing else), every indication must
   sit on page 1 or 2, the section each row sits under (read from the PDF's own section headers) must
   equal the entry's section, N/A rows must be N/A in every column, and all seven cells must equal
   the data after normalisation (case, whitespace, dashes, `2 g` = `2g`, and the short list of the
   PDF's own typos that the data corrects and the Source page discloses).
2. **Open fractures (pages 3–4).** Each printed list is compared as a whole set: the four antimicrobial
   bullets (label + regimen), the two duration bullets (fracture type + duration), the two debridement
   rules, the stable/unstable femoral-shaft rules, and the Gustilo-Anderson table rebuilt from its
   borders. The regimen the app displays must re-state the verified prose exactly (drug, footnote mark,
   dose, route, frequency, note, in order).
3. **Dosing table (page 4).** Rebuilt from its borders; the drug cell (with footnote mark), adult cell
   and pediatric cell of each row must equal the data exactly, comparison signs included.
4. **Fever workup (page 5)** is an image, so only the three reference-standard links are checked, each
   link annotation bound to the label printed inside its rectangle and its Bing-wrapped target decoded
   to the CDC URL in the data.
5. **References (page 12).** Each numbered entry must appear as one contiguous string (number, text,
   printed DOI/URL), and each URL must be a link annotation on the page.

It fails outright when the structure it finds is not the PDF's (34 rows, 4 regimens, 2 durations,
4 dosing rows, 13 references…), so a thin or empty dataset cannot print PASS.
`tests/verify-controls.test.js` corrupts copies of the data 54 different ways — swapped and shortened
doses, a reversed threshold sign, a dropped maximum, borrowed frequencies, a row moved to another
section, a qualifier appended to a row name, labels swapped between fracture types, a dropped
combination partner, an invented row, a deleted reference, a link moved to another label, a stale
hash… — and asserts each is caught, and that each mutation actually changed something. **Re-run them
after any edit to the verifier.** A verifier that cannot be shown to fail is not evidence; the first
version of this one passed 38 of 38 planted wrong-data edits in the 2026-10-06 peer review
(`docs/reviews/`), which is why it now works this way.

**What this does not cover:** page 5's flowchart text (transcribed from a picture), the `short`
display labels (a test checks they use only words from the PDF row name) and `aliases` (search hints),
the app-authored brand/class table, and — above all — whether the PDF itself is right. The Source page
lists the places where the document is internally inconsistent so a physician can look at them.

## Deploy

Firebase Hosting, project and site `acs-antibiotics`, canonical URL https://acs-antibiotics.web.app.
`npm run deploy` runs the tests and the verifier before building. After deploying, compare the live
`index-*.js`, CSS and `sw.js` hashes with `dist/` — "Deploy complete" is not verification.
`firebase.json` has no rewrites at all: the app is hash-routed, so `/` is the only server path that is
ever real, and a missing asset 404s instead of being answered with HTML that a service worker could
cache under an asset URL.

## Annual update

1. Replace the PDF in `public/` (delete the old one), naming it with the first 12 hex digits of its
   `sha256sum`; update `source.file`, `source.sha256` and `source.pages` in `src/data/pmg.js`.
2. Re-transcribe what changed, with the rendered pages open beside the extracted text.
3. `npm run verify` — fix every disagreement it reports. If the table layout moved, adjust `COLS`
   in `scripts/verify-pmg.mjs` and re-run the controls.
4. Have a physician read the transcription against the new PDF, then remove the banner
   (`src/components/VerificationNotice.jsx`, rendered by `App.jsx`) and note the sign-off in `CLAUDE.md`.
5. `npm run deploy`, tag.
