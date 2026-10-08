# Codex peer review — rulings on the PDF cross-check, notice removed (v0.7.5), 2026-10-08

Single-engine review of this diff by Codex; Gemini reviewed the same diff separately
(`2026-10-08-gemini-v075-review.md`). Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec
--sandbox read-only` (header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by
the `codex-review` bridge agent.

- **Scope:** the uncommitted diff against `317178a` (11 files) plus 24 whole files with line
  numbers, 389 KB on stdin; Codex's receipt matched every line count and last line. Packet-only,
  no tools. HEAD and `git status` unchanged afterwards.
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; dispositions at
  the end.

---

RECEIPT

```text
src/data/pmg.js | 936 lines | last: };
src/App.jsx | 115 lines | last: }
src/components/IndicationsView.jsx | 490 lines | last: }
src/components/VerificationNotice.jsx | 24 lines | last: }
src/components/Header.jsx | 169 lines | last: }
src/components/SourceView.jsx | 167 lines | last: }
src/components/Footer.jsx | 26 lines | last: }
src/components/FeverWorkupView.jsx | 103 lines | last: }
src/components/shared.jsx | 350 lines | last: }
src/components/BottomNav.jsx | 48 lines | last: }
src/index.css | 329 lines | last: }
index.html | 56 lines | last: </html>
vite.config.js | 71 lines | last: });
package.json | 36 lines | last: }
tests/type.test.js | 117 lines | last: });
tests/theme.test.js | 366 lines | last: });
tests/pmg.test.js | 161 lines | last: });
tests/text.test.js | 69 lines | last: });
tests/pdf-link.test.js | 101 lines | last: });
README.md | 192 lines | last: 5. `npm run deploy`, tag.
CLAUDE.md | 380 lines | last: Full changelog: `docs/HISTORY.md`.
docs/HISTORY.md | 419 lines | last:     introduction paragraphs, heading punctuation) and Gemini's.
docs/reviews/2026-10-08-codex-pdf-crosscheck.md | 286 lines | last: **Thiago's rulings (2026-10-08, v0.7.5).** F1: keep "Unexplained hypotension". F2: keep "culture". F3: "make > 10 WBC --> start empiric antibiotics and repeat UA if >2 squamous cells" (done; the "<100,000 CFU/mL" outcome is unchanged). F5: leave out the asterisk. A1, A2, A7: "look good". A3: "that assumption is correct". A4: "is correct". He then asked for the pending-verification notice to be removed (done) and the Indications intro shortened (done). The Medium and Low findings were not ruled on and nothing else in `src/data/pmg.js` changed. See `docs/HISTORY.md`, v0.7.5.
docs/reviews/2026-10-08-gemini-pdf-crosscheck.md | 292 lines | last: **Thiago's rulings (2026-10-08, v0.7.5).** F1: keep "Unexplained hypotension". F2: keep "culture". F3: "make > 10 WBC --> start empiric antibiotics and repeat UA if >2 squamous cells" (done; the "<100,000 CFU/mL" outcome is unchanged). F5: leave out the asterisk. A1, A2, A7: "look good". A3: "that assumption is correct". A4: "is correct". He then asked for the pending-verification notice to be removed (done) and the Indications intro shortened (done). The Medium and Low findings were not ruled on and nothing else in `src/data/pmg.js` changed. See `docs/HISTORY.md`, v0.7.5.
```

Last file header received: `=== FILE: docs/reviews/2026-10-08-gemini-pdf-crosscheck.md (292 lines) ===`

The final packet line was exactly `END OF PACKET`.

No tools used. This is a read-only review of the supplied text; I did not execute tests or inspect the PDF.

**Findings, most severe first**

1. **Medium — The rendered fever-workup provenance does not disclose the deliberate departure from the source.**  
   `src/components/FeverWorkupView.jsx:93–94` says:

   > “The steps above were read from the picture and cannot be checked by the verification script”

   But `src/data/pmg.js:733–735` explicitly records that the new instruction:

   > “replaces the drawn sequence”

   The clinician sees the revised sequence, while the explanation still attributes all steps to the picture. The physician-directed departures are documented only in code comments and repository documentation; `transcription.flags` does not disclose them either. This is a provenance issue, **not a judgment that Thiago’s instruction is clinically wrong**.

2. **Medium — The README overstates both automated and independent review coverage.**  
   `README.md:10–14` says:

   > “Every value was transcribed from the source PDF and is re-checked against it mechanically on every build”

   and:

   > “Codex and Gemini each checked the whole transcription against the PDF”

   The first statement excludes neither image-derived flowchart instructions nor app-authored metadata, despite the explicit exclusions at `README.md:168–170`. The second contradicts Gemini’s documented inability to check the flowchart (`docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:8–14,280–282`). `docs/HISTORY.md:395–398` correctly distinguishes their coverage. The prominent status statement gives broader assurance than those records support.

3. **Medium — The archived Gemini report contains unsupported assurances that its disposition leaves unqualified.**  
   `docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:216` says:

   > “Accurate description of the source image and threshold definitions”

   Yet the report explicitly received no images and could not check the flowchart. At line 227 it calls all thirteen drug metadata entries:

   > “pharmacologically accurate”

   Those pairings were not established by the supplied PDF material; the Codex report explicitly records that limitation at lines 200–218. These are historical, verbatim reviewer claims—not evidence of physician verification—but their unsupported assurances warrant an editorial disposition outside the preserved review. I am not judging any pairing or threshold.

4. **Low — The ruling records incorrectly say no Low findings were ruled on.**  
   Both review dispositions—Codex line 286 and Gemini line 292—say:

   > “The Medium and Low findings were not ruled on”

   `docs/HISTORY.md:401` introduces the decisions as:

   > “Thiago's rulings on Codex's High findings”

   But **F5 is Low**, explicitly labelled that way at Codex report line 41, and Thiago expressly ruled “F5 leave out the asterix.” The blanket statements also recur in substance at `docs/HISTORY.md:418–419`. F5 needs to remain an explicit exception; the other unresolved findings must not acquire an inferred ruling.

5. **Low — Editorial review status text remains contradictory after the appended dispositions.**  
   Codex report line 17 says:

   > “The pending-verification banner stays.”

   Gemini report lines 17–18 say the same. Codex lines 279–280 say:

   > “Pending Thiago's decisions (2026-10-08). `src/data/pmg.js` was not changed in response to this review.”

   Gemini line 288 likewise starts:

   > “Pending Thiago's decisions (2026-10-08)”

   Their appended v0.7.5 dispositions supersede these statements, but the earlier **editorial** status passages are not marked as prior/superseded. This creates documentation ambiguity, not a remaining rendered banner. The explicitly versioned historical banner statements in `docs/HISTORY.md`, and the README’s expressly historical v0.4.0 layout section, are correctly historical and are not findings.

6. **Low — A standing instruction overstates what the verifier detects.**  
   `CLAUDE.md:39–40`, after listing inconsistencies including page-5 thresholds, says:

   > “Changing them silently would make the verifier fail, which is the point.”

   The same document at lines 45–46 says page-5 text cannot be machine-verified. The blanket guarantee therefore includes values outside the verifier’s stated coverage. This is pre-existing, but it remains inaccurate guidance for future edits.

7. **Low — The README still names the obsolete unhashed public PDF path.**  
   `README.md:37` says:

   > `npm run verify     # re-check src/data/pmg.js against public/MU-ACS-Antibiotic-PMG-2025-12.pdf`

   The actual configured source at `src/data/pmg.js:38` is:

   > `MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf`

   The README’s command annotation conflicts with its own content-hashed source description. This is pre-existing.

