# EP15 · Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván

> **Loại:** Epic · **Story:** [ST15.1](../story/ST15.1-tien-trinh-ai-rieng-worker-thread-huy-tuc-thi-hang-doi-2-8.md), [ST15.2](../story/ST15.2-tich-hop-van-voi-may-di-lai-voi-may-giao-dien-choi-voi-may.md), [ST15.3](../story/ST15.3-thi-nghiem-60-van-va-bao-cao-thuat-toan-tai-lap-duoc.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP15 · Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván` |
| Components | AI, Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep15` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-12 / 2026-10-22 |
| Nguồn đặc tả | ISSUE-118 … ISSUE-124 (R12) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Chơi với máy**:
- AI chạy ở **tiến trình con riêng** (≤ 2 worker thread) — máy chủ không bao giờ đứng hình.
- Hàng đợi **2 chạy / 8 chờ**; tối đa 10 ván AI cùng lúc.
- Ván AI dùng **cùng** luật + **cùng** khung lệnh với ván online; đi lại với máy có hiệu lực ngay.
- **Thí nghiệm 60 ván** chứng minh cấp cao mạnh hơn cấp thấp.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Lỗi lần trước: AI chạy trong tiến trình chính; chọn Đen máy không đi; thí nghiệm chưa từng chạy; giấu số liệu bất lợi (`F-25`).
- Phần thuật toán (lượng giá, alpha-beta) đã làm ở EP04; EP15 lo **hạ tầng + tích hợp + thí nghiệm**.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Tiến trình con / IPC** | AI chạy chương trình Node riêng, trao đổi tin có kiểu |
| **Worker thread** | Luồng tìm kiếm trong tiến trình AI (tối đa 2) |
| **SharedArrayBuffer + Atomics** | Cờ huỷ tới ngay, không chờ vòng lặp đọc tin |
| **Reservation** | Mỗi ván AI ACTIVE giữ 1 suất; tối đa 10 |
| **`job_version`** | Bỏ kết quả của thế cũ sau đi lại / kết thúc |

Tra thêm: [Test lanes](../05-TU-DIEN-KY-THUAT.md#test-lanes) · [Pipeline](../05-TU-DIEN-KY-THUAT.md#pipeline) · [Version](../05-TU-DIEN-KY-THUAT.md#version) · [Đồng hồ tiêm vào](../05-TU-DIEN-KY-THUAT.md#clock)

## 4. PHẠM VI

**✅ LÀM:** tiến trình AI + worker + huỷ; hàng đợi + admission; tạo / chơi / đi lại ván AI; giao diện; thí nghiệm 60 ván.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Lượng giá, tìm kiếm, cổng đo depth 6 | EP04 |
| Endpoint AI công khai | **Không có** |
| Quy đổi Elo | **Không** làm |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Tiến trình | backend spawn 1 tiến trình con AI qua IPC (mặc định **bật**, không có cờ tắt); trong tiến trình con có tối đa 2 worker thread tìm kiếm; không có endpoint AI công khai |
| Giao thức IPC | Server → AI: `{type:'SEARCH', jobId, position, counts, maxDepth, budgetMs}`, `{type:'CANCEL', jobId}`; AI → Server: `{type:'RESULT', jobId, result: SearchResult}`, `{type:'ERROR', jobId, message}`, `{type:'READY'}` |
| Huỷ | cờ huỷ bằng **SharedArrayBuffer + Atomics** (tới ngay, không chờ vòng lặp đọc tin); worker dừng trong ≤ 100 ms |
| Hàng đợi | `AI_MAX_RUNNING = 2`, `AI_MAX_QUEUED = 8`; tối đa **10 reservation** = số ván AI ACTIVE; mỗi ván 1 job chưa xong; đủ 10 ⇒ ván **mới** nhận `AI_BUSY`; ván đã nhận luôn có chỗ |
| Lỗi | worker lỗi lần 1 ⇒ thử lại 1 lần (nếu còn thời gian); lỗi lần 2 ⇒ ván **INTERRUPTED/AI_UNAVAILABLE**, người chơi **không thua**; hết ngân sách ⇒ nước dự phòng hợp lệ; nước AI trả về **không hợp lệ** ⇒ coi là lỗi máy |
| Ngân sách | không vượt thời gian còn lại trên đồng hồ của máy; đồng hồ máy về 0 ⇒ `TIMEOUT` (ưu tiên hơn lỗi máy); thời gian máy chờ trong hàng đợi **tính vào** đồng hồ máy |
| Kết quả cũ | kết quả về sau khi version ván đã đổi (đi lại/kết thúc) ⇒ **bỏ** (`jobVersion` tăng xuyên suốt ván) |
| Ván AI | không có phòng, người xem, chat, media; **không** áp dụng chống treo ván; máy không xin hoà/đầu hàng (hoà chỉ bằng lặp 3 lần); ĐỎ luôn đi trước (người chọn Đen ⇒ máy đi ngay); người thật offline đủ 60 s mà chưa có hạn sớm hơn ⇒ INTERRUPTED |
| Không mách nước | không hiện điểm đánh giá/đường tính của máy khi ván đang chơi |

## 6. ĐẦU VÀO

EP04 (thuật toán + cổng đo), EP10 (pipeline, finalizer, bàn cờ, màn phòng chơi), EP11 (đồng hồ, mất kết nối), EP12 (`applyUndo`), EP05 (`ai_jobs`).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST15.1](../story/ST15.1-tien-trinh-ai-rieng-worker-thread-huy-tuc-thi-hang-doi-2-8.md) | Tiến trình AI riêng, worker thread, huỷ tức thì, hàng đợi 2/8 | 3 | 8 |
| [ST15.2](../story/ST15.2-tich-hop-van-voi-may-di-lai-voi-may-giao-dien-choi-voi-may.md) | Tích hợp ván với máy, đi lại với máy, giao diện chơi với máy | 4 | 5 |
| [ST15.3](../story/ST15.3-thi-nghiem-60-van-va-bao-cao-thuat-toan-tai-lap-duoc.md) | Thí nghiệm 60 ván và báo cáo thuật toán tái lập được | 3 | 3 |

```
TK04.3.1 ═(Done)═► TK15.1.1 ─► TK15.1.2 ─┬─► TK15.1.5 (QA)
                                         └─► TK15.1.3 ─► TK15.1.4 ─┬─► TK15.1.6 (QA)
                                                                   └─► TK15.2.1 ─► TK15.2.2
TK04.3.1 + TK04.3.2 ═(Done)═► TK15.3.1
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 3 Story Done; TK15.1.5, TK15.1.6 PASS.
- [ ] p95 máy chủ < 500 ms khi AI tính cấp Khó (có số).
- [ ] Thí nghiệm 60 ván tái lập được; số liệu thật (kể cả khi không đạt).

## 9. KỊCH BẢN DEMO (~10 phút)

1. Chơi với máy cấp Khó, chọn Đen ⇒ máy đi trước.
2. Trong lúc đó mở ván online ⇒ đi nước vẫn mượt (`lat` p95 < 0,5 s).
3. Đi lại khi máy đang tính ⇒ lùi ngay.
4. Mở báo cáo 60 ván: bảng điểm 3 cặp, so sánh node negamax vs alpha-beta.
