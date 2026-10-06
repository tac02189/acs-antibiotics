import { FileText, TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";
import { pdfHref } from "./shared.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { isIOSStandalone } from "../lib/theme.js";

// Thiago's icon artwork (assets/icon-source.png → public/*.png via scripts/gen-icons.mjs).
function Mark({ className = "" }) {
  return (
    <img src="/pwa-192.png" width="40" height="40" alt="" aria-hidden="true" decoding="async" className={className} />
  );
}

export default function BrandBar() {
  return (
    <header className="no-print">
      {/* Behind the system status bar wherever the browser reports a top inset
          (zero height in an ordinary tab). In the installed iPhone app the clock
          is white and cannot change at runtime, so there the strip stays dark in
          both themes (data-theme="dark" scopes the dark tokens to it) and keeps
          the clock legible over the light bar and, after scrolling, the light
          toolbar. Elsewhere, e.g. an edge-to-edge Android app whose icons are
          coloured from theme-color, it follows the theme like the bar. */}
      <div
        data-theme={isIOSStandalone() ? "dark" : undefined}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] bg-bar pointer-events-none"
      />

      {/* Brand bar — the console top. Follows the theme: near-black in dark,
          white in light. */}
      <div className="bg-bar text-ink border-b border-rule pt-[env(safe-area-inset-top)]">
        {/* flex-wrap: below ~355px (a 320px phone, or page zoom) the buttons drop to a
            second row instead of sliding under the no-wrap subtitle. */}
        <div className="max-w-3xl mx-auto pad-safe-x py-2.5 flex flex-wrap items-center justify-between gap-3">
          <a href="#/" className="flex items-center gap-3 min-w-0 group" aria-label="ACS Antibiotic Guide home">
            <Mark className="size-10 shrink-0 rounded-lg border border-rule shadow-md" />
            <span className="min-w-0">
              {/* 16px below 400px wide, so the theme switch fits beside the
                  PDF button on a 360px phone without wrapping the title. */}
              <span className="block font-display font-bold text-[16px] min-[400px]:text-[18px] sm:text-[20px] leading-tight tracking-tight text-ink uppercase">
                ACS Antibiotic Guide
              </span>
              <span className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono uppercase tracking-[0.1em] text-accent whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-dose shrink-0" aria-hidden="true" />
                Acute Care Surgery<span className="hidden min-[480px]:inline"> · MU Health</span>
              </span>
            </span>
          </a>

          <div className="ml-auto flex items-center gap-1.5 min-[420px]:gap-2 shrink-0">
            <ThemeToggle />
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 h-11 rounded border border-rulestrong bg-card/80 hover:bg-rule/60 hover:border-accent px-2.5 min-[420px]:px-3.5 text-[12px] font-mono font-bold tracking-wider text-prose uppercase transition-all shadow-sm active:scale-95 shrink-0"
            >
              <FileText className="hidden min-[420px]:block size-4 text-accent" aria-hidden="true" />
              <span>PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Verification notice — hazard amber, stays until a physician signs the transcription off.
          The same amber in both themes. Its focus ring is inset in the notice's own dark ink:
          the global ring would sit partly on the amber, where the light theme's deep gold
          reads 2.1:1. Set in the sans face, which keeps it to two lines on a 360px phone
          (the bold monospace it had took three). */}
      <div className="bg-amber-bg text-amber-ink border-b border-amber-line">
        <a
          href="#/source"
          className="max-w-3xl mx-auto pad-safe-x py-1.5 text-[13px] leading-snug font-semibold hover:underline flex items-center gap-2 focus-visible:outline-amber-ink focus-visible:outline-offset-[-3px]"
        >
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            PMG {source.publicationDate} · transcription pending physician verification · confirm against the PDF →
          </span>
        </a>
      </div>
    </header>
  );
}
