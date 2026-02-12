-- ถ้าตารางมีอยู่แล้ว ให้เช็คและเพิ่มคอลัมน์ที่ขาด (ถ้ามี)

-- เพิ่มคอลัมน์ caption ถ้ายังไม่มี
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS caption TEXT;

-- เพิ่มคอลัมน์ category ถ้ายังไม่มี (default: 'อื่นๆ')
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'อื่นๆ';

-- เพิ่มคอลัมน์ image_url ถ้ายังไม่มี
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- เช็คผลลัพธ์
SELECT * FROM gallery LIMIT 5;
