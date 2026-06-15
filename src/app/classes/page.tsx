'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'

export default function Classes() {
  const [sessions, setSessions] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    const { data } = await supabase.from('meetings').select('*').order('meeting_date')
    if (data && data.length > 0) {
      setSessions(data)
    } else {
      setSessions([
        {id:'1',meeting_type:'class',title:'Monday Training — Week 1',meeting_date:'2026-06-09',start_time:'19:00',end_time:'21:00',meeting_link:'#',description:'Meta Ads campaign structure & budget optimization',unlocked:true},
        {id:'2',meeting_type:'doubt',title:'Saturday Doubt Call',meeting_date:'2026-06-14',start_time:'19:00',end_time:'20:00',meeting_link:'#',description:'Open Q&A — bring your questions',unlocked:true},
      ])
    }
  }

  return (
    <AppLayout>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,color:'#111827',marginBottom:'4px'}}>Live Classes & Doubt Sessions</h2>
        <p style={{fontSize:'13px',color:'#6B7280'}}>Weekly Monday training + Saturday doubt calls. Complete all previous week tasks to unlock next class.</p>
      </div>
      {sessions.length === 0 && <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',fontSize:'13px'}}>No sessions scheduled yet. Admin will add them soon.</div>}
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {sessions.map(s=>(
          <div key={s.id} style={{background:'#fff',border:`1px solid ${s.meeting_type==='class'?'#16A34A30':'#7C3AED30'}`,borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',gap:'14px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'10px',background:s.meeting_type==='class'?'#16A34A':'#7C3AED',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>
              {s.meeting_type==='class'?'▶':'❓'}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'3px'}}>
                <span style={{fontSize:'8px',fontWeight:600,color:s.meeting_type==='class'?'#16A34A':'#7C3AED',background:s.meeting_type==='class'?'#F0FDF4':'#F5F3FF',borderRadius:'99px',padding:'1px 8px',textTransform:'uppercase',letterSpacing:'.05em'}}>{s.meeting_type==='class'?'Live Class':'Doubt Session'}</span>
              </div>
              <div style={{fontSize:'14px',fontWeight:600,color:'#111827',marginBottom:'2px'}}>{s.title}</div>
              <div style={{fontSize:'11px',color:'#6B7280'}}>{s.meeting_date} · {s.start_time} – {s.end_time} IST</div>
              {s.description&&<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'3px'}}>{s.description}</div>}
            </div>
            <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" style={{padding:'9px 18px',background:s.meeting_type==='class'?'#16A34A':'#7C3AED',color:'#fff',borderRadius:'9px',fontSize:'12px',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>Join</a>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
export const dynamic = 'force-dynamic'
