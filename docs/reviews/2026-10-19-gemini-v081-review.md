# Gemini peer review — v0.8.1, 2026-10-19

The required review before the v0.8.1 commit. It is single-engine (Gemini): Codex was tried first
and refused with its usage limit ("You've hit your usage limit … try again at 2:43 PM"), before any
model turn. Thiago asked "you can remove the corrected from pdf box under source", so the Source
page's "Corrected from the PDF" card is gone; `transcription.corrections` stays in the data, and
flag 08 and the "Checked against the PDF" list still say the route is the app's. No clinical value
changed.

- **How it ran.** agy 1.4.2, `gemini-3.8-flash-high`, stream-json stdin, `--mode plan --sandbox
  --disable-slash-commands`. Status `SUCCESS`, one turn, step types `user_input` and
  `agent_response` only (no tools). 27,692 input tokens for a 47,281-byte prompt.
- **The packet.** The 159-line diff, `SourceView.jsx` in full (134 lines), the whole `transcription`
  object (`pmg.js` 985–1048), `ExpandAll` / `CollapsibleCard` / `OpenCards` from `shared.jsx` and
  `App.jsx`, a grep of `src/`, `tests/` and `scripts/`, and `CLAUDE.md` / `README.md` excerpts, each
  checked against the tree before sending. The receipt matches.

**Nothing below was dismissed or softened.** Gemini's `file:///` links are shortened to `file:line`.

## Gemini's response (verbatim)

Packet check: Received sections A through F. Section B line count is 134 lines (ending with a closing brace on line 134).

---

## Findings

### 1. [Medium] [CLINICAL] [pmg.js](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1033-L1034): Comment contradicts flag contents regarding clinical corrections vs observations
- **File:Line:** [`src/data/pmg.js:1033-1034`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1033-L1034) (and [`src/data/pmg.js:990-991`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L990-991))
- **What is wrong:** 
  1. The comment preceding [`transcription.flags`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1035) states:
     ```javascript
     // Things a physician reviewer should look at. These are observations about
     // the source document, not corrections — the app shows the PDF's values.
     ```
     However, Flag 08 ([`src/data/pmg.js:1043`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1043)) explicitly describes an active clinical correction made by the app: *"The open-fracture bullets print no route; the app shows IV for every drug in them, at a physician's direction."* Here, the app does **not** show the PDF's values; it inserts an IV route where none existed. Now that the dedicated "Corrected from the PDF" card is deleted, this item is the sole remaining disclosure, and claiming the flags contain *"not corrections — the app shows the PDF's values"* is inaccurate and self-contradictory.
  2. In [`src/data/pmg.js:990-991`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L990-L991), the docstring claims [`transcription`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L992) is *"Rendered on the Source page."* While [`transcription.flags`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1035) is rendered, [`transcription.corrections`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1000) is no longer rendered on the Source page as of v0.8.1.
- **Why it matters:** In a clinical reference guideline, developer and reviewer comments must distinguish faithfully between verbatim document reproduction and clinical overrides.

---

### 2. [Low] [CLINICAL] [SourceView.jsx](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L12): Obscured reference target and loss of per-regimen before/after transparency
- **File:Line:** [`src/components/SourceView.jsx:12`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L12) & [`src/components/SourceView.jsx:95-105`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L95-L105)
- **What is wrong:**
  1. The `CHECKED` list at line 12 states: *"...apart from the IV route noted below."* In the layout, this sits inside the "Checked against the PDF" card. Below that card is a section introduced as *"Things a human should look at in the document itself:"* followed by 11 flags. Flag 08 is the IV route note. A reader encountering "noted below" receives no direct anchor, section header, or flag number; the note is embedded among unrelated PDF discrepancies (indication lookups, dosing table omissions, metronidazole frequencies, pediatric notes).
  2. With the removal of the `<CollapsibleCard id="source:corrections" title="Corrected from the PDF">`, the specific before-and-after mapping showing which 6 regimens were altered, where multi-drug regimens had IV inserted (e.g., Ceftriaxone + Vancomycin becoming Ceftriaxone IV + Vancomycin IV), and which exact bullets were modified is no longer accessible anywhere in the UI.
- **Why it matters:** The physician owner specifically directed this removal (*"you can remove the corrected from pdf box under source"*). However, clinically, an attending or resident reviewing provenance cannot inspect the specific transcription diff without inspecting the underlying source code or manually cross-referencing against the raw PDF.

