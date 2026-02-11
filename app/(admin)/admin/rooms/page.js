'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    price_per_night: '',
    description: '',
    is_available: true,
    room_size: '',
    capacity: '',
    images: [], // Array of URLs
    amenities: [], // Array of strings (simplified for now, or objects)
    rules: [] // Array of strings
  })

  // Temporary state for inputs
  const [newAmenity, setNewAmenity] = useState('')
  const [newRule, setNewRule] = useState('')

  const roomTypes = [
    { value: 'Standard', label: '🏠 Standard', color: '#3b82f6' },
    { value: 'Deluxe', label: '🏰 Deluxe', color: '#8b5cf6' },
    { value: 'VIP', label: '👑 VIP', color: '#f59e0b' },
  ]

  const suggestedAmenities = [
    'เครื่องปรับอากาศ', 'พัดลม', 'กล้องวงจรปิดส่วนตัว', 'ของเล่นแมว',
    'คอนโดแมว', 'ชามอาหารเซรามิก', 'น้ำพุแมว', 'กระบะทรายส่วนตัว'
  ]

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true })

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
      room_size: '',
      capacity: '',
      images: [],
      amenities: [],
      rules: []
    })
    setNewAmenity('')
    setNewRule('')
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
      room_size: room.room_size || '',
      capacity: room.capacity || '',
      images: room.images || [],
      amenities: Array.isArray(room.amenities) ? room.amenities : [], // Ensure array
      rules: room.rules || []
    })
    setNewAmenity('')
    setNewRule('')
    setShowModal(true)
  }

  // --- Handlers for Dynamic Lists ---

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      })
      setNewAmenity('')
    }
  }

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    })
  }

  const toggleSuggestedAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      })
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      })
    }
  }

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()]
      })
      setNewRule('')
    }
  }

  const removeRule = (index) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index)
    })
  }

  // --- Image Upload ---

  const handleImageUpload = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      setUploading(true)

      const files = Array.from(e.target.files)
      const newImageUrls = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `rooms/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('rooms')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('rooms').getPublicUrl(filePath)
        newImageUrls.push(data.publicUrl)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }))

    } catch (error) {
      Swal.fire('Upload Error', error.message, 'error')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      room_number: formData.room_number,
      room_type: formData.room_type,
      price_per_night: formData.price_per_night,
      description: formData.description,
      is_available: formData.is_available,
      room_size: formData.room_size,
      capacity: formData.capacity,
      images: formData.images,
      amenities: formData.amenities, // Send as JSONB/Array
      rules: formData.rules
    }

    // Fallback for single image_url column if used by other parts of app
    // We update it to be the first image in the list
    const legacyImageUrl = formData.images.length > 0 ? formData.images[0] : null

    // Check if 'image_url' column exists in your schema schema before sending. 
    // Assuming we keep it for backward compatibility or ease of use.
    // If you strictly migrated to 'images', you might not need 'image_url' anymore.
    // But mostly likely we should keep it populated.
    const finalPayload = { ...payload, image_url: legacyImageUrl }

    let error
    if (editingRoom) {
      const { error: updateError } = await supabase
        .from('rooms')
        .update(finalPayload)
        .eq('id', editingRoom.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('rooms')
        .insert([finalPayload])
      error = insertError
    }

    if (error) {
      Swal.fire('Error', error.message, 'error')
    } else {
      Swal.fire({
        title: 'บันทึกสำเร็จ! ✅',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
      setShowModal(false)
      fetchRooms()
    }
  }

  const handleDelete = async (id, roomNumber) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบห้อง "${roomNumber}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      const { error } = await supabase.from('rooms').delete().eq('id', id)
      if (error) Swal.fire('Error', error.message, 'error')
      else {
        Swal.fire('ลบเรียบร้อย!', '', 'success')
        fetchRooms()
      }
    }
  }

  const getTypeInfo = (type) => roomTypes.find(t => t.value === type) || roomTypes[0]

  const getPrimaryImage = (room) => {
    if (room.images && room.images.length > 0) return room.images[0]
    if (room.image_url) return room.image_url
    return 'https://placehold.co/400x300?text=No+Image'
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>
        <p>กำลังโหลดข้อมูลห้อง...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏨 จัดการห้องพัก</h1>
          <p style={styles.subtitle}>เพิ่มข้อมูล รูปภาพ และสิ่งอำนวยความสะดวก</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>➕ เพิ่มห้องใหม่</button>
      </div>

      <div style={styles.roomsGrid}>
        {rooms.map(room => {
          const typeInfo = getTypeInfo(room.room_type)
          const isAvailable = room.is_available === true || room.is_available === 'true'
          return (
            <div key={room.id} style={styles.roomCard}>
              <div style={styles.roomImageContainer}>
                <img src={getPrimaryImage(room)} alt={room.room_number} style={styles.roomImg} />
                <span style={{ ...styles.badge, backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2', color: isAvailable ? '#166534' : '#dc2626' }}>
                  {isAvailable ? '✅ ว่าง' : '🚫 ไม่ว่าง'}
                </span>
                <span style={{ ...styles.typeBadge, borderColor: typeInfo.color, color: typeInfo.color }}>
                  {typeInfo.label}
                </span>
                {room.images && room.images.length > 1 && (
                  <span style={styles.imageCountBadge}>📷 {room.images.length} รูป</span>
                )}
              </div>
              <div style={styles.roomInfo}>
                <div style={styles.roomHeader}>
                  <h3 style={styles.roomNumber}>ห้อง {room.room_number}</h3>
                  <span style={styles.roomPrice}>{Number(room.price_per_night).toLocaleString()} ฿</span>
                </div>
                <p style={styles.roomDesc}>{room.description || 'ไม่มีคำอธิบาย'}</p>

                {/* Mini details */}
                <div style={styles.miniDetails}>
                  {room.room_size && <span style={styles.miniDetailItem}>📏 {room.room_size}</span>}
                  {room.capacity && <span style={styles.miniDetailItem}>👥 {room.capacity}</span>}
                </div>
              </div>
              <div style={styles.roomActions}>
                <button onClick={() => openEditModal(room)} style={styles.editBtn}>✏️ แก้ไข</button>
                <button onClick={() => handleDelete(room.id, room.room_number)} style={styles.deleteBtn}>🗑️ ลบ</button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingRoom ? '✏️ แก้ไขห้อง' : '➕ เพิ่มห้องใหม่'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              {/* --- Basic Info --- */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>ข้อมูลพื้นฐาน</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>หมายเลขห้อง *</label>
                    <input type="text" value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} style={styles.input} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ประเภทห้อง *</label>
                    <select value={formData.room_type} onChange={e => setFormData({ ...formData, room_type: e.target.value })} style={styles.input}>
                      {roomTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ราคาต่อคืน (บาท) *</label>
                    <input type="number" value={formData.price_per_night} onChange={e => setFormData({ ...formData, price_per_night: e.target.value })} style={styles.input} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>สถานะ</label>
                    <select value={formData.is_available} onChange={e => setFormData({ ...formData, is_available: e.target.value === 'true' })} style={styles.input}>
                      <option value="true">✅ ว่าง</option>
                      <option value="false">🚫 ไม่ว่าง</option>
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ขนาดห้อง (เช่น 4x4 ม.)</label>
                    <input type="text" value={formData.room_size} onChange={e => setFormData({ ...formData, room_size: e.target.value })} style={styles.input} placeholder="ระบุขนาด..." />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>รองรับได้ (ตัว)</label>
                    <input type="text" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} style={styles.input} placeholder="เช่น 2 ตัว" />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>คำอธิบายห้อง</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...styles.input, minHeight: '80px' }} />
                </div>
              </div>

              {/* --- Images --- */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>รูปภาพห้องพัก ({formData.images.length})</h3>
                <div style={styles.imageUploadArea}>
                  <input type="file" id="multi-upload" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  <label htmlFor="multi-upload" style={styles.uploadBtn}>
                    {uploading ? '⏳ กำลังอัปโหลด...' : '📸 เพิ่มรูปภาพ'}
                  </label>
                </div>
                <div style={styles.imageGrid}>
                  {formData.images.map((url, idx) => (
                    <div key={idx} style={styles.previewImageContainer}>
                      <img src={url} alt={`Preview ${idx}`} style={styles.previewImage} />
                      <button type="button" onClick={() => removeImage(idx)} style={styles.removeImageBtn}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Amenities --- */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>สิ่งอำนวยความสะดวก</h3>
                <div style={styles.suggestedTags}>
                  {suggestedAmenities.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSuggestedAmenity(item)}
                      style={{
                        ...styles.tag,
                        backgroundColor: formData.amenities.includes(item) ? '#3b82f6' : '#e2e8f0',
                        color: formData.amenities.includes(item) ? 'white' : '#475569'
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div style={styles.addItemRow}>
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    placeholder="เพิ่มสิ่งอำนวยความสะดวกอื่นๆ..."
                    style={styles.addInput}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <button type="button" onClick={addAmenity} style={styles.addSmallBtn}>เพิ่ม</button>
                </div>
                <div style={styles.listContainer}>
                  {formData.amenities.map((item, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <span>• {item}</span>
                      <button type="button" onClick={() => removeAmenity(idx)} style={styles.deleteIconBtn}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Rules --- */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>กฎการเข้าพัก / หมายเหตุ</h3>
                <div style={styles.addItemRow}>
                  <input
                    type="text"
                    value={newRule}
                    onChange={e => setNewRule(e.target.value)}
                    placeholder="เพิ่มกฎระเบียบ..."
                    style={styles.addInput}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  />
                  <button type="button" onClick={addRule} style={styles.addSmallBtn}>เพิ่ม</button>
                </div>
                <div style={styles.listContainer}>
                  {formData.rules.map((item, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <span>⚠️ {item}</span>
                      <button type="button" onClick={() => removeRule(idx)} style={styles.deleteIconBtn}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                <button type="submit" style={styles.submitBtn}>💾 บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', color: '#334155' },
  loadingPage: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '1.8rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '800' },
  subtitle: { color: '#64748b', margin: 0, fontSize: '0.95rem' },
  addBtn: { padding: '12px 24px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3)' },

  roomsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  roomCard: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' },
  roomImageContainer: { position: 'relative', height: '200px', backgroundColor: '#e2e8f0' },
  roomImg: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  typeBadge: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid', backgroundColor: 'white' },
  imageCountBadge: { position: 'absolute', bottom: '10px', right: '10px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' },

  roomInfo: { padding: '20px', flex: 1 },
  roomHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  roomNumber: { fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  roomPrice: { fontSize: '1.1rem', fontWeight: '700', color: '#ea580c' },
  roomDesc: { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

  miniDetails: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  miniDetailItem: { fontSize: '0.8rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' },

  roomActions: { padding: '15px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' },
  editBtn: { flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { padding: '8px 15px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'   // ❗ สำคัญ
  }, modalHeader: { padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 },
  modalTitle: { fontSize: '1.5rem', fontWeight: '700', margin: 0 },
  closeBtn: { fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },

  form: {
    padding: '30px',
    overflowY: 'auto',
    flex: 1
  }, section: {
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  }, sectionHeader: { fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },

  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#475569' },
  input: { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },

  // Image Upload
  imageUploadArea: { marginBottom: '20px' },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' },
  previewImageContainer: { position: 'relative', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  removeImageBtn: { position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },

  // List Items
  suggestedTags: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' },
  tag: { padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' },

  addItemRow: { display: 'flex', gap: '10px', marginBottom: '15px' },
  addInput: { flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none' },
  addSmallBtn: { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },

  listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' },
  deleteIconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.7, hover: { opacity: 1 } },

  formActions: {
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff'
  }
}