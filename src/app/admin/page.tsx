'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Admin() {
  const router = useRouter()
  const [view, setView] = useState('overview')
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [interns, setInterns] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [settings, setSettings] = useState({ whatsapp_group_url: '', whatsapp_community_url: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [newIntern, setNewIntern] = useState({ full_name: '', email: '', password: '', batch_id: '' })
  const [newClass, setNewClass] = useState({ title: '', meeting_type: 'class', meeting_date: '', start_time: '19:00', end_time: '21:00', meeting_link: '', description: '' })
  const [addingIntern, setAddingIntern] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const u = localStorage.getItem('mtx_user')
    if (!u) { router.push('/login'); return }
    setUser(JSON.parse(u))
    loadAll()
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [t, b, m, s, l, p] = await Promise.all([
        supabase.from('tasks').select('*').order('task_number'),
        supabase.from('batches').select('*').order('created_at'),
        supabase.from('meetings').select('*').order('meeting_date'),
        supabase.from('submissions').select('*, profiles(full_name,email), tasks(task_code,title)').order('created_at', { ascending: false }).limit(50),
        supabase.from('leave_requests').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'intern').order('created_at', { ascending: false }),
      ])
      if (t.data) setTasks(t.data)
      if (b.data) {
        setBatches(b.data)
        if (b.data[0] && !newIntern.batch_id) {
          setNewIntern(prev => ({ ...prev, batch_id: b.data![0].id }))
          setSettings({ whatsapp_group_url: b.data[0].whatsapp_group_url || '', whatsapp_community_url: b.data[0].whatsapp_community_url || '' })
        }
      }
      if (m.data) setMeetings(m.data)
      if (s.data) setSubmissions(s.data)
      if (l.data) setLeaveRequests(l.data)
      if (p.data) setInterns(p.data)
    } catch (e) { console.error('Load error:', e) }
    setLoading(false)
  }, [])

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const addIntern = async () => {
    if (!newIntern.full_name.trim()) { alert('Please enter full name'); return }
    if (!newIntern.email.trim()) { alert('Please enter email'); return }
    if (!newIntern.password.trim() || newIntern.password.length < 6) { alert('Password must be at least 6 characters'); return }
    if (!newIntern.batch_id) { alert('Please select a batch'); return }
    setAddingIntern(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newIntern.email.trim(),
        password: newIntern.password.trim(),
        options: { data: { full_name: newIntern.full_name.trim() } }
      })
      if (error) throw error
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: newIntern.email.trim(),
          full_name: newIntern.full_name.trim(),
          role: 'intern',
          batch_id: newIntern.batch_id,
          confidence_score: 0,
          confidence_level: 'Explorer',
          total_points: 0,
          streak_days: 0,
        })
        if (profileError) console.error('Profile error:', profileError)
        showMsg(`✓ ${newIntern.full_name} added! They can login with ${newIntern.email}`)
        setNewIntern(prev => ({ ...prev, full_name: '', email: '', password: '' }))
        await loadAll()
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
    setAddingIntern(false)
  }

  const updateTaskVideo = async (taskId: string, videoUrl: string) => {
    const { error } = await supabase.from('tasks').update({ video_url: videoUrl }).eq('id', taskId)
    if (error) { alert('Error saving: ' + error.message); return }
    showMsg('Video URL saved!')
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, video_url: videoUrl } : t))
  }

  const toggleAIReview = async (taskId: string, current: boolean) => {
    await supabase.from('tasks').update({ ai_review_enabled: !current }).eq('id', taskId)
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, ai_review_enabled: !current } : t))
    showMsg('AI Review toggled!')
  }

  const saveSettings = async () => {
    if (!batches[0]) { alert('No batch found. Run SQL schema first.'); return }
    const { error } = await supabase.from('batches').update({
      whatsapp_group_url: settings.whatsapp_group_url,
      whatsapp_community_url: settings.whatsapp_community_url
    }).eq('id', batches[0].id)
    if (error) { alert('Error: ' + error.message); return }
    showMsg('Settings saved!')
  }

  const scheduleClass = async () => {
    if (!newClass.title) { alert('Enter session title'); return }
    if (!newClass.meeting_date) { alert('Select a date'); return }
    if (!newClass.meeting_link) { alert('Enter meeting link'); return }
    const { error } = await supabase.from('meetings').insert({
      ...newClass,
      batch_id: batches[0]?.id || null
    })
    if (error) { alert('Error: ' + error.message); return }
    showMsg('Session scheduled!')
    setNewClass({ title: '', meeting_type: 'class', meeting_date: '', start_time: '19:00', end_time: '21:00', meeting_link: '', description: '' })
    loadAll()
  }

  const approveLeave = async (id: string, stage: 'mentor' | 'manager', decision: string) => {
    const update: any = {}
    if (stage === 'mentor') { update.mentor_status = decision; update.mentor_reviewed_at = new Date().toISOString() }
    else { update.manager_status = decision; update.manager_reviewed_at = new Date().toISOString() }
    await supabase.from('leave_requests').update(update).eq('id', id)
    showMsg(`Leave ${decision}!`)
    loadAll()
  }

  const removeIntern = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return
    await supabase.from('profiles').delete().eq('id', id)
    showMsg(`${name} removed`)
    loadAll()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'interns', label: 'Manage Interns', icon: '👥' },
    { id: 'tasks', label: 'Tasks & Videos', icon: '✓' },
    { id: 'classes', label: 'Classes & Sessions', icon: '▶' },
    { id: 'submissions', label: 'Submissions', icon: '📄' },
    { id: 'leave', label: 'Leave Requests', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif', background: '#fff' } as any

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0F1117', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#EE8256', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 900, color: '#fff' }}>M</div>
          <div><div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Admin Panel</div><div style={{ fontSize: '9px', color: '#6B7280' }}>Management</div></div>
        </div>
        <nav style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', background: view === n.id ? 'rgba(238,130,86,.15)' : 'transparent', color: view === n.id ? '#EE8256' : '#9CA3AF', fontSize: '13px', fontWeight: view === n.id ? 600 : 500, border: 'none', cursor: 'pointer', marginBottom: '1px', textAlign: 'left' }}>
              <span>{n.icon}</span>{n.label}
              {n.id === 'leave' && leaveRequests.filter(l => l.final_status?.includes('pending')).length > 0 &&
                <span style={{ marginLeft: 'auto', fontSize: '9px', background: '#D97706', color: '#fff', borderRadius: '99px', padding: '1px 6px' }}>{leaveRequests.filter(l => l.final_status?.includes('pending')).length}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'SA'}
          </div>
          <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || user?.name}</div><div style={{ fontSize: '9px', color: '#6B7280' }}>Super Admin</div></div>
          <button onClick={logout} style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>⇥</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '220px', flex: 1, background: '#FAFAFA' }}>
        <div style={{ height: '52px', background: '#fff', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{navItems.find(n => n.id === view)?.label || view}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {msg && <span style={{ fontSize: '12px', color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '7px', padding: '4px 12px' }}>{msg}</span>}
            {loading && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Loading...</span>}
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* OVERVIEW */}
          {view === 'overview' && <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                ['Active Interns', interns.length, '#111827', `${batches[0]?.name || 'Batch 1'}`],
                ['Total Tasks', tasks.length, '#2563EB', 'In program'],
                ['Submissions', submissions.length, '#EE8256', 'Total received'],
                ['Leave Pending', leaveRequests.filter(l => l.final_status?.includes('pending')).length, '#D97706', 'Needs review'],
              ].map(([l, v, c, s]) => (
                <div key={String(l)} style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>{l}</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: String(c) }}>{String(v)}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{String(s)}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Recent Submissions</div>
              {submissions.slice(0, 5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F6F5F3' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.profiles?.full_name} — {s.tasks?.task_code}: {s.tasks?.title}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{new Date(s.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: s.ai_status === 'Approved' ? '#16A34A' : '#D97706', background: s.ai_status === 'Approved' ? '#F0FDF4' : '#FFFBEB', borderRadius: '99px', padding: '2px 9px' }}>{s.ai_status || 'Pending'}</span>
                </div>
              ))}
              {submissions.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '13px' }}>No submissions yet</div>}
            </div>
          </div>}

          {/* INTERNS */}
          {view === 'interns' && <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Intern Management</h2>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>Add intern accounts. They log in with the email and password you set.</p>

            {/* Add intern form */}
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>➕ Add New Intern</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Full Name *</label>
                    <input style={inp} placeholder="Aryan Mehta" value={newIntern.full_name} onChange={e => setNewIntern(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Email *</label>
                    <input style={inp} type="email" placeholder="aryan@email.com" value={newIntern.email} onChange={e => setNewIntern(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Password * (min 6 chars)</label>
                    <input style={inp} type="text" placeholder="Welcome@123" value={newIntern.password} onChange={e => setNewIntern(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Batch *</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={newIntern.batch_id} onChange={e => setNewIntern(p => ({ ...p, batch_id: e.target.value }))}>
                      <option value="">Select batch...</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={addIntern}
                  disabled={addingIntern}
                  style={{ padding: '12px 28px', background: addingIntern ? '#D4D4D4' : '#EE8256', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 700, cursor: addingIntern ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', minWidth: '160px' }}>
                  {addingIntern ? 'Adding...' : '+ Add Intern'}
                </button>
              </div>
            </div>

            {/* Interns list */}
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F6F5F3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>All Interns ({interns.length})</div>
              </div>
              {interns.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No interns yet. Add your first intern above.</div>}
              {interns.map(intern => (
                <div key={intern.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', padding: '12px 16px', borderTop: '1px solid #F6F5F3', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF3ED', border: '1px solid #F9C5AD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#EE8256', flexShrink: 0 }}>
                      {intern.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{intern.full_name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{intern.email}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#F59E0B', background: '#FFFBEB', borderRadius: '99px', padding: '2px 8px', display: 'inline-block' }}>{intern.confidence_level || 'Explorer'}</span>
                  <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono,monospace', fontWeight: 600, color: '#111827' }}>{intern.total_points || 0} pts</span>
                  <button onClick={() => removeIntern(intern.id, intern.full_name)} style={{ fontSize: '11px', padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #DC262622', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>
                </div>
              ))}
            </div>
          </div>}

          {/* TASKS & VIDEOS */}
          {view === 'tasks' && <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Tasks & Videos</h2>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>Paste YouTube embed URLs for each task. Interns must watch before submitting.</p>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#2563EB' }}>
              💡 <strong>How to get YouTube embed URL:</strong> Upload video to YouTube → copy URL like <code>youtube.com/watch?v=ABC123</code> → paste as <code>https://www.youtube.com/embed/ABC123</code>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ background: '#fff', border: `1px solid ${task.video_url ? '#BBF7D0' : '#EBEBEB'}`, borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EE825612', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: '#EE8256', flexShrink: 0 }}>{task.task_code}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{task.title}</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Day {task.day_number} · +{task.points} pts · {task.video_url ? '✅ Video added' : '⚠️ No video yet'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>AI Review</span>
                      <div onClick={() => toggleAIReview(task.id, task.ai_review_enabled)} style={{ width: '36px', height: '20px', borderRadius: '99px', background: task.ai_review_enabled !== false ? '#16A34A' : '#D4D4D4', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: '3px', left: task.ai_review_enabled !== false ? '17px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id={`video-${task.id}`}
                      defaultValue={task.video_url || ''}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID_HERE"
                      style={{ ...inp, flex: 1, fontSize: '12px', padding: '8px 12px' }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`video-${task.id}`) as HTMLInputElement
                        if (el) updateTaskVideo(task.id, el.value)
                      }}
                      style={{ padding: '8px 18px', background: '#EE8256', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* CLASSES */}
          {view === 'classes' && <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Classes & Sessions</h2>
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Schedule New Session</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Title *</label><input style={inp} placeholder="Monday Training — Week 1" value={newClass.title} onChange={e => setNewClass(p => ({ ...p, title: e.target.value }))} /></div>
                <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Type</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={newClass.meeting_type} onChange={e => setNewClass(p => ({ ...p, meeting_type: e.target.value }))}>
                    <option value="class">Live Class (Monday)</option>
                    <option value="doubt">Doubt Session (Saturday)</option>
                  </select>
                </div>
                <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Date *</label><input style={inp} type="date" value={newClass.meeting_date} onChange={e => setNewClass(p => ({ ...p, meeting_date: e.target.value }))} /></div>
                <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Zoom / Meet Link *</label><input style={inp} placeholder="https://zoom.us/j/..." value={newClass.meeting_link} onChange={e => setNewClass(p => ({ ...p, meeting_link: e.target.value }))} /></div>
              </div>
              <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Description</label><input style={inp} placeholder="What will be covered" value={newClass.description} onChange={e => setNewClass(p => ({ ...p, description: e.target.value }))} /></div>
              <button onClick={scheduleClass} style={{ padding: '11px 28px', background: '#EE8256', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Schedule Session</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {meetings.map(m => (
                <div key={m.id} style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: m.meeting_type === 'class' ? '#16A34A18' : '#7C3AED18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{m.meeting_type === 'class' ? '▶' : '❓'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{m.meeting_date} · {m.start_time} IST</div>
                  </div>
                  <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', fontWeight: 600, color: '#EE8256', background: '#FFF3ED', border: '1px solid #F9C5AD', borderRadius: '7px', padding: '5px 12px', textDecoration: 'none' }}>Open</a>
                  <button onClick={async () => { await supabase.from('meetings').delete().eq('id', m.id); loadAll() }} style={{ fontSize: '11px', padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #DC262622', borderRadius: '7px', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
              {meetings.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No sessions scheduled yet.</div>}
            </div>
          </div>}

          {/* SUBMISSIONS */}
          {view === 'submissions' && <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>All Submissions</h2>
            {submissions.map(s => (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.profiles?.full_name} — {s.tasks?.task_code}: {s.tasks?.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{new Date(s.created_at).toLocaleDateString('en-IN')}</div>
                    {s.ai_headline && <div style={{ fontSize: '12px', color: '#374151', fontStyle: 'italic', marginTop: '4px' }}>"{s.ai_headline}"</div>}
                  </div>
                  {s.ai_score && <div style={{ textAlign: 'center', padding: '6px 12px', background: '#F6F5F3', borderRadius: '8px' }}><div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{s.ai_score}</div><div style={{ fontSize: '9px', color: '#9CA3AF' }}>Score</div></div>}
                  <span style={{ fontSize: '10px', fontWeight: 600, color: s.ai_status === 'Approved' ? '#16A34A' : '#D97706', background: s.ai_status === 'Approved' ? '#F0FDF4' : '#FFFBEB', borderRadius: '99px', padding: '3px 10px' }}>{s.ai_status || 'Pending'}</span>
                  {s.submission_url && <a href={s.submission_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '7px', padding: '5px 10px', textDecoration: 'none' }}>View</a>}
                </div>
              </div>
            ))}
            {submissions.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No submissions yet.</div>}
          </div>}

          {/* LEAVE */}
          {view === 'leave' && <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Leave Requests</h2>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>Two-stage approval. Approved leave waives attendance penalty.</p>
            {leaveRequests.map(l => (
              <div key={l.id} style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{l.profiles?.full_name}</span>
                      <span style={{ fontSize: '9px', background: '#F6F5F3', color: '#6B7280', borderRadius: '99px', padding: '1px 8px' }}>{l.leave_type}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: l.final_status?.includes('approved') ? '#16A34A' : '#D97706', background: l.final_status?.includes('approved') ? '#F0FDF4' : '#FFFBEB', borderRadius: '99px', padding: '1px 8px' }}>{l.final_status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{l.start_date} – {l.end_date} · {l.total_days} days</div>
                    <div style={{ fontSize: '12px', color: '#374151', marginTop: '6px', background: '#F6F5F3', borderRadius: '7px', padding: '8px 10px' }}>"{l.reason}"</div>
                  </div>
                </div>
                {l.final_status === 'pending_mentor' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => approveLeave(l.id, 'mentor', 'approved')} style={{ padding: '7px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✓ Approve (Mentor)</button>
                    <button onClick={() => approveLeave(l.id, 'mentor', 'rejected')} style={{ padding: '7px 16px', background: '#fff', color: '#DC2626', border: '1px solid #DC262630', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✕ Reject</button>
                  </div>
                )}
                {l.final_status === 'pending_manager' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => approveLeave(l.id, 'manager', 'approved')} style={{ padding: '7px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✓ Final Approve</button>
                    <button onClick={() => approveLeave(l.id, 'manager', 'rejected')} style={{ padding: '7px 16px', background: '#fff', color: '#DC2626', border: '1px solid #DC262630', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
            {leaveRequests.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No leave requests yet.</div>}
          </div>}

          {/* SETTINGS */}
          {view === 'settings' && <div style={{ maxWidth: '560px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Settings</h2>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '20px' }}>WhatsApp links appear on every intern dashboard.</p>
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>WhatsApp Links — {batches[0]?.name || 'Batch 7'}</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Batch WhatsApp Group Link</label>
                <input style={inp} type="text" placeholder="https://chat.whatsapp.com/..." value={settings.whatsapp_group_url} onChange={e => setSettings(p => ({ ...p, whatsapp_group_url: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>MarkeTrix Community Link</label>
                <input style={inp} type="text" placeholder="https://chat.whatsapp.com/..." value={settings.whatsapp_community_url} onChange={e => setSettings(p => ({ ...p, whatsapp_community_url: e.target.value }))} />
              </div>
              <button onClick={saveSettings} style={{ padding: '11px 28px', background: '#EE8256', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Save Links</button>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px 16px', fontSize: '12px', color: '#2563EB' }}>
              <strong>Current Batch:</strong> {batches[0] ? `${batches[0].name} · ${batches[0].start_date} to ${batches[0].end_date}` : 'No batch found'}
            </div>
          </div>}

        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
