-- แก้ไข RLS สำหรับ promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON promotions;
CREATE POLICY "Allow all operations" ON promotions FOR ALL USING (true) WITH CHECK (true);

-- เช็คโครงสร้างตาราง promotions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'promotions';

-- ดูข้อมูลทั้งหมด
SELECT * FROM promotions ORDER BY "order";
