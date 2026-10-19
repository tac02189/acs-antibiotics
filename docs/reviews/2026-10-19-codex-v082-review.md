# Codex peer review — v0.8.2, 2026-10-19

The required review before the v0.8.2 commit. It is single-engine (Codex), and it is not clinical
verification. Thiago asked "Use the empiric table dosing for places where dosing is missing", so the
four drugs named on surgical-prophylaxis rows that the prophylaxis dosing table does not list
(Doxycycline on open face / mandible fracture; Linezolid, Clindamycin and Cefepime on necrotizing
soft tissue infection debridement) now show the empiric table's dose, route and frequency, marked
as the empiric table's. No value in `src/data/pmg.js` changed.

- **How it ran.** `codex exec`, `gpt-6-astra`, reasoning effort high, Codex v0.162.1, header
  `sandbox: read-only`. The full packet went in on stdin with "do not use any tools". Codex
  confirmed every section's END marker, and its log shows no tool calls.
- **The packet.** 209,736 bytes: the 508-line `src` / `tests` / `package.json` diff, the 65-line
  `CLAUDE.md` / `README.md` diff, and the full line-numbered text of `dosing.js`, `shared.jsx`,
  `IndicationsView.jsx`, `DrugsView.jsx`, `search.js`, `SourceView.jsx`, `text.js`,
  `tests/pmg.test.js` and `pmg.js`. Each section's line count and last line were checked against the
  tree before sending. Its citations that were spot-checked matched the tree.

**Nothing below was dismissed or softened.**

## Codex's response (verbatim)

All packet sections have their matching END markers. No tools were used. The PDF, verifier implementation, other test files, print stylesheet, and rendered application are absent; conclusions requiring those are **UNVERIFIED**, including the reported 151 passing tests.

**Findings — most severe first**

1. **Medium — `src/components/shared.jsx:476–481`, `src/components/shared.jsx:347–350`: the fallback identifies its source but does not explain the frequency beside the dose.**

   The pill says, for example, `Clindamycin 900 mg IV Q8H · empiric table`. The expanded plate says `From the empiric dosing table (not in the prophylaxis table)`. Both preserve provenance, but neither explicitly identifies Q8H as a treatment interval. These appear alongside pills saying `OR redose …` in a surgical-prophylaxis section.

   **Reproduction:** open `nsti-debridement`, or collapse it with Allergy enabled. Read Clindamycin’s Q8H beside Vancomycin’s OR-redosing text. A hurried reader could interpret both as intervals serving the same purpose. The explicit distinction exists on the Source page, not beside these doses.

   **Suggested fix:** retain the source mark and add a concise local distinction, such as `empiric table · treatment frequency`, with `No OR redosing interval listed` in the expanded explanation. This is a presentation finding, not a judgment about the clinical values.

2. **Medium — `tests/pmg.test.js:215–267`: helper tests do not protect the required marks in rendered components.**

   The tests thoroughly exercise `doseSource` for the current indications and pin all four fallback strings in `doseLine`. They never render `DrugPills`, `DrugDose`, or `IndicationRow`. The comment at line 233 claims to check the caption, but the assertion checks only `fallbackDrugs`.

   **Concrete mutations:** delete the marker at `shared.jsx:478–483`, delete the plate explanation at `shared.jsx:347–351`, or delete the caption exception at `IndicationsView.jsx:459–466`. Every supplied test would still pass.

   **Suggested fix:** add component tests asserting the actual fallback dose and adjacent mark in collapsed, expanded, Allergy, and By-drug contexts. Include both affected indication rows and a drug that must retain its prophylaxis dose. Whether omitted test files already provide any such coverage is **UNVERIFIED**.

