// Light / dark theme guards. The two schemes share every component, so the
// things that can silently break one of them are checked here: a fixed colour in
// a component (renders the same in both schemes), a token defined in one scheme
// but not the other, a contrast pair that drops below the WCAG threshold, and the
// pre-paint script in index.html drifting from theme.js. Each guard has a control
// showing it can fail.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import { THEME_COLOR, THEME_KEY, resolveTheme } from "../src/lib/theme.js";
import { sections } from "../src/data/pmg.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const css = read("src/index.css");
const componentFiles = () => [
  ...readdirSync(new URL("../src/components/", import.meta.url)).map((f) => `src/components/${f}`),
  "src/App.jsx",
];

// ── Tokens ────────────────────────────────────────────────────────────────
function block(selectorStart) {
  const at = css.indexOf(selectorStart);
  assert.ok(at >= 0, `index.css: no block starting "${selectorStart}"`);
  const open = css.indexOf("{", at);
  const close = css.indexOf("}", open);
  const tokens = {};
  for (const m of css.slice(open + 1, close).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
  return tokens;
}
const light = block(':root,\n[data-theme="light"] {');
const dark = block('[data-theme="dark"] {');

test("both schemes define exactly the same tokens", () => {
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
  assert.ok(Object.keys(light).length >= 40, "token blocks look truncated");
});

test("every token the components and Tailwind refer to exists in both schemes", () => {
  const used = new Set();
  const sources = [read("tailwind.config.js"), css, ...componentFiles().map(read)];
  for (const src of sources) {
    for (const m of src.matchAll(/token\("([a-z0-9-]+)"\)/g)) used.add(m[1]);
    for (const m of src.matchAll(/var\(--([a-z0-9-]+[a-z0-9])\)/g)) if (!m[1].startsWith("tw-")) used.add(m[1]);
  }
  // Section hues are looked up by id at runtime: var(--hue-${section.hue}).
  for (const s of sections) used.add(`hue-${s.hue}`);
  for (const name of used) {
    assert.ok(name in light, `--${name} is used but not defined for the light scheme`);
    assert.ok(name in dark, `--${name} is used but not defined for the dark scheme`);
  }
});

// ── Contrast ──────────────────────────────────────────────────────────────
// A token as integer channels (plus alpha when asked for). A typo or a missing
// channel throws here: as NaN it would compare false against every threshold and
// the check would pass silently.
function channels(tokens, name, withAlpha = false) {
  const value = tokens[name];
  assert.ok(value !== undefined, `--${name} is not defined`);
  const [rgbPart, alphaPart] = value.split("/").map((s) => s.trim());
  const parts = rgbPart.split(/\s+/).map(Number);
  assert.equal(parts.length, 3, `--${name}: expected three channels in "${value}"`);
  for (const ch of parts) assert.ok(Number.isInteger(ch) && ch >= 0 && ch <= 255, `--${name}: bad channel in "${value}"`);
  if (!withAlpha) {
    assert.equal(alphaPart, undefined, `--${name} carries an alpha where a plain colour is expected`);
    return parts;
  }
  const alpha = alphaPart === undefined ? 1 : Number(alphaPart);
  assert.ok(Number.isFinite(alpha) && alpha >= 0 && alpha <= 1, `--${name}: bad alpha in "${value}"`);
  return [...parts, alpha];
}
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

// The pairs the components actually put together. Text needs 4.5:1, control
// lines and the focus ring 3:1. A chip (bg-chip) carries ink, prose or soft text,
// never muted or a tone mark, and a tone mark sits on a page surface or its own
// wash, never on a chip: those pairs fall short in one scheme or the other.
function contrastFailures(t) {
  const c = (n) => channels(t, n);
  const fails = [];
  const need = (min, fg, bg, label) => {
    const r = ratio(fg, bg);
    if (!Number.isFinite(r) || r < min) fails.push(`${label}: ${Number.isFinite(r) ? r.toFixed(2) : r} < ${min}`);
  };
  const page = ["paper", "card", "well"];
  for (const fg of ["ink", "prose", "soft", "muted", "accent", "accent-hi"]) for (const bg of page) need(4.5, c(fg), c(bg), `${fg} on ${bg}`);
  for (const fg of ["ink", "prose", "soft", "accent"]) need(4.5, c(fg), c("chip"), `${fg} on chip`);
  // The brand bar: its text and the gold on the bar, the tab row and the field.
  for (const fg of ["bar-text", "bar-text-soft", "bar-text-muted", "gold"]) {
    for (const bg of ["bar", "bar-raised", "bar-well"]) need(4.5, c(fg), c(bg), `${fg} on ${bg}`);
  }
  need(4.5, c("on-gold"), c("gold"), "on-gold on the switched-on pill");
  need(4.5, c("on-accent"), c("accent-fill"), "on-accent on accent-fill");
  need(4.5, c("on-accent"), c("accent-fill-hi"), "on-accent on accent-fill-hi");
  // The dose plate: the drug name, the gold dose and the softer route text on
  // Mizzou black, and the drug-name button's focus ring on it.
  for (const fg of ["plate-ink", "plate-soft", "plate-dose"]) need(4.5, c(fg), c("plate"), `${fg} on the plate`);
  need(3, c("focus"), c("plate"), "focus ring against the plate");
  // Tone cards: the ink and the mark on the wash; the mark as a label on a page
  // surface; prose and the marks on the physician card's inner boxes (card/70
  // over the amber wash); the timing numeral on its box (card/70 over rose).
  for (const tone of ["warn", "danger", "good"]) {
    need(4.5, c(`${tone}-ink`), c(`${tone}-bg`), `${tone}-ink on ${tone}-bg`);
    need(4.5, c(`${tone}-mark`), c(`${tone}-bg`), `${tone}-mark on ${tone}-bg`);
    for (const bg of page) need(4.5, c(`${tone}-mark`), c(bg), `${tone}-mark on ${bg}`);
  }
  const innerWarn = over(c("card"), 0.7, c("warn-bg"));
  for (const fg of ["prose", "warn-mark", "good-mark"]) need(4.5, c(fg), innerWarn, `${fg} on the physician card's inner boxes`);
  need(4.5, c("danger-mark"), over(c("card"), 0.7, c("danger-bg")), "the timing numeral on its box");
  // Control lines and the focus ring.
  for (const bg of page) {
    need(3, c("rule-strong"), c(bg), `rule-strong against ${bg}`);
    need(3, c("deepgold"), c(bg), `deepgold (icons and marks) against ${bg}`);
  }
  for (const bg of [...page, "chip", "bar", "bar-raised", "bar-well", "warn-bg"]) need(3, c("focus"), c(bg), `focus ring against ${bg}`);
  // The search field's resting boundary, on the field and on the bar around it.
  need(3, c("bar-rule"), c("bar-well"), "the search field's boundary on the field");
  need(3, c("bar-rule"), c("bar"), "the search field's boundary on the bar");
  return fails;
}

for (const [scheme, t] of [
  ["light", light],
  ["dark", dark],
]) {
  test(`${scheme} scheme: text reaches 4.5:1 and control lines 3:1 on every surface they share`, () => {
    assert.deepEqual(contrastFailures(t), []);
  });
}

test("the contrast check fails closed (control)", () => {
  for (const bad of ["oops 120 87", "4 120", "4 120 870", "4 120 87 / 0.5", ""]) {
    assert.throws(() => contrastFailures({ ...light, accent: bad }), /accent/, `malformed "${bad}" must throw`);
  }
  const pale = contrastFailures({ ...light, accent: "200 230 210" });
  assert.ok(pale.some((f) => f.startsWith("accent on")), "a pale accent colour must fail, not pass");
  // A pair that is deliberately left out of the matrix (muted on a chip) would
  // fail if it were in: the matrix is a usage list, so keep it in step with the
  // components rather than adding the pair.
  assert.ok(ratio(channels(light, "muted"), channels(light, "chip")) < 4.5);
});

// ── No fixed colours in components ────────────────────────────────────────
// A fixed colour renders identically in both schemes: white text that vanishes
// on the light card, or dark text lost on the dark one.
const PALETTE =
  "white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
// Utilities that take a colour, including the per-side border forms.
const COLOUR_UTILITY =
  "text|bg|border(?:-[xytrblse])?|ring|ring-offset|outline|divide|decoration|fill|stroke|from|via|to|caret|accent|placeholder|shadow";
const COLOUR_FN = "rgba?|hsla?|hwb|lab|lch|oklab|oklch|color";
const PATTERNS = [
  // text-white, hover:text-cyan-300, border-l-white, bg-black/60
  new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${COLOUR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:/\\d{1,3})?(?![\\w-])`, "g"),
  // Any arbitrary value carrying a hex or a colour function (shadows included),
  // unless the function wraps a theme variable: bg-[#0A0E14], bg-[oklch(1_0_0)]
  new RegExp(`(?<![\\w-])(?:[a-z-]+:)*[a-z-]+-\\[[^\\]]*?(?:#[0-9a-fA-F]{3,8}|(?:${COLOUR_FN})\\((?!var\\())[^\\]]*\\]`, "g"),
  // A colour utility given a keyword: bg-[white]
  new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${COLOUR_UTILITY})-\\[(?!transparent\\]|currentColor\\]|inherit\\])[a-zA-Z]+\\]`, "g"),
  // Inline style with a literal colour: style={{ color: "#fff" }}
  /\b(?:color|background|backgroundColor|borderColor|border(?:Top|Right|Bottom|Left)Color|outlineColor|textDecorationColor|fill|stroke|boxShadow|caretColor|accentColor)\s*:\s*["'`](?!\s*(?:var\(|rgb\(var\(|inherit|transparent|currentColor))/g,
  // SVG or icon colour attributes: fill="#fff", <Icon color="red" />
  /\b(?:fill|stroke|stopColor|floodColor|lightingColor|color)=\{?["'`](?!none["'`]|currentColor["'`]|url\()[^"'`]+["'`]/g,
];
const scan = (line) => PATTERNS.flatMap((re) => [...line.matchAll(re)].map((m) => m[0]));

test("components use theme tokens, never fixed colours", () => {
  const found = [];
  for (const file of componentFiles()) {
    read(file)
      .split("\n")
      .forEach((line, i) => {
        for (const hit of scan(line)) found.push(`${file}:${i + 1} ${hit}`);
      });
  }
  assert.deepEqual(found, [], "fixed colours found; use a token from tailwind.config.js");
});

test("the guard flags every way a fixed colour can be written (control)", () => {
  const flagged = [
    'className="text-white"',
    'className="group-hover:text-cyan-300"',
    'className="border-l-white"',
    'className="ring-offset-black"',
    'className="bg-black/60"',
    'className="bg-slate-50"',
    'className="text-amber-700"',
    'className="bg-[#0A0E14]"',
    'className="shadow-[0_0_8px_rgba(0,0,0,0.5)]"',
    'className="bg-[white]"',
    'className="bg-[oklch(1_0_0)]"',
    'style={{ color: "#ffffff" }}',
    "style={{ background: 'white' }}",
    '<path fill="#ffffff" />',
    '<Icon color="red" />',
  ];
  for (const s of flagged) assert.ok(scan(s).length > 0, `not flagged: ${s}`);
  const clean = [
    'className="text-ink bg-card border-rule-soft text-[13px] grid-cols-[6.5rem_minmax(0,1fr)] shadow-sm"',
    'className="bg-warn-bg text-warn-ink border-warn-line text-good-mark bg-danger-bg/40 text-bar-muted bg-bar-well"',
    'className="border-gold/40 text-on-gold ring-bar-rule decoration-faint divide-rule-soft"',
    'className="bg-[rgb(var(--warn-bg))] bg-[transparent]"',
    'style={{ "--hue": "var(--hue-trauma)" }}',
    '<path fill="none" stroke="currentColor" />',
  ];
  for (const s of clean) assert.deepEqual(scan(s), [], `wrongly flagged: ${s}`);
});

// ── Chips carry ink, prose or soft text ───────────────────────────────────
// muted and the tone marks fall short of 4.5:1 on bg-chip in one scheme or the
// other, and the matrix above leaves those pairs out on purpose. This guard
// keeps the components honest: on an element carrying bg-chip, and on any
// descendant of it, text-muted and the tone marks are not allowed. A descendant
// is a following line indented deeper than the element's opening tag (the tag
// that starts at or above the bg-chip line), until the indentation returns.
const CHIP_FORBIDDEN = /\btext-muted\b|\btext-(?:warn|danger|good)-mark\b/;
function chipViolations(source) {
  const lines = source.split("\n");
  const indent = (l) => l.match(/^\s*/)[0].length;
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/\bbg-chip\b/.test(lines[i])) continue;
    // The element's opening tag may start on an earlier line (a multi-line tag).
    let open = i;
    while (open > 0 && !lines[open].trim().startsWith("<")) open--;
    const base = indent(lines[open]);
    for (let j = i; j < lines.length; j++) {
      // A line that only closes the opening tag (">" or "/>") is still the tag.
      const t = lines[j].trim();
      if (j > i && t !== "" && !/^\/?>/.test(t) && indent(lines[j]) <= base) break;
      if (CHIP_FORBIDDEN.test(lines[j])) found.push(`${j + 1}: ${lines[j].trim().slice(0, 90)}`);
    }
  }
  return found;
}

test("no muted text or tone mark sits on a chip", () => {
  const found = componentFiles().flatMap((file) => chipViolations(read(file)).map((v) => `${file}:${v}`));
  assert.deepEqual(found, [], "use text-soft (or ink / prose) on bg-chip");
});

test("the chip guard catches a forbidden colour on the chip and inside it (control)", () => {
  const nested = ['<div className="rounded bg-chip p-2">', '  <span className="eyebrow text-muted">Adult</span>', "</div>"].join("\n");
  assert.equal(chipViolations(nested).length, 1, "a muted descendant");
  const sameLine = '<span className="bg-chip text-warn-mark">p.1</span>';
  assert.equal(chipViolations(sameLine).length, 1, "a tone mark on the chip itself");
  const multiLine = ["<div", '  className="rounded bg-chip p-2"', ">", '  <span className="text-good-mark">x</span>', "</div>"].join("\n");
  assert.equal(chipViolations(multiLine).length, 1, "a descendant of a multi-line tag");
  const clean = [
    '<div className="rounded bg-chip p-2">',
    '  <span className="eyebrow text-soft">Adult</span>',
    "</div>",
    '<p className="text-muted">a sibling after the chip is fine</p>',
  ].join("\n");
  assert.deepEqual(chipViolations(clean), []);
});

// ── Pre-paint script ↔ theme.js ───────────────────────────────────────────
test("the stored theme resolves to light unless it is explicitly dark", () => {
  assert.equal(resolveTheme("dark"), "dark");
  for (const v of ["light", null, undefined, "", "DARK", "system", "{}"]) assert.equal(resolveTheme(v), "light");
});

const html = read("index.html");
const bootstrap = () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const m = head.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(m, "no inline theme script in <head>");
  return m[1];
};
// The theme-color the page ships with.
const STATIC_THEME_COLOR = html.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];

