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
import { THEME_COLOR, THEME_KEY, isIOSStandalone, resolveTheme } from "../src/lib/theme.js";
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
const dark = block(':root,\n[data-theme="dark"] {');
const light = block('[data-theme="light"] {');

test("both schemes define exactly the same tokens", () => {
  assert.deepEqual(Object.keys(light).sort(), Object.keys(dark).sort());
  assert.ok(Object.keys(dark).length >= 40, "token blocks look truncated");
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
    assert.ok(name in dark, `--${name} is used but not defined for the dark scheme`);
    assert.ok(name in light, `--${name} is used but not defined for the light scheme`);
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

function contrastFailures(t) {
  const c = (n) => channels(t, n);
  const fails = [];
  const need = (min, fg, bg, label) => {
    const r = ratio(fg, bg);
    if (!Number.isFinite(r) || r < min) fails.push(`${label}: ${Number.isFinite(r) ? r.toFixed(2) : r} < ${min}`);
  };
  const surfaces = ["card", "paper", "well", "bar"];
  const text = ["ink", "prose", "soft", "muted", "accent", "accent-hi", "dose", "gold", "signal-red"];
  for (const fg of text) for (const bg of surfaces) need(4.5, c(fg), c(bg), `${fg} on ${bg}`);
  need(4.5, c("dose"), c("readout"), "dose on readout");
  need(4.5, c("dose"), over(c("paper"), 0.9, c("card")), "dose on a paper chip");
  need(4.5, c("on-accent"), c("accent-fill"), "on-accent on accent-fill");
  need(4.5, c("on-accent"), c("accent-fill-hi"), "on-accent on accent-fill-hi");
  need(4.5, c("signal-red"), c("lcd"), "signal-red on the timing readout");
  need(4.5, c("muted"), c("sunk"), "muted on the footer");
  // The hazard highlight: the amber wash, with and without a caution stripe over
  // it, on a collapsed card (over the card) and in an expanded card (over the
  // card's well/40 body).
  const [sr, sg, sb, sa] = channels(t, "stripe", true);
  const highlights = {
    "collapsed highlight": over(c("tint-amber"), 0.4, c("card")),
    "expanded highlight": over(c("tint-amber"), 0.4, over(c("well"), 0.4, c("card"))),
  };
  for (const [where, wash] of Object.entries(highlights)) {
    for (const [bg, how] of [[wash, ""], [over([sr, sg, sb], sa, wash), " stripe"]]) {
      for (const fg of ["hazard-ink", "gold", "ink"]) need(4.5, c(fg), bg, `${fg} on ${where}${how}`);
    }
  }
  // The verification notice (the same amber in both schemes); its focus ring is
  // inset in the same ink.
  need(4.5, c("amber-ink"), c("amber-bg"), "notice text and focus ring");
  for (const bg of surfaces) {
    need(3, c("rule-strong"), c(bg), `rule-strong against ${bg}`);
    need(3, c("focus"), c(bg), `focus ring against ${bg}`);
  }
  return fails;
}

for (const [scheme, t] of [
  ["dark", dark],
  ["light", light],
]) {
  test(`${scheme} scheme: text tokens reach 4.5:1 and control lines 3:1 on every surface`, () => {
    assert.deepEqual(contrastFailures(t), []);
  });
}

test("the contrast check fails closed (control)", () => {
  for (const bad of ["oops 120 87", "4 120", "4 120 870", "4 120 87 / 0.5", ""]) {
    assert.throws(() => contrastFailures({ ...light, dose: bad }), /dose/, `malformed "${bad}" must throw`);
  }
  const pale = contrastFailures({ ...light, dose: "200 230 210" });
  assert.ok(pale.some((f) => f.startsWith("dose on")), "a pale dose colour must fail, not pass");
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

// The only fixed colours allowed, each pinned to the element it belongs to: the
// exception applies only on a line of that file that also matches `on`.
const ALLOWED = [
  // Black text, icon and dot on the switched-on Alternatives control, whose fill is
  // the same bright hazard yellow in both schemes.
  { file: "Toolbar.jsx", hit: "text-black", on: /"bg-hazard-fill text-black |pcn \? "text-black"/ },
  { file: "Toolbar.jsx", hit: "bg-black", on: /pcn \? "bg-black"/ },
];

test("components use theme tokens, never fixed colours", () => {
  const found = [];
  for (const file of componentFiles()) {
    const name = file.split("/").pop();
    read(file)
      .split("\n")
      .forEach((line, i) => {
        for (const hit of scan(line)) {
          const bare = hit.replace(/^(?:[a-z-]+:)*/, "");
          if (!ALLOWED.some((a) => a.file === name && a.hit === bare && a.on.test(line))) found.push(`${file}:${i + 1} ${hit}`);
        }
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
    'className="text-ink bg-card border-rule/60 text-[13px] grid-cols-[6.5rem_minmax(0,1fr)]"',
    'className="bg-amber-bg text-amber-ink border-amber-line text-hazard-amber bg-tint-red/40"',
    'className="bg-[rgb(var(--amber-bg))] bg-[transparent]"',
    'style={{ "--hue": "var(--hue-trauma)", animationDelay: "40ms" }}',
    '<path fill="none" stroke="currentColor" />',
  ];
  for (const s of clean) assert.deepEqual(scan(s), [], `wrongly flagged: ${s}`);
  // An exception does not travel: the same class elsewhere in Toolbar.jsx is caught.
  const line = '<span className="text-black">';
  assert.ok(!ALLOWED.some((a) => a.file === "Toolbar.jsx" && a.hit === "text-black" && a.on.test(line)));
});

// ── Pre-paint script ↔ theme.js ───────────────────────────────────────────
test("the stored theme resolves to dark unless it is explicitly light", () => {
  assert.equal(resolveTheme("light"), "light");
  for (const v of ["dark", null, undefined, "", "LIGHT", "system", "{}"]) assert.equal(resolveTheme(v), "dark");
});

const html = read("index.html");
const bootstrap = () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const m = head.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(m, "no inline theme script in <head>");
  return m[1];
};
// The theme-color the page ships with, before any script runs.
const STATIC_THEME_COLOR = html.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];

// Runs the script against a stand-in document. Returns the data-theme it set on
// <html> and the theme-color meta's content afterwards.
function runBootstrap(script, storage) {
  const attributes = {};
  const meta = { content: STATIC_THEME_COLOR, setAttribute: (k, v) => k === "content" && (meta.content = String(v)) };
  const context = {
    document: {
      documentElement: { setAttribute: (k, v) => (attributes[k] = String(v)) },
      querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? meta : null),
    },
  };
  if (storage !== undefined) context.localStorage = storage;
  vm.runInNewContext(script, context);
  return { theme: attributes["data-theme"], themeColor: meta.content };
}
const storing = (value) => ({ getItem: (key) => (key === THEME_KEY ? value : null) });

test("index.html's pre-paint script applies the saved theme and its theme-color, as theme.js does", () => {
  const script = bootstrap();
  assert.deepEqual(runBootstrap(script, storing("light")), { theme: "light", themeColor: THEME_COLOR.light });
  for (const v of ["dark", null, "", "LIGHT", "system"]) {
    const want = { theme: resolveTheme(v), themeColor: THEME_COLOR[resolveTheme(v)] };
    assert.deepEqual(runBootstrap(script, storing(v)), want, `stored ${JSON.stringify(v)}`);
    assert.equal(want.theme, "dark");
  }
  const blocked = { getItem() { throw new Error("SecurityError"); } };
  assert.equal(runBootstrap(script, blocked).theme, "dark", "storage that throws");
  assert.equal(runBootstrap(script, undefined).theme, "dark", "no localStorage at all");
  // Control: a script that never sets the attribute leaves a saved-light reader
  // without a theme, which the first assertion above would catch.
  const noop = script.replace(/document\.documentElement\.setAttribute\([^)]*\);/, "");
  assert.notEqual(noop, script, "control edit did not apply");
  assert.equal(runBootstrap(noop, storing("light")).theme, undefined);
  // Control: a script that never updates the meta leaves a saved-light reader
  // with the dark theme-color, which the first assertion above would catch.
  const noMeta = script.replace(/meta\.setAttribute\([^;]*;/, ";");
  assert.notEqual(noMeta, script, "control edit did not apply");
  assert.notEqual(runBootstrap(noMeta, storing("light")).themeColor, THEME_COLOR.light);
});

test("theme-color follows the top of the page in each theme", () => {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const hex = (triplet) => "#" + triplet.split(/\s+/).map((c) => Number(c).toString(16).padStart(2, "0")).join("").toUpperCase();
  // Light: exactly the white brand bar.
  assert.equal(THEME_COLOR.light, hex(light.bar), "THEME_COLOR.light must equal the light --bar");
  // Dark: what the page and the installed app start with, unchanged since v0.1.0...
  assert.equal(STATIC_THEME_COLOR, THEME_COLOR.dark, "index.html's static theme-color");
  const manifest = read("vite.config.js").match(/theme_color:\s*"([^"]+)"/)?.[1];
  assert.equal(manifest, THEME_COLOR.dark, "the manifest's theme_color");
  // ...and only a shade off the dark bar below it (no visible seam).
  const gap = Math.max(...rgb(THEME_COLOR.dark).map((c, i) => Math.abs(c - Number(dark.bar.split(/\s+/)[i]))));
  assert.ok(gap <= 4, `dark theme-color is ${gap} levels from the dark --bar`);
});

test("applyTheme switches the attribute and theme-color, and re-enables transitions", async () => {
  const attrs = {};
  const meta = { content: STATIC_THEME_COLOR, setAttribute: (k, v) => k === "content" && (meta.content = v) };
  const frames = [];
  const saved = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.document = {
    documentElement: {
      setAttribute: (k, v) => (attrs[k] = String(v)),
      removeAttribute: (k) => delete attrs[k],
      offsetWidth: 0,
    },
    querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? meta : null),
  };
  globalThis.requestAnimationFrame = (cb) => frames.push(cb);
  try {
    const { applyTheme } = await import("../src/lib/theme.js");
    for (const theme of ["light", "dark", "light"]) {
      applyTheme(theme);
      assert.equal(attrs["data-theme"], theme);
      assert.equal(meta.content, THEME_COLOR[theme], `theme-color after switching to ${theme}`);
      assert.ok("data-theme-switching" in attrs, "transitions are off for the switching frame");
      frames.splice(0).forEach((cb) => cb());
      assert.ok(!("data-theme-switching" in attrs), "and back on after it");
    }
  } finally {
    Object.assign(globalThis, saved);
  }
});

test("only an iPhone or iPad home-screen app gets the always-dark status strip", () => {
  assert.equal(isIOSStandalone({ standalone: true }), true);
  for (const nav of [{ standalone: false }, {}, { standalone: "true" }, undefined]) {
    assert.equal(isIOSStandalone(nav), false, JSON.stringify(nav));
  }
});

test("the pre-paint script runs in <head>, before the app bundle", () => {
  const at = html.indexOf("<script>");
  assert.ok(at > 0 && at < html.indexOf("</head>"), "theme script must be in <head>");
  assert.ok(at < html.indexOf('<script type="module"'), "theme script must run before the app bundle");
});
