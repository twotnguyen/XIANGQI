import { HttpException } from "@nestjs/common";

interface CodedError extends Error {
  code: string;
  status: number;
}
type CodedErrorClass = abstract new (...args: never[]) => CodedError;

// Đầu vào HTTP sai khuôn: 400 với mã riêng của tính năng.
export function invalidInput(
  code: string,
  message = "Dữ liệu không hợp lệ",
): never {
  throw new HttpException({ code, message }, 400);
}

// Dùng cho `.catch(fail)` ở controller: lỗi nghiệp vụ thuộc `kinds` đổi thành
// HttpException cùng mã/trạng thái, lỗi khác ném lại nguyên trạng.
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
