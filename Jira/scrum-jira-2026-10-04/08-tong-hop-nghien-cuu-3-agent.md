# 08 — Tổng hợp nghiên cứu của 3 agent: lập kế hoạch Scrum và đưa lên Jira cho XIANGQI

**Ngày tổng hợp:** 2026-10-04 · **Tác giả tổng hợp:** Claude, tổng hợp nghiên cứu độc lập của Codex và Hermes, bổ sung phần Claude tự đối chiếu nguồn · **Đã review vòng 2 bởi Codex và Hermes: cả hai kết luận DÙNG CÓ SỬA, các sửa đã áp dụng (mục 11)** · **Trạng thái:** ĐỀ XUẤT, chờ nhóm và Product Owner (PO) duyệt. Không phải kế hoạch đã duyệt, không phải phép tạo Jira.

## 0. Cách đọc tài liệu này

**Mục đích.** Gom kết quả nghiên cứu của ba agent về năm câu hỏi của PO để làm đầu vào lập kế hoạch lại từ đầu (các bản nháp `Jira/` cũ đã bị PO xoá ngày 04/10/2026).

**Ràng buộc đang có hiệu lực (PO đã quyết, không bàn lại ở đây):** nhóm 7 người; hạn cố định 14 ngày, làm cả cuối tuần; giữ **đủ P1** (8 mục tiêu cốt lõi, 53 US, 157 AC), nhận rủi ro rất cao; P2 làm sau; Jira dự án **XIAN**, key `XIAN-<số>`; **chưa được tạo gì trên Jira thật**; không tự đặt người phụ trách, điểm, capacity khi nhóm chưa xác nhận; không tự đổi phạm vi P1/P2.

**Nhãn dùng trong tài liệu:**

| Nhãn | Nghĩa |
|---|---|
| **[TRÙNG KẾT LUẬN]** | Các báo cáo có phát biểu tương đương (không có nghĩa từng agent đã xác nhận nguyên văn câu trong tài liệu này; không phản đối không phải là xác nhận) |
| **[ĐỀ XUẤT TỔNG HỢP]** | Claude chọn một phương án khi tổng hợp; chưa ai ngoài Claude cam kết |
| **[KHÁC BIỆT]** | Các agent không hoàn toàn trùng nhau; ghi rõ cách chọn |
| **[CHỜ PO/NHÓM]** | Cần PO hoặc nhóm quyết; agent không tự chốt |
| **[CHƯA KIỂM]** | Chưa được xác minh trên nguồn thật hoặc trên Jira XIAN |

Các nhãn này **không thay quyền của PO**.

**Mức tin cậy nguồn:** Scrum Guide 2020 định nghĩa quy tắc Scrum; tài liệu Atlassian mô tả cơ chế Jira; blog Scrum.org là hướng dẫn, không phải quy tắc; snapshot XIAN/XW ngày 03/10 chỉ là quan sát cũ, **chưa kiểm trực tiếp trên Jira**. Danh mục nguồn đã đọc ở mục 10.

## 1. Kết luận chung và ma trận đồng thuận

**Kết luận một dòng [TRÙNG KẾT LUẬN]:** đủ cơ sở để lập lại bản nháp Epic/Story/Task từ BA và `docs/01`; **chưa** được tạo trên XIAN khi PO chưa review và cho phép; **không** có kỹ thuật Scrum hay Jira nào biến một khối lượng vượt sức thành khả thi trong 14 ngày, nên mọi lịch phải dựa trên ước lượng và lịch tham gia thật của nhóm.

> Cột **Claude** ghi quan điểm Claude đã nêu hoặc đồng ý sau khi đọc hai báo cáo kia (Claude không nghiên cứu độc lập mọi mục).

| # | Chủ đề | Claude | Codex | Hermes | Kết luận thống nhất |
|---|---|---|---|---|---|
| 1 | Mẫu ticket | Tối thiểu, theo giai đoạn | Tối thiểu, tách "API bắt buộc / cần để hiểu / cần trước triển khai" | Tối thiểu, ba tầng | **[TRÙNG KẾT LUẬN]** Mẫu tối thiểu (mục 2); không chép cả 9–10 mục của XW |
| 2 | Cấu trúc | Đồng ý với hai agent kia | Story + Task cùng cấp, `relates to` Story; gắn Epic là **đề xuất tổ chức** của backlog này, không phải ràng buộc Jira | Task cùng cấp dưới Epic; **Sub-task cũng hợp lệ** nếu đã kiểm type có trên XIAN | **[TRÙNG KẾT LUẬN]** Task dưới Epic liên kết Story; không ép Task thành con Story |
| 3 | Số Story | US ⟶ Story | US ⟶ Story mặc định, tách khi quá lớn | 81 US không bắt buộc 81 Story, được gộp/tách | **[TRÙNG KẾT LUẬN]** US là đơn vị đối chiếu; giữ đủ mã US/AC và bảng ánh xạ |
| 4 | Ước lượng | Original estimate | Giờ công, nhập Original estimate nếu XIAN hỗ trợ; ngày chỉ để trình bày | Original estimate theo công sức; có thể nhập bằng giờ | **[KHÁC BIỆT nhỏ]** → **khuyến nghị** nhập bằng giờ (khi XIAN hỗ trợ), trình bày bằng ngày sau khi nhóm xác nhận giờ/ngày; Story Points vẫn hợp lệ nếu nhóm đã thạo, nhưng không dựng hệ points mới với velocity giả. **[CHỜ PO/NHÓM]** |
| 5 | Spike | Đồng ý với hai agent kia | Task + nhãn `spike` | Task + nhãn `SPIKE` | **[TRÙNG KẾT LUẬN]** |
| 6 | Cách tạo Jira | Công cụ/API theo lô nhỏ; CSV có nhiều đường nhập với quyền khác nhau (mục 3.4) | CSV không phải mặc định | CSV là phương án, ưu tiên API/công cụ lô nhỏ | **[TRÙNG KẾT LUẬN]** Lô nhỏ có đối soát; CSV chỉ khi đã kiểm importer |
| 7 | Nhịp Sprint | 2×7 hoặc 1×14 có demo giữa kỳ | **2×7 chỉ khi có Increment dùng được trong 7 ngày**, nếu không thì 1×14 | **2×7** nếu lát đầu đạt DoD trong 7 ngày; 1×14 vẫn hợp lệ | **[TRÙNG KẾT LUẬN có điều kiện]** Ưu tiên 2×7; nhưng **[CHỜ PO/NHÓM]** |
| 8 | Thứ tự | PoC sớm + lát dọc thật | Giảm rủi ro đồng thời với lát chạy thật; AI chạy song song từ sau nền luật/perft; không xếp theo chữ A–N; bảng không là bảy giai đoạn tuần tự | Thứ tự **giao kết quả**, không finish-to-start; media/AI khởi động sớm; PoC sơ bộ không bằng gate PASS | **[TRÙNG KẾT LUẬN]** Chi tiết ở mục 6 |
| 9 | Khả thi đủ P1 | Không chứng minh được | Không thể hứa | Không có căn cứ | **[TRÙNG KẾT LUẬN]** Không tuyên bố khả thi |

