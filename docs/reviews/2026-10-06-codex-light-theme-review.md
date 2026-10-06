# Codex peer review — light theme and new icon, 2026-10-06

Single-engine review: Codex CLI 0.153.4, model `gpt-6-astra`, reasoning effort `high`, sandbox
`read-only`, approval `never`; session `01a11171-d9ae-7702-8c7e-61704adce5ec`, about 11 minutes,
129,601 tokens. It reviewed the uncommitted working tree against `db26ebf`: 27 modified and 3 new
files, with the regenerated icon PNGs excluded as binary. The packet went in on stdin: the text diff,
25 files in full with line numbers, and the HEAD versions of `src/index.css` and
`tailwind.config.js`, plus a byte-identical read-only snapshot on disk for hashing and arithmetic.

Relayed by the `codex-review` bridge agent. It byte-checked the packet, matched Codex's file hashes
against the live tree, audited Codex's nine shell commands (none touched git, the repo or the
network) and spot-checked every cited line. Not cross-checked by Gemini. **Nothing below was
dismissed or softened.** Codex's answer follows verbatim; the dispositions are at the end.

---

## A. PACKET CHECK

- `===== END OF PACKET =====` was the last line received.
- HEAD: `db26ebff9ea1e2ac362f059814ae98d33a5bc61f`.
- Section 2.1 contains **30 status entries**: 27 modified, 3 untracked.
- All embedded final lines match the manifest:

| Manifest entry | Observed last non-empty line | Manifest value |
|---|---|---|
| S3 `_review/diff-vs-HEAD.patch` | `   },` | `   },` |
| S4 `src/lib/theme.js` | `}` | `}` |
| S4 `src/components/ThemeToggle.jsx` | `}` | `}` |
| S4 `tests/theme.test.js` | `});` | `});` |
| S4 `index.html` | `</html>` | `</html>` |
| S4 `src/index.css` | `}` | `}` |
| S4 `tailwind.config.js` | `};` | `};` |
| S4 `src/components/BrandBar.jsx` | `}` | `}` |
| S4 `src/components/Toolbar.jsx` | `}` | `}` |
| S4 `src/components/BottomNav.jsx` | `}` | `}` |
| S4 `src/components/shared.jsx` | `}` | `}` |
| S4 `src/components/Footer.jsx` | `}` | `}` |
| S4 `src/components/DosingView.jsx` | `}` | `}` |
| S4 `src/components/DrugsView.jsx` | `}` | `}` |
| S4 `src/components/FeverWorkupView.jsx` | `}` | `}` |
| S4 `src/components/IndicationsView.jsx` | `}` | `}` |
| S4 `src/components/OpenFracturesView.jsx` | `}` | `}` |
| S4 `src/components/SourceView.jsx` | `}` | `}` |
| S4 `src/App.jsx` | `}` | `}` |
| S4 `src/main.jsx` | `);` | `);` |
| S4 `src/lib/route.js` | `}` | `}` |
| S4 `src/lib/search.js` | `}` | `}` |
| S4 `vite.config.js` | `});` | `});` |
| S4 `package.json` | `}` | `}` |
| S4 `firebase.json` | `}` | `}` |
| S4 `postcss.config.js` | `};` | `};` |
| S5 `src/index.css` HEAD | `}` | `}` |
| S5 `tailwind.config.js` HEAD | `};` | `};` |

Computed snapshot hashes:

| File | SHA-256, first 12 characters | Comparison |
|---|---|---|
| `src/index.css` | `8ae257d15761` | MATCH |
| `src/lib/theme.js` | `da88a975a450` | MATCH |
| `tests/theme.test.js` | `a6250e91ccf4` | MATCH |
| `index.html` | `78ca25a01b1d` | MATCH |
| `_review/diff-vs-HEAD.patch` | `835e83f951bd` | MATCH |

Node was available: **v25.9.0**. No attempted snapshot read failed. No packet/snapshot disagreement was found. No repository access, writes, installations, servers, or network requests were made.

## B. FINDINGS

### [Medium] src/components/BrandBar.jsx:46 - The added controls leave insufficient room at 320px

**B1 — uncertain pending rendered confirmation.** The right-hand group is `shrink-0`, while the left-hand subtitle remains `whitespace-nowrap` at line 39. `min-w-0` permits its container to shrink but does not wrap or clip that subtitle.

At a 320px viewport, with the normal 16px root size:

