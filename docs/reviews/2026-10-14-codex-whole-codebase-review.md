# Codex whole-codebase review — v0.7.10, 2026-10-14

The Codex half of "a max codex and gemini review" (Gemini's half:
`2026-10-14-gemini-whole-codebase-review.md`). It is a review of the whole codebase at `7cc08d2`
(tag v0.7.10, clean tree), not of a diff, and it ran on the same code as Gemini's: the code before
any v0.7.11 fix.

## How it was run

- Codex CLI 0.162.1, `gpt-6-astra`, `codex exec --sandbox read-only -c model_reasoning_effort="max"`,
  run from the session scratchpad (an untrusted folder). The header confirmed `sandbox: read-only`
  and `reasoning effort: max`. The first attempt, at 16:18, was refused for the usage limit; this
  run started at 20:39, after the reset, and finished at 20:55, using 164,216 tokens. The transcript
  shows no tool call.
- One 409,524-byte packet on stdin. It held all 44 reviewable files with line numbers (everything
  but binaries, `package-lock.json` and `docs/`), `CLAUDE.md` in full and the README. It also held
  the PDF's text extraction for pages 1–5 and 12. Every file block's line count was checked against
  its source before sending. Codex's receipt lists every file with the right line count and last
  line, and the last line of the extraction.
- Gemini ran first, and the fixes for its findings were being written while this ran. Codex was not
  told what Gemini had found.

**Nothing below was dismissed or softened.** Verbatim answer, then dispositions.

---

## Codex (verbatim)

| File | Stated lines | Last line |
|---|---:|---|
| src/data/pmg.js | 952 | `};` |
| scripts/verify-pmg.mjs | 642 | `}` |
| .claude/launch.json | 56 | `}` |
| .claude/npm-run.cjs | 11 | `child.on("exit", (code) => process.exit(code == null ? 1 : code));` |
| .claude/variant-dev.cjs | 29 | `child.on("exit", (code) => process.exit(code == null ? 1 : code));` |
| .firebaserc | 5 | `}` |
| .gitattributes | 10 | `*.ico binary` |
| .github/workflows/ci.yml | 26 | `      - run: npm run build # tests, then verify-pmg against the PDF, then vite build` |
| .gitignore | 39 | `/*.png` |
| README.md | 194 | ``5. `npm run deploy`, tag.`` |
| firebase.json | 20 | `}` |
| index.html | 56 | `</html>` |
| package.json | 36 | `}` |
| postcss.config.js | 6 | `};` |
| scripts/gen-icons.mjs | 85 | `console.log("done.");` |
| src/App.jsx | 144 | `}` |
| src/components/BottomNav.jsx | 48 | `}` |
| src/components/DosingView.jsx | 91 | `}` |
| src/components/DrugsView.jsx | 185 | `}` |
| src/components/FeverWorkupView.jsx | 136 | `}` |
| src/components/Footer.jsx | 26 | `}` |
| src/components/Header.jsx | 169 | `}` |
| src/components/IndicationsView.jsx | 472 | `}` |
| src/components/OpenFracturesView.jsx | 200 | `}` |
| src/components/PdfButton.jsx | 267 | `}` |
| src/components/PdfCanvasViewer.jsx | 281 | `}` |
| src/components/SourceView.jsx | 165 | `}` |
| src/components/ThemeToggle.jsx | 21 | `}` |
| src/components/VerificationNotice.jsx | 24 | `}` |
| src/components/shared.jsx | 453 | `}` |
| src/index.css | 332 | `}` |
| src/lib/route.js | 62 | `}` |
| src/lib/search.js | 95 | `}` |
| src/lib/text.js | 24 | `  typeof text === "string" ? text.replace(NUMBER_UNIT, "$1\u00A0").replace(SIGN_NUMBER, "$1\u00A0") : text;` |
| src/lib/theme.js | 51 | `}` |
| src/main.jsx | 79 | `);` |
| tailwind.config.js | 106 | `};` |
| tests/pdf-link.test.js | 101 | `});` |
| tests/pmg.test.js | 194 | `});` |
| tests/text.test.js | 69 | `});` |
| tests/theme.test.js | 364 | `});` |
| tests/type.test.js | 117 | `});` |
| tests/verify-controls.test.js | 221 | `  expectFail("filename", (d) => (d.source.file = "MU-ACS-Antibiotic-PMG-2025-12.pdf"), "content hash"));` |
| vite.config.js | 71 | `});` |
| CLAUDE.md — project-instructions block | Not stated; unnumbered | ``Full changelog: `docs/HISTORY.md`.`` |

