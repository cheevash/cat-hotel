'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'history'
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
                    *,
                    rooms (room_number, room_type, price_per_night, image_url),
                    cats (name)
                `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookings:', error)
      } else {
        setBookings(data || [])
      }
      setLoading(false)
    }
    fetchBookings()
  }, [])

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  const getStatusConfig = (status, paymentStatus) => {
    const s = status?.toLowerCase()
    if (s === 'confirmed') return { text: 'จองสำเร็จ', color: '#059669', bg: '#d1fae5', icon: '✅' }
    if (s === 'pending') {
      if (paymentStatus === 'PendingApproval') return { text: 'รอตรวจสลิป', color: '#d97706', bg: '#fef3c7', icon: '⏳' }
      if (paymentStatus === 'Unpaid') return { text: 'รอชำระเงิน', color: '#ea580c', bg: '#ffedd5', icon: '💳' }
      return { text: 'รอตรวจสอบ', color: '#d97706', bg: '#fef3c7', icon: '⏳' }
    }
    if (s === 'checkedin') return { text: 'เข้าพักแล้ว', color: '#2563eb', bg: '#dbeafe', icon: '🏠' }
    if (s === 'checkedout') return { text: 'เช็คเอาท์', color: '#64748b', bg: '#f1f5f9', icon: '👋' }
    if (s === 'cancelled') return { text: 'ยกเลิกแล้ว', color: '#ef4444', bg: '#fee2e2', icon: '❌' } // Red for Cancelled
    return { text: status, color: '#64748b', bg: '#f1f5f9', icon: '📝' }
  }

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(b => {
    const isActive = ['pending', 'confirmed', 'checkedin'].includes(b.status?.toLowerCase())
    return activeTab === 'active' ? isActive : !isActive
  })

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}>📅</div>
      <p>กำลังโหลดรายการจอง...</p>
    </div>
  )

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>การจองของฉัน 📅</h1>
          <p style={styles.subtitle}>ติดตามสถานะและประวัติการเข้าพัก</p>
        </header>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('active')}
            style={activeTab === 'active' ? styles.tabActive : styles.tab}
          >
            รายการปัจจุบัน
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? styles.tabActive : styles.tab}
          >
            ประวัติย้อนหลัง
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>
              {activeTab === 'active' ? '🎫' : '📜'}
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#4b5563' }}>
              {activeTab === 'active' ? 'ไม่มีรายการจองที่กำลังดำเนินอยู่' : 'ไม่มีประวัติการจองย้อนหลัง'}
            </h3>
            {activeTab === 'active' && (
              <Link href="/rooms">
                <button style={styles.bookNowBtn}>จองห้องพักเลย</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.bookingList}>
            {filteredBookings.map((booking) => {
              const status = getStatusConfig(booking.status, booking.payment_status)
              const nights = calculateNights(booking.check_in_date, booking.check_out_date)

              return (
                <div key={booking.id} style={styles.card}>
                  <div style={styles.cardLeft}>
                    <div style={styles.dateBox}>
                      <span style={styles.dateMonth}>
                        {new Date(booking.check_in_date).toLocaleDateString('th-TH', { month: 'short' })}
                      </span>
                      <span style={styles.dateDay}>
                        {new Date(booking.check_in_date).getDate()}
                      </span>
                    </div>
                    <div style={styles.verticalLine}></div>
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.roomName}>{booking.rooms?.room_type} (ห้อง {booking.rooms?.room_number})</h3>
                        <div style={styles.subInfo}>
                          <span>🐱 {booking.cats?.name || 'ไม่ระบุ'}</span>
                          <span>•</span>
                          <span>{nights} คืน</span>
                        </div>
                      </div>
                      <span style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.color }}>
                        {status.icon} {status.text}
                      </span>
                    </div>

                    <div style={styles.cardDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>เช็คอิน:</span>
                        <span style={styles.detailValue}>{new Date(booking.check_in_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>เช็คเอาท์:</span>
                        <span style={styles.detailValue}>{new Date(booking.check_out_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div style={styles.totalRow}>
                        <span>ยอดชำระสุทธิ</span>
                        <span style={styles.totalPrice}>{Number(booking.total_price).toLocaleString()} ฿</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.cardFooter}>
                      <span style={styles.bookingId}>#{booking.id.slice(0, 8).toUpperCase()}</span>

                      <div style={styles.actionButtons}>
                        {booking.payment_status === 'Unpaid' && booking.status !== 'Cancelled' && (
                          <Link href={`/payment/${booking.id}`}>
                            <button style={styles.payBtn}>💳 ชำระเงิน</button>
                          </Link>
                        )}

                        {booking.payment_status === 'PendingApproval' && (
                          <Link href={`/payment/${booking.id}`}>
                            <button style={styles.pendingBtn}>⏳ ติดตามสถานะ</button>
                          </Link>
                        )}

                        {(booking.payment_status === 'Paid' || booking.status === 'Confirmed') && (
                          <Link href={`/payment/${booking.id}`}>
                            <button style={styles.detailBtn}>📄 รายละเอียด</button>
                          </Link>
                        )}

                        {booking.status === 'CheckedOut' && (
                          <Link href={`/reviews?bookingId=${booking.id}`}>
                            <button style={styles.reviewBtn}>⭐ ให้คะแนน</button>
                          </Link>
                        )}

                        <Link href={`/rooms/${booking.room_id}`} style={styles.detailLink}>
                          รายละเอียดห้อง
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  pageBackground: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Sarabun", "Kanit", sans-serif' },
  container: { maxWidth: '800px', margin: '0 auto' },

  header: { marginBottom: '30px', textAlign: 'center' },
  title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: '1rem', margin: 0 },

  loadingContainer: { textAlign: 'center', padding: '100px', color: '#ea580c' },
  spinner: { fontSize: '40px', marginBottom: '10px', animation: 'spin 1s infinite' },

  tabs: { display: 'flex', justifyContent: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '5px', borderRadius: '50px', width: 'fit-content', margin: '0 auto 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  tab: { padding: '10px 25px', borderRadius: '50px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '600', transition: 'all 0.2s' },
  tabActive: { padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: '#ea580c', color: 'white', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 5px rgba(234, 88, 12, 0.3)' },

  emptyState: { textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  bookNowBtn: { marginTop: '20px', padding: '12px 24px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },

  bookingList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
    display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
    transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' }
  },

  cardLeft: {
    width: '90px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', borderRight: '1px dashed #e2e8f0', padding: '15px'
  },
  dateBox: { textAlign: 'center' },
  dateMonth: { display: 'block', fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' },
  dateDay: { display: 'block', fontSize: '1.8rem', color: '#1e293b', fontWeight: '800', lineHeight: 1 },

  cardContent: { flex: 1, padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  roomName: { margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1f2937', fontWeight: '700' },
  subInfo: { display: 'flex', gap: '8px', fontSize: '0.85rem', color: '#64748b' },
  statusBadge: { padding: '6px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' },

  cardDetails: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' },
  detailLabel: { color: '#64748b' },
  detailValue: { color: '#334155', fontWeight: '500' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontWeight: 'bold', color: '#1e293b' },
  totalPrice: { color: '#ea580c', fontSize: '1.1rem' },

  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' },

  actionButtons: { display: 'flex', gap: '10px', alignItems: 'center' },
  payBtn: { padding: '8px 16px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(234, 88, 12, 0.2)' },
  pendingBtn: { padding: '8px 16px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  detailBtn: { padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  reviewBtn: { padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  detailLink: { fontSize: '0.9rem', color: '#64748b', textDecoration: 'none', fontWeight: '600' }
}