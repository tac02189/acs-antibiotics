# Codex peer review — spacing and type pass, new icon (v0.4.0), 2026-10-06

Single-engine review: Codex CLI v0.153.4, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`, session
`01a111f8-041e-7f52-be59-f0e034011542`. Relayed by the `codex-review` bridge agent. Not cross-checked
by Gemini.

- **First attempt reviewed nothing.** At 11:00 it hit the account usage limit after about 5 seconds,
  before any analysis. One retry at 11:07, after the stated reset, completed at 11:17 (exit 0,
  180,362 tokens).
- **Tree evidence matched** before any finding was read: HEAD `dc32cab`, 26 status entries, a
  25-file diffstat (+219/−150), and the first line and line count (71) of `tests/type.test.js`. Codex
  read from disk with absolute paths and `git -C`.
- **Read-only:** HEAD, status and the index mtime were unchanged afterwards; 28 shell calls, none a
  write. Codex also used its web-search tool, which is where the Tailwind, Chrome and WebKit
  citations come from.
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; the dispositions are
  at the end.

---

````text
**EVIDENCE**

1. `Get-Location` — literal output:

```text

Path                                      
----                                      
C:\Windows\System32\WindowsPowerShell\v1.0


```

2. `git … rev-parse HEAD` — literal output:

```text
dc32caba09634e0d716949b934a88fc6c845b808
```

3. `git … status --short` — full literal output:

```text
 M CLAUDE.md
 M README.md
 M assets/icon-source.png
 M package-lock.json
 M package.json
 M public/apple-touch-icon.png
 M public/favicon-16.png
 M public/favicon-32.png
 M public/og-image.png
 M public/pwa-192.png
 M public/pwa-512.png
 M public/pwa-maskable-512.png
 M scripts/gen-icons.mjs
 M src/components/BottomNav.jsx
 M src/components/BrandBar.jsx
 M src/components/DosingView.jsx
 M src/components/DrugsView.jsx
 M src/components/FeverWorkupView.jsx
 M src/components/Footer.jsx
 M src/components/IndicationsView.jsx
 M src/components/OpenFracturesView.jsx
 M src/components/SourceView.jsx
 M src/components/Toolbar.jsx
 M src/components/shared.jsx
 M src/index.css
?? tests/type.test.js
```

4. `git … -c diff.autoRefreshIndex=false diff --stat` — full literal output, including stderr:

```text
warning: in the working copy of 'CLAUDE.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/gen-icons.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/BottomNav.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/BrandBar.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/DosingView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/DrugsView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/FeverWorkupView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/Footer.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/IndicationsView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/OpenFracturesView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/SourceView.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/Toolbar.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/shared.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/index.css', LF will be replaced by CRLF the next time Git touches it
 CLAUDE.md                            |  24 ++++++++-
 README.md                            |   8 +--
 assets/icon-source.png               | Bin 1378533 -> 1330033 bytes
 package-lock.json                    |   4 +-
 package.json                         |   2 +-
 public/apple-touch-icon.png          | Bin 34807 -> 37546 bytes
 public/favicon-16.png                | Bin 631 -> 654 bytes
 public/favicon-32.png                | Bin 1707 -> 1769 bytes
 public/og-image.png                  | Bin 424103 -> 445664 bytes
 public/pwa-192.png                   | Bin 39378 -> 41838 bytes
 public/pwa-512.png                   | Bin 274059 -> 304300 bytes
 public/pwa-maskable-512.png          | Bin 195739 -> 215937 bytes
 scripts/gen-icons.mjs                |   5 +-
 src/components/BottomNav.jsx         |   7 +--
 src/components/BrandBar.jsx          |   7 +--
 src/components/DosingView.jsx        |  20 +++----
 src/components/DrugsView.jsx         |  32 +++++------
 src/components/FeverWorkupView.jsx   |  24 ++++-----
 src/components/Footer.jsx            |   4 +-
 src/components/IndicationsView.jsx   | 102 ++++++++++++++++++++++-------------
 src/components/OpenFracturesView.jsx |  42 +++++++--------
 src/components/SourceView.jsx        |  34 ++++++------
 src/components/Toolbar.jsx           |  19 ++++---
 src/components/shared.jsx            |  23 ++++----
 src/index.css                        |  12 +++++
 25 files changed, 219 insertions(+), 150 deletions(-)
