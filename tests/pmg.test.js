// Shape and consistency checks on the data file, plus the parts the PDF
// verifier cannot see (display labels, search, routing). These catch
// transcription slips and regressions; they cannot catch clinical errors.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as pmg from "../src/data/pmg.js";
import { TYPO_MAP, loose, norm, regimenAsProse } from "../scripts/verify-pmg.mjs";
import { matchRoute, parseHash } from "../src/lib/route.js";
import { searchIndications, score } from "../src/lib/search.js";

const { indications, sections, drugs, openFractures, dosingTable, feverWorkup, references, source } = pmg;

test("sections and indication ids are unique and cross-reference", () => {
  const sectionIds = sections.map((s) => s.id);
  assert.equal(new Set(sectionIds).size, sectionIds.length);
  const ids = indications.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate indication id");
  for (const ind of indications) {
    assert.ok(sectionIds.includes(ind.section), `${ind.id}: unknown section ${ind.section}`);
    assert.ok([1, 2].includes(ind.page), `${ind.id}: page must be 1 or 2`);
    assert.match(ind.id, /^[a-z0-9-]+$/, `${ind.id}: id must be url-safe`);
  }
  for (const s of sections) {
    assert.ok(indications.some((i) => i.section === s.id), `section ${s.id} is empty`);
  }
  assert.equal(indications.length, 34, "the PMG prints 34 table rows");
});

test("every regimen entry is complete and every drug has metadata", () => {
  for (const ind of indications) {
    assert.ok(ind.name && ind.short, `${ind.id}: name and short required`);
    if (ind.regimen === null) {
      assert.equal(ind.duration, null, `${ind.id}: N/A row must have null duration`);
      assert.equal(ind.redose, null, `${ind.id}: N/A row must have null redose`);
      assert.equal(ind.alternative, null, `${ind.id}: N/A row must have null alternative`);
      continue;
    }
    assert.ok(Array.isArray(ind.regimen) && ind.regimen.length > 0, `${ind.id}: regimen must be a non-empty array or null`);
    for (const r of ind.regimen) {
      for (const k of ["drug", "dose", "frequency"]) {
        assert.equal(typeof r[k], "string", `${ind.id}: regimen.${k} must be a string`);
        assert.ok(r[k].trim(), `${ind.id}: regimen.${k} is empty`);
      }
      assert.ok(drugs[r.drug], `${ind.id}: drug "${r.drug}" has no entry in drugs{}`);
      if (r.dose !== "Pharmacy to dose") assert.match(r.dose, /^\d+(\.\d+)? (g|mg)(\/\d+ mg)?$/, `${ind.id}: odd dose "${r.dose}"`);
      assert.equal(r.route, undefined, `${ind.id}: the tables print no route`);
      assert.equal(r.note, undefined, `${ind.id}: the tables print no note`);
    }
    assert.ok(Array.isArray(ind.duration) && ind.duration.length > 0, `${ind.id}: duration must be a non-empty array`);
    assert.ok(ind.redose === null || typeof ind.redose === "string", `${ind.id}: redose type`);
    assert.ok(
      ind.alternative === null || typeof ind.alternative === "string" || Array.isArray(ind.alternative),
      `${ind.id}: alternative type`
    );
  }
});

