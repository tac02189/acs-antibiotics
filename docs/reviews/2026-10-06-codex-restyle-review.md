# Codex peer review — "trauma-bay instrument" restyle, 2026-10-06

Single-engine review (Codex CLI 0.153.4, model `gpt-6-astra`, reasoning effort `high`, sandbox
`read-only`, no tool use; session `01a11127-5470-74f2-805c-20407b2f918f`, 14 minutes, 102,131 tokens)
of the uncommitted working tree against `91743f4` plus the new `src/components/BottomNav.jsx` —
i.e. the port of Gemini's design onto the reviewed code. Packet: the full `git diff HEAD` (2,071
lines, 19 files) and the line-numbered new versions of every component, `index.css`,
`tailwind.config.js`, `App.jsx`, `index.html`, `main.jsx`, plus `route.js`, `search.js`,
`firebase.json`, `postcss.config.js`, `vite.config.js`, `package.json`, the `dist/` listing,
`dist/index.html` and `dist/sw.js`. `git diff --stat HEAD -- src/data scripts tests` was empty and
Codex was told so. Not cross-checked by Gemini. **Nothing below was dismissed or softened.**

## Findings (verbatim headlines and substance; full text in the bridge transcript)

1. **[HIGH] [CLINICAL] Print colours do not follow the print theme.** `src/index.css:129` changes the surface variables to white but does not override fixed text colours (`text-white` drug names, `text-emerald-400` doses, `text-slate-200` instructions). White drug names have **1:1** contrast on white; emerald doses ≈ **1.92:1**. Printing can remove names while leaving faint doses. The fixed footer background survives while its text becomes dark grey. *Fix: explicitly apply print foreground and background colours to every clinical surface.*
2. **[HIGH] [CLINICAL] The dosing introduction hard-codes a clinical threshold and an absolute ordering instruction** (`DosingView.jsx:14`: "Adult means age ≥15 years. Vancomycin is always ordered as 'Pharmacy to Dose'."). Not from `dt`; can diverge from the table; more categorical than the table's statement. Existing content retained by the port. UNVERIFIABLE, not established as wrong.
3. **[HIGH] [CLINICAL] Fracture timing and screening instructions are independently hard-coded** (`OpenFracturesView.jsx:24–36`: "30", "min", "Antibiotics within 30 min of arrival to the ED", "All patients get an MRSA nasal screen."; `IndicationsView.jsx:13`: "…within 30 min of ED arrival."). Rendering `{of.timing}` alongside does not make those copies data-derived; they now receive substantially stronger emphasis. *Fix: put the structured timing in the clinical data and render it consistently.*
4. **[MEDIUM] [CLINICAL] The fever search shortcut supplies an unverified clinical sequencing claim** ("what the PMG says to send before antibiotics").
5. **[MEDIUM] [CLINICAL] Regimen layouts lack a reliable narrow-screen wrapping strategy** (inline-flex pills without internal wrapping; `OrderLine` auto dose column; `Field` 120 px label). Exact failing width UNVERIFIABLE without rendering.
6. **[MEDIUM] [CLINICAL] The Alternatives button's accessible name does not contain its visible label** (`aria-label="Highlight the PDF's PNC Allergy / Alternative column"` vs visible "Alternatives").
7. **[MEDIUM] Deep-link focus can be cancelled permanently for that arrival** — `focusedOnce.current` is set before the animation-frame callback; cleanup cancels the frame and the re-run returns early. Affects StrictMode replay and a production race when clearing a search changes `results`.
8. **[MEDIUM] Focus indicators can be transparent or clipped** — `focus:outline-none focus-visible:outline` on the article can keep the outline transparent; disclosure buttons inside `overflow-hidden` cards have their outside outline clipped.
9. **[MEDIUM] Bottom navigation obscures the end of the footer** — `main` has bottom padding but the footer follows it; 56 px + safe-area inset not reserved.
10. **[MEDIUM] Essential control boundaries have insufficient contrast** — `border-rule` ≈ 1.27:1 against the input fill, 1.35:1 against the canvas; search-field extent hard to distinguish. The cyan focused state passes.
11. **[LOW] Several controls miss 44 px targets; some standalone links are below 24 px** (clear search 36 px; header PDF 34 px; All sections 30 px; copy link ≈ 26.5 px; drug-page page links ≈ 16.5 px; indication links on drug pages ≈ 21 px; dosing-table link ≈ 18 px; antibiogram link 20 px).
12. **[LOW] CopyLink changes history when copying fails** (`window.location.hash = …` fallback).
13. **[LOW] Search-expanded cards cannot be collapsed with their disclosure buttons** (`open={autoOpen || open.has(id)}`).
14. **[LOW] [CLINICAL] Drug search examples and matching names are hard-coded outside the data** ("Zosyn", "cefazolin", "cefepime", "maxipime"); the literal claim that every drug-name string comes from `pmg.js` is false.
15. **[LOW] The documentation's amber-reservation claim contradicts the implementation** (amber also used for footnote marks, reviewer counters, connectors).

