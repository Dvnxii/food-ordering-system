import { useState, useEffect } from 'react'
import { orderApi } from '../services/api'
import Navbar from '../components/Navbar'

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COLLECTED']

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.getMyOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>My Orders</h2>

        {loading ? (
          <div style={styles.loadingWrap}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 56 }}>🍽️</span>
            <p style={{ color: 'var(--text2)', marginTop: 16 }}>No orders yet. Go grab some food!</p>
          </div>
        ) : (
          <div style={styles.list}>
            {orders.map((order, i) => (
              <div key={order.id} className="fade-in" style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>

                {/* Progress bar */}
                {order.status !== 'CANCELLED' && (
                  <div style={styles.progressWrap}>
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = STATUS_STEPS.indexOf(order.status)
                      const done = idx <= currentIdx
                      return (
                        <div key={step} style={styles.stepWrap}>
                          <div style={{ ...styles.stepDot, ...(done ? styles.stepDotDone : {}) }} />
                          {idx < STATUS_STEPS.length - 1 && (
                            <div style={{ ...styles.stepLine, ...(idx < currentIdx ? styles.stepLineDone : {}) }} />
                          )}
                          <span style={{ ...styles.stepLabel, ...(done ? styles.stepLabelDone : {}) }}>
                            {step.charAt(0) + step.slice(1).toLowerCase()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Items */}
                <div style={styles.items}>
                  {order.items.map((item, j) => (
                    <div key={j} style={styles.item}>
                      <span style={styles.itemName}>{item.name} × {item.quantity}</span>
                      <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.cardFooter}>
                  {order.specialInstructions && (
                    <span style={styles.note}>📝 {order.specialInstructions}</span>
                  )}
                  <span style={styles.total}>Total: <strong>₹{order.total}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dt) {
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  container: { maxWidth: 700, margin: '0 auto', padding: '40px 24px 64px' },
  heading: { fontSize: 28, fontFamily: 'Syne', fontWeight: 800, marginBottom: 28 },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 80 },
  list: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: 'var(--card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  orderId: { fontSize: 17, fontWeight: 700, fontFamily: 'Syne', display: 'block' },
  orderDate: { fontSize: 12, color: 'var(--text2)', marginTop: 2, display: 'block' },
  progressWrap: { display: 'flex', alignItems: 'flex-start', marginBottom: 20, overflowX: 'auto' },
  stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 60 },
  stepDot: { width: 12, height: 12, borderRadius: '50%', background: 'var(--border2)', border: '2px solid var(--border2)', transition: 'all 0.3s' },
  stepDotDone: { background: 'var(--accent)', border: '2px solid var(--accent)' },
  stepLine: { height: 2, width: '100%', background: 'var(--border2)', marginTop: -7, transition: 'background 0.3s' },
  stepLineDone: { background: 'var(--accent)' },
  stepLabel: { fontSize: 10, color: 'var(--text3)', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' },
  stepLabelDone: { color: 'var(--accent)' },
  items: { display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  itemName: { color: 'var(--text2)' },
  itemPrice: { color: 'var(--text)', fontWeight: 500 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  note: { fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' },
  total: { fontSize: 16, color: 'var(--text2)' },
}
