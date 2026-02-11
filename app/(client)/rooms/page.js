'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RoomsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>กำลังโหลด...</div>}>
      <RoomsContent />
    </Suspense>
  )
}

function RoomsContent() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const searchParams = useSearchParams()
  const checkInDate = searchParams.get('checkIn')

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true }) // Consistent ordering

      if (error) console.error(error)
      else {
        // Filter ห้องที่ว่าง (รองรับทั้ง boolean และ string)
        const availableRooms = (data || []).filter(room =>
          room.is_available === true || room.is_available === 'true'
        )
        setRooms(availableRooms)
      }
      setLoading(false)
    }
    fetchRooms()
  }, [])

  // รูปภาพตามประเภทห้อง (Fallback)
  const getRoomImage = (type) => {
    if (type?.toLowerCase()?.includes('vip')) {
      return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop'
    }
    if (type?.toLowerCase()?.includes('deluxe') || type?.toLowerCase()?.includes('suite')) {
      return 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=400&fit=crop'
    }
    return 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=600&h=400&fit=crop'
  }

  // Get primary image
  const getPrimaryImage = (room) => {
    if (room.images && room.images.length > 0) return room.images[0]
    if (room.image_url) return room.image_url
    return getRoomImage(room.room_type)
  }

  // Features ตามประเภทห้อง (Fallback or Merge)
  const getRoomFeatures = (room) => {
    // If amenities exist in DB, use them (limit to 3-4 for card)
    if (room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0) {
      return room.amenities.slice(0, 4).map(a => `✨ ${a}`)
    }

    // Fallback based on type
    const type = room.room_type
    if (type?.toLowerCase()?.includes('vip')) {
      return ['❄️ แอร์ HEPA', '📹 CCTV ส่วนตัว', '🎡 ของเล่น Premium', '👤 พี่เลี้ยงส่วนตัว']
    }
    if (type?.toLowerCase()?.includes('deluxe') || type?.toLowerCase()?.includes('suite')) {
      return ['❄️ แอร์ 24ชม.', '📹 CCTV ส่วนตัว', '🎡 ของเล่นชุดใหญ่']
    }
    return ['❄️ แอร์ 24ชม.', '📹 CCTV รวม', '🧶 ของเล่นพื้นฐาน']
  }

  // กรองห้อง
  const filteredRooms = filter === 'all'
    ? rooms
    : rooms.filter(r => r.room_type?.toLowerCase()?.includes(filter))

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingContent}>
          <span style={styles.loadingIcon}>🐱</span>
          <p style={styles.loadingText}>กำลังค้นหาห้องว่างให้น้องแมว...</p>
          <div style={styles.loadingDots}>
            <span>●</span><span>●</span><span>●</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
          <h1 style={styles.heroTitle}>🏨 เลือกห้องพัก</h1>
          <p style={styles.heroDesc}>พื้นที่ความสุขสำหรับเจ้านายของคุณ</p>
          {checkInDate && (
            <div style={styles.dateBadge}>
              📅 วันที่เช็คอิน: <strong>{new Date(checkInDate).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          )}
        </div>
      </section>

      {/* Filter & Stats */}
      <section style={styles.filterSection}>
        <div style={styles.container}>
          <div style={styles.filterRow}>
            <div style={styles.roomCount}>
              พบ <strong style={styles.countNumber}>{filteredRooms.length}</strong> ห้องว่าง
            </div>
            <div style={styles.filterButtons}>
              <button
                onClick={() => setFilter('all')}
                style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
              >ทั้งหมด</button>
              <button
                onClick={() => setFilter('standard')}
                style={filter === 'standard' ? styles.filterBtnActive : styles.filterBtn}
              >Standard</button>
              <button
                onClick={() => setFilter('deluxe')}
                style={filter === 'deluxe' ? styles.filterBtnActive : styles.filterBtn}
              >Deluxe</button>
              <button
                onClick={() => setFilter('vip')}
                style={filter === 'vip' ? styles.filterBtnActive : styles.filterBtn}
              >VIP</button>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section style={styles.roomsSection}>
        <div style={styles.container}>
          {filteredRooms.length > 0 ? (
            <div style={styles.grid}>
              {filteredRooms.map(room => {
                const isPopular = room.room_type?.toLowerCase()?.includes('deluxe')
                const isVIP = room.room_type?.toLowerCase()?.includes('vip')

                return (
                  <div key={room.id} style={{
                    ...styles.card,
                    ...(isPopular && styles.popularCard),
                    ...(isVIP && styles.vipCard)
                  }}>
                    {isPopular && <div style={styles.popularTag}>🔥 ยอดนิยม</div>}
                    {isVIP && <div style={styles.vipTag}>👑 VIP</div>}

                    {/* รูปภาพ */}
                    <div style={styles.imageWrapper}>
                      <img
                        src={getPrimaryImage(room)}
                        alt={room.room_type}
                        style={styles.roomImage}
                      />
                      <span style={styles.typeBadge}>{room.room_type}</span>
                    </div>

                    <div style={styles.cardBody}>
                      {/* หัวการ์ด */}
                      <div style={styles.cardHeader}>
                        <div>
                          <h3 style={styles.roomNumber}>ห้อง {room.room_number}</h3>
                          <p style={styles.roomDesc}>{room.description || 'ห้องพักสะดวกสบาย สะอาด ปลอดภัย'}</p>
                        </div>
                      </div>

                      {/* Specs */}
                      {(room.room_size || room.capacity) && (
                        <div style={styles.specsRow}>
                          {room.room_size && <span style={styles.specItem}>📏 {room.room_size}</span>}
                          {room.capacity && <span style={styles.specItem}>👥 {room.capacity}</span>}
                        </div>
                      )}

                      {/* ราคา */}
                      <div style={styles.priceSection}>
                        <div style={styles.priceTag}>
                          <span style={styles.priceAmount}>{Number(room.price_per_night).toLocaleString()}</span>
                          <span style={styles.priceUnit}>บาท/คืน</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div style={styles.features}>
                        {getRoomFeatures(room).map((feature, idx) => (
                          <span key={idx} style={styles.featureItem}>{feature}</span>
                        ))}
                      </div>

                      {/* ปุ่ม */}
                      <Link href={`/rooms/${room.id}${checkInDate ? `?checkIn=${checkInDate}` : ''}`}>
                        <button style={styles.bookBtn}>
                          ดูรายละเอียดและจอง 🐾
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={styles.noRoom}>
              <span style={styles.noRoomIcon}>😿</span>
              <h3 style={styles.noRoomTitle}>ไม่พบห้องว่าง</h3>
              <p style={styles.noRoomDesc}>
                {filter !== 'all'
                  ? 'ไม่มีห้องประเภทนี้ว่าง ลองเลือกประเภทอื่นดูนะคะ'
                  : 'ขออภัยค่ะ ขณะนี้ห้องพักเต็มทุกห้องแล้ว กรุณาลองอีกครั้งในภายหลัง'}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} style={styles.resetBtn}>ดูห้องทั้งหมด</button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>มีคำถาม? ติดต่อเราได้เลย!</h2>
          <p style={styles.ctaDesc}>ทีมงานพร้อมให้คำปรึกษาเรื่องห้องพักที่เหมาะกับน้องแมวของคุณ</p>
          <div style={styles.ctaBtns}>
            <a href="tel:0812345678" style={styles.ctaBtn}>📱 โทร 081-234-5678</a>
            <Link href="/contact" style={styles.ctaBtnOutline}>💬 ติดต่อเรา</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: { fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh' },

  // Loading
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  loadingContent: { textAlign: 'center' },
  loadingIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px', animation: 'pulse 2s infinite' },
  loadingText: { fontSize: '1.2rem', color: '#ea580c', marginBottom: '15px' },
  loadingDots: { display: 'flex', justifyContent: 'center', gap: '8px', color: '#ea580c', fontSize: '1.5rem' },

  // Hero
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '80px 20px 60px', position: 'relative', overflow: 'hidden' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(234, 88, 12, 0.1) 0%, transparent 60%)' },
  heroContent: { position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  backLink: { color: '#fbbf24', textDecoration: 'none', fontSize: '0.95rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', color: 'white', margin: '20px 0 10px' },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: '0 0 25px' },
  dateBadge: { display: 'inline-block', backgroundColor: 'rgba(234, 88, 12, 0.2)', border: '1px solid rgba(234, 88, 12, 0.5)', color: '#fbbf24', padding: '12px 25px', borderRadius: '50px', fontSize: '1rem' },

  // Filter
  filterSection: { backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 0' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  roomCount: { color: '#6b7280', fontSize: '1rem' },
  countNumber: { color: '#ea580c', fontSize: '1.5rem' },
  filterButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 20px', backgroundColor: '#f5f5f5', color: '#6b7280', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' },
  filterBtnActive: { padding: '10px 20px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' },

  // Rooms
  roomsSection: { padding: '50px 0 80px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', transition: 'all 0.3s', position: 'relative', border: '2px solid transparent' },
  popularCard: { border: '2px solid #ea580c' },
  vipCard: { border: '2px solid #fbbf24', boxShadow: '0 10px 40px rgba(251, 191, 36, 0.2)' },
  popularTag: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ea580c', color: 'white', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 10 },
  vipTag: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#fbbf24', color: '#1a1a2e', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 10 },
  imageWrapper: { position: 'relative', height: '220px', overflow: 'hidden' },
  roomImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  typeBadge: { position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold' },
  cardBody: { padding: '25px' },
  cardHeader: { marginBottom: '10px' },
  roomNumber: { fontSize: '1.4rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 5px' },
  roomDesc: { color: '#6b7280', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' },

  specsRow: { display: 'flex', gap: '12px', marginBottom: '15px', flexWrap: 'wrap' },
  specItem: { display: 'inline-block', fontSize: '0.85rem', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' },

  priceSection: { marginBottom: '15px' },
  priceTag: { display: 'flex', alignItems: 'baseline', gap: '5px' },
  priceAmount: { fontSize: '2rem', fontWeight: '800', color: '#ea580c' },
  priceUnit: { color: '#9ca3af', fontSize: '0.95rem' },
  features: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' },
  featureItem: { backgroundColor: '#f9fafb', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', color: '#4b5563', border: '1px solid #f0f0f0' },
  bookBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 20px rgba(234, 88, 12, 0.25)' },

  // No Room
  noRoom: { textAlign: 'center', padding: '80px 30px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' },
  noRoomIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px' },
  noRoomTitle: { fontSize: '1.5rem', color: '#1a1a2e', margin: '0 0 10px' },
  noRoomDesc: { color: '#6b7280', margin: '0 0 25px' },
  resetBtn: { padding: '14px 30px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },

  // CTA
  ctaSection: { backgroundColor: '#1a1a2e', padding: '80px 20px' },
  ctaContent: { maxWidth: '700px', margin: '0 auto', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', fontWeight: '700', color: 'white', margin: '0 0 12px' },
  ctaDesc: { color: 'rgba(255,255,255,0.8)', margin: '0 0 30px', fontSize: '1.1rem' },
  ctaBtns: { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' },
  ctaBtn: { padding: '16px 35px', backgroundColor: '#ea580c', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem' },
  ctaBtnOutline: { padding: '16px 35px', backgroundColor: 'transparent', color: 'white', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem' },
}