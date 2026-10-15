// Verifies src/data/pmg.js against the source PDF, in both directions.
//
// Why this exists: the data file was transcribed by hand from a PDF whose text
// layer scrambles table columns. A transcription error here is a wrong drug or
// dose attached to a diagnosis, and it would look entirely plausible. This
// script re-reads the PDF with pdf.js, rebuilds every table row from the
// printed cell geometry, and compares each cell with the data file. It proves
// the data matches the PDF; it cannot prove the PDF is right.
//
// What it checks, and what it cannot:
//   0. Source binding — the PDF in public/ hashes to source.sha256, carries that
//      hash in its filename, and has source.pages pages.
//   A. Indication tables (pages 1–2) — row bands come from the table's own
//      horizontal cell borders, columns from measured x-bands. Every PDF row
//      carrying an indication name must match exactly one data entry and
//      vice-versa (bijection); every indication must sit on page 1 or 2; the
//      section each row sits under (from the printed section header) must equal
//      the data entry's section; all seven cells must equal the data entry's
//      values exactly, after normalisation. N/A rows must be N/A everywhere.
//   B. Open fractures (pages 3–4) — each printed list is compared as a whole
//      set with the data: the four antimicrobial bullets (label + regimen), the
//      two duration bullets (fracture type + duration), the two debridement
//      rules, the stable/unstable femoral-shaft rules, and the Gustilo-Anderson
//      table rebuilt from its borders (type cell + description cell). The timing
//      rule and the two headings are compared with the PDF's text around them
//      (the bullet or page heading before; the next bullet, or the heading's own
//      colon, after), so neither end can be cut off.
//      The structured regimen the app DISPLAYS is required to be a one-to-one
//      re-statement of the verified prose (drug + footnote mark + dose + route +
//      frequency + note, in order), so a display tuple cannot drift from the text.
//   C. Dosing table (page 4) — rebuilt from its borders and three column bands;
//      the drug cell (with its footnote mark), the adult cell and the pediatric
//      cell of each row must each equal the data exactly, comparison operators
//      included; the header labels too. The two footnotes, each non-empty and
//      after its own mark, must be printed as one run ending at "• Duration:".
//   D. Fever workup (page 5) — an image, so only the three "Reference Standards"
//      links are checked, each link annotation bound to the label text printed
//      inside its rectangle, and its Bing-wrapped target decoded to the data URL.
//      The flowchart text itself is NOT verified by this script.
//   E. References (page 12) — each numbered reference must appear as one
//      contiguous string (number, text, and printed DOI/URL), all thirteen as
//      one run to the end of the page, and each web URL must be a link
//      annotation on the page (the DOIs are printed, not linked, in this PDF).
//
// Not covered, deliberately or by necessity: the page-5 flowchart text (pinned
// by hash in tests/pmg.test.js, which cannot read it either); the `short`
// display labels (tests/pmg.test.js checks their words and negations against
// the PDF row name) and the `aliases` (search hints nothing checks); the
// app-authored brand / class table; and whether the PDF's own values are right.
//
// Anything that compares implausibly little fails outright. The expected
// structure of pages 3–4 (4 regimens, 2 durations, 2 debridement rules, 3
// fracture types with 3 subtypes, 4 dosing rows, 13 references) is asserted
// exactly; a new edition of the PDF must revisit those constants.
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
// checks the two lists against each other, in both directions).
export const TYPO_MAP = [
  ["transfustion", "transfusion"],
  ["nectrotizing", "necrotizing"],
  ["ertapenum", "ertapenem"],
  ["7days", "7 days"],
  ["every 4 hour ", "every 4 hours "],
  ["pharmacy to dos ", "pharmacy to dose "],
  // Not a typo: the open-fracture bullets print cefepime with no route; the app
  // adds IV (Thiago, 2026-10-12). The map applies to the data too, so it cannot be
  // relied on to notice the route going missing; tests/pmg.test.js pins it.
  ["cefepime* 2g q8 hours", "cefepime* 2g iv q8 hours"],
];

