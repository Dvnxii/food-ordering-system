import { useState } from 'react'

export default function Cart({ cart, total, onAdd, onRemove, onClose, onPlace, placing }) {
  const [instructions, setInstructions] = useState('')
  const items = Object.values(cart)

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <div style={styles.drawer} className="slide-in">
        <div style={styles.header}>
          <h3 style={styles.title}>Your Cart</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 48 }}>🛒</span>
            <p style={{ color: 'var(--text2)', marginTop: 12 }}>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={styles.itemsList}>
              {items.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemPrice}>₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                  <div style={styles.qtyRow}>
                    <button style={styles.qtyBtn} onClick={() => onRemove(item.id)}>−</button>
                    <span style={styles.qty}>{item.qty}</span>
                    <button style={styles.qtyBtn} onClick={() => onAdd(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.instrWrap}>
              <label style={styles.instrLabel}>Special instructions (optional)</label>
              <textarea style={styles.instrInput} rows={3}
                placeholder="e.g. Less spice, extra onions..."
                value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>

            <div style={styles.footer}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalAmount}>₹{total.toFixed(2)}</span>
              </div>
              <button style={styles.placeBtn} onClick={() => onPlace(instructions)} disabled={placing}>
                {placing
                  ? <><span className="spinner" style={{ borderTopColor: '#000' }} /> Placing...</>
                  : '🍽️ Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

const styles = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 },
  drawer: { position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, maxWidth: '95vw',
    background: 'var(--card)', borderLeft: '1px solid var(--border)', zIndex: 201,
    display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid var(--border)' },
  title: { fontFamily: 'Syne', fontWeight: 800, fontSize: 20 },
  closeBtn: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text2)', width: 32, height: 32, cursor: 'pointer', fontSize: 14 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 40 },
  itemsList: { flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  cartItem: { background: 'var(--bg3)', borderRadius: 10, padding: '14px',
    border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 },
  itemInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontWeight: 500, fontSize: 15 },
  itemPrice: { fontWeight: 700, color: 'var(--accent)', fontSize: 15 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 16 },
  qtyBtn: { background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6,
    width: 28, height: 28, color: 'var(--accent)', fontWeight: 700, fontSize: 16,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { fontWeight: 600, minWidth: 20, textAlign: 'center' },
  instrWrap: { padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  instrLabel: { fontSize: 12, color: 'var(--text2)', fontWeight: 500 },
  instrInput: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', padding: '10px 12px', fontSize: 13, resize: 'none' },
  footer: { padding: '16px 24px', borderTop: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 12 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, color: 'var(--text2)' },
  totalAmount: { fontSize: 24, fontWeight: 800, fontFamily: 'Syne', color: 'var(--accent)' },
  placeBtn: { padding: '14px', background: 'var(--accent)', borderRadius: 12, border: 'none',
    color: '#000', fontWeight: 700, fontSize: 16, fontFamily: 'Syne', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
}