// `short` is the label the reader sees. The PDF verifier cannot judge it, so
// every word in it must come from the PDF's own row name (or be one of these
// spelled-out abbreviations), so a label can never be re-pointed at another
// row's regimen.
const ABBREVIATIONS = {
  sbo: ["small", "bowel", "obstruction"],
  uti: ["urinary", "tract", "infection"],
  facial: ["face"],
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
// "without" row by prefix, so "Cellulitis — non-purulent" on the purulent row
// and "SBO — with necrosis…" on the without-necrosis row both passed (Gemini
// whole-codebase review, 2026-10-14). A label must carry exactly the qualifiers
// of its PDF name, each with the word it qualifies: counting them was not
// enough, as "SBO — with necrosis or without bowel resection" kept one "without"
// on the without-necrosis row (Codex v0.7.11 review). A label's "±" stands for
// the name's "with/or without".
const QUALIFIERS = new Set(["with", "without", "non", "no", "not"]);
const negations = (s) => {
  const ws = words(s.replace(/±/g, " with or without "));
  return ws
    .map((w, i) => (QUALIFIERS.has(w) ? `${w} ${ws[i + 1] ?? ""}` : null))
    .filter(Boolean)
    .sort();
};

function labelProblems(ind) {
  const problems = [];
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
    ["sbo-necrosis", "SBO — without necrosis or bowel resection"],
    ["sbo-no-necrosis", "SBO — with necrosis or bowel resection"],
    ["diverticulitis-source-control", "Diverticulitis — without source control"],
    ["diverticulitis-no-source-control", "Diverticulitis — with source control"],
    ["closed-face-fracture", "Closed / operative facial fracture"],
    ["abdominal-trauma", "Abdominal trauma with hollow viscus injury"],
    ["abdominal-trauma", "Abdominal trauma without hollow viscus injury"],
    ["sbo-no-necrosis", "SBO — with necrosis or without bowel resection"],
    ["sbo-necrosis", "SBO — without necrosis or with bowel resection"],
    ["uncomplicated-uti", "Complicated UTI"],
    ["appendicitis", "Cholecystitis"],
  ]) {
    assert.notDeepEqual(labelProblems(relabel(id, short)), [], `${id}: "${short}" was not caught`);
  }
});

test("open-fracture display regimens re-state the verified PDF wording exactly", () => {
  for (const a of openFractures.antimicrobial) {
    assert.equal(loose(regimenAsProse(a.regimen, dosingTable.footnotes)), loose(a.text), `${a.id}: regimen ≠ text`);
    for (const r of a.regimen) {
      assert.ok(drugs[r.drug], `${a.id}: drug "${r.drug}" has no entry in drugs{}`);
      if (r.footnote) assert.ok(dosingTable.footnotes[r.footnote], `${a.id}: unknown footnote ${r.footnote}`);
    }
    assert.ok([3, 4].includes(a.page), `${a.id}: page`);
  }
  assert.equal(openFractures.antimicrobial.length, 4);
  assert.equal(openFractures.duration.length, 2);
});

// OpenFracturesView finds the regimen the PCN Allergy toggle highlights by this id;
// a rename would quietly drop the highlight, so it fails the build instead (v0.7.9).
// ...and must name the row the PDF labels for penicillin allergy: with the ids of
// two rows swapped, the toggle lit the Type I & II cefazolin row instead (Codex
// whole-codebase review, 2026-10-14).
test("the open-fracture penicillin-allergy id names the penicillin-allergy row, and only it", () => {
  const ids = openFractures.antimicrobial.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate open-fracture antimicrobial id");
  const byLabel = openFractures.antimicrobial.filter((a) => /penicillin allergy/i.test(a.applies));
  const byId = openFractures.antimicrobial.filter((a) => a.id === "pcn-allergy");
  assert.equal(byLabel.length, 1);
  assert.deepEqual(byId, byLabel);
});

test("dosing table rows are complete and footnotes resolve", () => {
  assert.equal(dosingTable.rows.length, 4);
  const names = dosingTable.rows.map((r) => r.drug);
  assert.equal(new Set(names).size, names.length, "duplicate dosing row");
  for (const row of dosingTable.rows) {
    assert.ok(row.adult.length >= 1 && row.pediatric.length >= 2, `${row.drug}: missing dosing lines`);
    if (row.footnote) assert.ok(dosingTable.footnotes[row.footnote], `${row.drug}: unknown footnote ${row.footnote}`);
    assert.ok(drugs[row.drug], `${row.drug}: no drugs{} entry`);
  }
});

