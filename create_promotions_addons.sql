-- สร้างตารางสำหรับโปรโมชั่น
CREATE TABLE IF NOT EXISTS promotions (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT DEFAULT '🎁',
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตารางสำหรับบริการเสริม
CREATE TABLE IF NOT EXISTS service_addons (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT DEFAULT '🛎️',
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  "order" INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิด RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;

-- สร้าง policy
CREATE POLICY "Allow all" ON promotions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON service_addons FOR ALL USING (true) WITH CHECK (true);

-- เพิ่มข้อมูลเริ่มต้นสำหรับ promotions
INSERT INTO promotions (icon, name, description, "order") VALUES
  ('📅', 'จอง 7 คืน ลด 10%', 'พักนานคุ้มกว่า! สำหรับทุกประเภทห้อง', 1),
  ('🐱🐱', 'นำแมวมา 2 ตัว ลด 15%', 'มาเป็นคู่ สุขคูณสอง พักห้องเดียวกันได้', 2),
  ('🎂', 'เดือนเกิดน้องแมว ลด 20%', 'แจ้งวันเกิดน้องรับส่วนลดพิเศษ!', 3),
  ('🔄', 'ลูกค้าประจำ ลด 10%', 'สำหรับลูกค้าที่เคยใช้บริการครบ 3 ครั้ง', 4);

-- เพิ่มข้อมูลเริ่มต้นสำหรับ service_addons
INSERT INTO service_addons (icon, name, price, "order") VALUES
  ('🛁', 'อาบน้ำ + ตัดเล็บ', '250 - 450 บาท', 1),
  ('✂️', 'ตัดขน', '350 - 650 บาท', 2),
  ('🚗', 'รับ-ส่งถึงบ้าน', 'เริ่มต้น 200 บาท', 3),
  ('🍽️', 'อาหาร Premium', '+100 บาท/วัน', 4);

-- ดูผลลัพธ์
SELECT * FROM promotions ORDER BY "order";
SELECT * FROM service_addons ORDER BY "order";
