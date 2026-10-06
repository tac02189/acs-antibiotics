# Codex peer review — pre-commit tree, 2026-10-06

Single-engine review (Codex CLI 0.153.4, model `gpt-6-astra`, reasoning effort `high`,
sandbox `read-only`, no tool use). Reviewed a 35-file snapshot of the tree taken at
05:48:23 on 2026-10-06, embedded on stdin together with an independent xpdf
`pdftotext -table` extraction of the source PDF. Relayed by the `codex-review` bridge agent;
its own checks follow the Codex output. **Nothing below was dismissed or softened.** The
dispositions (what changed in the tree in response) are recorded at the end and in
`CLAUDE.md` → History.

This is a Codex-only review. It was not cross-checked by Gemini.

---

## Bridge agent's headline (not Codex's text)

- Codex returned 26 findings: 7 CRITICAL, 8 HIGH, 7 MEDIUM and 4 LOW. It found no mismatched dose, frequency or duration in pages 1–4 against the extraction. That is **not** clinical verification, and every value in its Section C is HUMAN CHECK REQUIRED.
- **The verifier is porous, and I reproduced this myself.** I applied the 38 single-edit mutations from Codex's tables to a throwaway copy and ran the real verifier and test suite on each.
  - `npm run verify` printed PASS on all 38.
  - 31 of the 38 also pass `npm test`, so `npm run build` and `npm run deploy` would proceed.
  - Examples that pass the full gate: vancomycin 15 mg/kg → 5 mg/kg, `< 60 kg` → `> 60 kg`, open-fracture prophylaxis `24 hours` → `4 hours`, and a workup `7 days` → `70 days`.
- F7 is a clinical-content item for a human with the PDF. The page-5 flowchart transcription contradicts itself at its boundaries (`≥ 10⁴` versus `≤ 10⁴`; `> 10 WBC` versus `< 10 WBC`).
- The tree has moved since the snapshot. `Header.jsx` changed, so Codex's `Header.jsx` line numbers are now off by +2 after line 13.

### Run record

- **Engine and model:** Codex CLI 0.153.4, session `01a110db-9be1-7fa2-ba8e-a537bf7edde2`. The session header reads `model: gpt-6-astra`, `provider: openai`, `sandbox: read-only`, `approval: never`, `reasoning effort: high`.
- **Effort and timing:** effort `high`; a 269 KB packet took 10m17s (101,983 tokens).
- **Invocation:** `codex exec -m gpt-6-astra -c model_reasoning_effort="high" --color never --skip-git-repo-check --sandbox read-only -C <project> -o <out> - < prompt.md`. The prompt told Codex not to touch the filesystem.
- **No tool use:** the transcript after the echoed prompt is only the final answer. Codex's receipt matches the manifest on all 35 line counts and quotes the last lines of four files, all exact.
- **Packet:** 35 files, 4,271 numbered lines, 269,476 bytes (sha256 `92c9b9ff4212de2bf420faa62f8c589e0f172b419e1e84154f2dfebe0fc8cc9e`), built from a hash-checked snapshot and verified to rebuild byte-identical.
- **Deviations from the brief:** extraction LF-normalised from CRLF and Latin-1 bytes shown as `{{0xNN}}` tokens; nine supplementary files added (`src/index.css`, `tailwind.config.js`, `.firebaserc`, `.claude/launch.json`, `.claude/npm-run.cjs`, `dist/index.html`, `dist/sw.js`, `dist/registerSW.js`, `dist/manifest.webmanifest`); not embedded: `package-lock.json`, `postcss.config.js`, `scripts/gen-icons.mjs`, the PDF and the PNGs.

---

## BEGIN CODEX OUTPUT (verbatim)

### A. Packet receipt

All 35 files reach their stated final gutter line. The counts sum to **4,271 lines**, matching the manifest. **I used no tools.** All conclusions below come from the embedded snapshot.

(35-file receipt with line counts omitted here for length; it matched the manifest exactly.)

"PASS" predictions below are static deductions, assuming the unmodified baseline passes as represented in the packet. I did not execute the mutations.

### B. Findings, most severe first

**F1 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:316–342 — Dosing verification accepts reversed thresholds, wrong drug–dose associations and shortened doses**

