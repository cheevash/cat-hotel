'use client'
import Link from 'next/link'

const reviews = [
    { name: 'คุณแม่น้องถุงเงิน', date: '2 สัปดาห์ที่แล้ว', rating: 5, text: 'น้องกลับมาอารมณ์ดีมาก ห้องสะอาด พี่เลี้ยงดูแลดีมาก มีรูปส่งให้ดูตลอดเลยค่ะ แนะนำมากๆ เลย!', avatar: '🧡', room: 'Deluxe Suite' },
    { name: 'คุณพ่อน้องส้ม', date: '1 เดือนที่แล้ว', rating: 5, text: 'ที่พักสวยเหมือนคาเฟ่เลย แมวไม่เครียดเลยครับ แนะนำทาสทุกคนเลย ราคาก็สมเหตุสมผล', avatar: '🐱', room: 'Standard' },
    { name: 'คุณแม่น้องโมจิ', date: '1 เดือนที่แล้ว', rating: 5, text: 'ประทับใจมากค่ะ น้องแมวได้เล่นเยอะมาก กลับบ้านมาหลับเป็นวัน พี่เลี้ยงใจดีมากๆ ดูแลเหมือนลูกเลย', avatar: '🤍', room: 'VIP Royal' },
    { name: 'คุณปุ้ย', date: '2 เดือนที่แล้ว', rating: 4, text: 'โดยรวมดีค่ะ แต่อยากให้มีกล้องดูสดทุกห้อง จะได้หายห่วงมากขึ้น นอกนั้นโอเคหมดเลย', avatar: '😺', room: 'Standard' },
    { name: 'คุณเจษ', date: '2 เดือนที่แล้ว', rating: 5, text: 'พาน้องมาฝากครั้งแรก กังวลมาก แต่พี่เลี้ยงดูแลดีมาก ส่งรูปมาให้ดูตลอด น้องก็แฮปปี้มาก จะกลับมาอีกแน่นอนครับ', avatar: '🐈', room: 'Deluxe Suite' },
    { name: 'คุณมิ้นท์', date: '3 เดือนที่แล้ว', rating: 5, text: 'ห้อง VIP คุ้มค่ามากค่ะ น้องได้เล่นเยอะ มีหอคอย มีน้ำพุ พี่เลี้ยงยังโทรมาบอกว่าน้องกินข้าวหมดจานเลย หายห่วงมาก', avatar: '💜', room: 'VIP Royal' },
    { name: 'คุณบอส', date: '3 เดือนที่แล้ว', rating: 5, text: 'ฝากน้อง 2 ตัว ได้ส่วนลดด้วย พี่เลี้ยงดูแลดีมาก น้องแมวเล่นด้วยกันตลอด กลับมาก็ร่าเริงมาก', avatar: '🧡', room: 'Deluxe Suite' },
    { name: 'คุณนุ่น', date: '4 เดือนที่แล้ว', rating: 4, text: 'ห้องสะอาดดีค่ะ แต่ช่วงเทศกาลคนเยอะนิดนึง แต่พี่เลี้ยงก็ดูแลได้ดีค่ะ', avatar: '💛', room: 'Standard' },
]

function StarRating({ rating }) {
    return <span style={{ color: '#fbbf24' }}>{'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

function ReviewCard({ review }) {
    return (
        <div style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
                <div style={styles.avatar}>{review.avatar}</div>
                <div>
                    <strong style={styles.reviewerName}>{review.name}</strong>
                    <div style={styles.reviewMeta}>
                        <StarRating rating={review.rating} />
                        <span style={styles.reviewRoom}>• {review.room}</span>
                    </div>
                </div>
            </div>
            <p style={styles.reviewText}>{review.text}</p>
            <span style={styles.reviewDate}>{review.date}</span>
        </div>
    )
}

export default function ReviewsPage() {
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }))

    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>⭐ รีวิวจากลูกค้า</h1>
                <p style={styles.heroDesc}>เสียงจากทาสแมวที่เคยมาใช้บริการ</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            <div style={styles.container}>
                {/* Rating Overview */}
                <section style={styles.ratingOverview}>
                    <div style={styles.ratingBig}>
                        <span style={styles.ratingNumber}>{avgRating}</span>
                        <div style={styles.ratingStars}><StarRating rating={Math.round(avgRating)} /></div>
                        <span style={styles.ratingCount}>{reviews.length} รีวิว</span>
                    </div>
                    <div style={styles.ratingBars}>
                        {ratingCounts.map(({ star, count }) => (
                            <div key={star} style={styles.ratingBarRow}>
                                <span style={styles.barLabel}>{star} ⭐</span>
                                <div style={styles.barBg}>
                                    <div style={{ ...styles.barFill, width: `${(count / reviews.length) * 100}%` }}></div>
                                </div>
                                <span style={styles.barCount}>{count}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Reviews Grid */}
                <section style={styles.reviewsSection}>
                    <h2 style={styles.sectionTitle}>รีวิวทั้งหมด</h2>
                    <div style={styles.reviewsGrid}>
                        {reviews.map((review, idx) => (
                            <ReviewCard key={idx} review={review} />
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={styles.cta}>
                    <h3 style={styles.ctaTitle}>มาเป็นส่วนหนึ่งของครอบครัว Cat Hotel</h3>
                    <p style={styles.ctaDesc}>จองห้องพักวันนี้ แล้วกลับมารีวิวให้เราด้วยนะ! 🐾</p>
                    <Link href="/rooms">
                        <button style={styles.ctaBtn}>จองห้องพักเลย</button>
                    </Link>
                </section>
            </div>
        </div>
    )
}

const styles = {
    page: { fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh' },
    hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '80px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '3rem', color: 'white', margin: '0 0 10px' },
    heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', margin: '0 0 20px' },
    backLink: { color: '#fbbf24', textDecoration: 'none' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' },

    // Rating Overview
    ratingOverview: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', marginBottom: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' },
    ratingBig: { textAlign: 'center' },
    ratingNumber: { fontSize: '5rem', fontWeight: '800', color: '#ea580c', display: 'block' },
    ratingStars: { fontSize: '1.5rem', marginBottom: '5px' },
    ratingCount: { color: '#6b7280' },
    ratingBars: { minWidth: '280px' },
    ratingBarRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
    barLabel: { width: '55px', fontSize: '0.9rem', color: '#374151' },
    barBg: { flex: 1, height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#fbbf24', borderRadius: '5px', transition: 'width 0.3s' },
    barCount: { width: '25px', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' },

    // Reviews
    reviewsSection: { marginBottom: '60px' },
    sectionTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px' },
    reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' },
    reviewCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' },
    reviewHeader: { display: 'flex', gap: '15px', marginBottom: '18px' },
    avatar: { width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' },
    reviewerName: { color: '#1a1a2e', display: 'block', fontSize: '1.1rem' },
    reviewMeta: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' },
    reviewRoom: { color: '#9ca3af' },
    reviewText: { color: '#4b5563', lineHeight: '1.8', margin: '0 0 15px', fontSize: '1rem' },
    reviewDate: { color: '#9ca3af', fontSize: '0.85rem' },

    // CTA
    cta: { backgroundColor: '#fff7ed', padding: '50px', borderRadius: '24px', textAlign: 'center', border: '2px dashed #fed7aa' },
    ctaTitle: { fontSize: '1.5rem', color: '#ea580c', margin: '0 0 10px' },
    ctaDesc: { color: '#6b7280', margin: '0 0 25px' },
    ctaBtn: { padding: '16px 40px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
}
