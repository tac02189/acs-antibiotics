# Gemini peer review — the brand bar follows the theme (v0.3.1), 2026-10-06

**Codex was tried first and reviewed nothing.** It hit its account usage limit 27 seconds into the run,
before any analysis (exit 1: "You've hit your usage limit … try again at 11:06 AM"). The root
`CLAUDE.md` quota-failover rule names Gemini as the valid fallback, so this review ran on Gemini.

Single-engine review: Antigravity CLI (`agy`) 1.3.0, model `gemini-3.8-flash-high`, headless with
`--mode plan --sandbox --disable-slash-commands`, prompt on stdin through the stream-json recipe.
Conversation `e6e7174f-623f-45af-afbf-6d3402333c40`, one turn, 455 s, 126,453 tokens. It used no
tools: the stream holds one `user_input` step and the rest are `agent_response` deltas.

It reviewed the uncommitted working tree against `016d740` (10 modified files), sent as a 5-line-context
diff plus 18 numbered files, 9 changed and 9 unchanged context. The packet was verified line by line
against disk before sending. Gemini answered the tree-evidence table with all 12 line counts right and
11 of 12 quoted lines exact; the miss was one line off in `CLAUDE.md`. Relayed by the `gemini-review`
bridge agent. Not cross-checked by Codex. **Nothing below was dismissed or softened.** Gemini's
answer follows verbatim; the dispositions are at the end.

---

````text
TREE EVIDENCE
- HEAD sha: 016d740eb2c30d50e1205e4f2cdb162fbbfcbd2a
- Evidence table:
  - index.html: last line number = 57 | exact text of line 50 = `    <!-- Fonts are self-hosted via @fontsource (imported in main.jsx), so typography works offline. -->`
  - src/lib/theme.js: last line number = 51 | exact text of line 44 = `      localStorage.setItem(THEME_KEY, next);`
  - src/components/BrandBar.jsx: last line number = 79 | exact text of line 68 = `          href="#/source"`
  - src/components/ThemeToggle.jsx: last line number = 22 | exact text of line 19 = `      <Icon className="size-[18px] text-accent" aria-hidden="true" />`
  - src/index.css: last line number = 293 | exact text of line 251 = `    --prose: 0 0 0;`
  - tests/theme.test.js: last line number = 281 | exact text of line 239 = `      documentElement: { setAttribute: (k, v) => (attributes[k] = String(v)) },`
  - package.json: last line number = 37 | exact text of line 32 = `    "sharp": "^0.34.5",`
  - CLAUDE.md: last line number = 213 | exact text of line 182 = `   HMR keeps serving the old theme (old fonts, default border colour) and it looks like a CSS bug.`
  - README.md: last line number = 142 | exact text of line 121 = `the app-authored brand/class table, and — above all — whether the PDF itself is right. The Source page`
  - tailwind.config.js: last line number = 83 | exact text of line 67 = `        // The verification notice: the same amber in both schemes`
  - src/components/Toolbar.jsx: last line number = 105 | exact text of line 78 = `        <nav className="hidden sm:flex -mx-1 mt-2.5 gap-1.5 overflow-x-auto no-scrollbar pb-1.5" aria-label="Sections">`
  - src/components/shared.jsx: last line number = 155 | exact text of line 142 = `export function Lines({ value, muted = ["or", "OR", "+/-", "plus"] }) {`
- Number of FILE blocks in Section 7: 18
- Path of the last FILE block: src/components/shared.jsx
- Disk access or commands run: none

---

FINDINGS

