# AGENTS.md — Hướng dẫn cho AI agent

**Dự án:** Cờ Tướng Online · **Giai đoạn hiện tại:** 1 — chốt ý tưởng và chức năng tổng quan · **Áp dụng cho:** mọi AI agent đọc, viết hoặc sửa tài liệu trong kho này.

Đọc hết file này trước khi sửa bất kỳ file nào.

---

## 0. Tóm tắt

```
① Kho CHƯA CÓ MÃ NGUỒN và CHƯA CÓ JIRA. Hiện có: BA-SCOPE-DECISIONS.md, DANH-MUC-MAN-HINH-XIANGQI.md, DESIGN.md, mockups/
② Đang ở GIAI ĐOẠN 1: chốt ý tưởng và chức năng tổng quan. Chưa phân tích chuyên sâu, chưa chia việc, chưa tạo Epic/Story/Task
③ Nguồn luật phạm vi = BA-SCOPE-DECISIONS.md. Thấy mâu thuẫn hoặc chỗ mơ hồ ⇒ DỪNG, báo người dùng. Không tự chọn
④ Không tự phát minh yêu cầu. Không có trong nguồn luật ⇒ HỎI
⑤ Chỉ chuyển giai đoạn khi người dùng nói rõ giai đoạn trước đã xong
⑥ Giao diện theo Kỳ Đài Cổ Phong (DESIGN.md) và đủ 5 trạng thái bắt buộc (DANH-MUC §2)
```

---

## 1. Lộ trình bốn giai đoạn

| GĐ | Việc | Agent được làm | Agent KHÔNG làm |
|---|---|---|---|
| **1. Ý tưởng và chức năng tổng quan** (hiện tại) | Chốt phạm vi, chế độ chơi, quy tắc nghiệp vụ, danh mục màn hình | Đọc, rà soát, nêu mâu thuẫn và chỗ mơ hồ, đề xuất phương án, ghi quyết định đã chốt vào tài liệu, chỉnh mockup theo quyết định | Viết mã ứng dụng, chọn công nghệ cuối cùng, chia việc, tạo Jira |
| 2. Phân tích chuyên sâu | Yêu cầu chi tiết, luật cờ, dữ liệu, kiến trúc, kiểm thử | Sau khi người dùng cho phép | |
| 3. Phân vai và lập kế hoạch Jira | Chia việc theo vai trò, tạo Epic / Story / Task, ước lượng | Sau khi người dùng cho phép | |
| 4. Xây dựng | Code, test, review, phát hành | Sau khi người dùng cho phép | |

Khi người dùng chưa nói bắt đầu giai đoạn sau, **không** làm trước (không tạo thư mục `apps/`, `packages/`, `Jira/`, `docs/`… khi chưa được yêu cầu).

---

## 2. Nguồn thông tin và thứ tự ưu tiên

| Ưu tiên | Nguồn | Vai trò |
|---|---|---|
| 1 | Yêu cầu trực tiếp của người dùng trong phiên làm việc | Cao nhất |
| 2 | File này (`AGENTS.md`) | Luật làm việc |
| 3 | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) | **Cái gì** phải đúng. Nguồn luật phạm vi và nghiệp vụ |
| 4 | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) | Danh mục 37 thành phần giao diện, 5 trạng thái bắt buộc |
| 5 | [DESIGN.md](DESIGN.md) · `mockups/` | Hệ thống thiết kế và mẫu giao diện |

- Hai nguồn mâu thuẫn ⇒ **dừng**, báo người dùng: trích hai chỗ, nêu tác động. Không tự chọn bên.
- `docs/` và `Jira/` của lần thiết kế trước **đã bị xoá** vì xây trên phạm vi cũ (không Khách, không Elo, không chat 1-1…). Không khôi phục và không dùng làm căn cứ. Nếu cần tra, đọc từ lịch sử git (`git show develop:docs/<đường-dẫn>`) và coi là **tham khảo**, không phải luật.
- `site/` dựng từ `docs/` cũ nên đã lỗi thời. Không chạy `site/build.mjs` và không dựa vào nó.
- Mỗi luật chỉ định nghĩa ở **một** chỗ. Thấy cùng một luật ghi khác nhau ở hai nơi ⇒ báo.
- Các mã như `R06`, `R17`, `ARCH-xx`, `DEC-xxx`, `TK…`, `DT-xx` còn sót trong tài liệu là **nhãn kế thừa** từ bộ cũ đã xoá, không tra được. Luật tương ứng đã viết bằng chữ ngay tại chỗ; nếu thiếu thì hỏi, đừng đoán từ mã.
- Các quyết định do agent đề xuất theo uỷ quyền ngày 03/10/2026 đã được người dùng duyệt toàn bộ cùng ngày. Từ đó, quyết định mới do agent đề xuất cũng phải được người dùng duyệt rồi mới coi là chốt; chưa duyệt thì ghi rõ "đề xuất, chưa duyệt" trong tài liệu.

