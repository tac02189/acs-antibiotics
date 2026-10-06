import { ExternalLink, ImageIcon } from "lucide-react";
import { feverWorkup as fw } from "../data/pmg.js";
import { Card, Eyebrow, PageTag, pdfHref } from "./shared.jsx";

export default function FeverWorkupView() {
  return (
    <div className="space-y-5" style={{ "--hue": "var(--hue-inpatient)" }}>
      <header className="rise">
        <Eyebrow>Infectious workup · PMG p.5</Eyebrow>
        <h1 className="font-display font-semibold text-[26px] leading-tight tracking-tight mt-1">{fw.title}</h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-rule bg-card px-3 py-1 font-mono text-[13px]">
          <span className="size-2 rounded-full bg-hue" aria-hidden="true" />
          {fw.trigger}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {fw.branches.map((b, i) => (
          <Card as="article" key={b.id} className="rise p-4 flex flex-col" style={{ animationDelay: `${60 + i * 70}ms` }}>
            <h2 className="font-display font-semibold text-[18px] tracking-tight text-hue">{b.title}</h2>
            {b.preface && <p className="mt-1 text-[13px] text-muted leading-snug">{b.preface}</p>}

            {b.criteria?.lead && (
              <div className="mt-3">
                <div className="eyebrow text-muted mb-1">{b.criteria.lead}</div>
                {b.criteria.items.length > 0 && (
                  <ul className="space-y-1 text-[14px] leading-snug">
                    {b.criteria.items.map((it) => (
                      <li key={it} className="pl-3 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-hue">
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {b.steps.length > 0 && (
              <ol className="mt-3 space-y-1 text-[14px] leading-snug list-decimal pl-5 marker:font-mono marker:text-muted">
                {b.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}

            <div className="mt-3 rounded-lg bg-ink/[0.04] p-3">
              <div className="eyebrow text-muted mb-1">Then</div>
              <ul className="space-y-1.5 text-[14px] leading-snug">
                {b.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>

            {b.note && <p className="mt-3 text-[13px] italic text-muted leading-snug">{b.note}</p>}
          </Card>
        ))}
      </div>

      <Card className="rise p-4" style={{ animationDelay: "300ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[18px] tracking-tight">Reference standards</h2>
          <PageTag page={5} />
        </div>
        <ul className="mt-2 divide-y divide-rule/70">
          {fw.referenceStandards.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between gap-3 py-2 text-[14px] hover:text-deepgold dark:hover:text-gold"
              >
                <span>{r.label}</span>
                <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <p className="flex items-start gap-2 text-[12px] text-muted leading-snug">
        <ImageIcon className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          This page of the PMG is a flowchart image with no text layer. The steps above were read from the picture
          and cannot be checked by the verification script —{" "}
          <a href={pdfHref + "#page=5"} target="_blank" rel="noopener" className="underline underline-offset-4 decoration-dotted">
            open page 5 of the PDF
          </a>{" "}
          to see the original.
        </span>
      </p>
    </div>
  );
}
