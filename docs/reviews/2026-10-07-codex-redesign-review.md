# Codex peer review — v0.6.0 restyle (dose plates and section spines), 2026-10-07

**Engine:** OpenAI Codex CLI v0.160.1, model `gpt-6-astra`, reasoning effort `high`, `sandbox: read-only`
(header confirmed on every run), working directory `C:\Users\tac02\acs-variants\claude` — the `design/claude`
worktree at `f2d0b27`, whose ten changed files are byte-identical to merge commit `b239aa1` on `main`.
**Scope:** `git diff 747d13e f2d0b27` — `src/index.css`, `tailwind.config.js`, `src/components/shared.jsx`,
`IndicationsView.jsx`, `DosingView.jsx`, `DrugsView.jsx`, `OpenFracturesView.jsx`, `FeverWorkupView.jsx`,
`tests/theme.test.js`, `DESIGN-NOTES.md`. Codex confirmed `src/data/pmg.js` is not in the diff
(`git diff --stat 747d13e f2d0b27 -- src/data/pmg.js` printed nothing) and that `npm test` passes 83/83.
**Single engine for what it covered; Gemini reviewed the rest** (`2026-10-07-gemini-redesign-review.md`).
Neither is clinical verification: no value in `src/data/pmg.js` changed, and none was verified.

| Run | Command | Result |
|---|---|---|
| 1 | `codex review --base 747d13e -c model="gpt-6-astra" -c sandbox_mode="read-only"` | 76 s. One finding, [P2]. |
| 2A | `codex exec --sandbox read-only -m gpt-6-astra`, directed questions (a) contrast matrix, (b) sticky geometry and deep links, (c) phone wrapping, (d) print | 10 min 40 s. Three findings (1 Medium, 2 Low) and full answers. |
| 2B | same, questions (e) accessibility, (f) clinical display lines, (g) type scale and guard tests, (h) omissions and CLAUDE.md contradictions | **Did not complete.** After the tree evidence, the diff, the docs and an 83/83 test run, Codex hit its usage limit: `ERROR: You've hit your usage limit … try again at Oct 8th, 2026 1:03 AM`. No findings. Those questions went to Gemini. |

Tree evidence as the relaying agent recorded it: run 1 opened with `pwd; git status --short; git diff --stat 747d13e…`
in the worktree (clean; 10 files, +320 −159, matching an independent count); run 2A echoed HEAD
`f2d0b273ba8afc4ba8055a32d29262632d5da092`, `src/index.css` at 318 lines beginning `@tailwind base;`,
and an empty `pmg.js` diff-stat. After all runs HEAD, status and the index mtime were unchanged and the main
checkout was clean. The relaying agent dismissed nothing and recomputed four of Codex's figures by hand
(`#999` on white 2.849:1; dark `plate-line` on dark `card` 1.93:1; gold on white 1.805:1; `plate-dose` on
`plate` 10.461:1), all matching.

---

## Run 1 — `codex review --base 747d13e` (stdout, verbatim)

```text
The new sticky section headings do not persist while their indication lists scroll. All 83 tests pass with process isolation disabled, but they do not cover this layout behavior.

Review comment:

- [P2] Let the sticky section heading span its section — C:\Users\tac02\acs-variants\claude\src\components\shared.jsx:67-71
  When scrolling through indications, the heading cannot remain below the app header because its sticky positioning is constrained by the immediate `mb-2` wrapper, which contains only the heading and blurb—not the indication list. It scrolls away once that short wrapper leaves the viewport; during searches, omitting the blurb leaves essentially no sticky travel. Restructure the wrapper so the sticky heading's containing block includes the section's rows, keeping the blurb outside the sticky element.

```

## Run 2A — directed `codex exec`, questions (a)–(d) (final message, verbatim)

## TREE EVIDENCE

Verbatim combined output of the opening commands, including PowerShell’s deferred `Get-Location` formatting:

```text

f2d0b273ba8afc4ba8055a32d29262632d5da092
Path                              
----                              
C:\Users\tac02\acs-variants\claude
318
@tailwind base;


```

The `src/data/pmg.js` diff-stat command produced **no output**. HEAD matches the expected commit. `git status --short` also produced no output.

## FINDINGS

**[Medium] The sticky heading cannot stay above its indication list — src/components/shared.jsx:67**

- **Evidence:** The sticky element at `src/components/shared.jsx:69` belongs to an outer `div` containing only that element and the optional blurb. The indication `Group` is its sibling, outside that containing block: `src/components/IndicationsView.jsx:212` and `src/components/IndicationsView.jsx:219`. Without a blurb, the parent is exactly the heading’s height, leaving no sustained sticky travel. With a blurb, travel is limited to the blurb’s height plus its 4px top margin.
- **Effect:** In both schemes and at every viewport, the section title scrolls away before its list has passed. The behavior claimed in `DESIGN-NOTES.md:59` does not occur.

**[Low] The dark plate edge fails the requested boundary contrast — src/index.css:142**

- **Evidence:** `Plate` uses an inset `plate-line` ring at `src/components/shared.jsx:130`. Dark `plate-line (71,85,105)` measures **1.931:1** against `card (30,41,59)`, **2.356:1** against `well (15,23,42)`, and **2.492:1** against the plate itself. All are below 3:1. The added matrix checks omit this token: `tests/theme.test.js:104`.
- **Effect:** Dark plates have a weak separating edge on their surrounding surfaces. Their text remains high contrast; this is not an unreadable-dose finding.

**[Low] Printed plate borders and drug-link underlines fall below 3:1 — src/index.css:295**

- **Evidence:** The new print border is `#999`, which measures **2.849:1** on white. The dotted drug-name underline explicitly uses `plate-soft/60` at `src/components/shared.jsx:157`. Print overrides `color`, but not `text-decoration-color`, at `src/index.css:285`. Its composite over white is `(229.2,229.2,229.2)`, only **1.257:1**.
- **Effect:** Printed boxes and dotted underlines are faint. Names, doses, routes, frequencies and footnote marks still print black.

No confirmed High-severity defect. The permitted test command passed **83/83 tests**. No secret-like material was found in the ten-file diff. No files were modified, and no build was run.

## ANSWERS

### (a) Contrast and matrix coverage

**No: the matrix does not cover every actual combination.** All actual text combinations examined pass 4.5:1. Several decorative boundaries fail the requested 3:1 threshold.

I computed WCAG relative luminance directly from the RGB triplets in `src/index.css`, using:

