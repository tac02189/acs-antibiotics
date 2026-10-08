import { ArrowRight, ExternalLink, ImageIcon } from "lucide-react";
import { feverWorkup as fw } from "../data/pmg.js";
import { Card, CardHeading, PageHeader, keepUnits } from "./shared.jsx";
import PdfButton from "./PdfButton.jsx";

export default function FeverWorkupView() {
  return (
    <div className="space-y-5" style={{ "--hue": "var(--hue-inpatient)" }}>
      <PageHeader eyebrow="Infectious workup · PMG p.5" title={fw.title}>
        <p className="mt-2.5 inline-flex items-center gap-2 rounded-md bg-chip px-3 py-1.5 text-[14px] font-semibold text-ink">
          <span className="size-2 rounded-full bg-hue shrink-0" aria-hidden="true" />
          <span>{keepUnits(fw.trigger)}</span>
        </p>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-3">
        {fw.branches.map((b) => (
          <Card as="article" key={b.id} className="p-4 flex flex-col justify-between border-l-4 border-l-hue">
            <div>
              <h2 className="text-[18px] font-bold leading-snug text-ink">{b.title}</h2>
              {b.preface && <p className="mt-1 text-[13px] leading-snug text-soft">{keepUnits(b.preface)}</p>}

              {b.criteria?.lead && (
                <div className="mt-3 rounded-md border border-rule bg-well p-3">
                  {/* A sentence with thresholds ("Central line >72 h…"), set as text rather than as a
                      small uppercase label, and in the PDF's own capitals ("PLUS any TWO"). */}
                  <p className="text-[15px] font-semibold leading-snug text-ink mb-1.5">{keepUnits(b.criteria.lead)}</p>
                  {b.criteria.items.length > 0 && (
                    <ul className="space-y-1.5 text-[15px] leading-snug text-prose">
                      {b.criteria.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-faint" aria-hidden="true" />
                          <span>{keepUnits(it)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {b.steps.length > 0 && (
                <ul className="mt-3 space-y-2 text-[15px] leading-snug text-prose">
                  {b.steps.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <ArrowRight className="size-4 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>{keepUnits(s)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              {/* Neutral, not an emerald "good" card: the outcomes mix starting,
                  stopping and investigating, and the PDF grades none of them
                  (Gemini review, 2026-10-07). */}
              <div className="rounded-lg border border-rule bg-well p-3">
                <div className="eyebrow text-muted mb-1">Then</div>
                <ul className="space-y-1 text-[15px] font-medium leading-snug text-ink">
                  {b.outcomes.map((o) => (
                    <li key={o}>{keepUnits(o)}</li>
                  ))}
                </ul>
              </div>
              {b.note && <p className="mt-2 text-[13px] italic leading-snug text-muted">{keepUnits(b.note)}</p>}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <CardHeading title="Reference standards" page={5} />
        <ul className="divide-y divide-rule-soft">
          {fw.referenceStandards.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between gap-3 py-2.5 text-[14px] font-medium text-prose hover:text-accent transition-colors"
              >
                <span className="group-hover:underline">{r.label}</span>
                <ExternalLink className="size-4 shrink-0 text-muted group-hover:text-accent" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <aside className="flex items-start gap-2.5 rounded-lg border border-rule bg-chip p-3 text-[13px] leading-snug text-soft">
        <ImageIcon className="size-4 shrink-0 mt-0.5 text-soft" aria-hidden="true" />
        <span>
          This page of the PMG is a flowchart image with no text layer. The steps above were read from the picture
          and cannot be checked by the verification script —{" "}
          <PdfButton page={fw.page} className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hi">
            open page {fw.page} of the PDF
          </PdfButton>{" "}
          to see the original.
        </span>
      </aside>
    </div>
  );
}
