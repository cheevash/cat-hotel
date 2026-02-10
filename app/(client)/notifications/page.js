'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        // ในที่นี้เราจะสร้าง Notification จากสถานะการจอง (Booking Status)
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*, rooms(room_number), cats(name)')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error(error)
        } else {
            const notifs = bookings.map(booking => generateNotification(booking))
            setNotifications(notifs)
        }
        setLoading(false)
    }

    const generateNotification = (booking) => {
        const date = new Date(booking.updated_at || booking.created_at).toLocaleDateString('th-TH', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })

        let title, message, icon, type, link

        switch (booking.status) {
            case 'Pending':
                if (booking.payment_status === 'Unpaid') {
                    title = '⏳ รอการชำระเงิน'
                    message = `การจองห้อง ${booking.rooms?.room_number} สำหรับน้อง ${booking.cats?.name} รอการชำระเงิน`
                    icon = '💳'
                    type = 'warning'
                    link = `/payment/${booking.id}`
                } else {
                    title = '⏳ รอการยืนยัน'
                    message = `การจองห้อง ${booking.rooms?.room_number} กำลังรอแอดมินตรวจสอบ`
                    icon = '⏳'
                    type = 'info'
                    link = '/my-bookings'
                }
                break
            case 'Confirmed':
                title = '✅ การจองสำเร็จ'
                message = `การจองห้อง ${booking.rooms?.room_number} ได้รับการยืนยันแล้ว เตรียมพาน้องมาพักได้เลย!`
                icon = '✅'
                type = 'success'
                link = '/my-bookings'
                break
            case 'CheckedIn':
                title = '🏠 เช็คอินแล้ว'
                message = `น้อง ${booking.cats?.name} เข้าพักแล้ว ขอให้มีความสุขนะเหมียว`
                icon = '🏠'
                type = 'info'
                link = '/my-bookings'
                break
            case 'CheckedOut':
                title = '👋 เช็คเอาท์แล้ว'
                message = `ขอบคุณที่ใช้บริการ อย่าลืมรีวิวความประทับใจนะเหมียว`
                icon = '⭐'
                type = 'success'
                link = `/reviews?bookingId=${booking.id}`
                break
            case 'Cancelled':
                title = '❌ การจองถูกยกเลิก'
                message = `การจองห้อง ${booking.rooms?.room_number} ถูกยกเลิกแล้ว`
                icon = '❌'
                type = 'error'
                link = '/my-bookings'
                break
            default:
                title = 'แจ้งเตือนระบบ'
                message = 'มีข้อมูลการจองอัพเดท'
                icon = '🔔'
                type = 'info'
                link = '/my-bookings'
        }

        return { id: booking.id, title, message, date, icon, type, link }
    }

    if (loading) return <div style={styles.loading}>กำลังโหลดการแจ้งเตือน...</div>

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>🔔 การแจ้งเตือน</h1>
                    <button style={styles.readAllBtn}>อ่านทั้งหมดแล้ว</button>
                </header>

                {notifications.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={{ fontSize: '40px' }}>🔕</span>
                        <p>ยังไม่มีการแจ้งเตือนใหม่</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {notifications.map((notif) => (
                            <Link href={notif.link} key={notif.id} style={styles.cardLink}>
                                <div style={{ ...styles.card, borderLeft: `4px solid ${getTypeColor(notif.type)}` }}>
                                    <div style={styles.iconWrapper}>{notif.icon}</div>
                                    <div style={styles.content}>
                                        <div style={styles.cardHeader}>
                                            <h3 style={styles.cardTitle}>{notif.title}</h3>
                                            <span style={styles.date}>{notif.date}</span>
                                        </div>
                                        <p style={styles.message}>{notif.message}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const getTypeColor = (type) => {
    switch (type) {
        case 'warning': return '#f59e0b'
        case 'success': return '#10b981'
        case 'error': return '#ef4444'
        default: return '#3b82f6'
    }
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: "'Sarabun', 'Kanit', sans-serif" },
    container: { maxWidth: '700px', margin: '0 auto' },
    loading: { textAlign: 'center', marginTop: '50px', color: '#666' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#1e293b', fontSize: '1.8rem' },
    readAllBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' },

    emptyState: { textAlign: 'center', padding: '60px', color: '#94a3b8' },

    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    card: {
        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '20px',
        transition: 'transform 0.2s', cursor: 'pointer'
    },
    iconWrapper: {
        width: '40px', height: '40px', backgroundColor: '#f1f5f9',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0
    },
    content: { flex: 1 },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    cardTitle: { margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 'bold' },
    date: { fontSize: '0.8rem', color: '#94a3b8' },
    message: { margin: 0, fontSize: '0.9rem', color: '#475569' }
}