3. **Low — `src/data/pmg.js:72`, `src/data/pmg.js:82`: visible section descriptions still claim every dose comes from the prophylaxis table.**

   Both say:

   > Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table.

   That is now incomplete for Trauma and Emergency General Surgery. These blurbs are passed to `SectionHead` at `IndicationsView.jsx:303`; the updated introductory aside is omitted on section routes and during searches (`IndicationsView.jsx:203`).

   **Reproduction:** visit `#/s/egs` with no search. The section description makes an unconditional prophylaxis-table claim while the Linezolid pill cites the empiric table.

   **Suggested fix:** mention the marked exceptions in these two app-authored blurbs. The Elective Surgery blurb at `pmg.js:92` remains accurate for current data.

   Related stale wording:
   
   - `tests/pmg.test.js:147–150` explicitly says “no fallback to the other table.”
   - `IndicationsView.jsx:346–348` and `search.js:13–15` describe only the matching table.
   - `dosing.js:35` says `FALLBACK_NOTE` supplies the plate wording, although the plate uses a separate literal.
   - `pmg.js:1041` still states the matching-table rule without its exception, although the immediately following flag supplies that exception.

   Update these descriptions to match the implemented rule. The supplied README and CLAUDE.md changes themselves describe the new behavior consistently.

4. **Low — `src/lib/dosing.js:21`: some invalid `kind` values throw instead of returning no source.**

   `TABLES` is a normal object. For `kind === "toString"` or `"constructor"`, `TABLES[kind]` resolves to an inherited property. The optional chain guards that property being nullish, but not its missing `rows`; accessing `.find` then throws.

   **Reproduction:** `doseSource("Cefazolin", "toString")`. Ordinary unknown strings such as `"bogus"` correctly return null.

   **Suggested fix:** explicitly accept only `"prophylaxis"` and `"empiric"` before indexing, or use an own-property check. Add invalid-kind tests covering prototype-property names. Current section data contains only valid kinds, and `tests/pmg.test.js:35` enforces that, so this is a defensive edge case rather than a demonstrated bedside path.

**CLINICAL VALUES NEWLY ON SCREEN**

These are the four newly displayed **prophylaxis-row associations**, read directly from `empiricDosing`. The values already appeared in empiric-table contexts before this change. Their clinical correctness remains for physician comparison against the PDF.

| Drug | Dose | Route | Frequency | Row and column | Other newly affected displays |
|---|---|---|---|---|---|
| Doxycycline | 100 mg | IV or PO/per tube | Q12H | `open-face-fracture`, alternative | Expanded alternative; collapsed Allergy summary; matching indication search results and searchable dose line; Doxycycline’s By-drug alternative-use list |
| Linezolid | 600 mg | IV or PO/per tube | Q12H | `nsti-debridement`, preferred | Collapsed preferred summary; expanded preferred plate; matching indication search results and searchable dose line; preferred-use lists under **Linezolid and Piperacillin-tazobactam** |
| Clindamycin | 900 mg | IV | Q8H | `nsti-debridement`, alternative for Linezolid | Expanded alternative; collapsed Allergy summary; matching indication search results and searchable dose line; alternative-use lists under **Clindamycin, Vancomycin, Cefepime, and Metronidazole** |
| Cefepime | 2 g | IV | Q8H | `nsti-debridement`, alternative for Piperacillin-tazobactam | Expanded alternative; collapsed Allergy summary; matching indication search results and searchable dose line; alternative-use lists under **Clindamycin, Vancomycin, Cefepime, and Metronidazole** |

Value citations: `src/data/pmg.js:634`, `:637`, `:633`, and `:629`, respectively. Row/column associations: `pmg.js:235–243`, `:335–343`, and `:122–125`.

The additional By-drug appearances follow because each preferred-use entry renders the entire preferred combination, and each alternative-use entry renders the entire alternative column—not only the selected drug (`DrugsView.jsx:93–103`). Dimming partners does not remove their marks.

Search results reuse `IndicationRow`; they do not have a separate dose-snippet renderer. Alternatives appear when expanded or when the collapsed Allergy view is enabled. Printed appearance is **UNVERIFIED** without the print CSS.

The exact wording and its likely interpretation:

- **Pill:** `· empiric table` (`dosing.js:36`, `shared.jsx:481`). A reader is told which table supplied the line. The words do not explicitly distinguish a treatment interval from OR redosing.
- **Plate:** `From the empiric dosing table (not in the prophylaxis table)` (`shared.jsx:349`). This explains the exception clearly, but still leaves the meaning of the frequency implicit.
- **Open-face caption**, assembled from `IndicationsView.jsx:455–467` and the table titles:

  > Doses: Dosing and Redosing of Intravenous Antibiotics for Surgical Prophylaxis; for Doxycycline, which it does not list: Dosing and Frequency of Empiric Antimicrobials for Acute Infections. The PDF's row names the drugs only.

