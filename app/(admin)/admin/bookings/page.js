'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Configuration
  const statusOptions = [
    { value: 'Pending', label: '⏳ รอยืนยัน', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    { value: 'Confirmed', label: '✅ ยืนยันแล้ว', color: '#10b981', bg: '#dcfce7', icon: '✅' },
    { value: 'CheckedIn', label: '🏠 เช็คอินแล้ว', color: '#3b82f6', bg: '#dbeafe', icon: '🏠' },
    { value: 'CheckedOut', label: '🚪 เช็คเอาท์แล้ว', color: '#6b7280', bg: '#f3f4f6', icon: '🚪' },
    { value: 'Cancelled', label: '❌ ยกเลิก', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  ]

  const paymentOptions = [
    { value: 'Unpaid', label: '💳 ยังไม่ชำระ', color: '#ef4444', bg: '#fee2e2' },
    { value: 'PendingApproval', label: '⏳ รอตรวจสอบ', color: '#f59e0b', bg: '#fffbeb' }, // Updated bg for visibility
    { value: 'Paid', label: '✅ ชำระแล้ว', color: '#10b981', bg: '#dcfce7' },
  ]

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms(id, room_number, room_type, price_per_night),
        profiles:user_id(first_name, last_name, email, phone),
        cats(id, name, breed)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      // Fallback: Try simpler query if joins fail
      const { data: simpleData, error: simpleError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (simpleError) {
        console.error('Error fetching simple bookings:', simpleError)
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลการจองได้', 'error')
      } else {
        setBookings(simpleData || [])
      }
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (bookingId, newStatus) => {
    setProcessing(true)
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
    } else {
      await fetchBookings()
      // Update selected booking in place if modal is open
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }))
      }
    }
    setProcessing(false)
  }

  const updatePaymentStatus = async (bookingId, newStatus) => {
    setProcessing(true)
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: newStatus })
      .eq('id', bookingId)

    if (error) {
      Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
    } else {
      await fetchBookings()
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, payment_status: newStatus }))
      }
    }
    setProcessing(false)
  }



  const approvePayment = async (bookingId) => {
    const result = await Swal.fire({
      title: 'ยืนยันอนุมัติ?',
      text: "คุณต้องการอนุมัติการชำระเงินนี้ใช่หรือไม่",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก'
    })

    if (!result.isConfirmed) return

    setProcessing(true)
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Paid', status: 'Confirmed' })
      .eq('id', bookingId)

    if (error) {
      Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
    } else {
      Swal.fire({
        title: 'อนุมัติเรียบร้อย',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
      await fetchBookings()
      setSelectedBooking(null)
    }
    setProcessing(false)
  }

  const rejectPayment = async (bookingId) => {
    const result = await Swal.fire({
      title: 'ยืนยันปฏิเสธ?',
      text: "ลูกค้าจะต้องส่งหลักฐานการโอนเงินใหม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ปฏิเสธยอด',
      cancelButtonText: 'ยกเลิก'
    })

    if (!result.isConfirmed) return

    setProcessing(true)
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Unpaid', status: 'Pending' }) // Revert to Unpaid/Pending
      .eq('id', bookingId)

    if (error) {
      Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
    } else {
      Swal.fire({
        title: 'ปฏิเสธเรียบร้อย',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
      await fetchBookings()
      setSelectedBooking(null)
    }
    setProcessing(false)
  }

  // Helper functions
  const getStatusInfo = (status) => statusOptions.find(s => s.value === status) || statusOptions[0]
  const getPaymentInfo = (status) => paymentOptions.find(s => s.value === status) || paymentOptions[0]
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }
  const getRoomName = (booking) => {
    if (booking.rooms?.name) return booking.rooms.name
    if (booking.rooms?.room_type) return booking.rooms.room_type
    return `ห้อง ${booking.room_id?.slice(0, 8) || '-'}`
  }

  // Filtering
  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  // Stats calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    checkedIn: bookings.filter(b => b.status === 'CheckedIn').length,
    pendingPayment: bookings.filter(b => b.payment_status === 'PendingApproval').length
  }

  // Modal Component (Inline for simplicity)
  const BookingModal = ({ booking, onClose }) => {
    if (!booking) return null

    // Refresh local booking data from state to ensure it's up to date
    const currentBooking = bookings.find(b => b.id === booking.id) || booking

    const statusInfo = getStatusInfo(currentBooking.status)
    const paymentInfo = getPaymentInfo(currentBooking.payment_status)

    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div style={styles.modalHeader}>
            <div>
              <span style={styles.modalId}>#{currentBooking.id.slice(0, 8).toUpperCase()}</span>
              <h2 style={styles.modalTitle}>รายละเอียดการจอง</h2>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.modalContent}>

            {/* Main Grid Info */}
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>👤 ลูกค้า</span>
                <span style={styles.infoValue}>{currentBooking.profiles?.first_name} {currentBooking.profiles?.last_name}</span>
                <span style={styles.infoSub}>{currentBooking.profiles?.phone || '-'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>🐱 น้องแมว</span>
                <span style={styles.infoValue}>{currentBooking.cats?.name || '-'}</span>
                <span style={styles.infoSub}>{currentBooking.cats?.breed}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>🏠 ห้องพัก</span>
                <span style={styles.infoValue}>{getRoomName(currentBooking)}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📅 วันที่เข้าพัก</span>
                <span style={styles.infoValue}>{formatDate(currentBooking.check_in_date)}</span>
                <span style={styles.infoSub}>ถึง {formatDate(currentBooking.check_out_date)}</span>
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* Payment Section - Highlighted */}
            <div style={{
              ...styles.paymentSection,
              backgroundColor: currentBooking.payment_status === 'PendingApproval' ? '#fff7ed' : '#f8fafc',
              border: currentBooking.payment_status === 'PendingApproval' ? '1px solid #fdba74' : '1px solid #e2e8f0'
            }}>
              <div style={styles.paymentHeader}>
                <h3 style={styles.sectionTitle}>สถานะการชำระเงิน</h3>
                <span style={{ ...styles.badge, backgroundColor: paymentInfo.bg, color: paymentInfo.color }}>
                  {paymentInfo.label}
                </span>
              </div>

              <div style={styles.priceRow}>
                <span>ยอดสุทธิ</span>
                <span style={styles.totalPrice}>{Number(currentBooking.total_price).toLocaleString()} ฿</span>
              </div>

              {/* Slip Preview & Action */}
              {currentBooking.payment_slip_url ? (
                <div style={styles.slipContainer}>
                  <p style={styles.slipLabel}>หลักฐานการโอนเงิน:</p>
                  <a href={currentBooking.payment_slip_url} target="_blank" rel="noreferrer" style={styles.slipLink}>
                    <img src={currentBooking.payment_slip_url} alt="Payment Slip" style={styles.slipImage} />
                  </a>

                  {/* Approval Actions */}
                  {currentBooking.payment_status === 'PendingApproval' && (
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => approvePayment(currentBooking.id)}
                        disabled={processing}
                        style={styles.approveBtn}
                      >
                        ✅ อนุมัติการชำระเงิน
                      </button>
                      <button
                        onClick={() => rejectPayment(currentBooking.id)}
                        disabled={processing}
                        style={styles.rejectBtn}
                      >
                        ❌ ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noSlip}>
                  <span>ยังไม่มีหลักฐานการโอนเงิน</span>
                </div>
              )}
            </div>

            {/* Booking Status Management */}
            <div style={styles.statusManagement}>
              <h3 style={styles.sectionTitle}>จัดการสถานะการจอง</h3>
              <div style={styles.statusGrid}>
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateStatus(currentBooking.id, option.value)}
                    disabled={processing || currentBooking.status === option.value}
                    style={{
                      ...styles.statusOptionBtn,
                      backgroundColor: currentBooking.status === option.value ? option.color : 'white',
                      color: currentBooking.status === option.value ? 'white' : '#64748b',
                      borderColor: currentBooking.status === option.value ? option.color : '#e2e8f0'
                    }}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div style={styles.loading}>กำลังโหลด...</div>

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>จัดการการจองห้องพัก</h1>
          <p style={styles.pageSubtitle}>ตรวจสอบรายการจองและสถานะการชำระเงิน</p>
        </div>
        <button onClick={fetchBookings} style={styles.refreshBtn}>🔄 รีเฟรชข้อมูล</button>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, borderBottom: '4px solid #f59e0b' }}>
          <span style={styles.statLabel}>รอดำเนินการ</span>
          <span style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.pending}</span>
        </div>
        <div style={{ ...styles.statCard, borderBottom: '4px solid #10b981' }}>
          <span style={styles.statLabel}>ยืนยันแล้ว</span>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{stats.confirmed}</span>
        </div>
        <div style={{ ...styles.statCard, borderBottom: '4px solid #3b82f6' }}>
          <span style={styles.statLabel}>เช็คอินแล้ว</span>
          <span style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.checkedIn}</span>
        </div>
        {stats.pendingPayment > 0 && (
          <div style={{ ...styles.statCard, backgroundColor: '#fff7ed', borderBottom: '4px solid #ea580c' }}>
            <span style={styles.statLabel}>⚠️ รอตรวจสอบการโอน</span>
            <span style={{ ...styles.statValue, color: '#ea580c' }}>{stats.pendingPayment}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter('all')}
          style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
        >
          ทั้งหมด
        </button>
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            style={filter === option.value ? styles.filterBtnActive : styles.filterBtn}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>เลขที่จอง</th>
              <th style={styles.th}>ลูกค้า</th>
              <th style={styles.th}>ห้องพัก</th>
              <th style={styles.th}>วันที่</th>
              <th style={styles.th}>สถานะ</th>
              <th style={styles.th}>การชำระเงิน</th>
              <th style={styles.th}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => {
              const status = getStatusInfo(booking.status)
              const payment = getPaymentInfo(booking.payment_status)
              return (
                <tr key={booking.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.idBadge}>#{booking.id.slice(0, 6).toUpperCase()}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.customerName}>{booking.profiles?.first_name} {booking.profiles?.last_name}</div>
                    <div style={styles.catName}>🐱 {booking.cats?.name}</div>
                  </td>
                  <td style={styles.td}>{getRoomName(booking)}</td>
                  <td style={styles.td}>
                    <div>{formatDate(booking.check_in_date)}</div>
                    <div style={styles.dateSub}>ถึง {formatDate(booking.check_out_date)}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: payment.bg, color: payment.color }}>
                      {payment.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => setSelectedBooking(booking)} style={styles.viewBtn}>
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="7" style={styles.emptyState}>ไม่พบข้อมูลการจอง</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBooking && <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </div>
  )
}

