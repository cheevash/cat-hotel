'use client'
import Link from 'next/link'

export default function PricingPage() {
    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>💰 ตารางราคา</h1>
                <p style={styles.heroDesc}>เลือกแพ็คเกจที่เหมาะกับเจ้านายของคุณ</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            <div style={styles.container}>
                {/* Pricing Cards */}
                <div style={styles.pricingGrid}>
                    {/* Standard */}
                    <div style={styles.pricingCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardIcon}>🏠</span>
                            <h3 style={styles.cardName}>Standard Room</h3>
                            <p style={styles.cardDesc}>เหมาะสำหรับน้องแมวขี้อาย ต้องการความเงียบสงบ</p>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.priceBox}>
                                <span style={styles.priceAmount}>350</span>
                                <span style={styles.priceUnit}>บาท/คืน</span>
                            </div>
                            <ul style={styles.featureList}>
                                <li style={styles.featureItem}>✅ ห้องส่วนตัวขนาด 1.5 x 1.5 เมตร</li>
                                <li style={styles.featureItem}>✅ เครื่องปรับอากาศ 24 ชม.</li>
                                <li style={styles.featureItem}>✅ ของเล่นพื้นฐาน</li>
                                <li style={styles.featureItem}>✅ อัพเดทรูปวันละ 2 ครั้ง</li>
                                <li style={styles.featureItem}>✅ ทำความสะอาดวันละ 2 รอบ</li>
                                <li style={{ ...styles.featureItem, color: '#9ca3af' }}>❌ กล้อง CCTV ส่วนตัว</li>
                                <li style={{ ...styles.featureItem, color: '#9ca3af' }}>❌ หอคอยแมว</li>
                            </ul>
                            <Link href="/rooms">
                                <button style={styles.cardBtn}>เลือกแพ็คเกจนี้</button>
                            </Link>
                        </div>
                    </div>

                    {/* Deluxe - Popular */}
                    <div style={{ ...styles.pricingCard, ...styles.popularCard }}>
                        <div style={styles.popularBadge}>🔥 ยอดนิยม</div>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardIcon}>🏰</span>
                            <h3 style={styles.cardName}>Deluxe Suite</h3>
                            <p style={styles.cardDesc}>ดูแลใกล้ชิดเหมือนอยู่บ้าน พร้อมสิ่งอำนวยความสะดวกครบ</p>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.priceBox}>
                                <span style={styles.priceAmount}>550</span>
                                <span style={styles.priceUnit}>บาท/คืน</span>
                            </div>
                            <ul style={styles.featureList}>
                                <li style={styles.featureItem}>✅ ห้องกว้างขนาด 2 x 2 เมตร</li>
                                <li style={styles.featureItem}>✅ แอร์ + เครื่องฟอกอากาศ</li>
                                <li style={styles.featureItem}>✅ ของเล่นชุดใหญ่ + หอคอยแมว</li>
                                <li style={styles.featureItem}>✅ อัพเดทรูป/คลิปไม่จำกัด</li>
                                <li style={styles.featureItem}>✅ กล้อง CCTV ดูสดได้ 24 ชม.</li>
                                <li style={styles.featureItem}>✅ น้ำพุแมว Premium</li>
                                <li style={{ ...styles.featureItem, color: '#9ca3af' }}>❌ พี่เลี้ยงส่วนตัว</li>
                            </ul>
                            <Link href="/rooms">
                                <button style={{ ...styles.cardBtn, backgroundColor: '#ea580c' }}>เลือกแพ็คเกจนี้</button>
                            </Link>
                        </div>
                    </div>

                    {/* VIP */}
                    <div style={styles.pricingCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardIcon}>👑</span>
                            <h3 style={styles.cardName}>VIP Royal</h3>
                            <p style={styles.cardDesc}>สำหรับเจ้านายตัวจริง ดูแลอย่างพิเศษสุด</p>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.priceBox}>
                                <span style={styles.priceAmount}>850</span>
                                <span style={styles.priceUnit}>บาท/คืน</span>
                            </div>
                            <ul style={styles.featureList}>
                                <li style={styles.featureItem}>✅ ห้อง VIP ขนาด 3 x 3 เมตร</li>
                                <li style={styles.featureItem}>✅ ระบบกรองอากาศ HEPA</li>
                                <li style={styles.featureItem}>✅ ของเล่น Premium + น้ำพุแมว</li>
                                <li style={styles.featureItem}>✅ Video Call กับทาสได้</li>
                                <li style={styles.featureItem}>✅ พี่เลี้ยงส่วนตัว 24 ชม.</li>
                                <li style={styles.featureItem}>✅ บริการสปา/อาบน้ำ ฟรี</li>
                                <li style={styles.featureItem}>✅ อาหาร Premium Grade</li>
                            </ul>
                            <Link href="/rooms">
                                <button style={styles.cardBtn}>เลือกแพ็คเกจนี้</button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Promotions */}
                <section style={styles.promoSection}>
                    <h2 style={styles.promoTitle}>🎁 โปรโมชั่นพิเศษ</h2>
                    <div style={styles.promoGrid}>
                        <div style={styles.promoCard}>
                            <span style={styles.promoIcon}>📅</span>
                            <div>
                                <h4 style={styles.promoName}>จอง 7 คืน ลด 10%</h4>
                                <p style={styles.promoDesc}>พักนานคุ้มกว่า! สำหรับทุกประเภทห้อง</p>
                            </div>
                        </div>
                        <div style={styles.promoCard}>
                            <span style={styles.promoIcon}>🐱🐱</span>
                            <div>
                                <h4 style={styles.promoName}>นำแมวมา 2 ตัว ลด 15%</h4>
                                <p style={styles.promoDesc}>มาเป็นคู่ สุขคูณสอง พักห้องเดียวกันได้</p>
                            </div>
                        </div>
                        <div style={styles.promoCard}>
                            <span style={styles.promoIcon}>🎂</span>
                            <div>
                                <h4 style={styles.promoName}>เดือนเกิดน้องแมว ลด 20%</h4>
                                <p style={styles.promoDesc}>แจ้งวันเกิดน้องรับส่วนลดพิเศษ!</p>
                            </div>
                        </div>
                        <div style={styles.promoCard}>
                            <span style={styles.promoIcon}>🔄</span>
                            <div>
                                <h4 style={styles.promoName}>ลูกค้าประจำ ลด 10%</h4>
                                <p style={styles.promoDesc}>สำหรับลูกค้าที่เคยใช้บริการครบ 3 ครั้ง</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Additional Services */}
                <section style={styles.addonsSection}>
                    <h2 style={styles.addonsTitle}>🛎️ บริการเสริม</h2>
                    <div style={styles.addonsGrid}>
                        <div style={styles.addonCard}>
                            <span style={styles.addonIcon}>🛁</span>
                            <h4 style={styles.addonName}>อาบน้ำ + ตัดเล็บ</h4>
                            <p style={styles.addonPrice}>250 - 450 บาท</p>
                        </div>
                        <div style={styles.addonCard}>
                            <span style={styles.addonIcon}>✂️</span>
                            <h4 style={styles.addonName}>ตัดขน</h4>
                            <p style={styles.addonPrice}>350 - 650 บาท</p>
                        </div>
                        <div style={styles.addonCard}>
                            <span style={styles.addonIcon}>🚗</span>
                            <h4 style={styles.addonName}>รับ-ส่งถึงบ้าน</h4>
                            <p style={styles.addonPrice}>เริ่มต้น 200 บาท</p>
                        </div>
                        <div style={styles.addonCard}>
                            <span style={styles.addonIcon}>🍽️</span>
                            <h4 style={styles.addonName}>อาหาร Premium</h4>
                            <p style={styles.addonPrice}>+100 บาท/วัน</p>
                        </div>
                    </div>
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
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },

    // Pricing Cards
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '70px' },
    pricingCard: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '2px solid #f0f0f0', position: 'relative' },
    popularCard: { border: '3px solid #ea580c', transform: 'scale(1.03)' },
    popularBadge: { position: 'absolute', top: '0', right: '25px', backgroundColor: '#ea580c', color: 'white', padding: '10px 20px', borderRadius: '0 0 15px 15px', fontWeight: 'bold' },
    cardHeader: { padding: '35px 30px 25px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' },
    cardIcon: { fontSize: '4rem', display: 'block', marginBottom: '15px' },
    cardName: { fontSize: '1.6rem', color: '#1a1a2e', margin: '0 0 8px' },
    cardDesc: { color: '#6b7280', fontSize: '0.95rem', margin: 0 },
    cardBody: { padding: '30px' },
    priceBox: { textAlign: 'center', marginBottom: '25px' },
    priceAmount: { fontSize: '3.5rem', fontWeight: '800', color: '#ea580c' },
    priceUnit: { color: '#9ca3af', fontSize: '1rem', display: 'block' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 25px' },
    featureItem: { padding: '10px 0', borderBottom: '1px solid #f5f5f5', color: '#374151' },
    cardBtn: { width: '100%', padding: '16px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },

    // Promo
    promoSection: { marginBottom: '60px' },
    promoTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', textAlign: 'center' },
    promoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    promoCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff7ed', padding: '25px', borderRadius: '16px', border: '2px dashed #fed7aa' },
    promoIcon: { fontSize: '2.5rem' },
    promoName: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 5px' },
    promoDesc: { color: '#6b7280', margin: 0, fontSize: '0.9rem' },

    // Addons
    addonsSection: {},
    addonsTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', textAlign: 'center' },
    addonsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    addonCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
    addonIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '15px' },
    addonName: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 8px' },
    addonPrice: { color: '#ea580c', fontWeight: 'bold', margin: 0 },
}