- **NSTI-debridement caption**, assembled from the same code:

  > Doses: Dosing and Redosing of Intravenous Antibiotics for Surgical Prophylaxis; for Linezolid, Clindamycin and Cefepime, which it does not list: Dosing and Frequency of Empiric Antimicrobials for Acute Infections. The PDF's row names the drugs only.

  Both captions correctly identify the exception and its source. “Acute Infections” provides useful context, but the long 12px sentence requires deliberate reading on a phone. Neither explicitly says “treatment interval.”

- **Intro aside**, `IndicationsView.jsx:205–208`:

  > Tap a section, then a row. The PMG's indication tables name the drugs only; the dose beside each drug comes from its dosing table for that section — surgical prophylaxis for the three surgery sections, empiric therapy for acute infections. A drug the prophylaxis table does not list shows its empiric-table dose, marked as such.

  This explains the lookup policy. It does not explain the frequency distinction and is not present on section routes or during searches.

- **Source-page flag**, `pmg.js:1042`:

  > Four drugs named on surgical-prophylaxis rows are not in the prophylaxis dosing table: Doxycycline (open face / mandible fracture alternative), Linezolid (necrotizing soft tissue infection debridement), and Clindamycin and Cefepime (its alternatives). On those rows the app shows their dose, route and frequency from the empiric table (page 4), marked as such, at a physician's direction. That table's frequency is a treatment interval; the PMG gives these four no OR redosing interval.

  This explicitly resolves the distinction. A reader who reads this flag should understand it; someone reading only a bedside pill does not receive that explanation.

**TESTS: mutations that would survive**

The following would survive **the supplied `tests/pmg.test.js`**. Survival of the entire reported suite is **UNVERIFIED**, because its remaining files are absent.

| Concrete mutation | Why the supplied tests miss it |
|---|---|
| Delete `DrugPills`’ fallback marker, `shared.jsx:478–483` | No component rendering assertions |
| Delete `DrugDose`’s fallback explanation, `shared.jsx:347–351` | `doseSource` and `doseLine` remain correct |
| Delete the caption exception, `IndicationsView.jsx:459–466` | Tests assert `fallbackDrugs`, not its use in JSX |
| Hardcode `"empiric"` for By-drug use-list rendering at `DrugsView.jsx:96` and `:102` | No test exercises the component’s per-row kind propagation |
| Strip `" · empiric table"` from the string added to the haystack at `search.js:68` | Search tests never assert fallback provenance is indexed |
| Add reverse fallback after a missing empiric lookup | Every current prophylaxis-table drug also exists in the empiric table; no current fixture exercises that missing-empiric/present-prophylaxis condition |
| Special-case `doseLine("Metronidazole", "prophylaxis")` to return its empiric dose line | Source-selection tests remain correct, and exact dose-line assertions do not cover that pair |

For the reverse-fallback mutation, replacing `dosing.js:31` with a lookup in the opposite table after any failed own-table lookup would pass the supplied assertions. The `"Not a drug"` cases remain null in both tables, and the Cefazolin empiric case finds its own row before reaching fallback. A synthetic fixture with a prophylaxis-only drug is needed to exercise the prohibited direction.

Conversely, these requested mutations **would fail**:

- **Remove fallback from `doseSource`:** the current four missing-prophylaxis entries fail `assert.ok(src)` and source equality checks (`pmg.test.js:224–229`).
- **Remove fallback only from `doseLine`:** the four exact expected strings fail (`:258–261`).
- **Prefer empiric rows over existing prophylaxis rows in `doseSource`:** the per-indication `own` checks fail (`:225–226`).
- **Replace existing empiric sources with prophylaxis sources:** current drugs shared by the tables fail those same source checks.
- **Remove the fallback mark from `doseLine`:** all four pinned fallback strings fail (`:258–261`).

Thus the tests protect current helper behavior well, but the title “dose lines read as the pills show them” at line 252 overstates what is established: no pill is rendered.

**NO FINDING**

