# Codex peer review — 36px search row (v0.7.4), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **Scope:** the uncommitted diff against `01226f4` (159 lines: `Header.jsx`, `CLAUDE.md`,
  `package.json`, `package-lock.json`), embedded on stdin with eleven files whole (`Header.jsx`,
  `index.css`, `shared.jsx`, `tailwind.config.js`, `App.jsx`, `PdfButton.jsx`, `ThemeToggle.jsx`,
  `index.html`, `package.json`, `tests/theme.test.js`, `tests/type.test.js`) and excerpts of
  `HISTORY.md`, `README.md` and `CLAUDE.md`. The bridge agent checked each file's line count
  against its source and that each ended on its real last line.
- **Packet-only run:** Codex was told not to use tools and its transcript shows none. Its cited
  lines (`index.css:168`, `Header.jsx:36–39`, `index.css:197–200`, `shared.jsx:113`,
  `CLAUDE.md:222`) match the working tree.
- **Read-only:** `.git/index` and `git status` were unchanged afterwards; `src/data/pmg.js` has no
  diff.
- **Nothing below was dismissed or softened.** Codex's output follows verbatim; the dispositions
  are at the end.

---

No High, Medium, or Low findings established from the packet. One documentation nit.

### Findings

- **Nit — `src/index.css:168` — The fallback’s description is inaccurate.** The comment calls `7.25rem` the normal phone header height. At a 16px root size that is 116px, whereas the updated documentation gives 106px (`CLAUDE.md:222`). Before measurement, this places sticky section heads 10px too low and adds 10px of excess scroll clearance on a normal phone. This is an unchanged approximation, not an established functional regression: `Header.jsx:36–39` publishes the actual height immediately when its effect runs, before waiting for any ResizeObserver notification. The matching fallback in `shared.jsx:113` remains consistent.

### Checked and found fine

- **44px button targets and Tailwind syntax — `Header.jsx:118,134`.** With the default 16px root size, `size-9`/`h-9` gives 36px and the negative insets add 4px per relevant side. These are valid Tailwind 3.4 classes, present as complete literals within the configured content paths. `before:content-['']` creates an empty, hit-testable box.

- **Positioning and flex layout.** The clear button’s existing `absolute` positioning establishes the containing block for its absolutely positioned pseudo-element; adding `relative` is unnecessary. Its translation moves the button and pseudo-element together. The pill supplies `relative` itself. Both pseudo-elements are out of flow, so neither consumes flex space nor introduces another flex gap.

- **Clipping and pointer events.** No supplied ancestor of these buttons clips their overflow. The tab row’s `overflow-x-auto` applies to that sibling’s contents, not the search row. `pointer-events-none` belongs only to the search icon. The header’s `z-40` does not truncate its descendants.

- **Horizontal overlap and paint order.** Let the field’s right edge be `R`. The clear button ends at `R − 2px`; its extension ends at **`R + 2px`, not `R + 4px`**. The pill starts at `R + 8px`, leaving 6px between targets. The clear target begins at `R − 42px`, within the space reserved by `pr-11`. It intentionally wins hit testing over the input in that reserved region. The later, positioned pill would paint above an overlapping earlier target, but these dimensions do not produce that overlap.

- **Adjacent rows.** The brand row’s 8px bottom padding leaves 4px after the upward target extension. The search row’s 10px bottom padding leaves 6px before the tab border, or 7px before tab content. This supports the reported separation from the PDF/theme controls and tabs; it does not independently verify the reported coordinates.

- **Label activation.** Hits on the button’s pseudo-element belong to the button. Interactive descendants of a label do not ordinarily trigger the label’s forwarding activation, so the extension does not inherently turn a clear action into an input click. The existing label already contains both an input and another labelable control, which is nonconforming HTML; that structure predates this diff. No new activation failure is established here.

- **Focus and accessible names.** The pill’s outline styles remain on the button, without a new clipping ancestor. The transparent pseudo-element introduces no additional focus stop. Clear retains its accessible name; the pill retains its name and `aria-pressed`. Exact outline rendering remains a browser verification item.

- **iOS-related source safeguards.** The input remains `text-[16px]` without a scale transform. Reducing its box height does not itself reduce that font size. Native WebKit search decorations and the cancel button are suppressed in `index.css:197–200`. Transparent tap highlighting changes feedback, not target geometry. `index.html:10` permits zoom up to 5×.

- **Target-size distinction.** The button geometry supports the stated 44px targets. The **search input itself remains 36px tall**: that exceeds WCAG 2.5.8’s 24px minimum, but does not provide a 44px-high target for WCAG 2.5.5’s enhanced size requirement. The packet does not establish an exception or whole-app compliance with either the enhanced requirement or Apple’s 44pt guidance.

- **Theme/type guards and version changes.** The new classes introduce no fixed colours, forbidden font sizes, or expressions matching the supplied guards. `content-['']` is neither a colour nor a font-size declaration. Package and lockfile versions agree at `0.7.4`; the diff changes no dependencies. The build script still runs tests, verification, then Vite.

- **Supplied documentation.** The changed Header comments and CLAUDE excerpts describe the new geometry consistently. README’s supplied excerpt contains no obsolete dimensions. HISTORY’s 114px/154px and fixed scroll-padding values describe an earlier release, so they are not stale current instructions.

- **Clinical content:** no clinical content touched.
- **Secrets:** none found in the embedded content.

### Not verifiable from this packet

- Actual iOS/Android behavior, installed-PWA taps, computed focus outlines, normal-size input clipping, and 200% text resizing. The fixed heights warrant checking enlarged text, but source alone does not establish clipping or loss of functionality.
- The reported measurements, clicks, lack of horizontal scrolling, console results, and passing 87 tests/build.
- `tests/pdf-link.test.js`, `scripts/verify-pmg.mjs`, remaining tests, generated CSS, and full lockfile contents are absent.
- Documentation outside the supplied excerpts is unavailable, including HISTORY line 366. A repository-wide stale-comment or release-history check therefore cannot be completed.
---

## Dispositions

- **Nit, `src/index.css:168` — fixed.** The pre-measure fallback was `7.25rem` (116px), described
  as the phone header; the header is now 106px. The fallback is `6.625rem` (106px) in
  `src/index.css`, `src/components/shared.jsx` and `CLAUDE.md`, and the comment gives the figure.
  It only applies before `Header.jsx` publishes `--app-header-h`; after a reload at 375px the
  variable read 106px and `scroll-padding-top` 116px.
- **Target size, the search input itself — accepted.** The field is 36px tall, above WCAG 2.5.8's
  24px minimum and below 2.5.5's 44px. Thiago asked for 36px; the field is 165px or more wide at
  every phone width checked, and the two buttons in the row keep 44px tap areas.
- **Enlarged text — checked after the review.** At a 24px root font size ("very large" in desktop
  Chrome) the field and pill grow to 54px and nothing clips; at 9px ("very small") they are 20.25px
  around 16px text, cramped but not overflowing (`scrollHeight` equals `clientHeight`). The app's
  text is set in px, so these settings move the boxes and not the text; phones scale the whole page
  instead. No horizontal scroll at either.
- **The label holding the input and the clear button — not changed.** Codex notes it predates this
  diff and found no activation failure; a real click 3px above the × cleared the query.
- **Not verifiable from the packet** (real iOS and Android, installed app, measurements): the
  preview measurements are in `docs/HISTORY.md`; an installed iPhone was not checked.
