// Verifies src/data/pmg.js against the source PDF, in both directions.
//
// Why this exists: the data file was transcribed by hand from a PDF whose text
// layer scrambles table columns. A transcription error here is a wrong drug or
// dose attached to a diagnosis, and it would look entirely plausible. This
// script re-reads the PDF with pdf.js, rebuilds every table from the printed
// cell borders, and compares each cell with the data file. It proves the data
// matches the PDF; it cannot prove the PDF is right.
//
// Written for the October 2026 edition (8 pages; v0.8.0). What it checks:
//   0. Source binding — the PDF in public/ hashes to source.sha256, carries that
//      hash in its filename, and has source.pages pages; the review date in
//      every page's running header; the title and the four introductory
//      paragraphs of page 1 as one run.
//   A. Indication tables (pages 2–4) — rows AND columns come from the tables'
//      own cell borders (thin filled rectangles in the operator list), so a
//      cell can only be read from the cell it is printed in. Every PDF row must
//      match exactly one data entry and vice-versa (bijection), on the data's
//      page, under the printed section title the data names, with the section's
//      four column headers printed above it; the preferred, alternative and
//      duration cells must equal the data exactly after normalisation. N/A is
//      compared like any other value. One duration line differs from the print
//      by a listed correction (CELL_CORRECTIONS below): the data must carry the
//      corrected line, and the PDF must print the original.
//   B. The two dosing tables — surgical prophylaxis (page 3: dose, OR redosing
//      interval, OR infusion time) and empiric therapy (page 4: dose, route,
//      frequency, printed as two side-by-side halves, then a footnote) — every
//      cell of every row, the headers and titles, comparison signs included.
//      Word draws page 3's "≥ 120 kg" as an underlined ">": the underline is a
//      rectangle of its own, and readPdf turns a sign with one under it into
//      "≥" / "≤" (so the data must say "≥").
//   C. Page 3's re-dosing rules — the two headed bullet lists left of the
//      prophylaxis dosing table, each compared whole and in order.
//   D. Open fractures (page 5) — the Gustilo-Anderson table rebuilt from its
//      borders; the timing rule anchored between its heading and the next
//      heading; the selection and contamination bullets compared as ordered
//      lists with their levels, so each "If penicillin allergy" sub-bullet is
//      bound to the type it is printed under; the contamination scope line; the
//      two durations. The displayed regimen tuples must re-state the printed
//      bullet exactly once the route is set aside: the PDF prints no route there
//      and the app shows IV for every one (Thiago, 2026-10-16: "They are all
//      IV"), a listed correction that tests/pmg.test.js pins.
//   E. References (pages 6–8) — all thirty-five as one run, in order, from the
//      "Reference" heading to the end of page 8 (each page's running header
//      excluded), and every URL in the data is a link annotation on the page its
//      reference is printed on.
//
// Not covered, deliberately or by necessity: the `short` display labels
// (tests/pmg.test.js checks their words and negations against the PDF row name)
// and the `aliases` (search hints nothing checks); the app-authored brand /
// class table; the doses the app shows beside a drug on an indication row,
// which are looked up from the verified dosing tables by src/lib/dosing.js
// (tested in tests/pmg.test.js, not printed on those rows in the PDF); and
// whether the PDF's own values are right.
//
// Anything that compares implausibly little fails outright: the row counts of
// every table (14 + 6 + 6 + 14 indications, 8 + 19 dosing rows, 3 fracture
// types with 3 subtypes, 35 references) are asserted exactly; a new edition of
// the PDF must revisit them, and the table regions below.
// tests/verify-controls.test.js plants errors into copies of the data and
// asserts this script catches each one.
//
// Usage: node scripts/verify-pmg.mjs [--dump]

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(here, "..");

// ───────────────────────────── normalisation ─────────────────────────────

// Typos printed in the PDF, mapped to the spelling the data file uses. Applied
// to BOTH sides before comparing, so the data may carry the corrected form.
// Mirrored in src/data/pmg.js `transcription.corrections` (tests/pmg.test.js
// checks the two lists against each other, in both directions). The October
// 2026 edition has none; the route the app adds to the open-fracture regimens
// is not a typo and is handled in section D instead. A map entry rewrites its
// text wherever it appears, on both sides, so it cannot notice the data losing
// the fix; prefer CELL_CORRECTIONS for a correction that belongs to one cell.
export const TYPO_MAP = [];

// Indication-table duration lines the app shows corrected, each scoped to one
// row and line. The data's line must read `here` exactly, and the PDF's cell
// must read as the data's lines with that one replaced by `pdf`: so the data
// losing the fix fails, the print changing fails, and no other row is touched.
// Mirrored in src/data/pmg.js `transcription.corrections` (`kind: "cell"`);
// tests/pmg.test.js checks the two lists against each other, in both
// directions. The appendectomy's third line prints no colon (Thiago,
// 2026-10-19: "add colon"); a TYPO_MAP entry first did this and would also have
// repaired a colon dropped from cholecystitis (Codex review, 2026-10-19).
export const CELL_CORRECTIONS = [
  {
    row: "appendectomy",
    line: 2,
    pdf: "Perforated without source control 8 days",
    here: "Perforated without source control: 8 days",
  },
];

