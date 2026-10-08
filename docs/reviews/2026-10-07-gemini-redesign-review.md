# Gemini peer review — v0.6.0 restyle, the questions Codex did not reach, 2026-10-07

**Engine:** Google Gemini `gemini-3.8-flash-high` via Antigravity CLI `agy` 1.3.1, headless
(`--mode plan --sandbox --disable-slash-commands`, stream-json on stdin). No tools: the whole review ran from
a 121 238-byte packet (prompt 6 702 B; the full `git diff 747d13e HEAD -- src tailwind.config.js tests/theme.test.js`
of 43 363 B, which includes the fixes made after the Codex review; `shared.jsx`, `IndicationsView.jsx`,
`DrugsView.jsx` and `OpenFracturesView.jsx` complete and numbered; `contrastFailures()` from
`tests/theme.test.js`; the *UI invariants* section of `CLAUDE.md`). The full `index.css` and `DosingView.jsx`
were dropped to stay under the packet ceiling; their changes are in the diff. One turn, 51 453 input tokens,
42 890 output, 38 376 thinking, 301 s; the event stream holds only `user_input` and `agent_response` steps
(no tool was used). **Why Gemini:** Codex's run on these questions hit its usage limit
(`2026-10-07-codex-redesign-review.md`, run 2B). Single engine for these questions; not clinical verification.

**Questions put:** (e) accessibility; (f) every line that renders a clinical value, and whether its source and
transformation are unchanged; (g) type scale and guard tests, and whether the matrix additions only add; (h) what
the change ignores and where the updated CLAUDE.md is now wrong; (i) a recheck of the sticky-head fix.

---

## Gemini's response, verbatim

### 1. Findings

No High severity findings.

* **Medium** — `src/components/FeverWorkupView.jsx:17`: **Missing `--hue` definition on Fever Workup branch cards.**
  * *What is wrong*: The diff adds `border-l-4 border-l-hue` to branch `<Card>` articles, but `--hue` is never set to `var(--hue-inpatient)` in `FeverWorkupView.jsx` (unlike `OpenFracturesView.jsx:13` which sets `style={{ "--hue": "var(--hue-trauma)" }}`). `--hue` falls back to the default slate grey (`100 116 139`).
  * *Why it matters at the bedside*: Contradicts the UI invariants (`CLAUDE.md`) stating that fever workup branch cards carry the inpatient spine; cards display a neutral grey stripe instead of the inpatient violet visual branding.
  * *Smallest fix*: In `FeverWorkupView.jsx`, add `style={{ "--hue": "var(--hue-inpatient)" }}` to the container `<div>` or cards.

* **Medium** — `src/components/shared.jsx:228-236`: **Missing whitespace separator between drug name and dose in `RegimenInline`.**
  * *What is wrong*: Inside `<Plate as="span">`, the drug name `<span>` and the dose `<span>` are adjacent siblings separated visually only by CSS `gap-x-1.5` on the parent `inline-flex`. In the DOM text stream, there is no space between them (`</span><span>`).
  * *Why it matters at the bedside*: Screen readers (and text selection/clipboard) concatenate the tokens without a space (e.g., reading "Cefazolin2 g" or "Vancomycin*15 mg/kg"), creating acoustic confusion when listening to antibiotic orders.
  * *Smallest fix*: Insert `{" "}` between the closing drug name `</span>` and the opening dose `<span>` in `RegimenInline`.

* **Medium** — `src/components/DrugsView.jsx:171-175`: **Section category in By-drug `UseList` conveyed solely by color.**
  * *What is wrong*: In `UseList`, the indication's section is represented only by `<span className="size-2.5 rounded-sm bg-hue shrink-0" aria-hidden="true" />`. The section title (`bySection[ind.section].title`) is not rendered in text or accessible markup anywhere in the list item.
  * *Why it matters at the bedside*: Violates WCAG 1.4.1 (Use of Color). Color-blind clinicians and screen-reader users cannot determine which surgical section (Trauma, EGS, Elective, Inpatient) an indication belongs to.
  * *Smallest fix*: Add `<span className="sr-only">({bySection[ind.section].title})</span>` inside the link.

* **Low** — `src/components/shared.jsx:159-165`: **Drug-name touch target below 44px.**
  * *What is wrong*: The drug-name `<button>` inside `OrderLine` uses `py-1.5 -my-1.5` on `text-[16px]` leading-snug (~22px), yielding an interactive target height of only ~34px.
  * *Why it matters at the bedside*: Increases mis-tap probability on mobile screens when attempting to tap the drug name next to the dose line.
  * *Smallest fix*: Increase vertical tap target size to at least 44px (e.g. `min-h-[44px]` or expanded pseudo-element tap area).

