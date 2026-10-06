// Search over indications. Pure functions so the tests can drive them.
//
// Matching rules, each one here because of a real retrieval failure:
//   - tokens are matched as substrings, so "chole" finds cholecystitis and
//     "tazo" finds Piperacillin-tazobactam;
//   - hyphens inside words are dropped on both sides, so "nonpurulent",
//     "non-purulent" and "non purulent" all reach "Non-Purulent";
//   - a token is NOT matched inside a negated word: "complicated" does not hit
//     "uncomplicated", "purulent" does not hit "non-purulent";
//   - durations, regimen notes, doses and frequencies are indexed too, so
//     "Zosyn" reaches the abdominal-trauma duration note and "Q24H" works.

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
// class) with their doses and frequencies, the regimen note, the duration and
// the text of the alternative column.
export function haystack(ind, drugs) {
  const parts = [ind.short, ...(ind.aliases || [])];
  for (const r of ind.regimen || []) {
    parts.push(r.drug, r.dose, r.frequency);
    const meta = drugs[r.drug];
    if (meta) parts.push(meta.brand, meta.class);
  }
  if (ind.regimenNote) parts.push(ind.regimenNote);
  if (ind.duration) parts.push(...ind.duration);
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
  let total = 0;
  for (const t of ts) {
    if (matches(name, t)) total += name.startsWith(t) ? 3 : 2;
    else if (matches(hay, t)) total += 1;
    else return 0;
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