export function norm(s) {
  let t = String(s ?? "")
    .toLowerCase()
    .replace(/[–—−­]/g, "-") // en/em dash, minus, soft hyphen → hyphen
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  t = " " + t + " ";
  for (const [from, to] of TYPO_MAP) t = t.split(from).join(to);
  t = t
    .replace(/\s*\/\s*/g, "/") // "875 mg / 125 mg" == "875 mg/125 mg"
    .replace(/(\d)\s+(g|mg|ml|kg|h|hrs|cm)\b/g, "$1$2") // "2 g" == "2g"
    .replace(/\s*-\s*/g, "-") // "48 - 72" == "48-72", "Piperacillin- tazobactam" == "Piperacillin-tazobactam"
    // A comma or colon between two digits is part of a number ("1,500 mL"), so it
    // is left as printed; anywhere else it is spaced evenly. "1,500" and "1:500"
    // both normalised to "1, 500" before v0.8.0 (Codex review, 2026-10-16).
    .replace(/\s*:\s*(?!\d)/g, ": ")
    .replace(/\s*,\s*(?!\d)/g, ", ")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

// Looser form for prose: punctuation and bullet glyphs become spaces;
// comparison operators ("<" ">" "≥" "≤"), "/" "*" "+" "%" are kept, so a
// reversed threshold or a dropped mark still differs; Word's "o" sub-bullet
// marker is removed.
//
// A point, comma or colon between two digits, and a dash before a digit, are
// part of a number and are kept: "1.5g/dose" and "1–5g/dose" both became
// "1 5g/dose" before v0.7.11, and "max -1.5g/dose" became "max 1 5g/dose"
// (Codex reviews, 2026-10-14); "1,500 mL" and "1:500 mL" both became
// "1 500ml" before v0.8.0 (Codex review, 2026-10-16).
export function loose(s) {
  return norm(s)
    .replace(/[^a-z0-9/<>≥≤*+%.,:\-\s]/g, " ")
    .replace(/(?<!\d)[.,:]|[.,:](?!\d)/g, " ")
    .replace(/-(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(^| )o(?= |$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// The items of a bulleted list printed between two markers, in order, each
// with its level: 1 for "•", 2 for Word's "o" sub-bullet. Returns null when a
// marker is missing, which callers treat as a failure.
export function bulletItems(text, start, end) {
  const t = norm(text);
  const i = t.indexOf(norm(start));
  if (i < 0) return null;
  const from = i + norm(start).length;
  const j = end ? t.indexOf(norm(end), from) : t.length;
  if (j < 0) return null;
  const body = t.slice(from, j);
  const out = [];
  const re = /(•|(?<![a-z0-9])o(?![a-z0-9]))/g;
  let m;
  let last = null;
  let lastEnd = 0;
  const lead = [];
  while ((m = re.exec(body))) {
    if (last) out.push({ level: last === "•" ? 1 : 2, text: loose(body.slice(lastEnd, m.index)) });
    else lead.push(body.slice(0, m.index));
    last = m[1];
    lastEnd = m.index + m[0].length;
  }
  if (last) out.push({ level: last === "•" ? 1 : 2, text: loose(body.slice(lastEnd)) });
  // Text before the first marker would be an item the list does not show.
  if (lead.some((s) => loose(s))) out.unshift({ level: 0, text: loose(lead.join(" ")) });
  return out.filter((x) => x.text);
}

const sameSeq = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);

// For references and running text: every space removed, so line breaks and
// justified spacing cannot matter, and only one contiguous string can match.
export function despace(s) {
  return norm(s).replace(/\s+/g, "");
}

// ───────────────────────────── pdf reading ─────────────────────────────

export async function readPdf(pdfPath) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const bytes = fs.readFileSync(pdfPath);
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  }).promise;

  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const items = tc.items
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        raw: it.str,
        s: it.str.replace(/\s+/g, " ").trim(),
      }));

    // Cell borders. Word emits table borders as thin filled rectangles, one per
    // cell edge: horizontal ones give the row boundaries, vertical ones the
    // column boundaries of the row they span. A short thin rectangle is an
    // underline: Word's way of drawing "≥" as an underlined ">".
    const hrules = [];
    const vrules = [];
    const underlines = [];
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] !== pdfjs.OPS.constructPath) continue;
      const [subOps, coords] = ops.argsArray[i];
      let ci = 0;
      for (const so of subOps) {
        if (so === pdfjs.OPS.rectangle) {
          const [x, y, w, h] = coords.slice(ci, ci + 4);
          ci += 4;
          const [x0, x1] = [Math.min(x, x + w), Math.max(x, x + w)];
          const [y0, y1] = [Math.min(y, y + h), Math.max(y, y + h)];
          if (y1 - y0 <= 2.5 && x1 - x0 >= 20) hrules.push({ y: (y0 + y1) / 2, x0, x1 });
          else if (x1 - x0 <= 2.5 && y1 - y0 >= 5) vrules.push({ x: (x0 + x1) / 2, y0, y1 });
          else if (y1 - y0 <= 1 && x1 - x0 >= 2 && x1 - x0 < 20) underlines.push({ x0, x1, y: (y0 + y1) / 2 });
        } else if (so === pdfjs.OPS.moveTo || so === pdfjs.OPS.lineTo) ci += 2;
        else if (so === pdfjs.OPS.curveTo) ci += 6;
        else if (so === pdfjs.OPS.curveTo2 || so === pdfjs.OPS.curveTo3) ci += 4;
      }
    }

    // An underlined comparison sign is "≥" or "≤". The underline sits just under
    // the baseline of the item that carries the sign; of that item's signs, the
    // one nearest the underline (by its proportional position) is the one
    // underlined.
    const signsUnderlined = [];
    for (const u of underlines) {
      const it = items.find((it) => it.y - u.y >= -0.5 && it.y - u.y <= 3 && u.x0 >= it.x - 1 && u.x1 <= it.x + it.w + 1);
      if (!it) continue;
      const centre = (u.x0 + u.x1) / 2;
      let best = -1;
      let bestD = Infinity;
      [...it.s].forEach((ch, k) => {
        if (ch !== ">" && ch !== "<") return;
        const at = it.x + (it.w * (k + 0.5)) / it.s.length;
        if (Math.abs(at - centre) < bestD) [best, bestD] = [k, Math.abs(at - centre)];
      });
      if (best < 0 || bestD > 6) continue;
      const chars = [...it.s];
      chars[best] = chars[best] === ">" ? "≥" : "≤";
      it.s = chars.join("");
      signsUnderlined.push(it.s);
    }

    const links = (await page.getAnnotations())
      .filter((a) => a.subtype === "Link" && a.url)
      .map((a) => ({ url: a.url, rect: a.rect }));

    pages.push({
      number: p,
      items,
      hrules,
      vrules,
      signsUnderlined,
      links,
      text: pageText(items),
    });
  }
  return { sha256: createHash("sha256").update(bytes).digest("hex"), numPages: doc.numPages, pages };
}

