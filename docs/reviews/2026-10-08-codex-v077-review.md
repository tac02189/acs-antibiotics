# Codex peer reviews — v0.7.7, 2026-10-08

Two single-engine Codex runs on this release. Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec
--sandbox read-only` (header confirmed `sandbox: read-only` both times), reasoning effort `high`,
packet on stdin, no tools; relayed by the `codex-review` bridge agent. Not cross-checked with Gemini.

- **Run 1** reviewed the first part of the release: page references and the Copy link removed, the
  fever-workup branches made collapsible.
- **Run 2** reviewed the whole release after Thiago asked for the other tabs to collapse too
  (`CollapsibleCard`, `OpenCards`, Fractures, Dosing, Source).
- **Nothing below was dismissed or softened.** Both answers follow verbatim; dispositions at the end.

---

## Run 1 — page references, Copy link, workup branches

No **HIGH** findings or new clinical-text regressions found. This is a static review of the supplied packet only; I did not use tools, run tests, or inspect browser behavior.

One pre-existing usability finding:

- **Low — several tap targets remain below 44px at normal text size.** Examples include `src/components/FeverWorkupView.jsx:45` (reference links), `src/components/IndicationsView.jsx:187` (“All sections”), `src/components/DrugsView.jsx:153` (“See all” / “Full table”), and `src/components/DrugsView.jsx:172` (indication links). Their single-line text and vertical padding do not provide 44px height under the supplied styling. These sizes were not introduced by this release. The new workup toggles correctly provide `min-h-[56px]` at `FeverWorkupView.jsx:82`.

**A. Correctness and regressions — no findings.**

- The supplied repository-wide searches show no remaining `PageTag` or `CopyLink` references and no `CardHeading` callers passing `page`. `CardHeading` still supports `children` correctly (`src/components/shared.jsx:170`).
- Removed `Check` and `LinkIcon` imports belonged to `CopyLink`. `useState` remains necessary for the three state sets in `IndicationsView.jsx:71`.
- App supplies precisely the props FeverWorkupView accepts: `open` and `setOpen` (`src/App.jsx:79`; `src/components/FeverWorkupView.jsx:9`).
- Workup toggling copies the previous Set before modifying it, and uses a functional update (`FeverWorkupView.jsx:10`). No mutation of existing state or hook-order problem appears.
- Branch IDs, list keys, and reference URLs are unique in the supplied data. Accessing `o.then` on the string outcomes does not throw; the object outcome retains its nested step.
- No render-time exception is apparent through the supplied App entry point. The retained, unused `accent-soft` token is harmless.

**B. New collapsible-branch accessibility — no findings.**

Each native button is inside an `h2`, has its branch title as its accessible name, and hides its decorative chevron (`src/components/FeverWorkupView.jsx:76`). Native keyboard activation remains available.

The control/panel pairs are valid and unique:

| Button’s `aria-controls` | Matching panel ID |
|---|---|
| `wb-pneumonia` | `wb-pneumonia` |
| `wb-central-line` | `wb-central-line` |
| `wb-uti` | `wb-uti` |

The IDs are generated consistently at lines 81 and 92. The panel remains mounted; its inner content receives `inert` and `aria-hidden` while closed (line 94). The toggle stays outside that subtree. Current branch panels contain no interactive controls, so collapsing through the heading button does not strand keyboard focus inside the panel. No automatic focus move into the expanded content is necessary.

`SectionCount` correctly hides the visual number from assistive technology and supplies one singular/plural phrase, such as “1 indication” or “12 indications” (`src/components/IndicationsView.jsx:296`). The explicit separating space in `src/components/shared.jsx:127` remains, avoiding concatenation with the section title.

**C. Print behavior — no findings in the supplied CSS.**

Closed workup content should **visually print**:

- `.expand` becomes `grid-template-rows: 1fr !important` (`src/index.css:315`).
- Its immediate child’s overflow becomes visible (line 319).
- Neither `inert` nor `aria-hidden` itself applies `display: none`; the `[inert]` rule also explicitly sets visibility (line 322).

The outer workup article has no fixed height, so its `overflow-hidden` does not itself keep an expanded print panel at the collapsed height (`src/components/FeverWorkupView.jsx:75`).

Section heads become static, hidden indication lists become visible, and articles request avoidance of internal page breaks (`src/index.css:305`, `309`, `325`). The workup cards remain a sensible single column. Actual pagination still requires print-preview verification.

These rules address visual printing; they do not remove `aria-hidden` or `inert` for accessible PDF tagging.

**D. Fever-workup clinical-text comparison — no clinical-text differences.**

I manually matched every data-rendering expression in HEAD to its post-change counterpart, then checked the supplied `feverWorkup` values against those paths. All **37 textual data values**, plus the page-number interpolation in the PDF label, retain their order, conditions, and formatting functions.

Line references below are to the two supplied versions of `src/components/FeverWorkupView.jsx`:

| Rendered content | Values | HEAD lines | POST lines | Result |
|---|---:|---|---|---|
| `fw.title`, `fw.trigger` | 2 | 9, 12 | 20, 23 | Identical; trigger retains `keepUnits` |
| Branch titles | 3 | 20 | 84 | Identical, same branch order |
| UTI preface | 1 | 21 | 96 | Identical; retains `keepUnits` |
| Criteria leads | 3 | 27 | 102 | Identical; retains `keepUnits` |
| Criteria items | 12 | 28–35 | 103–110 | Identical; same order and `keepUnits` |
| Steps | 5 | 41–48 | 116–123 | Identical; same order and `keepUnits` |
| Top-level outcomes | 6 | 62–81 | 136–155 | Identical; same string/object selection |
| UTI nested `then` step | 1 | 71–77 | 145–151 | Identical; same nesting and `keepUnits` |
| Central-line note | 1 | 84 | 158 | Identical; same italics and `keepUnits` |
| Reference-standard labels | 3 | 93–105 | 39–51 | Identical; URLs and order unchanged |

Specifically, pneumonia still has five criteria, three steps, and two outcomes; central line has its lead, no criteria items or steps, two outcomes, and its note; UTI has its preface, seven criteria, two steps, two outcomes, and the nested culture step under the first outcome.

The following are also unchanged:

- Three literal `Then` labels, still visually uppercased by `.eyebrow`.
- All literal arrows, comparison signs, punctuation, capitalization, `PLUS any TWO`, `ONE`, `YES`, `NO`, and `OR`.
- Decorative `ArrowRight` and `CornerDownRight` placement and accessibility hiding.
- Outcome/nested-list `role="list"` attributes.
- “Reference standards.”
- The complete image-read disclosure, including its explicit JSX spaces.
- PDF button label **“open page 5 of the PDF”** and `page={fw.page}`.
- No footnotes are rendered by either workup implementation; none were removed.

The **exact textual differences** are the separately requested page-tag removals:

1. HEAD line 9: `"Infectious workup · PMG p.5"` → POST line 20: `"Infectious workup"`.
2. HEAD line 91: removal of `page={5}` removes the rendered **“PMG p.5”** beside “Reference standards”; POST line 37 retains the heading.

The **layout/chrome differences affecting presentation**, without changing wording, are:

- `grid gap-3 md:grid-cols-3` → `space-y-3`.
- Article `p-4 flex flex-col justify-between` → `overflow-hidden`, with padding transferred to the button and panel.
- Title becomes a heading-contained button with a chevron; `text-ink` moves from the heading to the title span. The 18px bold, snug heading typography remains.
- Preface loses `mt-1`; criteria and steps lose their local `mt-3`. The panel now provides `space-y-3`, padding, and a top border.
- Outcome wrapper `mt-4` → `pt-1`, following the panel’s inter-block spacing.
- Panel content is initially hidden visually and from assistive technology until expanded.

No explicit text-space, `keepUnits`, capitalization, or clinical typography transformation changed.

**Clinical-value flag:** the moved criteria comment repeats **“Central line >72 h…”** unchanged (`FeverWorkupView.jsx`, diff quote: `A sentence with thresholds ("Central line >72 h…")`). The diff also includes the unchanged **“30 min”** comment as context in `OpenFracturesView.jsx`.

The rendered threshold/duration-bearing fields—including the fever trigger, pneumonia culture thresholds and seven-day duration, central-line duration, and UTI temperature/WBC/squamous-cell/culture thresholds—retain identical data and rendering expressions. No dose, cutoff, protocol, or duration was changed by this diff. This does not validate those clinical values.

**E. Data and verifier integrity — no findings.**

The supplied status, full diff, and empty `git diff --stat -- src/data scripts` confirm that **`src/data/pmg.js` and `scripts/verify-pmg.mjs` are untouched** in this packet.

**F. Information lost with page tags — no unintended findings.**

Exact local source-page cues were intentionally removed from indication rows, section heads, and fracture subsections. This reduces at-a-glance page lookup, especially where the Source page identifies only a page range.

No image-transcription disclosure or sole remaining source access was removed:

- Workup retains its image-read warning and page-5 PDF button (`src/components/FeverWorkupView.jsx:55`).
- Source retains page mappings, including dosing page 4 and references page 12 (`src/components/SourceView.jsx:6`).
- Source retains “Open the PDF” (`SourceView.jsx:46`).
- Dosing retains its explanation that the table comes from the open-fracture page (`src/components/DosingView.jsx:8`).

**G. Other checks — no additional release regressions found.**

- No new under-400px overflow problem is apparent. Workup titles can shrink and wrap; cards have no fixed content width. Browser verification remains outstanding.
- `#/s/<id>` and `#/i/<id>` handling is unchanged. Section opening, query clearing, focus/scroll behavior, and By-drug indication links remain present (`src/components/IndicationsView.jsx:96`, `126`; `src/App.jsx:53`; `src/components/DrugsView.jsx:172`).
- Workup expansion survives tab changes because its Set lives in App (`src/App.jsx:31`). Individual indication-row expansion still resets when that view unmounts because its Set is local (`IndicationsView.jsx:71`); that behavior predates this release.
- The removed contrast assertions correspond to the removed Copy-link states. The type-test edit changes the descriptive role text consistently. No misleading test change is evident, but the supplied test changes add no verification of the new collapse interactions or printing.

