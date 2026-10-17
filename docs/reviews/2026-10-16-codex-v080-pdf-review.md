# Codex review — v0.8.0, the October 2026 PMG (2026-10-16)

**Engine:** OpenAI Codex CLI 0.162.1, `gpt-6-astra`, reasoning effort `xhigh`, `codex exec --sandbox read-only`
(session header: `sandbox: read-only`), run from the session scratchpad. **Single engine.** 148,258 tokens.

**What it was given:** a 281,618-character packet on stdin and 17 page renders of the new PDF as images
(`-i`): pages 1–8 at 2x, 3x crops of pages 2–5, and an 8x crop of page 3's cefazolin dose cell. The packet
held the PDF's positioned text extraction (`docs/reviews/2026-10-08-pdf-crosscheck/extract.mjs`), the owner's
decisions from this session, the project rules that matter, and 15 files line-numbered and whole:
`src/data/pmg.js`, `src/lib/dosing.js`, `src/lib/search.js`, `src/components/{shared,IndicationsView,
OpenFracturesView,DosingView,DrugsView,SourceView,Header,VerificationNotice}.jsx`, `src/App.jsx`,
`scripts/verify-pmg.mjs`, `tests/pmg.test.js`, `tests/verify-controls.test.js`. Each file's line count in the
packet was checked against the source before sending, and the extraction against all 8 pages. The prompt told
it to use no tools; it ran none. The packet builder and the script that planted its claimed escapes are in
`2026-10-16-v080-review/`.

**Asked:** (A) every value in `pmg.js` against the page images; (B) whether anything the app shows differs
from the PDF; (C) verifier escapes; (D) other bugs.

**Result:** no transcription mismatch — "no mismatch in the current drugs, doses, frequencies, durations,
thresholds, or regimen associations against the supplied images" — across all 40 indication rows, both dosing
tables, the re-dosing rules, the open-fracture page, page 1 and the 35 references. Seven findings (1 High,
5 Medium, 1 Low), all verifier escapes or display omissions, none a wrong value.

This is a transcription check, not clinical verification; the verification notice stays on.

---

## Codex's review, verbatim

I found **no mismatch in the current drugs, doses, frequencies, durations, thresholds, or regimen associations** against the supplied images. The main findings concern verifier escapes and minor display omissions.

This was a static review of the packet. I used no tools and ran no tests. The mutations below are derived from reading the code.

## Findings

1. **High — Displayed clinical text can change without verification.**  
   `scripts/verify-pmg.mjs:648`; `src/data/pmg.js:722`; `src/data/pmg.js:1032`

   The contamination check uses the hardcoded heading `"Open Fracture Contamination"` instead of checking `of.contamination.heading`. The view renders the unchecked field at `OpenFracturesView.jsx:86`.

   - **PDF evidence:** Page 5, p5-bottom: `"Open Fracture Contamination: Applies to type I, II, & III fractures"`.
   - **Current data:** `heading: "Open Fracture Contamination"` — matches.
   - **Passing mutation:** Set `openFractures.contamination.heading = "Open Fractures Without Contamination"`. The verifier and supplied tests would accept it, while the app would display a materially different heading above the contamination regimen.

   Other displayed fields are similarly unchecked:

   | Passing mutation | Effect |
   |---|---|
   | Change `transcription.flags[5]` from `"15-20 mg/kg"` to `"150-200 mg/kg"` | Source page displays a false vancomycin dose. Page 3 and the actual dosing data say **15-20 mg/kg**. |
   | Change Trauma’s `sections[].title` to `"Empiric Therapy"` | The visible section is mislabeled although its verified `printedTitle` and dosing kind remain prophylaxis. |
   | Change a route correction’s `where` to another fracture type | Source page attributes the correction to the wrong regimen. The correction tests compare `pdf` and `here`, but not `where`. |

   These are **verifier escapes, not current transcription mismatches**. The current headings, corrections, and flags agree with the packet. The Source page should disclose these unchecked fields or the verifier should validate them.

