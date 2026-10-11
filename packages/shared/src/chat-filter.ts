import { normalizeName } from "./auth-filter.js";
import { forbiddenNames } from "./auth-forbidden-words.js";

const words = forbiddenNames.map(normalizeName);

/** Mask original spans; rendering as plain text and length checks belong to callers. */
export function maskForbiddenChat(raw: string): string {
  let normalized = "",
    offset = 0;
  const positions: { start: number; end: number }[] = [];
  for (const character of raw) {
    const value = normalizeName(character);
    const end = offset + character.length;
    for (let index = 0; index < value.length; index++) {
      positions.push({ start: offset, end });
    }
    // A decomposed accent still belongs to the preceding original letter.
    if (
      !value &&
      /\p{M}/u.test(character) &&
      positions.at(-1)?.end === offset
    ) {
      positions.at(-1)!.end = end;
    }
    normalized += value;
    offset = end;
  }
  const spans: { start: number; end: number }[] = [];
  for (const word of words) {
    let at = normalized.indexOf(word);
    while (at !== -1) {
      spans.push({
        start: positions[at]!.start,
        end: positions[at + word.length - 1]!.end,
      });
      at = normalized.indexOf(word, at + 1);
    }
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: typeof spans = [];
  for (const span of spans) {
    const previous = merged.at(-1);
    if (previous && span.start < previous.end)
      previous.end = Math.max(previous.end, span.end);
    else merged.push(span);
  }
  let result = "",
    consumed = 0;
  for (const span of merged) {
    result += raw.slice(consumed, span.start) + "***";
    consumed = span.end;
  }
  return result + raw.slice(consumed);
}