[MEDIUM] tests/theme.test.js:267-276 - Test "theme-color matches the top of the page in each theme" fails to assert dark `THEME_COLOR` against `dark.bar`, masking a color discrepancy between `theme-color` (#080B10) and the brand bar (#0A0E14)
Evidence: VERIFIED.
Arithmetic and token values:
- `src/index.css:26`: `--bar: 10 14 20;`. Linearized:
  $R = 10/255 = 0.0392157 \le 0.04045 \implies R_{\text{lin}} = 0.0392157 / 12.92 = 0.003035$
  $G = 14/255 = 0.054902 \implies G_{\text{lin}} = ((0.054902 + 0.055)/1.055)^{2.4} = (0.1041725)^{2.4} = 0.004392$
  $B = 20/255 = 0.078431 \implies B_{\text{lin}} = ((0.078431 + 0.055)/1.055)^{2.4} = (0.126475)^{2.4} = 0.007011$
  $L_{\text{dark.bar}} = 0.2126(0.003035) + 0.7152(0.004392) + 0.0722(0.007011) = 0.00429$.
  sRGB Hex: $10 \to \text{0A}$, $14 \to \text{0E}$, $20 \to \text{14} \implies \text{\#0A0E14}$.
- `src/index.css:21`: `--paper: 8 11 16;`.
  sRGB Hex: $8 \to \text{08}$, $11 \to \text{0B}$, $16 \to \text{10} \implies \text{\#080B10}$.
- `src/lib/theme.js:15`: `export const THEME_COLOR = { dark: "#080B10", light: "#FFFFFF" };`.
- `index.html:12-14`:
  `<!-- The colour of the brand bar at the top of the page; the script below switches it with the theme. -->`
  `<meta name="theme-color" content="#080B10" />`.
- `tests/theme.test.js:270-272`:
  Line 270 pins light: `assert.equal(THEME_COLOR.light, hex(light.bar), "THEME_COLOR.light must equal the light --bar");`.
  Line 272 pins dark: `assert.equal(STATIC_THEME_COLOR, THEME_COLOR.dark, "index.html's static theme-color");`.
Why it matters, and the concrete trigger:
The test title explicitly states: `"theme-color matches the top of the page in each theme"`. In light theme, the top of the page is the brand bar, and the test pins `THEME_COLOR.light` directly to `hex(light.bar)` (`#FFFFFF`). In dark theme, the top of the page is rendered with `bg-bar` (`#0A0E14`) on both the fixed status strip (`BrandBar.jsx:25`) and the console top (`BrandBar.jsx:29`). However, `THEME_COLOR.dark` is `#080B10` (the canvas `--paper` color and manifest splash color), not `#0A0E14`.
If the test asserted `assert.equal(THEME_COLOR.dark, hex(dark.bar))`, it would fail (`"#080B10" !== "#0A0E14"`). By testing `THEME_COLOR.dark` only against `STATIC_THEME_COLOR` and `manifest.theme_color`, the test passes despite the dark brand bar diverging from the dark `theme-color`. On browsers that color the browser address bar/tab bar to match `theme-color`, dark mode presents an unaligned boundary between the browser chrome (`#080B10`) and the top brand bar (`#0A0E14`), directly contradicting `index.html:12-13` which claims `theme-color` is "The colour of the brand bar at the top of the page".
Suggested direction:
Either:
1. Align `THEME_COLOR.dark`, `STATIC_THEME_COLOR`, and `manifest.theme_color` to `#0A0E14` so the dark browser bar seamlessly matches the dark brand bar (`dark.bar`), and update `tests/theme.test.js` to assert `assert.equal(THEME_COLOR.dark, hex(dark.bar))`; or
2. If `#080B10` is deliberately preserved for the manifest and splash background, correct the comments in `index.html:12-13` and `src/lib/theme.js:12-14`, and update the test description and assertions to document that dark `theme-color` tracks the canvas `--paper` rather than the bar.

---

[MEDIUM] src/components/BrandBar.jsx:21-25 - Fixed status strip with unconditional `data-theme="dark"` creates a persistent black cutout bar over light theme on iOS installed PWAs and risks black-on-black status icons on edge-to-edge Android displays
Evidence: VERIFIED (DOM structure and CSS token scoping) / PLATFORM RECALL (iOS and Android PWA status-bar handling).
Code trigger:
`src/components/BrandBar.jsx:21-25`:
```jsx
<div
  data-theme="dark"
  aria-hidden="true"
  className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] bg-bar pointer-events-none"
/>
```
And `src/components/BrandBar.jsx:29`:
`<div className="bg-bar text-ink border-b border-rule pt-[env(safe-area-inset-top)]">`
Why it matters, and the concrete trigger:
1. On an installed iPhone PWA where `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />` applies, the viewport extends under the notch/status bar, where iOS draws status bar text in white. In light theme, the brand bar below the inset is white (`#FFFFFF`), but the fixed strip over the inset is scoped to `data-theme="dark"` (`#0A0E14`). This creates a stark, permanent black band across the top of an otherwise all-white light theme console. When the user scrolls, this black rectangle remains fixed at `z-50`, while the light verification banner and light toolbar scroll under/dock against it. The author admitted in `CLAUDE.md:132` that this has not been checked on a real device.
2. On Android displays where edge-to-edge display cutout is enabled and `env(safe-area-inset-top)` is non-zero: when the user toggles to light mode, `theme-color` is `#FFFFFF`. Because the theme color is light, Android system UI renders status bar icons (clock, battery, Wi-Fi) in black/dark ink. However, `BrandBar.jsx` renders a fixed `#0A0E14` (black) bar unconditionally behind that top inset, resulting in black status bar text over a black background (1.0:1 contrast, completely illegible).
Suggested direction:
Investigate switching `apple-mobile-web-app-status-bar-style` to `default` (which allows the OS to manage status bar styling cleanly according to color scheme or display bounds), or ensure the fixed strip is conditionally rendered only on devices that mandate `black-translucent`, rather than imposing an unconditional black bar across all platforms reporting a top safe area inset.

---

[LOW] tests/theme.test.js:11 - Runtime `applyTheme()` function in `src/lib/theme.js` is never imported or executed in tests, leaving runtime `meta[name="theme-color"]` mutation untested
Evidence: VERIFIED.
In `tests/theme.test.js:11`:
`import { THEME_COLOR, THEME_KEY, resolveTheme } from "../src/lib/theme.js";`
`applyTheme` is not imported, and no test in `tests/` invokes `applyTheme()`.
Why it matters, and the concrete trigger:
In v0.3.1, `applyTheme` was modified in `src/lib/theme.js:33` to add:
`document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);`
`tests/theme.test.js` exercises only `index.html`'s pre-paint script inside a Node VM sandbox (`runBootstrap`). The actual runtime logic that executes when a bedside reader taps the theme toggle (`applyTheme`) has no test coverage. If `applyTheme` fails to locate the meta element, uses an invalid selector, or throws, the test suite remains 100% green.
Suggested direction:
Add a test in `tests/theme.test.js` that calls `applyTheme("light")` and `applyTheme("dark")` against a mock `document` (or stand-in DOM context) to assert that `document.documentElement.getAttribute("data-theme")` and `document.querySelector('meta[name="theme-color"]').getAttribute("content")` are updated synchronously.

---

[LOW] src/components/BrandBar.jsx:64-65 - Stale comment in verification banner states global focus ring would sit on "the dark bar"
Evidence: VERIFIED.
`src/components/BrandBar.jsx:64-65`:
```jsx
{/* Verification notice — hazard amber, stays until a physician signs the transcription off.
    The same amber in both themes. Its focus ring is inset in the notice's own dark ink:
    the global ring would sit on the amber and the dark bar, where it reads under 3:1. */}
```
In `CLAUDE.md:137-139`, the corresponding text was updated in this change:
`The global ring would sit partly on the amber, where the light scheme's deep gold reads 2.1:1`
Why it matters, and the concrete trigger:
In light mode, the brand bar sitting directly above the verification notice is white (`#FFFFFF`), not dark. The comment in `BrandBar.jsx:65` was left unchanged from v0.3.0 and contradicts the code changes in `BrandBar.jsx:29` and the updated doc in `CLAUDE.md`.
Suggested direction:
Update line 65 of `BrandBar.jsx` to remove the reference to "the dark bar" and clarify that the inset focus ring is retained because the light scheme's gold ring on amber background achieves only 2.1:1 contrast.

---

[LOW] tests/theme.test.js:260-265 - Pre-paint script control assertion does not include a control mutation for `themeColor`
Evidence: VERIFIED.
In `tests/theme.test.js:260-265`:
```js
  // Control: a script that never sets the attribute leaves a saved-light reader
  // without a theme, which the first assertion above would catch.
  const noop = script.replace(/document\.documentElement\.setAttribute\([^)]*\);/, "");
  assert.notEqual(noop, script, "control edit did not apply");
  assert.equal(runBootstrap(noop, storing("light")).theme, undefined);
```
Why it matters, and the concrete trigger:
The testing convention in `tests/theme.test.js` is: "Each guard has a control showing it can fail" (line 5). When `themeColor` verification was introduced to `runBootstrap`, a negative control was added only for `data-theme` omission (`noop`), not for `meta[name="theme-color"]` manipulation. If the script was modified such that it omitted setting `meta.setAttribute("content", ...)`, `runBootstrap(noop, ...)` would not fail on that account.
Suggested direction:
Add an explicit negative control mutation that strips `meta.setAttribute` from `script` and asserts that `runBootstrap` returns `themeColor: STATIC_THEME_COLOR` (`#080B10`), confirming that the assertion fails when `themeColor` is unhandled.

---

[INFO] src/components/ThemeToggle.jsx:17 & src/components/BrandBar.jsx:54 - Theme toggle and PDF button backgrounds (`bg-card/80`) have identical luminance to `bg-bar` in light mode
Evidence: VERIFIED.
Arithmetic:
In light mode (`src/index.css:81,85`):
- `--card: 255 255 255;` ($L = 1.0000$)
- `--bar: 255 255 255;` ($L = 1.0000$)
- Contrast ratio between button background and header background:
  $(1.0000 + 0.05) / (1.0000 + 0.05) = 1.00:1$.
Why it matters, and the concrete trigger:
In dark mode, `--card` (`15 20 29`) provides a distinct tonal separation over `--bar` (`10 14 20`), giving both controls a tactile panel appearance. In light mode, because both tokens are `255 255 255`, `bg-card/80` blends completely into `bg-bar`. The buttons are visually outlined solely by their `border-rulestrong` (`122 135 156`, contrast 3.64:1 against white) and `shadow-sm`. Under WCAG 2.1 AA 1.4.11, the 3.64:1 border satisfies the 3.0:1 requirement for control boundaries, but the button surface itself loses its differentiated container styling in light mode until hovered (`hover:bg-rule/60`).
Suggested direction:
No mandatory change is required for compliance, but if a distinct button surface is desired in light mode, consider using a recessed token like `bg-well` (`243 245 248`) or `bg-paper` (`237 240 244`).

---

PER-AREA RESULT

- Focus Area 1 (Light-mode legibility and control boundaries on white):
  - `src/components/ThemeToggle.jsx:17 & src/components/BrandBar.jsx:54 - Theme toggle and PDF button backgrounds (bg-card/80) have identical luminance to bg-bar in light mode`
  - `src/components/BrandBar.jsx:64-65 - Stale comment in verification banner states global focus ring would sit on "the dark bar"`
  *(Note on computed contrasts for Focus Area 1 detailed below: all text and boundary tokens reach WCAG AA thresholds on white).*
- Focus Area 2 (The iPhone strip reasoning and browser/PWA regressions):
  - `src/components/BrandBar.jsx:21-25 - Fixed status strip with unconditional data-theme="dark" creates a persistent black cutout bar over light theme on iOS installed PWAs and risks black-on-black status icons on edge-to-edge Android displays`
- Focus Area 3 (theme-color correctness across script, applyTheme, static meta, manifest):
  - `tests/theme.test.js:267-276 - Test "theme-color matches the top of the page in each theme" fails to assert dark THEME_COLOR against dark.bar, masking a color discrepancy between theme-color (#080B10) and the brand bar (#0A0E14)`
- Focus Area 4 (Test soundness and mock fidelity):
  - `tests/theme.test.js:267-276 - Test "theme-color matches the top of the page in each theme" fails to assert dark THEME_COLOR against dark.bar, masking a color discrepancy between theme-color (#080B10) and the brand bar (#0A0E14)`
  - `tests/theme.test.js:11 - Runtime applyTheme() function in src/lib/theme.js is never imported or executed in tests, leaving runtime meta[name="theme-color"] mutation untested`
  - `tests/theme.test.js:260-265 - Pre-paint script control assertion does not include a control mutation for themeColor`
- Focus Area 5 (Breaks elsewhere: print, verification notice, sticky toolbar, SW updates):
  - no findings (Print properly hides `header.no-print`; verification notice focus ring inset holds; sticky toolbar sticks at `env(safe-area-inset-top)` below the header; SW reload preserves theme via `localStorage`).

---

FOCUS AREA 1: CONTRAST ARITHMETIC VERIFICATIONS

All ratios computed by hand from linearised sRGB channels ($C \in [0, 255]$, $c = C / 255$, $c_{\text{lin}} = c / 12.92$ if $c \le 0.04045$, else $((c + 0.055) / 1.055)^{2.4}$; $L = 0.2126 R_{\text{lin}} + 0.7152 G_{\text{lin}} + 0.0722 B_{\text{lin}}$):

1. Background: Light `--bar`: `255 255 255`
   $R_{\text{lin}} = G_{\text{lin}} = B_{\text{lin}} = 1.0 \implies L_{\text{bar}} = 1.0000$.

2. Brand title: Light `--ink`: `15 23 42` on `--bar` (`255 255 255`)
   $R = 15/255 = 0.058824 \implies R_{\text{lin}} = 0.004777$
   $G = 23/255 = 0.090196 \implies G_{\text{lin}} = 0.008567$
   $B = 42/255 = 0.164706 \implies B_{\text{lin}} = 0.023152$
   $L_{\text{ink}} = 0.2126(0.004777) + 0.7152(0.008567) + 0.0722(0.023152) = 0.001016 + 0.006127 + 0.001672 = 0.008815$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.008815 + 0.05) = 1.05 / 0.058815 = \mathbf{17.85:1}$ [VERIFIED].
   Threshold: WCAG AA normal text $\ge 4.5:1$. Passes.

3. Subtitle / "MU Health" / PDF Icon / ThemeToggle Icon: Light `--accent`: `14 116 144` on `--bar` (`255 255 255`)
   $R = 14/255 = 0.054902 \implies R_{\text{lin}} = 0.004392$
   $G = 116/255 = 0.454902 \implies G_{\text{lin}} = 0.174646$
   $B = 144/255 = 0.564706 \implies B_{\text{lin}} = 0.278897$
   $L_{\text{accent}} = 0.2126(0.004392) + 0.7152(0.174646) + 0.0722(0.278897) = 0.000934 + 0.124907 + 0.020136 = 0.145977$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.145977 + 0.05) = 1.05 / 0.195977 = \mathbf{5.36:1}$ [VERIFIED].
   Threshold: WCAG AA normal text $\ge 4.5:1$. Passes.

4. Status dot: Light `--dose`: `4 120 87` on `--bar` (`255 255 255`)
   $R = 4/255 = 0.015686 \le 0.04045 \implies R_{\text{lin}} = 0.015686 / 12.92 = 0.001214$
   $G = 120/255 = 0.470588 \implies G_{\text{lin}} = 0.187820$
   $B = 87/255 = 0.341176 \implies B_{\text{lin}} = 0.095308$
   $L_{\text{dose}} = 0.2126(0.001214) + 0.7152(0.187820) + 0.0722(0.095308) = 0.000258 + 0.134329 + 0.006881 = 0.141468$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.141468 + 0.05) = 1.05 / 0.191468 = \mathbf{5.48:1}$ [VERIFIED].
   Threshold: WCAG non-text UI graphical object $\ge 3.0:1$. Passes.

