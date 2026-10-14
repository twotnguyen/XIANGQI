# T51 (XIAN-87) — hồi quy tại local (11/10/2026)

> T51 = "Hồi quy tích hợp toàn bộ chức năng". Tài liệu này ghi phần **chạy được ở local**.
> Kết quả: **PASS một phần** — hồi quy tự động đạt; phần nghiệm thu tích hợp với dịch vụ/vai trò thật còn **BLOCKED**.

## 1. Lệnh và kết quả

| Kiểm tra            | Lệnh                                         | Kết quả                                                        |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| Lint                | `pnpm lint`                                  | PASS                                                           |
| Kiểu                | `pnpm typecheck`                             | PASS — 0 lỗi                                                   |
| Định dạng           | `pnpm format:check`                          | PASS                                                           |
| Build web           | `pnpm --filter @xiangqi/web build`           | PASS                                                           |
| Kế hoạch Jira       | `python3 docs/planning/jira/tools/build_plan.py --check`   | PASS (107 issue, 71 task, 880h, 268 AC)                        |
| **Hồi quy tự động** | `pnpm exec vitest run --no-file-parallelism` | **130 file PASS / 21 skip; 2003 test PASS / 284 skip** (172 s) |

Môi trường: macOS 15.7.3, Apple M3 Pro 18 GB, Node v26.7.0, pnpm 10.34.6; PostgreSQL cô lập `127.0.0.1:55446` (room) và `:55447` (match) — như job CI.

## 2. Phạm vi tự động đã phủ

Bộ test hồi quy gồm (không đầy đủ): lõi luật + perft + adjudication, máy cờ (search/worker/giới hạn), fixtures đối chiếu oracle, xác thực (đăng ký/OTP, đăng nhập username + khoá thử sai, Google/Guest, phiên), realtime Socket.IO (handshake, broadcast, tải lại snapshot), phòng (tạo/mã/ghế/đổi bên/người xem/kick/block), đồng hồ, ván online (nước đi, đầu hàng, xoà, hết giờ, mất kết nối/ân hạn/khôi phục), chat hai kênh + lọc, AI (ghế, retry, lịch sử), bạn bè, LiveKit token/thu hồi, lịch sử + replay, FEN/PGN, hồ sơ/đăng xuất, chủ đề, QR, và **ma trận quyền theo vai trò** (NFR-04).

## 3. Thay đổi schema trong nhánh này

- Thêm `supabase/migrations/20261011000017_rls_hardening.sql` (+ rollback khoá hash): bật `ENABLE`/`FORCE ROW LEVEL SECURITY` + policy `app_server_all` cho 9 bảng P2 còn thiếu, và thêm `FORCE` cho 4 bảng `xiangqi_auth`. Chi tiết và bằng chứng: [NFR-04-RLS-LOCAL.md](NFR-04-RLS-LOCAL.md).

## 4. CÒN THIẾU để gọi T51 PASS (BLOCKED)

| Hạng mục                                            | Vì sao chưa chạy                                   |
| --------------------------------------------------- | -------------------------------------------------- |
| Nghiệm thu 268 AC theo "Kiểm thử US-*"              | Cần người kiểm thử độc lập + môi trường demo       |
| OTP thư thật (GATE-SMTP), Google thật (GATE-GOOGLE) | Cần hộp thư/tài khoản ngoài nhóm                   |
| GATE-SESSION (2 thiết bị), D10                      | Cần 2 trình duyệt/điện thoại thật + tài khoản thật |
| GATE-MEDIA (2 người chơi + 5 người xem LAN/Cloud)   | Cần nhiều máy + HTTPS LAN                          |
| GATE-REALTIME (50 client/10 ván)                    | Cần harness tải + môi trường demo                  |
| D1–D10 đầu-cuối                                     | Phụ thuộc các cổng trên                            |

## 5. Kết luận

| Tiêu chí T51                                       | Kết quả                                 |
| -------------------------------------------------- | --------------------------------------- |
| Hồi quy tự động (lint/typecheck/format/build/test) | **PASS tại local**                      |
| Hồi quy tích hợp dịch vụ thật + 268 AC             | **BLOCKED**                             |
| **Tổng**                                           | **PASS một phần — chưa đủ để đóng T51** |

Số liệu này là **local**, không dùng thay bằng chứng nghiệm thu trên bản phát hành.
