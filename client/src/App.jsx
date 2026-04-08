import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import UserLogin    from './pages/UserLogin'
import AdminLogin   from './pages/AdminLogin'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import MCQTest      from './pages/MCQTest'
import CodingTest   from './pages/CodingTest'
import AdminPanel   from './pages/AdminPanel'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? children : <Navigate to="/login" replace />
}
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
const PublicRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth()
  if (!user) return children
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

const Loader = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
      <p className="text-gray-500 font-mono text-sm tracking-widest">LOADING...</p>
    </div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#e5e7eb',
              border: '1px solid #374151',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px #00000060',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#0b0f0c' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#0b0f0c' } },
            duration: 4000,
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Public */}
          <Route path="/login"       element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
          {/* Protected user */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/test/mcq"    element={<ProtectedRoute><MCQTest /></ProtectedRoute>} />
          <Route path="/test/coding" element={<ProtectedRoute><CodingTest /></ProtectedRoute>} />
          {/* Admin only */}
          <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
