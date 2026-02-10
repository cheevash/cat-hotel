'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const statusOptions = [
    { value: 'Pending', label: '⏳ รอยืนยัน', color: '#f59e0b', bg: '#fef3c7' },
    { value: 'Confirmed', label: '✅ ยืนยันแล้ว', color: '#10b981', bg: '#dcfce7' },
    { value: 'CheckedIn', label: '🏠 เช็คอินแล้ว', color: '#3b82f6', bg: '#dbeafe' },
    { value: 'CheckedOut', label: '🚪 เช็คเอาท์แล้ว', color: '#6b7280', bg: '#f3f4f6' },
    { value: 'Cancelled', label: '❌ ยกเลิก', color: '#ef4444', bg: '#fee2e2' },
  ]

  const paymentOptions = [
    { value: 'Unpaid', label: '💳 ยังไม่ชำระ', color: '#ef4444', bg: '#fee2e2' },
    { value: 'PendingApproval', label: '⏳ รอตรวจสอบ', color: '#f59e0b', bg: '#fef3c7' },
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
      // Try simpler query if the join fails
      const { data: simpleData, error: simpleError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (simpleError) console.error(simpleError)
      else setBookings(simpleData || [])
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (bookingId, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      fetchBookings()
      setSelectedBooking(null)
    }
  }

  const updatePaymentStatus = async (bookingId, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: newStatus })
      .eq('id', bookingId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      fetchBookings()
    }
  }

  const approvePayment = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Paid', status: 'Confirmed' })
      .eq('id', bookingId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('อนุมัติการชำระเงินเรียบร้อย ✅')
      fetchBookings()
      setSelectedBooking(null)
    }
  }

  const rejectPayment = async (bookingId) => {
    if (!confirm('ยืนยันปฏิเสธการชำระเงินนี้?')) return
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Unpaid', status: 'Pending' })
      .eq('id', bookingId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('ปฏิเสธการชำระเงินแล้ว')
      fetchBookings()
      setSelectedBooking(null)
    }
  }

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const getPaymentInfo = (status) => {
    return paymentOptions.find(s => s.value === status) || paymentOptions[0]
  }

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1
    const diff = new Date(checkOut) - new Date(checkIn)
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return nights < 1 ? 1 : nights
  }

  const getRoomName = (booking) => {
    if (booking.rooms?.name) return booking.rooms.name
    if (booking.rooms?.room_type) return booking.rooms.room_type
    return `ห้อง ${booking.room_id?.slice(0, 8) || '-'}`
  }

  const handlePrint = (booking) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบจอง - ${getRoomName(booking)}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ea580c; padding-bottom: 20px; }
          .header h1 { color: #ea580c; margin: 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; }
          .value { font-weight: bold; }
          .total { font-size: 1.5em; color: #ea580c; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐱 Cat Hotel</h1>
          <p>ใบยืนยันการจอง</p>
        </div>
        <div class="info-row"><span class="label">เลขที่จอง:</span><span class="value">${booking.id?.slice(0, 8).toUpperCase()}</span></div>
        <div class="info-row"><span class="label">ลูกค้า:</span><span class="value">${booking.profiles?.first_name || '-'} ${booking.profiles?.last_name || ''}</span></div>
        <div class="info-row"><span class="label">แมว:</span><span class="value">${booking.cats?.name || '-'}</span></div>
        <div class="info-row"><span class="label">ห้อง:</span><span class="value">${getRoomName(booking)}</span></div>
        <div class="info-row"><span class="label">วันเช็คอิน:</span><span class="value">${formatDate(booking.check_in_date)}</span></div>
        <div class="info-row"><span class="label">วันเช็คเอาท์:</span><span class="value">${formatDate(booking.check_out_date)}</span></div>
        <div class="info-row"><span class="label">สถานะ:</span><span class="value">${getStatusInfo(booking.status).label}</span></div>
        <div class="info-row"><span class="label">การชำระเงิน:</span><span class="value">${getPaymentInfo(booking.payment_status).label}</span></div>
        <div class="total">ยอดรวม: ${Number(booking.total_price || 0).toLocaleString()} บาท</div>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <span style={styles.loadingIcon}>📅</span>
        <p>กำลังโหลดข้อมูลการจอง...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 จัดการการจอง</h1>
          <p style={styles.subtitle}>ดูและจัดการรายการจองทั้งหมด ({bookings.length} รายการ)</p>
        </div>
        <button onClick={fetchBookings} style={styles.refreshBtn}>🔄 รีเฟรช</button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {statusOptions.map(status => {
          const count = bookings.filter(b => b.status === status.value).length
          return (
            <div
              key={status.value}
              style={{ ...styles.statCard, borderLeft: `4px solid ${status.color}` }}
              onClick={() => setFilter(status.value)}
            >
              <span style={{ ...styles.statNumber, color: status.color }}>{count}</span>
              <span style={styles.statLabel}>{status.label}</span>
            </div>
          )
        })}
      </div>

      {/* Payment Stats */}
      <div style={styles.paymentStats}>
        <div style={styles.paymentStatItem}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ ชำระแล้ว:</span>
          <span>{bookings.filter(b => b.payment_status === 'Paid').length} รายการ</span>
        </div>
        <div style={styles.paymentStatItem}>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ รอตรวจสอบ:</span>
          <span>{bookings.filter(b => b.payment_status === 'PendingApproval').length} รายการ</span>
        </div>
        <div style={styles.paymentStatItem}>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>💳 รอชำระ:</span>
          <span>{bookings.filter(b => b.payment_status === 'Unpaid').length} รายการ</span>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        <button
          onClick={() => setFilter('all')}
          style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
        >ทั้งหมด ({bookings.length})</button>
        {statusOptions.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            style={filter === s.value ? styles.filterBtnActive : styles.filterBtn}
          >{s.label.split(' ')[0]}</button>
        ))}
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>เลขที่จอง</th>
                <th style={styles.th}>ลูกค้า / แมว</th>
                <th style={styles.th}>ห้อง</th>
                <th style={styles.th}>วันเข้าพัก</th>
                <th style={styles.th}>ยอดรวม</th>
                <th style={styles.th}>สถานะ</th>
                <th style={styles.th}>การชำระ</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const statusInfo = getStatusInfo(booking.status)
                const paymentInfo = getPaymentInfo(booking.payment_status)
                return (
                  <tr key={booking.id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.bookingId}>{booking.id?.slice(0, 8).toUpperCase()}</code>
                    </td>
                    <td style={styles.td}>
                      <strong>{booking.profiles?.first_name || '-'} {booking.profiles?.last_name || ''}</strong>
                      <br />
                      <small style={styles.subText}>🐱 {booking.cats?.name || '-'}</small>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roomBadge}>{getRoomName(booking)}</span>
                    </td>
                    <td style={styles.td}>
                      {formatDate(booking.check_in_date)}
                      <br />
                      <small style={styles.subText}>→ {formatDate(booking.check_out_date)}</small>
                    </td>
                    <td style={styles.td}>
                      <strong style={styles.price}>{Number(booking.total_price || 0).toLocaleString()} ฿</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        onClick={() => updatePaymentStatus(booking.id, booking.payment_status === 'Paid' ? 'Unpaid' : 'Paid')}
                        style={{
                          ...styles.paymentBadge,
                          backgroundColor: paymentInfo.bg,
                          color: paymentInfo.color,
                          cursor: 'pointer'
                        }}
                      >
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          style={styles.actionBtn}
                          title="เปลี่ยนสถานะ"
                        >📝</button>
                        <button
                          onClick={() => handlePrint(booking)}
                          style={styles.actionBtn}
                          title="พิมพ์ใบจอง"
                        >🖨️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    ไม่พบรายการจอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for status change */}
      {selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📝 จัดการการจอง</h2>
              <button onClick={() => setSelectedBooking(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.bookingDetail}>
                <p><strong>เลขที่:</strong> {selectedBooking.id?.slice(0, 8).toUpperCase()}</p>
                <p><strong>ลูกค้า:</strong> {selectedBooking.profiles?.first_name || '-'} {selectedBooking.profiles?.last_name || ''}</p>
                <p><strong>แมว:</strong> {selectedBooking.cats?.name || '-'} ({selectedBooking.cats?.breed || '-'})</p>
                <p><strong>ห้อง:</strong> {getRoomName(selectedBooking)}</p>
                <p><strong>วันเข้าพัก:</strong> {formatDate(selectedBooking.check_in_date)} → {formatDate(selectedBooking.check_out_date)}</p>
                <p><strong>ยอดรวม:</strong> <span style={styles.price}>{Number(selectedBooking.total_price || 0).toLocaleString()} บาท</span></p>
                <p><strong>การชำระเงิน:</strong> {getPaymentInfo(selectedBooking.payment_status).label}</p>
              </div>

              {/* Payment Slip Viewer */}
              {selectedBooking.payment_slip_url && (
                <div style={styles.slipSection}>
                  <h4 style={styles.slipTitle}>🧾 หลักฐานการโอนเงิน</h4>
                  <div style={styles.slipImageWrapper}>
                    <img
                      src={selectedBooking.payment_slip_url}
                      alt="สลิปการโอนเงิน"
                      style={styles.slipImage}
                      onClick={() => window.open(selectedBooking.payment_slip_url, '_blank')}
                    />
                  </div>
                  {selectedBooking.payment_status === 'PendingApproval' && (
                    <div style={styles.approvalButtons}>
                      <button
                        onClick={() => approvePayment(selectedBooking.id)}
                        style={styles.approveBtn}
                      >
                        ✅ อนุมัติการชำระเงิน
                      </button>
                      <button
                        onClick={() => rejectPayment(selectedBooking.id)}
                        style={styles.rejectBtn}
                      >
                        ❌ ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h4 style={styles.changeStatusTitle}>เปลี่ยนสถานะการจอง:</h4>
              <div style={styles.statusButtons}>
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => updateStatus(selectedBooking.id, status.value)}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: selectedBooking.status === status.value ? status.color : status.bg,
                      color: selectedBooking.status === status.value ? 'white' : status.color,
                      border: `2px solid ${status.color}`
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#ea580c' },
  loadingIcon: { fontSize: '3rem' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '700' },
  subtitle: { color: '#64748b', margin: 0 },
  refreshBtn: { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },

  // Stats
  statsRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
  statCard: { backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer', minWidth: '100px' },
  statNumber: { fontSize: '1.5rem', fontWeight: '800', display: 'block' },
  statLabel: { color: '#64748b', fontSize: '0.8rem' },
  paymentStats: { display: 'flex', gap: '25px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px' },
  paymentStatItem: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem' },

  // Filter
  filterRow: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  filterBtnActive: { padding: '8px 16px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' },

  // Table
  tableCard: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
  thRow: { backgroundColor: '#f8fafc' },
  th: { padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px', color: '#334155', fontSize: '0.9rem', verticalAlign: 'top' },
  bookingId: { backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' },
  subText: { color: '#94a3b8', fontSize: '0.8rem' },
  roomBadge: { backgroundColor: '#fff7ed', color: '#ea580c', padding: '3px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  price: { color: '#ea580c', fontSize: '1rem' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' },
  paymentBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' },
  actions: { display: 'flex', gap: '8px', justifyContent: 'center' },
  actionBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '8px', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1rem' },
  emptyCell: { padding: '50px', textAlign: 'center', color: '#94a3b8' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  closeBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '50%', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1rem' },
  modalBody: { padding: '25px' },
  bookingDetail: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  changeStatusTitle: { marginBottom: '15px', color: '#374151' },
  statusButtons: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statusBtn: { padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s' },

  // Payment Slip
  slipSection: { marginBottom: '20px', padding: '20px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' },
  slipTitle: { fontSize: '1rem', color: '#b45309', margin: '0 0 15px', fontWeight: '700' },
  slipImageWrapper: { textAlign: 'center', marginBottom: '15px' },
  slipImage: { maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', objectFit: 'contain' },
  approvalButtons: { display: 'flex', gap: '10px' },
  approveBtn: { flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' },
  rejectBtn: { flex: 1, padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: '2px solid #fecaca', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' },
}