PDF extraction’s last line: `[y=29 x=301] 11`

All 44 numbered file blocks and the unnumbered instructions reached me; nothing appears truncated. No tools were used. The mutations below are static counterexamples to the guards, not assertions that those corruptions are currently deployed.

1. **High — `src/components/DrugsView.jsx:93`: The By-drug view omits the perforated-peptic-ulcer regimen’s antifungal qualifier.**

   Its complete primary-use rendering is `render={(ind) => <RegimenInline regimen={ind.regimen} emphasize={d.name} />}`. It never renders `ind.regimenNote`.

   **Failure:** Open `#/drugs/Piperacillin-tazobactam` and read the perforated-peptic-ulcer entry: only its drug tuple appears. Both the supplied PDF text and `src/data/pmg.js:349` include “+/- Antifungal Coverage in high risk/immunocompromised patients.” The indication’s expanded view renders that qualifier at `IndicationsView.jsx:451`, so the two lookup paths present different amounts of clinical information.

2. **High — `src/main.jsx:32`: Unconditionally swallowing the first service-worker claim can leave an older clinical bundle running indefinitely under a newer worker.**

   The handler executes `if (!sawInitialClaim) { sawInitialClaim = true; return; }`, without establishing that the claiming worker belongs to the loaded app version.

   **Failure:** An uncontrolled first visit loads version A; version B deploys before its first worker finishes registering/installing; B claims the page. The handler skips reloading, leaving A’s rendered data. Subsequent hourly/resume checks find B already current, so they produce no further controller change and cannot repair this stale page.

   This depends on the standard service-worker lifecycle and the configured `clientsClaim`/automatic activation behavior. **Confidence: high**, but the generated worker was not supplied or executed.

3. **High — `src/lib/search.js:34`: Spaced negative terms cannot retrieve their matching rows because tokenization separates the negation that matching subsequently rejects.**

   Hyphenated words become joined words at line 19, while `tokens()` splits spaces. `matches()` then rejects a match when `NEGATION_PREFIXES.includes(prefix)`.

   **Failure:** Searching **“non purulent”** produces tokens `non` and `purulent`; the latter is rejected inside `nonpurulent`. The non-purulent cellulitis row has no other occurrence to satisfy it and disappears. **“non operative”** similarly loses the closed/non-operative face-fracture row.

   This contradicts the explicit promise at lines 6–7. `tests/pmg.test.js:150` checks joined and hyphenated forms, but never the promised spaced form.

4. **High — `scripts/verify-pmg.mjs:402`: The truncated-label exception accepts any name for `complicated-uti`, without checking a prefix or the approved completion.**

   The fallback is simply `return printed != null && norm(printed) === nameText;`; it does not inspect `ind.name`.

   **Failure mutation:** Change that entry’s `name` and `short` to `"Neonatal meningitis"`, leaving its ID, aliases and regimen unchanged. Its original PDF row still matches through the ID exception, and the short-label test accepts the new label because it compares against the equally changed `name`. Existing search assertions remain satisfied through the retained aliases.

   The resulting screen attributes the existing UTI regimen to a different indication while these guards accept it.

5. **High — `tests/pmg.test.js:67`: The display-label guard explicitly permits reversing clinical qualifiers while claiming to prevent labels being attached to another regimen.**

   `STOP_WORDS` includes `"with"`, `"without"` and `"non"`; line 79 accepts those words without checking the source name.

   **Failure mutation:** Swap the two SBO entries’ `short` labels, leaving their `name`, ID and clinical fields intact. Both short labels pass the word-membership test, the PDF verifier deliberately ignores them, and the SBO search test still returns the same two IDs.

   The visible “without necrosis…” label would then carry the source’s “with necrosis…” regimen and duration, and vice versa.