- Horizontal padding: 32px.
- Gap between groups: 12px.
- Right group: approximately 95.4px—44px toggle, 6px gap, approximately 45.4px PDF button.
- Logo and its gap: 52px.
- Remaining subtitle width: **128.6px**.
- “Acute Care Surgery,” its tracking, dot and gap need approximately **150.6px** using the configured monospace face’s expected metrics.

That predicts about **22px of overflow**, extending approximately **10px into the theme button** after consuming the inter-group gap. The author’s 360–640px measurement does not cover this case.

A clinician using a 320px phone viewport or browser reflow can therefore see the specialty subtitle obscured by the new control. I could not confirm exact glyph dimensions or painting in a browser; these are layout calculations, not a claimed screenshot reproduction.

**Suggested fix:** allow the brand row or subtitle to wrap at narrow widths, or introduce a smaller-width arrangement that preserves both controls. Verify at 320px and with enlarged text.

### [Low] src/index.css:99 - The light focus colour loses contrast around the fixed amber notice

**B2.** The light scheme sets `--focus: 128 83 0`, but the verification notice retains `--amber-bg: 217 119 6`. The global outline uses that focus token with a 2px outward offset at lines 230–232.

Actual adjacent colours include:

- Outline against the amber notice’s side regions on wider layouts: **2.09:1**.
- Outline above the notice against the dark brand bar `(10,14,20)`: **2.91:1**.
- Outline below the notice against the light canvas: **5.82:1**.

Thus the bottom edge remains visible; this is not a completely invisible focus indicator. Nevertheless, portions of the keyboard indicator fall below 3:1, and the tests miss them because they only check `card`, `paper`, and `well`. The amber-side weakness also exists in dark mode; the insufficient contrast against the dark bar is introduced by the light focus token.

A keyboard user opening the verification/source link gets a weaker, inconsistent indicator precisely at the boundary between the permanently dark and light regions.

**Suggested fix:** give this notice an inset focus outline using its dark ink colour. `(10,10,10)` against its amber background is **6.21:1**.

### [Low] tests/theme.test.js:107 - The fixed-colour guard misses valid ways to introduce fixed colours

**B3.** The guard scans selected utility prefixes and bracketed hex/RGB/HSL values. Read-only probes against the actual regexes produced **zero matches** for every following example:

```jsx
className="border-l-white"
className="bg-[white]"
className="bg-[oklch(1_0_0)]"
style={{ color: "#ffffff" }}
fill="#ffffff"
```

The whole-file allowlist also accepts `text-black` anywhere in `Toolbar.jsx`, not specifically on the switched-on amber control.

Consequently, the documentation’s assertion that a new fixed colour cannot quietly enter a component is stronger than the test. A later inline white drug label or SVG fill can pass CI and disappear in light mode. I found no such unintended foreground colour in the current components.

**Suggested fix:** cover directional utilities, named/arbitrary colour syntaxes, inline colour properties and SVG attributes; scope exceptions to their intended elements. Add negative controls for these demonstrated escapes.

### [Low] tests/theme.test.js:142 - The bootstrap test passes even when the script never applies a theme

**B4.** Assertions at lines 147–149 check substrings and script order. They never check the DOM result.

Deleting this line **in memory**:

```js
document.documentElement.setAttribute("data-theme", theme);
```

leaves both substring assertions true and does not affect the script-order assertion. The supposed pre-paint guard therefore accepts a no-op bootstrap. Saved-light readers would load dark, and `currentTheme()` would initialize React from that wrong DOM state.

The **current** script behaved correctly when executed with mocked storage containing `"light"`, `"dark"`, `null`, `"LIGHT"`, and a throwing storage accessor.

**Suggested fix:** execute the extracted inline script against a small mocked document/storage environment and assert its resulting `data-theme`, including blocked storage. Retain the placement check separately.

### [Low] tests/theme.test.js:75 - Invalid RGB tokens make the contrast assertions fail open

**B5.** `rgb()` checks only the number of parts:

```js
const parts = tokens[name].split(/\s+/).map(Number);
assert.equal(parts.length, 3, ...);
```

For `"oops 120 87"`, this returns three components containing `NaN`. The contrast calculation then returns `NaN`, and:

```js
if (r < min) fails.push(...);
```

does not record a failure. A read-only evaluation of these actual helpers returned:

```text
{ r: NaN, failingComparison: false }
```

A malformed dose or foreground token can therefore invalidate the browser declaration while its contrast test passes. The current token values are valid; this is a regression-guard defect.