---

## Run 2 — the whole release

## Packet check

HEAD commit: `a7f8b2073d6c0906497c7d1c8b7b2cde38765bf7` — `a7f8b20 docs: record the v0.7.6 deploy and its live hash check`.

| Packet file/copy | Last numbered line shown | Last non-empty line verbatim |
|---|---:|---|
| POST-CHANGE `src/components/shared.jsx` | 394 | `}` |
| POST-CHANGE `src/App.jsx` | 135 | `}` |
| POST-CHANGE `src/components/FeverWorkupView.jsx` | 132 | `}` |
| POST-CHANGE `src/components/OpenFracturesView.jsx` | 148 | `}` |
| POST-CHANGE `src/components/DosingView.jsx` | 88 | `}` |
| POST-CHANGE `src/components/SourceView.jsx` | 155 | `}` |
| POST-CHANGE `src/index.css` | 329 | `}` |
| POST-CHANGE `tests/theme.test.js` | 364 | `});` |
| HEAD `src/components/FeverWorkupView.jsx` | 122 | `}` |
| HEAD `src/components/OpenFracturesView.jsx` | 154 | `}` |
| HEAD `src/components/DosingView.jsx` | 58 | `}` |
| HEAD `src/components/SourceView.jsx` | 167 | `}` |

The DIFF is unnumbered and labelled **1054 lines**; there is no last numbered line to independently report. Its last non-empty line matches the manifest:

```text
   [14, "collapsed summaries (regimen lines, the alternative preview, By-drug lists), page intros, Source-page prose, buttons"],
```

All numbered files match the manifest. No apparent truncation. No tools used.

## Findings by severity

### High

No findings.

### Medium

- **Browser find loses access to collapsed content — `src/components/shared.jsx:104`, `src/components/DosingView.jsx:79`, `src/App.jsx:33`.** All new panels start closed, and native `inert` excludes their text from browser find-in-page. Searching for a dose, criterion, transcription flag, or reference can therefore miss content present on the current tab. This is a consequence of the chosen disclosure behavior, not lost data. **Suggested direction:** decide whether that tradeoff is acceptable; if searchability matters, provide an accessible expand-all or search-and-reveal mechanism.

- **Owner decision: the verification limitation and flags disappear behind a generic heading — `src/components/SourceView.jsx:59`, `src/components/SourceView.jsx:60`, `src/components/SourceView.jsx:85`.** The initial Source view no longer exposes “not clinical review,” the scope of checks, or the human-review flags. The amber heading and shield remain, but neither a limitation summary nor a flag count is visible. **Suggested direction:** have the owner explicitly decide whether a short disclosure should remain outside the panel. This is a visibility concern, not a clinical judgment.

### Low

- **The dosing button relies on an unreliable footnote label — `src/components/DosingView.jsx:59`.** A native `sup` has implicit superscript semantics, for which author-provided accessible naming is prohibited; its `aria-label` cannot reliably guarantee the spoken words “footnote *.” The new button inherits this existing markup from HEAD and incorporates it into its accessible name. **Suggested direction:** represent the explanatory word as accessible text rather than relying on an `aria-label` on `sup`. The overall drug/brand/class name remains understandable; this is not evidence that the button is unnamed.