2. **Medium — The short-label tests permit a clinically meaningful `or` → `and` change.**  
   `tests/pmg.test.js:67`; `tests/pmg.test.js:89`; `src/components/IndicationsView.jsx:423`

   - **PDF evidence:** Page 2, p2-bottom: `"Small Bowel Obstruction with Necrosis or Bowel Resection"`.
   - **Current data:** `short: "SBO with necrosis or bowel resection"` — matches in meaning.
   - **Passing mutation:** Change that short label to `"SBO with necrosis and bowel resection"`.

   The verifier deliberately ignores `short`. The substitute test accepts `and` as a stop word and checks the same `"with necrosis"` qualifier, so this mutation also passes the supplied label tests. The visible heading would change an either/or criterion into a conjunction.

   Similarly, `"Closed and non-operative face fracture"` passes for the PDF’s `"Closed or Non-Operative Face Fracture"`.

   **Current labels match; this is a coverage defect.** The existing controls test negation changes but not conjunction changes.

3. **Medium — A verifier-accepted redosing value can lose its hours unit on pills.**  
   `src/lib/dosing.js:25`; `scripts/verify-pmg.mjs:81`; `src/components/shared.jsx:459`

   - **PDF evidence:** Page 3: Metronidazole has `"8"` under `"Redosing Interval for OR Only (hours)"`.
   - **Current data:** `redose: "8"` — matches and currently produces `"OR redose 8 h"`.
   - **Passing mutation:** Set Metronidazole’s `redose` to `"8 "`.

   The verifier trims whitespace and accepts the value. `redoseLabel()` tests the untrimmed string, takes its nonnumeric branch, and produces `"OR redose 8 "` **without `h`**. The supplied dose-line assertions do not cover Metronidazole, so this mutation would also pass those tests.

   Normalize the value before deciding whether to append the unit. **There is no current OR-redosing-label mismatch.**

4. **Medium — Prose normalization can erase a changed numeric expression.**  
   `scripts/verify-pmg.mjs:113`; `scripts/verify-pmg.mjs:626`

   - **PDF evidence:** Page 3, p3-top: `"for every 1,500 mL"`.
   - **Current data:** `redosingRules[0].items[0]` contains `"1,500 mL"` — matches.
   - **Passing verifier mutation:** Replace `"1,500 mL"` with `"1:500 mL"`.

   `loose()` turns both expressions into the same normalized sequence, `1 500ml`. The changed expression would be displayed verbatim by `DosingView.jsx:103`.

   This is specifically a **verifier escape**. If committed as the new baseline, the existing blood-loss mutation control would fail because its replacement of `"1,500 mL"` would become a no-op. That incidental failure does not make the verifier’s comparison correct. There is no focused control for punctuation changing a numeric expression.

5. **Medium — A reference can lose its clickable link while passing the “with their links” verification.**  
   `scripts/verify-pmg.mjs:737`; `scripts/verify-pmg.mjs:747`; `src/components/SourceView.jsx:137`

   - **PDF evidence:** Page 6, reference 2 prints `https://doi.org/10.1136/tsaco-2023-001304`.
   - **Current data:** That address is correctly stored in reference 2’s `url`.
   - **Passing mutation:**
     ```js
     const r = data.references[1];
     r.text += " " + r.url;
     delete r.url;
     ```

   The concatenated reference remains identical, so the full-run comparison passes. The annotation check is skipped because `r.url` is absent. The Source view renders the address as ordinary text instead of an anchor.

   This mutation also avoids the existing dropped-link control, which specifically deletes reference **1**’s URL. No control checks moving a URL into `text`.

   **Current reference text and URL fields match; this is a structural verification escape.**