6. **High — `scripts/verify-pmg.mjs:109`: Prose normalization erases decimal points and range separators, allowing materially different numeric expressions to compare equal.**

   `loose()` applies `.replace(/[^a-z0-9/<>≥≤*+%\s]/g, " ")`.

   **Failure mutation:** In the vancomycin dosing-table maximum, change `"1.5g/dose"` to `"1–5g/dose"`. Both normalize to `"1 5g/dose"`, so the dosing comparison at lines 575–580 accepts the change. The view prints the changed expression, and the shape tests impose no numeric grammar on these cells.

   This is a comparison defect, not a judgment about either expression’s clinical appropriateness.

7. **High — `scripts/verify-pmg.mjs:318`: Deduplicating whole frequency strings permits an ambiguous combined frequency to be assigned to both drugs.**

   The verifier collects unique `r.frequency` strings and compares `frequency: freqs.join(" ")`, rather than validating each displayed drug-frequency association.

   **Failure mutation:** Set both abdominal-trauma regimen entries’ frequencies to `"Q8H Q12H"`. The unique-frequency list now contains one string whose joined value still equals the PDF frequency cell, `"Q8H Q12H"`.

   Both drugs would display both frequencies. The shape test only requires a nonempty frequency string, and the existing changed-frequency control does not exercise this escape.

8. **High — `scripts/verify-pmg.mjs:465`: Phrase containment accepts clinically incomplete timing rules and footnotes as verified whole statements.**

   `hasPhrase()` returns success on an embedded phrase with word boundaries; it does not require the complete source statement. Timing uses it through `must()`, and footnotes use it directly at line 583.

   **Failure mutations:** Shorten `openFractures.timing` to `"Administer within 30 min of arrival to the ED"`; the MRSA-screen clause disappears from the always-visible timing card, but the retained prefix passes. Likewise, shortening the renal footnote to `"Pharmacy to dose adjust"` passes while removing `"per renal dosing protocol"`.

   Neither mutation is covered by the controls: the timing control blanks the entire field, which tests a different condition.

9. **High — `scripts/verify-pmg.mjs:547`: Classification verification checks either a description or subtypes, whereas the view renders both.**

   The expected value is selected with `t.description ? t.description : subs.map(...)`. In contrast, `OpenFracturesView.jsx:163` renders `t.description` and then independently renders `t.subtypes`.

   **Failure mutation:** Add a `subtypes` array to Type I containing a copy of the existing IIIC description. Verification continues comparing only Type I’s unchanged description; the view additionally prints the IIIC material under Type I.

   The claimed structural assertions do not reject this combination, and the data tests do not validate classification shape.

10. **High — `scripts/verify-pmg.mjs:538`: Equal counts followed by unrestricted `find()` do not establish a bijection for classification rows or page-5 reference links.**

    Classification uses `typeRows.find(...)` at line 542 without consuming the match. Page-5 links use the same pattern at line 591 after comparing counts.

    **Failure mutations:** Replace the Type II data object with a duplicate of Type I. Three objects remain, each finds a matching PDF row, and Type II disappears from the interface without a verification error. Similarly, replace the CAUTI reference-standard object with a copy of the pneumonia object: three links remain, but the CAUTI link is missing.

    Both are omissions the current length checks cannot detect.

11. **Medium — `src/components/OpenFracturesView.jsx:89`: The closed antimicrobial card exposes starred regimens while hiding their only footnote explanations in an inert panel.**

    The preview renders `<RegimenPills ... />`, but the explanations reside inside the collapsible body at line 114. `shared.jsx:151` applies `inert` and `aria-hidden` while that body is closed.

    **Failure:** On a fresh Fractures visit, the reader can read the cefepime and vancomycin pills and their footnote marks, but cannot see or access the associated renal-adjustment and full pharmacy instructions without opening the card. Unlike the Dosing view, the visible medication presentation has no visible footnote explanations or direct footnote controls.

