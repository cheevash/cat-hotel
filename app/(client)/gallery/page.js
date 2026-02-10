'use client'
import Link from 'next/link'

export default function GalleryPage() {
    const galleries = [
        {
            category: 'ห้องพัก', items: [
                { img: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=600&h=400&fit=crop', title: 'ห้อง Standard', desc: 'ห้องขนาดมาตรฐาน อบอุ่นเหมือนอยู่บ้าน' },
                { img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=400&fit=crop', title: 'ห้อง Deluxe Suite', desc: 'ห้องกว้างพร้อมหอคอยปีนป่าย' },
                { img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop', title: 'ห้อง VIP Royal', desc: 'ห้องที่ใหญ่ที่สุด พร้อมสิ่งอำนวยความสะดวกครบ' },
            ]
        },
        {
            category: 'น้องแมวที่เคยมาพัก', items: [
                { img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', title: 'น้องส้มโอ', desc: 'Scottish Fold น่ารัก มาพัก 5 วัน' },
                { img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=400&fit=crop', title: 'น้องปุยนุ่น', desc: 'Persian ขนฟู มาพักประจำทุกเดือน' },
                { img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=400&fit=crop', title: 'น้องถุงเงิน', desc: 'British Shorthair ขี้อ้อน' },
                { img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&h=400&fit=crop', title: 'น้องมิกกี้', desc: 'Maine Coon ตัวใหญ่ใจดี' },
                { img: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&h=400&fit=crop', title: 'น้องชีสเค้ก', desc: 'Ragdoll นิสัยเรียบร้อย' },
                { img: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=400&fit=crop', title: 'น้องนมสด', desc: 'Siamese เสียงดังน่ารัก' },
            ]
        },
        {
            category: 'บรรยากาศร้าน', items: [
                { img: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=400&fit=crop', title: 'ล็อบบี้ต้อนรับ', desc: 'พื้นที่ต้อนรับอบอุ่น สะอาด' },
                { img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop', title: 'ห้องเล่น', desc: 'พื้นที่ให้น้องแมวออกกำลังกาย' },
                { img: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=600&h=400&fit=crop', title: 'มุมพักผ่อน', desc: 'โซนนั่งเล่นสำหรับทาสแมว' },
            ]
        },
    ]

    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>📷 แกลเลอรี่</h1>
                <p style={styles.heroDesc}>ชมบรรยากาศห้องพักและน้องแมวที่เคยมาพักกับเรา</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            {/* Gallery Sections */}
            <div style={styles.container}>
                {galleries.map((section, idx) => (
                    <section key={idx} style={styles.section}>
                        <h2 style={styles.sectionTitle}>{section.category}</h2>
                        <div style={styles.grid}>
                            {section.items.map((item, i) => (
                                <div key={i} style={styles.card}>
                                    <div style={styles.imageWrapper}>
                                        <img src={item.img} alt={item.title} style={styles.image} />
                                    </div>
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.cardTitle}>{item.title}</h3>
                                        <p style={styles.cardDesc}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* CTA */}
            <section style={styles.cta}>
                <h2 style={styles.ctaTitle}>อยากให้น้องแมวมาเป็นส่วนหนึ่งของครอบครัวเรา?</h2>
                <Link href="/rooms">
                    <button style={styles.ctaBtn}>จองห้องพักเลย 🐾</button>
                </Link>
            </section>
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
    section: { marginBottom: '60px' },
    sectionTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', paddingBottom: '10px', borderBottom: '3px solid #ea580c', display: 'inline-block' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    card: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transition: 'transform 0.3s' },
    imageWrapper: { height: '220px', overflow: 'hidden' },
    image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
    cardContent: { padding: '20px' },
    cardTitle: { fontSize: '1.2rem', color: '#1a1a2e', margin: '0 0 8px' },
    cardDesc: { color: '#6b7280', margin: 0, fontSize: '0.95rem' },
    cta: { background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', padding: '80px 20px', textAlign: 'center' },
    ctaTitle: { fontSize: '2rem', color: 'white', margin: '0 0 25px' },
    ctaBtn: { padding: '18px 40px', backgroundColor: 'white', color: '#ea580c', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
}
