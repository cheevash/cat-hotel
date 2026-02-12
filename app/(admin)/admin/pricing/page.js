'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

export default function AdminPricing() {
  const [activeTab, setActiveTab] = useState('packages')

  // Data states
  const [packages, setPackages] = useState([])
  const [promotions, setPromotions] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [modalType, setModalType] = useState('') // 'package', 'promotion', 'addon'

  // Form states
  const [pkgForm, setPkgForm] = useState({ name: '', description: '', price: '', unit: 'บาท/คืน', icon: '🏠', features: [], is_popular: false, order: 1 })
  const [promoForm, setPromoForm] = useState({ title: '', description: '', icon: '🎁', is_active: true, order: 1 })
  const [addonForm, setAddonForm] = useState({ name: '', price: '', icon: '🛎️', is_active: true, order: 1 })

  const [newFeature, setNewFeature] = useState({ text: '', included: true })

  const iconOptions = ['🏠', '🏰', '👑', '🐱', '🏨', '⭐', '💎', '🎁', '🛁', '🚗', '🍽️', '✂️', '📅', '🎂', '🔄', '🐱🐱']

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const [{ data: p }, { data: pr }, { data: a }] = await Promise.all([
      supabase.from('pricing_packages').select('*').order('order'),
      supabase.from('promotions').select('*').order('order'),
      supabase.from('service_addons').select('*').order('order')
    ])
    setPackages(p || [])
    setPromotions(pr || [])
    setAddons(a || [])
    setLoading(false)
  }

  // Open modals
  const openPkgModal = (pkg = null) => {
    setModalType('package')
    setEditingItem(pkg)
    setPkgForm(pkg ? {
      name: pkg.name, description: pkg.description || '', price: pkg.price,
      unit: pkg.unit, icon: pkg.icon, features: parseFeatures(pkg.features),
      is_popular: pkg.is_popular, order: pkg.order
    } : { name: '', description: '', price: '', unit: 'บาท/คืน', icon: '🏠', features: [], is_popular: false, order: packages.length + 1 })
    setNewFeature({ text: '', included: true })
    setShowModal(true)
  }

  const openPromoModal = (promo = null) => {
    setModalType('promotion')
    setEditingItem(promo)
    setPromoForm(promo ? {
      title: promo.title, description: promo.description || '', icon: promo.icon,
      is_active: promo.is_active, order: promo.order
    } : { title: '', description: '', icon: '🎁', is_active: true, order: promotions.length + 1 })
    setShowModal(true)
  }

  const openAddonModal = (addon = null) => {
    setModalType('addon')
    setEditingItem(addon)
    setAddonForm(addon ? {
      name: addon.name, price: addon.price, icon: addon.icon,
      is_active: addon.is_active, order: addon.order
    } : { name: '', price: '', icon: '🛎️', is_active: true, order: addons.length + 1 })
    setShowModal(true)
  }

  const parseFeatures = (f) => {
    if (!f) return []
    if (Array.isArray(f)) return f
    try { return JSON.parse(f) } catch { return [] }
  }

  // Feature handlers
  const addFeature = () => {
    if (newFeature.text.trim()) {
      setPkgForm({ ...pkgForm, features: [...pkgForm.features, { ...newFeature, text: newFeature.text.trim() }] })
      setNewFeature({ text: '', included: true })
    }
  }
  const removeFeature = (i) => setPkgForm({ ...pkgForm, features: pkgForm.features.filter((_, idx) => idx !== i) })
  const moveFeature = (i, dir) => {
    const nf = [...pkgForm.features]
    const ti = i + dir
    if (ti >= 0 && ti < nf.length) {
      [nf[i], nf[ti]] = [nf[ti], nf[i]]
      setPkgForm({ ...pkgForm, features: nf })
    }
  }

  // Save handlers
  const savePackage = async (e) => {
    e.preventDefault()
    const payload = { ...pkgForm, price: Number(pkgForm.price), order: Number(pkgForm.order) }
    const { error } = editingItem
      ? await supabase.from('pricing_packages').update(payload).eq('id', editingItem.id)
      : await supabase.from('pricing_packages').insert([payload])
    if (error) Swal.fire('Error', error.message, 'error')
    else { Swal.fire('สำเร็จ!', '', 'success'); setShowModal(false); fetchAllData() }
  }

  const savePromo = async (e) => {
    e.preventDefault()
    const payload = { ...promoForm, order: Number(promoForm.order) }
    const { error } = editingItem
      ? await supabase.from('promotions').update(payload).eq('id', editingItem.id)
      : await supabase.from('promotions').insert([payload])
    if (error) Swal.fire('Error', error.message, 'error')
    else { Swal.fire('สำเร็จ!', '', 'success'); setShowModal(false); fetchAllData() }
  }

  const saveAddon = async (e) => {
    e.preventDefault()
    const payload = { ...addonForm, order: Number(addonForm.order) }
    const { error } = editingItem
      ? await supabase.from('service_addons').update(payload).eq('id', editingItem.id)
      : await supabase.from('service_addons').insert([payload])
    if (error) Swal.fire('Error', error.message, 'error')
    else { Swal.fire('สำเร็จ!', '', 'success'); setShowModal(false); fetchAllData() }
  }

  const handleDelete = async (id, name, table) => {
    if (!(await Swal.fire({ title: 'ลบ?', text: name, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'ลบ' })).isConfirmed) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else { Swal.fire('ลบแล้ว!', '', 'success'); fetchAllData() }
  }

  if (loading) return <div style={styles.loading}><div style={styles.spinner}></div><p>โหลด...</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💰 จัดการราคา</h1>
          <p style={styles.subtitle}>แพ็คเกจ, โปรโมชั่น, บริการเสริม</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[{ id: 'packages', label: '📦 แพ็คเกจ', count: packages.length }, { id: 'promotions', label: '🎁 โปรโมชั่น', count: promotions.length }, { id: 'addons', label: '🛎️ บริการเสริม', count: addons.length }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={activeTab === t.id ? styles.tabActive : styles.tab}>
            {t.label} <span style={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <>
          <button onClick={() => openPkgModal()} style={styles.addBtn}>➕ เพิ่มแพ็คเกจ</button>
          <div style={styles.grid}>
            {packages.map(p => (
              <div key={p.id} style={p.is_popular ? { ...styles.card, borderColor: '#ea580c' } : styles.card}>
                {p.is_popular && <span style={styles.popBadge}>🔥 ยอดนิยม</span>}
                <div style={styles.cardBody}>
                  <span style={styles.icon}>{p.icon}</span>
                  <h3>{p.name}</h3>
                  <p style={styles.desc}>{p.description}</p>
                  <p style={styles.price}>{Number(p.price).toLocaleString()} {p.unit}</p>
                  <p style={styles.meta}>ฟีเจอร์ {parseFeatures(p.features).length} รายการ | ลำดับ {p.order}</p>
                </div>
                <div style={styles.actions}>
                  <button onClick={() => openPkgModal(p)} style={styles.editBtn}>✏️ แก้ไข</button>
                  <button onClick={() => handleDelete(p.id, p.name, 'pricing_packages')} style={styles.delBtn}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <>
          <button onClick={() => openPromoModal()} style={styles.addBtn}>➕ เพิ่มโปรโมชั่น</button>
          <div style={styles.grid}>
            {promotions.map(p => (
              <div key={p.id} style={{ ...styles.card, background: '#fff7ed', borderStyle: 'dashed' }}>
                <div style={styles.cardBody}>
                  <span style={styles.icon}>{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p style={styles.desc}>{p.description}</p>
                  <p style={styles.meta}>{p.is_active ? '✅ ใช้งาน' : '❌ ปิด'} | ลำดับ {p.order}</p>
                </div>
                <div style={styles.actions}>
                  <button onClick={() => openPromoModal(p)} style={styles.editBtn}>✏️ แก้ไข</button>
                  <button onClick={() => handleDelete(p.id, p.title, 'promotions')} style={styles.delBtn}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Addons Tab */}
      {activeTab === 'addons' && (
        <>
          <button onClick={() => openAddonModal()} style={styles.addBtn}>➕ เพิ่มบริการเสริม</button>
          <div style={styles.grid}>
            {addons.map(a => (
              <div key={a.id} style={styles.card}>
                <div style={styles.cardBody}>
                  <span style={styles.icon}>{a.icon}</span>
                  <h3>{a.name}</h3>
                  <p style={styles.price}>{a.price}</p>
                  <p style={styles.meta}>{a.is_active ? '✅ ใช้งาน' : '❌ ปิด'} | ลำดับ {a.order}</p>
                </div>
                <div style={styles.actions}>
                  <button onClick={() => openAddonModal(a)} style={styles.editBtn}>✏️ แก้ไข</button>
                  <button onClick={() => handleDelete(a.id, a.name, 'service_addons')} style={styles.delBtn}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>{editingItem ? '✏️ แก้ไข' : '➕ เพิ่ม'} {modalType === 'package' ? 'แพ็คเกจ' : modalType === 'promotion' ? 'โปรโมชั่น' : 'บริการเสริม'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Package Form */}
            {modalType === 'package' && (
              <form onSubmit={savePackage} style={styles.form}>
                <div style={styles.row}>
                  <input placeholder="ชื่อ *" value={pkgForm.name} onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })} required style={styles.input} />
                  <select value={pkgForm.icon} onChange={e => setPkgForm({ ...pkgForm, icon: e.target.value })} style={styles.input}>
                    {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <input placeholder="คำอธิบาย" value={pkgForm.description} onChange={e => setPkgForm({ ...pkgForm, description: e.target.value })} style={styles.input} />
                <div style={styles.row}>
                  <input type="number" placeholder="ราคา *" value={pkgForm.price} onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })} required style={styles.input} />
                  <input placeholder="หน่วย" value={pkgForm.unit} onChange={e => setPkgForm({ ...pkgForm, unit: e.target.value })} style={styles.input} />
                </div>
                <div style={styles.row}>
                  <input type="number" placeholder="ลำดับ" value={pkgForm.order} onChange={e => setPkgForm({ ...pkgForm, order: e.target.value })} style={styles.input} />
                  <label style={styles.checkbox}><input type="checkbox" checked={pkgForm.is_popular} onChange={e => setPkgForm({ ...pkgForm, is_popular: e.target.checked })} /> 🔥 ยอดนิยม</label>
                </div>

                <div style={styles.section}>
                  <h4>ฟีเจอร์ ({pkgForm.features.length})</h4>
                  <div style={styles.row}>
                    <input placeholder="เพิ่มฟีเจอร์..." value={newFeature.text} onChange={e => setNewFeature({ ...newFeature, text: e.target.value })} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} style={{ ...styles.input, flex: 1 }} />
                    <label style={styles.checkbox}><input type="checkbox" checked={newFeature.included} onChange={e => setNewFeature({ ...newFeature, included: e.target.checked })} /> มีให้</label>
                    <button type="button" onClick={addFeature} style={styles.smallBtn}>➕</button>
                  </div>
                  <div style={styles.featureList}>
                    {pkgForm.features.map((f, i) => (
                      <div key={i} style={styles.featureItem}>
                        <span>{f.included ? '✅' : '❌'} {f.text}</span>
                        <div>
                          <button type="button" onClick={() => moveFeature(i, -1)} disabled={i === 0}>⬆️</button>
                          <button type="button" onClick={() => moveFeature(i, 1)} disabled={i === pkgForm.features.length - 1}>⬇️</button>
                          <button type="button" onClick={() => removeFeature(i)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                  <button type="submit" style={styles.saveBtn}>💾 บันทึก</button>
                </div>
              </form>
            )}

            {/* Promotion Form */}
            {modalType === 'promotion' && (
              <form onSubmit={savePromo} style={styles.form}>
                <div style={styles.row}>
                  <input placeholder="ชื่อโปรโมชั่น *" value={promoForm.title} onChange={e => setPromoForm({ ...promoForm, title: e.target.value })} required style={styles.input} />
                  <select value={promoForm.icon} onChange={e => setPromoForm({ ...promoForm, icon: e.target.value })} style={styles.input}>
                    {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <input placeholder="คำอธิบาย" value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} style={styles.input} />
                <div style={styles.row}>
                  <input type="number" placeholder="ลำดับ" value={promoForm.order} onChange={e => setPromoForm({ ...promoForm, order: e.target.value })} style={styles.input} />
                  <label style={styles.checkbox}><input type="checkbox" checked={promoForm.is_active} onChange={e => setPromoForm({ ...promoForm, is_active: e.target.checked })} /> ✅ ใช้งาน</label>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                  <button type="submit" style={styles.saveBtn}>💾 บันทึก</button>
                </div>
              </form>
            )}

            {/* Addon Form */}
            {modalType === 'addon' && (
              <form onSubmit={saveAddon} style={styles.form}>
                <div style={styles.row}>
                  <input placeholder="ชื่อบริการ *" value={addonForm.name} onChange={e => setAddonForm({ ...addonForm, name: e.target.value })} required style={styles.input} />
                  <select value={addonForm.icon} onChange={e => setAddonForm({ ...addonForm, icon: e.target.value })} style={styles.input}>
                    {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <input placeholder="ราคา (เช่น 250-450 บาท) *" value={addonForm.price} onChange={e => setAddonForm({ ...addonForm, price: e.target.value })} required style={styles.input} />
                <div style={styles.row}>
                  <input type="number" placeholder="ลำดับ" value={addonForm.order} onChange={e => setAddonForm({ ...addonForm, order: e.target.value })} style={styles.input} />
                  <label style={styles.checkbox}><input type="checkbox" checked={addonForm.is_active} onChange={e => setAddonForm({ ...addonForm, is_active: e.target.checked })} /> ✅ ใช้งาน</label>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ยกเลิก</button>
                  <button type="submit" style={styles.saveBtn}>💾 บันทึก</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Sarabun', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '15px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  header: { marginBottom: '20px' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', margin: 0 },

  tabs: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '12px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' },
  tabActive: { padding: '12px 20px', borderRadius: '10px', border: '1px solid #ea580c', background: '#ea580c', color: '#fff', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' },
  tabCount: { background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' },

  addBtn: { padding: '10px 20px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },

  card: { background: '#fff', borderRadius: '16px', border: '2px solid #f1f5f9', position: 'relative', overflow: 'hidden' },
  popBadge: { position: 'absolute', top: 0, right: '15px', background: '#ea580c', color: '#fff', padding: '5px 12px', borderRadius: '0 0 10px 10px', fontSize: '0.8rem' },
  cardBody: { padding: '25px', textAlign: 'center' },
  icon: { fontSize: '3rem', display: 'block', marginBottom: '10px' },
  desc: { color: '#64748b', fontSize: '0.9rem', margin: '5px 0' },
  price: { color: '#ea580c', fontSize: '1.5rem', fontWeight: '700', margin: '10px 0' },
  meta: { color: '#94a3b8', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #f1f5f9' },
  editBtn: { flex: 1, padding: '8px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  delBtn: { padding: '8px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  form: { padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  input: { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500' },
  smallBtn: { padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  section: { background: '#f8fafc', padding: '15px', borderRadius: '10px', margin: '15px 0' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  featureItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' },
  cancelBtn: { padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { padding: '10px 24px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}