12. **Medium — `src/components/DrugsView.jsx:15`: The By-drug index omits drug uses expressed in duration notes.**

    It indexes only `i.regimen`, `altText(i)`, fracture regimens and dosing rows. It does not inspect duration text.

    **Failure:** The abdominal-trauma duration contains “consider monotherapy Zosyn” (`pmg.js:98`), and the search index explicitly retrieves that row for Zosyn. Opening Piperacillin-tazobactam in By drug never lists that occurrence, and its use count excludes it.

    The two drug-lookup paths therefore disagree about whether this indication names the agent.

13. **Medium — `tests/pmg.test.js:103`: The allergy-row test proves that an ID exists, but not that it identifies the allergy regimen.**

    Its assertion is only `.some((a) => a.id === "pcn-allergy")`; the view highlights whichever row satisfies `a.id === ALLERGY_ID`.

    **Failure mutation:** Swap the IDs of the `type-1-2` and `pcn-allergy` antimicrobial objects. The PDF’s label/text comparisons still pass, and the existence assertion remains true. Switching on PCN Allergy then highlights the Type I & II cefazolin row instead of the row labelled “If penicillin allergy.”

14. **Medium — `src/components/PdfButton.jsx:122`: Locally closed viewer entries can accumulate across route changes, exceeding the accepted single dead Back press.**

    `requestBack()` returns false while `pending` exists; `close()` then closes locally. `enterViewerEntry()` only reuses a viewer entry when it is the **current** entry.

    **Failure:** Close one viewer normally, reopen and close within 1.5 seconds, then navigate to another app route. The abandoned entry remains behind that navigation. After the settling window, repeat the sequence on the second route. History now contains two abandoned viewer entries, producing two dead Back presses during traversal. The same policy runs in installed mode.

    This assumes normal `pushState` and hash-navigation history behavior. **Confidence: high**; browser execution is needed to confirm the precise event sequence.

15. **Medium — `scripts/verify-pmg.mjs:609`: Reference verification accepts prefixes instead of requiring complete numbered entries.**

    The check is `flat12.includes(whole)`, and `printedUrl` becomes empty when the data URL is absent.

    **Failure mutation:** Set reference 12’s text to `"Vanderbilt University Medical Center"` and delete its URL. `"12.VanderbiltUniversityMedicalCenter"` remains a substring of the extracted reference, so verification succeeds while the Source page loses the title, year and link.

    Numbering and reference-count tests remain satisfied; the controls do not test shortening an entry or dropping its URL.

16. **Medium — `tests/pdf-link.test.js:32`: The PDF-reference guard misses ordinary import aliases, despite its stated alias protection.**

    `PDF_REFERENCE` recognizes `pdfHref`, specifically named `source.file`, and literal `.pdf` strings.

    **Failure mutation:** In Header, add `import { source as pmgSource } ...` and `<a href={"/" + pmgSource.file}>PDF</a>`, retaining the existing `PdfButton`. No recognized reference or literal `.pdf` path appears, and the existing viewer-presence assertion still passes.

    This reintroduces the exact installed-app navigation trap the test claims to prevent. Destructuring `file` from `source` creates another ordinary escape.

17. **Medium — `src/components/DrugsView.jsx:35`: Navigation from a regimen’s drug button scrolls the destination but never transfers keyboard focus to it.**

    The effect calls only `el.scrollIntoView(...)`. The originating button in `shared.jsx:314` unmounts when App switches views.

    **Failure:** Activate a drug name with the keyboard from an expanded indication. The selected drug opens and scrolls into view, but the focused control is removed; focus falls back to the document instead of reaching that drug’s control. Subsequent keyboard navigation restarts away from the visible destination.

    This depends on standard focus behavior when a focused node is removed. **Confidence: high**.

18. **Low — `tests/pmg.test.js:189`: The correction-mirroring test checks only listed corrections, so removing a disclosure leaves the build green.**

    It loops through `pmg.transcription.corrections` and checks normalization equality, without checking that every verifier correction has a corresponding disclosure.

    **Failure mutation:** Delete the `"Ertapenum" → "Ertapenem"` correction object. `TYPO_MAP` continues accepting that correction, but the Source page no longer discloses it. The dedicated cefepime assertion protects only that particular correction.

    This violates the explicit “add to both or to neither” invariant.

