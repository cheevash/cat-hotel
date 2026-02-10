'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!firstName || !lastName || !email || !password) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (password !== confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
      return
    }

    if (password.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      const user = authData.user
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            updated_at: new Date().toISOString(),
          })

        if (profileError) throw profileError
      }

      alert('สมัครสมาชิกสำเร็จ 🎉 กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี')
      router.push('/login')

    } catch (error) {
      console.error('Registration Error:', error)

      let msg = error.message
      if (msg === 'User already registered') msg = 'อีเมลนี้ถูกใช้งานไปแล้ว'
      if (msg === 'Password should be at least 6 characters') msg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'

      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background Decorations */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      <div style={styles.container}>
        {/* Left Side - Branding */}
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🐱</span>
            <h1 style={styles.brandName}>Cat Hotel</h1>
            <p style={styles.brandTag}>Luxury Pet Stay</p>
          </div>
          <div style={styles.welcomeText}>
            <h2 style={styles.welcomeTitle}>มาเป็นครอบครัว Cat Hotel!</h2>
            <p style={styles.welcomeDesc}>
              สมัครสมาชิกเพื่อรับสิทธิพิเศษมากมาย<br />
              ส่วนลดสำหรับสมาชิก และโปรโมชั่นพิเศษ
            </p>
          </div>
          <div style={styles.benefits}>
            <div style={styles.benefitItem}>✅ จองห้องพักออนไลน์ได้ตลอด 24 ชม.</div>
            <div style={styles.benefitItem}>✅ รับส่วนลด 10% สำหรับการจองครั้งแรก</div>
            <div style={styles.benefitItem}>✅ สะสมแต้มแลกของรางวัล</div>
          </div>
          <div style={styles.catDecor}>🐾 😺 🐾</div>
        </div>

        {/* Right Side - Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>สมัครสมาชิก</h2>
              <p style={styles.formSubtitle}>สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
            </div>

            <form onSubmit={handleRegister}>
              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>ชื่อจริง</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="ชื่อ"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>นามสกุล</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="นามสกุล"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>ยืนยันรหัสผ่าน</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    type="password"
                    style={styles.input}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
                disabled={loading}
              >
                {loading ? (
                  <span>⏳ กำลังสร้างบัญชี...</span>
                ) : (
                  <span>🎉 สมัครสมาชิก</span>
                )}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>หรือ</span>
              <span style={styles.dividerLine}></span>
            </div>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                มีบัญชีอยู่แล้ว?
                <Link href="/login" style={styles.link}> เข้าสู่ระบบ</Link>
              </p>
              <Link href="/" style={styles.backLink}>
                ← กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  bgCircle1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(234, 88, 12, 0.1)',
    top: '-100px',
    left: '-100px',
  },
  bgCircle2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(251, 191, 36, 0.08)',
    bottom: '-50px',
    right: '-50px',
  },
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
    padding: '50px 45px',
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  brand: {
    marginBottom: '35px',
  },
  brandIcon: {
    fontSize: '3.5rem',
    display: 'block',
    marginBottom: '12px',
  },
  brandName: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 5px',
  },
  brandTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '1rem',
    margin: 0,
  },
  welcomeText: {
    marginBottom: '25px',
  },
  welcomeTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 10px',
  },
  welcomeDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1rem',
    lineHeight: '1.7',
    margin: 0,
  },
  benefits: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  benefitItem: {
    color: 'white',
    fontSize: '0.95rem',
  },
  catDecor: {
    position: 'absolute',
    bottom: '25px',
    right: '25px',
    fontSize: '2rem',
    opacity: 0.5,
  },
  rightPanel: {
    flex: 1.1,
    padding: '45px 50px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    marginBottom: '28px',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  formSubtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '15px',
    fontSize: '1.1rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 15px 14px 45px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(234, 88, 12, 0.35)',
    transition: 'all 0.3s',
    marginTop: '8px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: '0.85rem',
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    color: '#6b7280',
    margin: '0 0 12px',
    fontSize: '0.95rem',
  },
  link: {
    color: '#ea580c',
    textDecoration: 'none',
    fontWeight: '600',
  },
  backLink: {
    display: 'inline-block',
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
}