## 2. Câu hỏi 1 — Thông tin cần có của từng loại Epic, Story, Task

### 2.1 Form tạo của XIAN (snapshot 03/10, **[CHƯA KIỂM]** trên Jira hiện tại)

Epic, Story, Task có **cùng tập trường**; chỉ khác thứ tự hiển thị. Các heading như "Tiêu chí chấp nhận" hay "Business Goal" trong mẫu XW **không phải trường Jira riêng**; chúng là nội dung nhóm viết trong Description.

| Trường | Khi tạo bản nháp backlog (sau khi PO cho phép) | Để sau / ghi chú |
|---|---|---|
| Space, Type, Summary | **Bắt buộc**: chọn đúng XIAN, đúng loại, tiêu đề nêu kết quả | Summary là trường duy nhất UI đánh dấu bắt buộc; API bắt buộc `project`, `issuetype`, `summary` |
| Description | **Bắt buộc theo quy ước nhóm**: nguồn, phạm vi, AC hoặc cách kiểm, điểm chưa rõ (mẫu ở 2.2) | Chi tiết cách làm thêm gần lúc thực hiện |
| Status | Mặc định To Do | Dùng transition hợp lệ; không suy là trường có thể ghi qua API |
| Assignee | **Để trống (Unassigned)**; form mặc định "Automatic" nên phải kiểm kết quả cuối là trống | Nhóm tự nhận khi kéo việc; nếu site cấm Unassigned thì dừng và hỏi |
| Parent | Story và Task gắn **Epic** | Chỉ Sub-task mới là con trực tiếp của Story (cần kiểm type này có trên XIAN) |
| Labels | `P1`/`P2`; mã US (ví dụ `US-ROOM-05`, tiện ích đề xuất để tìm kiếm, không bắt buộc); `QA`, `SPIKE` (viết hoa là quy ước đề xuất) cho việc đặc thù; `R1`–`R7` giữ như README ghi (placeholder chuyên môn), cần nhóm xác nhận ý nghĩa/ánh xạ | Nhãn vai trò không phải người nhận việc hay Team; không dán cả bảy nhãn |
| Priority | **P1/P2 là phân kỳ chuẩn, ghi ở nhãn**; Priority không thay phân kỳ hay rank; mapping bổ sung (nếu có) cần thống nhất | Thứ tự làm thể hiện ở rank Product Backlog; không tự map P1 ⟶ Highest |
| Linked work items | Ghi phụ thuộc bằng định danh nháp; tạo link thật khi hai đầu đã tồn tại | `blocks` chỉ cho phụ thuộc đầu ra thực; `relates to` cho liên quan |
| Sprint | **Để trống** khi mới ghi Product Backlog | Gán khi Sprint Planning chọn việc |
| Fix versions, Components, Team, Start/Due date, Attachment | Để trống nếu chưa có quy ước hoặc ngày thực | Không tạo version/component/team chỉ để điền đủ form |
| Original estimate / Story Points | Không có trong form XIAN đã ghi lại; **[CHƯA KIỂM]** có ở màn hình sửa/chi tiết | Kiểm trước khi dùng; đơn vị và giờ/ngày là cấu hình toàn site |

**Về ước lượng [TRÙNG KẾT LUẬN]:** không có điểm số hay giờ nào do agent đặt thay nhóm. Nhập đơn vị rõ ràng. **Chỉ cộng** effort ở một tầng cho cùng một phần việc (Task cùng cấp thì cộng ở Task; Story không tách Task có thể được ước lượng trực tiếp), tránh cộng đôi; không cấm một dự báo Story độc lập phục vụ refinement. Jira không tự cộng dồn qua liên kết `relates to`, nên cần bảng đối soát.

### 2.2 Nội dung tối thiểu theo loại

> **Cập nhật 04/10:** giáo viên chấm kế hoạch trên Jira và yêu cầu Description chi tiết hơn mức "tối thiểu" dưới đây. Dùng **mẫu đầy đủ ở mục 12** cho bản cuối; mẫu tối thiểu chỉ là sườn.

**Epic — nhóm kết quả** (ứng viên: nhóm A–H là P1, I–N là P2; không có quy tắc bắt đúng số Epic)
```text
Summary: <nhóm/kết quả> — P1 hoặc P2
Mục tiêu/giá trị: <cho ai, làm được gì>
Nguồn: BA <mục>, docs/01 <nhóm>, <commit>
Trong/ngoài phạm vi: <US hoặc nhóm hành vi; ranh giới P1/P2>
Hoàn thành khi: <kết quả tích hợp bao phủ phạm vi + AC/DoD>
Phụ thuộc/rủi ro: <đầu ra cần; câu hỏi chưa chốt>
```

**Story — hành vi kiểm thử được**
```text
Summary: [<mã US>] <kết quả cho người dùng>
Nguồn: docs/01 <US, commit>; BA <quyết định>
Nhu cầu và phạm vi: <người dùng làm gì; không làm gì>
AC: <đúng mã AC-xxx; đủ nhánh quyền/lỗi/biên>
Phụ thuộc: <artifact/hợp đồng/quyết định hoặc "Không">
Kiểm chứng: <AC ⟶ test; DoD chung; UI 5 trạng thái nếu áp dụng>
Còn mở: <nhánh chờ PO / PoC và tác động>
Bằng chứng: NOT_RUN (cập nhật sau khi chạy thật)
```

**Task triển khai — đầu ra kỹ thuật**
```text
Summary: <đầu ra cụ thể, không chỉ "làm backend">
Phục vụ: <US/AC hoặc NFR; Epic và Story liên quan>
Đầu vào: <hợp đồng/schema/quyết định/quyền truy cập>
Phạm vi và đầu ra: <thành phần, hành vi, giới hạn>
Cách kiểm: <test dự kiến, review, tích hợp>
Phụ thuộc/chưa rõ: <điều kiện tháo chặn>
Bàn giao: <PR/artifact; NOT_RUN trước khi chạy>
```

**Task QA — bằng chứng kiểm chứng**
```text
Summary: [QA] <luồng hoặc cổng cần kiểm>
Nguồn: <US/AC/NFR/GATE>
Bắt đầu khi: <build tích hợp, môi trường, dữ liệu sẵn sàng>
Ca: <mã ca> | <AC/nhánh> | <thao tác> | <kết quả mong đợi>
Kết quả: <thực tế> | PASS / FAIL / NOT_RUN / BLOCKED | <bằng chứng>
Bản dựng/commit và môi trường: <ghi rõ khi chạy>
Kết thúc khi: <các ca bắt buộc đạt>; báo cáo khảo sát hoàn tất ≠ cổng sản phẩm PASS
Nếu FAIL: <lỗi, mức ảnh hưởng, bước tái lập, kiểm lại>
```
Không tạo một Task QA riêng cho mọi Task; chỉ tách khi có đầu ra hoặc công sức cần quản lý riêng (E2E liên miền, tải, media). QA chuẩn bị ca từ lúc refinement, không đợi code xong.