- **Problem:** Comparisons remove inequality operators and search entire columns for substrings. They do not bind cells to individual drug rows.
- **Evidence:** `stripIneq` removes `[<>≥≤]` at line 323; lines 333 and 336 use `adultText.includes(...)` and `pedsText.includes(...)`.
- **Concrete single-edit mutations that still pass:**

| Data location | Before → after | Why PASS; full test suite |
|---|---|---|
| `src/data/pmg.js:655` | `< 60 kg: 33 mg/kg/dose IV Q8h` → `> 60 kg: 33 mg/kg/dose IV Q8h` | Both signs disappear. Shape tests also pass. |
| `src/data/pmg.js:661` | Pediatric array → `["< 60 kg: 33 mg/kg/dose IV Q8h", "≥ 60 kg: 2 g IV Q8h"]` | Cefazolin's pediatric cells occur in the same column, so Cefepime receives them without rejection. Shape tests pass. |
| `src/data/pmg.js:658` | `drug: "Cefepime"` → `drug: "Cefazolin"` | Drug presence is checked anywhere on page 4; duplicate dosing drug names are not rejected. Shape tests pass. |
| `src/data/pmg.js:672` | `15 mg/kg IV Q12h (max 1.5g/dose)` → `5 mg/kg IV Q12h (max 1.5g/dose)` | Normalized `5mg/kg...` is a substring of `15mg/kg...`. Shape tests pass. |
| `src/data/pmg.js:673` | `20 mg/kg/dose IV Q8h (max 1.5g/dose)` → `20 mg/kg/dose IV Q8h` | A shortened prefix still occurs in the column. The maximum disappears from display. Shape tests pass. |
| `src/data/pmg.js:654` | `adult: ["2 g IV Q8h"]` → `adult: []` | No adult-cell comparison executes. **Verifier passes; shape test rejects.** |

- **Failure scenario:** A wrong pediatric threshold or dose is displayed under the correct drug, while `npm run build` remains green for the first five examples.
- **Smallest fix:** Compare complete, row-associated adult/pediatric cells with exact cardinality and unique drug keys. Missing inequality glyphs require explicit, human-reviewed operator assertions, not removal of all operators. Reject empty cells and arrays.
- **Confidence:** High. Actual PDF geometry and missing glyphs cannot be inspected here.

---

**F2 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:299–314; tests/pmg.test.js:55–67 — Open-fracture display regimens are not verified as drug–dose–frequency tuples**

- **Problem:** The verifier checks `a.text`; the UI renders `a.regimen`. The supplementary test checks independent substring presence, allowing another drug's dose or frequency to satisfy the assertion.
- **Evidence:** Verifier line 306 checks only `a.text`. Test lines 59–62 separately search for drug, dose, frequency and optional note. `OpenFracturesView.jsx:49–52` renders the structured regimen.
- **Concrete single-edit mutations that still pass both verifier and tests:**

| Data location | Before → after |
|---|---|
| `src/data/pmg.js:603` | Cefepime `dose: "2 g"` → `dose: "15 mg/kg"` |
| `src/data/pmg.js:603` | Cefepime `frequency: "q8 hours"` → `frequency: "q12 hours"` |
| `src/data/pmg.js:595` | `route: "IV"` → `route: "IM"` |
| `src/data/pmg.js:614` | Delete the complete Metronidazole regimen-entry line |
| `src/data/pmg.js:602–605` | Replace the Type III `regimen` array with `regimen: []` |

The first two borrow Vancomycin's tokens. Route is never compared. Removing display entries leaves fewer—or zero—iterations, with no reverse completeness check.

- **Failure scenario:** The displayed contamination regimen loses Metronidazole, or Cefepime acquires Vancomycin's dose, while the verified prose remains correct.
- **Smallest fix:** Use one canonical representation for verification and display, or compare complete parsed tuples in both directions, including route, notes, order and cardinality.
- **Confidence:** High.

---

**F3 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:302–314 — Open-fracture substring checks accept wrong durations and omitted requirements**

- **Problem:** Whole-page substring matching is neither exact nor bidirectional.
- **Evidence:** `text34.includes(norm(phrase))` at line 303; only antimicrobial count has a minimum at line 314.
- **Concrete single-edit mutations:**

