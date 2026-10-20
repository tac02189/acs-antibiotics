# ACS Antibiotic Guide — project instructions

Extends the root `CLAUDE.md` (`$OneDrive/[3] Claude/CLAUDE.md`); read both. The README covers
running, architecture and the verification design. This file holds what a session must not get wrong.

## What it is

A mobile-first PWA that turns the **MU Health Acute Care Surgery Antibiotic Surgical Prophylaxis and
Empiric Treatment Practice Management Guideline** (review date October 2026, 8-page PDF; v0.8.0
replaced the December 2025, 12-page edition the app was built on) into a bedside reference for the
ED. "ACS" here is Acute Care Surgery, never acute coronary syndrome — the header spells it out for
exactly that reason.

| | |
|---|---|
| Live | https://acs-antibiotics.web.app — Firebase project and site `acs-antibiotics`, Hosting only (no Firebase SDK) |
| Repo | https://github.com/tac02189/acs-antibiotics — public since 2026-10-06 (created private the same morning; Thiago asked for it to be public after the first deploy), `main` |
| Deploy | `npm run deploy` = `npm run build` (tests → verifier → `vite build`) + `firebase deploy --only hosting` |
| Verify a deploy | Compare live `index-*.js`, CSS and `sw.js` with `dist/` by sha256 |
| Preview | `.claude/launch.json`: `acs-antibiotics-dev` (5173) and `acs-antibiotics-preview` (4173); `variant-claude` / `variant-codex` / `variant-gemini` (5176 / 5174 / 5175) run design worktrees at `%USERPROFILE%\acs-variants\<engine>` through `.claude/variant-dev.cjs`, when those checkouts exist |
| Source PDF | `public/MU-ACS-Antibiotic-PMG-2026-10-<hash>.pdf` — the exact name is `source.file` in `src/data/pmg.js` (content-hashed; the verifier checks it). The unhashed original at the folder root (`Antimicrobial Use for Acute Care Surgery.pdf`, where Thiago drops a new edition) is gitignored |

## Clinical content — the rules

- **`src/data/pmg.js` is clinical content, all of it.** A wrong dose there reaches a prescriber. Never
  change a drug, dose, frequency, duration, redosing interval or alternative without the PDF open, and
  never on your own initiative. Neither the verifier nor a peer review can confirm a clinical value;
  flag it for a human (root `CLAUDE.md`, *Clinical content gets flagged, not judged*).
- **The October 2026 edition (v0.8.0, 2026-10-16) is a different document, not an update.** Its
  indication tables (pages 2–4) name drugs only: "Preferred Antibiotic(s)", "Alternative
  Antibiotic(s) if Allergy to Preferred", "Duration". The doses are in two tables of their own:
  surgical prophylaxis (page 3: dose, OR redosing interval, OR infusion time) and empiric therapy
  (page 4: dose, route, frequency). Open fractures moved to page 5; the references are pages 6–8.
  The December 2025 edition's fever workup, pediatric dosing, debridement and femoral-shaft rules
  and antibiogram are not in it and were removed from the app. The December data, verifier and
  rules are in git history (up to `e226982`, v0.7.13) if an old question needs them.
