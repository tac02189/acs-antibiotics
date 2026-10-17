import { useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { drugs, empiricDosing, indications, openFractures, prophylaxisDosing, sections } from "../data/pmg.js";
import { norm } from "../lib/search.js";
import { AlternativePills, DrugPills, Group, PageHeader, Plate, PlateField, RegimenInline, fmtDose, keepUnits } from "./shared.jsx";

const bySection = Object.fromEntries(sections.map((s) => [s.id, s]));
const FRACTURE_ENTRIES = [...openFractures.selection, ...openFractures.contamination.items].flatMap((e) => [
  { id: e.id, applies: e.applies, regimen: e.regimen },
  ...(e.allergy ? [{ id: `${e.id}-allergy`, applies: `${e.applies} — ${e.allergy.applies}`, regimen: e.allergy.regimen }] : []),
]);

// Index every drug named in the PMG: the indication rows that prefer it (shown
// with their partners), the rows whose alternative column names it, its
// open-fracture regimens, and its rows in the two dosing tables.
function buildIndex() {
  return Object.entries(drugs)
    .map(([name, meta]) => {
      const preferred = indications.filter((i) => (i.preferred || []).includes(name));
      const alternative = indications.filter((i) => (i.alternative || []).some((l) => l.options.flat().includes(name)));
      const fracture = FRACTURE_ENTRIES.filter((e) => e.regimen.some((r) => r.drug === name));
      const prophylaxis = prophylaxisDosing.rows.find((r) => r.drug === name) || null;
      const empiric = empiricDosing.rows.find((r) => r.drug === name) || null;
      return { name, meta, preferred, alternative, fracture, prophylaxis, empiric };
    })
    // Most uses first, counted as the row's "N uses" counts them (open
    // fractures included), then by name.
    .sort((a, b) => uses(b) - uses(a) || a.name.localeCompare(b.name));
}

const uses = (d) => d.preferred.length + d.alternative.length + d.fracture.length;

export default function DrugsView({ drug, navigate }) {
  const index = useMemo(buildIndex, []);

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
      <PageHeader eyebrow="Every agent named in the PMG" title="By drug">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          Tap a drug to see every row that prefers it (shown with its partners), the rows whose allergy-alternative
          column names it, its open-fracture regimens and its dosing-table entries. Brand names and drug classes are
          app-authored search aids, not from the PMG.
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
                      title="Preferred for"
                      items={d.preferred}
                      render={(ind) => <DrugPills drugs={ind.preferred} kind={bySection[ind.section].kind} emphasize={d.name} />}
                    />
                    <UseList
                      title="Named in the allergy-alternative column of"
                      items={d.alternative}
                      render={(ind) => (
                        <AlternativePills alternative={ind.alternative} kind={bySection[ind.section].kind} emphasize={d.name} />
                      )}
                    />

                    {d.fracture.length > 0 && (
                      <Block title="Open fractures" titleClass="text-danger-mark" link={{ href: "#/fractures", label: "See all" }}>
                        <ul className="divide-y divide-rule-soft">
                          {d.fracture.map((a) => (
                            <li key={a.id} className="py-2">
                              <div className="mb-1.5 text-[13px] text-muted">{a.applies}</div>
                              <RegimenInline regimen={a.regimen} emphasize={d.name} />
                            </li>
                          ))}
                        </ul>
                      </Block>
                    )}

                    {d.prophylaxis && (
                      <Block title={prophylaxisDosing.title} link={{ href: "#/dosing", label: "Full table" }}>
                        <Plate className="rounded-lg px-3 py-2.5">
                          <div className="eyebrow text-plate-soft">{prophylaxisDosing.columns.dose}</div>
                          <div className="font-mono text-[15px] font-bold leading-snug text-plate-dose tabular-nums break-words">
                            {d.prophylaxis.dose.map((l, i) => (
                              <span key={i} className="block">
                                {keepUnits(fmtDose(l))}
                              </span>
                            ))}
                          </div>
                          <PlateField label={prophylaxisDosing.columns.redose}>{d.prophylaxis.redose}</PlateField>
                          <PlateField label={prophylaxisDosing.columns.infusion}>{keepUnits(d.prophylaxis.infusion)}</PlateField>
                        </Plate>
                      </Block>
                    )}

                    {d.empiric && (
                      <Block title={empiricDosing.title} link={{ href: "#/dosing", label: "Full table" }}>
                        <Plate className="rounded-lg px-3 py-2.5">
                          <PlateField label={empiricDosing.columns.dose}>{fmtDose(d.empiric.dose)}</PlateField>
                          <div className="grid grid-cols-2 gap-x-3">
                            <PlateField label={empiricDosing.columns.route}>{d.empiric.route}</PlateField>
                            <PlateField label={empiricDosing.columns.frequency}>{d.empiric.frequency}</PlateField>
                          </div>
                        </Plate>
                      </Block>
                    )}
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
          <a
            href={link.href}
            className="shrink-0 normal-case tracking-normal text-[12px] font-semibold text-accent hover:text-accent-hi underline underline-offset-2 py-2 -my-2 px-1"
          >
            {link.label} →
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

// The indications a drug appears in, each under its section's hue dot, with
// the pills beneath.
function UseList({ title, items, render }) {
  if (!items.length) return null;
  return (
    <Block title={title}>
      <ul className="divide-y divide-rule-soft">
        {items.map((ind) => (
          <li key={ind.id} className="py-2.5" style={{ "--hue": `var(--hue-${bySection[ind.section].hue})` }}>
            <a
              href={`#/i/${ind.id}`}
              className="inline-flex items-center gap-2 min-w-0 py-1 text-[15px] font-semibold text-ink hover:text-accent transition-colors"
            >
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
