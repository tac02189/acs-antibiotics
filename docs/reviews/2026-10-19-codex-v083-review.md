# Codex peer review — v0.8.3, 2026-10-19

The required review before the v0.8.3 commit. It is single-engine (Codex), and it is not clinical
verification. Thiago asked: "In the sources page mark them reviewed: 9 add colon". The Source
page's eleven notes became `{ text, reviewed }` and show "Reviewed by a physician, 19 October
2026"; the appendectomy duration's third line now shows the colon the PDF leaves out
("Perforated without source control: 8 days"), a listed correction, and note 9 was reworded to
say so.

- **How it ran.** `codex exec`, `gpt-6-astra`, reasoning effort high, Codex v0.162.1, header
  `sandbox: read-only`. The packet went in on stdin with "do not use any tools"; Codex's log shows
  no tool calls, and HEAD and `git status` were identical before and after.
- **The packet.** 49,788 bytes: the 286-line uncommitted diff (`src`, `scripts`, `tests`,
  `package*.json`, `CLAUDE.md`), the full text of `SourceView.jsx`, the `transcription` export of
  `pmg.js`, `TYPO_MAP` and `norm()` from the verifier, and the tests that read them. Each section's
  line count and last line were checked against the tree before sending; the citations
  spot-checked matched the tree.
- **What it reviewed** was the first version, which did the colon with a `TYPO_MAP` entry. The
  dispositions below describe what changed after it.

**Nothing below was dismissed or softened.**

## Codex's response (verbatim)

1. **Medium — `scripts/verify-pmg.mjs:81,93`: the correction applies outside its authorized location.**  
   `split/join` matches the phrase anywhere in every string passed to `norm()`. Padding does not constrain it because the map key contains no boundary checks. Thus `“…perforated without source control 8 days, then…”` is rewritten, and removing the colon from the **cholecystitis** duration would also be silently repaired before comparison. The current cholecystitis text being untouched does not protect against that mutation. The appendectomy pin only protects appendectomy.

   This hides punctuation discrepancies beyond the single documented exception; it does **not** establish that changed doses or durations are hidden. **Suggested fix:** apply the correction only when comparing the appendectomy duration’s third line, with an exact match. Add negative controls for another row and a longer string containing the phrase.

2. **Medium — `src/data/pmg.js:1062`; `tests/pmg.test.js:474–483`: review provenance does not follow the reviewed wording.**  
   Note 9 changes from “reproduced as printed” to a newly written explanation while retaining the review date. The owner’s message authorizes adding the colon and marking the existing notes reviewed; the packet does not establish that he read this replacement wording. Under the explicitly stated rule requiring him to read reworded notes, that mark is unsupported by the supplied evidence.

   More generally, changing any note while retaining its date passes the new test: it checks shape and calendar validity, not the reviewed text. **Suggested fix:** omit note 9’s date until its revised wording has been read, unless that review is already documented. Bind each review record to a frozen text or hash and test that dated notes still match it. Update the “all eleven reviewed” statements accordingly.

3. **Low — `docs/reviews/2026-10-16-v080-review/plant.mjs:14`: the historical error-planting script now throws.**  
   `flags[5]` is an object, so its `.replace(...)` call fails instead of planting the intended incorrect vancomycin dose. This breaks reproduction of the historical review against current data, although it does not affect the build or current tests. **Suggested fix:** mutate `flags[5].text`, or support both shapes if the script must also work against the historical revision.

The following clinical values are **“unverifiable by code review: a human must check it against the PDF.”** I am flagging them as **unverifiable, not suspicious**, including values merely carried through the shape conversion:

| Location | Clinical values requiring that check |
|---|---|
| `src/data/pmg.js`, diff hunk `@@ -284,8 +284,9 @@` | Non-perforated appendectomy: **24 hours**; perforated with source control: **4 days**; perforated without source control: **8 days**. The hunk also names **Ceftriaxone** and **Metronidazole** in unchanged context. |
| `src/data/pmg.js:1040–1042`; `scripts/verify-pmg.mjs:81`; `tests/pmg.test.js:468`; `CLAUDE.md`, first diff hunk | Repeated **perforated without source control: 8 days** correction and its clinical qualifier. |
| `src/data/pmg.js:1055` | **Doxycycline**, **Linezolid**, **Clindamycin**, and **Cefepime**; their stated indication associations, empiric-table fallback, and absence of an OR redosing interval. |
| `src/data/pmg.js:1057` | **Levofloxacin 500 mg Q24H** versus **750 mg** in both dosing tables. |
| `src/data/pmg.js:1058` | **Metronidazole Q12H**, **Q8H or Q12H**, and **8-hour** OR redosing. |
| `src/data/pmg.js:1059` | **Vancomycin 15–20 mg/kg** and **“Pharmacy to dose.”** |
| `src/data/pmg.js:1060` | **Cefazolin 2 g if <120 kg**, **3 g if ≥120 kg**, and **2 g** elsewhere, including the Type I & II regimen association. |
| `src/data/pmg.js:1061,1063` | **IV** for every open-fracture drug; adult-only recommendations and standard adult dosing with normal renal function. |
| `src/data/pmg.js`, diff hunk `@@ -1031,23 +1032,35 @@`, unchanged context | **Levofloxacin 500 mg IV Q24H + Metronidazole 500 mg IV Q12H**. |

The existing **150–200 mg/kg** and **Q8H or Q6H** strings in the test context are deliberately incorrect negative controls, not clinical recommendations or new transcription changes.

**Areas with no finding**

- **Colon-rule interaction:** the later `:` rule retains the inserted colon. It does not erase the correction or demonstrate a numeric mismatch being hidden.
- **Active flags consumers:** `SourceView` and `flagProblems(f.text)` correctly consume the new shape.
- **Accessibility and layout:** the review mark inherits neutral `text-prose`, uses allowed **12 px** text, and hides the decorative check from assistive technology. Actual contrast cannot be measured from the supplied tokens alone.
- **Dates:** valid dates render independently of timezone and viewer locale; absent dates omit the mark. Malformed dates could render badly or throw, but the supplied static-data test rejects them.
- **“Checked against the PDF”:** the wording explicitly discloses the appendectomy exception and distinguishes automated checking from clinical review.
- **Documentation and versions:** apart from the review-provenance issue above, no demonstrated stale statement or correction/control-count mismatch. All three package version fields agree on **0.8.3**.

## Dispositions

1. **Medium, `TYPO_MAP` over-matches — fixed.** Confirmed: the entry was an unanchored replace on
   both sides, so a colon dropped from cholecystitis's "Perforated without source control: 8 days"
   would also have passed. The `TYPO_MAP` entry is gone (the map is empty again). The colon is now
   a `CELL_CORRECTIONS` entry in the verifier, scoped to the appendectomy row and its third duration
   line: the data's line must read the corrected form, and the PDF's cell must read the data's
   lines with that one replaced by the printed form. The correction in `transcription.corrections`
   is `kind: "cell"`, and a test checks the two lists in both directions. Two planted controls were
   added (109 now) and fail as they should: the colon dropped from appendectomy, and from
   cholecystitis. Also measured: with `CELL_CORRECTIONS` emptied the verifier fails on the
   appendectomy cell (the PDF really prints no colon), and "…: 9 days" fails.
2. **Medium, review provenance — fixed, and put to Thiago.** A test now holds a hash of each dated
   note's date and wording (`REVIEWED` in `tests/pmg.test.js`), so rewording a dated note fails the
   build until the date comes off or the new wording is read; a control in the test checks a
   one-word rewording is caught. On note 9 itself, Thiago was shown its new wording verbatim and
   asked whether to mark it reviewed: "Yes, reviewed". It keeps its date.
3. **Low, historical `plant.mjs` throws — fixed.** The "F1 flag dose" case now plants into
   `flags[5].text`, and still handles the string shape of the 2026-10-16 tree.

**Clinical values.** Codex's table goes to Thiago as written. Code review confirms none of them;
the verifier confirms the appendectomy durations match the PDF's cell apart from the listed colon,
not that they are right. The fixes after the review were not re-reviewed by Codex; they were
checked by the tests, the verifier and the planted controls above.