- **The dose beside a drug on an indication row is the app's lookup, not the PDF's row** (Thiago,
  2026-10-16, chose "Dose from matching table" over drug names only). `src/lib/dosing.js` looks the
  drug up in the dosing table that matches the row's section `kind`: prophylaxis for Trauma,
  Emergency General Surgery and Elective Surgery, empiric for acute infections.
  - **A drug the prophylaxis table does not list takes the empiric table's line** (v0.8.2; Thiago,
    2026-10-19: "Use the empiric table dosing for places where dosing is missing"). That is four
    drugs on two rows: Doxycycline (open face / mandible fracture alternative), and Linezolid,
    Clindamycin and Cefepime (necrotizing soft tissue infection debridement). Until v0.8.2 they
    showed no dose, his 2026-10-16 call, because the empiric line is a treatment dose and frequency,
    not an OR redosing interval.
  - **The fallback is always marked**: "· empiric table · no OR redose listed" on the pill (each note
    kept whole on its line), "From the empiric dosing table (not in the prophylaxis table). The PMG
    gives it no OR redosing interval." under it on the plate, the row's "Doses:" caption names the
    drugs and links both tables, the Trauma and EGS blurbs count them, and the Source page's flag
    says so. Never show one unmarked. The "no OR redose" notes answer the Codex review of
    2026-10-19 (Q8H beside "OR redose" pills could read as a redosing interval); Thiago asked for
    the pill's the same day.
  - **There is no fallback the other way** (an empiric row never takes a prophylaxis line).
    `tests/pmg.test.js` pins the lookup, the four drugs, the two rows and their dose lines.
  - Every place that shows a looked-up dose says where it comes from. The pill's "OR redose 3 h" is
    the table's "Redosing Interval for OR Only (hours)" column, shortened in the preview Thiago
    approved.
- **The "pending physician verification" notice is shown again** (v0.8.0), as this file said to for
  a new edition, until a physician has read the October 2026 transcription. It was removed in v0.7.5
  (2026-10-08) for the December edition, at Thiago's request, after he read Codex and Gemini checks
  of that transcription. Remove it again only at his word; `tests/pmg.test.js` pins it, so change
  the test with it.
- **The app shows the PDF's values even where the PDF disagrees with itself.** Known places (also
  listed on the Source page, `transcription.flags`): levofloxacin 500 mg Q24H in the open-fracture
  allergy regimens against 750 mg in both dosing tables; metronidazole Q12H in the open-fracture
  regimens against "Q8H or Q12H" in the empiric table; vancomycin 15-20 mg/kg (prophylaxis table)
  against "Pharmacy to dose"; cefazolin's weight-based prophylaxis dose against 2 g elsewhere. Do
  not "fix" these in the data — they are the document's to fix, and changing one makes the verifier
  fail, which is the point. (The appendectomy colon below is the one exception, at his word.)
- **Every Source-page note was reviewed by Thiago on 2026-10-19** ("mark them reviewed"). Each
  `transcription.flags` entry is `{ text, reviewed }`, and the Source page prints "Reviewed by a
  physician, <date>" under a note that has a date. A new or reworded note gets no `reviewed` until he
  has read it, and `tests/pmg.test.js` enforces that: it holds a hash of each dated note's date and
  wording (`REVIEWED`), so rewording a dated note fails the build until the date comes off or he
  reads the new wording and its hash is added. A review of these notes is not a reading of the whole
  transcription, so the verification notice stays.
- **The appendectomy duration's third line gets the colon the PDF leaves out** (Thiago, 2026-10-19,
  on note 9: "add colon"): "Perforated without source control: 8 days". It is the edition's one
  cell correction: `transcription.corrections` (`kind: "cell"`) and the verifier's
  `CELL_CORRECTIONS`, scoped to that row and line. The verifier requires the data's line to read
  the corrected form and the PDF's cell to read the original, so the colon going missing fails the
  build. It was a `TYPO_MAP` entry first; that rewrote the phrase on both sides and in every row,
  so it would also have passed a colon dropped from cholecystitis (Codex review, 2026-10-19; both
  are planted controls now).