// Items on one line, left to right. Word splits a word into two items where
// its formatting changes ("Metronidazol" in bold, then "e 500 mg"), and pdf.js
// reports them with no gap and no space; joining every item with a space would
// print "Metronidazol e". So a space goes in only where the PDF has one: a
// space at the end or start of an item, or a visible gap between them.
export function joinLine(its) {
  let out = "";
  let prev = null;
  for (const it of [...its].sort((a, b) => a.x - b.x)) {
    if (prev) {
      const gap = it.x - (prev.x + prev.w);
      out += /\s$/.test(prev.raw ?? " ") || /^\s/.test(it.raw ?? " ") || gap > 1 ? " " : "";
    }
    out += it.s;
    prev = it;
  }
  return out;
}

// Reading order: lines grouped by y (descending), items left to right.
export function pageText(items) {
  const lines = new Map();
  for (const it of items) {
    const key = Math.round(it.y);
    if (!lines.has(key)) lines.set(key, []);
    lines.get(key).push(it);
  }
  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, its]) => joinLine(its))
    .join(" ");
}

const sameUrl = (a, b) => String(a).replace(/\/$/, "") === String(b).replace(/\/$/, "");

// ───────────────────────────── table geometry ─────────────────────────────

// Where each table sits, in PDF points (origin bottom-left; pages are 792 × 612
// landscape). Measured from the October 2026 edition. A region only says which
// borders and text belong to which table; the rows and columns inside it come
// from the borders themselves. If a new edition moves a table, a region misses
// it and the row counts and header checks fail — re-measure, do not loosen.
const REGIONS = {
  // Page 2: the Trauma and Emergency General Surgery tables, one under the other.
  surgery2: { page: 2, x0: 30, x1: 762, y0: 100, y1: 560 },
  // Page 3: the Elective Surgery table across the top...
  elective: { page: 3, x0: 30, x1: 762, y0: 430, y1: 560 },
  // ...the prophylaxis dosing table at the bottom right...
  prophylaxisDosing: { page: 3, x0: 430, x1: 762, y0: 190, y1: 405 },
  // ...and the re-dosing rules to its left.
  redosingText: { page: 3, x0: 30, x1: 430, y0: 190, y1: 395 },
  // Page 4: the empiric table, then the empiric dosing table under it.
  empiric: { page: 4, x0: 30, x1: 762, y0: 225, y1: 560 },
  empiricDosing: { page: 4, x0: 58, x1: 734, y0: 60, y1: 222 },
  // Page 5: the Gustilo-Anderson table.
  classification: { page: 5, x0: 70, x1: 722, y0: 330, y1: 490 },
};

const inRegion = (r) => (it) => it.x >= r.x0 && it.x < r.x1 && it.y >= r.y0 && it.y <= r.y1;

function cluster(values, tol = 1.5) {
  const out = [];
  for (const v of [...values].sort((a, b) => a - b)) {
    if (!out.length || v - out[out.length - 1] > tol) out.push(v);
  }
  return out;
}

// The rows of the table in `region`, each as its cells left to right. A row is
// the band between two consecutive horizontal borders; its cells are the spans
// between the vertical borders that cross the band (a span narrower than 12pt —
// page 4's black divider, a double border — is not a cell). A cell's text is
// its lines top to bottom, each line joined as printed.
export function tableGrid(page, region) {
  const hr = page.hrules.filter((h) => h.x0 < region.x1 - 5 && h.x1 > region.x0 + 5 && h.y >= region.y0 - 2 && h.y <= region.y1 + 2);
  const ys = cluster(hr.map((h) => h.y)).reverse(); // top of page first
  const rows = [];
  for (let i = 0; i < ys.length - 1; i++) {
    const [top, bottom] = [ys[i], ys[i + 1]];
    if (top - bottom < 6) continue; // a double border, not a row
    const mid = (top + bottom) / 2;
    const xs = cluster(
      page.vrules.filter((v) => v.y0 <= mid && v.y1 >= mid && v.x >= region.x0 - 3 && v.x <= region.x1 + 3).map((v) => v.x)
    );
    const cells = [];
    for (let k = 0; k < xs.length - 1; k++) {
      if (xs[k + 1] - xs[k] < 12) continue;
      const its = page.items.filter((it) => it.y < top && it.y > bottom && it.x >= xs[k] - 1 && it.x < xs[k + 1] - 1);
      const lines = new Map();
      for (const it of its) {
        const key = Math.round(it.y);
        if (!lines.has(key)) lines.set(key, []);
        lines.get(key).push(it);
      }
      cells.push(
        [...lines.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([, l]) => joinLine(l))
          .join(" ")
      );
    }
    if (!cells.some((c) => c.trim())) continue;
    rows.push({ top, bottom, cells });
  }
  return rows;
}

// ───────────────────────────── expected values ─────────────────────────────

// A cell of drug names: "Cefazolin + Metronidazole".
export const comboText = (drugs) => drugs.join(" + ");

// The alternative column: lines, each optionally for one preferred drug
// ("Linezolid alternative: Clindamycin + Vancomycin"), each a choice of
// combinations joined by "or".
export function alternativeText(alt) {
  if (alt == null) return "N/A";
  return alt.map((line) => (line.for ? `${line.for} alternative: ` : "") + line.options.map(comboText).join(" or ")).join(" ");
}