```text
c = channel / 255
linear(c) = c / 12.92                         when c ≤ 0.04045
            ((c + 0.055) / 1.055)^2.4        otherwise
L = 0.2126R + 0.7152G + 0.0722B
contrast = (lighter L + 0.05) / (darker L + 0.05)
```

For the plate, the calculated luminances are:

| Token | RGB | Luminance |
|---|---|---:|
| `plate` | 17,17,17 | 0.005605392 |
| `plate-ink` | 255,255,255 | 1.000000000 |
| `plate-soft` | 212,212,212 | 0.658374817 |
| `plate-dose` | 241,184,45 | 0.531712133 |

Token definitions: `src/index.css:76`, `src/index.css:138`. Class mappings: `tailwind.config.js:92`.

In the tables below, **L/D** means light/dark respectively. Where multiple backgrounds appear, ratios follow their listed order. “Fail” applies to the requested numerical threshold; decorative separators are not automatically WCAG violations.

| Pair | Foreground token and RGB | Background token and RGB | Scheme | Ratio | Threshold | Where used | Pass/fail |
|---|---|---|---|---:|---:|---|---|
| Drug name | `plate-ink` 255,255,255 | `plate` 17,17,17 | Both | 18.883 | 4.5 | src/components/shared.jsx:157 | Pass |
| Labels, routes, notes, “plus” | `plate-soft` 212,212,212 | `plate` 17,17,17 | Both | 12.739 | 4.5 | src/components/shared.jsx:166; src/components/shared.jsx:177; src/components/shared.jsx:246 | Pass |
| Dose, frequency, superscript, name hover | `plate-dose` 241,184,45 | `plate` 17,17,17 | Both | 10.461 | 4.5 | src/components/shared.jsx:145; src/components/shared.jsx:157; src/components/shared.jsx:164; src/components/shared.jsx:225 | Pass |
| Dimmed partner name **and dose** | `plate-soft` 212,212,212 | `plate` 17,17,17 | Both | 12.739 | 4.5 | src/components/shared.jsx:208; src/components/shared.jsx:220; src/components/shared.jsx:227 | Pass |
| Plate focus outline | `focus` L 13,148,136; D 45,212,191 | `plate` 17,17,17 | L/D | 5.043 / 10.144 | 3 | src/index.css:255; src/components/shared.jsx:157 | Pass |
| Drug-name dotted underline | `plate-soft/60`, composite 134,134,134 | `plate` 17,17,17 | Both | 5.187 | 3 | src/components/shared.jsx:157 | Pass |
| Outside plate edge | `plate-line` L 17,17,17; D 71,85,105 | `card` L 255,255,255; D 30,41,59 | L/D | 18.883 / 1.931 | 3 | src/components/shared.jsx:130; src/components/DosingView.jsx:33 | Pass / **Fail** |
| Outside plate edge | Same `plate-line` | `well` L 248,250,252; D 15,23,42 | L/D | 18.048 / 2.356 | 3 | src/components/IndicationsView.jsx:386; src/components/IndicationsView.jsx:396 | Pass / **Fail** |
| Outside highlighted fracture plate | Same `plate-line` | `warn-bg` L 255,251,235; D 69,26,3 | L/D | 18.209 / 1.977 | 3 | src/components/OpenFracturesView.jsx:50; src/components/OpenFracturesView.jsx:60 | Pass / **Fail** |
| Ring against plate interior | Same `plate-line` | `plate` 17,17,17 | L/D | 1.000 / 2.492 | 3 | src/components/shared.jsx:130 | **Fail**; light intentionally identical |
| Plate fill against card | `plate` 17,17,17 | `card` L 255,255,255; D 30,41,59 | L/D | 18.883 / 1.291 | 3 | src/components/shared.jsx:130 | Pass / **Fail** |
| Plate fill against well | `plate` 17,17,17 | `well` L 248,250,252; D 15,23,42 | L/D | 18.048 / 1.058 | 3 | src/components/IndicationsView.jsx:396 | Pass / **Fail** |
| “+” between pills | `muted` L 100,116,139; D 148,163,184 | `card` L 255,255,255; D 30,41,59 | L/D | 4.759 / 5.705 | 4.5 | src/components/shared.jsx:213; src/components/DrugsView.jsx:149 | Pass |
| “+” on hovered indication row | Same `muted` | `well` L 248,250,252; D 15,23,42 | L/D | 4.548 / 6.963 | 4.5 | src/components/shared.jsx:213; src/components/IndicationsView.jsx:368 | Pass |

**Premise correction:** By-drug pills sit inside `Block`’s **`bg-card`**, although the expanded panel surrounding that block is `bg-well`: `src/components/DrugsView.jsx:88` and `src/components/DrugsView.jsx:149`. Their connector is therefore evaluated against `card`. The collapsed indication hover supplies the `well` combination.

These are the remaining text combinations in the reviewed components. `paper` and `well` have identical RGB values in both screen schemes.