**Suggested fix:** assert that every component is finite and within 0–255, and assert that each computed ratio is finite before comparing it. Include a malformed-token negative control.

## C. CLINICAL FLAGS

`src/data/pmg.js` is absent from both the status list and the diff: **it was not modified**. No literal drug name, numeric dose, frequency, treatment duration, or clinical cutoff was changed.

Under the requested rule covering clinical content appearing on any changed line, the following unchanged labels or clinical-data expressions still receive flags. Their surrounding changes are styling; the packet does not establish their clinical correctness.

| File:line | Clinical wording or expression on the changed line | Flag |
|---|---|---|
| `src/components/DosingView.jsx:66` | `{label}`: adult/pediatric dosing-column label | unverifiable from code; needs a human with the source |
| `src/components/DrugsView.jsx:88` | “dosing table” | unverifiable from code; needs a human with the source |
| `src/components/DrugsView.jsx:197` | `{title}`: regimen/alternative-column heading | unverifiable from code; needs a human with the source |
| `src/components/DrugsView.jsx:205` | `{render(ind)}`: regimen or alternative content | unverifiable from code; needs a human with the source |
| `src/components/FeverWorkupView.jsx:16` | `{fw.trigger}` | unverifiable from code; needs a human with the source |
| `src/components/FeverWorkupView.jsx:28` | `{b.preface}` | unverifiable from code; needs a human with the source |
| `src/components/FeverWorkupView.jsx:32` | `{b.criteria.lead}` | unverifiable from code; needs a human with the source |
| `src/components/IndicationsView.jsx:128` | “Regimen, dose, duration, redosing and the PMG’s”; `{ALT_LABEL}` | unverifiable from code; needs a human with the source |
| `src/components/IndicationsView.jsx:274` | `{label}`: duration, redose or alternative-column label | unverifiable from code; needs a human with the source |
| `src/components/IndicationsView.jsx:335` | `{ind.short}` | unverifiable from code; needs a human with the source |
| `src/components/IndicationsView.jsx:377` | `{ind.name}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:54` | “Antimicrobial by type” | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:72` | `{a.applies}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:106` | “Duration” | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:112` | `{d.applies}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:113` | `{d.value}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:136` | `{of.classification.title}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:149` | `{s.code}` | unverifiable from code; needs a human with the source |
| `src/components/OpenFracturesView.jsx:150` | `{s.description}` | unverifiable from code; needs a human with the source |
| `src/components/SourceView.jsx:58` | `{source.intro}` | unverifiable from code; needs a human with the source |
| `src/components/SourceView.jsx:119` | `{c.here}`: corrected source wording | unverifiable from code; needs a human with the source |
| `src/components/SourceView.jsx:132` | “Antibiogram” | unverifiable from code; needs a human with the source |
| `src/components/shared.jsx:77` | `{route}`: administration route | unverifiable from code; needs a human with the source |
| `src/components/shared.jsx:134` | `{fmtDose(r.dose)}` | unverifiable from code; needs a human with the source |
| `src/components/shared.jsx:135` | `{r.frequency}` | unverifiable from code; needs a human with the source |

Other changed textual content consists of theme/UI chrome, documentation, comments, and provenance—not new treatment instructions. Examples include “PDF,” “Footnotes,” “Then,” review notices, and unchanged source-title/publication-date expressions in `Footer.jsx:13` and `SourceView.jsx:36`.

## D. COVERAGE

