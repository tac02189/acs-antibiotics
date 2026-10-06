import { useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { dosingTable, drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm } from "../lib/search.js";
import { Card, Eyebrow, Lines, RegimenInline, fmtDose, prefersReducedMotion } from "./shared.jsx";

// Index every drug named in the PMG tables: the regimens it is part of (shown
// whole, with its partners), the rows whose "PNC Allergy/Alternative" column
// names it, its open-fracture use and its dosing-table row.
function buildIndex() {
  const bySection = Object.fromEntries(sections.map((s) => [s.id, s]));
  return Object.entries(drugs)
    .map(([name, meta]) => {
      const key = norm(name);
      const primary = indications.filter((i) => (i.regimen || []).some((r) => r.drug === name));
      const alternative = indications.filter((i) => norm(altText(i)).includes(key));
      const fracture = openFractures.antimicrobial.filter((a) => a.regimen.some((r) => r.drug === name));
      const dosing = dosingTable.rows.find((r) => r.drug === name) || null;
      return { name, meta, primary, alternative, fracture, dosing, bySection };
    })
    .sort(
      (a, b) =>
        b.primary.length + b.alternative.length - (a.primary.length + a.alternative.length) || a.name.localeCompare(b.name)
    );
}

export default function DrugsView({ drug, navigate }) {
  const index = useMemo(buildIndex, []);
  const fn = dosingTable.footnotes;

  useEffect(() => {
    if (!drug) return;
    const el = document.getElementById(`drug-${norm(drug)}`);
    if (!el) return;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const raf = requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior }));
    return () => cancelAnimationFrame(raf);
  }, [drug]);

  return (
    <div className="space-y-4">
      <header className="rise">
        <Eyebrow>Every agent named in the PMG tables</Eyebrow>
        <h1 className="font-display font-semibold text-[26px] leading-tight tracking-tight mt-1">By drug</h1>
        <p className="text-sm text-muted mt-1 text-balance">
          Tap a drug to see every regimen it is part of (shown whole, with its partners), the rows whose
          “PNC Allergy/Alternative” column names it, and its dosing-table entry. Brand names and drug classes
          are app-authored search aids, not from the PMG.
        </p>
      </header>

      <ol className="space-y-2">
        {index.map((d, i) => {
          const open = drug != null && norm(drug) === norm(d.name);
          const uses = d.primary.length + d.alternative.length + d.fracture.length;
          return (
            <Card
              as="li"
              key={d.name}
              id={`drug-${norm(d.name)}`}
              className="rise overflow-hidden scroll-mt-32"
              style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => navigate(open ? "/drugs" : `/drugs/${encodeURIComponent(d.name)}`, { replace: true })}
                className="w-full text-left px-3.5 py-3 flex items-start justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-[15px] leading-snug">
                    {d.name} <span className="font-normal text-muted">· {d.meta.brand}</span>
                  </span>
                  <span className="block text-[13px] text-muted mt-0.5">
                    {d.meta.class} · {uses} use{uses === 1 ? "" : "s"}
                    {d.dosing ? " · dosing table" : ""}
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 mt-1 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <div className="expand" data-open={open}>
                <div inert={open ? undefined : ""} aria-hidden={!open}>
                  <div className="px-3.5 pb-4 space-y-3 text-[14px]">
                    <UseList
                      title="Part of the regimen for"
                      items={d.primary}
                      bySection={d.bySection}
                      render={(ind) => <RegimenInline regimen={ind.regimen} emphasize={d.name} />}
                    />
                    <UseList
                      title="Named in the PNC allergy / alternative column of"
                      items={d.alternative}
                      bySection={d.bySection}
                      render={(ind) => <Lines value={ind.alternative} />}
                    />
                    {d.fracture.length > 0 && (
                      <div>
                        <div className="eyebrow text-muted mb-1">
                          Open fractures ·{" "}
                          <a href="#/fractures" className="underline decoration-dotted underline-offset-4 normal-case tracking-normal font-normal">
                            p.3–4
                          </a>
                        </div>
                        <ul className="divide-y divide-rule/70">
                          {d.fracture.map((a) => (
                            <li key={a.id} className="py-1.5">
                              <div className="text-[13px] text-muted">{a.applies}</div>
                              <div className="font-mono text-[13px] leading-snug">
                                {a.regimen.map((r, i) => (
                                  <span key={i}>
                                    {i > 0 && <span className="text-muted"> + </span>}
                                    <span className={r.drug === d.name ? "font-semibold text-ink" : ""}>
                                      {r.drug}
                                      {r.footnote && fn[r.footnote] ? <sup>{fn[r.footnote].mark}</sup> : null} {fmtDose(r.dose)}{" "}
                                      {r.route ? r.route + " " : ""}
                                      {r.frequency}
                                      {r.note ? `, ${r.note}` : ""}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {d.dosing && (
                      <div>
                        <div className="eyebrow text-muted mb-1">
                          Dosing table ·{" "}
                          <a href="#/dosing" className="underline decoration-dotted underline-offset-4 normal-case tracking-normal font-normal">
                            p.4
                          </a>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div className="rounded-lg bg-ink/[0.04] p-2.5">
                            <div className="eyebrow text-muted mb-1">{dosingTable.adultLabel}</div>
                            {d.dosing.adult.map((l) => (
                              <div key={l} className="font-mono text-[13px]">
                                {l}
                              </div>
                            ))}
                          </div>
                          <div className="rounded-lg bg-ink/[0.04] p-2.5">
                            <div className="eyebrow text-muted mb-1">{dosingTable.pediatricLabel}</div>
                            {d.dosing.pediatric.map((l) => (
                              <div key={l} className="font-mono text-[13px]">
                                {l}
                              </div>
                            ))}
                          </div>
                        </div>
                        {d.dosing.footnote && fn[d.dosing.footnote] && (
                          <p className="mt-1.5 text-[12px] text-muted leading-snug">
                            <span className="font-mono text-deepgold dark:text-gold">{fn[d.dosing.footnote].mark}</span>{" "}
                            {fn[d.dosing.footnote].text}
                          </p>
                        )}
                      </div>
                    )}
                    {uses === 0 && !d.dosing && <p className="text-muted">Named only in passing.</p>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </ol>
    </div>
  );
}

function UseList({ title, items, bySection, render }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="eyebrow text-muted mb-1">{title}</div>
      <ul className="divide-y divide-rule/70">
        {items.map((ind) => (
          <li key={ind.id} className="py-1.5" style={{ "--hue": `var(--hue-${bySection[ind.section].hue})` }}>
            <a href={`#/i/${ind.id}`} className="block min-w-0 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-sm bg-hue mr-1.5 align-[0.1em]" aria-hidden="true" />
              {ind.short}
            </a>
            <div className="text-[13px] leading-snug mt-0.5">{render(ind)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
