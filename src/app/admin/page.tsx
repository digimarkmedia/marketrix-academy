'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()
  const [view, setView] = useState('overview')
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    const u = localStorage.getItem('mtx_user')
    if(!u){router.push('/login');return}
    const parsed = JSON.parse(u)
    if(parsed.role!=='admin'){router.push('/dashboard');return}
    setUser(parsed)
  },[router])

  const logout = () => { localStorage.clear(); router.push('/login') }

  const navItems = [
    {id:'overview',label:'Overview',icon:'⊞'},
    {id:'interns',label:'Manage Interns',icon:'👥'},
    {id:'tasks',label:'Tasks & Videos',icon:'✓'},
    {id:'classes',label:'Classes & Sessions',icon:'▶'},
    {id:'submissions',label:'Submissions',icon:'📄'},
    {id:'leave',label:'Leave Requests',icon:'📅'},
    {id:'settings',label:'Settings',icon:'⚙️'},
  ]

  if(!user) return null

  return (
    <div style={{display:'flex',minHeight:'100vh',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      {/* Admin sidebar */}
      <div style={{width:'220px',background:'#0F1117',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,height:'100vh',zIndex:50}}>
        <div style={{padding:'16px 14px',borderBottom:'1px solid #1F2937',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',background:'#EE8256',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',fontWeight:900,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>M</div>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#fff'}}>Admin Panel</div>
            <div style={{fontSize:'9px',color:'#6B7280',textTransform:'uppercase',letterSpacing:'.07em'}}>Management</div>
          </div>
        </div>
        <nav style={{padding:'10px',flex:1}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'9px',background:view===n.id?'rgba(238,130,86,.15)':'transparent',color:view===n.id?'#EE8256':'#9CA3AF',fontSize:'13px',fontFamily:"'DM Sans',sans-serif",fontWeight:view===n.id?600:500,border:'none',cursor:'pointer',marginBottom:'1px',textAlign:'left'}}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 14px',borderTop:'1px solid #1F2937',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#7C3AED',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>SS</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'12px',fontWeight:600,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>{user.name}</div>
            <div style={{fontSize:'9px',color:'#6B7280'}}>Super Admin</div>
          </div>
          <button onClick={logout} style={{color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>⇥</button>
        </div>
      </div>
      {/* Main */}
      <div style={{marginLeft:'220px',flex:1,background:'#FAFAFA'}}>
        <div style={{height:'52px',background:'#fff',borderBottom:'1px solid #EBEBEB',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontSize:'16px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#111827',textTransform:'capitalize'}}>{view}</div>
          <button onClick={()=>setView('interns')} style={{padding:'7px 16px',background:'#EE8256',color:'#fff',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>+ Add Intern</button>
        </div>
        <div style={{padding:'24px'}}>

          {/* OVERVIEW */}
          {view==='overview'&&<div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px'}}>
              {[['Active Interns','247','#111827','Batch 7'],['Submissions Today','89','#2563EB','62 AI-approved'],['Avg Confidence','47%','#EE8256','↑ 5% this week'],['Pending Leave','3','#D97706','Needs review']].map(([l,v,c,s])=>(
                <div key={l} style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'16px'}}>
                  <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'6px'}}>{l}</div>
                  <div style={{fontSize:'26px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:c}}>{v}</div>
                  <div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'2px'}}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'14px'}}>
              <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
                <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:'14px'}}>Interns Falling Behind</div>
                {[['Rohan Kumar','RK','Stuck on T03 · 5 days behind','#DC2626'],['Aisha Sheikh','AS','Stuck on T05 · 3 days behind','#D97706'],['Manish Patel','MP','Stuck on T06 · 2 days behind','#D97706']].map(([n,av,s,c])=>(
                  <div key={n} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',background:c+'08',border:`1px solid ${c}20`,borderRadius:'9px',marginBottom:'7px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:c+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700,color:c,fontFamily:"'DM Sans',sans-serif"}}>{av}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{n}</div>
                      <div style={{fontSize:'10px',color:c}}>{s}</div>
                    </div>
                    <button onClick={()=>setView('interns')} style={{fontSize:'10px',padding:'4px 10px',background:'#fff',border:`1px solid ${c}30`,color:c,borderRadius:'6px',fontWeight:600,cursor:'pointer'}}>Help</button>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
                <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:'12px'}}>Batch Status</div>
                {[['On track',180,'#16A34A'],['Slightly behind',52,'#D97706'],['Significantly behind',15,'#DC2626']].map(([l,n,c])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                    <span style={{fontSize:'12px',color:'#374151'}}>{l}</span>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'80px',height:'5px',background:'#F6F5F3',borderRadius:'99px',overflow:'hidden'}}>
                        <div style={{width:`${Math.round((n as number)/247*100)}%`,height:'100%',background:c,borderRadius:'99px'}}/>
                      </div>
                      <span style={{fontSize:'12px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:c}}>{n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* INTERNS */}
          {view==='interns'&&<div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div>
                <h2 style={{fontSize:'18px',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Intern Management</h2>
                <p style={{fontSize:'12px',color:'#6B7280',marginTop:'2px'}}>Add interns one by one or upload CSV to bulk-create accounts.</p>
              </div>
              <button style={{padding:'7px 14px',background:'#F6F5F3',color:'#374151',border:'1px solid #EBEBEB',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>📁 Upload CSV</button>
            </div>
            <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 16px',background:'#F6F5F3',borderBottom:'1px solid #EBEBEB',fontSize:'10px',fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.05em'}}>
                <div>Intern</div><div>Day</div><div>Points</div><div>Level</div><div>Actions</div>
              </div>
              {[{n:'Priya Sharma',av:'PS',day:16,pts:1450,lv:'Builder',lc:'#3B82F6'},{n:'Aryan Mehta',av:'AM',day:8,pts:875,lv:'Executor',lc:'#F59E0B'},{n:'Rohan Kumar',av:'RK',day:8,pts:320,lv:'Explorer',lc:'#94A3B8',behind:true},{n:'Divya Nair',av:'DN',day:10,pts:820,lv:'Executor',lc:'#F59E0B'}].map(u=>(
                <div key={u.n} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'12px 16px',borderTop:'1px solid #F6F5F3',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:u.lc+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700,color:u.lc,fontFamily:"'DM Sans',sans-serif"}}>{u.av}</div>
                    <span style={{fontSize:'13px',fontWeight:500,color:'#111827'}}>{u.n}</span>
                    {u.behind&&<span style={{fontSize:'8px',fontWeight:600,color:'#DC2626',background:'#FEF2F2',borderRadius:'99px',padding:'1px 7px'}}>Behind</span>}
                  </div>
                  <span style={{fontSize:'12px',fontFamily:"'JetBrains Mono',monospace",color:'#374151'}}>Day {u.day}</span>
                  <span style={{fontSize:'12px',fontFamily:"'JetBrains Mono',monospace",color:'#111827',fontWeight:600}}>{u.pts.toLocaleString()}</span>
                  <span style={{fontSize:'10px',fontWeight:600,color:u.lc,background:u.lc+'12',borderRadius:'99px',padding:'2px 9px',display:'inline-block'}}>{u.lv}</span>
                  <div style={{display:'flex',gap:'5px'}}>
                    <button style={{fontSize:'10px',padding:'4px 9px',background:'#FFF3ED',color:'#EE8256',border:'1px solid #F9C5AD',borderRadius:'6px',fontWeight:600,cursor:'pointer'}}>Extend</button>
                    <button style={{fontSize:'10px',padding:'4px 9px',background:'#F6F5F3',color:'#6B7280',borderRadius:'6px',fontWeight:500,cursor:'pointer'}}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* TASKS */}
          {view==='tasks'&&<div>
            <h2 style={{fontSize:'18px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:'4px'}}>Tasks & Videos</h2>
            <p style={{fontSize:'12px',color:'#6B7280',marginBottom:'16px'}}>Edit task details, add YouTube video URLs, and toggle AI review per task.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {[{id:'T01',day:1,title:'Research the Arena',cat:'Research',pts:50,ai:true,c:'#2563EB'},{id:'T02',day:2,title:'Study the Players',cat:'Research',pts:50,ai:true,c:'#2563EB'},{id:'T03',day:3,title:'Define Your Ideal Client',cat:'Strategy',pts:75,ai:true,c:'#7C3AED'},{id:'T08',day:8,title:'Give Your Brand a Voice',cat:'Audio',pts:125,ai:true,c:'#D97706',active:true}].map(t=>(
                <div key={t.id} style={{background:'#fff',border:`1px solid ${t.active?'#EE825640':'#EBEBEB'}`,borderRadius:'10px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'9px',background:t.c+'12',border:`1px solid ${t.c}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:t.c,flexShrink:0}}>{t.id}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                      <span style={{fontSize:'13px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{t.title}</span>
                      <span style={{fontSize:'8px',color:t.c,background:t.c+'15',borderRadius:'99px',padding:'1px 7px'}}>{t.cat}</span>
                    </div>
                    <div style={{fontSize:'10px',color:'#9CA3AF'}}>Day {t.day} · +{t.pts} pts · Add video_url in Supabase tasks table</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginRight:'4px'}}>
                    <span style={{fontSize:'10px',color:'#6B7280'}}>AI Review</span>
                    <div style={{width:'36px',height:'20px',borderRadius:'99px',background:t.ai?'#16A34A':'#D4D4D4',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                      <div style={{position:'absolute',top:'3px',left:t.ai?'17px':'3px',width:'14px',height:'14px',borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                    </div>
                  </div>
                  <button style={{padding:'7px 14px',background:'#F6F5F3',color:'#374151',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>Edit Task</button>
                </div>
              ))}
            </div>
          </div>}

          {/* SETTINGS */}
          {view==='settings'&&<div style={{maxWidth:'560px'}}>
            <h2 style={{fontSize:'18px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:'4px'}}>Settings</h2>
            <p style={{fontSize:'12px',color:'#6B7280',marginBottom:'20px'}}>Manage WhatsApp links, batch config, and AI review settings.</p>
            <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px',marginBottom:'12px'}}>
              <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:'14px'}}>Batch 7 — WhatsApp Links</div>
              {['WhatsApp Group Link (batch-specific)','WhatsApp Community Link (all batches)'].map(l=>(
                <div key={l} style={{marginBottom:'12px'}}>
                  <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</label>
                  <input type="text" placeholder="https://chat.whatsapp.com/..." style={{width:'100%',padding:'11px 14px',border:'1px solid #EBEBEB',borderRadius:'9px',fontSize:'13px',color:'#111827',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
                </div>
              ))}
              <button style={{padding:'8px 18px',background:'#EE8256',color:'#fff',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Save Links</button>
            </div>
          </div>}

          {/* OTHER VIEWS */}
          {['classes','submissions','leave'].includes(view)&&<div style={{textAlign:'center',padding:'60px'}}>
            <div style={{fontSize:'40px',marginBottom:'16px'}}>{view==='classes'?'▶':view==='submissions'?'📄':'📅'}</div>
            <div style={{fontSize:'18px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'8px',textTransform:'capitalize'}}>{view}</div>
            <div style={{fontSize:'13px',color:'#6B7280'}}>This section is connected to your Supabase database.<br/>Add data via the admin controls above.</div>
          </div>}

        </div>
      </div>
    </div>
  )
}
