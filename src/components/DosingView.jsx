import { Info } from "lucide-react";
import { empiricDosing as ed, prophylaxisDosing as pd, redosingRules } from "../data/pmg.js";
import { CollapsibleCard, ExpandAll, PageHeader, Plate, ToneCard, fmtDose, keepUnits } from "./shared.jsx";

// The October 2026 PMG prints two dosing tables (v0.8.0): surgical prophylaxis
// on page 3, with the re-dosing rules beside it, and empiric therapy on page 4,
// with a footnote. Each table, and each list of rules, is a card that
// collapses, all starting collapsed (v0.7.7); the footnote stays open.
const KEYS = ["dosing:prophylaxis", ...redosingRules.map((_, i) => `dosing:rules-${i}`), "dosing:empiric"];

// One row's grid: on phones the drug takes a line of its own and its three
// cells sit under the three headers; from `sm` the drug is the first of four
// columns, as the PDF prints it.
const GRID = "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-3";

// A cell of words ("Not recommended", "IV or PO/per tube", "Pharmacy to dose")
// is set in the sans face: in the mono face "recommended" did not fit a phone's
// column and broke mid-word. Numbers and doses stay mono.
const wordy = (c) => typeof c === "string" && /[A-Za-z]{4,}/.test(c);

// A dosing table on the plate: the PDF's column headers once, then a row per
// drug, the drug in white and its cells in gold mono, as every medication in
// the app is drawn. Table semantics come from ARIA roles, since the drug cell
// moves to a line of its own on phones.
function DosingTable({ label, headers, rows }) {
  return (
    <Plate className="rounded-lg px-3 py-2" role="table" aria-label={label}>
      <div role="rowgroup">
        <div role="row" className={`${GRID} items-end pb-2 border-b border-plate-soft/40`}>
          {/* The drug column's header stands over the drug line from `sm`; on phones the
              drug line has no column, so the header is there for screen readers only. */}
          <span role="columnheader" className="sr-only sm:not-sr-only eyebrow text-plate-soft">
            {headers[0]}
          </span>
          {headers.slice(1).map((h) => (
            <span key={h} role="columnheader" className="eyebrow text-plate-soft break-words">
              {h}
            </span>
          ))}
        </div>
      </div>
      <div role="rowgroup" className="divide-y divide-plate-soft/25">
        {rows.map((r) => (
          <div key={r.drug} role="row" className={`${GRID} gap-y-0.5 py-2`}>
            <span role="rowheader" className="col-span-3 sm:col-span-1 text-[15px] font-bold leading-snug text-plate-ink break-words">
              {r.drug}
            </span>
            {r.cells.map((c, i) => (
              <span
                key={i}
                role="cell"
                className={`${
                  wordy(c) ? "font-sans" : "font-mono tabular-nums"
                } text-[14px] font-bold leading-snug text-plate-dose break-words`}
              >
                {c}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Plate>
  );
}

export default function DosingView() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dosing tables" title="Dosing">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          The PMG prints two dosing tables: one for surgical prophylaxis and one for empiric therapy of acute
          infections. Table titles, column headings and notes below are the PDF's own wording.
        </p>
      </PageHeader>

      <ExpandAll keys={KEYS} />

      <CollapsibleCard id="dosing:prophylaxis" title={pd.title}>
        <DosingTable
          label={pd.title}
          headers={[pd.columns.drug, pd.columns.dose, pd.columns.redose, pd.columns.infusion]}
          rows={pd.rows.map((r) => ({
            drug: r.drug,
            cells: [
              r.dose.map((l, i) => (
                <span key={i} className="block">
                  {keepUnits(fmtDose(l))}
                </span>
              )),
              r.redose,
              keepUnits(r.infusion),
            ],
          }))}
        />
      </CollapsibleCard>

      {redosingRules.map((g, i) => (
        <CollapsibleCard key={g.heading} id={`dosing:rules-${i}`} title={g.heading}>
          <ul className="space-y-2 text-[15px] leading-snug text-prose">
            {g.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-faint" aria-hidden="true" />
                <span>{keepUnits(it)}</span>
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      ))}

      <CollapsibleCard id="dosing:empiric" title={ed.title}>
        <DosingTable
          label={ed.title}
          headers={[ed.columns.drug, ed.columns.dose, ed.columns.route, ed.columns.frequency]}
          rows={ed.rows.map((r) => ({ drug: r.drug, cells: [fmtDose(r.dose), r.route, r.frequency] }))}
        />
      </CollapsibleCard>

      {/* Not collapsible: it qualifies every dose in the empiric table. */}
      <ToneCard tone="neutral" className="flex items-start gap-2 text-[13px] leading-snug">
        <Info className="size-4 shrink-0 mt-px text-muted" aria-hidden="true" />
        <p className="italic">{ed.footnote}</p>
      </ToneCard>
    </div>
  );
}
