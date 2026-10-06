import { FileText } from "lucide-react";
import { source } from "../data/pmg.js";
import { pdfHref } from "./shared.jsx";

// Thiago's icon artwork (assets/icon-source.png → public/*.png via scripts/gen-icons.mjs).
function Mark({ className = "" }) {
  return (
    <img src="/pwa-192.png" width="36" height="36" alt="" aria-hidden="true" decoding="async" className={className} />
  );
}

export default function BrandBar() {
  return (
    <header className="no-print">
      {/* Brand bar — always ink, both themes, with a gold hairline. */}
      <div className="bg-[#121317] text-[#f6f3ec] border-b-2 border-[#F1B82D]">
        <div className="max-w-3xl mx-auto pad-safe-x py-3 flex items-center gap-3">
          <a href="#/" className="flex items-center gap-3 min-w-0" aria-label="ACS Antibiotic Guide home">
            <Mark className="size-9 shrink-0 rounded-[10px]" />
            <span className="min-w-0">
              <span className="block font-display font-semibold text-[17px] sm:text-[19px] leading-none tracking-tight">
                ACS Antibiotic Guide
              </span>
              <span className="block mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F1B82D]/90 truncate">
                Acute Care Surgery · MU Health
              </span>
            </span>
          </a>
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#f6f3ec]/25 px-3 py-1.5 text-xs font-medium hover:border-[#F1B82D] hover:text-[#F1B82D] transition-colors"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            PDF
          </a>
        </div>
      </div>

      {/* Verification notice — stays until a physician signs the transcription off. */}
      <div className="bg-[rgb(var(--amber-bg))] text-[rgb(var(--amber-ink))]">
        <a href="#/source" className="block max-w-3xl mx-auto pad-safe-x py-1.5 text-[12px] leading-snug font-medium">
          PMG {source.publicationDate} · transcription pending physician verification · confirm against the PDF →
        </a>
      </div>
    </header>
  );
}
