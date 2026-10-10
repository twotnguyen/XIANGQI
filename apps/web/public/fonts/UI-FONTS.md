# Phông UI tự host

Nguồn: [Google Fonts](https://github.com/google/fonts/tree/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl), commit `bd8f81ddb5c74d5c8897b36ad88b440266245103`.

- `plus-jakarta-sans.woff2`: Plus Jakarta Sans variable, giới hạn weight400–600; subset Latin U+0020–024F, Latin Extended Additional U+1E00–1EFF, punctuation U+2000–206F và đồng U+20AB. Bản gốc [PlusJakartaSans[wght].ttf](https://github.com/google/fonts/blob/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf). OFL1.1, không khai Reserved Font Name; giữ internal family name. Giấy phép nguyên văn: `OFL-PlusJakartaSans.txt`.
- `playfair-display.ttf`: bản upstream [PlayfairDisplay[wght].ttf](https://github.com/google/fonts/blob/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf) nguyên byte, không subset/đổi format. OFL1.1 có Reserved Font Name “Playfair Display”; giữ nguyên font. Giấy phép nguyên văn: `OFL-PlayfairDisplay.txt`.

Cả hai cmap đã kiểm đủ A–Z/a–z/số, ĐđĂăÂâÊêÔôƠơƯư và toàn bộ U+1EA0–1EF9 (ký tự tiếng Việt có dấu). Không gọi CDN runtime. Plus Jakarta được xử lý bằng fonttools4.66.1/Brotli1.2.0 trong môi trường build font tạm; ứng dụng không cần hai công cụ này khi chạy. Font chữ Hán và giấy phép riêng giữ nguyên theo `README.md`.
