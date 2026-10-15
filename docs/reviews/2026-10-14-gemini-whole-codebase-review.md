# Gemini whole-codebase review — v0.7.10, 2026-10-14

Asked for: "a max codex and gemini review". The tree was clean at `7cc08d2` (tag v0.7.10), so this is
a review of the whole codebase as it stands, not a diff. **Gemini only, single engine: the Codex half
did not run** (below), so nothing here is cross-checked.

## How it was run

- **Codex: did not run.** `codex exec -m gpt-6-astra -c model_reasoning_effort="max" --sandbox
  read-only`, Codex CLI 0.160.1, one 409,524-byte packet (all 44 reviewable files with line numbers,
  `CLAUDE.md` in full, the README and the PDF text extraction). The header confirmed `sandbox:
  read-only` and `reasoning effort: max`; the request was refused at once: "You've hit your usage
  limit … try again at 8:26 PM". Not retried. The packet is kept for a re-run.
- **Gemini: ran.** `agy` 1.3.5, `gemini-3.8-flash-high` (the effort is in the slug; `high` is the top
  rung), stream-json on stdin, `--mode plan --sandbox --disable-slash-commands`, no tools: every run's
  steps were `user_input`, `agent_response`, `error_message` only. The codebase did not fit one packet
  (the verified ceiling is ~130 KB), so it went in five self-contained parts, each with the relevant
  `CLAUDE.md` sections and every file in full with line numbers:

  | Part | Scope | Packet | Files |
  |---|---|---|---|
  | 1 | `pmg.js` against the PDF text extraction (pages 1–5, 12), `pmg.test.js` | 87,127 B | 2 |
  | 2 | `verify-pmg.mjs`, `verify-controls.test.js`, `pmg.js`, `package.json` | 108,009 B | 4 |
  | 3 | `App.jsx`, `shared.jsx`, Indications, By drug, Dosing, `search.js`, `route.js`, `text.js` (+ test) | 116,099 B | 9 |
  | 4 | Open fractures, Fever workup, Source, Header, BottomNav, Footer, ThemeToggle, VerificationNotice, `shared.jsx` | 106,128 B | 9 |
  | 5 | PDF viewer, `main.jsx`, `vite.config.js`, `index.html`, `firebase.json`, CI, `.gitignore`, `index.css`, Tailwind, `theme.js`, theme/type/pdf-link tests | 118,609 B | 14 |

  Not sent to Gemini: `.claude/` dev tooling, `.firebaserc`, `.gitattributes`, `README.md`,
  `postcss.config.js`, `scripts/gen-icons.mjs`.

- **Packet and receipt checks.** Before sending, every file block's line count was checked against its
  source (0 mismatches). Each part's receipt echoed the right line count for every file.
- **Every run ended `status: ERROR`, "Your previous response was cut off because it exceeded the
  output token limit"**: ~63K thinking tokens each, the whole budget. The answers still arrived
  complete. Each one ends with its "Checked and found fine" list. Part 1's response opens with a leaked
  fragment of planning text, a draft of its finding 7; its answer proper starts at "## Receipt". Both
  are kept below as they came.

**Nothing below was dismissed or softened.** Verbatim answers first, then dispositions. Each
disposition says how it was checked: by planting the edit in a copy of the data and running the real
verifier, test logic or search (`probe.mjs`, below), or by reading the code.

---

## Part 1 — clinical data against the PDF (verbatim)

`tests/pmg.test.js` asserts nothing about it.
- Quote code:
`src/data/pmg.js:348-350`:
```js
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    regimenNote: "+/- Antifungal Coverage in high risk/immunocompromised patients",
```
and `tests/pmg.test.js:46-47`:
```js
      assert.equal(r.route, undefined, `${ind.id}: the tables print no route`);
      assert.equal(r.note, undefined, `${ind.id}: the tables print no note`);
```
- Concrete failure scenario:
`tests/pmg.test.js` strictly checks that `r.note` is undefined on regimen items, but ignores `ind.regimenNote` on indication objects. If `regimenNote` is inadvertently deleted or typoed, `tests/pmg.test.js` passes. High-risk patients with perforated peptic ulcer disease would lose the primary regimen prompt for antifungal coverage.

---

Now, let's review the required sections:
1. Start answer with the receipt table:
   Table with one row per file: path, line count stated in BEGIN header, last line exactly as given.
   Then last line of PDF text extraction.
   Note on truncation.
2. Findings: most severe first.
3. Clinical items flagged as unverifiable (by category, plus every specific item where data and source text differ).
4. Checked and found fine (one line each).

Let's check the receipt details:
- File 1: `src/data/pmg.js`
  Line count: 952
  Last line: `};`
- File 2: `tests/pmg.test.js`
  Line count: 194
  Last line: `});`
- PDF text extraction last line: `[y=29 x=301] 11`
- Truncation note: None. Both files and PDF text arrived complete with matching line counts and termination headers.

Let's check the section: "Clinical items flagged as unverifiable":
- Page 5 Flowchart ("Infectious Workup and Antimicrobial Guideline"): The entire flowchart (`feverWorkup.branches`) is embedded as an image in the source PDF. The text extraction contains only the header and reference standards. All branches, clinical criteria, diagnostic steps, thresholds, and outcomes cannot be machine-verified against extracted PDF text and rely on physician visual transcription.
- Pages 6–11 Antibiogram: Deliberately omitted / not transcribed in `pmg.js` (replaced by link to `https://muhc-antibiogram.web.app` holding 2025 data).
- Specific transcription differences / formatting variations between PDF text and `pmg.js`:
  1. Reference 10: PDF prints `pneumonia.Annals of Pharmacotherapy` (missing space after period). `pmg.js:881` transcribes with a space: `pneumonia. Annals of Pharmacotherapy`. Not listed in `transcription.corrections`.
  2. Open Fractures Type III bullet (`openFractures.antimicrobial[2]`): PDF prints double colon `Type III - Treatment for ALL Type III: : Cefepime* 2g q8 hours...`. `pmg.js:625-627` transcribes `applies` as `"Type III — treatment for ALL Type III"` with an em-dash and single label.
  3. Open Fractures Contamination bullet (`openFractures.antimicrobial[3]`): PDF prints `Soil, Fecal Contamination...` (capital F and C). `pmg.js:642` transcribes `applies` as `"Soil, fecal contamination, and standing water contamination"`.
  4. References 12 & 13: In PDF, the URLs are trailing text inline. In `pmg.js:889-897`, the URLs are separated into `url` fields, and the trailing URL text is omitted from `text`.
  5. Open Fractures Femoral Shaft heading: PDF prints trailing colon `...multiply injured patients:`. `pmg.js:670` omits the trailing colon.

Let's check the section: "Checked and found fine":
- Trauma indications (12 rows, Page 1): All drugs, doses, frequencies, durations, redose rules, and alternatives match PDF text extraction exactly.
- Emergency General Surgery indications (8 rows, Page 2): Regimens, durations, source-control stratification, and alternative options match PDF text extraction exactly.
- Elective Surgery indications (7 rows, Page 2): One-time dosing, 1-dose durations, 4-hour redosing rules, and MRSA colonization add-on alternatives match PDF text extraction exactly.
- ICU & General Floor indications (7 rows, Page 2): Vancomycin pharmacy-to-dose designations, Zosyn/Ceftriaxone/Linezolid/Bactrim regimens, and durations match PDF text extraction exactly.
- Open Fractures Classification (Gustilo-Anderson Types I, II, IIIA, IIIB, IIIC): Definitions and descriptions on Page 3 match PDF text extraction verbatim.
- Open Fractures Dosing Table (Page 4): Adult and pediatric weight cutoffs (<60 kg, ≥60 kg, <40 kg, ≥40 kg, <37.5 kg, ≥37.5 kg), doses, frequencies, and max doses match PDF text extraction exactly.
- Dosing Table Footnotes (Page 4): Renal adjustment (`*`) and pharmacy-to-dose (`**`) texts match PDF text extraction verbatim.
- Reference Standards (Page 5): NHSN HAP/VAP, CAUTI, and CLABSI CDC links match the PDF link targets.
- References (Page 12): All 13 bibliographic entries and DOIs match the PDF text extraction verbatim (preserving known printed errors like De Bus page range cutoff `1404–141` and Metlay author typo `Eaterer`).
- Drug Metadata (`drugs{}`): All 13 generic names mentioned across table regimens and alternatives resolve to entries with brand names and drug classes.
- URL and Routing Integrity: All indication IDs match `/^[a-z0-9-]+$/`, section references cross-reference valid IDs, and PDF content hash matches filename.

Everything is clear, thorough, precise, adhering strictly to every guideline and constraint.## Receipt

| Path | Stated Line Count | Last Line Exactly As Given |
|---|---|---|
| `src/data/pmg.js` | 952 | `};` |
| `tests/pmg.test.js` | 194 | `});` |

**Last line of PDF text extraction:**
`[y=29 x=301] 11`

*No truncation observed. Both files and the PDF text extraction arrived complete with all headers and ending lines intact.*

---

## Findings

