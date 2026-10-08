# Gemini peer review — rulings on the PDF cross-check, notice removed (v0.7.5), 2026-10-08

Single-engine review of this diff by Gemini; Codex reviewed the same diff separately
(`2026-10-08-codex-v075-review.md`). Antigravity CLI, model `gemini-3.8-flash-high`, headless
stream-json, `--mode plan --sandbox --disable-slash-commands`; step types `user_input` and
`agent_response` only. Relayed by the `gemini-review` bridge agent.

- **Scope:** the full 11-file diff, whole `App.jsx`, `IndicationsView.jsx`, `VerificationNotice.jsx`
  and `FeverWorkupView.jsx`, `pmg.js` lines 1–30, 715–830 and 905–936, the PCN pill region of
  `Header.jsx`, and the changed doc regions; 111,866 bytes, 47,333 input tokens. Gemini's receipt
  matched the packet's markers.
- **Nothing below was dismissed or softened.** Gemini's answer follows verbatim (the bridge agent
  removed only `file:///` link wrappers around citations); dispositions at the end.

---

RECEIPT: (a) 490, (b) 737, (c) END-OF-PACKET v0.7.5 review: last section was SECTION 9; manifest of total line counts: {"src/data/pmg.js":936,"src/App.jsx":115,"src/components/IndicationsView.jsx":490,"src/components/VerificationNotice.jsx":24,"src/components/FeverWorkupView.jsx":103,"src/components/Header.jsx":169,"CLAUDE.md":380,"README.md":192,"docs/HISTORY.md":419,"docs/reviews/2026-10-08-codex-pdf-crosscheck.md":286,"docs/reviews/2026-10-08-gemini-pdf-crosscheck.md":292,"tests/type.test.js":117}

---

### FINDINGS (Ranked by Severity)

#### Finding 1 [Critical] — Premature removal of bedside verification notice creates unverified clinical hazard
- **File & Line:** src/App.jsx:106-110 (diff hunk removing `<VerificationNotice />`) and README.md:10-14
- **Quoted Text:**
  ```jsx
  -      <VerificationNotice />
  ```
  ```markdown
  > **Status.** Every value was transcribed from the source PDF and is re-checked against it
  > mechanically on every build (see *Verification*). On 2026-10-08 Codex and Gemini each checked the
  > whole transcription against the PDF (`docs/reviews/2026-10-08-*-pdf-crosscheck.md`), Thiago ruled
  > on their findings, and at his request the app no longer shows its "pending physician
  > verification" banner (v0.7.5).
  ```
- **Why:** The project charter establishes that `src/data/pmg.js` is entirely clinical content, that neither machine verifiers nor AI cross-checks can verify clinical values, and that Thiago's rulings were decisions on wording/scope, *not* a clinical verification of the transcription. Removing `<VerificationNotice />` from src/App.jsx removes the only prominent bedside indicator warning ED/EM residents and prescribers that the transcription has not been signed off by a physician. Furthermore, the revised `Status` block in README.md deletes the explicit disclaimer ("no clinician has yet signed the transcription off") and implies to outside users that AI reviews plus Thiago's rulings constituted full clinical verification.

---

#### Finding 2 [High] — Inversion and conflation of testing vs. treatment in `feverWorkup` UTI branch creates clinical ambiguity
- **File & Line:** src/data/pmg.js:791-795
- **Quoted Text:**
  ```javascript
  "> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells",
  "< 10 WBC → investigate other source",
  "<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics",
  ```
- **Why:** In the original PDF flowchart, repeating the urinalysis if >2 squamous cells was an evaluation step preceding the initiation of empiric antibiotics (checking for specimen contamination before starting treatment). Inverting this to `> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells` creates significant clinical ambiguity:
  1. Does the clinician start antibiotics immediately and order a repeat UA concurrently, and if so, does administering antibiotics immediately confound the repeat UA and reflex culture?
  2. If the repeat UA shows <10 WBC or remains contaminated, does the clinician discontinue antibiotics?
  3. The third line (`<100,000 CFU/mL... discontinue antibiotics`) is rendered in src/components/FeverWorkupView.jsx:59-63 as an unlinked sibling item in a flat bulleted list under "Then", obscuring that it is a delayed culture-driven de-escalation step contingent on having started antibiotics.

---

#### Finding 3 [High] — Shortened Indications intro drops penicillin-allergy reference, breaking safeguard and leaving dangling antecedent
- **File & Line:** src/components/IndicationsView.jsx:180-182
- **Quoted Text:**
  ```jsx
  Tap a section, then a row. The <span className="font-bold text-ink">“{ALT_LABEL}”</span> column also
  holds contamination escalation and MRSA add-ons — read each note's condition.
  ```
