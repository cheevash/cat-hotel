'use client'
import { usePathname } from 'next/navigation'
import NavbarAdmin from './navbar-admin'
import FooterAdmin from './footer-admin' // 1. Import ตัวใหม่เข้ามา

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  return (
    <div style={styles.layout}>
      <NavbarAdmin />

      <div style={styles.mainContainer}>
        <header style={styles.topNav}>
          <div style={styles.breadcrumb}>
            Admin / <span style={{ color: '#1e293b' }}>{pathname.split('/').pop()}</span>
          </div>
          <div style={styles.adminProfile}>
            <span style={styles.adminAvatar}>A</span>
            <span>Administrator</span>
          </div>
        </header>

        <main style={styles.content}>
          {children}
        </main>

        {/* 2. เรียกใช้งานคอมโพเนนต์ Footer ที่นี่ */}
        <FooterAdmin />
      </div>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' },
  mainContainer: { 
    marginLeft: '260px', 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column',
    minHeight: '100vh' // มั่นใจว่า container สูงเต็มจอเพื่อให้ footer อยู่ล่างสุด
  },
  topNav: { height: '70px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 },
  breadcrumb: { color: '#64748b', fontSize: '0.9rem', textTransform: 'capitalize' },
  adminProfile: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#475569' },
  adminAvatar: { width: '35px', height: '35px', backgroundColor: '#ea580c', color: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  content: { padding: '30px', flex: 1 }, // flex: 1 จะช่วยดัน footer ลงไปข้างล่าง
}