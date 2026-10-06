import { dosingTable as dt, drugs } from "../data/pmg.js";
import { Card, Eyebrow, PageTag } from "./shared.jsx";

export default function DosingView() {
  return (
    <div className="space-y-5">
      <header className="rise">
        <Eyebrow>Open-fracture antimicrobials · PMG p.4</Eyebrow>
        <h1 className="font-display font-semibold text-[26px] leading-tight tracking-tight mt-1">
          Adult &amp; pediatric dosing
        </h1>
        <p className="text-sm text-muted mt-1 text-balance">
          The PMG prints this table once, on the open-fracture page. Adult means age ≥15 years. Vancomycin is
          always ordered as “Pharmacy to Dose”.
        </p>
      </header>

      <ol className="space-y-3">
        {dt.rows.map((row, i) => {
          const fn = row.footnote ? dt.footnotes[row.footnote] : null;
          const meta = drugs[row.drug];
          return (
            <Card as="li" key={row.drug} className="rise p-4" style={{ animationDelay: `${60 + i * 50}ms` }}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display font-semibold text-[19px] tracking-tight">
                  {row.drug}
                  {fn && <sup className="ml-0.5 text-deepgold dark:text-gold font-mono text-[12px]">{fn.mark}</sup>}
                </h2>
                {meta && <span className="text-[12px] text-muted truncate">{meta.brand} · {meta.class}</span>}
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <DoseBlock label={dt.adultLabel} lines={row.adult} />
                <DoseBlock label={dt.pediatricLabel} lines={row.pediatric} />
              </div>
            </Card>
          );
        })}
      </ol>

      <Card className="rise p-4 text-[13px] leading-snug text-muted" style={{ animationDelay: "300ms" }}>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="eyebrow">Footnotes</span>
          <PageTag page={4} />
        </div>
        <p>
          <span className="font-mono text-deepgold dark:text-gold">{dt.footnotes.renal.mark}</span> {dt.footnotes.renal.text}
        </p>
        <p className="mt-1.5">
          <span className="font-mono text-deepgold dark:text-gold">{dt.footnotes.pharmacy.mark}</span> {dt.footnotes.pharmacy.text}
        </p>
      </Card>
    </div>
  );
}

function DoseBlock({ label, lines }) {
  return (
    <div className="rounded-lg bg-ink/[0.04] p-3">
      <div className="eyebrow text-muted mb-1.5">{label}</div>
      <ul className="space-y-1">
        {lines.map((l) => (
          <li key={l} className="font-mono text-[14px] leading-snug tabular-nums">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
