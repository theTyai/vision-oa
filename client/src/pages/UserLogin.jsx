import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisionLogo from '../components/VisionLogo'

export default function UserLogin() {
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
      if (res.data.user.role === 'admin') {
        setError('Use the Admin Login page for admin accounts.')
        return
      }
      login(res.data.token, res.data.user)
      toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f0c] flex">

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d1f12 0%, #0b1a10 50%, #091508 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#00ff8812 1px, transparent 1px), linear-gradient(90deg, #00ff8812 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00ff8815 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b08 0%, transparent 65%)' }} />

        {/* Top logo */}
        <VisionLogo size="md" className="relative z-10" />

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Vision CSE<br />
              <span style={{ color: '#00ff88', textShadow: '0 0 30px #00ff8860' }}>
                Recruitment
              </span>
            </h1>
            <p className="text-gray-400 mt-4 text-base leading-relaxed max-w-xs">
              Online Assessment Platform for selecting the brightest minds in Computer Science.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📝', title: 'MCQ Round', desc: '30 questions · +4/−1 scoring · 45 min' },
              { icon: '💻', title: 'Coding Round', desc: '3 problems · Monaco editor · C/C++/Python/JS' },
              { icon: '🔒', title: 'Proctored', desc: 'Tab detection · Auto-submit on timer' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: '#00ff8810', border: '1px solid #00ff8820' }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-xs text-gray-600 font-mono relative z-10">
          © Vision CSE Department · Recruitment 2024
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <VisionLogo size="lg" />
        </div>

        <div className="w-full max-w-md animate-fade-in">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white font-mono">Candidate Login</h2>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to access your assessment portal
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
              <label className="input-label">Email Address</label>
              <input
                type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                autoComplete="email" autoFocus
              />
            </div>

            <div>
              <label className="input-label">Password</label>
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

            <button type="submit" disabled={loading} className="btn-neon w-full py-3.5 text-sm">
              {loading ? <><Spinner /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
            <p className="text-sm text-gray-500 text-center">
              New candidate?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#00ff88' }}>
                Create account
              </Link>
            </p>
            <p className="text-xs text-gray-600 text-center font-mono">
              Are you an admin?{' '}
              <Link to="/admin/login" className="text-yellow-500 hover:underline">
                Admin Login →
              </Link>
            </p>
          </div>
        </div>
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
