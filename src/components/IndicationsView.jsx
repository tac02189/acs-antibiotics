import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Link as LinkIcon, Check, Bone, Thermometer, ArrowRight } from "lucide-react";
import { drugs, indications, sections } from "../data/pmg.js";
import { altText, searchIndications, tokens } from "../lib/search.js";
import { Lines, Regimen, RegimenInline, prefersReducedMotion } from "./shared.jsx";

// Queries that belong to another view. Matched on whole tokens.
const CROSS_LINKS = [
  {
    to: "/fractures",
    icon: Bone,
    title: "Open extremity fractures",
    blurb: "Gustilo-Anderson type → regimen, within 30 min of ED arrival.",
    words: ["fracture", "fractures", "fx", "gustilo", "open", "orthopedic", "ortho", "tibia", "femur", "cefepime", "maxipime"],
  },
  {
    to: "/workup",
    icon: Thermometer,
    title: "Fever workup",
    blurb: "Suspected pneumonia, central line or UTI — what the PMG says to send before antibiotics.",
    words: ["fever", "workup", "febrile", "temp", "culture", "cultures", "bal", "urinalysis", "ua", "cvc"],
  },
];

// The PDF's own column header, kept verbatim. The column mixes penicillin-
// allergy regimens with contamination escalation, MRSA add-ons and one
// clindamycin note, so the UI never calls it simply "the allergy regimen".
const ALT_LABEL = "PNC allergy / alternative";