---

### 3. [Low] [SourceView.jsx](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L6): Redundant single-key `ExpandAll` control
- **File:Line:** [`src/components/SourceView.jsx:6`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L6), [`src/components/SourceView.jsx:110`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L110)
- **What is wrong:** [`KEYS`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L6) is now `["source:references"]`. [`ExpandAll`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx#L92) renders a standalone right-aligned button ("Expand all" / "Collapse all") positioned 4px above the single [`CollapsibleCard`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx#L111) for References.
- **Why it matters:** While the logic functions correctly without runtime error (see category analysis below), an "Expand all" button controlling a single card is redundant and non-standard UX. The References card already contains a 56px interactive accordion header button with an expansion chevron.

---

### 4. [Info] [CLINICAL] [SourceView.jsx](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L105-L130): Clinical values line-by-line diff audit
- **File:Line:** [`src/components/SourceView.jsx:105-130`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L105-L130), [`src/data/pmg.js:1043`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1043), [`CLAUDE.md:62-71`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/CLAUDE.md#L62-L71), [`docs/HISTORY.md:746-752`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/docs/HISTORY.md#L746-L752)
- **What is wrong:** Refutation/Confirmation of clinical values touched:
  - **Confirmed:** The diff touches **NO** underlying clinical drug data, doses, frequencies, routes, durations, redosing intervals, or alternatives in the verified dataset.
  - **Flagged clinical representations in the diff:**
    - Line [`SourceView.jsx:12`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx#L12) changes text referencing clinical route: *"IV route listed below"* → *"IV route noted below"*.
    - Lines deleted from [`SourceView.jsx`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/SourceView.jsx) removed the rendered display of 6 clinical regimens containing drugs, doses, frequencies, and routes (`Cefazolin 2 g IV Q8H`, `Vancomycin IV: pharmacy to dose`, `Ceftriaxone 2 g IV Q24H + Vancomycin IV: pharmacy to dose`, `Levofloxacin 500 mg IV Q24H`, `Cefepime 2 g IV Q8H + Metronidazole 500 mg IV Q12H + Vancomycin IV: pharmacy to dose`, and `Levofloxacin 500 mg IV Q24H + Metronidazole 500 mg IV Q12H`).
    - Line [`src/data/pmg.js:1043`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1043) removed `(see the corrections)` from Flag 08 which refers to the clinical IV route.
    - [`CLAUDE.md`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/CLAUDE.md#L62) and [`docs/HISTORY.md`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/docs/HISTORY.md#L746) cite clinical routes and drugs in prose ("every open-fracture drug is shown IV", "cefepime alone").

---

### 5. [Info] [package.json](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/package.json#L4): Version bump consistency
- **File:Line:** [`package.json:4`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/package.json#L4), [`package-lock.json:3,9`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/package-lock.json#L3)
- **What is wrong:** None. Version is bumped cleanly and synchronously from `0.8.0` to `0.8.1` in both [`package.json`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/package.json) and [`package-lock.json`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/package-lock.json) (both root and `packages[""]`).

---

## Detailed Review Categories

### 1. Stale references to removed card or `source:corrections`
- **Result:** **None found** in executable code or tests.
- Analysis of raw grep output (Section E):
  - `source:corrections` does not appear anywhere in `src/`, `tests/`, or `scripts/`.
  - `"see the corrections"` was completely removed from Flag 08; zero occurrences remain.
  - `transcription.corrections` is retained in [`src/data/pmg.js:1000`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js#L1000) and continues to be tested by [`tests/pmg.test.js:273`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/tests/pmg.test.js#L273) and referenced in [`scripts/verify-pmg.mjs:75`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/scripts/verify-pmg.mjs#L75).

### 2. Unused imports or variables in `src/components/SourceView.jsx`
- **Result:** **None found**.
- Every imported symbol is actively referenced:
  - `FileText` (lines 39, 51), `ShieldAlert` (line 69).
  - `references` (line 114), `source` (lines 41, 43, 47, 59), `transcription` (line 97).
  - `Card` (line 37), `CollapsibleCard` (line 112), `ExpandAll` (line 110), `PageHeader` (line 35), `ToneCard` (line 67), `keepUnits` (line 102).
  - `PdfButton` (line 50).
  - Constants & helpers: `KEYS` (line 110), `CHECKED` (line 81), `NOT_CHECKED` (line 89), `IconTile` (line 39).

### 3. Behavior of `ExpandAll` with a single key
- **Result:** **Behaves correctly in runtime logic; redundant in UI.**
- Analysis of [`ExpandAll`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx#L92) and [`OpenCards`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx#L63):
  - `keys.every((k) => opened.has(k))` with a single element evaluates whether that single key is present.
  - On mount, `allOpen` evaluates to `false`; clicking invokes `setMany(["source:references"], true)`.
  - [`App.jsx:44-51`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/App.jsx#L44-L51) iterates `keys`, adds the key to `opened`, and re-renders.
  - `allOpen` becomes `true`; the button toggles to "Collapse all".
  - Toggling via the card header directly synchronizes with `ExpandAllButton` state.
  - No infinite loops, exceptions, or broken states occur.

### 4. Accuracy and ambiguity of IV route disclosure
- **Result:** **Accurate in fact, but weakened in presentation and specificity** (see Finding 2).
- The wording changed from "listed below" to "noted below". The note exists in Flag 08 below the table, but without direct linkage or per-regimen breakdown.

### 5. Documentation and comment integrity
- **Result:** **Comment contradictions identified** (see Finding 1).
- [`CLAUDE.md`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/CLAUDE.md) (lines 62-71, 254-258, 517-521) and [`docs/HISTORY.md`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/docs/HISTORY.md#L743-L752) accurately document the removal, the date (2026-10-19), the rationale (Thiago's request), and the retention of `transcription.corrections`.

### 6. Clinical values audit
- **Result:** **Confirmed no clinical values altered** (see Finding 4).

### 7. Logic, accessibility, mobile layout, tests, and packaging
- **Accessibility/Disclosure:** The specific diff table is removed from the DOM.
- **Mobile Layout:** The button retains `-mb-4` and a 44px touch target, which renders cleanly on 375px screens above the card, despite being functionally redundant.
- **Tests:** The flag test in [`tests/pmg.test.js:205`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/tests/pmg.test.js#L205) continues to pass because Flag 08 contains no dose pattern or quoted strings. [`tests/pmg.test.js:272`](file:///C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/tests/pmg.test.js#L272) continues to test `transcription.corrections` against `openFractures`.
- **Packaging:** Synchronized at `v0.8.1`.

---

## Cannot see
1. **Live test execution and verifier output:** Cannot run `npm test` or `node scripts/verify-pmg.mjs` to confirm the 151 tests pass.
2. **Unshown test files:** Cannot inspect the full test suite outside the excerpts (e.g., whether component tests exist for `SourceView.jsx` or `ExpandAll`).
3. **Unshown documentation and codebase files:** Cannot see unquoted portions of `CLAUDE.md`, `README.md`, or the remainder of `src/data/pmg.js` outside the provided sections.
4. **The source PDF document:** Cannot view the October 2026 MU Health PMG PDF to verify clinical claims or document text directly.
5. **Visual rendered browser layout:** Cannot visually verify font spacing, mobile viewport rendering, or print styles in a live browser.

## Disposition (Claude)

1. **Medium, comments — fixed.** True: the comment above `flags` said they were "not corrections",
   while flag 08 discloses the app's IV route (that contradiction predates v0.8.1, but the card's
   removal makes the flag the only disclosure). The comment now says two flags mark where the app
   departs from the page (the dose lookup and the IV route). The `transcription` docstring now says
   the flags are rendered and the corrections are not. Comments only.
2. **Low, per-regimen before/after gone — Thiago's call, left as asked.** True: the six
   before-and-after strings are no longer anywhere in the interface; they are in
   `transcription.corrections`, which the tests pin. Removing them is what was asked. "Noted below"
   points to flag 08 without a number, because the numbers are computed from the list order.
3. **Low, Expand all over one card — left, raised with Thiago.** True; it works (checked in the
   preview: one press opens References and the label turns to "Collapse all"). `CLAUDE.md` puts
   Expand all on every tab that collapses, so it stays unless he says otherwise.
4. **Info, clinical values.** Agrees with the diff: no dose, drug, frequency, route or duration in
   the data changed. A reading of the diff, not clinical verification.
5. **Info, version.** No action.

**Checked in the preview (dev server, 375px):** the card is gone, no "see the corrections" or
"Corrected from the PDF" text is left on the page, "IV route noted below" is there, no horizontal
scroll, no console errors, Expand all opens and closes References. 151 tests, the verifier (PASS)
and the build pass.
