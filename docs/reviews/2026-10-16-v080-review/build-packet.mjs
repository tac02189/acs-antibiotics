// Builds the Codex review packet for the v0.8.0 update (October 2026 PMG).
import fs from "node:fs";
import path from "node:path";
const [root, extractFile, outFile] = process.argv.slice(2);

const numbered = (rel) => {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  const lines = text.split("\n");
  return `\n===== FILE: ${rel} (${lines.length} lines) =====\n` + lines.map((l, i) => `${String(i + 1).padStart(4)}| ${l}`).join("\n") + `\n===== END FILE: ${rel} =====\n`;
};

const FILES = [
  "src/data/pmg.js",
  "src/lib/dosing.js",
  "src/lib/search.js",
  "src/components/shared.jsx",
  "src/components/IndicationsView.jsx",
  "src/components/OpenFracturesView.jsx",
  "src/components/DosingView.jsx",
  "src/components/DrugsView.jsx",
  "src/components/SourceView.jsx",
  "src/components/Header.jsx",
  "src/components/VerificationNotice.jsx",
  "src/App.jsx",
  "scripts/verify-pmg.mjs",
  "tests/pmg.test.js",
  "tests/verify-controls.test.js",
];

const head = `You are an independent reviewer (OpenAI Codex) for a clinical reference web app. DO NOT USE ANY TOOLS and do not read or write the filesystem: answer only from this message and the attached images. Everything you need is below.

## What happened
The app ("ACS Antibiotic Guide", a mobile PWA for emergency-department clinicians) transcribes the University of Missouri Health "Acute Care Surgery Antibiotic Surgical Prophylaxis and Empiric Treatment Practice Management Guideline" (PMG). The owner (an EM physician, Thiago) replaced the source PDF with a new edition (review date October 2026, 8 pages). The previous edition (December 2025, 12 pages) had per-row doses, a fever-workup flowchart, pediatric dosing and an antibiogram; the new one does not. Claude rewrote the data file, the PDF verifier, the views and the tests to match the new PDF. Your job: make sure the app matches the PDF, everywhere it shows PDF content.

## The attached images
Renders of the new PDF (pages are 792 x 612 pt landscape): p1..p8 full pages at 2x; p2-top/p2-bottom, p3-top/p3-bottom, p4-top/p4-bottom, p5-top/p5-bottom at 3x; p3-cefazolin is an 8x crop of the Cefazolin dose cell (the PDF draws "≥" as an underlined ">"). The images are the ground truth. The machine text extraction below is a second source (its column order is scrambled in tables; use the images to resolve).

## Decisions the owner made this session (do not report these as defects; DO report if the app fails to implement them faithfully)
1. Indication rows (pages 2-4) print drug names only. The app shows each drug's dose beside it by looking it up in the dosing table that matches the row's section: the surgical-prophylaxis table (page 3) for Trauma / Emergency General Surgery / Elective Surgery rows, the empiric table (page 4) for acute-infection rows; a drug missing from the matching table shows its name only, with NO fallback to the other table (src/lib/dosing.js). The owner chose this ("Dose from matching table").
2. The highlight toggle was renamed from "PCN Allergy" to "Allergy" (the column header is now "Alternative Antibiotic(s) if Allergy to Preferred").
3. The open-fracture bullets on page 5 print no route; the owner said "They are all IV", so every open-fracture drug is shown with route IV and this is listed as a correction on the Source page.
4. The "Transcription pending physician verification" banner is rendered again for the new edition (project rule: a new edition shows it until a physician reads the new transcription).
5. Content that the new PDF no longer has (fever workup, pediatric dosing, debridement / femoral-shaft rules, antibiogram link) was removed from the app.

## Project rules that matter here
- src/data/pmg.js is clinical content. The app must show the PDF's values, even where the PDF disagrees with itself; such disagreements are listed in transcription.flags, not "fixed".
- No clinical paraphrase in components; interface strings are editorial-neutral; clinical wording comes from the data.
- Code review cannot confirm a clinical value. Surface every value you could not confirm against the images, and say plainly whether it is a mismatch (the app differs from the PDF) or merely unverifiable.
- Firebase web config is not a secret (none is in this packet anyway).

## What to check, in this order
A. TRANSCRIPTION (most important). Compare every value in src/data/pmg.js with the page images: every indication row (name, preferred drugs and their order, the alternative column including which drug each "X alternative:" line belongs to and every "or" / "+", every duration line), both dosing tables (every cell, including signs and units), the re-dosing rules, the open-fracture page (classification table, timing, each regimen and which bullet each "If penicillin allergy" sub-bullet is printed under, contamination, durations), page 1's title and four paragraphs, and all 35 references (text, DOI/URL, page). Report EVERY mismatch, however small (a character, a sign, a unit, punctuation that changes meaning). Also list anything in the PDF that the app does not carry.
B. DISPLAY. Read the components: is anything the app SHOWS different from the PDF, or misleading about what the PDF says? Pay special attention to: the dose lookup (does any row show a dose from the wrong table, or a dose for a drug the matching table does not list?), the "OR redose" text on prophylaxis pills (the PDF column is "Redosing Interval for OR Only (hours)"), the open-fracture pills and their IV route, the allergy sub-bullets' nesting, column labels, the Source page's statements and flags (are the flags accurate about the PDF?), and anything that implies a clinical claim the PDF does not make.
C. VERIFIER. scripts/verify-pmg.mjs is run on every build and must fail on any difference between data and PDF. Find any way a wrong value in pmg.js could still pass it (an escape), and say exactly which mutation would pass. tests/verify-controls.test.js plants errors; note checks that have no control.
D. Anything else that is a real bug in the changed code.

## Output format
Findings, most severe first. Each: severity (Critical / High / Medium / Low), file:line, what is wrong, the evidence (quote the PDF page/image and the data), and for transcription items whether it is a MISMATCH or UNVERIFIABLE. Then a section "Clinical values touched" listing every dose / frequency / duration / threshold the app shows that a human should check against the PDF (you may group them). Then a short section "Checked and matching" summarising what you confirmed. If you find nothing in a category, say so explicitly and say what you compared.

## The PDF's machine text extraction
`;

let out = head + fs.readFileSync(extractFile, "utf8") + "\n\n## The code and data (line-numbered)\n";
for (const f of FILES) out += numbered(f);
out += "\n## End of packet. Remember: no tools; answer from this message and the images.\n";
fs.writeFileSync(outFile, out);
console.log(outFile, out.length, "chars,", out.split("\n").length, "lines");
