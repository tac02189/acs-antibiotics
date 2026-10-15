// Search over indications. Pure functions so the tests can drive them.
//
// Matching rules, each one here because of a real retrieval failure:
//   - tokens are matched as substrings, so "chole" finds cholecystitis and
//     "tazo" finds Piperacillin-tazobactam;
//   - hyphens inside words are dropped on both sides, and a lone "non" in the
//     query is tried joined to the word after it, so "nonpurulent",
//     "non-purulent" and "non purulent" all reach "Non-Purulent" (the spaced
//     form found nothing until v0.7.11: Gemini whole-codebase review,
//     2026-10-14), while "non cefazolin" still matches as two words;
//   - a token is NOT matched inside a negated word: "complicated" does not hit
//     "uncomplicated", "purulent" does not hit "non-purulent";
//   - durations, redosing, regimen notes, doses and frequencies are indexed too,
//     so "Zosyn" reaches the abdominal-trauma duration note, "Q24H" works and
//     "blood loss" finds the trauma redose rule.

export function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/(?<=[a-z])-(?=[a-z])/g, "") // non-purulent → nonpurulent, pip-tazo → piptazo
    .replace(/[^a-z0-9/+.%<>=-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(q) {
  return norm(q).split(" ").filter(Boolean);
}

export function altText(ind) {
  if (ind.alternative == null) return "";
  return Array.isArray(ind.alternative) ? ind.alternative.join(" ") : ind.alternative;
}

const NEGATION_PREFIXES = ["un", "non", "in"];

// True when `token` occurs in `hay` other than as the tail of a negated word.
export function matches(hay, token) {
  let from = 0;
  for (;;) {
    const i = hay.indexOf(token, from);
    if (i < 0) return false;
    // Walk back to the start of the word the match sits in.
    let w = i;
    while (w > 0 && /[a-z]/.test(hay[w - 1])) w--;
    const prefix = hay.slice(w, i);
    if (!NEGATION_PREFIXES.includes(prefix)) return true;
    from = i + 1;
  }
}

// Everything a query may hit, besides the name: aliases, drugs (generic, brand,
// class) with their doses and frequencies, the regimen note, the duration, the
// redose rule and the text of the alternative column: every field a row shows.
export function haystack(ind, drugs) {
  const parts = [ind.short, ...(ind.aliases || [])];
  for (const r of ind.regimen || []) {
    parts.push(r.drug, r.dose, r.frequency);
    const meta = drugs[r.drug];
    if (meta) parts.push(meta.brand, meta.class);
  }
  if (ind.regimenNote) parts.push(ind.regimenNote);
  if (ind.duration) parts.push(...ind.duration);
  if (ind.redose) parts.push(ind.redose);
  const alt = altText(ind);
  if (alt) parts.push(alt);
  // Brand names for every generic named anywhere in the row's free text.
  const free = norm([ind.regimenNote, ...(ind.duration || []), alt].filter(Boolean).join(" "));
  for (const [name, meta] of Object.entries(drugs)) {
    if (free.includes(norm(name)) || free.includes(norm(meta.brand))) parts.push(meta.brand, name);
  }
  return norm(parts.filter(Boolean).join(" | "));
}

// 0 = no match. Every token must match somewhere (AND); name hits rank highest.
export function score(ind, query, drugs) {
  const ts = tokens(query);
  if (!ts.length) return 1;
  const name = norm(ind.name);
  const hay = haystack(ind, drugs);
  const hit = (t) => (matches(name, t) ? (name.startsWith(t) ? 3 : 2) : matches(hay, t) ? 1 : 0);
  let total = 0;
  for (let i = 0; i < ts.length; i++) {
    // "non purulent" means "non-purulent", which norm() makes one word on the
    // data side; as two tokens, "purulent" is refused as the tail of a negated
    // word and the row disappears. So a "non" is first tried joined to the next
    // token, and only if that matches nothing are the two taken separately
    // ("non cefazolin" is two words; joining it always was the v0.7.11 draft's
    // regression, Codex review).
    if (ts[i] === "non" && /^[a-z]/.test(ts[i + 1] ?? "")) {
      const joined = hit("non" + ts[i + 1]);
      if (joined) {
        total += joined;
        i++;
        continue;
      }
    }
    const s = hit(ts[i]);
    if (!s) return 0;
    total += s;
  }
  return total;
}

export function searchIndications(indications, query, drugs) {
  if (!tokens(query).length) return indications;
  return indications
    .map((ind) => ({ ind, s: score(ind, query, drugs) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.ind);
}
