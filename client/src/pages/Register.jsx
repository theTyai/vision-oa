import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisionLogo from '../components/VisionLogo'

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other']

const Field = ({ label, error, children }) => (
  <div>
    <label className="input-label">{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs font-mono mt-1">{error}</p>}
  </div>
)

const Register = () => {
  const [form, setForm] = useState({ name:'', email:'', scholarNumber:'', branch:'CSE', password:'', confirmPassword:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name = 'Full name is required'
    if (!form.email.includes('@'))  e.email = 'Valid email required'
    if (!form.scholarNumber.trim()) e.scholarNumber = 'Scholar number is required'
    if (form.password.length < 6)   e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      login(res.data.token, res.data.user)
      toast.success('Account created! Welcome.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00ff8830 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">

        <div className="flex flex-col items-center mb-8 gap-2">
          <VisionLogo size="lg" />
          <p className="text-xs font-mono text-gray-500 tracking-widest uppercase">Create Your Account</p>
        </div>

        <div className="card" style={{ border: '1px solid #1f2937', boxShadow: '0 25px 60px #00000060, 0 0 0 1px #00ff8810' }}>

          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold text-textPrimary">Register</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to join the assessment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={errors.name}>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-red-500/50' : ''}`}
                placeholder="Rahul Sharma" />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={`input-field ${errors.email ? 'border-red-500/50' : ''}`}
                placeholder="rahul@university.edu" autoComplete="email" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Scholar Number" error={errors.scholarNumber}>
                <input value={form.scholarNumber} onChange={e => set('scholarNumber', e.target.value)}
                  className={`input-field font-mono text-sm ${errors.scholarNumber ? 'border-red-500/50' : ''}`}
                  placeholder="0801CS211001" />
              </Field>

              <Field label="Branch">
                <select value={form.branch} onChange={e => set('branch', e.target.value)}
                  className="input-field appearance-none cursor-pointer">
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className={`input-field pr-12 ${errors.password ? 'border-red-500/50' : ''}`}
                    placeholder="Min. 6 chars" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-mono">
                    {showPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" error={errors.confirmPassword}>
                <input type={showPass ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                  placeholder="Repeat password" autoComplete="new-password" />
              </Field>
            </div>

            <button type="submit" disabled={loading} className="btn-neon w-full py-3 mt-2">
              {loading ? <><SpinIcon />Creating account...</> : 'Create Account'}
            </button>
          </form>

          <hr className="divider mt-6" />
          <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="text-neon hover:underline font-semibold">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs font-mono mt-6 tracking-wide">
          © Vision CSE • Recruitment Assessment Platform
        </p>
      </div>
    </div>
  )
}

const SpinIcon = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)

export default Register
