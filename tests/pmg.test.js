// Shape and consistency checks on the data file, plus the parts the PDF
// verifier cannot see (display labels, the dose lookup, the open-fracture
// route, search, routing). These catch transcription slips and regressions;
// they cannot catch clinical errors.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as pmg from "../src/data/pmg.js";
import { TYPO_MAP, loose, norm, regimenAsPrinted } from "../scripts/verify-pmg.mjs";
import { doseLine, dosingRow, kindOf } from "../src/lib/dosing.js";
import { matchRoute, parseHash } from "../src/lib/route.js";
import { searchIndications, score } from "../src/lib/search.js";

const { indications, sections, drugs, openFractures, prophylaxisDosing, empiricDosing, references, source } = pmg;

const namedDrugs = (ind) => [...(ind.preferred || []), ...(ind.alternative || []).flatMap((l) => l.options.flat())];
const fractureEntries = () =>
  [...openFractures.selection, ...openFractures.contamination.items].flatMap((e) => [
    { id: e.id, ...e },
    ...(e.allergy ? [{ id: `${e.id} (allergy)`, ...e.allergy }] : []),
  ]);

test("sections and indication ids are unique and cross-reference", () => {
  const sectionIds = sections.map((s) => s.id);
  assert.equal(new Set(sectionIds).size, sectionIds.length);
  const ids = indications.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate indication id");
  for (const ind of indications) {
    assert.ok(sectionIds.includes(ind.section), `${ind.id}: unknown section ${ind.section}`);
    assert.ok([2, 3, 4].includes(ind.page), `${ind.id}: page must be 2, 3 or 4`);
    assert.match(ind.id, /^[a-z0-9-]+$/, `${ind.id}: id must be url-safe`);
  }
  for (const s of sections) {
    assert.ok(indications.some((i) => i.section === s.id), `section ${s.id} is empty`);
    assert.ok(["prophylaxis", "empiric"].includes(s.kind), `section ${s.id}: kind`);
    assert.equal(s.columns.length, 4, `section ${s.id}: four column headers`);
  }
  assert.equal(indications.length, 40, "the PMG prints 40 indication rows");
});

test("every row's drugs have metadata, and N/A rows are N/A throughout", () => {
  for (const ind of indications) {
    assert.ok(ind.name && ind.short, `${ind.id}: name and short required`);
    if (ind.preferred === null) {
      assert.equal(ind.alternative, null, `${ind.id}: N/A row must have a null alternative`);
      assert.equal(ind.duration, null, `${ind.id}: N/A row must have a null duration`);
      continue;
    }
    assert.ok(Array.isArray(ind.preferred) && ind.preferred.length > 0, `${ind.id}: preferred must be a non-empty array or null`);
    for (const d of namedDrugs(ind)) assert.ok(drugs[d], `${ind.id}: drug "${d}" has no entry in drugs{}`);
    assert.ok(ind.duration === null || (Array.isArray(ind.duration) && ind.duration.length > 0), `${ind.id}: duration`);
    for (const line of ind.alternative || []) {
      if (line.for) assert.ok(ind.preferred.includes(line.for), `${ind.id}: alternative for ${line.for}, not a preferred drug`);
    }
  }
  for (const row of [...prophylaxisDosing.rows, ...empiricDosing.rows]) assert.ok(drugs[row.drug], `dosing row ${row.drug}: no drugs{} entry`);
});

// `short` is the label the reader sees. The PDF verifier cannot judge it, so
// every word in it must come from the PDF's own row name (or be one of these
// spelled-out abbreviations), so a label can never be re-pointed at another
// row's regimen.
const ABBREVIATIONS = {
  sbo: ["small", "bowel", "obstruction"],
  uti: ["urinary", "tract", "infection"],
};
const STOP_WORDS = new Set(["with", "or", "without", "and", "of", "the", "a", "non"]);
const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9/ -]/g, " ")
    .split(/[\s/-]+/)
    .filter(Boolean);
// The words that turn a row into its opposite. The word check alone could not
// see them: "non" and "without" are stop words, and "with" passes on a
// "without" row by prefix (Gemini whole-codebase review, 2026-10-14). A label
// must carry exactly the qualifiers of its PDF name, each with the word it
// qualifies (Codex v0.7.11 review). A label's "±" stands for the name's "with
// or without".
const QUALIFIERS = new Set(["with", "without", "non", "no", "not"]);
const negations = (s) => {
  const ws = words(s.replace(/±/g, " with or without "));
  return ws
    .map((w, i) => (QUALIFIERS.has(w) ? `${w} ${ws[i + 1] ?? ""}` : null))
    .filter(Boolean)
    .sort();
};