5. PDF button label: Light `--prose`: `30 41 59` on `--bar` (`255 255 255`)
   $R = 30/255 = 0.117647 \implies R_{\text{lin}} = 0.012984$
   $G = 41/255 = 0.160784 \implies G_{\text{lin}} = 0.022173$
   $B = 59/255 = 0.231373 \implies B_{\text{lin}} = 0.043735$
   $L_{\text{prose}} = 0.2126(0.012984) + 0.7152(0.022173) + 0.0722(0.043735) = 0.002760 + 0.015858 + 0.003158 = 0.021776$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.021776 + 0.05) = 1.05 / 0.071776 = \mathbf{14.63:1}$ [VERIFIED].
   Threshold: WCAG AA normal text $\ge 4.5:1$. Passes.

6. Control boundaries: Light `--rule-strong`: `122 135 156` on `--bar` (`255 255 255`)
   $R = 122/255 = 0.478431 \implies R_{\text{lin}} = 0.194626$
   $G = 135/255 = 0.529412 \implies G_{\text{lin}} = 0.242284$
   $B = 156/255 = 0.611765 \implies B_{\text{lin}} = 0.332391$
   $L_{\text{rule-strong}} = 0.2126(0.194626) + 0.7152(0.242284) + 0.0722(0.332391) = 0.041377 + 0.173282 + 0.023999 = 0.238658$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.238658 + 0.05) = 1.05 / 0.288658 = \mathbf{3.64:1}$ [VERIFIED].
   Threshold: WCAG 2.1 AA 1.4.11 UI control boundary $\ge 3.0:1$. Passes.

