'use client'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import BookingCalendar from './BookingCalendar'
import Loading from '../loading'

function RoomList() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      // ดึงห้องมาแสดงตัวอย่าง 3 ห้อง (พยายามเลือกประเภทที่ไม่ซ้ำกัน)
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('price_per_night', { ascending: true })

      if (!error && data) {
        // กรองให้ได้ห้องที่หลากหลาย (เช่น Standard, Deluxe, VIP)
        const uniqueTypes = []
        const displayedRooms = []

        data.forEach(room => {
          if (!uniqueTypes.includes(room.room_type) && displayedRooms.length < 3) {
            uniqueTypes.push(room.room_type)
            displayedRooms.push(room)
          }
        })

        // ถ้าได้ไม่ครบ 3 ให้เติมด้วยห้องที่เหลือ
        if (displayedRooms.length < 3) {
          data.forEach(room => {
            if (!displayedRooms.find(r => r.id === room.id) && displayedRooms.length < 3) {
              displayedRooms.push(room)
            }
          })
        }

        setRooms(displayedRooms)
      }
      setTimeout(() => setLoading(false), 2000) // Demo delay
    }

    fetchRooms()
  }, [])

  if (loading) return <Loading />

  // Function เลือกรูปภาพ
  const getRoomImage = (room) => {
    if (room.image_url) return room.image_url
    if (room.room_type?.toLowerCase().includes('vip')) {
      return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=300&fit=crop'
    }
    if (room.room_type?.toLowerCase().includes('deluxe')) {
      return 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=300&fit=crop'
    }
    return 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=500&h=300&fit=crop'
  }

  return (
    <div style={styles.roomsGrid}>
      {rooms.map((room, index) => (
        <div key={room.id} style={{
          ...styles.roomCard,
          ...(index === 1 ? styles.roomCardPopular : {}) // ให้ห้องตรงกลางดูเด่น
        }}>
          {index === 1 && <div style={styles.popularTag}>🔥 ยอดนิยม</div>}
          <div style={styles.roomImage}>
            <img src={getRoomImage(room)} alt={room.room_type} style={styles.roomImg} />
            <span style={styles.roomBadge}>{room.room_type}</span>
          </div>
          <div style={styles.roomInfo}>
            <h3 style={styles.roomName}>{room.room_type}</h3>
            <p style={styles.roomDesc}>{room.description || 'ห้องพักแมวแสนสบาย'}</p>
            <div style={styles.roomPrice}>
              <span style={styles.priceAmount}>{Number(room.price_per_night || 0).toLocaleString()}</span>
              <span style={styles.priceUnit}>บาท/คืน</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (first_name, last_name),
          bookings (
            rooms (room_type)
          )
        `)
        .eq('rating', 5) // Prefer 5-star reviews
        .order('created_at', { ascending: false })
        .limit(3)

      if (data) {
        setReviews(data)
      }
      setTimeout(() => setLoading(false), 2500) // Demo delay
    }
    fetchReviews()
  }, [])

  if (loading) return <Loading />

  if (reviews.length === 0) return (
    <div style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
      ยังไม่มีรีวิวในขณะนี้
    </div>
  )

  return (
    <div style={styles.testimonialGrid}>
      {reviews.map((review) => (
        <div key={review.id} style={styles.testimonialCard}>
          <div style={styles.testimonialStars}>{'⭐'.repeat(review.rating)}</div>
          <p style={styles.testimonialText}>"{review.comment}"</p>
          <div style={styles.testimonialAuthor}>
            <div style={styles.authorAvatar}>
              {review.profiles?.first_name?.[0] || '🐱'}
            </div>
            <div>
              <strong>{review.profiles?.first_name || 'ลูกค้า'}</strong>
              <span style={styles.authorDate}>
                {new Date(review.created_at).toLocaleDateString('th-TH')} • {review.bookings?.rooms?.room_type}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="homepage">
      {/* Hero Section - Full Screen with Gradient */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🏆 โรงแรมแมวอันดับ 1 ในกรุงเทพฯ</div>
          <h1 style={styles.heroTitle}>
            Cat Hotel
            <span style={styles.heroEmoji}>🐱</span>
          </h1>
          <p style={styles.heroSubtitle}>
            "ความสุขของเจ้านาย คือหน้าที่ของเรา"
          </p>
          <p style={styles.heroDesc}>
            โรงแรมแมวเกรดพรีเมียม สะอาด ปลอดภัย ไม่ขังคอก<br />
            ดูแลอย่างใกล้ชิดโดยทีมพี่เลี้ยงผู้เชี่ยวชาญ 24 ชม.
          </p>
          <div style={styles.heroButtons}>
            <Link href="/rooms">
              <button style={styles.btnPrimary}>
                🐾 จองห้องพักตอนนี้
              </button>
            </Link>
            <Link href="/gallery">
              <button style={styles.btnSecondary}>
                📷 ดูแกลเลอรี่
              </button>
            </Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>500+</span>
              <span style={styles.statLabel}>น้องแมวเคยมาพัก</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>4.9</span>
              <span style={styles.statLabel}>คะแนนรีวิว ⭐</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>5 ปี</span>
              <span style={styles.statLabel}>ประสบการณ์</span>
            </div>
          </div>
        </div>
        <div style={styles.scrollIndicator}>
          <span>เลื่อนลง</span>
          <div style={styles.scrollArrow}>↓</div>
        </div>
      </section>

      {/* Quick Services */}
      <section style={styles.servicesSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>บริการของเรา</span>
            <h2 style={styles.sectionTitle}>ทำไมต้อง Cat Hotel?</h2>
            <p style={styles.sectionDesc}>เราดูแลเจ้านายของคุณเหมือนครอบครัว</p>
          </div>

          <div style={styles.servicesGrid}>
            <div style={styles.serviceCard}>
              <div style={styles.serviceIcon}>🏨</div>
              <h3 style={styles.serviceTitle}>ห้องพักพรีเมียม</h3>
              <p style={styles.serviceDesc}>ห้องแอร์ส่วนตัว กว้างขวาง มีของเล่นและที่ปีนป่ายครบครัน</p>
            </div>
            <div style={styles.serviceCard}>
              <div style={styles.serviceIcon}>📹</div>
              <h3 style={styles.serviceTitle}>CCTV ดูสด 24 ชม.</h3>
              <p style={styles.serviceDesc}>ดูน้องแมวแบบ Real-time ผ่านมือถือได้ตลอดเวลา</p>
            </div>
            <div style={styles.serviceCard}>
              <div style={styles.serviceIcon}>🧼</div>
              <h3 style={styles.serviceTitle}>สะอาดปลอดภัย</h3>
              <p style={styles.serviceDesc}>ทำความสะอาดวันละ 2 รอบ ด้วยน้ำยาปลอดภัยสำหรับน้องแมว</p>
            </div>
            <div style={styles.serviceCard}>
              <div style={styles.serviceIcon}>💕</div>
              <h3 style={styles.serviceTitle}>พี่เลี้ยงผู้เชี่ยวชาญ</h3>
              <p style={styles.serviceDesc}>ทีมงานที่รักและเข้าใจน้องแมว คอยดูแลอย่างใกล้ชิด</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Calendar */}
      <section style={styles.calendarSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>เช็ควันว่าง</span>
            <h2 style={styles.sectionTitle}>📅 ตารางห้องว่าง</h2>
            <p style={styles.sectionDesc}>คลิกวันที่ต้องการเพื่อจองห้องพัก</p>
          </div>
          <BookingCalendar />
        </div>
      </section>

      {/* Room Preview */}
      <section style={styles.roomsSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>ห้องพักของเรา</span>
            <h2 style={styles.sectionTitle}>🏠 เลือกห้องที่เหมาะกับเจ้านาย</h2>
          </div>

          <RoomList />

          <div style={styles.viewAllWrapper}>
            <Link href="/rooms">
              <button style={styles.viewAllBtn}>ดูห้องพักทั้งหมด →</button>
            </Link>
          </div>
        </div>
      </section>


      {/* Testimonials Preview */}
      <section style={styles.testimonialsSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>รีวิวจากลูกค้า</span>
            <h2 style={styles.sectionTitle}>⭐ ทาสแมวพูดถึงเรา</h2>
          </div>

          <ReviewList />

          <div style={styles.viewAllWrapper}>
            <Link href="/reviews">
              <button style={styles.viewAllBtnOutline}>ดูรีวิวทั้งหมด →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section style={styles.quickLinksSection}>
        <div style={styles.container}>
          <div style={styles.quickLinksGrid}>
            <Link href="/pricing" style={styles.quickLinkCard}>
              <span style={styles.quickLinkIcon}>💰</span>
              <h3 style={styles.quickLinkTitle}>ตารางราคา</h3>
              <p style={styles.quickLinkDesc}>เปรียบเทียบแพ็คเกจและโปรโมชั่น</p>
            </Link>

            <Link href="/gallery" style={styles.quickLinkCard}>
              <span style={styles.quickLinkIcon}>📷</span>
              <h3 style={styles.quickLinkTitle}>แกลเลอรี่</h3>
              <p style={styles.quickLinkDesc}>ดูรูปห้องพักและน้องแมวที่เคยมาพัก</p>
            </Link>

            <Link href="/faq" style={styles.quickLinkCard}>
              <span style={styles.quickLinkIcon}>❓</span>
              <h3 style={styles.quickLinkTitle}>คำถามที่พบบ่อย</h3>
              <p style={styles.quickLinkDesc}>หาคำตอบสำหรับข้อสงสัย</p>
            </Link>

            <Link href="/contact" style={styles.quickLinkCard}>
              <span style={styles.quickLinkIcon}>📞</span>
              <h3 style={styles.quickLinkTitle}>ติดต่อเรา</h3>
              <p style={styles.quickLinkDesc}>โทร, LINE, Facebook, Instagram</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>พร้อมให้เจ้านายมาพักผ่อนกับเราหรือยัง?</h2>
          <p style={styles.ctaDesc}>จองวันนี้รับส่วนลดพิเศษ 10% สำหรับการจองครั้งแรก!</p>
          <Link href="/rooms">
            <button style={styles.ctaBtn}>จองห้องพักเลย 🐾</button>
          </Link>
        </div>
      </section>
    </div>
  )
}

// ========== Styles ==========
const styles = {
  // Hero Section
  hero: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(234, 88, 12, 0.15) 0%, transparent 50%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '20px',
    maxWidth: '900px',
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    border: '1px solid rgba(234, 88, 12, 0.5)',
    color: '#fbbf24',
    padding: '8px 20px',
    borderRadius: '50px',
    fontSize: '0.9rem',
    marginBottom: '25px',
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 20px',
    letterSpacing: '-2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  heroEmoji: {
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
  },
  heroSubtitle: {
    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
    color: '#fbbf24',
    fontWeight: '600',
    margin: '0 0 15px',
    fontStyle: 'italic',
  },
  heroDesc: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.8',
    margin: '0 0 35px',
  },
  heroButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '50px',
  },
  btnPrimary: {
    padding: '18px 35px',
    backgroundColor: '#ea580c',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(234, 88, 12, 0.4)',
    transition: 'all 0.3s',
  },
  btnSecondary: {
    padding: '18px 35px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: '1px',
    height: '50px',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.85rem',
  },
  scrollArrow: {
    fontSize: '1.5rem',
    animation: 'bounce 2s infinite',
  },

  // Common
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  sectionTag: {
    display: 'inline-block',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    padding: '6px 16px',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 10px',
  },
  sectionDesc: {
    color: '#6b7280',
    fontSize: '1.1rem',
    margin: 0,
  },

  // Services
  servicesSection: {
    padding: '100px 20px',
    backgroundColor: '#fff',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
  },
  serviceCard: {
    padding: '40px 30px',
    backgroundColor: '#fafafa',
    borderRadius: '24px',
    textAlign: 'center',
    transition: 'all 0.3s',
    border: '1px solid #f0f0f0',
  },
  serviceIcon: {
    fontSize: '3.5rem',
    marginBottom: '20px',
    display: 'block',
  },
  serviceTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 10px',
  },
  serviceDesc: {
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0,
  },

  // Calendar
  calendarSection: {
    padding: '100px 20px',
    backgroundColor: '#fafafa',
  },

  // Rooms
  roomsSection: {
    padding: '100px 20px',
    backgroundColor: '#fff',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
    position: 'relative',
  },
  roomCardPopular: {
    border: '3px solid #ea580c',
    transform: 'scale(1.02)',
  },
  popularTag: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#ea580c',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    zIndex: 10,
  },
  roomImage: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  roomImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  roomBadge: {
    position: 'absolute',
    bottom: '15px',
    left: '15px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  roomInfo: {
    padding: '25px',
  },
  roomName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  roomDesc: {
    color: '#6b7280',
    margin: '0 0 20px',
    lineHeight: '1.5',
  },
  roomPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
  },
  priceAmount: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ea580c',
  },
  priceUnit: {
    color: '#9ca3af',
    fontSize: '0.95rem',
  },
  viewAllWrapper: {
    textAlign: 'center',
    marginTop: '50px',
  },
  viewAllBtn: {
    padding: '16px 40px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  viewAllBtnOutline: {
    padding: '16px 40px',
    backgroundColor: 'transparent',
    color: '#ea580c',
    border: '2px solid #ea580c',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  // Testimonials
  testimonialsSection: {
    padding: '100px 20px',
    backgroundColor: '#fafafa',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: '35px',
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
  },
  testimonialStars: {
    fontSize: '1.3rem',
    marginBottom: '15px',
  },
  testimonialText: {
    fontSize: '1.1rem',
    color: '#374151',
    lineHeight: '1.8',
    margin: '0 0 25px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  authorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#fff7ed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
  },
  authorDate: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '0.85rem',
    marginTop: '3px',
  },

  // Quick Links
  quickLinksSection: {
    padding: '80px 20px',
    backgroundColor: '#fff',
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  quickLinkCard: {
    display: 'block',
    padding: '35px 25px',
    backgroundColor: '#fafafa',
    borderRadius: '20px',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.3s',
    border: '2px solid transparent',
  },
  quickLinkIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '15px',
  },
  quickLinkTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  quickLinkDesc: {
    color: '#6b7280',
    margin: 0,
    fontSize: '0.95rem',
  },

  // CTA
  ctaSection: {
    padding: '100px 20px',
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 15px',
  },
  ctaDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.2rem',
    margin: '0 0 35px',
  },
  ctaBtn: {
    padding: '20px 50px',
    backgroundColor: 'white',
    color: '#ea580c',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
}