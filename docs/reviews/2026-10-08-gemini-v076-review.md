# Gemini peer review — the UTI culture step, first draft (v0.7.6), 2026-10-08

Single-engine review of the first v0.7.6 draft, which joined the culture step to the "> 10 WBC"
outcome with a third " → ". Antigravity CLI 1.3.1, model `gemini-3.8-flash-high`, headless
stream-json, `--mode plan --sandbox --disable-slash-commands`; one turn, step types `user_input`
and `agent_response` only; 32,547-byte packet. Relayed by the `gemini-review` bridge agent. Codex
reviewed the same draft and the final version (`2026-10-08-codex-v076-review.md`).

- **Nothing below was dismissed or softened.** Gemini's answer follows verbatim; dispositions at
  the end.

---

### Findings (Most Severe First)

1. **High — Ambiguous and Misleading Multi-Arrow Logic in Clinical Decision Chain**
   - **File:Line:** `src/data/pmg.js:794`
   - **Finding:** The joined string (`"> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells → <100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics"`) chains four clauses with three `→` arrows. This overloads `→` with conflicting semantics: immediate conditional triage (`> 10 WBC → start...`), procedural caveat (`...repeat UA if >2 squamous cells`), delayed laboratory timeline (`→ <100,000 CFU/mL...`), and conditional de-escalation (`...→ discontinue antibiotics`). A bedside clinician skimming on mobile can easily misread the delayed culture cutoff as an immediate consequence of the repeat UA or conditional *only* upon having `>2 squamous cells`.
   - **What Cannot Be Verified:** The clinical validity of chaining these steps, whether the MU Health guideline intended this sequence, and the visual/logical structure of the source image on page 5.

2. **Medium — Factual Inaccuracy in Project Documentation Regarding v0.7.6 Peer Reviews**
   - **File:Line:** `CLAUDE.md:383-385`
   - **Finding:** The updated text states that peer reviews ran before each release: *"single engine each time, both separately for v0.7.5 and v0.7.6... verbatim reviews and dispositions in docs/reviews/"*. This statement is factually false: no review file for v0.7.6 exists in `docs/reviews/` (the latest are for v0.7.5), and `docs/HISTORY.md:435-446` does not record any peer review having run for v0.7.6.
   - **What Cannot Be Verified:** Whether any external review was conducted outside of what is recorded in the repository.

3. **Low — Inaccurate Release Note Claim ("No words were added or removed")**
   - **File:Line:** `docs/HISTORY.md:440-441`
   - **Finding:** The entry states: *"No words were added or removed, only the line break"*. This is inaccurate. An arrow symbol and surrounding whitespace (` → `) were explicitly inserted to join the two formerly independent outcome strings.
   - **What Cannot Be Verified:** None; verifiable from git diff.

4. **Low — Unverifiable Image Layout Assertion in Code Comments and Docs**
   - **File:Line:** `src/data/pmg.js:735-737`, `CLAUDE.md:53-55`, `docs/HISTORY.md:441-442`
   - **Finding:** Code comments and documentation repeatedly assert that *"the arrow follows the drawing, where that box hangs below 'Start empiric antibiotics'"*. Because page 5 is an un-OCR'd flowchart image not readable by automated tools or visible in text layers, this assertion cannot be machine-verified.
   - **What Cannot Be Verified:** The spatial layout, box hierarchy, and connector lines of the flowchart image on page 5 of the PDF.

5. **Low — Poor Semantic and Accessibility Structure for Multi-Step Sequence in UI**
   - **File:Line:** `src/components/FeverWorkupView.jsx:59-63` (rendering `src/data/pmg.js:794`)
   - **Finding:** A 169-character complex sequence containing an initial triage threshold, an immediate action, a repeat testing condition, a delayed microbiological result, and a de-escalation command is packed into a single unnumbered, unbulleted `<li>`. Screen readers announce a 2-item list, masking the multi-stage sequence, and pronounce the arrow character `→` inconsistently or skip it entirely.
   - **What Cannot Be Verified:** Exact screen reader speech synthesis across different mobile platforms (VoiceOver vs. TalkBack).

---

### Answers to Specific Items

#### 1. DATA
- **Word/Character Match:** Confirmed. The new string contains the exact characters of the old first outcome (`"> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells"`) and the old third outcome (`"<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics"`), joined exactly by `" → "` (U+2192 with one space on each side).
- **Other Changes:** No other clinical value, string, or field was changed anywhere in `src/data/pmg.js` or across the diff (only comments, version bumps, and documentation were touched).

