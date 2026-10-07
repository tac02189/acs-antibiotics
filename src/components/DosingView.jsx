import { dosingTable as dt, drugs } from "../data/pmg.js";
import { Card, CardHeading, DosePlate, Group, PageHeader, keepUnits } from "./shared.jsx";

export default function DosingView() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Open-fracture antimicrobials · PMG p.4" title="Adult & pediatric dosing">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          The PMG prints this table once, on the open-fracture page. Column headings and footnotes below are the
          PDF's own wording.
        </p>
      </PageHeader>

      <Group as="ol">
        {dt.rows.map((row) => {
          const fn = row.footnote ? dt.footnotes[row.footnote] : null;
          const meta = drugs[row.drug];
          return (
            <li key={row.drug} className="px-3.5 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2.5">
                <h2 className="text-[18px] font-bold leading-snug text-ink">
                  {row.drug}
                  {fn && <sup className="ml-0.5 font-mono text-[12px] font-bold text-warn-mark">{fn.mark}</sup>}
                </h2>
                {meta && (
                  <span className="text-[12px] text-muted">
                    {meta.brand} · {meta.class}
                  </span>
                )}
              </div>
              {/* The two PDF columns, each on a plate. */}
              <div className="grid sm:grid-cols-2 gap-2.5">
                <DosePlate label={dt.adultLabel} lines={row.adult} />
                <DosePlate label={dt.pediatricLabel} lines={row.pediatric} />
              </div>
            </li>
          );
        })}
      </Group>

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