export function norm(s) {
  let t = String(s ?? "")
    .toLowerCase()
    .replace(/[–—−­]/g, "-") // en/em dash, minus, soft hyphen → hyphen
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  t = " " + t + " ";
  for (const [from, to] of TYPO_MAP) t = t.split(from).join(to);
  t = t
    .replace(/\s*\/\s*/g, "/") // "Infection / CAUTI" == "Infection/CAUTI"
    .replace(/(\d)\s+(g|mg|ml|kg|h|hrs)\b/g, "$1$2") // "2 g" == "2g"
    .replace(/\s*-\s*/g, "-") // "48 - 72" == "48-72"
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

// Looser form for prose pages: punctuation and bullet glyphs become spaces;
// comparison operators ("<" ">" "≥" "≤"), "/" "*" "+" "%" are kept, so a
// reversed threshold or a dropped footnote mark still differs; Word's "o"
// sub-bullet marker is removed.
//
// A point between two digits, and a dash before a digit, are part of a number
// and are kept: "1.5g/dose" and "1–5g/dose" both became "1 5g/dose" before
// v0.7.11, and "max -1.5g/dose" became "max 1 5g/dose" (Codex reviews,
// 2026-10-14).
export function loose(s) {
  return norm(s)
    .replace(/[^a-z0-9/<>≥≤*+%.\-\s]/g, " ")
    .replace(/(?<!\d)\.|\.(?!\d)/g, " ")
    .replace(/-(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(^| )o(?= |$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// The items of a bulleted list printed between two markers, as loose strings.
// Top-level bullets are "•", sub-bullets Word's "o". Returns null when a marker
// is missing, which callers treat as a failure.
export function bulletsBetween(text, start, end) {
  const t = norm(text);
  const i = t.indexOf(norm(start));
  if (i < 0) return null;
  const from = i + norm(start).length;
  const j = end ? t.indexOf(norm(end), from) : t.length;
  if (j < 0) return null;
  return t
    .slice(from, j)
    .split(/\s*(?:•|(?<![a-z0-9])o(?![a-z0-9]))\s*/)
    .map((s) => loose(s))
    .filter(Boolean);
}

const sameSet = (a, b) => a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");

// For references: every space removed, so line breaks and justified spacing
// cannot matter, and only one contiguous string can match.
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
      .map((it) => ({ x: it.transform[4], y: it.transform[5], s: it.str.replace(/\s+/g, " ").trim() }));

    // Horizontal cell borders. Word emits table borders as thin filled
    // rectangles, one per cell edge; their y positions are the row boundaries.
    const hrules = [];
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] !== pdfjs.OPS.constructPath) continue;
      const [subOps, coords] = ops.argsArray[i];
      let ci = 0;
      for (const so of subOps) {
        if (so === pdfjs.OPS.rectangle) {
          const [, y, w, h] = coords.slice(ci, ci + 4);
          ci += 4;
          if (Math.abs(h) <= 2.5 && Math.abs(w) >= 20) hrules.push(y + Math.min(0, h) + Math.abs(h) / 2);
        } else if (so === pdfjs.OPS.moveTo || so === pdfjs.OPS.lineTo) ci += 2;
        else if (so === pdfjs.OPS.curveTo) ci += 6;
        else if (so === pdfjs.OPS.curveTo2 || so === pdfjs.OPS.curveTo3) ci += 4;
      }
    }

    const links = (await page.getAnnotations())
      .filter((a) => a.subtype === "Link" && a.url)
      .map((a) => ({ url: a.url, rect: a.rect }));

    pages.push({ number: p, items, hrules: clusterYs(hrules), links, text: pageText(items) });
  }
  return { sha256: createHash("sha256").update(bytes).digest("hex"), numPages: doc.numPages, pages };
}

function clusterYs(ys) {
  const sorted = [...ys].sort((a, b) => b - a);
  const out = [];
  for (const y of sorted) {
    if (!out.length || Math.abs(out[out.length - 1] - y) > 1.5) out.push(y);
  }
  return out; // descending (top of page first)
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
    .map(([, its]) => its.sort((a, b) => a.x - b.x).map((i) => i.s).join(" "))
    .join(" ");
}

// Text printed inside a link annotation's rectangle — the link's visible label.
function linkLabel(page, rect) {
  const [x1, y1, x2, y2] = rect;
  const its = page.items.filter((it) => it.y >= y1 - 2 && it.y <= y2 + 2 && it.x >= x1 - 3 && it.x <= x2 + 3);
  return pageText(its);
}