1. **UNMARKED FALLBACK — clean in the supplied rendering and search code; print remains UNVERIFIED.**

   The source-level trace preserves the mark:

   | Path | Trace and result |
   |---|---|
   | Collapsed preferred summary | `IndicationsView.jsx:353` → `DrugPills` → fallback mark at `shared.jsx:481` |
   | Collapsed Allergy summary | `IndicationsView.jsx:362` → `AlternativePills` → `DrugPills` at `shared.jsx:510`; mark retained |
   | Expanded preferred plate | `IndicationsView.jsx:450` → `Regimen` → `DrugDose` at `shared.jsx:400`; explanation retained |
   | Expanded alternative column | `IndicationsView.jsx:473` → `AlternativePills` → marked `DrugPills` |
   | By-drug use lists | `DrugsView.jsx:96–102` passes each indication’s own section kind; both pill paths retain marks |
   | Search haystack | `search.js:65–68` uses `kindOf` and `doseLine`; normalization removes the separator but retains “empiric table” |
   | Search result display | Reuses the same indication components and marks |
   | Screen-reader text | Drug, dose, and mark are ordinary text in order; the explicit space at `shared.jsx:421` separates name from dose. No `aria-hidden` removes the mark independently |
   | Print | Marks exist in the same DOM as the doses, but CSS could affect visibility. Actual print behavior is **UNVERIFIED** |

   By-drug standalone dosing entries are explicitly headed by their table titles (`DrugsView.jsx:119–145`); those are existing table entries, not unmarked fallback associations. `OrderLine` and `RegimenInline` render explicit open-fracture data rather than calling the fallback lookup (`shared.jsx:360–381`, `:522–537`).

2. **WRONG TABLE — clean for current valid kinds and data.**

   `doseSource` returns an existing matching-table row before considering fallback (`dosing.js:29–32`). Only a missing prophylaxis entry can fall back. An empiric row cannot take a prophylaxis line.

   `TABLES` maps the two valid kinds correctly; `kindOf` resolves the indication’s section. All eight prophylaxis-table drugs also appear in the empiric table, but prophylaxis lookup still wins for prophylaxis rows. By-drug lookup remains per indication, even when a drug appears in both kinds of section.

   `fallbackDrugs` considers preferred and alternative drugs and deduplicates them in first-occurrence order (`dosing.js:40–43`). A drug occurring in both columns does not acquire a different source or duplicate caption entry. The invalid prototype-name exception is finding 4.

3. **TEST STRENGTH — current helper regression checks are clean; component coverage and reverse-fallback coverage are not.**

   The failure cases above are directly supported by the assertions. No supplied test covers the three requested React renderers. The complete suite’s coverage and execution are **UNVERIFIED**.

4. **DATA UNCHANGED — clean: no transcribed clinical value changes in the supplied diff.**

   Every changed line in `src/data/pmg.js`, using working-tree numbering:

   | Line | Classification |
   |---|---|
   | 21 | Comment changed to describe empiric fallback |
   | 22 | Added continuation comment recording the direction/date and disclosure |
   | 1036 | Comment changes “two” departures to “three” |
   | 1038 | Comment adds the fallback to the departure description |
   | 1039 | Reflowed continuation comment about the existing route correction |
   | 1042 | App-authored Source-page flag replaced; describes new display behavior and frequency semantics |

   Line 1037 is unchanged context. No indication, dose, route, frequency, duration, dosing-table header, correction value, or reference changes.

   **The new flag passes `flagProblems` by inspection:** it contains no double-quoted phrase, no `Q<number>H` token, and no number followed by one of the recognized mass units (`pmg.test.js:197–201`). `page 4` is not a match. The surrounding JavaScript string delimiters are not characters in the runtime flag.

   The diff supplies no clinical-data reason for the verifier to regress. An actual `npm run verify` pass remains **UNVERIFIED**.

5. **CLINICAL CONTENT — enumeration and attribution are clean; frequency presentation has finding 1.**

   Exactly four new prophylaxis-row dose associations exist, as listed above. No clinical correctness judgment is made.

Additional clean checks:

- **Caption grammar:** `fallbackNames` correctly produces one name or a conjunction-separated list (`IndicationsView.jsx:394–395`). “It” refers to the singular prophylaxis table, so “which it does not list” works for one or multiple drugs. JSX assembly does not require a missing space or introduce a grammatical singular/plural error.
- **React keys/fragments:** the new conditional fragments are not mapped siblings and require no keys. Preferred and alternative occurrences are in separate lists; no new key collision is evident.
- **Links:** both caption links intentionally target `#/dosing`. They have distinct table-title labels but no table-specific destination. Whether that page offers suitable anchors or landing behavior is **UNVERIFIED**.
- **Theme and type scale:** the supplied component color classes use tokens, and explicit font sizes use the permitted steps. No fixed-palette color or new off-scale font size is evident.
- **Phones and accessibility:** pills permit wrapping and preserve readable provenance text in the DOM. The new marker adds no interactive tap target. Actual layout below 400px, contrast, screen-reader pronunciation, print output, and measured target sizes are **UNVERIFIED** without styles and rendering.

## Dispositions

1. **Medium, the frequency is not labelled as a treatment interval: partly fixed, rest left for
   Thiago.** The plate's note under a fallback line now reads "From the empiric dosing table (not in
   the prophylaxis table). The PMG gives it no OR redosing interval." The pill still reads
   "· empiric table". Adding "no OR redose listed" or "treatment frequency" there is a change to how
   a dose reads at the bedside, so it is his call.
2. **Medium, no component-render tests: not done, verified in the preview instead.** The project
   has no React rendering harness (CLAUDE.md, *Testing*: "UI behaviour has no automated tests").
   In the dev server the mark showed on every path Codex traced: the expanded plate and the
   alternative column (seen in both schemes at 375px), and the collapsed row with the Allergy toggle
   on and By drug's Clindamycin use lists (read as page text, light scheme), with no console errors. The helper tests were strengthened
   instead (item 4).
