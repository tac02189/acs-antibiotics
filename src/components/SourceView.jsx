import { FileText } from "lucide-react";
import { references, source } from "../data/pmg.js";
import { Card, CollapsibleCard, ExpandAll, PageHeader } from "./shared.jsx";
import PdfButton from "./PdfButton.jsx";

const KEYS = ["source:references"];

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

      {/* Collapses, starting collapsed (v0.7.7). The "Corrected from the PDF" card that sat
          above it went in v0.8.1 (Thiago, 2026-10-19), and the "For the reviewing physician"
          card, with its checked / not-checked lists and the notes, in v0.8.6 (Thiago,
          2026-10-22). The notes stay in the data as `transcription.flags`. */}
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
