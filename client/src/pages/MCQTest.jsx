import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import Timer from '../components/Timer'
import QuestionNavigator from '../components/QuestionNavigator'
import VisionLogo from '../components/VisionLogo'

const MCQTest = () => {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [duration] = useState(45 * 60)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const navigate = useNavigate()
  const saveIntervalRef = useRef(null)
  const tabWarningsRef = useRef(0)

  // Anti-cheat: Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        tabWarningsRef.current++
        toast.error(`⚠ Tab switch detected! Warning ${tabWarningsRef.current}/3`, { duration: 4000 })
        if (tabWarningsRef.current >= 3) {
          toast.error('Auto-submitting due to multiple tab violations!', { duration: 5000 })
          setTimeout(() => submitMCQ(true), 2000)
        }
      }
    }

    const handleContextMenu = (e) => e.preventDefault()
    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) e.preventDefault()
      if (e.ctrlKey && ['c', 'v', 'u', 'a'].includes(e.key)) e.preventDefault()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [submitted])

  // Fetch questions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/mcq/questions')
        setQuestions(res.data.questions)
        if (res.data.savedAnswers) {
          setAnswers(res.data.savedAnswers)
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load questions')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (questions.length === 0) return
    saveIntervalRef.current = setInterval(() => {
      if (!submitted) saveAnswers()
    }, 30000)
    return () => clearInterval(saveIntervalRef.current)
  }, [answers, questions, submitted])

  const saveAnswers = async () => {
    try {
      await api.post('/mcq/save', { answers })
    } catch { /* silent fail */ }
  }

  const handleAnswer = (qId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }))
  }

  const submitMCQ = useCallback(async (auto = false) => {
    if (submitted || submitting) return
    setSubmitting(true)
    try {
      await api.post('/mcq/submit', { answers })
      setSubmitted(true)
      toast.success(auto ? 'Time up! MCQ submitted automatically.' : 'MCQ submitted successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
      setSubmitting(false)
    }
  }, [answers, submitted, submitting])

  const handleTimerExpire = () => submitMCQ(true)

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.()
    setIsFullscreen(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-neon font-mono animate-pulse text-lg">[ LOADING QUESTIONS... ]</div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-mono neon-text font-bold mb-2">MCQ SUBMITTED</h2>
        <p className="text-gray-400 font-mono">Redirecting to dashboard...</p>
      </div>
    </div>
  )

  const q = questions[current]
  const answeredCount = Object.values(answers).filter(v => v !== undefined && v !== -1).length

  return (
    <div className="min-h-screen bg-bg flex flex-col select-none" onContextMenu={e => e.preventDefault()}>
      {/* Top Bar */}
      <div className="bg-card border-b border-gray-800 sticky top-0 z-40 px-4 py-3"
        style={{ boxShadow: '0 2px 20px #00ff8810' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <VisionLogo size="sm" />

          <div className="flex flex-col items-center">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">MCQ Round</span>
            <span className="text-sm font-mono text-textPrimary">
              Q{current + 1} / {questions.length}
            </span>
          </div>

          <Timer durationSeconds={duration} onExpire={handleTimerExpire} />
        </div>

        {/* Progress bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon to-accent transition-all duration-500"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Fullscreen Warning */}
      {!isFullscreen && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between">
          <span className="text-yellow-400 text-xs font-mono">⚠ Fullscreen mode recommended for best experience</span>
          <button onClick={enterFullscreen} className="text-xs btn-outline py-1 px-3">
            ENTER FULLSCREEN
          </button>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Question Area */}
        <div className="flex-1 flex flex-col gap-5">
          {q && (
            <div className="card neon-border animate-fade-in flex-1">
              {/* Question header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                <div className="w-9 h-9 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center">
                  <span className="text-neon font-mono font-bold text-sm">{current + 1}</span>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-500 uppercase">Question {current + 1} of {questions.length}</span>
                  {answers[q._id] !== undefined && answers[q._id] !== -1 && (
                    <span className="ml-2 text-xs font-mono text-neon">✓ Answered</span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <p className="text-textPrimary text-base leading-relaxed mb-5 font-sans">
                {q.questionText}
              </p>

              {/* Question image */}
              {q.questionImage && (
                <div className="mb-5 rounded-lg overflow-hidden border border-gray-700">
                  <img src={q.questionImage} alt="Question" className="max-w-full max-h-64 object-contain mx-auto" />
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q._id] === i
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(q._id, i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'border-neon bg-neon/10 text-textPrimary shadow-[0_0_15px_#00ff8820]'
                          : 'border-gray-700 bg-bg hover:border-gray-500 text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-neon bg-neon' : 'border-gray-600'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-bg" />}
                      </div>
                      <span className="font-mono text-xs text-gray-500 flex-shrink-0">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Clear button */}
              {answers[q._id] !== undefined && answers[q._id] !== -1 && (
                <button
                  onClick={() => {
                    const newAns = { ...answers }
                    delete newAns[q._id]
                    setAnswers(newAns)
                  }}
                  className="mt-4 text-xs text-gray-500 hover:text-red-400 font-mono transition-colors"
                >
                  ✕ Clear Response
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="btn-outline px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span>{answeredCount}/{questions.length} answered</span>
            </div>

            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                className="btn-neon px-5 py-2 text-sm"
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="btn-neon px-5 py-2 text-sm"
                style={{ background: '#22c55e' }}
              >
                SUBMIT TEST
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Navigator */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="card neon-border sticky top-28">
            <h3 className="text-xs font-mono text-gray-400 uppercase mb-4">Question Navigator</h3>
            <QuestionNavigator
              total={questions.length}
              current={current}
              answers={Object.fromEntries(questions.map((q, i) => [i, answers[q._id]]))}
              onNavigate={setCurrent}
            />
            <div className="mt-5 pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="btn-neon w-full text-sm py-2.5"
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT MCQ'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="card neon-border max-w-md w-full animate-slide-in">
            <h3 className="text-xl font-mono font-bold text-textPrimary mb-2">Confirm Submission</h3>
            <p className="text-gray-400 text-sm mb-5">
              You have answered <span className="text-neon font-bold">{answeredCount}</span> out of{' '}
              <span className="text-neon font-bold">{questions.length}</span> questions.
              <br />
              <span className="text-yellow-400 text-xs mt-1 block">⚠ This action cannot be undone.</span>
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm font-mono mb-5">
              <div className="bg-bg rounded-lg p-3 text-center border border-gray-800">
                <div className="text-neon font-bold text-lg">{answeredCount}</div>
                <div className="text-gray-500 text-xs">Attempted</div>
              </div>
              <div className="bg-bg rounded-lg p-3 text-center border border-gray-800">
                <div className="text-yellow-400 font-bold text-lg">{questions.length - answeredCount}</div>
                <div className="text-gray-500 text-xs">Skipped</div>
              </div>
              <div className="bg-bg rounded-lg p-3 text-center border border-gray-800">
                <div className="text-blue-400 font-bold text-lg">
                  {answeredCount * 4 - (0)}
                </div>
                <div className="text-gray-500 text-xs">Max Score</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="btn-outline flex-1 py-2.5 text-sm">
                CANCEL
              </button>
              <button onClick={() => { setShowConfirm(false); submitMCQ() }}
                disabled={submitting}
                className="btn-neon flex-1 py-2.5 text-sm">
                {submitting ? 'SUBMITTING...' : 'CONFIRM SUBMIT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MCQTest
