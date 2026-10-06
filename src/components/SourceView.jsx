import { ExternalLink, FileText, FlaskConical, ShieldAlert } from "lucide-react";
import { antibiogram, references, source, transcription } from "../data/pmg.js";
import { Card, Eyebrow, keepUnits, pdfHref } from "./shared.jsx";

const CHECKED = [
  "The four indication tables (pages 1–2): every cell of all 34 rows, the section each row sits under, and that no row is missing, invented or duplicated.",
  "Open fractures (pages 3–4): the timing rule, each regimen under its printed label, the durations, debridement rules, Gustilo-Anderson text and femoral-shaft timing, each as one whole phrase — and that the regimen the app displays re-states the PDF's wording exactly.",
  "The dosing table (page 4): drug, footnote mark, adult cell and pediatric cell of each row, comparison signs included.",
  "The three reference-standard links on page 5 (label bound to link target) and the 13 references on page 12 as whole entries.",
];

const NOT_CHECKED = [
  "The fever-workup flowchart (page 5) — an image, read by eye.",
  "The short display labels and the search synonyms.",
  "Brand names and drug classes on the By-drug page — app-authored, not from the PMG.",
  "Whether the PMG's own values are right.",
];

export default function SourceView() {
  return (
    <div className="space-y-6">
      <header className="rise border-b border-rule/60 pb-3">
        <Eyebrow>Provenance</Eyebrow>
        <h1 className="font-display font-bold text-[24px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-ink flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-accent shrink-0" aria-hidden="true" />
          Source document
        </h1>
      </header>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "40ms" }}>
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-lg bg-well border border-rule flex items-center justify-center shrink-0">
            <FileText className="size-6 text-accent" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-[18px] text-ink leading-snug">{source.title}</h2>
            <p className="text-[13px] text-soft mt-1">
              {source.publisher} · Original publication date {source.publicationDate} · {source.pages} pages
            </p>
            <div className="mt-2 p-2 rounded bg-well border border-rule/70">
              <span className="font-mono text-[11px] text-muted uppercase block">sha256</span>
              <p className="text-[12px] font-mono text-accent-hi break-all font-semibold">{source.sha256}</p>
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-fill hover:bg-accent-fill-hi text-on-accent px-4 py-2.5 text-[14px] font-display font-bold tracking-wider uppercase transition-all shadow-md active:scale-95"
              >
                <span>Open the PDF</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <span className="text-[12px] font-mono text-muted">Stored for offline use once the app has finished installing.</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-soft border-t border-rule/60 pt-3">{source.intro}</p>
      </Card>

      <Card
        className="rise p-4 sm:p-5 border-hazard-amber/70 bg-gradient-to-br from-tint-amber/20 via-card to-card"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="size-5 text-hazard-amber" aria-hidden="true" />
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">For the reviewing physician</h2>
        </div>
        <p className="text-[14px] text-soft leading-snug">
          The values in this app were transcribed from the PDF. On every build a script re-reads the PDF and
          compares the transcription with it. That is an automated consistency check against the document, not
          clinical review, and it does not cover everything:
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[14px] leading-snug">
          <div className="rounded bg-well/60 p-3 border border-rule/60">
            <div className="eyebrow text-dose mb-1.5">Checked against the PDF</div>
            <ul className="space-y-1.5 list-disc pl-4 text-prose">
              {CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded bg-well/60 p-3 border border-rule/60">
            <div className="eyebrow text-hazard-amber mb-1.5">Not checked</div>
            <ul className="space-y-1.5 list-disc pl-4 text-prose">
              {NOT_CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-[14px] text-soft mt-3 leading-snug">Things a human should look at in the document itself:</p>
        <ol className="mt-2 space-y-2 text-[14px] leading-snug">
          {transcription.flags.map((f, fi) => (
            <li key={f} className="flex items-start gap-2.5 text-prose bg-well/60 p-2.5 rounded border border-rule/60">
              <span className="font-mono text-[11px] font-bold text-hazard-amber bg-lcd/60 px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums">
                {String(fi + 1).padStart(2, "0")}
              </span>
              <span>{keepUnits(f)}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "120ms" }}>
        <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">Spelling corrected from the PDF</h2>
        <p className="text-[14px] text-muted mt-1 leading-snug">
          Typos in the source were corrected and one cut-off label was completed. The script applies the same
          corrections before comparing. The completion (“Instr” → “Instrumentation”) is an interpretation for a
          human to confirm.
        </p>
        <ul className="mt-3 divide-y divide-rule/60 text-[14px]">
          {transcription.corrections.map((c) => (
            <li key={c.pdf} className="py-2.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2 items-baseline">
              <span className="font-mono text-muted line-through break-words">{c.pdf}</span>
              <span className="text-accent font-bold" aria-hidden="true">
                →
              </span>
              <span className="font-mono text-dose font-semibold break-words">{c.here}</span>
              <span className="col-span-3 text-[12px] font-mono text-muted mt-0.5">{c.where}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "160ms" }}>
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-lg bg-well border border-rule flex items-center justify-center shrink-0">
            <FlaskConical className="size-6 text-accent" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">Antibiogram</h2>
            <p className="text-[14px] text-soft mt-1 leading-snug">
              Pages {antibiogram.pages[0]}–{antibiogram.pages[1]} of the PMG reproduce the MU Health University
              Hospital antibiogram for {antibiogram.period}. The {antibiogram.appName} app carries the newer dataset,
              so those pages are linked rather than re-typed here.
            </p>
            <a
              href={antibiogram.appUrl}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-1.5 py-2.5 text-[14px] font-display font-bold uppercase tracking-wider text-accent hover:text-accent-hi underline underline-offset-4"
            >
              {antibiogram.appName} <ExternalLink className="size-4" aria-hidden="true" />
            </a>
            <p className="text-[12px] font-mono text-muted mt-1.5">{antibiogram.appNote}</p>
          </div>
        </div>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "200ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-2">
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">References</h2>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">PMG p.12</span>
        </div>
        <ol className="mt-2 space-y-3 text-[13px] leading-snug text-soft">
          {references.map((r) => (
            <li key={r.n} className="grid grid-cols-[1.8rem_minmax(0,1fr)] gap-x-1.5 items-baseline">
              <span className="font-mono font-bold text-accent">{r.n}.</span>
              <span>
                {r.text}
                {r.url && (
                  <>
                    {" "}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener"
                      className="text-accent hover:text-accent-hi underline underline-offset-4 break-all"
                    >
                      {r.url.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
