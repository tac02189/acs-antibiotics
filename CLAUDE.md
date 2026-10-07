# ACS Antibiotic Guide — project instructions

Extends the root `CLAUDE.md` (`$OneDrive/[3] Claude/CLAUDE.md`); read both. The README covers
running, architecture and the verification design. This file holds what a session must not get wrong.

## What it is

A mobile-first PWA that turns the **MU Health Acute Care Surgery Antibiotic Practice Management
Guideline** (December 2025, 12-page PDF) into a bedside reference for the ED. "ACS" here is Acute
Care Surgery, never acute coronary syndrome — the header spells it out for exactly that reason.

| | |
|---|---|
| Live | https://acs-antibiotics.web.app — Firebase project and site `acs-antibiotics`, Hosting only (no Firebase SDK) |
| Repo | https://github.com/tac02189/acs-antibiotics — public since 2026-10-06 (created private the same morning; Thiago asked for it to be public after the first deploy), `main` |
| Deploy | `npm run deploy` = `npm run build` (tests → verifier → `vite build`) + `firebase deploy --only hosting` |
| Verify a deploy | Compare live `index-*.js`, CSS and `sw.js` with `dist/` by sha256 |
| Preview | `.claude/launch.json`: `acs-antibiotics-dev` (5173) and `acs-antibiotics-preview` (4173) |
| Source PDF | `public/MU-ACS-Antibiotic-PMG-2025-12-<hash>.pdf` — the exact name is `source.file` in `src/data/pmg.js` (content-hashed; the verifier checks it). The unhashed original at the folder root is gitignored |

## Clinical content — the rules

- **`src/data/pmg.js` is clinical content, all of it.** A wrong dose there reaches a prescriber. Never
  change a drug, dose, frequency, duration, redose rule or alternative without the PDF open, and never
  on your own initiative. Neither the verifier nor a peer review can confirm a clinical value; flag it
  for a human (root `CLAUDE.md`, *Clinical content gets flagged, not judged*).
- **The transcription is unverified by a physician as of 2026-10-07.** `VerificationNotice.jsx` renders
  an amber "pending physician verification" strip under the header. **Do not remove it** until Thiago
  says the transcription is reviewed; record the sign-off date here when he does.
- **The app shows the PDF's values even where the PDF disagrees with itself.** Known places (also
  listed on the Source page, `transcription.flags`): Type III open fractures give cefepime q8h with
  no age qualifier while the page-4 table lists pediatric cefepime Q12h; metronidazole is Q12H in the
  tables and Q8h in the open-fracture text and dosing table; abdominal-trauma duration offers
  "24 hours OR 4 days after source control" with no rule for which; the page-5 flowchart's thresholds
  overlap or gap exactly at the boundary (≥/≤ 10⁴ CFU/mL, >/< 10 WBC); reference 9's page range is cut
  off ("1404–141"). Do not "fix" these in the data — they are the document's to fix. Changing them
  silently would make the verifier fail, which is the point.
- **Typos corrected from the PDF are enumerated** in `transcription.corrections` and mirrored in the
  verifier's `TYPO_MAP`. Add to both or to neither.
- **Pages 6–11 (2024 antibiogram) are deliberately not transcribed.** The MUHC Antibiogram app has
  2025 data. Do not add them back.
- **Page 5 is an image.** Its text in `feverWorkup` was read from the rendered page and cannot be
  machine-verified; `transcribedFromImage: true` and the view say so. Keep that disclosure.

## Verification — do not weaken it

`npm run verify` (`scripts/verify-pmg.mjs`) must print PASS before any commit, and `npm run build`
refuses to run while it fails. Its design and limits are in the README; the parts a future session is
most likely to break:

- **Row bands come from the PDF's own cell borders** (thin filled rectangles from the operator list),
  not from text positions. Tall multi-line rows made text-midpoint banding assign cells to the wrong
  row; the borders are exact.
- **Columns are measured x-bands (`COLS`).** If a future PDF shifts a column, values still land in
  *some* column and the output still looks plausible — the verifier is what catches it, by failing.
  Re-measure, do not loosen the comparison.
- **The comparison is per cell, both directions, with a bijection on rows.** Every weakening that
  looks harmless (prefix match, "contains", skipping empty cells) is a way for a transposed row to
  pass. The one deliberate exception is the truncated label "Complicated Urinary Tract
  Infection/CAUTI/Urologic Instr", matched by prefix at ≥20 characters.
