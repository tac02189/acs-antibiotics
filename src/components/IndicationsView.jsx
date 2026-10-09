import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bone,
  ChevronDown,
  ChevronLeft,
  Search,
  Thermometer,
} from "lucide-react";
import { drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm, searchIndications, tokens } from "../lib/search.js";
import {
  Group,
  Lines,
  Regimen,
  RegimenInline,
  SectionHead,
  ToneCard,
  keepUnits,
  publishHeadHeight,
} from "./shared.jsx";

// Drug names that should steer a search towards the open-fracture page come
// from the data (the agents in its regimens and their brand names), not from a
// hand-typed list.
const FRACTURE_DRUG_WORDS = [
  ...new Set(
    openFractures.antimicrobial.flatMap((a) => a.regimen.flatMap((r) => [norm(r.drug), norm(drugs[r.drug]?.brand ?? "")]))
  ),
].filter(Boolean);

// Queries that belong to another view. Matched on whole tokens. The blurbs
// describe where the link goes; they make no clinical claim of their own.
const CROSS_LINKS = [
  {
    to: "/fractures",
    icon: Bone,
    title: "Open extremity fractures",
    blurb: "Gustilo-Anderson classification, antibiotic by type, timing and duration.",
    words: ["fracture", "fractures", "fx", "gustilo", "open", "orthopedic", "ortho", "tibia", "femur", ...FRACTURE_DRUG_WORDS],
  },
  {
    to: "/workup",
    icon: Thermometer,
    title: "Fever workup",
    blurb: "The PMG's infectious-workup flowchart: suspected pneumonia, central line or UTI.",
    words: ["fever", "workup", "febrile", "temp", "culture", "cultures", "bal", "urinalysis", "ua", "cvc"],
  },
];

// The PDF's own column header, kept verbatim. The column mixes penicillin-
// allergy regimens with contamination escalation, MRSA add-ons and one
// clindamycin note, so the UI never calls it simply "the allergy regimen".
const ALT_LABEL = "PNC allergy / alternative";

// Search examples for the empty state, taken from the data.
const EXAMPLE_INDICATION = indications.find((i) => i.id === "cholecystitis")?.name ?? "";
const EXAMPLE_BRAND = drugs["Piperacillin-tazobactam"]?.brand ?? "";
const EXAMPLE_GENERIC = Object.keys(drugs)[0] ?? "";

const without = (set, id) => {
  if (!set.has(id)) return set;
  const next = new Set(set);
  next.delete(id);
  return next;
};
const flip = (set, id) => (set.has(id) ? without(set, id) : new Set(set).add(id));

