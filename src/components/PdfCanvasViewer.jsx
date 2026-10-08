import { useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
// ?worker lets Vite bundle the pdf.js worker correctly; handing it to pdf.js as
// a worker port is the robust setup. pdf.js v4 renders standard PDFs with just the
// worker (no wasm/cmap assets needed for embedded-font PDFs).
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// Copied from the Pediatric CPG app (src/components/shared/PdfCanvasViewer.jsx),
// restyled to this app's tokens and type scale, with two additions: `page` opens
// the viewer at a given page, and range requests are off (see getDocument below).

// Load pdf.js once, with one PDFWorker for the app's lifetime, passed to every
// getDocument() call. Don't set GlobalWorkerOptions.workerPort instead: pdf.js
// then destroys that shared worker with each document, and the replacement it
// builds restarts its message ids, so a reply still owed to a closed viewer can be
// delivered to the next one. A worker the caller supplies is never destroyed.
let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist")
      .then((pdfjs) => ({ pdfjs, worker: new pdfjs.PDFWorker({ port: new PdfWorker() }) }))
      .catch((err) => {
        // Never cache a failure: one flaky load would otherwise break the viewer
        // until the app is reloaded. The next open tries again.
        pdfjsPromise = null;
        throw err;
      });
  }
  return pdfjsPromise;
}

// Teardowns of recently closed viewers. Each load waits for them first, so the
// worker isn't still releasing one document while it loads the next (on a phone,
// memory is the constraint), but never for more than TEARDOWN_WAIT_MS after any
// close: a teardown that never finishes must cost the next viewer a short wait,
// not its inline view. Never rejects.
const TEARDOWN_WAIT_MS = 3000;
let teardown = Promise.resolve();

// A later page still not drawn after this long gets the prominent way out to the
// full PDF. Drawing carries on, and the page still appears if it gets there.
const PAGE_STALL_MS = 10000;