// Bing click-tracking links carry the destination as u=a1<base64>.
export function decodeTrackedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("bing.com")) {
      const enc = u.searchParams.get("u");
      if (enc && enc.startsWith("a1")) {
        const b64 = enc.slice(2).replace(/-/g, "+").replace(/_/g, "/");
        return Buffer.from(b64, "base64").toString("utf8");
      }
    }
    u.searchParams.delete("utm_source");
    return u.toString();
  } catch {
    return url;
  }
}

const sameUrl = (a, b) => String(a).replace(/\/$/, "") === String(b).replace(/\/$/, "");

// ───────────────────────────── table geometry ─────────────────────────────

// Column boundaries (points from the left edge) shared by the three indication
// tables on pages 1–2. Measured from the PDF: names at x≈10–15, antibiotic at
// 174–186, dose at 255–265, frequency ≈300, duration ≈365, redose 545–550,
// alternative ≈630 (with trailing "or"/"+/-" out at ≈770).
const INDICATION_COLS = [
  ["name", 0, 170],
  ["drug", 170, 250],
  ["dose", 250, 295],
  ["frequency", 295, 355],
  ["duration", 355, 540],
  ["redose", 540, 625],
  ["alternative", 625, Infinity],
];

// The page-4 dosing table (portrait page, 612 pt wide): drug < 150, adult
// 150–285, pediatric ≥ 285.
const DOSING_COLS = [
  ["drug", 0, 150],
  ["adult", 150, 285],
  ["pediatric", 285, Infinity],
];

// The page-3 Gustilo-Anderson table: type < 170, description ≥ 170.
const CLASSIFICATION_COLS = [
  ["type", 0, 170],
  ["description", 170, Infinity],
];

const COLUMN_HEADER_ROW = "injury";

// The one PDF label that is cut off mid-word. Only this id may match by the
// printed prefix, and only against exactly this printed text.
// The completion is pinned too: matching by id alone accepted any name for the
// row, so the UTI regimen could have been relabelled as another indication
// (Codex whole-codebase review, 2026-10-14).
const TRUNCATED_LABELS = {
  "complicated-uti": {
    printed: "Complicated Urinary Tract Infection/CAUTI/Urologic Instr",
    full: "Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation",
  },
};

export function tableRows(page, cols) {
  const bounds = page.hrules;
  const rows = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const top = bounds[i];
    const bottom = bounds[i + 1];
    if (top - bottom < 6) continue; // a double border, not a row
    const inside = page.items.filter((it) => it.y < top && it.y > bottom);
    if (!inside.length) continue;
    const cells = {};
    for (const [col, x0, x1] of cols) {
      const its = inside.filter((it) => it.x >= x0 && it.x < x1).sort((a, b) => b.y - a.y || a.x - b.x);
      cells[col] = its.map((i) => i.s).join(" ");
    }
    rows.push({ top, bottom, cells, all: pageText(inside) });
  }
  return rows;
}

// ───────────────────────────── expected values ─────────────────────────────

function expectedCells(ind) {
  if (!ind.regimen) {
    return { drug: "N/A", dose: "N/A", frequency: "N/A", duration: "N/A", redose: "N/A", alternative: "N/A" };
  }
  const freqs = [];
  for (const r of ind.regimen) if (!freqs.includes(r.frequency)) freqs.push(r.frequency);
  const alt = ind.alternative == null ? "N/A" : Array.isArray(ind.alternative) ? ind.alternative.join(" ") : ind.alternative;
  return {
    drug: ind.regimen.map((r) => r.drug).join(" plus ") + (ind.regimenNote ? " " + ind.regimenNote : ""),
    dose: ind.regimen.map((r) => r.dose).join(" "),
    frequency: freqs.join(" "),
    duration: ind.duration ? ind.duration.join(" ") : "N/A",
    redose: ind.redose ?? "N/A",
    alternative: alt,
  };
}

const markOf = (entry, footnotes) => (entry.footnote ? footnotes[entry.footnote]?.mark ?? "?" : "");