#### 2. RENDERING
- **DOM & Keys:** Each outcome maps to one `<li>` (now 2 items total). React keys (`key={o}`) are unique and stable strings.
- **`keepUnits` Behavior:** 
  - Matches `"10 WBC"` and `"100,000 CFU/mL"` via `NUMBER_UNIT`, replacing spaces with `\u00A0` (NBSP).
  - Matches `"> 10"` via `SIGN_NUMBER`, replacing the space with `\u00A0`.
  - Does **not** touch `">2"` (no space) or `"<100,000"` (no space; `<` is already contiguous with the number, preventing a line break naturally).
  - Does **not** touch arrows (` → `), leaving regular spaces around them.
- **Regex Cross-Boundary Effects:** None.
- **Wrapping & Overflow:** No horizontal overflow occurs (standard wrapping occurs at spaces). However, at 320–400px mobile width or in narrow columns (`md:grid-cols-3`), the 169-character string forms a dense 4–6 line block of text without list markers or indentation.
- **Accessibility:** Screen readers will read the entire sequence as a single list item, pronouncing "→" inconsistently or omitting it, obscuring the multi-step decision workflow.

#### 3. INTENT
- **Sequential Clarity vs. Ambiguity:** It does **not** cleanly read as a later conditional step. Chaining multiple `→` operators creates syntactic ambiguity:
  1. The second `→` immediately follows `repeat UA if >2 squamous cells`, making `<100,000 CFU/mL...` look like an immediate consequence of the repeat UA rather than a delayed culture result (48–72h) from the initial reflexive culture.
  2. It lacks temporal markers (e.g., *"If follow-up culture shows:"*).
  3. Skimming clinicians could misread the line as an uninterrupted immediate bedside checklist.
- **Unverifiable:** Whether this sequence accurately reflects the clinical intent of the flowchart or hospital practice.

#### 4. DOCS
- **"No words were added or removed":** Inaccurate; the symbol and spaces `" → "` were added.
- **"The arrow follows the drawing...":** Unverifiable assertion about the flowchart image on page 5.
- **CLAUDE.md History Sentence:** Inaccurate. It claims reviews ran *"separately for v0.7.5 and v0.7.6"* with reports in `docs/reviews/`, but no v0.7.6 review existed in `docs/reviews/`.
- **"Four page-5 readings":** The heading in `CLAUDE.md:49` still says "Four", but the text now details five distinct rulings/departures (F1, F2, F3 initial edit, F3 v0.7.6 chaining, and F5).
- **Test Statements:** Accurately states that 87 tests and `verify` pass, though neither script validates clinical correctness or image transcriptions.
- **Historical Consistency:** The v0.7.5 entry in `docs/HISTORY.md:408-409` stating that the line *"stays a separate line"* is correctly historical for v0.7.5.
- **Version Numbers:** Consistent across `package.json`, `package-lock.json`, `CLAUDE.md`, and `docs/HISTORY.md` (all 0.7.6).

---

### What the Change Ignores Entirely

1. **The Positive Culture Outcome Branch:** The UTI branch specifies what to do when culture is `<100,000 CFU/mL` or negative (`discontinue antibiotics`), but completely ignores what to do when culture is positive (`≥100,000 CFU/mL` or pathogen identified). By comparison, the pneumonia branch explicitly provides both branches (`≥ 10⁴ CFU/mL` and `≤ 10⁴ CFU/mL`).
2. **Proper Data & UI Modeling of Clinical Timelines:** Rather than structuring workflow stages (triage → empiric treatment → delayed culture de-escalation) in the data model or updating `FeverWorkupView.jsx`, the change concatenates distinct phases into a single string inside `outcomes`.
3. **In-App Disclosure to Bedside Clinicians:** The change maintains "no change" on the disclosure note, leaving bedside users uninformed that the text reorders and alters the flowchart sequence from the hospital's published PDF.

---

## Dispositions

- **1 (High), the three-arrow chain — put to Thiago,** with Codex's Medium on the same point. He
  chose an indented sub-step instead (reviewed by Codex, run 2).
- **2 (Medium), `CLAUDE.md` claimed v0.7.6 reviews that were not yet in `docs/reviews/` — fixed** by
  saving them (this file and the Codex one) before the commit.
- **3 (Low), "only the line break" — fixed** in `docs/HISTORY.md`.
- **4 (Low), the "hangs below 'Start empiric antibiotics'" claim cannot be machine-verified — not
  changed.** Claude read it on the rendered page 5 during the v0.7.5 cross-check, and Codex, which
  saw the page images, described the same connection (its F3).
- **5 (Low), screen-reader structure of one long item — superseded:** the final version splits the
  step onto its own nested list item, with `role="list"`.
- **Also raised:** the PDF gives no step for a positive culture, unlike the pneumonia branch. True
  before this change as well; relayed to Thiago. "Four page-5 readings" stays four (F1, F2, F3, F5;
  v0.7.6 refines F3).