* **Low** — `src/components/shared.jsx:230`: **Footnote mark inside `RegimenInline` lacks `aria-label`.**
  * *What is wrong*: `OrderLine` (`shared.jsx:150`) sets `aria-label={`footnote ${mark}`}`, but `RegimenInline` (`shared.jsx:230`) renders raw `<sup ...>{mark}</sup>` with no `aria-label`.
  * *Why it matters at the bedside*: Screen readers announce asterisks literally (e.g., "asterisk asterisk") or skip them, rather than identifying them as footnotes.
  * *Smallest fix*: Add `aria-label={`footnote ${mark}`}` to the `<sup>` in `RegimenInline` line 230.

* **Low** — `src/components/IndicationsView.jsx:364` & `src/components/shared.jsx:76`: **Keyboard tabbing scrolls focused row under stuck section head.**
  * *What is wrong*: `scroll-mt-16` is set on `<article>` (`IndicationsView.jsx:349`), but keyboard focus lands on the child `<button>` (line 364). Native browser focus scrolling aligns to the button using root `scroll-padding-top` (which accounts for the app header, but not the sticky section head).
  * *Why it matters at the bedside*: When navigating via keyboard/switch access, tabbing into the first row of a section scrolls the top of the button and its focus outline underneath the opaque `SectionHead` (`z-30 bg-paper`).
  * *Smallest fix*: Add `scroll-mt-16` directly to the interactive `<button>` in `IndicationRow`.

* **Low** — `src/components/IndicationsView.jsx:349` & `src/components/shared.jsx:78`: **`scroll-mt-16` (64px) clips two-line section heads at 200% text zoom.**
  * *What is wrong*: `scroll-mt-16` provides 64px of clearance. At 200% text size, an 18px bold heading wrapping to two lines ("Emergency General Surgery") exceeds 90px in height.
  * *Why it matters at the bedside*: Clinicians using accessibility zoom who deep-link to a row will have the top 25–30px of the target row obscured beneath the stuck section head.
  * *Smallest fix*: Increase `scroll-mt` on rows or dynamically account for section head height.

* **Info** — `src/components/shared.jsx:21`: **Unused `tone` export and `TONES.line` definition.**
  * *What is wrong*: `Regimen` was refactored to neutral `Plate` and no longer takes a `tone` prop. `export const tone = ...` and `TONES.line` are dead code.
  * *Why it matters at the bedside*: Harmless dead code; no operational impact.
  * *Smallest fix*: Remove unused `tone` helper and `line` properties from `TONES`.

---

### 2. Answers to (e)–(i)

* **(e) Accessibility**:
  * *Target size*: Drug button (`shared.jsx:162`) is ~34px tall (`py-1.5 -my-1.5`), failing the 44px mobile touch target rule. Row buttons (`IndicationsView.jsx:369`, `DrugsView.jsx:59`) satisfy it at `min-h-[56px]`.
  * *Footnotes*: `OrderLine` (`shared.jsx:150`) correctly provides `aria-label={`footnote ${mark}`}`, but `RegimenInline` (`shared.jsx:230`) and `DosingView.jsx:20` omit `aria-label`.
  * *"+" connector*: `Plus` (`shared.jsx:182`) renders visible text "plus" with `aria-label="plus"`. `RegimenInline` (`shared.jsx:218`) renders visible "+" with `aria-label="plus"`.
  * *Screen reader reading order in pills*: In `RegimenInline` (`shared.jsx:224-237`), DOM elements order drug, footnote mark, dose, route, frequency, and note. However, because drug and dose spans rely on flexbox `gap-x-1.5` without DOM whitespace, screen readers read them joined together without separation ("Vancomycin15 mg/kg").
  * *Section headings*: `<section aria-labelledby={`sec-${section.id}`}>` (`IndicationsView.jsx:212`) correctly references `<h2 id={`sec-${section.id}`}>` (`shared.jsx:78`).
  * *Spines & dots*: Section spines are CSS borders; decorative dots (`DrugsView.jsx:173`, `OpenFracturesView.jsx:101, 143`) and chevrons properly carry `aria-hidden="true"`.
  * *Keyboard focus under stuck head*: Tabbing focuses `<button>` (`IndicationsView.jsx:364`), which lacks `scroll-mt-16`, causing the top of the button to be obscured under the stuck `SectionHead` (`shared.jsx:76`).
  * *Color as sole carrier of meaning*: Violated in `DrugsView.jsx:171-175`, where section identity is represented exclusively by the hue dot. Not violated for doses, where JetBrains Mono, tabular numerals, bold weight, and explicit units (g, mg, Q8h) provide non-color distinction.

