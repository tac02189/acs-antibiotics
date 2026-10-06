import { Search, ShieldAlert, X } from "lucide-react";
import { drugs } from "../data/pmg.js";

export const TABS = [
  { id: "indications", label: "Indications", to: "/" },
  { id: "fractures", label: "Open fractures", to: "/fractures" },
  { id: "dosing", label: "Dosing", to: "/dosing" },
  { id: "workup", label: "Fever workup", to: "/workup" },
  { id: "drugs", label: "By drug", to: "/drugs" },
  { id: "source", label: "Source", to: "/source" },
];

// Example search terms come from the data (two aliases and one brand name),
// so no drug name is typed into the interface by hand.
const BRAND_EXAMPLE = drugs["Piperacillin-tazobactam"]?.brand ?? "";
const PLACEHOLDER = `Search indication or drug — appy, SBO${BRAND_EXAMPLE ? `, ${BRAND_EXAMPLE}` : ""}…`;

// Sticky console: 48px search, the alternative-column hazard switch, and the
// segment tabs (phones get the BottomNav instead of the tab row). Rendered as a
// sibling of <main> (see App.jsx) so it stays stuck for the whole page.
export default function Toolbar({ view, query, onQuery, pcn, onPcn, navigate }) {
  return (
    <div className="no-print sticky top-0 z-30 bg-[#080B10]/95 backdrop-blur-md border-b border-rule shadow-lg">
      <div className="max-w-3xl mx-auto pad-safe-x pt-2.5 pb-2.5 sm:pb-0">
        <div className="flex items-stretch gap-2.5">
          <label className="relative flex-1 min-w-0">
            <Search
              className="size-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={PLACEHOLDER}
              aria-label="Search indications and drugs"
              className="w-full h-12 rounded-lg border border-rulestrong bg-card pl-11 pr-12 text-[16px] font-sans text-ink placeholder:text-muted focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label="Clear search"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 size-11 rounded flex items-center justify-center text-muted hover:text-white hover:bg-rule/40 transition-colors"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </label>

          {/* Hazard switch: highlights the PDF's "PNC Allergy/Alternative" column. */}
          <button
            type="button"
            onClick={onPcn}
            aria-pressed={pcn}
            aria-label="Alternatives — highlight the PDF's PNC Allergy / Alternative column"
            title="Highlights the PDF's “PNC Allergy/Alternative” column — penicillin-allergy regimens, but also contamination escalation and MRSA add-ons. Read each note's condition."
            className={`h-12 shrink-0 px-3.5 sm:px-4 rounded-lg border font-display font-bold text-[13px] tracking-wider uppercase transition-all flex items-center gap-2 active:scale-95 ${
              pcn
                ? "bg-hazard-amber text-black border-yellow-400 shadow-glow-amber ring-2 ring-yellow-400"
                : "bg-card border-rulestrong text-slate-300 hover:border-yellow-400/60 hover:text-white"
            }`}
          >
            <ShieldAlert className={`size-5 ${pcn ? "text-black" : "text-hazard-amber"}`} aria-hidden="true" />
            <span className="whitespace-nowrap">Alternatives</span>
            <span className={`size-2.5 rounded-full ${pcn ? "bg-black" : "bg-rulestrong"}`} aria-hidden="true" />
          </button>
        </div>

        {/* Segment tabs — tablets and up. Phones use the bottom navigation. */}
        <nav className="hidden sm:flex -mx-1 mt-2.5 gap-1.5 overflow-x-auto no-scrollbar pb-1.5" aria-label="Sections">
          {TABS.map((t) => {
            const active = view === t.id;
            return (
              <a
                key={t.id}
                href={"#" + t.to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(t.to);
                }}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 px-3.5 py-3 rounded text-[13px] font-display font-bold tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-well text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-muted hover:text-slate-200 hover:bg-card/60 border border-transparent"
                }`}
              >
                <span className={`size-1.5 rounded-full ${active ? "bg-cyan-400" : "bg-transparent"}`} aria-hidden="true" />
                {t.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