| Pair | Foreground token and RGB, L / D | Background token and RGB, L / D | Scheme | Ratio | Threshold | Where used | Pass/fail |
|---|---|---|---|---|---:|---|---|
| Heading/body emphasis | `ink` 15,23,42 / 248,250,252 | `card` 255,255,255 / 30,41,59 | L/D | 17.853 / 13.982 | 4.5 | src/components/DosingView.jsx:21; src/components/DrugsView.jsx:63 | Pass |
| Heading/field emphasis | Same `ink` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 17.063 / 17.063 | 4.5 | src/components/shared.jsx:73; src/components/IndicationsView.jsx:297 | Pass |
| Body text | `prose` 30,41,59 / 226,232,240 | `card` 255,255,255 / 30,41,59 | L/D | 14.629 / 11.866 | 4.5 | src/components/FeverWorkupView.jsx:41 | Pass |
| Body/hover icon | Same `prose` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 13.982 / 14.482 | 4.5 | src/components/FeverWorkupView.jsx:28; src/components/IndicationsView.jsx:377 | Pass |
| Secondary text | `soft` 71,85,105 / 203,213,225 | `card` 255,255,255 / 30,41,59 | L/D | 7.578 / 9.853 | 4.5 | src/components/DosingView.jsx:41; src/components/DrugsView.jsx:176 | Pass |
| Secondary text | Same `soft` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 7.243 / 12.024 | 4.5 | src/components/DosingView.jsx:8; src/components/IndicationsView.jsx:399 | Pass |
| Metadata/action icons | `muted` 100,116,139 / 148,163,184 | `card` 255,255,255 / 30,41,59 | L/D | 4.759 / 5.705 | 4.5 | src/components/DosingView.jsx:26; src/components/DrugsView.jsx:81 | Pass |
| Blurbs/labels | Same `muted` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 4.548 / 6.963 | 4.5 | src/components/shared.jsx:78; src/components/IndicationsView.jsx:395 | Pass |
| Links | `accent` 15,118,110 / 94,234,212 | `card` 255,255,255 / 30,41,59 | L/D | 5.473 / 9.889 | 4.5 | src/components/DrugsView.jsx:153 | Pass |
| Links | Same `accent` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 5.231 / 12.068 | 4.5 | src/components/IndicationsView.jsx:200; src/components/IndicationsView.jsx:324 | Pass |
| Link hover | `accent-hi` 17,94,89 / 153,246,228 | `card` 255,255,255 / 30,41,59 | L/D | 7.584 / 11.603 | 4.5 | src/components/DrugsView.jsx:153; src/components/OpenFracturesView.jsx:74 | Pass |
| Chip emphasis | `ink` 15,23,42 / 248,250,252 | `chip` 241,245,249 / 51,65,85 | L/D | 16.296 / 9.897 | 4.5 | src/components/IndicationsView.jsx:136; src/components/FeverWorkupView.jsx:9 | Pass |
| Chip text | `soft` 71,85,105 / 203,213,225 | Same `chip` | L/D | 6.917 / 6.974 | 4.5 | src/components/shared.jsx:86; src/components/IndicationsView.jsx:258 | Pass |
| Chip link | `accent` 15,118,110 / 94,234,212 | Same `chip` | L/D | 4.996 / 7.000 | 4.5 | src/components/FeverWorkupView.jsx:94 | Pass |
| Chip link hover | `accent-hi` 17,94,89 / 153,246,228 | Same `chip` | L/D | 6.922 / 8.213 | 4.5 | src/components/FeverWorkupView.jsx:94 | Pass |
| Alternative text | `warn-ink` 120,53,15 / 253,230,138 | `warn-bg` 255,251,235 / 69,26,3 | L/D | 8.748 / 12.026 | 4.5 | src/components/shared.jsx:16; src/components/IndicationsView.jsx:293 | Pass |
| Alternative label/icon | `warn-mark` 180,83,9 / 251,191,36 | Same `warn-bg` | L/D | 4.842 / 8.972 | 4.5 | src/components/IndicationsView.jsx:273; src/components/OpenFracturesView.jsx:57 | Pass |
| Footnote marks | Same `warn-mark` | `card` 255,255,255 / 30,41,59 | L/D | 5.022 / 8.763 | 4.5 | src/components/DosingView.jsx:23; src/components/DrugsView.jsx:127 | Pass |
| Timing/debridement text | `danger-ink` 136,19,55 / 254,205,211 | `danger-bg` 255,241,242 / 76,5,25 | L/D | 8.708 / 11.085 | 4.5 | src/components/shared.jsx:17; src/components/OpenFracturesView.jsx:33 | Pass |
| Timing/debridement label/icon | `danger-mark` 190,18,60 / 251,113,133 | Same `danger-bg` | L/D | 5.721 / 5.810 | 4.5 | src/components/OpenFracturesView.jsx:31; src/components/OpenFracturesView.jsx:95 | Pass |
| Fracture block heading | Same `danger-mark` | `card` 255,255,255 / 30,41,59 | L/D | 6.285 / 5.435 | 4.5 | src/components/DrugsView.jsx:105 | Pass |
| Timing numeral | Same `danger-mark` | `card/70` over danger: L 255,250.8,251.1; D 43.8,30.2,48.8 | L/D | 6.112 / 5.832 | 4.5 | src/components/OpenFracturesView.jsx:21 | Pass |
| Copy link hover | `accent` 15,118,110 / 94,234,212 | `accent-soft` 240,253,250 / 19,78,74 | L/D | 5.248 / 6.405 | 4.5 | src/components/IndicationsView.jsx:324 | Pass |
| Copied icon | `good-mark` 4,120,87 / 52,211,153 | `well` 248,250,252 / 15,23,42 | L/D | 5.241 / 9.286 | 3 | src/components/IndicationsView.jsx:327 | Pass |
| Copied icon on hover | Same `good-mark` | `accent-soft` 240,253,250 / 19,78,74 | L/D | 5.258 / 4.929 | 3 | src/components/IndicationsView.jsx:324; src/components/IndicationsView.jsx:327 | Pass |

Non-text combinations, including the newly emphasized spines:

| Pair | Foreground token and RGB, L / D | Background token and RGB, L / D | Scheme | Ratio | Threshold | Where used | Pass/fail |
|---|---|---|---|---|---:|---|---|
| Trauma spine/dot | `hue-trauma` 225,29,72 / 251,113,133 | `card` 255,255,255 / 30,41,59; `paper` 248,250,252 / 15,23,42 | L/D | Card 4.697/5.435; paper 4.489/6.633 | 3 | src/components/IndicationsView.jsx:211; src/components/OpenFracturesView.jsx:40 | Pass |
| EGS spine/dot | `hue-egs` 217,119,6 / 251,191,36 | Same card; paper | L/D | Card 3.186/8.763; paper 3.045/10.694 | 3 | src/components/IndicationsView.jsx:211; src/components/DrugsView.jsx:173 | Pass |
| Elective spine/dot | `hue-elective` 2,132,199 / 56,189,248 | Same card; paper | L/D | Card 4.095/6.829; paper 3.914/8.333 | 3 | src/components/IndicationsView.jsx:211; src/components/DrugsView.jsx:173 | Pass |
| Inpatient spine/dot | `hue-inpatient` 124,58,237 / 167,139,250 | Same card; paper | L/D | Card 5.699/5.375; paper 5.447/6.560 | 3 | src/components/IndicationsView.jsx:211; src/components/FeverWorkupView.jsx:17 | Pass |
| Fever trigger dot | Same `hue-inpatient` | `chip` 241,245,249 / 51,65,85 | L/D | 5.202 / 3.805 | 3 | src/components/FeverWorkupView.jsx:10 | Pass |
| Group/card/row rule | `rule` 226,232,240 / 51,65,85 | Card; paper/well as above | L/D | Card 1.233/1.413; paper/well 1.178/1.724 | 3 | src/components/shared.jsx:40; src/components/IndicationsView.jsx:386 | **Fail** |
| Chip border | Same `rule` | `chip` 241,245,249 / 51,65,85 | L/D | 1.125 / 1.000 | 3 | src/components/IndicationsView.jsx:135; src/components/FeverWorkupView.jsx:89 | **Fail** |
| Inner divider | `rule-soft` 241,245,249 / 45,57,80 | Card; well as above | L/D | Card 1.096/1.263; well 1.047/1.541 | 3 | src/components/shared.jsx:113; src/components/IndicationsView.jsx:413 | **Fail** |
| Empty-state boundary | `rule-strong` 130,146,168 / 120,136,160 | Card; paper as above | L/D | Card 3.169/4.060; paper 3.029/4.954 | 3 | src/components/IndicationsView.jsx:240 | Pass |
| Decorative icons/bullets | `faint` 148,163,184 / 100,116,139 | Card; well as above | L/D | Card 2.564/3.074; well 2.451/3.751 | 3 | src/components/IndicationsView.jsx:176; src/components/FeverWorkupView.jsx:31 | **Fail light**, pass dark |
| Warning boundary | `warn-line` 253,230,138 / 120,53,15 | `warn-bg` 255,251,235 / 69,26,3 | L/D | 1.201 / 1.651 | 3 | src/components/shared.jsx:16; src/components/IndicationsView.jsx:293 | **Fail** |
| Warning boundary exterior | Same `warn-line` | Card; well as above | L/D | Card 1.245/1.612; well 1.190/1.968 | 3 | src/components/IndicationsView.jsx:272; src/components/OpenFracturesView.jsx:50 | **Fail** |
| Danger boundary | `danger-line` 254,205,211 / 136,19,55 | `danger-bg` 255,241,242 / 76,5,25 | L/D | 1.284 / 1.634 | 3 | src/components/shared.jsx:17; src/components/OpenFracturesView.jsx:94 | **Fail** |
| Danger boundary exterior | Same `danger-line` | Card; paper as above | L/D | Card 1.411/1.529; paper 1.348/1.866 | 3 | src/components/OpenFracturesView.jsx:17; src/components/OpenFracturesView.jsx:94 | **Fail** |
| Timing box boundary | Same `danger-line` | Composite L 255,250.8,251.1; D 43.8,30.2,48.8 | L/D | 1.372 / 1.641 | 3 | src/components/OpenFracturesView.jsx:21 | **Fail** |
| Focus on card | `focus` 13,148,136 / 45,212,191 | `card` 255,255,255 / 30,41,59 | L/D | 3.744 / 7.859 | 3 | src/index.css:255; src/components/IndicationsView.jsx:348 | Pass |
| Focus on paper/well | Same `focus` | `paper`=`well` 248,250,252 / 15,23,42 | L/D | 3.579 / 9.590 | 3 | src/index.css:255; src/components/IndicationsView.jsx:324 | Pass |
| Focus on chip | Same `focus` | `chip` 241,245,249 / 51,65,85 | L/D | 3.418 / 5.563 | 3 | src/index.css:255; src/components/FeverWorkupView.jsx:94 | Pass |
| Focus on hovered copy link | Same `focus` | `accent-soft` 240,253,250 / 19,78,74 | L/D | 3.590 / 5.090 | 3 | src/index.css:255; src/components/IndicationsView.jsx:324 | Pass |

The weak general rules, tone borders and faint decorations largely predate this change. The plate edge is new. Hue spines are non-text, so the light trauma-on-paper ratio of 4.489 is **not** a text failure.

Print requires evaluating the overrides, not simply contrasting the surviving token values:

| Pair | Foreground token and actual RGB | Background and actual RGB | Scheme | Ratio | Threshold | Where used | Pass/fail |
|---|---|---|---|---:|---:|---|---|
| All text, including dim pills, gold doses, superscripts and “+” | All text tokens overridden to 0,0,0 | Transparent surfaces over white 255,255,255 | Print, either source theme | 21.000 | 4.5 | src/index.css:280; src/index.css:285 | Pass |
| Lucide strokes | `currentColor` → 0,0,0 | White 255,255,255 | Print | 21.000 | 3 | src/components/FeverWorkupView.jsx:44; node_modules/lucide-react/dist/cjs/lucide-react.js:23 | Pass |
| Borders/spines | All border tokens overridden to 153,153,153 | White 255,255,255 | Print | 2.849 | 3 | src/index.css:291; src/index.css:296 | **Fail** |
| Drug-name underline | `plate-soft/60` → composite 229.2,229.2,229.2 | White 255,255,255 | Print | 1.257 | 3 | src/components/shared.jsx:157; src/index.css:285 | **Fail** |
| Focus outline, if printed | `focus` → 0,0,0 | White 255,255,255 | Print | 21.000 | 3 | src/index.css:278 | Pass |

Background-only dots become transparent; rings and shadows disappear. They have no remaining printed foreground contrast to measure.

**Matrix omissions:** plate edges/fill boundaries, hue spines/dots, alpha underline, `accent-hi` on `chip`, `accent` and `good-mark` on `accent-soft`, focus on `accent-soft`, decorative boundaries, and print. The latter text/hover combinations pass when calculated; they are still absent from `tests/theme.test.js:92` through `tests/theme.test.js:125`.

**Incorrect claims:** `DESIGN-NOTES.md:18` says gold on white is 3.3:1; actual `plate-dose` on white is **1.805:1**. Its 11.6:1 plate-dose claim at `DESIGN-NOTES.md:56` is **10.461:1**. The approximately 14:1 soft-text claim at `src/index.css:75` is **12.739:1**. These errors do not make the actual plate text fail.

### (b) Sticky geometry, deep links and stacking

**What is the sticky parent?** The heading/blurb wrapper at `src/components/shared.jsx:67`, not the outer section and not `Group`. All four headings come through the same call at `src/components/IndicationsView.jsx:212`.

Let:

- `H` = sticky heading height.
- `B` = optional blurb height.
- `A` = measured app-header height.

The containing block has height `H` without a blurb, or `H + 4 + B` with one. Consequently, sustained sticky travel is **0px** without the blurb and at most **`4 + B` pixels** with it. The outer wrapper’s 8px bottom margin does not extend its containing block. Searching removes the blurb at `src/components/IndicationsView.jsx:217`.

**Does the offset account for the installed iPhone inset, `sm`, and enlarged text? Yes, once measurement has run.** `Header` includes safe-area padding and publishes `offsetHeight`, observing subsequent resizing: `src/components/Header.jsx:36`, `src/components/Header.jsx:38`, `src/components/Header.jsx:50`. The section reads that same variable at `src/components/shared.jsx:70`. `7.25rem` is only the fallback.

There is no intentional offset gap while the heading is actually stuck: its top is `A`, matching the app header’s bottom. However:

- The containing-block defect forces it upward under the app header almost immediately.
- `offsetHeight` is integer-valued; fractional rendered heights can produce subpixel discrepancies.
- Before the effect runs, the fallback is 116px at a 16px root size, not a measured height.

