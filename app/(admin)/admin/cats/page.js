'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminCats() {
    const [cats, setCats] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCat, setEditingCat] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        gender: '',
        health_info: '',
        owner_id: '',
        image_url: ''
    })
    const [owners, setOwners] = useState([])

    useEffect(() => {
        fetchCats()
        fetchOwners()
    }, [])

    const fetchCats = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('cats')
            .select('*, profiles(first_name, last_name, email)')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching cats:', error)
            setCats([])
        } else {
            setCats(data || [])
        }
        setLoading(false)
    }

    const fetchOwners = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .order('first_name')
        setOwners(data || [])
    }
    const openAddModal = () => {
        setEditingCat(null)
        setFormData({
            name: '',
            breed: '',
            age: '',
            gender: '',
            health_info: '',
            owner_id: '',
            image_url: ''
        })
        setShowModal(true)
    }

    const openEditModal = (cat) => {
        setEditingCat(cat)
        setFormData({
            name: cat.name || '',
            breed: cat.breed || '',
            age: cat.age || '',
            gender: cat.gender || '',
            health_info: cat.health_info || '',
            owner_id: cat.owner_id || '',
            image_url: cat.image_url || ''
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const catData = {
            name: formData.name,
            breed: formData.breed,
            age: formData.age ? String(formData.age) : null,
            gender: formData.gender || null,
            health_info: formData.health_info || null,
            owner_id: formData.owner_id || null,
            image_url: formData.image_url || null
        }

        if (editingCat) {
            const { error } = await supabase
                .from('cats')
                .update(catData)
                .eq('id', editingCat.id)

            if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
            else {
                Swal.fire({
                    title: 'แก้ไขข้อมูลแมวสำเร็จ! 🐱',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                setShowModal(false)
                fetchCats()
            }
        } else {
            const { error } = await supabase
                .from('cats')
                .insert([catData])

            if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
            else {
                Swal.fire({
                    title: 'เพิ่มแมวใหม่สำเร็จ! 🐱',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                setShowModal(false)
                fetchCats()
            }
        }
    }
    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบข้อมูล "${name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
            // Soft delete: Update is_deleted = true
            const { error } = await supabase
                .from('cats')
                .update({ is_deleted: true })
                .eq('id', id)

            if (error) {
                // Handle specific foreign key error just in case, though soft delete prevents it
                if (error.code === '23503') {
                    Swal.fire('ไม่สามารถลบได้', 'แมวตัวนี้มีประวัติการจองอยู่ ไม่สามารถลบถาวรได้', 'error')
                } else {
                    Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
                }
            }
            else {
                Swal.fire('ลบเรียบร้อย!', '', 'success')
                fetchCats()
            }
        }
    }

    const getDefaultCatImage = () => {
        const images = [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
        ]
        return images[Math.floor(Math.random() * images.length)]
    }

    const getGenderLabel = (gender) => {
        const genderMap = {
            'male': { label: '♂️ ตัวผู้', bg: '#dbeafe', color: '#1d4ed8' },
            'female': { label: '♀️ ตัวเมีย', bg: '#fce7f3', color: '#be185d' },
        }
        return genderMap[gender] || { label: '❓ ไม่ระบุ', bg: '#f3f4f6', color: '#6b7280' }
    }

    const filteredCats = cats.filter(cat => {
        const query = searchQuery.toLowerCase()
        return (
            cat.name?.toLowerCase().includes(query) ||
            cat.breed?.toLowerCase().includes(query) ||
            cat.profiles?.first_name?.toLowerCase().includes(query) ||
            cat.profiles?.last_name?.toLowerCase().includes(query)
        )
    })

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <span style={styles.loadingIcon}>🐱</span>
                <p>กำลังโหลดข้อมูลแมว...</p>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🐱 จัดการแมว</h1>
                    <p style={styles.subtitle}>ข้อมูลแมวที่เคยมาพัก และข้อมูลสุขภาพ</p>
                </div>
                <div style={styles.headerActions}>
                    <div style={styles.searchBox}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อแมว, สายพันธุ์..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <button onClick={openAddModal} style={styles.addBtn}>➕ เพิ่มแมว</button>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{cats.length}</span>
                    <span style={styles.statLabel}>แมวทั้งหมด</span>
                </div>
                <div style={styles.statCard}>
                    <span style={{ ...styles.statNumber, color: '#1d4ed8' }}>
                        {cats.filter(c => c.gender === 'male').length}
                    </span>
                    <span style={styles.statLabel}>♂️ ตัวผู้</span>
                </div>
                <div style={styles.statCard}>
                    <span style={{ ...styles.statNumber, color: '#be185d' }}>
                        {cats.filter(c => c.gender === 'female').length}
                    </span>
                    <span style={styles.statLabel}>♀️ ตัวเมีย</span>
                </div>
            </div>

            {/* Cats Grid */}
            <div style={styles.catsGrid}>
                {filteredCats.map(cat => {
                    const genderInfo = getGenderLabel(cat.gender)
                    return (
                        <div key={cat.id} style={styles.catCard}>
                            <div style={styles.catImage}>
                                <img
                                    src={cat.image_url || getDefaultCatImage()}
                                    alt={cat.name}
                                    style={styles.catImg}
                                />
                                <span style={{
                                    ...styles.genderBadge,
                                    backgroundColor: genderInfo.bg,
                                    color: genderInfo.color
                                }}>
                                    {genderInfo.label}
                                </span>
                            </div>

                            <div style={styles.catInfo}>
                                <h3 style={styles.catName}>{cat.name}</h3>
                                <p style={styles.catBreed}>{cat.breed || 'ไม่ระบุสายพันธุ์'}</p>

                                <div style={styles.catDetails}>
                                    <span>🎂 {cat.age ? `${cat.age} ปี` : 'ไม่ทราบอายุ'}</span>
                                </div>

                                {cat.profiles && (
                                    <p style={styles.ownerInfo}>
                                        👤 เจ้าของ: {cat.profiles.first_name} {cat.profiles.last_name}
                                    </p>
                                )}

                                {cat.health_info && (
                                    <p style={styles.healthInfo}>📋 {cat.health_info}</p>
                                )}
                            </div>

                            <div style={styles.catActions}>
                                <button onClick={() => openEditModal(cat)} style={styles.actionBtn}>
                                    ✏️ แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    style={{ ...styles.actionBtn, backgroundColor: '#fee2e2', color: '#dc2626' }}
                                >
                                    🗑️ ลบ
                                </button>
                            </div>
                        </div>
                    )
                })}

                {filteredCats.length === 0 && (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🐱</span>
                        <p>ยังไม่มีข้อมูลแมว กดปุ่ม "เพิ่มแมว" เพื่อเริ่มต้น</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editingCat ? '✏️ แก้ไขข้อมูลแมว' : '➕ เพิ่มแมวใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ชื่อแมว *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={styles.input}
                                        placeholder="เช่น มีมี่, โคตร"
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>สายพันธุ์</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                        style={styles.input}
                                        placeholder="เช่น Scottish Fold, แมวไทย"
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>อายุ</label>
                                    <input
                                        type="text"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        style={styles.input}
                                        placeholder="เช่น 2 ปี"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>เพศ</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">-- ไม่ระบุ --</option>
                                        <option value="male">♂️ ตัวผู้</option>
                                        <option value="female">♀️ ตัวเมีย</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>เจ้าของ</label>
                                <select
                                    value={formData.owner_id}
                                    onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="">-- ไม่ระบุ --</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.first_name} {owner.last_name} ({owner.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>ข้อมูลสุขภาพ</label>
                                <textarea
                                    value={formData.health_info}
                                    onChange={e => setFormData({ ...formData, health_info: e.target.value })}
                                    style={{ ...styles.input, minHeight: '80px' }}
                                    placeholder="เช่น แพ้อาหารทะเล, ต้องกินยาประจำ"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL รูปภาพ</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    style={styles.input}
                                    placeholder="https://example.com/cat.jpg"
                                />
                            </div>

                            <div style={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                                    ยกเลิก
                                </button>
                                <button type="submit" style={styles.submitBtn}>
                                    {editingCat ? '💾 บันทึก' : '➕ เพิ่มแมว'}
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
    headerActions: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '12px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '250px' },
    searchIcon: { marginRight: '10px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '1rem', flex: 1 },
    addBtn: { padding: '14px 28px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },

    // Stats
    statsRow: { display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' },
    statCard: { backgroundColor: '#fff', padding: '20px 30px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' },
    statNumber: { fontSize: '2rem', fontWeight: '800', color: '#1e293b' },
    statLabel: { color: '#64748b', fontSize: '0.9rem' },

    // Grid
    catsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    catCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    catImage: { position: 'relative', height: '180px' },
    catImg: { width: '100%', height: '100%', objectFit: 'cover' },
    genderBadge: { position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' },
    catInfo: { padding: '18px' },
    catName: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', margin: '0 0 5px' },
    catBreed: { color: '#64748b', margin: '0 0 12px', fontSize: '0.9rem' },
    catDetails: { display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' },
    ownerInfo: { fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px' },
    healthInfo: { fontSize: '0.85rem', color: '#9a3412', backgroundColor: '#fff7ed', padding: '8px 12px', borderRadius: '8px', margin: 0 },
    catActions: { display: 'flex', gap: '10px', padding: '0 18px 18px' },
    actionBtn: { flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },

    emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#94a3b8' },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px' },

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 25px 0' },
    modalTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    closeBtn: { width: '36px', height: '36px', border: 'none', borderRadius: '50%', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1.1rem' },

    form: { padding: '25px' },
    formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' },
    input: { width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
    formActions: { display: 'flex', gap: '15px', marginTop: '25px' },
    cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { flex: 2, padding: '14px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
}