### 1. Build-time guard escape: clinical antonyms in `STOP_WORDS` permit swapped or inverted indication short labels
- **Severity**: High
- **Location**: [`tests/pmg.test.js:67`](file:///tests/pmg.test.js#L67)
- **Defect**: Clinical antonyms and essential distinguishing qualifiers (`"with"`, `"without"`, and `"non"`) are defined in `STOP_WORDS`, allowing mismatched or inverted `short` display labels to pass `test("short display labels use only words from the PDF row name")` silently.
- **Failure scenario**:
  Suppose a developer copies or swaps the `short` label between paired indications:
  - Setting `cellulitis-purulent.short` to `"Cellulitis — non-purulent"`: `words(short)` yields `["cellulitis", "non", "purulent"]`. `"cellulitis"` and `"purulent"` are in `nameWords` (`"Cellulitis - Purulent (or MRSA risk factors)"`), while `"non"` is ignored as a stop word. The test passes.
  - Setting `sbo-necrosis.short` to `"SBO — without necrosis or bowel resection"`: `"without"` is ignored as a stop word, while `"sbo"`, `"necrosis"`, `"bowel"`, `"resection"` match `nameWords`. The test passes.
  - Setting `diverticulitis-no-source-control.short` to `"Diverticulitis — with source control"`: `"with"` is ignored as a stop word, so the inverted label passes.
  Because the build-time verifier explicitly does not judge `short` labels ([`src/data/pmg.js:12-13`](file:///src/data/pmg.js#L12-L13): `"does not judge the short labels"`), this test is the only guard. At bedside, a clinician treating purulent cellulitis (requiring Vancomycin) or bowel necrosis (requiring emergent laparotomy and Piperacillin-tazobactam) is presented with a card claiming the condition is non-purulent or without necrosis, directly risking wrong therapy selection.
- **Code relied on**:
  [`tests/pmg.test.js:67-79`](file:///tests/pmg.test.js#L67-L79):
  ```js
  const STOP_WORDS = new Set(["with", "or", "without", "and", "of", "the", "a", "non"]);
  const words = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9/ -]/g, " ")
      .split(/[\s/-]+/)
      .filter(Boolean);

  test("short display labels use only words from the PDF row name", () => {
    for (const ind of indications) {
      const nameWords = new Set(words(ind.name));
      for (const w of words(ind.short)) {
        if (STOP_WORDS.has(w) || nameWords.has(w)) continue;
  ```

---

### 2. Build-time guard escape: Page 5 fever workup clinical algorithm and steps have zero automated assertions
- **Severity**: High
- **Location**: [`tests/pmg.test.js:118`](file:///tests/pmg.test.js#L118)
- **Defect**: `tests/pmg.test.js` asserts zero properties of `feverWorkup.branches` (criteria, steps, outcomes, thresholds, or the nested `then` structure), leaving the machine-unverifiable Page 5 clinical pathway unguarded.
- **Failure scenario**:
  Page 5 is an image in the PDF, so `scripts/verify-pmg.mjs` cannot inspect it. Project instructions explicitly document that [`src/data/pmg.js`](file:///src/data/pmg.js) comments and [`tests/pmg.test.js`](file:///tests/pmg.test.js) are the *only* guard for Page 5. However, the test only asserts `referenceStandards` URLs and `transcribedFromImage: true`. If a developer refactoring `feverWorkup` deletes the `then` step on UTI (`"<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics"`), drops a branch, or mutates a threshold (e.g. altering pneumonia BAL from `≥ 10⁴ CFU/mL` to `≥ 10⁵ CFU/mL`, or fever trigger from `>
`38.0` to `>38.5`), both `npm run verify` and `npm test` will pass completely clean. The broken flowchart (missing antibiotic cessation criteria or misstated thresholds) will ship to production without any guard catching it.
- **Code relied on**:
  [`tests/pmg.test.js:118-128`](file:///tests/pmg.test.js#L118-L128):
  ```js
  test("fever workup links are https CDC pages and references are numbered 1..13", () => {
    for (const r of feverWorkup.referenceStandards) assert.match(r.url, /^https:\/\/www\.cdc\.gov\//);
    assert.equal(feverWorkup.transcribedFromImage, true, "page 5 is an image; the disclosure flag must stay");
    assert.deepEqual(
      references.map((r) => r.n),
      Array.from({ length: 13 }, (_, i) => i + 1)
    );
    for (const r of references) if (r.url) assert.doesNotMatch(r.url, /utm_/, "tracking parameters must be stripped");
    assert.match(source.sha256, /^[0-9a-f]{64}$/);
    assert.ok(source.file.includes(source.sha256.slice(0, 12)), "the PDF filename must carry its content hash");
  });
  ```

---

### 3. Missing uniqueness assertion on `short` display labels allows duplicate cards with conflicting regimens
- **Severity**: Medium
- **Location**: [`tests/pmg.test.js:75`](file:///tests/pmg.test.js#L75)
- **Defect**: `test("short display labels use only words from the PDF row name")` asserts word membership but does not check that `short` display labels are unique across indications.
- **Failure scenario**:
  If `short` on `sbo-necrosis` is shortened to `"SBO"`, and `sbo-no-necrosis` also has `short: "SBO"`, both pass line 75 because `"sbo"` expands via `ABBREVIATIONS` to words found in both row names. In the UI list view, prescribers see two identical cards labeled "SBO", one prescribing 24 hours of Cefazolin + Metronidazole and the other prescribing 4–8 days of Piperacillin-tazobactam, with no distinction in the header.
- **Code relied on**:
  [`tests/pmg.test.js:75-86`](file:///tests/pmg.test.js#L75-L86):
  ```js
  test("short display labels use only words from the PDF row name", () => {
    for (const ind of indications) {
      const nameWords = new Set(words(ind.name));
      for (const w of words(ind.short)) {
        if (STOP_WORDS.has(w) || nameWords.has(w)) continue;
        const expansion = ABBREVIATIONS[w];
        if (expansion && expansion.every((x) => nameWords.has(x))) continue;
        if ([...nameWords].some((n) => n.length >= 5 && (n.startsWith(w) || w.startsWith(n)))) continue;
        assert.fail(`${ind.id}: short label word "${w}" is not in the PDF name "${ind.name}"`);
      }
    }
  });
  ```

---

### 4. Search test assertion for `"zosyn"` is under-asserted (`>= 7` instead of `>= 9`), masking dropped search results
- **Severity**: Medium
- **Location**: [`tests/pmg.test.js:138`](file:///tests/pmg.test.js#L138)
- **Defect**: The test asserts `zosyn.length >= 7`, whereas the guideline contains 8 Piperacillin-tazobactam regimen rows plus 1 duration mention (9 total), contradicting the test's own comment and allowing up to two rows to disappear from search results unnoticed.
- **Failure scenario**:
  There are 8 indications with Piperacillin-tazobactam in their regimen (`diverticulitis-source-control`, `diverticulitis-no-source-control`, `cholecystitis`, `sbo-necrosis`, `nsti`, `perforated-pud`, `hap-vap`, `bacteremia`) and 1 with Zosyn in duration (`abdominal-trauma`), totaling 9 matches. If two indications (e.g. `cholecystitis` and `perforated-pud`) are accidentally omitted from search indexing or lose their drug alias mapping, `zosyn.length` drops from 9 to 7, yet `assert.ok(zosyn.length >= 7)` still passes.
- **Code relied on**:
  [`tests/pmg.test.js:137-139`](file:///tests/pmg.test.js#L137-L139):
  ```js
    const zosyn = ids("zosyn");
    assert.ok(zosyn.length >= 7, "Zosyn should hit every piperacillin-tazobactam row and the Zosyn note in abdominal trauma");
    assert.ok(zosyn.includes("abdominal-trauma"), "duration text is searched");
  ```

---

### 5. One-way verification of `transcription.corrections` against `TYPO_MAP` fails to enforce the bidirectional project rule
- **Severity**: Medium
- **Location**: [`tests/pmg.test.js:189`](file:///tests/pmg.test.js#L189)
- **Defect**: `test("each listed correction is applied by the verifier")` iterates over `transcription.corrections` to verify inclusion in `norm()`, but never checks that all entries in `TYPO_MAP` are recorded in `transcription.corrections`.
- **Failure scenario**:
  A developer adds a rewrite rule to `TYPO_MAP` in `scripts/verify-pmg.mjs` to force a mismatched dose, drug name, or frequency between the PDF and `pmg.js` to pass verification, but omits it from `transcription.corrections`. The test passes. The undocumented alteration is concealed from the Source page (`transcription.corrections` renders on the "Corrected from the PDF" card), defeating the audit trail for human physician reviewers and violating the project rule ("Add to both or to neither").
- **Code relied on**:
  [`tests/pmg.test.js:189-194`](file:///tests/pmg.test.js#L189-L194):
  ```js
  test("each listed correction is applied by the verifier", () => {
    for (const c of pmg.transcription.corrections) {
      if (c.here.startsWith("…")) continue;
      assert.equal(norm(c.pdf), norm(c.here), `correction "${c.pdf}" is not in TYPO_MAP`);
    }
  });
  ```

---

### 6. Zero automated assertions guard `openFractures` clinical components (`classification`, `timing`, `debridement`, `femoralShaft`)
- **Severity**: Low
- **Location**: [`tests/pmg.test.js:88`](file:///tests/pmg.test.js#L88)
- **Defect**: `tests/pmg.test.js` only asserts `openFractures.antimicrobial` and `openFractures.duration`, leaving the Gustilo-Anderson classification, ED timing window, operative debridement timeline, and femoral shaft sequences completely untested.
- **Failure scenario**:
  If `openFractures.debridement.items[0]` (the mandatory 2-hour OR staging window for Gustilo IIIC injuries) or `openFractures.timing` (administer within 30 min of ED arrival) is corrupted or deleted from [`src/data/pmg.js`](file:///src/data/pmg.js), `npm test` passes without error.
- **Code relied on**:
  [`tests/pmg.test.js:88-99`](file:///tests/pmg.test.js#L88-L99):
  ```js
  test("open-fracture display regimens re-state the verified PDF wording exactly", () => {
    for (const a of openFractures.antimicrobial) {
      assert.equal(loose(regimenAsProse(a.regimen, dosingTable.footnotes)), loose(a.text), `${a.id}: regimen ≠ text`);
      for (const r of a.regimen) {
        assert.ok(drugs[r.drug], `${a.id}: drug "${r.drug}" has no entry in drugs{}`);
        if (r.footnote) assert.ok(dosingTable.footnotes[r.footnote], `${a.id}: unknown footnote ${r.footnote}`);
      }
      assert.ok([3, 4].includes(a.page), `${a.id}: page`);
    }
    assert.equal(openFractures.antimicrobial.length, 4);
    assert.equal(openFractures.duration.length, 2);
  });
  ```

---

### 7. Ad-hoc `regimenNote` on `perforated-pud` lacks schema validation in `tests/pmg.test.js`
- **Severity**: Low
- **Location**: [`src/data/pmg.js:350`](file:///src/data/pmg.js#L350) / [`tests/pmg.test.js:47`](file:///tests/pmg.test.js#L47)
- **Defect**: `pmg.js` introduces an ad-hoc `regimenNote` property on `perforated-pud` to capture "+/- Antifungal Coverage in high risk/immunocompromised patients", but [`tests/pmg.test.js`](file:///tests/pmg.test.js) asserts nothing about it.
- **Failure scenario**:
  [`tests/pmg.test.js:47`](file:///tests/pmg.test.js#L47) strictly checks that `r.note === undefined` on each regimen element `r`, but does not inspect `ind.regimenNote`. If `regimenNote` is inadvertently deleted or renamed, `tests/pmg.test.js` passes. High-risk patients with perforated peptic ulcer disease would lose the primary regimen prompt for antifungal coverage without a test failure.
- **Code relied on**:
  [`src/data/pmg.js:348-350`](file:///src/data/pmg.js#L348-L350):
  ```js
      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
      regimenNote: "+/- Antifungal Coverage in high risk/immunocompromised patients",
  ```
  and [`tests/pmg.test.js:46-47`](file:///tests/pmg.test.js#L46-L47):
  ```js
        assert.equal(r.route, undefined, `${ind.id}: the tables print no route`);
        assert.equal(r.note, undefined, `${ind.id}: the tables print no note`);
  ```

---

## Clinical items flagged as unverifiable

- **Page 5 Flowchart ("Infectious Workup and Antimicrobial Guideline")**: Embedded as an image in the source PDF. The text extraction contains only headers and reference standard names; all diagnostic branches, fever trigger (`>38.0 °C / 100.4 °F`), WBC and CFU thresholds, and outcome pathways cannot be verified by machine extraction.
- **Pages 6–11 Antibiogram**: Deliberately omitted / not transcribed in [`src/data/pmg.js`](file:///src/data/pmg.js) (delegated to `https://muhc-antibiogram.web.app` containing 2025 isolates).
- **Specific transcription differences between PDF text extraction and `pmg.js`**:
  1. *Reference 10*: PDF text reads `pneumonia.Annals of Pharmacotherapy` (missing space after period). [`src/data/pmg.js:881`](file:///src/data/pmg.js#L881) adds a space: `pneumonia. Annals of Pharmacotherapy`. This is not enumerated in `transcription.corrections`.
  2. *Open Fractures Type III bullet*: PDF text reads `Type III - Treatment for ALL Type III: : Cefepime* 2g q8 hours...` (with double colon). [`src/data/pmg.js:625-627`](file:///src/data/pmg.js#L625-L627) uses `applies: "Type III — treatment for ALL Type III"`.
  3. *Open Fractures Contamination bullet*: PDF text reads `Soil, Fecal Contamination, and standing water contamination`. [`src/data/pmg.js:642`](file:///src/data/pmg.js#L642) uses lowercase `fecal contamination`.
  4. *References 12 & 13*: PDF prints the target URLs directly in the reference text body. [`src/data/pmg.js:889-897`](file:///src/data/pmg.js#L889-L897) parses the URLs into a dedicated `url` property and trims them from `text`.
  5. *Femoral Shaft Heading*: PDF prints a trailing colon (`...multiply injured patients:`). [`src/data/pmg.js:670`](file:///src/data/pmg.js#L670) omits the trailing colon.

---

## Checked and found fine

- **Trauma table (12 indications, Page 1)**: All drugs, doses, frequencies, durations, shared trauma redose string triggers, and alternative/contamination regimens match PDF text extraction exactly.
- **Emergency General Surgery table (8 indications, Page 2)**: Regimens, source-control duration tiers (24h / 4d / 8d), and alternatives match PDF text extraction exactly.
- **Elective Surgery table (7 indications, Page 2)**: One-time dosing, 1-dose durations, 4-hour intra-operative redosing rules, and MRSA colonization add-on alternatives match PDF text extraction exactly.
- **ICU & General Floor table (7 indications, Page 2)**: Regimens (including "Pharmacy to dose" Vancomycin entries), durations, and alternatives match PDF text extraction exactly.
- **Open Fractures Classification (Page 3)**: Gustilo-Anderson classification definitions across Types I, II, IIIA, IIIB, and IIIC match PDF text extraction verbatim.
- **Open Fractures Dosing Table (Page 4)**: Adult and pediatric weight cutoffs (<60 kg, ≥60 kg, <40 kg, ≥40 kg, <37.5 kg, ≥37.5 kg), weight-based mg/kg doses, frequencies, and maximum dose ceilings match PDF text extraction exactly.
- **Dosing Table Footnotes (Page 4)**: Renal adjustment (`*`) and pharmacy-to-dose (`**`) texts match PDF text extraction verbatim.
- **Reference Standards (Page 5)**: NHSN HAP/VAP, CAUTI, and CLABSI link targets point to valid CDC URLs matching the PDF link annotations.
- **References (Page 12)**: All 13 bibliographic entries and DOIs match PDF text extraction verbatim (faithfully preserving known source errors like Metlay "Eaterer" typo and De Bus page range cutoff `1404–141`).
- **Drug Metadata (`drugs{}`)**: All 13 generic antimicrobial agents mentioned across primary regimens and alternatives map to valid brand and pharmacologic class descriptors.
- **Identifier & File Integrity**: All 34 indication IDs are URL-safe, section IDs cross-reference cleanly, and the content hash in `source.file` matches `source.sha256`.

---

## Part 2 — the build-time verifier (verbatim)

# Whole-codebase peer review — ACS Antibiotic Guide v0.7.10 — part 2 of 5: the build-time verifier

## File receipt

| Path | Stated line count | Last line |
|---|---|---|
| `scripts/verify-pmg.mjs` | 642 | `}` |
| `tests/verify-controls.test.js` | 221 | `  expectFail("filename", (d) => (d.source.file = "MU-ACS-Antibiotic-PMG-2025-12.pdf"), "content hash"));` |
| `src/data/pmg.js` | 952 | `};` |
| `package.json` | 36 | `}` |

All 4 files reached me in full with no truncation.

---

## Findings

### Critical

#### 1. Verifier escape: `hasPhrase` allows silent truncation of critical timing directives and renal dosing footnotes
- **File & line:** [scripts/verify-pmg.mjs:143-154](file:///scripts/verify-pmg.mjs#L143-L154), [scripts/verify-pmg.mjs:465](file:///scripts/verify-pmg.mjs#L465), [scripts/verify-pmg.mjs:583-585](file:///scripts/verify-pmg.mjs#L583-L585)
- **Defect:** `hasPhrase` verifies text using substring containment (`hay.indexOf(phrase)`) guarded only by word boundaries, which allows trailing clinical clauses to be deleted from `timing` or `footnotes` without triggering a failure.
- **Scenario:** In [`pmg.js`](file:///src/data/pmg.js#L553), mutate `openFractures.timing` to `"Administer within 30 min of arrival to the ED"` (dropping `" & all patients to have MRSA nasal screen"`), or mutate `dosingTable.footnotes.pharmacy.text` to `"Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients."` (dropping the renal adjustment and suggested dosing directive). Because the truncated string is ≥12 characters and sits on whitespace word boundaries inside the full text, `hasPhrase` returns `true`. The verifier outputs `PASS`, and prescribers are deprived of the mandatory MRSA screen and renal adjustment instructions at the bedside.
- **Code:**
```javascript
147|     const i = hay.indexOf(phrase, from);
148|     if (i < 0) return false;
149|     const before = i === 0 ? " " : hay[i - 1];
150|     const after = i + phrase.length >= hay.length ? " " : hay[i + phrase.length];
151|     if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
...
465|   must("the timing rule under its label", `Timing: ${of.timing}`);
...
584|     if (!hasPhrase(text34, loose(`${f.mark}${f.text}`))) fail(`page 4 footnote not printed with its mark: "${f.mark}${f.text}"`);
```

---

### High

#### 2. Verifier escape: open-fracture display regimens lack field-level schema assertions, permitting route and frequency collapse
- **File & line:** [scripts/verify-pmg.mjs:333-337](file:///scripts/verify-pmg.mjs#L333-L337), [scripts/verify-pmg.mjs:473-484](file:///scripts/verify-pmg.mjs#L473-L484)
- **Defect:** Section B checks display regimens solely by joining the tuple elements with `filter(Boolean)` against prose, without asserting that constituent fields (`drug`, `dose`, `route`, `frequency`) are present, non-empty, or distinct.
- **Scenario:** In [`pmg.js`](file:///src/data/pmg.js#L604) for `openFractures.antimicrobial[0]` (Type I & II), mutate `regimen[0]` to `{ drug: "Cefazolin", dose: "2 g IV q8 hours" }` and delete `route` and `frequency`. `regimenAsProse` joins `[r.drug, r.dose]` into `"Cefazolin 2 g IV q8 hours"`, which matches `a.text` exactly under `loose()`. The verifier prints `PASS`, while the bedside UI renders no route badge, no frequency badge, and misattributes the combined string to the dose slot.
- **Code:**
```javascript
335|   return regimen
336|     .map((r) => [r.drug + markOf(r, footnotes), r.dose, r.route, r.frequency, r.note].filter(Boolean).join(" "))
337|     .join(" ");
...
479|     const prose = loose(regimenAsProse(a.regimen, fn));
480|     if (prose !== loose(a.text)) {
```

#### 3. Verifier escape: unanchored substring matching on references permits silent truncation of citations
- **File & line:** [scripts/verify-pmg.mjs:608-612](file:///scripts/verify-pmg.mjs#L608-L612)
- **Defect:** References on page 12 are verified with unanchored substring inclusion (`flat12.includes(whole)`), allowing any citation without a URL (references 2–6, 8–10) to pass even if journal, volume, or page ranges are deleted.
- **Scenario:** In [`pmg.js`](file:///src/data/pmg.js#L846) mutate reference 2 to `"Metlay, J. P., Eaterer, G. W., Long, A. C., et al. (2019). Diagnosis and treatment of adults with community-acquired pneumonia."`, deleting the journal name, volume, and page range. Because `flat12` begins with `2.metlay...`, `flat12.includes(whole)` evaluates to `true`. The verifier exits 0 despite truncated reference metadata.
- **Code:**
```javascript
608|     const printedUrl = ref.url ?? "";
609|     const whole = despace(`${ref.n}. ${ref.text} ${printedUrl}`);
610|     if (!flat12.includes(whole)) {
611|       fail(`reference ${ref.n} is not printed as one contiguous entry (number, text and URL/DOI):\n      ${ref.text}${printedUrl ? " " + printedUrl : ""}`);
612|     }
```

---

### Medium

#### 4. Verifier escape: `regimenNote` is completely ignored on N/A indication rows
- **File & line:** [scripts/verify-pmg.mjs:314-316](file:///scripts/verify-pmg.mjs#L314-L316), [scripts/verify-pmg.mjs:369-373](file:///scripts/verify-pmg.mjs#L369-L373)
- **Defect:** The N/A consistency check on lines 370–372 validates that `duration`, `redose`, and `alternative` are null, but omits `regimenNote`, while `expectedCells` hardcodes `drug: "N/A"` whenever `!ind.regimen`.
- **Scenario:** In [`pmg.js`](file:///src/data/pmg.js#L104-L113) for `chest-tubes`, add `regimenNote: "Administer prophylactic cefazolin"`. Lines 370–372 do not fail because `duration`, `redose`, and `alternative` are null. In `expectedCells`, `!ind.regimen` evaluates to `true`, returning `drug: "N/A"`, which matches the PDF cell. The verifier passes, allowing an unverified clinical note on a non-antibiotic indication.
- **Code:**
```javascript
314|   if (!ind.regimen) {
315|     return { drug: "N/A", dose: "N/A", frequency: "N/A", duration: "N/A", redose: "N/A", alternative: "N/A" };
316|   }
...
369|     if (!ind.regimen) {
370|       if (ind.duration != null || ind.redose != null || ind.alternative != null) {
371|         fail(`${ind.id}: an N/A row must be N/A in every column (duration/redose/alternative must be null)`);
372|       }
```

#### 5. Open-fracture antimicrobial page attribution is unenforced
- **File & line:** [scripts/verify-pmg.mjs:469-472](file:///scripts/verify-pmg.mjs#L469-L472), [scripts/verify-pmg.mjs:483](file:///scripts/verify-pmg.mjs#L483), [scripts/verify-pmg.mjs:485-489](file:///scripts/verify-pmg.mjs#L485-L489)
- **Defect:** Section B pools page 3 and page 4 bullets into a single array and validates against `[3, 4].includes(a.page)`, allowing items to swap pages undetected.
- **Scenario:** In [`pmg.js`](file:///src/data/pmg.js#L641), change `openFractures.antimicrobial[3]` (contamination) to `page: 3`, or change `type-3` to `page: 4`. Line 483 passes because both 3 and 4 belong to `[3, 4]`. `mustMatchList` passes because bullets are pooled into `printedAbx` and compared with `sameSet`. The verifier prints `PASS`, but deep links or page references in the UI point prescribers to the wrong PDF page.
- **Code:**
```javascript
469|   const printedAbx = [
470|     ...(bulletsBetween(p3, "Antimicrobial:", null) ?? []),
471|     ...(bulletsBetween(p4, "Antimicrobial Cont.", "Antimicrobial Adult Dosing") ?? []),
472|   ];
...
483|     if (![3, 4].includes(a.page)) fail(`antimicrobial "${a.id}": page must be 3 or 4`);
```

---

### Low

#### 6. Fragile normalization ordering: `TYPO_MAP` executes before digit-unit spacing normalization
- **File & line:** [scripts/verify-pmg.mjs:90-95](file:///scripts/verify-pmg.mjs#L90-L95)
- **Defect:** Unit spacing normalization (`2 g` → `2g`) occurs on line
94, after `TYPO_MAP` replacements have already run on line 91, making typo replacement sensitive to pre-existing whitespace in the source PDF.
- **Scenario:** If a future revision of the PDF standardizes the Type III bullet text with standard unit spacing (`"Cefepime* 2 g q8 hours"` instead of `"2g"`), `norm()` will fail to match `TYPO_MAP`'s key `"cefepime* 2g q8 hours"` on line 91. Line 94 will then compress `"2 g"` to `"2g"`, but by then the route substitution to `"cefepime* 2g iv q8 hours"` has already been missed, causing build failure despite identical clinical intent.
- **Code:**
```javascript
91|   for (const [from, to] of TYPO_MAP) t = t.split(from).join(to);
92|   t = t
93|     .replace(/\s*\/\s*/g, "/") // "Infection / CAUTI" == "Infection/CAUTI"
94|     .replace(/(\d)\s+(g|mg|ml|kg|h|hrs)\b/g, "$1$2") // "2 g" == "2g"
```

---

## Clinical items flagged as unverifiable

- **Page 5 flowchart text (`feverWorkup`):** The entire flowchart (pneumonia, central line, and UTI branches) is embedded in the PDF as an image without a text layer (`transcribedFromImage: true`). None of its triggers, criteria, arrows, thresholds, or outcomes are verified at build time; only the 3 CDC reference links at the bottom are machine-checked.
- **Brand names & drug classes (`drugs`):** App-authored metadata in [`pmg.js:903-917`](file:///src/data/pmg.js#L903-L917) used for searching and filtering; these do not appear in the source PMG and cannot be checked against the PDF.
- **Specific discrepancies between transcribed data and source text:**
  - `complicated-uti` name: PDF prints `"Complicated Urinary Tract Infection/CAUTI/Urologic Instr"` (truncated mid-word); data expands it to `…/Urologic Instrumentation`.
  - Open fracture Cefepime route: PDF prints `"Cefepime* 2g q8 hours"` with no route; data supplies `"IV"`.
  - Typo corrections in data: `transfustion` → `transfusion`, `nectrotizing` → `necrotizing`, `ertapenum` → `ertapenem`, `7days` → `7 days`, `every 4 hour ` → `every 4 hours `, `pharmacy to dos ` → `pharmacy to dose `.

---

## Checked and found fine

- **Source binding (Section 0):** SHA-256 hash match, 12-page count, and filename content-hash embedding verified strictly against the public PDF.
- **Indication tables row bijection (Section A):** Exactly 34 indication rows verified 1-to-1 against PDF cell borders, ensuring no dropped or transposed diagnoses across pages 1 and 2.
- **Multi-drug combination order & cell mapping:** Doses, frequencies, durations, intraoperative redosing, and alternatives are strictly compared per cell against table bounding boxes.
- **Open-fracture classification table (Section B):** Gustilo-Anderson types and subtypes IIIA–IIIC verified against reconstructed page-3 table cell geometry.
- **Femoral shaft & debridement rules (Section B):** Stable/unstable timing and operative debridement bullet lists verified against page 3 and 4 text lists.
- **Open-fracture dosing table (Section C):** 4 drug rows, adult and pediatric weight-band thresholds, comparison operators (`<`, `≥`), and max dose qualifiers verified exactly against cell bands.
- **Footnote symbol bindings (Section C):** Renal (`*`) and pharmacy-to-dose (`**`) marks verified on both drug names and footnote definitions.
- **Page 5 reference links (Section D):** Decodes Bing redirect targets and matches CDC manual URLs for HAP/VAP, CAUTI, and CLABSI.
- **Planted-error control suite:** All 56 mutations in [`tests/verify-controls.test.js`](file:///tests/verify-controls.test.js) assert active data modification (`assert.notEqual`) and catch the intended failure conditions.

---

## Part 3 — app shell, Indications, By drug, Dosing, search (verbatim)

Here is the comprehensive peer review of the ACS Antibiotic Guide v0.7.10 (Part 3 of 5).

---

### Receipt Table

| Path | Line Count | Last Line |
| :--- | :--- | :--- |
| `src/App.jsx` | 144 | `}` |
| `src/components/shared.jsx` | 453 | `}` |
| `src/components/IndicationsView.jsx` | 472 | `}` |
| `src/components/DrugsView.jsx` | 185 | `}` |
| `src/components/DosingView.jsx` | 91 | `}` |
| `src/lib/search.js` | 95 | `}` |
| `src/lib/route.js` | 62 | `}` |
| `src/lib/text.js` | 24 | `  typeof text === "string" ? text.replace(NUMBER_UNIT, "$1\u00A0").replace(SIGN_NUMBER, "$1\u00A0") : text;` |
| `tests/text.test.js` | 69 | `});` |

*No files were truncated; all 9 files reached the review completely.*

---

### Findings (Most Severe First)

#### 1. High: Search for spaced negated terms (e.g. `"non purulent"`) returns 0 matches due to negation-prefix collision in `matches()`
- **Severity**: High
- **Location**: `src/lib/search.js:19-20`, `src/lib/search.js:34-48`, `src/lib/search.js:80-84`
- **Defect**: The search specification explicitly documents that `"nonpurulent", "non-purulent" and "non purulent" all reach "Non-Purulent"`, but `norm()` only strips hyphens between letters (`replace(/(?<=[a-z])-(?=[a-z])/g, "")`) and leaves spaces intact, causing `"non purulent"` to split into tokens `["non", "purulent"]`; subsequently, `matches()` rejects the `"purulent"` token inside normalized `"nonpurulent"` because its prefix is `"non"` (a member of `NEGATION_PREFIXES`), resulting in a score of 0 and completely hiding the indication from the prescriber.
- **Failure Scenario**: A physician at the bedside types `"non purulent"` into the search bar looking for "Non-Purulent Skin and Soft Tissue Infection". `norm("non purulent")` yields `"non purulent"`, producing tokens `["non", "purulent"]`. The row name normalizes to `"nonpurulent skin and soft tissue infection"`. Token 1 (`"non"`) matches at index 0. Token 2 (`"purulent"`) is found at index 3 with preceding letters `w=0..3` equal to `"non"`. Because `"non"` is in `NEGATION_PREFIXES`, `matches()` returns `false`. `score()` executes `else return 0`, and the view displays "No indications match · 'non purulent'".
- **Code**:
  ```js
  // src/lib/search.js:19
  .replace(/(?<=[a-z])-(?=[a-z])/g, "") // non-purulent → nonpurulent, pip-tazo → piptazo
  ...
  // src/lib/search.js:45-46
  const prefix = hay.slice(w, i);
  if (!NEGATION_PREFIXES.includes(prefix)) return true;
  ...
  // src/lib/search.js:81-83
  if (matches(name, t)) total += name.startsWith(t) ? 3 : 2;
  else if (matches(hay, t)) total += 1;
  else return 0;
  ```

---

#### 2. High: `ind.redose` is completely omitted from the search index (`haystack()`)
- **Severity**: High
- **Location**: `src/lib/search.js:54-71`
- **Defect**: The `haystack()` search index indexes names, aliases, regimens, doses, frequencies, notes, durations, and alternative text, but omits `ind.redose` entirely, meaning queries for surgical redosing intervals or conditions (e.g., "redose", "blood loss", or specific hourly intraoperative redosing instructions displayed in `IndicationRow`) return 0 results.
- **Failure Scenario**: An OR circulating nurse or surgical resident searches for indications redosed at 4 hours or redosed on massive blood loss (typing e.g. `"blood loss"` or `"redose"`). Although `redose` is a primary clinical column rendered on every expanded `IndicationRow` (`<Field label="Redose"><Lines value={ind.redose} /></Field>`), `haystack` does not push `ind.redose`. The search returns no matches unless those words happen to appear in the duration or regimen note.
- **Code**:
  ```js
  // src/lib/search.js:61-64
  if (ind.regimenNote) parts.push(ind.regimenNote);
  if (ind.duration) parts.push(...ind.duration);
  const alt = altText(ind);
  if (alt) parts.push(alt);
  // ind.redose is never added to parts or free
  ```

---

#### 3. Medium: `haystack()` spreads `ind.duration` without checking `Array.isArray()`, breaking character-by-character if duration is a string
- **Severity**: Medium
- **Location**: `src/lib/search.js:62`, `src/lib/search.js:66`
- **Defect**: While `Lines` (`shared.jsx:442`) and `altText` (`search.js:31`) explicitly guard against single-line strings versus multi-line arrays (`Array.isArray(value) ? value : [value]`), `haystack()` uses raw array spreads `...ind.duration` and `...(ind.duration || [])`; if any `duration` value in `pmg.js` is transcribed as a single string (e.g. `"24 hours"` or `"5 days"`) rather than a single-element array `["24 hours"]`, spreading it decomposes the string into individual single-character elements (`['2', '4', ' ', 'h', 'o', 'u', 'r', 's']`), destroying duration token matching.
- **Failure Scenario**: If an indication record has `duration: "24 hours"`, line 62 pushes `'2', '4', ' ', 'h', 'o', 'u', 'r', 's'` into `parts`. Joined with `" | "`, the normalized haystack contains `"2 4 h o u r s"`. A search for `"24 hours"` or `"hours"` fails to match the indication's duration.
- **Code**:
  ```js
  // src/lib/search.js:62
  if (ind.duration) parts.push(...ind.duration);
  ...
  // src/lib/search.js:66
  const free = norm([ind.regimenNote, ...(ind.duration || []), alt].filter(Boolean).join(" "));
  ```

---

#### 4. Medium: Toggling off an open drug in `DrugsView` resets scroll to the very top of the window
- **Severity**: Medium
- **Location**: `src/App.jsx:83-86`
- **Defect**: `App.jsx` watches `[route.view, route.drug, route.section, route.focus]` to scroll to the top of the window when navigating views, but including `route.drug` in the dependency array causes `window.scrollTo({ top: 0 })` to execute whenever an expanded drug accordion in `DrugsView` is collapsed (which navigates to `#/drugs` via `replaceState`, setting `route.drug` to `null`).
- **Failure Scenario**: A clinician scrolls down the By Drug list to "Vancomycin", reads its indications, and taps "Vancomycin" again to collapse it. `navigate("/drugs", { replace: true })` runs, updating `route.drug` from `"Vancomycin"` to `null`. Because `route.focus` is null, line 86 fires `window.scrollTo({ top: 0 })`, jarringly jumping the user to the very top of the page away from where they were reading.
- **Code**:
  ```js
  // src/App.jsx:83-86
  // Changing view scrolls to the top; opening a specific indication does not,
  // because IndicationsView scrolls to the card itself.
  useEffect(() => {
    if (!route.focus) window.scrollTo({ top: 0 });
  }, [route.view, route.drug, route.section, route.focus]);
  ```

---

#### 5. Medium: Unhandled `undefined` access on `bySection[ind.section]` in `DrugsView`
- **Severity**: Medium
- **Location**: `src/components/DrugsView.jsx:171`, `src/components/DrugsView.jsx:176`
- **Defect**: While `IndicationsView` safely uses optional chaining when grouping by section (`bySection.get(ind.section)?.push(ind)`), `DrugsView` directly accesses properties on `bySection[ind.section]` without optional chaining (`bySection[ind.section].hue` and `bySection[ind.section].title`), causing an unhandled runtime `TypeError` that crashes the entire By Drug view if an indication has an unrecognized or mismatched section ID.
- **Failure Scenario**: If an indication in `pmg.js` has a section key not present in `sections` (or an indication is moved to a new section not yet in `sections`), opening any drug associated with that indication triggers `TypeError: Cannot read properties of undefined (reading 'hue')`, crashing the React component tree.
- **Code**:
  ```js
  // src/components/DrugsView.jsx:171-176
  <li key={ind.id} className="py-2.5" style={{ "--hue": `var(--hue-${bySection[ind.section].hue})` }}>
    <a href={`#/i/${ind.id}`} ...>
      ...
      <span className="sr-only">{bySection[ind.section].title}: </span>
  ```

---

#### 6. Low: Footnotes card in `DosingView` is hardcoded to `[dt.footnotes.renal, dt.footnotes.pharmacy]`
- **Severity**: Low
- **Location**: `src/components/DosingView.jsx:29`
- **Defect**: `DosingView` manually enumerates `[dt.footnotes.renal, dt.footnotes.pharmacy]` rather than mapping dynamically over `Object.values(dt.footnotes)` (as done in `DrugsView:29-30` or `tests/text.test.js`). If a footnote key in `pmg.js` is renamed or a third footnote is added to the dosing table, `DosingView` either crashes with `Cannot read properties of undefined (reading 'mark')` or silently drops the footnote from the rendered card.
- **Failure Scenario**: If `pmg.js` introduces an additional footnote in `dosingTable.footnotes` (e.g. `pediatric` or `dialysis`), `DosingView` will never render it, hiding explanatory clinical context from prescribers while drug names display the
mark without a corresponding definition.
- **Code**:
  ```js
  // src/components/DosingView.jsx:29
  {[dt.footnotes.renal, dt.footnotes.pharmacy].map((f) => (
  ```

---

#### 7. Low: `DrugsView` sort comparator omits `fracture.length`, contradicting displayed use count
- **Severity**: Low
- **Location**: `src/components/DrugsView.jsx:21-24`, `src/components/DrugsView.jsx:52`
- **Defect**: The drug list display computes total uses as `d.primary.length + d.alternative.length + d.fracture.length`, but the sort comparator sorts only on `b.primary.length + b.alternative.length - (a.primary.length + a.alternative.length)`.
- **Failure Scenario**: An antimicrobial agent used frequently in open fractures (e.g. Tobramycin or Gentamicin) displays a higher total use count (e.g. "5 uses") but ranks below an agent with fewer total uses (e.g. "4 uses"), appearing out of order in the By Drug index.
- **Code**:
  ```js
  // src/components/DrugsView.jsx:21-24
  .sort(
    (a, b) =>
      b.primary.length + b.alternative.length - (a.primary.length + a.alternative.length) || a.name.localeCompare(b.name)
  );
  ```

---

#### 8. Low: `search.js` un-guarded `free.includes(norm(meta.brand))` matches every row if a brand is missing or empty
- **Severity**: Low
- **Location**: `src/lib/search.js:68`
- **Defect**: Line 68 checks `free.includes(norm(meta.brand))` without ensuring `norm(meta.brand)` is non-empty; in JavaScript `"anything".includes("")` is always `true`.
- **Failure Scenario**: If an entry in `drugs{}` has `brand: ""` or `brand: null`, `norm(meta.brand)` resolves to `""`. Because `free.includes("")` is `true` for every indication, that drug’s generic and brand names are injected into the search haystack of all indications, generating false-positive search hits across the entire app.
- **Code**:
  ```js
  // src/lib/search.js:68
  if (free.includes(norm(name)) || free.includes(norm(meta.brand))) parts.push(meta.brand, name);
  ```

---

### Clinical items flagged as unverifiable

- **`pmg.js` data file contents**: `src/data/pmg.js` was not included in this packet (per part 3 scope); internal schema shapes (such as whether `duration` is universally an array or sometimes a raw string) and individual clinical values were inferred from component usage.
- **Sub-indication footnote references**: Whether any indications outside open fractures have footnotes could not be verified directly from `pmg.js`, though `IndicationsView` passes no footnote dictionary to `Regimen` or `RegimenInline`.
- **Completeness of brand mappings**: Whether all keys in `drugs{}` possess non-empty `brand` strings to avoid the `free.includes("")` pitfall could not be verified without `pmg.js`.

---

### Checked and found fine

- **Section head height measurement and deep link scrolling**: `publishHeadHeight` and `ResizeObserver` on [SectionHead](file:///src/components/shared.jsx#L161-L195) correctly compute `--section-head-h` on the `<section>`, and [IndicationRow](file:///src/components/IndicationsView.jsx#L400-L406) offsets clear both the stuck header and sticky section heads at arbitrary zoom/text sizes.
- **Search and filter state isolation**: Collapse state during searches ([searchCollapsed](file:///src/components/IndicationsView.jsx#L78)) is kept separate from baseline collapse state ([collapsed](file:///src/components/IndicationsView.jsx#L71)), reliably restoring user section preferences when queries clear.
- **Inert panel accessibility**: Collapsed panels across [CollapsibleCard](file:///src/components/shared.jsx#L151), [IndicationRow](file:///src/components/IndicationsView.jsx#L437), [DosingRow](file:///src/components/DosingView.jsx#L82), and [DrugsView](file:///src/components/DrugsView.jsx#L87) consistently set `inert` and `aria-hidden`, keeping hidden text out of the a11y tree and tab order.
- **Narrow search auto-expansion override**: [ExpandAllButton](file:///src/components/IndicationsView.jsx#L174-L207) correctly updates both `open` and `closed` sets to ensure Collapse All overrides auto-opened narrow search results without leaking to other sections.
- **Pill wrapping and clipboard separation**: [RegimenInline](file:///src/components/shared.jsx#L371-L417) separates drug name and dose with an explicit whitespace token `{" "}`, preventing concatenation during clipboard copy or screen reader output while wrapping pills cleanly.
- **Number and unit binding**: [fmtDose](file:///src/lib/text.js#L9) and [keepUnits](file:///src/lib/text.js#L23) consistently bind clinical numbers, signs, and units with NNBSP and NBSP without mutating non-space text, verified against [tests/text.test.js](file:///tests/text.test.js#L1-L69).
- **Service worker update handoff**: [VIEW_HANDOFF](file:///src/App.jsx#L18) correctly restores the `pcn` toggle after an update reload inside a `useEffect` without double-execution hazards in React StrictMode.
- **Route decoding and hash synchronization**: [matchRoute](file:///src/lib/route.js#L11-L32) and [useHashRoute](file:///src/lib/route.js#L42-L61) reliably track view changes, handle URL percent-encoding safely via `safeDecode`, and synchronize with browser `hashchange` events.
- **PCN Allergy pill highlighting**: Highlighting is applied strictly as an editorial wash and border ([highlight](file:///src/components/IndicationsView.jsx#L377-L389)) without grading or altering clinical values.

---

## Part 4 — Open fractures, Fever workup, Source, header, navigation (verbatim)

### Receipt

| File | Line count | Last line |
| --- | --- | --- |
| `src/components/OpenFracturesView.jsx` | 200 | `}` |
| `src/components/FeverWorkupView.jsx` | 136 | `}` |
| `src/components/SourceView.jsx` | 165 | `}` |
| `src/components/Header.jsx` | 169 | `}` |
| `src/components/BottomNav.jsx` | 48 | `}` |
| `src/components/Footer.jsx` | 26 | `}` |
| `src/components/ThemeToggle.jsx` | 21 | `}` |
| `src/components/VerificationNotice.jsx` | 24 | `}` |
| `src/components/shared.jsx` | 453 | `}` |

No truncation observed. All 9 files arrived complete.

---

### Findings

#### 1. Dead export and PDF viewer bypass escape hatch directly contradicting project invariants
- **Severity**: High
- **Location**: `src/components/shared.jsx:9`
- **Statement**: `shared.jsx` exports `pdfHref` constructed directly from `source.file`, creating an unchecked bypass around the in-app PDF viewer and violating the stated test invariant that no file outside the viewer names `pdfHref` or `source.file`.
- **Failure Scenario**: In an installed PWA (standalone WebClip on iOS or standalone PWA on Android/desktop), opening the source PDF directly via `<a href>` traps the clinician because there is no navigation chrome or back button, forcing them to force-quit the application. `CLAUDE.md` explicitly documents this trap and states:
  > `tests/pdf-link.test.js` fails the build if any file in `src/` outside the viewer names `pdfHref` or `source.file` or holds a same-origin `.pdf` path
  
  Yet `shared.jsx` contains:
  ```javascript
  // The PDF's filename carries its content hash (see source.file), so a new
  // edition is a new URL and no cache — HTTP or service worker — can hand back an
  // old copy under it.
  export const pdfHref = `/${source.file}`;
  ```
  Neither `pdfHref` nor `source.file` is needed in `shared.jsx` (`PdfButton` and the viewer handle PDF display). Because `shared.jsx` exports `pdfHref`, any component across the codebase can import `pdfHref` without referencing `source.file` or a `.pdf` literal, completely escaping the build-time test guard and re-introducing the fatal trapping bug.

---

#### 2. Clear search button drops keyboard and screen-reader focus to document root
- **Severity**: Medium
- **Location**: `src/components/Header.jsx:113-122`
- **Statement**: The clear search button unmounts conditionally when the query becomes empty without shifting focus back to the input, causing keyboard and assistive technology focus to collapse to `document.body`.
- **Failure Scenario**: A bedside clinician using keyboard navigation or a mobile screen reader (iOS VoiceOver / Android TalkBack) navigates into the search field, types a search query (e.g., `"vanc"`), navigates to the "Clear search" button, and activates it via `Space` / `Enter` / double-tap. Because `query` is immediately set to `""`, the button unmounts from the DOM:
  ```javascript
  {query && (
    <button
      type="button"
      onClick={() => onQuery("")}
      aria-label="Clear search"
      className="absolute right-0.5 top-1/2 -translate-y-1/2 size-9 rounded-md flex items-center justify-center text-bar-muted hover:text-bar-text transition-colors before:absolute before:-inset-1 before:content-['']"
    >
      <X className="size-[18px]" aria-hidden="true" />
    </button>
  )}
  ```
  Because the active/focused element is destroyed without transferring focus back to the `<input>`, the browser drops focus to `document.body`. VoiceOver reads the very top of the page ("ACS Antibiotic Guide home"), and keyboard users lose their place entirely, having to re-tab through the entire brand row to reach the search field again.

---

#### 3. Interactive button nested inside `<label>` element in search bar
- **Severity**: Medium
- **Location**: `src/components/Header.jsx:88-123`
- **Statement**: Nesting the clear `<button>` inside `<label>` violates the HTML specification for interactive content and creates accessibility tree ambiguities and synthetic click bubbling.
- **Failure Scenario**: In `Header.jsx`, the search row wraps the input, search icon, and clear button inside a single `<label>`:
  ```javascript
  <label className="relative flex-1 min-w-0">
    <Search ... />
    <input ... />
    {query && (
      <button
        type="button"
        onClick={() => onQuery("")}
        aria-label="Clear search"
        ...
      >
        <X className="size-[18px]" aria-hidden="true" />
      </button>
    )}
  </label>
  ```
  HTML Living Standard § 4.10.4 expressly forbids interactive elements inside `<label>`. On certain screen readers and browser combinations, activating or focusing a child button inside a label either triggers synthetic click events on the input or causes the screen reader to announce the button text as part of the input's accessible label, degrading bedside input reliability.

---

#### 4. Route and note colors in `RegimenInline` pills violate the dose plate token invariant
- **Severity**: Medium
- **Location**: `src/components/shared.jsx:403-412`
- **Statement**: `RegimenInline` fails to wrap routes and notes in `text-plate-soft`, causing clinical notes and routes to render in gold mono (`text-plate-dose`) as if they were doses or frequencies.
- **Failure Scenario**: `CLAUDE.md` specifies the dose plate color invariant:
  > Mizzou black (`--plate`, 17 17 17 in both schemes) with the drug name in white (`plate-ink`) and the dose, route and frequency in gold mono (`plate-dose`, Mizzou gold); `plate-soft` for routes, notes and the "plus" connector;
  
  In `OrderLine` (lines 326, 332), this is implemented correctly with `<span className="font-medium text-plate-soft"> {route}</span>` and `<span className="font-sans text-[13px] font-medium text-plate-soft">, {note}</span>`.
  However, in `RegimenInline`:
  ```javascript
  <span className={`font-mono font-bold tabular-nums break-words ${dim ? "" : "text-plate-dose"}`}>
    {fmtDose(r.dose)}
    {r.route ? ` ${r.route}` : ""} {keepUnits(r.frequency)}
    {/* As on the plate, the note moves to the next line whole (v0.7.10). */}
    {r.note ? (
      <span className="font-sans font-medium">
        , <span className="inline-block max-w-full">{keepUnits(r.note)}</span>
      </span>
    ) : null}
  </span>
  ```
  Because `r.route` is printed bare inside the `text-plate-dose` span, and `r.note` is wrapped only in `font-sans font-medium` without `text-plate-soft`, both inherit `text-plate-dose` (gold mono). On closed open-fracture cards (`RegimenPills`), collapsed indication rows, and By-drug views, notes such as pharmacy consults or conditional qualifiers glow in the same high-contrast gold as the drug amount, muddying the visual distinction between the numerical dose and the qualifier.

---

#### 5. Potential duplicate React keys in Source page typo corrections list
- **Severity**: Low
- **Location**: `src/components/SourceView.jsx:113-114`
- **Statement**: Using `c.pdf` as the React list key for `transcription.corrections` triggers duplicate key warnings and reconciliation bugs if two corrections originate from identical typo strings across different tables or sections.
- **Failure Scenario**: In `SourceView.jsx`:
  ```javascript
  {transcription.corrections.map((c) => (
    <li key={c.pdf} className="py-2.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2 items-baseline">
      <span className="font-mono text-muted line-through break-words">{c.pdf}</span>
      ...
      <span className="col-span-3 mt-0.5 text-[12px] text-muted">{c.where}</span>
    </li>
  ))}
  ```
  `CLAUDE.md` documents:
  > One correction is a route, not a typo: open-fracture cefepime is shown "2 g IV q8 hours"... Both bullets that name it (Type III and the contamination regimen) print "Cefepime* 2g q8 hours" with no route...
  
  If both bullets are enumerated as entries in `transcription.corrections` with `c.pdf = "Cefepime* 2g q8 hours"` (distinguished only by `c.where`), `key={c.pdf}` produces identical keys, leading to React reconciliation defects and console error warnings. A composite key like `${c.pdf}-${c.where}` is required.

---

#### 6. Sub-44px touch target on brand bar `ThemeToggle` button
- **Severity**: Low
- **Location**: `src/components/ThemeToggle.jsx:16`
- **Statement**: `ThemeToggle` renders at 40px square (`size-10`) without pseudo-element hit-area expansion, violating the project's 44px minimum touch target invariant.
- **Failure Scenario**: `CLAUDE.md` requires 44px minimum touch targets across all mobile controls (e.g., search clear button reaches 44px via `before:-inset-1`, PCN pill reaches 44px via `before:-inset-y-1`, `SectionHead` is `min-h-[44px]`).
  `ThemeToggle.jsx` defines:
  ```javascript
  <button
    type="button"
    onClick={toggle}
    aria-label={`Switch to ${next} theme`}
    title={`Switch to ${next} theme`}
    className="inline-flex items-center justify-center size-10 rounded border border-gold/40 hover:border-gold text-gold hover:text-bar-text transition-colors shrink-0"
  >
    <Icon className="size-[18px]" aria-hidden="true" />
  </button>
  ```
  `size-10` is 40px × 40px with no `::before` touch-target compensation. On a phone operated single-handed or with gloved hands at the bedside, taps on the edge of the theme toggle can miss the target or inadvertently trigger adjacent controls.

---

### Clinical items flagged as unverifiable

- **Fever workup flowchart (Page 5 of the PMG)**
- **Fever workup flowchart (Page 5 of the PMG)**: Rendered as a raster graphic in the source PDF without an underlying text layer; cannot be machine-verified. Text in `feverWorkup` was transcribed by eye, incorporating four explicit physician decisions (unexplained hypotension grouped; reflexive culture phrasing; order of starting antibiotics vs repeat UA; and `<100,000 CFU/mL` discontinue step nested as `then`).
- **Antibiogram (Pages 6–11 of the PMG)**: Deliberately untranscribed per project instructions; refers users to the external MUHC Antibiogram app with 2025 data.
- **Source page metadata**: The sha256 checksum and page count for `source.file` are machine-checked against the content-hashed PDF, but publication date and editorial intro are unverifiable from the packet alone.

---

### Checked and found fine

- **Open fractures timing headline**: Accurately regex-parses the verified `of.timing` string for the 28px/36px display, hides decorative numerals from screen readers via `aria-hidden="true"`, and presents the full verbatim sentence with `keepUnits`.
- **Open fractures antimicrobial card**: Four regimen rows (Type I & II, Type III, Contaminated, Penicillin Allergy) render at identical hierarchy as in the PDF; amber wash cleanly targets `pcn-allergy` when `pcn` toggle is active.
- **Open fractures Gustilo-Anderson classification & femoral shaft**: Data mapping, sub-type codes, and responsive grid layouts preserve the PDF's text and structure without paraphrase.
- **Fever workup branches and outcome hierarchy**: Handles string outcomes and nested `{ text, then }` outcome objects without errors; uses `role="list"` to safeguard Safari/VoiceOver unbulleted list semantics.
- **Fever workup reference standards**: External links correctly specify `target="_blank"` and `rel="noopener"`.
- **Source document & reviewing physician cards**: Remain permanently expanded as required disclosures; emerald tone mark used exclusively for "Checked against the PDF".
- **Header resize measurement & deep link scroll offset**: `Header.jsx` dynamically updates `--app-header-h` via `ResizeObserver` and window resize listeners, properly disconnecting on cleanup.
- **Sticky SectionHead scroll clearance**: `SectionHead` dynamically measures and publishes `--section-head-h` on parent `<section>`; scrolls section back into view if collapsed while stuck.
- **CollapsibleCard state & animation**: Context-backed `OpenCards` survives navigation; collapsed panels correctly apply `inert` and `aria-hidden` attributes while allowing print styles to expand them.
- **ExpandAll functionality**: Correctly derives `allOpen` across view-specific key arrays and flips state synchronously via `setMany`.
- **Search field font size & iOS zoom prevention**: Preserves exact 16px text size (`text-[16px]`) on a 36px input container with 44px tap targets for clear and PCN buttons.
- **Bottom navigation (phones)**: Docked at 56px with safe-area padding; gold active indicator strictly uses `text-deepgold` for icon and `bg-gold` for 2px bar on light surfaces, keeping text in `text-ink`.
- **Footer disclaimer and build version**: Displays non-official publication notice and injects `__APP_VERSION__` cleanly with appropriate bottom padding above mobile nav.
- **Theme toggle mechanics**: Inverts theme cleanly between light and dark, switching SVG icons and `aria-label` accordingly.
- **Type scale adherence**: All font sizes in all 9 files strictly conform to allowed px increments (11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 36 px) with no Tailwind named sizes or un-sized `<sup>`/`<sub>` tags.
- **Token consistency & dark mode compatibility**: Zero arbitrary hex/rgb colors or fixed palette classes used; all classes rely strictly on theme CSS variables.

---

## Part 5 — PDF viewer, service worker, hosting, styles, guard tests (verbatim)

### Receipt

| Path | Lines | Last line |
|---|---|---|
| `src/main.jsx` | 79 | `);` |
| `vite.config.js` | 71 | `});` |
| `index.html` | 56 | `</html>` |
| `firebase.json` | 20 | `}` |
| `.github/workflows/ci.yml` | 26 | `      - run: npm run build # tests, then verify-pmg against the PDF, then vite build` |
| `.gitignore` | 39 | `/*.png` |
| `src/components/PdfButton.jsx` | 267 | `}` |
| `src/components/PdfCanvasViewer.jsx` | 281 | `}` |
| `src/index.css` | 332 | `}` |
| `tailwind.config.js` | 106 | `};` |
| `src/lib/theme.js` | 51 | `}` |
| `tests/theme.test.js` | 364 | `});` |
| `tests/type.test.js` | 117 | `});` |
| `tests/pdf-link.test.js` | 101 | `});` |

---

### Findings

#### 1. [High] `src/components/PdfCanvasViewer.jsx:78-80` — Hardcoded 10-second opening page timeout triggers false-positive failure on multi-page jumps (Fever Workup, page 5)

When a clinician taps the Fever Workup PDF button ([`FeverWorkupView.jsx`](file:///src/components/FeverWorkupView.jsx)), `PdfButton` mounts `PdfCanvasViewer` with `page={5}`. The viewer draws pages sequentially under the loading cover starting from page 1 so that earlier pages exist and scrolling is unclamped (`for (let n = 1; n <= pdfDoc.numPages; n++)` at [line 104](file:///src/components/PdfCanvasViewer.jsx#L104)). However, the failure timeout is hardcoded to an unconditional 10 seconds:

```javascript
78|     const timeout = setTimeout(() => {
79|       if (!cancelled && !rendered) setStatus("error");
80|     }, 10000);
```

`rendered` is only set to `true` once page `first` (page 5) completely finishes rendering ([lines 144, 153](file:///src/components/PdfCanvasViewer.jsx#L144-L153)). If loading pdf.js, awaiting any pending `teardown` (up to 3,000 ms at [line 37](file:///src/components/PdfCanvasViewer.jsx#L37)), and rendering pages 1 through 5 sequentially on a mobile device takes longer than 10.0 seconds (e.g. 2.1 seconds per page), `setStatus("error")` is triggered. The clinician is presented with an error screen ("Couldn’t show the PDF here") even though the worker and document are healthy. In an installed PWA, this leaves the user with only a "Try again" button that re-runs the exact same timed sequence.

*Failure scenario*: On a phone at the bedside, a clinician viewing Fever Workup opens the guideline PDF to check page 5. If rendering pages 1–5 takes 10.5 seconds, at 10.0 seconds the error overlay covers the viewer, preventing immediate clinical review of the Fever Workup algorithm.

---

#### 2. [Medium] `src/main.jsx:43-44` — Service-worker reload handoff fails to clear `sessionStorage` if the penicillin allergy toggle was turned off

The SW update handler preserves user view state across updates by writing to `sessionStorage`:

```javascript
42|     try {
43|       const pcn = window.__acsPcnAllergy;
44|       if (pcn) sessionStorage.setItem(VIEW_HANDOFF, "pcn");
45|     } catch {
```

If a prescriber had the penicillin allergy toggle on during a previous update or navigation that wrote `"pcn"` to `sessionStorage`, but subsequently toggled it off (`window.__acsPcnAllergy = false`), a subsequent update checks `if (pcn)`. Because `pcn` is false, it does nothing and never removes the key (`sessionStorage.removeItem(VIEW_HANDOFF)` is missing). If the app's boot cycle reads `sessionStorage` without an atomic remove-on-read, the prescriber unexpectedly reloads with the penicillin allergy filter re-enabled, altering which antibiotic regimens are emphasized at the bedside.

*Failure scenario*: Prescriber turns on PCN allergy, an SW update triggers a reload and saves `"pcn"`. Prescriber later turns off PCN allergy to review standard first-line regimens. Another deploy occurs while the tab is open; `window.__acsPcnAllergy` is false, so line 44 does not overwrite or remove `sessionStorage`. Upon reload, `"pcn"` is read from `sessionStorage`, unexpectedly turning the penicillin allergy filter back on.

---

#### 3. [Medium] `firebase.json:5-18` — Total absence of HTTP security headers (CSP, clickjacking, MIME sniffing, frame protection)

The hosting configuration in [`firebase.json`](file:///firebase.json#L5-L18) configures `Cache-Control` for assets and root files, but specifies no security headers whatsoever:

```json
 5|     "headers": [
 6|       {
 7|         "source": "**",
 8|         "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
 9|       },
...
```

There is no `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, or `Permissions-Policy`. Because the app is a public clinical reference hosted at `https://acs-antibiotics.web.app`, the lack of `X-Frame-Options` or CSP `frame-ancestors` allows the bedside guide to be embedded inside a transparent `<iframe>` on an arbitrary third-party site (clickjacking / UI redressing), which could trick prescribers or obscure critical contraindication warnings and dosing instructions.

*Failure scenario*: An external site embeds `https://acs-antibiotics.web.app` inside an iframe with an overlay that clips or masks the redosing/contraindication column, misleading a user into believing a displayed dose has no renal or allergy qualifiers.

---

#### 4. [Medium] `tests/pdf-link.test.js:32` — Guard against direct PDF links is easily bypassed by object destructuring or property access

The project instructions explicitly require that the PDF only opens in the in-app viewer and never via a direct link in the installed app. [`tests/pdf-link.test.js`](file:///tests/pdf-link.test.js#L30-L32) claims:
> *"The policy is reference-based, not link-shaped, so an alias, a multi-line href or a helper elsewhere in src/ cannot slip past..."*

However, the regex only checks:
```javascript
32| const PDF_REFERENCE = /\bpdfHref\b|\bsource\s*(?:\.\s*file\b|\[\s*["'`]file["'`]\s*\])|(["'`])(?!https?:\/\/)[^"'`\n]*\.pdf(?:[#?][^"'`\n]*)?\1/;
```

If a developer writes:
```javascript
const { file } = source;
<a href={`/${file}`}>View PDF</a>
```
or aliases `const s = source; const url = `/${s.file}`;`, `PDF_REFERENCE.test(...)` evaluates to `false`. Neither `pdfHref`, `source.file`, `source['file']`, nor a literal `.pdf` string appears in the source code. The guard passes silently, allowing an external `<a href>` to be committed that traps installed PWA users on mobile devices with no back navigation.

*Failure scenario*: A component imports `source` from `pmg.js` and destructures `const { file } = source;` to build an anchor tag. `npm test` passes completely, but installed iOS/Android users who tap the link lose application chrome and cannot return to the app without force-quitting.

---

#### 5. [Low] `src/components/PdfCanvasViewer.jsx:264-268` — Pointer events pass through the initial loading cover to the underlying scroller

In [`PdfCanvasViewer.jsx`](file:///src/components/PdfCanvasViewer.jsx#L264-L268), the loading screen overlay is styled with `pointer-events-none`:

```javascript
264|       {status === "loading" && (
265|         <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper text-[14px] text-muted">
266|           {page > 1 ? `Loading page ${page}…` : "Loading PDF…"}
267|         </div>
268|       )}
```

Because `pointer-events-none` allows touch and drag gestures to pass directly through to [`scrollerRef`](file:///src/components/PdfCanvasViewer.jsx#L235), an impatient user who attempts to scroll while "Loading PDF…" is visible will inadvertently scroll the container while canvas pages are still being appended. When the target page finishes drawing and `status` switches to `"ready"`, any user momentum scrolling can fight with the programmatic scroll-positioning logic at line 151, landing the reader at an arbitrary scroll offset between pages.

*Failure scenario*: On opening the Fever Workup PDF, the user swipes the screen during the 2-second load. The swipe scrolls the empty/partial container; when page 5 finishes rendering, the scroll position lands halfway across page 4 instead of at the top of page 5.

---

#### 6. [Low] `src/index.css:328-330` — Print stylesheet `break-inside: avoid` rule targets only `ol > li`, leaving unordered lists unprotected from page-split breaks

In [`src/index.css`](file:///src/index.css#L328-L330):

```css
328|   article,
329|   section > ol > li,
330|   .expand ol > li {
331|     break-inside: avoid;
332|   }
```

The print media query prevents page breaks inside clinical recommendation list items, but explicitly limits the selector to `<ol>` descendants (`section > ol > li`, `.expand ol > li`). Any clinical cards or notes rendered using `<ul>` (such as bulleted exclusion criteria, fever workup steps, or microbiology asides) are not covered by `break-inside: avoid` and can be sliced horizontally across printed physical pages when printed for bedside surgical charts.

*Failure scenario*: A bedside nurse prints the Open Fractures or Fever Workup guide for a patient chart; a bulleted list of high-risk contamination criteria is split across page 1 and page 2, splitting a multi-line dosing rule across the bottom margin.

---

### Clinical items flagged as unverifiable

- **Page 5 Fever Workup Image/Decision Tree**: As noted in the instructions, page 5 of the source PDF is an embedded image with minimal extractable text. The specific clinical thresholds, criteria
- **Page 5 Fever Workup Decision Tree**: Page 5 of the PDF is an image; clinical criteria, threshold boundaries, and pathway branches cannot be checked against machine-extracted text.
- **Pages 6–11 Guidelines Content**: Non-antimicrobial narrative sections and surgical discussions are not transcribed into `pmg.js`, per project rules.

---

### Checked and found fine

- **Service worker cache configuration (`vite.config.js`)**: Workbox precaches all bundled JS, CSS, self-hosted `@fontsource` WOFF2 fonts, and the hashed PDF under 3 MiB; `cleanupOutdatedCaches` and `clientsClaim` are active.
- **Service worker freshness & polling (`src/main.jsx`)**: Checks for updates on window `load`, `online`, `visibilitychange` (resumed tab), and a 1-hour interval; `sawInitialClaim` correctly skips redundant reloads on brand-new installs.
- **Hash routing & hosting navigation (`firebase.json`, `vite.config.js`)**: No server-side catch-all rewrite in `firebase.json`; `navigateFallbackDenylist` correctly prevents Workbox from serving the HTML shell to missing hashed assets or file paths.
- **Asset caching policies (`firebase.json`)**: Content-hashed PDF and `/assets/**` chunks receive 1-year immutable caching (`max-age=31536000, immutable`), while the HTML shell, `sw.js`, and manifest revalidate with `no-cache`.
- **Pre-paint theme initialization (`index.html`, `src/lib/theme.js`)**: Synchronous inline `<script>` in `<head>` sets `data-theme` from `localStorage` before stylesheet evaluation, preventing light/dark flashes.
- **Theme contrast matrix & token parity (`tests/theme.test.js`)**: Both light and dark blocks define identical token sets; contrast satisfies WCAG 4.5:1 for all text pairings and 3:1 for controls, focus indicators, and plate borders.
- **Palette and fixed-colour restrictions (`tests/theme.test.js`)**: Components exclusively use Tailwind theme tokens; arbitrary hex, named Tailwind palette classes, and un-tokenized style attributes are caught by build-time scans.
- **Type scale enforcement (`tests/type.test.js`)**: Font sizes strictly adhere to the defined 11–36 px step scale; off-scale pixel values, named sizes, and bare `<sup/sub>` elements fail the build.
- **Canvas rendering and DPI scaling (`src/components/PdfCanvasViewer.jsx`)**: Page rendering properly calculates viewport transforms and backing-store dimensions against `window.devicePixelRatio` capped at 2.
- **Worker isolation and lifecycle cleanup (`src/components/PdfCanvasViewer.jsx`)**: PDF.js worker is instantiated once via `?worker` port; `task.destroy()` properly tears down document instances without terminating the shared worker.
- **Modal accessibility and inertness (`src/components/PdfButton.jsx`)**: The PDF viewer portal sets `#root` to `inert`, applies `aria-modal="true"`, shifts initial focus to Back, and restores focus to the trigger on close.
- **History back-button integration (`src/components/PdfButton.jsx`)**: History entry tokening prevents popstate leakage, handles double-taps safely, and honors the 1.5 s settling window without crashing if navigation fails.
- **Viewport and zoom compliance (`index.html`)**: Viewport configuration allows pinch-to-zoom (`maximum-scale=5.0`), search inputs are 16px to prevent iOS auto-zoom, and safe-area padding avoids device notches.
- **CI pipeline (`.github/workflows/ci.yml`)**: Automates `npm ci` and `npm run build` (tests, verification, Vite bundle) on PRs and pushes to `main` without risking accidental auto-deploys.

---

---

## Dispositions (Claude, separate from the review)

Checked 2026-10-14 against `7cc08d2`. "Planted" means the edit was made to a `structuredClone` of the
data and run through the real `verify()` (as `tests/verify-controls.test.js` does), the
`pmg.test.js` short-label logic, or `searchIndications`. Gemini's severity is kept; where I read it
differently, that is a separate column, and I have dismissed no Critical or High finding.

### Confirmed

| # | Gemini | Mine | Finding | Evidence |
|---|---|---|---|---|
| 2.1 | **Critical** | Critical | `hasPhrase` lets a trailing clause be cut off | Planted, **verifier PASSES**: `openFractures.timing` cut to "Administer within 30 min of arrival to the ED" (drops "& all patients to have MRSA nasal screen"); the `pharmacy` footnote cut after "…adult and pediatric patients." (drops the renal and suggested-dosing sentences); `renal` cut to "Pharmacy to dose adjust". `Timing:` and the mark anchor the start (`verify-pmg.mjs:465`, `:583`); nothing anchors the end. The two headings end in `:` (`:500`, `:508`), so cutting their end is caught. Cutting their *start* was not tested. |
| 1.1 | High | High | Short-label test lets an inverted label pass | Planted, **test logic PASSES** all four: `cellulitis-purulent` as "Cellulitis — non-purulent", `sbo-necrosis` as "…without necrosis…", `diverticulitis-no-source-control` as "…with source control", and `sbo-necrosis` as "SBO". `with`, `without` and `non` are stop words (`pmg.test.js:67`). The collapsed row's only title is `ind.short` (`IndicationsView.jsx:411`, `:425`); the PMG name appears only once the row is open (`:439`). The verifier does not check short labels. |
| 3.1 | High | High | "non purulent" (with a space) finds nothing | Run: `"non purulent"` → 0; `"nonpurulent"` and `"non-purulent"` → `cellulitis-nonpurulent`. `search.js:6-7` says all three reach it. A search that hides the matching row is priority 1. |
| 1.2 | High | Medium | Page 5 has no guard | Planted: deleting the UTI `then` step **passes both** the verifier and the tests. A known limit (`CLAUDE.md`: the comment above `feverWorkup` is the only guard), but a snapshot test pinning the transcribed text would catch an accidental edit. |
| 2.2 | High | Low | Open-fracture regimen fields can be merged or shuffled | Planted, **verifier PASSES**: `type-1-2` as `{ dose: "2 g IV q8 hours" }`, and dose/route/frequency shifted across fields. The prose the reader sees is the same words in the same order; what changes is which part is drawn gold. The schema has no guard. |
| 2.3 | High | Low | References: a truncated entry or a dropped URL passes | Planted, **verifier PASSES**: reference 2 cut before its journal, and reference 1's DOI removed (`flat12.includes(whole)`, `:609`). Bibliographic, not clinical. |
| 3.2 | High | Low | `redose` is not searched | Run: "blood loss", "1500", "every 4 hours", "redose" → 0. The column holds only two distinct non-null strings, so a search on it would barely tell rows apart. `search.js`'s header does not list it among the indexed fields, so this is an omission rather than a broken promise. |
| 5.1 | High | Low | 10 s timeout spans pages 1–5 when the viewer opens at page 5 | True (`PdfCanvasViewer.jsx:78-80`). But the loop keeps running and sets `ready` when page 5 lands (`:144-153`), and the scroller stays mounted, so the error clears itself. What a slow phone gets is a false error that then disappears. |
| 1.4 | Medium | Medium | `zosyn.length >= 7` | Run: 9 matches today (8 pip-tazo rows + abdominal trauma), so two can vanish unnoticed. |
| 1.5 | Medium | Medium | Nothing checks that every `TYPO_MAP` entry is listed in `transcription.corrections` | True. The two are in step today (all 7 map entries are listed; the 8th correction, the CAUTI label, goes through the prefix rule). Codex raised the same gap at v0.7.10. |
| 3.4 | Medium | Medium | Collapsing a drug in By drug jumps to the top of the page | Code: `App.jsx:85-86` scrolls to the top on any `route.drug` change; `DrugsView.jsx:31-37` scrolls only when a drug is set. Not reproduced in the preview. |
| 4.2 | Medium | Medium | Clear search leaves focus on nothing | Code: `Header.jsx` clear button calls `onQuery("")` and unmounts, with nothing moving focus to the input. |
| 4.4 | Medium | — (design) | Pills draw the route and note gold; the plate draws them soft | True. `RegimenInline` puts the route inside the `text-plate-dose` span, and the note inherits it; `OrderLine` uses `text-plate-soft`. `CLAUDE.md` contradicts itself ("dose, route and frequency in gold" then "plate-soft for routes, notes"). Thiago's call which is meant. |
| 5.3 | Medium | Low | No security headers | `firebase.json` sets only `Cache-Control`. A read-only page with no actions gives clickjacking little to work with; `X-Content-Type-Options`, `frame-ancestors`/`X-Frame-Options` and `Referrer-Policy` are cheap hardening. |
| 5.4 | Medium | Low | PDF-link guard misses `const { file } = source` | True. The test's comment claims an alias "cannot slip past"; destructuring does. |
| 2.4 | Medium | Low | A `regimenNote` on an N/A row passes the verifier | Planted: passes. An N/A row renders without its note (`IndicationsView.jsx:408-414`), so nothing reaches the screen today. |
| 2.5 | Medium | Low | Open-fracture `page` can be swapped 3↔4 | Planted: passes. Those `page` fields are not rendered since v0.7.7. |
| 1.3 | Medium | Low | Short labels are not checked for uniqueness | True (planted "SBO" twice: passes); unique today. Folds into 1.1's fix. |
| 4.3 | Medium | Low | Clear button inside the `<label>` | True; a `button` is labelable, so this breaks the label's content model. Browsers do not forward a click from an interactive descendant, so behaviour is fine. |
| 2.6 | Low | Low | `TYPO_MAP` runs before unit-spacing normalisation | True, but it can only fail loudly on a future PDF, never pass wrongly. |
| 3.7 | Low | Low | By drug sorts without fracture uses but displays them | True (`DrugsView.jsx:21-24` vs `:52`). |
| 4.6 | Low | Low | Theme toggle is 40px with no hit-area extension | True (`size-10`). |
| 5.6 | Low | Low | Print `break-inside: avoid` covers `ol > li` only | True (`index.css:328-330`); `ul` is used in five components. |

### Not confirmed

| # | Gemini | Finding | Why |
|---|---|---|---|
| 4.1 | **High** | `pdfHref` export in `shared.jsx` bypasses the PDF-link guard | **I disagree; listed here, not dismissed.** The test allows exactly that one line (`pdf-link.test.js:24`, `:48`), and any other file that names `pdfHref` fails, an import included (`\bpdfHref\b`, `:32`). The bypass that does exist is 5.4. |
| 1.6 | Low | Classification, timing, debridement and femoral shaft are unguarded | The verifier guards them. Planted debridement and femoral-shaft edits were caught. The real gap is 2.1. |
| 1.7 | Low | Deleting `perforated-pud`'s `regimenNote` passes | Planted: the verifier catches it (the note is compared within the regimen cell). |
| 5.2 | Medium | A stale `pcn` handoff re-enables the toggle | `App.jsx:62-63` removes the key when it reads it, so it cannot survive past the next load. |
| 5.5 | Low | Scrolling under the loading cover misplaces the page-5 jump | The jump is computed from the page's position at that moment (`PdfCanvasViewer.jsx:151`), so an earlier scroll is compensated; only momentum still in flight could move it. |
| 3.3 | Medium | A string `duration` would be spread into characters | Hypothetical: every non-null `duration` is an array today (run). |
| 3.5 | Medium | `bySection[ind.section]` could be undefined | `pmg.test.js:19` fails the build on an unknown section. |
| 3.6 | Low | Dosing footnotes are hard-coded | Hypothetical: there are two footnotes and both are listed. |
| 3.8 | Low | An empty `brand` would match every row | Hypothetical: every drug has a brand (run). |
| 4.5 | Low | Duplicate React keys among corrections | Hypothetical: the eight `pdf` strings are distinct. |

### Clinical items (flagged, not judged)

No review here verifies a clinical value. Part 1 compared `pmg.js` with the PDF's *text* and reported
every table value, dose band, footnote and reference as matching. That is a transcription check by one
model, not a physician read. The differences it listed are all punctuation or case, which the verifier
normalises, and none is a value:

- reference 10 "pneumonia.Annals" (PDF) vs "pneumonia. Annals"
- the Type III label: "Type III - Treatment for ALL Type III: :" (PDF) vs "Type III — treatment for ALL Type III"
- "Soil, Fecal Contamination" (PDF) vs "Soil, fecal contamination"
- references 12 and 13: the URL is held in its own field
- the femoral-shaft heading's colon

Page 5 remains unverifiable by machine, and 1.2 shows nothing pins it.

### What the review did not cover

The Codex half. Gemini only ever saw the code in parts, so it could not see across the part boundaries
(App ↔ PDF viewer, data ↔ views). No UI behaviour was exercised in a browser; 3.4 and 4.2 rest on
reading the code.

### Probe

`probe.mjs` (session scratchpad, not committed) imports `verify`, `readPdf`, `searchIndications` and
the data from the repo, plants each edit above into a clone, and prints `PASSES` or `caught` with the
verifier's first error.

## Follow-up — v0.7.11, the same evening

Thiago: "fix them here". Every confirmed finding except two was fixed, with no change to any
clinical value in `src/data/pmg.js`. Each verifier fix has a planted-error control in
`tests/verify-controls.test.js`, and each was first shown to pass the old verifier (`probe2.mjs`,
session scratchpad). The Gemini fixes took the controls from 56 to 68; the Codex whole-codebase review
and the v0.7.11 pre-commit review brought them to 79 (`2026-10-14-codex-whole-codebase-review.md`,
`2026-10-14-codex-v0711-review.md`).

| # | Fix |
|---|---|
| 2.1 | `mustPrint` replaces `hasPhrase` (removed). The timing rule is compared as `• Timing: … • Antimicrobial:`, the debridement heading as `• …:`, the femoral-shaft heading after "Open extremity fractures", and the two footnotes as one run ending at `• Duration:`. Controls cover cuts at the end and at the start. |
| 1.1, 1.3 | Short labels must carry exactly their PDF name's qualifiers ("with", "without", "non", "no", "not"), each with the word after it, and be unique; a label's "±" counts as "with or without". The first version compared negation counts only, and the v0.7.11 pre-commit review showed a scope swap passing. A control test feeds thirteen inverted or borrowed labels and requires each to be caught. |
| 3.1 | `score()` tries a lone "non" joined to the next word, and falls back to two words if that matches nothing. The first version always joined them, and the pre-commit review caught that it broke "non cefazolin". Tests cover all four spellings, which must reach only the non-purulent row, and "non cefazolin". |
| 1.2 | `tests/pmg.test.js` pins `feverWorkup` by sha256. |
| 2.2 | Open-fracture dose, route and frequency are shape-checked. |
| 2.3 | The thirteen references are also compared as one run to the end of page 12. |
| 2.4 | `regimenNote` must be null on an N/A row. |
| 2.5 | Each open-fracture regimen must be printed on the page its `page` names. |
| 3.2 | `redose` is searched ("blood loss" → the three trauma rows). |
| 5.1 | The PDF viewer's 10 s limit restarts at each step of progress before the opening page is drawn. |
| 1.4 | The Zosyn search test asserts the exact nine rows. |
| 1.5 | A test requires every `TYPO_MAP` rewrite to be a listed correction (`TYPO_MAP` is exported). |
| 3.4 | Opening or closing a drug in By drug no longer scrolls the page to the top. |
| 4.2 | Clear search hands focus back to the field. |
| 4.3 | The search field's wrapper is a `div`. |
| 4.6 | The theme toggle, and the PDF button beside it (also 40px), have 44px tap areas. |
| 3.7 | By drug sorts by the count it displays. |
| 5.3 | `firebase.json` sends `nosniff`, `frame-ancestors 'none'`, `X-Frame-Options: DENY` and a `Referrer-Policy`. Nothing of Thiago's frames the app: no file under `[3] Claude` names it. |
| 5.4 | The PDF-link guard also catches `file` destructured from `source` (on one line or several), `source` re-bound, and `source` imported under another name. Its comment no longer claims to be complete. |
| 5.6 | Print keeps `ul` items whole too. |

**Not changed.** Two findings were left as they are:

- **4.4** is a design question for Thiago: which colour the route and note take on a pill.
- **2.6** can only make a future PDF fail loudly; it cannot let a wrong value pass.

**Checked.** `npm run build` passed at this point (107 tests, then the verifier, then the Vite
build); with the later fixes, 118 tests pass. In headless
Chrome at 375px, against the dev server:

- opening a drug scrolls it to just under the header, and closing it keeps the reader's place;
- changing view still scrolls to the top;
- a link to `#/drugs/Vancomycin` from Indications opens and reaches that drug;
- the PDF opened from Fever workup draws all 12 pages with no error;
- in print, `ul` items in a panel compute `break-inside: avoid`.

In the preview pane, "non purulent" finds only the non-purulent row and "blood loss" the three
trauma rows, and Clear search leaves focus in the field. By drug was screenshotted in both schemes;
nothing else in the header or the list looks different.