### Nit

No additional findings.

## 1. Correctness

**No demonstrated functional defect in the supplied implementation.**

- **Provider and default:** All four affected views render beneath `OpenCards.Provider` at `src/App.jsx:129`. Header, Footer, and BottomNav are outside it, but the inventory shows no consumers there. Constructing `{view}` before returning the provider does not place its rendered descendants outside the context. Without a provider, `src/components/shared.jsx:62` supplies an empty set and a no-op toggle: cards would remain permanently collapsed. No such usage is shown.
- **State and memoization:** `src/App.jsx:33`–`src/App.jsx:45` uses immutable Set updates and a memoized value. State survives tab changes while App remains mounted. Recreating the toggle when `opened` changes is harmless.
- **Keys and IDs:** Current inventory keys are unique across `workup:`, `fractures:`, `dosing:`, and `source:`. The `cc-` and `dose-` prefixes do not collide with the other inventoried prefixes. Sanitization is not collision-proof for arbitrary future strings, but no current collision is shown. Each `aria-controls` targets an always-mounted panel at `src/components/shared.jsx:102` or `src/components/DosingView.jsx:77`.
- **Markup and props:** `as` is consumed as `Tag`, not leaked to the DOM. An `h2` containing a button inside an article or list item is valid; a `sup` inside the button is valid HTML. `aria-hidden` on a div is valid. List keys are retained; no new duplicate-key evidence appears.
- **React-version qualification:** `inert=""` is a valid HTML representation, but React’s treatment is version-dependent. The installed React version is **not in packet**, so absence of React warnings or correct emitted `inert` cannot be certified.
- **Imports:** Every import in the complete supplied App, shared component file, four views, and theme test has a use or re-export. `SourceView` still uses `IconTile` for `FileText`. Complete import/use auditing of DrugsView and IndicationsView is **not in packet**; their shown removals are consistent.
- **Routing:** No shown change removes existing indication/drug targets or changes link destinations. New panels have no route-driven opening logic, but no supported deep links to those new panels are established in the packet.

## 2. Data fidelity

**No unintended clinical/data-expression changes found after comparing all four HEAD views against their post-change copies.**

