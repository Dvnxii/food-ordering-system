import { useState, useEffect, useCallback } from 'react'
import { menuApi, orderApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Cart from '../components/Cart'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks']

export default function MenuPage() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState({})
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    menuApi.getAll().then(r => { setMenuItems(r.data); setLoading(false) })
  }, [])

  const handleNotification = useCallback((data) => {
    if (!data.message) return
    if (data.type === 'READY' || data.type === 'ORDER_READY') {
      toast.success(data.message, { duration: 8000, icon: '🍽️',
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' } })
    } else if (data.type === 'CONFIRMED' || data.type === 'ORDER_CONFIRMED') {
      toast.success(data.message, { duration: 5000, icon: '✅',
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' } })
    } else if (data.type === 'PREPARING' || data.type === 'ORDER_PREPARING') {
      toast(data.message, { duration: 5000, icon: '👨‍🍳',
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' } })
    }
  }, [])

  useNotifications(user?.userId, handleNotification, false)

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 } }))
    toast.success(`${item.name} added!`, { duration: 1500,
      style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' } })
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[id].qty > 1) updated[id] = { ...updated[id], qty: updated[id].qty - 1 }
      else delete updated[id]
      return updated
    })
  }

  const cartCount = Object.values(cart).reduce((s, i) => s + i.qty, 0)
  const cartTotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0)

  const placeOrder = async (instructions) => {
    setPlacing(true)
    try {
      const items = Object.values(cart).map(i => ({ menuItemId: i.id, quantity: i.qty }))
      await orderApi.place({ items, specialInstructions: instructions })
      toast.success("Order placed! 🎉 You'll be notified when it's ready.", {
        duration: 5000,
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' }
      })
      setCart({})
      setCartOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const filtered = category === 'All' ? menuItems : menuItems.filter(i => i.category === category)

  return (
    <div style={styles.page}>
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>What's cooking today?</h1>
        <p style={styles.heroSub}>Fresh food, ready when you are. Order and we'll ping you.</p>
      </div>
      <div style={styles.container}>
        <div style={styles.catRow}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              style={{ ...styles.catBtn, ...(category === cat ? styles.catBtnActive : {}) }}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
        {loading ? (
          <div style={styles.loadingRow}>
            {[...Array(6)].map((_, i) => <div key={i} style={styles.skeleton} />)}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((item, i) => (
              <div key={item.id} className="fade-in"
                style={{ ...styles.card, animationDelay: `${i * 0.05}s` }}>
                <div style={styles.cardEmoji}>{getCategoryEmoji(item.category)}</div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <h3 style={styles.cardName}>{item.name}</h3>
                    <span style={styles.cardPrice}>₹{item.price}</span>
                  </div>
                  <p style={styles.cardDesc}>{item.description}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.prepTime}>⏱ {item.prepTimeMinutes} min</span>
                    {cart[item.id] ? (
                      <div style={styles.qtyControl}>
                        <button style={styles.qtyBtn} onClick={() => removeFromCart(item.id)}>−</button>
                        <span style={styles.qtyNum}>{cart[item.id].qty}</span>
                        <button style={styles.qtyBtn} onClick={() => addToCart(item)}>+</button>
                      </div>
                    ) : (
                      <button style={styles.addBtn} onClick={() => addToCart(item)}>Add +</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {cartOpen && (
        <Cart cart={cart} total={cartTotal} onAdd={addToCart} onRemove={removeFromCart}
          onClose={() => setCartOpen(false)} onPlace={placeOrder} placing={placing} />
      )}
    </div>
  )
}

function getCategoryEmoji(cat) {
  return { Breakfast: '🥞', Lunch: '🍱', Snacks: '🥙', Drinks: '🥤' }[cat] || '🍴'
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  hero: { padding: '48px 24px 24px', textAlign: 'center' },
  heroTitle: { fontSize: 'clamp(28px, 5vw, 42px)', fontFamily: 'Syne', fontWeight: 800 },
  heroSub: { color: 'var(--text2)', marginTop: 8, fontSize: 16 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' },
  catRow: { display: 'flex', gap: 10, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 },
  catBtn: { padding: '8px 20px', borderRadius: 30, background: 'var(--bg3)',
    border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: 500,
    whiteSpace: 'nowrap', transition: 'all 0.2s', cursor: 'pointer' },
  catBtnActive: { background: 'var(--accent)', border: '1px solid var(--accent)',
    color: '#000', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: 'var(--card)', borderRadius: 16, overflow: 'hidden',
    border: '1px solid var(--border)', transition: 'border-color 0.2s' },
  cardEmoji: { fontSize: 40, textAlign: 'center', padding: '24px 0 12px',
    background: 'var(--bg3)', borderBottom: '1px solid var(--border)' },
  cardBody: { padding: 20 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: 700, fontFamily: 'Syne', flex: 1, marginRight: 8 },
  cardPrice: { fontSize: 18, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' },
  cardDesc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 16 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  prepTime: { fontSize: 12, color: 'var(--text3)' },
  addBtn: { padding: '8px 18px', background: 'var(--accent)', border: 'none',
    borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg3)',
    borderRadius: 8, padding: '4px 8px', border: '1px solid var(--border)' },
  qtyBtn: { background: 'none', border: 'none', color: 'var(--accent)', fontSize: 18,
    fontWeight: 700, cursor: 'pointer', lineHeight: 1, padding: '0 4px' },
  qtyNum: { fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  loadingRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  skeleton: { height: 220, borderRadius: 16, background: 'var(--bg3)',
    animation: 'pulse 1.4s ease-in-out infinite' },
}