8. **Low — Gemini’s coverage summary miscounts its listed open-fracture discrepancies.**  
   `docs/reviews/2026-10-08-gemini-pdf-crosscheck.md:270` says:

   > “4 minor label/punctuation discrepancies (Findings 12–16)”

   Findings 12 through 16 enumerate **five** distinct changes: timing prefix, Type III label, contamination label, debridement heading and femoral-shaft heading. The summary does not reconcile that list with its reported four discrepancies. This affects the audit record, not a demonstrated clinical value.

**Clinical strings touched — flagged for human verification against the PDF**

These flags identify clinical text touched by the diff. They do **not** mean the text is suspicious or establish clinical correctness. Repeated documentation quotations are consolidated below.

- **The sole changed runtime clinical value**, `src/data/pmg.js:792`:
  
  Old, from Part A:
  
  > “> 10 WBC → (repeat UA if >2 squamous cells) → start empiric antibiotics”
  
  New:
  
  > “> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells”

  The new wording implements Thiago’s specified replacement exactly apart from converting `-->` to `→`. The documented full instruction at `docs/HISTORY.md:404–405` preserves:
  
  > “the flow of things doesn't fit well; make > 10 WBC --> start empiric antibiotics and repeat UA if >2 squamous cells”

- **Clinical text newly quoted in the decision comments**, `src/data/pmg.js:729–736`, also repeated in the changed documentation:
  
  > “Unexplained hypotension”  
  > “Unexplained”  
  > “Hypotension”  
  > “with reflexive culture”  
  > “Obtain Urinalysis with Reflexive”  
  > “> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells”  
  > “Start empiric antibiotics”

  The comments additionally record:
  
  > “The repeat-UA box's asterisk is left out; the page has no footnote for it (F5).”

  `CLAUDE.md:49–52` repeats the shorter source quotation “with Reflexive” and describes the original ordering as “repeat UA before starting.” These are newly documented decisions/source descriptions; the corresponding F1, F2 and F5 runtime content did not change.

