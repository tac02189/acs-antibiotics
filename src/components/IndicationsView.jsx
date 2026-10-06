import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Link as LinkIcon, Check, Bone, Thermometer, ArrowRight, ShieldAlert } from "lucide-react";
import { drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm, searchIndications, tokens } from "../lib/search.js";
import { Lines, Regimen, RegimenInline } from "./shared.jsx";

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
  // Cards the reader collapsed while a narrow search had auto-opened them.
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

  // Deep link: open the focused card, bring it into view and give it keyboard
  // focus — once per arrival, and only once the card actually exists in the DOM
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
        <div className="mb-4 bg-card/60 border border-rule/80 rounded-lg p-3 text-[13px] text-muted flex items-start gap-2.5">
          <span className="size-2 rounded-full bg-accent shrink-0 mt-1.5" aria-hidden="true" />
          <p className="text-balance leading-snug">
            Regimen, dose, duration, redosing and the PMG's <span className="font-bold text-ink">“{ALT_LABEL}”</span>{" "}
            column for every indication. That column holds penicillin-allergy regimens but also contamination
            escalation and MRSA add-ons — read each note's condition. Tap a row to expand it.
          </p>
        </div>
      )}

      {route.section && (
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-3 px-3 py-3 rounded border border-rulestrong bg-card text-xs font-mono font-bold uppercase tracking-wider text-muted hover:text-ink hover:border-accent transition-colors"
        >
          ← All sections
        </button>
      )}

      {!sectionKnown && (
        <div className="rounded-lg border border-dashed border-rule bg-card/40 p-8 text-center text-sm text-muted">
          No section called “{route.section}”.{" "}
          <a className="text-accent underline font-semibold" href="#/">
            Show all indications
          </a>
          .
        </div>
      )}

      {crossLinks.length > 0 && (
        <div className="mb-4 space-y-2">
          {crossLinks.map(({ to, icon: Icon, title, blurb }) => (
            <a
              key={to}
              href={"#" + to}
              onClick={(e) => {
                e.preventDefault();
                onQuery("");
                navigate(to);
              }}
              className="rise flex items-center gap-3.5 rounded-lg border border-accent-fill/40 bg-well/90 p-3.5 hover:border-accent transition-colors group"
            >
              <div className="size-9 rounded bg-tint-cyan/60 border border-accent-fill/40 flex items-center justify-center shrink-0">
                <Icon className="size-5 text-accent" aria-hidden="true" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold text-[15px] uppercase tracking-wide text-ink group-hover:text-accent-hi">
                  {title}
                </span>
                <span className="block text-xs text-muted mt-0.5">{blurb}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-accent group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}

      {searching && sectionKnown && (
        <p className="eyebrow text-accent mb-3.5 px-1" role="status">
          {total === 0 ? "No indications match" : `${total} match${total === 1 ? "" : "es"}`}
          {route.section ? " in this section" : ""}
          {" · "}
          <span className="normal-case tracking-normal font-mono font-semibold text-ink">“{query}”</span>
        </p>
      )}

      {sectionKnown && total === 0 && crossLinks.length === 0 && (
        <div className="rounded-lg border border-dashed border-rule bg-card/40 p-8 text-center text-sm text-muted">
          Nothing in the PMG tables matches. Try the diagnosis as the PMG names it (e.g. “{EXAMPLE_INDICATION}”,
          “SBO”), a drug (“{EXAMPLE_BRAND}”, “{EXAMPLE_GENERIC}”), or check{" "}
          <a className="text-accent underline font-semibold" href="#/fractures">
            Open fractures
          </a>
          .
        </div>
      )}

      <div className="space-y-7">
        {visibleSections.map(({ section, items }, gi) => (
          <section key={section.id} style={{ "--hue": `var(--hue-${section.hue})` }} aria-labelledby={`sec-${section.id}`}>
            <header
              className="flex items-end justify-between gap-3 mb-2.5 pb-1 border-b border-rule/60 rise"
              style={{ animationDelay: `${gi * 40}ms` }}
            >
              <div className="min-w-0">
                <h2
                  id={`sec-${section.id}`}
                  className="font-display font-bold text-[20px] sm:text-[22px] leading-tight tracking-tight uppercase flex items-center gap-2.5 text-ink"
                >
                  <span className="size-3 rounded-sm shrink-0 bg-hue" aria-hidden="true" />
                  {section.title}
                </h2>
                {!searching && <p className="text-[12px] text-muted mt-0.5">{section.blurb}</p>}
              </div>
              <span className="font-mono text-[11px] font-bold text-muted bg-card px-2 py-0.5 rounded border border-rule/80 whitespace-nowrap mb-0.5">
                {items.length} · p.{section.page}
              </span>
            </header>
            <ol className="space-y-2">
              {items.map((ind, i) => (
                <li key={ind.id}>
                  <IndicationCard
                    ind={ind}
                    open={isOpen(ind.id)}
                    onToggle={() => toggle(ind.id)}
                    pcn={pcn}
                    delay={Math.min(i, 8) * 25 + gi * 40}
                    onDrug={(d) => navigate(`/drugs/${encodeURIComponent(d)}`)}
                  />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function RegimenSummary({ ind, pcn }) {
  const alt = altText(ind);
  return (
    <span className="block mt-1.5">
      {ind.regimen ? (
        <RegimenInline regimen={ind.regimen} />
      ) : (
        <span className="text-muted text-[13px] font-mono">N/A — no antibiotic listed</span>
      )}
      {pcn && ind.regimen && (
        <span className="mt-2 rounded bg-tint-amber/40 border border-hazard-edge/80 p-2 text-hazard-ink flex items-start gap-2 hazard-stripes">
          <ShieldAlert className="size-4 shrink-0 mt-0.5 text-hazard-amber" aria-hidden="true" />
          <span className="min-w-0 text-[13px] leading-snug">
            <span className="eyebrow text-hazard-amber mr-1.5 text-[10px]">{ALT_LABEL}</span>
            <span className="font-semibold">{alt || "N/A"}</span>
          </span>
        </span>
      )}
    </span>
  );
}

function Field({ label, children, highlight = false }) {
  return (
    <div
      className={`grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 py-2.5 px-2.5 rounded transition-colors ${
        highlight ? "bg-tint-amber/40 border border-hazard-amber/80 hazard-stripes" : "bg-paper/40"
      }`}
    >
      <dt className={`eyebrow pt-0.5 text-[11px] break-words ${highlight ? "text-hazard-amber" : "text-muted"}`}>{label}</dt>
      <dd className={`text-[14px] leading-snug min-w-0 break-words ${highlight ? "font-medium text-ink" : "text-prose"}`}>
        {children}
      </dd>
    </div>
  );
}

// Copies the card's link. Never navigates: on clipboard failure it shows the
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
        className="inline-flex items-center gap-1.5 px-2.5 py-2 min-h-[36px] rounded bg-card hover:bg-rule/40 border border-rule/70 text-soft hover:text-ink transition-colors"
      >
        {state === "copied" ? (
          <Check className="size-3 text-dose" aria-hidden="true" />
        ) : (
          <LinkIcon className="size-3 text-accent" aria-hidden="true" />
        )}
        <span>{state === "copied" ? "copied" : "copy link"}</span>
      </a>
      {state === "failed" && (
        <span className="min-w-0 break-all select-all text-soft" role="status">
          {url()}
        </span>
      )}
    </span>
  );
}

export function IndicationCard({ ind, open, onToggle, pcn, delay = 0, onDrug }) {
  const na = !ind.regimen;

  return (
    <article
      id={`i-${ind.id}`}
      tabIndex={-1}
      className="rise rounded-lg border border-rule bg-card shadow-card overflow-hidden scroll-mt-36"
      style={{ animationDelay: `${delay}ms` }}
    >
      {na ? (
        <div className="flex items-stretch min-h-[48px]">
          <span className="w-2 shrink-0 bg-hue/40" aria-hidden="true" />
          <div className="flex-1 min-w-0 px-3.5 py-3 flex items-baseline justify-between gap-3">
            <span>
              <span className="block font-display font-bold text-[15px] sm:text-[16px] text-ink leading-snug">{ind.short}</span>
              <span className="block mt-0.5 text-[12px] font-mono text-muted">N/A in every column — no antibiotic listed</span>
            </span>
            <span className="font-mono text-[11px] text-muted whitespace-nowrap bg-paper px-2 py-0.5 rounded border border-rule/60">
              p.{ind.page}
            </span>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`d-${ind.id}`}
            className="w-full text-left flex items-stretch min-h-[52px] hover:bg-well/50 active:bg-well transition-colors group focus-visible:outline-offset-[-2px]"
          >
            <span className="w-2 shrink-0 bg-hue" aria-hidden="true" />
            <span className="flex-1 min-w-0 px-3.5 py-3">
              <span className="flex items-start justify-between gap-3">
                <span className="font-display font-bold text-[15px] sm:text-[16.5px] text-ink leading-snug uppercase group-hover:text-accent-hi transition-colors break-words min-w-0">
                  {ind.short}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-muted bg-paper px-1.5 py-0.5 rounded border border-rule/60">p.{ind.page}</span>
                  <ChevronDown
                    className={`size-4 text-muted transition-transform duration-200 ${open ? "rotate-180 text-accent" : "group-hover:text-ink"}`}
                    aria-hidden="true"
                  />
                </span>
              </span>
              {!open && <RegimenSummary ind={ind} pcn={pcn} />}
            </span>
          </button>

          <div className="expand" data-open={open} id={`d-${ind.id}`}>
            {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
            <div inert={open ? undefined : ""} aria-hidden={!open}>
              <div className="px-3.5 pb-4 pt-1 border-t border-rule/60 bg-well/40 space-y-3">
                {ind.name !== ind.short && (
                  <div className="bg-paper/70 rounded p-2 border border-rule/60 text-[12px] leading-snug flex items-start gap-2">
                    <span className="eyebrow text-accent shrink-0 text-[10px] pt-0.5">PMG row</span>
                    <span className="font-mono text-soft font-semibold break-words min-w-0">{ind.name}</span>
                  </div>
                )}

                <div className="pt-1">
                  <div className="eyebrow text-muted mb-1.5 text-[10px]">Regimen</div>
                  <Regimen regimen={ind.regimen} onDrug={onDrug} />
                </div>

                {ind.regimenNote && (
                  <p className="p-2.5 rounded bg-paper/60 border border-rule/60 text-[13px] italic text-soft leading-snug">
                    {ind.regimenNote}
                  </p>
                )}

                <dl className="space-y-1.5 pt-1">
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

                <div className="pt-2 flex items-center justify-between gap-3 text-[11px] font-mono text-muted border-t border-rule/50">
                  <span className="bg-paper px-2 py-0.5 rounded border border-rule/60">PMG p.{ind.page}</span>
                  <CopyLink id={ind.id} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
