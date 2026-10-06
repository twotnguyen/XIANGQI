# Cách viết Description cho Epic, Story, Task (có mẫu để điền)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** bản chuẩn để PO duyệt. Đã tạo 98 mục trên XIAN (05/10/2026; Key và phân công ở tệp 01 mục 6).

Tài liệu này dạy cách viết mô tả cho ba loại ticket: **Epic** (nhóm chức năng lớn), **Story** (một việc người dùng cần làm được), **Task** (một phần việc cụ thể giao cho một người). Có mẫu trống để sao chép và điền. Bốn ví dụ đã điền đầy đủ nằm trong `00b-mau-description-chi-tiet.md`, kèm phần giải thích nhanh các từ như máy chủ, Sảnh, phòng chờ, cơ sở dữ liệu.

---

## 1. Mục đích: ai đọc và đọc để làm gì

Một mô tả tốt phải để **người chưa biết gì về dự án** (thầy chấm điểm, nhân viên mới) đọc xong vẫn biết:

- **Việc này để làm gì?**
- **Mình phải làm chính xác những gì?**
- **Làm xong thì sẽ thấy gì?**
- **Tự kiểm tra bằng cách nào trước khi nhờ người khác kiểm?**
- **Khi nào được coi là xong?**

Nếu người nhận việc đọc xong vẫn phải hỏi lại "task này muốn em làm gì vậy?" thì mô tả còn thiếu.

## 2. Bảy câu hỏi mà mô tả phải trả lời

| Câu hỏi | Trả lời ở phần nào | Dấu hiệu viết chưa đạt |
|---|---|---|
| **Vì sao làm?** | Mục tiêu | Chỉ chép lại tên ticket |
| **Làm gì?** | Việc cần làm | "Làm chức năng tạo phòng" mà không nói cụ thể từng bước |
| **Làm ở đâu?** | Thành phần, phạm vi | Chỉ ghi "backend" hoặc "frontend" chung chung |
| **Hệ thống phải xử sự thế nào?** | Quy tắc, thông tin vào ra | Chỉ nói trường hợp suôn sẻ |
| **Điều gì có thể sai?** | Lỗi và trường hợp đặc biệt | "Xử lý lỗi cho phù hợp" mà không nói xử lý thế nào |
| **Tự kiểm tra thế nào?** | Cách tự kiểm tra | "Nhớ chạy test" mà không nói test cái gì |
| **Khi nào xong?** | Khi nào chuyển kiểm thử, khi nào xong | Coi "đã chuyển cho tester" là "đã xong" |

## 3. Nguyên tắc viết chung

1. **Viết bằng tiếng Việt thường.** Không dùng mã, tên viết tắt hay từ nội bộ mà người ngoài không hiểu. Nếu buộc phải dùng một thuật ngữ, giải thích ngay hoặc dẫn tới phần giải thích nhanh.
2. **Cụ thể thay vì chung chung.** Thay vì "kiểm tra dữ liệu hợp lệ" hãy viết "tên phòng dài từ 1 đến 60 ký tự, không có từ bị cấm". Thay vì "xử lý lỗi" hãy viết "hiện thông báo 'Bạn tạo phòng quá nhanh' và không tạo phòng".
3. **Nói rõ cái gì KHÔNG thuộc việc này**, để người làm không làm lan sang việc khác.
4. **Không bịa.** Chưa có mã thì không viết tên tệp hay lệnh như thể đã có. Chưa chốt thì ghi rõ: "đề xuất, chờ nhóm quyết".
5. **Không chép tài liệu nguồn vào mô tả.** Tóm tắt luật cần cho việc này bằng lời thường. Liên kết với yêu cầu gốc dùng trường liên kết của Jira.
6. **Mỗi ticket đứng một mình được:** đọc ticket là hiểu, không phải mở năm tài liệu khác.
7. **Một mô tả chỉ nói về một ticket.** Việc của task sau thì để task sau lo; ở đây chỉ ghi "bàn giao gì cho task sau".

## 4. Cách đặt tên (tiêu đề) ticket

| Loại | Cách đặt tên | Ví dụ tốt | Ví dụ chưa tốt |
|---|---|---|---|
| Epic | Danh từ nêu chức năng lớn | "Phòng chơi: tạo phòng, mời bạn, ngồi ghế, xem" | "Epic 3" |
| Story | Người dùng làm được gì | "Tạo phòng cờ với thiết lập của mình" | "Backend phòng" |
| Task | Bắt đầu bằng phần việc, nêu kết quả cụ thể | "Máy chủ: nhận yêu cầu và tạo phòng thật" | "Làm API" |

---

## 5. EPIC — nhóm chức năng lớn

### 5.1 Epic dùng để làm gì

Epic nói **"đang xây khả năng nào, cho ai, vì sao, đến đâu thì xong"**. Epic không nói cách làm (không có tên hàm, dữ liệu, bước kỹ thuật).

### 5.2 Epic phải trả lời