// Renders a PDF to <canvas> pages. Unlike an <iframe> or a link, this works on
// every platform — including iOS Safari and the installed app, which will not
// render a PDF inside an iframe and, given a link, replace the app with the PDF
// and no way back. If anything goes wrong it offers the PDF directly in a
// browser, and "Try again" in the installed app (`installed`), where a direct
// link would be that trap again (Codex review, 2026-10-08).
export default function PdfCanvasViewer({ href, page = 1, installed = false }) {
  const scrollerRef = useRef(null);
  // Bumped by "Try again", which re-runs the load from the start.
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  // Once the opening page is up: the later page being drawn, and whether it is
  // slow or has failed. Null only when every page is drawn, so a partly drawn PDF
  // never passes for a complete one.
  const [tail, setTail] = useState(null); // { page, total, slow, failed }

  useEffect(() => {
    let cancelled = false;
    let rendered = false;
    // The loading task, not the document: destroying the task also stops a
    // document that is still loading, before there is a document to destroy.
    let task = null;
    let pageTimer = null; // PAGE_STALL_MS for the later page being drawn
    let drawing = null; // the canvas of the page being drawn
    const scroller = scrollerRef.current;
    const container = containerRef.current;
    // Never show an earlier document's pages under this one's spinner.
    container?.replaceChildren();
    if (container) container.style.minHeight = "";
    if (scroller) scroller.scrollTop = 0;

    // Never strand the user on a spinner — if rendering hasn't started in time,
    // show the open-directly fallback.
    const timeout = setTimeout(() => {
      if (!cancelled && !rendered) setStatus("error");
    }, 10000);

    (async () => {
      try {
        setStatus("loading");
        setTail(null);
        const { pdfjs, worker } = await loadPdfjs();
        await teardown;
        if (cancelled || !container) return;
        // The whole file in one request. The service worker precaches the PDF
        // and answers every request for it with the whole file, so a range
        // request pdf.js might otherwise send for the cross-reference table at
        // the end would come back as all of it, which pdf.js cannot use.
        task = pdfjs.getDocument({ url: href, worker, disableRange: true });
        const pdfDoc = await task.promise;
        if (cancelled) return;
        container.replaceChildren();

        // The page the viewer opens at. Pages before it draw first, under the
        // loading cover, so it lands where it will stay.
        const first = Math.min(Math.max(1, Math.trunc(Number(page)) || 1), pdfDoc.numPages);
        const cw = Math.max(container.clientWidth, 240);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= pdfDoc.numPages; n++) {
          if (cancelled) return;
          if (n > first) {
            setTail({ page: n, total: pdfDoc.numPages, slow: false, failed: false });
            clearTimeout(pageTimer);
            pageTimer = setTimeout(() => {
              if (!cancelled) setTail((t) => (t?.page === n && !t.failed ? { ...t, slow: true } : t));
            }, PAGE_STALL_MS);
          }
          const pdfPage = await pdfDoc.getPage(n);
          if (cancelled) return;
          const scale = cw / pdfPage.getViewport({ scale: 1 }).width;
          const viewport = pdfPage.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.className = "mb-2 block w-full rounded-sm bg-card shadow-sm ring-1 ring-rule";
          canvas.setAttribute("aria-label", `Page ${n} of ${pdfDoc.numPages}`);
          canvas.setAttribute("role", "img");
          container.appendChild(canvas);
          drawing = canvas;
          // iOS Safari gives no context once its canvas memory runs out. Handed a
          // null context, pdf.js throws part way into render() and leaves the page
          // half set up, so that destroying the document later throws too. Fail
          // the page here instead.
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No 2d context for this page's canvas");

          // A resolved render means pdf.js finished, not that the page is whole:
          // pdf.js skips content it can't parse, and an operator-list error after
          // drawing has started still resolves this promise (pdf.js 4.10 marks the
          // list complete, and the rejection it then sends can no longer land).
          await pdfPage.render({
            canvasContext: ctx,
            viewport,
            transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
          }).promise;
          drawing = null;

          if (n === first && !cancelled) {
            if (n > 1 && scroller) {
              // This page is still the last one drawn, so the pages below it are
              // not there to scroll into: hold a viewport's height open under it
              // until they are (released after the last page).
              const top = canvas.getBoundingClientRect().top - container.getBoundingClientRect().top;
              container.style.minHeight = `${top + scroller.clientHeight}px`;
              scroller.scrollTop += canvas.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
            }
            rendered = true;
            setStatus("ready");
          }
        }
        clearTimeout(pageTimer);
        if (!cancelled) {
          container.style.minHeight = "";
          rendered = true;
          setStatus("ready");
          setTail(null);
        }
      } catch (e) {
        clearTimeout(pageTimer);
        // A closed viewer's own teardown cancels its render: expected, and not a
        // failure worth reporting.
        if (cancelled) return;
        console.error("PDF render failed", e);
        // With the opening page up, keep the pages that drew, drop the one that
        // failed part way, and flag the rest below them; before that, fall back
        // to opening the PDF directly.
        if (rendered) {
          drawing?.remove();
          container.style.minHeight = "";
          setTail((t) => t && { ...t, failed: true });
        } else setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(pageTimer);
      // The load above creates no task once cancelled is set, so `task` is final.
      if (!task) return;
      // Start the teardown now and add it to what later loads wait for, capped at
      // TEARDOWN_WAIT_MS and never replacing a teardown still in flight. The barrier
      // keeps no result of its own; the cap bounds the wait, not pdf.js's cleanup (a
      // destroy that never settles keeps its document's resources).
      const cap = new Promise((resolve) => setTimeout(resolve, TEARDOWN_WAIT_MS));
      const done = task.destroy().catch(() => {});
      teardown = Promise.all([teardown, Promise.race([done, cap])]).then(() => {});
    };
  }, [href, page, attempt]);

  // The way out when the PDF is incomplete: the direct link, at the page the
  // viewer was opened for, in a new tab in a browser; "Try again" in the
  // installed app. `prominent` once a page is slow or has failed; before that,
  // a browser gets a quiet link and the installed app nothing.
  const direct = page > 1 ? `${href}#page=${page}` : href;
  const solid =
    "inline-flex items-center rounded-lg bg-accent-fill hover:bg-accent-fill-hi text-on-accent px-4 py-2.5 text-[14px] font-semibold transition-colors";
  const wayOut = (prominent) =>
    installed ? (
      prominent && (
        <button type="button" onClick={() => setAttempt((a) => a + 1)} className={solid}>
          Try again
        </button>
      )
    ) : (
      <a
        href={direct}
        target="_blank"
        rel="noopener"
        className={
          prominent
            ? solid
            : "inline-flex items-center py-2 px-2 text-[14px] font-semibold text-accent hover:text-accent-hi underline underline-offset-2"
        }
      >
        Open the PDF
      </a>
    );

  // The overlays sit outside the scrolling pages, so the fallback covers the whole
  // viewer: a partly drawn page can't be scrolled into view beneath it.
  return (
    <div className="relative h-full w-full">
      {/* Focusable, so a keyboard can scroll the pages where the browser does
          not focus scrollers itself; the side insets keep pages clear of a notch. */}
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label="PDF pages"
        className="h-full w-full overflow-y-auto overscroll-contain bg-paper pad-safe-b pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] focus-visible:outline-offset-[-2px]"
      >
        <div ref={containerRef} className="mx-auto max-w-3xl px-2 py-3" />
        {/* Always mounted, so screen readers announce each change to it. */}
        <div role="status" className="mx-auto max-w-3xl px-4 text-center text-[14px]">
          {tail &&
            (tail.failed || tail.slow ? (
              <p className="flex items-center justify-center gap-2 text-soft">
                <TriangleAlert className="size-[18px] shrink-0 text-warn-mark" aria-hidden="true" />
                {tail.slow && !tail.failed
                  ? `Page ${tail.page} of ${tail.total} is taking a while to show here.`
                  : tail.page === tail.total
                    ? `Couldn’t show page ${tail.page} of ${tail.total} here.`
                    : `Couldn’t show pages ${tail.page}–${tail.total} of ${tail.total} here.`}
              </p>
            ) : (
              <p className="text-muted">
                Loading page {tail.page} of {tail.total}…
              </p>
            ))}
        </div>
        {/* Whenever the PDF is incomplete there is a way to the whole document right
            here: quiet while a page is drawing, prominent once it is slow or failed. */}
        {tail && (installed ? tail.failed || tail.slow : true) && (
          <div className="flex justify-center px-4 pb-6 pt-3">{wayOut(tail.failed || tail.slow)}</div>
        )}
      </div>
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper text-[14px] text-muted">
          {page > 1 ? `Loading page ${page}…` : "Loading PDF…"}
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper p-6 text-center"
        >
          <TriangleAlert className="size-7 text-warn-mark" aria-hidden="true" />
          <p className="text-[14px] text-soft">Couldn’t show the PDF here.</p>
          {wayOut(true)}
        </div>
      )}
    </div>
  );
}