| View | Comparison |
|---|---|
| OpenFracturesView | Timing extraction and sentence; antimicrobial applicability, regimens and footnotes; duration labels/values; debridement heading/items; classification title/types/descriptions/subtypes; stable/unstable femoral rules all retain their expressions, order, and conditions. |
| DosingView | Row order, drug, footnote lookup/mark, brand/class, adult and pediatric labels/lines, and footnote order/text are unchanged. Brand/class moves inside the heading/button, without changing its text. |
| FeverWorkupView | Title/trigger, branch order/title/preface, criteria guards/items, steps, string/object outcomes, nested `then`, notes, reference labels/URLs, and image disclosure/PDF page are unchanged. Outcome hierarchy is preserved. |
| SourceView | Document fields, CHECKED/NOT_CHECKED strings, flags and numbering, corrections, antibiogram substitutions/link/note, reference numbering/text/conditional URLs are unchanged. |

There are **intentional rendered metadata removals**: page labels in eyebrows/headings and antimicrobial `a.page` chips, including HEAD `src/components/OpenFracturesView.jsx:58`, and the reference-page label at HEAD `src/components/SourceView.jsx:144`. Thus “all rendered data strings unchanged” needs that explicit exception.

The new open state changes visibility and accessibility exposure, not whether the clinical children are mounted. Existing data-dependent conditions remain the same.

## 3. Accessibility

The findings above cover browser find and the footnote label.

- **Structure:** The supplied views retain `h1` followed by `h2`; the accordion buttons are appropriately inside headings (`src/components/shared.jsx:82`, `src/components/DosingView.jsx:47`). No heading skip or duplicate landmark is introduced in the shown tree. Brand/class now participates in the dosing heading as well as the button name.
- **Names:** Drug, optional footnote mark, brand and class form a reasonable, if verbose, button name. The explicit space at `src/components/DosingView.jsx:64` separates drug and metadata. Exact announcement of the superscript is not established.
- **Collapsed content:** `aria-hidden` excludes the body from the accessibility tree; effective native `inert` also removes its links from keyboard interaction. Those links become reachable after expansion. This is appropriate disclosure behavior, subject to the React qualification above.
- **Focus:** Both button implementations use an inward `-2px` outline offset (`src/components/shared.jsx:88`, `src/components/DosingView.jsx:53`), keeping the 2px ring inside the overflow-clipped container. The global ring is defined at `src/index.css:258`. No obvious clipping defect is evident from the CSS.
- **Contrast:** The new combinations are explicitly covered: ink/prose/muted/accent on card and well at `tests/theme.test.js:93`; warn ink/mark on warn background at `tests/theme.test.js:121`; and focus against card, well and warn background at `tests/theme.test.js:133`. The dosing footnote mark on card/well is covered at `tests/theme.test.js:123`. No fixed palette color is introduced.
- **Touch/type/motion:** New disclosure buttons have a 56px minimum height. Their text sizes belong to the permitted scale. Expansion lasts 0.2 seconds; reduced-motion removes the grid transition and makes other transitions effectively instantaneous (`src/index.css:247`). Existing body links were not enlarged by this change; the packet does not establish that every pre-existing target meets 44px.

## 4. Print

**No demonstrated print-expansion defect.**

`src/index.css:315` forces every mounted `.expand` to `1fr !important`, including closed panels, and `src/index.css:319` releases the inner overflow clipping. Neither `inert` nor `aria-hidden` inherently suppresses visual printing; the new panels do not use `hidden`.

Colors are overridden and dose plates retain outlines. Chevrons remain visible and may still point downward for a closed-on-screen card, but do not hide its printed contents.

Pagination deserves a browser check: the outer cards/group retain `overflow-hidden`, and the existing `section > ol > li` break rule no longer reaches lists nested inside the new panel wrappers (`src/components/shared.jsx:105`, `src/index.css:325`). That establishes a changed pagination rule match, **not proof of clipping or missing printed content**. Print output also covers the mounted tab; App does not mount every tab simultaneously.

