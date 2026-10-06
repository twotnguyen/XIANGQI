# AGENTS.md — Hướng dẫn cho AI agent

**Dự án:** Cờ Tướng Online · **Giai đoạn hiện tại:** 3 — phân vai và lập kế hoạch Jira (Giai đoạn 1 và 2 đã xong, người dùng xác nhận 03/10/2026) · **Áp dụng cho:** mọi AI agent đọc, viết hoặc sửa tài liệu trong kho này.

Đọc hết file này trước khi sửa bất kỳ file nào.

---

## 0. Tóm tắt

```
① Kho CHƯA CÓ MÃ NGUỒN. Jira XIAN đã có 8 Epic, 26 Story, 64 Task, 9 Components, 4 Sprint tương lai và 4 Releases chưa phát hành (PO yêu cầu 05/10/2026; Key/ID thực ở Jira/ke-hoach-moi/01 mục 6). Hiện có: BA-SCOPE-DECISIONS.md, DANH-MUC-MAN-HINH-XIANGQI.md, DESIGN.md, mockups/, docs/ (tài liệu phân tích Giai đoạn 2 và kế hoạch Giai đoạn 3), Jira/ke-hoach-moi/ (kế hoạch Jira mới lập 04/10/2026: 8 Epic, 26 Story, 64 Task, bảng chuẩn bị Sprint Planning; đã được PO cho phép tạo/phân công, giờ Task và lịch nguồn lực đã được lập theo uỷ quyền mới, Story Points chưa chốt), Jira/scrum-jira-2026-10-04/ (cẩm nang Scrum/Jira tham khảo; các bản nháp Epic/Story/Task cũ đã bị PO xoá 04/10/2026 để lập kế hoạch lại từ đầu; bản nháp cũ không phải backlog XIAN hiện tại)
② Đang ở GIAI ĐOẠN 3: phân vai và lập kế hoạch Jira (Epic/Story/Task, ước lượng). Chưa viết mã. Chỉ tạo trên Jira thật khi người dùng cung cấp dự án/khoá và đồng ý; ⛔ không đoán số Key
③ Nguồn luật phạm vi = BA-SCOPE-DECISIONS.md. Thấy mâu thuẫn hoặc chỗ mơ hồ ⇒ DỪNG, báo người dùng. Không tự chọn
④ Không tự phát minh yêu cầu. Không có trong nguồn luật ⇒ HỎI
⑤ Chỉ chuyển giai đoạn khi người dùng nói rõ giai đoạn trước đã xong
⑥ Giao diện theo Kỳ Đài Cổ Phong (DESIGN.md) và đủ 5 trạng thái bắt buộc (DANH-MUC §2)
```

---

## 1. Lộ trình bốn giai đoạn

| GĐ | Việc | Agent được làm | Agent KHÔNG làm |
|---|---|---|---|
| 1. Ý tưởng và chức năng tổng quan (**đã xong 03/10/2026**) | Chốt phạm vi, chế độ chơi, quy tắc nghiệp vụ, danh mục màn hình | Đọc, rà soát, nêu mâu thuẫn và chỗ mơ hồ, đề xuất phương án, ghi quyết định đã chốt vào tài liệu, chỉnh mockup theo quyết định | Viết mã ứng dụng, chọn công nghệ cuối cùng, chia việc, tạo Jira |
| 2. Phân tích chuyên sâu (**đã xong 03/10/2026**) | Yêu cầu chi tiết, luật cờ, dữ liệu, kiến trúc, kiểm thử | Viết và sửa tài liệu trong `docs/` | — |
| **3. Phân vai và lập kế hoạch Jira** (hiện tại) | Chia việc theo vai trò, tạo Epic / Story / Task, ước lượng | Lập kế hoạch bằng tài liệu trong `docs/`; đề xuất vai trò, ước lượng, lịch; chỉ tạo trên Jira thật khi người dùng cung cấp dự án/khoá và đồng ý | Viết mã ứng dụng; đoán số Key Jira; tạo trên Jira thật khi chưa được đồng ý |
| 4. Xây dựng | Code, test, review, phát hành | Sau khi người dùng cho phép | |

Khi người dùng chưa nói bắt đầu giai đoạn sau, **không** làm trước (không tạo thư mục `apps/`, `packages/`… khi chưa được yêu cầu; `Jira/ke-hoach-moi/` đã được PO yêu cầu ở Giai đoạn 3). Từ Giai đoạn 2, thư mục `docs/` **mới** (không phải `docs/` cũ đã xoá) chứa tài liệu phân tích.


### Kế hoạch Jira hiện hành (`Jira/ke-hoach-moi/`, đã tạo trên XIAN ngày 05/10/2026)