export default function IndicationsView({ query, onQuery, pcn, route, navigate }) {
  const [open, setOpen] = useState(() => new Set());
  const focusedOnce = useRef(null);

  const results = useMemo(() => searchIndications(indications, query, drugs), [query]);
  const searching = tokens(query).length > 0;
  const sectionKnown = !route.section || sections.some((s) => s.id === route.section);

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
  // focus — once per id, and only once the card actually exists in the DOM
  // (App clears any search first; this effect re-runs when results change).
  useEffect(() => {
    if (!route.focus) {
      focusedOnce.current = null;
      return;
    }
    if (focusedOnce.current === route.focus) return;
    const el = document.getElementById(`i-${route.focus}`);
    if (!el) return;
    focusedOnce.current = route.focus;
    setOpen((prev) => new Set(prev).add(route.focus));
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start", behavior });
      el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [route.focus, results]);

  // A narrow search opens its results, so the answer is one glance away.
  const autoOpen = searching && total <= 3;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      {!searching && !route.section && (
        <p className="text-sm text-muted mb-4 text-balance">
          Regimen, dose, duration, redosing and the PMG's <span className="font-medium text-ink">“{ALT_LABEL}”</span> column
          for every indication. That column holds penicillin-allergy regimens but also contamination escalation and
          MRSA add-ons — read each note's condition. Tap a row to expand it.
        </p>
      )}

      {route.section && (
        <button type="button" onClick={() => navigate("/")} className="mb-3 text-sm font-medium text-muted hover:text-ink">
          ← All sections
        </button>
      )}

      {!sectionKnown && (
        <div className="rounded-xl border border-dashed border-rule p-6 text-center text-sm text-muted">
          No section called “{route.section}”.{" "}
          <a className="underline" href="#/">
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
              className="rise flex items-center gap-3 rounded-xl border border-gold/60 bg-gold/10 px-3.5 py-3 hover:bg-gold/20 transition-colors"
            >
              <Icon className="size-5 shrink-0 text-deepgold dark:text-gold" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[15px]">{title}</span>
                <span className="block text-sm text-muted">{blurb}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}

      {searching && sectionKnown && (
        <p className="eyebrow text-muted mb-3" role="status">
          {total === 0 ? "No indications match" : `${total} match${total === 1 ? "" : "es"}`}
          {route.section ? " in this section" : ""}
          {" · "}
          <span className="normal-case tracking-normal font-normal">“{query}”</span>
        </p>
      )}

      {sectionKnown && total === 0 && crossLinks.length === 0 && (
        <div className="rounded-xl border border-dashed border-rule p-6 text-center text-sm text-muted">
          Nothing in the PMG tables matches. Try the diagnosis as the PMG names it (e.g. “cholecystitis”, “SBO”), a
          drug (“Zosyn”, “cefazolin”), or check{" "}
          <a className="underline" href="#/fractures">
            Open fractures
          </a>
          .
        </div>
      )}

      <div className="space-y-8">
        {visibleSections.map(({ section, items }, gi) => (
          <section key={section.id} style={{ "--hue": `var(--hue-${section.hue})` }} aria-labelledby={`sec-${section.id}`}>
            <header className="flex items-end justify-between gap-3 mb-2.5 rise" style={{ animationDelay: `${gi * 60}ms` }}>
              <div className="min-w-0">
                <h2 id={`sec-${section.id}`} className="font-display font-semibold text-[21px] leading-tight tracking-tight">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-hue mr-2 align-[0.05em]" aria-hidden="true" />
                  {section.title}
                </h2>
                {!searching && <p className="text-[13px] text-muted mt-0.5">{section.blurb}</p>}
              </div>
              <span className="font-mono text-[11px] text-muted whitespace-nowrap mb-1">
                {items.length} · p.{section.page}
              </span>
            </header>
            <ol className="space-y-2">
              {items.map((ind, i) => (
                <li key={ind.id}>
                  <IndicationCard
                    ind={ind}
                    open={autoOpen || open.has(ind.id)}
                    onToggle={() => toggle(ind.id)}
                    pcn={pcn}
                    delay={Math.min(i, 8) * 35 + gi * 60}
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
    <span className="block mt-1 text-[13.5px] leading-snug">
      {ind.regimen ? <RegimenInline regimen={ind.regimen} /> : <span className="text-muted">N/A — no antibiotic listed</span>}
      {pcn && ind.regimen && (
        <span className="block mt-1 text-deepgold dark:text-gold font-medium">
          <span className="eyebrow mr-1.5">{ALT_LABEL}</span>
          {alt || "N/A"}
        </span>
      )}
    </span>
  );
}

function Field({ label, children, highlight = false }) {
  return (
    <div className={`grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 py-2 ${highlight ? "bg-gold/15 -mx-2 px-2 rounded-md" : ""}`}>
      <dt className={`eyebrow pt-0.5 ${highlight ? "text-deepgold dark:text-gold" : "text-muted"}`}>{label}</dt>
      <dd className="text-[14px] leading-snug min-w-0">{children}</dd>
    </div>
  );
}

function CopyLink({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#/i/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable: the href still works as a plain link.
      window.location.hash = `/i/${id}`;
    }
  };
  return (
    <a href={`#/i/${id}`} onClick={copy} className="inline-flex items-center gap-1 hover:text-ink">
      {copied ? <Check className="size-3" aria-hidden="true" /> : <LinkIcon className="size-3" aria-hidden="true" />}
      {copied ? "copied" : "copy link"}
    </a>
  );
}

export function IndicationCard({ ind, open, onToggle, pcn, delay = 0, onDrug }) {
  const na = !ind.regimen;

  return (
    <article
      id={`i-${ind.id}`}
      tabIndex={-1}
      className="rise rounded-xl border border-rule bg-card shadow-card overflow-hidden scroll-mt-32 focus:outline-none focus-visible:outline"
      style={{ animationDelay: `${delay}ms` }}
    >
      {na ? (
        <div className="flex items-stretch">
          <span className="w-1.5 shrink-0 bg-hue/40" aria-hidden="true" />
          <div className="flex-1 min-w-0 px-3.5 py-3 flex items-baseline justify-between gap-3">
            <span>
              <span className="block font-semibold text-[15px] leading-snug">{ind.short}</span>
              <span className="block mt-0.5 text-[13px] text-muted">N/A in every column — no antibiotic listed</span>
            </span>
            <span className="font-mono text-[11px] text-muted whitespace-nowrap">p.{ind.page}</span>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`d-${ind.id}`}
            className="w-full text-left flex items-stretch"
          >
            <span className="w-1.5 shrink-0 bg-hue" aria-hidden="true" />
            <span className="flex-1 min-w-0 px-3.5 py-3">
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-[15px] leading-snug">{ind.short}</span>
                <ChevronDown
                  className={`size-4 shrink-0 mt-1 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
              {!open && <RegimenSummary ind={ind} pcn={pcn} />}
            </span>
          </button>

          <div className="expand" data-open={open} id={`d-${ind.id}`}>
            {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
            <div inert={open ? undefined : ""} aria-hidden={!open}>
              <div className="px-3.5 pb-3.5 pl-5">
                {ind.name !== ind.short && (
                  <p className="text-[12px] text-muted leading-snug mb-2">
                    <span className="eyebrow mr-1.5">PMG row</span>
                    {ind.name}
                  </p>
                )}
                <Regimen regimen={ind.regimen} onDrug={onDrug} />
                {ind.regimenNote && <p className="mt-2 text-[13px] italic text-muted">{ind.regimenNote}</p>}

                <dl className="mt-3 divide-y divide-rule/70">
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

                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-mono text-muted">
                  <span>PMG p.{ind.page}</span>
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
