# TRANG TÀI LIỆU — HƯỚNG DẪN

Trang web tĩnh trình bày toàn bộ tài liệu dự án Cờ Tướng Online.

---

## 1. MỞ XEM

### Cách nhanh nhất — không cần cài gì

```bash
node site/build.mjs   # vừa clone repo lần đầu: phải chạy để có data/
```
Rồi double-click **`site/index.html`**. Xong.

Trang chạy được bằng `file://` vì toàn bộ tài liệu được **nhúng sẵn** vào `data/docs.js`.
(Trình duyệt chặn `fetch()` trên `file://`, nên không thể tải `.md` lúc chạy — đó là lý do phải nhúng.)

> `site/data/` **không được commit** — `.gitignore` đã loại. Mỗi lần clone mới hoặc sửa `.md` đều phải chạy `build.mjs` trước, nếu không trang sẽ trống.

### Nếu muốn chạy qua server

```bash
cd site && python3 -m http.server 8777
```
Rồi mở `http://127.0.0.1:8777`.

---

## 2. CẬP NHẬT KHI TÀI LIỆU THAY ĐỔI

⭐ **Sửa file `.md` trong `docs/` xong phải chạy lại lệnh này**, nếu không trang web vẫn hiện nội dung cũ:

```bash
node site/build.mjs
```

Lệnh này quét `docs/` + `README.md` + `AGENTS.md`, sinh lại 2 file:

| File | Nội dung |
|---|---|
| `site/data/docs.js` | 225 tài liệu chính (~2,9 MB) |
| `site/data/archive.js` | 102 tài liệu lưu trữ (~0,9 MB) — chỉ tải khi người dùng mở |

Thư mục `site/data/` nằm trong `.gitignore` nên **hai file này không bao giờ được commit** — sau mỗi lần clone phải chạy lại `build.mjs`.

⛔ **Đừng sửa tay 2 file trong `data/`** — chúng bị ghi đè mỗi lần build.

---

## 3. CÁCH DÙNG TRANG

| Thao tác | Cách làm |
|---|---|
| Tìm kiếm | <kbd>Ctrl</kbd>+<kbd>K</kbd> hoặc <kbd>/</kbd> |
| Tìm không dấu | Gõ `het nuoc di` vẫn ra "hết nước đi" |
| Tìm theo mã | Gõ thẳng `DEC-019`, `ISSUE-032`, `R17`, `TECH-07` |
| Chọn kết quả | <kbd>↑</kbd> <kbd>↓</kbd> rồi <kbd>Enter</kbd> |
| Đổi nền sáng/tối | Nút 🌙 góc phải |
| Lộ trình theo vai trò | Trang chủ → chọn thẻ vai trò của bạn |
| Đánh dấu đã đọc | Checkbox trong lộ trình, hoặc nút ở đầu mỗi tài liệu |
| In ra giấy / PDF | <kbd>Ctrl</kbd>+<kbd>P</kbd> — đã có kiểu in riêng, tự ẩn thanh bên |

**Tiến độ đọc** lưu trong trình duyệt của từng người (`localStorage`). Mỗi người có tiến độ riêng, không chia sẻ, không gửi đi đâu.

---

## 4. ĐƯA LÊN MẠNG

Đây là trang **tĩnh hoàn toàn** — không cần backend, không cần build phức tạp.

| Nơi | Cách |
|---|---|
| **Vercel** | Kéo thả thư mục `site/` vào vercel.com, hoặc `vercel --prod` trong `site/` |
| **Netlify** | Kéo thả thư mục `site/` vào netlify.com/drop |
| **GitHub Pages** | Push thư mục `site/` lên nhánh `gh-pages` |
| **Gửi cho người khác** | Nén cả thư mục `site/` thành `.zip` — giải nén, mở `index.html` là xem được |

⭐ Nhớ chạy `node site/build.mjs` **trước khi** đưa lên, để dữ liệu là bản mới nhất.

---

## 5. CẤU TRÚC

```
site/
├── index.html          khung trang
├── build.mjs           script gom tài liệu → data/
├── assets/
│   ├── app.css         giao diện, nền sáng/tối, kiểu in
│   ├── app.js          định tuyến · render markdown · tìm kiếm · lộ trình
│   └── marked.min.js   thư viện dựng markdown (MIT, nhúng sẵn để chạy offline)
├── data/               ⚙️ SINH TỰ ĐỘNG, KHÔNG COMMIT (gitignore)
│   ├── docs.js         toàn bộ tài liệu chính
│   └── archive.js      tài liệu lưu trữ, tải lazy
└── _analysis/          báo cáo kiểm định (không cần cho lúc chạy)
```

**Không dùng framework, không có bước biên dịch, không phụ thuộc mạng.**

---

## 6. LỘ TRÌNH ĐỌC ĐƯỢC ĐỊNH NGHĨA Ở ĐÂU

Sáu lộ trình vai trò nằm trong hằng số `ROLES` ở đầu file `assets/app.js`, khớp với [../docs/ONBOARDING.md](../docs/ONBOARDING.md).

Muốn sửa lộ trình: sửa **cả hai chỗ** cho khớp nhau — `ONBOARDING.md` là bản gốc để đọc, `app.js` là bản trang web dùng.

---

## 7. CÁC HẠN CHẾ ĐÃ BIẾT

| Hạn chế | Ghi chú |
|---|---|
| Tài liệu nhúng sẵn, không tự cập nhật | Phải chạy lại `build.mjs` sau khi sửa `.md` |
| Tiến độ đọc chỉ ở máy người dùng | Đổi trình duyệt hoặc xoá dữ liệu duyệt web là mất |
| Tải ~1,3 MB ở lần mở đầu | Đổi lại: chạy được offline, không cần server |
| `localStorage` có thể bị chặn ở chế độ riêng tư | Trang vẫn chạy, chỉ là không nhớ tiến độ |
