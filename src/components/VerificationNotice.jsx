import { TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";

// The amber strip under the header, after the Pediatric CPG's draft banner.
// Removed in v0.7.5 at Thiago's request (2026-10-08), once he had read the
// December 2025 transcription; rendered again for the October 2026 edition
// (v0.8.0); removed again in v0.8.5 at his word (2026-10-20: "remove the
// verification banner"). Kept for the next edition of the PMG: render it from
// App.jsx, under <Header />, until a physician has read the new transcription.
// It scrolls with the page; the header above it is the sticky part.
export default function VerificationNotice() {
  return (
    <div className="no-print border-b border-warn-line bg-warn-bg text-warn-ink">
      <a
        href="#/source"
        className="max-w-3xl mx-auto pad-safe-x py-2 flex items-start gap-2 text-[13px] leading-snug hover:underline focus-visible:outline-offset-[-3px]"
      >
        <TriangleAlert className="size-4 shrink-0 mt-px text-warn-mark" aria-hidden="true" />
        <span>
          <span className="font-bold">Transcription pending physician verification.</span> PMG review date {source.reviewDate} —
          confirm against the PDF.
        </span>
      </a>
    </div>
  );
}