3. **Low, stale wording: comments fixed, blurbs left for Thiago.** The comments in
   `tests/pmg.test.js`, `IndicationsView.jsx` (`RegimenSummary`), `search.js` and `dosing.js`
   (`FALLBACK_NOTE`) now describe the fallback, and the Source page's first flag points to the
   exception in the next. The Trauma and EGS section blurbs ("Doses from the PMG's prophylaxis
   dosing table.") are unchanged: CLAUDE.md says to change a blurb only at Thiago's request.
4. **Low, a `kind` of "toString" threw: fixed.** The lookup reads own keys only (`Object.hasOwn`).
   Tests added: prototype-property kinds return no dose; on stand-in tables, an empiric row never
   takes a prophylaxis line (Codex's surviving reverse-fallback mutation); and every indication
   drug's dose line equals its source row's, marked exactly when it is a fallback (the surviving
   per-drug special-case mutation). Four mutations were planted in `dosing.js` and each failed the
   tests: no fallback (4 failures), reverse fallback (3), an unmarked `doseLine` (2) and the old
   prototype lookup (1). 153 tests and the verifier pass.

**Clinical values newly on prophylaxis rows**, for a physician to check against page 4: Doxycycline
100 mg IV or PO/per tube Q12H; Linezolid 600 mg IV or PO/per tube Q12H; Clindamycin 900 mg IV Q8H;
Cefepime 2 g IV Q8H. They were already shown on empiric rows and in the empiric table.

The fixes were checked by the tests and in the preview, not re-reviewed by Codex.

## Later the same day

Thiago asked for the two items left for him ("make changes 1 and 2 you suggested"). Item 1: the
pill now reads "· empiric table · no OR redose listed". Item 3's blurbs: Trauma and EGS now count
the drugs that take the empiric table's line, and a test keeps the counts equal to the data. That
delta had its own review before the deploy.

### Review of that delta (Codex, single engine)

`codex exec`, `gpt-6-astra`, high, Codex v0.162.1, header `sandbox: read-only`, against HEAD
`6aadbc8`. The packet held the diff and the full text of `dosing.js`, `shared.jsx`, `pmg.js`,
`pmg.test.js`, `search.js` and `IndicationsView.jsx`, with "do not use any tools"; Codex's
receipt line matched the four line counts, and its log shows no tool calls.

**No findings.** One limit it named was closed: the count test now fails outright, rather than
expecting "undefined", if a section ever has more drugs than its word list covers.

#### Codex's response (verbatim)

PACKET RECEIVED: dosing.js 78 lines; shared.jsx 557 lines; pmg.js 1053 lines; pmg.test.js 461 lines.

No findings in the current delta. The supplied code consistently adds both fallback notes, and the two blurb counts agree with the embedded data. Review was static and limited to this packet; no tools were used, and no tests or previews were run.

## Checks A-G

**A. Old export references — no findings.**

Checked the embedded imports, exports and usages, as well as the supplied grep. `dosing.js:47` exports `FALLBACK_NOTES`; `shared.jsx:5` imports it; `shared.jsx:480` and `dosing.js:76` use it. No current embedded code references the singular export. Singular references in the removed diff lines are expected.

**B. Unmarked fallback paths — no findings in the embedded code.**

Checked these paths:

- **Pills:** `shared.jsx:474` renders the empiric dose line, and its `src.fallback` branch appends both notes.
- **Plates:** `DrugDose`, at `shared.jsx:347`, retains its equivalent prose disclosure of both the empiric source and absence of an OR redosing interval. It intentionally does not use the two literal pill strings.
- **Search:** `search.js:69` indexes `doseLine`, which appends both notes at `dosing.js:76`.
- **Tests:** `pmg.test.js:292` and the four explicit expectations at lines 304–307 require both notes.
- **IndicationsView:** collapsed preferred drugs use `DrugPills`; collapsed and expanded alternatives use `AlternativePills`, which delegates to `DrugPills`; expanded preferred drugs use `Regimen`, which delegates to `DrugDose`. Each receives `section.kind`. Hiding section blurbs during search does not remove the dose-level disclosures.
- **Open-fracture components:** `OrderLine` and `RegimenInline` render explicit regimen data, not fallback lookups, so they do not require fallback notes.

The row caption identifies fallback drugs and both tables; it does not independently display a dose line. Other view implementations, including the By-drug and dosing views, were not supplied, so their complete integration cannot be checked.

**C. Counts — no findings.**

I compared the union of preferred drugs and flattened alternative options against both dosing tables.

The prophylaxis table (`pmg.js:588–595`) contains eight distinct drugs: Ampicillin-sulbactam, Cefazolin, Ceftriaxone, Ciprofloxacin, Levofloxacin, Metronidazole, Piperacillin-tazobactam and Vancomycin.

| Section | Distinct drugs across both columns | Absent from prophylaxis, present in empiric | Blurb comparison |
|---|---|---|---|
| Trauma | Cefazolin, Metronidazole, Levofloxacin, Vancomycin, Ceftriaxone, Doxycycline | **Doxycycline** | **1**, matching “one drug” |
| EGS | Ceftriaxone, Metronidazole, Levofloxacin, Cefazolin, Piperacillin-tazobactam, Linezolid, Clindamycin, Vancomycin, Cefepime | **Linezolid, Clindamycin, Cefepime** | **3**, matching “three drugs” |
| Elective | Cefazolin, Vancomycin, Metronidazole | None | **0**, matching the absence of a fallback clause |

Trauma’s Doxycycline occurs in the open-face-fracture alternative (`pmg.js:242`). EGS’s Linezolid occurs in the NSTI-debridement preferred column (`pmg.js:341`); Clindamycin and Cefepime occur through `NSTI_ALTERNATIVE` (`pmg.js:122–125`, used at line 342). Their empiric rows appear at lines 629, 633, 634 and 637.

There is **one empiric section**. Its indication drugs all have empiric-table entries, so none uses a fallback. Some are absent from the prophylaxis table, but that is irrelevant to their matching-table lookup. Its unchanged blurb at `pmg.js:107` describes the empiric source without a fallback count. The distinct fallback total across Trauma and EGS is four.

**D. New test — no current-data findings; bounded coverage.**

At `pmg.test.js:258–265`, exact equality catches a wrong count, a missing fallback clause, an absent blurb, or an added count on Elective. A prophylaxis section with zero fallbacks must have exactly the base sentence ending in a period. Changes in distinct fallback membership that change the count change the expected blurb.

Specific limitations checked:

- **`i.preferred` filter:** the new test alone would skip a row with a falsy preferred field and populated alternatives. However, the existing shape test at lines 44–49 rejects that state: null preferred requires null alternatives, and other preferred values must be nonempty arrays. It does not omit any valid current row.
- **`WORDS`:** entries 1–5 correctly represent their indexes. For `n > 5`, the expectation would contain literal `undefined`; a blurb containing that same malformed wording could pass this test alone. A properly worded “six drugs” would fail. This is a future extensibility limitation, not a current false pass: counts are 1, 3 and 0, and the existing lookup test also pins the complete fallback set to four drugs.
- **Shared helper:** the count uses production `fallbackDrugs`, so it is not an independent implementation. The existing lookup test at lines 215–245 separately checks that helper against table membership and pins both affected rows.
- **Exact equality:** this strongly prevents wording drift but also rejects harmless rephrasing. It verifies the prescribed string, not clinical meaning.
- **Empiric blurbs:** excluded by design; this test would not catch an incorrect count added to an empiric blurb.
- **Rendered output:** neither this test nor the test named “dose lines read as the pills show them” renders React. They cannot independently catch a future JSX omission of a note.

**E. Keys and whitespace — no findings.**

`Fragment` is imported at `shared.jsx:1`, and the mapped fragment itself carries `key={n}`. The two current note strings are distinct, so their sibling keys are unique; reusing them in separate pills is valid.

Each fragment begins with an explicit `{" "}`, and each span begins with `· `, producing spaces before both separators. `doseLine` likewise prepends ` · ` to each note. Fragments add no DOM wrapper. The inline-block spans allow each note to move to another line as a unit when space permits; they do not force each note onto its own line.

**F. Data changes — no findings.**

The supplied diff changes only `pmg.js:72` and `pmg.js:82`: the Trauma and EGS blurb strings. No drug, dose, route, frequency, redosing interval, infusion time, duration, indication assignment or other data value changes. No other data-file diff is present. The blurbs themselves are changed clinical-facing wording and are flagged below.

**G. Other checks — no additional findings, with verification limits.**

- **Search:** the longer line adds searchable words such as “listed” and “no”; queries containing those words can gain matches. This follows the existing visible-text indexing policy. The added suffix does not remove the existing dose or frequency text. No failure of the embedded search assertions is apparent from inspection.
- **Accessibility:** both notes remain ordinary accessible text, in order, with explicit spaces. Neither is hidden or overridden by an accessible label. Actual screen-reader pronunciation was not tested.
- **Mobile layout:** the existing wrapping containers and separate inline-block notes support wrapping. No definite clipping regression is established by the packet, but 320–375px rendering cannot be verified without the full styles, fonts and a rendered preview.
- **Tests:** no delta-induced failure is apparent. The supplied test file contains 22 top-level tests, including one newly added test. Imported files and the full suite are not all supplied, so execution success cannot be established.
- **Docs:** the fallback wording, section counts and four-drug total agree with the code. HISTORY’s “153 tests” describes the preceding work; this delta adds one test, implying 154 if that prior total was accurate and the suite is otherwise unchanged. The claimed preview checks and prior review/deployment chronology cannot be independently verified from the packet.
- **Secrets:** no findings. Nothing resembling a credential or private secret appears in the supplied content.

## CLINICAL FLAGS

These are **flagged as unverifiable from code, not as suspicious**. The source PDF is not embedded, so this review does not verify clinical accuracy or fidelity to that PDF.

Changed clinical-facing wording:

- `src/lib/dosing.js:47`, rendered through `shared.jsx:480`: **“· empiric table · no OR redose listed”**
- `src/data/pmg.js:72`: **“Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table; one drug it does not list, from the empiric table.”**
- `src/data/pmg.js:82`: **“Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table; three drugs it does not list, from the empiric table.”**

Affected expected dose lines, quoted verbatim from the changed tests; their dose, route and frequency portions are unchanged:

- Linezolid, `tests/pmg.test.js:304`: **“600 mg IV or PO/per tube Q12H · empiric table · no OR redose listed”**
- Clindamycin, `tests/pmg.test.js:305`: **“900 mg IV Q8H · empiric table · no OR redose listed”**
- Cefepime, `tests/pmg.test.js:306`: **“2 g IV Q8H · empiric table · no OR redose listed”**
- Doxycycline, `tests/pmg.test.js:307`: **“100 mg IV or PO/per tube Q12H · empiric table · no OR redose listed”**

Related clinical assertions in the changed comment/documentation:

- `src/lib/dosing.js:44`: **“the frequency is not an OR redosing interval”**
- `CLAUDE.md:48`, repeating the unchanged plate disclosure: **“From the empiric dosing table (not in the prophylaxis table). The PMG gives it no OR redosing interval.”**