```

5. First line and total line count of working-tree `tests/type.test.js` — literal output:

```text
// Type-scale guard. Every font size in the interface is a step of one short
71
```

Branch independently confirmed as `main`. Final status and HEAD matched the initial evidence.

**FINDINGS**

1. **[Medium] Font-size guard silently accepts off-scale sizes — `tests/type.test.js:35`, `tests/type.test.js:26`.**  
   The regex recognizes only numeric `px/rem/em` utilities. Running the actual `offScale` implementation in memory returned `[]` for `text-[length:10px]`, `text-[.5rem]`, `text-[50%]`, `text-[2vw]`, `text-[calc(8px+1px)]`, `text-[clamp(8px,1vw,10px)]` and `text-[var(--small)]`. Inline `fontSize`, CSS `font-size`, font shorthand and SVG font-size attributes also pass. The file list excludes `main.jsx`, `src/lib`, `src/data`, `index.html` and Tailwind configuration. Thus a passing build does not establish the promised interface-wide scale. Fix direction: explicitly validate supported size syntaxes and other declaration channels, expand coverage, and add controls for these bypasses—or narrow the documented guarantee.

2. **[Low] CLINICAL-FLAG: Footnote marks remain below the new minimum — `src/components/DrugsView.jsx:133`; `CLAUDE.md:169`.**  
   The fracture-summary `<sup className="text-hazard-amber">` has no explicit font size. Its parent is 13px; Tailwind 3.4.17 sets superscripts to 75%, yielding **9.75px by static analysis**. These are the `*`/`**` marks associated with renal adjustment and pharmacy dosing. This is an existing omission missed by the new pass, not a newly introduced reduction. It contradicts “Nothing is below 11px” while the new test passes. Fix direction: assign an explicit approved size and cover inherited sizing. [Tailwind 3.4.17 Preflight](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v3.4.17/src/css/preflight.css)

3. **[Low] CLINICAL-FLAG: The claimed 15px clinical-text rule is not implemented consistently — `src/components/OpenFracturesView.jsx:113`, `src/components/IndicationsView.jsx:277`, `src/components/DrugsView.jsx:205`; `CLAUDE.md:169`.**  
   Fracture durations are **14px**, including `"24 hours after closure or 72 hours (whichever precedes)"`. Collapsed alternatives and By-drug alternatives remain **13px**, including `"Clindamycin 600mg q8 hours"`. Fever criteria leads use the **11px eyebrow**, including `"Central line >72 h with purulence at site?"`; the associated list text is 15px. Code inspection establishes these style assignments, not clinical correctness. Fix direction: apply the intended role sizes consistently or document precise exceptions; have a human check the quoted values against the PDF.

4. **[Low] CLINICAL-FLAG: Indication-link touch targets were reduced further below 44px — `src/components/DrugsView.jsx:201`.**  
   `py-1.5 → py-1` reduces a single-line link from **33px to 29px high**, using inherited 14px text and 1.5 line-height. The surrounding `<li>` padding is not clickable. This makes links from a drug to its clinical indication harder to acquire on a phone. **Static analysis**, assuming the default 16px root size. Fix direction: retain a minimum 44px interactive height independently of surrounding spacing. Other undersized targets are inventoried under D.

5. **[Low] Documentation presents unverified measurements and overly broad guarantees as established facts — `CLAUDE.md:164`, `CLAUDE.md:175`, `CLAUDE.md:178`, `CLAUDE.md:180`, `CLAUDE.md:183`, `CLAUDE.md:184`.**  
   The claimed 731/764px tab widths, former seven-line duration, two-line notice and viewport checks cannot be reproduced from the supplied source and tests. They are **unverifiable here**, not proven false. Two wording issues are directly checkable: the empty search still has `pr-3`, so it is not padded on the right *only* when the clear button appears; `pretty` is a browser-dependent wrapping heuristic, not a guarantee against every lone final word. Additionally, the existing `CLAUDE.md:74` says `text-base`, while the code uses `text-[16px]` and the new guard rejects `text-base`. Fix direction: record reproducible measurement evidence, distinguish intended behavior from observed results, and correct the class/padding wording. The broader test-enforcement claims at `CLAUDE.md:167`, `README.md:61` and `README.md:76` also need the qualification described in finding 1.

6. **[Info] CLINICAL-FLAG: Fracture-duration label space can collapse on phones — `src/components/OpenFracturesView.jsx:111`.**  
   The existing `minmax(0,1fr)_auto` grid reserves no minimum for `"Type III"` beside `"24 hours after closure or 72 hours (whichever precedes)"`; this patch enlarges both texts. At 320/360/375px, ordinary padding leaves approximately **222/262/277px for both tracks after their gap**, while the value may consume up to 256px. The label track can therefore approach zero width. **Static analysis:** this is a carried-forward layout risk, not a measured overlap or a proven new clipping defect. Fix direction: stack these duration rows below `sm`, or reserve usable label space. Human visual/PDF review remains required.

7. **[Info] CLINICAL-FLAG: Changed wrapping does not preserve clinical tokens atomically — `src/index.css:149`, `src/components/DosingView.jsx:71`, `src/components/IndicationsView.jsx:297`, `src/components/shared.jsx:74`.**  
   Global `pretty`, changed widths and existing `break-words` can change breaks around values such as `"33 mg/kg/dose IV Q8h"` and `"≥ 10⁴ CFU/mL"`. Neither `pretty` nor the existing thin-space formatter guarantees that numbers, units and qualifiers remain together. No text alteration or actual misleading break was demonstrated. Fix direction: inspect these exact render paths at phone widths and in print; if needed, protect selected number/unit groups without changing clinical wording.

**CLINICAL-DATA LINES TOUCHED**

All JSX filenames below resolve under `src/components/`. Every entry is **CLINICAL-FLAG** for human review of the rendered expression and its PDF association. This is a change ledger, not an assertion that every entry is defective. Snippets show the changed portion; structural replacements include their associated moved/closing JSX. Comments and purely decorative changes are excluded.

```text
BrandBar.jsx:57 — PDF link: text-xs → text-[12px]; styling only.
BrandBar.jsx:74 — verification notice: 12px/sm:13px mono bold tracking-tight → 13px sans semibold; styling only; wording unchanged.