## 5. Information hidden behind a tap

These are owner decisions, without clinical judgment:

| Location | Hidden by default | Visible cue |
|---|---|---|
| `src/components/SourceView.jsx:59` | Verification limitation, checked/not-checked lists, human-review flags | Amber physician heading, shield and chevron; no summary/count |
| `src/components/DosingView.jsx:77` | Every drug’s adult/pediatric labels, age cutoffs and dose lines | Drug, footnote mark, brand/class and chevron; Footnotes card remains visible |
| `src/components/OpenFracturesView.jsx:41` | Regimens, applicability labels, associated footnotes and dosing-table link | “Antimicrobial by type”; no regimen preview |
| `src/components/OpenFracturesView.jsx:77` | Durations **and debridement rules** | “Duration”; debridement is not named in the collapsed head |
| `src/components/OpenFracturesView.jsx:105` | Classification descriptions/subtypes | Classification title |
| `src/components/OpenFracturesView.jsx:128` | Stable/unstable femoral rules | Full femoral-fracture heading |
| `src/components/FeverWorkupView.jsx:63` | Branch prefaces, criteria, steps, outcomes and notes | Suspected-condition title; page trigger and image disclosure remain visible |
| `src/components/FeverWorkupView.jsx:27` | Reference-standard labels/links | “Reference standards” |
| `src/components/SourceView.jsx:96` | Corrections and the interpretation caveat | Correction heading |
| `src/components/SourceView.jsx:116` | Antibiogram period, newer-dataset explanation, app link and note | “Antibiogram” and icon |
| `src/components/SourceView.jsx:133` | Reference entries and links | “References” |

The fracture timing card and Source document/PDF card remain visible.

## 6. Anything else

**No additional demonstrated regression in the shown diff.**

Page-chip and Copy-link removals are consistent with the stated request. The shown Indications changes retain clinical fields and target IDs. The DrugsView link destinations remain `#/fractures` and `#/dosing`; only their labels change.

The documented collapse scope and in-memory persistence match the implementation. The shown version bump is `0.7.6` → `0.7.7`. Removing the copy-link-specific contrast pairs is consistent with removing that control; the new component pairs already have matrix coverage.

The packet’s passing-test/build statement is reported evidence, not independently reproduced verification.

## Clinical values: moved or re-wrapped

**I cannot verify clinical correctness from code.** No changed clinical value was found. Actual underlying data strings are mostly **not in packet**; the following inventories the affected rendering expressions rather than inventing their contents.