export function expectedCells(ind) {
  return [
    ind.name,
    ind.preferred ? comboText(ind.preferred) : "N/A",
    alternativeText(ind.alternative),
    ind.duration ? ind.duration.join(" ") : "N/A",
  ];
}

// An open-fracture display tuple as the PDF prints it, route set aside:
// "Cefazolin 2 g Q8H", "Vancomycin: pharmacy to dose", joined by "+".
export function regimenAsPrinted(regimen) {
  return regimen
    .map((r) => [r.drug, r.dose, r.frequency].filter(Boolean).join(" ") + (r.note ? `: ${r.note}` : ""))
    .join(" + ");
}

// ───────────────────────────── the checks ─────────────────────────────

export async function verify(data, { pdfPath, pdf: preRead, dump = false } = {}) {
  const errors = [];
  const notes = [];
  const fail = (m) => errors.push(m);

  let pdf = preRead;
  if (!pdf) {
    const file = pdfPath ?? path.join(ROOT, "public", data.source.file);
    if (!fs.existsSync(file)) {
      fail(`PDF not found: ${file}`);
      return { ok: false, errors, notes };
    }
    pdf = await readPdf(file);
  }
  const page = (n) => pdf.pages[n - 1] ?? { items: [], hrules: [], vrules: [], links: [], text: "", signsUnderlined: [] };

  // ── 0. Source binding, running header, page 1 ──
  const src = data.source;
  if (pdf.sha256 !== src.sha256) fail(`source.sha256 mismatch: data ${src.sha256} vs PDF ${pdf.sha256}`);
  if (!src.file.includes(src.sha256.slice(0, 12))) {
    fail(`source.file "${src.file}" does not carry the content hash prefix ${src.sha256.slice(0, 12)}`);
  }
  if (pdf.numPages !== src.pages) fail(`source.pages is ${src.pages}; the PDF has ${pdf.numPages}`);
  const header = `Review Date: ${src.reviewDate} Practice Management Guidelines`;
  for (const p of pdf.pages) {
    if (!despace(p.text).startsWith(despace(header))) fail(`page ${p.number}: the running header is not "${header}"`);
  }
  const strip = (p) => {
    const t = despace(p.text);
    return t.startsWith(despace(header)) ? t.slice(despace(header).length) : t;
  };
  // Page 1 is the printed title and the introduction, and nothing else.
  if (!Array.isArray(src.intro) || src.intro.length !== 4 || src.intro.some((s) => typeof s !== "string" || s.trim().length < 40)) {
    fail("source.intro must hold page 1's four paragraphs");
  } else if (strip(page(1)) !== despace([src.title, ...src.intro].join(" "))) {
    fail("page 1: the printed title and the four introductory paragraphs do not match the data, whole and in order");
  }

  // ── A. Indication tables, pages 2–4 ──
  const sectionIds = new Set(data.sections.map((s) => s.id));
  for (const s of data.sections) {
    if (!["prophylaxis", "empiric"].includes(s.kind)) fail(`section "${s.id}": kind must be "prophylaxis" or "empiric"`);
    // `kind` picks the dosing table a row's doses are looked up in, so it must be
    // the one the printed title names (the title itself is checked below).
    const titled = /surgical prophylaxis$/.test(norm(s.printedTitle)) ? "prophylaxis" : /^empiric /.test(norm(s.printedTitle)) ? "empiric" : null;
    if (titled !== s.kind) fail(`section "${s.id}": kind "${s.kind}", but its printed title "${s.printedTitle}" is ${titled ?? "neither"}`);
    if (!Array.isArray(s.columns) || s.columns.length !== 4) fail(`section "${s.id}": four printed column headers are required`);
  }
  for (const ind of data.indications) {
    if (!sectionIds.has(ind.section)) fail(`${ind.id}: unknown section "${ind.section}"`);
    if (![2, 3, 4].includes(ind.page)) fail(`${ind.id}: page must be 2, 3 or 4 (the indication tables); got ${ind.page}`);
    const named = new Set(data.drugs ? Object.keys(data.drugs) : []);
    const check = (d, where) => {
      if (typeof d !== "string" || !d.trim()) fail(`${ind.id}: an empty drug name in ${where}`);
      else if (!named.has(d)) fail(`${ind.id}: "${d}" in ${where} has no entry in drugs{}`);
    };
    if (ind.preferred == null) {
      // The PDF prints N/A across a row with no preferred antibiotic.
      if (ind.alternative != null || ind.duration != null) fail(`${ind.id}: a row with no preferred antibiotic is N/A in every column`);
    } else {
      if (!Array.isArray(ind.preferred) || !ind.preferred.length) fail(`${ind.id}: preferred must be a non-empty list or null`);
      else ind.preferred.forEach((d) => check(d, "preferred"));
    }
    if (ind.alternative != null) {
      if (!Array.isArray(ind.alternative) || !ind.alternative.length) fail(`${ind.id}: alternative must be a non-empty list or null`);
      else
        for (const line of ind.alternative) {
          if (!Array.isArray(line.options) || !line.options.length || line.options.some((o) => !Array.isArray(o) || !o.length)) {
            fail(`${ind.id}: each alternative line needs a non-empty list of non-empty options`);
            continue;
          }
          line.options.flat().forEach((d) => check(d, "alternative"));
          // "Linezolid alternative: …" stands in for a drug the row prefers.
          if (line.for != null && !(ind.preferred || []).includes(line.for)) {
            fail(`${ind.id}: an alternative "for ${line.for}", which is not a preferred drug of the row`);
          }
        }
    }
    if (ind.duration != null && (!Array.isArray(ind.duration) || !ind.duration.length || ind.duration.some((t) => typeof t !== "string" || !t.trim()))) {
      fail(`${ind.id}: duration must be a non-empty list of lines or null`);
    }
  }

  const matched = new Map(); // indication id → row
  const printedOrder = [];
  let rowsSeen = 0;
  const tables = [
    [REGIONS.surgery2, ["trauma", "egs"]],
    [REGIONS.elective, ["elective"]],
    [REGIONS.empiric, ["empiric"]],
  ];
  const sectionByPrinted = new Map(data.sections.map((s) => [norm(s.printedTitle), s]));
  const headersSeen = new Set();
  for (const [region, expectSections] of tables) {
    let current = null;
    let headerOk = false;
    for (const row of tableGrid(page(region.page), region)) {
      if (dump) console.log(`p${region.page} [${current?.id ?? "-"}] [${row.top.toFixed(1)}..${row.bottom.toFixed(1)}]`, JSON.stringify(row.cells));
      if (row.cells.length === 1) {
        // A merged row: the page's banner or a section title.
        const s = sectionByPrinted.get(norm(row.cells[0]));
        if (s) {
          current = s;
          headerOk = false;
          if (!expectSections.includes(s.id)) fail(`page ${region.page}: section "${s.id}" is printed where the data does not expect it`);
          if (s.page !== region.page) fail(`section "${s.id}": data says page ${s.page}, printed on page ${region.page}`);
        }
        continue;
      }
      if (row.cells.length !== 4) {
        fail(`page ${region.page}: a table row with ${row.cells.length} cells (expected 4): ${row.cells.join(" | ")}`);
        continue;
      }
      if (!current) {
        fail(`page ${region.page}: a table row under no recognised section title: ${row.cells.join(" | ")}`);
        continue;
      }
      // The column headers come first in each section.
      if (!headerOk) {
        const got = row.cells.map(norm);
        const want = current.columns.map(norm);
        if (!sameSeq(got, want)) fail(`section "${current.id}": column headers\n      PDF : ${row.cells.join(" | ")}\n      data: ${current.columns.join(" | ")}`);
        headerOk = true;
        headersSeen.add(current.id);
        continue;
      }
      rowsSeen++;
      const nameText = norm(row.cells[0]);
      const candidates = data.indications.filter((ind) => norm(ind.name) === nameText);
      if (candidates.length !== 1) {
        fail(`p${region.page}: PDF row "${row.cells[0]}" matches ${candidates.length} data entries (expected exactly 1)`);
        continue;
      }
      const ind = candidates[0];
      if (matched.has(ind.id)) {
        fail(`p${region.page}: data entry "${ind.id}" matched a second PDF row ("${row.cells[0]}")`);
        continue;
      }
      matched.set(ind.id, row);
      printedOrder.push(ind.id);
      if (ind.page !== region.page) fail(`${ind.id}: data says page ${ind.page}, PDF row is on page ${region.page}`);
      if (ind.section !== current.id) fail(`${ind.id}: data section "${ind.section}", but the PDF prints this row under "${current.id}"`);
      const exp = expectedCells(ind);
      for (const fix of CELL_CORRECTIONS.filter((c) => c.row === ind.id)) {
        if (!Array.isArray(ind.duration) || ind.duration[fix.line] !== fix.here) {
          fail(`${ind.id} / duration: line ${fix.line + 1} must read "${fix.here}" (a listed correction)`);
        } else {
          exp[3] = ind.duration.map((l, i) => (i === fix.line ? fix.pdf : l)).join(" ");
        }
      }
      ["name", "preferred", "alternative", "duration"].forEach((col, k) => {
        const got = norm(row.cells[k]);
        const want = norm(exp[k]);
        if (got !== want) fail(`${ind.id} / ${col}:\n      PDF : ${got}\n      data: ${want}`);
      });
    }
  }
  for (const s of data.sections) {
    if (!headersSeen.has(s.id)) fail(`section "${s.id}": its printed title "${s.printedTitle}" and column headers were not found`);
    if (!data.indications.some((i) => i.section === s.id)) fail(`section "${s.id}" has no indications`);
  }
  for (const ind of data.indications) {
    if (!matched.has(ind.id)) fail(`${ind.id}: no PDF row on page ${ind.page} carries its name ("${ind.name}")`);
  }
  for (const fix of CELL_CORRECTIONS) {
    if (!matched.has(fix.row)) fail(`the correction to "${fix.row}" names no matched indication row`);
  }
  // Rows are shown in the data's order, so it must be the PDF's: two rows
  // swapped passed every cell check (Codex review, 2026-10-16).
  for (const s of data.sections) {
    const want = data.indications.filter((i) => i.section === s.id).map((i) => i.id);
    const got = printedOrder.filter((id) => want.includes(id));
    if (got.length === want.length && !sameSeq(got, want)) fail(`section "${s.id}": the rows are not in the PDF's order\n      PDF : ${got.join(", ")}\n      data: ${want.join(", ")}`);
  }
  const EXPECTED_ROWS = { trauma: 14, egs: 6, elective: 6, empiric: 14 };
  const total = Object.values(EXPECTED_ROWS).reduce((a, b) => a + b, 0);
  if (rowsSeen !== total) fail(`found ${rowsSeen} indication rows on pages 2–4; the PDF prints ${total}`);
  for (const [id, n] of Object.entries(EXPECTED_ROWS)) {
    const have = data.indications.filter((i) => i.section === id).length;
    if (have !== n) fail(`section "${id}": data has ${have} indications; the PDF prints ${n}`);
  }

  // ── B. Dosing tables ──
  // The pages the data names must be the ones the tables are read from (Codex
  // review, 2026-10-16: they were never compared).
  for (const [label, obj, want] of [
    ["prophylaxisDosing", data.prophylaxisDosing, REGIONS.prophylaxisDosing.page],
    ["empiricDosing", data.empiricDosing, REGIONS.empiricDosing.page],
    ["openFractures", data.openFractures, REGIONS.classification.page],
  ]) {
    if (obj.page !== want) fail(`${label}.page is ${obj.page}; the PDF prints it on page ${want}`);
  }
  // Every drug in drugs{} is one the PDF names: the By-drug page lists them all
  // under "Every agent named in the PMG", and an invented one passed (Codex review,
  // 2026-10-16). The names are checked against the verified tables.
  {
    const named = new Set([
      ...data.indications.flatMap((i) => [...(i.preferred || []), ...(i.alternative || []).flatMap((l) => l.options.flat())]),
      ...data.prophylaxisDosing.rows.map((r) => r.drug),
      ...data.empiricDosing.rows.map((r) => r.drug),
      ...[...data.openFractures.selection, ...data.openFractures.contamination.items].flatMap((e) =>
        [...e.regimen, ...(e.allergy?.regimen ?? [])].map((r) => r.drug)
      ),
    ]);
    for (const d of Object.keys(data.drugs)) if (!named.has(d)) fail(`drugs{} lists "${d}", which no verified table names`);
  }
  const pd = data.prophylaxisDosing;
  {
    const rows = tableGrid(page(3), REGIONS.prophylaxisDosing);
    if (dump) rows.forEach((r) => console.log("p3 dosing", JSON.stringify(r.cells)));
    const title = rows.find((r) => r.cells.length === 1);
    if (!title || norm(title.cells[0]) !== norm(pd.title)) fail(`page 3: the prophylaxis dosing table's title is not "${pd.title}"`);
    const grid = rows.filter((r) => r.cells.length === 4);
    const [head, ...body] = grid;
    const cols = [pd.columns.drug, pd.columns.dose, pd.columns.redose, pd.columns.infusion];
    if (!head || !sameSeq(head.cells.map(norm), cols.map(norm))) {
      fail(`page 3 prophylaxis dosing headers\n      PDF : ${head?.cells.join(" | ")}\n      data: ${cols.join(" | ")}`);
    }
    if (rows.length !== grid.length + 1) fail(`page 3: the prophylaxis dosing table has rows that are neither its title nor four cells`);
    compareDosingRows("prophylaxis dosing (page 3)", body.map((r) => r.cells), pd.rows, (r) => [r.drug, r.dose.join(" "), r.redose, r.infusion], fail);
    if (pd.rows.length !== 8) fail(`prophylaxis dosing: data has ${pd.rows.length} rows; the PDF prints 8`);
    if (pd.rows.some((r) => !Array.isArray(r.dose) || !r.dose.length)) fail("prophylaxis dosing: each dose is a non-empty list of lines");
  }
  const ed = data.empiricDosing;
  {
    const rows = tableGrid(page(4), REGIONS.empiricDosing);
    if (dump) rows.forEach((r) => console.log("p4 dosing", JSON.stringify(r.cells)));
    const singles = rows.filter((r) => r.cells.length === 1);
    const grid = rows.filter((r) => r.cells.length === 8);
    if (rows.length !== singles.length + grid.length) fail("page 4: the empiric dosing table has rows that are neither one cell nor eight");
    if (singles.length !== 2 || norm(singles[0].cells[0]) !== norm(ed.title)) fail(`page 4: the empiric dosing table's title is not "${ed.title}"`);
    // The footnote under the table: compared without spaces, as the text layer
    // splits a word of it ("d" "osing") with a gap.
    if (singles.length !== 2 || despace(singles[1].cells[0]) !== despace(ed.footnote)) fail("page 4: the empiric dosing footnote does not match the data");
    if (typeof ed.footnote !== "string" || ed.footnote.trim().length < 40) fail("empiric dosing: the footnote is blank or implausibly short");
    const [head, ...body] = grid;
    const cols = [ed.columns.drug, ed.columns.dose, ed.columns.route, ed.columns.frequency];
    if (!head || !sameSeq(head.cells.map(norm), [...cols, ...cols].map(norm))) {
      fail(`page 4 empiric dosing headers\n      PDF : ${head?.cells.join(" | ")}\n      data: ${cols.join(" | ")} (twice)`);
    }
    // Two halves side by side: the left column of rows, top to bottom, then the
    // right, as the data lists them (alphabetical, as printed). The last right
    // half is a row of dashes.
    const left = body.map((r) => r.cells.slice(0, 4));
    const right = body.map((r) => r.cells.slice(4));
    const filler = right.filter((c) => c.every((x) => norm(x) === "-"));
    if (filler.length !== 1 || right[right.length - 1] !== filler[0]) fail("page 4: the empiric dosing table's right half should end in one row of dashes");
    compareDosingRows(
      "empiric dosing (page 4)",
      [...left, ...right.filter((c) => !filler.includes(c))],
      ed.rows,
      (r) => [r.drug, r.dose, r.route, r.frequency],
      fail
    );
    if (ed.rows.length !== 19) fail(`empiric dosing: data has ${ed.rows.length} rows; the PDF prints 19`);
  }
  // Every underlined sign the PDF draws must be one the data carries.
  for (const p of pdf.pages) {
    for (const s of p.signsUnderlined) {
      if (p.number !== 3 || !pd.rows.some((r) => r.dose.some((l) => norm(s).includes(norm(l))))) {
        fail(`page ${p.number}: an underlined sign ("${s}") that no dosing cell in the data carries`);
      }
    }
  }

  // ── C. Re-dosing rules, page 3 ──
  {
    const left = page(3).items.filter(inRegion(REGIONS.redosingText));
    const text = pageText(left);
    const groups = data.redosingRules;
    if (!Array.isArray(groups) || groups.length !== 2) fail("redosingRules: the two headed lists of page 3 are required");
    else {
      groups.forEach((g, k) => {
        const next = groups[k + 1]?.heading ? `${groups[k + 1].heading}:` : null;
        const printed = bulletItems(text, `${g.heading}:`, next);
        const want = g.items.map((t) => loose(t));
        if (!printed) fail(`page 3: the heading "${g.heading}:" is not printed`);
        else if (!sameSeq(printed.map((x) => `${x.level}:${x.text}`), want.map((t) => `1:${t}`))) {
          fail(`page 3 re-dosing rules under "${g.heading}"\n      PDF : ${printed.map((x) => x.text).join(" | ")}\n      data: ${want.join(" | ")}`);
        }
        if (!g.items.length) fail(`redosingRules "${g.heading}": no items`);
      });
      // Nothing else is printed there: the first heading starts the text.
      if (!despace(text).startsWith(despace(`${groups[0].heading}:`))) fail("page 3: text precedes the first re-dosing heading");
    }
  }

  // ── D. Open fractures, page 5 ──
  const of = data.openFractures;
  const p5 = page(5).text;
  const n5 = norm(p5);
  const mustPrint = (label, printed) => {
    if (!n5.includes(norm(printed))) fail(`page 5 does not print ${label} whole and in place: "${printed}"`);
  };
  if (typeof of.timing !== "string" || of.timing.trim().length < 12) fail("openFractures.timing is blank or implausibly short");
  mustPrint("its title and the classification heading", `${of.title} ${of.classification.heading}:`);
  mustPrint("the timing rule", `Antibiotic Timing: • ${of.timing} Antibiotic Selection:`);
  // The heading is the data's, not a literal: the view prints it (Codex review, 2026-10-16).
  if (typeof of.contamination.heading !== "string" || of.contamination.heading.trim().length < 12) fail("openFractures.contamination.heading is blank");
  mustPrint("the contamination heading and its scope", `${of.contamination.heading}: ${of.contamination.scope} •`);

  const drugNames = Object.keys(data.drugs).map(loose);
  const entrySeq = (entries) =>
    entries.flatMap((e) => [`1:${loose(`${e.applies} ${e.text}`)}`, ...(e.allergy ? [`2:${loose(`${e.allergy.applies} ${e.allergy.text}`)}`] : [])]);
  const checkRegimen = (id, e) => {
    if (!e.applies || !e.text || !Array.isArray(e.regimen) || !e.regimen.length) {
      fail(`open fracture "${id}": applies, text and a non-empty regimen are required`);
      return;
    }
    // The display tuples must re-state the printed bullet exactly (route aside).
    const printed = loose(regimenAsPrinted(e.regimen));
    if (printed !== loose(e.text)) fail(`open fracture "${id}": the structured regimen does not re-state the text\n      text   : ${loose(e.text)}\n      regimen: ${printed}`);
    for (const r of e.regimen) {
      // Each part in its own field, so what the pill draws as the dose is the dose.
      if (r.dose != null && !/^\d+(?:\.\d+)? (?:g|mg)$/.test(r.dose)) fail(`open fracture "${id}": ${r.drug} dose "${r.dose}" is not shaped like a dose`);
      if (r.frequency != null && !/^Q\d+H$/.test(r.frequency)) fail(`open fracture "${id}": ${r.drug} frequency "${r.frequency}" is not shaped like a frequency`);
      if (r.dose == null && r.note == null) fail(`open fracture "${id}": ${r.drug} has neither a dose nor a note`);
      if (r.note != null && (typeof r.note !== "string" || /[\d*]/.test(r.note) || drugNames.some((n) => loose(r.note).includes(n)))) {
        fail(`open fracture "${id}": ${r.drug} note "${r.note}" is not a note`);
      }
      if (!data.drugs[r.drug]) fail(`open fracture "${id}": "${r.drug}" has no entry in drugs{}`);
    }
    const listed = new Set(e.regimen.map((r) => loose(r.drug)));
    for (const n of drugNames) {
      if (loose(e.text).includes(n) && !listed.has(n)) fail(`open fracture "${id}": the text names ${n}, the regimen has no entry for it`);
    }
  };
  for (const e of [...of.selection, ...of.contamination.items]) {
    checkRegimen(e.id, e);
    if (e.allergy) checkRegimen(`${e.id} (allergy)`, e.allergy);
  }
  const compareList = (label, printed, want) => {
    if (!printed) fail(`page 5: could not locate the printed list for ${label}`);
    else {
      const got = printed.map((x) => `${x.level}:${x.text}`);
      if (!sameSeq(got, want)) fail(`${label}: the printed list and the data differ\n      PDF : ${got.join(" | ")}\n      data: ${want.join(" | ")}`);
    }
  };
  compareList("antibiotic selection", bulletItems(p5, "Antibiotic Selection:", "Open Fracture Contamination:"), entrySeq(of.selection));
  compareList("open fracture contamination", bulletItems(p5, `${of.contamination.scope}`, "Antibiotic Duration:"), entrySeq(of.contamination.items));
  compareList(
    "antibiotic duration",
    bulletItems(p5, "Antibiotic Duration:", null),
    of.duration.map((d) => `1:${loose(`${d.applies} - ${d.value}`)}`)
  );
  if (of.selection.length !== 2 || of.contamination.items.length !== 1 || of.duration.length !== 2) {
    fail("open fractures: expected 2 selection bullets, 1 contamination bullet and 2 durations");
  }
  const ids = [...of.selection, ...of.contamination.items].map((e) => e.id);
  if (new Set(ids).size !== ids.length) fail("open fractures: duplicate regimen id");

  // Gustilo-Anderson classification, rebuilt from its borders.
  {
    const rows = tableGrid(page(5), REGIONS.classification);
    if (dump) rows.forEach((r) => console.log("p5 class", JSON.stringify(r.cells)));
    const c = of.classification;
    const [head, ...body] = rows;
    if (!head || head.cells.length !== 2 || norm(head.cells[0]) !== norm(c.columns[0]) || norm(head.cells[1]) !== norm(c.columns[1])) {
      fail(`page 5 classification header\n      PDF : ${head?.cells.join(" | ")}\n      data: ${c.columns.join(" | ")}`);
    }
    if (body.length !== c.types.length) fail(`page 5 classification: PDF prints ${body.length} type rows, data has ${c.types.length}`);
    const subtypeCount = c.types.reduce((n, t) => n + (t.subtypes || []).length, 0);
    if (c.types.length !== 3 || subtypeCount !== 3) fail(`classification: expected 3 types with 3 subtypes in all, data has ${c.types.length} and ${subtypeCount}`);
    const used = new Set();
    for (const t of c.types) {
      const subs = t.subtypes || [];
      if (!t.description && !subs.length) fail(`classification ${t.type}: a description or subtypes are required`);
      const row = body.find((r) => r.cells.length === 2 && norm(r.cells[0]) === norm(t.type));
      if (!row) {
        fail(`page 5 classification: no row for "${t.type}"`);
        continue;
      }
      if (used.has(row)) fail(`classification ${t.type}: the data lists this type twice`);
      used.add(row);
      if (body.indexOf(row) !== c.types.indexOf(t)) fail(`classification ${t.type}: not in the PDF's order`);
      const want = loose([t.description, ...subs.map((s) => `${s.code}: ${s.description}`)].filter(Boolean).join(" "));
      const got = loose(row.cells[1]);
      if (got !== want) fail(`classification ${t.type}:\n      PDF : ${got}\n      data: ${want}`);
    }
  }

  // ── E. References, pages 6–8 ──
  const refs = data.references;
  if (refs.length !== 35) fail(`expected 35 references, data has ${refs.length}`);
  refs.forEach((r, i) => {
    if (r.n !== i + 1) fail(`reference numbering: entry ${i} has n=${r.n}`);
    if (![6, 7, 8].includes(r.page)) fail(`reference ${r.n}: page must be 6, 7 or 8`);
  });
  const printedRefs = [6, 7, 8].map((n) => strip(page(n))).join("");
  const run = despace(`Reference ${refs.map((r) => `${r.n}. ${r.text}${r.url ? " " + r.url : ""}`).join(" ")}`);
  if (printedRefs !== run) {
    // Say which entry first departs from the page, so a failure is readable.
    let k = 0;
    while (k < run.length && run[k] === printedRefs[k]) k++;
    fail(`pages 6–8: the references are not printed as one run, in order, to the end of page 8 — first difference near: "${printedRefs.slice(Math.max(0, k - 40), k + 40)}"`);
  }
  // A URL belongs in `url`, which the Source page links; moved into `text` it
  // printed the same run and lost its link (Codex review, 2026-10-16). And every
  // link annotation on pages 6–8 must be the url of a reference starting on that
  // page, so a dropped url fails even where the run still matches.
  for (const r of refs) {
    if (/https?:\/\/|doi\.org\//i.test(r.text)) fail(`reference ${r.n}: its text holds a URL; it belongs in url`);
  }
  for (const n of [6, 7, 8]) {
    for (const url of new Set(page(n).links.map((l) => l.url))) {
      if (!refs.some((r) => r.page === n && r.url && sameUrl(r.url, url))) fail(`page ${n}: the link to ${url} is no reference's url on that page`);
    }
  }
  // Each reference's own page: its entry starts there.
  for (const r of refs) {
    if (!strip(page(r.page)).includes(despace(`${r.n}. ${r.text}`).slice(0, 40))) fail(`reference ${r.n}: not printed on page ${r.page}`);
    if (r.url && !page(r.page).links.some((l) => sameUrl(l.url, r.url))) {
      fail(`reference ${r.n}: ${r.url} is not a link annotation on page ${r.page}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    notes,
    summary: { rows: rowsSeen, indications: data.indications.length, matched: matched.size },
  };
}

// Compares a printed dosing table (rows of cells, in order) with the data's rows
// (in order), cell by cell.
function compareDosingRows(label, printed, rows, cellsOf, fail) {
  if (printed.length !== rows.length) fail(`${label}: the PDF prints ${printed.length} rows, the data has ${rows.length}`);
  const seen = new Set();
  rows.forEach((row, k) => {
    if (seen.has(row.drug)) fail(`${label}: ${row.drug} is listed twice`);
    seen.add(row.drug);
    const want = cellsOf(row);
    const got = printed[k];
    if (!got) return;
    want.forEach((w, c) => {
      if (typeof w !== "string" || !w.trim()) fail(`${label}: ${row.drug}, column ${c + 1} is empty in the data`);
      if (norm(got[c]) !== norm(w)) fail(`${label} / ${row.drug}, column ${c + 1}:\n      PDF : ${got[c]}\n      data: ${w}`);
    });
  });
}

// ───────────────────────────── CLI ─────────────────────────────

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const dump = process.argv.includes("--dump");
  const data = await import(pathToFileURL(path.join(ROOT, "src", "data", "pmg.js")).href);
  const result = await verify(data, { dump });
  for (const n of result.notes) console.log("note:", n);
  if (result.ok) {
    console.log(
      `PASS — ${result.summary.matched} indications matched ${result.summary.rows} PDF table rows (cells, sections, column headers and pages); both dosing tables, the re-dosing rules, the open-fracture page, page 1 and the 35 references all agree with the PDF. Not checked: display labels, aliases, brand/class metadata, the dose lookup on indication rows (tested separately), or whether the PDF itself is right.`
    );
    process.exit(0);
  }
  console.error(`FAIL — ${result.errors.length} problem(s):`);
  for (const e of result.errors) console.error("  - " + e);
  process.exit(1);
}