DosingView.jsx:9 — “Adult & pediatric dosing”: 26px → 24px below sm; styling only.
DosingView.jsx:13 — PDF scope/footnote explanation: text-sm mt-1 text-balance → 14px leading-snug mt-1.5; styling only.
DosingView.jsx:19 — dosing-row <ol>: space-y-3.5 → space-y-3; styling only.
DosingView.jsx:25 — drug/footnote header wrapper: pb-2.5 → pb-2; styling only.
DosingView.jsx:26 — {row.drug}, adjacent {fn.mark}: 20px → 18px/sm:20px; styling only.
DosingView.jsx:46 — footnotes/page-reference header: mb-2.5 pb-1.5 → mb-3 pb-2; styling only.
DosingView.jsx:47 — “Footnotes”: explicit text-[11px] → eyebrow's 11px; styling only.
DosingView.jsx:65 — adult/pediatric DoseBlock wrapper: p-3.5 → p-3; styling only.
DosingView.jsx:66 — {label}, including adult age threshold: explicit 11px → eyebrow's 11px; styling only.
DosingView.jsx:71 — {l}, dose/weight/frequency/max-dose lines: 15px/sm:16px p-2 → 15px px-2.5 py-1.5; styling only.

DrugsView.jsx:47 — explanation of whole regimens/alternative column: text-sm mt-1 text-balance → 14px leading-snug mt-1.5; styling only.
DrugsView.jsx:54 — drug-card <ol>: space-y-2.5 → space-y-2; styling only.
DrugsView.jsx:70 — drug-card button: py-3.5 → py-3; styling only; min-height remains 52px.
DrugsView.jsx:74 — {d.name}: 16px/sm:17px → 16px; styling only.
DrugsView.jsx:101 — expanded clinical-content wrapper: pb-4 pt-1 → pt-3 pb-3.5; styling only.
DrugsView.jsx:117 — “Open fractures” header beside clinical regimens: explicit 10px → eyebrow's 11px; styling only.
DrugsView.jsx:119 — “p.3–4 →” link: 11px → 12px; styling only.
DrugsView.jsx:149 — “Dosing table” header: explicit 10px → eyebrow's 11px; styling only.
DrugsView.jsx:151 — “p.4 →” link: 11px → 12px; styling only.
DrugsView.jsx:157 — {dosingTable.adultLabel}: explicit 10px → eyebrow's 11px; styling only.
DrugsView.jsx:165 — {dosingTable.pediatricLabel}: explicit 10px → eyebrow's 11px; styling only.
DrugsView.jsx:181 — “Named only in passing”: text-xs → text-[12px]; styling only.
DrugsView.jsx:197 — primary/alternative UseList {title}: explicit 10px → eyebrow's 11px; styling only.
DrugsView.jsx:201 — indication link {ind.short}: py-1.5 → py-1; styling only.
DrugsView.jsx:205 — {render(ind)}, whole regimen/alternative: mt-1 → mt-0.5; styling only; remains 13px.

FeverWorkupView.jsx:10 — {fw.title}: 26px → 24px below sm; styling only.
FeverWorkupView.jsx:20 — branch grid: gap-3.5 → gap-3; styling only.
FeverWorkupView.jsx:24 — {b.title}: 19px → 18px; styling only.
FeverWorkupView.jsx:31 — criteria wrapper: mt-3.5 → mt-3; styling only.
FeverWorkupView.jsx:32 — {b.criteria.lead}, including conditions/thresholds: explicit 10px → eyebrow's 11px; styling only.
FeverWorkupView.jsx:34 — {b.criteria.items}: 13.5px → 15px; styling only.
FeverWorkupView.jsx:49 — {b.steps}: mt-3.5 14px → mt-3 15px; styling only.
FeverWorkupView.jsx:62 — “Then” outcome label: explicit 10px → eyebrow's 11px; styling only.
FeverWorkupView.jsx:63 — {b.outcomes}, thresholds/actions/durations: 13.5px → 15px; styling only.
FeverWorkupView.jsx:69 — {b.note}, blood-culture qualifier: 12px → 13px; styling only.
FeverWorkupView.jsx:77 — reference-standard heading beside p.5: 19px → 18px/sm:20px; styling only.
FeverWorkupView.jsx:97 — transcription disclosure and page-5 PDF link wrapper: 12px → 13px; styling only.

Footer.jsx:7 — transcription warning/source/date wrapper: 12px → 13px; styling only.
Footer.jsx:10 — “Transcription notice”: explicit 10px → eyebrow's 11px; styling only.

