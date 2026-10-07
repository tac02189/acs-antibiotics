# Codex peer review — v0.5.0 restyle (2026-10-07)

**Engine:** OpenAI Codex CLI 0.160.1, model `gpt-6-astra`, reasoning effort high, `sandbox: read-only`
in every session header. **Scope:** the uncommitted working tree against HEAD `94e0edb` (`main`):
26 tracked files modified or deleted plus `Header.jsx` and `VerificationNotice.jsx` untracked.
**Single engine** for the parts that completed. Run with the `codex-review` agent; the relay below
is that agent's report, verbatim. Dispositions follow at the end.

**Coverage.** The built-in `codex review --uncommitted` and a directed run (checks 2, 3, 5, 6 of the
brief: the contrast matrix, the sticky header, accessibility, the service worker) completed. The
directed run for checks 1 and 4 (enumerating every restyled line that displays a clinical value;
the CLAUDE.md invariants) was killed by Codex's usage limit before it wrote an answer, so **those two
checks were handed to Gemini the same day** — see `2026-10-07-gemini-restyle-review.md`.

---

## Relay (the codex-review agent's report)

**Codex peer review (gpt-6-astra) — uncommitted working tree vs HEAD `94e0edb76d27` (`main`), ACS Antibiotics v0.4.0 → v0.5.0 restyle**

### Coverage: read this first

- **Completed:**
  - the built-in reviewer, `codex review --uncommitted`
  - a directed `codex exec` run B covering your checks 2, 3, 5 and 6
- **Not completed:** directed run A (your checks 1 and 4) was cut off by the usage limit before it wrote any answer. Codex's error, verbatim: `ERROR: You’ve hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at 8:01 PM.`
  - The run ended about 15:14 CDT, so 8:01 PM is presumably local time.
  - I did not retry, and I did not substitute my own review.
  - **No Codex run has enumerated the clinical-value display lines (1(b), 1(c)) or checked the CLAUDE.md invariants (4(a)-(f)).** The one part of check 4 that surfaced is the muted-on-chip rule, inside F2.
- **Discarded run:**
  - My first directed run printed correct tree evidence, then aborted itself with "RUN UNVERIFIED". `node --test "<absolute path through [3] Claude>"` treats the brackets as a glob and answers "Could not find".
  - That was my stop condition being too strict, not a tree problem. It produced no findings.
  - I fixed the prompt and re-ran fresh as two runs (A and B).

**Tree evidence, all runs**

- Every first shell reported `C:\Windows\System32\WindowsPowerShell\v1.0` as its cwd, the documented trap. Each run then adapted with `git -C`, absolute paths or `Set-Location -LiteralPath`.
- Runs A and B printed HEAD `94e0edb76d27cb3f93b89f2962050e387240439c` and the same 28-entry `git status --short` I took independently.
- Their line counts and first lines match my own `grep -c ''` and `head -1` for all four files: `src/index.css` 287 `@tailwind base;`, `tailwind.config.js` 94, `tests/theme.test.js` 297, `src/components/Header.jsx` 142.
- The built-in review's first command failed with `fatal: not a git repository`. Its second command printed the identical status list plus the project directory listing.

### Findings, most severe first (verbatim)

No finding was marked High. F1 and F2 were raised independently by both completed runs. F3 to F5 are from run B only.

#### F1 — Deep-link clearance vs safe-area inset (both runs)