- Epic này giải quyết vấn đề gì và ai dùng?
- Gồm những việc lớn nào, và **không** gồm những gì?
- Có những quy tắc quan trọng nào xuyên suốt?
- Cần xong gì trước thì mới bắt đầu được?
- **Khi nào Epic được coi là xong?** (một kịch bản chạy trọn vẹn, dễ thấy)
- Rủi ro hoặc điều chưa chắc chắn là gì?

### 5.3 Mẫu Epic (sao chép và điền)

```text
EPIC: <tên chức năng lớn>

## Epic này làm gì
<2–3 câu: khả năng nào được tạo ra, nằm ở đâu trong sản phẩm>

## Ai dùng
- <người dùng 1>
- <người dùng 2>

## Gồm những việc lớn nào (mỗi việc là một Story)
1. <Story 1>
2. <Story 2>
3. ...

## Không làm trong Epic này
<liệt kê những thứ dễ bị tưởng là thuộc Epic nhưng thuộc nơi khác>

## Các quy tắc quan trọng
- <quy tắc 1, viết bằng lời thường>
- <quy tắc 2>

## Khi nào Epic được coi là xong
Có thể chạy trọn kịch bản sau trên hai máy khác nhau mà không lỗi:
1. <bước 1>
2. <bước 2>
3. <bước 3>

## Cần xong trước
<việc/Epic cần xong, nêu thứ cụ thể cần có>

## Rủi ro và điều chưa chắc chắn
<điều có thể làm chậm hoặc cần quyết định thêm>
```

### 5.4 Cách viết từng mục

- **"Khi nào Epic xong"** phải là một kịch bản **có người, có bước, có kết quả thấy được**, không viết "tất cả task đã xong". Task xong chưa chắc chức năng chạy được.
- **"Không làm"** là mục quan trọng để chống làm lan: ghi cả những thứ gần giống nhưng thuộc Epic khác.
- Epic chỉ nêu kịch bản nghiệm thu tổng thể; ca kiểm chi tiết và cách triển khai đặt ở Story/Task.

---

## 6. STORY — một việc người dùng cần làm được

### 6.1 Story dùng để làm gì

Story mô tả **một hành vi có giá trị với người dùng**: người dùng làm gì, hệ thống phản hồi thế nào, thế nào là chấp nhận được. Story **không** mô tả cách lập trình.

### 6.2 Story phải trả lời

- Ai cần, cần làm gì, để làm gì?
- Cần có điều kiện gì trước khi bắt đầu?
- Người dùng làm từng bước nào và thấy gì?
- Có những quy tắc nào?
- Khi sai hoặc có trường hợp đặc biệt thì chuyện gì xảy ra?
- Thế nào là "đạt"?
- Việc nào không thuộc Story này?

### 6.3 Mẫu Story (sao chép và điền)

```text
STORY: <người dùng làm được gì>

## Câu chuyện
Là <ai>, tôi muốn <làm gì>, để <đạt được gì>.

## Điều kiện để dùng được
- <điều kiện 1: ví dụ đã đăng nhập, đang ở trang nào>
- <điều kiện 2>

## Các bước người dùng làm và hệ thống phản hồi
1. Người dùng <làm gì>.
2. Hệ thống <phản hồi gì>.
3. ...

## Các quy tắc
- <quy tắc 1: con số, giới hạn, mặc định, ai được phép>
- <quy tắc 2>

## Khi có lỗi hoặc trường hợp đặc biệt
- <tình huống>: <hệ thống phản hồi thế nào, người dùng thấy gì>
- <tình huống>: ...

## Điều kiện chấp nhận (đạt khi...)
1. <điều kiện đo được 1>
2. <điều kiện 2>
3. ...

## Không thuộc Story này
<việc nằm ở Story khác>

## Các việc nhỏ làm nên Story này
- <Task 1: tên>
- <Task 2: tên>
- <việc ghép các phần và kiểm tra chạy thật>
```

### 6.4 Cách viết từng mục

- **"Điều kiện chấp nhận"** viết dạng **khẳng định kiểm được**: "Điền đúng và bấm Tạo thì có đúng **một** phòng mới", không viết "hoạt động tốt".
- Mỗi điều kiện chấp nhận phải có cách thử rõ ràng. Nếu không biết thử thế nào thì viết chưa đạt.
- Nên có điều kiện về **bấm hai lần, mất mạng rồi gửi lại, và người không có quyền**, vì đây là chỗ hay sót.
- Story chỉ được coi là xong khi **chạy trọn từ đầu đến cuối** (giao diện + máy chủ + dữ liệu), không phải khi một Task xong.

---

## 7. TASK — việc cụ thể giao cho một người

Task là loại ticket **quan trọng nhất** và cần **chi tiết nhất**. Người nhận phải đọc xong biết chính xác việc cần làm và **tự chứng minh đã làm đúng** trước khi nhờ người khác kiểm.

### 7.1 Task phải có các phần sau