- **Cấu trúc:** 8 Epic đúng 8 yêu cầu PO được giao; 26 Story; 64 Task đánh `T-01` đến `T-64` theo thứ tự làm. Đã tạo đủ 98 mục trên Jira dự án XIAN (PO cho phép 05/10/2026); **giữ đúng khoá Jira thật, không tạo lại, không đoán số**. Bảng khoá và ngày ở `Jira/ke-hoach-moi/01` mục 6.
- **Bản chơi được trước, hoàn thiện sau:** Sprint 1–2 làm phần lõi (đăng ký/đăng nhập, tạo phòng, mời bằng mã/đường dẫn, bàn cờ, đánh online, đánh với máy); Sprint 3–4 hoàn thiện người xem, khoá phòng, chat, camera/micro, bạn bè, chất lượng và nghiệm thu đủ tám mục tiêu. ⚠ **Không nhầm** "bản chơi được" với "MVP" trong đặc tả (chỉ toàn bộ P1). Phạm vi P1/P2 không đổi.
- **Lịch hiện hành (PO xác nhận 05/10/2026):** 8 giờ mỗi người mỗi ngày, kể cả cuối tuần; **hạn cuối bắt buộc 05/11/2026**; tối đa 3 Task đang hoạt động. Sprint 1: 05–11/10; Sprint 2: 12–19/10; Sprint 3: 20–27/10; Sprint 4: 27/10–05/11. Bốn Release `v0.1`, `v0.2`, `v0.3`, `v1.0` (chưa phát hành). Các lịch 04–18/10 trong bản nháp cũ không còn hiệu lực.
- **Trường Jira:** Assignee đã gán theo phân vai PO chốt; Start/Due date riêng từng mục theo chuỗi phụ thuộc; Task có Original/Remaining Estimate ban đầu (ước lượng mục tiêu theo hạn PO, chưa kiểm chứng bằng năng suất thực); **Story Points để nhóm quyết định**, agent không đặt hộ.
- **Sửa kế hoạch:** chỉ khi người dùng yêu cầu. Đổi thứ tự hoặc thêm Task thì cập nhật cùng lúc `01`, Epic/Story/Task liên quan, `14` (đối chiếu tiêu chí) và `15` (ước lượng, lịch), và đối chiếu lại Jira thật. Không tự thay đổi phạm vi P1/P2.

---

## 2. Nguồn thông tin và thứ tự ưu tiên

| Ưu tiên | Nguồn | Vai trò |
|---|---|---|
| 1 | Yêu cầu trực tiếp của người dùng trong phiên làm việc | Cao nhất |
| 2 | File này (`AGENTS.md`) | Luật làm việc |
| 3 | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) | **Cái gì** phải đúng. Nguồn luật phạm vi và nghiệp vụ |
| 3.5 | [docs/](docs/README.md) (Giai đoạn 2) | Chi tiết hoá yêu cầu, luật cờ, dữ liệu, kiến trúc, kiểm thử. **Không được mâu thuẫn BA-SCOPE**; mâu thuẫn ⇒ BA-SCOPE thắng và báo người dùng. Nội dung chưa được duyệt ghi rõ "Đề xuất" |
| 4 | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) | Danh mục 37 thành phần giao diện, 5 trạng thái bắt buộc |
| 5 | [DESIGN.md](DESIGN.md) · `mockups/` | Hệ thống thiết kế và mẫu giao diện |

- Hai nguồn mâu thuẫn ⇒ **dừng**, báo người dùng: trích hai chỗ, nêu tác động. Không tự chọn bên.
- `docs/` và `Jira/` của lần thiết kế trước (kể cả các bản nháp cũ trong cẩm nang) **đã bị xoá** vì xây trên phạm vi cũ (không Khách, không Elo, không chat 1-1…); kế hoạch hiện hành là `Jira/ke-hoach-moi/`. Không khôi phục và không dùng làm căn cứ. Nếu cần tra, đọc từ lịch sử git (`git show develop:docs/<đường-dẫn>`) và coi là **tham khảo**, không phải luật.
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

## 3. Cách làm việc ở Giai đoạn 1 và 2

