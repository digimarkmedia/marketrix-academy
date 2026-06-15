export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const u = localStorage.getItem('mtx_user')
    if (!u) { router.push('/login'); return }
    const user = JSON.parse(u)
    try {
      // Try to get real profile from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (prof) setProfile(prof)
        const { data: subs } = await supabase.from('submissions').select('*, tasks(task_code,title,points)').eq('intern_id', session.user.id).order('created_at', { ascending: false }).limit(5)
        if (subs) setSubmissions(subs)
        // Get batch
        if (prof?.batch_id) {
          const { data: b } = await supabase.from('batches').select('*').eq('id', prof.batch_id).single()
          if (b) setBatch(b)
        }
      } else {
        // Demo mode
        setProfile({ full_name: user.name, email: user.email, confidence_score: 42, confidence_level: 'Executor', total_points: 875, streak_days: 5 })
      }
      const { data: t } = await supabase.from('tasks').select('*').order('task_number').limit(10)
      if (t) setTasks(t)
      const { data: m } = await supabase.from('meetings').select('*').order('meeting_date').limit(4)
      if (m) setMeetings(m)
    } catch (e) {
      const user = JSON.parse(u)
      setProfile({ full_name: user.name, email: user.email, confidence_score: 42, confidence_level: 'Executor', total_points: 875, streak_days: 5 })
    }
    setLoading(false)
  }

  const activeTask = tasks.find(t => t.day_number === 8) || tasks[7]
  const lastReview = submissions[0]

  if (loading) return <AppLayout><div style={{textAlign:'center',padding:'60px',color:'#9CA3AF'}}>Loading...</div></AppLayout>

  return (
    <AppLayout>
      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        {/* Confidence card */}
        <div style={{background:'#0F1117',borderRadius:'16px',padding:'22px 26px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
            <div>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'6px'}}>Confidence Score</div>
              <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'8px'}}>
                <span style={{fontSize:'52px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#F59E0B',lineHeight:1}}>{profile?.confidence_score || 0}</span>
                <span style={{fontSize:'14px',color:'#6B7280',fontFamily:'JetBrains Mono,monospace'}}>/100</span>
              </div>
              <span style={{fontSize:'11px',fontWeight:600,color:'#F59E0B',background:'#F59E0B20',border:'1px solid #F59E0B30',borderRadius:'99px',padding:'3px 12px'}}>⚡ {profile?.confidence_level || 'Explorer'}</span>
            </div>
            <div style={{position:'relative',width:'90px',height:'90px'}}>
              <svg width="90" height="90" style={{transform:'rotate(-90deg)'}}>
                <circle cx="45" cy="45" r="37" fill="none" stroke="#1F2937" strokeWidth="8"/>
                <circle cx="45" cy="45" r="37" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray={`${2.32*(profile?.confidence_score||0)} 233`} strokeLinecap="round"/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:'16px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#F59E0B'}}>{profile?.confidence_score || 0}%</span>
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid #1F2937'}}>
            {[
              ['Tasks Done', `${submissions.length}/20`],
              ['Streak', `${profile?.streak_days || 0} days`],
              ['Points', profile?.total_points || 0],
              ['Level', profile?.confidence_level || 'Explorer'],
            ].map(([l,v])=>(
              <div key={String(l)} style={{padding:'11px 16px',borderRight:'1px solid #1F2937',background:'#0D1117'}}>
                <div style={{fontSize:'9px',color:'#9CA3AF',marginBottom:'3px'}}>{l}</div>
                <div style={{fontSize:'14px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#F59E0B'}}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:'14px'}}>
          {/* Active Task */}
          <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
            <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>Active Task</div>
            {activeTask ? <>
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'6px'}}>
                <span style={{fontSize:'9px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#EE8256',background:'#FFF3ED',border:'1px solid #F9C5AD',borderRadius:'5px',padding:'2px 7px'}}>{activeTask.task_code} · DAY {activeTask.day_number}</span>
                <span style={{fontSize:'9px',color:'#D97706',background:'#FFFBEB',border:'1px solid #D9770622',borderRadius:'99px',padding:'2px 8px',fontWeight:600}}>{activeTask.category}</span>
              </div>
              <div style={{fontSize:'18px',fontWeight:700,color:'#111827',marginBottom:'4px'}}>{activeTask.title}</div>
              <div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.6,marginBottom:'14px'}}>{activeTask.mission_title}</div>
              <button onClick={()=>router.push('/tasks')} style={{width:'100%',padding:'11px',background:'#EE8256',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>Open Task →</button>
            </> : <div style={{fontSize:'13px',color:'#9CA3AF',textAlign:'center',padding:'20px'}}>No active task. Check your tasks page.</div>}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {/* WhatsApp links */}
            <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>Community</div>
              {batch?.whatsapp_group_url ? <>
                <a href={batch.whatsapp_group_url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'9px',textDecoration:'none',marginBottom:'7px'}}>
                  <div style={{width:'28px',height:'28px',background:'#16A34A',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>💬</div>
                  <div><div style={{fontSize:'12px',fontWeight:600,color:'#111827'}}>Batch WhatsApp Group</div><div style={{fontSize:'10px',color:'#6B7280'}}>Updates & discussions</div></div>
                </a>
                {batch?.whatsapp_community_url && <a href={batch.whatsapp_community_url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'9px',textDecoration:'none'}}>
                  <div style={{width:'28px',height:'28px',background:'#2563EB',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>💬</div>
                  <div><div style={{fontSize:'12px',fontWeight:600,color:'#111827'}}>MarkeTrix Community</div><div style={{fontSize:'10px',color:'#6B7280'}}>All batches · Network</div></div>
                </a>}
              </> : <div style={{fontSize:'12px',color:'#9CA3AF',textAlign:'center',padding:'8px'}}>WhatsApp links will appear here once admin adds them.</div>}
            </div>
            {/* Last AI review */}
            {lastReview && <div style={{background:'#F5F3FF',border:'1px solid #7C3AED25',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>Last AI Review — {lastReview.tasks?.task_code}</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{fontSize:'28px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#D97706'}}>{lastReview.ai_score || '—'}</div>
                <div>
                  <span style={{fontSize:'9px',fontWeight:600,color:'#D97706',background:'#FFFBEB',border:'1px solid #D9770625',borderRadius:'99px',padding:'1px 8px',display:'block',marginBottom:'3px'}}>{lastReview.ai_status}</span>
                  <div style={{fontSize:'10px',color:'#6B7280'}}>+{lastReview.ai_confidence_delta || 0}% confidence · +{lastReview.ai_points_awarded || 0} pts</div>
                </div>
              </div>
              <div style={{fontSize:'11px',color:'#374151',lineHeight:1.6,fontStyle:'italic'}}>"{lastReview.ai_headline}"</div>
            </div>}
          </div>
        </div>

        {/* Sessions */}
        {meetings.length > 0 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          {meetings.slice(0,2).map(m=>(
            <div key={m.id} style={{background:'#fff',border:`1px solid ${m.meeting_type==='class'?'#16A34A30':'#7C3AED30'}`,borderRadius:'12px',padding:'14px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'36px',height:'36px',background:m.meeting_type==='class'?'#16A34A':'#7C3AED',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>▶</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px',fontWeight:600,color:'#111827',marginBottom:'2px'}}>{m.title}</div>
                <div style={{fontSize:'10px',color:'#6B7280'}}>{m.meeting_date} · {m.start_time} IST</div>
              </div>
              <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" style={{fontSize:'11px',fontWeight:600,color:m.meeting_type==='class'?'#16A34A':'#7C3AED',background:'#fff',border:`1px solid ${m.meeting_type==='class'?'#BBF7D0':'#DDD6FE'}`,borderRadius:'7px',padding:'4px 12px',textDecoration:'none'}}>Join</a>
            </div>
          ))}
        </div>}
      </div>
    </AppLayout>
  )
}
export const dynamic = 'force-dynamic'
