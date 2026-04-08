import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisionLogo from '../components/VisionLogo'

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => { setError(''); setForm(p => ({ ...p, [k]: v })) }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in both fields.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      if (res.data.user.role !== 'admin') {
        setError('Access denied. This login is for administrators only.')
        return
      }
      login(res.data.token, res.data.user)
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c09] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background pattern */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(#f59e0b08 1px, transparent 1px), linear-gradient(90deg, #f59e0b08 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #f59e0b08 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md animate-fade-in">

        {/* Admin badge */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <VisionLogo size="lg" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-mono text-yellow-400 tracking-widest uppercase">
                Administrator Access
              </span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: '#0f1a10',
            border: '1px solid #f59e0b20',
            boxShadow: '0 25px 60px #00000080, 0 0 0 1px #f59e0b10, 0 0 80px #f59e0b08'
          }}>

          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold text-white">Admin Panel Login</h2>
            <p className="text-sm text-gray-500 mt-1">
              Restricted access — authorised personnel only
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 animate-fade-in"
              style={{ background: '#ef444415', border: '1px solid #ef444435' }}>
              <span className="text-red-400 text-base flex-shrink-0">⚠</span>
              <p className="text-sm text-red-400 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="input-label" style={{ color: '#f59e0b99' }}>Admin Email</label>
              <input
                type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input-field"
                style={{ '--tw-ring-color': '#f59e0b40' }}
                placeholder="admin@visioncse.com"
                autoComplete="email" autoFocus
              />
            </div>

            <div>
              <label className="input-label" style={{ color: '#f59e0b99' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="input-field pr-16"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors select-none">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-mono font-bold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? '#92400e60' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0b0f0c',
                boxShadow: loading ? 'none' : '0 4px 20px #f59e0b30',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <><Spinner />Verifying...</> : '⚙ Enter Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-600 font-mono text-center">
              Not an admin?{' '}
              <Link to="/login" className="text-neon hover:underline">
                Candidate Login →
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs font-mono mt-6">
          © Vision CSE · Admin Portal · Authorised Use Only
        </p>
      </div>
    </div>
  )
}

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)