// The display tuple as prose: "Cefepime* 2 g q8 hours", "Vancomycin** 15 mg/kg IV q12 hours Pharmacy To Dose Consult".
export function regimenAsProse(regimen, footnotes) {
  return regimen
    .map((r) => [r.drug + markOf(r, footnotes), r.dose, r.route, r.frequency, r.note].filter(Boolean).join(" "))
    .join(" ");
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

  // 0. Source binding
  if (pdf.sha256 !== data.source.sha256) fail(`source.sha256 mismatch: data ${data.source.sha256} vs PDF ${pdf.sha256}`);
  if (!data.source.file.includes(data.source.sha256.slice(0, 12))) {
    fail(`source.file "${data.source.file}" does not carry the content hash prefix ${data.source.sha256.slice(0, 12)}`);
  }
  if (pdf.numPages !== data.source.pages) fail(`source.pages is ${data.source.pages}; the PDF has ${pdf.numPages}`);

  // A. Indication tables, pages 1–2
  const sectionByTitle = new Map(data.sections.map((s) => [norm(s.title), s.id]));
  const sectionIds = new Set(data.sections.map((s) => s.id));
  for (const ind of data.indications) {
    if (ind.page !== 1 && ind.page !== 2) fail(`${ind.id}: page must be 1 or 2 (the indication tables); got ${ind.page}`);
    if (!sectionIds.has(ind.section)) fail(`${ind.id}: unknown section "${ind.section}"`);
    if (!ind.regimen) {
      // regimenNote too: the PDF prints N/A in the drug cell, so a note here
      // would be text no cell carries (Gemini whole-codebase review, 2026-10-14).
      if (ind.duration != null || ind.redose != null || ind.alternative != null || ind.regimenNote != null) {
        fail(`${ind.id}: an N/A row must be N/A in every column (duration/redose/alternative/regimenNote must be null)`);
      }
    } else {
      for (const r of ind.regimen) {
        for (const k of ["drug", "dose", "frequency"]) {
          if (typeof r[k] !== "string" || !r[k].trim()) fail(`${ind.id}: regimen ${k} is empty`);
        }
        // One frequency per drug. The frequency cell is compared after removing
        // repeats, so without this both drugs of a pair could carry "Q8H Q12H"
        // and still match it (Codex whole-codebase review, 2026-10-14).
        if (typeof r.frequency === "string" && r.frequency.trim() && !/^(?:Q\d+H|One-time dose|Pharmacy to dose)$/.test(r.frequency)) {
          fail(`${ind.id}: regimen frequency "${r.frequency}" is not one frequency`);
        }
        if (r.route != null || r.note != null || r.footnote != null) {
          fail(`${ind.id}: the indication tables print no route, note or footnote — remove them from the regimen entry`);
        }
      }
    }
  }

  const matched = new Map(); // indication id → row
  let rowsSeen = 0;
  for (const pageNo of [1, 2]) {
    const page = pdf.pages[pageNo - 1];
    let currentSection = null;
    for (const row of tableRows(page, INDICATION_COLS)) {
      const allText = norm(row.all);
      if (sectionByTitle.has(allText)) {
        currentSection = sectionByTitle.get(allText);
        continue;
      }
      const nameText = norm(row.cells.name);
      if (!nameText || nameText === COLUMN_HEADER_ROW) continue;
      if (Object.values(row.cells).every((c) => !c.trim())) continue;
      rowsSeen++;
      if (dump) console.log(`p${pageNo} [${currentSection}] [${row.top.toFixed(1)}..${row.bottom.toFixed(1)}]`, JSON.stringify(row.cells));

      const candidates = data.indications.filter((ind) => {
        if (norm(ind.name) === nameText) return true;
        const t = TRUNCATED_LABELS[ind.id];
        return t != null && norm(t.printed) === nameText && norm(ind.name) === norm(t.full);
      });
      if (candidates.length !== 1) {
        fail(`p${pageNo}: PDF row "${row.cells.name}" matches ${candidates.length} data entries (expected exactly 1)`);
        continue;
      }
      const ind = candidates[0];
      if (matched.has(ind.id)) {
        fail(`p${pageNo}: data entry "${ind.id}" matched a second PDF row ("${row.cells.name}")`);
        continue;
      }
      matched.set(ind.id, row);
      if (ind.page !== pageNo) fail(`${ind.id}: data says page ${ind.page}, PDF row is on page ${pageNo}`);
      if (!currentSection) fail(`${ind.id}: PDF row sits under no recognised section header`);
      else if (ind.section !== currentSection) fail(`${ind.id}: data section "${ind.section}", but the PDF prints this row under "${currentSection}"`);
      if (norm(ind.name) !== nameText) notes.push(`${ind.id}: PDF label is truncated ("${row.cells.name}"); data carries the full name`);

      const exp = expectedCells(ind);
      for (const col of Object.keys(exp)) {
        const got = norm(row.cells[col]);
        const want = norm(exp[col]);
        if (got !== want) fail(`${ind.id} / ${col}:\n      PDF : ${got}\n      data: ${want}`);
      }
    }
  }
  for (const ind of data.indications) {
    if (!matched.has(ind.id)) fail(`${ind.id}: no PDF row on page ${ind.page} carries its name ("${ind.name}")`);
  }
  if (rowsSeen !== 34) fail(`found ${rowsSeen} indication rows on pages 1–2; the PDF prints 34`);
  if (data.indications.length !== 34) fail(`data has ${data.indications.length} indications; the PDF prints 34`);
  for (const s of data.sections) {
    if (!data.indications.some((i) => i.section === s.id)) fail(`section "${s.id}" has no indications`);
  }

  // B. Open fractures, pages 3–4 — each printed list compared as a whole set
  // against the data, so an item cannot be dropped, invented, shortened or
  // moved under another label.
  const of = data.openFractures;
  const fn = data.dosingTable.footnotes;
  const p3 = pdf.pages[2].text;
  const p4 = pdf.pages[3].text;
  // Prose rules are checked with the PDF's own text on both sides of them, so a
  // value can be cut short at neither end. A word-boundary phrase match passed
  // "Administer within 30 min of arrival to the ED" although the PDF goes on
  // "& all patients to have MRSA nasal screen", and a footnote cut after its
  // first sentence (Gemini whole-codebase review, 2026-10-14). The context is the
  // bullet glyph or heading before and the next bullet after; norm() keeps both.
  const n34 = norm(p3 + " " + p4);
  const mustPrint = (label, printed) => {
    if (!n34.includes(norm(printed))) fail(`pages 3–4 do not print ${label} whole and in place: "${printed}"`);
  };
  const mustMatchList = (label, printed, expected) => {
    if (!printed) fail(`pages 3–4: could not locate the printed list for ${label}`);
    else if (!sameSet(printed, expected)) {
      fail(`${label}: the printed list and the data differ\n      PDF : ${printed.join(" | ")}\n      data: ${expected.join(" | ")}`);
    }
  };

  for (const [label, value] of [
    ["openFractures.timing", of.timing],
    ["debridement heading", of.debridement.heading],
    ["femoral-shaft heading", of.femoralShaft.heading],
    ["classification title", of.classification.title],
  ]) {
    if (typeof value !== "string" || value.trim().length < 12) fail(`${label} is blank or implausibly short`);
  }
  mustPrint("the timing rule", `• Timing: ${of.timing} • Antimicrobial:`);

  // Antimicrobial bullets: three on page 3 under "Antimicrobial:", one on page
  // 4 under "Antimicrobial Cont." before the dosing table.
  const printedOn = {
    3: bulletsBetween(p3, "Antimicrobial:", null) ?? [],
    4: bulletsBetween(p4, "Antimicrobial Cont.", "Antimicrobial Adult Dosing") ?? [],
  };
  const printedAbx = [...printedOn[3], ...printedOn[4]];
  const drugNames = Object.keys(data.drugs).map(loose);
  for (const a of of.antimicrobial) {
    if (!a.applies || !a.text || !Array.isArray(a.regimen) || !a.regimen.length) {
      fail(`antimicrobial "${a.id}": applies, text and a non-empty regimen are required`);
      continue;
    }
    // The display tuples must re-state the verified prose exactly.
    const prose = loose(regimenAsProse(a.regimen, fn));
    if (prose !== loose(a.text)) {
      fail(`antimicrobial "${a.id}": the structured regimen does not re-state the text\n      text   : ${loose(a.text)}\n      regimen: ${prose}`);
    }
    // ...and each part must sit in its own field, so what the plate draws as the
    // dose is the dose. The prose check alone passed the whole regimen held in
    // `dose`, or its words shifted one field along (Gemini whole-codebase review,
    // 2026-10-14).
    for (const r of a.regimen) {
      const shape = [
        ["dose", r.dose, /^\d+(?:\.\d+)? (?:g|mg|mg\/kg)$/],
        ["route", r.route, /^(?:IV|IM|PO)$/],
        ["frequency", r.frequency, /^q\d+(?: hours|h)$/i],
      ];
      for (const [k, v, re] of shape) {
        if (typeof v !== "string" || !re.test(v)) fail(`antimicrobial "${a.id}": ${r.drug} ${k} "${v}" is not shaped like a ${k}`);
      }
      // A note is words only: no digit, no footnote mark, no drug. Otherwise it
      // could hold a whole partner ("Vancomycin** 15 mg/kg IV q12 hours…") whose
      // own entry was deleted, and the prose would still read the same (Codex
      // v0.7.11 review).
      if (r.note != null && (typeof r.note !== "string" || /[\d*]/.test(r.note) || drugNames.some((n) => loose(r.note).includes(n)))) {
        fail(`antimicrobial "${a.id}": ${r.drug} note "${r.note}" is not a note`);
      }
    }
    // Every drug the bullet names has its own entry in the displayed regimen.
    const listed = new Set(a.regimen.map((r) => loose(r.drug)));
    for (const n of drugNames) {
      if (loose(a.text).includes(n) && !listed.has(n)) fail(`antimicrobial "${a.id}": the text names ${n}, the regimen has no entry for it`);
    }
    if (![3, 4].includes(a.page)) fail(`antimicrobial "${a.id}": page must be 3 or 4`);
    else if (!printedOn[a.page].includes(loose(`${a.applies} ${a.text}`))) {
      fail(`antimicrobial "${a.id}": not printed on page ${a.page}`);
    }
  }
  mustMatchList(
    "antimicrobial bullets (label + regimen)",
    printedAbx,
    of.antimicrobial.map((a) => loose(`${a.applies} ${a.text}`))
  );
  if (of.antimicrobial.length !== 4) fail(`expected 4 open-fracture antimicrobial entries, got ${of.antimicrobial.length}`);

  // Durations: the two bullets under "Duration:".
  mustMatchList(
    "duration bullets (fracture type + duration)",
    bulletsBetween(p4, "• Duration:", "• Operative debridement"),
    of.duration.map((d) => loose(`${d.applies} - ${d.value}`))
  );

  // Operative debridement: heading, then its two bullets to the end of page 4.
  mustPrint("the debridement heading", `• ${of.debridement.heading}:`);
  mustMatchList(
    "debridement rules",
    bulletsBetween(p4, `${of.debridement.heading}:`, null),
    of.debridement.items.map(loose)
  );

  // Femoral-shaft timing: heading, then one bullet under "stable", two under "unstable".
  mustPrint("the femoral-shaft heading", `Open extremity fractures ${of.femoralShaft.heading}:`);
  mustMatchList(
    `femoral-shaft rules — ${of.femoralShaft.stable.label}`,
    bulletsBetween(p3, of.femoralShaft.stable.label, of.femoralShaft.unstable.label),
    of.femoralShaft.stable.items.map(loose)
  );
  mustMatchList(
    `femoral-shaft rules — ${of.femoralShaft.unstable.label}`,
    bulletsBetween(p3, of.femoralShaft.unstable.label, "Open extremity fractures:"),
    of.femoralShaft.unstable.items.map(loose)
  );
  if (of.femoralShaft.stable.label === of.femoralShaft.unstable.label) fail("femoral-shaft groups share a label");

  // Gustilo-Anderson classification: a two-column table on page 3, rebuilt
  // from its borders. The page's other horizontal rules (the running header)
  // also produce bands, so the table is located by its header row and the type
  // rows are the consecutive "Type …" rows that follow it.
  const classRows = tableRows(pdf.pages[2], CLASSIFICATION_COLS);
  const headerIdx = classRows.findIndex((r) => loose(r.cells.type) === loose(of.classification.title));
  if (headerIdx < 0) {
    fail(`page 3 classification title not found as a table header cell: "${of.classification.title}"`);
  } else if (loose(classRows[headerIdx].cells.description) !== "description") {
    fail(`page 3 classification header: second column reads "${classRows[headerIdx].cells.description}", not "Description"`);
  }
  const typeRows = [];
  for (let i = headerIdx + 1; headerIdx >= 0 && i < classRows.length; i++) {
    if (!/^type /.test(loose(classRows[i].cells.type))) break;
    typeRows.push(classRows[i]);
  }
  const types = of.classification.types;
  if (typeRows.length !== types.length) fail(`page 3 classification: PDF prints ${typeRows.length} type rows, data has ${types.length}`);
  const subtypeCount = types.reduce((n, t) => n + (t.subtypes || []).length, 0);
  if (types.length !== 3 || subtypeCount !== 3) {
    fail(`classification: expected 3 types with 3 subtypes in all, data has ${types.length} types and ${subtypeCount} subtypes`);
  }
  // Each PDF row is used once, so a duplicated type cannot stand in for one
  // that is missing; and the description and the subtypes are compared
  // together, as the view prints both (Codex whole-codebase review, 2026-10-14).
  const usedTypeRows = new Set();
  for (const t of types) {
    const subs = t.subtypes || [];
    if (!t.description && !subs.length) fail(`classification ${t.type}: a description or subtypes are required`);
    const row = typeRows.find((r) => loose(r.cells.type) === loose(t.type));
    if (!row) {
      fail(`page 3 classification: no row for "${t.type}"`);
      continue;
    }
    if (usedTypeRows.has(row)) fail(`classification ${t.type}: the data lists this type twice`);
    usedTypeRows.add(row);
    const want = loose([t.description, ...subs.map((s) => `${s.code}: ${s.description}`)].filter(Boolean).join(" "));
    const got = loose(row.cells.description);
    if (got !== want) fail(`classification ${t.type}:\n      PDF : ${got}\n      data: ${want}`);
  }

  // C. Dosing table, page 4 — per row, per column, exact
  const dt = data.dosingTable;
  const p4rows = tableRows(pdf.pages[3], DOSING_COLS).filter((r) => r.cells.drug.trim());
  const header = p4rows.find((r) => norm(r.cells.drug) === "antimicrobial");
  if (!header) fail("page 4: dosing table header row not found");
  else {
    if (loose(header.cells.adult) !== loose(dt.adultLabel)) fail(`page 4 adult header: PDF "${header.cells.adult}" vs data "${dt.adultLabel}"`);
    if (loose(header.cells.pediatric) !== loose(dt.pediatricLabel)) fail(`page 4 pediatric header: PDF "${header.cells.pediatric}" vs data "${dt.pediatricLabel}"`);
  }
  const drugRows = p4rows.filter((r) => r !== header);
  if (drugRows.length !== 4) fail(`page 4: expected 4 dosing rows, found ${drugRows.length}`);
  if (dt.rows.length !== 4) fail(`data has ${dt.rows.length} dosing rows; the PDF prints 4`);
  const seenDrugs = new Set();
  for (const row of dt.rows) {
    if (seenDrugs.has(row.drug)) fail(`dosing table lists ${row.drug} twice`);
    seenDrugs.add(row.drug);
    const mark = row.footnote ? fn[row.footnote]?.mark ?? "?" : "";
    const pdfRow = drugRows.find((r) => norm(r.cells.drug) === norm(row.drug + mark));
    if (!pdfRow) {
      fail(`page 4: no dosing row prints "${row.drug}${mark}" (footnote mark included); rows found: ${drugRows.map((r) => r.cells.drug).join(" | ")}`);
      continue;
    }
    if (!row.adult.length || !row.pediatric.length) fail(`${row.drug}: adult and pediatric cells must be non-empty`);
    const gotA = loose(pdfRow.cells.adult);
    const wantA = loose(row.adult.join(" "));
    if (gotA !== wantA) fail(`${row.drug} / adult:\n      PDF : ${gotA}\n      data: ${wantA}`);
    const gotP = loose(pdfRow.cells.pediatric);
    const wantP = loose(row.pediatric.join(" "));
    if (gotP !== wantP) fail(`${row.drug} / pediatric:\n      PDF : ${gotP}\n      data: ${wantP}`);
  }
  // The footnotes run, in order and each after its mark, from the end of the
  // dosing table to the Duration bullet; compared as that one run (see mustPrint).
  // Each must be a real one: an empty footnote vanished in the run (Codex
  // v0.7.11 review).
  const marks = Object.values(fn).map((f) => f.mark);
  if (new Set(marks).size !== marks.length) fail("dosing-table footnotes share a mark");
  for (const [key, f] of Object.entries(fn)) {
    if (!/^\*+$/.test(f.mark ?? "") || typeof f.text !== "string" || f.text.trim().length < 12) {
      fail(`dosing-table footnote "${key}": a mark of asterisks and a sentence are required`);
    }
  }
  mustPrint("the dosing-table footnotes (each after its mark)", `${Object.values(fn).map((f) => `${f.mark}${f.text}`).join(" ")} • Duration:`);

  // D. Page 5 — link annotations bound to their printed labels
  const p5 = pdf.pages[4];
  const refs5 = data.feverWorkup.referenceStandards;
  if (p5.links.length !== refs5.length) fail(`page 5 carries ${p5.links.length} links; data lists ${refs5.length}`);
  const usedLinks = new Set(); // one link per entry, as for the classification rows
  for (const ref of refs5) {
    const link = p5.links.find((l) => norm(linkLabel(p5, l.rect)) === norm(ref.label));
    if (!link) {
      fail(`page 5: no link annotation sits under the label "${ref.label}" (labels found: ${p5.links.map((l) => linkLabel(p5, l.rect)).join(" | ")})`);
      continue;
    }
    if (usedLinks.has(link)) fail(`page 5: the data lists the link under "${ref.label}" twice`);
    usedLinks.add(link);
    const target = decodeTrackedUrl(link.url);
    if (!sameUrl(target, ref.url)) fail(`page 5: the link under "${ref.label}" resolves to ${target}, data says ${ref.url}`);
  }

  // E. References, page 12 — whole numbered entries, contiguous
  const p12 = pdf.pages[11];
  const flat12 = despace(p12.text);
  const links12 = p12.links.map((l) => decodeTrackedUrl(l.url));
  if (data.references.length !== 13) fail(`expected 13 references, data has ${data.references.length}`);
  data.references.forEach((ref, i) => {
    if (ref.n !== i + 1) fail(`reference numbering: entry ${i} has n=${ref.n}`);
    const printedUrl = ref.url ?? "";
    const whole = despace(`${ref.n}. ${ref.text} ${printedUrl}`);
    if (!flat12.includes(whole)) {
      fail(`reference ${ref.n} is not printed as one contiguous entry (number, text and URL/DOI):\n      ${ref.text}${printedUrl ? " " + printedUrl : ""}`);
    }
    if (ref.url && !ref.url.startsWith("https://doi.org/") && !links12.some((u) => sameUrl(u, ref.url))) {
      fail(`reference ${ref.n}: ${ref.url} is not a link annotation on page 12 (found: ${links12.join(", ")})`);
    }
  });
  // Each entry above can still be a shortened copy of itself, since it is only
  // looked for somewhere on the page: a reference cut before its journal, or one
  // without its DOI, passed (Gemini whole-codebase review, 2026-10-14). So the
  // thirteen are also checked as one run, in order, each ending where the next
  // number starts and the last where the page's text ends (only the page number
  // may follow).
  const run12 = despace(data.references.map((r) => `${r.n}. ${r.text} ${r.url ?? ""}`).join(" "));
  const at12 = flat12.indexOf(run12);
  // The page's footer: the text printed in its bottom margin (the page number).
  // Anything but exactly that after the run means the last entry is cut short;
  // "any digits" let a DOI lose its final digit (Codex v0.7.11 review).
  const footer12 = despace(pageText(p12.items.filter((it) => it.y < 50)));
  if (at12 < 0 || flat12.slice(at12 + run12.length) !== footer12) {
    fail("page 12: the references are not printed as one run, in order, to the end of the page — an entry is shortened or out of place");
  }

  return {
    ok: errors.length === 0,
    errors,
    notes,
    summary: { rows: rowsSeen, indications: data.indications.length, matched: matched.size },
  };
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
      `PASS — ${result.summary.matched} indications matched ${result.summary.rows} PDF table rows (cells, sections and pages); open-fracture statements, display regimens, dosing table, page-5 link labels and 13 references all agree with the PDF. Not checked: the page-5 flowchart text, display labels, aliases, brand/class metadata, or whether the PDF itself is right.`
    );
    process.exit(0);
  }
  console.error(`FAIL — ${result.errors.length} problem(s):`);
  for (const e of result.errors) console.error("  - " + e);
  process.exit(1);
}