| Area | Result |
|---|---|
| 1. Fixed colours and token completeness | **findings: B3.** Both schemes contain the same 46 tokens; referenced tokens exist. Component palette replacements match their original dark values, subject to the stated intentional exceptions. Fixed banner/control colours are deliberate. Default Tailwind shadows remain fixed decorative colours; no concrete legibility problem found. |
| 2. Light legibility and contrast claims | **findings: B2, B5.** Dose numerals, striped highlights, active navigation, and ordinary control boundaries pass the calculated thresholds. Numeric comment claims match within 0.05. |
| 3. Theme state, StrictMode, blocked storage, switching frame | **checked, no issue:** the initializer only reads the DOM; event-side mutations are not StrictMode initializers/updaters. Storage failures are caught. The forced layout precedes RAF cleanup. One mounted hook owns the current toggle; no current competing DOM writer was found. |
| 4. Scoped dark bar, print and shadow cascade | **checked, no issue:** local dark declarations override inherited light values; later print declarations win equal-specificity theme rules, with universal important colour/background overrides preventing white-on-white text. Variable-valued shadow definitions avoid substituting their internal colours through the old shadow-colour collision. Generated CSS/browser rendering was not independently reproduced. |
| 5. Safe-area strip, sticky offset and deep links | **checked, no issue:** zero insets preserve the old position; positive insets give strip and toolbar matching dimensions. Existing 8rem scroll padding plus 9rem card scroll margin provide substantial clearance at normal sizing. Real iOS/Android behaviour was not exercised; the documentation’s blanket “zero elsewhere” assertion is not established by this packet. |
| 6. Test quality | **findings: B3, B4, B5.** Token-set equality and current-token reference checks pass. Contrast math is correct for valid RGB values, but surface coverage omits the fixed notice and actual striped/nested backgrounds. |
| 7. Toggle accessibility and brand layout | **findings: B1, B2.** The toggle itself has a meaningful changing action label, decorative icon, 44px target, and a strong dark-scoped focus outline. |
| 8. Service worker and persistence | **checked, no issue:** HTML is included in precaching; synchronous localStorage persistence is restored by the bootstrap after reload. The existing sessionStorage handoff uses a different key. Blocked storage necessarily loses the theme on reload. |
| Beyond the eight | **findings: B1–B5.** Reviewed all supplied changed text, version alignment, unchanged clinical bindings, icon-generator comment changes, documentation claims and print overrides. No additional confirmed application-logic defect found. The claimed 12,484-element browser comparison was not independently reproduced. |

The initial permitted test command failed because the sandbox prevented child-process spawning. Its output, verbatim:

```text
✖ C:\Users\tac02\AppData\Local\Temp\claude\C--Thiago-OneDrive--3--Claude-ACS-Antibiotics\60b5aa66-2f4b-413f-9dc6-74f1b97c0fe3\scratchpad\snapshot\tests\theme.test.js (2.8451ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10.9578

✖ failing tests:

test at tests\theme.test.js:1:1
✖ C:\Users\tac02\AppData\Local\Temp\claude\C--Thiago-OneDrive--3--Claude-ACS-Antibiotics\60b5aa66-2f4b-413f-9dc6-74f1b97c0fe3\scratchpad\snapshot\tests\theme.test.js (2.8451ms)
  Error: spawn EPERM
      at ChildProcess.spawn (node:internal/child_process:440:11)
      at spawn (node:child_process:796:9)
      at TestContext.<anonymous> (node:internal/test_runner/runner:442:19)
      at FileTest.runInAsyncScope (node:async_hooks:226:14)
      at FileTest.run (node:internal/test_runner/test:1201:25)
      at FileTest.start (node:internal/test_runner/test:1096:17)
      at runTestFile (node:internal/test_runner/runner:524:32)
      at node:internal/test_runner/runner:856:25
      at node:internal/per_context/primordials:561:37
      at new Promise (<anonymous>) {
    errno: -4048,
    code: 'EPERM',
    syscall: 'spawn'
  }
```

Retrying with `node --test --test-isolation=none` and the same absolute test path succeeded. Output, verbatim:

```text
✔ both schemes define exactly the same tokens (1.5193ms)
✔ every token the components and Tailwind refer to exists in both schemes (3.6031ms)
✔ dark scheme: text tokens reach 4.5:1 and control lines 3:1 on every surface (0.7624ms)
✔ light scheme: text tokens reach 4.5:1 and control lines 3:1 on every surface (0.2781ms)
✔ components use theme tokens, never fixed palette or arbitrary colours (7.4862ms)
✔ the guard itself flags a fixed colour (control) (0.3424ms)
✔ the stored theme resolves to dark unless it is explicitly light (0.2666ms)
✔ index.html applies the saved theme before paint with theme.js's key and rule (0.7807ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 45.4123
```

## E. CONTRAST TABLE

Calculated using WCAG 2.x sRGB relative luminance and `(Llighter + 0.05)/(Ldarker + 0.05)`. Ratios are rounded only for display. Exact numeric claims use the requested 0.05 tolerance; minimum-threshold claims use their actual threshold.

Repeated claims for the same pair in CSS, HEAD CSS, tests and documentation are consolidated in the corresponding row. Test composite rows reproduce the test’s integer RGB rounding.

**Dark scheme — all asserted test pairs and numerical comments**

