import { TriangleAlert } from "lucide-react";
import { source } from "../data/pmg.js";

// After the two reference apps' footers: white, a hairline above, the standing
// disclaimer in small quiet text, the version line under a divider.
export default function Footer() {
  return (
    <footer className="border-t border-rule bg-card mt-auto">
      {/* Bottom padding clears the phone-only BottomNav (56px + the home-indicator inset). */}
      <div className="max-w-3xl mx-auto pad-safe-x pt-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-6 text-[13px] leading-relaxed text-muted">
        <div className="flex items-start gap-2">
          <TriangleAlert className="size-4 mt-0.5 shrink-0 text-deepgold" aria-hidden="true" />
          <p>
            Transcribed from the <span className="font-semibold text-prose">{source.shortTitle}</span> ({source.publicationDate}).
            A reference to the guideline, not a substitute for it or for clinical judgment — confirm doses against the
            PDF and the patient. Antibiotic choice for a given patient remains the treating team's decision.
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-rule-soft flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span>ACS Antibiotic Guide v{__APP_VERSION__} · Mizzou Emergency Medicine</span>
          <span>Not an official MU Health publication</span>
        </div>
      </div>
    </footer>
  );
}