- **Page 3 prints "≥ 120 kg" as an underlined ">"** (Word's way of drawing ≥). The text layer reads
  ">", and the underline is a separate 4.6 × 0.4 pt rectangle; the verifier's reader turns a sign
  with an underline under it into "≥" / "≤", so the data says "≥" and a ">" there fails the build.
- **One change from the PDF, at Thiago's direction: every open-fracture drug is shown IV**
  (2026-10-16: "They are all IV"). The page-5 bullets print no route at all. Each of the six
  regimens (three bullets, each with its penicillin-allergy sub-bullet) has its entry in
  `transcription.corrections` (`kind: "route"`). The Source page's "Corrected from the PDF" card that
  listed them was removed in v0.8.1 (Thiago, 2026-10-19); the Source page's flags and its "Checked
  against the PDF" list still say the route is the app's. The verifier compares each regimen with the printed bullet with the route set aside, so it
  cannot notice a route going missing; `tests/pmg.test.js` pins IV on every one and the correction
  list against the regimens. (The December edition had the same correction for cefepime alone,
  2026-10-12.) There are no typo corrections in this edition, so `TYPO_MAP` is empty; add to it and
  to `transcription.corrections` together or not at all. A correction that belongs to one
  indication cell goes in `CELL_CORRECTIONS` instead (the appendectomy colon, above).
- **Each "If penicillin allergy" sub-bullet sits under the bullet it is printed under**, as page 5
  nests it (`allergy` on each `selection` and `contamination` entry), and the app indents it there.
  In the December edition the allergy regimen was a row of its own and Thiago kept it so after a
  Codex review (2026-10-09); the new PDF nests it, so the app does too. The verifier binds each
  sub-bullet to its parent by comparing the printed list in order with its levels.
- **Drug names follow the PDF**: "Sulfamethoxazole-trimethoprim" (the December edition's
  "Sulfamethoxazole-TMP" is gone), and the brand / class table in `drugs{}` is app-authored search
  help that nothing checks.

## Verification — do not weaken it

`npm run verify` (`scripts/verify-pmg.mjs`) must print PASS before any commit, and `npm run build`
refuses to run while it fails. Its design and limits are in the README; the parts a future session is
most likely to break:

- **Rows and columns both come from the PDF's own cell borders** (thin filled rectangles from the
  operator list): horizontal ones bound the rows, and the vertical ones that cross a row bound its
  cells (`tableGrid`). In the December edition columns were measured x-bands; the October tables
  sit at five different column layouts, and the borders are exact. Each table is found by a measured
  `REGIONS` box; if a new edition moves a table, the row counts and header checks fail — re-measure,
  do not loosen the comparison.
- **Text items are joined as printed** (`joinLine`): a space only where the PDF has one (a space in
  an item, or a visible gap). Word splits words where formatting changes ("Metronidazol" bold, then
  "e 500 mg"; "d" "osing"; "repai" "r"), and joining every item with a space made those read as two
  words.
- **The comparison is per cell, both directions, with a bijection on rows**, the section's printed
  title and column headers included. Every weakening that looks harmless (prefix match,
  "contains", skipping empty cells) is a way for a transposed row to pass. The classification rows
  and the open-fracture lists are bijections or ordered lists too, each printed item used once.
- **`tests/verify-controls.test.js` must stay green after any edit to the verifier.** It plants 109
  specific errors (and asserts each mutation actually changed the data, and that the error names the
  right thing); if a new check is added, add a control that fails without it. The first version of
  the verifier passed 38 of 38 planted wrong-data edits in the 2026-10-06 peer review
  (`docs/reviews/2026-10-06-codex-pre-commit-review.md`) — every substring, label-blind or
  prefix-tolerant comparison in it turned out to be an escape. Do not reintroduce one.
- **Page 5 is compared as ordered lists with their levels** (`bulletItems`): the selection bullets
  with their sub-bullets, the contamination bullet with its sub-bullet, the durations. The displayed
  regimen tuples must re-state the printed bullet exactly with the route set aside
  (`regimenAsPrinted`), each part in its own field (dose and frequency are shape-checked; a note holds
  words only, no digit, mark or drug), with an entry for every drug the text names.
- **Prose is anchored at both ends**: the timing rule between "Antibiotic Timing:" and "Antibiotic
  Selection:", the contamination scope between its heading and its bullet, page 1 as the whole page,
  the references as one run from the "Reference" heading to the end of page 8 (each page's running
  header excluded), the empiric footnote as its whole cell. A phrase match passed a value cut short
  at either end in the December verifier (Gemini whole-codebase review, 2026-10-14).
