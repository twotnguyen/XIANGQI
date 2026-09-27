# EP16 · Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai và bàn giao

> **Loại:** Epic · **Story:** [ST16.7](../story/ST16.7-gioi-han-tan-suat-kich-thuoc-body-cors-va-tieu-de-bao-mat.md), [ST16.8](../story/ST16.8-ha-tang-internet-ban-dau-healthz-trien-khai-vercel-render-mo.md), [ST16.1](../story/ST16.1-kiem-chung-mo-hinh-nhieu-tab-moi-tab-thao-tac-chong-xung-dot.md), [ST16.2](../story/ST16.2-responsive-4-kich-thuoc-tro-nang-wcag-aa-5-trang-thai-toan-b.md), [ST16.3](../story/ST16.3-kiem-ma-tran-quyen-bang-du-lieu-gia-mao.md), [ST16.4](../story/ST16.4-thu-tai-10-phong-70-ket-noi-dong-thoi.md), [ST16.5](../story/ST16.5-nghiem-thu-r01r19-local.md), [ST16.6](../story/ST16.6-kiem-tren-moi-truong-internet-that-ho-so-ban-giao-va-bao-ve.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP16 · Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai và bàn giao` |
| Components | Frontend, Backend, Design, AI, DevOps, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep16` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-09-30 / 2026-10-22 |
| Nguồn đặc tả | ISSUE-098, ISSUE-130 … ISSUE-138 (R15, R16 + nghiệm thu R01–R19) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Hoàn thiện + nghiệm thu + triển khai**:
- Kiểm chứng tổng hợp: nhiều tab, ma trận quyền giả mạo, thử tải 70 kết nối, R01–R19.
- Responsive 4 kích thước, WCAG AA, 5 trạng thái 36 màn.
- Bảo mật: giới hạn tần suất, body, CORS, tiêu đề.
- Triển khai Internet (Vercel + Render + Supabase Cloud + LiveKit Cloud), hồ sơ bàn giao, ghi chú bảo vệ.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Nhiều Task là **Task QA** — Tester là người làm chính, viết test tổng hợp và báo cáo.
- Lỗi lần trước `F-15`: "thử tải" không đồng thời. Nguyên tắc chung của Epic: **báo cáo trung thực** (xem §5).

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Nghiệm thu local vs Internet** | Local: mọi AC chạy trên máy. Internet: email/Google thật, 2 mạng — ghi CHỜ tới TK16.6.1 |
| **Đối chứng âm** | Cố tình làm chậm / làm hỏng để chứng minh phép đo / test bắt được lỗi |
| **BLOCKED_EXTERNAL** | Thiếu tài nguyên ngoài — **không** phải Done |
| **DEMO_SLEEP_ALLOWED** | Gói miễn phí Render được ngủ; không ping chống ngủ |

Tra thêm: [Test lanes](../05-TU-DIEN-KY-THUAT.md#test-lanes) · [Không skip](../05-TU-DIEN-KY-THUAT.md#skip) · [IDOR](../05-TU-DIEN-KY-THUAT.md#idor) · [Trợ năng](../05-TU-DIEN-KY-THUAT.md#aria) · [Migration](../05-TU-DIEN-KY-THUAT.md#migration)

## 4. PHẠM VI

**✅ LÀM:** kiểm chứng tổng hợp; responsive + trợ năng + trạng thái; bảo mật; triển khai; hồ sơ bàn giao; ghi chú bảo vệ.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Nhiều máy chủ / tự co giãn | **Không** làm (known-limitations) |
| Redis, dịch vụ trả phí | **Không** dùng |
| Hứa 10 phòng video | **Không** — chỉ đã thử 1 phòng 2 phát + 5 xem |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Báo cáo trung thực | Không đạt ngưỡng ⇒ ghi **số thật** + Flag (`blocked`); ⛔ không hạ ngưỡng |
| Tài nguyên ngoài | Thiếu ⇒ `blocked-external` + ghi rõ thiếu gì; ⛔ không thay bằng giả lập rồi báo đạt |
| Skip = 0 | Cột "bỏ qua" luôn = 0; không `.only` |
| Không khoá bí mật trong `VITE_*` | Mọi `VITE_*` đều công khai |
| Không `prisma migrate` | Cloud dùng `supabase db push` |
| `docs/99-archive/` | Không xoá; so SHA-256 với baseline |

## 6. ĐẦU VÀO

Toàn bộ EP01–EP15.

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST16.1](../story/ST16.1-kiem-chung-mo-hinh-nhieu-tab-moi-tab-thao-tac-chong-xung-dot.md) | Kiểm chứng mô hình nhiều tab (mọi tab thao tác, chống xung đột) | 4 | 1 |
| [ST16.2](../story/ST16.2-responsive-4-kich-thuoc-tro-nang-wcag-aa-5-trang-thai-toan-b.md) | Responsive 4 kích thước, trợ năng WCAG AA, 5 trạng thái toàn bộ màn hình | 4 | 5 |
| [ST16.3](../story/ST16.3-kiem-ma-tran-quyen-bang-du-lieu-gia-mao.md) | Kiểm ma trận quyền bằng dữ liệu giả mạo | 4 | 2 |
| [ST16.4](../story/ST16.4-thu-tai-10-phong-70-ket-noi-dong-thoi.md) | Thử tải 10 phòng / 70 kết nối đồng thời | 4 | 2 |
| [ST16.5](../story/ST16.5-nghiem-thu-r01r19-local.md) | Nghiệm thu R01–R19 (local) | 4 | 2 |
| [ST16.6](../story/ST16.6-kiem-tren-moi-truong-internet-that-ho-so-ban-giao-va-bao-ve.md) | Kiểm trên môi trường Internet thật, hồ sơ bàn giao và bảo vệ | 4 | 3 |
| [ST16.7](../story/ST16.7-gioi-han-tan-suat-kich-thuoc-body-cors-va-tieu-de-bao-mat.md) | Giới hạn tần suất, kích thước body, CORS và tiêu đề bảo mật | 2 | 2 |
| [ST16.8](../story/ST16.8-ha-tang-internet-ban-dau-healthz-trien-khai-vercel-render-mo.md) | Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải | 4 | 5 |

```
TK16.8.1 ─► TK16.8.2 (+TK16.7.1) ─┬─► TK16.8.3 (QA)
                                  └─► TK16.6.1 (QA)
TK16.8.4 ─► TK16.4.1 (QA) ─► TK16.6.2 ─┐
TK15.3.1 ─► TK16.6.3 ──────────────────┴─► TK16.6.4 (QA)
TK16.7.1 ─► TK16.3.1 (QA) ─┬─► TK16.5.1 (QA)
TK16.1.1 (QA) ─────────────┴─► TK16.5.2 (QA)
TK16.2.1 ─┬─► TK16.2.2 ─┐
          ├─► TK16.2.3 ─┼─► TK16.2.5 (QA)
          └─► TK16.2.4 ─┘
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 8 Story Done (hoặc Flagged / BLOCKED_EXTERNAL ghi rõ số thật / lý do).
- [ ] R01–R19 local có bằng chứng; 6 hồi quy đạt; skip = 0.
- [ ] Sản phẩm chạy trên Internet; hồ sơ bàn giao cho người lạ < 15 phút.

## 9. KỊCH BẢN DEMO (~10 phút)

1. Mở web Vercel trên 2 điện thoại khác mạng; chơi 1 ván có camera.
2. Mở báo cáo thử tải: p50/p95/p99 thật + đối chứng âm.
3. Mở báo cáo ma trận quyền: 17 TS-AUTH + 10 điều cấm.
4. Người ngoài nhóm làm theo README, bấm giờ.
