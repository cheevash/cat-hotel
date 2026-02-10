'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'

function BookingForm() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const initialCheckIn = searchParams.get('checkIn') || '' // รับวันที่จากปฏิทิน
  const router = useRouter()

  const [room, setRoom] = useState(null)
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [checkIn, setCheckIn] = useState(initialCheckIn) // ใช้วันที่จาก URL เป็นค่าเริ่มต้น
  const [checkOut, setCheckOut] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) {
        router.push('/rooms')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนจอง')
        router.push('/login')
        return
      }

      // 1. ดึงข้อมูลห้องเพื่อเอาราคามาคำนวณ
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single()
      setRoom(roomData)

      // 2. ดึงข้อมูลแมวของลูกค้า
      const { data: catData } = await supabase.from('cats').select('*').eq('owner_id', user.id)

      setCats(catData || [])
    }
    fetchData()
  }, [roomId])

  // คำนวณราคาสุทธิเมื่อวันที่เปลี่ยน
  useEffect(() => {
    if (checkIn && checkOut && room) {
      const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
      setTotalPrice(diffDays * Number(room.price_per_night)) // แปลงราคาเป็นตัวเลขก่อนคำนวณ
    }
  }, [checkIn, checkOut, room])

  const handleBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // ส่งข้อมูลให้ตรงกับชื่อคอลัมน์ใน SQL ของคุณ
    const { error } = await supabase.from('bookings').insert([{
      user_id: user.id,
      room_id: roomId,
      cat_id: selectedCat,
      check_in_date: checkIn,      // ปรับตาม SQL คุณ
      check_out_date: checkOut,    // ปรับตาม SQL คุณ
      total_price: totalPrice,     // ปรับตาม SQL คุณ
      status: 'Pending',           // ปรับตาม SQL คุณ
      payment_status: 'Unpaid'     // ปรับตาม SQL คุณ
    }])

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('จองห้องพักสำเร็จ! กรุณารอแอดมินยืนยัน')
      router.push('/my-bookings')
    }
    setLoading(false)
  }

  if (!room) return <p style={{ padding: '20px' }}>กำลังโหลดข้อมูลห้อง...</p>

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: '#ea580c' }}>จองห้อง: {room.room_type} ({room.room_number})</h2>
        <p>ราคาต่อคืน: {room.price_per_night} บาท</p>

        <form onSubmit={handleBooking} style={styles.form}>
          <label>เลือกน้องแมวที่จะเข้าพัก:</label>
          <select style={styles.input} value={selectedCat} onChange={e => setSelectedCat(e.target.value)} required>
            <option value="">-- เลือกแมวของคุณ --</option>
            {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <label>วันที่เช็คอิน:</label>
          <input type="date" style={styles.input} value={checkIn} onChange={e => setCheckIn(e.target.value)} required />

          <label>วันที่เช็คเอาท์:</label>
          <input type="date" style={styles.input} value={checkOut} onChange={e => setCheckOut(e.target.value)} required />

          <div style={styles.priceBox}>
            <p>ราคาสุทธิ: <strong>{totalPrice.toLocaleString()} บาท</strong></p>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading || !selectedCat}>
            {loading ? 'กำลังบันทึกการจอง...' : 'ยืนยันจองห้องพัก'}
          </button>
        </form>
      </div>
    </div>
  )
}

// แนะนำให้ใส่ Suspense ครอบเพื่อป้องกัน Error จากการใช้ useSearchParams ใน Next.js
export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  )
}

const styles = {
  container: { padding: '40px', display: 'flex', justifyContent: 'center', fontFamily: "'Kanit', sans-serif", backgroundColor: '#fff7ed', minHeight: '100vh' },
  card: { padding: '30px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px' },
  priceBox: { padding: '15px', backgroundColor: '#fff7ed', borderRadius: '10px', textAlign: 'center', fontSize: '1.2rem', color: '#ea580c' },
  submitBtn: { padding: '15px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }
}