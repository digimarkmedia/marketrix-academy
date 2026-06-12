'use client'
import AppLayout from '@/components/layout/AppLayout'

const LB = [
  {rank:1,name:'Priya Sharma',av:'PS',pts:1450,tasks:16,streak:12,level:'Builder',lc:'#3B82F6'},
  {rank:2,name:'Rahul Gupta',av:'RG',pts:1320,tasks:14,streak:9,level:'Builder',lc:'#3B82F6'},
  {rank:3,name:'Sneha Joshi',av:'SJ',pts:1190,tasks:13,streak:7,level:'Builder',lc:'#3B82F6'},
  {rank:4,name:'Aryan Mehta',av:'AM',pts:875,tasks:7,streak:5,level:'Executor',lc:'#F59E0B',me:true},
  {rank:5,name:'Divya Nair',av:'DN',pts:820,tasks:8,streak:4,level:'Executor',lc:'#F59E0B'},
  {rank:6,name:'Karan Patel',av:'KP',pts:755,tasks:7,streak:3,level:'Executor',lc:'#F59E0B'},
  {rank:7,name:'Meera Singh',av:'MS',pts:680,tasks:6,streak:2,level:'Explorer',lc:'#94A3B8'},
]

export default function Leaderboard() {
  return (
    <AppLayout>
      <div style={{marginBottom:'16px'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'4px'}}>Batch 7 Leaderboard</h2>
        <p style={{fontSize:'13px',color:'#6B7280'}}>Points earned from task submissions. Consistent daily work = top of the board.</p>
      </div>
      {/* Level bands */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px',marginBottom:'16px'}}>
        {[{l:'Explorer',c:'#94A3B8',r:'0–20%'},{l:'Executor',c:'#F59E0B',r:'20–40%',me:true},{l:'Builder',c:'#3B82F6',r:'40–65%'},{l:'Strategist',c:'#8B5CF6',r:'65–85%'},{l:'Client Ready',c:'#16A34A',r:'85–100%'}].map(lv=>(
          <div key={lv.l} style={{background:lv.me?lv.c+'12':'#fff',border:`1px solid ${lv.me?lv.c+'30':'#EBEBEB'}`,borderRadius:'10px',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:'11px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:lv.me?lv.c:'#111827',marginBottom:'2px'}}>{lv.l}</div>
            <div style={{fontSize:'9px',color:'#9CA3AF'}}>{lv.r}</div>
            {lv.me&&<div style={{fontSize:'8px',fontWeight:600,color:lv.c,marginTop:'4px'}}>Your Level</div>}
          </div>
        ))}
      </div>
      {/* Rankings */}
      <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
        <div style={{fontSize:'14px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",marginBottom:'14px'}}>Rankings</div>
        {LB.map(p=>(
          <div key={p.rank} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'9px',background:p.me?'#FFF3ED':'transparent',border:`1px solid ${p.me?'#F9C5AD':'transparent'}`,marginBottom:'4px'}}>
            <span style={{fontSize:'12px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:p.rank<=3?'#D97706':'#9CA3AF',width:'24px',textAlign:'center'}}>#{p.rank}</span>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:p.lc+'18',border:`1.5px solid ${p.lc}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:p.lc,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{p.av}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:'7px',alignItems:'center'}}>
                <span style={{fontSize:'13px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{p.name}</span>
                {p.me&&<span style={{fontSize:'8px',fontWeight:600,color:'#EE8256',background:'#FFF3ED',border:'1px solid #F9C5AD',borderRadius:'99px',padding:'1px 7px'}}>You</span>}
                <span style={{fontSize:'8px',fontWeight:600,color:p.lc,background:p.lc+'12',border:`1px solid ${p.lc}20`,borderRadius:'99px',padding:'1px 7px'}}>{p.level}</span>
              </div>
              <div style={{fontSize:'10px',color:'#9CA3AF',marginTop:'1px'}}>{p.tasks} tasks · ⚡{p.streak} day streak</div>
            </div>
            <span style={{fontSize:'14px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:'#111827'}}>{p.pts.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