6. **Medium — Adding an unreferenced drug creates a false “agent named in the PMG” entry.**  
   `src/components/DrugsView.jsx:17`; `scripts/verify-pmg.mjs:444`; `tests/pmg.test.js:56`

   The By-drug index iterates every key in `drugs`, while validation only ensures that used drugs have metadata. It does not ensure that metadata keys correspond to drugs actually named in the PDF.

   - **PDF/data evidence:** The current 19 metadata keys correspond to the 19 agents represented in the supplied tables.
   - **Passing mutation:** Add `drugs.Gentamicin = { brand: "", class: "" }`.

   The verifier and supplied tests would accept it. The By-drug page would then list Gentamicin beneath `"Every agent named in the PMG"`, despite no such entry in these pages.

   This concerns the **generic drug-name inventory**, beyond the intentionally unchecked brand/class descriptions. The current inventory is correct.

7. **Low — Some printed labels are retained in data but omitted from the supplied views; other nonclinical PDF text is not transcribed.**  
   `src/components/OpenFracturesView.jsx:109`; `src/data/pmg.js:62`; `src/components/SourceView.jsx:141`

   **MISMATCH / omission of printed presentation, not clinical values:**

   - Page 5’s `"Open Fracture Description"` column header exists at `pmg.js:661`, but the classification view renders only `columns[0]`.
   - The full page-2 and page-4 banner titles—ending in `"Surgical Prophylaxis"` and `"Empiric Antibiotic Therapy"`—are not carried as their own data fields or rendered verbatim in the supplied views.
   - Indication first-column headings (`"Injury/Procedure"`, `"Procedure"`, `"Acute Infection"`) are stored but replaced visually by card headings.
   - The repeated `"Practice Management Guidelines"` running label and page-4 filler row of four dashes are not reproduced.

   Other visible differences are presentational: heading capitalization and terminal colons, `"Reference"` → `"References"`, abbreviated indication labels, expanded-plate `"plus"` instead of `+`, and omission of `https://` from visible reference-link labels. The actual reference `href` values remain intact in the current code.

   **I found no omitted clinical recommendation, regimen, duration, classification description, redosing rule, introductory paragraph, or reference entry.** The empiric footnote is present on Dosing; it is not repeated beside indication or By-drug doses.

Additional verifier limits and control coverage:

- **Authorized-route exception:** Changing an open-fracture route from `"IV"` to `"PO"` passes `verify()` because `regimenAsPrinted()` discards routes. The explicit IV test and correction-consistency test would reject it. **Current routes faithfully implement the owner’s instruction.**
- **Unchecked page metadata:** Changing `prophylaxisDosing.page`, `empiricDosing.page`, or `openFractures.page` passes verification; the verifier uses hardcoded pages instead. Current values **3, 4, 5** match.
- **Order and boundaries:** Indication order and classification-type order are not enforced. Joined comparisons also cannot enforce individual paragraph, dose-line, or duration-line boundaries. Current ordering and boundaries match the images.
- **No focused planted controls** cover the unchecked fields and escapes above. Implemented guards also lack targeted controls for several cases: section-page metadata; malformed/empty indication arrays; empty or duplicate dosing rows; redosing-group cardinality; duplicate fracture-regimen IDs; reference numbering; and a correct printed URL lacking its PDF link annotation. PDF-side geometry and filler checks are exercised by the real document, without corrupted-PDF controls in this packet.

## Clinical values touched

The following is the complete grouped checklist of numerical clinical content requiring physician comparison with the PDF. These are **transcription comparisons, not confirmation that the recommendations themselves are clinically correct**.

**Page 3 — surgical-prophylaxis dosing.** The table title specifies intravenous antibiotics. Redosing and infusion columns are **OR only**.

| Drug | Dose | OR redosing interval, hours | OR infusion time, minutes unless otherwise written |
|---|---|---:|---|
| Ampicillin-sulbactam | 3 g | 2 | 30 |
| Cefazolin | 2 g if < 120 kg; 3 g if ≥ 120 kg | 3 | IV push 3-5 |
| Ceftriaxone | 2 g | 12 | IV push 4-5 |
| Ciprofloxacin | 400 mg | 8 | 60 |
| Levofloxacin | 750 mg | Not recommended | 90 |
| Metronidazole | 500 mg | 8 | 30 |
| Piperacillin-tazobactam | 4.5 g | 2 | 30 |
| Vancomycin | 15-20 mg/kg | Not recommended | 60 min per 1000 mg |