- **Why:** The project specification establishes three strict safeguards against clinicians misreading the "PCN Allergy" toggle as an allergy-only column: the per-row field label, the pill title, and the intro aside stating what *else* the column holds. The old text stated: *"That column holds penicillin-allergy regimens but also contamination escalation and MRSA add-ons"*. The new text cuts the penicillin-allergy reference entirely. Consequently, the word "also" has no antecedent (the preceding sentence is merely "Tap a section, then a row."). A resident on a phone reading this aside is never told that the column carries penicillin-allergy regimens, breaking the primary safeguard that explains why the toggle is named "PCN Allergy".

---

#### Finding 4 [High] — Misleading in-app disclosure on Source and Fever Workup pages regarding page-5 fidelity
- **File & Line:** src/data/pmg.js:924-930 and src/components/FeverWorkupView.jsx:93-94
- **Quoted Text:**
  - `pmg.js:925`: `These are observations about the source document, not corrections — the app shows the PDF's values.`
  - `pmg.js:930`: `Page 5 (fever workup flowchart) is an image in the PDF. Its text here was read from the picture and cannot be checked by the verification script. Its thresholds meet at the boundary exactly as drawn...`
  - `FeverWorkupView.jsx:93-94`: `This page of the PMG is a flowchart image with no text layer. The steps above were read from the picture and cannot be checked by the verification script — open page 5 of the PDF to see the original.`
- **Why:** Both the Source page (`transcription.flags`) and the Fever Workup view explicitly claim that the app reproduces the PDF's values and that page 5's steps were read from the picture exactly as drawn. In reality, v0.7.5 committed four deliberate human departures from the image: merging two bullets into "Unexplained hypotension" (F1), adding "culture" to "reflexive" (F2), inverting the repeat-UA and antibiotic sequence (F3), and dropping the asterisk (F5). A clinician checking the source PDF via the provided button will find discrepancies that the in-app disclosure claims do not exist.

---

#### Finding 5 [Medium] — Documentation errors: Gemini review misattribution, F5 severity inflation, and blurb conflation
- **File & Line:** docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:292, docs/HISTORY.md:401, and CLAUDE.md:157-163
- **Quoted Text:**
  - `gemini-pdf-crosscheck.md:292`: `**Thiago's rulings (2026-10-08, v0.7.5).** F1: keep "Unexplained hypotension". F2: keep "culture". F3: "make > 10 WBC --> start empiric antibiotics and repeat UA if >2 squamous cells"...`
  - `HISTORY.md:401`: `Thiago's rulings on Codex's High findings: ... F5, leave out the repeat-UA asterisk.`
  - `CLAUDE.md:159-163`: `and all four that evening after the PDF cross-check rated them High as interpretations ("A1, A2, A7 look good"; "A4 is correct", the Elective "vancomycin added").`
- **Why:**
  1. The Gemini review was text-only and did not review page 5 (it yielded Findings 1–10). Pasting Codex's F1–F5 rulings into the Gemini disposition file falsely attributes Codex findings to Gemini.
  2. docs/HISTORY.md lists F5 under "Thiago's rulings on Codex's High findings", whereas Codex explicitly classified F5 as **Low** severity (docs/reviews/2026-10-08-codex-pdf-crosscheck.md:41).
  3. CLAUDE.md states that Codex rated all four blurbs High as interpretations. In fact, A3 was not a blurb but a code comment in `pmg.js:25-27` ("MRSA-colonization add-ons"), while blurb findings A5 and A6 were rated Medium and were never ruled on.

---

#### Finding 6 [Low] — Stale references to `VerificationNotice` in active component catalogs and type scale docs
- **File & Line:** README.md:86, CLAUDE.md:305-306, and tests/type.test.js:21
- **Quoted Text:**
  - `README.md:86`: `src/components/* ← one file per view, Header / VerificationNotice / BottomNav / Footer...`
  - `CLAUDE.md:305-306`: `13px: the collapsed-row pills (drug and dose), notes and asides, blurbs, the verification notice, tab and pill labels, references.`
  - `type.test.js:21`: `[13, "notes and asides, blurbs, the verification notice, collapsed-row doses, tab and pill labels, references"],`
- **Why:** `VerificationNotice` is kept in the repository as dead/dormant code. Describing it as an active shell component alongside `Header / BottomNav / Footer` in README.md is stale. Similarly, CLAUDE.md line 101 was updated with a disclaimer (`not rendered since v0.7.5`), but line 305 and tests/type.test.js:21 still list "the verification notice" among active UI elements using the 13px font scale.

---

### CHECKS 1–5: RESULTS

