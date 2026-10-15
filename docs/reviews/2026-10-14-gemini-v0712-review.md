# Gemini peer review — v0.7.12, 2026-10-14

The required review before the v0.7.12 commit. Codex's quota was spent (it resets at 1:37 AM), so
Gemini ran as the fallback. **Single engine.**

The change, at Thiago's request ("add the footnote and adult/pediatric dosing to bottom and it
doesn't need to expand"): the open-fracture Antimicrobial by type card is now always open. It shows
the regimen pills, then each dosing-table drug's adult and pediatric plates, then the footnotes. The
card's open-plate view and `CollapsibleCard`'s `preview` prop are gone, and Expand all on the tab
covers the three cards that still collapse. `src/data/pmg.js` is unchanged.

## How it was run

- `agy` 1.3.5, `gemini-3.8-flash-high`, stream-json on stdin, `--mode plan --sandbox
  --disable-slash-commands`, from 22:18 to 22:26. Its steps were `user_input`, `agent_response` and
  `error_message`. The run ended `status: ERROR` ("The stream was interrupted"), but the answer is
  complete: its receipt is first and its "Checked and found fine" list is last.
- The packet was 62,194 bytes. It held:
  - the 306-line diff from `b729331` (v0.7.11), without `package-lock.json`;
  - `OpenFracturesView.jsx` and `shared.jsx` in full, with line numbers;
  - lines 550–724 of `src/data/pmg.js` (open fractures and the dosing table).
- The receipt gives the right line counts.

**Nothing below was dismissed or softened.** Verbatim answer, then the disposition.

## Gemini (verbatim)

## Receipt

- **Diff line count:** 306 lines (`b729331 → working tree (306 lines; package-lock.json excluded)`)
  - **First line:** `diff --git a/CLAUDE.md b/CLAUDE.md`
  - **Last line:** `         {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}`
