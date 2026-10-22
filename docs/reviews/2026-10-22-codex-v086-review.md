# Codex peer review — v0.8.6, 2026-10-22

The required review before the v0.8.6 commit. It is single-engine (Codex), and it is not clinical
verification. Thiago: "Remove the 'For the reviewing physician' box in the sources tab". The Source
page's amber card is removed, with its "Checked against the PDF" and "Not checked" lists and the
eleven rendered notes and their review marks. `transcription.flags` stays in the data, unrendered,
and its tests stay. The contrast-matrix pair for the card's inner boxes is removed. No clinical
value changed; the three `src/data/pmg.js` hunks are comments.

- **How it ran.** `codex exec`, `gpt-6-astra`, reasoning effort high, Codex v0.162.1, header
  `sandbox: read-only`. The packet went in on stdin with "do not use any tools"; Codex's log shows
  no tool calls, and `git status` and HEAD (`305bd7a`) were the same before and after.
- **The packet.** 63,815 bytes: the 419-line uncommitted diff (10 files), the full post-change
  `src/components/SourceView.jsx`, `src/data/pmg.js` lines 985–1069, context from
  `tests/theme.test.js` and `tests/pmg.test.js`, and greps for `card/70`, `warn-bg`, `good-mark`
  and leftover mentions of the card. Checked before sending: the diff section was byte-identical to
  a fresh capture, each file ended on its real last line, and all section markers were present.
  Codex answered "Packet received complete: yes".

**Nothing below was dismissed or softened.**

## Codex's response (verbatim)

No confirmed functional regression is visible in the packet. The main consequence is removal of reader-visible provenance. The Medium findings below identify decisions for the physician owner; they do not judge whether removal is appropriate.

All drug doses, cutoffs, intervals, routes, population restrictions, and protocol claims referenced below are **unverifiable from code -- a human must check the source PDF**. The packet establishes what the code and notes say, not whether they accurately represent the PDF.

- **Medium — Source-page explanations of app-added content disappear.**  
  `src/components/SourceView.jsx`, hunk `@@ -69,64 +46,10 @@`; retained records at `src/data/pmg.js:1057–1058,1064–1065`.
  
  The removed notes explained:
  - Indication-row doses are app lookups into dosing tables, rather than doses printed on the PDF’s indication rows.
  - Doxycycline, Linezolid, Clindamycin, and Cefepime use an empiric-table fallback on specified prophylaxis rows; the note distinguished treatment frequency from OR redosing and described physician authorization.
  - The open-fracture IV routes are physician-directed app additions to bullets that reportedly print no route.
  - The appendectomy duration’s third line has a physician-directed added colon.

  These records remain in data but are no longer available through this card. This does **not** establish that all lookup/fallback provenance disappears throughout the interface: `CLAUDE.md`, hunk `@@ -47,8 +47,8 @@`, documents remaining pill markers, plate explanations, row captions, table links, and section blurbs. Their full implementations are not embedded.

- **Medium — Context differences and dosing limitations lose their consolidated explanation.**  
  `src/data/pmg.js:1059–1063,1066`; rendering removed in `src/components/SourceView.jsx`, hunk `@@ -69,64 +46,10 @@`.
  
  The removed notes described:
  - OR-only prophylaxis redosing intervals and the absence of a supplied postoperative frequency for rows with postoperative durations.
  - Levofloxacin: 500 mg Q24H in specified open-fracture regimens versus 750 mg in both dosing tables.
  - Metronidazole: Q12H in open-fracture regimens versus “Q8H or Q12H” in the empiric table and an 8-hour OR redosing interval.
  - Vancomycin: 15–20 mg/kg in the prophylaxis table versus “Pharmacy to dose” elsewhere.
  - Cefazolin: “2 g if < 120 kg, 3 g if ≥ 120 kg” versus 2 g elsewhere, including the explanation of the PDF’s comparison-sign typography.
  - No pediatric dosing in this edition, adult applicability, and the empiric table’s standard-adult/normal-renal-function qualification.

  These are removed explanations, not changed clinical values. The population note reportedly duplicates information in the retained introduction and dosing footnote; those texts are not embedded, so their exact remaining disclosure cannot be verified here.

- **Medium — The interface loses the card’s explanation of verification scope and note review.**  
  `src/components/SourceView.jsx`, hunks `@@ -1,33 +1,10 @@` and `@@ -69,64 +46,10 @@`; `src/data/pmg.js:1067`.
  
  Readers lose the statement that the build performs an automated transcription-consistency check rather than clinical review. They also lose:
  - The coverage list: document title/introduction/header review dates; indication-table cells, structure and completeness; dosing tables, comparison signs, footnote and redosing rules; open-fracture content and regimen placement; and ordered references with links, including the stated correction exceptions.
  - The exclusions: app-derived indication-row doses, short labels/search synonyms, independently unverified note wording, app-authored brand/class metadata, and whether the PMG itself is correct.
  - The explanation that note doses and quoted phrases are checked against verified data.
  - All eleven displayed physician-review dates. Those dates concern review of the notes, not clinical validation of the entire transcription.

  The note records and hash checks remain. The deleted UI does not itself change the verifier’s scope.

