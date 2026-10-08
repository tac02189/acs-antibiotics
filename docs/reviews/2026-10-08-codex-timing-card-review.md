# Codex peer review — smaller open-fracture timing card (v0.6.1), 2026-10-08

Single-engine review: Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec --sandbox read-only`
(header confirmed `sandbox: read-only`), reasoning effort `high`. Relayed by the `codex-review`
bridge agent. Not cross-checked by Gemini.

- **Scope:** the uncommitted diff against `0e27a28` (six files: `OpenFracturesView.jsx`,
  `tests/type.test.js`, `CLAUDE.md`, `README.md`, `package.json`, `package-lock.json`), embedded in
  the prompt with the two source files whole; Codex also read the tree from disk for the repo-wide
  checks.
- **Tree evidence matched** before any finding was read: HEAD `0e27a28`, `OpenFracturesView.jsx` 154
  lines, `tests/type.test.js` 117 lines. `Get-Location` was `$PSHOME`, as usual on this tree; Codex
  used absolute paths and `git -C`.
- **Read-only:** HEAD, `status` and the index mtime were unchanged afterwards.
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; the dispositions are
  at the end.

---

````text
Verified checkout: HEAD `0e27a287eaf34e24e5699f644eabd306e6292926`; `OpenFracturesView.jsx` **154 lines**; `tests/type.test.js` **117 lines**. `Get-Location` returned `C:\Windows\System32\WindowsPowerShell\v1.0`; all commands used absolute repository paths.

### Findings

- **Low — stale role-list version label.** [CLAUDE.md:214](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/CLAUDE.md:214>) still says “The roles, as of v0.6.0,” although the following timing roles now describe v0.6.1. Update that label.
- **Info — clinical content displayed by the restyled card requires human verification.** [src/data/pmg.js:553](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/data/pmg.js:553>) supplies: “Administer within **30 min of arrival to the ED** & **all patients to have MRSA nasal screen**.” Both instructions remain displayed through [OpenFracturesView.jsx:33](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/OpenFracturesView.jsx:33>); the numeral is also extracted at line 8. These are unchanged protocol statements, flagged without judging clinical correctness. **No drug dose is touched by this change.**

**High / Medium: no findings.**

### Answers to questions 1–5

**1. Remaining font sizes: no findings.**

I independently searched all 19 files under `src/`, plus `index.html` and `tailwind.config.js`, without executing or relying on `tests/type.test.js`.

The explicit sizes found were exactly:

`11 12 13 14 15 16 18 20 24 28 36 px`

No 42px size, off-scale arbitrary size, named Tailwind font size, CSS font-size/font shorthand, inline/SVG font-size override, or theme `fontSize` key was found. All four `<sup>` usages explicitly set an allowed size. The shared eyebrow declaration is 11px at [src/index.css:208](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/index.css:208>).

**2. Role descriptions: match, apart from the stale version label above.**

| Step | Actual roles and evidence |
|---|---|
| **16px** | Expanded regimen drug names and dose lines: [shared.jsx:180](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx:180>), lines 185–187. Indications row titles: [IndicationsView.jsx:358](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/IndicationsView.jsx:358>), also line 377. Gustilo-Anderson row titles: [OpenFracturesView.jsx:114](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/OpenFracturesView.jsx:114>). Brand title and search input: [Header.jsx:68](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/Header.jsx:68>), line 113. Timing sentence below `sm`: OpenFracturesView line 33. |
| **18px** | Indications section heads: [shared.jsx:96](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx:96>). Dosing and By-drug names: [DosingView.jsx:21](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/DosingView.jsx:21>), [DrugsView.jsx:63](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/DrugsView.jsx:63>). Reusable card headings below `sm`: shared.jsx line 137. Timing sentence from `sm`: OpenFracturesView line 33. |
| **20px** | Reusable card headings from `sm`: [shared.jsx:137](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx:137>). Also Source-page headings at lines 64, 103 and 127. No longer the timing sentence. |
| **24px** | Page titles below `sm`: [shared.jsx:127](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx:127>). |
| **28px** | Page titles from `sm`: shared.jsx line 127. Timing numeral below `sm`: [OpenFracturesView.jsx:24](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/OpenFracturesView.jsx:24>). |
| **36px** | Timing numeral from `sm`: OpenFracturesView line 24; its only usage. |

“Card headings” accurately describes `CardHeading`; it is not universal—all drug-name headings, for example, remain 18px at larger widths. Likewise, “drug names” at 16px describes expanded regimens, not every drug-name occurrence.

The mappings in [tests/type.test.js:24](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/tests/type.test.js:24>) and [CLAUDE.md:215](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/CLAUDE.md:215>) agree. [README.md:68](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/README.md:68>) states the correct 11–36px range; it contains no detailed role list.

**3. Card layout: no confirmed regression; browser verification remains outstanding.**

- **320px:** With a normal 16px root and no horizontal safe-area inset, the main gutters leave 288px, and the card’s border/padding leave **262px** for content. The numeral box sits above the wrapping sentence. Evidence: [App.jsx:96](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/App.jsx:96>), [index.css:216](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/index.css:216>), and OpenFracturesView lines 17–33.
- **From `sm` (640px):** The card becomes a row, but the numeral and unit become a **column**. The 5.5rem minimum is 88px, leaving 62px inside its padding/borders. The 36px two-digit numeral and separate 12px `MIN` label should fit. This is a minimum, not a fixed width; `shrink-0` permits the box to retain a larger intrinsic width.
- **Unit wrapping:** The regex currently extracts `30` and `min`. Its permitted units are single words; there is no internal whitespace to wrap. On phones, the box’s flex row defaults to no wrapping. From `sm`, placing the unit below the numeral is intentional.
- **200% text:** There is no fixed card height or clipping rule; the sentence can wrap and the box can grow. `min-w-0` allows the sentence column to shrink. `keepUnits` binds `30 min` together ([text.js:23](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/lib/text.js:23>)). Static inspection suggests low risk, but **I did not render 200% text or browser zoom**, so this is not a measured accessibility pass.
- **ToneCard:** [shared.jsx:54](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/components/shared.jsx:54>) adds `rounded-lg border p-3` and danger colors. The duplicate `p-3` is harmless; `sm:p-4` supplies larger-screen padding.

**4. Clinical-file integrity: confirmed; no findings.**

The exact requested `git … diff --stat -- src/data/pmg.js` command returned **no output**. An additional comparison against HEAD for `src/data` and `public` returned no differences and exit code 0, covering staged changes too.

Only the six packet files are modified. No tracked clinical wording, dose, cutoff, duration, protocol value, or source PDF changed.

**5. Other checks: no additional findings.**

- **Accessibility:** Calculated contrast from [index.css:65](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/index.css:65>) and [index.css:133](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/src/index.css:133>) is **8.71:1 / 11.08:1** for the sentence, and at least **5.72:1** for labels/numerals across both themes, including the translucent box. The decorative numeral remains `aria-hidden`; the full sentence remains accessible. No interactive target changes.
- **Versions:** `package.json:4`, `package-lock.json:3` and `:9` all say **0.6.1**. [vite.config.js:6](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/vite.config.js:6>) derives the footer version from the package. Manifest/service-worker configuration has no separate release-version literal.
- **Documentation:** README’s v0.6.0 design reference and [HISTORY.md:181](<C:/Thiago/OneDrive/[3] Claude/ACS Antibiotics/docs/HISTORY.md:181>) describe the earlier design/deployment. History has no v0.6.1 entry yet. No stale 11–42px scale claim was found; CLAUDE.md’s sole 42px reference explicitly records its removal.
- **Correctness, secrets and whitespace:** No findings in the diff; `git diff --check HEAD` passed. No additional sub-400px regression identified statically.

No files were written, and no builds, installs or tests were run.
````

---

## Dispositions

- **Low, stale "as of v0.6.0" label (`CLAUDE.md:214`):** fixed; the roles are now "as of v0.6.1".
- **Info, clinical content (`src/data/pmg.js:553`):** relayed to Thiago unchanged. The timing
  sentence and the MRSA nasal-screen instruction were not touched by this change, and the review is
  not clinical verification; the in-app "pending physician verification" notice stays.
- **Layout (answer 3), rendered after the review:** in the preview at 320, 360 and 375px (light) and
  768px (dark), no horizontal scroll, and the numeral box and sentence sit inside the card. Card
  height at 375px went from 207px to 149px; at 320 and 360px it is 171px. Not checked: enlarged text
  on a device (the sizes are px, so a root-font-size test proves nothing), an installed iPhone,
  print.