| # | Phần | Viết cái gì |
|---|---|---|
| 1 | **Mục tiêu** | Task tạo ra gì, để làm gì, ai dùng kết quả (task sau nào) |
| 2 | **Cần xong trước khi bắt đầu** | Mỗi việc phải xong trước, và **thứ cụ thể** nhận được từ việc đó |
| 3 | **Việc cần làm** | Các bước làm **theo thứ tự** |
| 4 | **Thông tin vào và ra** | Nhận gì, trả gì, giá trị nào hợp lệ |
| 5 | **Các trường hợp lỗi** | Bảng: tình huống → kết quả mong đợi |
| 6 | **Cách tự kiểm tra** | Bảng: làm gì → phải thấy gì |
| 7 | **Khi nào chuyển cho người kiểm thử** | Điều kiện để bàn giao |
| 8 | **Khi nào task được coi là xong** | Điều kiện hoàn thành |
| 9 | **Bàn giao cho task sau** | Thứ cụ thể task sau sẽ nhận |
| 10 | **Không thuộc task này** | Việc cần tránh làm lan |

### 7.2 Mẫu Task (sao chép và điền)

```text
TASK: <phần việc: kết quả cụ thể>
(Dành cho người làm phần: <máy chủ / giao diện / luật cờ / dữ liệu / ...>)

## Mục tiêu
<2–4 câu: tạo ra gì, để làm gì, task nào sẽ dùng kết quả này>

## Cần xong trước khi bắt đầu
- <việc A đã xong>: tôi nhận được <thứ cụ thể>.
- <việc B đã xong>: tôi nhận được <thứ cụ thể>.
Thiếu cái nào thì báo ngay cho người quản lý, không tự nghĩ cách làm riêng.

## Việc cần làm (làm lần lượt)
1. <bước 1>
2. <bước 2>
3. <bước 3>
...

## Thông tin vào và ra
Nhận vào:
| Thông tin | Ý nghĩa | Giá trị hợp lệ |
|---|---|---|
| ... | ... | ... |

Trả ra:
- Khi thành công: <trả gì>
- Khi thất bại: <lý do ngắn gọn và nhóm lỗi>

## Các trường hợp lỗi và kết quả mong đợi
| Tình huống | Kết quả mong đợi |
|---|---|
| <thông tin sai> | <từ chối, không làm gì cả> |
| <người không có quyền> | ... |
| <gửi lại cùng một yêu cầu> | ... |
| <hai người cùng làm một lúc> | ... |
| <bị lỗi giữa chừng> | ... |

## Cách tự kiểm tra trước khi chuyển cho người kiểm thử
Chuẩn bị: <môi trường thử, tài khoản thử, dữ liệu thử>
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | <làm gì, với dữ liệu nào> | <kết quả cụ thể> |
| 2 | ... | ... |

## Khi nào chuyển cho người kiểm thử
- Mọi dòng tự kiểm tra đạt, và có ghi kết quả thật.
- Cách chạy kiểm tra viết rõ để người khác chạy lại được.
- Không còn lỗi đã biết mà chưa ghi chú.

## Khi nào task được coi là xong
<điều kiện hoàn thành; nêu rõ phần nào CHƯA tính ở task này>

## Bàn giao cho task sau
<thứ cụ thể: chức năng chạy được, dữ liệu thử, tài liệu...>

## Không thuộc task này
<việc ở task khác>
```

### 7.3 Cách viết từng phần cho tốt

**Mục tiêu.** Viết "xây phần máy chủ nhận yêu cầu tạo phòng và tạo phòng thật", không viết "làm API". Nêu ai dùng kết quả: "task giao diện và task vào phòng sẽ dùng".

**Cần xong trước.** Mỗi dòng gồm **việc** và **thứ nhận được**. Không viết "cần xong đăng nhập" mà viết "đăng nhập đã xong: tôi nhận được cách biết ai đang gửi yêu cầu". Đây là cách bảo đảm "kết quả task trước là điểm bắt đầu task sau".

**Việc cần làm.** Mỗi bước một hành động, theo **đúng thứ tự thực hiện**. Nên có thứ tự kiểm tra rõ (ví dụ: xác định người gửi, rồi xem yêu cầu đã xử lý chưa, rồi kiểm tra giới hạn, rồi kiểm tra thông tin, rồi mới lưu). Bước nào dễ làm sai thì nêu rõ vì sao.

**Thông tin vào và ra.** Với mỗi thông tin: ý nghĩa bằng lời thường, và giá trị hợp lệ (độ dài, các lựa chọn, mặc định). Nếu tên chính thức của trường chưa chốt thì ghi: "Tên cụ thể do nhóm chốt; mô tả này chỉ nêu ý nghĩa và giá trị hợp lệ."

**Các trường hợp lỗi.** Luôn nghĩ tới sáu loại tình huống: (1) thông tin sai, (2) chưa đăng nhập hoặc không có quyền, (3) **gửi lại cùng một yêu cầu** (mất mạng, bấm hai lần), (4) hai người cùng làm một lúc, (5) lỗi giữa chừng, (6) làm quá nhiều lần trong thời gian ngắn. Mỗi tình huống phải có **kết quả mong đợi** cụ thể.

