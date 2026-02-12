'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Form State
  const [formData, setFormData] = useState({
    caption: '',
    category: 'น้องแมวที่เคยมาพัก',
    image_url: ''
  })

  const categories = [
    { value: 'ห้องพัก', label: '🏨 ห้องพัก' },
    { value: 'น้องแมวที่เคยมาพัก', label: '🐱 น้องแมวที่เคยมาพัก' },
    { value: 'บรรยากาศร้าน', label: '🏪 บรรยากาศร้าน' },
    { value: 'กิจกรรม', label: '🎉 กิจกรรม' },
    { value: 'อื่นๆ', label: '📁 อื่นๆ' }
  ]

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      Swal.fire('Error', error.message, 'error')
    } else {
      setGalleryItems(data || [])
    }
    setLoading(false)
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      caption: '',
      category: 'น้องแมวที่เคยมาพัก',
      image_url: ''
    })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      caption: item.caption || '',
      category: item.category || 'น้องแมวที่เคยมาพัก',
      image_url: item.image_url || ''
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      setUploading(true)

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('gallery').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }))

      Swal.fire({
        title: 'อัปโหลดสำเร็จ! ✅',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })

    } catch (error) {
      Swal.fire('Upload Error', error.message, 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.image_url) {
      Swal.fire('กรุณาอัปโหลดรูปภาพ', '', 'warning')
      return
    }

    const payload = {
      caption: formData.caption,
      category: formData.category,
      image_url: formData.image_url
    }

    let error
    if (editingItem) {
      const { error: updateError } = await supabase
        .from('gallery')
        .update(payload)
        .eq('id', editingItem.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('gallery')
        .insert([payload])
      error = insertError
    }

    if (error) {
      Swal.fire('Error', error.message, 'error')
    } else {
      Swal.fire({
        title: editingItem ? 'แก้ไขสำเร็จ! ✅' : 'เพิ่มสำเร็จ! ✅',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
      setShowModal(false)
      fetchGalleryItems()
    }
  }

  const handleDelete = async (id, caption) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบรูปภาพ "${caption || 'ไม่มีคำบรรยาย'}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) {
        Swal.fire('Error', error.message, 'error')
      } else {
        Swal.fire('ลบเรียบร้อย!', '', 'success')
        fetchGalleryItems()
      }
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value)
    return cat ? cat.label : value
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ห้องพัก': return '#3b82f6'
      case 'น้องแมวที่เคยมาพัก': return '#f59e0b'
      case 'บรรยากาศร้าน': return '#10b981'
      case 'กิจกรรม': return '#8b5cf6'
      default: return '#64748b'
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>
        <p>กำลังโหลดข้อมูลแกลเลอรี่...</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🖼️ จัดการแกลเลอรี่</h1>
          <p style={styles.subtitle}>เพิ่ม แก้ไข และลบรูปภาพในแกลเลอรี่</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>➕ เพิ่มรูปใหม่</button>
      </div>

      {/* Filter */}
      <div style={styles.filterSection}>
        <span style={styles.filterLabel}>🔍 กรองตามหมวดหมู่:</span>
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">📁 ทั้งหมด ({galleryItems.length})</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label} ({galleryItems.filter(i => i.category === cat.value).length})
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {categories.map(cat => {
          const count = galleryItems.filter(i => i.category === cat.value).length
          return (
            <div key={cat.value} style={{ ...styles.statCard, borderLeftColor: getCategoryColor(cat.value) }}>
              <span style={styles.statIcon}>{cat.label.split(' ')[0]}</span>
              <div>
                <p style={styles.statLabel}>{cat.label.split(' ')[1]}</p>
                <p style={{ ...styles.statValue, color: getCategoryColor(cat.value) }}>{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🖼️</span>
          <p style={styles.emptyText}>ยังไม่มีรูปภาพในแกลเลอรี่</p>
          <button onClick={openAddModal} style={styles.emptyAddBtn}>เพิ่มรูปภาพแรก</button>
        </div>
      ) : (
        <div style={styles.galleryGrid}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.galleryCard}>
              <div style={styles.imageContainer}>
                <img src={item.image_url} alt={item.caption} style={styles.image} />
                <div style={{ ...styles.categoryBadge, backgroundColor: getCategoryColor(item.category) }}>
                  {getCategoryLabel(item.category).split(' ')[0]}
                </div>
              </div>
              <div style={styles.cardContent}>
                <p style={styles.caption}>{item.caption || 'ไม่มีคำบรรยาย'}</p>
                <p style={styles.category}>{getCategoryLabel(item.category)}</p>
                <p style={styles.date}>
                  🕐 {new Date(item.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => openEditModal(item)} style={styles.editBtn}>✏️ แก้ไข</button>
                <button onClick={() => handleDelete(item.id, item.caption)} style={styles.deleteBtn}>🗑️ ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingItem ? '✏️ แก้ไขรูปภาพ' : '➕ เพิ่มรูปภาพใหม่'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Image Upload */}
              <div style={styles.formSection}>
                <label style={styles.label}>รูปภาพ *</label>
                
                {formData.image_url ? (
                  <div style={styles.previewContainer}>
                    <img src={formData.image_url} alt="Preview" style={styles.previewImage} />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      style={styles.removeImageBtn}
                    >
                      🗑️ ลบรูป
                    </button>
                  </div>
                ) : (
                  <div style={styles.uploadArea}>
                    <input 
                      type="file" 
                      id="gallery-upload" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                      disabled={uploading}
                    />
                    <label htmlFor="gallery-upload" style={styles.uploadBtn}>
                      {uploading ? '⏳ กำลังอัปโหลด...' : '📸 เลือกรูปภาพ'}
                    </label>
                    <p style={styles.uploadHint}>รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div style={styles.formGroup}>
                <label style={styles.label}>หมวดหมู่ *</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={styles.input}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div style={styles.formGroup}>
                <label style={styles.label}>คำบรรยาย</label>
                <textarea 
                  value={formData.caption} 
                  onChange={e => setFormData({ ...formData, caption: e.target.value })}
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="เช่น น้องมิกกี้ - Scottish Fold"
                  maxLength={200}
                />
                <p style={styles.charCount}>{formData.caption.length}/200 ตัวอักษร</p>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                <button type="submit" style={styles.submitBtn}>💾 บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  // Header
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { fontSize: '1.8rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '800' },
  subtitle: { color: '#64748b', margin: 0, fontSize: '0.95rem' },
  addBtn: { padding: '12px 24px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3)', transition: 'all 0.2s' },

  // Filter
  filterSection: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '15px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  filterLabel: { color: '#64748b', fontWeight: '500' },
  filterSelect: { padding: '10px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer', backgroundColor: '#fff' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' },
  statCard: { backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid' },
  statIcon: { fontSize: '1.5rem' },
  statLabel: { color: '#64748b', margin: '0 0 3px', fontSize: '0.85rem' },
  statValue: { fontSize: '1.5rem', fontWeight: '700', margin: 0 },

  // Empty State
  emptyState: { textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  emptyIcon: { fontSize: '4rem', marginBottom: '15px', display: 'block' },
  emptyText: { color: '#64748b', fontSize: '1.1rem', marginBottom: '20px' },
  emptyAddBtn: { padding: '12px 30px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },

  // Gallery Grid
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  galleryCard: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' },
  imageContainer: { position: 'relative', height: '200px', backgroundColor: '#f1f5f9', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  categoryBadge: { position: 'absolute', top: '10px', left: '10px', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#fff' },
  cardContent: { padding: '15px' },
  caption: { margin: '0 0 8px', fontSize: '1rem', color: '#1e293b', fontWeight: '600', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  category: { margin: '0 0 5px', fontSize: '0.85rem', color: '#64748b' },
  date: { margin: 0, fontSize: '0.8rem', color: '#94a3b8' },
  cardActions: { padding: '12px 15px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' },
  editBtn: { flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  deleteBtn: { padding: '8px 15px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeader: { padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700', margin: 0, color: '#1e293b' },
  closeBtn: { fontSize: '1.3rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'background 0.2s' },

  form: { padding: '25px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' },
  formSection: { marginBottom: '20px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#475569' },
  input: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', fontFamily: "inherit" },
  charCount: { textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', margin: '5px 0 0' },

  // Upload
  uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', backgroundColor: '#f8fafc' },
  uploadBtn: { display: 'inline-block', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
  uploadHint: { color: '#94a3b8', fontSize: '0.85rem', margin: '10px 0 0' },
  previewContainer: { textAlign: 'center' },
  previewImage: { maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  removeImageBtn: { padding: '8px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },

  // Form Actions
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' },
  cancelBtn: { padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  submitBtn: { padding: '12px 30px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3)' },
}
