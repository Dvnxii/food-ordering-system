import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = isLogin
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form)

      login(res.data)
      toast.success(`Welcome, ${res.data.name}!`)
      navigate(res.data.role === 'STAFF' ? '/staff' : '/menu')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🍛</span>
          <h1 style={styles.logoText}>Campus Canteen</h1>
          <p style={styles.logoSub}>Your college food, simplified</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['Login', 'Register'].map((t, i) => (
            <button key={t} style={{ ...styles.tab, ...(isLogin === !i ? styles.tabActive : {}) }}
              onClick={() => setIsLogin(!i)}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.field} className="fade-in">
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} placeholder="Rahul Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@college.edu"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          {!isLogin && (
            <div style={styles.field} className="fade-in">
              <label style={styles.label}>I am a</label>
              <div style={styles.roleRow}>
                {['STUDENT', 'STAFF'].map(r => (
                  <button key={r} type="button"
                    style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}
                    onClick={() => setForm({ ...form, role: r })}>
                    {r === 'STUDENT' ? '🎓 Student' : '👨‍🍳 Staff'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={styles.hint}>
          Demo: <strong>student@college.edu</strong> or <strong>staff@canteen.edu</strong> / password123
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: '24px' },
  card: { width: '100%', maxWidth: 420, background: 'var(--card)', borderRadius: 20,
    padding: '40px 36px', border: '1px solid var(--border)' },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 48, display: 'block', marginBottom: 12 },
  logoText: { fontSize: 28, fontFamily: 'Syne', fontWeight: 800, color: 'var(--text)' },
  logoSub: { fontSize: 14, color: 'var(--text2)', marginTop: 4 },
  tabs: { display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 4, marginBottom: 28 },
  tab: { flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent',
    color: 'var(--text2)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  tabActive: { background: 'var(--accent)', color: '#000', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)' },
  input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10,
    padding: '12px 14px', color: 'var(--text)', fontSize: 15,
    transition: 'border 0.2s' },
  roleRow: { display: 'flex', gap: 10 },
  roleBtn: { flex: 1, padding: '11px 0', borderRadius: 10, background: 'var(--bg3)',
    border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14, fontWeight: 500,
    transition: 'all 0.2s', cursor: 'pointer' },
  roleBtnActive: { background: 'rgba(245,166,35,0.15)', border: '1px solid var(--accent)',
    color: 'var(--accent)' },
  submit: { padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: 12,
    color: '#000', fontWeight: 700, fontSize: 16, fontFamily: 'Syne',
    cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 },
}
