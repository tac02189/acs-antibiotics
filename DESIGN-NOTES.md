**Codex variant — a clinical field guide in Mizzou black and gold**

The redesign treats each diagnosis as a separate reference card and each medication as the card's main reading target. Strong black section bands, restrained category edges, generous medication typography and a black navigation dock replace the continuous hairline list. The visual character is deliberately clinical: flat surfaces, clear boundaries, no decorative imagery or animation. Light mode keeps the required slate canvas; dark mode uses neutral graphite rather than blue slate.

What changed and why:

- Medication names are 20px bold, with dose, route and frequency together in 18px bold JetBrains Mono. This hierarchy applies to collapsed indication cards, expanded regimens, open-fracture regimens and the By-drug view. The dosing table has 24px drug headings and 18px dose entries. Combination partners retain their original order, separated by the neutral “plus” connector.
- Every diagnosis has a rounded, independently bordered card, 12px separation and a category-colored edge. Full-width dark section headings remain below the measured app header while scrolling. Names identify the categories; color provides a second cue. Deep-linked indication cards reserve space for the section band as well as the existing measured app header.
- Expanded regimens occupy a dedicated neutral medication well. Duration, Redose and the PDF's exact “PNC Allergy/Alternative” label form a separate, divided details panel. Alternatives still highlight only when the existing toggle is enabled. No regimen receives a green grade, check mark or recommendation label.
- Reference pages share larger headings and a 2px deep-gold rule. Dosing entries become separate cards. Fever-workup branches remain full-width at tablet sizes, avoiding three narrow columns of clinical sentences; their “Then” outcomes use prominent neutral panels.
- Phone navigation is black with a gold active icon, label and top mark. Tablet tabs distribute across the column. Theme, PDF, verification-notice and copy-link targets were brought to at least 44px. Search retains its 16px input size. Header height publication, routing, search, expansion state, ARIA/inert handling, theme persistence and service-worker code were preserved.
- Source-page content and the footer disclaimer remain unchanged. Source inherits the new shared panels and heading. The clinical data file, libraries, build configuration, package files and HTML head were not edited. The existing print overrides, including forced black text, remain; sticky section bands become static when printing.

How the three goals are met: medications get substantially larger, darker and heavier typography; diagnosis cards and persistent named section bands establish clear boundaries and scrolling context; black, Mizzou gold, quiet neutral surfaces and the existing self-hosted fonts maintain a professional MU identity. Medication emphasis is typographic, not a clinical judgment.

Five new RGB-triplet tokens are defined in both schemes and exposed through Tailwind:

| Token | Light RGB | Dark RGB | Use |
| --- | --- | --- | --- |
| `order-bg` | 246 247 249 | 37 40 44 | Medication wells and neutral outcome panels |
| `order-ink` | 16 19 24 | 250 250 248 | Medication names and dose lines |
| `section-bg` | 28 30 33 | 10 11 13 | Persistent section bands |
| `section-ink` | 255 255 255 | 255 255 255 | Section headings |
| `section-soft` | 213 217 224 | 213 217 224 | Section descriptions and counts |

Existing `ink`, `prose`, card-rule and dark surface tokens were adjusted. The light category hues were deepened to support visible edge markers on both cards and dark section bands. The four existing category tokens are now also exposed explicitly in Tailwind. The light `paper`, both `bar` values, Mizzou `gold`, and light `deepgold` retain the required values.

Only additions were made inside `contrastFailures()`; no existing pair, threshold or test was removed or reordered. The 33 additional combinations are:

- `order-ink` on `paper`, `card`, `well`, `order-bg` (4.5:1).
- `ink`, `prose`, `soft`, `accent`, `warn-mark` on `order-bg` (4.5:1).
- `section-ink`, `section-soft` on `section-bg` (4.5:1).
- `focus` on `order-bg`, `section-bg`, `accent-soft`, `danger-bg` (3:1).
- `ink`, `prose`, `soft`, `muted` on `warn-bg` (4.5:1).
- `accent` and `good-mark` on `accent-soft` (4.5:1).
- `rule-strong` on `order-bg`, and `gold` on `bar-well-hi` (3:1).
- `bar-text`, `bar-text-soft` on `bar-well-hi` (4.5:1).
- Each of `hue-trauma`, `hue-egs`, `hue-elective`, `hue-inpatient` against both `card` and `section-bg` (3:1).

Verification and limitations:

- `npm test` passes all 83 tests when run with the session-only environment setting `NODE_OPTIONS=--test-isolation=none`. Normal test-worker startup fails in this Windows sandbox with `spawn EPERM`. This setting runs the original tests in-process; it changes no repository file or test assertion.
- The PDF verifier passes: all 34 indication rows and all of its other existing comparisons agree with the source PDF.
- A temporary React server-rendering smoke check passed for all six views, every drug expansion and 136 indication combinations (34 rows × open/closed × Alternatives on/off). It checked that the original medication, duration, redose and alternative strings render, and that expansion ARIA attributes and `inert` remain correct. Header rendering was also checked in both theme states. This is not a browser interaction test.
- Direct compilation with the installed native esbuild executable passed, and the actual Tailwind stylesheet compiled successfully. No dependencies were installed.
- **`npm run build` is not green in this sandbox.** With the in-process test setting, it passes all tests and the PDF verifier, then Vite's esbuild service cannot start: `Error: spawn EPERM`. The prohibited build files were left intact. The native compilation checks above do not substitute for a successful full Vite/PWA build.
- **No browser viewport was visually verified.** Both installed Chromium browsers failed to start reliably because their Windows IPC pipes returned `Access is denied (0x5)`. The requested 320, 360, 375 and 768px widths, plus the 640px tab transition, were considered in the responsive source review but were not measured in a browser. Neither light nor dark has a screenshot-based sign-off.

For human review: run the normal `npm test` and `npm run build` outside the restricted sandbox, then inspect all six views in both themes at the requested widths. Pay particular attention to the one-line brand row at 320px, long medication names and pediatric dose wrapping, the six phone labels, tablet tab fit, and deep links clearing the persistent section band. Check search, Alternatives, expand/collapse, keyboard focus, theme switching and print in that browser pass. The larger medication type intentionally trades list density for bedside readability. Physician transcription verification remains pending, as the app notice states.

No commit was attempted.

Temporary verification scripts, logs, compiled checks and failed browser profiles remain in the ignored `.design-local/` directory. Automatic policy review rejected recursive deletion of this verified workspace-local directory with “blocked by policy”; it provided no more specific reason. The directory is excluded from tracked changes and the app build.