- **Low — The unused emerald styling remains, and the contrast-test description now overstates actual use.**  
  `src/components/shared.jsx:21`; `src/index.css:69–72,142–145`; `tests/theme.test.js:81,120–123`.
  
  The supplied searches show no rendered `good` tone or direct `good-mark` consumer after removal. The tone mapping, tokens, and contrast checks remain. Consequently, “The pairs the components actually put together” is broader than current rendering warrants. This is maintenance/documentation debt, not a demonstrated runtime or accessibility defect.
  
  The parser/control fixtures containing `text-good-mark` at `tests/theme.test.js:216,263` are not automatically obsolete: synthetic classes can still test generic detection. Their full test bodies are absent, so their exact effectiveness cannot be assessed.

- **Low — Release history has not yet caught up with the version bump.**  
  `package.json`, hunk `@@ -1,7 +1,7 @@`; `docs/HISTORY.md`, supplied tail in Section 6h, no line numbers provided.
  
  The package versions say 0.8.6, but the history has no corresponding entry. This is pending release documentation, not evidence of a faulty release. The existing 0.8.5 statements about retained review marks are historical and do not contradict this uncommitted change.

1. **Dangling references:** None found in the supplied changed code or search matches that still direct readers to the removed notes. Every import in the complete post-change `SourceView.jsx` is used; `CHECKED`, `NOT_CHECKED`, `MONTHS`, and `fmtDay` were removed together with their consumers. `ToneCard`, `ShieldAlert`, and `keepUnits` retain other consumers. The reference expansion key still matches the remaining collapsible card. Updated documentation uses historical wording appropriately, including README’s account of the 0.8.5 decision. No shown test expects the removed card. Whole-file unused-import checks for other changed files, unmatched wording elsewhere, and complete test expectations cannot be verified from excerpts and keyword searches.

2. **Contrast removal:** Correct on the supplied evidence. Section 5 shows only one remaining literal `bg-card/70`, at `OpenFracturesView.jsx:58`, in the danger timing card identified by Section 6e. Its contrast check remains at `tests/theme.test.js:125`. No remaining amber inner-box combination is shown. Amber styling remains used elsewhere, so its general tests still have a purpose. The emerald remnants are described above. The `CollapsibleCard` comment at `shared.jsx:107` concerns that component’s unused warning option; it does not contradict active warning `ToneCard` usage. These searches cannot completely exclude dynamically assembled classes or unseen nesting.

3. **Clinical data changes:** None in the supplied `src/data/pmg.js` diff. Each hunk is comment-only:
   - `@@ -991,8 +991,10 @@`: documents that both provenance lists are now unrendered.
   - `@@ -1000,7 +1002,8 @@`: updates the route-disclosure rendering history.
   - `@@ -1048,8 +1051,8 @@`: updates the review-mark rendering history.
   
   No executable data value changes in these hunks. This confirms diff scope, not clinical correctness.

4. **Provenance consequences and remaining Source page:** The three Medium findings cover all eleven removed notes, the checked/not-checked lists, and the review marks. The remaining page still presents the document title, publisher, document review date, page count, SHA-256, PDF button, offline-storage statement, introduction paragraphs, and expandable references with available links (`SourceView.jsx:19–74`). The packet does not include the introduction, reference array, PDF, or offline implementation, so their content, reference count, and operational behavior cannot be independently confirmed.

No additional logic error or newly vacuous test is demonstrated. The note tests still iterate over eleven retained entries, and the shown review-hash test retains its mutation control. The reported 158 passing tests and verifier PASS are author-provided results, not independently verified in this review.

Packet received complete: yes

## Dispositions

1. **Medium, the Source page no longer explains the app's own additions — to Thiago.** This is
   what the removal does, and it was requested. What still says so in the interface: the
   empiric-table fallback keeps its marks on the pill ("· empiric table · no OR redose listed"),
   the plate note, the row's "Doses:" caption and the Trauma and EGS blurbs, and the Indications
   intro still says where doses come from. What no longer does: that the open-fracture IV route
   and the appendectomy colon are the app's. Both stay recorded in `transcription.flags` and
   `transcription.corrections`. Not deployed; the consequence goes to him with the commit.
2. **Medium, the PDF's self-disagreements lose their note — to Thiago.** Levofloxacin, metronidazole,
   vancomycin and cefazolin are shown as printed, as before; nothing in the app now says the
   document disagrees with itself there. Page 1's introduction, still on the Source page, says the
   recommendations apply to adult patients, and the Dosing tab still shows the empiric table's
   footnote (standard adult dosing, normal renal function).
3. **Medium, the verification scope and the review dates leave the interface — to Thiago.** The
   verifier, its controls and the review-hash test are unchanged; only their description on the
   page is gone. The footer's disclaimer ("confirm doses against the PDF and the patient") is
   unchanged.
4. **Low, the emerald `good` tone is now unused — left.** It is one of the four `TONES` copied from
   the Pediatric CPG; its tokens and contrast checks stay so it is ready if a card uses it again.
   No component renders it, so it costs nothing on the page.
5. **Low, no v0.8.6 HISTORY entry — added** before the commit.