**Cách tự kiểm tra.** Mỗi dòng có **dữ liệu cụ thể** và **kết quả cụ thể**. Ví dụ tốt: "Tạo phòng tên đúng 60 ký tự → thành công; 61 ký tự → bị từ chối, không có phòng mới". Ví dụ chưa đạt: "Kiểm tra tên phòng".

**Khi nào chuyển kiểm thử và khi nào xong.** Tách hai điều này:
- **Chuyển kiểm thử** = người làm đã tự kiểm tra xong và tự tin.
- **Xong** = người kiểm thử và người xem lại mã cũng đồng ý.
- Task nền xong **không có nghĩa** Story chạy được. Phải nêu rõ phần nào **chưa** tính ở task này và task nào đảm nhận.

### 7.4 Mỗi loại task cần chú ý điều gì

| Loại task | Điều cần chú ý khi viết | Ví dụ việc tự kiểm tra |
|---|---|---|
| **Máy chủ** (xử lý yêu cầu, quyết định) | Thứ tự kiểm tra; gửi lại cùng yêu cầu; hai người cùng lúc; ai có quyền; lỗi giữa chừng | Gửi cùng yêu cầu hai lần chỉ có một kết quả; người không có quyền bị từ chối; gây lỗi lưu thì không báo thành công |
| **Giao diện** (màn hình) | Từng nút, ô, câu chữ; đủ 5 trạng thái (bình thường, đang xử lý, chưa có dữ liệu, lỗi, bị vô hiệu); bàn phím; kích thước màn hình; **ghi rõ phần nào dùng dữ liệu giả** | Bấm liên tiếp nhiều lần chỉ gửi một lần; chỉ dùng bàn phím vẫn điền xong; hiển thị đúng ở 360, 390, 1366, 1920 điểm ảnh |
| **Luật cờ** (kiểm tra nước đi) | Thế cờ cụ thể (quân nào ở đâu) và kết quả mong đợi **lấy từ nguồn độc lập**, không lấy từ chính phần mã đang kiểm | Quân bị ghim không được đi; chiếu hết, hết nước; đúng cho cả hai bên |
| **Dữ liệu** (cơ sở dữ liệu) | Bảng nào, cột nào, ràng buộc nào; ai được đọc/ghi | Chạy trên cơ sở dữ liệu thử sạch; thử ghi dữ liệu sai bị từ chối; không mất dữ liệu cũ |
| **Máy cờ** (đối thủ máy) | Chạy tiến trình riêng; thời gian suy nghĩ; điều gì xảy ra khi máy hết giờ hoặc bị treo | Hết giờ thì đi nước tốt nhất đã tìm được; tiến trình bị tắt thì ván báo lỗi đúng |
| **Camera/micro** | Quyền theo từng người; mặc định tắt; điều gì xảy ra khi bị đuổi hoặc đổi vai | Người xem không phát được; người bị đuổi không nhận được hình |
| **Tích hợp** (ghép giao diện với máy chủ) | Nêu rõ **hai phần được ghép là gì**; chạy bằng cả hai phần thật, không dùng dữ liệu giả | Hai trình duyệt thật chơi trọn một thao tác từ đầu đến cuối |
| **Kiểm thử** | Chạy đủ phạm vi; ghi cả trường hợp **không đạt** và **bị chặn** | Báo cáo từng ca, kèm bằng chứng |
| **Thử nghiệm kỹ thuật** (kiểm tra có làm được không) | Câu hỏi cần trả lời; thời gian tối đa do nhóm đặt; kết luận **đạt / không đạt / chưa kết luận** | Số đo thật; không "viết sẵn đạt" |
| **Hạ tầng** | Dựng, chạy thử, gây lỗi có kiểm soát; không lộ mật khẩu | Khởi động lại vẫn chạy; thử cố ý sai thì kiểm tra tự động báo lỗi |

### 7.5 Mẫu cho hai loại task đặc biệt

**Task kiểm thử (tester làm)**

```text
TASK: [Kiểm thử] <luồng cần kiểm>

## Mục tiêu
<kiểm chức năng nào, để kết luận điều gì>

## Bắt đầu khi
<bản đã ghép sẵn, môi trường, dữ liệu thử nào>

## Các ca kiểm thử
| # | Việc làm | Phải thấy | Kết quả thật | Bằng chứng |
|---|---|---|---|---|
| 1 | ... | ... | ĐẠT / KHÔNG ĐẠT / BỊ CHẶN / CHƯA CHẠY | ... |

## Điều kiện đạt
<điều kiện đo được>

## Nếu không đạt
<ghi lỗi: bước tái hiện, mức độ ảnh hưởng, giao cho ai sửa; kiểm lại sau khi sửa>
```
Ghi chú: báo cáo kiểm thử **hoàn tất** vẫn có thể kết luận sản phẩm **không đạt**. Hai điều đó khác nhau.

