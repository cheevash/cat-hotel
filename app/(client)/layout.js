'use client'
import NavbarClient from './navbar-client'
import FooterClient from './footer-client'

export default function ClientLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ใช้งาน Navbar ตัวใหม่ */}
      <NavbarClient />

      {/* เนื้อหาหลักของหน้าเว็บ */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ใช้งาน Footer ตัวใหม่ */}
      <FooterClient />
    </div>
  )
}