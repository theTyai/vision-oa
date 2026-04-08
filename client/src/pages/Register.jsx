import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisionLogo from '../components/VisionLogo'

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other']

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', scholarNumber:'', branch:'CSE', password:'', confirmPassword:'' })
  const [errors, setErrors] = useState({})
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => { setErrors(p=>({...p,[k]:''})); setError(''); setForm(p=>({...p,[k]:v})) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                      e.name = 'Full name required'
    if (!form.email.includes('@'))               e.email = 'Valid email required'
    if (!form.scholarNumber.trim())              e.scholarNumber = 'Scholar number required'
    if (form.password.length < 6)               e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)  e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      login(res.data.token, res.data.user)
      toast.success('Account created! Welcome.')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f0c] flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d1f12, #091508)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#00ff8812 1px,transparent 1px),linear-gradient(90deg,#00ff8812 1px,transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,#00ff8812 0%,transparent 65%)' }} />

        <VisionLogo size="md" className="relative z-10" />

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Join the<br />
              <span style={{ color: '#00ff88', textShadow: '0 0 20px #00ff8860' }}>Assessment</span>
            </h1>
            <p className="text-gray-400 mt-3 text-sm leading-relaxed max-w-xs">
              Register to participate in Vision CSE Recruitment. Complete both rounds to be considered.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Scholar Number', desc: 'Your university roll number' },
              { label: 'Branch', desc: 'CSE, IT, ECE and more' },
              { label: 'Secure Account', desc: 'JWT protected, bcrypt hashed' },
            ].map(i => (
              <div key={i.label} className="flex items-center gap-2">
                <span className="text-neon text-lg">✓</span>
                <div>
                  <p className="text-sm font-semibold text-gray-300">{i.label}</p>
                  <p className="text-xs text-gray-600">{i.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 font-mono relative z-10">© Vision CSE Department · 2024</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in">

          <div className="lg:hidden mb-8 flex justify-center"><VisionLogo size="lg" /></div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white font-mono">Create Account</h2>
            <p className="text-sm text-gray-400 mt-1">Fill in your details to register as a candidate</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 animate-fade-in"
              style={{ background: '#ef444415', border: '1px solid #ef444435' }}>
              <span className="text-red-400">⚠</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label className="input-label">Full Name</label>
              <input value={form.name} onChange={e=>set('name',e.target.value)}
                className={`input-field ${errors.name?'border-red-500/50':''}`}
                placeholder="Rahul Sharma" autoFocus />
              {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                className={`input-field ${errors.email?'border-red-500/50':''}`}
                placeholder="you@university.edu" autoComplete="email" />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-mono">{errors.email}</p>}
            </div>

            {/* Scholar + Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Scholar Number</label>
                <input value={form.scholarNumber} onChange={e=>set('scholarNumber',e.target.value)}
                  className={`input-field font-mono text-sm ${errors.scholarNumber?'border-red-500/50':''}`}
                  placeholder="0801CS211001" />
                {errors.scholarNumber && <p className="text-red-400 text-xs mt-1 font-mono">{errors.scholarNumber}</p>}
              </div>
              <div>
                <label className="input-label">Branch</label>
                <select value={form.branch} onChange={e=>set('branch',e.target.value)}
                  className="input-field appearance-none cursor-pointer">
                  {BRANCHES.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input type={showPass?'text':'password'} value={form.password}
                    onChange={e=>set('password',e.target.value)}
                    className={`input-field pr-14 ${errors.password?'border-red-500/50':''}`}
                    placeholder="Min. 6 chars" autoComplete="new-password" />
                  <button type="button" onClick={()=>setShowPass(p=>!p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 hover:text-gray-300 select-none">
                    {showPass?'HIDE':'SHOW'}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 font-mono">{errors.password}</p>}
              </div>
              <div>
                <label className="input-label">Confirm Password</label>
                <input type={showPass?'text':'password'} value={form.confirmPassword}
                  onChange={e=>set('confirmPassword',e.target.value)}
                  className={`input-field ${errors.confirmPassword?'border-red-500/50':''}`}
                  placeholder="Repeat" autoComplete="new-password" />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 font-mono">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-neon w-full py-3.5 text-sm mt-1">
              {loading ? <><Spinner />Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color:'#00ff88' }}>Sign in</Link>
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
