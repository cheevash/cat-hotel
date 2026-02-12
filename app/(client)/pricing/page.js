'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PricingPage() {
    const [packages, setPackages] = useState([])
    const [promotions, setPromotions] = useState([])
    const [addons, setAddons] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)

        // Fetch packages
        const { data: packagesData } = await supabase
            .from('pricing_packages')
            .select('*')
            .order('order', { ascending: true })

        // Fetch promotions
        const { data: promotionsData } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true })

        // Fetch addons
        const { data: addonsData } = await supabase
            .from('service_addons')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true })

        setPackages(packagesData || [])
        setPromotions(promotionsData || [])
        setAddons(addonsData || [])
        setLoading(false)
    }

    const parseFeatures = (features) => {
        if (!features) return []
        if (Array.isArray(features)) return features
        try {
            return JSON.parse(features)
        } catch {
            return []
        }
    }

    if (loading) {
        return (
            <div style={styles.page}>
                <section style={styles.hero}>
                    <h1 style={styles.heroTitle}>💰 ตารางราคา</h1>
                    <p style={styles.heroDesc}>เลือกแพ็คเกจที่เหมาะกับเจ้านายของคุณ</p>
                    <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
                </section>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>💰 ตารางราคา</h1>
                <p style={styles.heroDesc}>เลือกแพ็คเกจที่เหมาะกับเจ้านายของคุณ</p>
                <Link href="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
            </section>

            <div style={styles.container}>
                {/* Pricing Cards */}
                <div style={styles.pricingGrid}>
                    {packages.map((pkg) => {
                        const features = parseFeatures(pkg.features)
                        const isPopular = pkg.is_popular === true || pkg.is_popular === 'true'

                        return (
                            <div
                                key={pkg.id}
                                style={isPopular ? { ...styles.pricingCard, ...styles.popularCard } : styles.pricingCard}
                            >
                                {isPopular && <div style={styles.popularBadge}>🔥 ยอดนิยม</div>}
                                <div style={styles.cardHeader}>
                                    <span style={styles.cardIcon}>{pkg.icon}</span>
                                    <h3 style={styles.cardName}>{pkg.name}</h3>
                                    <p style={styles.cardDesc}>{pkg.description}</p>
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.priceBox}>
                                        <span style={styles.priceAmount}>{Number(pkg.price).toLocaleString()}</span>
                                        <span style={styles.priceUnit}>{pkg.unit}</span>
                                    </div>
                                    <ul style={styles.featureList}>
                                        {features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                style={feature.included ? styles.featureItem : styles.featureItemExcluded}
                                            >
                                                {feature.included ? '✅' : '❌'} {feature.text}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/rooms">
                                        <button style={isPopular ? { ...styles.cardBtn, backgroundColor: '#ea580c' } : styles.cardBtn}>
                                            เลือกแพ็คเกจนี้
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Promotions */}
                {promotions.length > 0 && (
                    <section style={styles.promoSection}>
                        <h2 style={styles.promoTitle}>🎁 โปรโมชั่นพิเศษ</h2>
                        <div style={styles.promoGrid}>
                            {promotions.map((promo) => (
                                <div key={promo.id} style={styles.promoCard}>
                                    <span style={styles.promoIcon}>{promo.icon}</span>
                                    <div>
                                        <h4 style={styles.promoName}>{promo.title}</h4>
                                        <p style={styles.promoDesc}>{promo.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Additional Services */}
                {addons.length > 0 && (
                    <section style={styles.addonsSection}>
                        <h2 style={styles.addonsTitle}>🛎️ บริการเสริม</h2>
                        <div style={styles.addonsGrid}>
                            {addons.map((addon) => (
                                <div key={addon.id} style={styles.addonCard}>
                                    <span style={styles.addonIcon}>{addon.icon}</span>
                                    <h4 style={styles.addonName}>{addon.name}</h4>
                                    <p style={styles.addonPrice}>{addon.price}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: { fontFamily: "'Sarabun', 'Kanit', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh' },
    hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '80px 20px', textAlign: 'center' },
    heroTitle: { fontSize: '3rem', color: 'white', margin: '0 0 10px' },
    heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', margin: '0 0 20px' },
    backLink: { color: '#fbbf24', textDecoration: 'none' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },

    // Loading
    loadingContainer: { textAlign: 'center', padding: '80px 20px' },
    spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' },

    // Pricing Cards
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '70px' },
    pricingCard: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '2px solid #f0f0f0', position: 'relative' },
    popularCard: { border: '3px solid #ea580c', transform: 'scale(1.03)' },
    popularBadge: { position: 'absolute', top: '0', right: '25px', backgroundColor: '#ea580c', color: 'white', padding: '10px 20px', borderRadius: '0 0 15px 15px', fontWeight: 'bold' },
    cardHeader: { padding: '35px 30px 25px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' },
    cardIcon: { fontSize: '4rem', display: 'block', marginBottom: '15px' },
    cardName: { fontSize: '1.6rem', color: '#1a1a2e', margin: '0 0 8px' },
    cardDesc: { color: '#6b7280', fontSize: '0.95rem', margin: 0 },
    cardBody: { padding: '30px' },
    priceBox: { textAlign: 'center', marginBottom: '25px' },
    priceAmount: { fontSize: '3.5rem', fontWeight: '800', color: '#ea580c' },
    priceUnit: { color: '#9ca3af', fontSize: '1rem', display: 'block' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 25px' },
    featureItem: { padding: '10px 0', borderBottom: '1px solid #f5f5f5', color: '#374151' },
    featureItemExcluded: { padding: '10px 0', borderBottom: '1px solid #f5f5f5', color: '#9ca3af' },
    cardBtn: { width: '100%', padding: '16px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },

    // Promo
    promoSection: { marginBottom: '60px' },
    promoTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', textAlign: 'center' },
    promoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    promoCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff7ed', padding: '25px', borderRadius: '16px', border: '2px dashed #fed7aa' },
    promoIcon: { fontSize: '2.5rem' },
    promoName: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 5px' },
    promoDesc: { color: '#6b7280', margin: 0, fontSize: '0.9rem' },

    // Addons
    addonsSection: {},
    addonsTitle: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '25px', textAlign: 'center' },
    addonsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    addonCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
    addonIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '15px' },
    addonName: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 8px' },
    addonPrice: { color: '#ea580c', fontWeight: 'bold', margin: 0 },
}