- **Fracture regimens — `src/components/OpenFracturesView.jsx:56`, `src/components/OpenFracturesView.jsx:57`:** applicability labels and every regimen’s drug, dose, route, frequency, note and footnote association are re-wrapped inside a collapsible card. Footnote marks/text at `src/components/OpenFracturesView.jsx:65` and `src/components/OpenFracturesView.jsx:66` move behind that disclosure.
- **Fracture duration/debridement — `src/components/OpenFracturesView.jsx:83`, `src/components/OpenFracturesView.jsx:85`, `src/components/OpenFracturesView.jsx:92`, `src/components/OpenFracturesView.jsx:98`:** applicability, duration values, debridement heading and rule items are re-wrapped.
- **Classification — `src/components/OpenFracturesView.jsx:105`, `src/components/OpenFracturesView.jsx:109`, `src/components/OpenFracturesView.jsx:111`, `src/components/OpenFracturesView.jsx:116`, `src/components/OpenFracturesView.jsx:117`:** classification title, type names, descriptions, subtype codes and descriptions are re-wrapped.
- **Femoral protocol — `src/components/OpenFracturesView.jsx:128`, `src/components/OpenFracturesView.jsx:129`, `src/components/OpenFracturesView.jsx:133`, `src/components/OpenFracturesView.jsx:138`:** protocol title, heading, stable/unstable labels and all rule items are re-wrapped.
- **Dosing drugs and metadata — `src/components/DosingView.jsx:57`, `src/components/DosingView.jsx:59`, `src/components/DosingView.jsx:67`:** drug names, marks, brand and class move into buttons. The inventory identifies Cefazolin, Cefepime, Metronidazole and Vancomycin; complete brand/class values are not in packet.
- **Dosing values — `src/components/DosingView.jsx:81`, `src/components/DosingView.jsx:82`:** all adult/pediatric labels, thresholds and dose lines move into panels, with the same `DosePlate` inputs. Footnote bodies at `src/components/DosingView.jsx:29` remain outside.
- **Fever protocol — `src/components/FeverWorkupView.jsx:63`, `src/components/FeverWorkupView.jsx:65`, `src/components/FeverWorkupView.jsx:71`, `src/components/FeverWorkupView.jsx:77`, `src/components/FeverWorkupView.jsx:90`, `src/components/FeverWorkupView.jsx:113`, `src/components/FeverWorkupView.jsx:118`, `src/components/FeverWorkupView.jsx:127`:** branch titles/prefaces, criteria, steps, outcomes, later steps and notes move into `Branch` panels. The comment examples “Central line >72 h…” and “PLUS any TWO” also move at `src/components/FeverWorkupView.jsx:69`; they are not independently rendered clinical values.
- **Source review material — `src/components/SourceView.jsx:90`, `src/components/SourceView.jsx:99`, `src/components/SourceView.jsx:105`, `src/components/SourceView.jsx:109`:** flags and correction text are re-wrapped, including the unchanged “Instr” → “Instrumentation” interpretation caveat.
- **Source/reference material — `src/components/SourceView.jsx:118`, `src/components/SourceView.jsx:130`, `src/components/SourceView.jsx:139`, `src/components/FeverWorkupView.jsx:37`:** antibiogram context/note, reference entries and reference-standard labels are re-wrapped without expression changes.

The timing sentence/extraction at `src/components/OpenFracturesView.jsx:8` and `src/components/OpenFracturesView.jsx:34`, and fever trigger at `src/components/FeverWorkupView.jsx:14`, remain unchanged and outside the new collapsed bodies.

## Not verifiable from packet

- Actual clinical data values, PDF accuracy, or clinical correctness: full `pmg.js` and the PDF are **not in packet**.
- Installed React version, emitted `inert` behavior, browser/assistive-technology announcements, and actual print pagination.
- Full routing implementation and complete DrugsView/IndicationsView import audits.
- Lockfile version consistency, full test coverage, and independent confirmation of the reported 87 passing tests/build.
- Whether the reviewer model differs from the authoring model: authoring-model identity is **not in packet**.

---

## Dispositions

- **Run 1, Low — tap targets under 44px elsewhere.** Pre-existing, as Codex says; this release only
  changed two link labels in By drug. Not fixed here.
- **Run 2, Medium — find-in-page misses collapsed content.** True: `inert` panels are skipped by the
  browser's find, as the Indications sections' collapsed lists already were. Relayed to Thiago as a
  consequence of the collapse he asked for; no expand-all added.
- **Run 2, Medium — the Source physician card's disclosure is behind a collapsed head.** Relayed to
  Thiago as an owner decision, with the option of keeping that card always open, as the Workup
  page-5 image note is.
- **Run 2, Low — `aria-label` on the footnote `<sup>`.** Pre-existing markup (`CLAUDE.md` records
  the `aria-label="footnote *"` convention); the dosing button now carries it in its name. Not changed.
- **Run 2, print pagination note.** Fixed: the print block's `break-inside: avoid` now also covers
  `.expand ol > li`, so the open-fracture regimens and the Source lists inside a panel are not split.
- **Run 2, React and `inert`.** React 18.3.1; `inert=""` is the attribute pattern the indication
  rows already use, and in the preview the attribute was present while closed and absent while open.
