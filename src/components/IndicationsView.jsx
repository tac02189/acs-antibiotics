import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bone,
  Check,
  ChevronDown,
  ChevronLeft,
  Link as LinkIcon,
  Search,
  Thermometer,
} from "lucide-react";
import { drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm, searchIndications, tokens } from "../lib/search.js";
import { Group, Lines, PageTag, Regimen, RegimenInline, SectionLabel, ToneCard, keepUnits } from "./shared.jsx";

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
    blurb: "Gustilo-Anderson classification, antibiotic by type, timing and duration — PMG p.3–4.",
    words: ["fracture", "fractures", "fx", "gustilo", "open", "orthopedic", "ortho", "tibia", "femur", ...FRACTURE_DRUG_WORDS],
  },
  {
    to: "/workup",
    icon: Thermometer,
    title: "Fever workup",
    blurb: "The PMG's infectious-workup flowchart: suspected pneumonia, central line or UTI — p.5.",
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

export default function IndicationsView({ query, onQuery, pcn, route, navigate }) {
  const [open, setOpen] = useState(() => new Set());
  // Rows the reader collapsed while a narrow search had auto-opened them.
  const [closed, setClosed] = useState(() => new Set());
  const focusedOnce = useRef(null);

  const results = useMemo(() => searchIndications(indications, query, drugs), [query]);
  const searching = tokens(query).length > 0;
  const sectionKnown = !route.section || sections.some((s) => s.id === route.section);

  useEffect(() => {
    setClosed(new Set());
  }, [query]);

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
    if (!el) return;
    setOpen((prev) => (prev.has(route.focus) ? prev : new Set(prev).add(route.focus)));
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start", behavior: "auto" });
      el.focus({ preventScroll: true });
      focusedOnce.current = route.focus;
    });
    return () => cancelAnimationFrame(raf);
  }, [route.focus, results]);

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
        <aside className="mb-5 rounded-lg border border-rule bg-chip p-3.5 text-[13px] leading-snug text-soft shadow-xs">
          Regimen, dose, duration, redosing and the PMG's <span className="font-bold text-ink">“{ALT_LABEL}”</span>{" "}
          column for every indication. That column holds penicillin-allergy regimens but also contamination
          escalation and MRSA add-ons — read each note's condition. Tap a row to expand it.
        </aside>
      )}

      {route.section && (
        <button
          type="button"
          onClick={() => navigate("/")}
          className="-ml-1 mb-3 inline-flex items-center gap-1 rounded px-2 py-1.5 text-[14px] font-semibold text-muted hover:text-accent transition-colors"
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

      <div className="space-y-8">
        {visibleSections.map(({ section, items }) => (
          <section
            key={section.id}
            style={{ "--hue": `var(--hue-${section.hue})` }}
            aria-labelledby={`sec-${section.id}`}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-3 pb-1.5 border-b-2 border-hue/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <span aria-hidden="true" className="size-3 rounded-full bg-hue shrink-0 shadow-xs ring-2 ring-hue/30" />
                <h2 id={`sec-${section.id}`} className="min-w-0 text-[15px] font-bold uppercase tracking-wider text-ink">
                  {section.title}
                </h2>
              </div>
              <SectionCount n={items.length} page={section.page} />
            </div>
            {!searching && section.blurb && (
              <p className="text-[13px] leading-snug text-muted -mt-1 mb-2 px-0.5">{section.blurb}</p>
            )}
            <ol className="space-y-2.5">
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
        ))}
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

function SectionCount({ n, page }) {
  return (
    <span className="text-[11px] font-bold tabular-nums text-muted whitespace-nowrap bg-well border border-rule-soft px-2 py-0.5 rounded-full">
      {n} · p.{page}
    </span>
  );
}

// The page reference on a collapsed row.
function PageChip({ page }) {
  return (
    <span className="rounded bg-chip border border-rule-soft px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-soft whitespace-nowrap">
      p.{page}
    </span>
  );
}

function RegimenSummary({ ind, pcn }) {
  const alt = altText(ind);
  return (
    <div className="mt-1.5">
      {ind.regimen ? (
        <RegimenInline regimen={ind.regimen} />
      ) : (
        <span className="text-[13px] font-medium text-muted">N/A — no antibiotic listed</span>
      )}
      {pcn && ind.regimen && (
        <ToneCard tone="warn" as="div" className="mt-2.5 flex items-start gap-2 p-2.5 text-[13px] leading-snug">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-warn-mark" aria-hidden="true" />
          <div className="min-w-0">
            <span className="eyebrow text-warn-mark mr-1.5">{ALT_LABEL}</span>
            <span className="font-semibold text-warn-ink">{keepUnits(alt) || "N/A"}</span>
          </div>
        </ToneCard>
      )}
    </div>
  );
}

// Label above the value on phones, so durations and alternatives get the row's
// full width; label beside the value from sm up. While highlighted (the
// Alternatives toggle), the alternative field is an amber wash with an amber
// label; otherwise every label is muted, so the amber never implies a warning
// state the reader did not switch on (Gemini review, 2026-10-07).
function Field({ label, children, highlight = false }) {
  return (
    <div
      className={`grid gap-y-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3 sm:items-baseline rounded-md px-3 py-2.5 transition-colors ${
        highlight ? "border border-warn-line bg-warn-bg text-warn-ink shadow-xs" : "border border-rule-soft bg-card"
      }`}
    >
      <dt className={`eyebrow break-words ${highlight ? "text-warn-mark" : "text-muted"}`}>{label}</dt>
      <dd className={`min-w-0 break-words text-[15px] leading-snug ${highlight ? "font-semibold text-warn-ink" : "text-prose"}`}>{children}</dd>
    </div>
  );
}

// Copies the row's link. Never navigates: on clipboard failure it shows the
// URL to copy by hand instead of changing the page or the history.
function CopyLink({ id }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const url = () => `${window.location.origin}${window.location.pathname}#/i/${id}`;
  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url());
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("failed");
    }
  };
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <a
        href={`#/i/${id}`}
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 min-h-[36px] text-[12px] font-semibold text-accent hover:bg-accent-soft transition-colors border border-accent-line/30"
      >
        {state === "copied" ? (
          <Check className="size-3.5 text-good-mark" aria-hidden="true" />
        ) : (
          <LinkIcon className="size-3.5" aria-hidden="true" />
        )}
        <span>{state === "copied" ? "Copied" : "Copy link"}</span>
      </a>
      {state === "failed" && (
        <span className="min-w-0 break-all select-all text-[12px] text-soft" role="status">
          {url()}
        </span>
      )}
    </span>
  );
}

