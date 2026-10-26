import { forbiddenNames } from "./auth-forbidden-words.js";
/**
 * Chuẩn hóa chuỗi tên người dùng để kiểm tra từ cấm:
 * Bỏ dấu tiếng Việt, chuyển chữ thường, loại bỏ ký tự đặc biệt và giải mã ký tự leetspeak (0->o, 1/!->i, 3->e, 4->a, 5->s, 7->t).
 */
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

/**
 * Kiểm tra xem chuỗi tên người dùng có chứa từ cấm/tục tĩu nào hay không (sau khi đã qua chuẩn hóa leetspeak).
 */
export function containsForbiddenName(value: string): boolean {
  const normalized = normalizeName(value);
  return forbiddenNames.some((word) =>
    normalized.includes(normalizeName(word)),
  );
}