7. Global focus ring: Light `--focus`: `128 83 0` on `--bar` (`255 255 255`)
   $R = 128/255 = 0.501961 \implies R_{\text{lin}} = 0.215860$
   $G = 83/255 = 0.325490 \implies G_{\text{lin}} = 0.086500$
   $B = 0 \implies B_{\text{lin}} = 0.0$
   $L_{\text{focus}} = 0.2126(0.215860) + 0.7152(0.086500) + 0 = 0.045892 + 0.061865 = 0.107757$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.107757 + 0.05) = 1.05 / 0.157757 = \mathbf{6.66:1}$ [VERIFIED].
   Threshold: WCAG 2.1 AA 1.4.11 focus indicator $\ge 3.0:1$. Passes.

8. Mark icon tile border: Light `--rule`: `214 220 229` on `--bar` (`255 255 255`)
   $R = 214/255 = 0.839216 \implies R_{\text{lin}} = 0.672460$
   $G = 220/255 = 0.862745 \implies G_{\text{lin}} = 0.715680$
   $B = 229/255 = 0.898039 \implies B_{\text{lin}} = 0.783530$
   $L_{\text{rule}} = 0.2126(0.672460) + 0.7152(0.715680) + 0.0722(0.783530) = 0.142965 + 0.511854 + 0.056571 = 0.711390$.
   Contrast Ratio: $(1.0000 + 0.05) / (0.711390 + 0.05) = 1.05 / 0.761390 = \mathbf{1.38:1}$ [VERIFIED].
   (Note: Below 3.0:1, but decorative border around a black icon tile; see Ground Rule 5).