- **Hỏi tập trung.** Gom câu hỏi theo nhóm, mỗi câu kèm phương án và một khuyến nghị. Không hỏi câu đã có đáp án trong nguồn luật.
- **Đánh giá thẳng.** Nêu rủi ro, mâu thuẫn, phạm vi quá sức. Không khen cho đẹp.
- **Ghi lại bằng chữ của người dùng.** Quyết định ghi vào tài liệu phải đúng ý đã chốt; chỗ chưa chắc thì hỏi, không đoán.
- **Không đổi phạm vi âm thầm.** Thêm, bớt hoặc đổi mức ưu tiên (P1/P2) một tính năng đều phải được người dùng đồng ý.
- **Giữ tài liệu nhất quán.** Sau mỗi thay đổi, kiểm lại bảng ma trận cuối `BA-SCOPE-DECISIONS.md`, số lượng thành phần trong `DANH-MUC`, và tên màn hình/mockup.
- **Không tạo file tài liệu mới** ngoài `docs/` (Giai đoạn 2) nếu chưa được yêu cầu; ưu tiên sửa file hiện có.
- **Giai đoạn 2:** mọi con số, thuật toán, thiết kế do agent đề xuất phải ghi **"Đề xuất"** cho đến khi người dùng duyệt; chỉ bỏ nhãn khi được duyệt.

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

> Đã thống nhất theo bảng này trong toàn bộ tài liệu và mockup (người dùng yêu cầu ngày 03/10/2026). Cấp bậc Elo thấp nhất đổi tên thành "Người mới".

### 4.2 Bốn lựa chọn chơi (PO làm rõ 05/10/2026; luật ở BA 2.0, 2.7)

| Chế độ | Ghép trận | Đi lại | Người xem | Đồng hồ | Khách |
|---|---|---|---|---|---|
| Đánh Thường ghép ngẫu nhiên (`CASUAL`, P2) | Ngẫu nhiên, không Elo | P2: cùng luật Xin đi lại tại BA 3.2/3.6 | Không | Cố định 15 phút/bên | Được ở P2 |
| Tự tạo phòng (`CASUAL`, P1) | Mời bạn bè online hoặc link/mã, không bắt buộc kết bạn | P2: tối đa 3 lần/bên/ván khi đối thủ chấp nhận | Tối đa 5; PUBLIC ở Sảnh, CODE_ONLY qua mã/link, LOCKED chặn người mới | P1: 5/10/15 phút; P2 thêm Không giới hạn | Được ở P2 |
| `RANKED` | Ngẫu nhiên 100% theo Elo | ⛔ Cấm hoàn toàn | ⛔ Cấm hoàn toàn | Cố định 10 phút/bên | ⛔ Cấm |
| `AI` | Chọn cấp Dễ / Trung bình / Khó | Tối đa 3 lần, lùi 1 cặp nước | Không | Không giới hạn | Được |

> Bổ sung (đã duyệt 03/10): `RANKED` không có Tái đấu, chỉ xin hòa được khi mỗi bên đã đi ≥ 20 nước (BA-SCOPE 7.2). `AI` không có nút Xin hòa và không tính Elo. Mức giờ 4 lựa chọn chỉ của phòng tự tạo (BA 2.1). Xin đi lại/Tái đấu ở ghép ngẫu nhiên đã được PO duyệt 05/10 (BA 2.0, 2.3, 3.2, 3.6); quy tắc sau ván và không nhận người mới theo BA 2.0. Khách và Đi lại với máy vẫn là P2.
>
> **Phân kỳ (đã duyệt 03/10, đồng bộ PO 05/10):** nhóm 7 người, khoảng 2 tuần, nên **P1 chỉ gồm 8 mục tiêu cốt lõi** (đăng ký/đăng nhập, tạo phòng, mời bằng link/mã và bạn bè online, bàn cờ, đánh online, phòng tự tạo công khai ở Sảnh hoặc qua mã/link, khoá phòng, tối đa 5 người xem, chat + camera + mic, đánh với máy). Đánh Thường ghép ngẫu nhiên, `RANKED` và mọi thứ ngoài 8 mục đó là **P2**: vẫn là luật đã chốt, nhưng làm sau (BA-SCOPE `Phần 11`).

**Lượt hiện tại:** tập trung đặc tả và nghiệm thu tám mục tiêu MVP. Hạn phiên cố định từ đăng nhập; khác thiết bị xử thua ván đang chơi/đăng xuất thiết bị cũ, thiết bị mới về Sảnh; mở tab cùng thiết bị theo BA 1.8. P2 chỉ ghi quyết định đã trả lời, chưa triển khai. Kế hoạch đã đối soát các quyết định MVP hiện hành khi PO yêu cầu tạo/phân công Jira ngày 05/10/2026. Dữ liệu thực và Key ở Jira/ke-hoach-moi/01 mục 6; không tạo lại hoặc suy trạng thái sản phẩm từ việc đã tạo backlog.

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
| Khi có Jira (GĐ3 trở đi) | Thêm Key `[XIAN-<số>]` (dự án Jira XIAN, PO xác nhận 04/10/2026) vào tên nhánh, commit và tiêu đề PR. ⛔ Không đoán số Key | `feature/XIAN-72-khoi-tao-monorepo` |
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
