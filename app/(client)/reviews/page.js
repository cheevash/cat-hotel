'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { useSearchParams, useRouter } from 'next/navigation'

function StarRating({ rating, setRating, interactive = false }) {
    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{
                        color: star <= rating ? '#fbbf24' : '#e5e7eb',
                        cursor: interactive ? 'pointer' : 'default',
                        fontSize: interactive ? '2rem' : '1rem',
                        transition: 'transform 0.1s'
                    }}
                    onClick={() => interactive && setRating(star)}
                    onMouseEnter={(e) => interactive && (e.target.style.transform = 'scale(1.2)')}
                    onMouseLeave={(e) => interactive && (e.target.style.transform = 'scale(1)')}
                >
                    ★
                </span>
            ))}
        </div>
    )
}

function ReviewForm({ bookingId }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [booking, setBooking] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchBooking = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, rooms(room_type, room_number), cats(name)')
                .eq('id', bookingId)
                .single()
            if (data) setBooking(data)
        }
        fetchBooking()
    }, [bookingId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            Swal.fire('กรุณาเข้าสู่ระบบ', '', 'warning')
            return
        }

        const { error } = await supabase
            .from('reviews')
            .insert({
                booking_id: bookingId,
                user_id: user.id,
                rating,
                comment
            })

        if (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error')
        } else {
            setSubmitted(true)
            setTimeout(() => {
                router.push('/reviews') // Go to list after success
            }, 2000)
        }
        setLoading(false)
    }

    if (submitted) {
        return (
            <div style={styles.successCard}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                <h2 style={{ color: '#059669', marginBottom: '10px' }}>ขอบคุณสำหรับรีวิว!</h2>
                <p style={{ color: '#6b7280' }}>รีวิวของคุณถูกบันทึกเรียบร้อยแล้ว</p>
            </div>
        )
    }

    return (
        <div style={styles.formCard}>
            <h2 style={styles.formTitle}>✍️ เขียนรีวิวการเข้าพัก</h2>
            {booking && (
                <div style={styles.bookingSummary}>
                    <p><strong>ห้อง:</strong> {booking.rooms?.room_type} ({booking.rooms?.room_number})</p>
                    <p><strong>น้องแมว:</strong> {booking.cats?.name}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>ความพึงพอใจ</label>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <StarRating rating={rating} setRating={setRating} interactive={true} />
                    </div>
                    <div style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 'bold' }}>
                        {rating === 5 ? 'ดีเยี่ยม! 😍' : rating === 4 ? 'ดีมาก 😄' : rating === 3 ? 'พอใช้ 🙂' : rating === 2 ? 'ต้องปรับปรุง 😕' : 'แย่ 😢'}
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>ความคิดเห็นเพิ่มเติม</label>
                    <textarea
                        style={styles.textarea}
                        rows={4}
                        placeholder="เล่าประสบการณ์ของคุณ..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                </button>
            </form>
        </div>
    )
}

function ReviewsList() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            // Join with profiles to get user name
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    bookings (
                        rooms (room_type)
                    ),
                    profiles:user_id (first_name, last_name)
                `)
                .order('created_at', { ascending: false })

            if (data) setReviews(data)
            setLoading(false)
        }
        fetchReviews()
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดรีวิว...</div>

    if (reviews.length === 0) return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <h3>ยังไม่มีรีวิวในขณะนี้</h3>
            <p>เป็นคนแรกที่รีวิวเลย!</p>
        </div>
    )

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)

    return (
        <div>
            {/* Stats */}
            <div style={styles.statsContainer}>
                <div style={styles.ratingBig}>
                    <span style={styles.ratingNumber}>{avgRating}</span>
                    <div style={{ fontSize: '1.2rem', color: '#fbbf24' }}>★ ★ ★ ★ ★</div>
                    <span style={{ color: '#6b7280' }}>จาก {reviews.length} รีวิว</span>
                </div>
            </div>

            {/* List */}
            <div style={styles.grid}>
                {reviews.map((review) => (
                    <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.cardHeader}>
                            <div style={styles.avatar}>
                                {review.profiles?.first_name?.[0] || '?'}
                            </div>
                            <div>
                                <strong style={{ display: 'block', color: '#1f2937' }}>
                                    {review.profiles?.first_name || 'ลูกค้า'} {review.profiles?.last_name || ''}
                                </strong>
                                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                    {review.bookings?.rooms?.room_type || 'ห้องพัก'}
                                </span>
                            </div>
                        </div>
                        <div style={{ margin: '10px 0' }}>
                            <StarRating rating={review.rating} />
                        </div>
                        <p style={styles.comment}>"{review.comment}"</p>
                        <span style={styles.date}>
                            {new Date(review.created_at).toLocaleDateString('th-TH')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ReviewsContent() {
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('bookingId')

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>⭐ รีวิวจากลูกค้า</h1>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </header>

            {bookingId ? (
                <ReviewForm bookingId={bookingId} />
            ) : (
                <ReviewsList />
            )}
        </div>
    )
}

export default function ReviewsPage() {
    return (
        <div style={styles.page}>
            <Suspense fallback={<div>Loading...</div>}>
                <ReviewsContent />
            </Suspense>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Sarabun', sans-serif" },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.5rem', color: '#111827', margin: '0 0 10px', fontWeight: '800' },
    backLink: { color: '#ea580c', textDecoration: 'none', fontWeight: '600' },

    // Form
    formCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' },
    formTitle: { textAlign: 'center', color: '#1f2937', marginBottom: '20px' },
    bookingSummary: { backgroundColor: '#fff7ed', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: '#9a3412', fontSize: '0.95rem' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' },
    textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '1rem', minHeight: '120px' },
    submitBtn: { width: '100%', padding: '15px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    successCard: { textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },

    // List
    statsContainer: { textAlign: 'center', marginBottom: '40px', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    ratingNumber: { fontSize: '4rem', fontWeight: '800', color: '#1f2937', lineHeight: 1 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    reviewCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', gap: '12px', alignItems: 'center' },
    avatar: { width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    comment: { color: '#4b5563', lineHeight: '1.6', margin: '10px 0', minHeight: '60px' },
    date: { fontSize: '0.8rem', color: '#9ca3af' },
}