| Data location | Before → after | Result |
|---|---|---|
| `src/data/pmg.js:619` | `value: "24 hours"` → `value: "4 hours"` | PASS, including tests: `"4 hours"` occurs inside `"24 hours"`. |
| `src/data/pmg.js:619` | `value: "24 hours"` → `value: "72 hours"` | PASS, including tests: the other fracture-duration paragraph contains it. |
| `src/data/pmg.js:547` | Timing string → `""` | PASS, including tests: every string contains the empty string. |
| `src/data/pmg.js:624–627` | Debridement items → `items: []` | PASS, including tests: the two operative requirements disappear. |
| `src/data/pmg.js:553` | Type I description → `description: ""` | PASS, including tests: falsy descriptions are skipped. |
| `src/data/pmg.js:618–621` | Duration array → `duration: []` | Verifier PASS; shape test rejects its length. |

- **Failure scenario:** "24 hours" becomes "4 hours" and remains deployable through the prescribed build.
- **Smallest fix:** Bind each complete statement to its source item, require nonempty values and expected item identities/counts, and compare both directions.
- **Confidence:** High.

---

**F4 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:251–297 — Display names, sections, applicability labels and clinical headings bypass verification**

- **Problem:** Several fields decide which patient or indication receives verified content, but are unchecked.
- **Evidence:** Matching uses `ind.name`, not `ind.short`; section checks only require nonempty sections. Open-fracture comparisons do not check `applies`, main type labels, duration labels, headings or stable/unstable labels.
- **Concrete single-edit mutations that pass verifier and tests:**

| Data location | Before → after | Display consequence |
|---|---|---|
| `src/data/pmg.js:113` | `short: "Craniotomy"` → `short: "Chest tubes"` | Craniotomy antibiotics appear under a chest-tube heading. |
| `src/data/pmg.js:235` | `section: "egs"` → `section: "elective"` | Appendicitis appears in Elective Surgery. |
| `src/data/pmg.js:600` | `applies: "Type III — treatment for ALL Type III"` → `applies: "Type I & II"` | Type III regimen receives a different applicability label. |
| `src/data/pmg.js:619` | `applies: "Type I & Type II Fractures"` → `applies: "Type III"` | Duration is assigned to the wrong fracture group. |
| `src/data/pmg.js:623` | `Operative debridement within 24 hours` → `Operative debridement within 48 hours` | Unverified operative timing is displayed. |
| `src/data/pmg.js:632` | `Hemodynamically stable patients` → `Hemodynamically unstable patients` | Fixation advice receives the opposite patient label. |
| `src/data/pmg.js:648` | `Adult Dosing (age ≥15 years)` → `Adult Dosing (age ≥5 years)` | Wrong age boundary heads the dosing cells. |
| `src/data/pmg.js:653` | `footnote: "renal"` → `footnote: null` | Cefazolin loses its renal-adjustment marker. |
| `src/data/pmg.js:677` | `mark: "*"` → `mark: "**"` | Footnote identity changes without rejection. |

Adding `route: "IM"` or `note: "Single dose only"` to `src/data/pmg.js:89` also passes: `expectedCells()` ignores nested regimen `route` and `note`, while `OrderLine` renders them.

- **Smallest fix:** Validate all rendered clinical fields and their associations. Keep editorial labels separate and require a reviewed mapping from each label to the source row.
- **Confidence:** High.

---

**F5 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:55–75,213–227,252–294 — Additional indication-comparison escape paths**

- **Problem:** The purported row bijection has a global prefix exception; normalization removes all asterisks; some fields or rows are omitted from comparison.
- **Evidence:** `n.startsWith(nameText)` at line 267 applies to **every** source name at least 20 characters long. Line 62 removes all `*`. Lines 214–215 replace every expected field with N/A whenever the regimen is falsy.

| Single-edit mutation | Why verifier still passes | Other tests |
|---|---|---|
| `src/data/pmg.js:85`: append ` — pediatric patients only` to the full `name` | Global prefix matching accepts the extra clinical qualifier. | Pass |
| `src/data/pmg.js:601`: remove both `*` and `**` from the antimicrobial text | Normalization erases markers on both sides. | Pass |
| `src/data/pmg.js:106`: `alternative: null` → `alternative: "Levofloxacin"` | N/A expected-cell shortcut ignores the actual alternative. | Reject |
| `src/data/pmg.js:399`: `frequency: "One-time dose"` → `frequency: ""` | Unique frequencies become `"One-time dose "`; normalization removes the trailing space. | Reject |
| `src/data/pmg.js:541`: append an invented page-3 indication | The new row is excluded by the page-1/2 filter, but contributes to section counts and is rendered by the app. | Reject |

