import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import MyOrdersPage from './pages/MyOrdersPage'
import StaffPage from './pages/StaffPage'
import AlgorithmsPage from './pages/AlgorithmsPage'

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0f0e0d' }}>
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'STAFF' ? '/staff' : '/menu'} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'STAFF' ? '/staff' : '/menu'} replace /> : <LoginPage />} />
      <Route path="/menu" element={<PrivateRoute role="STUDENT"><MenuPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute role="STUDENT"><MyOrdersPage /></PrivateRoute>} />
      <Route path="/staff" element={<PrivateRoute role="STAFF"><StaffPage /></PrivateRoute>} />
      <Route path="/algorithms" element={<PrivateRoute><AlgorithmsPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1c1a17', color: '#f0ede8', border: '1px solid #2e2b26' },
          success: { iconTheme: { primary: '#4caf7d', secondary: '#000' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  )
}