// Runs the script against a stand-in document. Returns the data-theme it set on
// <html>.
function runBootstrap(script, storage) {
  const attributes = {};
  const context = {
    document: { documentElement: { setAttribute: (k, v) => (attributes[k] = String(v)) } },
  };
  if (storage !== undefined) context.localStorage = storage;
  vm.runInNewContext(script, context);
  return attributes["data-theme"];
}
const storing = (value) => ({ getItem: (key) => (key === THEME_KEY ? value : null) });

test("index.html's pre-paint script applies the saved theme, as theme.js resolves it", () => {
  const script = bootstrap();
  assert.equal(runBootstrap(script, storing("dark")), "dark");
  for (const v of ["light", null, "", "DARK", "system"]) {
    assert.equal(runBootstrap(script, storing(v)), resolveTheme(v), `stored ${JSON.stringify(v)}`);
    assert.equal(resolveTheme(v), "light");
  }
  const blocked = { getItem() { throw new Error("SecurityError"); } };
  assert.equal(runBootstrap(script, blocked), "light", "storage that throws");
  assert.equal(runBootstrap(script, undefined), "light", "no localStorage at all");
  // Control: a script that never sets the attribute leaves a saved-dark reader
  // without a theme, which the first assertion above would catch.
  const noop = script.replace(/document\.documentElement\.setAttribute\([^)]*\);/, "");
  assert.notEqual(noop, script, "control edit did not apply");
  assert.equal(runBootstrap(noop, storing("dark")), undefined);
});

