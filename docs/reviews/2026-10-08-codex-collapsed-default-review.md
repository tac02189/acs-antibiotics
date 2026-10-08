# Codex peer review — sections collapsed by default (v0.7.1), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **Scope:** the uncommitted diff against `e7dee77` (six files: `src/App.jsx`,
  `src/components/IndicationsView.jsx`, `CLAUDE.md`, `README.md`, `package.json`,
  `package-lock.json`), embedded on stdin with `App.jsx` and `IndicationsView.jsx` whole and
  excerpts of `shared.jsx` (`SectionHead`), `route.js`, the `sections` data, `main.jsx` and
  `index.css`. `Header.jsx` was not in the packet.
- **Packet-only run:** Codex was told not to use tools and its log shows none. Its packet line
  (diff 116 lines, `App.jsx` 117, `IndicationsView.jsx` 477) matched the packet, which the bridge
  agent checked byte for byte against the working tree.
- **Read-only:** HEAD and `git status` were unchanged afterwards.
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; the disposition is
  at the end.

---

````text
PACKET RECEIVED: diff 116 lines, App.jsx 117 lines, IndicationsView.jsx 477 lines

## Findings

**Low — src/components/shared.jsx:80; src/components/IndicationsView.jsx:130 — A cold deep link can scroll using a stale section-head height.**

The initial height is published synchronously at shared.jsx:85, so waiting for the first ResizeObserver notification is **not** required. However, that measurement initially describes the collapsed page.

A concrete triggering sequence is:

1. The collapsed page fits without a vertical scrollbar.
2. The mount effects measure its section heads and queue opening the destination section.
3. Opening that section introduces a classic, non-overlay scrollbar. At a title-wrapping threshold, the reduced available width makes its head taller.
4. The deep-link effect runs before the next rendering opportunity. `getClientRects()` establishes that the row is visible, but does not update `--section-head-h`.
5. The scheduled animation-frame callback scrolls before that rendering opportunity’s ResizeObserver delivery. It uses the earlier, smaller height.
6. ResizeObserver subsequently corrects the property, but `focusedOnce` has already recorded completion; nothing corrects the scroll.

At sufficiently enlarged text, the height difference can exceed the extra spacing and leave the row’s top behind the sticky head. This is an existing measurement race that collapsed-by-default can expose during an ordinary cold arrival; it is conditional on viewport, scrollbar and text sizing.

**Suggested fix:** synchronously measure and publish the destination section head’s current height immediately before `scrollIntoView`, preferably through a shared measurement helper. Keep ResizeObserver for subsequent size changes.

The packet does not establish that this happens at normal text size on a particular device, and it does not provide Header.jsx to verify the independent `--app-header-h` measurement.

## Checked and fine

**1. Cold-start `#/i/<id>` — Section opening and focus retry work; scroll positioning has the conditional finding above.** For a valid indication, the supplied code establishes this sequence:

- In development StrictMode, the state initializers run twice. Both App initializations independently produce all four collapsed IDs; neither mutates shared data. IndicationsView’s Set initializers are likewise safe.
- The initial committed DOM contains the target article inside a hidden list. The article exists, but has no client rects.
- Descendant SectionHead effects synchronously publish their heights and register observers. Within IndicationsView, the query-reset effect queues fresh search sets, the arrival effect queues removal of the destination section from both collapse sets, and the deep-link effect returns at line 128. Queued state changes have not yet made this committed list visible.
- App’s focus effect requests an already-empty query. Its top-scroll effect does nothing because `route.focus` is present.
- StrictMode performs mount-effect cleanup and setup again. The observers disconnect and reconnect, with another synchronous measurement. The collapse removals are idempotent. On this initially hidden commit, the deep-link effect again returns without scheduling a frame.
- The queued state changes commit an open destination section. The changed App `collapsed` reference reruns the deep-link effect; the article now has rects. It queues opening the row and schedules a frame.
- The row-opening render does not itself change the deep-link effect’s dependencies. The frame calls `scrollIntoView`, focuses the article with `preventScroll`, and only then records `focusedOnce`.
- If a dependency change cancels a scheduled frame, completion remains unrecorded, so the next eligible effect setup retries. Likewise, when a target is already visible during a StrictMode mount, cleanup cancels the first frame and replay schedules its replacement.