// The conjunctions too: "SBO with necrosis and bowel resection" passed every
// word and qualifier check on the PDF's "…with Necrosis or Bowel Resection"
// (Codex review, 2026-10-16). A label may use "and" ("&", "+") only where the
// PDF name has one, and "or" ("/", "±") only where it has "or" or "/".
const CONJUNCTIONS = { and: /\band\b|&|\+/, or: /\bor\b|\/|±/ };

function labelProblems(ind) {
  const problems = [];
  for (const [c, re] of Object.entries(CONJUNCTIONS)) {
    if (re.test(ind.short.toLowerCase()) && !re.test(ind.name.toLowerCase())) problems.push(`"${c}" is not in the PDF name`);
  }
  const nameWords = new Set(words(ind.name));
  for (const w of words(ind.short)) {
    if (STOP_WORDS.has(w) || nameWords.has(w)) continue;
    const expansion = ABBREVIATIONS[w];
    if (expansion && expansion.every((x) => nameWords.has(x))) continue;
    if ([...nameWords].some((n) => n.length >= 5 && (n.startsWith(w) || w.startsWith(n)))) continue;
    problems.push(`word "${w}" is not in the PDF name`);
  }
  const [got, want] = [negations(ind.short), negations(ind.name)];
  if (got.join() !== want.join()) problems.push(`qualifiers [${got}] differ from the PDF name's [${want}]`);
  return problems;
}

test("short display labels use only words from the PDF row name, with all its negations, and are unique", () => {
  for (const ind of indications) {
    assert.deepEqual(labelProblems(ind), [], `${ind.id}: "${ind.short}" against the PDF name "${ind.name}"`);
  }
  const shorts = indications.map((i) => i.short.toLowerCase());
  assert.equal(new Set(shorts).size, shorts.length, "two rows share a short label");
});

test("controls: an inverted or borrowed short label is caught", () => {
  const relabel = (id, short) => ({ ...indications.find((i) => i.id === id), short });
  for (const [id, short] of [
    ["cellulitis-purulent", "Cellulitis — non-purulent"],
    ["cellulitis-nonpurulent", "Cellulitis — purulent"],
    ["sbo-necrosis", "SBO without necrosis or bowel resection"],
    ["sbo-no-necrosis", "SBO with necrosis or bowel resection"],
    ["sbo-no-necrosis", "SBO with necrosis or without bowel resection"],
    ["diverticulitis-source-control", "Diverticulitis without source control"],
    ["diverticulitis-no-source-control", "Diverticulitis with source control"],
    ["closed-face-fracture", "Closed / operative face fracture"],
    ["abdominal-trauma", "Abdominal trauma with hollow viscus injury"],
    ["abdominal-trauma", "Abdominal trauma without hollow viscus injury"],
    ["open-skull-fracture", "Open skull fracture with significant contamination"],
    ["open-skull-fracture-contamination", "Open skull fracture"],
    ["bacteremia-gram-positive", "Bacteremia (gram negative organism)"],
    ["uncomplicated-uti", "Complicated UTI (cystitis)"],
    ["appendectomy", "Cholecystectomy"],
    ["sbo-necrosis", "SBO with necrosis and bowel resection"],
    ["closed-face-fracture", "Closed and non-operative face fracture"],
    ["cardiac-thoracic", "Cardiac or thoracic"],
  ]) {
    assert.notDeepEqual(labelProblems(relabel(id, short)), [], `${id}: "${short}" was not caught`);
  }
});

// The dose beside a drug on an indication row is looked up in the dosing table
// that matches the row's section (Thiago, 2026-10-16), with no fallback to the
// other table. The verifier checks both tables against the PDF; this checks the
// lookup.
test("each section's kind matches its printed table title", () => {
  for (const s of sections) {
    const want = /Surgical Prophylaxis$/.test(s.printedTitle) ? "prophylaxis" : /^Empiric /.test(s.printedTitle) ? "empiric" : null;
    assert.equal(s.kind, want, `${s.id}: kind`);
  }
});

// A section's displayed title is the app's, so the verifier does not read it; it
// must use only words of the PDF's own table title ("Trauma" passed relabelled
// "Empiric Therapy": Codex review, 2026-10-16).
const sectionTitleProblems = (s) => {
  const printed = new Set(words(s.printedTitle));
  return words(s.title).filter((w) => !printed.has(w));
};
test("section titles use only words of the PDF's table titles", () => {
  for (const s of sections) assert.deepEqual(sectionTitleProblems(s), [], `${s.id}: "${s.title}"`);
  const relabelled = { ...sections.find((s) => s.id === "trauma"), title: "Empiric Therapy" };
  assert.notDeepEqual(sectionTitleProblems(relabelled), [], "a borrowed section title was not caught");
});