| Colour pair: foreground / background, RGB | Claimed | Computed | Result |
|---|---:|---:|---|
| ink `(248,250,252)` / card `(15,20,29)` | ≥4.5 | 17.64 | MATCH |
| ink `(248,250,252)` / paper `(8,11,16)` | ≥4.5 | 18.83 | MATCH |
| ink `(248,250,252)` / well `(7,9,14)` | ≥4.5 | 19.03 | MATCH |
| prose `(226,232,240)` / card `(15,20,29)` | ≥4.5 | 14.97 | MATCH |
| prose `(226,232,240)` / paper `(8,11,16)` | ≥4.5 | 15.98 | MATCH |
| prose `(226,232,240)` / well `(7,9,14)` | ≥4.5 | 16.16 | MATCH |
| soft `(203,213,225)` / card `(15,20,29)` | ≥4.5 | 12.43 | MATCH |
| soft `(203,213,225)` / paper `(8,11,16)` | ≥4.5 | 13.27 | MATCH |
| soft `(203,213,225)` / well `(7,9,14)` | ≥4.5 | 13.41 | MATCH |
| muted `(148,163,184)` / card `(15,20,29)` | ≥4.5 | 7.20 | MATCH |
| muted `(148,163,184)` / paper `(8,11,16)` | ≥4.5; CSS 7.7 | 7.69 | MATCH |
| muted `(148,163,184)` / well `(7,9,14)` | ≥4.5 | 7.77 | MATCH |
| accent `(34,211,238)` / card `(15,20,29)` | ≥4.5 | 10.21 | MATCH |
| accent `(34,211,238)` / paper `(8,11,16)` | ≥4.5 | 10.90 | MATCH |
| accent `(34,211,238)` / well `(7,9,14)` | ≥4.5 | 11.02 | MATCH |
| accent-hi `(103,232,249)` / card `(15,20,29)` | ≥4.5 | 12.73 | MATCH |
| accent-hi `(103,232,249)` / paper `(8,11,16)` | ≥4.5 | 13.59 | MATCH |
| accent-hi `(103,232,249)` / well `(7,9,14)` | ≥4.5 | 13.74 | MATCH |
| dose `(52,211,153)` / card `(15,20,29)` | ≥4.5 | 9.60 | MATCH |
| dose `(52,211,153)` / paper `(8,11,16)` | ≥4.5 | 10.25 | MATCH |
| dose `(52,211,153)` / well `(7,9,14)` | ≥4.5 | 10.36 | MATCH |
| gold `(255,214,0)` / card `(15,20,29)` | ≥4.5 | 13.07 | MATCH |
| gold `(255,214,0)` / paper `(8,11,16)` | ≥4.5 | 13.95 | MATCH |
| gold `(255,214,0)` / well `(7,9,14)` | ≥4.5 | 14.10 | MATCH |
| signal-red `(255,69,58)` / card `(15,20,29)` | ≥4.5 | 5.42 | MATCH |
| signal-red `(255,69,58)` / paper `(8,11,16)` | ≥4.5 | 5.78 | MATCH |
| signal-red `(255,69,58)` / well `(7,9,14)` | ≥4.5 | 5.85 | MATCH |
| dose `(52,211,153)` / readout `(8,11,16)` | ≥4.5 | 10.25 | MATCH |
| dose `(52,211,153)` / paper/90 over card `(9,12,17)` | ≥4.5 | 10.19 | MATCH |
| on-accent `(0,0,0)` / accent-fill `(6,182,212)` | ≥4.5 | 8.65 | MATCH |
| on-accent `(0,0,0)` / accent-fill-hi `(34,211,238)` | ≥4.5 | 11.62 | MATCH |
| hazard-ink `(254,240,138)` / tint-amber/40 over card `(35,25,20)` | ≥4.5 | 14.78 | MATCH |
| gold `(255,214,0)` / tint-amber/40 over card `(35,25,20)` | ≥4.5 | 12.18 | MATCH |
| ink `(248,250,252)` / tint-amber/40 over card `(35,25,20)` | ≥4.5 | 16.44 | MATCH |
| signal-red `(255,69,58)` / lcd `(0,0,0)` | ≥4.5 | 6.16 | MATCH |
| rule-strong `(91,107,138)` / card `(15,20,29)` | ≥3; CSS/docs 3.4 | 3.44 | MATCH |
| rule-strong `(91,107,138)` / paper `(8,11,16)` | ≥3 | 3.67 | MATCH |
| rule-strong `(91,107,138)` / well `(7,9,14)` | ≥3 | 3.71 | MATCH |
| focus `(255,214,0)` / card `(15,20,29)` | ≥3 | 13.07 | MATCH |
| focus `(255,214,0)` / paper `(8,11,16)` | ≥3 | 13.95 | MATCH |
| focus `(255,214,0)` / well `(7,9,14)` | ≥3 | 14.10 | MATCH |
| rule `(31,41,61)` / card `(15,20,29)` | CSS/docs 1.3 | 1.27 | MATCH |

