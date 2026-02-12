-- แก้ไข RLS Policy สำหรับ pricing_packages

-- 1. เปิด RLS
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;

-- 2. ลบ policy เดิมถ้ามี
DROP POLICY IF EXISTS "Allow all" ON pricing_packages;
DROP POLICY IF EXISTS "Allow read" ON pricing_packages;
DROP POLICY IF EXISTS "Allow insert" ON pricing_packages;
DROP POLICY IF EXISTS "Allow update" ON pricing_packages;
DROP POLICY IF EXISTS "Allow delete" ON pricing_packages;

-- 3. สร้าง policy ใหม่ที่อนุญาตทุก operation
CREATE POLICY "Allow all operations" ON pricing_packages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. ตรวจสอบโครงสร้างตาราง
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pricing_packages';

-- 5. ดูข้อมูลทั้งหมด
SELECT * FROM pricing_packages ORDER BY "order";
