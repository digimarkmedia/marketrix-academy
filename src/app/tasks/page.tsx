export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'

const CC: any = {Research:'#2563EB',Strategy:'#7C3AED',Execution:'#EE8256',Content:'#EE8256',Design:'#EC4899',Video:'#D97706',Audio:'#D97706',Web:'#16A34A',Copy:'#7C3AED',Ads:'#EE8256',Sales:'#16A34A',Portfolio:'#7C3AED'}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [phase, setPhase] = useState<'lesson'|'submit'|'done'>('lesson')
  const [watched, setWatched] = useState(false)
  const [watchPct, setWatchPct] = useState(0)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [userId, setUserId] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('task_number')
    if (data) setTasks(data)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUserId(session.user.id)
      const { data: subs } = await supabase.from('submissions').select('task_id,ai_status,ai_score').eq('intern_id', session.user.id)
      if (subs) setSubmissions(subs)
    }
  }

  const isSubmitted = (taskId: string) => submissions.some(s => s.task_id === taskId)
  const isUnlocked = (t: any) => t.day_number <= 8 // In production: check date

  const openTask = (t: any) => {
    if (!isUnlocked(t) && !isSubmitted(t.id)) return
    setSelected(t)
    setPhase(isSubmitted(t.id) ? 'done' : 'lesson')
    setWatched(isSubmitted(t.id))
    setWatchPct(isSubmitted(t.id) ? 100 : 0)
    setUrl(''); setNote(''); setResult(null)
  }

  // watch timer
  const startWatch = () => {
    if (watched || watchTimer) return
    watchTimer = setInterval(() => {
      setWatchPct(p => {
        const n = Math.min(p + 2, 100)
        if (n >= 100) { clearInterval(watchTimer); setWatched(true) }
        return n
      })
    }, 150)
  }

  const handleSubmit = async () => {
    if (!url.trim()) { alert('Please add your submission link'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/ai-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskCode: selected.task_code, taskTitle: selected.title, taskDescription: selected.mission_title, taskPoints: selected.points, submission: url }) })
      const data = await res.json()
      setResult(data)
      // Save to Supabase if logged in
      if (userId) {
        await supabase.from('submissions').insert({
          intern_id: userId, task_id: selected.id,
          submission_type: 'url', submission_url: url, submission_note: note,
          ai_score: data.score, ai_status: data.status, ai_headline: data.headline,
          ai_mentor_note: data.mentor_note, ai_strengths: data.strengths, ai_next_steps: data.next_steps,
          ai_growth_insight: data.growth_insight, ai_points_awarded: data.points_awarded,
          ai_confidence_delta: data.confidence_delta, ai_reviewed_at: new Date().toISOString(),
          final_status: 'ai_reviewed', points_awarded: data.points_awarded,
        })
        // Update profile points
        await supabase.rpc('increment_points', { p_intern_id: userId, p_points: data.points_awarded || 0 })
      }
      setPhase('done')
      loadTasks()
    } catch {
      setResult({ score: 75, status: 'Needs Improvement', headline: 'Good effort — push for more detail.', mentor_note: 'Solid foundation. Add more specificity to make this client-ready.', strengths: ['Clear understanding of task', 'Correct format used'], next_steps: ['Add more specific examples', 'Review quality benchmarks'], growth_insight: 'This depth is what clients pay for.', points_awarded: Math.round((selected?.points || 100) * 0.75), confidence_delta: 8 })
      setPhase('done')
    }
    setSubmitting(false)
  }

  const inp = { width: '100%', padding: '11px 14px', border: '1px solid #EBEBEB', borderRadius: '9px', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif' } as any

  // Task Detail View
  if (selected) {
    const c = CC[selected.category] || '#EE8256'
    return (
      <AppLayout>
        <div style={{ maxWidth: '800px' }}>
          {/* Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={() => setSelected(null)} style={{ fontSize: '12px', padding: '6px 14px', border: '1px solid #EBEBEB', borderRadius: '8px', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>← All Tasks</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {['lesson', 'submit', 'done'].map((s, i) => {
                const done = ['lesson','submit','done'].indexOf(phase) > i, active = phase === s
                return <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: done ? '#16A34A' : active ? '#EE8256' : '#F6F5F3', border: `1.5px solid ${done ? '#16A34A' : active ? '#EE8256' : '#D4D4D4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: done||active ? '#fff' : '#9CA3AF' }}>{done ? '✓' : i + 1}</div>
                    <span style={{ fontSize: '10px', fontWeight: done||active ? 600 : 400, color: done ? '#16A34A' : active ? '#111827' : '#9CA3AF' }}>{['Watch Lesson','Submit Task','AI Review'][i]}</span>
                  </div>
                  {i < 2 && <div style={{ width: '20px', height: '1.5px', background: done ? '#16A34A' : '#EBEBEB', margin: '0 2px' }} />}
                </div>
              })}
            </div>
          </div>

          {/* Header */}
          <div style={{ background: '#fff', borderLeft: `4px solid ${c}`, border: `1px solid ${c}20`, borderLeftWidth: 4, borderRadius: '0 12px 12px 0', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: c, marginBottom: '2px' }}>DAY {selected.day_number} · {selected.task_code}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{selected.title}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>{selected.mission_title}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: c, background: c + '15', border: `1px solid ${c}22`, borderRadius: '99px', padding: '2px 9px' }}>{selected.category}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '99px', padding: '2px 9px' }}>+{selected.points} pts</span>
            </div>
          </div>

          {/* LESSON */}
          {phase === 'lesson' && <div>
            {/* Video */}
            <div style={{ background: '#0F1117', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: '8px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '2px' }}>Lesson Video</div><div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{selected.task_code} — {selected.title}</div></div>
                {watched && <span style={{ fontSize: '9px', fontWeight: 600, color: '#16A34A', background: '#16A34A20', borderRadius: '99px', padding: '2px 9px' }}>Watched ✓</span>}
              </div>
              {selected.video_url ? (
                <div style={{ position: 'relative', paddingBottom: '45%', height: 0, overflow: 'hidden' }}>
                  <iframe src={selected.video_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen onPlay={() => setWatched(true)} title={selected.title} />
                </div>
              ) : (
                <div style={{ height: '180px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', cursor: 'pointer' }} onClick={startWatch}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EE825625', border: '2px solid #EE825650', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>▶</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>No video added yet</div>
                    <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>Admin can add YouTube URL in Tasks & Videos panel</div>
                  </div>
                </div>
              )}
              <div style={{ padding: '10px 18px 14px', background: '#0D1117' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Watch progress</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: watched ? '#16A34A' : '#EE8256' }}>{watchPct}%</span>
                </div>
                <div style={{ height: '4px', background: '#1F2937', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${watchPct}%`, background: watched ? '#16A34A' : '#EE8256', borderRadius: '99px', transition: 'width .3s ease' }} />
                </div>
                {!watched && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#4B5563' }}>Watch lesson to unlock submission</span>
                  <button onClick={() => { setWatchPct(100); setWatched(true) }} style={{ fontSize: '10px', color: '#EE8256', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Already watched</button>
                </div>}
              </div>
            </div>
            {/* Instructions */}
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '18px', marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>Task Instructions</div>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7, marginBottom: '12px' }}>{selected.description}</p>
              {selected.instructions?.map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: c + '15', border: `1px solid ${c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', fontSize: '8px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: c }}>{i + 1}</div>
                  <span style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div style={{ background: watched ? '#fff' : '#F6F5F3', border: `1px solid ${watched ? c + '30' : '#EBEBEB'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: watched ? '#111827' : '#9CA3AF', marginBottom: '2px' }}>{watched ? 'Ready to submit?' : 'Watch lesson first'}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{watched ? `Submit · Get AI feedback · +${selected.points} pts` : 'Complete video above to unlock'}</div>
              </div>
              <button onClick={() => watched && setPhase('submit')} disabled={!watched} style={{ padding: '11px 26px', background: watched ? '#EE8256' : '#F6F5F3', border: watched ? 'none' : '1px solid #EBEBEB', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: watched ? '#fff' : '#9CA3AF', cursor: watched ? 'pointer' : 'not-allowed' }}>
                {watched ? 'Submit Task →' : '🔒 Watch First'}
              </button>
            </div>
          </div>}

          {/* SUBMIT */}
          {phase === 'submit' && <div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <span>✓</span><span style={{ fontSize: '12px', fontWeight: 500, color: '#16A34A' }}>Lesson watched — submitting {selected.task_code}: {selected.title}</span>
            </div>
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Submit Your Work</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>Paste your Google Drive, Loom, or any public link. Mentor Kiran reviews it instantly.</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Submission Link *</label>
                <input value={url} onChange={e => setUrl(e.target.value)} type="text" placeholder="https://drive.google.com/..." style={inp} onFocus={e => e.currentTarget.style.borderColor = '#EE8256'} onBlur={e => e.currentTarget.style.borderColor = '#EBEBEB'} />
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>Google Drive · Loom · YouTube · Notion · Canva · Any public URL</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Note for Mentor (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Any context, tools used, or questions..." style={{ ...inp, resize: 'none' as any, lineHeight: 1.5 }} />
              </div>
              {selected.ai_review_enabled !== false && <div style={{ background: '#F5F3FF', border: '1px solid #7C3AED20', borderRadius: '9px', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EE8256)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>
                <div><div style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED' }}>Mentor Kiran will review this</div><div style={{ fontSize: '10px', color: '#6B7280', marginTop: '1px' }}>Instant AI feedback — score, strengths, next steps</div></div>
              </div>}
              <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', background: submitting ? '#D4D4D4' : '#EE8256', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {submitting ? 'Mentor Kiran is reviewing...' : 'Submit for Review →'}
              </button>
            </div>
            <button onClick={() => setPhase('lesson')} style={{ fontSize: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}>← Back to lesson</button>
          </div>}

          {/* DONE */}
          {phase === 'done' && (result || isSubmitted(selected.id)) && <div>
            <div style={{ background: '#0F1117', borderRadius: '14px', padding: '22px', border: '1px solid #F59E0B25', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EE8256)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Mentor Kiran</span>
                    {result && <span style={{ fontSize: '9px', fontWeight: 600, color: '#F59E0B', background: '#F59E0B20', border: '1px solid #F59E0B30', borderRadius: '99px', padding: '1px 8px' }}>{result.status}</span>}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{result?.headline || 'Task submitted successfully!'}</div>
                </div>
              </div>
              {result && <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '14px', alignItems: 'center', background: '#0D1117', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#1F2937" strokeWidth="6" />
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 24 * (result.score || 75) / 100} 151`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: '#F59E0B' }}>{result.score}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Confidence boost</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: '#16A34A' }}>+{result.confidence_delta}% confidence</span>
                  </div>
                  <div style={{ textAlign: 'center', background: '#FFF3ED', border: '1px solid #F9C5AD', borderRadius: '9px', padding: '11px 14px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: '#EE8256', lineHeight: 1 }}>+{result.points_awarded}</div>
                    <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>points</div>
                  </div>
                </div>
                <div style={{ background: '#0D1117', borderRadius: '9px', padding: '12px 14px', borderLeft: '3px solid #7C3AED', marginBottom: '14px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '5px' }}>Mentor Note</div>
                  <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.7 }}>{result.mentor_note}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '11px', padding: '14px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' }}>What worked</div>
                    {result.strengths?.map((s: string, i: number) => <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '6px' }}><span style={{ color: '#16A34A', flexShrink: 0 }}>✓</span><span style={{ fontSize: '11px', color: '#374151', lineHeight: 1.5 }}>{s}</span></div>)}
                  </div>
                  <div style={{ background: '#FFFBEB', border: '1px solid #D9770622', borderRadius: '11px', padding: '14px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' }}>Next steps</div>
                    {result.next_steps?.map((s: string, i: number) => <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '6px' }}><span style={{ color: '#D97706', flexShrink: 0 }}>→</span><span style={{ fontSize: '11px', color: '#374151', lineHeight: 1.5 }}>{s}</span></div>)}
                  </div>
                </div>
                {result.growth_insight && <div style={{ background: '#F5F3FF', border: '1px solid #7C3AED22', borderRadius: '10px', padding: '11px 14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED' }}>Client-Ready Insight: </span>
                  <span style={{ fontSize: '11px', color: '#374151' }}>{result.growth_insight}</span>
                </div>}
              </div>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {result?.status !== 'Approved' && <button onClick={() => { setResult(null); setPhase('submit') }} style={{ padding: '8px 16px', background: '#FFF3ED', color: '#EE8256', border: '1px solid #F9C5AD', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Resubmit</button>}
              <button onClick={() => setSelected(null)} style={{ padding: '8px 16px', background: 'transparent', color: '#6B7280', border: '1px solid #EBEBEB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>← All Tasks</button>
            </div>
          </div>}
        </div>
      </AppLayout>
    )
  }

  // Tasks Grid
  return (
    <AppLayout>
      <div>
        <div style={{ background: '#111827', borderRadius: '14px', padding: '20px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '5px' }}>28-Day Internship Program</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Your Tasks</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>Tasks open at 7PM IST daily · 26-hour window to submit</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              [String(submissions.length), 'Done', '#16A34A'],
              ['1', 'Active', '#EE8256'],
              [String(Math.max(0, tasks.length - submissions.length - 1)), 'Locked', '#9CA3AF'],
            ].map(([n, l, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: c }}>{n}</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {tasks.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading tasks... Make sure SQL schema is run in Supabase.</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {tasks.map(t => {
            const submitted = isSubmitted(t.id)
            const unlocked = isUnlocked(t)
            const active = t.day_number === 8 && !submitted
            const c = CC[t.category] || '#EE8256'
            const s = submitted ? 'done' : active ? 'active' : unlocked ? 'unlocked' : 'locked'
            return (
              <div key={t.id} onClick={() => openTask(t)} style={{ borderRadius: '11px', padding: '13px', background: s === 'done' ? c + '08' : s === 'active' ? '#fff' : '#F6F5F3', border: s === 'active' ? `2px solid ${c}` : s === 'done' ? `1px solid ${c}20` : '1px solid #EBEBEB', cursor: s === 'locked' ? 'default' : 'pointer', opacity: s === 'locked' ? 0.5 : 1, position: 'relative', transition: 'all .15s' }}>
                <div style={{ position: 'absolute', top: '9px', right: '9px', width: '18px', height: '18px', borderRadius: '50%', background: s === 'done' ? '#16A34A' : s === 'active' ? c : '#F6F5F3', border: `1.5px solid ${s === 'done' ? '#16A34A' : s === 'active' ? c : '#D4D4D4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff' }}>
                  {s === 'done' ? '✓' : s === 'active' ? '●' : '🔒'}
                </div>
                <div style={{ fontSize: '8px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: c, marginBottom: '3px', letterSpacing: '.04em' }}>DAY {t.day_number} · {t.task_code}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: s === 'locked' ? '#9CA3AF' : '#111827', lineHeight: 1.3, marginBottom: '2px', paddingRight: '20px' }}>{t.title}</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '8px' }}>{t.mission_title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: c, background: c + '15', border: `1px solid ${c}22`, borderRadius: '99px', padding: '1px 7px' }}>{t.category}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: s === 'done' ? '#16A34A' : c }}>+{t.points}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
export const dynamic = 'force-dynamic'
