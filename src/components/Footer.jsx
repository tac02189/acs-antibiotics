import { source } from "../data/pmg.js";

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-auto">
      <div className="max-w-3xl mx-auto pad-safe-x pad-safe-b pt-5 pb-6 text-[12px] leading-snug text-muted">
        <p>
          Transcribed from the <span className="text-ink/80">{source.shortTitle}</span> ({source.publicationDate}).
          A reference to the guideline, not a substitute for it or for clinical judgment — confirm doses against the
          PDF and the patient. Antibiotic choice for a given patient remains the treating team's decision.
        </p>
        <p className="mt-2 font-mono text-[11px]">
          ACS Antibiotic Guide v{__APP_VERSION__} · Mizzou Emergency Medicine · not an official MU Health publication
        </p>
      </div>
    </footer>
  );
}
