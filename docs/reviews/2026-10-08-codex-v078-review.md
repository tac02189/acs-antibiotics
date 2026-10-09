# Codex peer review — v0.7.8, 2026-10-08

One single-engine Codex run before the deploy. Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec
--sandbox read-only` (header confirmed `sandbox: read-only`), reasoning effort `high`, packet on
stdin, no tools; relayed by the `codex-review` bridge agent. Not cross-checked with Gemini.
Reviewed the uncommitted changes against `f23b9d6` (v0.7.7): the physician card kept open and the
Expand all button. **Nothing below was dismissed or softened.** Verbatim answer, then dispositions.

---

All 11 packet sections are present and appear complete. This review uses only the supplied text; test and browser results remain unverified claims.

1. **Low — `src/components/IndicationsView.jsx:197`: Bulk actions discard collapse overrides for rows outside the current section.**  
   `setOpen` and the section updater preserve unrelated IDs, but `setClosed` replaces the entire set. For example, with a narrow search matching rows in sections A and B: manually collapse A’s row, navigate to `#/s/B` while retaining the query, then click “Collapse all.” This replaces A’s override with B’s IDs. Returning to all sections with the same query unexpectedly auto-opens A’s row. “Expand all” similarly clears unrelated overrides. This changes a hidden row’s state despite the stated visible-results scope. Preserve overrides outside `shownRows`.

2. **Low — Existing controls still fall below the requested 44px target height; these are not v0.7.8 regressions.**  
   Under the supplied Tailwind styling and standard line heights:
   - `src/components/IndicationsView.jsx:214`: “All sections,” approximately 33px.
   - `src/components/SourceView.jsx:48`: PDF button, approximately 41px; `:135`: antibiogram link, approximately 37px.
   - `src/components/FeverWorkupView.jsx:39`: single-line reference links, approximately 41px.
   - `src/components/OpenFracturesView.jsx:75`: dosing-table link, approximately 36px.
   
   The inline links at `src/components/FeverWorkupView.jsx:54` and `src/components/SourceView.jsx:152` also have no 44px target sizing. Global CSS is absent, so any global target enlargement cannot be assessed.

### Checks (a)-(f)

- **(a) KEYS — no findings.** Every registration matches:
  - **Workup:** line 8 generates `workup:${b.id}` from the same unfiltered `fw.branches` rendered at lines 26–27 and registered at line 67; `workup:reference-standards` matches line 31. Branch conditions affect contents, not card registration.
  - **Fractures:** line 10 matches all four cards exactly: `fractures:antimicrobial` (45), `fractures:duration` (81), `fractures:classification` (109), and `fractures:femoral-shaft` (132). All render unconditionally.
  - **Dosing:** line 5 uses the same `dt.rows` and `dosing:${row.drug}` expression as rendering at line 20 and registration at line 44. Conditional metadata and footnotes do not change IDs.
  - **Source:** line 6 matches `source:corrections` (105), `source:antibiogram` (125), and `source:references` (142). The physician card correctly has no registered key.

- **(b) Indications — finding 1; otherwise no findings.** No-search and section-route actions update the appropriate displayed sections and openable rows. Broad searches use `searchCollapsed`; narrow-search collapse removes explicit opens and supplies the required auto-open overrides. N/A rows are excluded consistently with `IndicationRow`. Explicitly opened rows from earlier searches are preserved unless currently included. `allOpen` checks both section visibility and row expansion, so hidden expanded rows cannot incorrectly produce “Collapse all.” No stale closure or visible no-op was identified.

- **(c) Physician card — no findings.** Post-change `SourceView.jsx` lines 61–100 match v0.7.6 lines 57–96 exactly. The `CHECKED` and `NOT_CHECKED` strings and the `transcription.flags` rendering expression also match.

- **(d) New-button accessibility — no findings in the supplied markup.** Native buttons provide keyboard activation and text names; icons are hidden from assistive technology. DOM order places buttons before their controlled cards, and `min-h-[44px]` supplies the required height. No local style suppresses focus outlines. The status paragraph retains its role and content; making the button its sibling in a flex container does not change live-region semantics. Actual announcements and rendered focus visibility require runtime verification.

- **(e) Regression — finding 1 is the identified new behavioral issue.** Other individual toggles, initial collapsed states, and App-held card persistence remain intact. The physician card’s always-open behavior is intentional. No new hook-rule, dependency, memoization, or state-update defect was found. Sub-400px rendering cannot be certified without the omitted global CSS and runtime layout.

- **(f) Colour tokens — no findings.** New colour classes use defined tokens, including `accent`, `accent-hi`, and the restored physician-card tokens. `bg-card/70` is token-based opacity. Arbitrary pixel sizes are not arbitrary colours.

No drug, dose, frequency, duration, threshold, or clinical wording change appears in the supplied diff. The omitted `pmg.js` content was not independently checked.

---

## Dispositions

- **Low 1 — bulk actions replaced the whole `closed` set.** Fixed before the commit: `setAllOpen`
  now adds or removes only the rows on screen, so a row collapsed in another section during a narrow
  search keeps its override. Re-checked in the preview (narrow search, broad list, both directions).
- **Low 2 — controls under 44px elsewhere.** Pre-existing, as Codex says (the same point as the
  v0.7.7 run 1 Low). Not changed in this release.