**Light scheme — all asserted test pairs and numerical comments**

| Colour pair: foreground / background, RGB | Claimed | Computed | Result |
|---|---:|---:|---|
| ink `(15,23,42)` / card `(255,255,255)` | ≥4.5; CSS 17.9 | 17.85 | MATCH |
| ink `(15,23,42)` / paper `(237,240,244)` | ≥4.5; CSS 15.6 | 15.62 | MATCH |
| ink `(15,23,42)` / well `(243,245,248)` | ≥4.5 | 16.35 | MATCH |
| prose `(30,41,59)` / card `(255,255,255)` | ≥4.5 | 14.63 | MATCH |
| prose `(30,41,59)` / paper `(237,240,244)` | ≥4.5 | 12.80 | MATCH |
| prose `(30,41,59)` / well `(243,245,248)` | ≥4.5 | 13.39 | MATCH |
| soft `(51,65,85)` / card `(255,255,255)` | ≥4.5 | 10.35 | MATCH |
| soft `(51,65,85)` / paper `(237,240,244)` | ≥4.5 | 9.06 | MATCH |
| soft `(51,65,85)` / well `(243,245,248)` | ≥4.5 | 9.48 | MATCH |
| muted `(71,85,105)` / card `(255,255,255)` | ≥4.5; CSS 7.6 | 7.58 | MATCH |
| muted `(71,85,105)` / paper `(237,240,244)` | ≥4.5; CSS 6.6 | 6.63 | MATCH |
| muted `(71,85,105)` / well `(243,245,248)` | ≥4.5 | 6.94 | MATCH |
| accent `(14,116,144)` / card `(255,255,255)` | ≥4.5; CSS 5.4 | 5.36 | MATCH |
| accent `(14,116,144)` / paper `(237,240,244)` | ≥4.5; CSS 4.7 | 4.69 | MATCH |
| accent `(14,116,144)` / well `(243,245,248)` | ≥4.5 | 4.91 | MATCH |
| accent-hi `(21,94,117)` / card `(255,255,255)` | ≥4.5 | 7.27 | MATCH |
| accent-hi `(21,94,117)` / paper `(237,240,244)` | ≥4.5 | 6.36 | MATCH |
| accent-hi `(21,94,117)` / well `(243,245,248)` | ≥4.5 | 6.65 | MATCH |
| dose `(4,120,87)` / card `(255,255,255)` | ≥4.5; CSS 5.5 | 5.48 | MATCH |
| dose `(4,120,87)` / paper `(237,240,244)` | ≥4.5 | 4.80 | MATCH |
| dose `(4,120,87)` / well `(243,245,248)` | ≥4.5 | 5.02 | MATCH |
| gold `(128,83,0)` / card `(255,255,255)` | ≥4.5; CSS 6.7 | 6.66 | MATCH |
| gold `(128,83,0)` / paper `(237,240,244)` | ≥4.5; CSS 5.8 | 5.82 | MATCH |
| gold `(128,83,0)` / well `(243,245,248)` | ≥4.5 | 6.09 | MATCH |
| signal-red `(185,28,28)` / card `(255,255,255)` | ≥4.5; CSS 6.5 | 6.47 | MATCH |
| signal-red `(185,28,28)` / paper `(237,240,244)` | ≥4.5 | 5.66 | MATCH |
| signal-red `(185,28,28)` / well `(243,245,248)` | ≥4.5 | 5.92 | MATCH |
| dose `(4,120,87)` / readout `(255,255,255)` | ≥4.5 | 5.48 | MATCH |
| dose `(4,120,87)` / paper/90 over card `(239,242,245)` | ≥4.5; CSS chip 4.9 | 4.88 | MATCH |
| on-accent `(255,255,255)` / accent-fill `(14,116,144)` | ≥4.5 | 5.36 | MATCH |
| on-accent `(255,255,255)` / accent-fill-hi `(21,94,117)` | ≥4.5 | 7.27 | MATCH |
| hazard-ink `(66,32,6)` / tint-amber/40 over card `(254,243,181)` | ≥4.5 | 12.98 | MATCH |
| gold `(128,83,0)` / tint-amber/40 over card `(254,243,181)` | ≥4.5 | 5.93 | MATCH |
| ink `(15,23,42)` / tint-amber/40 over card `(254,243,181)` | ≥4.5 | 15.90 | MATCH |
| signal-red `(185,28,28)` / lcd `(255,255,255)` | ≥4.5 | 6.47 | MATCH |
| rule-strong `(122,135,156)` / card `(255,255,255)` | ≥3; CSS/docs 3.6 | 3.64 | MATCH |
| rule-strong `(122,135,156)` / paper `(237,240,244)` | ≥3; CSS 3.2 | 3.18 | MATCH |
| rule-strong `(122,135,156)` / well `(243,245,248)` | ≥3 | 3.33 | MATCH |
| focus `(128,83,0)` / card `(255,255,255)` | ≥3 | 6.66 | MATCH |
| focus `(128,83,0)` / paper `(237,240,244)` | ≥3 | 5.82 | MATCH |
| focus `(128,83,0)` / well `(243,245,248)` | ≥3 | 6.09 | MATCH |
| hue-trauma `(220,38,38)` / card `(255,255,255)` | CSS range 3.7–5.9 | 4.83 | MATCH |
| hue-egs `(8,145,178)` / card `(255,255,255)` | CSS range minimum 3.7 | 3.68 | MATCH |
| hue-elective `(3,105,161)` / card `(255,255,255)` | CSS range maximum 5.9 | 5.93 | MATCH |
| hue-inpatient `(147,51,234)` / card `(255,255,255)` | CSS range 3.7–5.9 | 5.38 | MATCH |
| gold `(128,83,0)` / expanded-field stripe composite `(246.388,229.980,162.148)` | CSS 5.3 | 5.32 | MATCH |