IndicationsView.jsx:127 — alternative-column explanatory text: text-balance removed; styling only.
IndicationsView.jsx:175 — cross-link {blurb}, including PMG page references: text-xs → 13px leading-snug; styling only.
IndicationsView.jsx:193 — empty-state diagnosis/drug examples: text-sm → 14px; styling only.
IndicationsView.jsx:203 — clinical section list: space-y-7 → space-y-6; styling only.
IndicationsView.jsx:209 — section header: shared title/blurb/count flex row → separate title and blurb rows; structure/position changed, strings unchanged.
IndicationsView.jsx:210 — title wrapper: min-w-0 block → flex flex-wrap gap-x-3 gap-y-1; structure/position changed.
IndicationsView.jsx:213 — {section.title}: adds min-w-0; sm:22px → sm:24px; styling only.
IndicationsView.jsx:218 — searching count/page: old unconditional trailing span → SectionCount beside title; conditional placement changed, information retained.
IndicationsView.jsx:221 — non-search blurb/count: new mt-1 flex row; structure/position changed.
IndicationsView.jsx:222 — {section.blurb}: 12px mt-0.5 → 13px leading-snug min-w-0; styling only.
IndicationsView.jsx:223 — non-search count/page: old unconditional trailing span → SectionCount beside blurb; conditional placement changed, information retained.
IndicationsView.jsx:248 — inline count markup → SectionCount({n,page}) helper; component structure changed; no defaults.
IndicationsView.jsx:250 — count/page chip: removes mb-0.5, adds shrink-0 ml-auto; styling only.
IndicationsView.jsx:251 — {items.length} · p.{section.page} → {n} · p.{page}; prop substitution, same caller data/order.
IndicationsView.jsx:257 — duplicated page markup → PageChip({page}) helper; component structure changed; no default.
IndicationsView.jsx:259 — page chip: regular 10px → 11px plus nowrap; N/A px-2 → px-1.5; styling only.
IndicationsView.jsx:260 — p.{ind.page} → p.{page}; prop substitution, same caller data.
IndicationsView.jsx:278 — alternative-column label: explicit 10px → eyebrow's 11px; styling only.
IndicationsView.jsx:292 — Field: 6.5rem/two columns at every width → single column below sm, 8.5rem/value columns at sm; gap-y-1, py-2, px-3; visual structure changed.
IndicationsView.jsx:296 — Field {label}: pt-0.5 → sm:pt-0.5; explicit 11px removed; styling only.
IndicationsView.jsx:297 — Field {children}, duration/redose/alternative: 14px → 15px; styling only; min-w-0/break-words retained.
IndicationsView.jsx:355 — N/A content: py-3 flex baseline row → py-2.5 block; structure/position changed.
IndicationsView.jsx:356 — N/A title/page: new flex items-start row; structure/position changed.
IndicationsView.jsx:357 — {ind.short}: block → flex-item title, adds uppercase break-words min-w-0; styling only, visible casing changed.
IndicationsView.jsx:358 — inline {ind.short} moved into restructured title span; position changed, text unchanged.
IndicationsView.jsx:361 — N/A page group: new flex gap-2 shrink-0 wrapper; structure/position changed.
IndicationsView.jsx:362 — N/A p.{ind.page} span → PageChip; component structure changed, page unchanged.
IndicationsView.jsx:363 — absent → aria-hidden size-4 chevron spacer; structure/position changed.
IndicationsView.jsx:366 — N/A explanation moved below title/page row, mt-0.5 → mt-1; structure/position changed, wording unchanged.
IndicationsView.jsx:379 — expandable title/summary wrapper: py-3 → py-2.5; styling only.
IndicationsView.jsx:381 — {ind.short}: sm:16.5px → sm:16px; styling only.
IndicationsView.jsx:385 — expandable-card page span → PageChip; component structure changed, page unchanged.
IndicationsView.jsx:399 — expanded clinical wrapper: pb-4 pt-1 → pt-3 pb-3.5; styling only.
IndicationsView.jsx:401 — full PMG row-name wrapper: p-2 → px-2.5 py-2; styling only.
IndicationsView.jsx:402 — “PMG row”: explicit 10px and pt-0.5 removed; styling only.
IndicationsView.jsx:407 — regimen wrapper: pt-1 removed; styling only.
IndicationsView.jsx:408 — “Regimen”: explicit 10px removed; mb-1.5 → mb-2; styling only.
IndicationsView.jsx:418 — duration/redose/alternative <dl>: pt-1 removed; styling only.
IndicationsView.jsx:430 — PMG page/copy-link footer: pt-2 → pt-3; styling only.

OpenFracturesView.jsx:16 — “Open extremity fractures”: 26px → 24px below sm; styling only.
OpenFracturesView.jsx:42 — “Timing · PMG p.3”: explicit 11px → eyebrow's 11px; styling only.
OpenFracturesView.jsx:54 — antimicrobial heading: 19px → 18px below sm; styling only.
OpenFracturesView.jsx:63 — antimicrobial regimen container: p-3.5 → p-3; styling only.
OpenFracturesView.jsx:71 — {a.applies}/page header wrapper: mb-2.5 → mb-2; styling only.
OpenFracturesView.jsx:73 — p.{a.page}: 10px → 11px; styling only.
OpenFracturesView.jsx:77 — regimen <ol>: space-y-1.5 removed; styling only; Plus still separates partners.
OpenFracturesView.jsx:89 — renal/pharmacy footnotes <dl>: mt-3.5 → mt-3; styling only.
OpenFracturesView.jsx:106 — “Duration”: 19px → 18px below sm; styling only.
OpenFracturesView.jsx:112 — {d.applies}: 14px → 15px; styling only.
OpenFracturesView.jsx:113 — {d.value}: 13px → 14px; styling only.
OpenFracturesView.jsx:117 — debridement container: p-3.5 → p-3; styling only.
OpenFracturesView.jsx:118 — {of.debridement.heading}: explicit 11px → eyebrow's 11px; styling only.
OpenFracturesView.jsx:121 — {of.debridement.items}: 14px → 15px; styling only.
OpenFracturesView.jsx:136 — {of.classification.title}: 19px → 18px below sm; styling only.
OpenFracturesView.jsx:143 — {t.description} and inherited subtype descriptions: 14px → 15px; styling only.
OpenFracturesView.jsx:163 — femoral-fracture heading: 19px → 18px below sm; styling only.
OpenFracturesView.jsx:169 — stable/unstable rule grid: mt-3.5 → mt-3; styling only.
OpenFracturesView.jsx:171 — stable/unstable rule container: p-3.5 → p-3; styling only.
OpenFracturesView.jsx:172 — {g.label}: explicit 11px → eyebrow's 11px; styling only.
OpenFracturesView.jsx:176 — {g.items}, timing/sequencing rules: 14px → 15px; styling only.

