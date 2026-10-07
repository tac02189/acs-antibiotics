import { dosingTable as dt, drugs } from "../data/pmg.js";
import { Card, CardHeading, PageHeader, keepUnits } from "./shared.jsx";

export default function DosingView() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Open-fracture antimicrobials · PMG p.4" title="Adult & pediatric dosing">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          The PMG prints this table once, on the open-fracture page. Column headings and footnotes below are the
          PDF's own wording.
        </p>
      </PageHeader>

      <ol className="space-y-3.5">
        {dt.rows.map((row) => {
          const fn = row.footnote ? dt.footnotes[row.footnote] : null;
          const meta = drugs[row.drug];
          return (
            <li key={row.drug} className="rounded-lg border border-rule bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
                <h2 className="text-[18px] font-bold leading-snug text-ink">
                  {row.drug}
                  {fn && <sup className="ml-0.5 font-mono text-[12px] font-bold text-warn-mark">{fn.mark}</sup>}
                </h2>
                {meta && (
                  <span className="text-[12px] font-semibold text-muted bg-well border border-rule-soft px-2 py-0.5 rounded-full">
                    {meta.brand} · {meta.class}
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <DoseBlock label={dt.adultLabel} lines={row.adult} />
                <DoseBlock label={dt.pediatricLabel} lines={row.pediatric} />
              </div>
            </li>
          );
        })}
      </ol>

      <Card className="p-4 text-[13px] leading-snug text-soft">
        <CardHeading title="Footnotes" page={4} />
        <dl className="space-y-2">
          {[dt.footnotes.renal, dt.footnotes.pharmacy].map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1">
              <dt className="font-mono font-bold text-warn-mark">{f.mark}</dt>
              <dd>{keepUnits(f.text)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

function DoseBlock({ label, lines }) {
  return (
    <div className="rounded-lg border border-rule bg-well p-3 flex flex-col justify-between">
      {/* 12px: the adult label carries the PMG's age threshold. */}
      <div className="eyebrow text-[12px] font-bold text-soft mb-2 border-b border-rule-soft pb-1">
        {keepUnits(label)}
      </div>
      <ul className="space-y-1.5">
        {lines.map((l) => (
          <li
            key={l}
            className="font-mono text-[15px] font-bold leading-snug text-ink tabular-nums break-words bg-card rounded-md border border-rule px-2.5 py-1.5 shadow-xs"
          >
            {keepUnits(l)}
          </li>
        ))}
      </ul>
    </div>
  );
}