* **(f) Clinical display lines**:
  * (1) `OrderLine` (`shared.jsx:173`) now passes `frequency` through `keepUnits(frequency)` where before it was unformatted raw text. Transformation is strictly non-breaking space insertion.
  * (2) `RegimenInline` (`shared.jsx:234-236`) now renders `route`, `note`, and footnote marks. The note uses comma separation (`", "`), matching the PDF source punctuation.
  * (3) `DosePlate` (`shared.jsx:247-260`) unifies `DoseBox` and `DoseBlock` without data transformation changes.
  * (4) `Field` (`IndicationsView.jsx:297-299`) changed typography weight only (`font-semibold` / `font-medium text-ink`); clinical values remain untransformed.
  * (5) Dimmed partner pills (`shared.jsx:225, 232`) apply `text-plate-soft` visually when `dim` is active; clinical values are preserved.

* **(g) Type scale and guard tests**:
  * Every font size added in the diff is an allowed step (`11, 12, 13, 14, 15, 16, 18px`). No named Tailwind classes or raw CSS font sizes are present.
  * All `<sup>` tags carry explicit sizes (`text-[12px]` in `shared.jsx:150` and `DosingView.jsx:20`; `text-[11px]` in `shared.jsx:230`).
  * Every color is a registered token in both light and dark scheme blocks in `src/index.css` and exposed in `tailwind.config.js`. No arbitrary hex or Tailwind palette colors are added in component markup.
  * The chip rule is preserved: no `bg-chip` elements contain `text-muted` or tone marks.
  * Search input remains `text-[16px]`.
  * `contrastFailures()` additions in `tests/theme.test.js` only add pairs, and every pair corresponds to an active component pairing.
  * The print block (`src/index.css:274-304`) correctly sets `--plate: 255 255 255`, strips shadows, applies `.plate { border: 1px solid #767676 !important }`, and un-sticks section heads via `.section-head { position: static !important }`.

* **(h) Omissions and contradictions**:
  * *Contradiction*: `CLAUDE.md` explicitly states the spine marks the fever workup branch cards with inpatient violet, but `FeverWorkupView.jsx:17` omits `--hue: var(--hue-inpatient)`, leaving them slate grey.
  * *Contradiction*: `CLAUDE.md` documents `rule` for row dividers, but inner sub-lists in `DrugsView.jsx:108, 169` and `OpenFracturesView.jsx:84, 111` still use `rule-soft` (clarified in `tailwind.config.js` comments as "inner dividers").
  * *Omission*: In the single-section view (`#/s/<section>`, `IndicationsView.jsx:144`), the "All sections" back button sits above the sticky section head and scrolls out of view when scrolling down.
  * *Omission*: Mobile landscape orientation on small phones is unhandled: sticky header (~114px) and sticky section head (~40–57px) consume ~160px+ of viewport height, permanently covering over 40% of the screen.

* **(i) Recheck of the sticky section head**:
  * The containing block issue found by Codex is fixed: `SectionHead` (`shared.jsx:70-85`) renders as a fragment (`<> ... </>`), making `.section-head` a direct child of `<section>` alongside `<Group>`. It remains sticky for the full duration of the section's list.
  * Spacing quirk: `blurb ? "" : "mb-2"` (`shared.jsx:74`) omits margin-bottom when a blurb exists. When the blurb scrolls away under the head, the rows reach the stuck head with 0px margin.
  * Search results state: when `searching` is active, `blurb` is null (`IndicationsView.jsx:218`), so `mb-2` is correctly applied.
  * Single row section: un-sticks immediately once the single row scrolls past, adhering to standard CSS sticky containment.

---

### 3. Clinical Values — Unverifiable by Code Review

