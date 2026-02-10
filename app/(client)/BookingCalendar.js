'use client'
import React, { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, startOfDay, isBefore
} from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// เปลี่ยนตรงนี้: นำเข้า supabase จากไฟล์ config ของคุณ (น่าจะอยู่ใน lib/supabase.js หรือที่ใกล้เคียง)
import { supabase } from '@/lib/supabase'

export default function BookingCalendar() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState([])
  const [totalRooms, setTotalRooms] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  async function fetchData() {
    setLoading(true)

    // 1. ดึงจำนวนห้องทั้งหมด
    const { count: roomsCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
    setTotalRooms(roomsCount || 0)

    // 2. ดึงข้อมูลการจองของเดือนนี้
    const start = startOfMonth(currentMonth).toISOString()
    const end = endOfMonth(currentMonth).toISOString()

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      // กรองเฉพาะที่ยืนยันแล้ว (Confirmed) เท่านั้น
      .eq('status', 'Confirmed')
      // กรองเฉพาะที่ทับซ้อนกับเดือนที่แสดงอยู่
      .or(`check_in_date.lte.${end},check_out_date.gte.${start}`)

    setBookings(bookingsData || [])
    setLoading(false)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // ฟังก์ชันคำนวณห้องว่างในแต่ละวัน
  const getDayStatus = (day) => {
    const targetDate = startOfDay(day)
    const bookedCount = bookings.filter(b => {
      const checkIn = startOfDay(new Date(b.check_in_date))
      const checkOut = startOfDay(new Date(b.check_out_date))
      // แมวพักอยู่ในช่วงเช็คอิน ถึงก่อนวันเช็คเอาท์
      return targetDate >= checkIn && targetDate < checkOut
    }).length

    const available = totalRooms - bookedCount
    let statusColor = '#22c55e' // เขียว (ว่าง)
    let label = `ว่าง ${available}`

    if (available <= 0) {
      statusColor = '#ef4444' // แดง (เต็ม)
      label = 'เต็ม'
    } else if (available <= 2) {
      statusColor = '#f59e0b' // ส้ม (ใกล้เต็ม)
    }

    return { available, statusColor, label }
  }

  const handleDayClick = (day, available) => {
    // 1. ป้องกันการกดวันที่ผ่านมาแล้ว
    if (isBefore(day, startOfDay(new Date()))) return

    // 2. ถ้าห้องเต็ม ให้แจ้งเตือน
    if (available <= 0) {
      alert('ขออภัย วันนี้ห้องเต็มแล้วครับ')
      return
    }

    // 3. ถ้าว่าง ให้ไปหน้าจอง
    router.push(`/rooms?checkIn=${format(day, 'yyyy-MM-dd')}`)
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={navBtn}><ChevronLeft size={20} /></button>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: th })}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={navBtn}><ChevronRight size={20} /></button>
      </div>

      <div style={gridStyle}>
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
          <div key={d} style={dayHeaderStyle}>{d}</div>
        ))}

        {days.map((day, i) => {
          const { statusColor, label, available } = getDayStatus(day)
          const isPast = isBefore(day, startOfDay(new Date()))
          const isClickable = !isPast // ยอมให้คลิกได้แม้ห้องเต็ม (เพื่อแสดง Alert)

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day, available)}
              style={{
                ...dayCellStyle,
                opacity: loading || isPast ? 0.5 : 1,
                cursor: isClickable ? 'pointer' : 'default',
                backgroundColor: isClickable ? '#fff' : '#fafafa'
              }}
            >
              <span style={dayNumStyle}>{format(day, 'd')}</span>
              <div style={{ ...statusBadge, backgroundColor: statusColor }}>
                {loading ? '...' : label}
              </div>
            </div>
          )
        })}
      </div>

      <div style={legendStyle}>
        <div style={legendItem}><span style={{ ...dot, backgroundColor: '#22c55e' }}></span> ว่างเยอะ</div>
        <div style={legendItem}><span style={{ ...dot, backgroundColor: '#f59e0b' }}></span> ใกล้เต็ม</div>
        <div style={legendItem}><span style={{ ...dot, backgroundColor: '#ef4444' }}></span> เต็มแล้ว</div>
      </div>
    </div>
  )
}

// --- Styles (CSS-in-JS) ---
const containerStyle = { maxWidth: '500px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const navBtn = { background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', padding: '5px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' };
const dayHeaderStyle = { textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#888', paddingBottom: '10px' };
const dayCellStyle = { border: '1px solid #f0f0f0', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', minHeight: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' };
const dayNumStyle = { fontSize: '0.9rem', fontWeight: '600', color: '#444' };
const statusBadge = { fontSize: '0.65rem', color: '#white', padding: '2px 6px', borderRadius: '4px', width: '90%', color: '#fff', fontWeight: 'bold' };
const legendStyle = { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontSize: '0.8rem', color: '#666' };
const legendItem = { display: 'flex', alignItems: 'center', gap: '5px' };
const dot = { width: '8px', height: '8px', borderRadius: '50%' };