# Codex peer review — separate indication cards and collapsible sections (v0.7.0), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **Scope:** the v0.7.0 diff against `ebb11cf` (eight files: `src/App.jsx`,
  `src/components/IndicationsView.jsx`, `src/components/shared.jsx`, `src/index.css`, `CLAUDE.md`,
  `README.md`, `package.json`, `package-lock.json`), embedded in the prompt on stdin with the
  post-change `IndicationsView.jsx`, `shared.jsx`, `App.jsx`, `index.css` and `src/lib/route.js`
  whole. `Header.jsx` (which publishes `--app-header-h`) was not in the packet.
- **Packet-only run:** Codex read nothing from disk. Its packet check (472 / 343 / 115 / 329 / 62
  lines, diff 430 lines) matched the real counts.
- **Committed mid-review:** the diff was committed as `f139470` at Thiago's request while the review
  ran. The bridge agent confirmed the packet byte-identical to `git diff ebb11cf f139470`, so the
  findings apply to that commit.
- **A concurrent session** was changing the app icon in the same tree (committed as `7acde4b`). Its
  files were excluded from the packet; none reached Codex.
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; the dispositions are
  at the end.

---

````text
PACKET CHECK: IndicationsView.jsx=472 lines, shared.jsx=343 lines, App.jsx=115 lines, index.css=329 lines, route.js=62 lines, diff=430 lines — all five files and the diff end cleanly.

1. **Medium — `src/components/IndicationsView.jsx:87`: Section links do not reopen sections collapsed during a search.**  
   The arrival effect removes the section only from `collapsed`, while an active search uses `searchCollapsed` (`:82`). Unlike indication links, section links do not clear the query (`src/App.jsx:49`).

   **Failure scenario:** Search for something with matches, collapse a matching section, then navigate to `#/s/<that-section-id>` without leaving the Indications view. The query and search collapse state survive, so the linked section’s results remain hidden.

   **Suggested fix:** Clear the query on section-link arrivals too, or remove the destination from `searchCollapsed` in the route-arrival effect. Keep this driven by route changes so manually collapsing the destination afterward remains possible.

2. **Medium — `src/components/IndicationsView.jsx:249`: Printing a collapsed section omits its blurb.**  
   Collapsing passes `null` for `section.blurb`, removing that text from the DOM. The print override at `src/index.css:309` restores the list but cannot restore the missing blurb.

   **Failure scenario:** Print a section with a nonempty blurb, first expanded and then collapsed. Both print its rows, but only the expanded version includes the section description. The packet does not include the blurbs, so their clinical significance cannot be assessed.

   **Suggested fix:** Keep the blurb rendered, hide it on screen with the collapsed section, and restore it for print alongside the list.

3. **Low — README.md, hunk `@@ -60,7 +60,9 @@`: Search visibility is overstated.**  
   The added wording **“a search still shows every match”** is not true after the reader collapses a section during that search. CLAUDE.md’s hunk `@@ -108,19 +108,39 @@` similarly says **“A search never hides a match”**, although its subsequent explanation acknowledges search-specific collapse.

   **Failure scenario:** Search, collapse a matching section, and leave the query unchanged. Its matches remain hidden by design.

   **Suggested fix:** Describe the actual guarantee: starting or changing a search expands matching sections; readers may collapse them until the query changes.

Other reviewed areas:

- **Collapse state and StrictMode: no findings.** Set initializers and functional updates are pure. Route-driven reopening occurs in an effect, not during render, and does not depend on `collapsed`, so it does not continually fight manual collapse.
- **Indication deep links: no findings in the shown flow.** After successful focus, `focusedOnce` prevents subsequent section toggles from yanking the page back. Hidden destinations retry when `collapsed` changes; search clearing changes results. The focus frame is cancelled on effect cleanup, with completion recorded only when it runs.
- **Search restoration: no additional findings.** Clearing search returns to the separate user collapse set. Resetting depends on the raw `query` string: every changed keystroke, including whitespace or case changes, resets search collapse.
- **Stuck-head scrolling: no demonstrated correctness finding.** Only collapsing a displaced head schedules scrolling. The section target uses document scroll padding without adding the rows’ section-head margin. No smooth scrolling is introduced. Last-section alignment can be limited by the document’s maximum scroll position. The collapse frame lacks cancellation, but scrolling a detached section after unmount does not establish a user-visible failure.
- **Accessibility and mobile layout: no findings from static inspection.** The native button supports keyboard activation, has a 44px minimum height and inset focus outline, and references a stable list ID that remains present while hidden. Accessible count text replaces the hidden visual duplicate. No new horizontal overflow is established at 320–414px.
- **Print CSS: no additional findings.** The explicit important display rule restores hidden lists, and section heads become static. The decorative chevron remains printed.
- **Theme, type scale and version: no findings.** New component styling uses tokens and permitted font sizes. All three version entries become `0.7.0`. No test-count changes appear in the supplied documentation hunks.

**Clinical content:** The diff changes or newly restates no drug dose, cutoff, duration, protocol, or clinical claim. The manifest confirms `src/data/pmg.js` is unchanged. The omitted section blurbs in finding 2 warrant human review for any clinical context lost in print; their contents are absent from this packet.

This was a packet-only review; no tools or runtime checks were used.
````

## Dispositions

Applied in the commit after `f139470` (the follow-up to this review). Checked in the dev preview at 375px;
83 tests and the verifier pass; `vite build` succeeds.

1. **Medium, section links vs. search collapse — fixed.** The route-arrival effect in
   `IndicationsView.jsx` now removes the destination section from both `collapsed` and
   `searchCollapsed`, still driven only by `route.section` / `route.focus`, so the reader can
   collapse it again afterwards. Checked: with the query "cefazolin" active, Emergency General
   Surgery collapsed during the search, then `#/s/egs`: the query is kept, the section reopens and
   shows its one match.
2. **Medium, collapsed section's blurb missing from print — fixed.** The blurb is no longer dropped
   from the DOM when the section collapses: `SectionHead` renders it with `hidden={!open}` and the
   class `section-blurb`, and the print block now restores `.section-blurb[hidden]` along with
   `.section-list[hidden]`. The head's bottom margin follows the visible blurb (8px collapsed, 0
   open), so the on-screen spacing is unchanged. Checked: collapsed, the blurb is in the DOM, hidden,
   with no client rects; open, it shows. Print itself was not run (the preview pane cannot emulate
   print media); the rule is in the built stylesheet.
   - **Clinical flag, relayed as raised.** Codex asked for human review of what the blurbs carry,
     since the packet did not include them. They are `sections[].blurb` in `src/data/pmg.js`,
     unchanged by this release. Two restate clinical content: Trauma, "Prophylaxis by injury
     pattern, with intra-operative redosing triggers.", and Elective Surgery, "One-time dose;
     vancomycin added if known MRSA colonization." With the fix, a collapsed section prints its
     blurb as an expanded one does, so nothing is lost from print. Whether the blurbs are right is
     a question for the physician verification of the transcription, not this review.
3. **Low, search wording overstated — fixed.** `README.md` now says starting a search reopens every
   section with a match; `CLAUDE.md` describes the guarantee as Codex suggested (starting or
   changing a search opens every matching section; the reader may collapse one until the query
   changes) and records both fixes.

Codex's "no findings" areas were not independently re-verified beyond the browser checks recorded in
`docs/HISTORY.md`. They are not evidence of safety.
