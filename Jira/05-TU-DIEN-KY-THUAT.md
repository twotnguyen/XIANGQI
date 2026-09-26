# 05 — TỪ ĐIỂN KỸ THUẬT CHO SINH VIÊN

**Dành cho:** mọi thành viên (Dev, Tester, Design) · **Cập nhật:** 2026-09-27

> Task trong dự án dùng nhiều thuật ngữ kỹ thuật. Lần đầu gặp một từ trong Task, bạn sẽ thấy link tới đúng mục ở đây.
> Mỗi mục gồm: **nghĩa bằng lời thường** · **ví dụ trong dự án** · **làm sai thì chuyện gì xảy ra**.
> Thuật ngữ **nghiệp vụ** (PLAYER, SPECTATOR, WATCH, ván, phòng…) xem [Sổ tay kiểm thử §12](04-HUONG-DAN-KIEM-THU.md).

## Mục lục
**Cơ sở dữ liệu:** [Transaction](#transaction) · [Khoá dòng `FOR UPDATE`](#khoa-dong) · [Thứ tự khoá & Deadlock](#deadlock) · [SQL thuần và Prisma](#sql-prisma) · [Migration](#migration) · [Ràng buộc & lỗi 23505](#rang-buoc) · [Unique hoãn kiểm](#unique-hoan-kiem) · [RLS](#rls) · [Index & EXPLAIN](#index) · [Truy vấn N+1](#n-plus-1) · [CTE đệ quy](#cte)
**Máy chủ:** [API & HTTP](#api) · [Vỏ kết quả `ApiResult`](#api-result) · [JWT / token](#jwt) · [Socket.IO, sự kiện, ack](#socket) · [Zod & `.strict()`](#zod) · [Idempotency, `commandId`, biên lai](#idempotency) · [`version` & `expectedVersion`](#version) · [Đường xử lý lệnh `CommandPipeline`](#pipeline) · [Race condition](#race) · [Đồng hồ tiêm vào `Clock`](#clock) · [Bộ hẹn giờ `scheduler`](#scheduler) · [Phân trang con trỏ](#cursor) · [IDOR](#idor) · [Snapshot](#snapshot)
**Giao diện:** [Store Zustand](#zustand) · [TanStack Query](#tanstack) · [CSS Module](#css-module) · [Trợ năng: `aria-*`, focus](#aria) · [`prefers-reduced-motion`](#reduced-motion)
**Kiểm thử:** [Unit / Integration / E2E](#test-lanes) · [Barrier & 2 kết nối](#barrier) · [Thử phá (mutation)](#mutation) · [TDD: viết test trước](#tdd) · [Test skip / `.only`](#skip)

---

## CƠ SỞ DỮ LIỆU

<a id="transaction"></a>
### Transaction (giao dịch)
**Nghĩa:** gom nhiều câu lệnh DB thành **một khối "tất cả hoặc không có gì"**. Hoặc mọi câu đều được lưu (`COMMIT`), hoặc có lỗi thì huỷ hết như chưa từng chạy (`ROLLBACK`).
**Ví dụ:** đi một nước cờ = thêm dòng vào `match_moves` + đổi `head_move_id` + tăng `version` + ghi `match_events`. Bốn việc này nằm trong **một** transaction.
```ts
await withTransaction(async (tx) => {
  await tx.query('INSERT INTO match_moves …');
  await tx.query('UPDATE matches SET version = version + 1 …');
});  // lỗi ở bất kỳ dòng nào ⇒ cả hai đều bị huỷ
```
**Làm sai:** không dùng transaction, lỗi xảy ra giữa chừng ⇒ có nước đi nhưng version không tăng ⇒ các máy khách thấy dữ liệu lệch nhau.

<a id="khoa-dong"></a>
### Khoá dòng — `SELECT … FOR UPDATE`
**Nghĩa:** "giữ chỗ" một dòng trong DB. Transaction khác muốn sửa cùng dòng đó phải **đứng chờ** tới khi transaction đầu `COMMIT` hoặc `ROLLBACK`.
**Ví dụ:** hai tab của cùng người chơi gửi 2 nước đi cùng lúc. Lệnh đầu khoá dòng ván (`SELECT * FROM matches WHERE id=$1 FOR UPDATE`), lệnh sau phải chờ. Khi lệnh sau chạy, nó thấy version đã đổi và bị từ chối.
**Làm sai:** không khoá ⇒ cả hai lệnh cùng đọc "đang tới lượt ĐỎ" ⇒ ĐỎ đi **2 nước liền**. Đây là lỗi "mất khoá" lần xây trước từng gặp.

<a id="deadlock"></a>
### Thứ tự khoá & Deadlock (kẹt chéo)
**Nghĩa:** deadlock là khi hai transaction **chờ nhau mãi mãi**: T1 giữ khoá X và chờ Y, còn T2 giữ khoá Y và chờ X.
**Luật dự án:** mọi thao tác đụng nhiều thứ đều khoá theo đúng thứ tự **phòng → người dùng (id tăng dần) → ván**.
**Ví dụ:** lệnh tái đấu khoá `rooms` trước, rồi 2 dòng `profiles` (id nhỏ trước), rồi `matches`.
**Làm sai:** một lệnh khoá ván rồi mới khoá phòng, lệnh khác làm ngược lại ⇒ đôi khi hai người chơi bị treo, PostgreSQL báo `deadlock detected`.

<a id="sql-prisma"></a>
### SQL thuần và Prisma
**Nghĩa:** Prisma là thư viện viết truy vấn bằng hàm TypeScript (`prisma.match.findMany(...)`), tiện nhưng **khó điều khiển khoá**. SQL thuần là tự viết câu SQL trong `tx.query(...)`.
**Luật dự án (`TECH-07`):** thao tác cần **khoá dòng**, **thứ tự khoá**, hoặc **đếm rồi ghi** trong cùng transaction ⇒ **SQL thuần**. Chỉ đọc (lịch sử, hồ sơ, danh sách) ⇒ Prisma.
**Làm sai:** viết lệnh đi cờ bằng Prisma ⇒ mất khoá ⇒ lỗi như mục [Khoá dòng](#khoa-dong).

<a id="migration"></a>
### Migration
**Nghĩa:** file `.sql` mô tả một thay đổi cấu trúc DB (thêm bảng, thêm cột, thêm index). Chạy lần lượt theo thứ tự tên file để DB mọi máy giống nhau.
**Luật dự án:** tạo file trong `supabase/migrations/` bằng Supabase CLI, áp bằng `pnpm db:reset`. ⛔ **Không bao giờ** chạy `prisma migrate` — nó sẽ xoá RLS, CHECK và unique hoãn kiểm.
**Làm sai:** sửa thẳng DB bằng tay trên máy mình ⇒ máy bạn chạy được, máy người khác và CI thì lỗi.

<a id="rang-buoc"></a>
### Ràng buộc (constraint) & lỗi `23505`
**Nghĩa:** luật DB tự kiểm khi ghi. `UNIQUE` = không được trùng; `CHECK` = giá trị phải thoả điều kiện; `FOREIGN KEY` = phải trỏ tới dòng có thật. Vi phạm `UNIQUE` thì PostgreSQL báo mã lỗi **`23505`**.
**Ví dụ:** `match_proposals` có unique index `(match_id) WHERE status='PENDING'` ⇒ DB **tự** chặn 2 đề nghị chờ cùng ván. Code bắt lỗi `23505` và đổi thành `PROPOSAL_PENDING` cho người dùng.
**Làm sai:** để lỗi `23505` bay thẳng ra ngoài ⇒ người dùng nhận lỗi 500 khó hiểu.

<a id="unique-hoan-kiem"></a>
### Unique hoãn kiểm (`DEFERRABLE INITIALLY DEFERRED`)
**Nghĩa:** ràng buộc `UNIQUE` bình thường được kiểm **ngay sau mỗi câu lệnh**. Loại "hoãn kiểm" chỉ được kiểm **lúc COMMIT**.
**Ví dụ:** tái đấu đổi bên: A từ ĐỎ sang ĐEN, B từ ĐEN sang ĐỎ. Sau câu lệnh thứ nhất, tạm thời **cả hai cùng là ĐEN** (vi phạm "mỗi màu một người"). Nhờ hoãn kiểm, tới COMMIT thì đã đúng lại và DB chấp nhận.
**Làm sai:** dùng unique thường ⇒ đổi bên luôn lỗi `23505`.

<a id="rls"></a>
### RLS (Row Level Security)
**Nghĩa:** luật của PostgreSQL quy định **ai được đọc/ghi dòng nào**, gắn ngay trên bảng.
**Ví dụ:** dự án bật RLS mọi bảng; trình duyệt **không** đọc thẳng DB. Máy chủ dùng vai trò riêng `app_server`.
**Làm sai:** tắt RLS ⇒ ai có khoá công khai của Supabase là đọc được mọi tin nhắn.

<a id="index"></a>
### Index & `EXPLAIN`
**Nghĩa:** index giống **mục lục sách**: tìm nhanh mà không phải đọc hết. `EXPLAIN <câu SQL>` cho biết PostgreSQL định chạy câu đó thế nào.
**Đọc kết quả:** `Index Scan` / `Bitmap Index Scan` ⇒ dùng index (tốt). `Seq Scan` trên bảng lớn ⇒ đọc toàn bộ bảng (chậm).
**Làm sai:** không có index cho truy vấn lịch sử ⇒ khi có vài chục nghìn ván, trang lịch sử tải vài giây.

<a id="n-plus-1"></a>
### Truy vấn N+1
**Nghĩa:** lấy danh sách N dòng (1 truy vấn), rồi **với mỗi dòng** lại gọi thêm 1 truy vấn ⇒ tổng cộng N+1 truy vấn.
**Ví dụ sai:** lấy 20 ván, rồi lặp 20 lần `SELECT count(*) FROM match_moves WHERE match_id=…`. **Đúng:** một truy vấn `… WHERE match_id IN (…) GROUP BY match_id`.
**Làm sai:** trang chậm dần khi dữ liệu tăng.

<a id="cte"></a>
### CTE đệ quy (`WITH RECURSIVE`)
**Nghĩa:** câu SQL tự gọi lại chính nó để đi theo quan hệ cha–con.
**Ví dụ:** lấy nhánh nước đi hiệu lực: bắt đầu từ `head_move_id`, đi ngược theo `parent_move_id` tới gốc, rồi đảo thứ tự.
```sql
WITH RECURSIVE branch AS (
  SELECT id, parent_move_id, 0 AS depth FROM match_moves WHERE id = $1          -- head
  UNION ALL
  SELECT m.id, m.parent_move_id, b.depth + 1 FROM match_moves m JOIN branch b ON m.id = b.parent_move_id
) SELECT * FROM branch ORDER BY depth DESC;                                        -- gốc → head
```

---

## MÁY CHỦ

<a id="api"></a>
### API & HTTP
**Nghĩa:** "cửa" để giao diện nói chuyện với máy chủ. Mỗi API = **phương thức** (`GET` để đọc, `POST` để gửi lệnh) + **đường dẫn** (`/api/v1/matches/:id/commands/resign`). `:id` là chỗ điền mã thật.
**Mã HTTP:** `200/201` thành công · `400` dữ liệu sai · `401` chưa đăng nhập · `403` không có quyền · `404` không có · `409` xung đột trạng thái · `429` gửi quá nhanh · `500` lỗi máy chủ (**không bao giờ** được cố ý trả 500).

<a id="api-result"></a>
### Vỏ kết quả `ApiResult`
**Nghĩa:** mọi phản hồi của máy chủ có cùng một dạng, để giao diện xử lý thống nhất:
```jsonc
{ "ok": true,  "data": { … },                                                "requestId": "…" }   // thành công
{ "ok": false, "error": { "code": "FORBIDDEN", "message": "Bạn không có quyền" }, "requestId": "…" } // lỗi
```
Tester so `error.code` (chữ in hoa) là chính. `message` là câu tiếng Việt cho người dùng.

<a id="jwt"></a>
### JWT / token
**Nghĩa:** "thẻ ra vào" máy chủ cấp sau khi đăng nhập. Mỗi request gửi kèm header `Authorization: Bearer <token>`. Máy chủ biết bạn là ai **chỉ** nhờ token, không nhờ bất cứ trường nào trong body.
**Làm sai:** lấy `userId` từ body ⇒ ai cũng giả làm người khác được.

<a id="socket"></a>
### Socket.IO, sự kiện, ack
**Nghĩa:** kết nối **luôn mở** giữa trình duyệt và máy chủ, để máy chủ **chủ động** báo tin (ví dụ đối thủ vừa đi) mà không cần trình duyệt hỏi liên tục.
- **Sự kiện (event):** một tin có tên, ví dụ `match.resign`, `match.updated`.
- **ack:** câu trả lời máy chủ gửi lại cho **đúng** sự kiện client vừa gửi (dạng `ApiResult`).
**Luật dự án (`ARCH-14`):** HTTP và Socket.IO gọi **cùng một service**. Kiểm quyền ở HTTP mà quên ở socket = lỗ hổng.

<a id="zod"></a>
### Zod & `.strict()`
**Nghĩa:** thư viện kiểm dữ liệu đầu vào đúng khuôn. `.strict()` = **có trường lạ là từ chối**.
**Ví dụ:** lệnh đầu hàng chỉ nhận `{ commandId, expectedVersion }`. Gửi thêm `"winner":"RED"` ⇒ `VALIDATION_ERROR`.
**Làm sai:** không strict ⇒ kẻ gian thử gửi `role`, `side` xem máy chủ có vô tình dùng không.

<a id="idempotency"></a>
### Idempotency, `commandId`, biên lai
**Nghĩa:** "gửi một lần hay gửi lại nhiều lần thì kết quả **như nhau**". Mỗi lệnh có một `commandId` (UUID) do client tạo. Máy chủ lưu **biên lai** (`commandId` → kết quả). Nhận lại cùng `commandId` ⇒ trả kết quả cũ, **không làm lại**.
**Ví dụ:** mạng chập chờn, client gửi lại lệnh đầu hàng ⇒ vẫn chỉ 1 lần đầu hàng.
**Làm sai:** không có biên lai ⇒ bấm đúp tạo 2 ván mới khi tái đấu.

<a id="version"></a>
### `version` & `expectedVersion`
**Nghĩa:** số của ván, **tăng 1** mỗi khi trạng thái ván đổi. Client gửi kèm `expectedVersion` = version nó đang thấy. Máy chủ so: khác ⇒ `VERSION_CONFLICT` (client đang nhìn trạng thái cũ, phải tải lại).
**Chú ý:** `version` **chỉ tăng**. Đi lại làm `ply` giảm nhưng `version` vẫn tăng.

<a id="pipeline"></a>
### Đường xử lý lệnh `CommandPipeline`
**Nghĩa:** khung dùng chung cho **mọi** lệnh ván (TK10.2.3), chạy 11 bước cố định:
```
① xác thực + quyền   ② KHOÁ   ③ biên lai (đã làm chưa?)   ④ ván đang chơi? version khớp?
⑤ tính lại đồng hồ (hết giờ ⇒ kết thúc, từ chối lệnh)   ⑥ đúng lượt? đúng luật?
⑦ áp dụng + tăng version   ⑧ kiểm kết thúc ván   ⑨ LƯU (tất cả hoặc không)   ⑩ mở khoá   ⑪ phát tin cho cả phòng
```
Task lệnh mới (đầu hàng, đề nghị…) **chỉ viết phần riêng** ở bước ⑥–⑦, không tự làm lại khoá, biên lai hay phát tin.

<a id="race"></a>
### Race condition (tranh chấp đồng thời)
**Nghĩa:** hai việc xảy ra **gần như cùng lúc**, kết quả phụ thuộc việc nào chạy trước ⇒ dễ sai.
**Ví dụ:** A bấm đầu hàng đúng mili-giây đồng hồ của A hết giờ. Đúng: ra **một** kết quả. Sai: ván kết thúc 2 lần, hoặc lỗi 500.
**Cách chống:** khoá dòng + kiểm lại trạng thái sau khi khoá + một hàm kết thúc duy nhất (`finalizeMatch`).

<a id="clock"></a>
### Đồng hồ tiêm vào (`Clock`)
**Nghĩa:** code nghiệp vụ **không** gọi `Date.now()`, mà hỏi giờ từ đối tượng `clock` được truyền vào (tiêm vào). Khi chạy thật, `clock` là giờ hệ thống; khi test, `clock` là **đồng hồ giả** tua nhanh được.
```ts
const clock = createTestClock(0);
clock.advance(29_999); clock.runDueTasks();  // đề nghị vẫn PENDING
clock.advance(1);      clock.runDueTasks();  // đúng 30 000 ms ⇒ EXPIRED
```
**Làm sai:** dùng `Date.now()` ⇒ test phải `sleep` 30 giây thật (bị cấm), và không kiểm được biên từng mili-giây.

<a id="scheduler"></a>
### Bộ hẹn giờ (`scheduler`)
**Nghĩa:** "tới giờ X thì chạy việc Y", **không cần ai gửi lệnh**. Dùng cho: hết giờ ván, đề nghị hết hạn 30 giây, đóng phòng 10 phút, ân hạn mất mạng 60 giây…
**Luật (`ARCH-08`):** việc do hẹn giờ chạy cũng phải đi qua transaction có khoá, và **kiểm lại điều kiện** (vì trong lúc chờ, trạng thái có thể đã đổi).

<a id="cursor"></a>
### Phân trang con trỏ (cursor pagination)
**Nghĩa:** thay vì "bỏ qua 20 dòng đầu" (`OFFSET 20`), dùng "lấy các dòng **sau** dòng cuối trang trước". Con trỏ thường là giá trị sắp xếp của dòng cuối, ví dụ `(ended_at, id)`.
**Làm sai:** dùng `OFFSET` ⇒ trong lúc bạn xem trang 1 có ván mới xen vào ⇒ trang 2 bị trùng một dòng.

<a id="idor"></a>
### IDOR (đoán mã đối tượng)
**Nghĩa:** lỗ hổng khi máy chủ chỉ kiểm "đã đăng nhập", **quên** kiểm "đối tượng này có phải của bạn không". Kẻ gian đổi mã trên URL là xem được dữ liệu người khác.
**Ví dụ:** `GET /history/<mã ván của người khác>/replay` ⇒ phải `FORBIDDEN`.
**Mẹo:** trả **cùng một lỗi** cho "không tồn tại" và "không có quyền", để kẻ gian không dò ra mã nào tồn tại.

<a id="snapshot"></a>
### Snapshot
**Nghĩa:** "ảnh chụp" đầy đủ trạng thái ván tại một thời điểm (bàn cờ, lượt, đồng hồ, đề nghị, version…), máy chủ gửi cho client. Client mất kết nối rồi quay lại thì xin snapshot mới để đồng bộ.

---

## GIAO DIỆN

<a id="zustand"></a>
### Store Zustand
**Nghĩa:** "kho" dữ liệu dùng chung trong giao diện. Nhiều component cùng đọc một chỗ; dữ liệu đổi thì chúng tự vẽ lại. Dự án dùng cho **ván đang chơi** (cập nhật liên tục qua socket).

<a id="tanstack"></a>
### TanStack Query
**Nghĩa:** thư viện gọi API **đọc** (lịch sử, hồ sơ, sảnh), tự lo trạng thái đang tải / lỗi / bộ nhớ đệm. `useInfiniteQuery` dùng cho danh sách nhiều trang có nút "Tải thêm".

<a id="css-module"></a>
### CSS Module
**Nghĩa:** file `Ten.module.css`. Tên lớp CSS được đổi thành tên duy nhất cho từng component, nên hai component đặt cùng tên lớp `.button` cũng **không đè nhau**. Màu, khoảng cách lấy từ biến trong `tokens.css`.

<a id="aria"></a>
### Trợ năng: `aria-*`, focus
**Nghĩa:** giúp người dùng trình đọc màn hình hoặc chỉ dùng bàn phím.
- `aria-disabled="true"` + `aria-describedby="id-câu-giải-thích"`: nút vô hiệu kèm lý do đọc được.
- **Focus:** khung viền quanh phần tử đang được chọn bằng phím Tab. **Không được** xoá viền này.
- Hộp thoại mở ⇒ focus vào trong hộp; đóng ⇒ focus về nút đã mở nó.

<a id="reduced-motion"></a>
### `prefers-reduced-motion`
**Nghĩa:** cài đặt hệ điều hành "giảm chuyển động" (cho người bị chóng mặt khi nhìn hiệu ứng). CSS `@media (prefers-reduced-motion: reduce) { … }` ⇒ tắt hiệu ứng trượt quân.

---

## KIỂM THỬ

<a id="test-lanes"></a>
### Unit / Integration / E2E
| Loại | Kiểm gì | Công cụ | Lệnh | Tốc độ |
|---|---|---|---|---|
| **Unit** | Một hàm thuần (luật cờ, tính đồng hồ) | Vitest | `pnpm test:unit` | Rất nhanh |
| **Integration** | Máy chủ + **DB PostgreSQL thật** | Vitest + harness | `pnpm test:integration` | Vừa |
| **E2E** | Mở **trình duyệt thật**, bấm như người dùng | Playwright | `pnpm test:e2e` | Chậm |
**Luật dự án:** test dữ liệu chạy trên PostgreSQL **thật**, ⛔ không giả lập (mock) DB. Thiếu DB ⇒ test phải **đỏ**, không được bỏ qua.

<a id="barrier"></a>
### Barrier (rào đồng bộ) & 2 kết nối
**Nghĩa:** để tạo tranh chấp **thật** trong test: 2 tác vụ chạy trên **2 kết nối DB riêng**, cùng dừng ở một "vạch xuất phát" (barrier), rồi được thả ra **cùng lúc**.
**Làm sai:** chỉ dùng `Promise.all` trên cùng một kết nối ⇒ 2 lệnh thực ra chạy lần lượt ⇒ test luôn xanh dù code có lỗi tranh chấp.

<a id="mutation"></a>
### Thử phá (mutation)
**Nghĩa:** cố tình làm hỏng code (xoá dòng kiểm quyền, bỏ bộ hẹn giờ…) rồi chạy test. Test **phải đỏ**. Test vẫn xanh ⇒ test vô dụng.
**Cách làm an toàn:** làm trên nhánh tạm, **không commit**, xong thì `git checkout .` để khôi phục.

<a id="tdd"></a>
### TDD — viết test trước
**Nghĩa:** ① viết test cho hành vi mong muốn ⇒ chạy thấy **đỏ** (vì chưa có code) ⇒ ② viết code tối thiểu cho test **xanh** ⇒ ③ dọn code, test vẫn xanh.
**Lợi ích:** chắc chắn test kiểm đúng thứ cần kiểm (đã từng thấy nó đỏ).

<a id="skip"></a>
### Test bị bỏ qua / `.only`
**Nghĩa:** `it.skip(...)` = bỏ qua test; `it.only(...)` = **chỉ** chạy test này, bỏ hết test khác.
**Luật dự án:** ⛔ cấm cả hai trong code được merge. Báo cáo kiểm thử cột `skipped` phải bằng **0**.