The **5.3 stripe claim matches the expanded field**, whose background is stripe over amber wash over `well/40` over card. Stripe over amber wash directly on the white card instead produces **5.43:1**. The distinction matters; the test checks neither stripe composite.

**Additional actual combinations**

Here, “MATCH/MISMATCH” compares against the stated assessment threshold, not an additional author claim. Fractional RGB values preserve alpha-compositing precision.

| Actual combination and colour pair, RGB | Assessment threshold | Computed | Result |
|---|---:|---:|---|
| Dark dosing face: dose `(52,211,153)` / readout/80 over well `(7.8,10.6,15.6)` | ≥4.5 | 10.27 | MATCH |
| Light dosing face: dose `(4,120,87)` / readout/80 over well `(252.6,253,253.6)` | ≥4.5 | 5.39 | MATCH |
| Dark collapsed highlight: hazard-ink `(254,240,138)` / stripe composite `(61.752,47.504,17.424)` | ≥4.5 | 11.10 | MATCH |
| Light collapsed highlight: hazard-ink `(66,32,6)` / stripe composite `(248.980,232.140,163.660)` | ≥4.5 | 11.88 | MATCH |
| Dark collapsed highlight label: gold `(255,214,0)` / stripe composite `(61.752,47.504,17.424)` | ≥4.5 | 9.14 | MATCH |
| Light collapsed highlight label: gold `(128,83,0)` / stripe composite `(248.980,232.140,163.660)` | ≥4.5 | 5.43 | MATCH |
| Dark expanded alternative text: ink `(248,250,252)` / stripe composite `(60.0624,45.1808,14.256)` | ≥4.5 | 12.73 | MATCH |
| Light expanded alternative text: ink `(15,23,42)` / stripe composite `(246.388,229.980,162.148)` | ≥4.5 | 14.26 | MATCH |
| Dark active bottom-nav label: accent-hi `(103,232,249)` / well/70 over paper `(7.3,9.6,14.6)` | ≥4.5 | 13.70 | MATCH |
| Light active bottom-nav label: accent-hi `(21,94,117)` / well/70 over paper `(241.2,243.5,246.8)` | ≥4.5 | 6.56 | MATCH |
| Dark active bottom-nav icon: accent `(34,211,238)` / active background `(7.3,9.6,14.6)` | ≥3 | 10.99 | MATCH |
| Light active bottom-nav icon: accent `(14,116,144)` / active background `(241.2,243.5,246.8)` | ≥3 | 4.84 | MATCH |
| Toggle focus, both schemes: scoped focus `(255,214,0)` / bar `(10,14,20)` | ≥3 | 13.70 | MATCH |
| Toggle icon, both schemes: scoped accent `(34,211,238)` / card/80 over bar `(14,18.8,27.2)` | ≥3 | 10.32 | MATCH |
| Toggle boundary, both schemes: scoped rule-strong `(91,107,138)` / button `(14,18.8,27.2)` | ≥3 | 3.48 | MATCH |
| Light notice focus side: focus `(128,83,0)` / amber-bg `(217,119,6)` | ≥3 | 2.09 | **MISMATCH — B2** |
| Light notice focus top: focus `(128,83,0)` / dark bar `(10,14,20)` | ≥3 | 2.91 | **MISMATCH — B2** |
| Notice text, both schemes: amber-ink `(10,10,10)` / amber-bg `(217,119,6)` | ≥4.5 | 6.21 | MATCH |
| Enabled Alternatives text, both schemes: black `(0,0,0)` / hazard-fill `(255,214,0)` | ≥4.5 | 14.87 | MATCH |
| Light footer text: muted `(71,85,105)` / sunk `(227,231,237)` | ≥4.5 | 6.11 | MATCH |
| Light toolbar over paper: paper/95 composite `(237,240,244)` / paper `(237,240,244)` | No standalone surface threshold | 1.00 | N/A |
| Light toolbar over a white card: composite `(237.9,240.75,244.55)` / paper `(237,240,244)` | No standalone surface threshold | 1.01 | N/A |

