'use client'

export default function FooterAdmin() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          © {new Date().getFullYear()} <span style={styles.brand}>Cat Hotel Management System</span>
        </p>
        <div style={styles.versionBadge}>
          v1.0.2
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    padding: '20px 30px',
    backgroundColor: '#fff', // หรือใช้ transparent ถ้าอยากให้กลืนกับพื้นหลัง
    borderTop: '1px solid #e2e8f0',
    marginTop: 'auto', // ช่วยดัน footer ลงล่างสุดเสมอ
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    margin: 0,
  },
  brand: {
    fontWeight: '600',
    color: '#64748b',
  },
  versionBadge: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  }
}