SourceView.jsx:36 — {source.title}: 17px/sm:18px → 18px; styling only.
SourceView.jsx:49 — source-PDF link: text-sm → 14px; styling only.
SourceView.jsx:58 — {source.intro}: 13px → 14px; styling only.
SourceView.jsx:67 — reviewing-physician heading: 19px → 18px/sm:20px; styling only.
SourceView.jsx:69 — verification-limit explanation: 13px → 14px; styling only.
SourceView.jsx:74 — checked/not-checked lists, page associations: 13px → 14px; styling only.
SourceView.jsx:76 — “Checked against the PDF”: explicit 10px → eyebrow's 11px; styling only.
SourceView.jsx:84 — “Not checked”: explicit 10px → eyebrow's 11px; styling only.
SourceView.jsx:92 — introduction to physician-review flags: 13px → 14px; styling only.
SourceView.jsx:106 — correction-list heading: 19px → 18px/sm:20px; styling only.
SourceView.jsx:107 — interpretation/correction explanation: 13px → 14px; styling only.
SourceView.jsx:112 — {transcription.corrections}, including drug/clinical labels: mt-3.5 13.5px → mt-3 14px; styling only.
SourceView.jsx:132 — “Antibiogram”: 19px → 18px/sm:20px; styling only.
SourceView.jsx:133 — antibiogram page/period explanation: 13.5px → 14px; styling only.
SourceView.jsx:142 — antibiogram-source link: text-sm → 14px; styling only.
SourceView.jsx:153 — references heading beside PMG p.12: 19px → 18px/sm:20px; styling only.

Toolbar.jsx:46 — clinical search terms/placeholder: pl-11 pr-12 → pl-10 conditional pr-12/pr-3 plus text-ellipsis; styling only, input remains 16px.
Toolbar.jsx:67 — alternative-column toggle: px-3.5 → px-3, narrower phone tracking/gaps; styling only, label/action unchanged.
Toolbar.jsx:75 — alternative-state indicator: size-2.5 → size-2 below sm; styling only.

shared.jsx:57 — OrderLine drug/dose/frequency wrapper: gap-y-1.5 px-3.5 → gap-y-1 px-3; styling only.
shared.jsx:63 — clickable drug/footnote name: 16px/sm:17px → 16px; styling only.
shared.jsx:68 — non-clickable drug/footnote name: 16px/sm:17px → 16px; styling only.
shared.jsx:74 — {fmtDose(dose)}: sm:21px → sm:20px; styling only.
shared.jsx:80 — {frequency} and adjacent {note}: 12px text-soft → 13px text-prose; styling only.
shared.jsx:92 — Plus connector wrapper: py-0.5 → py-1; styling only.
shared.jsx:94 — “plus”: explicit 10px removed, leading-none added, py-0.5 → py-1; styling only.
shared.jsx:102 — Regimen <ol>: space-y-1.5 removed; styling only.
shared.jsx:124 — inline combination “+”: text-xs → 12px; styling only.
shared.jsx:136 — {r.frequency}: 10px → 12px; styling only.

