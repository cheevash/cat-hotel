'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RoomDetail() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkInDate = searchParams.get('checkIn')

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await supabase.from('rooms').select('*').eq('id', id).single()
      setRoom(data)
    }
    fetchRoom()
  }, [id])

  // รูปภาพตามประเภทห้อง
  const getRoomImage = (type) => {
    if (type?.toLowerCase().includes('vip')) {
      return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop'
    }
    if (type?.toLowerCase().includes('deluxe') || type?.toLowerCase().includes('suite')) {
      return 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop'
    }
    return 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800&h=600&fit=crop'
  }

  // Features ตามประเภทห้อง
  const getAmenities = (type) => {
    const base = [
      { icon: '❄️', name: 'แอร์ 24 ชม.', desc: 'ควบคุมอุณหภูมิอัตโนมัติ' },
      { icon: '🧼', name: 'ทำความสะอาด 2 ครั้ง/วัน', desc: 'ด้วยน้ำยาปลอดภัย' },
      { icon: '🏥', name: 'ใกล้ รพ.สัตว์', desc: 'เดินทาง 10 นาที' },
    ]

    if (type?.toLowerCase().includes('vip')) {
      return [
        { icon: '❄️', name: 'ระบบ HEPA Filter', desc: 'กรองอากาศบริสุทธิ์' },
        { icon: '📹', name: 'CCTV ส่วนตัว 24 ชม.', desc: 'ดูสดผ่านแอปได้' },
        { icon: '👤', name: 'พี่เลี้ยงส่วนตัว', desc: 'ดูแลใกล้ชิด 24 ชม.' },
        { icon: '🎡', name: 'ของเล่น Premium', desc: 'หอคอย, น้ำพุ, อุโมงค์' },
        { icon: '📞', name: 'Video Call', desc: 'คุยกับน้องได้ทุกเมื่อ' },
        { icon: '🛁', name: 'สปา & อาบน้ำฟรี', desc: 'รวมในราคาห้องแล้ว' },
      ]
    }
    if (type?.toLowerCase().includes('deluxe')) {
      return [
        ...base,
        { icon: '📹', name: 'CCTV ส่วนตัว', desc: 'ดูสดได้ตลอดเวลา' },
        { icon: '🎡', name: 'ของเล่นชุดใหญ่', desc: 'หอคอยและน้ำพุแมว' },
        { icon: '⛲', name: 'น้ำพุแมว Premium', desc: 'น้ำสะอาดไหลตลอด' },
      ]
    }
    return [
      ...base,
      { icon: '📹', name: 'CCTV รวม', desc: 'อัพเดทรูป 2 ครั้ง/วัน' },
      { icon: '🧶', name: 'ของเล่นพื้นฐาน', desc: 'ลูกบอล, หนูปลอม' },
    ]
  }

  if (!room) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingContent}>
          <span style={styles.loadingIcon}>🐱</span>
          <p style={styles.loadingText}>กำลังเตรียมข้อมูลห้องพัก...</p>
        </div>
      </div>
    )
  }

  const isVIP = room.room_type?.toLowerCase().includes('vip')
  const isDeluxe = room.room_type?.toLowerCase().includes('deluxe')

  return (
    <div style={styles.page}>
      {/* Hero/Header */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <Link href="/rooms" style={styles.backLink}>← กลับไปเลือกห้อง</Link>
          <div style={styles.heroInfo}>
            <span style={styles.typeBadge}>{room.room_type}</span>
            <h1 style={styles.heroTitle}>ห้อง {room.room_number}</h1>
          </div>
        </div>
      </section>

      <div style={styles.container}>
        <div style={styles.mainGrid}>
          {/* Left: Image & Gallery */}
          <div style={styles.imageSection}>
            <div style={styles.mainImageWrapper}>
              <img
                src={room.image_url || getRoomImage(room.room_type)}
                alt={room.room_type}
                style={styles.mainImage}
              />
              {isVIP && <div style={styles.vipRibbon}>👑 VIP Suite</div>}
              {isDeluxe && <div style={styles.popularRibbon}>🔥 ยอดนิยม</div>}
            </div>

            {/* Mini Gallery */}
            <div style={styles.miniGallery}>
              <div style={styles.miniImg}>
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=150&fit=crop" alt="Cat" style={styles.miniImgInner} />
              </div>
              <div style={styles.miniImg}>
                <img src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200&h=150&fit=crop" alt="Room" style={styles.miniImgInner} />
              </div>
              <div style={styles.miniImg}>
                <img src="https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&h=150&fit=crop" alt="Cat play" style={styles.miniImgInner} />
              </div>
            </div>
          </div>

          {/* Right: Room Info */}
          <div style={styles.infoSection}>
            {/* Price Card */}
            <div style={styles.priceCard}>
              <div style={styles.priceHeader}>
                <div>
                  <span style={styles.priceAmount}>{Number(room.price_per_night).toLocaleString()}</span>
                  <span style={styles.priceUnit}> บาท / คืน</span>
                </div>
                <div style={styles.ratingBadge}>⭐ 4.9</div>
              </div>

              {checkInDate && (
                <div style={styles.dateSelected}>
                  📅 เช็คอิน: {new Date(checkInDate).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              )}

              <button
                style={styles.bookBtn}
                onClick={() => router.push(`/booking?room=${room.id}${checkInDate ? `&checkIn=${checkInDate}` : ''}`)}
              >
                จองห้องนี้เลย 🐾
              </button>

              <p style={styles.guarantee}>🛡️ ยกเลิกฟรี 3 วันก่อนเข้าพัก</p>
            </div>

            {/* Description */}
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>📝 รายละเอียดห้องพัก</h3>
              <p style={styles.description}>
                {room.description || "ห้องพักสะอาด กว้างขวาง มีแอร์ส่วนตัว ออกแบบมาเพื่อให้น้องแมวรู้สึกผ่อนคลายเหมือนอยู่ที่บ้าน พร้อมระบบรักษาความปลอดภัยและพี่เลี้ยงดูแลตลอด 24 ชั่วโมง"}
              </p>

              <div style={styles.roomSpecs}>
                <div style={styles.specItem}>
                  <span style={styles.specIcon}>📐</span>
                  <div>
                    <strong>ขนาดห้อง</strong>
                    <span style={styles.specValue}>{isVIP ? '3x3 เมตร' : isDeluxe ? '2x2 เมตร' : '1.5x1.5 เมตร'}</span>
                  </div>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specIcon}>🐱</span>
                  <div>
                    <strong>รองรับ</strong>
                    <span style={styles.specValue}>{isVIP ? '1-3 ตัว' : isDeluxe ? '1-2 ตัว' : '1 ตัว'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>✨ สิ่งอำนวยความสะดวก</h3>
              <div style={styles.amenityGrid}>
                {getAmenities(room.room_type).map((item, idx) => (
                  <div key={idx} style={styles.amenityItem}>
                    <span style={styles.amenityIcon}>{item.icon}</span>
                    <div>
                      <strong style={styles.amenityName}>{item.name}</strong>
                      <span style={styles.amenityDesc}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div style={styles.rulesCard}>
              <h3 style={styles.cardTitle}>📋 กฎการเข้าพัก</h3>
              <ul style={styles.rulesList}>
                <li>✅ แมวต้องฉีดวัคซีนครบ (ภายใน 1 ปี)</li>
                <li>✅ เช็คอิน 09:00-20:00 / เช็คเอาท์ 09:00-12:00</li>
                <li>✅ นำอาหารประจำมาเองได้</li>
                <li>⚠️ ไม่รับแมวติดสัดหรือป่วยหนัก</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <section style={styles.bottomCTA}>
        <div style={styles.bottomContent}>
          <div style={styles.bottomInfo}>
            <h3 style={styles.bottomTitle}>ห้อง {room.room_number}</h3>
            <p style={styles.bottomPrice}>{Number(room.price_per_night).toLocaleString()} บาท/คืน</p>
          </div>
          <button
            style={styles.bottomBtn}
            onClick={() => router.push(`/booking?room=${room.id}${checkInDate ? `&checkIn=${checkInDate}` : ''}`)}
          >
            จองเลย 🐾
          </button>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: { fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '100px' },

  // Loading
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  loadingContent: { textAlign: 'center' },
  loadingIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px' },
  loadingText: { fontSize: '1.2rem', color: '#ea580c' },

  // Hero
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '60px 20px 40px', position: 'relative' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(234, 88, 12, 0.1) 0%, transparent 60%)' },
  heroContent: { position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' },
  backLink: { color: '#fbbf24', textDecoration: 'none', fontSize: '0.95rem' },
  heroInfo: { marginTop: '20px' },
  typeBadge: { display: 'inline-block', backgroundColor: 'rgba(234, 88, 12, 0.9)', color: 'white', padding: '8px 20px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '800', color: 'white', margin: 0 },

  // Container
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '40px', alignItems: 'start' },

  // Image Section
  imageSection: {},
  mainImageWrapper: { position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' },
  mainImage: { width: '100%', height: '400px', objectFit: 'cover', display: 'block' },
  vipRibbon: { position: 'absolute', top: '20px', right: '-35px', backgroundColor: '#fbbf24', color: '#1a1a2e', padding: '8px 50px', transform: 'rotate(45deg)', fontWeight: 'bold', fontSize: '0.85rem' },
  popularRibbon: { position: 'absolute', top: '20px', left: '20px', backgroundColor: '#ea580c', color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' },
  miniGallery: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' },
  miniImg: { borderRadius: '16px', overflow: 'hidden', height: '100px' },
  miniImgInner: { width: '100%', height: '100%', objectFit: 'cover' },

  // Info Section
  infoSection: { display: 'flex', flexDirection: 'column', gap: '25px' },

  // Price Card
  priceCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '2px solid #ea580c' },
  priceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  priceAmount: { fontSize: '2.5rem', fontWeight: '800', color: '#ea580c' },
  priceUnit: { fontSize: '1.1rem', color: '#6b7280' },
  ratingBadge: { backgroundColor: '#fff7ed', padding: '8px 15px', borderRadius: '50px', fontWeight: 'bold', color: '#ea580c' },
  dateSelected: { backgroundColor: '#f0fdf4', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontWeight: '500' },
  bookBtn: { width: '100%', padding: '18px', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.15rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 30px rgba(234, 88, 12, 0.35)' },
  guarantee: { textAlign: 'center', marginTop: '15px', color: '#10b981', fontSize: '0.9rem', fontWeight: '600' },

  // Info Cards
  infoCard: { backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 18px', paddingBottom: '12px', borderBottom: '2px solid #f0f0f0' },
  description: { color: '#4b5563', lineHeight: '1.8', margin: '0 0 20px', fontSize: '1rem' },
  roomSpecs: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  specItem: { display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '12px 15px', borderRadius: '12px' },
  specIcon: { fontSize: '1.5rem' },
  specValue: { display: 'block', color: '#6b7280', fontSize: '0.9rem' },

  // Amenity
  amenityGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  amenityItem: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '12px' },
  amenityIcon: { fontSize: '1.4rem', flexShrink: 0 },
  amenityName: { display: 'block', color: '#1a1a2e', fontSize: '0.95rem' },
  amenityDesc: { display: 'block', color: '#9ca3af', fontSize: '0.8rem' },

  // Rules
  rulesCard: { backgroundColor: '#fff7ed', padding: '25px', borderRadius: '20px', border: '1px solid #fed7aa' },
  rulesList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#9a3412', fontSize: '0.95rem' },

  // Bottom CTA
  bottomCTA: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 -5px 30px rgba(0,0,0,0.1)', zIndex: 100 },
  bottomContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bottomInfo: {},
  bottomTitle: { margin: '0 0 5px', fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e' },
  bottomPrice: { margin: 0, color: '#ea580c', fontWeight: 'bold' },
  bottomBtn: { padding: '14px 40px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
}