- **Failure scenario:** A restrictive disease qualifier or patient population can be appended to a verified row name without rejection. Standalone `npm run verify` also accepts the other malformed data.
- **Smallest fix:** Limit the one documented truncated-name exception to an explicit row and exact approved expansion; validate every indication before filtering; compare N/A fields explicitly; preserve and validate footnote associations; require each regimen frequency.
- **Confidence:** High.

---

**F6 [CRITICAL] [Area 2] scripts/verify-pmg.mjs:344–374 — References and page-5 links can be assigned to the wrong labels while passing**

- **Problem:** Authors, years, URLs and labels are checked independently against whole-page sets.
- **Evidence:** Line 367 independently checks author and year presence. Lines 348–349 independently check URL and label. Cardinality does not establish uniqueness or association.
- **Concrete single-edit mutations that pass verifier and tests:**

| Data location | Before → after |
|---|---|
| `src/data/pmg.js:791` | Reference 3 `(2000)` → `(2019)` |
| `src/data/pmg.js:791` | `132, 621–630.` → `132, 621–639.` |
| `src/data/pmg.js:753` | Pneumonia URL → `https://www.cdc.gov/nhsn/pdfs/pscmanual/7psccauticurrent.pdf` |
| `src/data/pmg.js:783` | Reference 1 DOI → `https://doi.org/10.1097/CCM.0b013e318287f713` |

- **Failure scenario:** A pneumonia reference-standard label opens the CAUTI document; a reference points to a different study while PASS says references agree.
- **Smallest fix:** Compare complete numbered reference records and exact label–URL pairs, with uniqueness and reverse completeness.
- **Confidence:** High.

---

**F7 [CRITICAL] [Area 1] src/data/pmg.js:714–715,744–745 — Fever-workup boundary instructions conflict or leave a gap**

- **Problem:** At exactly `10⁴ CFU/mL`, both pneumonia outcomes apply. At exactly `10 WBC`, neither listed urinalysis outcome applies.
- **Evidence:** `"≥ 10⁴ CFU/mL → narrow spectrum × 7 days (total)"` and `"≤ 10⁴ CFU/mL ... → stop antibiotic therapy"`; UTI outcomes use `> 10 WBC` and `< 10 WBC`.
- **Failure scenario:** The same culture count presents both continuing/narrowing therapy and stopping therapy.
- **Smallest fix:** Have a human inspect page 5 and approve the exact boundary operators and branch structure. Do not choose an operator from this review.
- **Confidence:** High for the internal contradiction/gap; **source fidelity cannot be verified** because page 5 is an image. These values remain **unverifiable by this review — a human must check them against the PDF**.
- **Verifier limitation:** A single edit at `src/data/pmg.js:714`, `7 days` → `70 days`, also passes verifier and tests. Image-derived clinical text has no automated content check.

---

**F8 [HIGH] [Areas 1, 4] src/data/pmg.js:593–614; src/components/OpenFracturesView.jsx:49–61 — Open-fracture drug footnote markers disappear from the displayed regimens**

- **Problem:** Source prose contains `Cefepime*` and `Vancomycin**`; structured display entries omit the marks.
- **Failure scenario:** A reader cannot identify which displayed agent the renal-adjustment asterisk modifies.
- **Smallest fix:** Carry an explicit footnote reference on each applicable regimen entry and render it beside the drug.
- **Confidence:** High.

---

**F9 [HIGH] [Area 4] src/components/Header.jsx:100–112; src/components/IndicationsView.jsx:185–188; src/components/DrugsView.jsx:69–70 — Mixed-purpose source column is presented as an allergy alternative**

