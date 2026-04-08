import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisionLogo from '../components/VisionLogo'

// ── helpers ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)

const TabBtn = ({ label, icon, active, onClick, badge }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-mono whitespace-nowrap border-b-2 transition-all ${
      active ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'
    }`}>
    <span>{icon}</span>{label}
    {badge != null && (
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active?'bg-yellow-400/20 text-yellow-400':'bg-gray-800 text-gray-500'}`}>
        {badge}
      </span>
    )}
  </button>
)

const Stat = ({ label, value, icon, color='text-neon' }) => (
  <div className="rounded-xl p-5 flex items-center gap-4" style={{background:'#111827',border:'1px solid #1f2937'}}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-mono font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  </div>
)

// ── MCQ Questions Tab ─────────────────────────────────────────────────────────
function MCQTab() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editQ, setEditQ]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef()

  const blank = { questionText:'', options:['','','',''], correctOption:0, marks:4, negativeMarks:1, order:0 }
  const [form, setForm] = useState(blank)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/admin/mcq/questions'); setQuestions(r.data.questions) }
    catch { toast.error('Failed to load questions') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(blank); setEditQ(null); setImageFile(null); setImagePreview(null); setShowForm(true) }
  const openEdit = q => {
    setForm({ questionText:q.questionText, options:[...q.options], correctOption:q.correctOption, marks:q.marks, negativeMarks:q.negativeMarks, order:q.order||0 })
    setEditQ(q); setImageFile(null)
    setImagePreview(q.questionImage ? `http://localhost:5000${q.questionImage}` : null)
    setShowForm(true)
  }
  const cancel = () => { setShowForm(false); setEditQ(null); setImagePreview(null); setImageFile(null) }

  const handleImage = e => {
    const f = e.target.files[0]; if (!f) return
    setImageFile(f)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleSave = async () => {
    if (!form.questionText.trim()) return toast.error('Question text is required')
    if (form.options.some(o => !o.trim())) return toast.error('All 4 options are required')
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
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editQ) { await api.put(`/admin/mcq/questions/${editQ._id}`, fd, cfg); toast.success('Question updated!') }
      else       { await api.post('/admin/mcq/questions', fd, cfg);              toast.success('Question added!') }
      cancel(); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this question?')) return
    try { await api.delete(`/admin/mcq/questions/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">MCQ Questions</h2>
          <p className="text-xs text-gray-500 font-mono">{questions.length} questions · Scoring +4 / −1</p>
        </div>
        <button onClick={openAdd} className="btn-neon text-sm px-4 py-2">+ Add Question</button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-5 animate-fade-in"
          style={{ background:'#0f1a10', border:'1px solid #00ff8825' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-white text-sm">
              {editQ ? '✎ Edit Question' : '+ New Question'}
            </h3>
            <button onClick={cancel} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
          </div>

          {/* Question text */}
          <div>
            <label className="input-label">Question Text *</label>
            <textarea rows={3} value={form.questionText}
              onChange={e => setForm(p=>({...p, questionText:e.target.value}))}
              className="input-field resize-none text-sm"
              placeholder="Enter your question here..." />
          </div>

          {/* Image upload */}
          <div>
            <label className="input-label">Question Image (optional)</label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-6"
                style={{ border:'2px dashed #374151', background:'#0b0f0c' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#00ff8840'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#374151'}
              >
                <span className="text-2xl">📷</span>
                <p className="text-xs text-gray-500 font-mono text-center">
                  {imageFile ? imageFile.name : 'Click to upload image\nPNG, JPG, GIF up to 5MB'}
                </p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>
              {imagePreview && (
                <div className="relative flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-40 h-28 object-cover rounded-xl border border-gray-700" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600">
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="input-label">Options — click letter to set correct answer</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm(p=>({...p, correctOption:i}))}
                    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm transition-all"
                    style={form.correctOption===i
                      ? { background:'#00ff88', color:'#0b0f0c', boxShadow:'0 0 12px #00ff8860' }
                      : { background:'#1f2937', color:'#6b7280', border:'1px solid #374151' }}>
                    {String.fromCharCode(65+i)}
                  </button>
                  <input value={opt}
                    onChange={e => { const o=[...form.options]; o[i]=e.target.value; setForm(p=>({...p,options:o})) }}
                    className="input-field text-sm py-2.5"
                    placeholder={`Option ${String.fromCharCode(65+i)}`} />
                  {form.correctOption===i && (
                    <span className="text-xs font-mono text-neon flex-shrink-0 flex items-center gap-1">
                      <span className="text-base">✓</span> Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-mono mt-2">
              Correct answer: Option {String.fromCharCode(65+form.correctOption)} · +{form.marks} marks · −{form.negativeMarks} for wrong
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            {[['Marks (+)', 'marks'], ['Negative (−)', 'negativeMarks'], ['Display Order', 'order']].map(([label, key]) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input type="number" min={0} value={form[key]}
                  onChange={e => setForm(p=>({...p,[key]:+e.target.value}))}
                  className="input-field text-sm" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={cancel} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-neon flex-1 py-2.5 text-sm">
              {saving ? <><Spinner />{editQ?'Updating...':'Adding...'}</> : editQ ? '✓ Update Question' : '+ Add Question'}
            </button>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="text-center py-16 text-neon font-mono animate-pulse">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-gray-600 font-mono">
          <p className="text-4xl mb-3">📭</p>
          <p>No questions yet. Add your first question above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q._id} className="rounded-xl p-4 flex items-start gap-4 transition-all group"
              style={{ background:'#111827', border:'1px solid #1f2937' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#374151'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1f2937'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs"
                style={{ background:'#00ff8810', color:'#00ff88', border:'1px solid #00ff8820' }}>
                {i+1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-snug">{q.questionText}</p>
                {q.questionImage && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-blue-400 font-mono">📷 Image attached</span>
                    <img src={`http://localhost:5000${q.questionImage}`} alt="" className="h-8 w-12 object-cover rounded border border-gray-700" />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {q.options.map((opt, oi) => (
                    <span key={oi} className="text-xs font-mono px-2 py-1 rounded-lg"
                      style={oi===q.correctOption
                        ? { background:'#00ff8815', color:'#00ff88', border:'1px solid #00ff8830' }
                        : { background:'#1f2937', color:'#6b7280', border:'1px solid #374151' }}>
                      {String.fromCharCode(65+oi)}: {opt.length>28?opt.slice(0,28)+'…':opt}
                      {oi===q.correctOption && ' ✓'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>openEdit(q)}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg transition-colors"
                  style={{ background:'#1f2937', color:'#9ca3af', border:'1px solid #374151' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#3b82f615';e.currentTarget.style.color='#60a5fa'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#1f2937';e.currentTarget.style.color='#9ca3af'}}>
                  ✎ Edit
                </button>
                <button onClick={()=>handleDelete(q._id)}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg transition-colors"
                  style={{ background:'#1f2937', color:'#9ca3af', border:'1px solid #374151' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#ef444415';e.currentTarget.style.color='#f87171'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#1f2937';e.currentTarget.style.color='#9ca3af'}}>
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Coding Tab ────────────────────────────────────────────────────────────────
function CodingTab() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const blank = { title:'', description:'', inputFormat:'', outputFormat:'', constraints:'', difficulty:'Medium', order:0, examples:[{input:'',output:'',explanation:''}] }
  const [form, setForm] = useState(blank)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/admin/coding/questions'); setQuestions(r.data.questions) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const addEx = () => setForm(p=>({...p, examples:[...p.examples,{input:'',output:'',explanation:''}]}))
  const setEx = (i,k,v) => { const ex=[...form.examples]; ex[i]={...ex[i],[k]:v}; setForm(p=>({...p,examples:ex})) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description required')
    setSaving(true)
    try {
      await api.post('/admin/coding/questions', form)
      toast.success('Problem added!')
      setShowForm(false); setForm(blank); load()
    } catch(err) { toast.error(err.response?.data?.message||'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this problem?')) return
    try { await api.delete(`/admin/coding/questions/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const diffColor = d => d==='Easy'?'text-green-400':d==='Medium'?'text-yellow-400':'text-red-400'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">Coding Problems</h2>
          <p className="text-xs text-gray-500 font-mono">{questions.length} problems loaded</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="btn-neon text-sm px-4 py-2">+ Add Problem</button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 space-y-4 animate-fade-in"
          style={{ background:'#0f1a10', border:'1px solid #00ff8825' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-white text-sm">New Coding Problem</h3>
            <button onClick={()=>{setShowForm(false);setForm(blank)}} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="input-label">Title *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="input-field text-sm" placeholder="Two Sum" />
            </div>
            <div>
              <label className="input-label">Difficulty</label>
              <select value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))} className="input-field text-sm">
                {['Easy','Medium','Hard'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {[['Problem Description *','description',5],['Input Format *','inputFormat',3],['Output Format *','outputFormat',3],['Constraints *','constraints',2]].map(([lbl,key,rows])=>(
            <div key={key}>
              <label className="input-label">{lbl}</label>
              <textarea rows={rows} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                className="input-field resize-none text-sm font-mono" placeholder={lbl.replace(' *','')} />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label">Examples</label>
              <button onClick={addEx} className="text-xs text-neon hover:underline font-mono">+ Add Example</button>
            </div>
            {form.examples.map((ex,i)=>(
              <div key={i} className="rounded-xl p-4 space-y-3 mb-3" style={{background:'#0b0f0c',border:'1px solid #1f2937'}}>
                <p className="text-xs font-mono text-gray-500">Example {i+1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <textarea rows={3} value={ex.input} onChange={e=>setEx(i,'input',e.target.value)}
                    className="input-field resize-none text-xs font-mono" placeholder="Input" />
                  <textarea rows={3} value={ex.output} onChange={e=>setEx(i,'output',e.target.value)}
                    className="input-field resize-none text-xs font-mono" placeholder="Output" />
                </div>
                <input value={ex.explanation} onChange={e=>setEx(i,'explanation',e.target.value)}
                  className="input-field text-sm" placeholder="Explanation (optional)" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={()=>{setShowForm(false);setForm(blank)}} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-neon flex-1 py-2.5 text-sm">
              {saving?<><Spinner />Adding...</>:'+ Add Problem'}
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-16 text-neon font-mono animate-pulse">Loading...</div>
      : questions.length===0 ? <div className="text-center py-16 text-gray-600 font-mono"><p className="text-4xl mb-3">📭</p><p>No problems yet.</p></div>
      : (
        <div className="space-y-3">
          {questions.map((q,i)=>(
            <div key={q._id} className="rounded-xl p-5 flex items-start gap-4 group transition-all"
              style={{background:'#111827',border:'1px solid #1f2937'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#374151'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1f2937'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs"
                style={{background:'#00ff8810',color:'#00ff88',border:'1px solid #00ff8820'}}>P{i+1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono font-bold text-sm text-white">{q.title}</p>
                  <span className={`text-xs font-mono ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{q.description}</p>
                <p className="text-xs text-gray-600 font-mono mt-1">{q.examples?.length||0} examples · Order {q.order}</p>
              </div>
              <button onClick={()=>handleDelete(q._id)}
                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs font-mono rounded-lg transition-all btn-danger">
                ✕ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Config Tab ────────────────────────────────────────────────────────────────
function ConfigTab() {
  const blank = { mcqStartTime:'', mcqEndTime:'', codingStartTime:'', codingEndTime:'', mcqDuration:45, codingDuration:45, mcqQuestionCount:30 }
  const [config, setConfig] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    api.get('/admin/config').then(r=>{
      if (r.data.config) {
        const c=r.data.config
        const fmt = d => d?new Date(d).toISOString().slice(0,16):''
        setConfig({ mcqStartTime:fmt(c.mcqStartTime), mcqEndTime:fmt(c.mcqEndTime), codingStartTime:fmt(c.codingStartTime), codingEndTime:fmt(c.codingEndTime), mcqDuration:c.mcqDuration||45, codingDuration:c.codingDuration||45, mcqQuestionCount:c.mcqQuestionCount||30 })
      }
    }).catch(()=>{}).finally(()=>setLoading(false))
  },[])

  const handleSave = async () => {
    setSaving(true)
    try { await api.post('/admin/config',config); setSaved(true); toast.success('Configuration saved!'); setTimeout(()=>setSaved(false),3000) }
    catch(err) { toast.error(err.response?.data?.message||'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-neon font-mono animate-pulse">Loading config...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-mono font-bold text-white">Test Configuration</h2>
        <p className="text-xs text-gray-500 font-mono">Set start & end times for each round. Students will see a countdown.</p>
      </div>

      {[
        { label:'📝 MCQ Round', startKey:'mcqStartTime', endKey:'mcqEndTime', durKey:'mcqDuration', extra: <div><label className="input-label">Question Count</label><input type="number" min={1} value={config.mcqQuestionCount} onChange={e=>setConfig(p=>({...p,mcqQuestionCount:+e.target.value}))} className="input-field text-sm" /></div> },
        { label:'💻 Coding Round', startKey:'codingStartTime', endKey:'codingEndTime', durKey:'codingDuration', extra:null },
      ].map(({ label, startKey, endKey, durKey, extra }) => (
        <div key={label} className="rounded-xl p-5 space-y-4" style={{background:'#111827',border:'1px solid #1f2937'}}>
          <h3 className="font-mono font-bold text-sm text-yellow-400">{label}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Start Date & Time</label>
              <input type="datetime-local" value={config[startKey]} onChange={e=>setConfig(p=>({...p,[startKey]:e.target.value}))} className="input-field text-sm font-mono" />
            </div>
            <div>
              <label className="input-label">End Date & Time</label>
              <input type="datetime-local" value={config[endKey]} onChange={e=>setConfig(p=>({...p,[endKey]:e.target.value}))} className="input-field text-sm font-mono" />
            </div>
            <div>
              <label className="input-label">Duration (minutes)</label>
              <input type="number" min={1} value={config[durKey]} onChange={e=>setConfig(p=>({...p,[durKey]:+e.target.value}))} className="input-field text-sm" />
            </div>
            {extra && <div>{extra}</div>}
          </div>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all"
        style={{ background: saved?'#00ff88':saving?'#00ff8860':'#00ff88', color:'#0b0f0c', opacity:saving?0.7:1, cursor:saving?'not-allowed':'pointer', boxShadow:saved?'0 0 20px #00ff8840':'none' }}>
        {saving?<><Spinner />Saving...</>:saved?'✓ Saved!':'💾 Save Configuration'}
      </button>
    </div>
  )
}

// ── Results Tab ───────────────────────────────────────────────────────────────
function ResultsTab() {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [sortBy, setSortBy]     = useState('score')
  const [sortDir, setSortDir]   = useState('desc')
  const [search, setSearch]     = useState('')

  useEffect(()=>{
    api.get('/admin/results/mcq')
      .then(r=>setResults(r.data.results))
      .catch(()=>toast.error('Failed to load results'))
      .finally(()=>setLoading(false))
  },[])

  const toggleSort = col => { if(sortBy===col) setSortDir(d=>d==='asc'?'desc':'asc'); else{ setSortBy(col); setSortDir('desc') } }

  const filtered = results.filter(r => {
    const q = search.toLowerCase()
    return !q || r.userId?.name?.toLowerCase().includes(q) || r.userId?.scholarNumber?.toLowerCase().includes(q) || r.userId?.branch?.toLowerCase().includes(q)
  })

  const sorted = [...filtered].sort((a,b)=>{
    let va = sortBy==='name' ? (a.userId?.name||'') : (a[sortBy]??0)
    let vb = sortBy==='name' ? (b.userId?.name||'') : (b[sortBy]??0)
    if(typeof va==='string') return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va)
    return sortDir==='asc'?va-vb:vb-va
  })

  const exportCSV = () => {
    const rows = [
      ['Rank','Name','Scholar Number','Branch','Score','Attempted','Correct','Wrong','Submitted At'],
      ...sorted.map((r,i)=>[i+1, r.userId?.name, r.userId?.scholarNumber, r.userId?.branch, r.score, r.attempted, r.correct, r.wrong, new Date(r.submittedAt).toLocaleString()])
    ]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = `mcq_results_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  const SortIcon = ({col}) => <span className={`ml-1 text-xs ${sortBy===col?'text-yellow-400':'text-gray-700'}`}>{sortBy===col?(sortDir==='asc'?'↑':'↓'):'↕'}</span>

  if (loading) return <div className="text-center py-16 text-neon font-mono animate-pulse">Loading results...</div>

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">MCQ Results</h2>
          <p className="text-xs text-gray-500 font-mono">{results.length} submissions · Admin only view</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)}
            className="input-field text-sm max-w-48" placeholder="Search name, scholar..." />
          <button onClick={exportCSV} className="btn-outline text-sm px-4 py-2 flex-shrink-0">⬇ CSV</button>
        </div>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:'Submissions', value:results.length, color:'text-neon' },
            { label:'Average Score', value:Math.round(results.reduce((s,r)=>s+r.score,0)/results.length), color:'text-blue-400' },
            { label:'Top Score', value:Math.max(...results.map(r=>r.score)), color:'text-yellow-400' },
            { label:'Avg Correct', value:`${Math.round(results.reduce((s,r)=>s+(r.attempted>0?r.correct/r.attempted*100:0),0)/results.length)}%`, color:'text-green-400' },
          ].map((s,i)=>(
            <div key={i} className="rounded-xl p-4 text-center" style={{background:'#111827',border:'1px solid #1f2937'}}>
              <p className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {sorted.length===0 ? (
        <div className="text-center py-16 text-gray-600 font-mono"><p className="text-4xl mb-3">📊</p><p>{search?'No results match your search.':'No submissions yet.'}</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{border:'1px solid #1f2937'}}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#0f1a10',borderBottom:'1px solid #1f2937'}}>
                {[['#',null],['Name','name'],['Scholar No.',null],['Branch',null],['Score','score'],['Attempted','attempted'],['Correct','correct'],['Wrong','wrong'],['Submitted',null]].map(([lbl,col])=>(
                  <th key={lbl} onClick={()=>col&&toggleSort(col)}
                    className={`px-4 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider ${col?'cursor-pointer hover:text-gray-200':''}`}>
                    {lbl}{col&&<SortIcon col={col}/>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r,i)=>(
                <tr key={r._id} className="transition-colors" style={{borderBottom:'1px solid #1f293750'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#1f293730'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-200">{r.userId?.name||'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.userId?.scholarNumber}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono px-2 py-1 rounded-lg" style={{background:'#1f2937',color:'#9ca3af'}}>{r.userId?.branch}</span></td>
                  <td className="px-4 py-3"><span className={`font-mono font-bold text-base ${r.score>=0?'text-neon':'text-red-400'}`}>{r.score}</span></td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-300">{r.attempted}</td>
                  <td className="px-4 py-3 font-mono text-sm text-green-400 font-bold">{r.correct}</td>
                  <td className="px-4 py-3 font-mono text-sm text-red-400 font-bold">{r.wrong}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{new Date(r.submittedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Participants Tab ──────────────────────────────────────────────────────────
function ParticipantsTab() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(()=>{
    api.get('/admin/participants')
      .then(r=>setUsers(r.data.users))
      .catch(()=>toast.error('Failed to load'))
      .finally(()=>setLoading(false))
  },[])

  const filtered = users.filter(u=>{
    const q=search.toLowerCase()
    return !q||u.name.toLowerCase().includes(q)||u.scholarNumber.toLowerCase().includes(q)||u.branch.toLowerCase().includes(q)
  })

  const mcqDone   = users.filter(u=>u.mcqSubmitted).length
  const codingDone = users.filter(u=>u.codingSubmitted).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">Participants</h2>
          <p className="text-xs text-gray-500 font-mono">{users.length} registered · {mcqDone} MCQ done · {codingDone} Coding done</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          className="input-field text-sm max-w-56" placeholder="Search name, scholar, branch..." />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:'Total Registered', value:users.length, color:'text-neon'},
          {label:'MCQ Submitted', value:mcqDone, color:'text-blue-400'},
          {label:'Coding Submitted', value:codingDone, color:'text-yellow-400'},
        ].map((s,i)=>(
          <div key={i} className="rounded-xl p-4 text-center" style={{background:'#111827',border:'1px solid #1f2937'}}>
            <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? <div className="text-center py-16 text-neon font-mono animate-pulse">Loading...</div>
      : (
        <div className="overflow-x-auto rounded-xl" style={{border:'1px solid #1f2937'}}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#0f1a10',borderBottom:'1px solid #1f2937'}}>
                {['#','Name','Email','Scholar No.','Branch','MCQ Round','Coding Round','Registered'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u,i)=>(
                <tr key={u._id} className="transition-colors" style={{borderBottom:'1px solid #1f293750'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#1f293730'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-200">{u.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{u.scholarNumber}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono px-2 py-1 rounded-lg" style={{background:'#1f2937',color:'#9ca3af'}}>{u.branch}</span></td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1 w-fit"
                      style={u.mcqSubmitted?{background:'#00ff8815',color:'#00ff88',border:'1px solid #00ff8830'}:{background:'#1f2937',color:'#6b7280',border:'1px solid #374151'}}>
                      {u.mcqSubmitted?'✓ Done':'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1 w-fit"
                      style={u.codingSubmitted?{background:'#3b82f615',color:'#60a5fa',border:'1px solid #3b82f630'}:{background:'#1f2937',color:'#6b7280',border:'1px solid #374151'}}>
                      {u.codingSubmitted?'✓ Done':'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div className="text-center py-8 text-gray-600 font-mono">No users match your search.</div>}
        </div>
      )}
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab]   = useState('mcq')
  const [stats, setStats] = useState({ participants:0, mcq:0, coding:0 })
  const { logout }      = useAuth()
  const navigate        = useNavigate()

  useEffect(()=>{
    Promise.all([api.get('/admin/participants'), api.get('/admin/results/mcq'), api.get('/admin/results/coding')])
      .then(([p,m,c])=>setStats({ participants:p.data.users?.length||0, mcq:m.data.results?.length||0, coding:c.data.submissions?.length||0 }))
      .catch(()=>{})
  },[])

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="min-h-screen" style={{background:'#080c09'}}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{background:'#0a100b/95',borderBottom:'1px solid #1a2e1a',boxShadow:'0 1px 0 #f59e0b10'}}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VisionLogo size="sm" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full" style={{background:'#f59e0b15',border:'1px solid #f59e0b25'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-mono text-yellow-400 tracking-widest">ADMIN PANEL</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/dashboard')} className="btn-ghost text-xs px-3 py-1.5">User View</button>
            <button onClick={handleLogout} className="btn-danger text-xs px-3 py-1.5">⏻ Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Vision CSE Recruitment · Control Panel</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Registered" value={stats.participants} icon="👥" color="text-neon" />
          <Stat label="MCQ Submitted" value={stats.mcq} icon="📝" color="text-blue-400" />
          <Stat label="Code Submitted" value={stats.coding} icon="💻" color="text-yellow-400" />
          <Stat label="Completion" value={stats.participants>0?`${Math.round(stats.mcq/stats.participants*100)}%`:'—'} icon="📊" color="text-green-400" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b gap-1 mb-6" style={{borderColor:'#1f2937'}}>
          <TabBtn label="MCQ Questions" icon="📝" active={tab==='mcq'} onClick={()=>setTab('mcq')} />
          <TabBtn label="Coding Problems" icon="💻" active={tab==='coding'} onClick={()=>setTab('coding')} />
          <TabBtn label="Test Config" icon="⏱" active={tab==='config'} onClick={()=>setTab('config')} />
          <TabBtn label="Results" icon="🏆" active={tab==='results'} onClick={()=>setTab('results')} badge={stats.mcq} />
          <TabBtn label="Participants" icon="👥" active={tab==='participants'} onClick={()=>setTab('participants')} badge={stats.participants} />
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {tab==='mcq'          && <MCQTab />}
          {tab==='coding'       && <CodingTab />}
          {tab==='config'       && <ConfigTab />}
          {tab==='results'      && <ResultsTab />}
          {tab==='participants' && <ParticipantsTab />}
        </div>
      </main>
    </div>
  )
}
