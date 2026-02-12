'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { value: 'all', label: '📁 ทั้งหมด' },
        { value: 'ห้องพัก', label: '🏨 ห้องพัก' },
        { value: 'น้องแมวที่เคยมาพัก', label: '🐱 น้องแมวที่เคยมาพัก' },
        { value: 'บรรยากาศร้าน', label: '🏪 บรรยากาศร้าน' },
        { value: 'กิจกรรม', label: '🎉 กิจกรรม' },
        { value: 'อื่นๆ', label: '📎 อื่นๆ' }
    ]

    useEffect(() => {
        fetchGalleryItems()
    }, [])

    const fetchGalleryItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching gallery:', error)
        } else {
            setGalleryItems(data || [])
        }
        setLoading(false)
    }

    // จัดกลุ่มรูปภาพตามหมวดหมู่
    const groupByCategory = (items) => {
        const grouped = {}
        items.forEach(item => {
            const cat = item.category || 'อื่นๆ'
            if (!grouped[cat]) {
                grouped[cat] = []
            }
            grouped[cat].push(item)
        })
        return grouped
    }

    const filteredItems = selectedCategory === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === selectedCategory)

    const groupedItems = groupByCategory(filteredItems)

    // เรียงลำดับหมวดหมู่ตามที่กำหนด
    const categoryOrder = ['ห้องพัก', 'น้องแมวที่เคยมาพัก', 'บรรยากาศร้าน', 'กิจกรรม', 'อื่นๆ']
    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a)
        const indexB = categoryOrder.indexOf(b)
        if (indexA === -1 && indexB === -1) return a.localeCompare(b)
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
    })

    const getCategoryColor = (category) => {
        switch (category) {
            case 'ห้องพัก': return '#3b82f6'
            case 'น้องแมวที่เคยมาพัก': return '#f59e0b'
            case 'บรรยากาศร้าน': return '#10b981'
            case 'กิจกรรม': return '#8b5cf6'
            default: return '#64748b'
        }
    }

    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>📷 แกลเลอรี่</h1>
                <p style={styles.heroDesc}>ชมบรรยากาศห้องพักและน้องแมวที่เคยมาพักกับเรา</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            {/* Filter */}
            <div style={styles.filterContainer}>
                <div style={styles.filterWrapper}>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            style={{
                                ...styles.filterBtn,
                                backgroundColor: selectedCategory === cat.value ? '#ea580c' : '#fff',
                                color: selectedCategory === cat.value ? '#fff' : '#475569',
                                borderColor: selectedCategory === cat.value ? '#ea580c' : '#e2e8f0'
                            }}
                        >
                            {cat.label}
                            {cat.value !== 'all' && (
                                <span style={styles.filterCount}>
                                    {galleryItems.filter(i => i.category === cat.value).length}
                                </span>
                            )}
                            {cat.value === 'all' && (
                                <span style={styles.filterCount}>
                                    {galleryItems.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Sections */}
            <div style={styles.container}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>กำลังโหลดรูปภาพ...</p>
                    </div>
                ) : galleryItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🖼️</span>
                        <p style={styles.emptyText}>ยังไม่มีรูปภาพในแกลเลอรี่</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>ไม่พบรูปภาพในหมวดหมู่นี้</p>
                    </div>
                ) : (
                    sortedCategories.map(category => (
                        <section key={category} style={styles.section}>
                            <h2 style={{ ...styles.sectionTitle, borderBottomColor: getCategoryColor(category) }}>
                                {category}
                                <span style={styles.itemCount}> ({groupedItems[category].length})</span>
                            </h2>
                            <div style={styles.grid}>
                                {groupedItems[category].map((item) => (
                                    <div key={item.id} style={styles.card}>
                                        <div style={styles.imageWrapper}>
                                            <img 
                                                src={item.image_url} 
                                                alt={item.caption || 'Gallery Image'} 
                                                style={styles.image}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'
                                                }}
                                            />
                                        </div>
                                        <div style={styles.cardContent}>
                                            <p style={styles.cardDesc}>{item.caption || ''}</p>
                                            <p style={styles.cardDate}>
                                                {new Date(item.created_at).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>

            {/* CTA */}
            <section style={styles.cta}>
                <h2 style={styles.ctaTitle}>อยากให้น้องแมวมาเป็นส่วนหนึ่งของครอบครัวเรา?</h2>
                <Link href="/rooms">
                    <button style={styles.ctaBtn}>จองห้องพักเลย 🐾</button>
                </Link>
            </section>
        </div>
    )
}

const styles = {
    page: { fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh' },
    hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '80px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '3rem', color: 'white', margin: '0 0 10px' },
    heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', margin: '0 0 20px' },
    backLink: { color: '#fbbf24', textDecoration: 'none' },
    
    // Filter
    filterContainer: { backgroundColor: '#fff', padding: '20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
    filterWrapper: { maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
    filterBtn: { 
        padding: '10px 18px', 
        border: '1px solid #e2e8f0', 
        borderRadius: '25px', 
        cursor: 'pointer', 
        fontSize: '0.95rem', 
        fontWeight: '500',
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        transition: 'all 0.2s'
    },
    filterCount: { 
        backgroundColor: 'rgba(0,0,0,0.1)', 
        padding: '2px 8px', 
        borderRadius: '10px', 
        fontSize: '0.8rem' 
    },
    
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    
    // Loading & Empty
    loadingContainer: { textAlign: 'center', padding: '80px 20px' },
    spinner: { 
        width: '40px', 
        height: '40px', 
        border: '4px solid #e2e8f0', 
        borderTop: '4px solid #ea580c', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px'
    },
    emptyState: { textAlign: 'center', padding: '80px 20px' },
    emptyIcon: { fontSize: '4rem', marginBottom: '15px', display: 'block' },
    emptyText: { color: '#64748b', fontSize: '1.1rem' },
    
    section: { marginBottom: '50px' },
    sectionTitle: { fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '25px', paddingBottom: '10px', borderBottom: '3px solid #ea580c', display: 'inline-block' },
    itemCount: { color: '#64748b', fontSize: '1rem', fontWeight: 'normal' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s' },
    imageWrapper: { height: '220px', overflow: 'hidden', backgroundColor: '#f1f5f9' },
    image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
    cardContent: { padding: '18px' },
    cardDesc: { color: '#374151', margin: '0 0 8px', fontSize: '1rem', lineHeight: '1.5', minHeight: '24px' },
    cardDate: { color: '#9ca3af', margin: 0, fontSize: '0.85rem' },
    cta: { background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', padding: '60px 20px', textAlign: 'center' },
    ctaTitle: { fontSize: '1.8rem', color: 'white', margin: '0 0 25px' },
    ctaBtn: { padding: '16px 40px', backgroundColor: 'white', color: '#ea580c', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' },
}