- **Check 1: `pmg.js` F3 edit, clinical values, and rendering:**
  - *F3 character-by-character check:* Exact match. `> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells` matches Thiago's instruction verbatim (using the file's `→` convention for `-->`).
  - *Other clinical values in diff:* None. No other drug, dose, frequency, duration, redose rule, threshold, or cutoff was touched in src/data/pmg.js.
  - *`<100,000 CFU/mL` ambiguity:* Thiago did not instruct changing `<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics`. However, keeping it as a sibling item in the array while inverting the WBC/empiric-antibiotic line creates temporal ambiguity: antibiotics are initiated alongside an order for repeat testing, while culture-driven discontinuation appears as an unattached outcome.
  - *View rendering:* src/components/FeverWorkupView.jsx renders `b.outcomes` using a standard `map` into `<li>{keepUnits(o)}</li>`. The changed string is rendered identically in structure to the previous string; there is no special layout handling.

- **Check 2: `VerificationNotice` references inventory:**
  - *Active imports/renders:* None. No file in `src/` imports or renders `VerificationNotice`.
  - *Classification of Section 8 grep references:*
    - `src/components/VerificationNotice.jsx:9`: **Correct-retained** (dormant code kept for next edition).
    - `README.md:13-14`: **Misleading** (implies full transcription verification occurred).
    - `README.md:86`: **Stale** (lists notice as active component in file map).
    - `README.md:104, 112, 124`: **Correct-historical** (historical design logs).
    - `README.md:189`: **Correct-future** (release procedure instructions).
    - `CLAUDE.md:27-30, 378`: **Correct-current** (accurately documents removal).
    - `CLAUDE.md:93`: **Correct-historical** (design lineage from Pediatric CPG).
    - `CLAUDE.md:101`: **Correct-current** (explicitly notes not rendered since v0.7.5).
    - `CLAUDE.md:306`: **Stale** (lists notice under 13px type scale without qualification).
    - `docs/HISTORY.md:23, 81, 308`: **Correct-historical** (changelogs for v0.5.0, v0.5.1, v0.7.2).
    - `docs/HISTORY.md:394, 412-413`: **Correct-current/historical** (v0.7.5 release notes).
    - `docs/reviews/2026-10-08-codex-pdf-crosscheck.md:17`: **Correct-historical** (preamble before ruling).
    - `docs/reviews/2026-10-08-codex-pdf-crosscheck.md:286`: **Correct-current** (post-review disposition).
    - `docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:17`: **Correct-historical** (preamble before ruling).
    - `docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:292`: **Correct-current** (post-review disposition).
    - `docs/reviews/2026-10-08-codex-timing-card-review.md:88`: **Correct-historical** (past review).
    - `docs/design/2026-10-07-gemini-variant.md:21, 47, 59, 92`: **Correct-historical** (design artifact).
    - `tests/type.test.js:21`: **Stale** (lists notice under active 13px scale).

- **Check 3: Indications intro safeguard:**
  - Safeguard is **weakened/broken**. The new text omits the statement that the column contains penicillin-allergy alternatives. "Also" dangles without an antecedent ("Tap a section, then a row. The “PNC allergy / alternative” column also holds..."). No new clinical claim is introduced, but critical explanatory context is removed.

- **Check 4: Accuracy of documentation vs. Thiago's verbatim rulings:**
  - Overstates verification by removing the unverified disclaimer in README.md while Thiago only ruled on specific wording points.
  - Inflates F5 severity to "High" in docs/HISTORY.md:401 (Codex rated it Low).
  - Misattributes Codex findings F1–F5 to Gemini in docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:292.
  - Erroneously states in CLAUDE.md:160 that all four blurbs were rated High as interpretations (A3 was a code comment, not a blurb; blurbs A5 and A6 were Medium).

- **Check 5: Stale references:**
  - Stale references identified in README.md:86 (component catalog), CLAUDE.md:306 (type scale), tests/type.test.js:21 (test comment), src/data/pmg.js:925, 930, and src/components/FeverWorkupView.jsx:93-94 (omission of page-5 editorial alterations). Package and lock versions are consistently bumped to 0.7.5.

---

### WHAT THIS CHANGE IGNORES

1. **The underlying structural defect identified in Codex F3:** Codex flagged that `<100,000 CFU/mL ... discontinue antibiotics` has a downward incoming connection from `Start empiric antibiotics` in the PDF flowchart. The edit reordered the text within the WBC array item but completely ignored the unencoded downstream culture relationship, leaving the culture outcome as an isolated bullet point.
2. **Clinical sign-off of the full transcription:** The change removed the unverified banner based on rulings over 10 specific AI findings, ignoring that no physician has verified or signed off on the remaining hundreds of drug doses, intervals, durations, redose rules, and criteria.
3. **Public disclosure of page-5 discrepancies:** The change recorded Thiago's four page-5 deviations in internal developer comments (src/data/pmg.js:726-736 and CLAUDE.md), but ignored the user-facing Source page (`transcription.flags`) and FeverWorkupView.jsx, which continue to claim the flowchart was transcribed "exactly as drawn".
4. **All Medium and Low findings:** Codex finding F4 (inferred completion of clipped indication `...Urologic Instrumentation`), blurb findings A5 and A6, comment finding A8, and all Gemini text-crosscheck findings were left entirely unaddressed.