Thus **“never any gap or overlap” is not established**. Exact iPhone and font-change behavior **cannot determine from code**; it requires measuring both bounding rectangles in that environment.

**Do scroll padding and margin add? Yes.** For an unclamped root-scroll alignment:

```text
row top = A + 0.625rem + 3rem
        = A + 10 + 48
        = A + 58px             at a 16px root
```

Evidence: `src/index.css:167`, `src/components/IndicationsView.jsx:348`, and the actual `scrollIntoView` call at `src/components/IndicationsView.jsx:102`.

For the normal header structure, the CSS predicts:

```text
Phone: 18px brand padding + 40px controls + 44px search
       + 10px search padding + 2px bottom border = 114px
sm:    58px brand + 54px search + 1px tab rule
       + 19.5px tab line + 20px tab padding + 2px tab border
       - 1px tab margin = 153.5px → offsetHeight approximately 154px
```

These predict row landing positions of **172px** and **212px**, respectively. Add the measured safe-area contribution to the phone case. They are CSS calculations, not device measurements. Source: `src/components/Header.jsx:50`, `src/components/Header.jsx:56`, `src/components/Header.jsx:92`, `src/components/Header.jsx:143`, `src/components/Header.jsx:156`.

The heading is not inherently 44px tall. With a normal 16px root:

```text
H = 12px vertical padding + max(22.5px × title line count, aside line box)
```

With the normal inherited 24px aside line box:

- One title line: **36px**.
- Two title lines: **57px**.
- Three title lines: **79.5px**.

The 58px allowance clears the first two, but not three. Evidence: `src/components/shared.jsx:69`, `src/components/shared.jsx:73`, `src/components/IndicationsView.jsx:249`; default line-height: `node_modules/tailwindcss/lib/css/preflight.css:32`.

**Enlarged text:** there is no universal pixel answer because text-only zoom, browser zoom and root-font changes behave differently. For a defined example—200% text-only enlargement with rem spacing unchanged—the corresponding heading heights are **60px** for one title line and **102px** for two. The row still lands at `A_enlarged + 58px`; a correctly sustained heading would exceed that allowance by **2px** or **44px**. If rem spacing also scales, the allowance changes.

In the present code, that sustained heading generally does not exist when a later row lands, so this is a **latent limitation of the claimed offset**, not proof that the current sticky head hides a later row. Exact enlarged-text landing **cannot determine from code**. Scroll limits and the expanding row can also affect final alignment.

**Does its background mask scrolling rows and their edges?** The premise is false for the sustained interaction: the following list is outside the sticky parent. The head is pushed away before those rows can continue scrolling beneath it.

The head itself has an opaque, square `bg-paper` box and opaque 4px border. `Group` has rounded corners, clipping and a shadow: `src/components/shared.jsx:40`. A head of equal width does not mask shadow pixels extending outside the group’s border box. Also, there is an explicit 8px gap—and usually a blurb—between the head and list, so the “continuous spine” is not geometrically continuous. Pixel-level seams and antialiasing **cannot determine from code**.

**Any z-index conflict? No new conflicting stacking context is evident.**

- App header: sticky, z-40 — `src/components/Header.jsx:50`.
- Section head: sticky, z-30 — `src/components/shared.jsx:70`.
- Bottom navigation: fixed, z-40 — `src/components/BottomNav.jsx:19`.
- Expand/collapse animates grid rows, without a transform or z-index — `src/index.css:231`.
- The rotating chevrons create local transformed contexts but have no positive z-index elevating them above navigation — `src/components/IndicationsView.jsx:377`, `src/components/DrugsView.jsx:81`.

The article, row-button and drug-button focus outlines use negative offsets, keeping them inside their boxes: `src/components/IndicationsView.jsx:348`, `src/components/IndicationsView.jsx:368`, `src/components/shared.jsx:157`. Neither an outline nor a transformed chevron bypasses an ancestor’s clipping. Actual keyboard-focus visibility near navigation or rounded clipping boundaries **cannot determine from code**.

### (c) Wrapping and phone widths

The following calculations assume a 16px root and portrait safe-area horizontal insets no greater than 16px. Larger insets reduce the available widths.

`main` has 16px padding per side: `src/App.jsx:96`, `src/index.css:213`. A spined group consumes 4px left border plus 1px right border; an ordinary group consumes 2px total: `src/components/shared.jsx:40`.

Let `C` be the rendered page-chip width, **including its 12px horizontal padding**, and `P` the rendered plus-sign width.

```text
Collapsed summary:
W - 32 page padding - 5 group borders - 28 button padding
  - 12 button gap - (C + 8 accessory gap + 16 chevron)
= W - 101 - C

First pill text capacity:
W - 101 - C - 16 pill padding = W - 117 - C

Subsequent pill text capacity:
W - 117 - C - 6 connector gap - P
```

Evidence: `src/components/IndicationsView.jsx:258`, `src/components/IndicationsView.jsx:368`, `src/components/IndicationsView.jsx:374`, `src/components/shared.jsx:211`, `src/components/shared.jsx:219`.

| Available content width | 320px | 360px | 375px | 414px |
|---|---:|---:|---:|---:|
| Main content: `W−32` | 288 | 328 | 343 | 382 |
| Spined group interior: `W−37` | 283 | 323 | 338 | 377 |
| Collapsed summary: `W−101−C` | 219−C | 259−C | 274−C | 313−C |
| First pill text: `W−117−C` | 203−C | 243−C | 258−C | 297−C |
| Dosing plate text: `W−32−2−28−24` | 234 | 274 | 289 | 328 |
| By-drug block interior: `W−32−2−28−26` | 232 | 272 | 287 | 326 |
| By-drug first pill text: previous −16 | 216 | 256 | 271 | 310 |
| By-drug DosePlate text: block interior −24 | 208 | 248 | 263 | 302 |
| Open-fracture Regimen text: `W−32−5−32−26−28` | 197 | 237 | 252 | 291 |

Dosing evidence: `src/components/DosingView.jsx:19`, `src/components/shared.jsx:244`. By-drug nesting: `src/components/DrugsView.jsx:88`, `src/components/DrugsView.jsx:149`. Fracture nesting: `src/components/OpenFracturesView.jsx:40`, `src/components/OpenFracturesView.jsx:49`, `src/components/shared.jsx:186`.

**Collapsed pill wrapper:** The outer row wraps; each connector/pill pair is an unwrapped inline flex container capped by `max-w-full`. The plate itself has `min-w-0` and wraps its children. That is useful but insufficient to prove overflow safety:

- The name child at `src/components/shared.jsx:223` has no `min-w-0` or emergency word-breaking.
- The dose child at `src/components/shared.jsx:227` has `break-words`, but retains the flex item’s automatic minimum width. `overflow-wrap: break-word` does not eliminate that intrinsic minimum.
- Drug-name segments and number/unit sequences can therefore establish minimum widths greater than the available width at sufficiently enlarged text sizes.
- The plus sign stays attached to its pill; it does not independently wrap away.

**Vancomycin repetition:** The longest indication pill is the **44-character** source-derived string:

```text
Vancomycin Pharmacy to dose Pharmacy to dose
```

Both fields actually contain that instruction; the component does not accidentally duplicate one field. Sources: `src/data/pmg.js:460`, `src/data/pmg.js:475`, `src/data/pmg.js:530`. Rendering: `src/components/shared.jsx:228`.

Its ordinary spaces provide wrap opportunities. “Pharmacy” is eight monospace glyphs; the bundled JetBrains Mono font has a 600/1000-em advance, giving **8 × 13 × 0.6 = 62.4px**, or **124.8px at 200% text size**. That establishes a word-width constraint, not a browser-verified line layout. Font selection: `src/main.jsx:8`, `tailwind.config.js:17`.

Other longest relevant real strings:

| String | Relevance | Source |
|---|---|---|
| `Piperacillin-tazobactam` | Longest full regimen drug name; hyphen provides a potential break | src/data/pmg.js:265 |
| `Sulfamethoxazole-TMP 800 mg/160 mg Q12H` | Long name segment plus compound dose | src/data/pmg.js:506 |
| `Metronidazole 500 mg One-time dose` | Long elective combination partner | src/data/pmg.js:405 |
| `Vancomycin 15 mg/kg IV q12 hours Pharmacy To Dose Consult` | Longest fracture tuple before displayed punctuation/footnotes | src/data/pmg.js:609 |
| `20 mg/kg/dose IV Q8h (max 1.5g/dose)` | Longest dosing-table line, 36 characters | src/data/pmg.js:709 |
| `< 37.5 kg: 13.3 mg/kg/dose IV Q8h` | Long decimal pediatric threshold/dose, 33 characters | src/data/pmg.js:703 |

**DosePlate:** Its clinical lines are block list items with `break-words`, not the pill’s nested flex children: `src/components/shared.jsx:249`. Long lines can wrap vertically; no fixed height clips them. However, on phones the grid has an implicit single column, while `sm:grid-cols-2` explicitly supplies zero-minimum fractional columns: `src/components/DosingView.jsx:32`. Intrinsic sizing and fallback fonts still need checking before asserting that the entire grid cannot widen.

**By-drug fracture pills:** Route, note and marks are rendered at `src/components/shared.jsx:225` and `src/components/shared.jsx:229`. They were already rendered by the old dedicated fracture markup; this is a component migration, not newly introduced clinical content. The note now follows a middle dot instead of the former comma. The same flex-child minimum-width limitation applies, with the additional `P + 6px` connector deduction for later partners.

**Could overflow be clipped rather than produce page scroll? Yes.** `Group` has `overflow-hidden`, and `.expand > *` also clips on screen: `src/components/shared.jsx:40`, `src/index.css:239`. Therefore, absence of horizontal **page** scrolling would not establish that every glyph is visible.

**Do these exact strings overflow at 320/360/375/414px or a particular enlarged-text setting? Cannot determine from code.** The arithmetic above is established; rendered chip widths, font shaping, actual line breaking and the enlargement mechanism are not. A browser test must compare descendant bounds/scroll widths against their clipping ancestors, not merely inspect document width.

### (d) Print

**Does a plate print black on white, boxed? Yes, by the CSS cascade.** The print rule forces every element’s text to black, removes backgrounds/shadows, and adds a 1px solid border to `.plate`: `src/index.css:285`, `src/index.css:295`. The effective text contrast is 21:1. Border contrast is only 2.849:1.

**Do sticky section heads become static? Yes:** `src/index.css:298`.

**Any sticky or fixed application chrome left over? No visible instance found.** The other sticky/fixed elements are `Header` and `BottomNav`, both `no-print`: `src/components/Header.jsx:50`, `src/components/BottomNav.jsx:19`. That class is hidden at `src/index.css:301`.

**Anything white-on-white or gold-on-white? No text instance found in the reviewed components.**

- Plate names, dim names/doses, gold doses and superscripts are overridden by `color: #000 !important`.
- The muted connector is likewise black.
- Lucide uses `fill="none"` and `stroke="currentColor"`; those strokes follow the overridden black color. Definitions: `node_modules/lucide-react/dist/cjs/lucide-react.js:17`.
- No reviewed component supplies a fixed colored SVG `stroke`, `fill`, or arbitrary text-color value escaping that override.
- Explicit text-decoration color **does** survive, producing the faint underline reported above.
- Hue dots and filled bullet spans use `background-color`, so they become transparent. Border-based spines survive as gray rules; rings disappear with `box-shadow`. Evidence: `src/components/DrugsView.jsx:173`, `src/components/FeverWorkupView.jsx:31`, `src/index.css:287`.

**Are collapsed details printable? CSS requests full expansion:** `src/index.css:304` restores `1fr`, removes the inner overflow clipping and sets inert content visible. This does not prove pagination, clipping at page boundaries, or print-to-PDF accessibility. Those **cannot determine from code** and require print preview/output.

## CLINICAL VALUES - flagged as unverifiable by code review

**Everything below is clinical — unverifiable by code review.** The data file is unchanged. The arrays retain their source order; no changed renderer numerically recalculates a dose or cutoff.

The source/transformation qualifications are:

- Dosing-table cells still receive the same labels and line arrays and still use `keepUnits`: `src/components/DosingView.jsx:33`, `src/components/DrugsView.jsx:122`, `src/components/shared.jsx:250`.
- Regimen doses still use `fmtDose`. Expanded frequencies now also pass through `keepUnits`; that helper changes spaces only: `src/components/shared.jsx:165`, `src/components/shared.jsx:167`, `src/lib/text.js:23`.
- By-drug fracture tuples retain drug, dose, route, frequency, note and footnote association. The note separator changes from comma to middle dot: `src/components/DrugsView.jsx:112`, `src/components/shared.jsx:230`.
- Duration, redose and alternative field sources/transforms remain unchanged; their text weight/color changes: `src/components/IndicationsView.jsx:297`, `src/components/IndicationsView.jsx:402`.

Values requiring human comparison with the PDF include:

| Rendered clinical values | Source |
|---|---|
| Cefazolin `2 g Q8H`; Metronidazole `500 mg Q12H` | src/data/pmg.js:95 |
| Ceftriaxone `2 g Q12H` | src/data/pmg.js:133 |
| Ampicillin-sulbactam `3 g Q6H` | src/data/pmg.js:193 |
| Ceftriaxone `2 g Q24H` | src/data/pmg.js:247 |
| Piperacillin-tazobactam `4.5 g Q8H` | src/data/pmg.js:265 |
| Linezolid `600 mg Q12H` | src/data/pmg.js:333 |
| Cefazolin `2 g One-time dose`; Metronidazole `500 mg One-time dose` | src/data/pmg.js:404 |
| Vancomycin dose=`Pharmacy to dose`, frequency=`Pharmacy to dose` | src/data/pmg.js:460 |
| Sulfamethoxazole-TMP `800 mg/160 mg Q12H` | src/data/pmg.js:506 |
| Fracture Type I/II: Cefazolin `2 g IV q8 hours` | src/data/pmg.js:598 |
| Penicillin-allergy fracture regimen: Vancomycin `** 15 mg/kg IV q12 hours`, `Pharmacy To Dose Consult` | src/data/pmg.js:605 |
| Type III fracture regimen: Cefepime `* 2 g q8 hours` plus that Vancomycin tuple | src/data/pmg.js:621 |
| Contamination regimen: those Cefepime/Vancomycin tuples plus Metronidazole `500 mg IV Q8h` | src/data/pmg.js:638 |
| Adult column cutoff: `age ≥15 years` | src/data/pmg.js:684 |
| Cefazolin adult `2 g IV Q8h`; pediatric `< 60 kg: 33 mg/kg/dose IV Q8h`, `≥ 60 kg: 2 g IV Q8h` | src/data/pmg.js:688 |
| Cefepime adult `2 g IV Q8h`; pediatric `< 40 kg: 50 mg/kg/dose IV Q12h`, `≥ 40 kg: 2 g IV Q12h` | src/data/pmg.js:694 |
| Metronidazole adult `500 mg IV Q8h`; pediatric `< 37.5 kg: 13.3 mg/kg/dose IV Q8h`, `≥ 37.5 kg: 500 mg IV Q8h` | src/data/pmg.js:700 |
| Vancomycin adult `15 mg/kg IV Q12h (max 1.5g/dose)`; pediatric `20 mg/kg/dose IV Q8h (max 1.5g/dose)`; both include `Vancomycin IV - Pharmacy to Dose` | src/data/pmg.js:706 |
| `*`: `Pharmacy to dose adjust per renal dosing protocol`; `**`: order Vancomycin IV–Pharmacy to Dose for adult/pediatric patients, suggested doses above, adjustment based on renal function | src/data/pmg.js:713 |

The recolored indication fields also render these clinical duration/redose/alternative values:

- Trauma duration choices: `24 hours`; `4 days after source control (consider monotherapy Zosyn)`; `24 hours after closure or 72 hours total, whichever is shortest`. Redosing: `Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion`. Sources: `src/data/pmg.js:83`, `src/data/pmg.js:98`, `src/data/pmg.js:134`.
- Appendicitis: non-perforated post-appendectomy `24 hours`; perforated with source control `4 days OR 8 days in Critical Illness`; without source control `8 days`. `src/data/pmg.js:250`.
- Diverticulitis/SBO/perforated-peptic-ulcer duration branches: `4 days after source control OR 8 days in Critical Illness`, `8 days`, or `24 hours`, according to the unchanged indication association. `src/data/pmg.js:266`, `src/data/pmg.js:278`, `src/data/pmg.js:306`, `src/data/pmg.js:321`, `src/data/pmg.js:350`.
- Cholecystitis: local inflammation after cholecystectomy `24 hours`; perforated with source control including PCT `4 days`; without source control `8 days`. `src/data/pmg.js:291`.
- NSTI: `48-72 hours after source control is achieved`. `src/data/pmg.js:336`.
- Elective procedures: `1 dose`; applicable redosing `Every 4 hours`. `src/data/pmg.js:368`, `src/data/pmg.js:381`, `src/data/pmg.js:407`, `src/data/pmg.js:447`.
- Inpatient durations: `7 days`; `Depends on Source and Isolated Bacteria`; `3 days`; `5 days`; `5-10 days`. `src/data/pmg.js:463`, `src/data/pmg.js:478`, `src/data/pmg.js:495`, `src/data/pmg.js:507`, `src/data/pmg.js:519`, `src/data/pmg.js:531`, `src/data/pmg.js:543`.
- Alternatives include Levofloxacin with Metronidazole; contamination Ceftriaxone with Metronidazole for `72 hours`; Clindamycin `600mg q8 hours`; Vancomycin–Pharmacy to dose; Ertapenem `1 g Q24H` or named without a dose; conditional clindamycin for suspected Group A Streptococcus/Toxic Shock Syndrome; conditional Micafungin `100 mg Q24H`; Vancomycin `x 1 dose if known MRSA colonization`, with Metronidazole where specified; and Linezolid. Sources: `src/data/pmg.js:100`, `src/data/pmg.js:136`, `src/data/pmg.js:196`, `src/data/pmg.js:235`, `src/data/pmg.js:256`, `src/data/pmg.js:268`, `src/data/pmg.js:339`, `src/data/pmg.js:355`, `src/data/pmg.js:382`, `src/data/pmg.js:424`, `src/data/pmg.js:465`.
- Open-fracture duration text recolored by this change: Type I/II `24 hours`; Type III `24 hours after closure or 72 hours (whichever precedes)`. `src/data/pmg.js:655`.

The fever-card border change narrows the containers rendering the unchanged flowchart branches. Their clinical criteria/actions are also **unverifiable by code review**, including pneumonia `PLUS any TWO`, fever `>38.0`, culture branches `≥ 10⁴ CFU/mL`/`≤ 10⁴ CFU/mL`, `7 days`; central line `>72 h`; UTI fever `>38.5`, `> 10 WBC`/`< 10 WBC`, `>2 squamous cells`, and `<100,000 CFU/mL`. Sources: `src/data/pmg.js:735`, `src/data/pmg.js:750`, `src/data/pmg.js:757`, `src/data/pmg.js:769`, `src/data/pmg.js:780`. Their data access and `keepUnits` transformations are unchanged at `src/components/FeverWorkupView.jsx:26`, `src/components/FeverWorkupView.jsx:45`, and `src/components/FeverWorkupView.jsx:60`.

## COULD NOT VERIFY

