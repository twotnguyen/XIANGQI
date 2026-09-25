# KẾ HOẠCH TRIỂN KHAI — 138 ISSUE

**Cập nhật:** 2026-09-22 · **Căn cứ:** `DEC-025` (stack) · toàn bộ `docs/01-requirements/`

> **Dành cho agent thực thi.** Mỗi issue là **một PR**. Mỗi issue chỉ rõ nguồn yêu cầu, cách triển khai, test và bằng chứng. Bắt đầu ở [AGENT-START-HERE](AGENT-START-HERE.md).

---

## 1. ĐỌC TRƯỚC KHI LÀM BẤT KỲ ISSUE NÀO

| # | Đọc | Vì sao |
|---|---|---|
| 1 | [../00-overview/glossary.md](../00-overview/glossary.md) | Tránh nhầm `SPECTATOR` với `WATCH`, "kênh riêng" với "kênh chung" |
| 2 | [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) §1 | **Hệ toạ độ** — hiểu sai là code sai toàn bộ |
| 3 | [../09-technical/tech-stack.md](../09-technical/tech-stack.md) §3 | **Ranh giới Prisma / SQL thuần** |
| 4 | [WORKFLOW.md](WORKFLOW.md) | Quy trình Git, định dạng bằng chứng, điều kiện đóng issue |

---

## 2. BẢY LUẬT TUYỆT ĐỐI

Vi phạm bất kỳ luật nào ⇒ **PR bị từ chối**, không cần xem tiếp.

| # | Luật |
|---|---|
| **1** | **Máy chủ quyết định.** Client chỉ gửi ý định. Không bao giờ tin dữ liệu client gửi lên |
| **2** | **Không có quyền ⇒ không nhận dữ liệu.** Không phải nhận rồi ẩn đi |
| **3** | **Đường xử lý lệnh ván dùng SQL thuần**, không dùng Prisma (`TECH-07`) |
| **4** | **AI chạy tiến trình riêng** (`TECH-09`). Để trong tiến trình chính = treo mọi ván |
| **5** | **Test thời gian dùng đồng hồ giả tiêm vào**, không `sleep` thật |
| **6** | **Test dữ liệu chạy trên PostgreSQL thật**, không mock. **0 test bị bỏ qua** |
| **7** | **Không tự hạ tiêu chí.** Không đạt thì ghi **CHỜ** + lý do, không sửa ngưỡng |

---

## 3. BẢN ĐỒ 21 NHÓM (E00–E20)

| Nhóm | Issue | Nội dung | Chặn ai |
|---|---|---|---|
| **E00** Nền tảng | 001–005 | Monorepo · Vitest · Playwright · CI | Tất cả |
| **E01** Contracts | 006–011 | Kiểu lõi · toạ độ · Zod | E02+ |
| **E02** Luật cờ ⭐ | 012–025 | Thế ban đầu → từng quân → kết thúc → lặp | E03, E11 |
| **E03** AI cơ sở ⛔ | 026–033 | Lượng giá → minimax → alpha-beta → **CỔNG ĐO** | E18 |
| **E04** Cơ sở dữ liệu | 034–045 | Migration từng bảng · RLS · harness thật | E05+ |
| **E05** Tài khoản | 046–055 | JWT · đăng ký · đăng nhập · Google · phiên | E06+ |
| **E06** Hồ sơ & bạn bè | 056–060 | Hồ sơ · tìm · kết bạn · presence | E08 |
| **E07** Phòng | 061–067 | Tạo · sảnh · ghế · sẵn sàng · rời | E09+ |
| **E08** Mời | 068–072 | Mã · link · mời trực tiếp · **hộp thư (R19)** | — |
| **E09** Người xem | 073–077 | Vào xem · trần 5 · thu hồi · **đuổi (R18)** | — |
| **E10** Bàn cờ UI | 078–083 | SVG · quân · chọn · lật · bàn phím | E11 |
| **E11** Ván online | 084–091 | Gateway · khoá · biên lai · nước đi · kết thúc | E12+ |
| **E12** Đồng hồ | 092–094 | Cấu hình · bộ đếm · hiển thị | E14 |
| **E13** Mất kết nối | 095–099 | Heartbeat · ân hạn 60s · nhiều tab | E14 |
| **E14** Chống treo ván ⭐ | 100–103 | **R17** — sau 3 phút hiện cảnh báo đếm ngược 30 giây | — |
| **E15** Thao tác ván | 104–107 | Đầu hàng · đề nghị · đi lại | E19 |
| **E16** Chat | 108–111 | Kênh riêng · **kênh chung** · công tắc | — |
| **E17** Media | 112–117 | LiveKit · chính sách · thu hồi · đo luồng thật | — |
| **E18** AI hoàn thiện | 118–124 | Tiến trình riêng · hàng đợi · giao diện · 60 ván | — |
| **E19** Lịch sử & tái đấu | 125–129 | Lịch sử · xem lại · tái đấu · đóng phòng | — |
| **E20** Hoàn thiện | 130–138 | Responsive · trợ năng · bảo mật · tải · triển khai | — |