---

### CLINICAL CONTENT SURFACED IN PACKET (Needs Human Verification Against PDF)

Every item below is clinical content touched or surfaced in this review packet and **must be verified by a clinician against the source PDF**:

1. **Fever Workup UTI Branch (Touched):**
   - WBC Cutoff: `> 10 WBC` vs. `< 10 WBC`
   - Squamous Cell Cutoff: `> 2 squamous cells`
   - Clinical Action Sequence: `start empiric antibiotics and repeat UA if >2 squamous cells`
   - Culture De-escalation Thresholds & Rules: `<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics`
   - Urinalysis Order Instruction: `YES → obtain urinalysis with reflexive culture` (verification of whether "culture" is printed or implied)
   - Diagnostic Criteria: `Fever >38.5`, `Unexplained hypotension` (verification of whether "Unexplained" and "Hypotension" are separate criteria), `New urinary frequency, urgency, dysuria`, `Suprapubic pain`, `Flank pain`, `Spasticity or autonomic dysreflexia`, `Unexplained rising leukocytosis`

2. **Fever Workup Trigger & Other Branches (Surfaced):**
   - Workup Fever Trigger: `Temp >38.0 °C or 100.4 °F`
   - Pneumonia Diagnostic Criteria: Infiltrate plus any TWO of: Purulent secretions, Decline in pulmonary status, Fever `(>38.0)`, Unexplained leukocytosis, New onset delirium
   - Pneumonia Quantitative Culture Cutoffs: `≥ 10⁴ CFU/mL → narrow spectrum × 7 days (total)` vs. `≤ 10⁴ CFU/mL, negative cultures, or oropharyngeal flora → stop antibiotic therapy`
   - Central Line Trigger: `Central line >72 h with purulence at site?`

3. **Guideline Table Discrepancies & Flagged Values (Surfaced):**
   - Open Fractures Type III: `Cefepime 2 g q8 hours` (unqualified) vs. pediatric dosing table `2 g IV Q12h (≥40 kg)`
   - Metronidazole Regimens: `500 mg Q12H` (Trauma and EGS) vs. `500 mg IV Q8h` (Open fractures and page 4 dosing table)
   - Abdominal Trauma Duration: `24 hours OR 4 days after source control (consider monotherapy Zosyn)`
   - Open Extremity Fracture Timing: Timing numerals `28px / 36px`
   - Dosing Table Weight Thresholds: `< 60 kg` vs. `≥ 60 kg`
   - Vancomycin Dosing Protocol: `Pharmacy to Dose for adult and pediatric patients` / `Vancomycin x 1 dose if known MRSA colonization`
   - Purulent Cellulitis: `Pharmacy to dose`
   - HAP/VAP Duration: `7 days`
   - Skin & Soft Tissue Redose Interval: `Every 4 hours`

---

## Dispositions

- **Finding 1 (Critical), removing the notice — Thiago's instruction; relayed to him verbatim.**
  The README's status block was rewritten so it no longer reads as a clinical sign-off (it says the
  cross-checks were transcription checks, not clinical verification).
- **Finding 2 (High), the reworded UTI line and the unattached "<100,000 CFU/mL … discontinue
  antibiotics" outcome — clinical; relayed to Thiago verbatim.** Not changed.
- **Finding 3 (High), the shortened intro dropped "penicillin-allergy regimens" — fixed.** The
  intro reads "Tap a section, then a row. The “PNC allergy / alternative” column holds
  penicillin-allergy regimens but also contamination escalation and MRSA add-ons — read each
  note's condition."
- **Finding 4 (High), in-app disclosure of the page-5 departures — put to Thiago** (Codex's
  Finding 1, Medium, is the same point).
- **Finding 5 (Medium):** parts 1 and 2 fixed (the Gemini cross-check disposition now says the
  rulings were on Codex's findings; F5 recorded as Low and ruled on). Part 3 disputed and not
  changed: `CLAUDE.md`'s "all four" blurbs are Codex A1, A2, A4 and A7, all rated High; A3 is
  described as a code comment, and nothing claims A5 or A6 were ruled on.
- **Finding 6 (Low), stale mentions of the notice — fixed** in `README.md`, `CLAUDE.md`'s type
  scale and the role list in `tests/type.test.js`.