- **A section's `kind` must match its printed title** ("…Surgical Prophylaxis" or "Empiric…"):
  `kind` picks the dosing table a row's doses come from, so a flipped kind would put empiric doses
  on prophylaxis rows with every printed cell still matching.
- **Order, pages and inventory are checked too** (Codex review, 2026-10-16, which found each one
  passing): indication rows in the PDF's order within each section and the fracture types in the
  table's order; the `page` of each dosing table and of the open-fracture page; every `drugs{}` key
  named by a verified table (By drug lists them all as "named in the PMG"); no URL in a reference's
  `text`, and every link annotation on pages 6–8 the `url` of a reference starting on that page.
- **App-authored text that names PDF content is tested, since the verifier cannot read it**
  (`tests/pmg.test.js`): every dose, frequency and quoted phrase in `transcription.flags` must be in
  the verified data; a section's `title` uses only words of its printed title; a short label uses
  "and" or "or" only where its PDF name does; each route correction's `where` is its bullet's exact
  path; no data string starts or ends with a space.
- **`norm()` and `loose()` keep a point, comma or colon between digits, and a dash before a digit**:
  "1.5g/dose" and "1–5g/dose" both became "1 5g/dose" (Codex reviews, 2026-10-14), and "1,500 mL"
  and "1:500 mL" both "1 500ml" (Codex review, 2026-10-16). Any other punctuation `loose()` drops.

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
    focus ring), the gold pill (the Allergy toggle, after its audience pills), the tab row with
    the gold underline (from `sm` up), the gold-outlined PDF button, the drug name over its mono dose
    line, and JetBrains Mono for doses.
  - From the Pediatric CPG: Source Sans 3 as the one face, the gold rule under the header (phones),
    bordered, divided list groups (`Group` in `shared.jsx`), the `warn` / `danger` / `good` tone
    cards (its `tones.js`, as `TONES` in `shared.jsx`), teal links and solid buttons, the white
    footer, and the amber draft banner under the header (rendered again since v0.8.0; see
    *Clinical content*).
  - **The dose plate** (`Plate`, `Regimen` / `DrugDose`, `OrderLine`, `PlateField`, and the pills
    `DrugPills`, `AlternativePills` and `RegimenInline` in `shared.jsx`): Mizzou black (`--plate`, 17 17 17 in both schemes) with the drug name in white
    (`plate-ink`) and the dose, route and frequency in gold mono (`plate-dose`, Mizzou gold).
    `plate-soft` is for the "plus" connector, the dosing tables' column headers on the plate
    (`PlateField`), and on the expanded plate (`OrderLine`, `DrugDose`) for the route and the note
    too. On the pills the route and the note stay gold with the dose: Thiago saw the
    three options on 2026-10-15 (gold, grey as on the plate, or route gold and note grey) and said
    "keep A"; `plate-line` is its 1px inset edge
    (the plate's own colour in light, where the black fill is the edge; `rule-strong`'s grey in
    dark, 4.3:1 on the #1C1C1C card — slate-600 was 1.9:1 on the old slate-800 card, Codex review
    2026-10-07).
    Every medication in the app sits on one — a collapsed row shows one pill per drug with a "+"
    before each partner (visually; a hidden "plus", the PDF's word, is what a screen reader hears),
    pills wrapping as units; the expanded Regimen, the open-fracture regimens, the two dosing tables
    (each drawn as one plate, v0.8.0) and the By-drug lists use the same surface — so a medication reads the same way wherever
    it appears. Inside a pill a real space separates the name from the dose: the flex gap is visual
    only, and without it a screen reader or the clipboard gets "Cefazolin2 g" (Gemini review,
    2026-10-07). An open-fracture note follows its tuple with the PDF's own colon ("IV: pharmacy to dose"), and
    a note, like a prophylaxis pill's "· OR redose 3 h", moves to the next line as a unit rather
    than splitting (`inline-block`, v0.7.9; on the pills too, v0.7.10). The drug-name button on
    a plate is 44px tall (`py-[11px] -my-[11px]`). Gold is legible as text only on the plate: 10.5:1 there, 1.8:1
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
    from the next (`space-y-2`), not a row in a divided `Group`. The other lists (By drug)
    keep `Group`, whose dividers between rows are `rule` (dividers inside a row or a card stay
    `rule-soft`); row titles are 16px bold. The spine also marks the open-fracture "Antibiotic
    selection" card (trauma). In
    By drug, the hue dot before an indication is paired with a visually hidden section name, so the
    section is never colour alone.
  - **Antibiotic selection is always open** (v0.7.12, Thiago, 2026-10-14: "it doesn't need to
    expand"; v0.8.0 carried it to the October 2026 page). It is a plain `Card` on the trauma spine:
    each printed bullet as `RegimenInline` pills under the PDF's label for who it applies to (14px
    bold; `Bullet`), the pills of v0.7.10 (Thiago, 2026-10-12: "add the pills"), with its "If
    penicillin allergy" sub-bullet indented under it (see *Clinical content*); then, under a rule,
    the "Open Fracture Contamination" heading, the PDF's scope line ("Applies to type I, II, & III
    fractures") and its bullet with its sub-bullet. Phones stack each label over its pills; from
    `sm` the label takes a 10rem column. With the Allergy toggle on, each sub-bullet takes the
    amber label, wash and inset `ring-warn-line` edge, over the same 8px overhang either way, so
    nothing moves. The December edition's footnotes and its "Adult & pediatric dosing table" link
    (v0.7.13, Thiago: "i meant just the link for adult/pediatric dosing") went with that edition:
    the October bullets carry their own doses, and there is no open-fracture dosing table.
    **Duration is a label-led table** (v0.7.9, Thiago, 2026-10-09: "make duration tab also look
    like gustilo-anderson"): the fracture type in a 6rem column (10rem from `sm`), 16px bold, the
    duration beside it at 15px, rows divided by `rule-soft`.
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
      only during a search. The four blurbs are app-authored descriptions, not PDF text. v0.8.0
      rewrote all four, because the December ones described that edition (Elective's "one-time
      dose; vancomycin added if known MRSA colonization" was no longer true): each now says
      which kind of table the section is and which dosing table its doses come from. Thiago had
      read and approved the December four on 2026-10-08. On 2026-10-19 (v0.8.2) he asked for the
      Trauma and EGS blurbs to add the drugs taking the empiric table's line ("…; one drug it
      does not list, from the empiric table.", "three drugs" for EGS); `tests/pmg.test.js` keeps
      each count equal to the data. The Elective and Empiric blurbs are as v0.8.0 wrote them.
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
    and prints open; `tone="warn"` gives it the amber card (unused since v0.7.8). Every one starts
    collapsed. Which are
    open is one set of keys (`"<view>:<id>"`) held in `App` and handed down through the
    `OpenCards` context (`useCardOpen`, `setMany`), so the choices survive a trip to another tab;
    it is not stored.
    - What collapses: Fractures' duration and classification cards; Dosing's two tables and the
      two lists of re-dosing rules (v0.8.0: each table is one card whose rows are a flat table on
      one plate, so an opened table can be scanned; v0.7.7's per-drug Dosing rows went with the
      December table); Source's References (its corrections card went in v0.8.1). By drug and
      Indications already did.
      (Until v0.8.0 the fever workup's branches, the femoral-shaft card and the antibiogram card
      collapsed too.)
    - What does not, on purpose: the open-fracture timing card (the one number to remember) and
      Antibiotic selection (above), the empiric dosing footnote (it qualifies every dose in that
      table), the Source document card (the PDF button) and the Source physician card (v0.7.8,
      Thiago: "keep the physician card open"; it says what the build's check does not cover, and
      a v0.7.7 review flagged it hidden). Keep disclosures open.
  - **Expand all / Collapse all** (v0.7.8, Thiago, 2026-10-08: "add an expand all button"), on
    every tab that collapses except By drug (one drug open at a time, by its URL). It reads
    "Expand all" while anything it covers is collapsed and "Collapse all" once everything is open.
    It exists partly because an `inert` panel hides its text from the browser's find-in-page (a
    v0.7.7 review point); opening everything brings it back.
    - Fractures, Dosing and Source: `ExpandAll` with the view's list of keys, on its own
      right-aligned row just above the cards it covers (20px above, 4px to the first card; the
      `-mb-4` is on an inner element because `space-y-*` overrides the row's own bottom margin).
    - Indications: `ExpandAllButton` in the row with the search count, over what is on screen:
      every visible section and every row in it that opens. During a search it uses the search's
      own collapsed set, and Collapse all also overrides a narrow search's auto-opened rows.
  - **No page references in the interface** (v0.7.7, Thiago, 2026-10-08: "remove the page
    references (i.e. p.1) and the copy link"). The "p.N" chips on rows, section heads, card
    headings and eyebrows, the By-drug links that were labelled by page ("See all", "Full table"
    now) and the indication rows' Copy link are gone; `PageTag` went with them. The data keeps its
    `page` fields (the verifier uses them), and the Source page's prose still says which pages
    were checked. `#/i/<id>`
    links still work (By drug uses them); nothing in the app copies one any more.
  - Mizzou gold appears in the brand bar, the switched-on Allergy pill, the active navigation
    mark and the doses on the plate; `deepgold` is for icons and 2px marks on light surfaces, never
    text (3.3:1).
  - Section hues follow the Peds categories (trauma rose, EGS amber, elective sky, empiric violet; `--hue-empiric`, `--hue-inpatient` until v0.8.0)
    and appear only as the spine and as the dots in By drug's use lists: rows and plates stay neutral.
  - **Tone cards and tone marks never grade clinical content** (Gemini review, 2026-10-07). The PDF's
    regimen column is transcribed, not recommended: its label is neutral, with no check mark, and
    its plate is the same black for every row — the Antibiogram's green "first-line" treatment was
    deliberately not carried over. Amber marks the alternative column, and the open-fracture
    penicillin-allergy sub-bullets, only while the Allergy toggle is on (label, wash and rule); when
    it is off, that label is muted like the others. Rose is for the open-fracture timing rule, emerald only for "Checked against the PDF" on the
    Source page.
  - No entrance animation and no continuous animation; motion is the row expand/collapse only (a
    `CollapsibleCard` counts as a row; and the chevrons turning), and `prefers-reduced-motion` zeroes transitions.
- **Search input is `text-[16px]`.** Smaller and iOS zooms the page on focus. Only the font size
  triggers that zoom, so the field itself is 36px tall (`h-9`, v0.7.4, Thiago, 2026-10-08: "go
  with 36px"). Do not get under 16px text with `maximum-scale=1` (it blocks pinch-zoom on Android)
  or by scaling the field down. The Allergy pill is drawn 36px to match, and its `::before`
  reaches 4px above and below into the rows' padding, so its tap area stays 44px; the clear button
  does the same on all four sides (44px square). The focus ring follows the drawn pill. The brand
  bar's theme toggle and PDF button are drawn 40px, with a `::before` 2px further each way, so
  their tap areas are 44px too, inside the 8px gap between them (v0.7.11).
- **The "Allergy" pill highlights the PDF's "Alternative Antibiotic(s) if Allergy to Preferred"
  column**, and the open-fracture "If penicillin allergy" sub-bullets. Thiago renamed it from "PCN
  Allergy" on 2026-10-16 (v0.8.0): the October column is about allergy to whichever drug is
  preferred (azithromycin → doxycycline on the CAP row), not penicillin alone. The field label on
  each row and on the highlighted note stays the PDF's column header, and the pill's `title` says
  what it highlights. The December column ("PNC Allergy/Alternative") also carried contamination
  escalation and MRSA add-ons, which is why the pill was "Alternatives" for a while before he renamed
  it "PCN Allergy" on 2026-10-08 (`docs/HISTORY.md`). The internal names (`pcn`, the
  `"pcn"` update handoff) were kept, so an update reload from v0.7.x keeps the toggle.
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
    window, a reload with the viewer open, or Forward can leave a dead Back press. Each
    reopen-and-close inside the window leaves one, and they add up if the reader changes route
    between them; that case applies in the installed app too, since the history policy does not
    depend on it (Codex whole-codebase review, 2026-10-14, which corrected "never more than one;
    none of it applies in the installed app"). Left as it is: Thiago, 2026-10-14, "pdf issue
    doesn't seem to be a problem on phone".
  - `page` opens at a page (no caller since v0.8.0 took the fever workup's link to page 5): earlier pages draw under the loading cover and
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
  asset URL. Do not add a catch-all rewrite. Every path also gets `X-Content-Type-Options: nosniff`,
  `frame-ancestors 'none'` with `X-Frame-Options: DENY`, and a `Referrer-Policy` (v0.7.11). Nothing
  of Thiago's frames the app; if something ever needs to, change `frame-ancestors` first.
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
  - **Dark is a black version of the same page** (Thiago, 2026-10-19: "make the dark mode
    background black"): a black canvas, the same black as the bar, near-black neutral cards
    (#1C1C1C) and chips (#383838, the colour of `rule`), neutral greys for text and lines instead
    of slate (no surface, text or line slate-tinted against the black bar and plate), the tone
    washes at their 950 shades, hues at the 400s instead of the 600s, and the same black plate (#111, a shade under the card) with a
    1px edge in `rule-strong`'s grey. `well` is the canvas, as in light, so an expanded row
    opens onto black. Until then the canvas was slate-900 and the cards slate-800.
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
  verbatim and parses its numeral for the big readout; the Dosing intro and the Indications intro say where
  doses come from and restate none; cross-link blurbs and search examples carry no clinical claim,
  and drug names used as search examples come from `drugs{}`.
- **Phones get `BottomNav`; the header's tab row shows from `sm` up.** Both navigate the same five
  routes (six until v0.8.0 took the Fever workup tab). All five fit the column from 640px; the row scrolls
  if they ever do not.
- **Type scale (v0.4.0).** Every font size is a step of 11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 ·
  28 · 36 px, nothing smaller (42px went on 2026-10-08, when the open-fracture timing card was made
  smaller at Thiago's request and nothing else used it). `tests/type.test.js` lists each step's role and fails the build on
  any other size written in the source: a `text-[…]` value that is not a step in px, a Tailwind named
  size (`text-sm` and the like, which also set a line height), a CSS `font-size` or `font`
  declaration, an inline or SVG font size, a `fontSize` theme key, or a `<sup>`/`<sub>` without its
  own size (preflight makes those 75% of the text around them). It reads source, not computed styles.
  The roles, as of v0.6.1:
  - 18px: the section heads on the Indications list, the drug names in By drug, card
    headings on phones, the timing sentence from `sm` up.
  - 16px: the drug name and its dose line on the expanded plate (Regimen), the row
    titles on the Indications list and in the Gustilo-Anderson table, the fracture types in
    Duration (v0.7.9), the brand title, the search input, the timing sentence on phones.
  - 28px / 36px (`sm` up): the open-fracture timing numeral.
  - 15px: expanded clinical detail (the alternative and duration fields; the re-dosing rules;
    durations on Open fractures), the dosing-table values on the expanded plate (mono), the drug
    names in the dosing tables, and the row titles in By drug's use lists.
  - 14px: the regimen labels on Antibiotic selection, the dosing-table cells, page intros,
    Source-page prose, buttons, the "+" between pills.
  - 13px: the collapsed-row pills (drug and dose), the "or" between alternatives, notes and
    asides, blurbs, the verification notice, tab and pill labels, references.
  - 12px: eyebrows that say who a regimen or dose applies to or give a timing rule; footnotes and
    their marks, the section count, the PDF button, small meta. 11px: every other eyebrow, the
    footnote marks inside pills, the bottom-nav labels, the brand subtitle.
- **`.eyebrow` lives in `@layer components`** (`src/index.css`), so a utility on the same element
  (`text-[12px]`, `text-[13px]`, `tracking-wider`) overrides it (in the utilities layer it would come
  after them and silently win).
- **Numbers stay with their units** (v0.4.0). `keepUnits` in `src/lib/text.js` joins a number to the
  unit after it ("8 days", "13.3 mg/kg/dose", "q12 hours", "≥15 years") and a sign to the number
  after it ("> 10", "× 7") with a no-break space. `fmtDose` uses a narrow no-break space (a thin
  space is a break opportunity: "8 / days" at 375px, "15 / mg/kg" at 414px).
  - Doses, durations, the re-dosing rules, dosing-table cells, the open-fracture text and the
    Source page's flags all pass through one of them. Names and labels
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
  every drug has `drugs{}` metadata, that each short label uses only words from its PDF row name,
  keeps that name's negations ("non", "without"; v0.7.11) and is unique, the dose lookup (matching
  table, no fallback, the four drugs without a prophylaxis dose), the open-fracture IV route and its
  corrections, the appendectomy colon's correction lists, the Source notes' shape and that each
  review date still covers its note's wording, that the
  verification notice is rendered, search behaviour and routing;
  `tests/verify-controls.test.js` runs the verifier on the real data and on 109 corrupted copies; `tests/theme.test.js` guards the two
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
references and the Copy link and made the cards on the other tabs collapse, all at his request;
v0.7.8 kept the physician card open and added Expand all. v0.7.9 (2026-10-09) made the
open-fracture regimen labels headings and drew Duration like the Gustilo-Anderson table, at his
request; a nesting of the penicillin-allergy regimen under Type I & II was reverted before the
deploy, his call on the Codex review. v0.7.10 (2026-10-12) showed open-fracture cefepime as IV, a
listed correction at his direction, and put the regimen pills on the closed card. v0.7.11
(2026-10-14) fixed what whole-codebase reviews by Gemini and Codex confirmed: verifier checks a
cut-short value, a decimal point read as a dash or a relabelled row could pass, a short-label test
an inverted label could pass, the "non purulent" search, By drug dropping the perforated-ulcer
antifungal note, a first-install service-worker race, a page-5 pin, and smaller UI and hosting
items; no clinical value changed. v0.7.12 (the same night) made Antimicrobial by type always open at his request, with
the footnotes under its pills; v0.7.13 (2026-10-15) replaced the dosing plates v0.7.12 had added
under them with the link to the Dosing tab, which was what he had meant. v0.8.0 (2026-10-16)
moved the app to the October 2026 edition of the PMG, a restructured document: new data,
verifier (columns from cell borders), controls and views; doses on indication rows looked up in
the matching dosing table, the Allergy pill, IV on every open-fracture drug and the verification
notice shown again, all at his direction. v0.8.1 (2026-10-19) removed the Source page's
"Corrected from the PDF" card at his request, and v0.8.2 the same day gave the four drugs the
prophylaxis table does not list their empiric-table line, marked, at his direction. v0.8.3 marked
the Source page's eleven notes reviewed by him and added the appendectomy colon he asked for.
v0.8.4 (2026-10-20) made the dark scheme's background black, with neutral greys, at his request. Peer reviews (Codex, or Gemini when Codex's quota was
spent; single engine each time, both separately for v0.7.5 and v0.7.6) ran before
the first commit and before each release — verbatim reviews and dispositions in `docs/reviews/`.
Full changelog: `docs/HISTORY.md`.
