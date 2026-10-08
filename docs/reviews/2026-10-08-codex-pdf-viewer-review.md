# Codex peer review — in-app PDF viewer (v0.7.3), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **The change:** Thiago, 2026-10-08: "There's no way to close the pdf after you open it." The PDF
  was opened by `<a target="_blank">` from the header, the Source page and Fever workup; in the
  installed app the PDF replaced the app with no Back. It now opens in a full-screen in-app viewer
  copied from the Pediatric CPG app (`PdfButton.jsx`, `PdfCanvasViewer.jsx`).
- **Scope:** the uncommitted tree over `1cbffe7` — the full diff, the full text of the three new
  files (`PdfButton.jsx` 245 lines, `PdfCanvasViewer.jsx` 263, `tests/pdf-link.test.js` 59) and ten
  context files, embedded on stdin. Line numbers below refer to that version, before the fixes.
- **Packet-only run:** Codex ran no tool calls. The bridge agent checked 21 of its `file:line`
  citations against the code.
- **Read-only:** `git status` was identical before and after; `src/data/pmg.js` has no diff.
- **Nothing below was dismissed or softened.** Codex's findings follow verbatim; the dispositions
  are at the end.

---

````text
Static review only; no tools used or author verification claims assumed.

1. **High — The original standalone PDF trap remains reachable.**  
   `src/components/PdfCanvasViewer.jsx:225`, `src/components/PdfCanvasViewer.jsx:252`

   Both fallback links navigate directly to the same PDF with `target="_blank"`, reproducing the reported failure in the installed app. The first link appears during **ordinary rendering of subsequent pages**, not just after an error (`:222`). Hiding the toolbar links does not close this path.

   **Fix:** Pass standalone status into this component and suppress both direct links there. Offer an in-app retry and retain Back. A slow render must not offer navigation known to strand the user.

2. **Medium — Local dialog state and history state diverge, leaving dead Back entries.**  
   `src/components/PdfButton.jsx:104`, `src/components/PdfButton.jsx:154`, `src/components/PdfButton.jsx:15`

   A deterministic sequence is:

   - Open and close the viewer normally.
   - Reopen and close within the first close’s 1,500 ms window.
   - `pending` still exists even though its popstate arrived, so the second close runs locally.
   - The second viewer entry remains current. The next Back consumes an invisible, same-URL entry.

   Reloading while open also preserves `history.state.pdfViewer` while React initializes `open` to false. The service-worker reload at `src/main.jsx:49` makes this relevant to background/resume updates. Forward can likewise revisit a viewer entry without reopening its dialog. Navigating to a new hash from an open viewer can leave the old viewer entry behind the new route.

   **Fix:** Coordinate dialog visibility with history centrally, including restoration on reload/Forward; store the opening page alongside the marker. During the settling window, avoid pushing an entry that policy will refuse to consume. App-controlled route changes should replace an active modal entry rather than leave it behind. Merely deleting its state marker does not remove the duplicate history slot.

3. **Medium — The rendered document has no accessible text.**  
   `src/components/PdfCanvasViewer.jsx:113`, `src/components/PdfCanvasViewer.jsx:117`

   Every page becomes an image named only “Page N of M.” Screen readers cannot read its contents. Once rendering completes, the standalone viewer offers neither document text nor an accessible document alternative. A page-number label does not describe a clinical reference page.

   **Fix:** Render a text/accessibility layer with appropriate reading order for text-bearing pages, and provide accessible equivalents for image-only material. The PDF’s existing image-only page is a separate source limitation.

4. **Medium — Keyboard interaction is incomplete: no focus wrapping and no explicit way to focus the document scroller.**  
   `src/components/PdfButton.jsx:191`, `src/components/PdfCanvasViewer.jsx:200`

   The key handler handles only Escape. Making `#root` inert excludes the background app, but does not implement first/last Tab wrapping inside this custom dialog. The scrolling document region also lacks `tabIndex`; on browsers that do not automatically focus scroll containers, keyboard users cannot reliably focus it to scroll the PDF. The canvases themselves provide no focus target.

   **Fix:** Implement modal focus containment or use an appropriately managed native modal dialog. Give the scrolling region a keyboard focus target and accessible name, and verify arrow/Page Up/Page Down scrolling.

