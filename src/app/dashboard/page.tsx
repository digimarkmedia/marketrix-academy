'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  return (
    <AppLayout>
      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        {/* Confidence card */}
        <div style={{background:'#0F1117',borderRadius:'16px',padding:'22px 26px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
            <div>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'6px'}}>Confidence Score</div>
              <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'8px'}}>
                <span style={{fontSize:'52px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#F59E0B',lineHeight:1}}>42</span>
                <span style={{fontSize:'14px',color:'#6B7280',fontFamily:"'JetBrains Mono',monospace"}}>/100</span>
              </div>
              <span style={{fontSize:'11px',fontWeight:'600',color:'#F59E0B',background:'#F59E0B20',border:'1px solid #F59E0B30',borderRadius:'99px',padding:'3px 12px'}}>⚡ Executor Level</span>
            </div>
            <div style={{position:'relative',width:'90px',height:'90px'}}>
              <svg width="90" height="90" style={{transform:'rotate(-90deg)'}}>
                <circle cx="45" cy="45" r="37" fill="none" stroke="#1F2937" strokeWidth="8"/>
                <circle cx="45" cy="45" r="37" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="97 233" strokeLinecap="round"/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:'16px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#F59E0B'}}>42%</span>
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid #1F2937'}}>
            {[['Tasks','70%'],['Attendance','78%'],['Submissions','7/20'],['Points','875']].map(([l,v])=>(
              <div key={l} style={{padding:'11px 16px',borderRight:'1px solid #1F2937',background:'#0D1117'}}>
                <div style={{fontSize:'9px',color:'#9CA3AF',marginBottom:'3px'}}>{l}</div>
                <div style={{fontSize:'14px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#F59E0B',marginBottom:'3px'}}>{v}</div>
                <div style={{height:'3px',background:'#1F2937',borderRadius:'99px',overflow:'hidden'}}>
                  <div style={{width:typeof v==='string'&&v.includes('%')?v:'35%',height:'100%',background:'#F59E0B',borderRadius:'99px'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
          {[['Tasks Done','7','of 20 missions','#EE8256'],['Points','875','Rank #4 in batch','#111827'],['Attendance','78%','Need 80% for cert','#D97706'],['Streak','5 days','Top 20% of batch','#D97706']].map(([l,v,s,c])=>(
            <div key={l} style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'6px'}}>{l}</div>
              <div style={{fontSize:'26px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:c}}>{v}</div>
              <div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'2px'}}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:'14px'}}>
          {/* Active Task */}
          <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px'}}>
            <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>Active Task — Due in 18h 42m</div>
            <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'6px'}}>
              <span style={{fontSize:'9px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#EE8256',background:'#FFF3ED',border:'1px solid #F9C5AD',borderRadius:'5px',padding:'2px 7px'}}>T08 · DAY 8</span>
              <span style={{fontSize:'9px',color:'#D97706',background:'#FFFBEB',border:'1px solid #D9770622',borderRadius:'99px',padding:'2px 8px',fontWeight:600}}>Audio</span>
            </div>
            <div style={{fontSize:'18px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'4px'}}>Give Your Brand a Voice</div>
            <div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.6,marginBottom:'12px'}}>Clone your voice with ElevenLabs. Create 2 ad voiceovers — one cold, one warm. Submit your Google Drive link before the deadline.</div>
            <div style={{background:'#F6F5F3',borderRadius:'10px',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <div style={{display:'flex',gap:'12px'}}>
                {[['18','hrs'],['42','min'],['27','sec']].map(([n,l])=>(
                  <div key={l} style={{textAlign:'center'}}>
                    <div style={{fontSize:'20px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#111827'}}>{n}</div>
                    <div style={{fontSize:'9px',color:'#9CA3AF'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:'10px',color:'#6B7280',textAlign:'right'}}>Opened 7PM IST<br/>Closes tomorrow 9PM</div>
            </div>
            <button onClick={()=>router.push('/tasks')} style={{width:'100%',padding:'11px',background:'#EE8256',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Open Task →</button>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {/* WhatsApp links */}
            <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>Batch 7 Community</div>
              {[['Batch 7 WhatsApp Group','Updates & discussions','#16A34A','#F0FDF4','#BBF7D0'],['MarkeTrix Community','All batches · Network','#2563EB','#EFF6FF','#BFDBFE']].map(([t,s,c,bg,bd])=>(
                <a key={t} href="#" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',background:bg,border:`1px solid ${bd}`,borderRadius:'9px',textDecoration:'none',marginBottom:'7px'}}>
                  <div style={{width:'28px',height:'28px',background:c,borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>💬</div>
                  <div>
                    <div style={{fontSize:'12px',fontWeight:'600',fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{t}</div>
                    <div style={{fontSize:'10px',color:'#6B7280'}}>{s}</div>
                  </div>
                </a>
              ))}
            </div>
            {/* AI Review */}
            <div style={{background:'#F5F3FF',border:'1px solid #7C3AED25',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>AI Review — T07</div>
              <div style={{fontSize:'13px',fontWeight:'600',fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'6px'}}>Show Your Face — Reviewed</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{fontSize:'28px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:'#D97706'}}>82</div>
                <div>
                  <span style={{fontSize:'9px',fontWeight:600,color:'#D97706',background:'#FFFBEB',border:'1px solid #D9770625',borderRadius:'99px',padding:'1px 8px',display:'block',marginBottom:'3px'}}>Needs Improvement</span>
                  <div style={{fontSize:'10px',color:'#6B7280'}}>+10% confidence · +100 pts</div>
                </div>
              </div>
              <div style={{fontSize:'11px',color:'#374151',lineHeight:1.6,fontStyle:'italic'}}>"Great avatar setup, but your self-shot video lighting needs work. Natural light from a window beats any ring light."</div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          {[
            {title:'Live Classes',sessions:[{t:'Monday Training — Week 2',d:'Jun 9 · 7:00–9:00 PM IST',unlocked:true,c:'#16A34A',bg:'#F0FDF4',bd:'#BBF7D0'},{t:'Monday Training — Week 3',d:'Jun 16 · 7:00 PM · Complete tasks to unlock',unlocked:false,c:'#9CA3AF',bg:'#F6F5F3',bd:'#EBEBEB'}]},
            {title:'Doubt Sessions',sessions:[{t:'Saturday Doubt Call',d:'Jun 14 · 7:00–8:00 PM IST',unlocked:true,c:'#7C3AED',bg:'#F5F3FF',bd:'#DDD6FE'}]},
          ].map(({title,sessions})=>(
            <div key={title} style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>{title}</div>
              {sessions.map(s=>(
                <div key={s.t} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',background:s.bg,border:`1px solid ${s.bd}`,borderRadius:'10px',marginBottom:'8px',opacity:s.unlocked?1:.6}}>
                  <div style={{width:'36px',height:'36px',background:s.c,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>▶</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',fontWeight:'600',fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{s.t}</div>
                    <div style={{fontSize:'10px',color:'#6B7280',marginTop:'1px'}}>{s.d}</div>
                  </div>
                  {s.unlocked?<a href="#" style={{fontSize:'11px',fontWeight:'600',color:s.c,background:'#fff',border:`1px solid ${s.bd}`,borderRadius:'7px',padding:'4px 12px',textDecoration:'none'}}>Join</a>:<span style={{fontSize:'10px',color:'#9CA3AF'}}>🔒</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