- **Full files stated line counts & last lines:**
  - [`src/components/OpenFracturesView.jsx`](file:///src/components/OpenFracturesView.jsx): 196 lines; last line (196): `}`
  - [`src/components/shared.jsx`](file:///src/components/shared.jsx): 442 lines; last line (442): `}`
  - [`src/data/pmg.js`](file:///src/data/pmg.js): 952 lines total (lines 550–724 shown); last line in packet (724): empty trailing line (line 723: `};`)

---

## Findings

### Low: [`CLAUDE.md:401`](file:///CLAUDE.md#L401)
**Defect:** Stale entry in the 16px typography specification still claims open fractures uses the expanded `Regimen` plate.

**Failure scenario:** A developer checking the typography scale in `CLAUDE.md` to see where 16px plate text is used will look for `Regimen` in [`OpenFracturesView.jsx`](file:///src/components/OpenFracturesView.jsx), where it was completely removed and replaced by 13px [`RegimenInline`](file:///src/components/shared.jsx#L360) pills and 15px [`DosePlate`](file:///src/components/shared.jsx#L412) mono text, creating a direct contradiction with line 186 ("The open-plate view of v0.7.9 ... went with it").

**Quoted code:**
```markdown
  - 16px: the drug name and its dose line on the expanded plate (Regimen, open fractures), the row
    titles on the Indications list and in the Gustilo-Anderson table, the fracture types in
    Duration (v0.7.9), the drug names in Antimicrobial by type's dosing (v0.7.12), the brand
    title, the search input, the timing sentence on phones.
```

---

## Relocated & Restructured Clinical Content

The following clinical text now appears in a new location or visual presentation for clinicians reading the "Open extremity fractures" view:

1. **Adult & Pediatric Dosing Table rendered inline:**
   - Previously accessible only by navigating away to the dedicated Dosing view via a link at the bottom of the card (`<a href="#/dosing">Adult & pediatric dosing table</a>`), all 4 dosing rows are now rendered directly within the uncollapsed card under an `<h3 className="eyebrow text-accent mb-2.5">Adult & pediatric dosing</h3>` header:
     - **Cefazolin\***: Adult `2 g IV Q8h`; Pediatric `< 60 kg: 33 mg/kg/dose IV Q8h`, `≥ 60 kg: 2 g IV Q8h`
     - **Cefepime\***: Adult `2 g IV Q8h`; Pediatric `< 40 kg: 50 mg/kg/dose IV Q12h`, `≥ 40 kg: 2 g IV Q12h`
     - **Metronidazole**: Adult `500 mg IV Q8h`; Pediatric `< 37.5 kg: 13.3 mg/kg/dose IV Q8h`, `≥ 37.5 kg: 500 mg IV Q8h`
     - **Vancomycin\*\***: Adult `15 mg/kg IV Q12h (max 1.5g/dose)`, `Vancomycin IV - Pharmacy to Dose`; Pediatric `20 mg/kg/dose IV Q8h (max 1.5g/dose)`, `Vancomycin IV - Pharmacy to Dose`
2. **Footnote definitions permanently visible:**
   - In v0.7.11, the footnote explanations were tucked inside the collapsible panel and invisible when closed. They now sit persistently at the base of the open card:
     - `*`: *"Pharmacy to dose adjust per renal dosing protocol"*
     - `**`: *"Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients. Suggested dosing listed above. Pharmacy to adjust based on renal function."*
3. **Regimen display format transition:**
   - The expanded `Regimen` plates (16px stacked order lines with "plus" connectors) have been removed from this card. The regimens are now permanently displayed as compact [`RegimenInline`](file:///src/components/shared.jsx#L360) pills (13px, with "+" badges) under their 14px bold category labels (`RegimenPills`).
4. **Dropped navigation link:**
   - The bottom link `<a href="#/dosing">Adult & pediatric dosing table →</a>` has been removed in favor of the inline dosing plates.

---

## Clinical Items Flagged as Unverifiable

- Direct verification against the physical MU Health Acute Care Surgery Antibiotic PMG (Dec 2025 PDF) cannot be performed without reading external binary files; however, within the diff's context, `src/data/pmg.js` is identical to v0.7.11 (unchanged in the diff), and all clinical tuples rendered in [`OpenFracturesView.jsx`](file:///src/components/OpenFracturesView.jsx) map directly to `of.antimicrobial` and `dosingTable`.

---

## Checked and Found Fine

- **Footnote marks & attribution:** Every footnote mark rendered (`*` on Cefazolin, Cefepime; `**` on Vancomycin) maps to a defined and visible entry in `dosingTable.footnotes` at the card's base.
- **Dosing columns:** Adult dosing lines map strictly to `dosingTable.adultLabel` and pediatric dosing lines to `dosingTable.pediatricLabel`. Neither drugs nor columns are swapped.
- **PCN Allergy row highlighting:** The `ALLERGY_ID = "pcn-allergy"` highlight (`bg-warn-bg text-warn-ink ring-1 ring-inset ring-warn-line`) activates exclusively on the `If penicillin allergy` row when `pcn` is true. The `-mx-2 px-2` 8px overhang geometry is preserved whether active or inactive, preventing layout shifts.
- **ExpandAll keys & positioning:** [`KEYS`](file:///src/components/OpenFracturesView.jsx#L10) was updated to `["fractures:duration", "fractures:classification", "fractures:femoral-shaft"]`, removing `fractures:antimicrobial`. [`ExpandAll`](file:///src/components/OpenFracturesView.jsx#L123) is moved immediately below the always-open [`Card`](file:///src/components/shared.jsx#L26), correctly positioned right above the three remaining collapsible cards.
- **Removed `preview` prop:** Completely removed from [`CollapsibleCard`](file:///src/components/shared.jsx#L110); no remaining components or views pass `preview`.
- **Imports & unused variables:** `ArrowRight` was removed from `lucide-react` imports; `Regimen` was removed from `shared.jsx` imports; `Card`, `CardHeading`, and `DosePlate` were added. Zero unused imports remain in [`OpenFracturesView.jsx`](file:///src/components/OpenFracturesView.jsx).
- **React keys:** All list iterators use stable, unique keys (`key={row.drug}`, `key={f.mark}`, `key={a.id}`, and unique strings `key={l}` inside [`DosePlate`](file:///src/components/shared.jsx#L418)).
- **Accessibility & heading levels:** Clean heading hierarchy: `PageHeader` (`h1`) → `CardHeading` (`h2`) → "Adult & pediatric dosing" (`h3`), followed by sibling `h2` buttons on subsequent collapsible cards. Drug names are semantic `<li>` items rather than heading clutter. Footnote marks maintain accessible labels (`aria-label={`footnote ${mark.mark}`}`).
- **Print styles:** Plain [`Card`](file:///src/components/shared.jsx#L26) prints open naturally; nested [`DosePlate`](file:///src/components/shared.jsx#L412) elements retain the `.plate` class that clears dark background fills and retains border boxes during printing.


## Disposition (Claude)

- **The one finding (Low, `CLAUDE.md:401`) is right:** the 16px role still named the open-fracture
  regimens as expanded plates. Fixed: the line now reads "the expanded plate (Regimen)".
- **Clinical content:** nothing changed in the data. The dosing table and the footnotes now also
  appear on the Fractures tab, verbatim from `dosingTable`, as they already did on the Dosing tab.
- **Checked in headless Chrome against the dev server:**
  - no horizontal scroll at 320, 360, 375 or 768px;
  - PCN Allergy washes only the penicillin-allergy row;
  - Expand all covers the three cards that still collapse and turns into "Collapse all";
  - the card has no toggle;
  - the dosing heading shows in print.

  The card was screenshotted at 375px in both schemes. After the fix, 118 tests and the build pass.
