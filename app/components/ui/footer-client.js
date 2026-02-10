'use client'
import Link from 'next/link'

export default function FooterClient() {
  return (
    <footer style={styles.footerStyle}>
      <div style={styles.footerContainer}>
        <div style={styles.footerCol}>
          <h3 style={styles.footerHeading}>🐈 Cat Hotel</h3>
          <p style={styles.footerText}>โรงแรมแมวระดับพรีเมียมที่ดูแลน้องแมวเหมือนคนในครอบครัว สะอาด ปลอดภัย มีพี่เลี้ยงดูแลตลอด 24 ชั่วโมง</p>
        </div>

        <div style={styles.footerCol}>
          <h4 style={styles.footerSubHeading}>ลิงก์ด่วน</h4>
          <div style={styles.footerLinkGroup}>
            <Link href="/" style={styles.footerLink}>หน้าแรก</Link>
            <Link href="/rooms" style={styles.footerLink}>เลือกห้องพัก</Link>
            <Link href="/terms" style={styles.footerLink}>เงื่อนไขการเข้าพัก</Link>
          </div>
        </div>

        <div style={styles.footerCol}>
          <h4 style={styles.footerSubHeading}>ติดต่อเรา</h4>
          <p style={styles.footerText}>📍 123 ถนนลาดพร้าว กรุงเทพฯ</p>
          <p style={styles.footerText}>📞 โทร: 08x-xxx-xxxx</p>
        </div>

        <div style={styles.footerCol}>
          <h4 style={styles.footerSubHeading}>ติดตามเรา</h4>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <span style={styles.socialIcon}>FB</span>
            <span style={styles.socialIcon}>IG</span>
          </div>
        </div>
      </div>
      <div style={styles.bottomBar}>
        <p>© {new Date().getFullYear()} Cat Hotel Luxury Limited. All rights reserved.</p>
      </div>
    </footer>
  )
}

const styles = {
  footerStyle: { backgroundColor: '#1f2937', color: '#f3f4f6', paddingTop: '60px', marginTop: 'auto', fontFamily: "'Sarabun', sans-serif" },
  footerContainer: { maxWidth: '1200px', margin: '0 auto', padding: '0 50px 40px 50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' },
  footerCol: { display: 'flex', flexDirection: 'column' },
  footerHeading: { color: '#ea580c', fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold' },
  footerSubHeading: { color: '#fff', fontSize: '1.1rem', marginBottom: '20px', fontWeight: '600' },
  footerText: { fontSize: '0.9rem', lineHeight: '1.6', color: '#9ca3af', marginBottom: '10px' },
  footerLinkGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerLink: { textDecoration: 'none', color: '#9ca3af', fontSize: '0.9rem' },
  socialIcon: { width: '40px', height: '40px', backgroundColor: '#374151', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' },
  bottomBar: { borderTop: '1px solid #374151', padding: '25px 50px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }
}