* `DosingView.jsx:21` — `row.drug`: drug name in dosing table header.
* `DosingView.jsx:22` — `fn.mark`: footnote mark in dosing table header.
* `DosingView.jsx:33` — `dt.adultLabel`, `row.adult`: adult dosing lines passed to `DosePlate`.
* `DosingView.jsx:34` — `dt.pediatricLabel`, `row.pediatric`: pediatric dosing lines passed to `DosePlate`.
* `DrugsView.jsx:63` — `d.name`: drug name in By-drug accordion header.
* `DrugsView.jsx:112` — `a.regimen`: open-fracture regimen entries passed to `RegimenInline`.
* `DrugsView.jsx:122` — `dosingTable.adultLabel`, `d.dosing.adult`: adult dosing lines passed to `DosePlate`.
* `DrugsView.jsx:123` — `dosingTable.pediatricLabel`, `d.dosing.pediatric`: pediatric dosing lines passed to `DosePlate`.
* `IndicationsView.jsx:297` — `ind.duration`, `ind.redose`, `ind.alternative`: values passed through `Field`.
* `IndicationsView.jsx:353` — `ind.short`: indication diagnosis name on N/A row.
* `IndicationsView.jsx:372` — `ind.short`: indication diagnosis name on expandable row.
* `OpenFracturesView.jsx:60` — `a.regimen`: open-fracture antimicrobial regimen passed to `Regimen`.
* `OpenFracturesView.jsx:88` — `keepUnits(d.value)`: fracture antibiotic duration string.
* `shared.jsx:150` — `mark`: footnote mark symbol inside `OrderLine`.
* `shared.jsx:164` — `drug`: drug name button text inside `OrderLine`.
* `shared.jsx:167` — `drug`: drug name span text inside `OrderLine`.
* `shared.jsx:170` — `fmtDose(dose)`: drug dose string inside `OrderLine`.
* `shared.jsx:171` — `route`: administration route string inside `OrderLine`.
* `shared.jsx:172` — `keepUnits(frequency)`: dosing frequency string inside `OrderLine`.
* `shared.jsx:173` — `keepUnits(note)`: clinical instruction note string inside `OrderLine`.
* `shared.jsx:182` — `plus`: combination regimen connector text inside `Plus`.
* `shared.jsx:195` — `r`: regimen object entries mapped to `OrderLine` inside `Regimen`.
* `shared.jsx:228` — `r.drug`: drug name text inside `RegimenInline`.
* `shared.jsx:230` — `mark`: footnote mark symbol inside `RegimenInline`.
* `shared.jsx:233` — `fmtDose(r.dose)`: drug dose string inside `RegimenInline`.
* `shared.jsx:234` — `r.route`: administration route string inside `RegimenInline`.
* `shared.jsx:234` — `keepUnits(r.frequency)`: dosing frequency string inside `RegimenInline`.
* `shared.jsx:235` — `keepUnits(r.note)`: clinical note string inside `RegimenInline`.
* `shared.jsx:251` — `keepUnits(label)`: dosing column header string inside `DosePlate`.
* `shared.jsx:255` — `keepUnits(l)`: dosing line entry inside `DosePlate`.

---

### 4. Could Not Verify

* **Screen reader concatenation behavior**: Requires verification on physical iOS (VoiceOver) and Android (TalkBack) devices to assess whether `RegimenInline`'s adjacent flex spans without DOM whitespace are voiced as separate words or run together.
* **Scroll alignment with dynamic mobile address bars**: Requires physical Mobile Safari and Chrome testing to confirm that `scroll-padding-top` and `scroll-mt-16` clear sticky elements when the browser toolbar dynamically expands/collapses.
* **Landscape viewport layout**: Requires testing on a 375px-wide phone in landscape orientation to determine whether the stacked sticky header and sticky section head leave sufficient scrollable area for clinical reading.
* **Global `prefers-reduced-motion` implementation**: Lines of `src/index.css` outside the provided diff cannot be verified directly from the excerpt; requires running `npm test` or inspecting the complete CSS file.

---

### 5. Dismissed as Not an Issue

* **Codex sticky header containment bug**: Dismissed; verified fixed by the Fragment wrapper in `shared.jsx:72`.
* **Dose text contrast on the plate**: Dismissed; gold dose on Mizzou black measures 10.5:1, well above WCAG AA (4.5:1).
* **Plate focus ring contrast**: Dismissed; teal focus ring against `--plate` measures 5.6:1, exceeding WCAG non-text contrast (3:1).
* **Print white-on-white text regression**: Dismissed; the print block forces `#000` text, white plate fill, and `#767676` borders.
* **Color as sole carrier of meaning for doses**: Dismissed; doses use JetBrains Mono, bold weight, and unit strings (mg, g, Q8h) in addition to gold color.
* **`bg-chip` contrast rule violation**: Dismissed; no `bg-chip` element contains `text-muted` or tone marks.
* **Section ID collisions**: Dismissed; all `section.id` keys in `sections` are distinct, ensuring unique IDs on `<h2>` elements.
* **Long drug instruction overflow in pills**: Dismissed; pills allow unit wrapping and internal text wrapping (`break-words`).


---

## Dispositions (Claude, the session that merged the change)

