BEGIN;
-- Bỏ bảng chỉ làm mất bảo đảm không cấp lại mã; không ảnh hưởng phòng đang mở.
DROP TABLE xiangqi_room.issued_codes;
COMMIT;
