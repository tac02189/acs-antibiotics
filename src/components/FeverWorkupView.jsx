import { ExternalLink, ImageIcon, ArrowRight } from "lucide-react";
import { feverWorkup as fw } from "../data/pmg.js";
import { Card, Eyebrow, PageTag, pdfHref } from "./shared.jsx";

export default function FeverWorkupView() {
  return (
    <div className="space-y-6" style={{ "--hue": "var(--hue-inpatient)" }}>
      <header className="rise border-b border-rule/60 pb-3">
        <Eyebrow>Infectious workup · PMG p.5</Eyebrow>
        <h1 className="font-display font-bold text-[26px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-ink flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-signal-violet shrink-0" aria-hidden="true" />
          {fw.title}
        </h1>
        <p className="mt-2.5 inline-flex items-center gap-2 rounded bg-well px-3 py-1.5 font-mono text-[13px] border border-rule">
          <span className="size-2 rounded-full bg-signal-violet" aria-hidden="true" />
          <span className="text-ink font-bold">{fw.trigger}</span>
        </p>
      </header>

      <div className="grid gap-3.5 md:grid-cols-3">
        {fw.branches.map((b, i) => (
          <Card as="article" key={b.id} className="rise p-4 sm:p-5 flex flex-col justify-between" style={{ animationDelay: `${40 + i * 45}ms` }}>
            <div>
              <h2 className="font-display font-bold text-[19px] tracking-tight uppercase text-ink flex items-center gap-2">
                <span className="size-2 rounded-full bg-signal-violet shrink-0" aria-hidden="true" />
                {b.title}
              </h2>
              {b.preface && <p className="mt-1.5 text-[13px] text-soft leading-snug">{b.preface}</p>}

              {b.criteria?.lead && (
                <div className="mt-3.5 p-3 rounded bg-well border border-rule/70">
                  <div className="eyebrow text-accent mb-1.5 text-[10px]">{b.criteria.lead}</div>
                  {b.criteria.items.length > 0 && (
                    <ul className="space-y-1.5 text-[13.5px] leading-snug">
                      {b.criteria.items.map((it) => (
                        <li
                          key={it}
                          className="pl-3.5 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-signal-violet text-prose"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {b.steps.length > 0 && (
                <ul className="mt-3.5 space-y-2 text-[14px] leading-snug">
                  {b.steps.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-prose">
                      <ArrowRight className="size-4 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-rule/60">
              <div className="rounded bg-well p-3 border border-rule">
                <div className="eyebrow text-dose mb-1.5 text-[10px]">Then</div>
                <ul className="space-y-1.5 text-[13.5px] leading-snug font-medium text-ink">
                  {b.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
              {b.note && <p className="mt-2.5 text-[12px] italic text-muted leading-snug">{b.note}</p>}
            </div>
          </Card>
        ))}
      </div>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "180ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-2">
          <h2 className="font-display font-bold text-[19px] tracking-tight uppercase text-ink">Reference standards</h2>
          <PageTag page={5} />
        </div>
        <ul className="divide-y divide-rule/60">
          {fw.referenceStandards.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between gap-3 py-2.5 text-[14px] text-prose hover:text-accent-hi transition-colors group"
              >
                <span className="font-medium group-hover:underline">{r.label}</span>
                <ExternalLink className="size-4 shrink-0 text-muted group-hover:text-accent" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-start gap-2.5 text-[12px] text-muted leading-snug bg-paper/60 p-3 rounded border border-rule/60">
        <ImageIcon className="size-4 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
        <span>
          This page of the PMG is a flowchart image with no text layer. The steps above were read from the picture
          and cannot be checked by the verification script —{" "}
          <a href={pdfHref + "#page=5"} target="_blank" rel="noopener" className="text-accent underline underline-offset-4 font-bold hover:text-accent-hi">
            open page 5 of the PDF
          </a>{" "}
          to see the original.
        </span>
      </div>
    </div>
  );
}
