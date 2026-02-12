-- 1. เพิ่มคอลัมน์ is_active ถ้ายังไม่มี
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE service_addons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. เปิด RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;

-- 3. ลบ Policy เก่าที่อาจจะผิดพลาด
DROP POLICY IF EXISTS "Allow all" ON promotions;
DROP POLICY IF EXISTS "Allow all operations" ON promotions;
DROP POLICY IF EXISTS "Allow read" ON promotions;
DROP POLICY IF EXISTS "Allow insert" ON promotions;
DROP POLICY IF EXISTS "Allow update" ON promotions;
DROP POLICY IF EXISTS "Allow delete" ON promotions;

DROP POLICY IF EXISTS "Allow all" ON service_addons;
DROP POLICY IF EXISTS "Allow all operations" ON service_addons;

-- 4. สร้าง Policy ใหม่ที่อนุญาตทุกอย่าง (สำหรับแก้ไขปัญหาก่อน)
CREATE POLICY "Allow all operations" ON promotions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON service_addons
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. ตรวจสอบข้อมูล
SELECT * FROM promotions;