- **Problem:** The expanded indication view preserves "PNC allergy / alternative," but the toggle says "PCN allergy," collapsed summaries say "PCN allergy / alt," and the drug index says "Alternative for."
- **Evidence:** The source column contains contamination escalation, a clindamycin **addition**, and conditional MRSA instructions. These are not all allergy substitutions.
- **Failure scenario:** With the allergy toggle enabled, contamination therapy is highlighted as though it answers the allergy question; the clindamycin drug page labels an add-on as an alternative.
- **Smallest fix:** Label the control and summaries "Highlight PDF alternative / notes column." Preserve each note's condition and explicitly state that this column does not always specify an allergy regimen.
- **Confidence:** High.

---

**F10 [HIGH] [Area 4] src/components/DrugsView.jsx:69–109,124–129 — Drug pages omit combination partners and dosing qualifications**

- **Problem:** "First-line in" shows only the selected drug's dose/frequency. Fracture entries omit `note`; dosing blocks omit the age boundary and footnote markers/text.
- **Failure scenario:** A reader sees Vancomycin as "First-line in" HAP/VAP without its Piperacillin-tazobactam partner, or sees a renal-adjusted drug's dose without the renal qualification.
- **Smallest fix:** Say "Component of regimen for," show combination partners and applicable notes, and render the same qualified dosing block used on the Dosing view.
- **Confidence:** High.

---

**F11 [HIGH] [Area 3] vite.config.js:62–64; src/components/shared.jsx:3–5; dist/sw.js:1 — PDF hash query does not bind the response to that PDF version**

- **Problem:** The service worker intentionally ignores the parameter that distinguishes PDF versions.
- **Failure scenario:** An installed old worker receives a newer `?v=` PDF URL and returns its old PDF. Conversely, a bookmarked old-version URL returns the current worker's newer PDF.
- **Smallest fix:** Use a content-hashed PDF filename and precache that exact filename; update `source.file` with the document.
- **Confidence:** High for the configured matching behavior; medium for lifecycle timing.

---

**F12 [HIGH] [Area 3] src/main.jsx:54–69 — Continuously open foreground sessions have no application-enforced freshness bound**

- **Problem:** The code calls its freshness bounded, but checks only on load, reconnect and visibility change.
- **Failure scenario:** A bedside device remains online and foregrounded across a deployment. None of those events occurs, so the app makes no further explicit update check and may keep displaying the old clinical bundle.
- **Smallest fix:** Add a modest, visibility-aware periodic update check and an explicit last-successful-check/version indicator.
- **Confidence:** High for the absent application bound.

---

**F13 [HIGH] [Areas 2, 7] src/components/SourceView.jsx:39–40; src/data/pmg.js:7–10; README.md:10–11,65–89 — Verification assurance substantially exceeds actual coverage**

- **Problem:** "Every value" and "proves the app matches the document" are false given F1–F7, the image-derived flowchart, unchecked labels and independently stored display regimens.
- **Failure scenario:** A physician relies on the verification claim when deciding how thoroughly to review the transcription, despite deployable wrong-data mutations.
- **Smallest fix:** State the exact checked fields and current exclusions; describe PASS as limited automated consistency checking. Update the claim only after those gaps are closed.
- **Confidence:** High.

---

**F14 [HIGH] [Area 4] src/App.jsx:32,45–48; src/components/IndicationsView.jsx:29–54 — Retained search can hide a requested deep-linked indication**

- **Problem:** Following an indication link does not clear the previous query. The focus effect marks the ID handled even when no matching DOM element exists.
- **Failure scenario:** Search "appy," open Ceftriaxone's drug page, then select Complicated UTI. The old "appy" filter remains, so the requested UTI card is absent. Clearing search later does not rerun the focus effect.
- **Smallest fix:** Clear or override search/section filtering when navigating to a specific indication; mark focus handled only after the target exists and is opened.
- **Confidence:** High.

---

**F15 [HIGH] [Area 3] firebase.json:5–17 — Extensionless asset paths can return HTML with the asset cache policy**

- **Problem:** The rewrite excludes dots, not the asset directory.
- **Evidence:** `^/[^.]*$` matches `/assets/missing` and `/assets/`; `/assets/**` requests also match the immutable header rule.
- **Failure scenario:** A missing extensionless asset request returns `index.html`; depending on duplicate-header resolution, it can receive the one-year immutable asset policy.
- **Smallest fix:** Exclude `/assets/` from shell routing, or remove the catch-all rewrite for this hash-routed app. Verify live response status, content type and cache headers.
- **Confidence:** High that the regex matches these paths; medium for effective Firebase response headers.