Built-in reviewer:
> - [P2] Include the safe-area inset in deep-link scroll clearance — C:\Thiago\OneDrive\[3] Claude\ACS Antibiotics\src\index.css:141-145
>   In an installed iPhone app, the sticky header includes `env(safe-area-inset-top)`, but these scroll offsets do not. With a 47px inset, the documented 114px phone header becomes 161px tall while deep links land at 124px, hiding the selected indication or drug heading underneath it. Include the inset in both breakpoint offsets to preserve the deep-link clearance required by [CLAUDE.md](CLAUDE.md#L101-L105).

Directed run B:
> 1. **[Medium] Deep-link clearance omits the installed app’s top inset — `src/index.css:141`.** The sticky header includes `env(safe-area-inset-top)`, but both scroll-padding values omit it. At default sizing, the phone header is `114px + inset`, versus 124px scroll padding. With a 44px inset, an indication or drug heading can land **34px behind the header**; with 59px, **49px behind it**. The ≥640px rule has the same defect. Include the inset and account for actual header height, preferably through measurement rather than fixed breakpoint estimates. Offending line:
> `  scroll-padding-top: 7.75rem;`

#### F2 — `text-muted` on `bg-chip` fails contrast, on clinical labels (both runs)

Category note: the labels carry the PMG age threshold, so this is clinical display and goes to you verbatim.

Built-in reviewer:
> - [P2] Use a contrast-safe text token for chip labels — C:\Thiago\OneDrive\[3] Claude\ACS Antibiotics\src\components\DosingView.jsx:57-59
>   The adult/pediatric labels now render `text-muted` on `bg-chip`, giving only 4.34:1 contrast in light mode and 4.04:1 in dark mode, below the required 4.5:1 for this 12px text. The same pairing appears in `DrugsView`'s `DoseBox`, `PageTag`, and `PageChip`. Use a chip-safe token such as `soft` and cover these usages in the contrast checks; [CLAUDE.md](CLAUDE.md#L123-L128) explicitly prohibits muted text on chips.

Directed run B:
> 2. **[Medium] Clinical audience labels and page chips fail contrast while the matrix passes — `src/components/DosingView.jsx:59`.** `text-muted` on `bg-chip` measures **4.344:1 light / 4.038:1 dark**, below 4.5:1. This affects adult/pediatric dosing labels, including the adult age threshold. The same pairing occurs in `DrugsView.jsx:182`, `shared.jsx:72`, `IndicationsView.jsx:256`, and `SourceView.jsx:41`. The matrix expressly excludes this pair and asserts that the light pairing fails, without detecting its actual use. Use a passing foreground and add a guard against forbidden component pairings. Offending line:
```
      <div className="eyebrow text-[12px] text-muted mb-1">{keepUnits(label)}</div>
```

#### F3 — Unfocused search-field boundary below 3:1 (run B only)

> 3. **[Medium] Unfocused search-field boundary falls below 3:1 — `src/components/Header.jsx:87`.** In both themes, `bar-rule` contrasts **1.460:1 with the field** and **2.025:1 with the surrounding black header**; the field fill itself contrasts only **1.388:1 with black**. A low-vision user encounters this before focusing the field; the passing gold focus state does not repair its default boundary. Give the field a boundary token that reaches 3:1 and include that actual pairing in the matrix. Offending line:
```
            className={`w-full h-11 rounded-md border border-bar-rule bg-bar-well pl-10 ${query ? "pr-11" : "pr-3"} text-[16px] text-bar-text text-ellipsis placeholder:text-bar-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors`}
```

#### F4 — Expand/collapse chevrons use `text-faint` (run B only)

> 4. **[Medium] Expand/collapse indicators use a decorative-only colour — `src/components/DrugsView.jsx:81`.** The chevron communicates that a row expands and rotates to communicate its state, but `text-faint` reaches only **2.564:1 on the light card**, below 3:1. `IndicationsView.jsx:368` has the same regression. Hover changes it to a passing colour, which does not help touch users or the initial state. Use a passing icon token and test this pairing. Offending line:
```
                  className={`size-4 shrink-0 mt-1 text-faint transition-transform duration-200 group-hover:text-muted ${open ? "rotate-180" : ""}`}
```

#### F5 — Enlarged brand text truncates instead of reflowing (run B only)

> 5. **[Low] Enlarged brand text is truncated instead of reflowing — `src/components/Header.jsx:45`.** The former brand row could wrap; the replacement uses a nonwrapping flex row, nonshrinking controls, and `truncate` on both title lines. Enlarging text or reducing the effective viewport clips the title and “Acute Care Surgery,” rather than moving controls to another line. Allow reflow and make scroll clearance follow the resulting height. Offending line:
```
            <span className="block truncate text-[11px] font-semibold text-gold">
```

The built-in reviewer's summary line: "The restyle introduces safe-area deep-link occlusion and insufficient contrast on dosing labels and page chips. All 26 selected tests and the PDF transcription verifier passed, but they do not cover these regressions."

### Run B results for your checks 2, 3, 5, 6 (digest, with Codex's numbers)

**Check 2, contrast matrix**

- **2(a) arithmetic:** no finding.
  - `tests/theme.test.js` lines 58-79 are correct: integer-channel validation, sRGB linearisation at 0.04045, weights 0.2126/0.7152/0.0722, ratio (lighter+.05)/(darker+.05), unrounded comparison, non-finite rejected.
  - The alpha compositing is correct for these colours. Its limitation is coverage: it models only the selected `card/70` backgrounds and does not discover other alpha usages.
  - Tailwind preflight sets placeholder opacity to 1.
- **2(b) coverage:**
  - The matrix covers 58 pairs, all passing. The full table is at `execB-out.md` lines 94-157.
  - Codex found **12 `theme.test.js` tests passed, zero failed, despite finding 2.**
  - "Muted-on-chip prohibition is false": five text locations (F2) plus one decorative icon.
  - "No tone-mark or tone-ink text on chips was found." A `PageTag` inside a tone card explicitly overrides inherited tone ink with muted text.
  - Hypothetical, unused chip pairings: warn-mark 4.584/6.203, danger-mark 5.737/**3.847 (fails in dark)**, good-mark 5.006/5.386, warn-ink 8.281/8.314, danger-ink 8.732/7.341, good-ink 8.872/8.074 (light/dark, all uncovered).
  - Links on tone cards: the notice link inherits `warn-ink` and passes. No teal link on a tone wash was found.
  - Search placeholder: `bar-muted` on `bar-well`, 5.999:1 in both themes, covered.
  - Gold pill: black on gold, 11.634:1, covered.
  - No disabled controls, `disabled:` or explicit `active:` styles, gradients, text-alpha classes or element-opacity utilities were found.
  - Alpha utilities in use: `bg-card/70` and `border-gold/40`. `border-rule-strong/60` is defined but unused and would fail 3:1 (1.844/2.594 on well, 1.886/2.364 on card).
  - Print forces black on white, 21:1. Its decorative `#999` borders are 2.849:1.
- **2(c) can the test fail?** Yes: lines 131-140 hold the fail-closed controls and lines 179-206 the forbidden fixed-colour syntax. But "there is no control connecting component foreground/background combinations to `contrastFailures()`". The assertion at line 140 proves the excluded pair fails, not that components avoid it.

Actual component pairs the matrix omits (Codex's table, verbatim):

| Foreground / background or boundary | Light ratio | Dark ratio | Covered | Threshold | Result L/D |
|---|---:|---:|:---:|---:|:---:|
| muted / chip — labels and page tags | 4.344 | 4.038 | No | 4.5 | **F/F** |
| muted / chip — decorative image icon | 4.344 | 4.038 | No | 3 | P/P |
| accent-hi / chip — PDF-link hover | 6.922 | 8.213 | No | 4.5 | P/P |
| ink / warn-bg — highlighted fracture drug name | 17.215 | 14.315 | No | 4.5 | P/P |
| prose / warn-bg — highlighted regimen | 14.107 | 12.149 | No | 4.5 | P/P |
| soft / warn-bg — regimen route | 7.307 | 10.088 | No | 4.5 | P/P |
| muted / warn-bg — `Lines`/connectors | 4.589 | 5.841 | No | 4.5 | P/P |
| accent / accent-soft — Copy link hover | 5.248 | 6.405 | No | 4.5 | P/P |
| good-mark / accent-soft — Copied icon | 5.258 | 4.929 | No | 3 | P/P |
| bar-text / bar-well-hi — pill hover | 9.510 | 9.510 | No | 4.5 | P/P |
| bar-rule / bar — field outer boundary/icon ring | 2.025 | 2.025 | No | 3 | F/F |
| bar-rule / bar-well — field inner boundary | 1.460 | 1.460 | No | 3 | **F/F** |
| bar-rule / bar-raised — tab separator | 1.679 | 1.679 | No | 3 | F/F |
| bar-well / bar — field/off-pill fill | 1.388 | 1.388 | No | 3 | F/F |
| bar-well-hi / bar — hovered pill fill | 2.025 | 2.025 | No | 3 | F/F |
| gold .40 over bar / bar — PDF/theme borders | 2.479 | 2.479 | No | 3 | F/F |
| faint / card — chevrons, icons, dotted underline | 2.564 | 3.074 | No | 3 | **F/P** |
| faint / well — bullets/underline | 2.451 | 3.751 | No | 3 | F/P |
| gold / card — bottom-nav active mark | 1.805 | 8.104 | No | 3 | F/P |
| rule / paper, well | 1.178 | 1.724 | No | 3 | F/F |
| rule / card | 1.233 | 1.413 | No | 3 | F/F |
| rule / chip | 1.125 | 1.000 | No | 3 | F/F |
| rule-soft / card — dividers | 1.096 | 1.263 | No | 3 | F/F |
| rule-soft / well — expanded-panel boundary | 1.047 | 1.541 | No | 3 | F/F |
| warn-line / warn-bg | 1.201 | 1.651 | No | 3 | F/F |
| warn-line / paper, well | 1.190 | 1.968 | No | 3 | F/F |
| warn-line / card | 1.245 | 1.612 | No | 3 | F/F |
| warn-line / card .70 over warn-bg | 1.232 | 1.666 | No | 3 | F/F |
| danger-line / danger-bg | 1.284 | 1.634 | No | 3 | F/F |
| danger-line / paper | 1.348 | 1.866 | No | 3 | F/F |
| danger-line / card | 1.411 | 1.529 | No | 3 | F/F |
| danger-line / card .70 over danger-bg | 1.372 | 1.641 | No | 3 | F/F |
| good-line / good-bg | 1.217 | 1.559 | No | 3 | F/F |
| good-line / card | 1.283 | 1.505 | No | 3 | F/F |
| good-line / well | 1.226 | 1.837 | No | 3 | F/F |
| hue-trauma / paper | 3.509 | 6.633 | No | 3 | P/P |
| hue-trauma / card | 3.672 | 5.435 | No | 3 | P/P |
| hue-egs / paper | 2.053 | 10.694 | No | 3 | F/P |
| hue-egs / card | 2.148 | 8.763 | No | 3 | F/P |
| hue-elective / paper | 2.649 | 8.333 | No | 3 | F/P |
| hue-elective / card | 2.771 | 6.829 | No | 3 | F/P |
| hue-inpatient / paper | 4.047 | 6.560 | No | 3 | P/P |
| hue-inpatient / card | 4.234 | 5.375 | No | 3 | P/P |
| hue-inpatient / chip | 3.865 | 3.805 | No | 3 | P/P |

Codex: "The hairlines, section dots, regimen rules, and supplementary bottom-nav mark are decorative or redundant with text/other indicators. Their numerical failures are listed as requested, rather than promoted to findings. The expansion chevrons and search boundary have functional roles."

**Check 3, sticky header and deep links**

- Heights at a 16px root and normal text: brand row 58px, search row 54px, a 2px gold border on phones, and about 41.5px of tabs from 640px.
- Codex's computed table (rows for 320, 360, 375, 390 and 414 were identical and are merged):

| Width | Header without inset | Scroll padding | Clearance at S=0 | Overlap at S=44 | Overlap at S=59 |
|---|---:|---:|---:|---:|---:|
| 320 / 360 / 375 / 390 / 414 | 114 | 124 | 10 | 34 | 49 |
| 640 | 153.5 | 168 | 14.5 | 29.5 | 44.5 |
| 768 and wider | 153.5 | 168 | 14.5 | 29.5 | 44.5 |

- Codex: "Finding 1 applies whenever S exceeds 10px on phones or 14.5px on larger layouts. At zero inset and normal sizing, no finding for the specified widths." Inset values are scenarios, not device measurements.
- Neither header row permits wrapping, so there is no two-row brand height at narrow widths. Enlarged text exposes F5, and fixed scroll padding cannot follow a taller header.
- The verification notice sits outside the sticky header and has no dismissal mechanism.
- Indication deep links: the target opens, then the next animation frame scrolls to and focuses its article.
- Drug deep links: switching from an already-open earlier drug collapses content above the new target over 200ms, with no completion correction. Codex: this "cannot be certified from the permitted source/computation checks alone."

**Check 5, accessibility**

- **Focus:** no additional finding.
  - Header controls use a 2px teal outline, 2px offset, on black: 5.609 light / 11.281 dark.
  - Desktop nav: 4.648 / 9.350. Clear-search: 4.042 / 8.130.
  - Search is the only `outline-none`; it supplies a gold border and ring at 8.384:1.
  - Verification-notice ring: 3.611 / 8.046.
  - The gold pill's outline sits outside the pill on black, so its low teal-vs-gold ratio is "not a focus failure".
- **ARIA:** no new finding.
  - The theme toggle is a labelled action button.
  - Tabs and BottomNav are `nav` links with `aria-current="page"`, not ARIA tabs.
  - Indication rows have `aria-expanded` plus matching `aria-controls`.
  - Drug rows have `aria-expanded` but no `aria-controls`, unchanged from HEAD.
  - Alternatives keeps `aria-pressed`.
- **inert:** no finding. React 18.3.1 `renderToStaticMarkup` gave `open=false <div inert="" aria-hidden="true"><button>child</button></div>` and `open=true <div aria-hidden="false"><button>child</button></div>`. There is no inert polyfill; without native inert, `aria-hidden` alone does not stop keyboard focus, and Codex says that predates this change.
- **Targets and motion:**
  - Search and Alternatives are 44px; theme, PDF and clear are 40px; row toggles are at least 52px; Copy link is at least 36px.
  - BottomNav cells are about 53.3×56px at 320px.
  - Reduced motion is handled and no continuous animation remains.
  - Actual 200% browser rendering was not executed.
  - No clinical instruction is conveyed by hue alone.
- **Landmarks:** no new finding. Indications has no h1, which also held at HEAD. The notice is an always-rendered, keyboard-operable link to Source.
- **Type guard:** `tests/type.test.js`, 2 passed.

**Check 6, service worker and PWA:** no additional finding beyond F1.

- **Fonts:**
  - Source Sans 3 (seven WOFF2 subsets) and JetBrains Mono (Latin 500 and 700) are all present locally.
  - WOFF2 sizes are 9,784 to 60,088 bytes, under the 3 MiB precache limit.
  - `globPatterns` includes `woff2`. WOFF fallbacks are not matched.
  - Font imports precede `index.css`.
  - Package and lockfile versions agree on 0.5.0.
- **Not verified:** "Generated precache was not verified: no build was run."
- **Service worker and routing:** manifest icons and Workbox settings are unchanged apart from colours. The whole service-worker update block is unchanged. Hash routing, the hashed PDF URL and the no-rewrite `firebase.json` are intact.
- **Stored theme values:**

| Stored value / condition | v0.5.0 result |
|---|---|
| `"dark"` saved under v0.4.0 | Dark preserved |
| `"light"` | Light preserved |
| Nothing stored, formerly implicit dark | Light |
| Invalid value | Light |
| Throwing or absent localStorage | Light |
| Storage write fails during toggle | Toggle works for the current visit |

  Codex called the default change intentional and consistent between the pre-paint script and the runtime helper.
- **Colours:** the static meta, manifest `theme_color`, runtime constant and both `--bar` tokens are black. Manifest `background_color` is the light canvas, so a dark-preferring user can still see a light launch splash.
- **iOS standalone:** `black-translucent` and `viewport-fit=cover` remain. The removed strip is replaced by the sticky header's black background and `pt-[env(safe-area-inset-top)]`. "The error is that deep-link clearance does not include that same padding" (F1).

Run B tooling notes (relayed): PowerShell mangled curly quotes, which briefly suggested a JSX syntax error. Code-point reads and an in-memory Babel parse of App and every component cleared it. One `node -e` call was re-run through a here-string. Nothing was created or written.

### Checks 1 and 4: partial evidence only, no Codex conclusions

- **1(a) `src/data/pmg.js` is byte-for-byte unchanged.**
  - Codex raw output (run A): `hash-object --no-filters` of the working file and `rev-parse HEAD:src/data/pmg.js` both printed `df1df8473043f1062441c96d487f03825eb2552b`, and `status --short -- src/data/pmg.js` printed nothing.
  - Run A's interim narration: "The clinical data file has the same Git blob hash as HEAD."
  - My independent check agrees: `git cat-file blob HEAD:... | cmp` reports byte-identical, and sha256 is `e788ad0f29b1ed810ebea0701356a9fb234c2d40d330f19e66a302887e69043c` for both.
- **1(b)/(c), clinical-value display.** Run A's interim narration, verbatim:
  - "The display diff moves doses, routes and frequencies into new layouts; I’m checking those associations and the narrower phone layouts next."
  - "The theme, type-scale and text-helper tests pass. I found a gap in the contrast checks: they explicitly exclude muted text on chip backgrounds, but the new dosing labels and page chips use that pairing. I’m computing the actual ratios and checking for other omitted states and clipping risks."
  - Files that show clinical values and their `git diff --stat` size: `IndicationsView.jsx` 347 changed lines, `shared.jsx` 183, `OpenFracturesView.jsx` 159, `DrugsView.jsx` 158, `SourceView.jsx` 119, `FeverWorkupView.jsx` 85, `DosingView.jsx` 73.
- **4(e), new user-visible strings.** Raw output of run A's own extraction script (strings not found verbatim in HEAD's JSX text nodes). These are unadjudicated candidates and may include fragments that merely moved:

```
DosingView.jsx:7 Adult & pediatric dosing
DrugsView.jsx:70 use
FeverWorkupView.jsx:88 This page of the PMG is a flowchart image with no text layer. The steps above were read from the picture and cannot be checked by the verification script —
FeverWorkupView.jsx:93 to see the original.
Footer.jsx:14 ). A reference to the guideline, not a substitute for it or for clinical judgment — confirm doses against the PDF and the patient. Antibiotic choice for a given patient remains the treating team's decision.
Footer.jsx:20 ACS Antibiotic Guide v
Footer.jsx:20 · Mizzou Emergency Medicine
Footer.jsx:21 Not an official MU Health publication
IndicationsView.jsx:136 “
IndicationsView.jsx:136 ”
IndicationsView.jsx:136 column for every indication. That column holds penicillin-allergy regimens but also contamination escalation and MRSA add-ons — read each note's condition. Tap a row to expand it.
IndicationsView.jsx:148 All sections
IndicationsView.jsx:154 No section called “
IndicationsView.jsx:155 ”.
IndicationsView.jsx:192 “
IndicationsView.jsx:192 ”
IndicationsView.jsx:197 Nothing in the PMG tables matches. Try the diagnosis as the PMG names it (e.g. “
IndicationsView.jsx:198 ”, “SBO”), a drug (“
IndicationsView.jsx:199 ”, “
IndicationsView.jsx:199 ”), or check
IndicationsView.jsx:248 · p.
IndicationsView.jsx:256 p.
OpenFracturesView.jsx:70 Adult & pediatric dosing table
shared.jsx:74 PMG p.
SourceView.jsx:38 · Original publication date
SourceView.jsx:38 pages
SourceView.jsx:128 Pages
SourceView.jsx:129 –
SourceView.jsx:129 of the PMG reproduce the MU Health University Hospital antibiogram for
SourceView.jsx:130 . The
SourceView.jsx:130 app carries the newer dataset, so those pages are linked rather than re-typed here.
VerificationNotice.jsx:16 Transcription pending physician verification.
VerificationNotice.jsx:16 PMG
VerificationNotice.jsx:16 — confirm against the PDF.
```

**Clinical values for human verification (so far, flagged as unverifiable from code, not as suspicious)**

1. The adult/pediatric dosing labels (`DosingView.jsx:59`, `DrugsView.jsx:182`) carry the PMG's adult age threshold. Per the in-code comment at `DosingView.jsx:58` and `DrugsView.jsx:181`, they now render at 4.344:1 light / 4.038:1 dark (F2). A human should look at the rendered label in both themes on a phone.
2. Every restyled dose, route, frequency, duration, redose, threshold, footnote-mark and open-fracture-timing display in the seven files above is unenumerated. The value-to-label associations have not been checked by any completed run.

---
Reviewed: uncommitted working tree (26 tracked files modified or deleted, plus 2 untracked: `Header.jsx`, `VerificationNotice.jsx`) vs HEAD `94e0edb76d27cb3f93b89f2962050e387240439c`, `main`.
- Built-in review: `codex review --uncommitted -c model="gpt-6-astra" -c sandbox_mode="read-only"`, session `01a117f4-a47c-7cb0-8272-7a5dc63fa898`.
- Directed run B (checks 2, 3, 5, 6): `codex exec -m gpt-6-astra -s read-only`, session `01a117f9-6b16-7230-a989-54f4edf77de1`.
- Directed run A (checks 1, 4): session `01a117f9-6115-7943-9afb-5e0cc5433436`, killed by the usage limit with no answer.
- Discarded first directed run: session `01a117f4-aedd-7a51-b2d2-79d511e4a727`.

Sandbox: `sandbox: read-only` verbatim in the header of all four runs (Codex v0.160.1, model gpt-6-astra, reasoning effort high).

Agreement: nothing was adjudicated away. The two completed lines of inquiry independently reached F1 and F2 with matching figures (4.34/4.04 vs 4.344/4.038; 114px header vs 124px padding). Both are the same model, so that shows repeat-run consistency, not a cross-lineage check.

### Assessment (harness, not Codex)

- **Dismissals:** none. All five distinct findings are relayed unsoftened, with duplicates grouped. F2 and the clinical-display gaps are in the never-dismiss category and are passed through as is.
- **Checks I made on Codex's evidence:**
  - Every cited location exists in the working tree and says what Codex quotes: `index.css:141-145`, `DosingView.jsx:57-59`, `DrugsView.jsx:182`, `shared.jsx:72`, `IndicationsView.jsx:256`, `SourceView.jsx:41`, `Header.jsx:45` and `:87`, `DrugsView.jsx:81`, `IndicationsView.jsx:368`, `theme.test.js:140`.
  - `CLAUDE.md:101-105` and `:123-128` say what the built-in review quotes. The latter states that a chip carries `ink`, `prose` or `soft`, "never `muted`", which the code at the F2 lines contradicts.
  - Read-only was real. After all runs, `git status --short --ignored`, the SHA-256 of all 26 changed or untracked files and the `.git/index` mtime (12:03:40) were identical to my pre-run snapshot. No file under the repo was modified after the baseline, and there are no `*-DESKTOP-*` or `*-LAPTOP-*` files in `.git`.
- **Not verified by me:** the contrast ratios, the header-height arithmetic, browser behaviour, and the contents of the generated precache (nobody ran a build).
- **Decision for you:** the highest-value unreviewed items are the value-to-label associations in the seven clinical-display files and CLAUDE.md invariants 4(a)-(f).
  - Option 1: a fresh Codex run of those two checks after the limit resets (about 8:01 PM). `promptA.md` already carries the glob fix.
  - Option 2: `/gemini-review` now.
  - I started neither. Neither can certify a clinical value, and the F2 labels need a human look regardless.
- **Tooling lesson:** `node --test` with an absolute path through a bracketed folder fails as a glob. Use `Set-Location -LiteralPath` plus relative test names, which is what the working runs did.

---

## Dispositions (Claude, the session that made the change)

All five findings were applied the same day; none was dismissed. The fixes were checked by the
tests and in Chrome, not re-reviewed by Codex (its quota was spent).

| # | Finding | Disposition |
|---|---|---|
| F1 | `scroll-padding-top` omits the status-bar inset | **Fixed, by measurement rather than a fixed estimate** (Codex's preferred form). `Header.jsx` publishes its rendered height, inset and any wrapped brand row included, as `--app-header-h` through a `ResizeObserver` (the Pediatric CPG's own pattern); `src/index.css` sets `scroll-padding-top: calc(var(--app-header-h, 7.25rem) + 0.625rem)`. Measured in Chrome at 375px: header 114px, variable `114px`, scroll padding 124px, and a deep link to `#/i/appendicitis` lands its row 10px below the header. |
| F2 | `text-muted` on `bg-chip` (4.34:1 light / 4.04:1 dark), including the adult/pediatric dosing labels | **Fixed.** Every chip label now uses `text-soft` (6.9:1 light / 7.0:1 dark): `DosingView` `DoseBlock`, `DrugsView` `DoseBox`, `PageTag`, `PageChip`, the Source page's sha256 label; the one decorative icon on a chip (`FeverWorkupView`) too. **A new guard test** (`no muted text or tone mark sits on a chip`) scans every component for `text-muted` or a tone mark on a `bg-chip` element or inside it, with a control proving it catches the nested, same-line and multi-line-tag forms. The labels carry the PMG's adult age threshold: **a human still has to read them on a phone in both schemes** — the fix changes their colour, nothing else. |
| F3 | Unfocused search-field boundary 1.46:1 on the field | **Fixed.** New token `--bar-rule: 112 112 112` (3.1:1 on the field, 4.2:1 on the bar) for the field's resting border, and `--bar-line: 64 64 64` for the decorative lines that used the old value (the tab-row rule, the icon ring). Both pairs are now in the contrast matrix at 3:1. The field fill (1.39:1 on black) and the switched-off pill are unchanged: the pill is identified by its text and icon, and the field by its border, icon and placeholder. |
| F4 | Expand chevrons and the cross-link arrow in `text-faint` (2.56:1 on the light card) | **Fixed.** Chevrons (`IndicationsView`, `DrugsView`), the cross-link arrow and the reference-standard link icon use `text-muted` (4.8:1) with `text-prose` on hover. `faint` keeps only decoration: bullets, the dotted underline under a tappable drug name, the empty-state icon. |
| F5 | Enlarged brand text truncates instead of reflowing | **Fixed.** The brand row is `flex-wrap`; the brand link is `flex-auto`, so when it and the controls do not fit one line the controls drop to a second line and the title keeps its full width (`truncate` remains the last resort for a title wider than the row). The measured header height (F1) follows. At normal text size the row stays one line from 320px, checked in Chrome. |

Also from the run-B tables, without a finding attached: `border-rule-strong/60` (an unused tone-line
class that would fail 3:1) was replaced by `border-rule-strong`; the hypothetical `danger-mark` on a
chip in dark (3.85:1) is now impossible by the chip guard. The hairlines, tone-card lines, section
dots and the bottom-nav gold mark listed as under 3:1 are decorative or redundant with text and were
left as they are, as Codex itself classed them. The drug deep-link note (an earlier open row
collapsing above the target over 200ms, with no completion correction) predates this change and was
not addressed. The "new user-visible strings" list was read: every entry is interface wording or a
sentence moved between elements; none is clinical content.
