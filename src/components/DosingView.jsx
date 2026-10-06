import { dosingTable as dt, drugs } from "../data/pmg.js";
import { Card, Eyebrow, PageTag, keepUnits } from "./shared.jsx";

export default function DosingView() {
  return (
    <div className="space-y-6">
      <header className="rise border-b border-rule/60 pb-3">
        <Eyebrow>Open-fracture antimicrobials · PMG p.4</Eyebrow>
        <h1 className="font-display font-bold text-[24px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-ink flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-accent shrink-0" aria-hidden="true" />
          Adult &amp; pediatric dosing
        </h1>
        <p className="text-[14px] leading-snug text-soft mt-1.5">
          The PMG prints this table once, on the open-fracture page. Column headings and footnotes below are the
          PDF's own wording.
        </p>
      </header>

      <ol className="space-y-3">
        {dt.rows.map((row, i) => {
          const fn = row.footnote ? dt.footnotes[row.footnote] : null;
          const meta = drugs[row.drug];
          return (
            <Card as="li" key={row.drug} className="rise p-4 sm:p-5" style={{ animationDelay: `${40 + i * 35}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-3 border-b border-rule/60 pb-2 mb-3">
                <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink flex items-center gap-1.5">
                  {row.drug}
                  {fn && <sup className="text-hazard-amber font-mono font-bold text-[14px]">{fn.mark}</sup>}
                </h2>
                {meta && (
                  <span className="font-mono text-[12px] text-accent-hi truncate bg-paper px-2 py-0.5 rounded border border-rule/60">
                    {meta.brand} · {meta.class}
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <DoseBlock label={dt.adultLabel} lines={row.adult} accent />
                <DoseBlock label={dt.pediatricLabel} lines={row.pediatric} />
              </div>
            </Card>
          );
        })}
      </ol>

      <Card className="rise p-4 sm:p-5 text-[13px] leading-snug text-soft" style={{ animationDelay: "240ms" }}>
        <div className="flex items-baseline justify-between gap-3 mb-3 border-b border-rule/60 pb-2">
          <span className="eyebrow text-accent">Footnotes</span>
          <PageTag page={4} />
        </div>
        <p className="flex items-start gap-2">
          <span className="font-mono font-bold text-hazard-amber shrink-0">{dt.footnotes.renal.mark}</span>
          <span>{keepUnits(dt.footnotes.renal.text)}</span>
        </p>
        <p className="mt-2 flex items-start gap-2">
          <span className="font-mono font-bold text-hazard-amber shrink-0">{dt.footnotes.pharmacy.mark}</span>
          <span>{keepUnits(dt.footnotes.pharmacy.text)}</span>
        </p>
      </Card>
    </div>
  );
}

function DoseBlock({ label, lines, accent = false }) {
  return (
    <div className="rounded-lg bg-well p-3 border border-rule flex flex-col shadow-inner">
      {/* 12px: the adult label carries the PMG's age threshold. */}
      <div className={`eyebrow text-[12px] mb-2 ${accent ? "text-accent" : "text-muted"}`}>{keepUnits(label)}</div>
      <ul className="space-y-1.5">
        {lines.map((l) => (
          <li
            key={l}
            className="font-mono text-[15px] font-bold text-dose leading-snug tabular-nums bg-readout/80 px-2.5 py-1.5 rounded border border-rule/60 break-words"
          >
            {keepUnits(l)}
          </li>
        ))}
      </ul>
    </div>
  );
}
