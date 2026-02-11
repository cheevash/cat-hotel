'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function PaymentPage({ params }) {
    const bookingId = params.id
    const router = useRouter()

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [slipFile, setSlipFile] = useState(null)
    const [slipPreview, setSlipPreview] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        fetchBooking()
    }, [])

    const fetchBooking = async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        rooms(id, room_number, room_type, price_per_night),
        cats(id, name, breed)
      `)
            .eq('id', bookingId)
            .single()

        if (error) {
            console.error('Error fetching booking:', error)
            Swal.fire('ไม่พบข้อมูล', 'ไม่พบข้อมูลการจอง', 'error').then(() => {
                router.push('/my-bookings')
            })
            return
        }

        // If already submitted slip, show submitted state
        if (data.payment_status === 'PendingApproval') {
            setSubmitted(true)
            if (data.payment_slip_url) {
                setSlipPreview(data.payment_slip_url)
            }
        }

        setBooking(data)
        setLoading(false)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('th-TH', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 1
        const diff = new Date(checkOut) - new Date(checkIn)
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return nights < 1 ? 1 : nights
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            Swal.fire('ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, etc.)', 'warning')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire('ไฟล์ใหญ่เกินไป', 'ขนาดไฟล์ต้องไม่เกิน 5MB', 'warning')
            return
        }

        setSlipFile(file)
        const reader = new FileReader()
        reader.onload = (e) => setSlipPreview(e.target.result)
        reader.readAsDataURL(file)
    }

    const handleSubmitSlip = async () => {
        if (!slipFile) {
            Swal.fire('ลืมแนบสลิป?', 'กรุณาเลือกรูปสลิปการโอนเงิน', 'warning')
            return
        }

        setUploading(true)

        try {
            // Upload to Supabase Storage
            const fileExt = slipFile.name.split('.').pop()
            const fileName = `${bookingId}_${Date.now()}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-slips')
                .upload(fileName, slipFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('payment-slips')
                .getPublicUrl(fileName)

            const slipUrl = urlData.publicUrl

            // Update booking with slip URL and status
            const { error: updateError } = await supabase
                .from('bookings')
                .update({
                    payment_slip_url: slipUrl,
                    payment_status: 'PendingApproval',
                })
                .eq('id', bookingId)

            if (updateError) {
                throw updateError
            }

            setSubmitted(true)
            Swal.fire({
                title: 'ส่งหลักฐานสำเร็จ! ✅',
                text: 'เราจะเร่งตรวจสอบการชำระเงินของคุณ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            })
        } catch (error) {
            console.error('Upload error:', error)
            Swal.fire('Upload Failed', error.message, 'error')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingSpinner}>💳</div>
                <p style={styles.loadingText}>กำลังโหลดข้อมูลการชำระเงิน...</p>
            </div>
        )
    }

    if (!booking) return null

    const nights = calculateNights(booking.check_in_date, booking.check_out_date)
    const roomName = booking.rooms?.room_type || 'ห้องพัก'
    const pricePerNight = booking.rooms?.price_per_night || 0

    // Already paid
    if (booking.payment_status === 'Paid') {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.successCard}>
                        <span style={styles.successIcon}>✅</span>
                        <h2 style={styles.successTitle}>ชำระเงินเรียบร้อยแล้ว</h2>
                        <p style={styles.successDesc}>การจองของคุณได้รับการยืนยันแล้ว</p>
                        <Link href="/my-bookings">
                            <button style={styles.backBtn}>← กลับไปหน้าการจอง</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <Link href="/my-bookings" style={styles.backLink}>← กลับ</Link>
                <h1 style={styles.headerTitle}>💳 ชำระเงิน</h1>
                <p style={styles.headerSub}>เลขที่จอง: {bookingId.slice(0, 8).toUpperCase()}</p>
            </div>

            <div style={styles.container}>
                <div style={styles.grid}>
                    {/* Left: Booking Summary */}
                    <div style={styles.summaryCard}>
                        <h3 style={styles.cardTitle}>📋 สรุปการจอง</h3>

                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>🏠 ห้องพัก</span>
                            <span style={styles.summaryValue}>{roomName}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>🐱 น้องแมว</span>
                            <span style={styles.summaryValue}>{booking.cats?.name || '-'}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>📅 เช็คอิน</span>
                            <span style={styles.summaryValue}>{formatDate(booking.check_in_date)}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>📅 เช็คเอาท์</span>
                            <span style={styles.summaryValue}>{formatDate(booking.check_out_date)}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>🌙 จำนวนคืน</span>
                            <span style={styles.summaryValue}>{nights} คืน</span>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={styles.priceRow}>
                            <span style={styles.priceLabel}>ราคา/คืน</span>
                            <span style={styles.priceValue}>{Number(pricePerNight).toLocaleString()} ฿</span>
                        </div>
                        <div style={styles.priceRow}>
                            <span style={styles.priceLabel}>ค่าห้อง ({nights} คืน)</span>
                            <span style={styles.priceValue}>{Number(pricePerNight * nights).toLocaleString()} ฿</span>
                        </div>

                        <div style={styles.totalRow}>
                            <span style={styles.totalLabel}>💰 ยอดรวมทั้งหมด</span>
                            <span style={styles.totalValue}>{Number(booking.total_price || pricePerNight * nights).toLocaleString()} ฿</span>
                        </div>
                    </div>

                    {/* Right: QR Code + Upload */}
                    <div style={styles.paymentCard}>
                        {!submitted ? (
                            <>
                                {/* Step 1: QR Code */}
                                <div style={styles.stepSection}>
                                    <div style={styles.stepHeader}>
                                        <span style={styles.stepNumber}>1</span>
                                        <h3 style={styles.stepTitle}>สแกน QR Code เพื่อโอนเงิน</h3>
                                    </div>
                                    <div style={styles.qrBox}>
                                        <div style={styles.qrWrapper}>
                                            <img
                                                src={`https://promptpay.io/0812345678/${booking.total_price || pricePerNight * nights}.png`}
                                                alt="PromptPay QR Code"
                                                style={styles.qrImage}
                                            />
                                        </div>
                                        <p style={styles.qrName}>พร้อมเพย์: Cat Hotel</p>
                                        <p style={styles.qrAccount}>หมายเลข: 081-234-5678</p>
                                        <div style={styles.qrAmount}>
                                            <span style={styles.qrAmountLabel}>ยอดชำระ</span>
                                            <span style={styles.qrAmountValue}>{Number(booking.total_price || pricePerNight * nights).toLocaleString()} บาท</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Upload Slip */}
                                <div style={styles.stepSection}>
                                    <div style={styles.stepHeader}>
                                        <span style={styles.stepNumber}>2</span>
                                        <h3 style={styles.stepTitle}>อัพโหลดสลิปการโอนเงิน</h3>
                                    </div>

                                    {!slipPreview ? (
                                        <label style={styles.uploadArea}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                            />
                                            <span style={styles.uploadIcon}>📷</span>
                                            <span style={styles.uploadText}>กดเพื่อเลือกรูปสลิป</span>
                                            <span style={styles.uploadHint}>รองรับ JPG, PNG ขนาดไม่เกิน 5MB</span>
                                        </label>
                                    ) : (
                                        <div style={styles.previewArea}>
                                            <img src={slipPreview} alt="สลิปการโอนเงิน" style={styles.previewImage} />
                                            <button
                                                onClick={() => { setSlipFile(null); setSlipPreview(null) }}
                                                style={styles.changeBtn}
                                            >
                                                🔄 เปลี่ยนรูป
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmitSlip}
                                    disabled={!slipFile || uploading}
                                    style={{
                                        ...styles.submitBtn,
                                        opacity: (!slipFile || uploading) ? 0.5 : 1,
                                        cursor: (!slipFile || uploading) ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {uploading ? '⏳ กำลังอัพโหลด...' : '📤 ส่งหลักฐานการชำระเงิน'}
                                </button>
                            </>
                        ) : (
                            /* Submitted State */
                            <div style={styles.submittedSection}>
                                <span style={styles.submittedIcon}>⏳</span>
                                <h3 style={styles.submittedTitle}>ส่งหลักฐานเรียบร้อยแล้ว!</h3>
                                <p style={styles.submittedDesc}>
                                    กรุณารอ Admin ตรวจสอบการชำระเงิน<br />
                                    โดยปกติใช้เวลาไม่เกิน 30 นาที
                                </p>

                                {slipPreview && (
                                    <div style={styles.submittedPreview}>
                                        <img src={slipPreview} alt="สลิปที่ส่งแล้ว" style={styles.submittedImage} />
                                    </div>
                                )}

                                <div style={styles.statusBadge}>
                                    <span style={styles.statusDot}></span>
                                    รอการตรวจสอบ
                                </div>

                                <Link href="/my-bookings">
                                    <button style={styles.backBtn}>← กลับไปหน้าการจอง</button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Note */}
                <div style={styles.noteCard}>
                    <h4 style={styles.noteTitle}>📌 หมายเหตุ</h4>
                    <ul style={styles.noteList}>
                        <li>กรุณาโอนเงินตามยอดที่แสดงเท่านั้น</li>
                        <li>อัพโหลดสลิปที่ชัดเจน เห็นยอดเงินและเวลาโอน</li>
                        <li>Admin จะตรวจสอบภายใน 30 นาที (ในเวลาทำการ)</li>
                        <li>หากมีปัญหา ติดต่อ LINE: @cathotel หรือโทร 081-234-5678</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

const styles = {
    // Page
    page: {
        fontFamily: "'Sarabun', 'Kanit', sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        paddingBottom: '60px',
    },
    loadingPage: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        backgroundColor: '#f8fafc',
    },
    loadingSpinner: { fontSize: '3rem' },
    loadingText: { color: '#64748b', fontSize: '1.1rem' },

    // Header
    header: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '50px 20px 40px',
        textAlign: 'center',
    },
    backLink: {
        color: '#fbbf24',
        textDecoration: 'none',
        fontSize: '0.95rem',
    },
    headerTitle: {
        fontSize: '2.5rem',
        color: 'white',
        margin: '15px 0 8px',
        fontWeight: '700',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.7)',
        margin: 0,
        fontSize: '1rem',
    },

    // Container
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '30px',
        marginBottom: '30px',
    },

    // Summary Card
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '35px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        alignSelf: 'start',
    },
    cardTitle: {
        fontSize: '1.3rem',
        color: '#1e293b',
        margin: '0 0 25px',
        fontWeight: '700',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9',
    },
    summaryLabel: { color: '#64748b', fontSize: '0.95rem' },
    summaryValue: { color: '#1e293b', fontWeight: '600', fontSize: '0.95rem' },
    divider: {
        height: '2px',
        background: 'linear-gradient(90deg, #ea580c, #fbbf24)',
        margin: '20px 0',
        borderRadius: '2px',
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
    },
    priceLabel: { color: '#64748b', fontSize: '0.9rem' },
    priceValue: { color: '#374151', fontSize: '0.95rem' },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px',
        backgroundColor: '#fff7ed',
        borderRadius: '14px',
        marginTop: '15px',
    },
    totalLabel: { color: '#ea580c', fontWeight: '700', fontSize: '1.05rem' },
    totalValue: { color: '#ea580c', fontWeight: '800', fontSize: '1.5rem' },

    // Payment Card
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '35px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
    },

    // Steps
    stepSection: {
        marginBottom: '30px',
    },
    stepHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
    },
    stepNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ea580c, #dc2626)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '0.9rem',
        flexShrink: 0,
    },
    stepTitle: {
        fontSize: '1.15rem',
        color: '#1e293b',
        margin: 0,
        fontWeight: '600',
    },

    // QR Section
    qrBox: {
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '20px',
        padding: '30px',
        border: '2px dashed #e2e8f0',
    },
    qrWrapper: {
        display: 'inline-block',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        marginBottom: '15px',
    },
    qrImage: {
        width: '220px',
        height: '220px',
        objectFit: 'contain',
    },
    qrName: {
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 4px',
        fontSize: '1.1rem',
    },
    qrAccount: {
        color: '#64748b',
        margin: '0 0 15px',
        fontSize: '0.95rem',
    },
    qrAmount: {
        display: 'inline-flex',
        flexDirection: 'column',
        backgroundColor: '#ea580c',
        color: 'white',
        padding: '12px 28px',
        borderRadius: '14px',
    },
    qrAmountLabel: { fontSize: '0.8rem', opacity: 0.8 },
    qrAmountValue: { fontSize: '1.3rem', fontWeight: '800' },

    // Upload Area
    uploadArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '40px',
        borderRadius: '20px',
        border: '3px dashed #cbd5e1',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    uploadIcon: { fontSize: '3rem' },
    uploadText: {
        color: '#334155',
        fontWeight: '600',
        fontSize: '1.05rem',
    },
    uploadHint: {
        color: '#94a3b8',
        fontSize: '0.85rem',
    },

    // Preview
    previewArea: {
        textAlign: 'center',
    },
    previewImage: {
        maxWidth: '100%',
        maxHeight: '300px',
        borderRadius: '16px',
        boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
        marginBottom: '15px',
        objectFit: 'contain',
    },
    changeBtn: {
        padding: '10px 24px',
        backgroundColor: '#f1f5f9',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        color: '#64748b',
        fontSize: '0.95rem',
    },

    // Submit
    submitBtn: {
        width: '100%',
        padding: '18px',
        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        boxShadow: '0 10px 30px rgba(234, 88, 12, 0.35)',
        transition: 'all 0.3s',
    },

    // Submitted State
    submittedSection: {
        textAlign: 'center',
        padding: '30px 0',
    },
    submittedIcon: { fontSize: '4rem', display: 'block', marginBottom: '15px' },
    submittedTitle: {
        fontSize: '1.5rem',
        color: '#1e293b',
        margin: '0 0 10px',
        fontWeight: '700',
    },
    submittedDesc: {
        color: '#64748b',
        lineHeight: '1.7',
        margin: '0 0 25px',
    },
    submittedPreview: {
        marginBottom: '25px',
    },
    submittedImage: {
        maxWidth: '200px',
        maxHeight: '250px',
        borderRadius: '12px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        objectFit: 'contain',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        backgroundColor: '#fef3c7',
        color: '#b45309',
        borderRadius: '50px',
        fontWeight: '600',
        marginBottom: '25px',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#f59e0b',
    },

    // Back Button
    backBtn: {
        padding: '14px 30px',
        backgroundColor: '#1e293b',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },

    // Success Card
    successCard: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        maxWidth: '500px',
        margin: '60px auto',
    },
    successIcon: { fontSize: '4rem', display: 'block', marginBottom: '15px' },
    successTitle: {
        fontSize: '1.5rem',
        color: '#059669',
        margin: '0 0 10px',
        fontWeight: '700',
    },
    successDesc: {
        color: '#64748b',
        margin: '0 0 30px',
    },

    // Note Card
    noteCard: {
        backgroundColor: '#fff7ed',
        borderRadius: '16px',
        padding: '25px 30px',
        border: '1px solid #fed7aa',
    },
    noteTitle: {
        fontSize: '1rem',
        color: '#ea580c',
        margin: '0 0 12px',
        fontWeight: '700',
    },
    noteList: {
        margin: 0,
        paddingLeft: '20px',
        color: '#78350f',
        lineHeight: '1.9',
        fontSize: '0.9rem',
    },
}