---

**F16 [MEDIUM] [Area 4] src/lib/search.js:25–38,50–53; src/components/DrugsView.jsx:14–16 — Search/index omissions and substring matches can misdirect retrieval**

- **Problem:** Search excludes duration and regimen notes; punctuation-sensitive substring matching has clinically relevant false negatives and false positives.
- **Evidence / concrete scenarios:** "Zosyn" misses abdominal trauma's `"consider monotherapy Zosyn"` duration; "nonpurulent" does not match `"Non-Purulent"`; "complicated UTI" can include **uncomplicated** UTI; "purulent" also matches **non-purulent**; dose/frequency fields are not searched.
- **Smallest fix:** Index the intended clinical fields consistently; add explicit orthographic variants and token/negation-aware matching. Keep broad matches visibly qualified.
- **Confidence:** High. No current drug-name collision causing Metronidazole or another listed generic to match a different generic in alternative text.

---

**F17 [MEDIUM] [Areas 4, 5] src/components/IndicationsView.jsx — Route state, visible counts and focus are inconsistent**

- `#/s/unknown` yields no sections, but `total` remains 34 and no empty-state message appears; a section-filtered search reports global matches; `focusedOnce` is not reset when leaving an indication route; copy link calls `history.replaceState` directly; scroll effects never move keyboard/screen-reader focus to the new view or indication.
- **Smallest fix:** Validate route parameters, derive counts from displayed results, route history changes through the router, and implement repeatable target focus after rendering.

---

**F18 [MEDIUM] [Area 5] src/components/shared.jsx:35–51 — Order-line grids can overflow and clip doses on narrow phones**

- The drug column has its automatic minimum width; the dose column is `auto` with `whitespace-nowrap`; the ancestor clips overflow. Long drug/dose pairs such as Sulfamethoxazole-TMP with `800 mg/160 mg` can exceed card width.
- **Smallest fix:** Stack drug and dose at narrow widths, or permit safe wrapping with `minmax(0,1fr)`/`min-w-0`.

---

**F19 [MEDIUM] [Area 5] src/index.css; Header.jsx; IndicationsView.jsx — Small gold text and focus styling have insufficient contrast**

- `#B8860B` on `#FFFDF8`: **3.2:1**; on `#F6F3EC`: **2.9:1**; `#F1B82D` outline against `#FFFDF8`: **1.8:1**; 70%-opacity placeholder ≈ **3.1:1**.
- **Smallest fix:** Darken light-theme gold text and use a contrasting focus outline. Avoid reduced-opacity placeholder text.

---

**F20 [MEDIUM] [Area 5] src/components/Header.jsx — Sticky tools are constrained by the header's bottom edge**

- The sticky element is the last child of a header that ends before the main content, so it cannot remain sticky through the main content.
- **Smallest fix:** Place the sticky toolbar in a containing block spanning the main scrolling content.

---

**F21 [MEDIUM] [Area 5] — Printing preserves collapsed, incomplete clinical cards**

- No print rules reveal collapsed duration, redose and alternative panels; printing the default view produces medication summaries without the rest of their instructions.
- **Smallest fix:** Print rules that expose all clinical fields and their qualifications.

---

**F22 [MEDIUM] [Area 7] package.json; README.md — Documented deploy setup omits the Firebase CLI**

- `npm run deploy` invokes `firebase`, but `firebase-tools` is not a dependency and the setup does not instruct users to install it.

---

**F23 [LOW] [Area 1] src/data/pmg.js:816 — Reference 9 contains an unaccounted-for ending difference**

- Data ends `1404–1417.`; the extraction ends `1404–141`. Inspect the rendered reference and either confirm it or document the correction.

---

**F24 [LOW] [Area 1] — Disclosed source-wording differences require explicit reconciliation**

- `transfustion`→`transfusion`; `Nectrotizing`→`Necrotizing`; `Ertapenum`→`Ertapenem`; `7days`→`7 days`; `Every 4 hour`→`Every 4 hours`; `...Urologic Instr`→`...Urologic Instrumentation`; `Pharmacy to dos`→`Pharmacy to dose`. Retain the disclosure and obtain human approval of the completions.

---

**F25 [LOW] [Areas 2, 7] — Test count and deployment history are inaccurate**