The toolbar’s near-identical surface colour is not itself a contrast defect: its search/control boundaries provide the tested separation. Bottom-nav composite calculations use the canvas beneath the translucent dock; exact pixels vary with scrolled content and backdrop blur.

---

## Dispositions

| Finding | Disposition |
|---|---|
| **B1** Medium — the brand bar overlaps at 320px | **Fixed.** The bar row is `flex-wrap` and the button group `ml-auto`, so below about 355px the toggle and PDF button drop to a second, right-aligned line. Measured in the browser: at 320px no overlap and no horizontal scroll (bar 116px tall); at 360px and 375px unchanged, one line, 64px. |
| **B2** Low — the light focus ring reads under 3:1 on the amber notice and the dark bar | **Fixed.** The notice link draws its own 2px ring inset 3px in its ink (#0A0A0A on #D97706, 6.21:1) in both schemes. Checked with real keyboard Tab focus: `:focus-visible` matched, `solid 2px rgb(10, 10, 10)`, offset `-3px`. The notice's colours moved to tokens (`amber-bg`, `amber-ink`, `amber-line`), which removed the last allowlisted arbitrary colour. |
| **B3** Low — the fixed-colour guard misses some forms | **Fixed.** The guard now also catches per-side borders, keyword and modern colour-function arbitrary values, inline style colours and SVG or icon colour attributes, and its exceptions are pinned to the matching line instead of the whole file. A control asserts that each of the five escapes above, and others, is flagged, and that clean token classes are not. |
| **B4** Low — the pre-paint test never runs the script | **Fixed.** The test executes the inline script in a `vm` context with stand-in storage: stored light, dark, null, empty, "LIGHT", "system", storage that throws, and no storage at all. Each result must equal `resolveTheme`. A control removes the `setAttribute` call and shows the theme is then not applied. The placement check is kept as a separate test. |
| **B5** Low — a malformed token makes the contrast checks pass | **Fixed.** Channels must be integers 0–255 (alpha 0–1 where allowed), and a non-finite ratio counts as a failure. A control feeds five malformed values, which must throw, and a pale dose colour, which must fail. Coverage also widened per Coverage row 6: both caution-stripe composites, the footer and the notice. |
| Coverage row 5 — "zero elsewhere" for the status-bar strip is not established | **Docs reworded.** `CLAUDE.md` now says the strip and offset are zero-height wherever the browser reports no top inset, as measured (0px) in an ordinary tab, and that neither has been checked on a real installed app. |
| **C** — 25 restyled lines that display clinical data | **No change; recorded here.** Each flagged line changed only its classes. `src/data/pmg.js` is unchanged (Codex, and `git diff`), and the bridge agent's token comparison found no non-class text change in the nine data-bearing components. Code review cannot verify clinical content, and the transcription is still pending physician verification. |

The fixes were verified by the test suite (73 passing) and in the browser. They were not sent back
to Codex for a second review.
