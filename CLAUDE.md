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
| Preview | `.claude/launch.json`: `acs-antibiotics-dev` (5173) and `acs-antibiotics-preview` (4173); `variant-claude` / `variant-codex` / `variant-gemini` (5176 / 5174 / 5175) run design worktrees at `%USERPROFILE%\acs-variants\<engine>` through `.claude/variant-dev.cjs`, when those checkouts exist |
| Source PDF | `public/MU-ACS-Antibiotic-PMG-2025-12-<hash>.pdf` — the exact name is `source.file` in `src/data/pmg.js` (content-hashed; the verifier checks it). The unhashed original at the folder root is gitignored |

## Clinical content — the rules

- **`src/data/pmg.js` is clinical content, all of it.** A wrong dose there reaches a prescriber. Never
  change a drug, dose, frequency, duration, redose rule or alternative without the PDF open, and never
  on your own initiative. Neither the verifier nor a peer review can confirm a clinical value; flag it
  for a human (root `CLAUDE.md`, *Clinical content gets flagged, not judged*).
- **The "pending physician verification" notice was removed on 2026-10-08 (v0.7.5), at Thiago's
  request** ("remove the transcription pending physician notice"), after he read the Codex and Gemini
  checks of the whole file against the PDF (`docs/reviews/2026-10-08-*-pdf-crosscheck.md`) and ruled
  on their findings. `VerificationNotice.jsx` is kept but not rendered. For a new edition of the PMG,
  render it again from `App.jsx` until a physician has read the new transcription. The rules above
  still apply to every edit: neither the removal nor the cross-checks verify a value.
- **The app shows the PDF's values even where the PDF disagrees with itself.** Known places (also
  listed on the Source page, `transcription.flags`): Type III open fractures give cefepime q8h with
  no age qualifier while the page-4 table lists pediatric cefepime Q12h; metronidazole is Q12H in the
  tables and Q8h in the open-fracture text and dosing table; abdominal-trauma duration offers
  "24 hours OR 4 days after source control" with no rule for which; the page-5 flowchart's thresholds
  overlap or gap exactly at the boundary (≥/≤ 10⁴ CFU/mL, >/< 10 WBC); reference 9's page range is cut
  off ("1404–141"). Do not "fix" these in the data — they are the document's to fix. Changing any
  of them except the page-5 thresholds silently would make the verifier fail, which is the point;
  page 5 is an image the verifier cannot read, so there the comment above `feverWorkup` and this
  file are the only guard.
- **Typos corrected from the PDF are enumerated** in `transcription.corrections` and mirrored in the
  verifier's `TYPO_MAP`. Add to both or to neither.
- **Pages 6–11 (2024 antibiogram) are deliberately not transcribed.** The MUHC Antibiogram app has
  2025 data. Do not add them back.
- **Page 5 is an image.** Its text in `feverWorkup` was read from the rendered page and cannot be
  machine-verified; `transcribedFromImage: true` and the view say so. Keep that disclosure.
- **Four page-5 readings are Thiago's decisions, not the PDF's wording** (2026-10-08, on the Codex
  cross-check; listed in the comment above `feverWorkup`). Do not "restore" the PDF: "Unexplained
  hypotension" stays one criterion (the PDF prints two bullets); "with reflexive culture" stays (the
  box says "with Reflexive"); "> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous
  cells" replaces the drawn order, repeat UA before starting, and "<100,000 CFU/mL … → discontinue
  antibiotics" is its later step (`then`), indented under it rather than a third outcome (v0.7.6,
  Thiago: "i do want it to read as a later step"; chaining it on with a third arrow read, to both
  reviewers, as if it depended on the repeat UA, and he chose the indented step); the repeat-UA box's asterisk, which has no footnote on the
  page, stays out. The view's "read from the picture" note is unchanged at his decision.

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

