# Codex peer review — blurbs when collapsed, "PCN Allergy" pill (v0.7.2), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **Scope:** the uncommitted diff against `5804d67` (219 lines: `Header.jsx`, `IndicationsView.jsx`,
  `OpenFracturesView.jsx`, `shared.jsx`, `index.css`, `CLAUDE.md`, `README.md`, `package.json`,
  `package-lock.json`), embedded on stdin with `Header.jsx` whole (168 lines), `shared.jsx` lines
  58–150, excerpts of `IndicationsView.jsx` and the print block, and a repo grep for leftover
  "Alternatives". `tailwind.config.js` was not yet changed; its comment is the finding below.
- **Packet-only run:** Codex was told not to use tools and its log shows none. It echoed the packet's
  line counts.
- **Read-only:** HEAD and `git status` were unchanged afterwards; `src/data/pmg.js` has no diff.
- **The pill's name is the owner's decision.** Codex was told the 2026-10-06 review's objection
  to "PCN allergy" and asked to check the mitigations rather than relitigate the name.
- **Nothing below was dismissed or softened.** The bridge agent relayed Codex's findings verbatim.
  They follow; the dispositions are at the end.

---

````text
- **Low — `tailwind.config.js:52`: stale current-code comment.** “the switched-on Alternatives” still names the old pill. The corresponding control now reads “PCN Allergy.” This is documentation drift only; it does not affect styling or behavior.

- **Info — `docs/HISTORY.md:273` and `CLAUDE.md` diff, “The blurb shows whether the section is open or collapsed”: documentation coverage.** CLAUDE.md and README.md match the implementation. HISTORY.md has no v0.7.2 entry, so these decisions are absent from the chronological record; the packet supplies no requirement making that omission a release defect. HISTORY.md:244 describes v0.7.0 behavior and is legitimately historical, as are the earlier “Alternatives” mention at line 75 and the dated `docs/design/2026-10-07-*.md` mentions. Those historical descriptions need not be rewritten as current behavior.

- **Info — `CLAUDE.md` diff, “Two of the four blurbs restate clinical content”: clinical statements flagged for human checking.** The changed visibility exposes these existing statements while sections are collapsed:
  - Trauma: “Prophylaxis by injury pattern, with intra-operative redosing triggers.”
  - Elective: “One-time dose; vancomycin added if known MRSA colonization.”

  The CLAUDE.md and README.md edits also restate that the PDF column includes penicillin-allergy regimens, contamination escalation and MRSA add-ons; CLAUDE.md additionally mentions a clindamycin note. The `OpenFracturesView.jsx` comment containing “applies to. Amber only while the PCN Allergy toggle highlights the” retains the description “allergy regimen.” These are **unverifiable against the clinical source from this packet, not suspicious**. The recorded owner approval covers the two blurbs only. No numerical drug dose, cutoff, or specific redosing threshold is changed. The README’s 30-minute timing and ≥15-year boundary are unchanged context.

- **Info — `Header.jsx:130–138`; `IndicationsView.jsx:58, 178, 333, 475`: allergy-label mitigations and accessibility — no finding.** Both row presentations retain `ALT_LABEL = "PNC allergy / alternative"`. The intro still explains contamination escalation and MRSA add-ons, and the pill’s title preserves the same qualification and instruction to read each condition. The intro’s omission during search or a section route is unchanged. The new accessible name is sensible: it includes the visible “PCN Allergy” text and explicitly describes highlighting the PDF column. `aria-pressed` communicates the highlighting state. None of the specified mitigations is weakened.

- **Info — `Header.jsx:92–113, 133–138`: header layout — no demonstrated regression.** The nonwrapping, nonshrinking pill consumes a fixed share of the row, leaving the search field narrower at 320px. That constraint already existed. The search wrapper’s `flex-1 min-w-0` and input’s `w-full` allow it to shrink; the space in “PCN Allergy” cannot introduce wrapping because of `whitespace-nowrap`. The label change only changes its intrinsic text width. Exact fit cannot be established without the `pad-safe-x` definition and rendered font measurements. Increased text size could further squeeze the search field under this existing layout, but the packet does not establish new overflow.

- **Info — `shared.jsx:99–104, 111–147`; `IndicationsView.jsx:260–271`: spacing, sticky behavior and ARIA — no finding.** With a blurb, the paragraph supplies `mt-1 mb-2`; without one, the head supplies `mb-2`. This works for open and collapsed sections, searching (`blurb=null`), and the non-toggle variant. Collapsed sections intentionally become taller. Only the title head sticks, so measuring only its height for `--section-head-h` remains appropriate; the scrolling paragraph adds no sticky obstruction. The collapse handler still detects the stuck position before toggling and schedules section alignment afterward. A paragraph between the heading button and controlled list does not invalidate `aria-controls`, which still targets the list actually being hidden.

- **Info — `shared.jsx:147`; `src/index.css:305–310`: print — no finding.** The paragraph no longer has `hidden`, so it needs no print override. Collapsed lists retain their explicit print override, and heads become static. Search-time omission of blurbs remains unchanged.

- **Info — `src/data/pmg.js` supplied empty diff; package version lines; complete diff: data, versions and secrets — no finding.** Nothing shown changes clinical data; the behavioral change increases visibility of existing blurbs. `package.json` and both version fields in `package-lock.json` consistently change to `0.7.2`. No secrets appear in the diff.

Packet check: saw diff 219 lines, Header.jsx 168 lines, shared.jsx excerpt starting at line 58
````

## Dispositions

- **Low, stale comment in `tailwind.config.js` — fixed.** The comment now names the "PCN Allergy"
  pill.
- **Info, no v0.7.2 `HISTORY.md` entry — added** with this commit. It says the v0.7.0/v0.7.1
  behaviour (a collapsed section's blurb hidden on screen) is superseded. The older entries and the
  dated `docs/design/` notes keep "Alternatives" as written.
- **Info, clinical statements — relayed as raised.** The Trauma and Elective blurbs are unchanged in
  `src/data/pmg.js`, and are now visible while their sections are collapsed. Thiago read both on
  2026-10-08 and asked for them to show when collapsed ("those look good; make those show when
  collapsed too"). That covers those two sentences only, so the pending-verification banner stays.
  The other restatements Codex lists (what the PDF's alternative column holds) are descriptions of
  the column already in the app's intro and the pill's `title`, unchanged here. Their accuracy rests
  on the transcription, not on this review.
- **Info, mitigations for the renamed pill — no finding.** The row label (`ALT_LABEL`, the PDF's
  "PNC allergy / alternative"), the intro and the pill's `title` are intact.
- **Info, header width — measured.** The bridge agent marked this unverified, but it was checked in
  the dev preview before the review. At 320px, with the pill switched on, the pill's right edge is
  at 304px and `scrollWidth` equals the viewport (320), so there is no horizontal scroll. It also
  fits at 375px. Not checked: enlarged text.
- **Info, spacing, print, data and versions — no finding.**
