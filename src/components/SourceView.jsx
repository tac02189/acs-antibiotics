import { ExternalLink, FileText, FlaskConical } from "lucide-react";
import { antibiogram, references, source, transcription } from "../data/pmg.js";
import { Card, Eyebrow, pdfHref } from "./shared.jsx";

const CHECKED = [
  "The four indication tables (pages 1–2): every cell of all 34 rows, the section each row sits under, and that no row is missing, invented or duplicated.",
  "Open fractures (pages 3–4): the timing rule, each regimen under its printed label, the durations, debridement rules, Gustilo-Anderson text and femoral-shaft timing, each as one whole phrase — and that the regimen the app displays re-states the PDF's wording exactly.",
  "The dosing table (page 4): drug, footnote mark, adult cell and pediatric cell of each row (with ≥ removed, because the PDF's text layer drops that glyph).",
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
    <div className="space-y-5">
      <header className="rise">
        <Eyebrow>Provenance</Eyebrow>
        <h1 className="font-display font-semibold text-[26px] leading-tight tracking-tight mt-1">Source document</h1>
      </header>

      <Card className="rise p-4" style={{ animationDelay: "60ms" }}>
        <div className="flex items-start gap-3">
          <FileText className="size-6 shrink-0 text-deepgold dark:text-gold mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[16px] leading-snug text-balance">{source.title}</h2>
            <p className="text-[13px] text-muted mt-1">
              {source.publisher} · Original publication date {source.publicationDate} · {source.pages} pages
            </p>
            <p className="text-[12px] font-mono text-muted mt-1 break-all">sha256 {source.sha256}</p>
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#121317] text-[#f6f3ec] px-4 py-2.5 text-sm font-semibold hover:bg-[#2a2c33] dark:bg-gold dark:text-[#121317] dark:hover:bg-deepgold transition-colors"
            >
              Open the PDF <ExternalLink className="size-4" aria-hidden="true" />
            </a>
            <p className="text-[12px] text-muted mt-2">
              Stored for offline use once the app has finished installing on this device.
            </p>
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-snug text-muted border-t border-rule/70 pt-3">{source.intro}</p>
      </Card>

      <Card className="rise p-4 border-gold/60" style={{ animationDelay: "120ms" }}>
        <h2 className="font-display font-semibold text-[18px] tracking-tight">For the reviewing physician</h2>
        <p className="text-[13px] text-muted mt-1 leading-snug">
          The values in this app were transcribed from the PDF. On every build a script re-reads the PDF and
          compares the transcription with it. That is an automated consistency check against the document, not
          clinical review, and it does not cover everything:
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[13px] leading-snug">
          <div className="rounded-lg bg-ink/[0.04] p-3">
            <div className="eyebrow text-muted mb-1.5">Checked against the PDF</div>
            <ul className="space-y-1.5 list-disc pl-4">
              {CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-ink/[0.04] p-3">
            <div className="eyebrow text-muted mb-1.5">Not checked</div>
            <ul className="space-y-1.5 list-disc pl-4">
              {NOT_CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-[13px] text-muted mt-3 leading-snug">Things a human should look at in the document itself:</p>
        <ol className="mt-2 space-y-2 text-[14px] leading-snug list-decimal pl-5 marker:font-mono marker:text-muted">
          {transcription.flags.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "180ms" }}>
        <h2 className="font-display font-semibold text-[18px] tracking-tight">Spelling corrected from the PDF</h2>
        <p className="text-[13px] text-muted mt-1 leading-snug">
          Typos in the source were corrected and one cut-off label was completed. The script applies the same
          corrections before comparing. The completion (“Instr” → “Instrumentation”) is an interpretation for a
          human to confirm.
        </p>
        <ul className="mt-3 divide-y divide-rule/70 text-[13.5px]">
          {transcription.corrections.map((c) => (
            <li key={c.pdf} className="py-2 grid grid-cols-[1fr_auto_1fr] gap-x-2 items-baseline">
              <span className="font-mono text-muted line-through decoration-rule break-words">{c.pdf}</span>
              <span className="text-muted">→</span>
              <span className="font-mono break-words">{c.here}</span>
              <span className="col-span-3 text-[12px] text-muted mt-0.5">{c.where}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "240ms" }}>
        <div className="flex items-start gap-3">
          <FlaskConical className="size-6 shrink-0 text-deepgold dark:text-gold mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-[18px] tracking-tight">Antibiogram</h2>
            <p className="text-[13.5px] mt-1 leading-snug">
              Pages {antibiogram.pages[0]}–{antibiogram.pages[1]} of the PMG reproduce the MU Health University
              Hospital antibiogram for {antibiogram.period}. The {antibiogram.appName} app carries the newer dataset,
              so those pages are linked rather than re-typed here.
            </p>
            <a
              href={antibiogram.appUrl}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 decoration-dotted hover:decoration-gold"
            >
              {antibiogram.appName} <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            <p className="text-[12px] text-muted mt-1">{antibiogram.appNote}</p>
          </div>
        </div>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "300ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[18px] tracking-tight">References</h2>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">PMG p.12</span>
        </div>
        <ol className="mt-2 space-y-2.5 text-[13px] leading-snug text-muted">
          {references.map((r) => (
            <li key={r.n} className="grid grid-cols-[1.6rem_1fr] gap-x-1">
              <span className="font-mono">{r.n}.</span>
              <span>
                {r.text}
                {r.url && (
                  <>
                    {" "}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener"
                      className="underline underline-offset-4 decoration-dotted break-all hover:text-ink"
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
