import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import Navbar from '../components/Navbar'

// ─── Reusable sub-components ──────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color = 'text-neon' }) => (
  <div className="card border border-gray-800 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-xs font-mono text-gray-500 uppercase">{label}</p>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  </div>
)

const TabBtn = ({ label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-mono whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
      active
        ? 'border-neon text-neon'
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
    }`}
  >
    {label}
    {badge !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${active ? 'bg-neon/20 text-neon' : 'bg-gray-800 text-gray-500'}`}>
        {badge}
      </span>
    )}
  </button>
)

// ─── MCQ Questions Tab ────────────────────────────────────────────────────────

const MCQTab = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editQ, setEditQ] = useState(null)
  const [form, setForm] = useState({
    questionText: '', options: ['', '', '', ''], correctOption: 0,
    marks: 4, negativeMarks: 1, order: 0
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/mcq/questions')
      setQuestions(res.data.questions)
    } catch { toast.error('Failed to load questions') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 4, negativeMarks: 1, order: 0 })
    setImageFile(null)
    setEditQ(null)
    setShowForm(false)
  }

  const handleEdit = (q) => {
    setEditQ(q)
    setForm({
      questionText: q.questionText,
      options: [...q.options],
      correctOption: q.correctOption,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      order: q.order || 0
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.questionText.trim()) return toast.error('Question text required')
    if (form.options.some(o => !o.trim())) return toast.error('All 4 options required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('questionText', form.questionText)
      fd.append('options', JSON.stringify(form.options))
      fd.append('correctOption', form.correctOption)
      fd.append('marks', form.marks)
      fd.append('negativeMarks', form.negativeMarks)
      fd.append('order', form.order)
      if (imageFile) fd.append('questionImage', imageFile)

      if (editQ) {
        await api.put(`/admin/mcq/questions/${editQ._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Question updated!')
      } else {
        await api.post('/admin/mcq/questions', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Question added!')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/admin/mcq/questions/${id}`)
      toast.success('Deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-textPrimary">MCQ Questions</h2>
          <p className="text-xs text-gray-500 font-mono">{questions.length} questions loaded</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-neon text-sm px-4 py-2">
          + ADD QUESTION
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card neon-border space-y-4">
          <h3 className="font-mono font-bold text-textPrimary text-sm">
            {editQ ? 'Edit Question' : 'New Question'}
          </h3>

          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">Question Text *</label>
            <textarea
              rows={3}
              value={form.questionText}
              onChange={e => setForm({ ...form, questionText: e.target.value })}
              className="input-field resize-none text-sm"
              placeholder="Enter the question..."
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">Question Image (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-neon/40 transition-colors"
            >
              {imageFile
                ? <span className="text-neon text-sm font-mono">{imageFile.name}</span>
                : <span className="text-gray-500 text-sm font-mono">Click to upload image</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => setImageFile(e.target.files[0])} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 block">Options (select correct)</label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, correctOption: i })}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold transition-all ${
                    form.correctOption === i
                      ? 'border-neon bg-neon text-bg'
                      : 'border-gray-600 text-gray-400 hover:border-neon/50'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </button>
                <input
                  value={opt}
                  onChange={e => {
                    const opts = [...form.options]
                    opts[i] = e.target.value
                    setForm({ ...form, options: opts })
                  }}
                  className="input-field text-sm py-2"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Marks</label>
              <input type="number" value={form.marks} min={1}
                onChange={e => setForm({ ...form, marks: +e.target.value })}
                className="input-field text-sm py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Negative Marks</label>
              <input type="number" value={form.negativeMarks} min={0}
                onChange={e => setForm({ ...form, negativeMarks: +e.target.value })}
                className="input-field text-sm py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Order</label>
              <input type="number" value={form.order} min={0}
                onChange={e => setForm({ ...form, order: +e.target.value })}
                className="input-field text-sm py-2" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn-outline text-sm px-4 py-2">CANCEL</button>
            <button onClick={handleSave} disabled={saving} className="btn-neon text-sm px-4 py-2">
              {saving ? 'SAVING...' : editQ ? 'UPDATE' : 'ADD QUESTION'}
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="text-center py-10 text-neon font-mono animate-pulse">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-mono">No questions yet. Add one above.</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q._id} className="card border border-gray-800 hover:border-gray-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-neon bg-neon/10 px-2 py-0.5 rounded">Q{i + 1}</span>
                    <span className="text-xs font-mono text-gray-500">+{q.marks} / -{q.negativeMarks}</span>
                  </div>
                  <p className="text-sm text-textPrimary line-clamp-2">{q.questionText}</p>
                  {q.questionImage && (
                    <span className="text-xs text-blue-400 font-mono mt-1 block">📷 Has image</span>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {q.options.map((opt, oi) => (
                      <span key={oi} className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        oi === q.correctOption
                          ? 'border-neon/50 bg-neon/10 text-neon'
                          : 'border-gray-700 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + oi)}: {opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(q)}
                    className="px-3 py-1.5 text-xs font-mono border border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400 rounded-lg transition-colors">
                    ✎ EDIT
                  </button>
                  <button onClick={() => handleDelete(q._id)}
                    className="px-3 py-1.5 text-xs font-mono border border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400 rounded-lg transition-colors">
                    ✕ DEL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Coding Questions Tab ─────────────────────────────────────────────────────

const CodingTab = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', inputFormat: '', outputFormat: '',
    constraints: '', difficulty: 'Medium', order: 0,
    examples: [{ input: '', output: '', explanation: '' }]
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/coding/questions')
      setQuestions(res.data.questions)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({
      title: '', description: '', inputFormat: '', outputFormat: '',
      constraints: '', difficulty: 'Medium', order: 0,
      examples: [{ input: '', output: '', explanation: '' }]
    })
    setShowForm(false)
  }

  const addExample = () => setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] })
  const updateExample = (i, field, val) => {
    const ex = [...form.examples]
    ex[i] = { ...ex[i], [field]: val }
    setForm({ ...form, examples: ex })
  }

  const handleSave = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required')
    setSaving(true)
    try {
      await api.post('/admin/coding/questions', form)
      toast.success('Problem added!')
      resetForm()
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return
    try {
      await api.delete(`/admin/coding/questions/${id}`)
      toast.success('Deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-textPrimary">Coding Problems</h2>
          <p className="text-xs text-gray-500 font-mono">{questions.length} problems loaded</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-neon text-sm px-4 py-2">
          + ADD PROBLEM
        </button>
      </div>

      {showForm && (
        <div className="card neon-border space-y-4">
          <h3 className="font-mono font-bold text-textPrimary text-sm">New Coding Problem</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-mono text-gray-400 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field text-sm" placeholder="Two Sum" />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                className="input-field text-sm">
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Order</label>
              <input type="number" value={form.order} min={0}
                onChange={e => setForm({ ...form, order: +e.target.value })}
                className="input-field text-sm" />
            </div>
          </div>

          {[
            { key: 'description', label: 'Problem Description *', rows: 5 },
            { key: 'inputFormat', label: 'Input Format *', rows: 3 },
            { key: 'outputFormat', label: 'Output Format *', rows: 3 },
            { key: 'constraints', label: 'Constraints *', rows: 2 }
          ].map(({ key, label, rows }) => (
            <div key={key}>
              <label className="text-xs font-mono text-gray-400 mb-1 block">{label}</label>
              <textarea rows={rows} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="input-field resize-none text-sm font-mono" placeholder={label} />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-gray-400">Examples</label>
              <button onClick={addExample} className="text-xs text-neon hover:underline font-mono">+ Add Example</button>
            </div>
            {form.examples.map((ex, i) => (
              <div key={i} className="bg-bg border border-gray-800 rounded-xl p-4 space-y-3 mb-3">
                <p className="text-xs font-mono text-gray-500">Example {i + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <textarea rows={3} value={ex.input}
                    onChange={e => updateExample(i, 'input', e.target.value)}
                    className="input-field resize-none text-xs font-mono" placeholder="Input" />
                  <textarea rows={3} value={ex.output}
                    onChange={e => updateExample(i, 'output', e.target.value)}
                    className="input-field resize-none text-xs font-mono" placeholder="Output" />
                </div>
                <input value={ex.explanation}
                  onChange={e => updateExample(i, 'explanation', e.target.value)}
                  className="input-field text-sm" placeholder="Explanation (optional)" />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn-outline text-sm px-4 py-2">CANCEL</button>
            <button onClick={handleSave} disabled={saving} className="btn-neon text-sm px-4 py-2">
              {saving ? 'SAVING...' : 'ADD PROBLEM'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-neon font-mono animate-pulse">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-mono">No problems yet.</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q._id} className="card border border-gray-800 hover:border-gray-700 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-neon bg-neon/10 px-2 py-0.5 rounded">P{i + 1}</span>
                    <span className={`text-xs font-mono ${
                      q.difficulty === 'Easy' ? 'text-green-400' :
                      q.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{q.difficulty}</span>
                  </div>
                  <p className="font-mono font-bold text-sm text-textPrimary">{q.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{q.description}</p>
                  <p className="text-xs text-gray-600 font-mono mt-1">{q.examples?.length || 0} examples</p>
                </div>
                <button onClick={() => handleDelete(q._id)}
                  className="px-3 py-1.5 text-xs font-mono border border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400 rounded-lg transition-colors flex-shrink-0">
                  ✕ DEL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Test Config Tab ──────────────────────────────────────────────────────────

const ConfigTab = () => {
  const [config, setConfig] = useState({
    mcqStartTime: '', mcqEndTime: '',
    codingStartTime: '', codingEndTime: '',
    mcqDuration: 45, codingDuration: 45, mcqQuestionCount: 30
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/config').then(res => {
      if (res.data.config) {
        const c = res.data.config
        const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : ''
        setConfig({
          mcqStartTime: fmt(c.mcqStartTime),
          mcqEndTime: fmt(c.mcqEndTime),
          codingStartTime: fmt(c.codingStartTime),
          codingEndTime: fmt(c.codingEndTime),
          mcqDuration: c.mcqDuration || 45,
          codingDuration: c.codingDuration || 45,
          mcqQuestionCount: c.mcqQuestionCount || 30
        })
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/admin/config', config)
      toast.success('Test configuration saved!')
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-10 text-neon font-mono animate-pulse">Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-mono font-bold text-textPrimary">Test Configuration</h2>
        <p className="text-xs text-gray-500 font-mono">Configure start/end times for each round</p>
      </div>

      <div className="card neon-border space-y-5">
        <h3 className="text-sm font-mono font-bold text-neon">📝 MCQ Round</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">Start Time</label>
            <input type="datetime-local" value={config.mcqStartTime}
              onChange={e => setConfig({ ...config, mcqStartTime: e.target.value })}
              className="input-field text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">End Time</label>
            <input type="datetime-local" value={config.mcqEndTime}
              onChange={e => setConfig({ ...config, mcqEndTime: e.target.value })}
              className="input-field text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">Duration (minutes)</label>
            <input type="number" value={config.mcqDuration} min={1}
              onChange={e => setConfig({ ...config, mcqDuration: +e.target.value })}
              className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400 mb-1 block">Question Count</label>
            <input type="number" value={config.mcqQuestionCount} min={1}
              onChange={e => setConfig({ ...config, mcqQuestionCount: +e.target.value })}
              className="input-field text-sm" />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-5">
          <h3 className="text-sm font-mono font-bold text-neon mb-4">💻 Coding Round</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Start Time</label>
              <input type="datetime-local" value={config.codingStartTime}
                onChange={e => setConfig({ ...config, codingStartTime: e.target.value })}
                className="input-field text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">End Time</label>
              <input type="datetime-local" value={config.codingEndTime}
                onChange={e => setConfig({ ...config, codingEndTime: e.target.value })}
                className="input-field text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">Duration (minutes)</label>
              <input type="number" value={config.codingDuration} min={1}
                onChange={e => setConfig({ ...config, codingDuration: +e.target.value })}
                className="input-field text-sm" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-neon text-sm px-6 py-2.5">
          {saving ? 'SAVING...' : '💾 SAVE CONFIGURATION'}
        </button>
      </div>
    </div>
  )
}

// ─── Results Tab ──────────────────────────────────────────────────────────────

const ResultsTab = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('score')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    api.get('/admin/results/mcq')
      .then(res => setResults(res.data.results))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...results].sort((a, b) => {
    let va = a[sortBy] ?? (sortBy === 'score' ? a.score : a[sortBy])
    let vb = b[sortBy] ?? (sortBy === 'score' ? b.score : b[sortBy])
    if (sortBy === 'name') { va = a.userId?.name || ''; vb = b.userId?.name || '' }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const exportCSV = () => {
    const header = 'Name,Scholar Number,Branch,Score,Attempted,Correct,Wrong,Submitted At\n'
    const rows = sorted.map(r =>
      `${r.userId?.name},${r.userId?.scholarNumber},${r.userId?.branch},${r.score},${r.attempted},${r.correct},${r.wrong},${new Date(r.submittedAt).toLocaleString()}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'mcq_results.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  const SortIcon = ({ col }) => (
    <span className={`ml-1 text-xs ${sortBy === col ? 'text-neon' : 'text-gray-600'}`}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  if (loading) return <div className="text-center py-10 text-neon font-mono animate-pulse">Loading results...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-textPrimary">MCQ Results</h2>
          <p className="text-xs text-gray-500 font-mono">{results.length} submissions</p>
        </div>
        <button onClick={exportCSV} className="btn-outline text-sm px-4 py-2">
          ⬇ EXPORT CSV
        </button>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Submissions', value: results.length, color: 'text-neon' },
            { label: 'Avg Score', value: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length), color: 'text-blue-400' },
            { label: 'Top Score', value: Math.max(...results.map(r => r.score)), color: 'text-yellow-400' },
            { label: 'Avg Accuracy', value: `${Math.round(results.reduce((s, r) => s + (r.attempted > 0 ? r.correct / r.attempted * 100 : 0), 0) / results.length)}%`, color: 'text-green-400' }
          ].map((s, i) => (
            <div key={i} className="bg-card border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-mono">No submissions yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                {[
                  { label: '#', col: null },
                  { label: 'Name', col: 'name' },
                  { label: 'Scholar No.', col: null },
                  { label: 'Branch', col: null },
                  { label: 'Score', col: 'score' },
                  { label: 'Attempted', col: 'attempted' },
                  { label: 'Correct', col: 'correct' },
                  { label: 'Wrong', col: 'wrong' },
                  { label: 'Submitted', col: null }
                ].map(({ label, col }) => (
                  <th key={label}
                    onClick={() => col && handleSort(col)}
                    className={`px-4 py-3 text-left text-xs font-mono text-gray-400 uppercase ${col ? 'cursor-pointer hover:text-gray-200' : ''}`}>
                    {label}{col && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i === 0 ? 'bg-neon/5' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-textPrimary">{r.userId?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.userId?.scholarNumber}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">{r.userId?.branch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${r.score >= 0 ? 'text-neon' : 'text-red-400'}`}>{r.score}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-300">{r.attempted}</td>
                  <td className="px-4 py-3 font-mono text-sm text-green-400">{r.correct}</td>
                  <td className="px-4 py-3 font-mono text-sm text-red-400">{r.wrong}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">
                    {new Date(r.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Participants Tab ─────────────────────────────────────────────────────────

const ParticipantsTab = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/participants')
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.scholarNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.branch.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-mono font-bold text-textPrimary">Participants</h2>
          <p className="text-xs text-gray-500 font-mono">{users.length} registered</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, scholar no, branch..."
          className="input-field text-sm max-w-xs"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-neon font-mono animate-pulse">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                {['#', 'Name', 'Email', 'Scholar No.', 'Branch', 'MCQ', 'Coding', 'Registered'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-textPrimary">{u.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{u.scholarNumber}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">{u.branch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${u.mcqSubmitted ? 'bg-neon/10 text-neon' : 'bg-gray-800 text-gray-500'}`}>
                      {u.mcqSubmitted ? '✓ Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${u.codingSubmitted ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                      {u.codingSubmitted ? '✓ Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-mono">No users found.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

const AdminPanel = () => {
  const [tab, setTab] = useState('mcq')
  const [stats, setStats] = useState({ participants: 0, mcqSubmissions: 0, codingSubmissions: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/admin/participants'),
      api.get('/admin/results/mcq'),
      api.get('/admin/results/coding')
    ]).then(([p, m, c]) => {
      setStats({
        participants: p.data.users?.length || 0,
        mcqSubmissions: m.data.results?.length || 0,
        codingSubmissions: c.data.submissions?.length || 0
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <Navbar title="ADMIN PANEL" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-textPrimary">
              <span className="neon-text">⚙</span> Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm font-mono mt-1">Vision CSE Recruitment • Control Panel</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-outline text-xs px-4 py-2">
            ← USER VIEW
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Registered" value={stats.participants} icon="👥" color="text-neon" />
          <StatCard label="MCQ Submitted" value={stats.mcqSubmissions} icon="📝" color="text-blue-400" />
          <StatCard label="Code Submissions" value={stats.codingSubmissions} icon="💻" color="text-yellow-400" />
          <StatCard label="Completion Rate"
            value={stats.participants > 0 ? `${Math.round(stats.mcqSubmissions / stats.participants * 100)}%` : '0%'}
            icon="📊" color="text-green-400" />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6 flex gap-1 overflow-x-auto">
          <TabBtn label="📝 MCQ Questions" active={tab === 'mcq'} onClick={() => setTab('mcq')} />
          <TabBtn label="💻 Coding Problems" active={tab === 'coding'} onClick={() => setTab('coding')} />
          <TabBtn label="⏱ Test Config" active={tab === 'config'} onClick={() => setTab('config')} />
          <TabBtn label="🏆 MCQ Results" active={tab === 'results'} onClick={() => setTab('results')} badge={stats.mcqSubmissions} />
          <TabBtn label="👥 Participants" active={tab === 'participants'} onClick={() => setTab('participants')} badge={stats.participants} />
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {tab === 'mcq' && <MCQTab />}
          {tab === 'coding' && <CodingTab />}
          {tab === 'config' && <ConfigTab />}
          {tab === 'results' && <ResultsTab />}
          {tab === 'participants' && <ParticipantsTab />}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
