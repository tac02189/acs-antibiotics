import { TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";

// The amber strip under the header, after the Pediatric CPG's draft banner.
// Not rendered since v0.7.5: Thiago had it removed on 2026-10-08 (CLAUDE.md).
// Kept for the next edition of the PMG: render it from App.jsx, under <Header />,
// until a physician has read the new transcription. It scrolls with the page;
// the header above it is the sticky part.
export default function VerificationNotice() {
  return (
    <div className="no-print border-b border-warn-line bg-warn-bg text-warn-ink">
      <a
        href="#/source"
        className="max-w-3xl mx-auto pad-safe-x py-2 flex items-start gap-2 text-[13px] leading-snug hover:underline focus-visible:outline-offset-[-3px]"
      >
        <TriangleAlert className="size-4 shrink-0 mt-px text-warn-mark" aria-hidden="true" />
        <span>
          <span className="font-bold">Transcription pending physician verification.</span> PMG {source.publicationDate} —
          confirm against the PDF.
        </span>
      </a>
    </div>
  );
}