**Task thử nghiệm kỹ thuật (kiểm tra có làm được không)**

```text
TASK: [Thử nghiệm] <câu hỏi kỹ thuật cụ thể>

## Câu hỏi cần trả lời
<một câu hỏi rõ ràng; không viết sẵn đáp án>

## Thời gian tối đa
<do nhóm đặt>

## Cách thử
<môi trường, trường hợp, cách đo>

## Kết quả cần nộp
- Số đo thật và cách đo.
- Kết luận: ĐẠT / KHÔNG ĐẠT / CHƯA KẾT LUẬN.
- Nếu không đạt: tác động đến kế hoạch và đề xuất.
```

---

## 8. Cách ghi kết quả tự kiểm tra (người làm viết vào phần bình luận của ticket)

Description lưu **yêu cầu và danh sách việc cần kiểm**. Phần **bình luận** lưu **kết quả thật của từng lần chạy**.

```text
Kết quả tự kiểm tra
Người kiểm tra / ngày giờ:
Máy chạy thử: (máy cá nhân hay máy thử chung)
Phiên bản mã đã kiểm tra:
Kết quả từng dòng:
  1. ĐẠT / KHÔNG ĐẠT — đã làm gì, thấy gì thật sự
  2. ...
Lỗi còn lại (nếu có): mô tả và cách tái hiện
Kết luận: SẴN SÀNG CHUYỂN KIỂM THỬ / CHƯA SẴN SÀNG (lý do)
```

Quy tắc:
- **Chưa chạy thì ghi "CHƯA CHẠY"**, không ghi "đạt".
- Sửa mã sau khi tự kiểm tra thì **kiểm lại phần bị ảnh hưởng** trên bản mới.
- Không dán mật khẩu, mã bí mật vào bình luận.

## 9. Phân biệt các khái niệm hay bị lẫn

| Khái niệm | Câu hỏi nó trả lời | Ai làm | Nằm ở đâu |
|---|---|---|---|
| **Điều kiện chấp nhận** (của Story) | Hành vi nào phải đúng? | Cả nhóm, PO | Story |
| **Cách tự kiểm tra** (của Task) | Người làm đã tự chứng minh thế nào? | Người làm | Task và bình luận |
| **Ca kiểm thử của người kiểm thử** | Kiểm tra độc lập bằng tình huống nào? | Người kiểm thử | Danh sách kiểm thử riêng, và có thể mở rộng thêm |
| **Sẵn sàng chuyển kiểm thử** | Đủ điều kiện bàn giao chưa? | Người làm | Task |
| **Task xong** | Phần việc này đạt chất lượng chưa? | Cả nhóm | Task |
| **Story xong** | Chạy trọn từ đầu đến cuối chưa? | Cả nhóm, PO | Story |

**"Chuyển kiểm thử" không phải là "xong".** Người kiểm thử nên bắt đầu nghĩ ca kiểm thử **song song** với lúc người làm viết mã, không chờ tự kiểm tra xong mới bắt đầu.

## 10. Các thông tin khác khi tạo ticket trên Jira

| Thông tin | Cách điền |
|---|---|
| **Thành phần** (Component) | Epic: để trống như metadata hiện hành; Story theo phạm vi các module liên quan; Task: 1, tối đa 2 theo quy ước 9 Components PO đã duyệt. Không tách Story chỉ để ép số Components. Chi tiết ở tài liệu `01` |
| **Nhãn** (Label) | `P1` hoặc `P2`; `poc` cho thử nghiệm kỹ thuật; `integration` cho task ghép; mã Story gốc để dễ tìm |
| **Liên kết "phải xong trước"** | Mỗi dòng ở mục "Cần xong trước" tạo một liên kết `is blocked by` (nghĩa là "bị chặn bởi"). Chỉ liên kết khi **thật sự cần kết quả** của việc đó |
| **Liên kết Story** | Task dưới Epic và liên kết `relates to` tới Story liên quan |
| **Người nhận việc** | Đã gán cả 98 mục theo phân vai PO duyệt |
| **Ước lượng** | **Bằng giờ**, do chính người làm ước lượng; không đặt hộ |
| **Sprint** | Chưa gán khi mới tạo; gán khi lập kế hoạch Sprint |
| **Fix version** | Tạo 4 phiên bản (mỗi Sprint một phiên bản). Task theo Sprint của nó; Story và Epic theo Sprint dự kiến hoàn tất toàn bộ phạm vi và Task kiểm liên kết |
| **Mức ưu tiên (Priority)** | High cho phần lõi, Medium cho phần mở rộng; không dùng để thể hiện P1/P2 (đã có nhãn) |

## 11. Trạng thái và quy trình trên XIAN

Đã kiểm 05/10/2026, dùng các trạng thái sẵn có:

```text
To Do → Ready for Code → In Progress → Ready for Test → Done
```

