'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerBookings, setCustomerBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editModal, setEditModal] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setCustomers(data || [])
    setLoading(false)
  }

  const fetchCustomerBookings = async (customerId) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type)')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false })

    setCustomerBookings(data || [])
  }

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer)
    await fetchCustomerBookings(customer.id)
  }

  const handleEditCustomer = (customer) => {
    setFormData({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    })
    setEditModal(customer)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', editModal.id)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('บันทึกข้อมูลสำเร็จ! ✅')
      setEditModal(null)
      fetchCustomers()
    }
  }

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase()
    return (
      c.first_name?.toLowerCase().includes(query) ||
      c.last_name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    )
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'Pending': '⏳ รอยืนยัน',
      'Confirmed': '✅ ยืนยันแล้ว',
      'CheckedIn': '🏠 เช็คอินแล้ว',
      'CheckedOut': '🚪 เช็คเอาท์แล้ว',
      'Cancelled': '❌ ยกเลิก'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <span style={styles.loadingIcon}>👥</span>
        <p>กำลังโหลดข้อมูลลูกค้า...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 จัดการลูกค้า</h1>
          <p style={styles.subtitle}>ดูข้อมูลและประวัติการจองของลูกค้า</p>
        </div>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{customers.length}</span>
          <span style={styles.statLabel}>ลูกค้าทั้งหมด</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#10b981' }}>
            {customers.filter(c => c.role === 'user').length}
          </span>
          <span style={styles.statLabel}>ลูกค้าปกติ</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#8b5cf6' }}>
            {customers.filter(c => c.role === 'admin').length}
          </span>
          <span style={styles.statLabel}>แอดมิน</span>
        </div>
      </div>

      {/* Customers Grid */}
      <div style={styles.customersGrid}>
        {filteredCustomers.map(customer => (
          <div key={customer.id} style={styles.customerCard}>
            <div style={styles.customerHeader}>
              <div style={styles.avatar}>
                {customer.avatar_url ? (
                  <img src={customer.avatar_url} alt="" style={styles.avatarImg} />
                ) : (
                  <span>{customer.first_name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <h3 style={styles.customerName}>
                  {customer.first_name} {customer.last_name}
                </h3>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: customer.role === 'admin' ? '#ede9fe' : '#f0fdf4',
                  color: customer.role === 'admin' ? '#7c3aed' : '#16a34a'
                }}>
                  {customer.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>

            <div style={styles.customerInfo}>
              <p><span style={styles.infoIcon}>📧</span> {customer.email || '-'}</p>
              <p><span style={styles.infoIcon}>📱</span> {customer.phone || 'ไม่ระบุ'}</p>
              <p><span style={styles.infoIcon}>📅</span> สมัคร: {formatDate(customer.created_at)}</p>
            </div>

            <div style={styles.customerActions}>
              <button onClick={() => handleViewCustomer(customer)} style={styles.viewBtn}>
                📋 ดูประวัติ
              </button>
              <button onClick={() => handleEditCustomer(customer)} style={styles.editBtn}>
                ✏️ แก้ไข
              </button>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <p>ไม่พบลูกค้าที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* View History Modal */}
      {selectedCustomer && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📋 ประวัติการจอง</h2>
              <button onClick={() => setSelectedCustomer(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.customerSummary}>
                <div style={styles.summaryAvatar}>
                  {selectedCustomer.first_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedCustomer.first_name} {selectedCustomer.last_name}</h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>{selectedCustomer.email}</p>
                </div>
              </div>

              <div style={styles.bookingsStats}>
                <div style={styles.bookingStat}>
                  <span style={styles.bookingStatNum}>{customerBookings.length}</span>
                  <span style={styles.bookingStatLabel}>การจองทั้งหมด</span>
                </div>
                <div style={styles.bookingStat}>
                  <span style={{ ...styles.bookingStatNum, color: '#10b981' }}>
                    {customerBookings.filter(b => b.status === 'Confirmed' || b.status === 'CheckedOut').length}
                  </span>
                  <span style={styles.bookingStatLabel}>สำเร็จ</span>
                </div>
              </div>

              <h4 style={styles.historyTitle}>รายการจอง</h4>
              <div style={styles.bookingsList}>
                {customerBookings.length === 0 ? (
                  <p style={styles.noBookings}>ยังไม่มีประวัติการจอง</p>
                ) : (
                  customerBookings.map(booking => (
                    <div key={booking.id} style={styles.bookingItem}>
                      <div style={styles.bookingMain}>
                        <strong>{booking.rooms?.room_type}</strong>
                        <span style={styles.bookingRoom}>ห้อง {booking.rooms?.room_number}</span>
                      </div>
                      <div style={styles.bookingMeta}>
                        <span>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</span>
                        <span style={styles.bookingPrice}>{Number(booking.total_price || 0).toLocaleString()} ฿</span>
                      </div>
                      <span style={styles.bookingStatus}>{getStatusLabel(booking.status)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✏️ แก้ไขข้อมูลลูกค้า</h2>
              <button onClick={() => setEditModal(null)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ชื่อ</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>นามสกุล</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</label>
                <input
                  type="email"
                  value={formData.email}
                  style={{ ...styles.input, backgroundColor: '#f1f5f9' }}
                  disabled
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                  placeholder="0xx-xxx-xxxx"
                />
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setEditModal(null)} style={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" style={styles.submitBtn}>
                  💾 บันทึก
                </button>
              </div>
            </form>
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

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '700' },
  subtitle: { color: '#64748b', margin: 0 },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '12px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '280px' },
  searchIcon: { marginRight: '10px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '1rem', flex: 1 },

  // Stats
  statsRow: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  statCard: { backgroundColor: '#fff', padding: '20px 30px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' },
  statNumber: { fontSize: '2rem', fontWeight: '800', color: '#1e293b' },
  statLabel: { color: '#64748b', fontSize: '0.9rem' },

  // Grid
  customersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  customerCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  customerHeader: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold' },
  avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
  customerName: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 5px' },
  roleBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  customerInfo: { borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginBottom: '15px' },
  infoIcon: { marginRight: '8px' },
  customerActions: { display: 'flex', gap: '10px' },
  viewBtn: { flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  editBtn: { flex: 1, padding: '10px', backgroundColor: '#fff7ed', color: '#ea580c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },

  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '15px' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  closeBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '50%', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1rem' },
  modalBody: { padding: '25px' },

  // Customer Summary
  customerSummary: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' },
  summaryAvatar: { width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' },
  bookingsStats: { display: 'flex', gap: '20px', marginBottom: '20px' },
  bookingStat: { flex: 1, backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center' },
  bookingStatNum: { display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' },
  bookingStatLabel: { color: '#64748b', fontSize: '0.85rem' },
  historyTitle: { marginBottom: '15px', color: '#374151' },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflow: 'auto' },
  noBookings: { textAlign: 'center', color: '#94a3b8', padding: '30px' },
  bookingItem: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px' },
  bookingMain: { marginBottom: '8px' },
  bookingRoom: { color: '#64748b', fontSize: '0.85rem', marginLeft: '10px' },
  bookingMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' },
  bookingPrice: { fontWeight: 'bold', color: '#ea580c' },
  bookingStatus: { fontSize: '0.8rem' },

  // Form
  form: { padding: '25px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
  formActions: { display: 'flex', gap: '15px', marginTop: '25px' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { flex: 2, padding: '14px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
}