import { source } from "../data/pmg.js";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-sunk mt-auto">
      {/* Bottom padding clears the phone-only BottomNav (56px + the home-indicator inset). */}
      <div className="max-w-3xl mx-auto pad-safe-x pt-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-6 text-[13px] leading-relaxed text-muted">
        <div className="flex items-center gap-2 mb-2">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          <span className="eyebrow text-muted">Transcription notice</span>
        </div>
        <p className="text-soft">
          Transcribed from the <span className="text-ink font-medium">{source.shortTitle}</span> ({source.publicationDate}).
          A reference to the guideline, not a substitute for it or for clinical judgment — confirm doses against the
          PDF and the patient. Antibiotic choice for a given patient remains the treating team's decision.
        </p>
        <div className="mt-3 pt-2 border-t border-rule/50 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted">
          <span>ACS Antibiotic Guide v{__APP_VERSION__} · Mizzou Emergency Medicine</span>
          <span>not an official MU Health publication</span>
        </div>
      </div>
    </footer>
  );
}
