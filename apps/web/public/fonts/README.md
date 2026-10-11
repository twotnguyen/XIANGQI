# XQ Han

`xq-han.woff2` là bản cắt và đổi tên từ **Noto Serif TC**, trọng lượng 600, dùng cho quân cờ và chữ sông. Có 18 ký tự `帥仕相俥傌炮兵將士象車馬砲卒楚河漢界`; không dùng bản cắt này cho văn bản khác.

- Nguồn chính thức: [google/fonts — Noto Serif TC](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoseriftc), file `NotoSerifTC[wght].ttf`.
- Giấy phép: **SIL Open Font License 1.1**, toàn văn và thông báo bản quyền trong [OFL-NotoSerifTC.txt](OFL-NotoSerifTC.txt). Bản chỉnh sửa đặt tên **XQ Han**; không bán riêng font.
- SHA256 nguồn: `0077e18f57c6908f4a000969880940bdb0dad057c0e8d98b49dc364c3d1b09c6`.
- SHA256 bản cắt: `18dea3a97f3b50924652ad45080b743a8abce7c70cad4d8af2ea882b20533ad4`; kích thước 5344 bytes.
- Công cụ tạo: fonttools 4.66.1, brotli 1.2.0. Cắt 18 ký tự, instantiate trục `wght=600`, đổi name IDs 1/16 thành XQ Han, 4 thành XQ Han SemiBold, 2/17 thành SemiBold, 6 thành XQHan-SemiBold, xuất WOFF2. Giữ bảng tên bản quyền và giấy phép.
- Phục vụ từ `/fonts/xq-han.woff2` qua `@font-face` trong CSS component. Không gọi Google Fonts/CDN trong runtime; cần giữ font và giấy phép khi phân phối ứng dụng.
