import { useState, useEffect, useCallback, useRef } from 'react'
import { orderApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const NEXT_STATUS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COLLECTED',
}

const STATUS_LABEL = {
  PLACED:    { label: 'Confirm Order', color: '#5b9cf6' },
  CONFIRMED: { label: 'Start Preparing', color: '#a78bfa' },
  PREPARING: { label: 'Mark as Ready 🔔', color: '#f5a623' },
  READY:     { label: 'Mark Collected', color: '#4caf7d' },
}

export default function StaffPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [filter, setFilter] = useState('ALL')

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderApi.getActive(),
        orderApi.getStats()
      ])
      setOrders(ordersRes.data)
      setStats(statsRes.data)
    } catch (e) {
      console.error('Failed to fetch orders', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const t = setInterval(fetchOrders, 10000)
    return () => clearInterval(t)
  }, [fetchOrders])

  const handleNotification = useCallback((data) => {
    if (data.broadcast || data.type === 'REFRESH') {
      fetchOrders()
    }
    if (data.type === 'NEW_ORDER') {
      toast('🛎️ New order received!', {
        duration: 5000,
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' }
      })
    }
  }, [fetchOrders])

  useNotifications(user?.userId, handleNotification, true)

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }))
    try {
      await orderApi.updateStatus(orderId, newStatus)
      const msg = newStatus === 'READY'
        ? '🔔 Student notified! Order marked ready.'
        : `Order moved to ${newStatus}`
      toast.success(msg, {
        style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' }
      })
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const statCards = [
    { key: 'placed',    label: 'New Orders', icon: '🛎️', color: '#5b9cf6' },
    { key: 'confirmed', label: 'Confirmed',  icon: '✅', color: '#a78bfa' },
    { key: 'preparing', label: 'Preparing',  icon: '👨‍🍳', color: '#f5a623' },
    { key: 'ready',     label: 'Ready',      icon: '🍽️', color: '#4caf7d' },
  ]

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.heading}>Canteen Panel</h2>
            <p style={styles.sub}>Auto-refreshes every 10 seconds</p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchOrders}>↻ Refresh</button>
        </div>

        <div style={styles.statsRow}>
          {statCards.map(s => (
            <div key={s.key} style={{ ...styles.statCard, borderColor: s.color + '40' }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <div style={{ ...styles.statNum, color: s.color }}>{stats[s.key] ?? 0}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.filterRow}>
          {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY'].map(f => (
            <button key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loadingWrap}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 56 }}>🎉</span>
            <p style={{ color: 'var(--text2)', marginTop: 16 }}>No active orders right now.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((order, i) => (
              <div key={order.id} className="fade-in"
                style={{ ...styles.card, animationDelay: `${i * 0.05}s`, ...getCardAccent(order.status) }}>
                <div style={styles.cardTop}>
                  <div>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={styles.studentName}>👤 {order.studentName}</span>
                  </div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>

                <div style={styles.items}>
                  {order.items.map((item, j) => (
                    <div key={j} style={styles.item}>
                      <span>{item.name}</span>
                      <span style={styles.itemQty}>× {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div style={styles.note}>📝 {order.specialInstructions}</div>
                )}

                <div style={styles.cardFooter}>
                  <div>
                    <div style={styles.total}>₹{order.total}</div>
                    <div style={styles.time}>{formatTime(order.createdAt)}</div>
                  </div>
                  {NEXT_STATUS[order.status] && (
                    <button
                      style={{ ...styles.actionBtn, background: STATUS_LABEL[order.status]?.color }}
                      onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                      disabled={updating[order.id]}>
                      {updating[order.id]
                        ? <span className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} />
                        : STATUS_LABEL[order.status]?.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getCardAccent(status) {
  const map = { PLACED: '#5b9cf6', CONFIRMED: '#a78bfa', PREPARING: '#f5a623', READY: '#4caf7d' }
  return map[status] ? { borderLeft: `3px solid ${map[status]}` } : {}
}

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px 64px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  heading: { fontSize: 28, fontFamily: 'Syne', fontWeight: 800 },
  sub: { color: 'var(--text2)', marginTop: 4, fontSize: 13 },
  refreshBtn: { padding: '8px 18px', background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontSize: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: { background: 'var(--card)', borderRadius: 12, padding: 20,
    display: 'flex', gap: 16, alignItems: 'center', border: '1px solid var(--border)' },
  statNum: { fontSize: 28, fontWeight: 800, fontFamily: 'Syne', lineHeight: 1 },
  statLabel: { fontSize: 13, color: 'var(--text2)', marginTop: 2 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' },
  filterBtn: { padding: '6px 16px', borderRadius: 20, background: 'var(--bg3)',
    border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 13,
    cursor: 'pointer', whiteSpace: 'nowrap' },
  filterBtnActive: { background: 'var(--accent)', border: '1px solid var(--accent)',
    color: '#000', fontWeight: 700 },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 80 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card: { background: 'var(--card)', borderRadius: 14, padding: 20,
    border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontFamily: 'Syne', fontWeight: 700, fontSize: 16, display: 'block' },
  studentName: { fontSize: 13, color: 'var(--text2)', marginTop: 2, display: 'block' },
  items: { display: 'flex', flexDirection: 'column', gap: 6,
    background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px' },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  itemQty: { color: 'var(--accent)', fontWeight: 600 },
  note: { fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', padding: '6px 10px',
    background: 'rgba(245,166,35,0.05)', borderRadius: 6, border: '1px solid rgba(245,166,35,0.1)' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  total: { fontWeight: 700, fontSize: 18, fontFamily: 'Syne' },
  time: { fontSize: 12, color: 'var(--text3)', marginTop: 2 },
  actionBtn: { padding: '10px 16px', borderRadius: 10, border: 'none', color: '#000',
    fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: 8, minWidth: 90, justifyContent: 'center' },
}