5. **Low — Standalone detection becomes stale while the viewer stays mounted.**  
   `src/components/PdfButton.jsx:141`

   The detection expression is appropriate for the stated display mode, but `useState(isInstalledApp)` samples it only on mount. A browser-to-installed-window transition that preserves the document can leave the direct toolbar links visible after the display mode changes.

   **Fix:** Subscribe to the media query’s `change` event, with cleanup, and reevaluate the iOS standalone flag when refreshing that state. Use the same reactive status for the fallback links.

6. **Low — The guard misses straightforward direct links and inconsistently flags external PDFs.**  
   `tests/pdf-link.test.js:20`, `tests/pdf-link.test.js:23`

   These prohibited links evade the guard:

   ```jsx
   <a href={"/guide.pdf"} />
   <a href={
     pdfHref
   } />
   const direct = "/" + source.file;
   <a href={direct} />
   ```

   Splitting into lines prevents multiline matching, and identifier matching does not follow aliases. Only immediate component-directory entries and `App.jsx` are inspected (`:12`), so navigation helpers elsewhere are uncovered.

   Conversely, `window.open("https://example.org/reference.pdf")` is flagged even though external PDF anchors are explicitly accepted by the controls.

   **Fix:** Add these regression cases. Use syntax-aware inspection for navigation expressions and local aliases, with an explicit same-origin/source-PDF policy. Supplement it with rendered-link/navigation tests for the actual entry points and standalone fallbacks.

7. **Low — Document pages lack horizontal safe-area protection.**  
   `src/components/PdfCanvasViewer.jsx:200`, `src/components/PdfCanvasViewer.jsx:201`

   The toolbar accommodates horizontal safe areas, but the document uses only bottom safe-area padding and ordinary `px-2`. With `viewport-fit=cover` (`index.html:10`), a viewport with substantial left/right insets can place PDF content beneath a notch or rounded edge.

   **Fix:** Apply left/right safe-area padding to the document scroller, preserving the inner page spacing.

8. **Low — The changed header trigger retains a sub-44px tap target.**  
   `src/components/Header.jsx:78`

   `h-10` remains a 40px target. This is inherited sizing, rather than a newly introduced regression, but it remains below the requested 44px review criterion. The inline Fever trigger at `src/components/FeverWorkupView.jsx:95` also has no target enlargement; its inline context should be assessed separately rather than automatically called a conformance failure.

   **Fix:** Make the header trigger at least 44px tall. If 44px is required for the Fever action too, present it as a separate adequately sized control.

### Checked and found sound

- **Ordinary same-hash opening/closing — no findings.** `pushState`/`replaceState` do not fire `hashchange`; traversing these same-URL entries does not change the hash either (`src/components/PdfButton.jsx:115`, `src/lib/route.js:47`). Normal viewer use therefore does not retrigger the route-dependent scrolling effects in `src/App.jsx:57` or `src/components/IndicationsView.jsx:129`. The orphan-entry cases above are separate.
- **Ordinary double-click close protection — no findings.** `closingRef` prevents repeated close requests from the same overlay (`src/components/PdfButton.jsx:151`). Ownership is checked before requesting Back.
- **Page positioning and temporary height — no findings in the supplied opening flows.** Earlier pages finish before the target jump; temporary height permits that jump; completion and later-page failure clear it (`src/components/PdfCanvasViewer.jsx:139`, `:154`, `:170`). A fresh effect resets it, and unmount removes its container. No additional demonstrated race.
- **Lifecycle — no additional findings.** Cancellation checks surround asynchronous loading; cleanup destroys the loading task and clears timers (`src/components/PdfCanvasViewer.jsx:176`). Destroying the document task handles its rendering resources; a separate per-page destroy is not inherently required. StrictMode’s first cancelled effect cannot subsequently create a document. The shared worker and single global popstate listener are intentional lifetime resources.
- **Canvas limits — no demonstrated cap violation or repeated-close leak.** DPR is capped at two and layout width is constrained (`src/components/PdfCanvasViewer.jsx:97`, `:201`). Retaining all pages increases peak memory, but actual PDF dimensions and Safari behavior are not supplied; a specific memory failure cannot be established from this packet.
- **Modal basics — no additional findings.** Dialog naming, `aria-modal`, initial Back focus, portal placement, inert cleanup, overflow restoration, and normal focus return are present (`src/components/PdfButton.jsx:20`, `:176`, `:197`, `:210`). A button inside the Fever sentence is valid HTML.
- **Service-worker routing — no findings in the configuration shown.** PDF paths are excluded from the shell navigation fallback (`vite.config.js:61`). That correctly serves the document; it does not prevent the direct-link trap.
- **Build, promises, secrets — no additional findings in the supplied code.** Dependency and lockfile changes agree; no evident syntax/import-use defect or exposed secret appears. The omitted test bodies and generated assets prevent certifying the claimed build/test results.
- **Clinical changes — no findings.** The diff introduces no modified drug, dose, frequency, duration, threshold, or protocol wording. Fever’s changed text is a page locator (`src/components/FeverWorkupView.jsx:95`), not clinical guidance. Its data value is not independently verifiable because `pmg.js` is absent.
- **Other navigation paths — not fully verifiable.** Reference destinations are data-driven (`src/components/SourceView.jsx:155`, `src/components/FeverWorkupView.jsx:77`), and their actual URLs are omitted. No additional trapping destination can responsibly be asserted or ruled out.

