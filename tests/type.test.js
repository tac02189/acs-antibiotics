// Type-scale guard. Every font size in the interface is a step of one short
// scale, so sizes cannot drift back into near-duplicates: v0.3 used nineteen,
// with 13 beside 13.5, 16 beside 16.5 and 17, and 19 through 22. Choose a step by
// its role below, not by eye. Nothing is under 11px, the smallest size at which an
// uppercase label or a page reference stays legible at arm's length.
//
// The guard reads source text, not computed styles. It checks every file under
// src/ and index.html (comments included, so a size named in a comment is flagged
// too) for each way a size can be written: a text-[…] value, a Tailwind named size,
// a CSS font-size or font declaration, an inline or SVG font size, a fontSize theme
// key, and a <sup> or <sub> without its own size (Tailwind's preflight sets those to
// 75% of the text around them). A size built at runtime, text-[${n}px], is flagged
// rather than checked.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const SCALE = new Map([
  [11, "eyebrow labels, bottom-nav labels, the footer's version line, the brand subtitle"],
  [12, "eyebrows that say who a regimen or dose applies to or give a timing rule; footnotes, footnote marks, the PDF button, small meta"],
  [13, "notes and asides, blurbs, the verification notice (not rendered since v0.7.5), collapsed-row doses, tab and pill labels, references"],
  [14, "collapsed summaries (regimen lines, the alternative preview, By-drug lists), page intros, Source-page prose, buttons"],
  [15, "expanded clinical detail: Duration, Redose and alternative fields, bullet lists, criteria, durations, dosing lines; row titles"],
  [16, "drug names, the brand title, the search input (iOS zooms the page below 16px), the timing sentence"],
  [18, "card headings on phones, the timing sentence from sm up"],
  [20, "card headings from sm up"],
  [24, "page titles on phones"],
  [28, "page titles from sm up, the open-fracture timing numeral"],
  [36, "the timing numeral from sm up"],
]);

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const FILES = [
  ...readdirSync(new URL("../src/", import.meta.url), { recursive: true })
    .map((f) => String(f).split("\\").join("/"))
    .filter((f) => /\.(jsx?|css)$/.test(f))
    .map((f) => `src/${f}`),
  "index.html",
  "tailwind.config.js",
];

// text-[…] with any variant prefix and an optional /line-height suffix.
const ARBITRARY = /(?<![\w-])text-\[([^\]]*)\]/g;
// Colours are written text-[…] too. Tailwind reads a bare var() after text- as a
// colour, and tests/theme.test.js decides which colours are allowed.
const COLOUR = /^(?:color:|#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|var\(--[\w-]+\)$)/;
// Named sizes also set a line height; one idiom, the px steps.
const NAMED = /(?<![\w-])text-(?:xs|sm|base|lg|[2-9]?xl)(?![\w-])/g;
const CSS_DECLARATION = /(?<![\w-])font(?:-size)?\s*:/g; // font-size: 9px; font: 9px/1 serif
const SIZE_PROPERTY = /\bfontSize\b|font-size\s*=/g; // style={{ fontSize }}, <text font-size="9">, a fontSize theme key
const SUP_SUB = /<su[pb]\b[^>]*>/g;

function offScale(source) {
  const found = [];
  const at = (index, what) => found.push({ index, what });
  for (const m of source.matchAll(ARBITRARY)) {
    const value = m[1];
    const px = /^(\d+)px$/.exec(value);
    if (px) {
      if (!SCALE.has(Number(px[1]))) at(m.index, `${m[0]} is not a step of the scale`);
    } else if (!COLOUR.test(value)) {
      at(m.index, `${m[0]}: write a scale step in px`);
    }
  }
  for (const m of source.matchAll(NAMED)) at(m.index, `${m[0]}: a named size; use its px step`);
  for (const m of source.matchAll(CSS_DECLARATION)) at(m.index, `"${m[0]}": set sizes with a scale class`);
  for (const m of source.matchAll(SIZE_PROPERTY)) at(m.index, `"${m[0]}": set sizes with a scale class`);
  for (const m of source.matchAll(SUP_SUB)) if (!/text-\[\d+px\]/.test(m[0])) at(m.index, `${m[0]} needs its own size`);
  return found;
}

test("every font size is a step of the type scale", () => {
  assert.ok(FILES.length > 15, `only ${FILES.length} files found`);
  const found = FILES.flatMap((file) => {
    const source = read(file);
    return offScale(source).map(({ index, what }) => `${file}:${source.slice(0, index).split("\n").length} ${what}`);
  });
  assert.deepEqual(found, [], `steps: ${[...SCALE.keys()].join(", ")} px`);
});

test("the guard catches every way a size can be written, and nothing else (control)", () => {
  const caught = [
    'className="text-[13.5px]"',
    'className="sm:text-[17px]"',
    'className="min-[400px]:text-[10px]"',
    'className="text-[length:10px]"',
    'className="text-[.5rem]"',
    'className="text-[0.8rem]"',
    'className="text-[50%]"',
    'className="text-[2vw]"',
    'className="text-[calc(8px+1px)]"',
    'className="text-[clamp(8px,1vw,10px)]"',
    "className={`text-[${size}px]`}",
    'className="text-sm"',
    'className="hover:text-lg"',
    'className="text-2xl"',
    'className="text-sm/6"',
    "@apply font-display text-[9px] font-bold;",
    "  font-size: 9px;",
    "  font: 9px/1 serif;",
    "style={{ fontSize: 10 }}",
    '<text font-size="9">',
    'fontSize: { tiny: "9px" },',
    '<sup className="text-hazard-amber">*</sup>',
    "<sub>2</sub>",
  ];
  for (const s of caught) assert.ok(offScale(s).length > 0, `not caught: ${s}`);
  const clean = [
    'className="text-[15px] sm:text-[20px] min-[400px]:text-[18px] text-[15px]/6 text-ink text-balance text-left text-ellipsis text-pretty text-hazard-amber"',
    'className="text-[rgb(var(--ink))] text-[var(--ink)]"',
    "  font-family: Source Sans 3 Variable;",
    "@apply font-display font-bold;",
    '<sup className="ml-0.5 font-mono text-[13px] text-hazard-amber">*</sup>',
    "<summary>",
  ];
  for (const s of clean) assert.deepEqual(offScale(s), [], `wrongly caught: ${s}`);
});
