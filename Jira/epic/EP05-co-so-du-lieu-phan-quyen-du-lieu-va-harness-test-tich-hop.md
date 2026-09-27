# EP05 · Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp

> **Loại:** Epic · **Story:** [ST05.1](../story/ST05.1-migration-ho-so-ban-be-phong-loi-moi-van-va-cay-nuoc-di.md), [ST05.2](../story/ST05.2-migration-chat-media-ai-phien-rls.md), [ST05.3](../story/ST05.3-harness-test-tich-hop-that-prisma-db-pull-pool-sql.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP05 · Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp` |
| Components | Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep05`, `critical-path` |
| Fix versions | `v0.2.0` |
| Start date / Due date | 2026-09-30 / 2026-10-05 |
| Nguồn đặc tả | ISSUE-035 … ISSUE-045 |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm DB ⇒ [Sổ tay kiểm thử §15](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Toàn bộ **cơ sở dữ liệu** của sản phẩm trên Supabase PostgreSQL:
- Schema viết bằng **file `.sql` migration** (Supabase CLI) — có CHECK, UNIQUE, FK, **unique hoãn kiểm**, index có điều kiện.
- **RLS chặn mặc định** trên mọi bảng; trình duyệt **không** đọc/ghi thẳng; máy chủ dùng vai trò `app_server`.
- **Harness test tích hợp** chạy trên PostgreSQL + Supabase Auth **thật**.
- Prisma **chỉ** `db pull` để sinh kiểu; SQL thuần + `withTransaction` cho thao tác cần khoá.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- **R06**: máy chủ quyết định, lưu bền vững, chống trùng lệnh.
- Nhiều lỗi lần trước sinh ra từ DB/test: `F-01` (UNIQUE ply ⇒ 500 sau đi lại), `F-11` (test tích hợp luôn bị skip), `F-12` (test tự mock DB).
- Đặt ràng buộc ở tầng DB ⇒ code có lỗi thì dữ liệu sai vẫn không ghi được.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Migration** | File `.sql` đổi schema; áp bằng `pnpm db:reset` |
| **Mã SQLSTATE** | `23514` CHECK · `23505` UNIQUE · `23503` FK · `42501` không có quyền |
| **RLS** | Luật đọc/ghi theo dòng; bật mà không policy ⇒ cấm mặc định |
| **Unique hoãn kiểm** | Kiểm lúc COMMIT ⇒ đổi bên trong 1 transaction được |
| **Cây nước đi** | Nước trỏ về cha; đi lại không xoá; không UNIQUE ply |
| **Ranh giới Prisma / SQL thuần** | Cần khoá dòng / thứ tự khoá / đếm rồi ghi ⇒ SQL thuần |

## 4. PHẠM VI

**✅ LÀM:** mọi bảng (hồ sơ, bạn bè, phòng, lời mời, ván, cây nước đi, biên lai, đề nghị, chat, media, AI, phiên); RLS + `app_server` + hàm kiểm phiên; harness test tích hợp; Prisma `db pull` + pool `pg` + `withTransaction`.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Logic nghiệp vụ trên các bảng | EP06 trở đi |
| DB trên cloud | EP16 |
| `prisma migrate` | ⛔ Cấm vĩnh viễn |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| ⛔ Không `prisma migrate` | Nó xoá RLS, CHECK, unique hoãn kiểm. Đổi schema **chỉ** bằng `supabase/migrations/<timestamp>_<tên>.sql` |
| Test trên PostgreSQL thật | Thiếu DB ⇒ đỏ, không skip. Kiểm lỗi bằng mã SQLSTATE |
| Không test quyền bằng superuser | Superuser che mọi lỗi phân quyền |
| Thứ tự khoá toàn hệ thống | **phòng → người → ván** (ghi chú trong migration) |
| Bảng mới về sau | **Phải** bật RLS + policy `app_server` trong cùng migration |

## 6. ĐẦU VÀO

EP01: Supabase local, lane integration tối thiểu, `ConfigService` (TK01.2.2, TK01.2.3).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST05.1](../story/ST05.1-migration-ho-so-ban-be-phong-loi-moi-van-va-cay-nuoc-di.md) | Migration hồ sơ, bạn bè, phòng, lời mời, ván và cây nước đi | 1 | 3 |
| [ST05.2](../story/ST05.2-migration-chat-media-ai-phien-rls.md) | Migration chat, media, AI, phiên + RLS | 2 | 5 |
| [ST05.3](../story/ST05.3-harness-test-tich-hop-that-prisma-db-pull-pool-sql.md) | Harness test tích hợp thật + Prisma db pull + pool SQL | 2 | 2 |

```
TK05.1.1 ─► TK05.1.2 ─► TK05.1.3 ─┬─► TK05.2.1 ─┐
                                   └─► TK05.2.2 ─┴─► TK05.2.3 ═(Done)═┬─► TK05.3.1
                                                                      └─► TK05.3.2
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 3 Story Done, mọi Task có báo cáo.
- [ ] `pnpm db:reset` từ DB sạch áp toàn bộ migration không lỗi.
- [ ] 100% bảng `public` bật RLS; `anon` và `authenticated` không đọc/ghi được bảng nào (kiểm qua REST thật).
- [ ] Harness đỏ khi tắt DB; `pnpm prisma:migrate` bị chặn.

## 9. KỊCH BẢN DEMO (~10 phút)

1. `pnpm db:reset` → mở Studio, xem danh sách bảng và cột RLS.
2. `psql`: thử insert username `Alice` ⇒ `23514`; đổi bên 2 người chơi trong 1 transaction ⇒ thành công.
3. `curl` REST bằng khoá publishable ⇒ không lấy được dữ liệu.
4. Tắt DB ⇒ `pnpm test:integration` đỏ; bật lại ⇒ xanh.

## 10. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Ai đó chạy `prisma migrate` | Trung bình | Rất cao | Script chặn; review PR; ghi đậm ở mọi Task |
| Migration xung đột khi 2 người cùng tạo | Cao | Trung bình | Tên file có timestamp; kéo `main` trước khi tạo migration; `pnpm db:reset` sau mỗi lần pull |
| Quên bật RLS cho bảng mới ở Epic sau | Trung bình | Cao | Luật mục 5 + test TK05.2.3 đếm 100% bảng chạy trong CI |
| Test chậm do seed user thật | Trung bình | Thấp | Seed một lần mỗi file test; `runId` để chạy song song |
