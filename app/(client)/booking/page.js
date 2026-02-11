'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

function BookingForm() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const initialCheckIn = searchParams.get('checkIn') || ''
  const router = useRouter()

  const [room, setRoom] = useState(null)
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) {
        router.push('/rooms')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        Swal.fire('กรุณาเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบก่อนจองห้องพัก', 'warning')
        router.push(`/login?redirect=/booking?room=${roomId}`)
        return
      }

      const { data: roomData, error: roomError } = await supabase.from('rooms').select('*').eq('id', roomId).single()

      if (roomError) {
        console.error(roomError)
        Swal.fire('ไม่พบข้อมูล', 'ไม่พบข้อมูลห้องพัก', 'error')
        router.push('/rooms')
        return
      }
      setRoom(roomData)

      const { data: catData } = await supabase.from('cats').select('*').eq('owner_id', user.id)
      setCats(catData || [])

      setFetching(false)
    }
    fetchData()
  }, [roomId])

  useEffect(() => {
    if (checkIn && checkOut && room) {
      const start = new Date(checkIn)
      const end = new Date(checkOut)

      if (end <= start) {
        setTotalDays(0)
        setTotalPrice(0)
        return
      }

      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      setTotalDays(diffDays)
      setTotalPrice(diffDays * Number(room.price_per_night))
    } else {
      setTotalDays(0)
      setTotalPrice(0)
    }
  }, [checkIn, checkOut, room])

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!selectedCat) {
      Swal.fire('ลืมเลือกแมว?', 'กรุณาเลือกน้องแมวที่จะเข้าพัก', 'warning')
      return
    }
    if (totalDays <= 0) {
      Swal.fire('วันที่ไม่ถูกต้อง', 'กรุณาเลือกวันที่ให้ถูกต้อง', 'warning')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('bookings').insert([{
      user_id: user.id,
      room_id: roomId,
      cat_id: selectedCat,
      check_in_date: checkIn,
      check_out_date: checkOut,
      total_price: totalPrice,
      status: 'Pending',
      payment_status: 'Unpaid'
    }])

    if (error) {
      Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
    } else {
      Swal.fire({
        title: 'จองห้องพักสำเร็จ! 🎉',
        text: 'กรุณารอการยืนยันจากแอดมิน',
        icon: 'success',
        confirmButtonText: 'รับทราบ',
        timer: 2000
      }).then(() => {
        router.push('/my-bookings')
      })
    }
    setLoading(false)
  }

  const getRoomImage = () => {
    if (room?.images && room.images.length > 0) return room.images[0]
    if (room?.image_url) return room.image_url
    return 'https://placehold.co/600x400?text=Room+Image'
  }

  if (fetching) return <div style={styles.loading}>กำลังโหลด...</div>
  if (!room) return null

  return (
    <div style={styles.page}>
      <div style={styles.bgOverlay}></div>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <Link href={`/rooms/${roomId}`} style={styles.backLink}>
            <span style={styles.backIcon}>←</span> ยกเลิกและกลับไปเลือกห้อง
          </Link>
          <h1 style={styles.title}>Booking Reservation</h1>
          <p style={styles.subtitle}>กรอกข้อมูลการเข้าพักสำหรับน้องแมวของคุณ</p>
        </div>

        <div style={styles.layout}>
          {/* Left Column: Form */}
          <div style={styles.mainContent}>
            <form onSubmit={handleBooking} style={styles.form}>

              {/* Section 1: Dates */}
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <span style={styles.stepNum}>1</span> ระยะเวลาเข้าพัก
                </h2>
                <div style={styles.dateGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>วันที่เช็คอิน</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>วันที่เช็คเอาท์</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Cat Selection */}
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>
                    <span style={styles.stepNum}>2</span> ข้อมูลน้องแมว
                  </h2>
                  <Link href="/my-cats" style={styles.addCatBtn}>+ เพิ่มแมวใหม่</Link>
                </div>

                {cats.length > 0 ? (
                  <div style={styles.catGrid}>
                    {cats.map(cat => (
                      <div
                        key={cat.id}
                        style={{
                          ...styles.catCard,
                          ...(selectedCat === cat.id ? styles.catCardSelected : {})
                        }}
                        onClick={() => setSelectedCat(cat.id)}
                      >
                        <div style={styles.catAvatarWrapper}>
                          <img
                            src={cat.image_url || `https://ui-avatars.com/api/?name=${cat.name}&background=random`}
                            alt={cat.name}
                            style={styles.catAvatar}
                          />
                          {selectedCat === cat.id && (
                            <div style={styles.checkBadge}>✓</div>
                          )}
                        </div>
                        <h3 style={styles.catName}>{cat.name}</h3>
                        <p style={styles.catBreed}>{cat.breed || 'ไม่ระบุสายพันธุ์'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyCatState}>
                    <span style={{ fontSize: '3rem' }}>😿</span>
                    <p>คุณยังไม่ได้เพิ่มข้อมูลน้องแมว</p>
                    <Link href="/my-cats" style={styles.addCatLinkPrimary}>เพิ่มข้อมูลแมวตอนนี้</Link>
                  </div>
                )}
              </section>

              {/* Section 3: Special Request (Optional/Placeholder) */}
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <span style={styles.stepNum}>3</span> เพิ่มเติม (Optional)
                </h2>
                <textarea
                  style={styles.textarea}
                  placeholder="มีอะไรที่อยากบอกพี่เลี้ยงเป็นพิเศษไหม? (เช่น แพ้อาหาร, นิสัยพิเศษ)"
                  rows="3"
                ></textarea>
              </section>
            </form>
          </div>

          {/* Right Column: Sticky Summary */}
          <div style={styles.sidebar}>
            <div style={styles.summaryCard}>
              <div style={styles.roomPreview}>
                <img src={getRoomImage()} alt="Room" style={styles.roomImg} />
                <div style={styles.roomOverlay}>
                  <span style={styles.roomType}>{room.room_type}</span>
                </div>
              </div>

              <div style={styles.summaryBody}>
                <h3 style={styles.summaryTitle}>สรุปรายการจอง</h3>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>ห้องพัก</span>
                  <span style={styles.summaryValue}>ห้อง {room.room_number}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>ราคาต่อคืน</span>
                  <span style={styles.summaryValue}>{Number(room.price_per_night).toLocaleString()} ฿</span>
                </div>
                <div style={styles.divider}></div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>เช็คอิน</span>
                  <span style={styles.summaryValue}>{checkIn ? new Date(checkIn).toLocaleDateString('th-TH') : '-'}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>เช็คเอาท์</span>
                  <span style={styles.summaryValue}>{checkOut ? new Date(checkOut).toLocaleDateString('th-TH') : '-'}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>จำนวนคืน</span>
                  <span style={styles.summaryValue}>{totalDays} คืน</span>
                </div>

                <div style={styles.totalSection}>
                  <span style={styles.totalLabel}>ยอดชำระทั้งหมด</span>
                  <span style={styles.totalPrice}>{totalPrice.toLocaleString()} ฿</span>
                </div>

                <button
                  onClick={handleBooking}
                  style={{
                    ...styles.confirmBtn,
                    ...(loading || !selectedCat || totalDays <= 0 ? styles.disabledBtn : {})
                  }}
                  disabled={loading || !selectedCat || totalDays <= 0}
                >
                  {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
                </button>
                <p style={styles.toc}>
                  การกดจองถือว่ายอมรับ <a href="#" style={{ color: '#ea580c' }}>เงื่อนไขการเข้าพัก</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  )
}

const styles = {
  // Page Layout
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "'Kanit', sans-serif",
    position: 'relative',
    paddingBottom: '80px'
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '300px',
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    zIndex: 0
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 1
  },
  loading: { textAlign: 'center', padding: '50px', color: '#666' },

  // Header
  header: { padding: '40px 0', color: 'white' },
  backLink: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', transition: 'color 0.2s', cursor: 'pointer' },
  backIcon: { fontSize: '1.2rem' },
  title: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', fontWeight: '300' },

  // Layout Grid
  layout: { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '80px', alignItems: 'start' },

  // Forms
  mainContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0'
  }, sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '12px' },
  stepNum: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#ea580c', color: 'white', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' },

  // Date Inputs
  dateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.95rem', fontWeight: '600', color: '#4b5563' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', backgroundColor: '#f9fafb', outline: 'none', transition: 'all 0.2s' },

  // Cat Select
  addCatBtn: { color: '#ea580c', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', border: '1px solid #ea580c', padding: '6px 14px', borderRadius: '50px', transition: 'all 0.2s' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' },
  catCard: { border: '2px solid #e5e7eb', borderRadius: '16px', padding: '20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'white' },
  catCardSelected: { borderColor: '#ea580c', backgroundColor: '#fff7ed', transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(234, 88, 12, 0.1)' },
  catAvatarWrapper: { width: '80px', height: '80px', margin: '0 auto 12px', position: 'relative' },
  catAvatar: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  checkBadge: { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#ea580c', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: '2px solid white' },
  catName: { fontSize: '1rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px' },
  catBreed: { fontSize: '0.8rem', color: '#6b7280', margin: 0 },
  emptyCatState: { textAlign: 'center', padding: '30px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' },
  addCatLinkPrimary: { display: 'inline-block', marginTop: '10px', backgroundColor: '#ea580c', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: '600', fontSize: '0.9rem' },

  // Textarea
  textarea: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', backgroundColor: '#f9fafb', outline: 'none', resize: 'vertical', minHeight: '100px' },

  // Sidebar Summary
  sidebar: { position: 'sticky', top: '30px' },
  summaryCard: { backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  roomPreview: { position: 'relative', height: '180px' },
  roomImg: { width: '100%', height: '100%', objectFit: 'cover' },
  roomOverlay: { position: 'absolute', top: '15px', left: '15px' },
  roomType: { backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' },

  summaryBody: { padding: '25px' },
  summaryTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#1f2937', margin: '0 0 20px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: '#4b5563' },
  summaryLabel: { color: '#6b7280' },
  summaryValue: { fontWeight: '600', color: '#1f2937' },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: '15px 0' },

  totalSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '25px', paddingTop: '15px', borderTop: '2px dashed #e5e7eb' },
  totalLabel: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' },
  totalPrice: { fontSize: '1.8rem', fontWeight: '800', color: '#ea580c' },

  confirmBtn: { width: '100%', padding: '18px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(234, 88, 12, 0.3)' },
  disabledBtn: { backgroundColor: '#d1d5db', cursor: 'not-allowed', boxShadow: 'none' },
  toc: { textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', marginTop: '15px' },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  }
}