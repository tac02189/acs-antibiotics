import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted fonts (bundled, latin subset only) — no external request, so the
// app's typography works fully offline as a PWA.
import "@fontsource/chakra-petch/latin-500.css";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-700.css";
import App from "./App.jsx";
import "./index.css";

// Keep an installed copy from showing a superseded guideline.
//
// vite-plugin-pwa's generated registerSW.js only calls register(). The service
// worker is built with skipWaiting + clientsClaim, so a new version activates
// and claims this page immediately — but the already-rendered page keeps
// running the JavaScript it loaded. Without the handling below, the first visit
// after a deploy renders the PREVIOUS bundle. This block is carried over from the
// MUHC Antibiogram app, where a peer review found and fixed three defects in its
// first version (a guard that froze on first install, no bounded freshness for
// a resumed page, and a reload that reset the reader's filter). The same shape
// is kept here deliberately.
const VIEW_HANDOFF = "acs-abx:view-across-update";

if ("serviceWorker" in navigator) {
  // `true` once the page has a controller for the first time. Unlike a captured
  // boolean this tracks the transition, so only the initial claim is swallowed.
  let sawInitialClaim = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!sawInitialClaim) {
      // First SW of a brand-new install taking charge. Reloading here would be
      // a pointless extra load on every first visit.
      sawInitialClaim = true;
      return;
    }
    if (reloading) return;
    reloading = true;
    // The current view lives in the URL hash, so it survives a reload on its own.
    // Only the penicillin-allergy toggle needs carrying across.
    try {
      const pcn = window.__acsPcnAllergy;
      if (pcn) sessionStorage.setItem(VIEW_HANDOFF, "pcn");
    } catch {
      // sessionStorage can throw in private modes; losing the toggle is
      // acceptable, failing to apply the update is not.
    }
    window.location.reload();
  });

  // Bound how stale an open or resumed page can get. registration.update() is
  // the portable way to force a check; calling register() again is not.
  const checkForUpdate = () => {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg && reg.update())
      .catch(() => {
        // Offline, or the check failed. The incumbent keeps serving; the next
        // resume or reconnect tries again.
      });
  };
  window.addEventListener("load", checkForUpdate);
  window.addEventListener("online", checkForUpdate);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkForUpdate();
  });
  // A page left open and visible across a deploy fires none of those events,
  // so also check on a modest timer while it is visible and online.
  setInterval(() => {
    if (!document.hidden && navigator.onLine) checkForUpdate();
  }, 60 * 60 * 1000);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