- There are **19 planted-error tests plus one baseline test**, not 20 planted errors. History also says "first deploy" although this packet is explicitly pre-deploy.

---

**F26 [LOW] [Area 5] — Reduced-motion preference does not cover scripted scrolling**

- CSS disables animations/transitions, but both scroll effects request `behavior: "smooth"`.

**Verifier/test coverage assessment**

- **Not covered by the planted controls:** operator reversal; leading-digit deletion accepted as a substring; cross-row dosing assignment; missing maxima; route changes; structured fracture partner deletion; borrowed combination frequency/dose; altered applicability or short labels; section moves; missing footnote associations; prefix-name extensions; empty ancillary arrays; duplicate/misassociated reference links; existing-but-wrong reference years; flowchart clinical text; UI rendering; caching and routing behavior.
- **Build/deploy enforcement:** `package.json` runs tests, then verifier, then Vite, then deployment using `&&`. Under these scripts, failure stops deployment. CI runs the same build without a skip path.

### C. Area 1 reconciliation table + clinical-content register

**All values are HUMAN CHECK REQUIRED — unverifiable by this review; a human must check them against the source PDF.** MATCH means agreement with the supplied text extraction, not clinical verification.

Counts: Trauma 12/12, Emergency General Surgery 8/8, Elective Surgery 7/7, ICU & General Floor 7/7 — total 34/34. All 34 indications: every drug/dose/frequency/duration/redose/alternative cell MATCHES the extraction (the only differences are the seven disclosed spelling corrections and the truncated "Urologic Instr" label). All four open-fracture antimicrobial bullets, five classification descriptions, two durations, operative-timing items, femoral-shaft items and the four dosing rows MATCH, with the dosing-table "≥" glyphs NOT-IN-EXTRACTION. Fever-workup content (page 5) is entirely NOT-IN-EXTRACTION. References 1–13 MATCH apart from unidentified range-separator glyphs, except reference 9's final digits (F23) and reference 12's URL trailing slash.

