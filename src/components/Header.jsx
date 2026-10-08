import { useEffect, useRef } from "react";
import { FileText, Search, ShieldAlert, X } from "lucide-react";
import { drugs } from "../data/pmg.js";
import PdfButton from "./PdfButton.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

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

// The sticky header, after the MUHC Antibiogram's: brand row, search row and,
// from sm up, the tab row, all on Mizzou black. Phones get the BottomNav
// instead of the tab row, and close the header with the Pediatric CPG's gold
// rule. It pads for the status bar itself, so the area behind the clock is
// black in the installed app whichever theme is on.
export default function Header({ view, query, onQuery, pcn, onPcn, navigate }) {
  const ref = useRef(null);

  // Publish the header's rendered height (status-bar inset and any wrapped
  // brand row included) as a CSS variable, so deep links scroll their row to
  // just below it (scroll-padding-top in index.css) at any width, text size or
  // inset — no fixed estimate.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty("--app-header-h", `${el.offsetHeight}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="no-print sticky top-0 z-40 bg-bar text-bar-text shadow-md pt-[env(safe-area-inset-top)] border-b-2 border-gold sm:border-b-0"
    >
      {/* Brand row: Thiago's icon artwork, the title, and the two controls. One
          line on a phone at normal text size (the PDF button drops its icon below
          420px; a 320px phone also loses the icon tile); with enlarged text the
          controls wrap to a second line rather than clipping the title. */}
      <div className="max-w-3xl mx-auto pad-safe-x pt-2.5 pb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <a href="#/" className="flex flex-auto items-center gap-2.5 min-w-0 rounded-lg" aria-label="ACS Antibiotic Guide home">
          <img
            src="/pwa-192.png"
            width="36"
            height="36"
            alt=""
            aria-hidden="true"
            decoding="async"
            className="hidden min-[360px]:block size-9 shrink-0 rounded-lg ring-1 ring-inset ring-bar-line"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[16px] font-bold text-bar-text">ACS Antibiotic Guide</span>
            {/* "ACS" is spelled out so nobody reads it as acute coronary syndrome. */}
            <span className="block truncate text-[11px] font-semibold text-gold">
              Acute Care Surgery<span className="hidden min-[480px]:inline"> · MU Health</span>
            </span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <PdfButton className="inline-flex items-center gap-1.5 h-10 px-3 rounded border border-gold/40 hover:border-gold text-[12px] font-semibold text-gold hover:text-bar-text transition-colors">
            <FileText className="hidden min-[420px]:block size-4" aria-hidden="true" />
            <span>PDF</span>
          </PdfButton>
        </div>
      </div>

      {/* Search row: the field, and the pill that highlights the PDF's
          "PNC Allergy/Alternative" column. */}
      <div className="max-w-3xl mx-auto pad-safe-x pb-2.5 flex items-stretch gap-2">
        <label className="relative flex-1 min-w-0">
          <Search
            className="size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-bar-muted pointer-events-none"
            aria-hidden="true"
          />
          {/* 16px: smaller and iOS zooms the page on focus. The right padding
              clears the clear button only while it is shown. The resting border
              (bar-rule) reaches 3:1 on the field; focus swaps it for gold. */}
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
            className={`w-full h-11 rounded-md border border-bar-rule bg-bar-well pl-10 ${query ? "pr-11" : "pr-3"} text-[16px] text-bar-text text-ellipsis placeholder:text-bar-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors`}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 size-10 rounded-md flex items-center justify-center text-bar-muted hover:text-bar-text transition-colors"
            >
              <X className="size-[18px]" aria-hidden="true" />
            </button>
          )}
        </label>

        <button
          type="button"
          onClick={onPcn}
          aria-pressed={pcn}
          aria-label="PCN Allergy — highlight the PDF's PNC Allergy / Alternative column"
          title="Highlights the PDF's “PNC Allergy/Alternative” column — penicillin-allergy regimens, but also contamination escalation and MRSA add-ons. Read each note's condition."
          className={`h-11 shrink-0 px-3.5 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
            pcn ? "bg-gold text-on-gold" : "bg-bar-well text-bar-soft hover:bg-bar-well-hi hover:text-bar-text"
          }`}
        >
          <ShieldAlert className="size-4" aria-hidden="true" />
          <span className="whitespace-nowrap">PCN Allergy</span>
        </button>
      </div>

      {/* Tab row — tablets and up, the Antibiogram's gold underline. */}
      <nav className="hidden sm:block border-t border-bar-line bg-bar-raised overflow-x-auto no-scrollbar" aria-label="Sections">
        <div className="max-w-3xl mx-auto pad-safe-x flex">
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
                className={`shrink-0 px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors focus-visible:outline-offset-[-2px] ${
                  active ? "border-gold text-gold" : "border-transparent text-bar-muted hover:text-bar-soft"
                }`}
              >
                {t.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