- **Design (v0.6.0): the Pediatric CPG / MUHC Antibiogram look of v0.5.0, plus the dose plate and
  the section spine.** v0.5.0 adopted the two sibling apps' look at Thiago's request on 2026-10-07
  ("mimic those instead"); v0.6.0, the same evening, is the variant he chose ("go with the new
  claude one") of three built independently from one brief by Claude, Codex and Gemini ("keep it
  professional looking and MU themed … more obvious between different diagnoses … the
  medications/dosing to stand out"). The three variants' notes are in `docs/design/`; the other two
  live on the `design/codex` and `design/gemini` branches. What came from where, so a change stays
  in the family:
  - From both sibling apps: a Mizzou-black brand bar with gold accents, a light slate canvas, white
    cards with hairline borders, sentence-case headings that differ by weight not family, small
    uppercase labels, `lucide-react` icons, and amber-50 draft notices.
  - From the Antibiogram: the sticky black header holding the search field (a dark well with a gold
    focus ring), the gold pill (the PCN Allergy toggle, after its audience pills), the tab row with
    the gold underline (from `sm` up), the gold-outlined PDF button, the drug name over its mono dose
    line, and JetBrains Mono for doses.
  - From the Pediatric CPG: Source Sans 3 as the one face, the gold rule under the header (phones),
    bordered, divided list groups (`Group` in `shared.jsx`), the `warn` / `danger` / `good` tone
    cards (its `tones.js`, as `TONES` in `shared.jsx`), teal links and solid buttons, the white
    footer, and the amber draft banner under the header (not rendered since v0.7.5; see
    *Clinical content*).
  - **The dose plate** (`Plate`, `Regimen`, `OrderLine`, `RegimenInline`, `DosePlate` in
    `shared.jsx`): Mizzou black (`--plate`, 17 17 17 in both schemes) with the drug name in white
    (`plate-ink`) and the dose, route and frequency in gold mono (`plate-dose`, Mizzou gold);
    `plate-soft` for routes, notes and the "plus" connector; `plate-line` is its 1px inset edge
    (the plate's own colour in light, where the black fill is the edge; `rule-strong`'s grey in
    dark, 4.1:1 on a slate-800 card — slate-600 was 1.9:1, Codex review 2026-10-07).
    Every medication in the app sits on one — a collapsed row shows one pill per drug with a "+"
    before each partner (visually; a hidden "plus", the PDF's word, is what a screen reader hears),
    pills wrapping as units; the expanded Regimen, the open-fracture regimens, the dosing table's
    cells and the By-drug lists use the same surface — so a medication reads the same way wherever
    it appears. Inside a pill a real space separates the name from the dose: the flex gap is visual
    only, and without it a screen reader or the clipboard gets "Cefazolin2 g" (Gemini review,
    2026-10-07). A regimen note follows its tuple with the PDF's own comma. The drug-name button on
    a plate is 44px tall (`py-[11px] -my-[11px]`); footnote marks carry `aria-label="footnote *"`. Gold is legible as text only on the plate: 10.5:1 there, 1.8:1
    on white (`deepgold` is the 3.3:1 gold, for icons and marks). The plate's text pairs, the
    focus ring on it and its edge against the surfaces it sits on are in the contrast matrix. In
    print the plate is an outlined box (`.plate` in the print block).
  - **The section spine**: each indication section runs a 4px rule in its hue (`border-l-4
    border-l-hue`) down the left edge of its `SectionHead` and of each indication's card, and the head
    (18px bold title, the count on the right) is `sticky` at `top: var(--app-header-h, 6.625rem)`,
    z-30 under the header's z-40, on `bg-paper` so rows scroll under it. **Deep links and keyboard
    focus clear the stuck head by measurement**: `SectionHead` publishes its rendered height on the
    `<section>` as `--section-head-h` through a `ResizeObserver`, and each row and its button carry
    `scroll-margin-top: calc(var(--section-head-h, 2.25rem) + 1rem)` (a fixed 64px hid part of a row
    behind a two-line head at 200% text — Gemini review, 2026-10-07), and print un-sticks it (`.section-head`). Light hues
    are the Tailwind 600s (rose, amber, sky, violet) so a 4px rule carries them; dark the 400s.
    **The indications are separate cards** (v0.7.0, Thiago, 2026-10-08: "a little separation between
    each diagnosis"): each `IndicationRow` `<li>` is its own bordered white card on the spine, 8px
    from the next (`space-y-2`), not a row in a divided `Group`. The other lists (By drug, Dosing)
    keep `Group`, whose dividers between rows are `rule` (dividers inside a row or a card stay
    `rule-soft`); row titles are 16px bold. The spine also marks the open-fracture "Antimicrobial by
    type" card (trauma) and the fever-workup branch cards (inpatient, set on the view's root). In
    By drug, the hue dot before an indication is paired with a visually hidden section name, so the
    section is never colour alone.
  - **Sections collapse** (v0.7.0, Thiago, 2026-10-08). With `onToggle`, the whole `SectionHead` is
    one 44px button inside its `h2` (`aria-expanded`, `aria-controls`; the title's span carries the
    id the `<section>` is labelled by), with the rows' chevron. What must keep holding:
    - **A search opens every section with a match**: starting or changing a search shows every
      section that has one, whatever the reader had collapsed. The reader can still collapse one
      during the search; that uses a separate set, reset whenever the query changes, and clearing
      the search brings back the reader's own collapsed sections.
    - **A link never lands on a collapsed head**: `#/s/<id>` and `#/i/<id>` open their section in
      both sets (a section link keeps the query, so a section collapsed during that search reopens
      too — Codex review, 2026-10-08), and the deep-link effect waits until the row has client
      rects before it scrolls and focuses.
    - **Every section starts collapsed** (v0.7.1, Thiago, 2026-10-08: "make sections collapsed by
      default"): the list opens as four heads with their counts, and the intro says to tap a
      section, then a row. The collapsed set lives in `App`, initialised to every section id, so
      the reader's choices survive a trip to another tab; it is not stored, so a fresh launch
      starts collapsed again. A deep link on a cold start still lands: its section opens, then
      the row scrolls into view and takes focus. Just before that scroll the deep-link effect
      re-measures the section head (`publishHeadHeight`, shared with `SectionHead`), because
      opening the section can change the head's height before the `ResizeObserver` reports
      (Codex review, 2026-10-08).
    - A collapsed list stays in the DOM with `hidden` and still prints (`.section-list[hidden]` in
      the print block). **The blurb shows whether the section is open or collapsed** (v0.7.2,
      Thiago, 2026-10-08), so a collapsed head still says what the section covers; it is hidden
      only during a search. The four blurbs are app-authored descriptions, not PDF text. Thiago
      read the Trauma and Elective ones on 2026-10-08 ("those look good") after the v0.7.0 Codex
      review flagged them, and all four that evening after the PDF cross-check rated them High as
      interpretations ("A1, A2, A7 look good"; "A4 is correct", the Elective "vancomycin added").
      Change one only at his request.
    - Collapsing from the stuck head scrolls the section back to just under the header first;
      otherwise the head is left far above the viewport and the reader in the next section.
    - Section collapse is instant, not animated (see the motion rule below): a height transition
      on a wrapper with `overflow: hidden` would let a deep link's `scrollIntoView` scroll the
      wrapper itself mid-animation.
  - **The other tabs collapse too** (v0.7.7, Thiago, 2026-10-08: "make the workup tab collapse",
    then "make the other tabs collapsable too"). `CollapsibleCard` (`shared.jsx`) is a card whose
    title is one 56px button (`aria-expanded`, `aria-controls`) over a panel holding the rest,
    drawn like an indication row (`.expand`, `inert` while closed), so it animates as a row does
    and prints open; `tone="warn"` is the physician card's amber. Dosing's rows (`DosingRow`)
    collapse the same way inside their `Group`. Every one starts collapsed. Which are open is one
    set of keys (`"<view>:<id>"`) held in `App` and handed down through the `OpenCards` context
    (`useCardOpen`), so the choices survive a trip to another tab; it is not stored.
    - What collapses: Workup's three branches and Reference standards; Fractures' four cards;
      each Dosing row; Source's physician card, spelling corrections, Antibiogram and References.
      By drug and Indications already did.
    - What does not, on purpose: the open-fracture timing card (the one number to remember), the
      Dosing footnotes (the marks on the drug names point there), the Source document card (the
      PDF button), and the Workup page-5 image note (*Clinical content*: keep that disclosure).
    - The Workup branches stack in one column at every width: the three-column grid they had
      from `md` up left collapsed heads ragged beside a tall, narrow open card.
  - **No page references in the interface** (v0.7.7, Thiago, 2026-10-08: "remove the page
    references (i.e. p.1) and the copy link"). The "p.N" chips on rows, section heads, card
    headings and eyebrows, the By-drug links that were labelled by page ("See all", "Full table"
    now) and the indication rows' Copy link are gone; `PageTag` went with them. The data keeps its
    `page` fields (the verifier and the PDF viewer's `page` use them), the Source page's prose
    still says which pages were checked, and the workup note still opens page 5 of the PDF. `#/i/<id>`
    links still work (By drug uses them); nothing in the app copies one any more.
  - Mizzou gold appears in the brand bar, the switched-on PCN Allergy pill, the active navigation
    mark and the doses on the plate; `deepgold` is for icons and 2px marks on light surfaces, never
    text (3.3:1).
  - Section hues follow the Peds categories (trauma rose, EGS amber, elective sky, inpatient violet)
    and appear only as the spine and as the dots in By drug's use lists: rows and plates stay neutral.
  - **Tone cards and tone marks never grade clinical content** (Gemini review, 2026-10-07). The PDF's
    regimen column is transcribed, not recommended: its label is neutral, with no check mark, and
    its plate is the same black for every row — the Antibiogram's green "first-line" treatment was
    deliberately not carried over. The fever-workup "Then" outcomes sit in a neutral well, because they mix starting, stopping
    and investigating. Amber marks the alternative column only while the PCN Allergy toggle is on
    (label, wash and rule); when it is off, that label is muted like the others. Rose is for the
    open-fracture timing and debridement rules, emerald only for "Checked against the PDF" on the
    Source page.
  - No entrance animation and no continuous animation; motion is the row expand/collapse only (a
    `CollapsibleCard` counts as a row; and the chevrons turning), and `prefers-reduced-motion` zeroes transitions.
- **Search input is `text-[16px]`.** Smaller and iOS zooms the page on focus. Only the font size
  triggers that zoom, so the field itself is 36px tall (`h-9`, v0.7.4, Thiago, 2026-10-08: "go
  with 36px"). Do not get under 16px text with `maximum-scale=1` (it blocks pinch-zoom on Android)
  or by scaling the field down. The PCN Allergy pill is drawn 36px to match, and its `::before`
  reaches 4px above and below into the rows' padding, so its tap area stays 44px; the clear button
  does the same on all four sides (44px square). The focus ring follows the drawn pill.
- **The "PCN Allergy" pill highlights the PDF's "PNC Allergy/Alternative" column as printed.** That
  column also carries contamination escalation, MRSA add-ons and a clindamycin note. The first
  version called the toggle "PCN allergy", the 2026-10-06 peer review flagged it, and it became
  "Alternatives". **Thiago renamed it back to "PCN Allergy" on 2026-10-08** (v0.7.2), knowing that
  history. What keeps the mixed column readable is everything else, so keep all of it: the field
  label on each row and on the highlighted note stays the PDF's ("PNC allergy / alternative"), the
  Indications intro says what else the column holds, and the pill's `title` says the same. Do not
  re-label the field itself "penicillin allergy regimen".
- **The PDF is served under a content-hashed filename** (`source.file`, checked by the verifier). A new
  edition is a new URL; no `?v=` query and no ignore rule for one.
- **The PDF opens only in the in-app viewer** (`PdfButton.jsx` + `PdfCanvasViewer.jsx`, v0.7.3,
  copied from the Pediatric CPG app). Never link it with `<a href>` or `target="_blank"`: in the
  installed app there is no browser tab to open into, so the PDF replaced the app with no Back button
  and the only way out was quitting it (Thiago, 2026-10-08: "There's no way to close the pdf after
  you open it"). `tests/pdf-link.test.js` fails the build if any file in `src/` outside the viewer
  names `pdfHref` or `source.file` or holds a same-origin `.pdf` path, and if a direct link inside
  the viewer leaves its non-installed branch.
  - The viewer is a full-screen dialog over the app: a black bar with **Back** (and Escape, and the
    device back gesture, through one history entry — the Peds history policy, unchanged), the PDF
    drawn to canvases by pdf.js, `#root` inert while it is open.
  - **In the installed app the viewer has no links out at all** (`useInstalledApp`: the
    `display-mode: standalone` query, kept current, or iOS's `navigator.standalone`). A browser gets
    "Open in a new tab", "Download" and an "Open the PDF" fallback; the installed app gets only Back
    and, when a page is slow or fails, **Try again**. Any of those links would be the trap again
    (Codex review, 2026-10-08, `docs/reviews/2026-10-08-codex-pdf-viewer-review.md`).
  - Accepted residual, from the Peds history policy: a reopen-and-close inside its 1.5 s settling
    window, a reload with the viewer open, or Forward can leave one dead Back press in a browser.
    Never more than that; none of it applies in the installed app.
  - `page` opens at a page (Fever workup → page 5): earlier pages draw under the loading cover and
    the container holds a viewport's height under the target until later pages exist, so the jump
    is not clamped (pages 1–2 are landscape and short).
  - `disableRange: true`: the service worker answers every request for the PDF with the whole
    precached file, so a range request would come back unusable.
  - pdf.js is a runtime dependency now (lazy-loaded; worker `assets/pdf.worker.min-*.js`, ~1.3 MB,
    precached with the rest, so the viewer works offline).
- **The whole header is sticky** (`Header.jsx`: brand row, search row and, from `sm`, the tab row),
  as in the Antibiogram, and it pads for the status bar itself, so the area behind the installed
  app's clock is black in both schemes. **Deep links clear the header by measurement, not by estimate**: `Header.jsx`
  publishes its rendered height (status-bar inset and any wrapped brand row included) as
  `--app-header-h` through a `ResizeObserver`, and `html`'s `scroll-padding-top` is that plus 10px
  (Codex review, 2026-10-07: a fixed offset hid the target row behind the header in the installed
  iPhone app). Measured at normal text size: 106px on phones, 146px from `sm`
  (v0.7.4; 114px and 154px before the search row went to 36px). The search field's
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
    washes at their 950 shades, hues at the 400s instead of the 600s, and the same black plate with
    a 1px edge in `rule-strong`'s grey.
  - **No flash of the wrong scheme**: an inline script in `index.html`'s `<head>` sets `data-theme`
    before the stylesheet loads; `src/lib/theme.js` owns changes after that, with transitions
    disabled for the switching frame. The test runs that script against stand-in storage (dark,
    light, missing, throwing) and requires the same theme as `theme.js` resolves.
- **Print overrides every colour** (`@media print` in `src/index.css`), in either scheme: a token-only
  print theme once printed drug names white on white (restyle review, 2026-10-06). Keep the
  `* { color: #000 !important }` block and the `:root, [data-theme]` selector on the print tokens.
  Borders print in `#767676` (4.5:1; `#999` was 2.8:1) and `text-decoration-color` is forced black
  too, because the drug-name button's dotted underline is set with an alpha and would otherwise
  print at 1.3:1 (Codex review, 2026-10-07). The plate prints as an outlined box.
- **No clinical paraphrase in components.** The open-fracture headline renders `openFractures.timing`
  verbatim and parses its numeral for the big readout; the dosing intro does not restate the age
  threshold or the pharmacy instruction; cross-link blurbs and search examples carry no clinical claim,
  and drug names used as search examples come from `drugs{}`.
- **Phones get `BottomNav`; the header's tab row shows from `sm` up.** Both navigate the same six
  routes. All six tabs fit the column from 640px (a 753px row at 768px, no overflow); the row scrolls
  if they ever do not.
- **Type scale (v0.4.0).** Every font size is a step of 11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 ·
  28 · 36 px, nothing smaller (42px went on 2026-10-08, when the open-fracture timing card was made
  smaller at Thiago's request and nothing else used it). `tests/type.test.js` lists each step's role and fails the build on
  any other size written in the source: a `text-[…]` value that is not a step in px, a Tailwind named
  size (`text-sm` and the like, which also set a line height), a CSS `font-size` or `font`
  declaration, an inline or SVG font size, a `fontSize` theme key, or a `<sup>`/`<sub>` without its
  own size (preflight makes those 75% of the text around them). It reads source, not computed styles.
  The roles, as of v0.6.1:
  - 18px: the section heads on the Indications list, the drug names on Dosing and By drug, card
    headings on phones, the timing sentence from `sm` up.
  - 16px: the drug name and its dose line on the expanded plate (Regimen, open fractures), the row
    titles on the Indications list and in the Gustilo-Anderson table, the brand title, the search
    input, the timing sentence on phones.
  - 28px / 36px (`sm` up): the open-fracture timing numeral.
  - 15px: expanded clinical detail (the Duration, Redose and alternative fields; bullet lists,
    criteria and durations on Open fractures and Fever workup), the dosing-table lines on their
    plates (mono), and the row titles in By drug's use lists.
  - 14px: the alternative preview, page intros, Source-page prose, buttons, the "+" between pills.
  - 13px: the collapsed-row pills (drug and dose), notes and asides, blurbs, the verification
    notice (not rendered since v0.7.5), tab and pill labels, references.
  - 12px: eyebrows that say who a regimen or dose applies to or give a timing rule; footnotes and
    their marks, the section count, the PDF button, small meta. 11px: every other eyebrow, the
    footnote marks inside pills, the bottom-nav labels, the brand subtitle.
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
  640px; `text-wrap: pretty` on `body`; pills wrap as units and the text inside a pill wraps too
  ("Pharmacy to dose Pharmacy to dose" on the vancomycin rows). Re-run these checks after any
  layout change. Headless Chrome captures of every view in both schemes at 375px are one command
  away: the 2026-10-07 variants exercise left `capture.mjs` (DevTools protocol, no dependencies)
  in the session scratchpad and `design-variants/compose.mjs` (gitignored) to stitch them.
- **No invented labels.** The 2026-10-06 prototype added "Recommended Regimen", "PRIORITY EMERGENCY
  DIRECTIVE", "BRANCH 01", step numerals and "THEN ACTION"; the app uses "Regimen", "Timing", the
  PDF's "plus" and "Then". Keep interface strings editorial-neutral; clinical wording comes from the
  data.

## Testing

- `npm test` — Node's built-in runner, no dependencies. `tests/pmg.test.js` checks data shape, that
  every regimen drug has `drugs{}` metadata, search behaviour and routing; `tests/verify-controls.test.js`
  runs the verifier on the real data and on 54 corrupted copies; `tests/theme.test.js` guards the two
  colour schemes (no fixed colours, same token names, the contrast matrix, the pre-paint script),
  `tests/type.test.js` the type scale, `tests/text.test.js` the number-and-unit helpers and
  `tests/pdf-link.test.js` that the PDF opens only in the in-app viewer (see *UI invariants*).
- These tests catch transcription slips and regressions, not clinical errors.
- **The working tree must be LF.** `tests/theme.test.js` finds the token blocks with a literal
  `"\n"`, so a CRLF checkout fails the whole file at import ("test failed" at `theme.test.js:1:1`),
  which looks like a broken test rather than line endings. `.gitattributes` (`* text=auto eol=lf`,
  added 2026-10-07) makes every checkout LF; before it, a fresh worktree on a machine with
  `core.autocrlf=true` came out CRLF. Check with `git ls-files --eol <file>` (want `w/lf`).
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
look of the Pediatric CPG and MUHC Antibiogram apps at Thiago's request, and v0.6.0 (the same
evening) added the dose plate and the section spine — his pick of three variants built
independently by Claude, Codex and Gemini from one brief (see *UI invariants*; `docs/design/`).
v0.7.0 (2026-10-08) made the indications separate cards and the sections collapsible, both at his
request, and v0.7.1 the same morning made every section start collapsed. v0.7.3 the same day opened
the PDF in an in-app viewer with a Back button, after he found it could not be closed in the
installed app, and v0.7.4 made the search row 36px tall. v0.7.5 that evening took his rulings on a
Codex and Gemini check of the whole transcription against the PDF, reworded one page-5 line at his
direction, shortened the Indications intro and removed the verification notice at his request;
v0.7.6 set that line's culture step under it as an indented later step. v0.7.7 removed the page
references and the Copy link and made the cards on the other tabs collapse, all at his request. Peer reviews (Codex, or Gemini when Codex's quota was
spent; single engine each time, both separately for v0.7.5 and v0.7.6) ran before
the first commit and before each release — verbatim reviews and dispositions in `docs/reviews/`.
Full changelog: `docs/HISTORY.md`.
