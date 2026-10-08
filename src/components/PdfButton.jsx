import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { source } from "../data/pmg.js";
import { pdfHref } from "./shared.jsx";
import PdfCanvasViewer from "./PdfCanvasViewer.jsx";

// Opens the source PDF in a full-screen in-app viewer with a Back button, after
// the Pediatric CPG app's PdfButton (src/components/shared/PdfButton.jsx; the
// history policy below is its, unchanged). A plain link to the PDF cannot be
// closed in the installed app: there is no browser tab to open into, so the
// PDF replaces the app, with no back button and no way to return but quitting
// it. `page` opens the viewer at that page of the PDF.
export default function PdfButton({ page = 1, className = "", children, ...rest }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const wasOpen = useRef(false);

  // Hand keyboard focus back to the button that opened the viewer once it closes.
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={className}
        {...rest}
      >
        {children}
      </button>
      {open && <PdfOverlay page={page} onClose={() => setOpen(false)} />}
    </>
  );
}

// The installed app (home-screen icon) has no browser chrome, so a link that
// leaves the page cannot be undone there: the viewer offers none. Kept current,
// since a browser can move an open page into an app window (Codex review,
// 2026-10-08).
const STANDALONE = "(display-mode: standalone)";
function isInstalledApp() {
  try {
    return window.matchMedia?.(STANDALONE).matches || window.navigator.standalone === true;
  } catch {
    return false;
  }
}
function useInstalledApp() {
  const [installed, setInstalled] = useState(isInstalledApp);
  useEffect(() => {
    let mq = null;
    try {
      mq = window.matchMedia?.(STANDALONE) ?? null;
    } catch {
      mq = null;
    }
    const onChange = () => setInstalled(isInstalledApp());
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);
  return installed;
}

// The viewer's history entry. Opening the viewer adds one entry so the device
// Back button / swipe-back closes the viewer instead of leaving the guideline,
// and closing it asks the browser to go back over that entry. Each entry carries
// a unique token. The entry keeps the current URL, so the hash router sees no
// hashchange either way.
//
// Policy for asking the browser to go back — conservative, because popstate
// events carry no identity, so a requested traversal can never be matched to
// the one that arrives. The state is module-level because a request outlives the
// viewer that made it: the viewer unmounts on the first popstate, which may be
// the user's own Back rather than the traversal it requested.
//  • Only from an entry this viewer owns (created, or reused, on open).
//  • Not within SETTLE_MS of the previous request, whatever popstates arrive.
//  • Never again this session if no popstate at all arrived within SETTLE_MS of
//    a request. Closes are then local, and the entry left behind is reused by
//    the next open rather than stacked on.
// Residual, accepted: a traversal the browser DELAYS (rather than drops) for
// more than SETTLE_MS, while the user's own Back lands first and a viewer is
// then reopened and closed, could still produce two traversals. Ruling that out
// completely would mean at most one requested Back per session — leaving a dead
// Back press behind every later close.
const SETTLE_MS = 1500;
let backUnreliable = false;
// The outstanding request, until its SETTLE_MS window closes: when it was made
// (performance.now() — monotonic, so clock changes can't stretch or skip the
// window) and whether any popstate has arrived since.
let pending = null;
let watchingPops = false;

// Close the outstanding request's window once it has run out. Evaluated at each
// decision point rather than by a timer, so a busy or throttled main thread
// can't let a request through, or a late popstate count, before it settles.
function settle(now) {
  if (pending && now - pending.at >= SETTLE_MS) {
    if (!pending.arrived) backUnreliable = true;
    pending = null;
  }
}

function watchPops() {
  if (watchingPops) return;
  watchingPops = true;
  window.addEventListener("popstate", () => {
    settle(performance.now()); // one arriving after the window doesn't count
    if (pending) pending.arrived = true;
  });
}

// Ask the browser to go back, if the policy allows. Returns whether it asked.
function requestBack() {
  const now = performance.now();
  settle(now);
  if (backUnreliable || pending) return false;
  try {
    window.history.back();
  } catch {
    backUnreliable = true;
    return false;
  }
  pending = { at: now, arrived: false };
  return true;
}

function enterViewerEntry() {
  watchPops();
  const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const state = window.history.state;
  if (state && state.pdfViewer) {
    // Still on an earlier viewer's entry (its close never completed, or React
    // StrictMode re-ran the effect): reuse it instead of stacking another, so
    // abandoned entries can never pile up.
    window.history.replaceState({ ...state, pdfViewer: token }, "");
  } else {
    // Keep whatever state the entry had; add our token.
    window.history.pushState({ ...(state || {}), pdfViewer: token }, "");
  }
  return token;
}

function PdfOverlay({ page, onClose }) {
  const backRef = useRef(null);
  const closingRef = useRef(false);
  const fallbackTimer = useRef(null);
  // This viewer's history token, or null if no entry could be created.
  const entryRef = useRef(null);
  // Read through a ref so a parent re-render (a new onClose identity) doesn't
  // re-run the effect below and yank focus back to the Back button.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const installed = useInstalledApp();
  // The short title fits a phone toolbar; the dialog's name carries the edition.
  const label = `${source.shortTitle} · ${source.publicationDate}`;
  const direct = page > 1 ? `${pdfHref}#page=${page}` : pdfHref;

  // Close through history so the viewer's entry is consumed (no orphan
  // back-press) — once only: a double-tap would otherwise pop a second entry, the
  // app's own page, and leave the guideline. See the policy above for when the
  // close stays local instead.
  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const ownsEntry = entryRef.current !== null && window.history.state?.pdfViewer === entryRef.current;
    if (!ownsEntry || !requestBack()) {
      onCloseRef.current();
      return;
    }
    // Normally popstate arrives within milliseconds and closes the viewer. If it
    // doesn't, close locally; the policy above decides whether later closes may
    // still ask.
    fallbackTimer.current = setTimeout(() => onCloseRef.current(), SETTLE_MS);
  };

  useEffect(() => {
    // The history entry first, and exception-safe: if the browser refuses
    // pushState/replaceState, the viewer still opens and closes locally, and the
    // cleanup below is always returned (the app is never left inert).
    let token = null;
    try {
      token = enterViewerEntry();
    } catch {
      token = null;
    }
    entryRef.current = token;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Modal for keyboard and screen-reader users too: the viewer is portaled to
    // <body>, outside #root, so making #root inert takes the whole app behind it
    // out of the tab order and the accessibility tree. Focus starts on Back.
    const appRoot = document.getElementById("root");
    appRoot?.setAttribute("inert", "");
    backRef.current?.focus({ preventScroll: true });

    // Close once this viewer's entry is gone — Back, the device back gesture, or
    // close() above. A traversal that lands on this same entry changes nothing.
    const onPop = () => {
      if (token === null || window.history.state?.pdfViewer !== token) onCloseRef.current();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(fallbackTimer.current);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      appRoot?.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const iconLink =
    "inline-flex items-center justify-center size-11 shrink-0 rounded-md text-bar-soft hover:text-bar-text hover:bg-bar-well transition-colors";

  return createPortal(
    <div className="no-print fixed inset-0 z-[60] flex flex-col bg-paper" role="dialog" aria-modal="true" aria-label={label} aria-describedby="pdf-viewer-note">
      {/* The pages are pictures; say where the same text can be read. */}
      <p id="pdf-viewer-note" className="sr-only">
        The pages are shown as images. The app's tabs carry the guideline's tables and rules as text.
      </p>
      <div className="shrink-0 bg-bar text-bar-text shadow-md pt-[env(safe-area-inset-top)] border-b-2 border-gold">
        <div className="pad-safe-x py-1.5 flex items-center gap-1">
          <button
            ref={backRef}
            type="button"
            onClick={close}
            className="-ml-2 inline-flex items-center gap-1.5 h-11 shrink-0 px-2.5 rounded-md text-[14px] font-semibold text-bar-text hover:bg-bar-well transition-colors"
          >
            <ArrowLeft className="size-[18px]" aria-hidden="true" />
            Back
          </button>
          <span className="min-w-0 flex-1 truncate px-1 text-center text-[14px] font-semibold text-bar-text">{source.shortTitle}</span>
          {installed ? (
            // Balances the Back button, so the title stays centred.
            <span className="w-[76px] shrink-0" aria-hidden="true" />
          ) : (
            <>
              <a href={direct} target="_blank" rel="noopener" aria-label="Open in a new tab" title="Open in a new tab" className={iconLink}>
                <ExternalLink className="size-[18px]" aria-hidden="true" />
              </a>
              <a href={pdfHref} download aria-label="Download PDF" title="Download PDF" className={`-mr-2 ${iconLink}`}>
                <Download className="size-[18px]" aria-hidden="true" />
              </a>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <PdfCanvasViewer href={pdfHref} page={page} installed={installed} />
      </div>
    </div>,
    document.body,
  );
}