(The full per-row register, listing each value verbatim for human checking, is in the bridge agent's transcript; the values are exactly those in `src/data/pmg.js`, which is the document to check against the PDF.)

### D. Clinical statements outside src/data/pmg.js

Statements in components, README and CLAUDE.md are editorial restatements of data-file content or project provenance. Items Codex traced to nothing in the extraction: "for all ages" (`pmg.js` flags), "for everyone" (`CLAUDE.md`), "pre-incision" (Elective Surgery blurb), the brand/class table, and the search aliases.

### E. Cannot be verified from the evidence supplied

The actual PDF images (all of page 5); the missing `≥` glyphs; reference 9's final digit; pdf.js geometry and link annotations; runtime Workbox behaviour; Firebase header resolution; first-ever offline access; mobile overflow, assistive-technology behaviour and print pagination; dependency audit; redistribution permission for the institutional PDF.

### F. Areas with no findings

Area 1: no missing/invented rows, no wrong section/page in the current data, no adjacent-row swaps, no confirmed digit mismatch in pages 1–4. Area 6 (secrets/config): no findings in the embedded material. Area 5: the search input is ≥16px; `inert` is used correctly for React 18; landmarks, labels and focus styles are present.

### G. Limitations

Static, read-only review of the pasted bytes. **It does not validate any clinical dose, frequency, duration, threshold, regimen or allergy alternative.**

## END CODEX OUTPUT

---

## Bridge agent's assessment (separate from Codex's output)

- 116 `file:line` + snippet checks against the snapshot: none was a wrong citation.
- Counts confirmed: sections 12/8/7/7 = 34; the control file has 20 `test(` calls (1 baseline + 19 planted); contrast ratios recompute to 3.20, 2.94, 1.78, 5.89 and 10.28; no print rule exists; no `firebase-tools` in `package.json`.
- **Mutation experiment on F1–F7:** all 38 of Codex's listed mutations passed `node scripts/verify-pmg.mjs`; 31 also passed the full test suite; 5 were rejected by the shape tests as Codex predicted; 2 (F5.2, F6.1) were rejected only because an existing control's `.replace()` became a no-op — the clinical edit itself was not detected.
- Secrets scan of the files a first commit would stage: none found; `git check-ignore` confirms the project-first Firebase admin filename is ignored.
- **Dismissals: none.**
- **Needs a human with the PDF:** page 5 in full (including F7's boundaries); the `≥` operators in the dosing table; the separator glyphs ("Vancomycin – Pharmacy to dose"); reference 9's final digits; the completed name "…Urologic Instr[umentation]"; the brand/class table; and every value in Section C.

---

## Dispositions (Claude, same day)

Applied before the first commit — see `CLAUDE.md` → History for the summary and the git history for the diffs.

| Finding | Disposition |
|---|---|
| F1 | Fixed. Dosing table rebuilt from its borders and three column bands; drug cell (with footnote mark), adult cell and pediatric cell compared exactly per row; unique drugs; empty cells rejected; only `≥`/`≤` dropped (pdf.js cannot read them), `<`/`>` compared. Controls added. |
| F2 | Fixed. The displayed regimen must re-state the verified text exactly (drug + mark + dose + route + frequency + note, in order). Controls added. |
| F3 | Fixed. Whole-phrase, word-boundary matching bound to each printed label; empty phrases rejected; fixed structure counts asserted. Controls added. |
| F4 | Fixed in the verifier for sections (read from the PDF's section headers), `applies`, duration labels, headings, stable/unstable labels, header labels, footnote marks; `route`/`note`/`footnote` rejected on table regimens. `short` labels are checked for faithfulness to `name` by a test (the PDF cannot see them). Controls added. |
| F5 | Fixed. Truncated-label exception limited to `complicated-uti` with the exact printed text; `*` no longer stripped; N/A rows must be N/A everywhere; empty regimen fields rejected; every indication must be on page 1 or 2. Controls added. |
| F6 | Fixed. Page-5 links bound to the label printed inside each annotation's rectangle; references compared as whole contiguous numbered entries including printed DOI/URL. Controls added. |
| F7 | Flagged, not judged: the boundary overlap/gap is reproduced as drawn and listed in `transcription.flags` and on the Source page for the reviewing physician. |
| F8 | Fixed. Footnote marks carried on regimen entries and rendered beside the drug, with the footnote text below. |
| F9 | Fixed. The toggle and summaries now name the PDF column ("Alternative column") and the Indications intro states that the column also carries contamination escalation and MRSA add-ons. |
| F10 | Fixed. Drug pages show the whole regimen (all partners) for each indication, fracture notes, and the full dosing block with age label and footnotes. |
| F11 | Fixed. PDF served under a content-hashed filename; `?v=` and its ignore rule removed; the verifier requires the filename to carry the hash. |
| F12 | Fixed. Hourly update check while the page is visible and online, in addition to load/online/visibility. |
| F13 | Fixed. Source page, data-file header, README and CLAUDE.md now state exactly what is and is not checked. |
| F14 | Fixed. Navigating to an indication clears the search and section filter; focus handling waits for the card to exist. |
| F15 | Fixed. The catch-all rewrite was removed — the app is hash-routed, so no server path other than `/` is ever real. |
| F16 | Fixed. Duration, regimen notes, doses and frequencies are indexed; hyphenated words match with or without the hyphen; a token is not matched inside a negated word ("un-", "non-"). |
| F17 | Fixed. Counts derive from what is displayed; unknown section shows an empty state; focus state resets; copy-link goes through the router; the opened card receives keyboard focus. |
| F18 | Fixed. `minmax(0,1fr)` grid, wrapping doses. |
| F19 | Fixed. Darker light-theme gold text; ink-coloured focus ring in light mode; full-opacity placeholder. |
| F20 | Fixed. The sticky toolbar is a sibling of `<main>`, not a child of `<header>`. |
| F21 | Fixed. Print stylesheet expands every panel and hides the toolbar. |
| F22 | Fixed. README documents installing and logging into `firebase-tools`. |
| F23 | Fixed. Reference 9 reproduced as printed ("1404–141") and flagged. |
| F24 | Kept as disclosed; the completions are listed for human approval on the Source page. |
| F25 | Fixed. Counts corrected; "first deploy" recorded only when it happens. |
| F26 | Fixed. Scripted scrolling uses `auto` under `prefers-reduced-motion`. |
| Harness note (StrictMode) | Fixed. The allergy-toggle handoff is read in an effect, not in a state initialiser. |