- **`tests/verify-controls.test.js` must stay green after any edit to the verifier.** It plants 54
  specific errors (and asserts each mutation actually changed the data); if a new check is added, add a
  control that fails without it. The first version of the verifier passed 38 of 38 planted wrong-data
  edits in the 2026-10-06 peer review (`docs/reviews/2026-10-06-codex-pre-commit-review.md`) — every
  substring, label-blind or prefix-tolerant comparison in it turned out to be an escape. Do not
  reintroduce one.
- **Pages 3–4 are compared as whole printed lists**, not phrases: the four antimicrobial bullets, the
  two durations, the two debridement rules, the femoral-shaft rules and the Gustilo-Anderson table rows.
  The displayed regimen tuples must re-state the verified text exactly (`regimenAsProse`).
- **Page 4's "≥" is readable by pdf.js** (xpdf dropped it), so threshold signs are compared exactly.

## UI invariants

- **Design (v0.5.0): the look the Pediatric CPG and MUHC Antibiogram apps share**, at Thiago's
  request on 2026-10-07 ("mimic those instead"), replacing the trauma-bay instrument design of
  v0.2–v0.4. What was borrowed from where, so a change stays in the family:
  - From both: a Mizzou-black brand bar with gold accents, a light slate canvas, white cards with
    hairline borders, sentence-case headings that differ by weight not family, small uppercase
    section labels, `lucide-react` icons, and amber-50 draft notices.
  - From the Antibiogram: the sticky black header holding the search field (a dark well with a gold
    focus ring), the gold pill (the Alternatives toggle, after its audience pills), the tab row with
    the gold underline (from `sm` up), the gold-outlined PDF button, regimen lists with a left rule
    and the drug name over its mono dose line, and JetBrains Mono for doses.
  - From the Pediatric CPG: Source Sans 3 as the one face, the gold rule under the header (phones),
    section labels with a hue dot over a bordered, divided list group (`Group` in `shared.jsx`), the
    `warn` / `danger` / `good` tone cards (its `tones.js`, as `TONES` in `shared.jsx`), teal links
    and solid buttons, the white footer, and the amber draft banner under the header.
  - Mizzou gold appears only in the brand bar, the switched-on Alternatives pill and the active
    navigation mark; `deepgold` is for icons and 2px marks on light surfaces, never text (3.3:1).
  - Section hues follow the Peds categories (trauma rose, EGS amber, elective sky, inpatient violet)
    and are dots only: rows stay neutral.
  - **Tone cards and tone marks never grade clinical content** (Gemini review, 2026-10-07). The PDF's
    regimen column is transcribed, not recommended: its label is neutral, with no check mark, and its
    left rule is grey — the Antibiogram's green "first-line" treatment was deliberately not carried
    over. The fever-workup "Then" outcomes sit in a neutral well, because they mix starting, stopping
    and investigating. Amber marks the alternative column only while the Alternatives toggle is on
    (label, wash and rule); when it is off, that label is muted like the others. Rose is for the
    open-fracture timing and debridement rules, emerald only for "Checked against the PDF" on the
    Source page and the "Copied" tick.
  - No entrance animation and no continuous animation; motion is the row expand/collapse only, and
    `prefers-reduced-motion` zeroes transitions.
- **Search input is `text-[16px]`.** Smaller and iOS zooms the page on focus.
- **The "Alternatives" pill highlights the PDF's "PNC Allergy/Alternative" column as printed.** That
  column also carries contamination escalation, MRSA add-ons and a clindamycin note, so the field label
  stays the PDF's and the Indications intro says so; do not re-label it "penicillin allergy regimen" or
  call the toggle "PCN allergy" (the first version did, and the peer review flagged it).
- **The PDF is served under a content-hashed filename** (`source.file`, checked by the verifier). A new
  edition is a new URL; no `?v=` query and no ignore rule for one.
- **The whole header is sticky** (`Header.jsx`: brand row, search row and, from `sm`, the tab row),
  as in the Antibiogram, and it pads for the status bar itself, so the area behind the installed
  app's clock is black in both schemes. The verification notice (`VerificationNotice.jsx`) sits
  below it and scrolls. **Deep links clear the header by measurement, not by estimate**: `Header.jsx`
  publishes its rendered height (status-bar inset and any wrapped brand row included) as
  `--app-header-h` through a `ResizeObserver`, and `html`'s `scroll-padding-top` is that plus 10px
  (Codex review, 2026-10-07: a fixed offset hid the target row behind the header in the installed
  iPhone app). Measured at normal text size: 114px on phones, 154px from `sm`. The search field's
  resting border is `bar-rule` (3:1 on the field, in the contrast matrix); `bar-line` is for the
  bar's decorative lines (the tab-row rule, the icon ring) and must not be used as a control boundary.