**Spike/PoC — Task có nhãn `SPIKE`** (chưa xác minh XIAN có loại Spike riêng)
```text
Summary: [SPIKE] <câu hỏi kỹ thuật cụ thể>
Phục vụ: <GATE/US/NFR và quyết định bị ảnh hưởng>
Câu hỏi/giả thuyết: <điều cần chứng minh; không viết sẵn PASS>
Timebox: <nhóm đặt>; mốc cần quyết: <có căn cứ>
Cách thử: <môi trường, trường hợp, cách đo, ngưỡng từ nguồn>
Đầu ra: bằng chứng + kết luận đạt / không đạt / chưa kết luận
```
Spike hoàn thành khi **trả lời được câu hỏi**, kể cả kết quả "không đạt". **GATE-OTP/MEDIA/AI không vì thế thành PASS.** Spike không tự là Increment.

### 2.3 Ba tầng "đủ" — không gộp làm một [TRÙNG KẾT LUẬN]

| Tầng | Điều kiện |
|---|---|
| Đủ để **tạo** ticket | Có nguồn, loại đúng, kết quả/phạm vi, P1/P2; chưa cần người, estimate, Sprint. Soạn tệp nháp thì không cần phép; **tạo issue thật cần phép PO và preflight XIAN (mục 3.1–3.3)** |
| Đủ để **bắt đầu làm** | Nhóm hiểu AC, có người/kỹ năng, ước lượng thật, biết đầu vào/hợp đồng, nhánh chờ PO ảnh hưởng đã được giải quyết hoặc làm độc lập |
| Đủ để **Done** | AC đã duyệt áp dụng đạt, DoD chung đạt, có bằng chứng gắn build/môi trường |

## 3. Câu hỏi 2 — Đưa kế hoạch lên Jira như thế nào

### 3.1 Cổng PO [TRÙNG KẾT LUẬN]
"PO đã review báo cáo" hay "đã có project key" **không** là lệnh tạo. PO phải chấp thuận phiên bản bản nháp, phạm vi lô tạo (P1 trước hay cả P2), cách tạo và quyền cập nhật. Hiện **dừng trước bước ghi**.

### 3.2 Ánh xạ đề xuất

| Nguồn | Trên Jira |
|---|---|
| Nhóm A–H (`docs/01`) | 8 Epic P1 (ứng viên, dễ truy vết; **không** là thứ tự làm A rồi B) |
| Nhóm I–N | 6 Epic P2; chỉ giữ bản nháp, không đưa vào Sprint 14 ngày |
| US | Story (đối chiếu 1:1 mặc định; được gộp/tách theo lát giá trị, miễn không mất/chồng AC) |
| US giao diện chung (`US-UI-01…06`) | Vẫn ánh xạ **Story theo quy tắc US**, không chuyển thành Task |
| NFR, hạ tầng, PoC, QA, việc hỗ trợ giao diện | Task dưới Epic liên quan, `relates to` Story bị ảnh hưởng; là đầu ra hỗ trợ truy vết được, không thay Story và không tạo công trùng; không gom hết chất lượng vào một Epic làm cuối |
| Phụ thuộc | `blocks`/`is blocked by` cho đầu ra thực; không dùng cho mọi liên quan; kiểm vòng chờ |

### 3.3 Quy trình có cổng

1. **Ghim phiên bản đặc tả** (BA + `docs/01` tại một commit), tách nhánh đã duyệt và nhánh chờ PO.
2. **Lập manifest nháp** (tệp trong repo hoặc bảng): định danh cục bộ (không giả key), loại, Summary, nguồn US/AC/NFR, P1/P2, Epic nháp, Description, phụ thuộc, điểm chưa rõ.
3. **Refinement vừa đủ**: nhóm duyệt lát đầu, cách nghiệm thu, hợp đồng, rủi ro. Phần xa/P2 chưa cần chi tiết.
4. **PO review và cho phép bằng lời rõ ràng** (phạm vi lô, XIAN, cách tạo).
5. **Preflight trên đúng XIAN** (chỉ sau khi được phép): loại work item và cấp bậc, trường bắt buộc/được phép theo loại, mã trường, quyền Create/Edit/Link/Assign, có Unassigned không, trạng thái ⟶ cột, bộ lọc board, đơn vị ước lượng, loại liên kết.
6. **Tạo bộ mẫu nhỏ** (1 Epic + 1 Story + vài Task), đọc lại từng ticket, kiểm Description có hiển thị đúng tiếng Việt/bảng/liên kết. Lệch thì dừng sửa mapping, không nhân rộng.
7. **Tạo Epic còn lại, rồi Story/Task** với Parent thật; lưu bảng `định danh nháp ⟶ key XIAN thật` từ phản hồi của Jira. Không đoán key.
8. **Thêm liên kết** khi hai đầu đã tồn tại; kiểm hai chiều, không tạo vòng.
9. **Điền kế hoạch đã có căn cứ** (nhãn, estimate nhóm đã chốt). Rank do PO; Sprint do Planning. Không gán toàn bộ P1 vào Sprint 1 chỉ vì cùng hạn.
10. **Đối soát toàn lô:** đọc lại mọi ticket (có phân trang), so với manifest; kiểm tập US/AC hai chiều; đếm theo loại; kiểm board và rank riêng với dữ liệu API.
11. **Bàn giao bảng ánh xạ và lỗi còn lại**; không xoá hàng loạt để che lỗi. Bắt đầu Giai đoạn 4 hay Sprint là cổng riêng.

### 3.4 Cách nhập và rủi ro [TRÙNG KẾT LUẬN]

- **Ưu tiên:** tạo có kiểm soát qua công cụ/API hợp lệ theo lô nhỏ, UI để kiểm hiển thị. **CSV chỉ là phương án**, không mặc định.
- **CSV có nhiều đường nhập với quyền và khả năng khác nhau** (đã kiểm hai trang Atlassian): *CSV external system import* dành cho quản trị Jira, hỗ trợ cha–con, khuyến nghị 1.500 mục/tệp, **không giữ rank**, key trùng có thể **cập nhật** ticket, Original estimate tính bằng **giây**. *CSV importer bulk creation* cho người dùng không phải quản trị với quyền *Create work items* + *Make bulk changes*, tối đa **250 mục/tệp** và **không ánh xạ được quan hệ cha–con**. Chưa kiểm XIAN cho phép đường nào. Đơn vị, Parent, rank, key phải đối chiếu đúng tài liệu của đường được chọn. **Chưa có nguồn nói rollback tự động**; chỉ nên ghi "chưa xác minh khả năng hoàn tác" và phải giữ bảng ánh xạ cùng phương án khắc phục được phê duyệt.
- Việc CSV "không có lợi thế" với vài trăm ticket là **đánh giá chưa đo**, không phải kết luận của nguồn; ưu tiên lô nhỏ vì dễ kiểm soát.
- **Chống tạo trùng:** manifest lưu định danh nháp và key trả về; timeout không có nghĩa là chưa tạo — tra lại trước khi thử lại. Không coi Summary là định danh duy nhất.
- **Description:** Markdown không mặc nhiên hiển thị đúng qua API; thử bảng/tiếng Việt trên bộ mẫu trước khi nhân rộng.
- **Assignee:** không để trống rồi tin kết quả là trống (snapshot có "Automatic"); kiểm kết quả cuối.
- **Không** lấy khoá, trường, mẫu của dự án XW làm đích; không tạo trường tuỳ chỉnh, user, Priority hoặc status chỉ để khớp mẫu.

