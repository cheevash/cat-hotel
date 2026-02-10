'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    price_per_night: '',
    description: '',
    is_available: true,
    image_url: ''
  })

  const roomTypes = [
    { value: 'Standard', label: '🏠 Standard', color: '#3b82f6' },
    { value: 'Deluxe', label: '🏰 Deluxe', color: '#8b5cf6' },
    { value: 'VIP', label: '👑 VIP', color: '#f59e0b' },
  ]

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_type', { ascending: true })

    if (error) console.error(error)
    else setRooms(data || [])
    setLoading(false)
  }

  const openAddModal = () => {
    setEditingRoom(null)
    setFormData({
      room_number: '',
      room_type: 'Standard',
      price_per_night: '',
      description: '',
      is_available: true,
      image_url: ''
    })
    setShowModal(true)
  }

  const openEditModal = (room) => {
    setEditingRoom(room)
    setFormData({
      room_number: room.room_number || '',
      room_type: room.room_type || 'Standard',
      price_per_night: room.price_per_night || '',
      description: room.description || '',
      is_available: room.is_available ?? true,
      image_url: room.image_url || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const roomData = {
      room_number: formData.room_number,
      room_type: formData.room_type,
      price_per_night: formData.price_per_night,
      description: formData.description,
      is_available: formData.is_available,
      image_url: formData.image_url || null
    }

    if (editingRoom) {
      const { error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', editingRoom.id)

      if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
      else {
        alert('แก้ไขห้องสำเร็จ! ✅')
        setShowModal(false)
        fetchRooms()
      }
    } else {
      const { error } = await supabase
        .from('rooms')
        .insert([roomData])

      if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
      else {
        alert('เพิ่มห้องใหม่สำเร็จ! ✅')
        setShowModal(false)
        fetchRooms()
      }
    }
  }

  const handleDelete = async (id, roomNumber) => {
    if (confirm(`ยืนยันว่าจะลบห้อง "${roomNumber}" ใช่หรือไม่?`)) {
      const { error } = await supabase.from('rooms').delete().eq('id', id)
      if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
      else fetchRooms()
    }
  }

  const toggleAvailability = async (id, currentStatus) => {
    const { error } = await supabase
      .from('rooms')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
    else fetchRooms()
  }

  const getTypeInfo = (type) => {
    return roomTypes.find(t => t.value === type) || roomTypes[0]
  }

  const getRoomImage = (room) => {
    if (room.image_url) return room.image_url
    const images = {
      'Standard': 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&h=300&fit=crop',
      'Deluxe': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
      'VIP': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
    }
    return images[room.room_type] || images['Standard']
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <span style={styles.loadingIcon}>🏨</span>
        <p>กำลังโหลดข้อมูลห้อง...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏨 จัดการห้องพัก</h1>
          <p style={styles.subtitle}>เพิ่ม แก้ไข หรือลบห้องพักของโรงแรม</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>➕ เพิ่มห้องใหม่</button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{rooms.length}</span>
          <span style={styles.statLabel}>ห้องทั้งหมด</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#10b981' }}>
            {rooms.filter(r => r.is_available === true || r.is_available === 'true').length}
          </span>
          <span style={styles.statLabel}>✅ ว่าง</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#ef4444' }}>
            {rooms.filter(r => r.is_available === false || r.is_available === 'false').length}
          </span>
          <span style={styles.statLabel}>🚫 ไม่ว่าง</span>
        </div>
        {roomTypes.map(type => (
          <div key={type.value} style={{ ...styles.statCard, borderLeft: `4px solid ${type.color}` }}>
            <span style={{ ...styles.statNumber, color: type.color }}>
              {rooms.filter(r => r.room_type === type.value).length}
            </span>
            <span style={styles.statLabel}>{type.label}</span>
          </div>
        ))}
      </div>

      {/* Rooms Grid */}
      <div style={styles.roomsGrid}>
        {rooms.map(room => {
          const typeInfo = getTypeInfo(room.room_type)
          const isAvailable = room.is_available === true || room.is_available === 'true'
          return (
            <div key={room.id} style={styles.roomCard}>
              <div style={styles.roomImage}>
                <img src={getRoomImage(room)} alt={room.room_number} style={styles.roomImg} />
                <span style={{
                  ...styles.availabilityBadge,
                  backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2',
                  color: isAvailable ? '#166534' : '#dc2626'
                }}>
                  {isAvailable ? '✅ ว่าง' : '🚫 ไม่ว่าง'}
                </span>
                <span style={{
                  ...styles.typeBadge,
                  backgroundColor: typeInfo.color + '20',
                  color: typeInfo.color,
                  borderColor: typeInfo.color
                }}>
                  {typeInfo.label}
                </span>
              </div>

              <div style={styles.roomInfo}>
                <div style={styles.roomHeader}>
                  <h3 style={styles.roomNumber}>ห้อง {room.room_number}</h3>
                  <span style={styles.roomPrice}>{Number(room.price_per_night).toLocaleString()} ฿/คืน</span>
                </div>
                <p style={styles.roomDesc}>{room.description || 'ไม่มีคำอธิบาย'}</p>
              </div>

              <div style={styles.roomActions}>
                <button
                  onClick={() => toggleAvailability(room.id, isAvailable)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: isAvailable ? '#fee2e2' : '#dcfce7',
                    color: isAvailable ? '#dc2626' : '#166534'
                  }}
                >
                  {isAvailable ? '🚫 ปิดห้อง' : '✅ เปิดห้อง'}
                </button>
                <button onClick={() => openEditModal(room)} style={styles.editBtn}>✏️ แก้ไข</button>
                <button onClick={() => handleDelete(room.id, room.room_number)} style={styles.deleteBtn}>🗑️</button>
              </div>
            </div>
          )
        })}

        {rooms.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🏨</span>
            <p>ยังไม่มีห้องพัก กดปุ่ม "เพิ่มห้องใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingRoom ? '✏️ แก้ไขห้อง' : '➕ เพิ่มห้องใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>หมายเลขห้อง *</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                    style={styles.input}
                    placeholder="เช่น S01, D01, V01"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ประเภทห้อง *</label>
                  <select
                    value={formData.room_type}
                    onChange={e => setFormData({ ...formData, room_type: e.target.value })}
                    style={styles.input}
                    required
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ราคาต่อคืน (บาท) *</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={e => setFormData({ ...formData, price_per_night: e.target.value })}
                    style={styles.input}
                    placeholder="เช่น 350"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>สถานะ</label>
                  <select
                    value={formData.is_available}
                    onChange={e => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                    style={styles.input}
                  >
                    <option value="true">✅ ว่าง</option>
                    <option value="false">🚫 ไม่ว่าง</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>คำอธิบายห้อง</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, minHeight: '80px' }}
                  placeholder="เช่น ห้องกว้างขวาง มีเครื่องปรับอากาศ..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>URL รูปภาพ</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  style={styles.input}
                  placeholder="https://example.com/room.jpg"
                />
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingRoom ? '💾 บันทึก' : '➕ เพิ่มห้อง'}
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
  addBtn: { padding: '14px 28px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },

  // Stats
  statsRow: { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' },
  statCard: { backgroundColor: '#fff', padding: '18px 25px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' },
  statNumber: { fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' },
  statLabel: { color: '#64748b', fontSize: '0.85rem' },

  // Grid
  roomsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  roomCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  roomImage: { position: 'relative', height: '180px' },
  roomImg: { width: '100%', height: '100%', objectFit: 'cover' },
  availabilityBadge: { position: 'absolute', top: '12px', left: '12px', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' },
  typeBadge: { position: 'absolute', top: '12px', right: '12px', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', border: '2px solid' },
  roomInfo: { padding: '20px' },
  roomHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  roomNumber: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  roomPrice: { fontSize: '1.1rem', fontWeight: 'bold', color: '#ea580c' },
  roomDesc: { color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  roomActions: { display: 'flex', gap: '10px', padding: '0 20px 20px' },
  toggleBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  editBtn: { padding: '10px 15px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { padding: '10px 15px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer' },

  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#94a3b8' },
  emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 25px 0' },
  modalTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  closeBtn: { width: '36px', height: '36px', border: 'none', borderRadius: '50%', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1.1rem' },

  form: { padding: '25px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
  formActions: { display: 'flex', gap: '15px', marginTop: '25px' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { flex: 2, padding: '14px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
}