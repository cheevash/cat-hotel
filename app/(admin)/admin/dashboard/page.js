'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthBookings: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalCustomers: 0,
    pendingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString()

    try {
      // Fetch all bookings
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, rooms(room_number, room_type, price_per_night), profiles(first_name, last_name)')
        .order('created_at', { ascending: false })

      // Fetch rooms
      const { data: rooms } = await supabase.from('rooms').select('*')

      // Fetch customers
      const { data: customers } = await supabase.from('profiles').select('id')

      // Calculate stats
      const todayBookings = allBookings?.filter(b => new Date(b.created_at) >= new Date(startOfToday)) || []
      const monthBookings = allBookings?.filter(b => new Date(b.created_at) >= new Date(startOfMonth)) || []
      const confirmedBookings = allBookings?.filter(b => b.status === 'Confirmed' || b.status === 'confirmed') || []
      const pendingBookings = allBookings?.filter(b => b.status === 'Pending' || b.status === 'pending') || []

      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
      const monthRevenue = monthBookings.filter(b => b.status === 'Confirmed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0)

      const availableRooms = rooms?.filter(r => r.is_available) || []
      const occupiedRooms = rooms?.filter(r => !r.is_available) || []

      // Weekly data for chart (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split('T')[0]
      })

      const weeklyStats = last7Days.map(date => {
        const dayBookings = allBookings?.filter(b =>
          b.created_at?.startsWith(date)
        ) || []
        return {
          date: new Date(date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
          count: dayBookings.length,
          revenue: dayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
        }
      })

      setStats({
        todayBookings: todayBookings.length,
        monthBookings: monthBookings.length,
        totalRevenue,
        monthRevenue,
        availableRooms: availableRooms.length,
        occupiedRooms: occupiedRooms.length,
        totalCustomers: customers?.length || 0,
        pendingBookings: pendingBookings.length
      })

      setRecentBookings(allBookings?.slice(0, 5) || [])
      setWeeklyData(weeklyStats)

    } catch (error) {
      console.error('Dashboard error:', error)
    }

    setLoading(false)
  }

  const StatCard = ({ icon, label, value, subValue, color }) => (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={{ ...styles.statValue, color }}>{value}</p>
        {subValue && <p style={styles.statSub}>{subValue}</p>}
      </div>
    </div>
  )

  const maxBookings = Math.max(...weeklyData.map(d => d.count), 1)

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <span style={styles.loadingIcon}>📊</span>
        <p>กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Dashboard</h1>
          <p style={styles.subtitle}>ภาพรวมระบบจัดการ Cat Hotel</p>
        </div>
        <button onClick={fetchDashboardData} style={styles.refreshBtn}>🔄 รีเฟรช</button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="📅"
          label="การจองวันนี้"
          value={stats.todayBookings}
          subValue="รายการ"
          color="#3b82f6"
        />
        <StatCard
          icon="📆"
          label="การจองเดือนนี้"
          value={stats.monthBookings}
          subValue="รายการ"
          color="#8b5cf6"
        />
        <StatCard
          icon="⏳"
          label="รอยืนยัน"
          value={stats.pendingBookings}
          subValue="รายการ"
          color="#f59e0b"
        />
        <StatCard
          icon="👥"
          label="ลูกค้าทั้งหมด"
          value={stats.totalCustomers}
          subValue="คน"
          color="#10b981"
        />
      </div>

      {/* Revenue & Rooms Row */}
      <div style={styles.rowGrid}>
        {/* Revenue Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💰 รายได้</h3>
          <div style={styles.revenueGrid}>
            <div style={styles.revenueItem}>
              <span style={styles.revenueLabel}>เดือนนี้</span>
              <span style={styles.revenueValue}>{stats.monthRevenue.toLocaleString()} ฿</span>
            </div>
            <div style={styles.revenueDivider}></div>
            <div style={styles.revenueItem}>
              <span style={styles.revenueLabel}>รวมทั้งหมด</span>
              <span style={{ ...styles.revenueValue, color: '#10b981' }}>{stats.totalRevenue.toLocaleString()} ฿</span>
            </div>
          </div>
        </div>

        {/* Rooms Status */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏨 สถานะห้องพัก</h3>
          <div style={styles.roomsStatus}>
            <div style={styles.roomStatusItem}>
              <div style={{ ...styles.roomDot, backgroundColor: '#10b981' }}></div>
              <span>ว่าง</span>
              <span style={styles.roomCount}>{stats.availableRooms}</span>
            </div>
            <div style={styles.roomStatusItem}>
              <div style={{ ...styles.roomDot, backgroundColor: '#ef4444' }}></div>
              <span>ไม่ว่าง</span>
              <span style={styles.roomCount}>{stats.occupiedRooms}</span>
            </div>
          </div>
          <div style={styles.roomBar}>
            <div style={{
              ...styles.roomBarFill,
              width: `${(stats.availableRooms / (stats.availableRooms + stats.occupiedRooms || 1)) * 100}%`
            }}></div>
          </div>
        </div>
      </div>

      {/* Chart & Recent Bookings */}
      <div style={styles.rowGrid}>
        {/* Weekly Chart */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 การจอง 7 วันล่าสุด</h3>
          <div style={styles.chart}>
            {weeklyData.map((day, idx) => (
              <div key={idx} style={styles.chartBar}>
                <div style={styles.barWrapper}>
                  <div
                    style={{
                      ...styles.bar,
                      height: `${(day.count / maxBookings) * 100}%`,
                      backgroundColor: day.count > 0 ? '#ea580c' : '#e5e7eb'
                    }}
                  >
                    {day.count > 0 && <span style={styles.barValue}>{day.count}</span>}
                  </div>
                </div>
                <span style={styles.barLabel}>{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕐 การจองล่าสุด</h3>
          <div style={styles.bookingsList}>
            {recentBookings.length === 0 ? (
              <p style={styles.emptyText}>ยังไม่มีการจอง</p>
            ) : (
              recentBookings.map((booking, idx) => (
                <div key={idx} style={styles.bookingItem}>
                  <div>
                    <strong>{booking.profiles?.first_name || 'ลูกค้า'} {booking.profiles?.last_name?.charAt(0) || ''}.</strong>
                    <span style={styles.bookingRoom}>{booking.rooms?.room_type} - ห้อง {booking.rooms?.room_number}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: booking.status === 'Confirmed' ? '#dcfce7' : '#fef3c7',
                    color: booking.status === 'Confirmed' ? '#166534' : '#92400e'
                  }}>
                    {booking.status === 'Confirmed' ? 'ยืนยันแล้ว' : booking.status === 'Pending' ? 'รอยืนยัน' : booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>⚡ ทางลัด</h3>
        <div style={styles.quickActions}>
          <a href="/admin/rooms" style={styles.quickBtn}>🏨 จัดการห้องพัก</a>
          <a href="/admin/bookings" style={styles.quickBtn}>📅 จัดการการจอง</a>
          <a href="/admin/customers" style={styles.quickBtn}>👥 จัดการลูกค้า</a>
          <a href="/admin/cats" style={styles.quickBtn}>🐱 จัดการแมว</a>
          <a href="/admin/reviews" style={styles.quickBtn}>⭐ จัดการรีวิว</a>
          <a href="/admin/settings" style={styles.quickBtn}>⚙️ ตั้งค่าระบบ</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#ea580c' },
  loadingIcon: { fontSize: '3rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '700' },
  subtitle: { color: '#64748b', margin: 0 },
  refreshBtn: { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'center' },
  statIcon: { fontSize: '2.5rem' },
  statLabel: { color: '#64748b', margin: '0 0 5px', fontSize: '0.9rem' },
  statValue: { fontSize: '2rem', fontWeight: '800', margin: 0 },
  statSub: { color: '#94a3b8', margin: '5px 0 0', fontSize: '0.85rem' },

  // Cards
  rowGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginBottom: '25px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 20px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' },

  // Revenue
  revenueGrid: { display: 'flex', alignItems: 'center', gap: '30px' },
  revenueItem: { flex: 1 },
  revenueLabel: { display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' },
  revenueValue: { fontSize: '1.8rem', fontWeight: '800', color: '#ea580c' },
  revenueDivider: { width: '1px', height: '50px', backgroundColor: '#e2e8f0' },

  // Rooms
  roomsStatus: { display: 'flex', gap: '30px', marginBottom: '15px' },
  roomStatusItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  roomDot: { width: '12px', height: '12px', borderRadius: '50%' },
  roomCount: { fontWeight: '700', fontSize: '1.2rem', marginLeft: 'auto' },
  roomBar: { height: '10px', backgroundColor: '#fee2e2', borderRadius: '5px', overflow: 'hidden' },
  roomBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: '5px', transition: 'width 0.3s' },

  // Chart
  chart: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '10px' },
  chartBar: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  barWrapper: { height: '140px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  bar: { width: '80%', minHeight: '5px', borderRadius: '6px 6px 0 0', transition: 'height 0.3s', position: 'relative' },
  barValue: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.85rem', fontWeight: 'bold', color: '#ea580c' },
  barLabel: { marginTop: '10px', fontSize: '0.8rem', color: '#64748b' },

  // Bookings List
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bookingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px' },
  bookingRoom: { display: 'block', color: '#64748b', fontSize: '0.85rem', marginTop: '3px' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  emptyText: { color: '#94a3b8', textAlign: 'center', padding: '30px' },

  // Quick Actions
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' },
  quickBtn: { padding: '18px 15px', backgroundColor: '#f8fafc', borderRadius: '12px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', textAlign: 'center', transition: 'all 0.2s', border: '1px solid #e2e8f0' },
}