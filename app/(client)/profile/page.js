'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const { data: catsData } = await supabase.from('cats').select('*').eq('owner_id', user.id);
      setCats(catsData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}>🐾</div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );

  return (
    <div style={styles.pageBackground}>
      <div style={styles.contentWrapper}>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.cardHeader}>
            <div style={styles.avatarWrapper}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {profile?.first_name ? profile.first_name[0].toUpperCase() : '👤'}
                </div>
              )}
              {/* <button style={styles.editAvatarBtn}>📷</button> */}
            </div>
            <div style={styles.profileInfo}>
              <h1 style={styles.userName}>
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Guest User'}
              </h1>
              <p style={styles.userEmail}>{user?.email}</p>
              <div style={styles.badges}>
                <span style={styles.badge}>Member</span>
                <span style={{ ...styles.badge, backgroundColor: '#e0f2fe', color: '#0369a1' }}>Verified</span>
              </div>
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{cats.length}</span>
              <span style={styles.statLabel}>แมวของฉัน</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>0</span>
              <span style={styles.statLabel}>การเข้าพัก</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>0</span>
              <span style={styles.statLabel}>รีวิว</span>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>เมนูด่วน</h2>
          <div style={styles.quickLinksGrid}>
            <Link href="/my-cats" style={styles.linkCard}>
              <div style={{ ...styles.iconBox, backgroundColor: '#ffedd5', color: '#ea580c' }}>🐱</div>
              <div>
                <h3 style={styles.linkTitle}>จัดการแมว</h3>
                <p style={styles.linkDesc}>เพิ่มหรือแก้ไขข้อมูลน้องแมว</p>
              </div>
              <div style={styles.arrowIcon}>→</div>
            </Link>

            <Link href="/my-bookings" style={styles.linkCard}>
              <div style={{ ...styles.iconBox, backgroundColor: '#dbeafe', color: '#2563eb' }}>📅</div>
              <div>
                <h3 style={styles.linkTitle}>ประวัติการจอง</h3>
                <p style={styles.linkDesc}>ดูการจองปัจจุบันและย้อนหลัง</p>
              </div>
              <div style={styles.arrowIcon}>→</div>
            </Link>

            <div style={{ ...styles.linkCard, opacity: 0.7, cursor: 'not-allowed' }}>
              <div style={{ ...styles.iconBox, backgroundColor: '#fce7f3', color: '#be185d' }}>❤️</div>
              <div>
                <h3 style={styles.linkTitle}>รายการโปรด</h3>
                <p style={styles.linkDesc}>ห้องพักที่ถูกใจ (เร็วๆ นี้)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button (Mock) */}
        <button style={styles.logoutBtn} onClick={() => alert('ฟีเจอร์แก้ไขโปรไฟล์กำลังมาเร็วๆ นี้!')}>
          ✏️ แก้ไขข้อมูลส่วนตัว
        </button>

      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    padding: '40px 20px',
    fontFamily: "'Sarabun', 'Kanit', sans-serif"
  },
  contentWrapper: { maxWidth: '600px', margin: '0 auto' },

  loadingContainer: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', color: '#ea580c'
  },
  spinner: { fontSize: '40px', marginBottom: '15px', animation: 'bounce 1s infinite' },

  // Profile Card
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    marginBottom: '30px',
    textAlign: 'center'
  },
  cardHeader: { marginBottom: '25px' },
  avatarWrapper: {
    position: 'relative', width: '100px', height: '100px', margin: '0 auto 15px'
  },
  avatarImg: {
    width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
    border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  avatarPlaceholder: {
    width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#ea580c',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '3rem', fontWeight: 'bold', border: '4px solid white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  editAvatarBtn: {
    position: 'absolute', bottom: '0', right: '0',
    backgroundColor: 'white', border: 'none', borderRadius: '50%',
    width: '32px', height: '32px', cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  userName: { fontSize: '1.8rem', color: '#1f2937', margin: '0 0 5px 0', fontWeight: '800' },
  userEmail: { color: '#6b7280', fontSize: '1rem', margin: '0 0 15px 0' },
  badges: { display: 'flex', justifyContent: 'center', gap: '10px' },
  badge: {
    padding: '4px 12px', backgroundColor: '#fef3c7', color: '#d97706',
    borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold'
  },

  statsRow: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px',
    paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)'
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statValue: { fontSize: '1.4rem', fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: '0.85rem', color: '#9ca3af' },
  statDivider: { width: '1px', height: '40px', backgroundColor: '#e5e7eb' },

  // Quick Links
  sectionTitle: { fontSize: '1.2rem', color: '#4b5563', marginBottom: '15px', paddingLeft: '10px' },
  quickLinksGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  linkCard: {
    display: 'flex', alignItems: 'center', gap: '15px',
    backgroundColor: 'white', padding: '15px 20px', borderRadius: '16px',
    textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: '1px solid white',
    ':hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
  },
  iconBox: {
    width: '50px', height: '50px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem'
  },
  linkTitle: { margin: '0 0 2px 0', color: '#1f2937', fontSize: '1rem' },
  linkDesc: { margin: 0, color: '#9ca3af', fontSize: '0.85rem' },
  arrowIcon: { marginLeft: 'auto', color: '#cbd5e1', fontSize: '1.2rem' },

  logoutBtn: {
    width: '100%', padding: '15px', marginTop: '30px',
    backgroundColor: 'white', color: '#4b5563', border: '1px dashed #d1d5db',
    borderRadius: '16px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': { backgroundColor: '#f9fafb', borderColor: '#9ca3af' }
  }
};