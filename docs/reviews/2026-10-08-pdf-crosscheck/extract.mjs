// Extract each PDF page's text as positioned lines: items grouped by baseline,
// ordered left to right, with "  |  " where the horizontal gap suggests a new cell.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, pdfPath, outPath] = process.argv.slice(2);
const pdfjs = await import(pathToFileURL(path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.mjs")).href);
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), verbosity: 0,
  standardFontDataUrl: path.join(root, "node_modules/pdfjs-dist/standard_fonts/").split("\\").join("/") }).promise;
let out = `PDF: ${path.basename(pdfPath)} — ${doc.numPages} pages. Lines are grouped by baseline (y, in PDF points from the bottom) and ordered left to right; x is the left edge of the first item; "  |  " marks a horizontal gap of more than 6pt between items (a likely cell boundary). This is a machine extraction: table rows that wrap over several lines appear as several lines.\n`;
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items = tc.items.filter((i) => i.str && i.str.trim() !== "").map((i) => ({ s: i.str, x: i.transform[4], y: i.transform[5], w: i.width }));
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const it of items) {
    const l = lines.find((l) => Math.abs(l.y - it.y) <= 2);
    if (l) l.items.push(it); else lines.push({ y: it.y, items: [it] });
  }
  lines.sort((a, b) => b.y - a.y);
  out += `\n===== PAGE ${p} (${Math.round(vp.width)}×${Math.round(vp.height)} pt, ${items.length} text items) =====\n`;
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);
    let s = "", end = null;
    for (const it of l.items) {
      if (end !== null) s += it.x - end > 6 ? "  |  " : (it.x - end > 0.8 && !s.endsWith(" ") && !it.s.startsWith(" ") ? " " : "");
      s += it.s; end = it.x + it.w;
    }
    out += `[y=${l.y.toFixed(0)} x=${l.items[0].x.toFixed(0)}] ${s.replace(/\s+/g, " ").trim()}\n`;
  }
}
fs.writeFileSync(outPath, out);
console.log(out.length, "chars");