## 4. Câu hỏi 3 — Yêu cầu của việc lập kế hoạch

### 4.1 Đầu vào và đầu ra [TRÙNG KẾT LUẬN]

| Đầu vào | Hiện có / còn thiếu |
|---|---|
| Product Goal, phạm vi, hạn | Tám mục tiêu P1, P2, 14 ngày đã chốt; **lời Product Goal cần nhóm thống nhất** |
| Yêu cầu, AC, NFR | `docs/01` (81 US, 280 AC); một số nhánh chờ PO (`INTERRUPTED` trung tính, dọn dữ liệu Khách, NFR-08–10) |
| Nguồn lực | 7 người; **thiếu**: lịch rảnh thật, kỹ năng, giờ làm từng người, ai review luật cờ/media |
| Hạ tầng | SMTP mặc định Supabase và LiveKit Cloud đã chọn; **chưa chốt** nơi chạy ứng dụng, chi phí |
| Chất lượng | `docs/05`, DoD chung; các cổng OTP/media/AI/perft/tải đều `NOT_RUN` |
| Thời gian | Hạn 14 ngày; **thiếu** ngày/giờ bắt đầu và nộp chính xác |

| Đầu ra kế hoạch |
|---|
| Product Backlog **có thứ tự**; bảng bao phủ đủ 53 US/157 AC P1 |
| Đồ thị phụ thuộc, mỗi phụ thuộc nêu điều kiện tháo gỡ |
| Dự báo lịch có rủi ro và điểm tích hợp |
| Sprint Goal và Sprint Backlog đầu tiên |
| Sổ quyết định/điểm chưa rõ (ai trả lời, mốc cần) |
| Gói ticket để PO review; quy tắc cập nhật tiến độ |

### 4.2 Kế hoạch tốt là kế hoạch nào [TRÙNG KẾT LUẬN]
Đủ phạm vi; AC kiểm được; không đếm công hai lần; không giao một người hai việc toàn thời gian; có review/kiểm thử/tích hợp trong **từng lát**; điều chưa biết ghi là chưa biết; P2 không chen vào P1; việc nghiên cứu có câu hỏi, timebox và bằng chứng. **Kế hoạch trung thực có thể chỉ ra nguy cơ không kịp; không được sửa ước lượng cho vừa hạn.**

### 4.3 Trách nhiệm theo Scrum Guide

| Vai | Chịu trách nhiệm | Không nên |
|---|---|---|
| PO | Giá trị, Product Goal, **thứ tự Product Backlog**, quyết định phạm vi | Đặt ước lượng hộ nhóm; coi việc nhận rủi ro là bằng chứng đủ công suất |
| Developers | Ước lượng, chọn việc Sprint cùng PO, tự lập cách làm, giữ DoD | Chia thành bảy silo; coi QA/triển khai là ngoài Sprint |
| Scrum Master | Giúp thực hành Scrum, tháo trở ngại | Làm quản đốc giao từng Task |
| Agent hỗ trợ | Soạn nháp, truy vết, tìm thiếu sót | Làm PO; tự duyệt nghiệp vụ |

Nhãn `R1`–`R7` là **chuyên môn dự kiến**, không thay các trách nhiệm Scrum.

## 5. Câu hỏi 4 — Mô hình triển khai theo Scrum cho 14 ngày

### 5.1 Quy tắc Scrum (nguồn: Scrum Guide 2020, ĐÃ ĐỌC)
- Sprint là sự kiện **độ dài cố định, tối đa một tháng**; Sprint mới bắt đầu ngay sau Sprint trước. Mọi sự kiện nằm trong Sprint.
- Sprint Planning trả lời *Vì sao / Làm được gì / Làm thế nào*; **Sprint Goal chốt trước khi hết Planning**.
- Product Backlog là danh sách **có thứ tự**; PO chịu trách nhiệm xếp thứ tự. Mục "có thể Done trong một Sprint" được coi là sẵn sàng chọn.
- **Developers chịu trách nhiệm ước lượng**; dự báo dựa vào năng lực sắp tới, kết quả quá khứ và DoD.
- Việc không đạt DoD **không** là Increment. Chỉ PO có thẩm quyền huỷ Sprint, **khi Sprint Goal trở nên lỗi thời**; không dùng việc huỷ để che trễ. Trong Sprint có thể thương lượng lại phạm vi với PO nếu không hại Sprint Goal và không giảm chất lượng.
- Daily Scrum 15 phút. Nhóm Scrum thường không quá 10 người. Thời lượng tối đa 8/4/3 giờ (Planning/Review/Retro) là cho Sprint **một tháng**.

### 5.2 Điều **bắt buộc theo Scrum** và điều **là ràng buộc của dự án này** [TRÙNG KẾT LUẬN]
- Scrum **không** cấm thay đổi phạm vi nói chung. Việc **không được tự cắt P1** đến từ quyết định của PO và AGENTS.md, không phải từ "Scrum cấm".
- **Tuỳ chọn, không bắt buộc:** Jira, Epic/Story/Task, Story Points, DoR, định dạng User Story/Given–When–Then, Components/Version, Sprint hai tuần.

### 5.3 Nhịp Sprint

| Phương án | Ưu | Rủi ro | Đánh giá |
|---|---|---|---|
| 1 Sprint × 14 ngày | Ít họp; đủ chỗ dựng phần nền | Review/Retro đầu tiên sát hạn nên khó điều chỉnh | Hợp lệ nếu lát đầu không vừa 7 ngày; vẫn phải tích hợp và xem sản phẩm giữa kỳ |
| **2 Sprint × 7 ngày** | Review/Retro giữa kỳ còn thời gian sửa; buộc tích hợp sớm | Thêm vòng họp; phải cắt lát đủ nhỏ; Sprint 1 không được chỉ là cài đặt | **Đề xuất** (Codex, Hermes, Claude) **có điều kiện** |
| 3 Sprint × 4–5 ngày | Phản hồi nhiều | Dự án mới khó kịp Increment dùng được; nhịp không đều (4+5+5) làm mất tính ổn định | Không ưu tiên (đây là nhận xét về hiệu quả, không phải điều Scrum Guide cấm tuyệt đối) |

