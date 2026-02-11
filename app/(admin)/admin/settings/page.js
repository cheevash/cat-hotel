'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('pricing')

    // Settings state
    const [settings, setSettings] = useState({
        // Pricing
        standardPrice: 350,
        deluxePrice: 550,
        vipPrice: 850,

        // Promotions
        promotions: [
            { id: 1, name: 'ส่วนลดสมาชิกใหม่', discount: 10, active: true },
            { id: 2, name: 'พักยาว 7 คืน', discount: 15, active: true },
            { id: 3, name: 'Happy Hour', discount: 5, active: false },
        ],

        // Contact
        phone: '081-234-5678',
        line: '@cathotel',
        facebook: 'cathotelth',
        instagram: 'cathotel_th',
        email: 'info@cathotel.com',
        address: '123/45 ถนนแมวมีสุข แขวงแมวดี เขตแมวสบาย กรุงเทพฯ 10310',

        // Business Hours
        openTime: '09:00',
        closeTime: '20:00',
        checkInTime: '14:00',
        checkOutTime: '12:00',
    })

    const [newPromo, setNewPromo] = useState({ name: '', discount: '' })

    useEffect(() => {
        // In real app, fetch from database
        // const fetchSettings = async () => {...}
        setLoading(false)
    }, [])

    const handleSave = async () => {
        setSaving(true)
        // In real app, save to database
        // await supabase.from('settings').upsert(settings)

        setTimeout(() => {
            Swal.fire({
                title: 'บันทึกสำเร็จ! ✅',
                text: 'การตั้งค่าถูกบันทึกเรียบร้อยแล้ว',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            })
            setSaving(false)
        }, 500)
    }

    const addPromotion = () => {
        if (!newPromo.name || !newPromo.discount) return
        setSettings({
            ...settings,
            promotions: [
                ...settings.promotions,
                { id: Date.now(), name: newPromo.name, discount: Number(newPromo.discount), active: true }
            ]
        })
        setNewPromo({ name: '', discount: '' })
    }

    const togglePromotion = (id) => {
        setSettings({
            ...settings,
            promotions: settings.promotions.map(p =>
                p.id === id ? { ...p, active: !p.active } : p
            )
        })
    }

    const deletePromotion = (id) => {
        setSettings({
            ...settings,
            promotions: settings.promotions.filter(p => p.id !== id)
        })
    }

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <span style={styles.loadingIcon}>⚙️</span>
                <p>กำลังโหลดการตั้งค่า...</p>
            </div>
        )
    }

    const tabs = [
        { id: 'pricing', label: '💰 ราคาห้องพัก', icon: '💰' },
        { id: 'promotions', label: '🎉 โปรโมชั่น', icon: '🎉' },
        { id: 'contact', label: '📞 ช่องทางติดต่อ', icon: '📞' },
        { id: 'hours', label: '🕐 เวลาทำการ', icon: '🕐' },
    ]

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>⚙️ ตั้งค่าระบบ</h1>
                    <p style={styles.subtitle}>จัดการราคา โปรโมชั่น และข้อมูลร้าน</p>
                </div>
                <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
                    {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
                </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={activeTab === tab.id ? styles.tabActive : styles.tab}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>💰 ราคาห้องพักต่อคืน</h2>
                        <p style={styles.sectionDesc}>กำหนดราคาพื้นฐานสำหรับแต่ละประเภทห้อง</p>

                        <div style={styles.pricingGrid}>
                            <div style={styles.priceCard}>
                                <div style={styles.priceCardHeader}>
                                    <span style={styles.priceIcon}>🏠</span>
                                    <h3>Standard</h3>
                                </div>
                                <div style={styles.priceInputGroup}>
                                    <input
                                        type="number"
                                        value={settings.standardPrice}
                                        onChange={e => setSettings({ ...settings, standardPrice: e.target.value })}
                                        style={styles.priceInput}
                                    />
                                    <span style={styles.priceUnit}>บาท/คืน</span>
                                </div>
                            </div>

                            <div style={styles.priceCard}>
                                <div style={styles.priceCardHeader}>
                                    <span style={styles.priceIcon}>🏰</span>
                                    <h3>Deluxe</h3>
                                </div>
                                <div style={styles.priceInputGroup}>
                                    <input
                                        type="number"
                                        value={settings.deluxePrice}
                                        onChange={e => setSettings({ ...settings, deluxePrice: e.target.value })}
                                        style={styles.priceInput}
                                    />
                                    <span style={styles.priceUnit}>บาท/คืน</span>
                                </div>
                            </div>

                            <div style={styles.priceCard}>
                                <div style={styles.priceCardHeader}>
                                    <span style={styles.priceIcon}>👑</span>
                                    <h3>VIP</h3>
                                </div>
                                <div style={styles.priceInputGroup}>
                                    <input
                                        type="number"
                                        value={settings.vipPrice}
                                        onChange={e => setSettings({ ...settings, vipPrice: e.target.value })}
                                        style={styles.priceInput}
                                    />
                                    <span style={styles.priceUnit}>บาท/คืน</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promotions Tab */}
                {activeTab === 'promotions' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🎉 โปรโมชั่น</h2>
                        <p style={styles.sectionDesc}>จัดการส่วนลดและโปรโมชั่นพิเศษ</p>

                        {/* Add New Promo */}
                        <div style={styles.addPromoBox}>
                            <h4 style={styles.addPromoTitle}>➕ เพิ่มโปรโมชั่นใหม่</h4>
                            <div style={styles.addPromoForm}>
                                <input
                                    type="text"
                                    placeholder="ชื่อโปรโมชั่น"
                                    value={newPromo.name}
                                    onChange={e => setNewPromo({ ...newPromo, name: e.target.value })}
                                    style={styles.input}
                                />
                                <div style={styles.discountInput}>
                                    <input
                                        type="number"
                                        placeholder="ส่วนลด"
                                        value={newPromo.discount}
                                        onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })}
                                        style={styles.input}
                                    />
                                    <span>%</span>
                                </div>
                                <button onClick={addPromotion} style={styles.addPromoBtn}>➕ เพิ่ม</button>
                            </div>
                        </div>

                        {/* Promo List */}
                        <div style={styles.promoList}>
                            {settings.promotions.map(promo => (
                                <div key={promo.id} style={{
                                    ...styles.promoItem,
                                    opacity: promo.active ? 1 : 0.6
                                }}>
                                    <div style={styles.promoInfo}>
                                        <span style={styles.promoName}>{promo.name}</span>
                                        <span style={styles.promoDiscount}>-{promo.discount}%</span>
                                    </div>
                                    <div style={styles.promoActions}>
                                        <button
                                            onClick={() => togglePromotion(promo.id)}
                                            style={{
                                                ...styles.toggleBtn,
                                                backgroundColor: promo.active ? '#dcfce7' : '#f3f4f6',
                                                color: promo.active ? '#166534' : '#6b7280'
                                            }}
                                        >
                                            {promo.active ? '✅ เปิด' : '⏸️ ปิด'}
                                        </button>
                                        <button
                                            onClick={() => deletePromotion(promo.id)}
                                            style={styles.deletePromoBtn}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📞 ช่องทางติดต่อ</h2>
                        <p style={styles.sectionDesc}>ข้อมูลติดต่อที่แสดงบนเว็บไซต์</p>

                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>📱 เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    value={settings.phone}
                                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>💬 LINE ID</label>
                                <input
                                    type="text"
                                    value={settings.line}
                                    onChange={e => setSettings({ ...settings, line: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📘 Facebook</label>
                                <input
                                    type="text"
                                    value={settings.facebook}
                                    onChange={e => setSettings({ ...settings, facebook: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📸 Instagram</label>
                                <input
                                    type="text"
                                    value={settings.instagram}
                                    onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📧 Email</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>📍 ที่อยู่ร้าน</label>
                            <textarea
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                style={{ ...styles.input, minHeight: '80px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Hours Tab */}
                {activeTab === 'hours' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🕐 เวลาทำการ</h2>
                        <p style={styles.sectionDesc}>กำหนดเวลาเปิด-ปิดร้าน และเวลาเช็คอิน/เช็คเอาท์</p>

                        <div style={styles.hoursGrid}>
                            <div style={styles.hoursCard}>
                                <h4>🏪 เวลาเปิด-ปิดร้าน</h4>
                                <div style={styles.timeRow}>
                                    <div style={styles.timeGroup}>
                                        <label>เปิด</label>
                                        <input
                                            type="time"
                                            value={settings.openTime}
                                            onChange={e => setSettings({ ...settings, openTime: e.target.value })}
                                            style={styles.timeInput}
                                        />
                                    </div>
                                    <span style={styles.timeSeparator}>ถึง</span>
                                    <div style={styles.timeGroup}>
                                        <label>ปิด</label>
                                        <input
                                            type="time"
                                            value={settings.closeTime}
                                            onChange={e => setSettings({ ...settings, closeTime: e.target.value })}
                                            style={styles.timeInput}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.hoursCard}>
                                <h4>🏠 เวลาเช็คอิน/เช็คเอาท์</h4>
                                <div style={styles.timeRow}>
                                    <div style={styles.timeGroup}>
                                        <label>เช็คอิน</label>
                                        <input
                                            type="time"
                                            value={settings.checkInTime}
                                            onChange={e => setSettings({ ...settings, checkInTime: e.target.value })}
                                            style={styles.timeInput}
                                        />
                                    </div>
                                    <span style={styles.timeSeparator}>/</span>
                                    <div style={styles.timeGroup}>
                                        <label>เช็คเอาท์</label>
                                        <input
                                            type="time"
                                            value={settings.checkOutTime}
                                            onChange={e => setSettings({ ...settings, checkOutTime: e.target.value })}
                                            style={styles.timeInput}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div style={styles.infoBanner}>
                <span>💡</span>
                <p>หมายเหตุ: ในเวอร์ชันนี้การตั้งค่าจะถูกเก็บใน state เท่านั้น หากต้องการให้บันทึกถาวรต้องสร้าง table "settings" ใน Supabase และเชื่อมต่อกับ database</p>
            </div>
        </div>
    )
}

const styles = {
    page: { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
    loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#ea580c' },
    loadingIcon: { fontSize: '3rem' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '2rem', color: '#1e293b', margin: '0 0 5px', fontWeight: '700' },
    subtitle: { color: '#64748b', margin: 0 },
    saveBtn: { padding: '14px 28px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },

    // Tabs
    tabs: { display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' },
    tab: { padding: '12px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
    tabActive: { padding: '12px 20px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' },

    // Content
    content: { backgroundColor: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px' },
    section: {},
    sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' },
    sectionDesc: { color: '#64748b', marginBottom: '25px' },

    // Pricing
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    priceCard: { backgroundColor: '#f8fafc', padding: '25px', borderRadius: '16px', border: '2px solid #e5e7eb' },
    priceCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
    priceIcon: { fontSize: '2rem' },
    priceInputGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    priceInput: { width: '100px', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' },
    priceUnit: { color: '#64748b' },

    // Promotions
    addPromoBox: { backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '16px', marginBottom: '25px', border: '1px solid #bbf7d0' },
    addPromoTitle: { margin: '0 0 15px', color: '#166534' },
    addPromoForm: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' },
    discountInput: { display: 'flex', alignItems: 'center', gap: '8px' },
    addPromoBtn: { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    promoList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    promoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' },
    promoInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
    promoName: { fontWeight: '600' },
    promoDiscount: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' },
    promoActions: { display: 'flex', gap: '10px' },
    toggleBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
    deletePromoBtn: { padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' },

    // Forms
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' },
    input: { width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },

    // Hours
    hoursGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' },
    hoursCard: { backgroundColor: '#f8fafc', padding: '25px', borderRadius: '16px' },
    timeRow: { display: 'flex', alignItems: 'center', gap: '15px' },
    timeGroup: { flex: 1 },
    timeInput: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1.1rem', marginTop: '8px' },
    timeSeparator: { color: '#64748b', fontWeight: 'bold' },

    // Info Banner
    infoBanner: { display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '18px 22px', borderRadius: '12px', color: '#9a3412', fontSize: '0.9rem' },
}