- **The Indications intro’s clinical-column description**, `src/components/IndicationsView.jsx:180–181`, with `ALT_LABEL` resolved to its unchanged value:

  Old rendered wording, from Part A:
  
  > “Regimen, dose, duration, redosing and the PMG's “PNC allergy / alternative” column for every indication. That column holds penicillin-allergy regimens but also contamination escalation and MRSA add-ons — read each note's condition. Tap a section to open it, then a row to expand it.”

  New rendered wording:
  
  > “Tap a section, then a row. The “PNC allergy / alternative” column also holds contamination escalation and MRSA add-ons — read each note's condition.”

- **Clinical descriptions touched only in documentation**:

  Removed wording in the `CLAUDE.md` diff:
  
  > “Trauma's redosing triggers, Elective's one-time dose and MRSA vancomycin”

  Added wording at `CLAUDE.md:163`:
  
  > “vancomycin added”

  Added description at `docs/HISTORY.md:408–409`:
  
  > “the elective vancomycin read as an add-on, in a code comment and the Elective blurb”

  These record the scope of rulings; they do not change the four runtime blurbs or any regimen.

- **The intentionally unchanged culture outcome**, quoted in abbreviated form by the new documentation, remains at `src/data/pmg.js:794`:

  > “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics”

  The documentation abbreviates it as “<100,000 CFU/mL … discontinue antibiotics” or “<100,000 CFU/mL”. Thiago’s replacement instruction does **not explicitly direct a change to this outcome**. The original F3 concern about its incoming connection remains distinct from the requested string replacement; neither its clinical meaning nor that connection is confirmed by this review.

**Results by requested check**

1. **pmg.js edit — no findings concerning instruction fidelity or unintended clinical-value changes.**  
   Part A changes exactly one runtime string and adds the decision comment block. No other drug, dose, frequency, duration, redose rule, alternative, criterion or cutoff changes anywhere in the diff. Clinical text is flagged above; the provenance issue is finding 1.

2. **VerificationNotice removal — no findings in runtime wiring, layout, offsets or print.**  
   `App.jsx` has neither its import nor its render. The retained component’s line 18 still contains “Transcription pending physician verification.” intentionally, but it is dormant. The supplied tests do not require it to render: type/theme tests still scan its retained source.

   Header height measures only `<header>` (`Header.jsx:33–45`); the removed notice was its scrolling sibling. Sticky section offsets, section-head measurement and deep-link scrolling therefore require no notice-height adjustment. Generic `.no-print` rules remain needed by other components. Finding 5 concerns editorial documentation only.

3. **Shortened intro — no findings.**  
   It retains contamination escalation, MRSA add-ons and the instruction to read each condition. That preserves the required safeguard and matches the repository’s description and Thiago’s A3/A4 rulings. It adds no dose or protocol paraphrase. The existing field label and pill title remain.

   Its unchanged `text-[13px]` is permitted; `border-rule`, `bg-chip`, `text-soft` and `text-ink` are theme tokens. The removed feature list remains represented by the expanded row’s Regimen, Duration, Redose and alternative fields. No supplied code or test relies on the old prose.

4. **Documentation accuracy — findings 2–6 and 8.**  
   The substantive F1/F2/F3/F5 and A1/A2/A3/A4/A7 rulings are represented faithfully. The updated release records do not explicitly claim Thiago verified the whole transcription. The categorical treatment of Low findings and the coverage assurances are the exceptions detailed above.

5. **Stale references — findings 1, 5 and 7.**  
   Package and lockfile versions agree at `0.7.5`; Vite supplies that version to the footer. Older version numbers are historical. The old F3 string in the preserved Codex review describes the reviewed earlier tree, and is not stale runtime data. Listing the retained notice component in the README’s file inventory is also accurate.

No additional demonstrable mobile, accessibility, print, PWA, Firebase or secret-exposure findings in the supplied text. This does not establish runtime behavior: the packet does not include the complete service-worker update implementation or Firebase configuration.
---

## Dispositions

- **1 (Medium), the fever-workup page does not disclose the departures from the drawn flowchart —
  put to Thiago.** Gemini raised the same point (its Finding 4, High). Whether the page should say
  so is his decision; not changed yet.
- **2 (Medium), README overstates coverage — fixed.** The status block now says what the verifier
  cannot read, that Gemini checked the text only, and that these were transcription checks.
- **3 (Medium), unsupported assurances in the archived Gemini report — fixed** by a note in that
  file's dispositions; the verbatim report is unchanged.
- **4 (Low), F5 was ruled on — fixed** in `docs/HISTORY.md` and both cross-check dispositions.
- **5 (Low), superseded status lines — fixed** by marking them, in the headers written by Claude;
  the verbatim reports are unchanged.
- **6 (Low), `CLAUDE.md` says changing any listed value makes the verifier fail — fixed:** page 5 is
  excepted and the comment above `feverWorkup` named as its only guard.
- **7 (Low), README's stale PDF path — fixed.**
- **8 (Low), Gemini's miscount — recorded** in that file's dispositions.
- **Clinical strings flagged:** the one changed value (the UTI "> 10 WBC" outcome) is Thiago's
  wording; the "<100,000 CFU/mL … discontinue antibiotics" outcome is unchanged and put to him.