test("fever workup links are https CDC pages and references are numbered 1..13", () => {
  for (const r of feverWorkup.referenceStandards) assert.match(r.url, /^https:\/\/www\.cdc\.gov\//);
  assert.equal(feverWorkup.transcribedFromImage, true, "page 5 is an image; the disclosure flag must stay");
  assert.deepEqual(
    references.map((r) => r.n),
    Array.from({ length: 13 }, (_, i) => i + 1)
  );
  for (const r of references) if (r.url) assert.doesNotMatch(r.url, /utm_/, "tracking parameters must be stripped");
  assert.match(source.sha256, /^[0-9a-f]{64}$/);
  assert.ok(source.file.includes(source.sha256.slice(0, 12)), "the PDF filename must carry its content hash");
});

// Page 5 is a picture, which the verifier cannot read, so until v0.7.11 nothing
// noticed an edit to its transcription: deleting the UTI "discontinue
// antibiotics" step passed every check (Gemini whole-codebase review,
// 2026-10-14). This pins the whole feverWorkup object as it stood after the
// 2026-10-08 PDF cross-check and Thiago's rulings on it (v0.7.6). Update the
// hash only after page 5 of the PDF has been read against the new text, and the
// four readings in the comment above feverWorkup kept.
const PAGE5_SHA256 = "97acc241cd45479caa146381e3810e904b77f62a4ddd9b053808d350199252ba";
test("the page-5 transcription is unchanged since it was last read against the PDF", () => {
  const got = createHash("sha256").update(JSON.stringify(feverWorkup)).digest("hex");
  assert.equal(got, PAGE5_SHA256, `feverWorkup changed (sha256 now ${got}); re-read page 5 of the PDF before updating PAGE5_SHA256`);
});

test("search finds indications by name, abbreviation, brand and generic, and respects negations", () => {
  const ids = (q) => searchIndications(indications, q, drugs).map((i) => i.id);
  const first = (q) => ids(q)[0];
  assert.equal(first("appy"), "appendicitis");
  assert.equal(first("appendicitis"), "appendicitis");
  assert.equal(first("nec fasc"), "nsti");
  assert.deepEqual(new Set(ids("SBO")), new Set(["sbo-necrosis", "sbo-no-necrosis"]));
  // Exactly: every piperacillin-tazobactam row and the Zosyn note in abdominal
  // trauma's duration ("at least 7" let two of the nine vanish unnoticed).
  const pipTazo = indications.filter((i) => (i.regimen || []).some((r) => r.drug === "Piperacillin-tazobactam")).map((i) => i.id);
  assert.equal(pipTazo.length, 8);
  assert.deepEqual(new Set(ids("zosyn")), new Set([...pipTazo, "abdominal-trauma"]), "Zosyn hits every pip-tazo row and the duration note");
  const ertapenem = ids("invanz");
  assert.ok(ertapenem.includes("appendicitis") && ertapenem.includes("diverticulitis-source-control"));
  assert.equal(searchIndications(indications, "", drugs).length, indications.length);
  assert.equal(ids("xyzzy").length, 0);
  assert.ok(score(indications.find((i) => i.id === "chest-tubes"), "chest", drugs) > 0);
  // Negations: "complicated" must not match "uncomplicated", "purulent" must not match "non-purulent".
  assert.ok(ids("complicated").includes("complicated-uti"));
  assert.ok(!ids("complicated").includes("uncomplicated-uti"), '"complicated" matched the uncomplicated row');
  assert.ok(ids("purulent").includes("cellulitis-purulent"));
  assert.ok(!ids("purulent").includes("cellulitis-nonpurulent"), '"purulent" matched the non-purulent row');
  // All three spellings reach the non-purulent row, and only it; the spaced one
  // found nothing until v0.7.11.
  for (const q of ["nonpurulent", "non-purulent", "non purulent", "Non Purulent"]) {
    assert.deepEqual(ids(q), ["cellulitis-nonpurulent"], `"${q}"`);
  }
  assert.ok(ids("non operative").includes("closed-face-fracture"));
  // ...but "non" next to a word it does not join still counts as two words.
  assert.ok(ids("non cefazolin").includes("cellulitis-nonpurulent"), '"non cefazolin" is two words');
  assert.ok(ids("Q24H").includes("appendicitis"), "frequencies are searched");
  assert.ok(ids("4.5 g").includes("cholecystitis"), "doses are searched");
  // The redose rule is searched like every other field a row shows.
  const bloodLoss = indications.filter((i) => /blood loss/.test(i.redose ?? "")).map((i) => i.id);
  assert.ok(bloodLoss.length > 0);
  assert.deepEqual(new Set(ids("blood loss")), new Set(bloodLoss), "redose text is searched");
});

test("hash routes parse", () => {
  assert.equal(parseHash(""), "/");
  assert.equal(parseHash("#/fractures"), "/fractures");
  assert.equal(parseHash("#drugs/Cefazolin"), "/drugs/Cefazolin");
  assert.deepEqual(matchRoute("/"), { view: "indications" });
  assert.deepEqual(matchRoute("/i/appendicitis"), { view: "indications", focus: "appendicitis" });
  assert.deepEqual(matchRoute("/s/trauma"), { view: "indications", section: "trauma" });
  assert.deepEqual(matchRoute("/drugs/Piperacillin-tazobactam"), { view: "drugs", drug: "Piperacillin-tazobactam" });
  assert.deepEqual(matchRoute("/drugs/Sulfamethoxazole-TMP"), { view: "drugs", drug: "Sulfamethoxazole-TMP" });
  assert.deepEqual(matchRoute("/nonsense/x"), { view: "indications" });
  assert.deepEqual(matchRoute("/source"), { view: "source" });
});

// The PDF prints the open-fracture cefepime with no route; the app shows IV
// (Thiago, 2026-10-12: "cefepime is IV"), listed in transcription.corrections.
// The verifier's correction map applies to the data as well as the PDF, so this
// is what keeps the route from quietly going missing.
test("open-fracture cefepime carries its IV route", () => {
  const withCefepime = openFractures.antimicrobial.filter((a) => a.regimen.some((r) => r.drug === "Cefepime"));
  assert.deepEqual(withCefepime.map((a) => a.id), ["type-3", "contamination"]);
  for (const a of withCefepime) {
    assert.equal(a.regimen.find((r) => r.drug === "Cefepime").route, "IV", `${a.id}: cefepime route`);
    assert.match(a.text, /Cefepime\* 2g IV q8 hours/, `${a.id}: text`);
  }
  const c = pmg.transcription.corrections.find((x) => x.here === "Cefepime* 2g IV q8 hours");
  assert.ok(c, "correction listed");
  assert.equal(c.pdf, "Cefepime* 2g q8 hours", "the PDF wording the correction cites");
});

// Every listed correction must be one the verifier applies: its PDF wording and
// the app's wording normalise to the same text through TYPO_MAP (Codex review,
// v0.7.10). The one exception is the completed truncated label ("…/Urologic
// Instrumentation"), which the verifier matches by prefix instead.
test("each listed correction is applied by the verifier", () => {
  for (const c of pmg.transcription.corrections) {
    if (c.here.startsWith("…")) continue;
    assert.equal(norm(c.pdf), norm(c.here), `correction "${c.pdf}" is not in TYPO_MAP`);
  }
});

// ...and the other way: every rewrite the verifier applies is listed, so a
// TYPO_MAP entry cannot quietly let a difference from the PDF through without
// it appearing on the Source page's "Corrected from the PDF" card ("add to both
// or to neither"; Gemini whole-codebase review, 2026-10-14).
// Exactly: the rewrite applied to a correction's PDF wording must give that
// correction's wording here. Finding both sides somewhere inside a correction
// let ["8", "2"] pass on the cefepime one (Codex v0.7.11 review).
test("each TYPO_MAP rewrite is a listed correction", () => {
  const flat = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  for (const [from, to] of TYPO_MAP) {
    const [f, t] = [from.trim(), to.trim()];
    assert.ok(
      pmg.transcription.corrections.some((c) => flat(c.pdf).includes(f) && flat(c.pdf).replace(f, t) === flat(c.here)),
      `TYPO_MAP "${f}" → "${t}" is not a listed correction`
    );
  }
});