19. **Low — `scripts/verify-pmg.mjs:612`: DOI URLs are excluded from the annotation check that the documentation says covers every reference URL.**

    The condition explicitly requires `!ref.url.startsWith("https://doi.org/")` before checking annotation targets.

    **Failure mutation:** Change a reference’s DOI annotation destination in a new PDF while leaving its printed DOI unchanged, and update the source hash and filename accordingly. The printed-text comparison still succeeds, and the changed annotation is never checked.

    The README’s “each URL must be a link annotation” claim and the verifier’s corresponding header comment therefore overstate this protection.

**Clinical items flagged as unverifiable:** I found no additional substantive transcription difference in the readable extraction beyond the disclosed corrections below. That is textual comparison, not confirmation of any clinical value.

- **Page-5 flowchart:** Its trigger, criteria, actions, thresholds and branching cannot be checked against this extraction. The four accepted physician decisions remain outside independent verification here: merged hypotension criterion, added “culture,” changed UA/antibiotic sequence with the later culture step, and omitted orphan asterisk.
- **App-authored material:** Short labels, search aliases, drug brands/classes and section descriptions cannot be established from the PDF extraction alone.
- **Source integrity and links:** PDF bytes, rendered pages and link annotations were not supplied; hashes, visual transcription and annotation destinations cannot be independently confirmed.
- **External material:** The linked antibiogram’s current contents and pages 6–11 were not checked.

These are the disclosed source/data differences, recorded without treating them as defects:

| Location | PDF text | Data text |
|---|---|---|
| Trauma redose | “transfustion” | “transfusion” |
| EGS indication | “Nectrotizing Soft Tissue Infection” | “Necrotizing Soft Tissue Infection” |
| Diverticulitis alternatives | “Ertapenum” | “Ertapenem” |
| HAP/VAP duration | “7days” | “7 days” |
| Skin & Soft Tissue redose | “Every 4 hour” | “Every 4 hours” |
| Purulent cellulitis dose | “Pharmacy to dos” | “Pharmacy to dose” |
| Complicated UTI name | “Complicated Urinary Tract Infection/CAUTI/Urologic Instr” | “Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation” |
| Both open-fracture cefepime bullets | “Cefepime* 2g q8 hours” | “Cefepime* 2g IV q8 hours” |

**Checked and found fine within this static review:**

- The remaining readable indication fields and open-fracture/dosing statements revealed no additional substantive transcription discrepancy.
- The independent penicillin-allergy row, both added cefepime IV routes and the nested UTI later step implement the stated decisions.
- The PCN toggle highlights alternatives without replacing the primary regimen or filtering rows.
- Search-query changes reset search-specific collapse overrides; clearing search restores the reader’s normal section choices.
- Expand-all logic covers the displayed sections and expandable rows, including narrow-search overrides.
- Cold indication links open their section before scrolling; header and section-head measurements account for sticky content.
- OpenCards preserves other tabs’ expanded state across tab changes.
- Current PDF links are confined to the viewer’s browser branches; installed-mode rendering omits those links.
- Normal viewer cleanup restores root interactivity and body overflow, removes listeners and cancels timers.
- The PDF loader disables range requests, bounds teardown waiting and distinguishes later-page failures from initial loading failures.
- The workup image disclosure, Source physician disclosure and Dosing footnotes remain outside their collapsible panels.
- Theme initialization, storage-error handling, token definitions and theme-color constants agree in the supplied code.
- Number/unit helpers alter spaces only; the text tests walk the nested data rather than checking only selected examples.
- Print rules restore collapsed content visually, remove sticky positioning and force legible text and plate borders.
- Build/deploy scripts gate production on tests and verification; CI builds without deploying.
- Hosting has no catch-all rewrite, and the worker fallback excludes asset paths and dotted filenames.
- No user-controlled HTML insertion, exposed credential or unexpected external runtime service appears in the supplied source.
- Preview wrappers, icon-generation paths and LF/binary attribute rules revealed no additional defect.
---

## Dispositions (Claude, separate from the review)

Checked against `7cc08d2`. "Planted" means the edit was made to a clone of the data and run through
the real verifier, first the committed one and then the v0.7.11 one. The committed one was run from
a temporary copy, deleted afterwards. Each planted edit below **passed the committed verifier** and
is a permanent control in `tests/verify-controls.test.js` now. Nothing was dismissed; one finding is
left for Thiago and one is recorded as a residual.