// No value in the data starts or ends with a space. The verifier trims before
// comparing, so "8 " passed it, and the pill dropped its "h" (Codex review,
// 2026-10-16; redoseLabel trims too).
test("no string in the data has leading or trailing whitespace", () => {
  const walk = (v, at) => {
    if (typeof v === "string") assert.equal(v, v.trim(), `${at}: "${v}"`);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${at}.${k}`);
  };
  for (const [k, v] of Object.entries(pmg)) walk(v, k);
});

// The Source page's flags are app-authored notes, but a dose or a quoted phrase
// in one is a claim about the PDF: each must be found in the verified data. A
// vancomycin "150-200 mg/kg" passed before (Codex review, 2026-10-16).
// (A dose printed over two lines is also searched joined, as its pill shows it.)
const DATA_TEXT = JSON.stringify([
  indications,
  prophylaxisDosing,
  prophylaxisDosing.rows.map((r) => r.dose.join(" ")),
  empiricDosing,
  openFractures,
  pmg.redosingRules,
]);
function flagProblems(flag) {
  const problems = [];
  for (const m of flag.matchAll(/\d+(?:\.\d+)?(?:-\d+)? ?(?:mg\/kg|mg|g|kg)\b|Q\d+H/g)) {
    if (!DATA_TEXT.includes(m[0])) problems.push(`"${m[0]}" is in no verified value`);
  }
  for (const m of flag.matchAll(/"([^"]+)"/g)) {
    if (!DATA_TEXT.includes(JSON.stringify(m[1]).slice(1, -1))) problems.push(`the quoted "${m[1]}" is in no verified value`);
  }
  return problems;
}
test("every dose and quoted phrase in the Source page's flags is in the verified data", () => {
  for (const f of pmg.transcription.flags) assert.deepEqual(flagProblems(f), [], f);
  for (const bad of ["Vancomycin is 150-200 mg/kg in the prophylaxis table.", 'Metronidazole is "Q8H or Q6H" in the empiric table.']) {
    assert.notDeepEqual(flagProblems(bad), [], `not caught: ${bad}`);
  }
});

test("the dose lookup uses the matching table and never the other", () => {
  const missing = new Set();
  for (const ind of indications) {
    const kind = kindOf(ind);
    const table = kind === "prophylaxis" ? prophylaxisDosing : empiricDosing;
    for (const d of namedDrugs(ind)) {
      const row = dosingRow(d, kind);
      assert.equal(row, table.rows.find((r) => r.drug === d) ?? null, `${ind.id}: ${d} looked up in the wrong table`);
      if (!row) {
        missing.add(`${kind}:${d}`);
        assert.equal(doseLine(d, kind), null, `${ind.id}: ${d} has no row, so no dose line`);
      }
    }
  }
  // Exactly these drugs are named on a prophylaxis row but absent from the
  // prophylaxis table (listed on the Source page); every empiric drug is listed.
  assert.deepEqual([...missing].sort(), ["prophylaxis:Cefepime", "prophylaxis:Clindamycin", "prophylaxis:Doxycycline", "prophylaxis:Linezolid"]);
  // ...and the empiric table, which lists all four, is not used as a fallback.
  for (const d of ["Cefepime", "Clindamycin", "Doxycycline", "Linezolid"]) assert.ok(dosingRow(d, "empiric"));
});

test("dose lines read as the pills show them", () => {
  assert.equal(doseLine("Cefazolin", "prophylaxis"), "2 g if < 120 kg, 3 g if ≥ 120 kg · OR redose 3 h");
  assert.equal(doseLine("Vancomycin", "prophylaxis"), "15-20 mg/kg · OR redose not recommended");
  assert.equal(doseLine("Cefazolin", "empiric"), "2 g IV Q8H");
  assert.equal(doseLine("Amoxicillin-clavulanate", "empiric"), "875 mg / 125 mg PO/per tube Q12H");
  assert.equal(doseLine("Vancomycin", "empiric"), "Pharmacy to dose IV Pharmacy to dose");
  assert.equal(doseLine("Linezolid", "prophylaxis"), null);
  assert.equal(doseLine("Cefazolin", "bogus"), null);
  const abd = indications.find((i) => i.id === "abdominal-trauma");
  assert.equal(kindOf(abd), "prophylaxis");
  assert.equal(kindOf(indications.find((i) => i.id === "cap")), "empiric");
});

// The PDF prints no route in the open-fracture bullets; the app shows IV for
// every drug in them (Thiago, 2026-10-16: "They are all IV"). The verifier sets
// the route aside, so this is what keeps it from quietly going missing.
test("every open-fracture drug carries its IV route", () => {
  const entries = fractureEntries();
  assert.equal(entries.length, 6, "two selection bullets and one contamination bullet, each with an allergy sub-bullet");
  for (const e of entries) {
    for (const r of e.regimen) assert.equal(r.route, "IV", `${e.id}: ${r.drug} route`);
  }
});

const asShown = (regimen) =>
  regimen.map((r) => [r.drug, r.dose, r.route, r.frequency].filter(Boolean).join(" ") + (r.note ? `: ${r.note}` : "")).join(" + ");

// `where` is the bullet's path on page 5: heading, label, then the sub-bullet's
// label. Checked exactly, since a correction attributed to another fracture type
// passed (Codex review, 2026-10-16).
const fractureWhere = () =>
  [
    ...openFractures.selection.map((e) => ["Open fractures", e]),
    ...openFractures.contamination.items.map((e) => [openFractures.contamination.heading, e]),
  ].flatMap(([head, e]) => [
    { text: e.text, regimen: e.regimen, where: `${head} — ${e.applies}` },
    ...(e.allergy ? [{ text: e.allergy.text, regimen: e.allergy.regimen, where: `${head} — ${e.applies} — ${e.allergy.applies}` }] : []),
  ]);

test("each open-fracture regimen has exactly one listed route correction, and it matches", () => {
  const routes = pmg.transcription.corrections.filter((c) => c.kind === "route");
  const entries = fractureWhere();
  assert.equal(routes.length, entries.length, "one route correction per regimen");
  for (const e of entries) {
    const c = routes.filter((x) => x.where === e.where);
    assert.equal(c.length, 1, `one correction for "${e.where}"`);
    assert.equal(c[0].pdf, e.text, `${e.where}: the correction cites the printed bullet`);
    assert.equal(c[0].here, asShown(e.regimen), `${e.where}: the correction shows what the app shows`);
  }
});

test("open-fracture display regimens re-state the printed bullet exactly, route aside", () => {
  for (const e of fractureEntries()) {
    assert.equal(loose(regimenAsPrinted(e.regimen)), loose(e.text), `${e.id}: regimen ≠ text`);
    for (const r of e.regimen) assert.ok(drugs[r.drug], `${e.id}: drug "${r.drug}" has no entry in drugs{}`);
  }
  for (const e of [...openFractures.selection, ...openFractures.contamination.items]) {
    assert.ok(e.allergy && /penicillin allergy/i.test(e.allergy.applies), `${e.id}: its penicillin-allergy sub-bullet`);
  }
  assert.equal(openFractures.duration.length, 2);
});

test("dosing tables are complete", () => {
  assert.equal(prophylaxisDosing.rows.length, 8);
  assert.equal(empiricDosing.rows.length, 19);
  for (const t of [prophylaxisDosing, empiricDosing]) {
    const names = t.rows.map((r) => r.drug);
    assert.equal(new Set(names).size, names.length, `${t.title}: duplicate row`);
  }
  // As the PDF prints them, alphabetical.
  for (const t of [prophylaxisDosing, empiricDosing]) {
    const names = t.rows.map((r) => r.drug);
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)), `${t.title}: order`);
  }
});

test("references are numbered 1..35 and the source is bound to its hash", () => {
  assert.deepEqual(
    references.map((r) => r.n),
    Array.from({ length: 35 }, (_, i) => i + 1)
  );
  for (const r of references) if (r.url) assert.doesNotMatch(r.url, /utm_/, "tracking parameters must be stripped");
  assert.match(source.sha256, /^[0-9a-f]{64}$/);
  assert.ok(source.file.includes(source.sha256.slice(0, 12)), "the PDF filename must carry its content hash");
  assert.equal(source.pages, 8);
});

// A new edition is shown with the verification notice until a physician has
// read the new transcription (CLAUDE.md). Rendered again for the October 2026
// edition; when Thiago asks for it to go, change this test with it.
test("the verification notice is rendered for the October 2026 edition", () => {
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /<VerificationNotice \/>/);
});

test("search finds indications by name, abbreviation, brand and generic, and respects negations", () => {
  const ids = (q) => searchIndications(indications, q, drugs).map((i) => i.id);
  const first = (q) => ids(q)[0];
  assert.equal(first("appy"), "appendectomy");
  assert.equal(first("appendectomy"), "appendectomy");
  assert.deepEqual(new Set(ids("nec fasc")), new Set(["nsti", "nsti-debridement"]));
  assert.deepEqual(new Set(ids("SBO")), new Set(["sbo-necrosis", "sbo-no-necrosis"]));
  // Exactly: every row that names piperacillin-tazobactam, as preferred or alternative.
  const pipTazo = indications.filter((i) => namedDrugs(i).includes("Piperacillin-tazobactam")).map((i) => i.id);
  assert.ok(pipTazo.length >= 8);
  assert.deepEqual(new Set(ids("zosyn")), new Set(pipTazo), "Zosyn hits every pip-tazo row");
  // A brand named only in the alternative column still finds the row.
  const bactrim = indications.filter((i) => namedDrugs(i).includes("Sulfamethoxazole-trimethoprim")).map((i) => i.id);
  assert.deepEqual(new Set(ids("bactrim")), new Set(bactrim));
  assert.equal(bactrim.length, 4);
  assert.equal(searchIndications(indications, "", drugs).length, indications.length);
  assert.equal(ids("xyzzy").length, 0);
  assert.ok(score(indications.find((i) => i.id === "chest-tube"), "chest", drugs) > 0);
  // Negations: "complicated" must not match "uncomplicated", "purulent" must not match "non-purulent".
  assert.ok(ids("complicated").includes("complicated-uti"));
  assert.ok(!ids("complicated").includes("uncomplicated-uti"), '"complicated" matched the uncomplicated row');
  assert.ok(ids("purulent").includes("cellulitis-purulent"));
  assert.ok(!ids("purulent").includes("cellulitis-nonpurulent"), '"purulent" matched the non-purulent row');
  for (const q of ["nonpurulent", "non-purulent", "non purulent", "Non Purulent"]) {
    assert.deepEqual(ids(q), ["cellulitis-nonpurulent"], `"${q}"`);
  }
  assert.ok(ids("non operative").includes("closed-face-fracture"));
  assert.ok(ids("non cefazolin").includes("cellulitis-nonpurulent"), '"non cefazolin" is two words');
  // The dose lines the rows show are searched too.
  assert.ok(ids("Q24H").includes("complicated-uti"), "empiric frequencies are searched");
  assert.ok(ids("4.5 g").includes("cholecystitis"), "doses are searched");
  assert.ok(ids("120 kg").includes("craniotomy"), "prophylaxis doses are searched");
});

test("hash routes parse", () => {
  assert.equal(parseHash(""), "/");
  assert.equal(parseHash("#/fractures"), "/fractures");
  assert.equal(parseHash("#drugs/Cefazolin"), "/drugs/Cefazolin");
  assert.deepEqual(matchRoute("/"), { view: "indications" });
  assert.deepEqual(matchRoute("/i/appendectomy"), { view: "indications", focus: "appendectomy" });
  assert.deepEqual(matchRoute("/s/trauma"), { view: "indications", section: "trauma" });
  assert.deepEqual(matchRoute("/drugs/Piperacillin-tazobactam"), { view: "drugs", drug: "Piperacillin-tazobactam" });
  assert.deepEqual(matchRoute("/drugs/Sulfamethoxazole-trimethoprim"), { view: "drugs", drug: "Sulfamethoxazole-trimethoprim" });
  // The fever-workup view went with the December 2025 edition (v0.8.0).
  assert.deepEqual(matchRoute("/workup"), { view: "indications" });
  assert.deepEqual(matchRoute("/nonsense/x"), { view: "indications" });
  assert.deepEqual(matchRoute("/source"), { view: "source" });
});

// Every listed typo correction must be one the verifier applies (TYPO_MAP), and
// every TYPO_MAP rewrite must be listed ("add to both or to neither"). The
// October 2026 edition has none: its only corrections are the open-fracture
// routes, which the verifier sets aside instead (tested above).
test("typo corrections and TYPO_MAP agree, in both directions", () => {
  const typos = pmg.transcription.corrections.filter((c) => c.kind !== "route");
  for (const c of typos) assert.equal(norm(c.pdf), norm(c.here), `correction "${c.pdf}" is not in TYPO_MAP`);
  const flat = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  for (const [from, to] of TYPO_MAP) {
    const [f, t] = [from.trim(), to.trim()];
    assert.ok(
      typos.some((c) => flat(c.pdf).includes(f) && flat(c.pdf).replace(f, t) === flat(c.here)),
      `TYPO_MAP "${f}" → "${t}" is not a listed correction`
    );
  }
});
