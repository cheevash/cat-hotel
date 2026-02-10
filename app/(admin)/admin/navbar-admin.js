'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NavbarAdmin() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path) => pathname === path

  const menuItems = [
    { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/admin/bookings', icon: '📅', label: 'จัดการการจอง' },
    { href: '/admin/rooms', icon: '🏨', label: 'จัดการห้องพัก' },
    { href: '/admin/customers', icon: '👥', label: 'จัดการลูกค้า' },
    { href: '/admin/cats', icon: '🐱', label: 'จัดการแมว' },
    { href: '/admin/reviews', icon: '⭐', label: 'จัดการรีวิว' },
    { href: '/admin/settings', icon: '⚙️', label: 'ตั้งค่าระบบ' },
  ]

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoSection}>
        <span style={styles.logoEmoji}>🐈</span>
        <div style={styles.logoText}>
          <strong style={{ display: 'block', color: '#fff' }}>Cat Hotel</strong>
          <small style={{ color: '#94a3b8' }}>Admin Panel</small>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={isActive(item.href) ? styles.activeLink : styles.link}
          >
            <span style={styles.icon}>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <Link href="/" style={styles.link}>🏠 กลับหน้าเว็บหลัก</Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    boxShadow: '4px 0 15px rgba(0,0,0,0.1)'
  },
  logoSection: {
    padding: '25px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #334155',
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'
  },
  logoEmoji: { fontSize: '2.2rem' },
  logoText: { lineHeight: '1.2' },
  nav: { padding: '20px 12px', flex: 1, overflowY: 'auto' },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '13px 16px',
    color: '#94a3b8',
    textDecoration: 'none',
    borderRadius: '10px',
    marginBottom: '6px',
    transition: 'all 0.2s',
    fontSize: '0.95rem'
  },
  activeLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '13px 16px',
    backgroundColor: '#ea580c',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '10px',
    marginBottom: '6px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)'
  },
  icon: { marginRight: '12px', fontSize: '1.15rem' },
  sidebarFooter: { padding: '20px 12px', borderTop: '1px solid #334155' },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
}