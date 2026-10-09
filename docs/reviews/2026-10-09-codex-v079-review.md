# Codex peer review — v0.7.9, 2026-10-09

One single-engine Codex run before the deploy. Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec
--sandbox read-only` (header confirmed `sandbox: read-only`; this folder is Codex-trusted, so the pin
mattered), reasoning effort `high`, packet on stdin, no tools; relayed by the `codex-review` bridge
agent. Not cross-checked with Gemini. Reviewed the uncommitted changes against `7c50b65` (v0.7.8):
the Antimicrobial by type labels as headings, the grey well removed, the `sm` label column, the
penicillin-allergy regimen nested under Type I & II, Duration drawn as the Gustilo-Anderson table,
and the `OrderLine` note kept together. The packet held the full 313-line diff, all of
`OpenFracturesView.jsx` and `shared.jsx`, `pmg.js` 587–665, the CSS tokens, `tailwind.config.js` and
part of `theme.test.js`; Codex echoed the diff's line count and the last line of the view, and the
bridge checked HEAD and `git status` unchanged after the run. **Nothing below was dismissed or
softened.** Verbatim answer, then dispositions.

---

Full diff received: **313 lines**, excluding its BEGIN/END markers. Last line of the OpenFracturesView.jsx listing: **`186: }`**.

**High — D — `src/components/OpenFracturesView.jsx:39,90–93`: Nesting narrows the apparent allergy population.** Yes: a reader can interpret the vancomycin allergy regimen as applying **only to Type I and II fractures**, excluding penicillin-allergic patients with Type III fractures or contaminated wounds. The indentation and h3→h4 hierarchy both communicate that restriction. Type III and contamination already contain vancomycin at the same dose and frequency, so this does not remove vancomycin from those displayed regimens; it leaves the reader without an explicitly associated allergy alternative for those groups, whose displayed combinations also contain cefepime. Unchanged data verification cannot validate this presentation-dependent scope. **Suggested disposition:** explicitly record that scope consequence in the owner's clinical review; no change to the chosen nesting is proposed.

**Medium — A — `src/components/OpenFracturesView.jsx:19–21,83–93`: The allergy-ID fallback loses PCN highlighting.** If the allergy entry remains present but its `pcn-allergy` ID changes or disappears, nesting stops and all four entries still render, but the allergy entry follows the ordinary branch. That branch never uses `pcn`, so the allergy regimen no longer highlights when the toggle is on. Renaming the parent ID preserves highlighting; renaming the allergy ID does not. The new existence test detects the rename but does not establish correct fallback behavior. **Suggested remedy:** identify allergy highlighting through explicit semantic metadata independent of the nesting IDs, and exercise both ID-renaming cases with the toggle on and off.

**Low — A — `src/components/OpenFracturesView.jsx:39,85–86`: The flat fallback retains a subordinate heading.** When the parent ID is missing, the allergy entry becomes a top-level list row but still renders an h4. It therefore remains subordinate in heading navigation to the preceding h3, or skips directly from h2 to h4 if no preceding h3 remains. The normal h2→h3→h4 hierarchy is structurally sound for the chosen nesting; the flat fallback is inconsistent with it. **Suggested remedy:** let `AllergyRegimen` render an h3 when called from the flat branch and an h4 when nested.

**Low — E — `docs/HISTORY.md`, hunk `@@ -525,3 +525,29 @@`: “Each regimen” is not a 16px row heading.** In the normal path, three labels are 16px h3 headings; the allergy label is a 15px h4 inside its parent's row. The changelog's universal description is inaccurate. CLAUDE.md does subsequently describe the exception and includes its 15px type-scale role. **Suggested remedy:** qualify the changelog statement as applying to the three top-level regimen labels and state the nested label's actual size and heading level.

**Info — E — `docs/HISTORY.md`, same hunk, “Checked” paragraph: Verification claims cannot be independently established from this packet.** The packet supplies no test output, browser captures, verifier implementation/output, complete test suite, or build scripts. Consequently, “88 tests,” successful builds, approximately 50px recovered width, exact wrapping, and absence of horizontal scrolling cannot be confirmed. The added test checks both IDs' presence, but whether its failure blocks the build is not shown. **Suggested remedy:** attach the corresponding outputs/captures and build-test wiring to substantiate those claims.

**Clinical items to verify — D.** These are transcription and presentation checks for a human against the PDF, **not confirmed clinical values**:

- **`src/data/pmg.js:598–600`:** “Type I & II”; Cefazolin **2 g IV q8 hours**.
- **`src/data/pmg.js:605–614`:** “If penicillin allergy”; Vancomycin** **15 mg/kg IV q12 hours**, “Pharmacy To Dose Consult”; its newly displayed restriction under “Type I & II.”
- **`src/data/pmg.js:621–631`:** “Type III — treatment for ALL Type III”; Cefepime* **2 g q8 hours**—the supplied tuple specifies **no route**—combined with Vancomycin** **15 mg/kg IV q12 hours**, “Pharmacy To Dose Consult.”
- **`src/data/pmg.js:638–650`:** “Soil, fecal contamination, and standing water contamination”; Cefepime* **2 g q8 hours**, again with no route supplied; Vancomycin** **15 mg/kg IV q12 hours**, “Pharmacy To Dose Consult”; and Metronidazole **500 mg IV Q8h**.
- **`src/data/pmg.js:655–656`:** “Type I & Type II Fractures” → **24 hours**; “Type III” → **24 hours after closure or 72 hours (whichever precedes)**.
- **`src/components/shared.jsx:328–344`:** The displayed “plus” relationships between combination partners, and the association of each consultation note with its vancomycin tuple.
- **`src/components/OpenFracturesView.jsx:100–104`:** The re-presented footnote block, including the * renal-adjustment and ** pharmacy-to-dose associations. The actual `dosingTable.footnotes` wording is **not supplied**, so it cannot be enumerated or verified.
- **`src/components/shared.jsx:318–320`:** Other app-wide regimen notes affected by this shared change cannot be enumerated: their data and callers are **not supplied**.

**A — no additional findings.** With the supplied unique IDs, all four entries render exactly once and only the allergy block responds to `pcn`. Renaming either ID preserves rendering of all retained entries; deleting an entry cannot preserve its content. No new crash, dead code, or key defect is evident for the supplied data. `sm:col-span-2` correctly spans the fallback grid's two columns.

**B — no findings from the supplied code.** The JSX preserves the comma followed by one space and the unchanged note text. The inline-block can move intact when it fits the container; a longer note can wrap internally under `max-w-full` and inherited `break-words`. No overflow defect is established here. App-wide layouts, clipboard behavior, and actual screen-reader output remain unverified without the omitted callers and runtime checks.

**C — no findings in the changed code.** New colors use tokens, font sizes use the permitted scale, the left rule is decorative, and highlighting leaves the plate neutral. The supplied matrix includes the relevant warning-text and plate-edge pairs. No clinical strings are invented or paraphrased by the changes. **Print compliance cannot be verified:** the print overrides are absent from the packet.
---

## Dispositions

- **High (D), nesting narrows the apparent allergy population.** Taken to Thiago before the deploy,
  with three options (nested plus a Source-page note, recommended; nested as is; back to its own
  row). He chose **"Back to its own row"**. The nesting was removed: "If penicillin allergy" is again
  one of the four rows at one level, as the PDF prints them, with the other v0.7.9 layout changes
  kept. Checked: the PDF's only allergy mention on pages 3–4 is that bullet.
- **Medium (A), the allergy-id fallback loses the PCN highlight.** Moot once the nesting went; the
  remaining point holds and is pre-existing: the highlight finds the allergy regimen by its id, as
  it did in v0.7.8. The test that came with the nesting now checks only that `pcn-allergy` exists,
  so a rename fails the build instead of dropping the highlight. Not changed further: marking the
  entry in the data would mean editing `src/data/pmg.js`.
- **Low (A), the flat fallback kept an `h4`.** Fixed (the fallback rendered an `h3`), then removed
  with the nesting: all four labels are `h3`s under the card's `h2`, checked in the preview.
- **Low (E), "each regimen … 16px" in HISTORY.** Fixed; the entry was rewritten after the revert,
  and every label is now a 16px `h3`.
- **Info (E), verification claims not in the packet.** Accepted as stated; the tests, verifier and
  build were run outside the review (88 tests, PASS, built), and the captures are described in
  HISTORY. The bridge agent also noted a second HISTORY inaccuracy (the fallback wording for a
  renamed allergy id); fixed, then removed with the nesting.
- **Clinical items to verify (D).** Relayed to Thiago as flagged, not confirmed. None of the values
  changed: `src/data/pmg.js` is untouched, and the verifier passes. Codex noted both cefepime
  tuples carry no route; that is how the PDF prints the bullets (the page-4 dosing table says
  "2 g IV Q8h"), and it is not yet on the Source page's list of flags.
- **Not re-reviewed:** the revert to a flat row and its amber wash (`ring-warn-line` inset edge
  instead of the v0.7.8 bordered well) were checked in the preview and by the tests, not by a
  second Codex run.
