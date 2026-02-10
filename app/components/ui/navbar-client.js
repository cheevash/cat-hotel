'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavbarClient() {
  const pathname = usePathname()

  // ฟังก์ชันช่วยเช็คสถานะ Active เพื่อเปลี่ยนสีเมนู
  const isActive = (path) => pathname === path

  return (
    <nav style={styles.navStyle}>
      <div style={styles.logoStyle}>
        <Link href="/" style={{ textDecoration: 'none', color: '#ea580c' }}>
          🐈 Cat Hotel <span style={{ fontSize: '0.8rem', color: '#9a3412' }}>Luxury Pet Stay</span>
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <Link href="/" style={isActive('/') ? styles.activeLink : styles.linkStyle}>หน้าแรก</Link>
        <Link href="/rooms" style={isActive('/rooms') ? styles.activeLink : styles.linkStyle}>จองห้องพัก</Link>
        <Link href="/my-bookings" style={isActive('/my-bookings') ? styles.activeLink : styles.linkStyle}>รายการจอง</Link>
        <Link href="/profile" style={isActive('/profile') ? styles.activeLink : styles.linkStyle}>โปรไฟล์</Link>
        <Link href="/login">
          <button style={styles.loginBtnStyle}>เข้าสู่ระบบ</button>
        </Link>
      </div>
    </nav>
  )
}

const styles = {
  navStyle: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '15px 50px', 
    backgroundColor: '#fff', 
    borderBottom: '1px solid #f3f4f6',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  logoStyle: { fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '-0.5px' },
  linkStyle: { textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '0.95rem', transition: 'color 0.2s' },
  activeLink: { textDecoration: 'none', color: '#ea580c', fontWeight: 'bold', fontSize: '0.95rem' },
  loginBtnStyle: { padding: '10px 20px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }
}