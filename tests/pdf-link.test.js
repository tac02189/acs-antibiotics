// The source PDF opens only in the in-app viewer (src/components/PdfButton.jsx).
// A plain link to it cannot be closed in the installed app: there is no browser
// tab to open into, so the PDF replaces the app with no way back but quitting it
// (Thiago, 2026-10-08: "There's no way to close the pdf after you open it").
//
// The policy is reference-based, not link-shaped, so an alias, a multi-line
// href or a helper elsewhere in src/ cannot slip past (Codex review, 2026-10-08):
// outside the viewer's two files, no source file may name `pdfHref` or
// `source.file`, or hold a same-origin ".pdf" string. shared.jsx may define
// pdfHref and nothing more; src/data/pmg.js defines the filename.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const SRC = new URL("../src/", import.meta.url);
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const sourceFiles = () =>
  readdirSync(SRC, { recursive: true })
    .map((f) => "src/" + String(f).replaceAll("\\", "/"))
    .filter((f) => /\.(?:js|jsx)$/.test(f));

const VIEWER = new Set(["src/components/PdfButton.jsx", "src/components/PdfCanvasViewer.jsx"]);
const DEFINES_FILE = "src/data/pmg.js";
const PDF_HREF_DEFINITION = /^export const pdfHref = `\/\$\{source\.file\}`;$/m;

// Comments are not code: a note that mentions source.file is not a link. The
// line-comment rule skips "://" so a URL is not taken for a comment.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<![:"'`])\/\/.*$/gm, "");

// A reference to the PDF: the href helper, the data field, or a quoted ".pdf"
// path that is not an http(s) URL (a relative or root path on this site).
const PDF_REFERENCE = /\bpdfHref\b|\bsource\s*(?:\.\s*file\b|\[\s*["'`]file["'`]\s*\])|(["'`])(?!https?:\/\/)[^"'`\n]*\.pdf(?:[#?][^"'`\n]*)?\1/;

function references(source) {
  return stripComments(source)
    .split("\n")
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => PDF_REFERENCE.test(line))
    .map(([n, line]) => `${n}: ${line.trim().slice(0, 90)}`);
}

test("the PDF is opened only through the in-app viewer", () => {
  const found = sourceFiles()
    .filter((file) => !VIEWER.has(file) && file !== DEFINES_FILE)
    .flatMap((file) => {
      let src = read(file);
      if (file === "src/components/shared.jsx") {
        assert.match(src, PDF_HREF_DEFINITION, "shared.jsx: pdfHref is no longer defined as expected");
        src = src.replace(PDF_HREF_DEFINITION, "");
      }
      return references(src).map((v) => `${file}:${v}`);
    });
  assert.deepEqual(found, [], "open the PDF with <PdfButton>, not a link or a reference to its URL");
});

test("the PDF-reference guard catches each form (control)", () => {
  const caught = [
    `<a href={pdfHref} target="_blank" rel="noopener">`,
    `<a href={pdfHref + "#page=5"} target="_blank">`,
    `<a href={\n  pdfHref\n} />`,
    `const direct = "/" + source.file;\n<a href={direct} />`,
    `const f = source["file"];`,
    `<a href={"/guide.pdf"} />`,
    `<a href="/MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf">`,
    `<a href='MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf#page=5'>`,
    "const u = `/pdfs/${name}.pdf`;",
    `onClick={() => window.open(pdfHref, "_blank")}`,
    `location.href = pdfHref;`,
  ];
  for (const s of caught) assert.notDeepEqual(references(s), [], `missed: ${s}`);
  const clean = [
    `<PdfButton page={fw.page} className="font-semibold">`,
    `<a href={r.url} target="_blank" rel="noopener">`,
    `<a href="https://www.cdc.gov/nhsn/pdfs/pscmanual/6pscvapcurrent.pdf">`,
    `window.open("https://example.org/reference.pdf")`,
    `<a href={antibiogram.appUrl} target="_blank">`,
    `<span className="font-mono">{c.pdf}</span>`,
    `// The PDF's filename carries its content hash (see source.file)`,
    `{/* open pdfHref in the viewer */}`,
    `const sourceFile = 1; const resourcefile = 2;`,
  ];
  for (const s of clean) assert.deepEqual(references(s), [], `wrongly flagged: ${s}`);
});

test("every component that used to link the PDF opens the viewer instead", () => {
  for (const file of ["src/components/Header.jsx", "src/components/SourceView.jsx", "src/components/FeverWorkupView.jsx"]) {
    assert.match(read(file), /<PdfButton\b/, `${file} no longer opens the PDF viewer`);
  }
});

test("the viewer offers no direct link to the PDF in the installed app", () => {
  // Every direct link in the two viewer files sits behind the installed-app
  // check: the toolbar's in an `installed ? … : <>links</>` branch, the
  // fallback's in wayOut's non-installed branch.
  const button = read("src/components/PdfButton.jsx");
  assert.match(button, /\{installed \? \([\s\S]*?\) : \(\s*<>\s*<a href=\{direct\}[\s\S]*?<a href=\{pdfHref\} download/);
  assert.equal((button.match(/<a\b/g) || []).length, 2, "PdfButton.jsx: a new link must stay out of the installed app");
  const canvas = read("src/components/PdfCanvasViewer.jsx");
  assert.match(canvas, /installed \? \([\s\S]*?Try again[\s\S]*?\) : \(\s*<a\s+href=\{direct\}/);
  assert.equal((canvas.match(/<a\b/g) || []).length, 1, "PdfCanvasViewer.jsx: a new link must stay out of the installed app");
});
