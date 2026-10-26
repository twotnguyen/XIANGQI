import { HttpException } from "@nestjs/common";

interface CodedError extends Error {
  code: string;
  status: number;
}
type CodedErrorClass = abstract new (...args: never[]) => CodedError;

/**
 * Ném ngoại lệ HTTP 400 kèm mã lỗi nghiệp vụ khi dữ liệu đầu vào không hợp lệ.
 */
export function invalidInput(
  code: string,
  message = "Dữ liệu không hợp lệ",
): never {
  throw new HttpException({ code, message }, 400);
}

/**
 * Tạo bộ xử lý lỗi (error handler) dùng cho catch ở controller:
 * Tự động chuyển đổi các lỗi nghiệp vụ thuộc danh sách `kinds` thành HttpException với status tương ứng.
 */
export function httpFailure(
  ...kinds: CodedErrorClass[]
): (error: unknown) => never {
  return (error) => {
    if (kinds.some((kind) => error instanceof kind)) {
      const { code, message, status } = error as CodedError;
      throw new HttpException({ code, message }, status);
    }
    throw error;
  };
}
