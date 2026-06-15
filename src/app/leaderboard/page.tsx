'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'

export default function Leaderboard() {
  const [board, setBoard] = useState<any[]>([])
  const [myId, setMyId] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadBoard()
  }, [])

  const loadBoard = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) setMyId(session.user.id)
    const { data } = await supabase.from('profiles').select('id,full_name,total_points,confidence_level,streak_days').eq('role','intern').order('total_points', { ascending: false }).limit(20)
    if (data && data.length > 0) {
      setBoard(data)
    } else {
      // Demo data
      setBoard([
        {id:'1',full_name:'Priya Sharma',total_points:1450,confidence_level:'Builder',streak_days:12},
        {id:'2',full_name:'Rahul Gupta',total_points:1320,confidence_level:'Builder',streak_days:9},
        {id:'3',full_name:'Sneha Joshi',total_points:1190,confidence_level:'Builder',streak_days:7},
        {id:'demo',full_name:'Aryan Mehta',total_points:875,confidence_level:'Executor',streak_days:5},
        {id:'5',full_name:'Divya Nair',total_points:820,confidence_level:'Executor',streak_days:4},
      ])
    }
  }

  const levelColor: any = { Explorer:'#94A3B8', Executor:'#F59E0B', Builder:'#3B82F6', Strategist:'#8B5CF6', 'Client Ready':'#16A34A' }

  return (
    <AppLayout>
      <div style={{marginBottom:'16px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,color:'#111827',marginBottom:'4px'}}>Batch 7 Leaderboard</h2>
        <p style={{fontSize:'13px',color:'#6B7280'}}>Points earned from task submissions. Consistent daily work = top of the board.</p>
      </div>
      {/* Level bands */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px',marginBottom:'16px'}}>
        {[{l:'Explorer',c:'#94A3B8',r:'0–20%'},{l:'Executor',c:'#F59E0B',r:'20–40%'},{l:'Builder',c:'#3B82F6',r:'40–65%'},{l:'Strategist',c:'#8B5CF6',r:'65–85%'},{l:'Client Ready',c:'#16A34A',r:'85–100%'}].map(lv=>(
          <div key={lv.l} style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:'11px',fontWeight:700,color:'#111827',marginBottom:'2px'}}>{lv.l}</div>
            <div style={{fontSize:'9px',color:'#9CA3AF'}}>{lv.r}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
        <div style={{fontSize:'14px',fontWeight:700,marginBottom:'14px'}}>Rankings — Batch 7</div>
        {board.map((p,i)=>{
          const lc = levelColor[p.confidence_level] || '#94A3B8'
          const isMe = p.id === myId || (p.id === 'demo' && !myId)
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'9px',background:isMe?'#FFF3ED':'transparent',border:`1px solid ${isMe?'#F9C5AD':'transparent'}`,marginBottom:'4px'}}>
              <span style={{fontSize:'12px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:i<3?'#D97706':'#9CA3AF',width:'24px',textAlign:'center'}}>#{i+1}</span>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:lc+'18',border:`1.5px solid ${lc}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:lc,flexShrink:0}}>
                {p.full_name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:'7px',alignItems:'center'}}>
                  <span style={{fontSize:'13px',fontWeight:600,color:'#111827'}}>{p.full_name}</span>
                  {isMe&&<span style={{fontSize:'8px',fontWeight:600,color:'#EE8256',background:'#FFF3ED',border:'1px solid #F9C5AD',borderRadius:'99px',padding:'1px 7px'}}>You</span>}
                  <span style={{fontSize:'8px',fontWeight:600,color:lc,background:lc+'12',border:`1px solid ${lc}20`,borderRadius:'99px',padding:'1px 7px'}}>{p.confidence_level||'Explorer'}</span>
                </div>
                <div style={{fontSize:'10px',color:'#9CA3AF',marginTop:'1px'}}>⚡{p.streak_days||0} day streak</div>
              </div>
              <span style={{fontSize:'14px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#111827'}}>{(p.total_points||0).toLocaleString()}</span>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
export const dynamic = 'force-dynamic'