**Regression checklist:** a (deep link) FAIL per finding 7; d (CopyLink) FAIL per finding 12; g CANNOT VERIFY completeness; every other item PASS. **Clinical-text inventory:** no hard-coded numeric dose, frequency, duration, redose rule or complete alternative regimen in components; the data-only claim is false because of items 2, 3, 4 and 14. **Contrast:** every text/background pair on the dark surfaces passes 4.5:1 (muted 7.7:1 on canvas; signal red 5.4–5.9:1); control borders fail 3:1; amber focus adjacent to the amber banner 2.26:1; every print pair fails (1.0–3.4:1). **Tailwind audit:** no class that 3.4 fails to generate, no `dark:` leftovers, `.lcd-well` unused. **PWA:** nine WOFF2 files precached (150,096 bytes); no remote fonts or scripts; IBM Plex Mono imported at 500/600 while dose styles request 700 (synthesised bold).

### Bridge agent's annotations (not dismissals)

Findings 2, 3, 4 and 14 (hard-coded clinical strings), 7 (focus ref), 12 (CopyLink) and 13 (autoOpen) were already in the committed, deployed HEAD; the restyle did not introduce them. Finding 1 (print) and 9 (BottomNav) are new with the restyle. 20 `file:line` citations spot-checked, all exact; 58 contrast ratios recomputed, none off by more than 0.03; the print premise confirmed in code (one `@media print` block; `color` not forced).

## Dispositions (Claude, same day, before the restyle commit)

| # | Disposition |
|---|---|
| 1 | Fixed. Print block now forces `color: #000`, transparent backgrounds, no shadows and grey borders on every element, sets `color-scheme: light`, and zeroes the amber/focus tokens. |
| 2 | Fixed. The intro no longer restates the age threshold or the pharmacy instruction; the data's column labels and footnotes are the only wording. |
| 3 | Fixed. The headline renders `openFractures.timing` verbatim; the big numeral and unit are parsed from that sentence (and disappear if it ever stops matching); the cross-link blurb no longer states the timing. |
| 4 | Fixed. The blurb describes the destination ("the PMG's infectious-workup flowchart") without a sequencing claim. |
| 5 | Fixed. Pills wrap internally; the dose column is `minmax(0,auto)` with wrapping; `Field` labels are 6.5 rem with `break-words` on both columns. |
| 6 | Fixed. `aria-label="Alternatives — highlight the PDF's PNC Allergy / Alternative column"`. |
| 7 | Fixed. Completion is recorded inside the frame callback, so a cancelled frame is retried. |
| 8 | Fixed. The article relies on the global amber `:focus-visible` ring (no `outline-none`); disclosure and drug buttons use an inset outline offset. |
| 9 | Fixed. The footer reserves `4.5rem + env(safe-area-inset-bottom)` below `sm`. |
| 10 | Fixed. New `--rule-strong` token (#5B6B8A, 3.4:1 on the card) on the search field, the toggle and the PDF button. |
| 11 | Fixed. Clear-search 44 px; PDF button 44 px; All sections 44 px; copy link ≥36 px; drug-page links and indication links padded to ≥32 px; dosing-table and antibiogram links padded. |
| 12 | Fixed. On clipboard failure the URL is shown for manual copy; nothing navigates. |
| 13 | Fixed. Auto-opened cards can be collapsed; the override resets when the query changes. |
| 14 | Fixed. Search examples and the fracture cross-link's drug words come from `drugs{}` and the open-fracture regimens. |
| 15 | Fixed. `CLAUDE.md` now lists every use of hazard amber. |
| Plex Mono 700 | Fixed. The 700 weight is imported, so bold doses are no longer synthesised. |
| iOS top inset | Fixed. The brand bar pads `env(safe-area-inset-top)` under the translucent status bar. |

Not closed by code and still for a human with the PDF: the clinical values themselves (unchanged since the morning review), and a real print preview and device render of the new theme.