export function IndicationRow({ ind, open, onToggle, pcn, onDrug }) {
  const na = !ind.regimen;

  return (
    <li>
      <article
        id={`i-${ind.id}`}
        tabIndex={-1}
        className={`rounded-lg border border-rule bg-card shadow-sm transition-all focus-visible:outline-offset-[-2px] border-l-4 border-l-hue overflow-hidden ${
          open ? "ring-1 ring-rule-strong" : "hover:border-rule-strong"
        }`}
      >
        {na ? (
          <div className="flex items-start gap-3 px-3.5 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug text-ink">{ind.short}</span>
              <span className="block mt-1 text-[13px] font-medium text-muted">N/A in every column — no antibiotic listed</span>
            </span>
            <span className="flex items-center gap-2 shrink-0 pt-0.5">
              <PageChip page={ind.page} />
              <span className="size-6" aria-hidden="true" />
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={`d-${ind.id}`}
              className="group w-full text-left flex items-start gap-3 px-3.5 py-3.5 min-h-[56px] hover:bg-well/60 transition-colors focus-visible:outline-offset-[-2px]"
            >
              <span className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-[16px] font-bold leading-snug text-ink group-hover:text-accent transition-colors">
                    {ind.short}
                  </span>
                </div>
                {!open && <RegimenSummary ind={ind} pcn={pcn} />}
              </span>
              <span className="flex items-center gap-2 shrink-0 pt-0.5">
                <PageChip page={ind.page} />
                <span
                  className={`size-6 rounded-md flex items-center justify-center bg-chip text-soft group-hover:text-ink transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown className="size-4" />
                </span>
              </span>
            </button>

            <div className="expand" data-open={open} id={`d-${ind.id}`}>
              {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
              <div inert={open ? undefined : ""} aria-hidden={!open}>
                <div className="px-3.5 pt-3.5 pb-4 border-t border-rule bg-well space-y-3.5">
                  {ind.name !== ind.short && (
                    <div className="flex items-baseline gap-1.5 text-[12px] leading-snug text-muted">
                      <span className="eyebrow text-muted">PMG row</span>
                      <span className="font-semibold text-soft">{ind.name}</span>
                    </div>
                  )}

                  <div className="rounded-md border border-rule bg-card p-3 shadow-xs">
                    <div className="eyebrow text-muted mb-2">Regimen</div>
                    <Regimen regimen={ind.regimen} onDrug={onDrug} />
                  </div>

                  {ind.regimenNote && (
                    <div className="rounded-md border border-rule bg-card/60 p-2.5 text-[13px] italic leading-snug text-soft">
                      {keepUnits(ind.regimenNote)}
                    </div>
                  )}

                  <dl className="space-y-1.5">
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

                  <div className="pt-2.5 flex items-center justify-between gap-3 border-t border-rule-soft">
                    <PageTag page={ind.page} />
                    <CopyLink id={ind.id} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </article>
    </li>
  );
}