### Danh sách điểm còn mở

Các mâu thuẫn và câu hỏi chưa chốt của giai đoạn 1 nằm trong [README.md → Điểm còn mở cần chốt](README.md#điểm-còn-mở-cần-chốt). Người dùng chốt điểm nào thì:

1. Ghi quyết định vào `BA-SCOPE-DECISIONS.md` (thêm mục hoặc sửa mục đang có, đồng bộ cả ma trận cuối file).
2. Sửa mọi nơi khác đang ghi khác đi (`DANH-MUC`, `DESIGN.md`, mockup).
3. Xoá điểm đó khỏi README.

---

## 3. Cách làm việc ở Giai đoạn 1

- **Hỏi tập trung.** Gom câu hỏi theo nhóm, mỗi câu kèm phương án và một khuyến nghị. Không hỏi câu đã có đáp án trong nguồn luật.
- **Đánh giá thẳng.** Nêu rủi ro, mâu thuẫn, phạm vi quá sức. Không khen cho đẹp.
- **Ghi lại bằng chữ của người dùng.** Quyết định ghi vào tài liệu phải đúng ý đã chốt; chỗ chưa chắc thì hỏi, không đoán.
- **Không đổi phạm vi âm thầm.** Thêm, bớt hoặc đổi mức ưu tiên (P1/P2) một tính năng đều phải được người dùng đồng ý.
- **Giữ tài liệu nhất quán.** Sau mỗi thay đổi, kiểm lại bảng ma trận cuối `BA-SCOPE-DECISIONS.md`, số lượng thành phần trong `DANH-MUC`, và tên màn hình/mockup.
- **Không tạo file tài liệu mới** nếu chưa được yêu cầu; ưu tiên sửa file hiện có.

---

## 4. Luật nền

### 4.1 Thuật ngữ

| Dùng | ⛔ Không dùng |
|---|---|
| `PLAYER` / người chơi | đấu thủ, kỳ thủ |
| `SPECTATOR` / người xem | viewer, khán giả, observer |
| `AI` / máy | bot, engine, máy tính |
| Host / chủ phòng | owner, room master |
| `CASUAL` / Đánh Thường | phòng thường, ván tự do |
| `RANKED` / Đánh Hạng | rank, leo rank, xếp hạng (khi chỉ chế độ chơi) |
| `GUEST` / tài khoản khách | anonymous, ẩn danh, người lạ |

> Các tài liệu hiện có (BA-SCOPE, DANH-MUC) còn dùng "kỳ thủ", "khán giả", "Đấu thủ". Khi sửa tài liệu thì thống nhất dần theo bảng này, nhưng **không** đổi hàng loạt nếu người dùng chưa yêu cầu.

### 4.2 Ba chế độ chơi (đã chốt)

| Chế độ | Ghép trận | Đi lại | Người xem | Đồng hồ | Khách |
|---|---|---|---|---|---|
| `CASUAL` | Ngẫu nhiên hoặc tạo phòng | Tối đa 3 lần/bên/ván, đối thủ đồng ý | Có (tối đa 5) | 4 mức | Được |
| `RANKED` | Ngẫu nhiên 100% theo Elo | ⛔ Cấm hoàn toàn | ⛔ Cấm hoàn toàn | Cố định 10 phút/bên | ⛔ Cấm |
| `AI` | Chọn cấp Dễ / Trung bình / Khó | Tối đa 3 lần, lùi 1 cặp nước | Không | Không giới hạn | Được |

> Bổ sung (đã duyệt 03/10): `RANKED` không có Tái đấu, chỉ xin hòa được khi mỗi bên đã đi ≥ 20 nước (BA-SCOPE 7.2). `AI` không có nút Xin hòa và không tính Elo. Mức giờ 4 lựa chọn chỉ của `CASUAL`.

### 4.3 Hệ toạ độ bàn cờ (kế thừa, xác nhận lại ở GĐ2)

```
ĐEN ở TRÊN (y = 0) · ĐỎ ở DƯỚI (y = 9) · y tăng từ trên xuống · ĐỎ đi trước
```

`(x, y)` đếm từ 0; `x` 0→8 trái sang phải; `y` 0→9 trên xuống dưới; sông giữa `y = 4` và `y = 5`; chỉ số mảng `y * 9 + x`. Người cầm quân đen thấy bàn lật ngược — chỉ là hiển thị, toạ độ gửi lên máy chủ luôn theo hệ này.

### 4.4 Nguyên tắc kỹ thuật kế thừa (xác nhận lại ở GĐ2)

Chưa phải quyết định cuối. Chỉ dùng làm hướng khi viết tài liệu, **không** coi là luật khi đánh giá.

- Máy chủ quyết định; client chỉ gửi ý định, không tin dữ liệu client gửi lên.
- Không có quyền ⇒ không nhận dữ liệu (lọc ở máy chủ, không gửi hết rồi ẩn ở giao diện).
- Máy cờ chạy tiến trình riêng, không chung tiến trình với máy chủ.
- Thay đổi schema bằng file SQL migration, không dùng `prisma migrate`.
- Không giữ khoá cơ sở dữ liệu khi gọi dịch vụ ngoài.
- Không hạ ngưỡng đo để báo đạt; không đạt thì ghi số thật và `BLOCKED`.

---

## 5. Git

| Mục | Quy định | Ví dụ |
|---|---|---|
| Nhánh | Tạo từ `develop`: `<loại>/<ten-ngan-khong-dau>`; loại: `feature` · `fix` · `test` · `docs` · `chore` · `refactor` | `docs/chot-pham-vi-ranked` |
| Commit | `<loại>(<phạm vi>): <mô tả>`; loại: `feat` · `fix` · `test` · `docs` · `chore` · `refactor` | `docs(scope): chốt Top 50 bảng xếp hạng` |
| Khi có Jira (GĐ3 trở đi) | Thêm Key `[XW-<số>]` vào tên nhánh, commit và tiêu đề PR. ⛔ Không đoán số Key | `feature/XW-72-khoi-tao-monorepo` |
| Commit / push / PR | **Chỉ khi người dùng yêu cầu** | |
| Cấm | Push thẳng hoặc force push lên `main` / `develop` · né CI (`--no-verify`) · commit khoá bí mật | |
| Xung đột merge | ⛔ Dừng, báo người dùng file/commit xung đột. Không tự giải quyết | |

- Đang ở `develop` thì tạo nhánh trước khi commit. Không mở PR vào `main`.
- Dùng AI hỗ trợ: thêm dòng `Co-Authored-By:` của agent ở cuối commit theo quy ước công cụ đang dùng.
- Sửa nhánh đã push: ⛔ không force push nhánh đang có review; tạo commit mới và báo người dùng.

---

## 6. Giao diện

- Theme mặc định: **Kỳ Đài Cổ Phong** (Tea-Room Dark Theme) theo [DESIGN.md](DESIGN.md).
- Tuân thủ WCAG 2.1 AA.
- Mọi màn hình và khung dữ liệu phải có đủ **5 trạng thái** (`SCR-RULE-01`): `SUCCESS`, `LOADING`, `EMPTY`, `ERROR`, `DISABLED`. Trạng thái `DISABLED` luôn có tooltip nêu lý do.
- Quân cờ chỉ dùng chữ Hán truyền thống; không đưa chữ Việt hay Latin lên mặt quân.
- ⛔ Không dựng giao diện phẳng văn phòng vô cảm, không thêm thư viện UI dựng sẵn hoặc Tailwind.

---

## 7. Khi gặp vấn đề

| Tình huống | Làm gì |
|---|---|
| Tài liệu sai hoặc mâu thuẫn | ⛔ Dừng, báo người dùng. Không tự đổi yêu cầu |
| Không hiểu yêu cầu | Hỏi. ⛔ Đừng đoán |
| Yêu cầu nằm ngoài giai đoạn hiện tại | Nói rõ đang ở giai đoạn nào, hỏi người dùng có muốn chuyển không |
| Thiếu quyền (Git remote, dịch vụ ngoài) | Báo người dùng, không tìm cách vòng |

---

## 8. ⛔ Tuyệt đối không

```
⛔ Tự phát minh yêu cầu — không có trong nguồn luật ⇒ HỎI
⛔ Tự đổi hoặc tự chọn bên khi hai tài liệu mâu thuẫn ⇒ BÁO
⛔ Đổi phạm vi hoặc mức ưu tiên P1/P2 khi người dùng chưa đồng ý
⛔ Viết mã ứng dụng, tạo Epic/Story/Task, chia việc cho vai trò khi chưa sang giai đoạn tương ứng
⛔ Khôi phục hoặc dùng docs/ và Jira/ cũ làm căn cứ
⛔ Commit khoá bí mật; đặt khoá bí mật vào biến VITE_* (mọi biến VITE_* đều CÔNG KHAI)
⛔ Force push, né CI
⛔ Tự giải quyết xung đột merge
⛔ Thêm công nghệ ngoài danh sách dự kiến trong README khi chưa được đồng ý
⛔ Bỏ qua 5 trạng thái bắt buộc của màn hình
⛔ Cho phép Đi lại hoặc Người xem trong ván Đánh Hạng
⛔ Cho phép Khách tham gia Đánh Hạng
```

---

## 9. Nếu chỉ nhớ được một điều

> **Hỏi khi chưa chắc, ghi đúng điều đã chốt.**
> Một câu hỏi làm rõ rẻ hơn nhiều so với một quyết định bị đoán sai rồi lan ra cả bộ tài liệu.