Ready for Code: đầu vào của Task đã được bàn giao, người nhận hiểu Description. In Progress: làm và tự kiểm; review là hoạt động của nhóm, không yêu cầu thêm cột. Ready for Test: bàn giao bằng bình luận chuẩn và bằng chứng để kiểm độc lập, **chưa xong**. Done: đạt điều kiện hoàn thành và có review/kiểm; với Task báo cáo phải giữ rõ kết luận của Gate, không suy báo cáo Done thành sản phẩm đạt. Lỗi trả lại In Progress và kiểm lại phần ảnh hưởng. Không tạo thêm trạng thái cho kế hoạch này.

## 12. Độ dài mô tả

- Trường mô tả của Jira Cloud **tối đa 32.767 ký tự** (không đổi được).
- Gợi ý: Epic khoảng 3.000–6.000 ký tự; Story khoảng 4.000–9.000; **Task khoảng 5.000–12.000**; cảnh báo nội bộ ở **20.000 ký tự**.
- Task quá dài thường là task ôm quá nhiều việc: **hãy tách task**, đừng cắt bớt nội dung quan trọng.
- Nội dung rất dài (nhật ký, kết quả đo, dữ liệu thử lớn): **đính kèm tệp hoặc dán đường dẫn**, không dán vào mô tả.

## 13. Danh sách kiểm tra trước khi nộp một mô tả

Một mô tả đạt khi trả lời "có" cho cả 14 câu:

1. Có nêu mục tiêu và ai dùng kết quả?
2. Có nói rõ việc nào **không** thuộc ticket này?
3. Mỗi việc phải xong trước có nêu **thứ cụ thể** nhận được?
4. Các bước làm có đúng thứ tự thực hiện?
5. Thông tin vào/ra có giá trị hợp lệ, độ dài, mặc định?
6. Có bảng lỗi với **kết quả mong đợi** cho từng tình huống (kể cả gửi lại, hai người cùng lúc, không có quyền)?
7. Cách tự kiểm tra có **dữ liệu cụ thể và kết quả cụ thể** cho từng dòng?
8. Có phân biệt dùng dữ liệu giả và chạy thật?
9. Có nói rõ khi nào chuyển kiểm thử và khi nào task xong?
10. Có nêu phần nào **chưa** tính ở ticket này và ai làm?
11. Có điều gì chưa chốt? Nếu có thì đã ghi "chờ quyết định"?
12. Người chưa biết dự án đọc có hiểu không (không mã, không từ nội bộ)?
13. Có chép nguyên văn tài liệu gốc không? (Không nên.)
14. Không bịa tên tệp, lệnh, kết quả "đạt"?

## 14. Hai điều đã được PO trả lời (04/10/2026)

1. **Cấp bậc trên Jira:** Task đặt **dưới Epic và liên kết với Story** (không dùng Sub-task).
2. **Trạng thái Jira:** không tạo thêm cột; dùng bình luận bàn giao chuẩn. Kiểm tra trực tiếp 05/10 cho thấy XIAN đã có **Ready for Test**: dùng trạng thái có sẵn để bàn giao, rồi Done sau kiểm thử/review. Không coi Ready for Test là hoàn thành.

Các Epic, Story và Task đã được viết theo chuẩn này và các mẫu ở `00b-mau-description-chi-tiet.md`: 8 Epic, 26 Story, 64 Task (xem `01-components-epic-khung-task.md`).

## 15. Thông tin quản lý đi kèm mỗi Epic, Story, Task (bổ sung 04/10/2026)

Ngoài phần mô tả bằng tiếng thường ở trên, mỗi mục có thêm các thông tin theo quy ước PO đã chốt và đối chiếu XIAN thật tại mục 16; cẩm nang Scrum/Jira chỉ là tham khảo phương pháp:

| Thông tin | Epic | Story | Task |
|---|---|---|---|
| Nhãn (label) `P1`, mã mục yêu cầu; loại Task (triển khai, QA, SPIKE) | có | có | có |
| Trạng thái và Sprint hiện hành | To Do; Sprint 4 | To Do; Sprint hoàn tất Task liên quan | To Do; Sprint và Assignee đã gán theo lịch 01/15 |
| Nguồn / Phục vụ: mã đặc tả để truy vết (BA, mục yêu cầu, tiêu chí, yêu cầu phi chức năng, cổng kiểm chứng, kịch bản demo) | Nguồn | Nguồn | Phục vụ |
| Phạm vi có / không | có | có | "Không thuộc task này" |
| Bắt đầu khi (phụ thuộc, kết quả cụ thể cần có) | có | có | "Phải xong trước" |
| Kết quả (đầu ra) | "Kết quả khi Epic xong" | điều kiện hoàn thành | "Kết quả (đầu ra)" |
| Kiểm thử | kiểm thử Epic (kịch bản demo) | **bảng tiêu chí đối chiếu từng tiêu chí đặc tả** (điều kiện đạt, cách kiểm, Task kiểm) và năm trạng thái giao diện | bảng lỗi và bảng tự kiểm tra |
| Điều kiện hoàn thành (PASS) | có | có | "Khi nào task xong" |
| Bằng chứng nộp (trạng thái ban đầu NOT_RUN) | có | có | có |
| Rủi ro / chưa rõ / còn mở | có | có | có |
| Liên kết Jira: Epic cha; `is blocked by`; `relates to` | có | có | có |
| Fix version (phiên bản phát hành, mỗi Sprint một phiên bản: `v0.1`, `v0.2`, `v0.3`, `v1.0`) | có (theo Sprint của Task cuối) | có (theo Sprint của Task cuối) | có (theo Sprint của Task) |
| Reporter (người báo cáo) | PO | PO | PO |
| Start date, Due date | khoảng ngày của Task trực tiếp và các Story thuộc Epic | khoảng ngày của Task liên kết triển khai/kiểm | tính riêng từng Task theo chuỗi phụ thuộc trong Sprint (xem `01`, mục 6.1) |
| Priority | High nếu có Task lõi, ngược lại Medium | như Epic | High cho Task lõi, Medium cho Task mở rộng |
| Story Points | không nhập (không mặc định cộng điểm Story và Task) | để trống, nhóm ước lượng khi họp Sprint | để trống, nhóm ước lượng khi họp Sprint |
| Parent | không có | Epic cha | Epic cha (Task chung không có) |
| Ước lượng | không | không | nhóm điền giờ khi họp Sprint |

