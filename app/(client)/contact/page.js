'use client'
import Link from 'next/link'

export default function ContactPage() {
    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>📞 ติดต่อเรา</h1>
                <p style={styles.heroDesc}>พร้อมให้บริการทุกวัน 09:00 - 20:00 น.</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            <div style={styles.container}>
                {/* Contact Cards */}
                <section style={styles.contactGrid}>
                    <a href="tel:0812345678" style={styles.contactCard}>
                        <span style={styles.contactIcon}>📱</span>
                        <h3 style={styles.contactTitle}>โทรศัพท์</h3>
                        <p style={styles.contactValue}>081-234-5678</p>
                        <span style={styles.contactHint}>กดเพื่อโทรหาเราได้เลย</span>
                    </a>

                    <a href="https://line.me/ti/p/@cathotel" target="_blank" style={{ ...styles.contactCard, backgroundColor: '#00B900', color: 'white' }}>
                        <span style={styles.contactIcon}>💬</span>
                        <h3 style={{ ...styles.contactTitle, color: 'white' }}>LINE Official</h3>
                        <p style={{ ...styles.contactValue, color: 'white' }}>@cathotel</p>
                        <span style={{ ...styles.contactHint, color: 'rgba(255,255,255,0.8)' }}>แชทตอบเร็วที่สุด!</span>
                    </a>

                    <a href="https://facebook.com/cathotel" target="_blank" style={{ ...styles.contactCard, backgroundColor: '#1877F2', color: 'white' }}>
                        <span style={styles.contactIcon}>📘</span>
                        <h3 style={{ ...styles.contactTitle, color: 'white' }}>Facebook</h3>
                        <p style={{ ...styles.contactValue, color: 'white' }}>Cat Hotel Thailand</p>
                        <span style={{ ...styles.contactHint, color: 'rgba(255,255,255,0.8)' }}>ดูรูปน้องแมวเพิ่มเติม</span>
                    </a>

                    <a href="https://instagram.com/cathotel" target="_blank" style={{ ...styles.contactCard, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white' }}>
                        <span style={styles.contactIcon}>📷</span>
                        <h3 style={{ ...styles.contactTitle, color: 'white' }}>Instagram</h3>
                        <p style={{ ...styles.contactValue, color: 'white' }}>@cathotel</p>
                        <span style={{ ...styles.contactHint, color: 'rgba(255,255,255,0.8)' }}>ตามไปดู Story ได้!</span>
                    </a>
                </section>

                {/* ข้อมูลร้าน */}
                <section style={styles.infoSection}>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>📍 ที่ตั้ง</h3>
                            <p style={styles.infoText}>
                                Cat Hotel<br />
                                ลาดพร้าว ซอย 101<br />
                                แขวงคลองจั่น เขตบางกะปิ<br />
                                กรุงเทพมหานคร 10240
                            </p>
                        </div>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>⏰ เวลาทำการ</h3>
                            <p style={styles.infoText}>
                                <strong>เปิดทุกวัน</strong><br />
                                09:00 - 20:00 น.<br /><br />
                                <strong>เช็คอิน:</strong> 09:00 - 20:00 น.<br />
                                <strong>เช็คเอาท์:</strong> 09:00 - 12:00 น.
                            </p>
                        </div>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>🚗 การเดินทาง</h3>
                            <p style={styles.infoText}>
                                • รถยนต์ส่วนตัว: มีที่จอดรถหน้าร้านฟรี<br />
                                • รถไฟฟ้า: สถานี MRT ลาดพร้าว + Taxi<br />
                                • Grab/Bolt: พิกัด "Cat Hotel ลาดพร้าว 101"
                            </p>
                        </div>
                    </div>
                </section>

                {/* Google Map */}
                <section style={styles.mapSection}>
                    <h2 style={styles.mapTitle}>🗺️ แผนที่</h2>
                    <div style={styles.mapWrapper}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.148564177579!2d100.62725537604471!3d13.77051399684128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d618d34190f89%3A0x86733230869a19d!2z4Lil4Liy4LiU4Lie4Lij4LmJ4Liy4LinIDEwMQ!5e0!3m2!1sth!2sth!4v1709100000000!5m2!1sth!2sth"
                            width="100%"
                            height="400"
                            style={{ border: 0, borderRadius: '16px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </section>

                {/* Contact Form */}
                <section style={styles.formSection}>
                    <h2 style={styles.formTitle}>✉️ ส่งข้อความถึงเรา</h2>
                    <p style={styles.formDesc}>มีคำถามหรือข้อเสนอแนะ? เขียนมาหาเราได้เลย!</p>
                    <form style={styles.form}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>ชื่อ</label>
                                <input type="text" placeholder="ชื่อของคุณ" style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>เบอร์โทร / Email</label>
                                <input type="text" placeholder="เพื่อติดต่อกลับ" style={styles.input} />
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>หัวข้อ</label>
                            <select style={styles.input}>
                                <option>สอบถามข้อมูลทั่วไป</option>
                                <option>สอบถามเรื่องการจอง</option>
                                <option>ร้องเรียน/ข้อเสนอแนะ</option>
                                <option>สมัครงาน</option>
                                <option>อื่นๆ</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>ข้อความ</label>
                            <textarea placeholder="เขียนข้อความที่นี่..." rows={5} style={{ ...styles.input, resize: 'vertical' }}></textarea>
                        </div>
                        <button type="submit" style={styles.submitBtn}>ส่งข้อความ 📨</button>
                    </form>
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

    // Contact Cards
    contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '60px' },
    contactCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '35px 25px', backgroundColor: '#fff', borderRadius: '20px', textDecoration: 'none', color: '#1a1a2e', boxShadow: '0 5px 25px rgba(0,0,0,0.05)', transition: 'transform 0.3s', textAlign: 'center' },
    contactIcon: { fontSize: '3rem', marginBottom: '15px' },
    contactTitle: { fontSize: '1.2rem', margin: '0 0 5px', fontWeight: '700' },
    contactValue: { fontSize: '1.3rem', fontWeight: 'bold', margin: '0 0 10px' },
    contactHint: { fontSize: '0.85rem', color: '#6b7280' },

    // Info Section
    infoSection: { marginBottom: '60px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' },
    infoCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
    infoTitle: { fontSize: '1.3rem', color: '#ea580c', margin: '0 0 15px' },
    infoText: { color: '#4b5563', lineHeight: '1.8', margin: 0 },

    // Map
    mapSection: { marginBottom: '60px' },
    mapTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', textAlign: 'center' },
    mapWrapper: { boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '20px', overflow: 'hidden' },

    // Form
    formSection: { backgroundColor: '#fff', padding: '50px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' },
    formTitle: { fontSize: '1.8rem', color: '#1a1a2e', margin: '0 0 10px', textAlign: 'center' },
    formDesc: { color: '#6b7280', textAlign: 'center', margin: '0 0 30px' },
    form: { maxWidth: '600px', margin: '0 auto' },
    formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' },
    input: { width: '100%', padding: '14px 18px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' },
    submitBtn: { width: '100%', padding: '18px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
}
