'use client'
import React, { useState, useEffect } from 'react'
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    addMonths, subMonths, startOfDay, isSameDay, isWithinInterval
} from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [bookings, setBookings] = useState([])
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)
    const [dayBookings, setDayBookings] = useState([])

    useEffect(() => {
        fetchData()
    }, [currentMonth])

    async function fetchData() {
        setLoading(true)

        // 1. Fetch Rooms
        const { data: roomsData } = await supabase
            .from('rooms')
            .select('*')
        setRooms(roomsData || [])

        // 2. Fetch Bookings for the month
        const start = startOfMonth(currentMonth).toISOString()
        const end = endOfMonth(currentMonth).toISOString()

        const { data: bookingsData } = await supabase
            .from('bookings')
            .select(`
        *,
        rooms(room_number, room_type),
        profiles(first_name, last_name),
        cats(name, breed)
      `)
            .or(`check_in_date.lte.${end},check_out_date.gte.${start}`)
            .neq('status', 'Cancelled') // Exclude cancelled

        setBookings(bookingsData || [])
        setLoading(false)
    }

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    const getDayStatus = (day) => {
        const targetDate = startOfDay(day)

        // Find bookings that cover this day
        const activeBookings = bookings.filter(b => {
            const checkIn = startOfDay(new Date(b.check_in_date))
            const checkOut = startOfDay(new Date(b.check_out_date))
            return isWithinInterval(targetDate, { start: checkIn, end: new Date(checkOut.getTime() - 1) }) // -1ms to not count checkout day as occupied
        })

        const totalRoomsCount = rooms.length
        const occupiedCount = activeBookings.length
        const available = totalRoomsCount - occupiedCount

        let statusColor = '#22c55e' // Green (Available)
        let label = `ว่าง ${available}`

        if (available <= 0) {
            statusColor = '#ef4444' // Red (Full)
            label = 'เต็ม'
        } else if (available <= 2) {
            statusColor = '#f59e0b' // Orange (High Occupancy)
        }

        return { available, occupiedCount, statusColor, label, activeBookings }
    }

    const handleDayClick = (day, activeBookings) => {
        setSelectedDate(day)
        setDayBookings(activeBookings)
    }

    return (
        <div style={styles.container}>
            <div style={styles.calendarSection}>
                <div style={styles.header}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn}><ChevronLeft size={20} /></button>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
                        {format(currentMonth, 'MMMM yyyy', { locale: th })}
                    </h3>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn}><ChevronRight size={20} /></button>
                </div>

                <div style={styles.grid}>
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                        <div key={d} style={styles.dayHeader}>{d}</div>
                    ))}

                    {days.map((day, i) => {
                        const { statusColor, label, occupiedCount } = getDayStatus(day)
                        const isSelected = selectedDate && isSameDay(day, selectedDate)

                        return (
                            <div
                                key={i}
                                onClick={() => handleDayClick(day, getDayStatus(day).activeBookings)}
                                style={{
                                    ...styles.dayCell,
                                    borderColor: isSelected ? '#ea580c' : '#f0f0f0',
                                    backgroundColor: isSelected ? '#fff7ed' : '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={styles.dayNum}>{format(day, 'd')}</span>
                                <div style={{ ...styles.statusBadge, backgroundColor: statusColor }}>
                                    {loading ? '...' : occupiedCount > 0 ? `จอง ${occupiedCount}` : 'ว่าง'}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={styles.legend}>
                    <div style={styles.legendItem}><span style={{ ...styles.dot, backgroundColor: '#22c55e' }}></span> ว่าง</div>
                    <div style={styles.legendItem}><span style={{ ...styles.dot, backgroundColor: '#f59e0b' }}></span> หนาแน่น</div>
                    <div style={styles.legendItem}><span style={{ ...styles.dot, backgroundColor: '#ef4444' }}></span> เต็ม</div>
                </div>
            </div>

            {/* Detail Section (Side Panel) */}
            <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>
                    {selectedDate
                        ? `รายการจองวันที่ ${format(selectedDate, 'd MMM yyyy', { locale: th })}`
                        : 'เลือกวันที่เพื่อดูรายการจอง'
                    }
                </h3>

                {selectedDate ? (
                    <div style={styles.bookingList}>
                        {dayBookings.length > 0 ? (
                            dayBookings.map(booking => (
                                <div key={booking.id} style={styles.bookingCard}>
                                    <div style={styles.bookingHeader}>
                                        <span style={styles.roomBadge}>{booking.rooms?.room_number || 'ไม่ระบุห้อง'}</span>
                                        <span style={{
                                            ...styles.statusBadgeSmall,
                                            backgroundColor: booking.status === 'Confirmed' ? '#dcfce7' : '#fef3c7',
                                            color: booking.status === 'Confirmed' ? '#166534' : '#92400e'
                                        }}>
                                            {booking.status === 'Confirmed' ? 'ยืนยัน' : 'รอ'}
                                        </span>
                                    </div>
                                    <p style={styles.customerName}>{booking.profiles?.first_name} {booking.profiles?.last_name}</p>
                                    <p style={styles.catInfo}>🐱 {booking.cats?.name} ({booking.cats?.breed})</p>
                                </div>
                            ))
                        ) : (
                            <p style={styles.emptyText}>ไม่มีการจองในวันนี้</p>
                        )}
                    </div>
                ) : (
                    <div style={styles.placeholder}>
                        <span style={{ fontSize: '3rem' }}>📅</span>
                        <p>คลิกที่ปฏิทินเพื่อดูรายละเอียด</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        padding: '25px',
        alignItems: 'start'
    },
    // Calendar
    calendarSection: {},
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    navBtn: { background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', padding: '5px 10px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
    dayHeader: { textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', paddingBottom: '10px' },
    dayCell: { border: '2px solid #f0f0f0', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' },
    dayNum: { fontSize: '1rem', fontWeight: 'bold', color: '#334155' },
    statusBadge: { fontSize: '0.7rem', color: '#fff', padding: '2px 8px', borderRadius: '10px', width: '90%', fontWeight: '600' },
    legend: { display: 'flex', gap: '15px', marginTop: '20px', fontSize: '0.85rem', color: '#64748b', justifyContent: 'center' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
    dot: { width: '10px', height: '10px', borderRadius: '50%' },

    // Details
    detailSection: {
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        minHeight: '400px',
        border: '1px solid #e2e8f0'
    },
    detailTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
    bookingList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' },
    bookingCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    bookingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    roomBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
    statusBadgeSmall: { padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
    customerName: { margin: '0 0 4px', fontWeight: '600', color: '#334155', fontSize: '0.95rem' },
    catInfo: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: '50px' },
    placeholder: { textAlign: 'center', color: '#cbd5e1', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
}
