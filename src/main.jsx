import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted fonts (bundled) — no external request, so the app's typography
// works fully offline as a PWA. Source Sans 3 is the Pediatric CPG app's face;
// JetBrains Mono is the Antibiogram's data face.
import "@fontsource-variable/source-sans-3";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
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

  const reloadIntoUpdate = () => {
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
  };

  // The content-hashed entry bundle a page shell loads.
  const entryOf = (doc) => doc.querySelector('script[type="module"][src*="/assets/"]')?.getAttribute("src") ?? null;

  // Reload if the worker in charge serves a different build from the one this
  // page is running. A first claim is normally by a worker built with this
  // page's bundle, and reloading then would be a pointless extra load on every
  // first visit. But a deploy that lands between this page's load and the
  // worker's install leaves a newer worker over an older page (Codex
  // whole-codebase review, 2026-10-14), and so does a worker that claimed the
  // page before this script ran (Codex v0.7.11 review); no later check corrects
  // either, as the worker is already current. So ask the worker for its page
  // shell and compare entry bundles. At most once a minute, so a shell that
  // somehow never matches cannot loop.
  const SHELL_RELOAD = "acs-abx:shell-reload";
  const compareShell = () => {
    const mine = entryOf(document);
    if (!mine) return;
    fetch("/index.html", { cache: "no-cache" })
      .then((res) => (res.ok ? res.text() : null))
      .then((html) => {
        const theirs = html && entryOf(new DOMParser().parseFromString(html, "text/html"));
        if (!theirs || theirs === mine) return;
        try {
          const last = Number(sessionStorage.getItem(SHELL_RELOAD));
          if (last && Date.now() - last < 60000) return;
          sessionStorage.setItem(SHELL_RELOAD, String(Date.now()));
        } catch {
          return; // without the guard, do not risk a loop
        }
        reloadIntoUpdate();
      })
      .catch(() => {
        // Offline, or the check failed: keep the page; the next launch loads
        // whatever the worker holds.
      });
  };
  if (sawInitialClaim) compareShell();

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!sawInitialClaim) {
      sawInitialClaim = true;
      compareShell();
      return;
    }
    reloadIntoUpdate();
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