````

## Dispositions

The fixes were checked by the tests and in headless Chrome (375×812, the production build with its
service worker), not re-reviewed by Codex.

- **High, the trap still reachable through the viewer's fallback link — fixed.** `PdfCanvasViewer`
  takes `installed` from `PdfButton`. In the installed app it renders no link at all: nothing while
  later pages draw, and **Try again** (a re-run of the whole load) when a page is slow or failed and
  on the error screen; Back stays in the toolbar. A browser keeps the "Open the PDF" link, in a new
  tab. Checked with `navigator.standalone` forced true and the PDF blocked (service worker bypassed):
  the error screen showed only Back and Try again, no link; unblocked, Try again drew all 12 pages
  and landed page 5 at 8px under the toolbar. `tests/pdf-link.test.js` now also asserts that every
  direct link in the two viewer files sits in a non-installed branch.
- **Medium, history entry and dialog state can diverge — not changed; the copied policy's accepted
  residual.** Each case Codex lists ends in one dead Back press in a browser (a same-URL entry that
  changes nothing), never in leaving the app or the route. Closing locally when a Back request is
  still settling is the Pediatric CPG policy's deliberate trade: asking again could double-traverse
  and leave the page, which is worse. A reload while the viewer is open (including the service
  worker's update reload) and Forward behave the same way. None of it applies in the installed
  iPhone app, which has no Back or Forward control. Restoring the viewer from history state would
  mean redesigning the policy shared with the Peds app; not done here.
- **Medium, no accessible text — partly addressed.** The dialog now has a description, read by
  screen readers: "The pages are shown as images. The app's tabs carry the guideline's tables and
  rules as text." The scroller is a named region ("PDF pages"). A pdf.js text layer was not added
  (the Peds viewer has none either); the app's own views are the accessible form of the guideline,
  and a browser keeps "Open in a new tab" for the native viewer.
- **Medium, keyboard — scroller fixed; focus wrapping not changed.** The page scroller is focusable
  (`tabIndex 0`) with an inset focus ring, so arrows and Page Up/Down scroll it where a browser does
  not focus scrollers itself. Focus is already contained: the dialog is portaled to `<body>` and
  `#root` is inert, so nothing outside the dialog can take focus; Tab past the last control leaves
  for the browser's own UI, as with a native modal `<dialog>`.
- **Low, installed-app detection sampled once — fixed.** `useInstalledApp` re-reads it on the
  `display-mode: standalone` media query's `change` event, and the same value drives the fallback.
- **Low, the guard test evadable — fixed.** It is now reference-based: outside the viewer's two files
  (and `pdfHref`'s one-line definition in `shared.jsx`, and the filename in `src/data/pmg.js`), no
  file anywhere in `src/` may name `pdfHref` or `source.file` (or `source["file"]`), or hold a
  quoted same-origin `.pdf` path; comments are stripped first. Every evasion Codex lists is a
  control that must be caught, and an external `window.open("https://…pdf")` one that must not.
- **Low, horizontal safe area — fixed.** The scroller pads by `env(safe-area-inset-left/right)`.
- **Low, header PDF button 40px — not changed.** Inherited, unchanged by this fix, and the same
  height as the theme toggle beside it; making the brand row's controls 44px changes the measured
  header height that `CLAUDE.md` records. Worth doing as its own change. The Fever workup trigger
  is an inline link in a sentence, as it was before.
- **Clinical content — no finding.** No drug, dose or threshold changed; `src/data/pmg.js` has no
  diff. Fever workup's link text now takes its page number from `feverWorkup.page` (5).
