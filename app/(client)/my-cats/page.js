'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function MyCatsPage() {
    const [cats, setCats] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCat, setEditingCat] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        gender: '',
        health_info: '',
        image_url: ''
    })
    const router = useRouter()
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchCats()
    }, [])

    const fetchCats = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { data, error } = await supabase
            .from('cats')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching cats:', error)
        else setCats(data || [])
        setLoading(false)
    }

    const openAddModal = () => {
        setEditingCat(null)
        setFormData({
            name: '',
            breed: '',
            age: '',
            gender: '',
            health_info: '',
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
            image_url: cat.image_url || ''
        })
        setShowModal(true)
    }

    const handleImageUpload = async (e) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return

            setUploading(true)
            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('cat-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('cat-images').getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: data.publicUrl }))

        } catch (error) {
            Swal.fire('Upload Error', error.message, 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const catData = {
            name: formData.name,
            breed: formData.breed,
            age: formData.age ? String(formData.age) : null,
            gender: formData.gender || null,
            health_info: formData.health_info || null,
            image_url: formData.image_url || null,
            owner_id: user.id
        }

        if (editingCat) {
            const { error } = await supabase
                .from('cats')
                .update(catData)
                .eq('id', editingCat.id)

            if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
            else {
                Swal.fire({
                    title: 'บันทึกสำเร็จ',
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
                    title: 'บันทึกสำเร็จ',
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
            text: `คุณต้องการลบข้อมูลน้องแมว "${name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
            // Soft delete
            const { error } = await supabase
                .from('cats')
                .update({ is_deleted: true })
                .eq('id', id)

            if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
            else {
                Swal.fire('ลบเรียบร้อย!', '', 'success')
                fetchCats()
            }
        }
    }

    const getGenderInfo = (gender) => {
        if (gender === 'male') return { label: '♂️', bg: '#dbeafe', color: '#1e40af' } // Short text
        if (gender === 'female') return { label: '♀️', bg: '#fce7f3', color: '#be185d' }
        return { label: '?', bg: '#f3f4f6', color: '#4b5563' }
    }

    if (loading) return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}>🐱</div>
            <p>กำลังโหลดข้อมูลน้องแมว...</p>
        </div>
    )

    return (
        <div style={styles.pageBackground}>
            <div style={styles.container}>
                {/* Hero Section */}
                <header style={styles.header}>
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>สมาชิกตัวน้อย 🐾</h1>
                        <p style={styles.subtitle}>จัดการข้อมูลเจ้านายสุดที่รักของคุณที่นี่</p>
                    </div>
                    <button onClick={openAddModal} style={styles.addBtn}>
                        <span style={styles.addIcon}>+</span> เพิ่มแมวใหม่
                    </button>
                </header>

                {cats.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyEmoji}>😸</div>
                        <h3 style={styles.emptyTitle}>บ้านยังว่างอยู่นะ</h3>
                        <p style={styles.emptyDesc}>เพิ่มข้อมูลน้องแมวตัวแรกของคุณ เพื่อเริ่มใช้บริการจองห้องพัก</p>
                        <button onClick={openAddModal} style={styles.addBtnOutline}>เพิ่มแมวตัวแรกเลย!</button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {cats.map((cat) => {
                            const gender = getGenderInfo(cat.gender)
                            return (
                                <div key={cat.id} style={styles.card}>
                                    <div style={styles.cardImageWrapper}>
                                        <img
                                            src={cat.image_url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'}
                                            alt={cat.name}
                                            style={styles.img}
                                        />
                                        <div style={styles.badgeGroup}>
                                            <span style={{ ...styles.badge, backgroundColor: gender.bg, color: gender.color }}>
                                                {gender.label}
                                            </span>
                                            {cat.age && (
                                                <span style={styles.ageBadge}>{cat.age} ปี</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.catName}>{cat.name}</h3>
                                        <p style={styles.catBreed}>{cat.breed || 'ไม่ระบุสายพันธุ์'}</p>

                                        {cat.health_info && (
                                            <div style={styles.healthInfo}>
                                                💊 {cat.health_info}
                                            </div>
                                        )}

                                        <div style={styles.actionButtons}>
                                            <button onClick={() => openEditModal(cat)} style={styles.editBtn}>แก้ไข</button>
                                            <button onClick={() => handleDelete(cat.id, cat.name)} style={styles.deleteBtn}>ลบ</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editingCat ? '✏️ แก้ไขข้อมูล' : '✨ เพิ่มแมวใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>ชื่อน้องแมว *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={styles.input}
                                    required
                                    placeholder="เช่น น้องส้ม"
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>สายพันธุ์</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                        style={styles.input}
                                        placeholder="เช่น วิเชียรมาศ"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>อายุ (ปี)</label>
                                    <input
                                        type="text"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        style={styles.input}
                                        placeholder="เช่น 3"
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>เพศ</label>
                                <div style={styles.radioGroup}>
                                    <label style={{ ...styles.radioLabel, ...(formData.gender === 'male' ? styles.radioActive : {}) }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            style={styles.radioInput}
                                        />
                                        ♂️ ตัวผู้
                                    </label>
                                    <label style={{ ...styles.radioLabel, ...(formData.gender === 'female' ? styles.radioActive : {}) }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            style={styles.radioInput}
                                        />
                                        ♀️ ตัวเมีย
                                    </label>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>ข้อมูลสุขภาพ / โรคประจำตัว</label>
                                <textarea
                                    value={formData.health_info}
                                    onChange={e => setFormData({ ...formData, health_info: e.target.value })}
                                    style={styles.textarea}
                                    placeholder="ระบุข้อมูลสำคัญที่พี่เลี้ยงควรรู้..."
                                />
                            </div>


                            <div style={styles.formGroup}>
                                <label style={styles.label}>รูปประจำตัวน้องแมว</label>
                                <div style={styles.uploadContainer}>
                                    {formData.image_url && (
                                        <div style={styles.previewContainer}>
                                            <img src={formData.image_url} alt="Preview" style={styles.previewImage} />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                                style={styles.removeImageBtn}
                                            >✕</button>
                                        </div>
                                    )}

                                    {!formData.image_url && (
                                        <label style={styles.uploadBtn}>
                                            {uploading ? '⏳ กำลังอัปโหลด...' : '📸 เลือกรูปภาพ'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div style={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                                <button type="submit" style={styles.submitBtn}>
                                    {editingCat ? 'บันทึก' : 'เพิ่มน้องแมว'}
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
    pageBackground: { backgroundColor: '#fffaf5', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Sarabun', 'Kanit', sans-serif" },
    container: { maxWidth: '1000px', margin: '0 auto' },

    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px',
        backgroundColor: '#fff7ed', padding: '30px', borderRadius: '24px', border: '1px solid #ffedd5'
    },
    title: { fontSize: '2.2rem', color: '#431407', margin: '0 0 5px 0', fontWeight: '800' },
    subtitle: { color: '#9a3412', fontSize: '1.1rem', margin: 0 },

    addBtn: {
        padding: '14px 28px', backgroundColor: '#ea580c', color: 'white',
        border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold',
        fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)', transition: 'transform 0.2s',
        ':hover': { transform: 'scale(1.05)' }
    },
    addIcon: { fontSize: '1.2rem', fontWeight: 'bold' },

    loadingContainer: { textAlign: 'center', padding: '100px', color: '#ea580c' },
    spinner: { fontSize: '40px', marginBottom: '10px', animation: 'spin 1s infinite' },

    emptyState: {
        textAlign: 'center', backgroundColor: 'white', padding: '80px 40px',
        borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
        maxWidth: '500px', margin: '0 auto', border: '1px dashed #fed7aa'
    },
    emptyEmoji: { fontSize: '80px', marginBottom: '20px' },
    emptyTitle: { fontSize: '1.5rem', color: '#1f2937', marginBottom: '10px' },
    emptyDesc: { color: '#6b7280', marginBottom: '30px', fontSize: '1rem' },
    addBtnOutline: {
        padding: '12px 30px', backgroundColor: 'white', color: '#ea580c',
        border: '2px solid #ea580c', borderRadius: '50px', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s',
        ':hover': { backgroundColor: '#fff7ed' }
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
    card: {
        backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.3s, box-shadow 0.3s',
        border: '1px solid #f3f4f6',
        ':hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.1)' }
    },
    cardImageWrapper: { height: '220px', position: 'relative', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', ':hover': { transform: 'scale(1.1)' } },
    badgeGroup: { position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' },
    badge: {
        padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem',
        fontWeight: 'bold', backdropFilter: 'blur(4px)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    ageBadge: {
        padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem',
        fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.9)', color: '#1f2937',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },

    cardContent: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' },
    catName: { margin: 0, fontSize: '1.4rem', color: '#1f2937', fontWeight: 'bold' },
    catBreed: { margin: 0, fontSize: '0.95rem', color: '#6b7280' },
    healthInfo: {
        backgroundColor: '#fff7ed', padding: '10px 15px', borderRadius: '12px',
        color: '#9a3412', fontSize: '0.9rem', marginTop: '5px', lineHeight: '1.4'
    },

    actionButtons: { display: 'flex', gap: '10px', marginTop: '15px' },
    editBtn: {
        flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#4b5563',
        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
        transition: 'background 0.2s', ':hover': { backgroundColor: '#e5e7eb' }
    },
    deleteBtn: {
        padding: '10px 15px', backgroundColor: '#fee2e2', color: '#ef4444',
        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
        transition: 'background 0.2s', ':hover': { backgroundColor: '#fecaca' }
    },

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    modalHeader: { padding: '25px 30px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed' },
    modalTitle: { margin: 0, fontSize: '1.5rem', color: '#431407', fontWeight: 'Bold' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.8rem', color: '#9a3412', cursor: 'pointer', lineHeight: 1 },

    form: { padding: '30px' },
    formGroup: { marginBottom: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' },
    input: { width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#f9fafb', ':focus': { borderColor: '#ea580c', backgroundColor: 'white' } },
    textarea: { width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', minHeight: '100px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', backgroundColor: '#f9fafb' },

    radioGroup: { display: 'flex', gap: '15px' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', color: '#4b5563', backgroundColor: '#f9fafb', transition: 'all 0.2s' },
    radioActive: { borderColor: '#ea580c', backgroundColor: '#fff7ed', color: '#ea580c', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(234, 88, 12, 0.1)' },
    radioInput: { display: 'none' },

    formActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    submitBtn: { flex: 2, padding: '14px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)' },
    cancelBtn: { flex: 1, padding: '14px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },

    // Upload Styles
    uploadContainer: { marginTop: '10px' },
    previewContainer: { position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
    removeImageBtn: { position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
    uploadBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', backgroundColor: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer', color: '#6b7280', fontWeight: '600', transition: 'all 0.2s', ':hover': { borderColor: '#ea580c', color: '#ea580c', backgroundColor: '#fff7ed' } },
}
