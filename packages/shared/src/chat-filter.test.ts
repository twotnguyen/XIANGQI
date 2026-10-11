import { expect, it } from "vitest";
import { forbiddenNames } from "./auth-forbidden-words.js";
import { containsForbiddenName } from "./auth-filter.js";
import { maskForbiddenChat } from "./chat-filter.js";

it("masks the original span of a forbidden phrase without changing surrounding text", () => {
  expect(maskForbiddenChat("Đánh cờ như ĐỤ MÁ, thôi nhé!")).toBe(
    "Đánh cờ như ***, thôi nhé!",
  );
});
it.each([
  "ĐỊT MẸ",
  "dit me",
  "Đ.Ị.T---M.Ẹ",
  "d 1 t _ m 3",
  "c0n l0n",
  "F U C K",
  "sH!t",
  "b!7ch",
  "F\u200bu\u200dc\nk",
  "đi\u0323t me\u0323",
])("masks the existing normalization evasion %s", (raw) => {
  expect(maskForbiddenChat(`Trước ${raw} sau`)).toBe("Trước *** sau");
});
it("masks nested matches once, including the complete longer phrase", () => {
  expect(
    maskForbiddenChat("bullshit motherfucker shithead fuckoff fuckface"),
  ).toBe("*** *** *** *** ***");
});
it("masks repeated occurrences and leaves adjacent non-overlapping spans separate", () => {
  expect(maskForbiddenChat("shit, shit; fuckshit!")).toBe("***, ***; ******!");
});
it("keeps the existing substring policy instead of inventing word boundaries", () => {
  expect(maskForbiddenChat("preFUCKsuffix")).toBe("pre***suffix");
});
it("preserves emoji and nonoffending combining marks around a masked span", () => {
  expect(maskForbiddenChat("👨‍👩‍👧‍👦 ĐỊT MẸ 🐉 e\u0301!")).toBe("👨‍👩‍👧‍👦 *** 🐉 e\u0301!");
});
it("includes a trailing combining accent in the masked span without removing punctuation", () => {
  expect(maskForbiddenChat("[di\u0323t me\u0323],")).toBe("[***],");
});
it("keeps literal HTML as text and masks only the forbidden text inside it", () => {
  expect(maskForbiddenChat("<b>SHIT</b><script>alert(1)</script>")).toBe(
    "<b>***</b><script>alert(1)</script>",
  );
});
it.each([
  "",
  "Long chơi tốt",
  "Đỏ đi trước ♟️",
  "<img src=x onerror=alert(1)>",
  "  Giữ\n nguyên\t dấu!  ",
  "e\u0301",
])("keeps clean text unchanged: %s", (raw) => {
  expect(maskForbiddenChat(raw)).toBe(raw);
});
it("shares every current team-maintained forbidden phrase with the name filter", () => {
  for (const phrase of forbiddenNames) {
    expect(containsForbiddenName(phrase)).toBe(true);
    expect(maskForbiddenChat(`(${phrase})`)).toBe("(***)");
  }
});
it("does not implement service-owned length validation", () => {
  const raw = "🐉".repeat(201);
  expect(maskForbiddenChat(raw)).toBe(raw);
});