- **`src/main.jsx` carries the service-worker update handling from the MUHC Antibiogram** (first-claim
  guard, bounded freshness on resume/online, state handoff across the reload). It pairs with
  `registerType: "autoUpdate"` in `vite.config.js`; remove neither without the other.
- `firebase.json` has **no rewrites**: the app is hash-routed, so `/` is the only real server path, and
  a missing path 404s instead of being answered with HTML that a service worker could cache under an
  asset URL. Do not add a catch-all rewrite.
- **Two schemes: light (the default and the design above) and dark**, switched by the sun/moon
  button in the brand bar and remembered per device (`localStorage` key `acs-abx:theme`; anything
  but an explicit `"dark"` is light). How it holds together:
  - **Every colour is a token**: an RGB-triplet CSS variable defined in *both* blocks of `src/index.css`
    (`:root, [data-theme="light"]` and `[data-theme="dark"]`) and exposed by name in
    `tailwind.config.js`. **Components never use fixed palette or arbitrary colours** (`text-white`,
    `text-slate-500`, `bg-black`, `bg-[#…]`): those render the same in both schemes, so one of them
    breaks. `tests/theme.test.js` fails the build on one, whether written as a palette class
    (including per-side borders), a hex or colour function or keyword in an arbitrary value, an
    inline style, or an SVG/icon colour attribute; a control proves each form is caught. The same
    test checks that the two token blocks define the same names, rejects a malformed token instead
    of computing NaN, and checks a **contrast matrix of the pairs the components actually use**,
    computed from the CSS itself: 4.5:1 for text, 3:1 for control lines, the focus ring and
    `deepgold`. The matrix is a usage list: a chip (`bg-chip`) carries `ink`, `prose`, `soft` or `accent` text,
    never `muted` or a tone mark, and a tone mark sits on a page surface or its own wash, never on a
    chip — those pairs fall short in one scheme, so keep the components and the matrix in step
    rather than adding the pair. **A guard test enforces the chip rule** in the source (`text-muted`
    or a tone mark on a `bg-chip` element or inside it fails the build); the first v0.5.0 tree broke
    it on the dosing age labels and the page chips, and the Codex review caught what the matrix, by
    design, could not. Chevrons and arrows that signal an action use `muted` (4.8:1); `faint` is for
    decoration only (bullets, the dotted underline, empty-state icons).
  - **The brand bar is Mizzou black in both schemes**, as in both reference apps, so `theme-color`
    is one constant: `#000000` as the static meta, `THEME_COLOR` and the manifest's `theme_color`
    (a test keeps the three equal to `--bar`). No strip behind the status bar is needed: the sticky
    header covers it. The manifest's `background_color` is the light canvas.
  - **Dark is a slate-night version of the same page**: slate-900 canvas, slate-800 cards, the tone
    washes at their 950 shades, hues at the 400s instead of the 500s.
  - **No flash of the wrong scheme**: an inline script in `index.html`'s `<head>` sets `data-theme`
    before the stylesheet loads; `src/lib/theme.js` owns changes after that, with transitions
    disabled for the switching frame. The test runs that script against stand-in storage (dark,
    light, missing, throwing) and requires the same theme as `theme.js` resolves.
- **Print overrides every colour** (`@media print` in `src/index.css`), in either scheme: a token-only
  print theme once printed drug names white on white (restyle review, 2026-10-06). Keep the
  `* { color: #000 !important }` block and the `:root, [data-theme]` selector on the print tokens.
- **No clinical paraphrase in components.** The open-fracture headline renders `openFractures.timing`
  verbatim and parses its numeral for the big readout; the dosing intro does not restate the age
  threshold or the pharmacy instruction; cross-link blurbs and search examples carry no clinical claim,
  and drug names used as search examples come from `drugs{}`.
- **Phones get `BottomNav`; the header's tab row shows from `sm` up.** Both navigate the same six
  routes. All six tabs fit the column from 640px (a 753px row at 768px, no overflow); the row scrolls
  if they ever do not.