**Lưu ý [TRÙNG KẾT LUẬN]:** hai Sprint **không tăng tổng công suất**; nó chỉ cho thấy sự thật sớm hơn. Không dựng một "Sprint chỉ nghiên cứu" hay đợt "hardening" ngoài Sprint để cứu phần chưa Done. Nếu sau ước lượng thấy không có lát dùng được trong 7 ngày thì chọn 1×14 có demo giữa kỳ.

**Mục tiêu đề xuất (Developers ước lượng rồi mới chốt) [CHỜ PO/NHÓM]:**
- *Product Goal:* người dùng có tài khoản tổ chức được buổi chơi cờ tướng online với bạn bè và người xem, giao tiếp đúng quyền, luyện với máy ba cấp; demo đủ tám mục tiêu P1.
- *Sprint 1 (D1–D7):* hai người dùng đã xác thực mời nhau bằng link/mã, vào phòng và chơi một ván CASUAL đúng luật đến kết quả, trên bản tích hợp thật (không chỉ API hay mock).
- *Sprint 2 (D8–D14):* hoàn tất trải nghiệm P1 end-to-end (bạn bè/mời, người xem, chat, media đúng quyền, ba cấp máy), tích hợp, đóng các cổng kiểm chứng và bàn giao.

**Vận hành tối thiểu:** một Product Backlog (P1/P2 tách nhãn); Sprint Goal do **cả Scrum Team** hình thành; Daily 15 phút cho Developers mỗi ngày làm việc kể cả cuối tuần; Refinement liên tục chỉ cho việc sắp làm; Review với PO bằng sản phẩm thật; Review với PO và stakeholder là buổi làm việc, không chỉ trình diễn; Retro chọn cải tiến áp dụng được ngay ("một cải tiến" là quy ước đề xuất, Guide không bắt đúng một); họp ngắn vừa đủ, **không** bê 8/4/3 giờ của Sprint một tháng sang Sprint 7 ngày.

**DoD chung đề xuất:** AC đã duyệt áp dụng đạt; đã review; kiểm thử chạy thật (chưa chạy không là Done); tích hợp không chỉ mock; quyền và lỗi đúng; UI đủ 5 trạng thái nếu liên quan; bằng chứng gắn build, không lộ bí mật. NFR chờ PO không nằm trong cổng cho đến khi được duyệt.

## 6. Câu hỏi 5 — Thứ tự triển khai

### 6.1 Nguyên tắc [TRÙNG KẾT LUẬN]
- PO xếp **thứ tự giá trị trong Product Backlog**; Developers xếp **thứ tự thực hiện** theo phụ thuộc và công suất thật.
- Xếp theo: đóng góp mục tiêu, giá trị, phụ thuộc/mở đường, **rủi ro/học hỏi**, hạn thật, kích thước. Ghi lý do ("A trước B vì B cần đầu ra của A"), không dùng "tất cả High".
- **Không** xếp theo thứ tự chữ nhóm A–N; **không** làm hết nền ⟶ API ⟶ giao diện ⟶ QA. Làm **lát dọc** xuyên giao diện, máy chủ, luật, dữ liệu, kiểm thử.
- Phụ thuộc bắt buộc, có thể tháo (hợp đồng + mock, sau đó tích hợp thật) hay chỉ là thói quen: phân loại rõ. Mock không thay bằng chứng chạy thật.

### 6.2 Một đề xuất thứ tự ở mức nhóm kết quả (chưa gán người, điểm, ngày)

| Thứ tự | Kết quả | Ghi chú / song song |
|---|---|---|
| 0 | Môi trường chạy nhỏ nhất, hợp đồng chung, ranh giới xác thực, kiểm thử tối thiểu **cùng với** các PoC: OTP thật (quota), LiveKit Cloud (phân quyền, token cũ, tab mới), perft/luật cờ, máy cờ (thời gian, độ sâu, IPC) | PoC có câu hỏi, timebox, bằng chứng; chạy song song; không xây nền tổng quát. **Giai đoạn 4 mới chạy**, hiện chỉ lập task |
| 1 | Hai tài khoản chính thức: đăng ký/đăng nhập ⟶ tạo phòng ⟶ link/mã ⟶ ghế/Sẵn sàng ⟶ bàn cờ ⟶ **một nước hợp lệ tới đối thủ** (đây là **mốc tích hợp sớm**, chưa mặc nhiên là Story hay Increment Done) | Tài khoản dựng sẵn giúp test, không thay bằng chứng OTP thật; **không** dùng Khách (P2) đi tắt |
| 2 | Hoàn chỉnh ván online: luật kết thúc, đồng hồ, đầu hàng, rời, xin hoà, chống lệnh trùng, mất kết nối, lỗi ghi | Mọi nhánh P1, không chỉ đường thuận; kiểm thử, quyền, lưu đi cùng lát |
| 3 | Phòng xã hội: công khai/mã/khoá, hai người xem, đổi vai/đuổi/chuyển chủ phòng, chat riêng/chung; **bạn bè + online + mời** song song khi hợp đồng danh tính/phòng đủ | Mời bạn là P1, không để trôi sang P2 |
| 4 | Camera/mic theo đối tượng nhận, đổi vai/tab, quyền thiết bị, lỗi | Bắt đầu sau PoC media, không đợi nhóm 3 xong hết; Done cần các chuyển quyền liên quan |
| 5 | Ván với máy: ba cấp, chọn phe, thử lại, vào lại 30 phút, một vị trí chơi | **Song song**: PoC luật/perft/máy cờ khởi động cùng nhau qua giao diện luật chung; chỉ coi luật/benchmark là bằng chứng đạt khi oracle độc lập đã xác minh. Không đợi online hoàn chỉnh; không tự bỏ cấp Khó |
| 6 | Hội tụ: hoàn thành mọi US P1/UI dùng chung, responsive/trợ năng/5 trạng thái, tải/media/đo máy cờ, hồi quy D1–D10 **và** AC P1, ca biên, trạng thái, NFR đã duyệt, các cổng áp dụng, không lỗi Cao/Nghiêm trọng (`docs/05` dòng 30), luyện demo đúng quota | Đây là đóng bằng chứng; **không** phải lần đầu làm kiểm thử |

Bảo mật, 5 trạng thái, responsive, review, kiểm thử **không** là mục cuối độc lập: chúng nằm trong từng lát.

**Lưu ý:** bảng là thứ tự **giao kết quả/điểm tích hợp**, không phải bảy giai đoạn tuần tự hay chuỗi bắt đầu–kết thúc cứng. Ba PoC (OTP, media, máy cờ/luật) theo `docs/04` §11 nằm ở hai ngày đầu của Giai đoạn 4; phép đo sàng lọc sớm khác với toàn bộ GATE-AI/PERFT/LOAD.