The cefazolin **≥** is confirmed by p3-cefazolin. The data also preserve the comma after the first dose line.

**Page 4 — empiric dosing.**

| Drug | Dose | Route | Frequency |
|---|---|---|---|
| Amoxicillin-clavulanate | 875 mg / 125 mg | PO/per tube | Q12H |
| Ampicillin-sulbactam | 3 g | IV | Q6H |
| Azithromycin | 500 mg | IV or PO/per tube | Q24H |
| Cefazolin | 2 g | IV | Q8H |
| Cefepime | 2 g | IV | Q8H |
| Ceftriaxone | 2 g | IV | Q24H |
| Cephalexin | 500 mg | PO/per tube | Q6H |
| Ciprofloxacin | 400 mg (IV), 500 mg (PO) | IV or PO/per tube | Q12H |
| Clindamycin | 900 mg | IV | Q8H |
| Doxycycline | 100 mg | IV or PO/per tube | Q12H |
| Fosfomycin | 3 g | PO/per tube | Once |
| Levofloxacin | 750 mg | IV or PO/per tube | Q24H |
| Linezolid | 600 mg | IV or PO/per tube | Q12H |
| Metronidazole | 500 mg | IV or PO/per tube | Q8H or Q12H |
| Micafungin | 100 mg | IV | Q24H |
| Nitrofurantoin | 100 mg | PO/per tube | Q12H |
| Piperacillin-tazobactam | 4.5 g | IV | Q8H |
| Sulfamethoxazole-trimethoprim | 800 mg / 160 mg | PO/per tube | Q12H |
| Vancomycin | Pharmacy to dose | IV | Pharmacy to dose |

The footnote’s **adult patients with normal renal function** qualification and potential need for dose adjustment are retained verbatim.

**Pages 2–3 — indication durations.**

| Indication/group | Printed duration |
|---|---|
| Abdominal trauma; craniotomy; genitourinary trauma; vascular trauma | 24 hours |
| Open skull fracture, with or without significant contamination; penetrating brain/CNS injury, with or without significant contamination; open face/mandible fracture | 24 hours after closure or 72 hours total, whichever is shortest |
| Chest tube; ventriculostomy/ICP monitor; pneumocephaly; CSF leak; closed/non-operative face fracture | N/A throughout |
| Appendectomy | Non-perforated: 24 hours; perforated with source control: 4 days; `"Perforated without source control 8 days"` |
| Colectomy or bowel resection | N/A |
| SBO with necrosis or bowel resection; perforated peptic-ulcer patch repair | 4 days after source control or up to 8 days in critical illness |
| SBO without necrosis or bowel resection | 24 hours |
| NSTI debridement | 48-72 hours after final debridement, clinical improvement, and fever has been absent |
| All six elective rows: cholecystectomy, inguinal hernia, ventral hernia, ostomy reversal, cardiac/thoracic, skin/soft tissue | N/A |

The appendectomy line’s missing colon is correctly preserved.

**Page 4 — empiric indication durations.**

| Indication | Printed duration |
|---|---|
| CAP | 5 days; Azithromycin: 3 days |
| HAP/VAP | 7 days |
| Diverticulitis with source control | 4 days after source control or up to 8 days in critical illness |
| Diverticulitis without source control | 8 days |
| Cholecystitis | Post-Cholecystectomy with local inflammation: 24 hours; perforated with source control (includes PCT): 4 days; perforated without source control: 8 days |
| Both bacteremia rows and fungemia | Variable based on organism and patient specific factors |
| Complicated UTI/pyelonephritis | 7 days |
| Uncomplicated UTI/cystitis | Females: 3 days; Males: 5 days |
| Sinusitis | 5 days |
| Purulent cellulitis/or MRSA risk factors | 5-10 days |
| Non-purulent cellulitis | 5 days |
| NSTI | 48-72 hours after final debridement, clinical improvement, and fever has been absent |