⭐ = chứa yêu cầu mới từ audit BA · ⛔ = cổng chặn

---

## 4. ⛔ HAI CỔNG CHẶN

Không vượt qua thì **không được đi tiếp**:

| Cổng | Issue | Điều kiện |
|---|---|---|
| **Cổng AI** | **032** | Depth 6 trong **3000 ms**, p95 trên 20 thế × 5 lần lặp. Không đạt ⇒ tối ưu theo `TECH-08`, **cấm** đi tiếp sang E18 |
| **Cổng media** | **112** | LiveKit local nhận **RTP bytes > 0 và frames > 0** thật. Không đạt ⇒ **cấm** đi tiếp sang 113–117 |

---

## 5. THỨ TỰ THỰC HIỆN

Chọn TODO đầu tiên có mọi dependency DONE/đã merge trong [INDEX](INDEX.md), theo DAG; không bắt số issue tăng tuyệt đối. Sơ đồ nhóm dưới đây chỉ định hướng, dependency từng issue là nguồn chuẩn. Bootstrap và phạm vi local/external theo [WORKFLOW §3](WORKFLOW.md) / [execution-milestones](execution-milestones.md).

```
E00 ──► E01 ──► E02 ──┬──► E03 ──► ⛔032 ──► E18
                      │
                      └──► E04 ──► E05 ──┬──► E06 ──► E08
                                         │
                                         └──► E07 ──┬──► E09
                                                    │
                                    E10 ────────────┴──► E11 ──┬──► E12 ──► E14
                                                               ├──► E13
                                                               ├──► E15 ──► E19
                                                               ├──► E16
                                                               └──► E17 (⛔112 trước)
                                                                        │
                                                            E20 ◄───────┘
```

**Làm song song được:** E03 độc lập với E04–E09 · E10 độc lập với E04–E09 · E16, E17 độc lập nhau.

---

## 6. ĐỊNH DẠNG MỖI ISSUE

Mỗi file giữ các mục nền: MỤC TIÊU, header PHỤ THUỘC, ĐỌC TRƯỚC, PHẠM VI, FILE, CÁC BƯỚC, TEST BẮT BUỘC, ĐIỀU KIỆN PASS, BẰNG CHỨNG và CẠM BẪY. Dùng **tên mục**, không suy từ số mục giữa các phiên bản.

Phần thực thi chi tiết bổ sung hợp đồng đầu vào/đầu ra, file test, dữ liệu Given → hành động → assertion, đoạn mã trọng tâm, chu trình RED → GREEN → thử phá invariant, lệnh focused/hồi quy và điều kiện bàn giao. CẠM BẪY đối chiếu [bài học phiên bản cũ](../99-archive/reviews-v1/); đặc tả hiện hành vẫn là nguồn triển khai.

| Cần gì | Tài liệu |
|---|---|
| Hiểu dự án và prompt giao agent | [AGENT-START-HERE](AGENT-START-HERE.md) |
| Thứ tự dependency và các test tích hợp ở mốc sau | [EXECUTION-ORDER](EXECUTION-ORDER.md) |
| Fixture, clock, race, cách chạy từng lane | [TEST-CONVENTIONS](TEST-CONVENTIONS.md) |
| Issue chịu trách nhiệm cho từng AC | [AC-COVERAGE](AC-COVERAGE.md) |
| Mẫu bằng chứng, không điền sẵn số PASS | [TEST-REPORT-TEMPLATE](TEST-REPORT-TEMPLATE.md) |
| Kết quả kiểm tra bộ kế hoạch | [PLAN-REVIEW](PLAN-REVIEW.md) |

---

## 7. TRẠNG THÁI ISSUE

| Trạng thái | Nghĩa |
|---|---|
| `TODO` | Chưa làm |
| `IN_PROGRESS` | Đang làm, có nhánh |
| `DONE` | Đã merge, **mọi** điều kiện PASS đạt |
| `BLOCKED` | Chưa đạt cổng kỹ thuật hoặc thiếu review/oracle; ghi số thật |
| `BLOCKED_EXTERNAL` | Chờ tài nguyên ngoài cần cho scope issue (053/137); không thay bằng giả lập |

> ⚠ **`BLOCKED_EXTERNAL` không phải `DONE`.** Không được thay bằng giả lập rồi báo đạt (`AC-RULE-02`).

---

## 8. DANH SÁCH ĐẦY ĐỦ

Xem [INDEX.md](INDEX.md).

Tài nguyên bên ngoài cần xin: [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md).
