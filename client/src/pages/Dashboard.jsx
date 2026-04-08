import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import VisionLogo from '../components/VisionLogo'

// ── Countdown display ─────────────────────────────────────────────────────────
const Countdown = ({ targetTime, label }) => {
  const [diff, setDiff] = useState(Math.max(0, new Date(targetTime) - Date.now()))

  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, new Date(targetTime) - Date.now())), 1000)
    return () => clearInterval(id)
  }, [targetTime])

  if (diff === 0) return <span className="text-neon font-mono text-sm font-bold">LIVE NOW</span>

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const units = []
  if (d > 0) units.push({ v: d, u: 'd' })
  units.push({ v: h, u: 'h' }, { v: m, u: 'm' }, { v: s, u: 's' })

  return (
    <div className="flex items-center gap-1">
      {units.map(({ v, u }) => (
        <div key={u} className="flex items-baseline gap-0.5">
          <span className="text-neon font-mono font-bold text-sm tabular-nums"
            style={{ textShadow: '0 0 10px #00ff8860' }}>
            {String(v).padStart(2, '0')}
          </span>
          <span className="text-gray-600 font-mono text-xs">{u}</span>
        </div>
      ))}
    </div>
  )
}

// ── Test status card ──────────────────────────────────────────────────────────
const TestCard = ({ type, icon, title, meta, startTime, endTime, submitted, onStart }) => {
  const now = Date.now()
  const start = startTime ? new Date(startTime) : null
  const end   = endTime   ? new Date(endTime)   : null

  const isLive     = start && end && now >= start && now <= end
  const isUpcoming = start && now < start
  const isOver     = end && now > end

  const statusLabel = submitted ? 'Completed'
    : isLive     ? 'Live'
    : isUpcoming ? 'Upcoming'
    : isOver     ? 'Ended'
    : 'Scheduled'

  const StatusDot = () => {
    if (submitted) return <span className="dot-done" />
    if (isLive)    return <span className="dot-live" />
    if (isOver)    return <span className="dot-off" />
    return <span className="dot-soon" />
  }

  const canStart = isLive && !submitted

  const fmtTime = d => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  }) : '—'

  return (
    <div className={`card flex flex-col gap-5 transition-all duration-200 ${
      canStart ? 'neon-border hover:shadow-[0_8px_40px_#00ff8815]' : 'border-gray-800/60'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: canStart ? '#00ff8810' : '#1f2937', border: `1px solid ${canStart ? '#00ff8830' : '#374151'}` }}>
            {icon}
          </div>
          <div>
            <h3 className="font-mono font-bold text-base text-textPrimary">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusDot />
          <span className={`text-xs font-mono ${
            submitted ? 'text-neon' : isLive ? 'text-yellow-400' : isOver ? 'text-gray-600' : 'text-blue-400'
          }`}>{statusLabel}</span>
        </div>
      </div>

      {/* Time info */}
      {startTime && (
        <div className="grid grid-cols-2 gap-2">
          {[['Start', fmtTime(startTime)], ['End', fmtTime(endTime)]].map(([label, val]) => (
            <div key={label} className="bg-[#0b0f0c] rounded-lg px-3 py-2.5 border border-gray-800">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xs text-gray-300 font-mono leading-snug">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Live countdown */}
      {isUpcoming && startTime && (
        <div className="flex items-center justify-between bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-wide">Starts in</span>
          <Countdown targetTime={startTime} />
        </div>
      )}
      {isLive && !submitted && (
        <div className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3">
          <span className="text-xs font-mono text-yellow-400 uppercase tracking-wide">Time remaining</span>
          <Countdown targetTime={endTime} />
        </div>
      )}
      {submitted && (
        <div className="flex items-center gap-2 bg-neon/5 border border-neon/20 rounded-lg px-4 py-3">
          <span className="text-neon text-base">✓</span>
          <span className="text-xs font-mono text-neon">Submitted successfully — results pending admin review</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full py-3 rounded-xl font-mono font-bold text-sm transition-all ${
          canStart ? 'btn-neon' : 'bg-[#0e1512] text-gray-600 border border-gray-800 cursor-not-allowed'
        }`}
      >
        {submitted ? '✓ Submitted'
          : isOver   ? 'Test has ended'
          : isLive   ? 'Start Test →'
          : start    ? 'Not available yet'
          : 'Awaiting Schedule'}
      </button>
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, refreshUser } = useAuth()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        await refreshUser()
        const res = await api.get('/admin/config')
        setConfig(res.data.config)
      } catch { /* config may not exist yet */ }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
        <p className="text-gray-500 font-mono text-sm">Loading portal...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg grid-bg">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 stagger">
          <div className="animate-fade-in">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary">
              {user?.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">{user?.branch} · {user?.scholarNumber}</p>
          </div>
          <div className="animate-fade-in flex items-center gap-3">
            <div className="bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-right">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Recruitment</p>
              <p className="text-neon font-mono font-bold text-sm mt-0.5">Vision CSE 2024</p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-8 flex items-start gap-3 bg-[#111827] border border-gray-800 rounded-xl p-4 animate-fade-in">
          <span className="text-xl mt-0.5">📋</span>
          <div>
            <p className="text-sm font-semibold text-textPrimary mb-1">Assessment Instructions</p>
            <ul className="text-xs text-gray-400 space-y-1 leading-relaxed list-disc list-inside">
              <li>Complete both MCQ and Coding rounds before the deadline.</li>
              <li>MCQ: 30 questions, 45 minutes. Scoring: +4 correct, −1 wrong.</li>
              <li>Coding: 3 problems, 45 minutes. Monaco editor with C, C++, Python, JS.</li>
              <li>Results are reviewed exclusively by the admin panel — not visible to candidates.</li>
              <li>Switching tabs or exiting fullscreen is monitored and may trigger auto-submission.</li>
            </ul>
          </div>
        </div>

        {/* Test cards */}
        <div className="grid md:grid-cols-2 gap-5 stagger">
          <div className="animate-fade-in">
            <TestCard
              type="mcq" icon="📝" title="MCQ Round"
              meta="30 questions · 45 minutes · +4 / −1 scoring"
              startTime={config?.mcqStartTime}
              endTime={config?.mcqEndTime}
              submitted={user?.mcqSubmitted}
              onStart={() => { if (!user.mcqSubmitted) navigate('/test/mcq') }}
            />
          </div>
          <div className="animate-fade-in">
            <TestCard
              type="coding" icon="💻" title="Coding Round"
              meta="3 problems · 45 minutes · Monaco editor"
              startTime={config?.codingStartTime}
              endTime={config?.codingEndTime}
              submitted={user?.codingSubmitted}
              onStart={() => { if (!user.codingSubmitted) navigate('/test/coding') }}
            />
          </div>
        </div>

        {/* Info row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
          {[
            { icon: '💾', title: 'Auto-Save', desc: 'MCQ answers saved every 30s automatically' },
            { icon: '🔒', title: 'Proctored', desc: 'Tab switching detected · Fullscreen recommended' },
            { icon: '📊', title: 'Admin Results', desc: 'Scores evaluated server-side, admin-only view' }
          ].map((item, i) => (
            <div key={i} className="flex gap-3 bg-[#111827] border border-gray-800 rounded-xl p-4 animate-fade-in">
              <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-textPrimary">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Dashboard
