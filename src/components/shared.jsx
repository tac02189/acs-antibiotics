import { source } from "../data/pmg.js";

// The PDF's filename carries its content hash (see source.file), so a new
// edition is a new URL and no cache — HTTP or service worker — can hand back an
// old copy under it.
export const pdfHref = `/${source.file}`;

// Display only: a thin space between number and unit ("2 g") reads as one token
// in the monospace face without changing the stored PDF wording.
export const fmtDose = (d) => String(d).replace(/(\d) (g|mg)\b/g, "$1 $2");

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function PageTag({ page, children }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
      {children}
      <span>PMG p.{page}</span>
    </span>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <div className={`eyebrow text-muted ${className}`}>{children}</div>;
}

export function Card({ children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`rounded-xl border border-rule bg-card shadow-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A regimen line: drug (with its PDF footnote mark) · dose · frequency, as an
// order would read. `footnotes` resolves a regimen entry's `footnote` key to its
// printed mark ("*", "**").
export function OrderLine({ drug, footnote, dose, frequency, route, note, footnotes, onDrug }) {
  const mark = footnote && footnotes ? footnotes[footnote]?.mark : null;
  const name = (
    <>
      {drug}
      {mark && (
        <sup className="ml-0.5 font-mono text-[12px] text-deepgold dark:text-gold" aria-label={`footnote ${mark}`}>
          {mark}
        </sup>
      )}
    </>
  );
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-3 gap-y-0.5 rounded-lg bg-ink/[0.04] px-3 py-2">
      {onDrug ? (
        <button
          type="button"
          onClick={() => onDrug(drug)}
          className="min-w-0 text-left font-semibold break-words underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-gold"
        >
          {name}
        </button>
      ) : (
        <span className="min-w-0 font-semibold break-words">{name}</span>
      )}
      <span className="font-mono text-[15px] font-semibold tabular-nums text-right break-words sm:whitespace-nowrap">
        {fmtDose(dose)}
        {route ? <span className="ml-1.5 text-xs font-medium text-muted">{route}</span> : null}
      </span>
      <span className="col-span-2 sm:col-span-1 justify-self-start sm:justify-self-end font-mono text-xs uppercase tracking-wide text-muted">
        {frequency}
        {note ? <span className="normal-case tracking-normal"> · {note}</span> : null}
      </span>
    </div>
  );
}

export function Plus() {
  return (
    <div className="eyebrow text-muted pl-3 py-0.5" aria-label="plus">
      plus
    </div>
  );
}

export function Regimen({ regimen, footnotes, onDrug }) {
  return (
    <ol className="space-y-0.5">
      {regimen.map((r, i) => (
        <li key={i}>
          {i > 0 && <Plus />}
          <OrderLine {...r} footnotes={footnotes} onDrug={onDrug} />
        </li>
      ))}
    </ol>
  );
}

// One-line summary of a regimen: "Cefazolin 2 g Q8H + Metronidazole 500 mg Q12H".
export function RegimenInline({ regimen, emphasize }) {
  return (
    <span className="text-muted">
      {regimen.map((r, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 text-muted/70">+</span>}
          <span className={`text-ink ${emphasize === r.drug ? "font-semibold" : "font-medium"}`}>{r.drug}</span>{" "}
          <span className="font-mono whitespace-nowrap">{fmtDose(r.dose)}</span>{" "}
          <span className="font-mono uppercase text-xs">{r.frequency}</span>
        </span>
      ))}
    </span>
  );
}

export function Lines({ value, muted = ["or", "OR", "+/-", "plus"] }) {
  if (value == null) return <span className="text-muted">N/A</span>;
  const lines = Array.isArray(value) ? value : [value];
  if (lines.length === 1) return <span>{lines[0]}</span>;
  return (
    <ul className="space-y-0.5">
      {lines.map((l, i) => (
        <li key={i} className={muted.includes(l) ? "eyebrow text-muted" : ""}>
          {l}
        </li>
      ))}
    </ul>
  );
}