There is no single guaranteed ordering of browser ResizeObserver deliveries relative to all these React commits. Synchronous initial measurement is guaranteed by the shown effect; measurement of subsequent size changes before the scrolling frame is not.

**2. Cold-start `#/s/<id>` — Fine.** The route filters to the destination section, the arrival effect opens it, and App scrolls to the page top; this route intentionally does not focus an individual row.

**3. Search — Fine for the supplied flows.** Starting a meaningful query selects the initially empty `searchCollapsed` set; every query change clears that set and `closed`, while clearing search returns to App’s retained collapse choices. These resets occur in effects, so they are not synchronous with the first query render.

A search already present when arriving at `#/i/<id>` is cleared by App, and the destination section is removed from both sets; an absent target waits for the results update before scrolling. Arrival at `#/s/<id>` retains the query but reopens that section in both sets. Typing a nonempty query after either arrival invokes `onQuery`, navigates to `/`, and searches globally; App’s clearing effect depends on a change to `route.focus`, so it does not continually erase typing. Search clearing does not undo the destination section’s removal from App’s collapsed set.

**4. “All sections” — Fine.** Returning from a cold section link leaves its destination open and the other three sections collapsed; `navigate("/")` does not reset App state, and the arrival effect has no destination to modify. With an active search, the search collapse set continues to govern instead.

**5. Counts, empty states and cross-links — Fine.** They derive from matched data and the section route filter, not client rects or expansion state, so four collapsed sections do not produce a false empty state. The line 105 comment’s “on screen” means the route-filtered result set, not literally exposed rows. Cross-links remain independent of section expansion.

**6. Layout-dependent behavior — Fine apart from the height race reported above.** Finding an article by ID alone is insufficient, and the rect check correctly waits for its hidden ancestor to open. Section heads remain mounted and measurable while collapsed; their direct-parent structure preserves sticky containment. The “stuck head” toggle measures before collapsing and schedules scrolling afterward; a shorter document can limit top alignment, but that alone is not a failure to reveal the section.

**7. Print — Fine.** The explicit print rules override `hidden` on both lists and retained blurbs, expand row panels, and disable sticky heads. Printing still covers the currently rendered route/search results; blurbs omitted during search are not restored by CSS, which is unchanged behavior.

**8. Accessibility — Fine for the default and arrival flows.** Section buttons expose matching `aria-expanded` and `aria-controls`, hidden lists remove their descendants from normal navigation, and the deep-link rect guard defers programmatic focus until the destination is shown. The article’s `tabIndex={-1}` permits that focus.

**9. Documentation and versions — Fine.** The supplied current documentation and App comments describe collapsed startup, retained in-session choices and deep-link opening consistently; package.json and both package-lock.json version fields are `0.7.1`. The old “fresh launch shows every section” wording appears only in deleted diff lines. Full README.md and CLAUDE.md contents were not supplied, so statements elsewhere in those files cannot be checked.

**10. Other changes — No additional finding.** No added or removed hunk changes a drug, dose, frequency, duration or other clinical value. The new data import reads section IDs only, and the intro edit changes interaction instructions.
````

## Disposition

**Low, cold deep link scrolls with a stale section-head height — fixed** in the same commit. The
head's measurement moved into one helper, `publishHeadHeight` in `shared.jsx`. `SectionHead`'s
`ResizeObserver` still calls it for later size changes, and the deep-link frame in
`IndicationsView.jsx` now calls it for the destination section just before `scrollIntoView`, as
Codex suggested. Checked in headless Chrome (DevTools protocol, 375 and 320px, mobile emulation)
by loading `#/i/<id>` cold for the last row of each section. In every case only the destination
section opened and the row took focus. Each row landed below the stuck head, and the published
`--section-head-h` equalled the head's rendered height: 44px at 375px, and 57px at 320px, where
"Emergency General Surgery" wraps. Not reproduced: the classic-scrollbar trigger Codex describes,
which needs a desktop browser with non-overlay scrollbars. Not checked: enlarged text.

The bridge agent also noted that `docs/HISTORY.md`'s v0.7.0 entry says a fresh launch shows every
section. That is true of v0.7.0 and is left as history. The v0.7.1 entry records the change.