src/index.css:149 — body: default wrapping → text-wrap: pretty; styling only, inherited clinical reflow including print.
src/index.css:160 — search cancel pseudo-element: native appearance → appearance:none; native control visibility changed, app clear control retained.
src/index.css:161 — search decoration pseudo-element: explicit appearance:none added; styling/native decoration visibility only.
```

The removed `text-[10px]` classes on `.eyebrow` elements are authored-class changes; their former computed size should not be assumed to have been 10px without considering the custom utility’s cascade.

**ANSWERS**

**A. Clinical content.**  
`git status --short -- src/data/pmg.js` and `git … diff HEAD -- src/data/pmg.js` both produced **empty output**. No file under `src/` outside `src/components/*` and `src/index.css` changed. **No findings of changed clinical strings, substituted data fields, reordered regimen entries or removed clinical content.** Internal consistency is not clinical verification.

No new clinical `hidden`, `sr-only`, line clamp, reverse order or grid-placement manipulation was introduced. Existing disclosure panels retain their `open`, `inert` and `aria-hidden` relationships. Existing `overflow-hidden` remains on cards/panels; existing `truncate` in DosingView affects app-authored brand/class metadata, not the dose. New ellipsis is limited to search. Page chips use nowrap; clinical values retain wrapping. Fixed grids, emergency word wrapping and global `pretty` warrant the explicitly unmeasured checks in findings 6–7.

**B. JSX / logic.**  
**No findings.** Changed class templates contain complete literal classes, spaces and explicit ternary branches; no new `"undefined"`/`"false"` class emission or dynamically assembled Tailwind size was found. Keys and clinical mapping expressions remain intact.

`SectionCount` and `PageChip` have no defaults: missing/empty values render incomplete text such as `· p.` or `p.`, not an exception; numeric zero renders `0`. Every current call supplies valid data, and visible sections exclude zero-item groups. Searching retains title/count/page while hiding the same blurb as before; non-searching retains all three. New helpers are text spans, do not require keys outside mapped lists, and introduce no interactive accessibility semantics.

**C. Layout — static analysis only.**

- **Field:** Without explicit columns, its two direct children auto-place in one column: label then value. At `sm` (640px), columns are `8.5rem minmax(0,1fr)`—136px at the default root size—with a 12px column gap. The row gap is 4px. All `children` remain inside one `<dd>`, so multiple children cannot spill into another grid cell. A missing label leaves an empty `<dt>` rather than shifting values into its column; current callers all supply labels.
- **Section headers:** Non-search titles have a dedicated row. During search, title comes before count; flex wrapping can move count to the next line, where `ml-auto` right-aligns it. The count never precedes the title. Exact wrapping at 320–400px **cannot be determined by static analysis**.
- **N/A cards:** Both card types now use matching page-chip/gap/16px-chevron geometry. The spacer reserves 24px including its gap, reducing title space but not the separate N/A explanation’s width. It is aria-hidden and causes no extra vertical row.
- **Plus/list spacing:** All uses put Plus before entries with `i > 0`. No leading/trailing Plus or nested-regimen exception exists. A one-item list has no connector. The connector supplies symmetric outer padding; removing list margins does not make adjacent OrderLines touch.
- **Search:** Query and clear-button visibility use the same condition. A nonempty query reserves 48px on the right for a 44px button positioned 2px from the edge. Padding changes available text width by 36px, not the input’s outer width or left text origin; long text/caret scrolling can visibly readjust. Input ellipsis/placeholder painting is browser-dependent. The input remains explicitly **16px**; `text-base` is only stale documentation.
- **Alternatives:** At 320/360/375px, the button is nonshrinking, its label is nowrap, and the search field absorbs remaining width. The new padding/tracking/gap choices reduce its width. There is no new clipping rule; exact fit and remaining readable search width **cannot be determined by static analysis**.
- **BottomNav:** Six equal cells are approximately 53.33px at 320px; labels are 11px with tight tracking. No label clipping/ellipsis is applied. Whether the longest unbroken word fits requires font/render verification; “By drug” may wrap if constrained.
- **Tablet tabs:** Available row widths are approximately 616px at 640px and 744px at both 768/1024px, assuming ordinary safe-area values. `overflow-x-auto` preserves access when content is wider. The claimed 731px content width was not measured here; therefore actual fit at those widths remains unverified.
- **Notice/brand:** Verification wording is unchanged and always rendered on screen. Notice typography is 13px semibold inherited sans; it has no clamp or hide condition. Brand wrapping remains enabled, but its exact 360px fit and the notice’s two-line claim were not measured.

**D. Accessibility.**  
No findings of removed accessible names, ARIA states, focus styling or newly broken heading relationships. The global focus-visible outline remains; search retains its explicit focus border/ring, and the notice retains its inset outline. The overview’s existing heading hierarchy was not changed by helper extraction.

The app clear button remains a native, focusable **44×44px** button named **“Clear search”**. It is absent from DOM/tab order when empty. Keyboard users can activate it or select/delete input text. No app Escape handler exists before or after this patch; browser-native Escape behavior was not tested. Safari/WebKit receives the cancellation styling; Firefox’s native search UI and treatment of the vendor pseudo-elements require browser verification. No cross-browser Escape guarantee follows from this code.

**No new color/contrast findings.** Theme tests pass; the existing fixed black-on-yellow Alternatives exception remains explicitly allowed. Changed foregrounds use tokens, and no new text-opacity modifier was introduced. The theme test does not prove every arbitrary alpha composition, dynamically generated style or stylesheet declaration safe; manual review found no new bypass in this diff.

Class-derived undersized targets, assuming default root size and one text line:

| Target | Working-tree location | Derived size/height |
|---|---|---:|
| Indication links | `DrugsView.jsx:201` | 29px high; reduced from 33px |
| Drug-name buttons | `shared.jsx:63` | 36px high; formerly 37.5px at `sm` |
| Page links | `DrugsView.jsx:119`, `:151` | 34px high |
| PDF / antibiogram buttons | `SourceView.jsx:49`, `:142` | 41px high |
| Verification notice link, if one line | `BrandBar.jsx:74` | 29.875px high |
| Page-5 inline PDF link | `FeverWorkupView.jsx:102` | 17.875px line box; no added target padding |

Existing nearby targets also remain below 44px: home mark/link about 40px high, CopyLink minimum 36px, open-fracture dosing link 38px, reference-standard links 41px, and ordinary inline links without target padding. These are static target-size observations, not measured browser boxes or blanket WCAG failure claims. Search/toggle are 48px high, ThemeToggle and clear are 44px square, expandable card buttons retain 52px minimum height, and bottom navigation is 56px high.

**E. Type test.**  
Both tests **pass**. The ordinary runner initially encountered bracket-glob resolution, then sandbox `spawn EPERM`; using escaped brackets and `--test-isolation=none` succeeded without writing:

```text
node --test --test-isolation=none "C:/Thiago/OneDrive/[[]3[]] Claude/ACS Antibiotics/tests/type.test.js"
tests 2; pass 2; fail 0
```

Exercising the real guard confirmed:

| Case | Result |
|---|---|
| `text-[13.5px]`, numeric off-scale px | Rejected |
| `text-[0.8rem]`, `text-[1em]` | Rejected |
| Leading-dot `.5rem`, %, vw, functions, variables, `length:` hints | Missed |
| `sm:`, `md:`, hover, data variants, `!`, `[&>*]:` with recognized sizes | Detected |
| `/6`, `/[1.5]` line-height suffixes | Size detected; suffix not validated |
| Literal complete classes inside templates | Detected |
| Interpolated/concatenated class fragments | Missed; may also evade Tailwind generation |
| Named `xs`, `sm`, `base`, `lg`, `xl`, `2xl`–`9xl` | All rejected |
| Listed alignment/color/wrapping/ellipsis utilities, hex and color hints | No false positives |
| `@apply text-[10px]`, including inside print | Detected |
| CSS/inline/SVG size declarations or font shorthand, including print | Missed |
| Forbidden class mentioned only in a comment | False positive |

The control uses the **real `offScale` and SCALE**, so disabling matching or removing the scale-membership rejection makes it fail. It does not test every scale entry, role assignment, scan-path coverage, or whether the main test’s assertion itself was removed.

**F. `text-wrap: pretty`.**  
Chrome supports it from 117; Safari from 26. Firefox support is still listed as absent by the Web Features project. Unsupported browsers retain ordinary wrapping. [Chrome documentation](https://developer.chrome.com/blog/css-text-wrap-pretty/), [Safari release documentation](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), [Web Features support data](https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-pretty/)

It is inherited, including into clinical blocks and potential form-control descendants unless another rule/native control overrides it. Buttons can inherit it; single-line input behavior remains governed by native input layout; no textarea exists here. Monospace is not an exemption. The “tables” are mostly grids/lists, and print does not reset this property. Explicit `text-balance`/nowrap rules override relevant wrapping behavior. It changes selection among permitted breaks and does not preserve semantic number/unit groups. [CSS Text specification](https://www.w3.org/TR/css-text-4/#text-wrap-style)

**No demonstrated performance defect.** These are short blocks, not enormous paragraphs; actual timing was not measured. WebKit specifically distinguishes ordinary paragraphs from exceptionally long blocks when discussing cost. [WebKit implementation discussion](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)

**G. Documentation.**  
The changed claims were checked against source and the permitted tests:

- The twelve listed authored size steps match SCALE; the former **nineteen** arbitrary pixel values were independently counted from HEAD. The rendered-size floor and universal enforcement claims have the exceptions above.
- Pill frequencies are 12px; OrderLine frequencies are 13px. The universal 15px clinical-text claim is false as described.
- Field breakpoints, 8.5rem column, count branching, spacer, Plus placement, navigation breakpoints and 11px bottom labels match source.
- Search cancellation styling and conditional padding exist; guaranteed native behavior/ellipsis and exact measured wrapping are not established here.
- The new test is included by `tests/*.test.js`, and `build` invokes tests first. Theme/type test descriptions are accurate only within their actual coverage.
- Added historical statements about when the owner requested the pass cannot be independently verified from code. No new test-count discrepancy was found; the unchanged 54 verifier-controls claim was not rerun.
- Version is **0.4.0** in `package.json`, lockfile root and `packages[""]`. Package/lock diffs change only those versions.

The author’s description omits some details: N/A titles now display uppercase; OrderLine frequencies also change color from `text-soft` to `text-prose`; several introductions lose explicit `text-balance`; named-size replacement also changes inherited line-height where no explicit leading utility exists; clinical navigation targets shrink. These fit the broad styling scope, but are additional effects worth recording.

**H. Binary/icons.**  
**No findings.** PNG signatures and IHDR dimensions were read without decoding or rendering artwork:

| File | IHDR dimensions |
|---|---:|
| `apple-touch-icon.png` | 180×180 |
| `favicon-16.png` | 16×16 |
| `favicon-32.png` | 32×32 |
| `og-image.png` | 1200×630 |
| `pwa-192.png` | 192×192 |
| `pwa-512.png` | 512×512 |
| `pwa-maskable-512.png` | 512×512 |

All referenced PNGs and the source PDF exist. Dimensions match filenames/configuration/generator expectations. The requested `[System.IO.File]::ReadAllBytes` call was blocked by PowerShell constrained language mode; equivalent read-only `Get-Content -Encoding Byte` supplied the IHDR bytes. This environment limitation is not a finding. `scripts/gen-icons.mjs` changes only its header comment.

**I. Other issues.**  
**No additional findings** in build syntax, import paths, service-worker/update configuration, offline asset references or print overrides. No build or service-worker execution was performed. `git diff --check` found no whitespace errors. Theme tests passed **13/13** with the same in-process runner.

No private-key/service-account patterns or root `.env` files were found in the inspected source, scripts, tests and configuration. No Firebase web config was treated as secret. No files were modified, created, deleted, staged or committed.

**NOT CHECKED**

- Browser rendering, exact line breaks, font metrics, clipping, viewport fit, computed styles, assistive technology, Safari/Firefox cancellation/Escape behavior, iOS zoom and real touch acquisition: prohibited/unavailable.
- Clinical correctness or agreement with the PDF: requires human review; unchanged data and passing tests do not establish it.
- Builds, installation, servers, full suite, `pmg.test.js` execution, verifier controls, PDF tooling, deployment and live/offline update behavior: not run under the requested restrictions.
- Icon artwork quality, regeneration reproducibility and installed launcher masking: dimensions/references only.
- Local `node_modules/` and `dist/`: not inspected. The cited default superscript rule was checked in upstream Tailwind’s versioned source.
````

---

## Dispositions (Claude, not Codex)

Every finding was acted on. None was dismissed. The fixes were checked by `npm test` (82 tests),
`npm run verify` (PASS) and headless-Chrome measurements at 320–768px. **They were not re-reviewed
by Codex.**

1. **[Medium] The font-size guard accepted off-scale sizes — fixed.** `tests/type.test.js` now scans
   every file under `src/`, plus `index.html` and `tailwind.config.js`. It rejects:
   - any `text-[…]` value that is not a scale step in px, including `length:` hints, rem, %, vw,
     `calc()`, `clamp()` and an interpolated `text-[${…}]`;
   - Tailwind's named sizes;
   - CSS `font-size` and `font` declarations, inline and SVG font sizes, and a `fontSize` theme key;
   - a `<sup>` or `<sub>` without its own size.

   Each bypass Codex listed is now a control case, with one exception: `text-[var(--small)]` is
   treated as a colour, which is how Tailwind reads it (`color: var(--small)`); colours are governed
   by `tests/theme.test.js`. Comments are still scanned, which errs toward a false alarm. The docs
   now say the guard reads source, not computed styles.

2. **[Low] Footnote marks below 11px — fixed.** The By-drug fracture summary's `<sup>` is
   `text-[11px]`, and the guard now requires an explicit size on every `<sup>`/`<sub>`.

3. **[Low] The 15px rule was not implemented consistently — fixed, and the rule restated
   precisely** (project `CLAUDE.md`, *Type scale*).
   - Fracture durations and By-drug dosing lines are now 15px, like the dosing table.
   - The collapsed alternative preview and By-drug lists are 14px, documented as summaries.
   - The fever-workup criteria leads are now 15px sentences in the PDF's own capitals ("PLUS any
     TWO"). They were 11px uppercase eyebrows.

   This fix exposed an older bug. `.eyebrow` sat in Tailwind's utilities layer, after the size,
   font and tracking utilities, so every such override on an eyebrow had rendered as 11px Chakra
   Petch since the redesign. That includes the fracture regimen labels written as `text-[12px]` and
   the "or" separators written as `font-mono`. `.eyebrow` now lives in `@layer components`, and the
   eyebrows that say who a regimen or dose applies to, or give a timing rule, are 12px:
   - the fracture regimen labels;
   - the dosing age labels;
   - the debridement heading;
   - the femoral-shaft labels.

   The quoted clinical values are unchanged; `src/data/pmg.js` was not touched. Like every value in
   the app they still need a physician's check against the PDF, and the banner stays.

4. **[Low] An indication link's touch target shrank — reverted** to `py-1.5` (33px, as in v0.3.1).
   The other targets Codex measured under 44px were already that size in v0.3.1. This pass did not
   change them.

5. **[Low] The docs stated unverified measurements as fact — fixed.**
   - The measurements are now attributed: headless Chrome 154, 2026-10-06, against a rebuild of
     v0.3.1. The docs say they cannot be reproduced from source.
   - The search-padding sentence names `pr-12` and `pr-3`.
   - `text-wrap: pretty` is described as making a lone last word less likely in Chrome 117+ and
     Safari 26+.
   - `CLAUDE.md` now says `text-[16px]` for the search input.
   - The README's claim about what the test enforces is narrowed.

6. **[Info] The fracture-duration label could collapse on phones — fixed.** Below `sm` the rows put
   the type above the duration; they sit side by side from `sm` up.

7. **[Info] Wrapping did not keep clinical tokens together — measured, then fixed.**
   - A scan of every view with every card open, at 320, 360, 375, 390, 414 and 768px, found numbers
     split from their units in v0.3.1 itself: "8 / days" at 375px, and "15 / mg/kg" at 414px,
     because the thin space `fmtDose` inserted was a break opportunity. The first v0.4.0 draft had
     32 such splits.
   - New `src/lib/text.js`: `fmtDose` uses a narrow no-break space, and `keepUnits` joins a number
     to its unit, and a sign to its number, with a no-break space wherever clinical text is rendered.
   - `tests/text.test.js` checks that the helpers change nothing but spaces in all 707 strings in
     the data.
   - The final build has 0 splits in 1,596 number–unit and sign–number pairs.

**Also changed after the review, not prompted by it:** Field labels and the "PMG row" label now sit
on their values' baselines (`items-baseline`). They had been 1–2px off; the measured offset is now 0
at 375 and 768px.

**Protected categories.** Codex marked findings 2, 3, 4, 6 and 7 and its whole ledger as
CLINICAL-FLAG. This pass changed only how values are presented; no value changed. None of the
values has been verified against the PDF by a physician. Nothing was rated high severity, and Codex
reported no secrets.
