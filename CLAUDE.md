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
| Source PDF | `public/MU-ACS-Antibiotic-PMG-2025-12.pdf` (the original at the folder root is gitignored) |

## Clinical content — the rules

- **`src/data/pmg.js` is clinical content, all of it.** A wrong dose there reaches a prescriber. Never
  change a drug, dose, frequency, duration, redose rule or alternative without the PDF open, and never
  on your own initiative. Neither the verifier nor a peer review can confirm a clinical value; flag it
  for a human (root `CLAUDE.md`, *Clinical content gets flagged, not judged*).
- **The transcription is unverified by a physician as of 2026-10-06.** `BrandBar.jsx` renders an amber
  "pending physician verification" strip. **Do not remove it** until Thiago says the transcription is
  reviewed; record the sign-off date here when he does.
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

- **Search input is `text-base` (16px).** Smaller and iOS zooms the page on focus.
- **The "Alternatives" toggle highlights the PDF's "PNC Allergy/Alternative" column as printed.** That
  column also carries contamination escalation, MRSA add-ons and a clindamycin note, so the field label
  stays the PDF's and the Indications intro says so; do not re-label it "penicillin allergy regimen" or
  call the toggle "PCN allergy" (the first version did, and the peer review flagged it).
- **The PDF is served under a content-hashed filename** (`source.file`, checked by the verifier). A new
  edition is a new URL; no `?v=` query and no ignore rule for one.
- **The sticky toolbar is a sibling of `<main>`**, not inside `<header>` — inside a short header,
  `position: sticky` stops at the header's bottom edge.
- **`src/main.jsx` carries the service-worker update handling from the MUHC Antibiogram** (first-claim
  guard, bounded freshness on resume/online, state handoff across the reload). It pairs with
  `registerType: "autoUpdate"` in `vite.config.js`; remove neither without the other.
- `firebase.json` has **no rewrites**: the app is hash-routed, so `/` is the only real server path, and
  a missing path 404s instead of being answered with HTML that a service worker could cache under an
  asset URL. Do not add a catch-all rewrite.