Every finding is listed; nothing was dropped. Line numbers in Gemini's text refer to the numbered files in its
packet (the tree at `1a269ac`).

1. **[Medium] `FeverWorkupView.jsx:17` — "missing `--hue` on the fever-workup branch cards".** **Not a defect
   — dismissed with evidence.** The view's root `div` sets `style={{ "--hue": "var(--hue-inpatient)" }}`
   (`FeverWorkupView.jsx:7`, unchanged since v0.5.0), and the cards inherit it; the headless captures show the
   violet spine. Gemini's packet held only the one-line diff of that file, not the whole component, so it could
   not see the root. CLAUDE.md is right as written.
2. **[Medium] `shared.jsx:228-236` — no DOM whitespace between the drug name and the dose inside a pill**, so a
   screen reader or the clipboard gets "Cefazolin2 g". **Fixed:** a `{" "}` text node sits between the two
   spans. Flex does not render whitespace-only text, so the layout is unchanged (pill width measured the same
   before and after); `textContent` now reads "Cefazolin 2 g Q8H".
3. **[Medium] `DrugsView.jsx:171-175` — the section of a By-drug use is conveyed only by the hue dot.**
   **Fixed:** a visually hidden `sr-only` span carries the section's title ("Trauma: ") inside the link, before
   the indication name. The dot stays `aria-hidden`.
4. **[Low] `shared.jsx:159-165` — the drug-name button's target is ~34px tall.** **Fixed:** `py-[11px]
   -my-[11px]` makes it 44px without moving the dose line (measured 44px on the NSTI plate's two buttons).
   This was v0.5.0's geometry; the restyle had kept it.
5. **[Low] `shared.jsx:230` — the footnote mark inside a pill has no `aria-label`.** **Fixed** there and on
   the dosing-table heading's mark (`DosingView.jsx`), which had the same gap since v0.5.0; both now read
   "footnote *" / "footnote **" like `OrderLine`'s.
6. **[Low] `IndicationsView.jsx:364` — keyboard focus lands on the row button, which had no scroll margin, so
   tabbing into a section's first row could scroll it under the stuck head.** **Fixed:** the button carries the
   same scroll margin as the row. Measured: focusing the Appendicitis button programmatically leaves its top
   below the stuck "Emergency General Surgery" head.
7. **[Low] `IndicationsView.jsx:349` — a fixed 64px margin is too small for a two-line head at 200% text.**
   **Fixed by measuring instead of guessing:** `SectionHead` publishes its rendered height on the `<section>`
   as `--section-head-h` through a `ResizeObserver` (as `Header.jsx` does for the brand bar), and rows and
   their buttons use `scroll-margin-top: calc(var(--section-head-h, 2.25rem) + 1rem)`. Measured at 375px:
   the variable is set on every section (36px), the deep-linked NSTI row lands at the header's height
   + 10px + 52px.
8. **[Info] `shared.jsx:21` — "unused `tone` export and `TONES.line`".** Half right: `tone()` is used by
   `ToneCard`; `TONES.line` was dead since `Regimen` moved onto the plate. **Removed** `line` from `TONES`;
   `tone()` stays.
9. **(e) "+" announced via `aria-label` on a plain span.** Not flagged by Gemini as a defect, but changed
   while in that code: the visible "+" is `aria-hidden` and a visually hidden "plus" (the PDF's word) sits
   beside it, which every screen reader reads; `aria-label` on a role-less span is unreliable.
10. **(h) "CLAUDE.md documents `rule` for row dividers, but inner sub-lists still use `rule-soft`."**
    The code is as intended (`rule` between the rows of a list group, `rule-soft` for dividers inside a row or
    a card); **CLAUDE.md's wording tightened** to say so.
11. **(h) The "All sections" back button in the single-section view scrolls away; landscape phones lose
    ~150px to the two sticky bars.** Noted, not changed: the back button is a page control at the top of the
    page, as before; the app declares portrait orientation in its manifest and the brand bar's height is
    v0.5.0's. Both are listed for a human to judge on a device.
12. **(i) "0px margin when the blurb scrolls under the stuck head".** Not a defect: that is what a stuck head
    does — content passes beneath it; the 8px gap exists only while the head is in flow.
13. **Clinical values:** all 30 lines Gemini listed are flagged, none verified, none changed in source or
    transformation; `keepUnits` on `frequency` inserts no-break spaces only (`tests/text.test.js`), and the
    regimen note follows its tuple with the PDF's comma.

Fixes 2–9 were checked by the tests (83/83) and in the preview at 375px, not re-reviewed by Gemini.
