'use client'
import AppLayout from '@/components/layout/AppLayout'

export default function Classes() {
  const sessions = [
    {type:'class',title:'Monday Training — Week 2',date:'Mon Jun 9',time:'7:00–9:00 PM IST',link:'#',unlocked:true,desc:'Meta Ads campaign structure & budget optimization'},
    {type:'doubt',title:'Saturday Doubt Call',date:'Sat Jun 14',time:'7:00–8:00 PM IST',link:'#',unlocked:true,desc:'Open Q&A — bring your questions'},
    {type:'class',title:'Monday Training — Week 3',date:'Mon Jun 16',time:'7:00 PM IST',unlocked:false,desc:'Landing page builds & conversion optimization. Submit T08–T14 to unlock.'},
    {type:'doubt',title:'Saturday Doubt Call',date:'Sat Jun 21',time:'7:00–8:00 PM IST',unlocked:false,desc:'Open Q&A session'},
  ]
  return (
    <AppLayout>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'4px'}}>Live Classes & Doubt Sessions</h2>
        <p style={{fontSize:'13px',color:'#6B7280'}}>Weekly Monday training + Saturday doubt calls. Complete all previous week tasks to unlock next class.</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {sessions.map((s,i)=>(
          <div key={i} style={{background:'#fff',border:`1px solid ${s.unlocked?s.type==='class'?'#16A34A30':'#7C3AED30':'#EBEBEB'}`,borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',gap:'14px',opacity:s.unlocked?1:.65}}>
            <div style={{width:'44px',height:'44px',borderRadius:'10px',background:s.unlocked?s.type==='class'?'#16A34A':'#7C3AED':'#D4D4D4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>
              {s.type==='class'?'▶':'❓'}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'3px'}}>
                <span style={{fontSize:'8px',fontWeight:600,color:s.type==='class'?'#16A34A':'#7C3AED',background:s.type==='class'?'#F0FDF4':'#F5F3FF',borderRadius:'99px',padding:'1px 8px',textTransform:'uppercase',letterSpacing:'.05em'}}>{s.type==='class'?'Live Class':'Doubt Session'}</span>
              </div>
              <div style={{fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'2px'}}>{s.title}</div>
              <div style={{fontSize:'11px',color:'#6B7280'}}>{s.date} · {s.time}</div>
              <div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'3px'}}>{s.desc}</div>
            </div>
            {s.unlocked
              ?<a href={s.link} style={{padding:'9px 18px',background:s.type==='class'?'#16A34A':'#7C3AED',color:'#fff',borderRadius:'9px',fontSize:'12px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",textDecoration:'none',whiteSpace:'nowrap'}}>Join</a>
              :<div style={{textAlign:'center'}}><div style={{padding:'8px 14px',background:'#F6F5F3',borderRadius:'9px',fontSize:'11px',fontWeight:600,color:'#9CA3AF'}}>🔒 Locked</div><div style={{fontSize:'9px',color:'#9CA3AF',marginTop:'3px'}}>Submit tasks to unlock</div></div>
            }
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