- Actual clipping, overflow, wrap points and page-chip widths at 320/360/375/414px, including enlarged text. Settle with the bundled fonts loaded, both schemes, explicit enlargement settings, and descendant-versus-clipping-ancestor measurements.
- Installed-iPhone safe-area behavior, fractional header alignment, resize timing and final deep-link positions. Settle with header/head/target bounding rectangles before and after scrolling and resizing.
- Pixel seams, shadow bleed and focus-outline visibility. Settle with browser screenshots and keyboard traversal.
- Print pagination and exported-PDF rendering/accessibility. Settle by printing expanded and collapsed routes from both schemes.
- The author’s build and preview claims at `DESIGN-NOTES.md:69`. The permitted 83 tests passed; build/preview commands were prohibited.
- Clinical correctness or agreement with the PDF. That requires human clinical review; unchanged data and passing tests do not establish it.

## Run 2B — directed `codex exec`, questions (e)–(h): no review produced

The run echoed the tree evidence (HEAD `f2d0b273…`, `src/index.css` 318 lines), read the diff, the docs, the components and the tests, ran the 83 tests in-process (83 pass), then stopped at the usage limit after 86,598 tokens with no final message. Its transcript holds one interim note and no findings: "The section head's `sticky` class is on an element inside a short wrapper that ends before the list. That prevents it from remaining visible while the section's rows scroll. I'm also checking the pill layout for narrow-screen clipping and tracing each clinical rendering change against the baseline." The questions went to Gemini (`2026-10-07-gemini-redesign-review.md`).


---

## Dispositions (Claude, the session that merged the change)

Everything Codex raised is listed; nothing was dismissed without a reason. Line numbers in the findings
refer to `f2d0b27`.

1. **[P2 / Medium] The sticky section head cannot stay stuck** (`shared.jsx:67-71`, both completed runs).
   **Fixed, `15158b8`** — and found independently before the review landed, while measuring the merge at
   414px: the stuck head was nowhere near the top (its rect was at −438px) because its containing block
   was the `mb-2` wrapper. `SectionHead` now renders a fragment, so the title row and the blurb are direct
   children of the `<section>`. Measured after the fix at 414px: "Emergency General Surgery" pinned at
   top 114px (= the header's height) while its rows scroll, the deep-linked row landing below it, the next
   section's head approaching in flow. Codex's run 2B interim note reported the same defect.
2. **[Low] The dark plate edge fails 3:1** (`index.css:142`; slate-600 at 1.93:1 on the card). **Fixed:**
   dark `--plate-line` is now `120 136 160`, the same grey as dark `rule-strong` — 4.06:1 on the card,
   4.95:1 on the canvas, 4.16:1 on the amber wash, 5.24:1 against the plate — and `plate-line` against
   `card`, `well` and `warn-bg` is in the contrast matrix at 3:1 (both schemes; in light the edge is the
   plate's own colour by design, so the edge-against-plate pair is deliberately not listed).
3. **[Low] Printed plate borders and the drug-name underline fall below 3:1** (`index.css:295`,
   `shared.jsx:157`). **Fixed:** the print block's `border-color` and the `.plate` border are `#767676`
   (4.54:1 on white; `#999` was 2.85:1), and `text-decoration-color: #000 !important` joins the `color`
   override so the dotted underline prints black.
4. **Incorrect claims** (`DESIGN-NOTES.md:18`, `:56`; `index.css:75`). **Fixed:** gold on white is 1.8:1
   (3.3:1 is `deepgold`'s figure), `plate-dose` on the plate 10.5:1, `plate-soft` on the plate 12.7:1 —
   the comments, CLAUDE.md and the variant's notes (a "corrections" section appended; the delivered text
   left as written) now carry the recomputed figures.
5. **Matrix omissions.** **Added:** the four section hues on `card` and `paper` (3:1 — the spine is now
   the section marker, not decoration), `accent-hi` on `chip` (4.5:1), `accent` on `accent-soft` (4.5:1),
   `good-mark` and `focus` on `accent-soft` (3:1). All pass in both schemes today. **Not added, with
   reasons:** `plate-line` against the plate (equal in light by design — see 2); the pre-existing
   decorative lines (`rule`, `rule-soft`, the tone `*-line` borders, `faint`) — CLAUDE.md already states
   they are decoration, not control boundaries, and this release does not change them; print — not
   token-based, handled by the overrides in 3.
6. **(b) The 48px scroll margin versus the stuck head's height**: Codex computed a 36px one-line head,
   57px for two lines, 60/102px at 200% text, against a 58px allowance. **Changed:** rows now carry
   `scroll-mt-16` (64px), which clears a two-line head at normal size and a one-line head at 200%.
   A three-line head is not covered; the longest section title ("Emergency General Surgery") is one
   line at 320px at normal size. Documented in CLAUDE.md.
7. **(b) The fallback `7.25rem` before the header has measured itself, integer `offsetHeight`, and the
   iPhone inset**: unchanged from v0.5.0 (the header publishes its measured height including the inset
   through a `ResizeObserver`, which the Codex review of v0.5.0 asked for). Measured in the preview:
   `--app-header-h` 114px on phones and the head's `top` 114px. Not measured on a device.
8. **(c) Wrapping**: Codex could not determine overflow from code and warned that `overflow-hidden` on
   `Group` could clip without page scroll. **Measured in the preview** at 320, 360, 375 and 414px, both
   schemes: no horizontal scroll (`scrollWidth === clientWidth`), and every `.plate` on the home list,
   the Dosing page and the Cefazolin By-drug row has `scrollWidth <= clientWidth` and sits inside its
   group's box (see the Gemini review document for the measurement). "Vancomycin Pharmacy to dose
   Pharmacy to dose" wraps inside its pill. Enlarged text was not measured.
9. **(d) Print**: accepted as analysed; pagination and print-to-PDF were not checked on paper.
10. **Clinical values**: all flagged, none verified, none changed. The only display-level change to a
    clinical field Codex noted — the By-drug fracture note joined with " · " instead of the former ", " —
    is **reverted to the PDF's own comma** in both `OrderLine` and `RegimenInline`, so the printed tuple
    reads "…q12 hours, Pharmacy To Dose Consult" as the PDF does. `keepUnits` on `frequency` changes
    spaces only (`tests/text.test.js`).
11. **(e)–(h) unreviewed by Codex** (usage limit): reviewed by Gemini, single engine for those questions —
    `docs/reviews/2026-10-07-gemini-redesign-review.md`.

Fixes 2–6 and 10 were checked by the tests (83/83) and in the browser, not re-reviewed by Codex.
