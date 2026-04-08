import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VisionLogo from './VisionLogo'

const Navbar = ({ subtitle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate(user.role==='admin' ? '/admin/login' : '/login') }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <header className="sticky top-0 z-50 bg-[#0e1512]/95 backdrop-blur-md border-b border-gray-800/60"
      style={{ boxShadow: '0 1px 0 #00ff8810' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="flex-shrink-0">
            <VisionLogo size="sm" />
          </button>
          {subtitle && (
            <>
              <span className="text-gray-700 hidden sm:block">|</span>
              <span className="text-xs font-mono text-gray-500 truncate hidden sm:block tracking-wide">
                {subtitle}
              </span>
            </>
          )}
        </div>

        {/* Center pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0b0f0c] border border-gray-800 rounded-full px-4 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">
            Vision CSE Recruitment Test
          </span>
        </div>

        {/* Right: user menu */}
        {user && (
          <div className="relative flex-shrink-0" ref={ref}>
            <button onClick={() => setOpen(p => !p)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full border border-gray-800 hover:border-gray-700 bg-[#0e1512] transition-all">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00ff8820, #00ff8840)', color: '#00ff88', border: '1px solid #00ff8830' }}>
                {initials}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-semibold text-gray-200 leading-none truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] font-mono text-gray-500 leading-none mt-0.5">{user.branch} · {user.scholarNumber}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-slide-down z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-800 bg-[#0e1512]">
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-0.5">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-200 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="badge badge-neon">{user.branch}</span>
                    {user.role === 'admin' && <span className="badge badge-yellow">Admin</span>}
                  </div>
                </div>

                {/* Links */}
                <div className="py-1">
                  {location.pathname !== '/dashboard' && (
                    <MenuItem icon="⊞" label="Dashboard" onClick={() => { navigate('/dashboard'); setOpen(false) }} />
                  )}
                  {user.role === 'admin' && (
                    <MenuItem icon="⚙" label="Admin Panel" onClick={() => { navigate('/admin'); setOpen(false) }} />
                  )}
                </div>

                {/* Status */}
                <div className="px-4 py-2 border-t border-gray-800 border-b space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">MCQ Round</span>
                    <span className={`badge ${user.mcqSubmitted ? 'badge-neon' : 'badge-gray'} text-[10px]`}>
                      {user.mcqSubmitted ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">Coding Round</span>
                    <span className={`badge ${user.codingSubmitted ? 'badge-neon' : 'badge-gray'} text-[10px]`}>
                      {user.codingSubmitted ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <div className="py-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <span className="text-base">⏻</span>
                    <span className="font-mono text-xs">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

const MenuItem = ({ icon, label, onClick }) => (
  <button onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors">
    <span className="text-base text-gray-500">{icon}</span>
    <span className="font-mono text-xs">{label}</span>
  </button>
)

export default Navbar
