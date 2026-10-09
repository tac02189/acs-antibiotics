import { ExternalLink, FileText, FlaskConical, ShieldAlert } from "lucide-react";
import { antibiogram, references, source, transcription } from "../data/pmg.js";
import { Card, CollapsibleCard, PageHeader, keepUnits } from "./shared.jsx";
import PdfButton from "./PdfButton.jsx";

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

function IconTile({ icon: Icon }) {
  return (
    <div className="size-11 rounded-lg border border-rule bg-chip flex items-center justify-center shrink-0">
      <Icon className="size-6 text-accent" aria-hidden="true" />
    </div>
  );
}

export default function SourceView() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Provenance" title="Source document" />

      <Card className="p-4">
        <div className="flex items-start gap-3.5">
          <IconTile icon={FileText} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold leading-snug text-ink">{source.title}</h2>
            <p className="mt-1 text-[13px] leading-snug text-soft">
              {source.publisher} · Original publication date {source.publicationDate} · {source.pages} pages
            </p>
            <div className="mt-2 rounded-md border border-rule bg-chip p-2">
              <span className="block eyebrow text-soft">sha256</span>
              <p className="font-mono text-[12px] text-prose break-all">{source.sha256}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PdfButton className="inline-flex items-center gap-2 rounded-lg bg-accent-fill hover:bg-accent-fill-hi text-on-accent px-4 py-2.5 text-[14px] font-semibold transition-colors">
                <FileText className="size-4" aria-hidden="true" />
                <span>Open the PDF</span>
              </PdfButton>
              <span className="text-[12px] text-muted">Stored for offline use once the app has finished installing.</span>
            </div>
          </div>
        </div>
        <p className="mt-4 pt-3 border-t border-rule-soft text-[14px] leading-relaxed text-soft">{source.intro}</p>
      </Card>

      {/* The document card above stays open; the cards below collapse, all starting
          collapsed (v0.7.7). */}
      <CollapsibleCard id="source:physician" title="For the reviewing physician" tone="warn" icon={ShieldAlert}>
        <p className="text-[14px] leading-snug">
          The values in this app were transcribed from the PDF. On every build a script re-reads the PDF and
          compares the transcription with it. That is an automated consistency check against the document, not
          clinical review, and it does not cover everything:
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[14px] leading-snug">
          <div className="rounded-md border border-warn-line bg-card/70 p-3">
            <div className="eyebrow text-good-mark mb-1.5">Checked against the PDF</div>
            <ul className="space-y-1.5 list-disc pl-4 text-prose">
              {CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-warn-line bg-card/70 p-3">
            <div className="eyebrow text-warn-mark mb-1.5">Not checked</div>
            <ul className="space-y-1.5 list-disc pl-4 text-prose">
              {NOT_CHECKED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-snug">Things a human should look at in the document itself:</p>
        <ol className="mt-2 space-y-2 text-[14px] leading-snug">
          {transcription.flags.map((f, fi) => (
            <li key={f} className="flex items-start gap-2.5 rounded-md border border-warn-line bg-card/70 p-2.5 text-prose">
              <span className="font-mono text-[11px] font-bold text-warn-mark tabular-nums shrink-0 mt-0.5">
                {String(fi + 1).padStart(2, "0")}
              </span>
              <span>{keepUnits(f)}</span>
            </li>
          ))}
        </ol>
      </CollapsibleCard>

      <CollapsibleCard id="source:corrections" title="Spelling corrected from the PDF">
        <p className="text-[14px] leading-snug text-muted">
          Typos in the source were corrected and one cut-off label was completed. The script applies the same
          corrections before comparing. The completion (“Instr” → “Instrumentation”) is an interpretation for a
          human to confirm.
        </p>
        <ul className="mt-3 divide-y divide-rule-soft text-[14px]">
          {transcription.corrections.map((c) => (
            <li key={c.pdf} className="py-2.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2 items-baseline">
              <span className="font-mono text-muted line-through break-words">{c.pdf}</span>
              <span className="font-bold text-accent" aria-hidden="true">
                →
              </span>
              <span className="font-mono font-bold text-ink break-words">{c.here}</span>
              <span className="col-span-3 mt-0.5 text-[12px] text-muted">{c.where}</span>
            </li>
          ))}
        </ul>
      </CollapsibleCard>

      <CollapsibleCard id="source:antibiogram" title="Antibiogram" icon={FlaskConical}>
        <p className="text-[14px] leading-snug text-soft">
          Pages {antibiogram.pages[0]}–{antibiogram.pages[1]} of the PMG reproduce the MU Health University
          Hospital antibiogram for {antibiogram.period}. The {antibiogram.appName} app carries the newer dataset,
          so those pages are linked rather than re-typed here.
        </p>
        <a
          href={antibiogram.appUrl}
          target="_blank"
          rel="noopener"
          className="mt-1 inline-flex items-center gap-1.5 py-2 text-[14px] font-semibold text-accent hover:text-accent-hi underline underline-offset-2"
        >
          {antibiogram.appName} <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <p className="text-[12px] leading-snug text-muted">{antibiogram.appNote}</p>
      </CollapsibleCard>

      <CollapsibleCard id="source:references" title="References">
        <ol className="space-y-2.5 text-[13px] leading-snug text-soft">
          {references.map((r) => (
            <li key={r.n} className="grid grid-cols-[1.8rem_minmax(0,1fr)] gap-x-1.5 items-baseline">
              <span className="font-mono font-bold text-accent tabular-nums">{r.n}.</span>
              <span>
                {r.text}
                {r.url && (
                  <>
                    {" "}
                    <a href={r.url} target="_blank" rel="noopener" className="text-accent hover:text-accent-hi underline underline-offset-2 break-all">
                      {r.url.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </CollapsibleCard>
    </div>
  );
}
