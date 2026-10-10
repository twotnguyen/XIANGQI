import { forbiddenNames } from "./auth-forbidden-words.js";
export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/0/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9]/g, "");
}
export function containsForbiddenName(value: string): boolean {
  const normalized = normalizeName(value);
  return forbiddenNames.some((word) =>
    normalized.includes(normalizeName(word)),
  );
}
