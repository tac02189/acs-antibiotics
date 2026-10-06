import { Search, ShieldAlert, X } from "lucide-react";

const TABS = [
  { id: "indications", label: "Indications", to: "/" },
  { id: "fractures", label: "Open fractures", to: "/fractures" },
  { id: "dosing", label: "Dosing", to: "/dosing" },
  { id: "workup", label: "Fever workup", to: "/workup" },
  { id: "drugs", label: "By drug", to: "/drugs" },
  { id: "source", label: "Source", to: "/source" },
];

// Sticky tools: search, the alternative-column toggle, tabs. Rendered as a
// sibling of <main> (see App.jsx) so it stays stuck for the whole page.
export default function Toolbar({ view, query, onQuery, pcn, onPcn, navigate }) {
  return (
    <div className="no-print sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-rule">
      <div className="max-w-3xl mx-auto pad-safe-x pt-2.5">
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <Search
              className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
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
              placeholder="Search indication or drug — appy, SBO, Zosyn…"
              aria-label="Search indications and drugs"
              className="w-full h-11 rounded-xl border border-rule bg-card pl-9 pr-9 text-base placeholder:text-muted focus:border-gold focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={onPcn}
            aria-pressed={pcn}
            aria-label="Highlight the PDF's PNC Allergy / Alternative column"
            title="Highlights the PDF's “PNC Allergy/Alternative” column — penicillin-allergy regimens, but also contamination escalation and MRSA add-ons. Read each note's condition."
            className={`h-11 shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors ${
              pcn ? "bg-gold text-[#121317] border-gold" : "bg-card border-rule text-ink hover:border-gold"
            }`}
          >
            <ShieldAlert className="size-4" aria-hidden="true" />
            <span>Alternatives</span>
          </button>
        </div>

        <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto no-scrollbar" aria-label="Sections">
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
                className={`relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
                <span
                  className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-full transition-colors ${
                    active ? "bg-gold" : "bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