**Page 3 — redosing conditions.**

- Surgery exceeding **2 half-lives**.
- Every **1,500 mL** blood loss, with the printed alternatives **>25ml/kg** or **>30% blood volume loss for patients <40kg**, regardless of agent.
- Prolonged surgery: use the listed redosing interval.
- Existing treatment with the **SAME** antibiotic: redose before incision if elapsed time exceeds the listed intraoperative interval.
- Existing treatment with a **DIFFERENT** antibiotic: administer the preferred preoperative antibiotic within the appropriate administration window.

**Page 5 — open fractures.** All displayed IV routes below are the owner-authorized additions; the PDF bullets contain no route.

| Printed parent bullet | Regimen | Its nested “If penicillin allergy” regimen |
|---|---|---|
| Type I & Type II | Cefazolin 2 g IV Q8H | Vancomycin IV: pharmacy to dose |
| Type III | Ceftriaxone 2 g IV Q24H + Vancomycin IV: pharmacy to dose | Levofloxacin 500 mg IV Q24H |
| Soil, fecal matter, standing water contamination; applies to types I, II, III | Cefepime 2 g IV Q8H + Metronidazole 500 mg IV Q12H + Vancomycin IV: pharmacy to dose | Levofloxacin 500 mg IV Q24H + Metronidazole 500 mg IV Q12H |

Also check:

- Antibiotics **within 30 min of arrival to the ED**, and **all patients** to have MRSA nasal screening.
- Type I wound **<1 cm**; Type II **1-10 cm**; IIIA wound **greater than 10 cm**, with the additional high-energy/gross-contamination criteria regardless of wound size.
- IIIB soft-tissue injury/loss, periosteal stripping, exposed bone and required coverage; IIIC arterial injury **requiring repair**.
- Type I/II: **24 hours total**.
- Type III: **24 hours after closure or 72 hours total, whichever duration is shorter**.

## Checked and matching

- **A — Transcription:** Compared all **40 indication rows**, including names, drug order, every `+`/`or`, drug-specific alternative labels, N/A cells, durations, section and page. Compared all **8 prophylaxis** and **19 empiric** dosing rows, headers, titles, footnote, four redosing bullets, and the complete open-fracture content. No clinical-value mismatch found.
- **Page 1:** Title wording and all four paragraphs match. Capitalization is adapted for the app.
- **References:** All **35 entries**, author/title/publication text, visible DOI/URL strings, numbering and page assignments match: **1–11 on page 6; 12–22 on page 7; 23–35 on page 8**. Reference 30 correctly has no URL. Reference 18 correctly preserves the PDF’s **2026** year.
- **B — Display:** Matching-table lookup is implemented correctly, with no cross-table fallback. Doxycycline, Linezolid, Clindamycin and Cefepime correctly receive no prophylaxis-table dose. Current OR-redosing labels preserve OR scope. Open-fracture allergy nesting and all IV additions match the owner’s decisions. The toggle says **Allergy**, and `App.jsx:138` renders the new-edition verification notice. All current transcription flags accurately describe the source.
- **C — Verifier:** The escapes above prevent treating its PASS as an exhaustive guarantee.
- **D — Other bugs:** No additional definite current functional bug established from the supplied code.

**UNVERIFIABLE, not mismatches:** All 19 brand/class associations at `pmg.js:969–987` are absent from the PDF and correctly disclosed as app-authored. The full PDF hash, actual PDF link annotations, offline behavior, and build-time invocation cannot be verified from images. `src/lib/text.js` was not supplied, so the claimed whitespace-only behavior of `fmtDose`/`keepUnits` and final rendered output remain unverified. Removed content is absent from the supplied data and views; omitted routing, footer and service-worker files prevent confirming its removal everywhere. No supplied clinical table value remained illegible.
---

