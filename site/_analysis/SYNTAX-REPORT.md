# BÁO CÁO KHẢO SÁT CÚ PHÁP MARKDOWN

**Phạm vi quét:** 199 file — 197 file `.md` trong `docs/` (đã loại trừ `docs/99-archive/`) + `README.md` + `AGENTS.md` ở gốc dự án.
**Cách đếm:** script Python quét từng dòng, có máy trạng thái theo dõi code fence nên **mọi con số dưới đây đều loại trừ nội dung nằm trong code fence**, trừ khi ghi rõ ngược lại.
**Mục đích:** xác định chính xác tập cú pháp mà renderer bắt buộc phải hỗ trợ.

---

## 0. TÓM TẮT CHO NGƯỜI VIẾT RENDERER

| Mức | Cú pháp | Ghi chú |
|---|---|---|
| **BẮT BUỘC** | Bảng (756 bảng) · `**đậm**` (10.536) · code inline (6.488) · heading H1–H3 · code fence · `---` · danh sách có số · checkbox `- [ ]` · link `[..](..md)` | Chiếm gần như toàn bộ nội dung |
| **BẮT BUỘC** | Căn lề cột bảng `:---:` và `---:` | 44 bảng dùng |
| **BẮT BUỘC** | Code fence **thụt lề** và code fence mở **ngay sau số thứ tự** (`1. ```ts`) | 108 trường hợp — dễ vỡ nhất |
| **BẮT BUỘC** | Escape `<` `>` `&` thành thực thể HTML | 96 lần xuất hiện dạng text/code |
| **BẮT BUỘC** | Giữ nguyên khoảng trắng trong fence (sơ đồ ASCII 173 khối) | Phải dùng font đơn cách |
| **CẦN** | `<details>` / `<summary>` | Chỉ 1 file (`ONBOARDING.md`) nhưng là phần đáp án quiz |
| **CẦN** | Blockquote 1 cấp · `*nghiêng*` · danh sách gạch đầu dòng lồng 2 cấp | |
| **KHÔNG CẦN** | Ảnh · link neo `#` · `~~gạch~~` · `***đậm nghiêng***` · `<br>` · `\|` escape · `~~~` fence · footnote · link tham chiếu · HTML comment · `_nghiêng_` | **Đã xác nhận 0 lần xuất hiện** |

---

## 1. HEADING

| Cấp | Số lần | Số file có | Ví dụ thật |
|---|---:|---:|---|
| H1 `#` | 206 | 199 | `README.md:1` — `# CỜ TƯỚNG ONLINE` |
| H2 `##` | 1.919 | 197 | `AGENTS.md:10` — `## 0. TÓM TẮT 60 GIÂY` |
| H3 `###` | 291 | 40 | `AGENTS.md:113` — `### Bốn cổng bắt buộc trước khi mở PR` |
| H4 `####` | **0** | 0 | — |
| H5 `#####` | **0** | 0 | — |
| H6 `######` | **0** | 0 | — |

**Kết luận:** chỉ cần render H1, H2, H3. Mục lục trang web chỉ cần 2 cấp.

**Bất thường:** 198/199 file có **đúng một** H1 ở dòng 1. Ngoại lệ duy nhất là `docs/08-ba-review/open-questions.md` — có **8 H1** (dòng 1, 29, 35, 124, 164, 195, 236, 249), dùng H1 như dấu phân vùng. Nếu renderer lấy H1 đầu tiên làm tiêu đề trang thì file này vẫn đúng, nhưng mục lục sẽ thiếu 7 phần.

**Không có heading kiểu Setext** (gạch `===` / `---` dưới dòng chữ): đã kiểm tra, mọi dòng `---` đều có dòng trống ngay phía trên nên không bị CommonMark hiểu nhầm thành H2.

---

## 2. BẢNG (TABLE) — cú pháp quan trọng nhất của bộ tài liệu

| Chỉ số | Giá trị |
|---|---:|
| Tổng số bảng | **756** |
| Tổng số dòng dữ liệu (không tính dòng phân cách) | 6.043 |
| Tổng số ô | 15.678 |
| Số cột nhiều nhất trong một bảng | 9 |
| Ô rỗng | 56 |

### 2.1 Dấu `|` escape `\|` bên trong ô

**KHÔNG CÓ — 0 trường hợp.** Đã kiểm chứng hai lần (script quét ô + grep toàn bộ `\|`).

Thêm một xác nhận quan trọng: **không có dòng bảng nào chứa code inline có dấu `|` bên trong** (kiểm bằng cách đếm dấu backtick lẻ trên dòng có `|` → 0 dòng). Nghĩa là **tách ô bằng `split('|')` đơn giản là an toàn** cho toàn bộ 756 bảng.

> Lưu ý: chuỗi kiểu `'PLAYER' | 'SPECTATOR'` **có** xuất hiện, nhưng chỉ nằm trong code fence (`docs/10-issues/ISSUE-009.md:20`), không nằm trong ô bảng.

### 2.2 Căn lề cột

**CÓ.** 44/756 bảng có ít nhất một cột căn lề.

| Kiểu | Số cột dùng | Ví dụ thật |
|---|---:|---|
| `---` (mặc định) | 1.768 | — |
| `:---:` (giữa) | 135 | `docs/00-overview/actors.md:166` — `\|---\|:---:\|:---:\|:---:\|:---:\|:---:\|` |
| `---:` (phải) | 6 | `docs/10-issues/ISSUE-131.md:18` — `\|---\|---:\|---:\|` |
| `:---` (trái tường minh) | **0** | — |

Ví dụ nguyên văn bảng ma trận quyền (`docs/00-overview/actors.md:165-167`):

```
| Hành động | Khách | User | Chủ phòng | Người chơi | Người xem |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem sảnh | ❌ | ✅ | ✅ | ✅ | ✅ |
```

Một bảng trộn nhiều kiểu căn lề trong cùng dòng phân cách (`docs/07-decisions/decision-log.md:490`): `|---|---:|---:|:---:|`

### 2.3 Nội dung bên trong ô

| Loại nội dung | Số ô | Số file | Ví dụ thật |
|---|---:|---:|---|
| Code inline `` ` `` | 3.003 | 185 | `AGENTS.md:48` — `\| Ký hiệu \| \`(x, y)\`, đếm từ **0** \|` |
| Chữ đậm `**` | 4.838 | — | như trên |
| Link `[..](..)` | 361 | 22 | `AGENTS.md:28` — `\| 1 \| [docs/00-overview/glossary.md](docs/00-overview/glossary.md) \| \`SPECTATOR\` ≠ \`WATCH\`. Dùng sai từ là lỗi \|` |
| Xuống dòng `<br>` | **0** | 0 | — |

**Kết luận:** renderer phải chạy đầy đủ inline-parser (đậm + code + link) **bên trong từng ô bảng**, nhưng không cần xử lý `<br>` hay `\|`.

---

## 3. CODE FENCE

| Chỉ số | Giá trị |
|---|---:|
| Tổng số khối fence | **270** |
| Dùng dấu ``` ``` ``` | 270 (100%) |
| Dùng dấu `~~~` | **0** |
| Có khai báo ngôn ngữ | 56 |
| **Không** khai báo ngôn ngữ | **214** |
| Fence dài hơn 3 backtick | 0 |
| Fence không đóng | 0 (đã cân bằng hết) |

### 3.1 Danh sách ĐẦY ĐỦ các ngôn ngữ đã dùng

| Ngôn ngữ | Số khối | Số file | Ví dụ thật |
|---|---:|---:|---|
| `ts` | 32 | 22 | `docs/10-issues/ISSUE-003.md:35` — ```` ```ts ```` |
| `sql` | 18 | 12 | `docs/10-issues/ISSUE-035.md:27` — ```` ```sql ```` |
| `bash` | 2 | 2 | `AGENTS.md:115` — ```` ```bash ```` |
| `json` | 2 | 2 | `docs/10-issues/ISSUE-033.md:26` — ```` ```json ```` |
| `yaml` | 1 | 1 | `docs/10-issues/ISSUE-001.md:51` — ```` ```yaml ```` |
| `markdown` | 1 | 1 | `docs/10-issues/WORKFLOW.md:82` — ```` ```markdown ```` |

Chỉ **6 ngôn ngữ**. Nếu dùng thư viện tô màu cú pháp, chỉ cần nạp đúng 6 gói này.

### 3.2 ⚠ HAI BẪY LỚN NHẤT CỦA BỘ TÀI LIỆU NÀY

**Bẫy 1 — fence thụt lề bên trong list item: 97 khối, 69 file.**

```
docs/10-issues/EXTERNAL-SETUP.md:59      ```
docs/10-issues/EXTERNAL-SETUP.md:146     ```
```

**Bẫy 2 — fence mở NGAY SAU dấu số thứ tự, trên CÙNG MỘT DÒNG: 11 khối, 11 file.**

Trích nguyên văn `docs/10-issues/ISSUE-024.md:19-21`:

```
1. ```ts
   getTerminalOutcome(position, occurrences: number): Outcome | null
   ```
```

Và `docs/10-issues/ISSUE-009.md:23`:

```
2. ```ts
```

Một parser ngây thơ (`line.startswith('```')`) sẽ **bỏ sót cả hai loại** và làm lệch trạng thái fence cho phần còn lại của file. Đây chính là lỗi mà bản quét đầu tiên của báo cáo này mắc phải — nó báo 10 file "fence không đóng" trước khi sửa.

Danh sách 11 file có bẫy 2: `ISSUE-009`, `ISSUE-023`, `ISSUE-024`, `ISSUE-025`, `ISSUE-026`, `ISSUE-028`, `ISSUE-029`, `ISSUE-030`, `ISSUE-031`, `ISSUE-040`, `ISSUE-089` (đều trong `docs/10-issues/`).

### 3.3 Sơ đồ ASCII trong code fence

**CÓ, rất nhiều: 173/270 khối fence (64%), trải trên 74 file.**

Ký tự dùng: `┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ► ◄ ▼ ▲ ⇒ → ① ② ③ ④ ⑤`

Ví dụ nguyên văn `docs/09-technical/architecture.md:10-17`:

```
┌──────────────┐     đăng nhập      ┌──────────────────┐
│   TRÌNH      │───────────────────►│   XÁC THỰC       │
│   DUYỆT      │                    │   (Supabase Auth)│
│              │                    └──────────────────┘
│  - bàn cờ    │
│  - chat      │  lệnh + sự kiện    ┌──────────────────┐
│  - camera    │◄──────────────────►│  MÁY CHỦ         │
└──────┬───────┘   thời gian thực   │  TRÒ CHƠI        │
```

Ví dụ nguyên văn `docs/10-issues/ISSUE-024.md:24-30` (cây quyết định trong fence không khai báo ngôn ngữ, mở ở dòng 23 và thụt 3 dấu cách):

```
① legalMoves rỗng?
     ├─ CÓ  → isInCheck ? CHECKMATE : STALEMATE
     │        winner = ĐỐI THỦ của bên đến lượt   (CẢ HAI ĐỀU THUA)
     └─ KHÔNG → tiếp ②
② occurrences >= 3 ?
     ├─ CÓ  → REPETITION, winner = null (HOÀ)
     └─ KHÔNG → trả null
```

**Yêu cầu với renderer:** `white-space: pre`, font đơn cách có hỗ trợ ký tự vẽ hộp Unicode, **không** bẻ dòng, **không** thay thế ký tự. Font phải render `─` và `│` đúng bề rộng, nếu không sơ đồ sẽ vỡ.

---

## 4. CODE INLINE

| Chỉ số | Giá trị |
|---|---:|
| Số đoạn code inline | **6.488** |
| Số file có dùng | 196 / 199 |
| Dùng **nhiều backtick liền nhau** (`` ``…`` ``) | **0** |
| Chuỗi backtick 2 dấu ngoài fence | **0** |

**Kết luận:** chỉ có duy nhất dạng một backtick `` `text` ``. Không cần xử lý delimiter nhiều backtick.

Ví dụ: `AGENTS.md:20` — ``chọn issue `TODO` đầu tiên có **mọi phụ thuộc đã `DONE`**``

---

## 5. DANH SÁCH

| Loại | Số dòng | Số file | Ví dụ thật |
|---|---:|---:|---|
| Đánh số `1.` (cấp 0) | 952 | 148 | `AGENTS.md:308` — `1. \`01-requirements/\` nói **CÁI GÌ**…` |
| Đánh số **lồng nhau** | **0** | 0 | — |
| Gạch đầu dòng `-` (cấp 0) | 261 | 31 | `AGENTS.md:105` — `- Prisma chỉ dùng **\`db pull\`** để sinh kiểu dữ liệu` |
| Gạch đầu dòng **lồng 1 cấp** (thụt 3 dấu cách) | 74 | 21 | `docs/10-issues/EXTERNAL-SETUP.md:52` — `   - Kiểu người dùng: **External** (bên ngoài)` |
| Dùng dấu `*` hoặc `+` làm bullet | **0** | 0 | Chỉ dùng `-` |

**Độ lồng tối đa: 2 cấp**, và chỉ với gạch đầu dòng. Thụt lề luôn là **3 dấu cách** (khớp với chiều rộng của `1. `), không phải 2 hay 4 — renderer tính cấp theo bội số của 2 hoặc 4 sẽ tính sai.

Danh sách lồng thực tế luôn nằm **bên trong một mục đánh số**, nguyên văn `docs/10-issues/EXTERNAL-SETUP.md:51-53`:

```
2. Vào mục **OAuth consent screen** (màn hình xin đồng ý):
   - Kiểu người dùng: **External** (bên ngoài)
   - Điền: tên ứng dụng · email hỗ trợ · email liên hệ nhà phát triển
```

---

## 6. CHECKBOX

| Loại | Số lần | Số file |
|---|---:|---:|
| `- [ ]` chưa tick | **720** | 141 |
| `- [x]` đã tick | **0** (nội dung thật) | 0 |

Ví dụ: `AGENTS.md:228` — `- [ ] Mọi ô trong CHECKLIST PASS đã tick`

**Bất thường đáng lưu ý:** có đúng **một** dòng `- [x]` trong toàn bộ kho, tại `docs/10-issues/WORKFLOW.md:98` — `- [x] <chép từ mục 8 của issue>` — nhưng nó nằm **bên trong code fence ```` ```markdown ````** (mở ở dòng 82), tức là nó là **mẫu văn bản minh hoạ**, không phải checkbox thật. Renderer phải để nguyên nó dưới dạng code, không được biến thành ô tick.

---

## 7. BLOCKQUOTE

| Chỉ số | Giá trị |
|---|---:|
| Số dòng blockquote | **119** |
| Số file có dùng | 67 |
| Lồng nhiều cấp (`>>`) | **0** — tất cả đều đúng 1 cấp |
| Blockquote nhiều dòng liên tiếp | **CÓ** — 15 lần, trên 8 file |

Ví dụ 1 dòng: `AGENTS.md:6` — `> Đọc **hết** file này trước khi chạm vào bất kỳ file nào. Mất 10 phút, tiết kiệm nhiều ngày sửa lỗi.`

Ví dụ nhiều dòng liên tiếp, nguyên văn `AGENTS.md:357-360`:

```
> **Ghi số thật luôn tốt hơn báo cáo đẹp.**
>
> Một issue ghi `BLOCKED` kèm số đo thật thì có ích.
> Một issue ghi `DONE` mà ngưỡng đã bị hạ xuống thì **gây hại** — vì nó giấu vấn đề cho tới lúc không sửa được nữa.
```

Lưu ý: khối trên có **dòng `>` rỗng ở giữa** → renderer phải gộp cả 4 dòng thành **một** blockquote chứa 2 đoạn văn, không phải 2 blockquote rời.

---

## 8. ĐƯỜNG KẺ NGANG

| Chỉ số | Giá trị |
|---|---:|
| Số lần | **653** |
| Số file có dùng | 66 |
| Dạng dùng | `---` (100%) |
| Dạng `***` hoặc `___` | 0 |

Ví dụ: `AGENTS.md:8`, `AGENTS.md:22`, `docs/01-requirements/REQ-BOARD.md:7`.

Chỉ 66/199 file dùng `---`; nhóm file `ISSUE-*` hầu như không dùng. `---` luôn đứng một mình, có dòng trống trên và dưới.

---

## 9. ĐẬM / NGHIÊNG / GẠCH NGANG

| Cú pháp | Số lần | Số file | Ví dụ thật |
|---|---:|---:|---|
| `**đậm**` | **10.536** | **199 (tất cả)** | `AGENTS.md:3` — `**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-21` |
| `*nghiêng*` | 252 | 78 | `docs/00-overview/glossary.md:125` — `❌ **Cấm dùng:** *"tab khác"*, *"quyền phát thiết bị"*…` |
| `_nghiêng_` | **0** | 0 | — |
| `***đậm nghiêng***` | **0** | 0 | — |
| `~~gạch~~` | **0** | 0 | — |

`**đậm**` là cú pháp inline phổ biến thứ hai sau code inline — trung bình **53 lần/file**. Chữ nghiêng gần như chỉ dùng để trích **chuỗi hiển thị trên giao diện**, ví dụ `docs/01-requirements/REQ-AI.md:183` — `| Đang xếp hàng | *"Đang chờ đến lượt xử lý…"* |`.

> **Cảnh báo cho người viết parser:** `**` và `*` nằm rất gần nhau trong cùng dòng (ví dụ `**a** · *b* · **c**`). Bộ quét đầu tiên của báo cáo này đã báo nhầm 25 trường hợp `***đậm nghiêng***` chỉ vì xoá code inline trước rồi mới khớp `*`. Số thật là **0**. Phải khớp `**` trước `*`, và khớp trên dòng nguyên bản.

---

## 10. LINK

| Loại | Số lần | Ví dụ thật |
|---|---:|---|
| Link tới file `.md` khác | **780** | `AGENTS.md:20` — `[docs/10-issues/INDEX.md](docs/10-issues/INDEX.md)` |
| Link tới **thư mục** (kết thúc bằng `/`) | 37 | `README.md:21` — `[docs/10-issues/](docs/10-issues/)` |
| Link có neo `#` | **0** | — |
| Link `.md#neo` | **0** | — |
| Link `http(s)` trong nội dung thật | **0** | — |
| Link `http(s)` **bên trong code fence** | 2 | `AGENTS.md:168` — `🤖 Generated with [Claude Code](https://claude.com/claude-code)` |
| URL trần (không bọc) | 3 | `docs/07-decisions/interview-log.md:52` — `https://supabase.com/docs/guides/database/overview` |
| Link ảnh `![..](..)` | **0** | — |
| Autolink `<url>` | **0** | — |
| Link kiểu tham chiếu `[a]: url` | **0** | — |
| Footnote `[^1]` | **0** | — |

**Rất quan trọng:**

1. **Không có ảnh nào** trong toàn bộ bộ tài liệu. Mọi sơ đồ đều là ASCII trong code fence.
2. **Không có link neo `#`** — renderer tự sinh `id` cho heading thì không sợ đụng link có sẵn.
3. **780/780 link `.md` đều trỏ tới file có thật** — đã kiểm tra từng đường dẫn sau khi giải tương đối. **0 link gãy.**
4. Link đều là **đường dẫn tương đối** (`../04-business-rules/game-rules.md`), cần giải về đường dẫn tuyệt đối theo gốc dự án rồi ánh xạ sang URL của trang web.
5. Có 37 link trỏ tới **thư mục** (`docs/02-flows/`) — trang web cần trang chỉ mục cho thư mục, nếu không 37 link này sẽ gãy.

---

## 11. HTML THÔ NHÚNG TRONG MARKDOWN

### 11.1 Thẻ HTML THẬT — chỉ có 2 loại

| Thẻ | Số lần | Vị trí |
|---|---:|---|
| `<details>` | 2 (1 mở + 1 đóng) | `docs/ONBOARDING.md:70` và `:80` |
| `<summary>` | 2 (1 mở + 1 đóng) | `docs/ONBOARDING.md:71` — `<summary>Đáp án</summary>` |

Đây là **file duy nhất** dùng HTML thật, cho phần đáp án tự kiểm tra. Trích nguyên văn `docs/ONBOARDING.md:70-80`:

```
<details>
<summary>Đáp án</summary>

- **7 người** — 2 người chơi + tối đa 5 người xem
- `SPECTATOR` là **vai trò** trong phòng · `WATCH` là **loại quyền** của tấm vé vào phòng
…
</details>
```

Lưu ý: bên trong `<details>` là **markdown bình thường** (danh sách, đậm, code inline), cách nhau bằng một dòng trống — renderer phải tiếp tục parse markdown bên trong, không được coi cả khối là HTML thô.

### 11.2 KHÔNG xuất hiện

`<br>` · `<kbd>` · `<img>` · `<div>` · `<span>` · `<table>` · `<a>` · `<sup>` · `<sub>` · HTML comment `<!-- -->` — **tất cả đều 0 lần**.

### 11.3 ⚠ "Thẻ giả" — thực ra là văn bản chỗ trống

Những chuỗi sau **trông giống thẻ HTML** nhưng là **placeholder trong văn bản**, phải được escape và hiển thị nguyên văn, **tuyệt đối không được coi là HTML**:

| Chuỗi | Số lần | Ví dụ thật |
|---|---:|---|
| `<timestamp>` | 9 | `docs/10-issues/ISSUE-035.md:16` — `` `supabase/migrations/<timestamp>_profiles.sql` `` |
| `<module>` | 1 | `docs/04-business-rules/business-rules.md:7` — ``**Quy ước ID:** `BR-<MODULE>-<số>` — ví dụ `BR-SPEC-11`…`` |
| `<type>` `<side>` `<index>` | 1 mỗi cái | `docs/10-issues/ISSUE-013.md:20` — `` ghi `<type><side>@<index>`, nối lại `` |
| `<T>` | 1 | `docs/10-issues/ISSUE-084.md:23` — `` Envelope phản hồi thống nhất: `ApiResult<T>` `` |

Cả 6 chuỗi này đều nằm **bên trong code inline**, nên nếu renderer xử lý code inline trước HTML thì tự động an toàn. Nhưng nếu quét HTML trước, chúng sẽ **biến mất khỏi trang**.

---

## 12. KÝ TỰ ĐẶC BIỆT CẦN ESCAPE (`<`, `>`, `&`)

| Vị trí | `<` | `>` | `&` | Tổng |
|---|---:|---:|---:|---:|
| Trong **văn bản thường** | 35 | 23 | 13 | 71 |
| Trong **code inline** | 21 | 24 | 1 | 46 |
| Trong **code fence** | 34 | 43 | 8 | 85 |
| **Tổng** | 90 | 90 | 22 | **202** |

`<` và `>` trong văn bản thường trải trên 14–15 file; `&` trên 9 file.

### Ví dụ thật — dấu `<` `>` là toán tử so sánh

| Ví dụ nguyên văn | Vị trí |
|---|---|
| `\| Xử lý lệnh (p95) \| < 100 ms \|` | `docs/00-overview/scope.md:139` |
| `\| Trọn vòng client→server→client \| < 500 ms khi độ trễ mạng < 100 ms \|` | `docs/00-overview/scope.md:140` |
| `\| 5 \| **Media**: phải **đo luồng dữ liệu thật** (byte RTP > 0), ⛔ không assert object tự tạo \|` | `AGENTS.md:181` |
| `\| **AC-SPEC-15** \| Mất mạng < 15 giây giữ ghế; > 15 giây mất ghế \| Ngắt kết nối thật \|` | `docs/01-requirements/REQ-SPECTATOR.md:332` |

### Ví dụ thật — dấu `&`

| Ví dụ nguyên văn | Vị trí |
|---|---|
| `## 📜 GIẤY PHÉP & GHI CHÚ` | `README.md:162` |
| `# BA AUDIT VÒNG 2 — COMPLETENESS & CONSISTENCY` | `docs/08-ba-review/final-audit.md:1` |
| `\| Trạng thái \| UI bên đến lượt \| UI đối thủ & người xem \|` | `docs/01-requirements/REQ-INACTIVITY.md:233` |

### Ví dụ thật — `<` `>` là placeholder trong code inline

| Ví dụ nguyên văn | Vị trí |
|---|---|
| `` \| Commit \| `<loại>(<phạm vi>): <mô tả> [ISSUE-NNN]` \| `` | `AGENTS.md:154` |
| `` **Quy ước ID:** `BR-<MODULE>-<số>` `` | `docs/04-business-rules/business-rules.md:7` |
| `` index sảnh `WHERE status<>'FINISHED'` `` | `docs/08-ba-review/initial-audit.md:210` |

### Ký tự Unicode khác cần chú ý (không cần escape nhưng cần font đúng)

Bộ tài liệu dùng dày đặc: `⇒ → ← ► ◄ ▼ ▲ ≠ ≤ ≥ ± ° · § ⭐ ⛔ ⚠ ✅ ❌ 🔴 🟢 ① ② ③ ④ ⑤ ┌ ─ ┐ │ └ ┘ ├ ┤ –  —`

Dấu `·` (U+00B7) được dùng làm **dấu phân tách giữa các ý trong một dòng** ở hầu hết file — ví dụ `AGENTS.md:3` — `**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-21`. Đây không phải cú pháp markdown, chỉ là ký tự thường.

---

## 13. NHỮNG ĐIỀU BẤT THƯỜNG PHÁT HIỆN ĐƯỢC

| # | Phát hiện | Ảnh hưởng tới renderer |
|---|---|---|
| 1 | 11 code fence mở **cùng dòng với số thứ tự** (`1. ```ts`) trong `docs/10-issues/` | **Cao** — parser ngây thơ sẽ lệch trạng thái fence cho phần còn lại của file |
| 2 | 97 code fence **thụt 3 dấu cách** bên trong list item | **Cao** — phải bỏ đúng 3 dấu cách thụt lề ở mọi dòng trong fence, nếu không sơ đồ ASCII lệch |
| 3 | `docs/08-ba-review/open-questions.md` có **8 H1** thay vì 1 | Trung bình — mục lục thiếu phần |
| 4 | Dòng `- [x]` duy nhất nằm **trong** ```` ```markdown ```` (`WORKFLOW.md:98`) | Thấp — chỉ cần fence được nhận đúng |
| 5 | 2 link `http` duy nhất đều nằm trong code fence (dòng attribution commit) | Thấp |
| 6 | 37 link trỏ tới **thư mục**, không phải file | Trung bình — cần trang chỉ mục thư mục |
| 7 | 173/270 fence là **sơ đồ ASCII**, không phải mã | Cao — tô màu cú pháp sẽ làm hỏng sơ đồ; fence không có ngôn ngữ thì **không** nên tô màu |
| 8 | Thụt lề danh sách lồng là **3 dấu cách**, không phải 2/4 | Trung bình |
| 9 | Placeholder `<timestamp>` `<T>` `<MODULE>`… trông như thẻ HTML | Cao nếu xử lý HTML trước code inline |

---

## 14. THỨ TỰ XỬ LÝ ĐỀ XUẤT CHO RENDERER

1. Tách code fence **trước tiên** — nhận dạng cả 3 dạng: cột 0, thụt lề, và sau dấu số thứ tự trên cùng dòng.
2. Trong fence: escape `< > &`, giữ nguyên khoảng trắng, **không** tô màu nếu không khai báo ngôn ngữ.
3. Ngoài fence: tách khối (heading → `---` → bảng → blockquote → danh sách/checkbox → đoạn văn).
4. Trong mỗi khối, chạy inline-parser theo thứ tự: **code inline → link → `**đậm**` → `*nghiêng*`**, và escape `< > &` cho phần còn lại.
5. `<details>` / `<summary>` để nguyên, nhưng **vẫn parse markdown bên trong**.

**Không cần cài đặt:** ảnh, link neo, `~~gạch~~`, `***đậm nghiêng***`, `_nghiêng_`, `<br>`, `\|`, `~~~`, footnote, link tham chiếu, heading Setext, blockquote lồng, danh sách số lồng, delimiter nhiều backtick, HTML comment.

---

*Báo cáo sinh tự động từ script quét 199 file. Mọi con số là đếm thật, không ước lượng.*