- **Type scale (v0.4.0).** Every font size is a step of 11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 ·
  28 · 36 · 42 px, nothing smaller. `tests/type.test.js` lists each step's role and fails the build on
  any other size written in the source: a `text-[…]` value that is not a step in px, a Tailwind named
  size (`text-sm` and the like, which also set a line height), a CSS `font-size` or `font`
  declaration, an inline or SVG font size, a `fontSize` theme key, or a `<sup>`/`<sub>` without its
  own size (preflight makes those 75% of the text around them). It reads source, not computed styles.
  The roles, as of v0.5.0:
  - 15px: expanded clinical detail (the Duration, Redose and alternative fields; bullet lists,
    criteria and durations on Open fractures and Fever workup; the dosing lines, in mono) and the
    row titles in list groups (the Peds app's row title size).
  - 14px: collapsed summaries (regimen lines, the alternative preview, By-drug lists), page intros,
    Source-page prose and buttons.
  - 13px: notes and asides, blurbs, the verification notice, collapsed-row doses, tab and pill
    labels, references.
  - 12px: eyebrows that say who a regimen or dose applies to or give a timing rule; footnotes and
    their marks, the PDF button, small meta. 11px: every other eyebrow, the page chips, the
    bottom-nav labels, the brand subtitle.
  - The fever-workup criteria leads ("Central line >72 h with purulence at site?") are sentences.
    They are set as 15px text in the PDF's own capitals, not as uppercase eyebrows.
- **`.eyebrow` lives in `@layer components`** (`src/index.css`), so a utility on the same element
  (`text-[12px]`, `text-[13px]`, `tracking-wider`) overrides it (in the utilities layer it would come
  after them and silently win).
- **Numbers stay with their units** (v0.4.0). `keepUnits` in `src/lib/text.js` joins a number to the
  unit after it ("8 days", "13.3 mg/kg/dose", "q12 hours", "≥15 years") and a sign to the number
  after it ("> 10", "× 7") with a no-break space. `fmtDose` uses a narrow no-break space (a thin
  space is a break opportunity: "8 / days" at 375px, "15 / mg/kg" at 414px).
  - Doses, durations, redosing, the alternative column, dosing lines, the open-fracture and
    fever-workup text, and the Source page's flags all pass through one of them. Names and labels
    do not.
  - They change spaces and nothing else; `tests/text.test.js` checks that for every string in the data.
- **Phone layout invariants** (checked in the preview at 320, 360, 375 and 768px, both schemes): no
  horizontal scroll; the brand bar is one line with the full title from 320px (the icon tile hides
  below 360px and the PDF button's icon below 420px), and with enlarged text its controls wrap to a
  second line instead of clipping the title (the brand row is `flex-wrap`, the brand link
  `flex-auto`); "Indications" fits its bottom-nav cell at 320px; the tab row fits the column from
  640px; `text-wrap: pretty` on `body`. Re-run these checks after any layout change.
- **No invented labels.** The 2026-10-06 prototype added "Recommended Regimen", "PRIORITY EMERGENCY
  DIRECTIVE", "BRANCH 01", step numerals and "THEN ACTION"; the app uses "Regimen", "Timing", the
  PDF's "plus" and "Then". Keep interface strings editorial-neutral; clinical wording comes from the
  data.

## Testing

- `npm test` — Node's built-in runner, no dependencies. `tests/pmg.test.js` checks data shape, that
  every regimen drug has `drugs{}` metadata, search behaviour and routing; `tests/verify-controls.test.js`
  runs the verifier on the real data and on 54 corrupted copies; `tests/theme.test.js` guards the two
  colour schemes (no fixed colours, same token names, the contrast matrix, the pre-paint script),
  `tests/type.test.js` the type scale and `tests/text.test.js` the number-and-unit helpers (see
  *UI invariants*).
- These tests catch transcription slips and regressions, not clinical errors.
- UI behaviour has no automated tests; verify in the preview at phone width, in both colour schemes.
- CI (`.github/workflows/ci.yml`) runs `npm ci && npm run build` on pushes to `main` and PRs. It never deploys.

## Preview pane limits worth knowing before you debug (seen 2026-10-06)

- **Screenshots time out unless the tab is fronted** (`tabs_select` first); a background tab also
  pauses animations and smooth scrolling, so "the page is blank / did not scroll" is usually the pane,
  not the app. Deep links use an instant jump for that reason as much as for determinism.
- **Viewport emulation is cleared whenever the pane resizes**, sometimes mid-batch; a zoomed-looking
  screenshot means the emulation dropped. Set the preset again immediately before each capture.
- **Editing `tailwind.config.js` needs a dev-server restart** (`preview_stop` + `preview_start`);
  HMR keeps serving the old theme (old fonts, default border colour) and it looks like a CSS bug.
  The production build is unaffected — check `dist/` or the preview server (4173) when in doubt.

## History

Built 2026-10-06 from the PDF; v0.1.0 (first deploy, untagged) through v0.4.0, tags from `v0.2.0`,
landed that day in the "trauma-bay instrument" design. v0.5.0 (2026-10-07) restyled the app to the
look of the Pediatric CPG and MUHC Antibiogram apps at Thiago's request (see *UI invariants*). Peer
reviews (Codex, or Gemini when Codex's quota was spent; single engine each time) ran before the
first commit and before each release — verbatim reviews and dispositions in `docs/reviews/`. Full
changelog: `docs/HISTORY.md`.
