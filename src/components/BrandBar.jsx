import { FileText, TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";
import { pdfHref } from "./shared.jsx";

// Thiago's icon artwork (assets/icon-source.png → public/*.png via scripts/gen-icons.mjs).
function Mark({ className = "" }) {
  return (
    <img src="/pwa-192.png" width="40" height="40" alt="" aria-hidden="true" decoding="async" className={className} />
  );
}

export default function BrandBar() {
  return (
    <header className="no-print">
      {/* Brand bar — the console top. */}
      <div className="bg-[#0A0E14] text-ink border-b border-rule pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto pad-safe-x py-2.5 flex items-center justify-between gap-3">
          <a href="#/" className="flex items-center gap-3 min-w-0 group" aria-label="ACS Antibiotic Guide home">
            <Mark className="size-10 shrink-0 rounded-lg border border-rule shadow-md" />
            <span className="min-w-0">
              <span className="block font-display font-bold text-[18px] sm:text-[20px] leading-tight tracking-tight text-white uppercase">
                ACS Antibiotic Guide
              </span>
              <span className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono uppercase tracking-[0.1em] text-cyan-400 whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
                Acute Care Surgery<span className="hidden min-[420px]:inline"> · MU Health</span>
              </span>
            </span>
          </a>

          <a
            href={pdfHref}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 h-11 rounded border border-rulestrong bg-card/80 hover:bg-rule/60 hover:border-cyan-400 px-3.5 text-xs font-mono font-bold tracking-wider text-slate-200 uppercase transition-all shadow-sm active:scale-95 shrink-0"
          >
            <FileText className="size-4 text-cyan-400" aria-hidden="true" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Verification notice — hazard amber, stays until a physician signs the transcription off. */}
      <div className="bg-[rgb(var(--amber-bg))] text-[rgb(var(--amber-ink))] border-b border-[#92400E]">
        <a
          href="#/source"
          className="max-w-3xl mx-auto pad-safe-x py-1.5 text-[12px] sm:text-[13px] leading-snug font-mono font-bold tracking-tight hover:underline flex items-center gap-2"
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