// Styles object
const styles = {
  loading: { padding: '50px', textAlign: 'center', color: '#64748b' },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
  refreshBtn: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#475569',
    fontWeight: '500',
    transition: 'all 0.2s',
  },

  // Stats
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  statLabel: { fontSize: '14px', color: '#64748b', fontWeight: '500' },
  statValue: { fontSize: '28px', fontWeight: 'bold' },

  // Filters
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filterBtnActive: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #ea580c',
    backgroundColor: '#ea580c',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  // Table
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px',
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#334155',
  },
  idBadge: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
  },
  customerName: { fontWeight: '600', color: '#1e293b' },
  catName: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  dateSub: { fontSize: '12px', color: '#94a3b8' },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  viewBtn: {
    padding: '6px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  emptyState: { padding: '40px', textAlign: 'center', color: '#94a3b8' },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', margin: '5px 0 0 0', color: '#1e293b' },
  modalId: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '5px',
  },
  modalContent: {
    padding: '24px',
    overflowY: 'auto',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase' },
  infoValue: { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
  infoSub: { fontSize: '13px', color: '#94a3b8' },

  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' },

  paymentSection: {
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #cbd5e1',
  },
  totalPrice: { fontSize: '18px', fontWeight: '800', color: '#ea580c' },

  slipContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  slipLabel: { fontSize: '14px', fontWeight: '500', color: '#475569', margin: 0 },
  slipLink: { display: 'block', textAlign: 'center', backgroundColor: 'white', padding: '10px', borderRadius: '8px' },
  slipImage: {
    maxWidth: '100%',
    maxHeight: '250px',
    objectFit: 'contain',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '10px',
  },
  approveBtn: {
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
  },
  rejectBtn: {
    padding: '12px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  noSlip: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '14px',
  },

  statusManagement: {},
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    marginTop: '15px',
  },
  statusOptionBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.1s',
  },
}