### 6.3 Làm sao "đủ P1 trong 14 ngày"
Không có kỹ thuật Scrum/Jira nào biến tổng công vượt sức thành khả thi. Việc có thể làm: lập bản đồ bao phủ đầy đủ trước; nhóm tự ước lượng và khai báo giờ rảnh; tính đường găng và tải kỹ năng (luật, máy cờ, media khó chia đều cho bảy người); tích hợp nhỏ và liên tục; giảm việc đang làm cùng lúc; theo dõi Done thật và dự báo còn lại mỗi ngày. **Khi dự báo không kịp: báo PO ngay bằng số thật và phương án (cách làm, nguồn lực); không tự cắt P1, không hạ DoD, không báo "đủ" khi chưa đủ.**

## 7. Điểm không dùng hoặc cần sửa khi dùng bộ tài liệu có sẵn (`01–07`, `Epic-Story-Task.md`, `temp.md`)

Cả hai agent kia và Claude cùng thấy; nội dung cẩm nang 01–07 dùng được làm khung, nhưng:

1. **Không dùng nguyên văn các ví dụ nghiệp vụ trong mẫu** (ví dụ người thứ ba vào phòng đủ hai người bị từ chối: sai so với BA 2.8; đúng là **không từ chối chỉ vì đã đủ hai ghế**: nếu còn chỗ xem và đủ quyền vào phòng thì vào làm người xem; phòng không có chỗ xem, đầy, `LOCKED` hoặc bị chặn thì vẫn từ chối). Dùng US/AC của `docs/01`.
2. **`evidence/` và mẫu XW là lịch sử:** mang luật cũ (nước đi làm đề nghị mất hiệu lực, giới hạn 10 giây, giả định Vercel/Render, hai cổng HTTP/Socket), Story Points, Assignee của dự án khác. Chỉ mượn **cấu trúc** Description, không mượn nghiệp vụ, công nghệ, key.
3. **`temp.md` mâu thuẫn nội bộ:** dòng 104–116 đòi mọi việc có người/estimate/Sprint, nhưng phần đính chính sau đó đúng hơn (backlog có thể chưa có); đòi chuẩn bị Sprint/Component/Version trước mọi Epic là quá nặng; "người có trách nhiệm chấp nhận" như điều kiện Done chung **dễ bị hiểu** thành chữ ký PO cho từng ticket, điều Scrum không bắt buộc (phân biệt review/QA theo DoD với duyệt phạm vi của PO); lời "đã xác minh Jira" là lời trong hội thoại cũ, không phải bằng chứng hiện tại; đề nghị mã `R01/R02` dễ nhầm với nhãn vai trò `R1`–`R7`. Coi `temp.md` là tài liệu lưu trữ, không là nguồn.
4. **`Epic-Story-Task.md`:** mô tả đúng cái đã quan sát nhưng 9–10 mục Description là quá dài; chỉ giữ mục tiêu, nguồn/phạm vi, kiểm chứng, đầu vào/rủi ro, bàn giao. Câu "đã lưu vào skill" và liên kết `#media` là dấu vết hội thoại, không phải quy trình.
5. **`03-thu-tu-trien-khai.md` dòng 91 và `07` dòng 189:** "Khán giả" sai thuật ngữ (dùng "người xem"); ví dụ xếp phục hồi/chat/AI/người xem là "mở rộng" không đúng với XIANGQI (người xem, chat, media, AI là P1; lịch sử là P2); "chưa có hạn/capacity" đúng cho cẩm nang nhưng dự án đã có hạn 14 ngày (còn thiếu ngày/giờ chính xác và năng lực).
6. **Mẫu QA** cần thêm trạng thái `BLOCKED` và dùng đúng `NOT_RUN`, dùng mã AC của `docs/01`, không thay bằng `AC-01` mẫu.
7. **Không khôi phục** số Task, ước lượng hay phân vai cũ (78 Task, 128 người-ngày, 38,4 ngày): chúng là ước lượng của agent, không phải của nhóm.

## 8. Ba rủi ro lớn nhất khi lập kế hoạch lại [TRÙNG KẾT LUẬN]

1. **Khả thi 14 ngày chưa được chứng minh:** giữ đủ phạm vi và hạn nhưng chưa có ước lượng, năng lực, lịch rảnh nào do nhóm xác nhận ⟶ Jira đầy đủ nhưng dự báo giả.
2. **Rủi ro kỹ thuật phát hiện muộn:** quota thư OTP, đổi email trực tiếp qua Auth, thu hồi quyền media, sức mạnh/tốc độ máy cờ, oracle luật cờ ⟶ PoC phải sớm; không báo Done bằng mô phỏng.
3. **Jira tạo cảm giác hoàn chỉnh giả:** nhập nhầm mẫu XW, sai Parent/đơn vị/key, Assignee tự động, cộng đôi effort, thẻ ở cột cuối nhưng chưa đạt DoD ⟶ lô nhỏ, bảng ánh xạ, đối soát đọc lại toàn bộ, chỉ sau khi PO cho phép.

## 9. Câu hỏi cho PO và nhóm — phải trả lời trước khi chốt kế hoạch [CHỜ PO/NHÓM]

Agent **không** tự chốt các điểm này.

| # | Câu hỏi | Vì sao cần |
|---|---|---|
| 1 | ~~PO có nằm trong 7 người không; ai là Scrum Master?~~ **ĐÃ TRẢ LỜI 04/10:** PO nằm trong 7 người; Scrum Master là người đại diện PO (Twot). *Cần xác nhận hệ quả: một người giữ cả PO, Scrum Master và việc thực hiện.* | Quyết định ai xếp thứ tự backlog, ai tháo trở ngại |
| 2 | ~~Giờ rảnh, kỹ năng~~ **ĐÃ TRẢ LỜI 04/10:** toàn thời gian, đủ kỹ năng. *Vẫn cần: ai review luật cờ và media; bảng giờ thật khi lập Sprint Backlog.* | Không có lịch này thì không dự báo được |
| 3 | ~~Ngày bắt đầu và nộp~~ **ĐÃ TRẢ LỜI 04/10:** bắt đầu ngay 04/10/2026, nộp sau 2 tuần = 18/10/2026 (D1 = 04/10, D14 = 17/10). Thời gian lập kế hoạch hôm nay **tính vào** 14 ngày. *Chưa có giờ cụ thể trong ngày.* | Neo D1–D14 |
| 4 | ~~Nhịp Sprint~~ **ĐÃ CHỌN 04/10:** **4 Sprint (4 + 3 + 4 + 3 ngày)**: S1 04–07/10, S2 08–10/10, S3 11–14/10, S4 15–17/10, nộp 18/10 | Cách tổ chức Planning/Review/Retro; Jira tạo 4 Sprint |
| 5 | ~~Giờ hay Story Points~~ **ĐÃ TRẢ LỜI 04/10:** ước lượng bằng **giờ**. *Còn lại: số giờ làm việc mỗi ngày dùng để quy ra ngày (cấu hình Jira).* | Cấu hình Jira và báo cáo |
| 6 | Story: giữ 1 US = 1 Story hay gộp (ví dụ ba bước đăng ký thành một hành trình)? | Số ticket và độ rõ AC |
| 7 | Cách tạo Jira (API/công cụ, UI hay CSV) và **phạm vi lô đầu** (chỉ P1 hay cả P2)? *(Assignee để trống đã được ghi ở README; chỉ hỏi lại nếu preflight cho thấy site cấm Unassigned.)* | Cổng tạo |
| 8 | Có dùng Sub-task không (cần kiểm loại này có trên XIAN)? Ý nghĩa và cách ánh xạ người cho `R1`–`R7` (README đã giữ nhãn) | Cấu trúc ticket |
| 9 | Nhánh chờ PO: `INTERRUPTED` trung tính, dọn chat/tên Khách, NFR-08–10: nhận vào kế hoạch ở dạng "chờ quyết định" hay chờ chốt rồi mới lập? | Ranh giới ticket bị ảnh hưởng |
| 10 | Nơi chạy ứng dụng và giới hạn chi phí; ai cấp quyền hạ tầng? | Phụ thuộc cho nền và PoC |

