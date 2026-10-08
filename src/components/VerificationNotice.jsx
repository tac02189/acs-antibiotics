import { TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";

// The amber strip under the header, after the Pediatric CPG's draft banner. It
// stays until a physician signs the transcription off (CLAUDE.md). It scrolls
// with the page; the header above it is the sticky part.
export default function VerificationNotice() {
  return (
    <div className="no-print border-b border-warn-line bg-warn-bg text-warn-ink">
      <a
        href="#/source"
        className="max-w-3xl mx-auto pad-safe-x py-2 min-h-11 flex items-start gap-2 text-[13px] leading-snug hover:underline focus-visible:outline-offset-[-3px]"
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
