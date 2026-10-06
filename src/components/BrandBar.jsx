import { FileText, TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";
import { pdfHref } from "./shared.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

// Thiago's icon artwork (assets/icon-source.png → public/*.png via scripts/gen-icons.mjs).
function Mark({ className = "" }) {
  return (
    <img src="/pwa-192.png" width="40" height="40" alt="" aria-hidden="true" decoding="async" className={className} />
  );
}

export default function BrandBar() {
  return (
    <header className="no-print">
      {/* Behind the status bar of the installed iPhone app (zero height
          everywhere else). That status bar is translucent with white text, so
          this strip keeps it dark and legible in both themes, including after
          the brand bar has scrolled away and the light toolbar sits below it. */}
      <div
        data-theme="dark"
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] bg-bar pointer-events-none"
      />

      {/* Brand bar — the console top. Dark in both themes (data-theme="dark"
          scopes the dark tokens to it): it carries the black-and-gold mark and
          sits under the iPhone status bar. */}
      <div data-theme="dark" className="bg-bar text-ink border-b border-rule pt-[env(safe-area-inset-top)]">
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
              className="inline-flex items-center gap-2 h-11 rounded border border-rulestrong bg-card/80 hover:bg-rule/60 hover:border-accent px-2.5 min-[420px]:px-3.5 text-xs font-mono font-bold tracking-wider text-prose uppercase transition-all shadow-sm active:scale-95 shrink-0"
            >
              <FileText className="hidden min-[420px]:block size-4 text-accent" aria-hidden="true" />
              <span>PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Verification notice — hazard amber, stays until a physician signs the transcription off.
          The same amber in both themes. Its focus ring is inset in the notice's own dark ink:
          the global ring would sit on the amber and the dark bar, where it reads under 3:1. */}
      <div className="bg-amber-bg text-amber-ink border-b border-amber-line">
        <a
          href="#/source"
          className="max-w-3xl mx-auto pad-safe-x py-1.5 text-[12px] sm:text-[13px] leading-snug font-mono font-bold tracking-tight hover:underline flex items-center gap-2 focus-visible:outline-amber-ink focus-visible:outline-offset-[-3px]"
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
