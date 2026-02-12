'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      Swal.fire('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลและรหัสผ่าน', 'warning')
      return
    }
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
      if (profile?.role === 'admin') router.push('/admin/dashboard')
      else router.push('/')
    } catch (error) {
      let msg = error.message
      if (msg === 'Invalid login credentials') msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      Swal.fire('เข้าสู่ระบบไม่สำเร็จ', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* เพิ่ม CSS สำหรับ Mobile โดยเฉพาะที่นี่ */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .main-container {
            flex-direction: column !important;
            max-width: 100% !important;
            border-radius: 20px !important;
            margin: 10px !important;
          }
          .left-panel {
            padding: 40px 20px !important;
            border-radius: 0 !important;
          }
          .right-panel {
            padding: 40px 20px !important;
          }
          .brand-name {
            font-size: 2rem !important;
          }
          .brand-icon {
            font-size: 3rem !important;
          }
          .features {
            display: none !important; /* ซ่อนฟีเจอร์ในมือถือเพื่อประหยัดพื้นที่ */
          }
          .cat-decor {
            display: none !important;
          }
        }
      `}} />

      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      {/* เพิ่ม className เพื่อให้ CSS ด้านบนทำงาน */}
      <div className="main-container" style={styles.container}>
        {/* Left Side */}
        <div className="left-panel" style={styles.leftPanel}>
          <div style={styles.brand}>
            <span className="brand-icon" style={styles.brandIcon}>🐱</span>
            <h1 className="brand-name" style={styles.brandName}>Cat Hotel</h1>
            <p style={styles.brandTag}>Luxury Pet Stay</p>
          </div>
          <div className="features" style={styles.features}>
            <div style={styles.featureItem}><span style={styles.featureIcon}>🏨</span><span>ห้องพักพรีเมียม แอร์ส่วนตัว</span></div>
            <div style={styles.featureItem}><span style={styles.featureIcon}>📹</span><span>CCTV ดูสด 24 ชั่วโมง</span></div>
            <div style={styles.featureItem}><span style={styles.featureIcon}>💕</span><span>พี่เลี้ยงดูแลใกล้ชิด</span></div>
          </div>
          <div className="cat-decor" style={styles.catDecor}>😺 🐾 😻</div>
        </div>

        {/* Right Side */}
        <div className="right-panel" style={styles.rightPanel}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>ยินดีต้อนรับกลับ!</h2>
              <p style={styles.formSubtitle}>เข้าสู่ระบบเพื่อจองห้องพักให้เจ้านาย</p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>อีเมล</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>📧</span>
                  <input
                    type="email"
                    style={styles.input}
                    placeholder="example@mail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>รหัสผ่าน</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    type="password"
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
                disabled={loading}
              >
                {loading ? <span>⏳ กำลังตรวจสอบ...</span> : <span>🚀 เข้าสู่ระบบ</span>}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>หรือ</span>
              <span style={styles.dividerLine}></span>
            </div>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                ยังไม่มีบัญชี?
                <Link href="/register" style={styles.link}> สมัครสมาชิกที่นี่</Link>
              </p>
              <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Styles คงเดิมทุกประการตามความต้องการ
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Sarabun', 'Kanit', sans-serif",
  },
  bgCircle1: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.1)', top: '-100px', right: '-100px' },
  bgCircle2: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.08)', bottom: '-50px', left: '-50px' },
  container: {
    display: 'flex',
    maxWidth: '1000px',
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  leftPanel: {
    flex: 1,
    padding: '60px 50px',
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  brand: { marginBottom: '50px' },
  brandIcon: { fontSize: '4rem', display: 'block', marginBottom: '15px' },
  brandName: { fontSize: '2.8rem', fontWeight: '800', color: 'white', margin: '0 0 8px' },
  brandTag: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: 0 },
  features: { display: 'flex', flexDirection: 'column', gap: '18px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '1rem' },
  featureIcon: { fontSize: '1.5rem' },
  catDecor: { position: 'absolute', bottom: '30px', right: '30px', fontSize: '2.5rem', opacity: 0.5 },
  rightPanel: { flex: 1, padding: '60px 50px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formContainer: { width: '100%', maxWidth: '380px' },
  formHeader: { marginBottom: '35px' },
  formTitle: { fontSize: '2rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' },
  formSubtitle: { color: '#6b7280', fontSize: '1rem', margin: 0 },
  inputGroup: { marginBottom: '22px' },
  label: { display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '10px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '18px', fontSize: '1.2rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '16px 18px 16px 52px', borderRadius: '14px', border: '2px solid #e5e7eb', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fafafa' },
  button: { width: '100%', padding: '18px', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.35)', transition: 'all 0.3s', marginTop: '10px' },
  divider: { display: 'flex', alignItems: 'center', margin: '30px 0', gap: '15px' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
  dividerText: { color: '#9ca3af', fontSize: '0.9rem' },
  footer: { textAlign: 'center' },
  footerText: { color: '#6b7280', margin: '0 0 15px' },
  link: { color: '#ea580c', textDecoration: 'none', fontWeight: '600' },
  backLink: { display: 'inline-block', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' },
}