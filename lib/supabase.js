import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local')
}

// ตรวจสอบว่ายังใช้ค่า Default หรือไม่
if (supabaseUrl.includes('your-project-id')) {
  throw new Error('คุณยังไม่ได้ระบุ URL ของ Supabase จริงๆ ในไฟล์ .env.local (ยังเป็น your-project-id อยู่)')
}

// ตรวจสอบและเติม https:// หาก URL ไม่ได้ขึ้นต้นด้วย http
if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`
}

console.log('Supabase URL:', supabaseUrl) // เช็ค URL ใน Console (F12) ว่าถูกต้องหรือไม่

export const supabase = createClient(supabaseUrl, supabaseAnonKey)