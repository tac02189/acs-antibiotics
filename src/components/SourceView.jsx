import { FileText, ShieldAlert } from "lucide-react";
import { references, source, transcription } from "../data/pmg.js";
import { Card, CollapsibleCard, ExpandAll, PageHeader, ToneCard, keepUnits } from "./shared.jsx";
import PdfButton from "./PdfButton.jsx";

const KEYS = ["source:references"];

const CHECKED = [
  "Page 1: the title and the four introductory paragraphs, whole and in order; and the review date in every page's header.",
  "The four indication tables (pages 2–4): every cell of all 40 rows, the section and the column headers each row sits under, and that no row is missing, invented or duplicated.",
  "Both dosing tables (pages 3–4): every cell of every row, headers and titles, comparison signs included (the cefazolin ≥, which the PDF draws as an underlined >, too), the empiric table's footnote, and the re-dosing rules beside the prophylaxis table.",
  "Open fractures (page 5): the Gustilo-Anderson table, the timing rule, each regimen under its printed label, with each penicillin-allergy regimen under the bullet it is printed under, and the durations — and that the regimen the app displays re-states the PDF's wording exactly, apart from the IV route noted below.",
  "The 35 references (pages 6–8) as whole entries, in order, with their links.",
];

const NOT_CHECKED = [
  "The doses beside each drug on the indication rows: the PDF's rows name the drugs only, and the app looks each one up in the dosing table for the row's section, or in the empiric table for a drug the prophylaxis table does not list. The lookup is tested; the PDF does not print the result.",
  "The short display labels and the search synonyms (a test checks their words against the PDF's row names).",
  "The wording of this page's notes below. A test finds every dose and quoted phrase in them in the verified data.",
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
              {source.publisher} · Review date {source.reviewDate} · {source.pages} pages
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
        <div className="mt-4 pt-3 border-t border-rule-soft space-y-2.5 text-[14px] leading-relaxed text-soft">
          {source.intro.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
      </Card>

      {/* Always open (v0.7.8, Thiago, 2026-10-08: "keep the physician card open"): it
          says what the build's check does not cover. */}
      <ToneCard tone="warn" className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="size-5 text-warn-mark" aria-hidden="true" />
          <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug text-warn-ink">For the reviewing physician</h2>
        </div>
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
      </ToneCard>

      {/* Collapses, starting collapsed (v0.7.7). The "Corrected from the PDF" card that sat
          above it went in v0.8.1 (Thiago, 2026-10-19); the IV route is the flag above. */}
      <ExpandAll keys={KEYS} />

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
