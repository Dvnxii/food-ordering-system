import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auth')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed.user)
        setToken(parsed.token)
      }
    } catch (e) {
      localStorage.removeItem('auth')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (authData) => {
    const userData = {
      name: authData.name,
      email: authData.email,
      role: authData.role,
      userId: authData.userId
    }
    setUser(userData)
    setToken(authData.token)
    localStorage.setItem('auth', JSON.stringify({ user: userData, token: authData.token }))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