test("theme-color is the brand bar, which is the same in both themes", () => {
  const hex = (triplet) => "#" + triplet.split(/\s+/).map((c) => Number(c).toString(16).padStart(2, "0")).join("").toUpperCase();
  assert.equal(hex(light.bar), hex(dark.bar), "the bar must be the same colour in both schemes");
  assert.equal(THEME_COLOR, hex(light.bar), "THEME_COLOR must equal --bar");
  assert.equal(STATIC_THEME_COLOR, THEME_COLOR, "index.html's static theme-color");
  const manifest = read("vite.config.js").match(/theme_color:\s*"([^"]+)"/)?.[1];
  assert.equal(manifest, THEME_COLOR, "the manifest's theme_color");
  // The splash screen's background is the default scheme's canvas.
  const splash = read("vite.config.js").match(/background_color:\s*"([^"]+)"/)?.[1];
  assert.equal(splash, hex(light.paper), "the manifest's background_color");
});

test("applyTheme switches the attribute and re-enables transitions", async () => {
  const attrs = {};
  const frames = [];
  const saved = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.document = {
    documentElement: {
      setAttribute: (k, v) => (attrs[k] = String(v)),
      removeAttribute: (k) => delete attrs[k],
      offsetWidth: 0,
    },
  };
  globalThis.requestAnimationFrame = (cb) => frames.push(cb);
  try {
    const { applyTheme } = await import("../src/lib/theme.js");
    for (const theme of ["dark", "light", "dark"]) {
      applyTheme(theme);
      assert.equal(attrs["data-theme"], theme);
      assert.ok("data-theme-switching" in attrs, "transitions are off for the switching frame");
      frames.splice(0).forEach((cb) => cb());
      assert.ok(!("data-theme-switching" in attrs), "and back on after it");
    }
  } finally {
    Object.assign(globalThis, saved);
  }
});

test("the pre-paint script runs in <head>, before the app bundle", () => {
  const at = html.indexOf("<script>");
  assert.ok(at > 0 && at < html.indexOf("</head>"), "theme script must be in <head>");
  assert.ok(at < html.indexOf('<script type="module"'), "theme script must run before the app bundle");
});