| # | Codex | Verdict | Fixed in v0.7.11 |
|---|---|---|---|
| 1 | High | Confirmed in the app: By drug showed the perforated-ulcer pip-tazo tuple without "+/- Antifungal Coverage in high risk/immunocompromised patients". | Rendered under the pills, as on the indication card. |
| 2 | High | Confirmed by reading `main.jsx`: if a deploy lands between a first visit's page load and its worker's install, the newer worker claims an older page, and the first claim is never reloaded. A narrow window, and the next launch is current. | On the first claim the page fetches the worker's `index.html` and reloads only if its entry bundle differs. A first visit to the production build, behind the real worker, was controlled with no reload (one navigation; a marker on `window` survived). The mismatch branch was not exercised. |
| 3 | High | Same as Gemini 3.1. | Fixed (see the Gemini record). |
| 4 | High | Planted (`complicated-uti` renamed "Neonatal meningitis"): **passed**. | `TRUNCATED_LABELS` pins the completed name. |
| 5 | High | Same as Gemini 1.1; the SBO swap is among the new test's controls. | Fixed. |
| 6 | High | Planted ("1.5g" → "1–5g" in vancomycin; "13.3" → "13–3" in metronidazole): **both passed**. `loose("1.5g")` was "1 5g". | `loose()` keeps a point or dash between digits. |
| 7 | High | Planted (both abdominal-trauma frequencies "Q8H Q12H"): **passed**. | Each frequency must be a single one (`Q\d+H`, `One-time dose`, `Pharmacy to dose`). |
| 8 | High | Same as Gemini 2.1. | Fixed. |
| 9 | High | Planted (Type I given a subtype): **passed**. | Description and subtypes are compared together. |
| 10 | High | Planted (Type II as a copy of Type I; a page-5 link entry copied over another): **both passed**. | Each PDF row and link is used once. |
| 11 | Medium | True: the closed Antimicrobial-by-type card (v0.7.10) shows the `*` and `**` marks, and their footnotes are only inside the panel. | **Not changed: Thiago's call.** v0.7.10's pills were his design; showing the footnotes on the closed card would change it. |
| 12 | Medium | Confirmed: abdominal trauma's duration names Zosyn; search finds it, By drug did not. | A "Named in the duration of" list (generic or brand), counted in the uses. |
| 13 | Medium | True. | The test now requires the row labelled for penicillin allergy to be the one with that id. |
| 14 | Medium | Confirmed by reading `PdfButton.jsx`: each reopen-and-close inside the 1.5 s window leaves an entry, and a route change in between stops the next open reusing it, so dead Back presses can add up. The policy is the same in the installed app. `CLAUDE.md` said "never more than one" and "none of it applies in the installed app". | **Documented, not changed.** `CLAUDE.md` and the code comment now say what happens. Changing the history policy needs testing on a phone, and is Thiago's call. |
| 15 | Medium | Same as Gemini 2.3. | Fixed. |
| 16 | Medium | Same as Gemini 5.4; the import alias is one of the new controls. | Fixed. |
| 17 | Medium | Confirmed by reading the code: the focused drug button unmounts with its view and nothing moves focus. Not reproduced before the fix. | DrugsView focuses the drug's button after scrolling to it; checked in headless Chrome (focus on `#drug-metronidazole`'s button). |
| 18 | Low | Same as Gemini 1.5. | Fixed. |
| 19 | Low | True as wording: the PDF prints its three DOIs without link annotations (page 12 has two links, both web URLs), so the exclusion is right and the README and the verifier's header overstated it. | Wording fixed in both. |

**Clinical items.** Codex found no transcription difference beyond the eight disclosed corrections,
which it listed. That is a text comparison by one model, not a physician's read. Page 5 remains
unverifiable by machine; v0.7.11 pins it by hash so an edit fails the build.

**What neither review covered.** Both reviews ran on `7cc08d2`, before any fix. The v0.7.11 changes
got their own pre-commit review (`2026-10-14-codex-v0711-review.md`).
