# Codex peer review — v0.8.5, 2026-10-20

The required review before the v0.8.5 commit. It is single-engine (Codex), and it is not clinical
verification. Thiago said "remove the verification banner". The "Transcription pending physician
verification" banner is no longer rendered (the component is kept for the next edition, as v0.7.5
did), the test that pinned it now pins its absence, and the docs say so. No clinical value
changed; the footer's standing disclaimer is unchanged.

- **How it ran.** `codex exec`, `gpt-6-astra`, reasoning effort high, Codex v0.162.1, header
  `sandbox: read-only`. The packet went in on stdin with "do not use any tools"; Codex's log shows
  no tool calls, and `git status` and the diff hash were identical before and after.
- **The packet.** 30,932 bytes: the 207-line uncommitted diff (8 files), the full numbered text of
  `src/App.jsx` and `src/components/VerificationNotice.jsx`, and a grep of every banner mention in
  `CLAUDE.md`, `README.md`, `src`, `tests` and `docs/HISTORY.md`. Checked before sending: the diff
  hash matched a fresh `git diff`, each file ended on its real last line, all 31 grep lines present.

**Nothing below was dismissed or softened.**

## Codex's response (verbatim)

1. **Low — tests/pmg.test.js:396–399:** The test checks source text, but its name claims to check rendered behavior. It can pass if a child component renders the banner or equivalent markup without `VerificationNotice` appearing in `App.jsx`. It can also fail on a harmless comment mentioning that identifier. The supplied searches support the current removal, but do not strengthen the test’s future coverage. **Fix:** Assert the banner text is absent from the mounted application across its routes, retaining the separate component-file existence check. If keeping only a source check, narrow its stated purpose and use syntax-aware checks to avoid comment matches.

2. **Low — CLAUDE.md:60–63:** “By then” immediately follows the statement about v0.8.0, making the review chronology ambiguous: it can suggest Thiago had already reviewed the notes and fallback doses when the banner was restored. The packet establishes those reviews occurred before removal in v0.8.5. Clear chronology matters to the verification record. **Fix:** Write: “Before requesting removal in v0.8.5, Thiago had marked the eleven Source-page notes reviewed and checked the four empiric-table fallback doses against PDF page 4. Separately, Codex checked the transcription against the PDF’s page images on 2026-10-16.”

Checked and found fine:

- `App.jsx` removes both the import and rendered component. No dangling variable, unused import, or banner-specific spacing dependency is apparent in the supplied code. The main content follows the header with its existing padding.
- Retaining `VerificationNotice.jsx` does not itself render it.
- The changed documentation does not claim whole-transcription physician verification. README explicitly distinguishes the Codex transcription check from clinical verification; CLAUDE retains the distinction between reviewing notes and reading the whole transcription.
- All three supplied package version fields consistently change to `0.8.5`. No syntax or broken-reference issue is apparent in the diff.
- README’s sans-face statement describes component styling, not visibility. Historical statements in `docs/HISTORY.md` are not inherently stale merely because they use present tense.

Limitations: I used only the packet and no tools. The reported tests, verifier, preview, footer disclaimer, and clinical claims were not independently verified. Surrounding text for README:208 and the HISTORY grep matches is missing, so I cannot establish whether those passages clearly signal future-edition instructions or historical context. No additional patient-safety communication concern is established by the supplied material.

## Dispositions

1. **Low, the test reads `App.jsx` source but is named as if it checked rendering — fixed.** It is
   now named and commented as a source check. It reads every `.js`, `.jsx` and `.html` file in
   `src/` except the component, strips comments, and fails on an import of the component, its use
   as an element, or the banner's wording. Its own controls show each of those is caught and a
   comment naming the component is not. Planting the import back into `App.jsx` failed it with
   "src/App.jsx renders the verification notice". A rendering test was not added: the project has
   none for UI behaviour (CLAUDE.md, *Testing*).
2. **Low, "By then" made the chronology ambiguous — fixed.** The notes review and the fallback-dose
   check were both 2026-10-19, after v0.8.0; CLAUDE.md now says "Before asking for its removal he
   had marked …", with the Codex page-image check (2026-10-16) stated separately.
3. **Raised by the reviewing agent, not Codex: no v0.8.5 HISTORY entry — added** before the commit.

The fixes were checked by the tests and the planted import, not re-reviewed by Codex.
