import { useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { dosingTable, drugs, indications, openFractures, sections } from "../data/pmg.js";
import { altText, norm } from "../lib/search.js";
import { Card, Eyebrow, Lines, RegimenInline, fmtDose } from "./shared.jsx";

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
    const raf = requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: "auto" }));
    return () => cancelAnimationFrame(raf);
  }, [drug]);

  return (
    <div className="space-y-6">
      <header className="rise border-b border-rule/60 pb-3">
        <Eyebrow>Every agent named in the PMG tables</Eyebrow>
        <h1 className="font-display font-bold text-[26px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-ink flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-accent shrink-0" aria-hidden="true" />
          By drug
        </h1>
        <p className="text-sm text-soft mt-1 text-balance">
          Tap a drug to see every regimen it is part of (shown whole, with its partners), the rows whose
          “PNC Allergy/Alternative” column names it, and its dosing-table entry. Brand names and drug classes
          are app-authored search aids, not from the PMG.
        </p>
      </header>

      <ol className="space-y-2.5">
        {index.map((d, i) => {
          const open = drug != null && norm(drug) === norm(d.name);
          const uses = d.primary.length + d.alternative.length + d.fracture.length;
          return (
            <Card
              as="li"
              key={d.name}
              id={`drug-${norm(d.name)}`}
              className="rise overflow-hidden scroll-mt-36"
              style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => navigate(open ? "/drugs" : `/drugs/${encodeURIComponent(d.name)}`, { replace: true })}
                className="w-full text-left px-3.5 py-3.5 flex items-start justify-between gap-3 min-h-[52px] hover:bg-well/50 active:bg-well transition-colors group focus-visible:outline-offset-[-2px]"
              >
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display font-bold text-[16px] sm:text-[17px] text-ink uppercase group-hover:text-accent-hi transition-colors">
                      {d.name}
                    </span>
                    <span className="font-mono text-[12px] text-muted">· {d.meta.brand}</span>
                  </span>
                  <span className="flex items-center gap-2 mt-1 text-[12px] font-mono text-muted flex-wrap">
                    <span>{d.meta.class}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-accent">
                      {uses} use{uses === 1 ? "" : "s"}
                    </span>
                    {d.dosing && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-dose font-bold">dosing table</span>
                      </>
                    )}
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 mt-1 text-muted transition-transform duration-200 ${open ? "rotate-180 text-accent" : "group-hover:text-ink"}`}
                  aria-hidden="true"
                />
              </button>

              <div className="expand" data-open={open}>
                <div inert={open ? undefined : ""} aria-hidden={!open}>
                  <div className="px-3.5 pb-4 pt-1 space-y-3 text-[14px] bg-well/40 border-t border-rule/60">
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
                      <div className="p-3 rounded bg-paper/60 border border-rule/70">
                        <div className="eyebrow text-signal-red mb-2 text-[10px] flex items-center justify-between">
                          <span>Open fractures</span>
                          <a href="#/fractures" className="font-mono text-[11px] underline text-accent hover:text-accent-hi normal-case tracking-normal font-bold py-2 -my-2 px-1">
                            p.3–4 →
                          </a>
                        </div>
                        <ul className="divide-y divide-rule/60">
                          {d.fracture.map((a) => (
                            <li key={a.id} className="py-1.5">
                              <div className="text-[13px] text-muted">{a.applies}</div>
                              <div className="font-mono text-[13px] leading-snug">
                                {a.regimen.map((r, ri) => (
                                  <span key={ri}>
                                    {ri > 0 && <span className="text-muted"> + </span>}
                                    <span className={r.drug === d.name ? "font-bold text-dose" : "text-soft"}>
                                      {r.drug}
                                      {r.footnote && fn[r.footnote] ? <sup className="text-hazard-amber">{fn[r.footnote].mark}</sup> : null}{" "}
                                      {fmtDose(r.dose)} {r.route ? r.route + " " : ""}
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
                      <div className="p-3 rounded bg-paper/60 border border-rule/70">
                        <div className="eyebrow text-accent mb-2 text-[10px] flex items-center justify-between">
                          <span>Dosing table</span>
                          <a href="#/dosing" className="font-mono text-[11px] underline text-accent hover:text-accent-hi normal-case tracking-normal font-bold py-2 -my-2 px-1">
                            p.4 →
                          </a>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          <div className="rounded bg-well p-2.5 border border-rule/60">
                            <div className="eyebrow text-muted mb-1 text-[10px]">{dosingTable.adultLabel}</div>
                            {d.dosing.adult.map((l) => (
                              <div key={l} className="font-mono text-[14px] font-bold text-dose tabular-nums break-words">
                                {l}
                              </div>
                            ))}
                          </div>
                          <div className="rounded bg-well p-2.5 border border-rule/60">
                            <div className="eyebrow text-muted mb-1 text-[10px]">{dosingTable.pediatricLabel}</div>
                            {d.dosing.pediatric.map((l) => (
                              <div key={l} className="font-mono text-[14px] font-bold text-dose tabular-nums break-words">
                                {l}
                              </div>
                            ))}
                          </div>
                        </div>
                        {d.dosing.footnote && fn[d.dosing.footnote] && (
                          <p className="mt-2 text-[12px] font-mono text-muted leading-snug">
                            <span className="text-hazard-amber font-bold">{fn[d.dosing.footnote].mark}</span> {fn[d.dosing.footnote].text}
                          </p>
                        )}
                      </div>
                    )}

                    {uses === 0 && !d.dosing && <p className="text-muted font-mono text-xs">Named only in passing.</p>}
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
    <div className="p-3 rounded bg-paper/60 border border-rule/70">
      <div className="eyebrow text-accent mb-2 text-[10px]">{title}</div>
      <ul className="divide-y divide-rule/60">
        {items.map((ind) => (
          <li key={ind.id} className="py-1.5" style={{ "--hue": `var(--hue-${bySection[ind.section].hue})` }}>
            <a href={`#/i/${ind.id}`} className="block min-w-0 py-1.5 text-ink hover:text-accent-hi font-medium">
              <span className="inline-block size-2 rounded-sm mr-2 align-[0.05em] bg-hue" aria-hidden="true" />
              {ind.short}
            </a>
            <div className="text-[13px] leading-snug mt-1 text-soft">{render(ind)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
