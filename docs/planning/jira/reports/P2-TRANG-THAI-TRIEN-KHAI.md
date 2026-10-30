# Trạng thái triển khai các Story mang mã US-P2 — đồng bộ 31/10/2026

> **Phạm vi hiện hành:** toàn bộ Story mang mã `US-P2-*` đã thuộc **P1** theo [BA 0.27](../../../product/BA-SCOPE-DECISIONS.md), trừ `US-P2-16` (QR) bị loại. Mã `P2` chỉ còn là định danh truy vết. Bản này thay bản 13/10 (đã lỗi thời: ghi QR "hoàn tất", ghi nhiều Story đã làm là "chưa làm").
>
> **Nguồn và giới hạn:** tổng hợp từ phần bằng chứng/đối chiếu code của [YC1–YC9](../../../product/BA-SCOPE-DECISIONS.md) và tìm tên trong mã nguồn ngày 31/10. Chưa chạy lại test, chưa mở giao diện, chưa đối chiếu Jira live. "Hoàn tất local" nghĩa là có bằng chứng kiểm local trong đặc tả; không phải nghiệm thu Cloud/CI/PO.

Quy ước: **Hoàn tất local** · **Có code, cần kiểm** · **Một phần** · **Chưa làm** · **Đã bỏ**.

| Story | Tên | Trạng thái | Căn cứ |
|---|---|---|---|
| US-P2-01 | Tính Elo và số ván Ranked | Chưa làm | Không có cột/mã Elo; YC9 mục 6 |
| US-P2-02 | Hàng đợi Ranked | Chưa làm | Không có hàng đợi ghép trận; luồng mới YC9 mục 16 |
| US-P2-03 | Giới hạn cặp Ranked 24 giờ | Chưa làm | YC9 mục 5.2, cờ dev/demo mục 16.2 |
| US-P2-04 | Phân quyền và vòng đời ván Ranked | Chưa làm | YC9 mục 5.3 |
| US-P2-05 | Quyền nhận media Ranked | Chưa làm | Có chia sẻ media theo vai trò (YC7) nhưng chưa có chế độ Ranked mặc định ẨN |
| US-P2-06 | Bảng xếp hạng và thẻ tóm tắt | Một phần | `rankedSummary` trả "Ranked chưa khả dụng"; chưa có `/leaderboard` thật |
| US-P2-07 | Ghép ngẫu nhiên Casual | Chưa làm | Không có hàng đợi; YC9 mục 4, 16 |
| US-P2-08 | Xin đi lại online | Chưa làm | Không có lệnh Xin đi lại trong realtime; YC5 mục 8.2, 13 |
| US-P2-09 | Tái đấu có chọn phe | Hoàn tất local (custom) | Commit `88bebb5`, YC2 mục 20; phần Casual chưa làm |
| US-P2-10 | Không giới hạn giờ và chống treo | Hoàn tất local (custom) | Commit `3e76bd6`, YC2 mục 20; banner chống treo cần kiểm lại (YC5 mục 13) |
| US-P2-11 | Lịch sử cá nhân | Có code, cần kiểm | `features/history`, `HistoryStore`; `HISTORY_ENABLED` mặc định `false` (YC4 mục 11); phần Ranked chưa làm |
| US-P2-12 | Lưu ván AI và Bỏ dở | Một phần | Lưu terminal có; nhánh hết 30 phút chưa chốt Bỏ dở (YC8 mục 12) |
| US-P2-13 | Replay riêng tư | Có code, cần kiểm | `ReplayPage`, `ReplayViewer`; cùng cờ `HISTORY_ENABLED` |
| US-P2-14 | Đi lại với máy | Có code, cần kiểm | `ai-games` có Undo; cần rà quyền Khách (YC8 mục 7, 12) |
| US-P2-15 | Copy FEN và tải PGN | Có code, cần kiểm | `packages/shared/src/replay-export.ts`, `GET /history/:id/export` |
| US-P2-16 | QR mời phòng | **Đã bỏ** | BA 0.20; mã QR đã gỡ khỏi `apps/web` |
| US-P2-17 | Bộ 12 sticker | Chưa làm | Không có mã sticker; YC7 mục 7 |
| US-P2-18 | Chat trực tiếp và tin chưa đọc | Hoàn tất local | Migration `20261102000004_direct_messages`, YC3 mục 16 |
| US-P2-19 | Thách đấu bạn bè | Hoàn tất local | YC3 mục 15–16 |
| US-P2-20 | Đổi username qua OTP | Hoàn tất local | Migration `20261102000001_username_management`, YC1 mục 19; giới hạn 1 lần/7 ngày (BA 0.28) chưa làm |
| US-P2-21 | Khôi phục username | Hoàn tất local | YC1 mục 18–19; lối vào "Quên tên đăng nhập?" theo BA 0.28 chưa làm |
| US-P2-22 | Widget thông số AI | Chưa làm | Engine có số liệu nhưng chưa tới giao diện; YC8 mục 12 |
| US-P2-23 | Công cụ demo mạng | Chưa làm | Không có mã; YC5 mục 13 |
| US-P2-24 | Chuyển thiết bị media giữa tab | Hoàn tất local | Commit `b65a5ed`, YC1 mục 19 |
| US-P2-25 | Giấy Sáng và Theo hệ thống | Hoàn tất local | Migration `20261102000005_account_theme`, YC1 mục 19 |

## Việc phát sinh từ quyết định rà soát 31/10 (chưa làm)

Các thay đổi sau chưa có trong code: Host Bắt đầu + Nhường Host + Mời rời ghế + Xin ngồi ghế (YC2, YC6), Hủy ván và loại kết quả `ABORTED` (YC5), chuyển chọn quân và nước hiện ngay (YC4), mã thiết bị theo trình duyệt và tách phiên theo tab khi phát triển (YC1), giới hạn thử mã/tìm bạn/popup (YC3), kết nối LiveKit theo nhu cầu và dấu báo tin chưa xem (YC7), ngẫu nhiên nhẹ của máy cờ và nút Bỏ ván (YC8), luồng ghép trận 2 phút/30 giây (YC9). Chi tiết ở mục "Quyết định PO khi rà soát" của từng YC và [BA 0.28–0.36](../../../product/BA-SCOPE-DECISIONS.md).

## Còn thiếu để nghiệm thu

1. Triển khai các Story "Chưa làm" và "Một phần" cùng các thay đổi phát sinh ở trên; ưu tiên YC1–YC8 trước YC9 (BA 0.27 mục 7).
2. Chạy nghiệm thu từng Story: API/socket/RLS trực tiếp, E2E, thiết bị/mạng thật khi nguồn yêu cầu; ghi PASS/FAIL/BLOCKED kèm bản dựng, môi trường, dữ liệu, ngày.
3. Chạy D1–D14 và NFR/gate trên bản phát hành; kiểm media 2 người chơi + 5 người xem.
4. Đồng bộ Jira và ước lượng giờ cho phạm vi mới khi PO yêu cầu; hạn 04/11/2026 chưa được đánh giá khả thi.