---

CLINICAL FLAGS
none of the changed lines touch clinical content

---

NOT CHECKABLE FROM THIS PROMPT
1. The exact pixel values, inner contrast, and internal art rendering of `public/pwa-192.png` at 40x40 CSS px in `Mark`.
2. Actual visual rendering of the status bar text on a physical iPhone running an installed standalone PWA with `apple-mobile-web-app-status-bar-style: black-translucent` and the fixed strip in light mode.
3. Actual rendering and system status bar icon coloring on a physical Android device operating in edge-to-edge standalone mode with a hardware display cutout.
4. Physical verification of Node.js test runner execution (`npm test`).

---

Findings count: 0 CRITICAL, 0 HIGH, 2 MEDIUM, 3 LOW, 1 INFO.
````

---

## Dispositions

| Finding | Disposition |
|---|---|
| **MEDIUM** `tests/theme.test.js:267-276` — the dark theme-color (#080B10) is not the dark bar (#0A0E14), as a comment and the test title implied | **Fixed by correcting the claim, not the colour.** #080B10 is the manifest's `theme_color` and has been the dark theme-color since v0.1.0; changing it would alter the dark experience for a 2–4-level difference. The `index.html` comment and `theme.js` now say so. The test pins light exactly to the light bar, dark to the manifest and the static meta, and dark to within 4 levels per channel of the dark bar. |
| **MEDIUM** `BrandBar.jsx:21-25` — the always-dark strip: a black band in the iOS app in light mode, and dark-on-dark Android status icons in an edge-to-edge app | **Android: fixed.** The strip carries `data-theme="dark"` only when `isIOSStandalone()` (`navigator.standalone === true`); everywhere else it follows the theme like the bar, so a white theme-color sits over a white strip. Checked in the browser: in an ordinary tab the strip has no `data-theme` and computes white in light; with `navigator.standalone` set it computes dark. **iOS: kept by design.** `black-translucent` draws a white clock that cannot change at runtime, so the band behind it must be dark. Switching the status-bar style would instead put a white band over the default dark theme, and only for new installs. Neither platform has been checked on a real device. |
| **LOW** `tests/theme.test.js:11` — `applyTheme()` is untested | **Fixed.** A test runs `applyTheme` against a stand-in document and `requestAnimationFrame`. `data-theme` and the theme-color meta follow each switch, and `data-theme-switching` is set for the frame and removed after it. |
| **LOW** `BrandBar.jsx:64-65` — a stale comment about "the dark bar" | **Fixed.** |
| **LOW** `tests/theme.test.js:260-265` — no control for the theme-color update | **Fixed.** A control replaces the meta update with an empty statement and shows that a saved-light reader then keeps the dark theme-color, which the main assertion catches. |
| **INFO** `ThemeToggle.jsx:17`, `BrandBar.jsx:54` — the buttons' fill matches the white bar | **No change.** The buttons are outlined by `rule-strong` borders at 3.64:1, above the 3:1 boundary requirement, and read as outlined buttons. |

The bridge agent listed questions Gemini left unanswered: hover-state contrast, which browsers mishandle
a runtime theme-color change, iOS Safari in an ordinary tab, and a standard Android installed app.
They were not re-run.

The fixes were checked by the test suite (76 passing), the PDF verifier and in the browser. They were
not sent back to Gemini or to Codex.