export default function IndicationsView({ query, onQuery, pcn, route, navigate, collapsed, setCollapsed }) {
  const [open, setOpen] = useState(() => new Set());
  // Rows the reader collapsed while a narrow search had auto-opened them.
  const [closed, setClosed] = useState(() => new Set());
  // Sections the reader collapsed during the current search. A search shows every
  // section that has a match, whatever was collapsed before it, so no result is
  // hidden behind a head; clearing it brings back the reader's own `collapsed`.
  const [searchCollapsed, setSearchCollapsed] = useState(() => new Set());
  const focusedOnce = useRef(null);

  const results = useMemo(() => searchIndications(indications, query, drugs), [query]);
  const searching = tokens(query).length > 0;
  const sectionKnown = !route.section || sections.some((s) => s.id === route.section);

  useEffect(() => {
    setClosed(new Set());
    setSearchCollapsed(new Set());
  }, [query]);

  const sectionOpen = (id) => !(searching ? searchCollapsed : collapsed).has(id);
  const toggleSection = (id) => (searching ? setSearchCollapsed : setCollapsed)((prev) => flip(prev, id));

  // Arriving at one section (#/s/<id>) or one indication (#/i/<id>) opens its
  // section, so a link never lands on a collapsed head. Both sets: a section link
  // keeps the query, so a section collapsed during that search must reopen too
  // (Codex review, 2026-10-08).
  useEffect(() => {
    const id = route.section || (route.focus && indications.find((i) => i.id === route.focus)?.section);
    if (!id) return;
    setCollapsed((prev) => without(prev, id));
    setSearchCollapsed((prev) => without(prev, id));
  }, [route.section, route.focus, setCollapsed]);

  const visibleSections = useMemo(() => {
    const bySection = new Map(sections.map((s) => [s.id, []]));
    for (const ind of results) bySection.get(ind.section)?.push(ind);
    return sections
      .filter((s) => !route.section || s.id === route.section)
      .map((s) => ({ section: s, items: bySection.get(s.id) }))
      .filter((g) => g.items.length);
  }, [results, route.section]);

  // Counts describe what is on screen, not the global result set.
  const total = visibleSections.reduce((n, g) => n + g.items.length, 0);

  const crossLinks = useMemo(() => {
    const ts = tokens(query);
    if (!ts.length) return [];
    return CROSS_LINKS.filter((c) => ts.some((t) => c.words.includes(t)));
  }, [query]);

  // Deep link: open the focused row, bring it into view and give it keyboard
  // focus — once per arrival, and only once the row actually exists in the DOM
  // (App clears any search first; this effect re-runs when results change).
  // Completion is recorded inside the frame callback, so a cancelled frame
  // (StrictMode replay, or results changing before the frame) is retried.
  useEffect(() => {
    if (!route.focus) {
      focusedOnce.current = null;
      return;
    }
    if (focusedOnce.current === route.focus) return;
    const el = document.getElementById(`i-${route.focus}`);
    // Not rendered yet, or in a section still collapsed (the effect above opens it;
    // a hidden element has no client rects).
    if (!el || !el.getClientRects().length) return;
    setOpen((prev) => (prev.has(route.focus) ? prev : new Set(prev).add(route.focus)));
    const raf = requestAnimationFrame(() => {
      // Measure the section head now rather than trust the ResizeObserver: opening the
      // section can change its height (a classic scrollbar appearing narrows the column
      // and wraps the title) after the last report and before this scroll (Codex
      // review, 2026-10-08).
      publishHeadHeight(el.closest("section")?.querySelector(".section-head"));
      el.scrollIntoView({ block: "start", behavior: "auto" });
      el.focus({ preventScroll: true });
      focusedOnce.current = route.focus;
    });
    return () => cancelAnimationFrame(raf);
  }, [route.focus, results, collapsed]);

  // A narrow search opens its results, so the answer is one glance away; the
  // reader can still collapse any of them.
  const autoOpen = searching && total <= 3;
  const isOpen = (id) => open.has(id) || (autoOpen && !closed.has(id));

  const toggle = (id) => {
    if (isOpen(id)) {
      setOpen((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (autoOpen) setClosed((prev) => new Set(prev).add(id));
    } else {
      setOpen((prev) => new Set(prev).add(id));
      setClosed((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div>
      {!searching && !route.section && (
        <aside className="mb-5 rounded-lg border border-rule bg-chip p-3 text-[13px] leading-snug text-soft">
          Tap a section, then a row. The <span className="font-bold text-ink">“{ALT_LABEL}”</span> column holds
          penicillin-allergy regimens but also contamination escalation and MRSA add-ons — read each note's
          condition.
        </aside>
      )}

      {route.section && (
        <button
          type="button"
          onClick={() => navigate("/")}
          className="-ml-1 mb-3 inline-flex items-center gap-1 rounded px-1 py-1.5 text-[14px] font-semibold text-muted hover:text-accent transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          All sections
        </button>
      )}

      {!sectionKnown && (
        <Empty>
          No section called “{route.section}”.{" "}
          <a className="font-semibold text-accent underline underline-offset-2" href="#/">
            Show all indications
          </a>
          .
        </Empty>
      )}

      {crossLinks.length > 0 && (
        <Group className="mb-5">
          {crossLinks.map(({ to, icon: Icon, title, blurb }) => (
            <a
              key={to}
              href={"#" + to}
              onClick={(e) => {
                e.preventDefault();
                onQuery("");
                navigate(to);
              }}
              className="group flex min-h-[64px] items-center gap-3 px-3.5 py-3 hover:bg-well transition-colors focus-visible:outline-offset-[-2px]"
            >
              <Icon className="size-5 shrink-0 text-faint" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold leading-snug text-ink">{title}</span>
                <span className="block mt-0.5 text-[13px] leading-snug text-muted">{blurb}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted group-hover:translate-x-0.5 group-hover:text-prose transition" aria-hidden="true" />
            </a>
          ))}
        </Group>
      )}

      {searching && sectionKnown && (
        <p className="mb-3 px-1 text-[13px] text-muted" role="status">
          {total === 0 ? "No indications match" : `${total} match${total === 1 ? "" : "es"}`}
          {route.section ? " in this section" : ""}
          {" · "}
          <span className="font-semibold text-prose">“{query}”</span>
        </p>
      )}

      {sectionKnown && total === 0 && crossLinks.length === 0 && (
        <Empty icon>
          Nothing in the PMG tables matches. Try the diagnosis as the PMG names it (e.g. “{EXAMPLE_INDICATION}”,
          “SBO”), a drug (“{EXAMPLE_BRAND}”, “{EXAMPLE_GENERIC}”), or check{" "}
          <a className="font-semibold text-accent underline underline-offset-2" href="#/fractures">
            Open fractures
          </a>
          .
        </Empty>
      )}

      {/* One section = one hue spine: the sticky head and each row card below it
          share the 4px rule in the section's colour. The head collapses the
          section; the rows are separate cards with a gap between them. A
          collapsed list stays in the DOM, hidden, and print shows it. */}
      <div className="space-y-7">
        {visibleSections.map(({ section, items }) => {
          const secOpen = sectionOpen(section.id);
          return (
            <section key={section.id} style={{ "--hue": `var(--hue-${section.hue})` }} aria-labelledby={`sec-${section.id}`}>
              <SectionHead
                id={`sec-${section.id}`}
                title={section.title}
                sticky
                open={secOpen}
                onToggle={() => toggleSection(section.id)}
                controls={`sl-${section.id}`}
                aside={<SectionCount n={items.length} />}
                blurb={searching ? null : section.blurb}
              />
              <ol id={`sl-${section.id}`} hidden={!secOpen} className="section-list space-y-2">
                {items.map((ind) => (
                  <IndicationRow
                    key={ind.id}
                    ind={ind}
                    open={isOpen(ind.id)}
                    onToggle={() => toggle(ind.id)}
                    pcn={pcn}
                    onDrug={(d) => navigate(`/drugs/${encodeURIComponent(d)}`)}
                  />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Empty({ icon = false, children }) {
  return (
    <div className="mb-5 rounded-lg border border-dashed border-rule-strong bg-card px-4 py-10 text-center text-[14px] leading-snug text-soft">
      {icon && <Search className="mx-auto mb-3 size-7 text-faint" aria-hidden="true" />}
      {children}
    </div>
  );
}

function SectionCount({ n }) {
  return (
    <span className="text-[12px] font-semibold tabular-nums text-muted whitespace-nowrap">
      <span aria-hidden="true">{n}</span>
      <span className="sr-only">
        {n} {n === 1 ? "indication" : "indications"}
      </span>
    </span>
  );
}

// The collapsed row's regimen: one plate pill per drug, and the alternative
// column's note while the PCN Allergy toggle is on.
function RegimenSummary({ ind, pcn }) {
  const alt = altText(ind);
  return (
    <span className="block mt-1.5">
      {ind.regimen ? <RegimenInline regimen={ind.regimen} /> : <span className="text-[13px] text-muted">N/A — no antibiotic listed</span>}
      {pcn && ind.regimen && (
        <ToneCard tone="warn" as="span" className="mt-2 flex items-start gap-2 p-2 text-[13px] leading-snug">
          <AlertCircle className="size-4 shrink-0 mt-px text-warn-mark" aria-hidden="true" />
          <span className="min-w-0">
            <span className="eyebrow text-warn-mark mr-1.5">{ALT_LABEL}</span>
            <span className="font-semibold">{keepUnits(alt) || "N/A"}</span>
          </span>
        </ToneCard>
      )}
    </span>
  );
}

// Label above the value on phones, so durations and alternatives get the row's
// full width; label beside the value from sm up. While highlighted (the
// PCN Allergy toggle), the alternative field is an amber wash with an amber
// label; otherwise every label is muted, so the amber never implies a warning
// state the reader did not switch on (Gemini review, 2026-10-07).
function Field({ label, children, highlight = false }) {
  return (
    <div
      className={`grid gap-y-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3 sm:items-baseline rounded-md px-3 py-2 transition-colors ${
        highlight ? "border border-warn-line bg-warn-bg text-warn-ink" : ""
      }`}
    >
      <dt className={`eyebrow break-words ${highlight ? "text-warn-mark" : "text-muted"}`}>{label}</dt>
      <dd className={`min-w-0 break-words text-[15px] leading-snug ${highlight ? "font-semibold" : "font-medium text-ink"}`}>
        {children}
      </dd>
    </div>
  );
}

export function IndicationRow({ ind, open, onToggle, pcn, onDrug }) {
  const na = !ind.regimen;

  // Each indication is its own card, a small gap from the next (2026-10-08: "a
  // little separation between each diagnosis"), with the section's hue spine
  // down its left edge.
  return (
    <li className="overflow-hidden rounded-lg border border-rule border-l-4 border-l-hue bg-card shadow-sm">
      {/* The scroll margin is the stuck section head's measured height plus 1rem (SectionHead
          publishes --section-head-h on the section), so a deep link lands below the head at any
          text size; the row button carries the same margin for keyboard focus. */}
      <article
        id={`i-${ind.id}`}
        tabIndex={-1}
        className="scroll-mt-[calc(var(--section-head-h,2.25rem)_+_1rem)] focus-visible:outline-offset-[-2px]"
      >
        {na ? (
          <div className="flex items-start gap-3 px-3.5 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug text-ink">{ind.short}</span>
              <span className="block mt-1 text-[13px] text-muted">N/A in every column — no antibiotic listed</span>
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={`d-${ind.id}`}
              className="group w-full text-left flex items-start gap-3 px-3.5 py-3.5 min-h-[56px] scroll-mt-[calc(var(--section-head-h,2.25rem)_+_1rem)] hover:bg-well transition-colors focus-visible:outline-offset-[-2px]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-snug text-ink">{ind.short}</span>
                {!open && <RegimenSummary ind={ind} pcn={pcn} />}
              </span>
              {/* 3px: centred on the title's first line (16px on a 22px line). */}
              <ChevronDown
                className={`size-4 shrink-0 mt-[3px] text-muted transition-transform duration-200 group-hover:text-prose ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <div className="expand" data-open={open} id={`d-${ind.id}`}>
              {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
              <div inert={open ? undefined : ""} aria-hidden={!open}>
                <div className="px-3.5 pt-3 pb-3.5 border-t border-rule bg-well space-y-3">
                  {ind.name !== ind.short && (
                    <p className="text-[12px] leading-snug text-muted">
                      <span className="eyebrow mr-1.5">PMG row</span>
                      <span className="font-semibold text-soft">{ind.name}</span>
                    </p>
                  )}

                  <div>
                    <div className="eyebrow text-muted mb-1.5">Regimen</div>
                    <Regimen regimen={ind.regimen} onDrug={onDrug} />
                  </div>

                  {ind.regimenNote && <p className="text-[13px] italic leading-snug text-soft">{keepUnits(ind.regimenNote)}</p>}

                  <dl className="space-y-1">
                    <Field label="Duration">
                      <Lines value={ind.duration} />
                    </Field>
                    <Field label="Redose">
                      <Lines value={ind.redose} />
                    </Field>
                    <Field label={ALT_LABEL} highlight={pcn}>
                      <Lines value={ind.alternative} />
                    </Field>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </article>
    </li>
  );
}