Mã tiêu chí (`AC-…`), mã mục yêu cầu (`US-…`), yêu cầu phi chức năng (`NFR-…`) và cổng (`GATE-…`) **chỉ nằm ở các khối "Nguồn", "Phục vụ", bảng tiêu chí và nhãn**, để truy vết; phần mô tả vẫn bằng tiếng thường. Bảng đối chiếu toàn bộ nằm ở `14-bang-doi-chieu-tieu-chi.md`.


## 16. Đối chiếu Jira XIAN thật — kiểm tra 05/10/2026

**Đã kiểm qua kết nối Jira và biểu mẫu tạo Epic/Story/Task**, không tạo mục thử. Site: [xiangqi-web](https://xiangqi-web.atlassian.net), project XIAN kiểu company-managed, board Scrum **XIAN board (38)**. Hiện **98 work item**, **9 Components** (đã tạo, kiểm tra ngày 05/10/2026; ID ở tệp 01 mục 1), **4 Versions** và **4 Sprint tương lai**, có ngày dự kiến và mục tiêu (ID ở tệp 01 mục 6). Chín Components trong kế hoạch đã tồn tại trên Jira, Component lead để trống và Default assignee = Unassigned. Bốn Sprint và bốn Versions trong kế hoạch đã tồn tại; các Sprint chưa khởi động, Versions chưa phát hành. PO đã yêu cầu gán Assignee/Sprint/Fix version cho 98 mục; Epic gán Sprint 4 là mốc nghiệm thu cuối, Task con giữ Sprint 1–4. Task có giờ ước lượng theo uỷ quyền PO và ngày riêng; Story Points để trống.

| Nhóm thông tin | Epic | Story | Task | XIAN thật và cách điền |
|---|---|---|---|---|
| Bắt buộc để tạo bằng API | Project, Issue type, Summary | Như Epic | Như Epic | Ba trường required; chọn XIAN và đúng loại, Summary có tên công việc rõ ràng |
| Description | Bắt buộc theo tiêu chí bài chấm | Như Epic | Đặc biệt phải rõ việc, đầu vào/đầu ra, lỗi, tự kiểm/PASS | API để optional; nhóm vẫn phải điền đầy đủ. AC, Self-Test và Done là các phần **trong Description**, không phải trường riêng đã xác minh |
| Parent | Không có | Epic tương ứng | Epic tương ứng; Task chung để trống | Story và Task ngang cấp; dùng relates to giữa Task–Story. Không đặt Parent của Task = Story |
| Assignee | Người điều phối đã gán | Người nghiệm thu đã gán | Người triển khai đã gán | Theo bảng phân vai PO duyệt; không giao khác vai trò |
| Priority | High nếu có phần lõi, Medium nếu chỉ phần sau | Như Epic | High lõi, Medium phần sau | Priority có sẵn, mặc định Medium; cần đặt lại phần lõi |
| Sprint | Sprint 4 theo yêu cầu PO | Sprint hoàn tất toàn bộ Task liên quan | Sprint theo lịch Task 01/15 | Story không gán Sprint đầu chỉ vì một Task nền nằm ở đó |
| Components, Fix versions, Labels | Theo metadata từng mục | Như Epic | Như Epic | Trường có sẵn nhưng Components/Versions chưa có giá trị trên site; chỉ cấu hình khi PO cho phép |
| Start date, Due date | Khoảng ngày tổng hợp | Khoảng ngày của Task liên kết | Ngày dự kiến riêng + thứ tự bàn giao | Ngày cùng nhau vẫn phải chờ đầu vào PASS; không dùng ngày quá khứ làm bằng chứng đã thực hiện |
| Linked Issues | Khi cần quan hệ phụ thuộc thật | relates to các Task | is blocked by tiền đề; relates to Story | Hai loại liên kết đã có. Chỉ điền Key thực do Jira trả về, không đoán XIAN-<số> |
| Reporter | Mong muốn PO | Như Epic | Như Epic | Không thấy trên create metadata/full form đã kiểm; cần kiểm khả năng chỉnh trên work item thật sau khi được phép tạo. Không khẳng định đã đặt được Reporter |
| Story Points | Không nhập, không giả định tự cộng | Để trống cho nhóm | Để trống; chỉ dùng nếu nhóm chọn ước lượng Task | Board dùng **Story Points (customfield_10040)**; chưa thấy trên create form. Không cộng Story và Task cùng phạm vi vào tổng điểm/velocity |
| Ước lượng giờ | Không cộng giờ riêng | Không cộng giờ riêng | Đã nhập Original/Remaining Estimate mục tiêu theo uỷ quyền PO | API chỉnh Time tracking đã xác minh; giờ gồm tự kiểm/sửa lỗi/review/hỗ trợ, không ghi worklog |
| Trường optional khác | Attachment, Team | Như Epic | Như Epic | Team không thay thế Assignee; Attachment dùng bằng chứng khi có; Status ban đầu To Do trên UI |

Create metadata trả **16 trường** cho mỗi loại (3 bắt buộc, 13 optional): project, issuetype, summary, assignee, attachment, components, Team, Start date, Sprint, description, duedate, fixVersions, issuelinks, labels, parent, priority. UI còn hiển thị Status. Các trường không xuất hiện ở biểu mẫu tạo không có nghĩa Jira không hỗ trợ ở màn hình khác.

**Workflow đã có:** To Do → Ready for Code → In Progress → Ready for Test → Done. Ready for Test là trạng thái đang thực hiện; Done ở cột cuối. Không thêm cột để phục vụ kế hoạch này. Bình luận bàn giao gồm người nhận kiểm, tự kiểm, bản dựng/môi trường, bằng chứng và lỗi còn lại.

Căn cứ phương pháp: [Atlassian — các loại work item](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/) xác nhận Story/Task là các loại công việc chuẩn, Sub-task là loại con; [Atlassian — ước lượng](https://support.atlassian.com/jira-software-cloud/docs/estimate-an-issue/) phân biệt ước lượng và theo dõi thời gian; [Scrum Guide](https://scrumguides.org/scrum-guide.html) giao việc sizing cho Developers và yêu cầu Increment đạt Definition of Done. Cấu hình cụ thể ở bảng trên dựa trên kiểm tra **XIAN thật**, không suy từ ví dụ hướng dẫn.

## Cập nhật lịch hiện hành 05/10/2026

PO xác nhận ngày 05/10/2026: **8 giờ/người/ngày, kể cả cuối tuần; hạn cuối bắt buộc 05/11/2026**. PO giao agent ước lượng Task và xếp ngày riêng. Giờ là ước lượng mục tiêu ban đầu theo hạn PO, chưa được kiểm chứng bằng năng suất thực tế; không phải cam kết chắc chắn đủ giờ đạt AC. Giữ nguyên tám yêu cầu MVP, phân vai, 98 mục và đồ thị phụ thuộc. Story Points để nhóm quyết định.

Lịch làm 09–12, 13–18 (UTC+7), 8 giờ gồm tự kiểm và phối hợp trong Task; ngày đầu 05/10 chỉ từ 14:00. Tối đa **3 Task đang hoạt động**, gồm triển khai, chờ review và review. Một người không làm/review/hỗ trợ hai việc cùng lúc. Người chính không mở Task mới khi Task trước còn mở. Tiền đề phải được kiểm/PASS rồi mới bắt đầu Task phụ thuộc; có thể bàn giao tuần tự **trong cùng ngày theo giờ**. Start/Due date Jira chỉ có ngày, nên thanh giao nhau cùng ngày không chứng minh ca trùng. Mục tiêu T-64 PASS 05/11 lúc 15:30, còn 2,5 giờ trong ngày cho đệm/bàn giao. Không kéo hạn. Khoảng 82% thời gian triển khai có 1–2 Task. Sprint 3 kết thúc 27/10 lúc 14:00, Sprint 4 bắt đầu ngay sau đó; cùng ngày nhưng không trùng ca. Ngày và giờ là mục tiêu, chưa ghi worklog.

Lịch và ước lượng ở [tệp 15](15-bang-chuan-bi-sprint-planning.md), dữ liệu Jira ở [tệp 01 mục 6](01-components-epic-khung-task.md#6-đối-chiếu-jira-thực--tạo-và-phân-công-ngày-05102026). Release: v0.1, v0.2, v0.3, v1.0; mốc v1.0 dự kiến 05/11/2026. Mẫu trống trong tài liệu là biểu mẫu tham khảo; giờ Task đã được điền theo uỷ quyền mới. Giữ nguyên 54 US, 167 AC P1; trạng thái kiểm sản phẩm vẫn NOT_RUN.
