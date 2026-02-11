'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [replyModal, setReplyModal] = useState(null)
    const [replyText, setReplyText] = useState('')

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(first_name, last_name, email), rooms(room_number, room_type)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching reviews:', error)
            setReviews([])
        } else {
            setReviews(data || [])
        }
        setLoading(false)
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบรีวิวนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบรีวิว',
            cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
            const { error } = await supabase.from('reviews').delete().eq('id', id)
            if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
            else {
                Swal.fire('ลบเรียบร้อย!', '', 'success')
                fetchReviews()
            }
        }
    }

    const handleReply = async (e) => {
        e.preventDefault()
        const { error } = await supabase
            .from('reviews')
            .update({ admin_reply: replyText, replied_at: new Date().toISOString() })
            .eq('id', replyModal.id)

        if (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
        } else {
            Swal.fire({
                title: 'บันทึกสำเร็จ! ✅',
                text: 'การตอบกลับถูกบันทึกแล้ว',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            })
            setReplyModal(null)
            setReplyText('')
            fetchReviews()
        }
    }

    const openReplyModal = (review) => {
        setReplyModal(review)
        setReplyText(review.admin_reply || '')
    }

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
    }

    const getStats = () => {
        if (reviews.length === 0) return { avg: 0, counts: {} }
        const avg = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        const counts = {}
        for (let i = 1; i <= 5; i++) {
            counts[i] = reviews.filter(r => r.rating === i).length
        }
        return { avg, counts }
    }

    const stats = getStats()

    const filteredReviews = filter === 'all'
        ? reviews
        : filter === 'replied'
            ? reviews.filter(r => r.admin_reply)
            : filter === 'unreplied'
                ? reviews.filter(r => !r.admin_reply)
                : reviews.filter(r => r.rating === Number(filter))

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <span style={styles.loadingIcon}>⭐</span>
                <p>กำลังโหลดรีวิว...</p>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>⭐ จัดการรีวิว</h1>
                    <p style={styles.subtitle}>ดู ลบ หรือตอบกลับรีวิวจากลูกค้า</p>
                </div>
                <button onClick={fetchReviews} style={styles.refreshBtn}>🔄 รีเฟรช</button>
            </div>

            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <div style={styles.avgCard}>
                    <span style={styles.avgNumber}>{stats.avg}</span>
                    <span style={styles.avgStars}>{renderStars(Math.round(stats.avg))}</span>
                    <span style={styles.avgLabel}>คะแนนเฉลี่ย ({reviews.length} รีวิว)</span>
                </div>
                <div style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} style={styles.ratingRow}>
                            <span style={styles.ratingLabel}>{star} ⭐</span>
                            <div style={styles.ratingBarBg}>
                                <div style={{
                                    ...styles.ratingBarFill,
                                    width: `${(stats.counts[star] || 0) / (reviews.length || 1) * 100}%`
                                }}></div>
                            </div>
                            <span style={styles.ratingCount}>{stats.counts[star] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div style={styles.infoBanner}>
                <span>💡</span>
                <p>หากยังไม่มี table "reviews" ใน Supabase ให้สร้าง table ใหม่พร้อม columns: id, user_id, room_id, rating (1-5), comment, admin_reply, replied_at, created_at</p>
            </div>

            {/* Filter */}
            <div style={styles.filterRow}>
                <button onClick={() => setFilter('all')} style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}>
                    ทั้งหมด ({reviews.length})
                </button>
                <button onClick={() => setFilter('unreplied')} style={filter === 'unreplied' ? styles.filterBtnActive : styles.filterBtn}>
                    ⏳ รอตอบกลับ ({reviews.filter(r => !r.admin_reply).length})
                </button>
                <button onClick={() => setFilter('replied')} style={filter === 'replied' ? styles.filterBtnActive : styles.filterBtn}>
                    ✅ ตอบแล้ว ({reviews.filter(r => r.admin_reply).length})
                </button>
                <span style={styles.filterDivider}>|</span>
                {[5, 4, 3, 2, 1].map(star => (
                    <button
                        key={star}
                        onClick={() => setFilter(star)}
                        style={filter === star ? styles.filterBtnActive : styles.filterBtn}
                    >
                        {star}⭐
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            <div style={styles.reviewsList}>
                {filteredReviews.map(review => (
                    <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                            <div style={styles.reviewerInfo}>
                                <div style={styles.reviewerAvatar}>
                                    {review.profiles?.first_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <strong>{review.profiles?.first_name} {review.profiles?.last_name}</strong>
                                    <span style={styles.reviewMeta}>
                                        {review.rooms?.room_type} • {formatDate(review.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.reviewRating}>
                                {renderStars(review.rating || 0)}
                            </div>
                        </div>

                        <p style={styles.reviewComment}>{review.comment || 'ไม่มีความคิดเห็น'}</p>

                        {review.admin_reply && (
                            <div style={styles.adminReply}>
                                <strong>💬 ตอบกลับจากร้าน:</strong>
                                <p>{review.admin_reply}</p>
                                <small style={styles.replyDate}>ตอบเมื่อ {formatDate(review.replied_at)}</small>
                            </div>
                        )}

                        <div style={styles.reviewActions}>
                            <button onClick={() => openReplyModal(review)} style={styles.replyBtn}>
                                {review.admin_reply ? '✏️ แก้ไขตอบกลับ' : '💬 ตอบกลับ'}
                            </button>
                            <button onClick={() => handleDelete(review.id)} style={styles.deleteBtn}>
                                🗑️ ลบ
                            </button>
                        </div>
                    </div>
                ))}

                {filteredReviews.length === 0 && (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>⭐</span>
                        <p>ยังไม่มีรีวิว</p>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {replyModal && (
                <div style={styles.modalOverlay} onClick={() => setReplyModal(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>💬 ตอบกลับรีวิว</h2>
                            <button onClick={() => setReplyModal(null)} style={styles.closeBtn}>✕</button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.originalReview}>
                                <div style={styles.originalHeader}>
                                    <strong>{replyModal.profiles?.first_name} {replyModal.profiles?.last_name}</strong>
                                    <span>{renderStars(replyModal.rating || 0)}</span>
                                </div>
                                <p style={styles.originalComment}>"{replyModal.comment}"</p>
                            </div>

                            <form onSubmit={handleReply}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ข้อความตอบกลับ</label>
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        style={styles.textarea}
                                        placeholder="ขอบคุณที่ใช้บริการครับ/ค่ะ..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button type="button" onClick={() => setReplyModal(null)} style={styles.cancelBtn}>
                                        ยกเลิก
                                    </button>
                                    <button type="submit" style={styles.submitBtn}>
                                        💬 บันทึกตอบกลับ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    page: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
    loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#ea580c' },
    loadingIcon: { fontSize: '3rem' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '700' },
    subtitle: { color: '#64748b', margin: 0 },
    refreshBtn: { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '30px', backgroundColor: '#fff', padding: '25px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    avgCard: { textAlign: 'center', padding: '20px 40px', borderRight: '1px solid #f1f5f9' },
    avgNumber: { display: 'block', fontSize: '3rem', fontWeight: '800', color: '#ea580c' },
    avgStars: { display: 'block', fontSize: '1.2rem', marginBottom: '5px' },
    avgLabel: { color: '#64748b', fontSize: '0.9rem' },
    ratingBars: { display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' },
    ratingRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    ratingLabel: { width: '50px', fontSize: '0.9rem' },
    ratingBarBg: { flex: 1, height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' },
    ratingBarFill: { height: '100%', backgroundColor: '#fbbf24', borderRadius: '5px' },
    ratingCount: { width: '30px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem' },

    // Info Banner
    infoBanner: { display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', color: '#9a3412', fontSize: '0.9rem' },

    // Filter
    filterRow: { display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' },
    filterBtn: { padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
    filterBtnActive: { padding: '8px 16px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' },
    filterDivider: { color: '#e2e8f0', margin: '0 5px' },

    // Reviews
    reviewsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    reviewCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    reviewerInfo: { display: 'flex', gap: '12px', alignItems: 'center' },
    reviewerAvatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' },
    reviewMeta: { display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginTop: '3px' },
    reviewRating: { fontSize: '1.1rem' },
    reviewComment: { color: '#374151', lineHeight: '1.7', margin: '0 0 20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #ea580c' },
    adminReply: { backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '3px solid #10b981' },
    replyDate: { color: '#64748b', display: 'block', marginTop: '8px' },
    reviewActions: { display: 'flex', gap: '10px' },
    replyBtn: { padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
    deleteBtn: { padding: '10px 20px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },

    emptyState: { textAlign: 'center', padding: '80px', color: '#94a3b8' },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '20px' },

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #f1f5f9' },
    modalTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    closeBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '50%', backgroundColor: '#f1f5f9', cursor: 'pointer', fontSize: '1rem' },
    modalBody: { padding: '25px' },
    originalReview: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' },
    originalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    originalComment: { margin: 0, color: '#374151', fontStyle: 'italic' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' },
    textarea: { width: '100%', padding: '15px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
    formActions: { display: 'flex', gap: '15px' },
    cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { flex: 2, padding: '14px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
}