## 10. Nguồn và giới hạn

**Đã đọc nội dung (không chỉ nhìn đường dẫn), theo từng agent:**
- **Claude (5 trang):** Scrum Guide 2020 (https://scrumguides.org/scrum-guide.html); Atlassian CSV External System Import (https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/); Atlassian cấu hình theo dõi thời gian (https://support.atlassian.com/jira-cloud-administration/docs/configure-time-tracking/); LiveKit thu hồi token (https://docs.livekit.io/frontends/reference/tokens-grants/); giá LiveKit Cloud (https://livekit.com/pricing; 04/10/2026: gói miễn phí 5.000 phút người tham gia/tháng, 50 GB tải xuống, 100 kết nối đồng thời). Vòng này Claude đọc thêm https://support.atlassian.com/jira-software-cloud/docs/create-issues-using-the-csv-importer/ (người không phải quản trị: tối đa 250 mục/tệp, không ánh xạ cha–con).
- **Codex (5 trang chính):** Scrum Guide; Atlassian issue types (https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/); configure columns (https://support.atlassian.com/jira-software-cloud/docs/configure-columns/); estimate an issue (https://support.atlassian.com/jira-software-cloud/docs/estimate-an-issue/); CSV External System Import. Vòng 2 kiểm thêm hai trang CSV (KB quyền nhập CSV không cần admin tổ chức; create-issues-using-the-csv-importer). Codex không khẳng định đã kiểm REST v3, time tracking, plan a sprint, link issues hay chi tiết 1.500 mục/hoàn tác.
- **Hermes (14 nguồn R1–R14):** Scrum Guide; Scrum.org (forgotten Scrum event, breaking down PBIs, dependencies và thứ tự); Atlassian (issue types, estimate, time tracking, CSV import, link issues, plan a sprint, configure columns, REST v3); Supabase SMTP; LiveKit quản lý người tham gia. Hermes **không kiểm giá LiveKit** và không xem video nhúng. Danh mục đầy đủ ở `hermes_research.md` (scratchpad của phiên, không nằm trong repo).
- **Bộ tài liệu có sẵn:** AGENTS.md, BA-SCOPE (Phần 10, 11), `docs/01`, `docs/04–05`, README, `scrum-jira-2026-10-04` (kể cả `Epic-Story-Task.md`, `temp.md`).

**Giới hạn trung thực:**
- **[CHƯA KIỂM]:** cấu hình hiện tại của Jira XIAN (trường, workflow, loại work item, quyền, đơn vị ước lượng); chỉ có snapshot ngày 03/10. Không truy cập Jira trong nghiên cứu.
- Không kiểm tra từng nguồn trong danh mục cũ S01–S17; mỗi agent chỉ đọc một phần (số trang theo từng agent ở trên); không ai xác nhận thay agent khác rằng đã đọc nguồn. Một số URL Scrum.org trả 404 và không được dùng.
- Mọi mẫu, lịch, thứ tự trong tài liệu này là **đề xuất**, không là quyết định. Chưa có mã ứng dụng, chưa chạy PoC nào; các cổng kỹ thuật đều `NOT_RUN`.
- Khuyến nghị 2×7 có thể sai nếu nhóm mất nhiều thời gian dựng Increment đầu tiên; khi đó 1×14 tốt hơn việc ép Sprint 7 ngày giả.

## 11. Kết quả review vòng 2 (Codex và Hermes) và phần bổ sung nên có

**Kết luận của cả hai:** DÙNG CÓ SỬA làm khung để PO/nhóm thảo luận; không có blocker Cao cho mục đích đó; chưa phải bản "thống nhất 3 agent" cho đến khi các sửa dưới đây được áp dụng. Claude đã áp dụng các sửa Trung và Thấp: định nghĩa lại "đồng thuận" (phản đối mạnh nhất của cả hai: không phản đối không phải là xác nhận), sửa khái quát sai về CSV (Claude tự kiểm lại và xác nhận), khôi phục điều kiện vào phòng làm người xem theo BA 2.8, tách "khuyến nghị giờ" khỏi "đã chọn", làm rõ US giao diện vẫn là Story, thêm điều kiện cho 2×7 và PoC AI, bỏ các câu hỏi lại quyết định đã ghi (Unassigned, nhãn R1–R7), ghi nguồn theo từng agent.

**Bổ sung nên có trước khi chốt kế hoạch (từ Codex và Hermes):**
1. **Bảng kiểm khép kín** US/AC ⟶ Story ⟶ Task ⟶ bằng chứng, kể cả UI, NFR, công tích hợp và review; không tạo thêm ticket chỉ để đủ ô.
2. **Quy tắc cập nhật baseline** khi PO duyệt các nhánh đang chờ: ảnh hưởng ticket, ước lượng, AC nào và ai cập nhật; nguồn luật vẫn là BA/`docs/01`, Jira chỉ lưu trạng thái, quan hệ, bằng chứng (không thành nguồn luật song song).
3. **Đầu mối quyết định cho PoC/GATE:** ai trả lời, mốc cần trả lời, cách báo PO khi FAIL/BLOCKED; giữ ngưỡng thật, không tự đổi công nghệ hay phạm vi.
4. **Goal và DoD là của Scrum Team:** chỉ đưa vào Sprint đầu việc có khả năng Done; vẫn báo số thật cho dự báo đủ P1; bảng câu hỏi ở mục 9 **không** là cổng bắt buộc trước khi được soạn nháp backlog.
5. **Điều kiện preflight XIAN** khi được phép: loại work item/cấp bậc, quyền, trạng thái ⟶ cột, thống kê ước lượng/theo dõi thời gian, đường nhập; không sửa cấu hình dùng chung ngoài phép.

## 12. Tiêu chí chấm của giáo viên (PO cung cấp 04/10/2026) và hệ quả cho kế hoạch

**Tiêu chí giáo viên nêu:**
1. Kế hoạch **hợp lý và cụ thể**.
2. **Description** của từng Epic, Story, Task đủ chi tiết để người làm hiểu **yêu cầu, mục tiêu, kết quả**; nêu **cách kiểm thử** và **yêu cầu PASS**.
3. **Thứ tự hợp lý:** kết quả của việc này là điểm bắt đầu của việc kia; **không** để hai việc A và B chạy song song nếu B cần kết quả của A (lãng phí thời gian).

Giáo viên chưa nêu số Sprint tối thiểu, ước lượng, người nhận việc hay báo cáo cụ thể. **[CHƯA KIỂM]** các tiêu chí này chỉ là lời PO chuyển lại; nên hỏi giáo viên khi cần chắc.

### 12.1 Mẫu Description đủ chi tiết (thay cho mẫu tối thiểu ở 2.2 khi lập bản cuối)

"Đủ chi tiết" nghĩa là **mỗi mục có nội dung thật**, không để chỗ trống; không chép mục nào không có gì để nói. Không bịa dữ liệu cho đẹp.

| Mục | Epic | Story | Task (triển khai / QA / Spike) |
|---|---|---|---|
| Mục tiêu | Epic làm được gì cho người dùng, vì sao tồn tại | Câu chuyện người dùng (ai, làm gì, để làm gì) | Việc này tạo ra gì và để làm gì cho Story |
| Yêu cầu / nguồn | BA, `docs/01` nhóm nào, US nào | Mã US, mã AC, BA | Mã US/AC hoặc NFR/GATE phục vụ |
| **Kết quả / đầu ra** | Kết quả tích hợp khi Epic xong | Hành vi người dùng thấy được | Hiện vật cụ thể (mã, cấu hình, tài liệu, số đo) |
| Phạm vi / ngoài phạm vi | Có / không | Có / không | Có / không |
| **Bắt đầu khi (đầu vào)** | Epic nào xong trước | Story/Task nào cho ra đầu vào | **Task nào cho ra kết quả mà việc này cần** |
| Cách làm gợi ý | — | — | Bước làm chính, chỉ khi giúp người làm |
| **Kiểm thử** | Kịch bản demo/tích hợp cả Epic | Ca kiểm thử theo từng AC (bước, dữ liệu, kết quả mong đợi) | Cách kiểm đầu ra; Task QA: ca, môi trường, build |
| **PASS khi** | Mọi Story đạt và demo Epic chạy | Mọi AC đạt, DoD đạt | Điều kiện đo được; nêu rõ cái gì là FAIL |
| Bằng chứng | Báo cáo demo | Kết quả test, liên kết | Log, số đo, PR, ảnh chụp (không chứa bí mật) |
| Rủi ro / chưa rõ | Có / không | Nhánh chờ PO | Điều kiện tháo chặn |

### 12.2 Quy tắc sắp xếp: "kết quả việc này là bắt đầu của việc kia"

- Mỗi Task ghi rõ **"Bắt đầu khi: <kết quả của Task X>"** và gắn liên kết `is blocked by` tới Task X. Chỉ gắn khi B thực sự **cần đầu ra cụ thể** của A, không gắn cho mọi liên quan.
- **Không xếp B chạy song song hoặc trước A** nếu B cần kết quả của A. B bắt đầu **sau** khi A đạt PASS (trong cùng Sprint theo thứ tự thời gian, hoặc ở Sprint sau).
- **Chỉ chạy song song những việc độc lập thật** hoặc cùng bắt đầu từ một đầu ra đã có. Cách hợp lệ để song song: tách **một Task nhỏ ra trước làm hợp đồng** (API, schema, giao diện dữ liệu, mẫu thế cờ). Khi Task hợp đồng đã PASS, các Task giao diện và máy chủ **cùng bắt đầu từ kết quả đó**, không ai phải đoán.
- Mock theo hợp đồng chỉ để phát triển, **không thay cho tích hợp thật**; việc tích hợp là Task riêng, bắt đầu sau khi cả hai phía xong.
- Dựng **đồ thị phụ thuộc**, kiểm **vòng chờ** (A chờ B, B chờ A), tìm **đường găng** (chuỗi dài nhất). Việc trên đường găng xếp trước và ưu tiên nguồn lực.
- Mỗi Sprint nên chứa các việc đã đủ đầu vào; việc có phụ thuộc chưa xong thì để Sprint sau. Không kéo vào Sprint một việc mà đầu vào của nó chưa có người làm.
- **Hệ quả cho mục 6.2:** bảng thứ tự ở đó là thứ tự giao kết quả. Chữ "song song" ở đó chỉ hợp lệ theo quy tắc này (việc độc lập hoặc cùng bắt đầu từ hợp đồng đã có). Nhóm PoC (OTP, media, luật/perft, máy cờ) độc lập nhau nên song song được.

### 12.3 Hệ quả cho số Sprint
Quy tắc 12.2 thiên về chia Sprint theo **lớp phụ thuộc** (nền, hợp đồng ⟶ lát đầu ⟶ hoàn chỉnh từng miền ⟶ hội tụ). Giáo viên chưa yêu cầu số Sprint, nên **số Sprint vẫn là lựa chọn của PO/nhóm** [CHỜ PO/NHÓM]: 3 Sprint (5+5+4 ngày) hoặc 4 Sprint (4+3+4+3 ngày) đều hợp lệ, miễn mỗi Sprint có mục tiêu và Increment thật. **PO đã chọn 4 Sprint (4+3+4+3) ngày 04/10/2026.**


## 13. Quy chuẩn thành phần (Components) — bổ sung 04/10 từ `Components-guide.md`

PO cung cấp `Components-guide.md`. Điểm áp dụng cho XIANGQI (chi tiết và bảng gán ở `Jira/ke-hoach-moi/01-components-epic-khung-task.md` mục 1.1): thành phần là **module ổn định**, gán theo **trách nhiệm chính**; **một thành phần là bình thường, hai là liên module, ba trở lên thì tách**; Epic 0–1, Story 1, Task 1, Bug bắt buộc 1; Epic/Story/Task không cần cùng thành phần; việc tạm thời/xuyên suốt dùng nhãn. Bản kế hoạch mới đã chỉnh theo quy chuẩn này (13 thành phần; 68 task có 1 thành phần, 22 task có 2, không task nào có 3 trở lên).

**Cập nhật thành phần (đề xuất 04/10/2026, chờ PO duyệt):** tách `Match` (vòng đời ván) khỏi `Game Engine` (luật cờ); gộp `Database` vào `Backend` (chỉ 1 task); chưa tạo `Security`, `Monitoring`, `Documentation` vì các NFR liên quan còn chờ duyệt. Danh sách hiện tại gồm 13 thành phần.