## Claude's dispositions (separate from the review above)

Every escape Codex claimed was planted in a copy of the real data and run through the real `verify()` before
anything was changed (`2026-10-16-v080-review/plant.mjs`). **All thirteen passed the verifier as it stood**,
so every one was real. After the fixes, each is caught: by the verifier, or, where the field is app-authored
and not in the PDF, by a test.

| # | Finding | Confirmed? | Disposition |
|---|---|---|---|
| 1 | High — contamination heading unchecked | Yes | Fixed: the verifier anchors `of.contamination.heading` (not a literal) with its scope line. Control added. |
| 1 | — a flag's dose changed (`150-200 mg/kg`) | Yes | Test: every dose, frequency and quoted phrase in a flag must be found in the verified data, with its own negative cases. The Source page's "Not checked" list now says the notes' wording is app-authored. |
| 1 | — a section's display title borrowed | Yes | Test: a section's title may use only words of its printed table title, with a negative case. |
| 1 | — a correction's `where` re-attributed | Yes | Each `where` is now the bullet's exact path ("Open fractures — Type III Fractures — If penicillin allergy"), and the test requires it, the printed text and the shown text to match one regimen. |
| 2 | Medium — `or` → `and` in a short label | Yes | Test: a label may use "and"/"&"/"+" only if its PDF name has one, and "or"/"/"/"±" only if it has "or" or "/". Three controls (both of Codex's examples and "Cardiac or thoracic"). |
| 3 | Medium — `redose: "8 "` drops the "h" | Yes | `redoseLabel` trims first; a test now requires no string in the data to start or end with a space. |
| 4 | Medium — `1,500` → `1:500` passes | Yes | `norm` leaves a comma or colon between digits as printed, and `loose` keeps it. Control added. |
| 5 | Medium — URL moved into the reference text | Yes | Verifier: no reference text may hold a URL, and every link annotation on pages 6–8 must be the `url` of a reference starting on that page. Control added. |
| 6 | Medium — an invented drug in `drugs{}` | Yes | Verifier: every `drugs{}` key must be named by a verified table. Control added. |
| 7 | Low — printed labels not shown | Partly | The classification card now shows both printed column headers. Left as presentation, not clinical: the page banners, the indication tables' first-column headers (each row is a card with its name), the running "Practice Management Guidelines" label, the empiric table's filler row of dashes, heading capitalisation and colons, "Reference" shown as "References", "plus" on the expanded plate, `https://` dropped from link labels (the `href`s are whole). |
| — | Route IV → PO passes `verify()` | Yes | By design: the verifier sets the route aside, and `tests/pmg.test.js` pins IV on every open-fracture drug and checks the corrections. No change. |
| — | Dosing / open-fracture `page` fields unchecked | Yes | Fixed: each must be the page its table is read from. Three controls. |
| — | Row order not enforced | Yes | Fixed: indication rows must be in the PDF's order within each section, and the fracture types in the table's order. Two controls. Line boundaries inside a joined cell (a duration's lines) are **not** enforced: the PDF's physical lines include wrapped ones, so they cannot be compared. Codex found the current boundaries correct. |
| — | Guards without controls | Yes | Controls added: section page, empty preferred / alternative options / duration lists, duplicated and empty dosing cells, a dropped list of re-dosing rules, a duplicated regimen id, a misnumbered reference. Not added: "a correct printed URL with no link annotation", which is a property of the PDF and cannot be planted in the data. |

Controls: 89 → 107. Tests: 130 → 151, all passing; `npm run verify` PASS; `npm run build` green.

**No clinical value changed** in response to this review: `src/data/pmg.js` changed only in the six
corrections' `where` labels (and a comment). The clinical values Codex listed under "Clinical values touched"
are for a human to read against the PDF; the review cannot confirm them, and the verification notice stays on
until a physician has.