- **Design is the "trauma-bay instrument" direction Thiago chose on 2026-10-06** from three side-by-side
  prototypes (Claude's original, Codex's "printed formulary", Gemini's "trauma-bay instrument"); Gemini's
  styling was ported onto the reviewed code, not adopted wholesale. Chakra Petch display / Barlow body /
  IBM Plex Mono doses, all self-hosted via `@fontsource` so offline typography holds. Section hues are
  set per `<section>` via `--hue`; hazard amber (`--gold`) marks the alternative-column highlight, the
  focus ring, footnote marks and the "plus" connectors — nothing else. Dose numerals are emerald in
  readout wells. `--rule` is decorative; control boundaries (search field, toggles, PDF button) use
  `--rule-strong` (3.4:1 on the dark card, 3.6:1 on the light one).
- **Two schemes since v0.3.0: dark (the default and the design above) and light**, switched by the
  sun/moon button in the brand bar and remembered per device (`localStorage` key `acs-abx:theme`).
  Thiago asked for the light theme and the toggle on 2026-10-06; it is opt-in, so existing readers
  see no change. How it holds together:
  - **Every colour is a token**: an RGB-triplet CSS variable defined in *both* blocks of `src/index.css`
    (`:root, [data-theme="dark"]` and `[data-theme="light"]`) and exposed by name in
    `tailwind.config.js`. **Components never use fixed palette or arbitrary colours** (`text-white`,
    `text-cyan-400`, `bg-black`, `bg-[#…]`): those render the same in both schemes, so one of them
    breaks. `tests/theme.test.js` fails the build on one, whether written as a palette class (including
    per-side borders), a hex or colour function or keyword in an arbitrary value, an inline style, or
    an SVG/icon colour attribute; a control proves each form is caught. The only exceptions are the
    black text, icon and dot on the bright `hazard-fill` of the switched-on Alternatives control, each
    pinned to its own line. The amber verification notice is the same in both schemes but still goes
    through tokens (`amber-bg`, `amber-ink`, `amber-line`). The same test checks that the two token
    blocks define the same names, rejects a malformed token instead of computing NaN, and requires
    4.5:1 for text (3:1 for control lines and the focus ring) on every surface in both schemes,
    including the caution-striped highlights and the notice, computed from the CSS itself.
  - **The dark values reproduce the approved render exactly**, verified 2026-10-06 by comparing the
    computed colours of 12,484 elements across 14 views and states against the pre-theme build. Two
    intended differences: white text became the `ink` token (#F8FAFC, imperceptible), and the border and
    ring of the switched-on Alternatives control, plus the ring of the highlighted allergy regimen on
    Open fractures, moved from #FACC15 to the hazard amber #FFD600. Two oddities are
    deliberate: the dark `--shadow-card` and `--glow-red` are card-coloured, because a Tailwind name
    clash with the `card` colour made them render that way in the approved design (a faint halo, no
    drop shadow, no red glow). The light scheme uses real shadows. Do not "fix" the dark ones without
    asking. `hazard-edge`, `hazard-edge-dim` and `border-accent-fill/40` exist only to keep three
    border shades exact in dark.
  - **The brand bar is dark in both schemes** (`data-theme="dark"` on its element scopes the dark
    tokens). The installed iPhone app uses `black-translucent`, which draws white status-bar text over
    the top of the page and cannot change at runtime. A fixed strip of height
    `env(safe-area-inset-top)` keeps that area dark after the bar scrolls away, and the sticky toolbar
    sticks below it. Both are zero-height wherever the browser reports no top inset, which is any
    ordinary browser tab (measured: 0px). Where an inset is reported they fill it and keep the toolbar
    clear of it. Neither has been checked on a real installed app yet. `theme-color` stays `#080B10`
    for the same reason.
  - **The verification notice draws its own focus ring**, 2px inset in its dark ink (6.2:1 on the
    amber). The global ring would sit on the amber and the dark bar, where the light scheme's deep gold
    reads under 3:1 (Codex review, 2026-10-06).
  - **No flash of the wrong scheme**: an inline script in `index.html`'s `<head>` sets `data-theme`
    before the stylesheet loads; `src/lib/theme.js` owns changes after that, with transitions disabled
    for the switching frame. The test runs that script against stand-in storage (light, dark, missing,
    throwing) and requires the same answer as `theme.js`.
  - **The brand bar fits a 360px phone** because the title is 16px below 400px and the PDF button drops
    its icon below 420px ("PDF" stays visible); "· MU Health" shows from 480px. Measured one line, no
    horizontal scroll, at 360–640px. Below about 355px (a 320px phone, or page zoom) the row wraps and
    the two buttons drop to a second line instead of sliding under the no-wrap subtitle. Adding
    anything to that bar needs the same check.
- **Print overrides every colour** (`@media print` in `src/index.css`), in either scheme: a token-only
  print theme once printed drug names white on white (restyle review, 2026-10-06). Keep the
  `* { color: #000 !important }` block and the `:root, [data-theme]` selector on the print tokens.
- **No clinical paraphrase in components.** The open-fracture headline renders `openFractures.timing`
  verbatim and parses its numeral for the big readout; the dosing intro no longer restates the age
  threshold or the pharmacy instruction; cross-link blurbs and search examples carry no clinical claim,
  and drug names used as search examples come from `drugs{}`.
- **Phones get `BottomNav`; the Toolbar tab row shows from `sm` up.** Both navigate the same six routes.
- **No continuous animation.** The prototype used pulse/ping/bounce loops; they were dropped, and
  `prefers-reduced-motion` also zeroes transitions. Motion is entrance (`rise`, 0.22s) and expand only.
- **No invented labels.** The prototype added "Recommended Regimen", "PRIORITY EMERGENCY DIRECTIVE",
  "BRANCH 01", step numerals and "THEN ACTION"; the port uses "Regimen", "Timing", the PDF's "plus",
  arrow bullets and "Then". Keep interface strings editorial-neutral; clinical wording comes from the data.

## Testing

- `npm test` — Node's built-in runner, no dependencies. `tests/pmg.test.js` checks data shape, that
  every regimen drug has `drugs{}` metadata, search behaviour and routing; `tests/verify-controls.test.js`
  runs the verifier on the real data and on 54 corrupted copies; `tests/theme.test.js` guards the two
  colour schemes (see *UI invariants*).
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

- **2026-10-06** — created from the PDF Thiago dropped in `ACS Antibiotics/` on 2026-10-01. Data
  transcribed with rendered page images beside the extracted text; verifier written; Firebase project
  `acs-antibiotics` created by the CLI. **Peer review (Codex gpt-6-astra, single engine) before the
  first commit** returned 26 findings — 7 Critical, 8 High, 7 Medium, 4 Low — none a wrong value in the
  transcription, but the verifier passed all 38 planted wrong-data edits the review proposed. Every
  finding was applied or flagged; the verbatim review and each disposition are in
  `docs/reviews/2026-10-06-codex-pre-commit-review.md`. Transcription not yet physician-verified; the
  app icon is Thiago's artwork (`assets/icon-source.png`). First deploy the same day (v0.1.0).
- **2026-10-06, later** — three visual prototypes built in isolated copies (`design-variants/`, gitignored):
  Codex (gpt-6-astra) "printed formulary" and Gemini (gemini-3.8-flash-high) "trauma-bay instrument",
  compared side by side with the original. Thiago chose Gemini's; its styling was ported onto the
  reviewed tree (see *UI invariants*), with the prototype's continuous animations, invented labels and
  Google-hosted fonts replaced.
- **2026-10-06, v0.3.0** — new icon artwork from Thiago (gold "ACS", black-and-gold capsule and scalpel
  on black) replaced the white-on-royal-blue one: `assets/icon-source.png`, every size regenerated with
  `npm run icons`. Light theme and toggle added at his request; every component colour moved to
  tokens, with the dark scheme verified unchanged (see *UI invariants*). **Peer review (Codex
  gpt-6-astra, single engine)** before the commit returned 5 findings: 1 Medium (the brand bar
  overlapping at 320px) and 4 Low (the notice's focus ring under 3:1, and three ways the new theme
  tests could pass when they should fail). All five were fixed; the fixes were checked in the browser
  and by the tests, not re-reviewed by Codex. Codex confirmed `src/data/pmg.js` unchanged and listed
  25 restyled lines that display clinical data, none with a changed value. Verbatim review and
  dispositions: `docs/reviews/2026-10-06-codex-light-theme-review.md`.
