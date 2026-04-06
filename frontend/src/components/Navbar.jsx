import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ cartCount = 0, onCartClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={styles.nav}>
      <Link to={user?.role === 'STAFF' ? '/staff' : '/menu'} style={styles.brand}>
        <span style={styles.brandIcon}>🍛</span>
        <span style={styles.brandText}>Campus Canteen</span>
      </Link>

      <div style={styles.right}>
        {user?.role === 'STUDENT' && (
          <>
            <Link to="/menu" style={styles.link}>Menu</Link>
            <Link to="/orders" style={styles.link}>My Orders</Link>
            <Link to="/algorithms" style={styles.link}>Algorithms</Link>
            {onCartClick && (
              <button style={styles.cartBtn} onClick={onCartClick}>
                🛒
                {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
              </button>
            )}
          </>
        )}
        {user?.role === 'STAFF' && (
          <>
            <Link to="/staff" style={styles.link}>Orders Panel</Link>
            <Link to="/algorithms" style={styles.link}>Algorithms</Link>
          </>
        )}
        <div style={styles.userChip}>
          <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">↩</button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 24px', height: 60,
    background: 'rgba(15,14,13,0.9)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  brandIcon: { fontSize: 22 },
  brandText: { fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--text)' },
  right: { display: 'flex', alignItems: 'center', gap: 20 },
  link: { color: 'var(--text2)', fontSize: 14, fontWeight: 500, textDecoration: 'none' },
  cartBtn: { position: 'relative', background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '7px 12px', fontSize: 16, cursor: 'pointer', color: 'var(--text)' },
  cartBadge: { position: 'absolute', top: -6, right: -6, background: 'var(--accent)',
    color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: 11,
    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userChip: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px' },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  logoutBtn: { background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14 },
}
