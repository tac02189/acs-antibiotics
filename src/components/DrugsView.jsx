import { useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { dosingTable, drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm } from "../lib/search.js";
import { DosePlate, Group, Lines, PageHeader, RegimenInline, keepUnits } from "./shared.jsx";

// Index every drug named in the PMG tables: the regimens it is part of (shown
// whole, with its partners), the rows whose "PNC Allergy/Alternative" column
// names it, the rows whose duration names it (by generic or brand: abdominal
// trauma's "consider monotherapy Zosyn"), its open-fracture use and its
// dosing-table row.
function buildIndex() {
  const bySection = Object.fromEntries(sections.map((s) => [s.id, s]));
  return Object.entries(drugs)
    .map(([name, meta]) => {
      const key = norm(name);
      const primary = indications.filter((i) => (i.regimen || []).some((r) => r.drug === name));
      const alternative = indications.filter((i) => norm(altText(i)).includes(key));
      const brand = meta.brand ? norm(meta.brand) : null;
      const duration = indications.filter(
        (i) =>
          !primary.includes(i) &&
          (i.duration || []).some((t) => norm(t).includes(key) || (brand && norm(t).includes(brand)))
      );
      const fracture = openFractures.antimicrobial.filter((a) => a.regimen.some((r) => r.drug === name));
      const dosing = dosingTable.rows.find((r) => r.drug === name) || null;
      return { name, meta, primary, alternative, duration, fracture, dosing, bySection };
    })
    // Most uses first, counted as the row's "N uses" counts them (open
    // fractures included), then by name.
    .sort((a, b) => uses(b) - uses(a) || a.name.localeCompare(b.name));
}

const uses = (d) => d.primary.length + d.alternative.length + d.duration.length + d.fracture.length;

export default function DrugsView({ drug, navigate }) {
  const index = useMemo(buildIndex, []);
  const fn = dosingTable.footnotes;

  useEffect(() => {
    if (!drug) return;
    const el = document.getElementById(`drug-${norm(drug)}`);
    if (!el) return;
    // Focus follows: arriving from a drug name in another view, the control that
    // was focused has gone with that view (Codex whole-codebase review, 2026-10-14).
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start", behavior: "auto" });
      el.querySelector("button")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [drug]);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Every agent named in the PMG tables" title="By drug">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          Tap a drug to see every regimen it is part of (shown whole, with its partners), the rows whose
          “PNC Allergy/Alternative” column or duration names it, and its dosing-table entry. Brand names and drug classes
          are app-authored search aids, not from the PMG.
        </p>
      </PageHeader>

      <Group as="ol">
        {index.map((d) => {
          const open = drug != null && norm(drug) === norm(d.name);
          const n = uses(d);
          return (
            <li key={d.name} id={`drug-${norm(d.name)}`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => navigate(open ? "/drugs" : `/drugs/${encodeURIComponent(d.name)}`, { replace: true })}
                className="group w-full text-left px-3.5 py-3.5 flex items-start justify-between gap-3 min-h-[56px] hover:bg-well transition-colors focus-visible:outline-offset-[-2px]"
              >
                <span className="min-w-0">
                  <span className="flex items-baseline gap-x-2 flex-wrap">
                    <span className="text-[18px] font-bold leading-snug text-ink">{d.name}</span>
                    <span className="text-[13px] text-muted">{d.meta.brand}</span>
                  </span>
                  <span className="flex items-center gap-2 mt-0.5 text-[13px] text-muted flex-wrap">
                    <span>{d.meta.class}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-soft">
                      {n} use{n === 1 ? "" : "s"}
                    </span>
                    {d.dosing && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-accent">dosing table</span>
                      </>
                    )}
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 mt-1.5 text-muted transition-transform duration-200 group-hover:text-prose ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <div className="expand" data-open={open}>
                <div inert={open ? undefined : ""} aria-hidden={!open}>
                  <div className="px-3.5 pt-3 pb-3.5 space-y-3 text-[14px] bg-well border-t border-rule">
                    <UseList
                      title="Part of the regimen for"
                      items={d.primary}
                      bySection={d.bySection}
                      render={(ind) => (
                        <>
                          <RegimenInline regimen={ind.regimen} emphasize={d.name} />
                          {/* As on the indication card: the perforated-ulcer antifungal note was
                              missing here (Codex whole-codebase review, 2026-10-14). */}
                          {ind.regimenNote && (
                            <p className="mt-1.5 text-[13px] italic leading-snug text-soft">{keepUnits(ind.regimenNote)}</p>
                          )}
                        </>
                      )}
                    />
                    <UseList
                      title="Named in the PNC allergy / alternative column of"
                      items={d.alternative}
                      bySection={d.bySection}
                      render={(ind) => <Lines value={ind.alternative} />}
                    />
                    <UseList
                      title="Named in the duration of"
                      items={d.duration}
                      bySection={d.bySection}
                      render={(ind) => <Lines value={ind.duration} />}
                    />

                    {d.fracture.length > 0 && (
                      <Block
                        title="Open fractures"
                        titleClass="text-danger-mark"
                        link={{ href: "#/fractures", label: "See all" }}
                      >
                        <ul className="divide-y divide-rule-soft">
                          {d.fracture.map((a) => (
                            <li key={a.id} className="py-2">
                              <div className="mb-1.5 text-[13px] text-muted">{a.applies}</div>
                              <RegimenInline regimen={a.regimen} emphasize={d.name} footnotes={fn} />
                            </li>
                          ))}
                        </ul>
                      </Block>
                    )}

                    {d.dosing && (
                      <Block title="Dosing table" link={{ href: "#/dosing", label: "Full table" }}>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          <DosePlate label={dosingTable.adultLabel} lines={d.dosing.adult} />
                          <DosePlate label={dosingTable.pediatricLabel} lines={d.dosing.pediatric} />
                        </div>
                        {d.dosing.footnote && fn[d.dosing.footnote] && (
                          <p className="mt-2 text-[12px] leading-snug text-muted">
                            <span className="font-mono font-bold text-warn-mark">{fn[d.dosing.footnote].mark}</span>{" "}
                            {keepUnits(fn[d.dosing.footnote].text)}
                          </p>
                        )}
                      </Block>
                    )}

                    {n === 0 && !d.dosing && <p className="text-[13px] text-muted">Named only in passing.</p>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </Group>
    </div>
  );
}

// A titled block inside an expanded row, with an optional link to the full view on the right.
function Block({ title, titleClass = "text-accent", link, children }) {
  return (
    <div className="rounded-lg border border-rule bg-card p-3">
      <div className={`eyebrow mb-2 flex items-center justify-between gap-3 ${titleClass}`}>
        <span>{title}</span>
        {link && (
          <a href={link.href} className="normal-case tracking-normal text-[12px] font-semibold text-accent hover:text-accent-hi underline underline-offset-2 py-2 -my-2 px-1">
            {link.label} →
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

// The indications a drug appears in, each under its section's hue dot, with
// the regimen (or the alternative-column text) beneath.
function UseList({ title, items, bySection, render }) {
  if (!items.length) return null;
  return (
    <Block title={title}>
      <ul className="divide-y divide-rule-soft">
        {items.map((ind) => (
          <li key={ind.id} className="py-2.5" style={{ "--hue": `var(--hue-${bySection[ind.section].hue})` }}>
            <a href={`#/i/${ind.id}`} className="inline-flex items-center gap-2 min-w-0 py-1 text-[15px] font-semibold text-ink hover:text-accent transition-colors">
              <span className="size-2.5 rounded-sm bg-hue shrink-0" aria-hidden="true" />
              {/* The dot is colour only; the section's name is there for readers who do not
                  see it (Gemini review, 2026-10-07). */}
              <span className="sr-only">{bySection[ind.section].title}: </span>
              {ind.short}
            </a>
            <div className="mt-1 text-[14px] leading-snug text-soft">{render(ind)}</div>
          </li>
        ))}
      </ul>
    </Block>
  );
}
