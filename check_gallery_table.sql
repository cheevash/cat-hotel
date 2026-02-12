-- เช็คโครงสร้างตาราง gallery ที่มีอยู่
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery';
