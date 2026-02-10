'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function NavbarClient() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // ดึงข้อมูล session ปัจจุบัน
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        // ดึงข้อมูล profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    router.push('/login')
  }

  // ฟังก์ชันช่วยเช็คสถานะ Active เพื่อเปลี่ยนสีเมนู
  const isActive = (path) => pathname === path

  // แสดง avatar หรือ placeholder
  const getAvatarDisplay = () => {
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt="avatar"
          style={styles.avatarImg}
        />
      )
    }
    // Placeholder avatar จากชื่อ
    const initial = profile?.first_name?.charAt(0)?.toUpperCase() || '🐱'
    return (
      <div style={styles.avatarPlaceholder}>
        {initial}
      </div>
    )
  }

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
        <Link href="/pricing" style={isActive('/pricing') ? styles.activeLink : styles.linkStyle}>ราคา</Link>
        <Link href="/gallery" style={isActive('/gallery') ? styles.activeLink : styles.linkStyle}>แกลเลอรี่</Link>
        <Link href="/faq" style={isActive('/faq') ? styles.activeLink : styles.linkStyle}>FAQ</Link>
        <Link href="/contact" style={isActive('/contact') ? styles.activeLink : styles.linkStyle}>ติดต่อเรา</Link>

        {/* Notification Bell */}
        {user && (
          <Link href="/notifications" style={styles.notificationLink}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            {/* <span style={styles.notificationBadge}></span> */}
          </Link>
        )}

        {loading ? (
          <div style={styles.loadingDot}>...</div>
        ) : user ? (
          // Dropdown User Menu
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={styles.dropdownToggle}
            >
              {getAvatarDisplay()}
              <span style={styles.userName}>
                {profile?.first_name || user.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>▼</span>
            </button>

            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownHeader}>
                  <strong style={{ display: 'block', color: '#374151' }}>
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'User'}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</span>
                </div>

                <Link href="/profile" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  👤 โปรไฟล์ของฉัน
                </Link>
                <Link href="/my-cats" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  🐱 แมวของฉัน
                </Link>
                <Link href="/my-bookings" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  📅 การจองของฉัน
                </Link>

                <div style={styles.dropdownDivider}></div>

                <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#ef4444', border: 'none', background: 'none', width: '100%' }}>
                  🚪 ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        ) : (
          // ถ้ายังไม่ได้ login
          <Link href="/login">
            <button style={styles.loginBtnStyle}>เข้าสู่ระบบ</button>
          </Link>
        )}
      </div>
    </nav>
  )
}

const styles = {
  navStyle: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
    position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  logoStyle: { fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '-0.5px' },
  linkStyle: { textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '0.95rem', transition: 'color 0.2s' },
  activeLink: { textDecoration: 'none', color: '#ea580c', fontWeight: 'bold', fontSize: '0.95rem' },
  loginBtnStyle: { padding: '10px 20px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  notificationLink: {
    marginRight: '15px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    ':hover': { backgroundColor: '#f3f4f6' }
  },
  loadingDot: { color: '#9ca3af', fontSize: '0.9rem' },

  // Dropdown
  dropdownContainer: { position: 'relative' },
  dropdownToggle: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px 12px', borderRadius: '50px',
    backgroundColor: '#fff7ed', border: '1px solid #fed7aa'
  },
  avatarImg: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ea580c' },
  avatarPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' },
  userName: { color: '#9a3412', fontWeight: '600', fontSize: '0.9rem' },

  dropdownMenu: {
    position: 'absolute', top: '120%', right: 0,
    backgroundColor: 'white', borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    width: '240px', padding: '8px', border: '1px solid #f3f4f6',
    display: 'flex', flexDirection: 'column'
  },
  dropdownHeader: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', marginBottom: '8px' },
  dropdownItem: {
    padding: '10px 16px', textDecoration: 'none', color: '#374151',
    fontSize: '0.9rem', borderRadius: '8px', transition: 'background 0.2s',
    cursor: 'pointer', textAlign: 'left', display: 'block'
  },
  dropdownDivider: { height: '1px', backgroundColor: '#f3f4f6', margin: '8px 0' }
}