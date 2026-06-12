'use client'
import { useState, useRef } from 'react'
import AppLayout from '@/components/layout/AppLayout'

const TASKS = [
  {id:'T01',day:1,title:'Research the Arena',sub:'Meta Ads & YouTube Research',cat:'Research',pts:50,done:true},
  {id:'T02',day:2,title:'Study the Players',sub:'Instagram & LinkedIn Research',cat:'Research',pts:50,done:true},
  {id:'T03',day:3,title:'Define Your Ideal Client',sub:'ICP + Content Calendar',cat:'Strategy',pts:75,done:true},
  {id:'T04',day:4,title:'Build Your Digital Home',sub:'Profile Setup',cat:'Execution',pts:75,done:true},
  {id:'T05',day:5,title:'Find Your Voice',sub:'Write 10 Social Posts',cat:'Content',pts:100,done:true},
  {id:'T06',day:6,title:'Design That Stops Scroll',sub:'Instagram Post Design',cat:'Design',pts:100,done:true},
  {id:'T07',day:7,title:'Show Your Face',sub:'AI Avatar + Self Video',cat:'Video',pts:125,done:true},
  {id:'T08',day:8,title:'Give Your Brand a Voice',sub:'AI Voice Clone',cat:'Audio',pts:125,active:true},
  {id:'T09',day:9,title:'Own Your Corner',sub:'Personal Brand Website',cat:'Web',pts:150},
  {id:'T10',day:10,title:'Hunt Real Opportunities',sub:'Local Business Research',cat:'Research',pts:75},
  {id:'T11',day:11,title:'Write Words That Sell',sub:'Landing Page Copy',cat:'Copy',pts:100},
  {id:'T12',day:12,title:'Build the Machine',sub:'Landing Page Live',cat:'Web',pts:150},
  {id:'T13',day:13,title:'Create 10 Weapons',sub:'Ad Copies + Designs',cat:'Ads',pts:150},
  {id:'T14',day:14,title:'Go Authentic',sub:'UGC Scripts + Videos',cat:'Video',pts:150},
  {id:'T15',day:15,title:'Attack a Niche',sub:'Gym Research + Creatives',cat:'Ads',pts:125},
  {id:'T16',day:16,title:'Launch Like a Pro',sub:'Meta Ads Campaign',cat:'Ads',pts:200},
  {id:'T17',day:17,title:'Speak Client Language',sub:'Client Reporting Sheet',cat:'Strategy',pts:100},
  {id:'T18',day:18,title:'30 Conversations',sub:'Outreach + Pitch',cat:'Sales',pts:200},
  {id:'T19',day:19,title:'Sell the Internship',sub:'Program Ad Creatives',cat:'Ads',pts:175},
  {id:'T20',day:20,title:'Present to the World',sub:'Portfolio Complete',cat:'Portfolio',pts:250},
]

const CC:any = {Research:'#2563EB',Strategy:'#7C3AED',Execution:'#EE8256',Content:'#EE8256',Design:'#EC4899',Video:'#D97706',Audio:'#D97706',Web:'#16A34A',Copy:'#7C3AED',Ads:'#EE8256',Sales:'#16A34A',Portfolio:'#7C3AED'}

export default function TasksPage() {
  const [selected, setSelected] = useState<any>(null)
  const [phase, setPhase] = useState<'lesson'|'submit'|'done'>('lesson')
  const [watched, setWatched] = useState(false)
  const [watchPct, setWatchPct] = useState(0)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const watchTimer = useRef<any>(null)

  const openTask = (t:any) => {
    const s = t.done?'done':t.active?'active':'locked'
    if(s==='locked') return
    setSelected(t)
    setPhase('lesson')
    setWatched(t.done)
    setWatchPct(t.done?100:0)
    setUrl(''); setNote(''); setResult(null)
  }

  const startWatch = () => {
    if(watched||watchTimer.current) return
    watchTimer.current = setInterval(()=>{
      setWatchPct(p=>{
        const n = Math.min(p+2,100)
        if(n>=100){ clearInterval(watchTimer.current); watchTimer.current=null; setWatched(true) }
        return n
      })
    },150)
  }

  const forceWatch = () => {
    if(watchTimer.current){clearInterval(watchTimer.current);watchTimer.current=null}
    setWatchPct(100); setWatched(true)
  }

  const handleSubmit = async () => {
    if(!url.trim()){alert('Please add your submission link'); return}
    setSubmitting(true)
    try {
      const res = await fetch('/api/ai-review',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({taskCode:selected.id,taskTitle:selected.title,taskDescription:selected.sub,taskPoints:selected.pts,submission:url})})
      const data = await res.json()
      setResult(data)
      setPhase('done')
    } catch {
      setResult({score:75,status:'Needs Improvement',headline:'Good effort — a few gaps to close.',mentor_note:'You have shown genuine understanding of the task. Push for more specificity and detail.',strengths:['Clear understanding of requirements','Correct format followed'],next_steps:['Add more specific detail','Review lesson benchmarks'],growth_insight:'This skill is what clients pay premium rates for.',points_awarded:Math.round(selected.pts*.75),confidence_delta:8})
      setPhase('done')
    }
    setSubmitting(false)
  }

  if(selected) return (
    <AppLayout>
      <div style={{maxWidth:'800px'}}>
        {/* Steps */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <button onClick={()=>setSelected(null)} style={{fontSize:'12px',padding:'6px 14px',border:'1px solid #EBEBEB',borderRadius:'8px',background:'transparent',color:'#6B7280',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>← All Tasks</button>
          <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
            {['lesson','submit','done'].map((s,i)=>{
              const done=['lesson','submit','done'].indexOf(phase)>i,active=phase===s
              const labels=['Watch Lesson','Submit Task','AI Review']
              return <div key={s} style={{display:'flex',alignItems:'center',gap:'3px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <div style={{width:'20px',height:'20px',borderRadius:'50%',background:done?'#16A34A':active?'#EE8256':'#F6F5F3',border:`1.5px solid ${done?'#16A34A':active?'#EE8256':'#D4D4D4'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700,color:done||active?'#fff':'#9CA3AF',fontFamily:"'JetBrains Mono',monospace"}}>{done?'✓':i+1}</div>
                  <span style={{fontSize:'10px',fontWeight:done||active?600:400,fontFamily:"'DM Sans',sans-serif",color:done?'#16A34A':active?'#111827':'#9CA3AF'}}>{labels[i]}</span>
                </div>
                {i<2&&<div style={{width:'20px',height:'1.5px',background:done?'#16A34A':'#EBEBEB',margin:'0 2px'}}/>}
              </div>
            })}
          </div>
        </div>
        {/* Task header */}
        <div style={{background:'#fff',borderLeft:`4px solid ${CC[selected.cat]}`,border:`1px solid ${CC[selected.cat]}20`,borderLeftWidth:4,borderRadius:'0 12px 12px 0',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <div>
            <div style={{fontSize:'9px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:CC[selected.cat],marginBottom:'2px',letterSpacing:'.04em'}}>DAY {selected.day} · {selected.id}</div>
            <div style={{fontSize:'18px',fontWeight:'800',fontFamily:"'DM Sans',sans-serif",color:'#111827',letterSpacing:'-.01em'}}>{selected.title}</div>
            <div style={{fontSize:'12px',color:'#6B7280',marginTop:'1px'}}>{selected.sub}</div>
          </div>
          <div style={{display:'flex',gap:'6px'}}>
            <span style={{fontSize:'9px',fontWeight:600,color:CC[selected.cat],background:CC[selected.cat]+'15',border:`1px solid ${CC[selected.cat]}22`,borderRadius:'99px',padding:'2px 9px'}}>{selected.cat}</span>
            <span style={{fontSize:'9px',fontWeight:600,color:'#16A34A',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'99px',padding:'2px 9px'}}>+{selected.pts} pts</span>
          </div>
        </div>

        {/* LESSON */}
        {phase==='lesson'&&<div>
          <div style={{background:'#0F1117',borderRadius:'14px',overflow:'hidden',marginBottom:'14px'}}>
            <div style={{padding:'12px 18px',borderBottom:'1px solid #1F2937',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'8px',color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'2px'}}>Lesson Video</div>
                <div style={{fontSize:'13px',fontWeight:600,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>{selected.id} — {selected.title}</div>
              </div>
              {watched&&<span style={{fontSize:'9px',fontWeight:600,color:'#16A34A',background:'#16A34A20',borderRadius:'99px',padding:'2px 9px'}}>Watched ✓</span>}
            </div>
            <div style={{height:'190px',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'10px',cursor:'pointer'}} onClick={startWatch}>
              <div style={{width:'58px',height:'58px',borderRadius:'50%',background:'#EE825625',border:'2px solid #EE825650',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:'20px'}}>▶</span>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'12px',color:'#9CA3AF'}}>Click to watch lesson</div>
                <div style={{fontSize:'10px',color:'#4B5563',marginTop:'2px'}}>Add your YouTube URL in Supabase tasks table → video_url column</div>
              </div>
            </div>
            <div style={{padding:'10px 18px 14px',background:'#0D1117'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                <span style={{fontSize:'10px',color:'#9CA3AF'}}>Watch progress</span>
                <span style={{fontSize:'10px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:watched?'#16A34A':'#EE8256'}}>{watchPct}%</span>
              </div>
              <div style={{height:'4px',background:'#1F2937',borderRadius:'99px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${watchPct}%`,background:watched?'#16A34A':'#EE8256',borderRadius:'99px',transition:'width .3s ease'}}/>
              </div>
              {!watched&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'6px'}}>
                <span style={{fontSize:'10px',color:'#4B5563'}}>Watch full lesson to unlock Submit</span>
                <button onClick={forceWatch} style={{fontSize:'10px',color:'#EE8256',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Already watched</button>
              </div>}
            </div>
          </div>
          <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'12px',padding:'18px',marginBottom:'14px'}}>
            <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'10px'}}>Task Instructions</div>
            <p style={{fontSize:'13px',color:'#374151',lineHeight:1.7,marginBottom:'12px'}}>Clone your voice using ElevenLabs or Murf AI. Record professional voiceovers for two distinct ad scripts — one cold audience, one warm retargeting audience.</p>
            {['Create a voice clone on ElevenLabs (free tier works)','Write 2 ad scripts: 1 cold audience, 1 warm/retargeting','Generate voiceovers for both (30–60 seconds each)','Download the MP3 audio files','Submit Google Drive link to both files + written scripts'].map((s,i)=>(
              <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start',marginBottom:'8px'}}>
                <div style={{width:'18px',height:'18px',borderRadius:'5px',background:CC[selected.cat]+'15',border:`1px solid ${CC[selected.cat]}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px',fontSize:'8px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:CC[selected.cat]}}>{i+1}</div>
                <span style={{fontSize:'12px',color:'#374151',lineHeight:1.6}}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{background:watched?'#fff':'#F6F5F3',border:`1px solid ${watched?CC[selected.cat]+'30':'#EBEBEB'}`,borderRadius:'12px',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:watched?'#111827':'#9CA3AF',marginBottom:'2px'}}>{watched?'Ready to submit your work?':'Watch the lesson first'}</div>
              <div style={{fontSize:'11px',color:'#9CA3AF'}}>{watched?`Submit via link · Get AI feedback · +${selected.pts} pts`:'Complete the video above to unlock submission'}</div>
            </div>
            <button onClick={()=>watched&&setPhase('submit')} disabled={!watched} style={{padding:'11px 26px',background:watched?'#EE8256':'#F6F5F3',border:watched?'none':'1px solid #EBEBEB',borderRadius:'10px',fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:watched?'#fff':'#9CA3AF',cursor:watched?'pointer':'not-allowed'}}>
              {watched?'Submit Task →':'🔒 Watch First'}
            </button>
          </div>
        </div>}

        {/* SUBMIT */}
        {phase==='submit'&&<div>
          <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'10px',padding:'10px 16px',display:'flex',gap:'8px',alignItems:'center',marginBottom:'14px'}}>
            <span>✓</span><span style={{fontSize:'12px',fontWeight:500,color:'#16A34A'}}>Lesson watched — submitting {selected.id}: {selected.title}</span>
          </div>
          <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'14px',padding:'20px'}}>
            <div style={{fontSize:'14px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'4px'}}>Submit Your Work</div>
            <div style={{fontSize:'12px',color:'#6B7280',marginBottom:'16px'}}>Paste your Google Drive, Loom, or any public link. Mentor Kiran reviews it instantly.</div>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'10px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Submission Link</label>
              <input value={url} onChange={e=>setUrl(e.target.value)} type="text" placeholder="https://drive.google.com/file/d/..."
                style={{width:'100%',padding:'11px 14px',border:'1px solid #EBEBEB',borderRadius:'9px',fontSize:'13px',color:'#111827',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
              <div style={{fontSize:'10px',color:'#9CA3AF',marginTop:'4px'}}>Google Drive · Loom · YouTube unlisted · Notion · Canva · Any public URL</div>
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{fontSize:'10px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Note for Mentor (optional)</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Any context, tools used, or questions..."
                style={{width:'100%',padding:'9px 12px',border:'1px solid #EBEBEB',borderRadius:'8px',fontSize:'12px',color:'#111827',resize:'none',lineHeight:1.5,outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
            </div>
            <div style={{background:'#F5F3FF',border:'1px solid #7C3AED20',borderRadius:'9px',padding:'10px 14px',display:'flex',gap:'10px',alignItems:'center',marginBottom:'14px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#EE8256)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>👤</div>
              <div>
                <div style={{fontSize:'11px',fontWeight:600,color:'#7C3AED',fontFamily:"'DM Sans',sans-serif"}}>Mentor Kiran will review this</div>
                <div style={{fontSize:'10px',color:'#6B7280',marginTop:'1px'}}>Instant AI feedback — score, strengths, next steps, confidence boost</div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting} style={{width:'100%',padding:'13px',background:submitting?'#D4D4D4':'#EE8256',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:submitting?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px'}}>
              {submitting?<><div style={{width:'13px',height:'13px',borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',animation:'spin .7s linear infinite'}}/> Mentor Kiran is reviewing...</>:'Submit for Mentor Review →'}
            </button>
          </div>
          <button onClick={()=>setPhase('lesson')} style={{fontSize:'11px',color:'#9CA3AF',background:'none',border:'none',cursor:'pointer',marginTop:'8px',textDecoration:'underline'}}>← Back to lesson</button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>}

        {/* DONE */}
        {phase==='done'&&result&&<div>
          <div style={{background:'#0F1117',borderRadius:'14px',padding:'22px',border:`1px solid #F59E0B25`,marginBottom:'12px'}}>
            <div style={{display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'16px'}}>
              <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#EE8256)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>👤</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'4px'}}>
                  <span style={{fontSize:'13px',fontWeight:600,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>Mentor Kiran</span>
                  <span style={{fontSize:'9px',fontWeight:600,color:'#F59E0B',background:'#F59E0B20',border:'1px solid #F59E0B30',borderRadius:'99px',padding:'1px 8px'}}>{result.status}</span>
                </div>
                <div style={{fontSize:'15px',fontWeight:700,color:'#fff',fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{result.headline}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:'14px',alignItems:'center',background:'#0D1117',borderRadius:'10px',padding:'14px',marginBottom:'14px'}}>
              <div style={{position:'relative',width:'60px',height:'60px'}}>
                <svg width="60" height="60" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#1F2937" strokeWidth="6"/>
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${2*Math.PI*24*(result.score||75)/100} 151`} strokeLinecap="round"/>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'13px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:'#F59E0B'}}>{result.score||75}</span>
                </div>
              </div>
              <div>
                <div style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'4px'}}>Confidence boost earned</div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'9px',fontFamily:"'JetBrains Mono',monospace",color:'#6B7280'}}>42%</span>
                  <div style={{flex:1,height:'5px',background:'#1F2937',borderRadius:'99px',overflow:'hidden',position:'relative'}}>
                    <div style={{position:'absolute',left:0,top:0,height:'100%',width:'42%',background:'#D97706',borderRadius:'99px'}}/>
                    <div style={{position:'absolute',left:'42%',top:0,height:'100%',width:`${result.confidence_delta||8}%`,background:'#16A34A',borderRadius:'99px'}}/>
                  </div>
                  <span style={{fontSize:'9px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:'#16A34A'}}>+{result.confidence_delta||8}% → {42+(result.confidence_delta||8)}%</span>
                </div>
              </div>
              <div style={{textAlign:'center',background:'#FFF3ED',border:'1px solid #F9C5AD',borderRadius:'9px',padding:'11px 14px'}}>
                <div style={{fontSize:'22px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:'#EE8256',lineHeight:1}}>+{result.points_awarded||94}</div>
                <div style={{fontSize:'9px',color:'#6B7280',marginTop:'2px'}}>points</div>
              </div>
            </div>
            <div style={{background:'#0D1117',borderRadius:'9px',padding:'12px 14px',borderLeft:'3px solid #7C3AED'}}>
              <div style={{fontSize:'8px',fontWeight:600,color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'5px'}}>Mentor Note</div>
              <p style={{fontSize:'12px',color:'#D1D5DB',lineHeight:1.7}}>{result.mentor_note}</p>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'11px',padding:'14px'}}>
              <div style={{fontSize:'8px',fontWeight:600,color:'#16A34A',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>What worked</div>
              {(result.strengths||[]).map((s:string,i:number)=>(
                <div key={i} style={{display:'flex',gap:'7px',marginBottom:'6px'}}>
                  <span style={{color:'#16A34A',flexShrink:0}}>✓</span>
                  <span style={{fontSize:'11px',color:'#374151',lineHeight:1.5}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{background:'#FFFBEB',border:'1px solid #D9770622',borderRadius:'11px',padding:'14px'}}>
              <div style={{fontSize:'8px',fontWeight:600,color:'#D97706',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>Next steps</div>
              {(result.next_steps||[]).map((s:string,i:number)=>(
                <div key={i} style={{display:'flex',gap:'7px',marginBottom:'6px'}}>
                  <span style={{color:'#D97706',flexShrink:0}}>→</span>
                  <span style={{fontSize:'11px',color:'#374151',lineHeight:1.5}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          {result.growth_insight&&<div style={{background:'#F5F3FF',border:'1px solid #7C3AED22',borderRadius:'10px',padding:'11px 14px',marginBottom:'12px'}}>
            <span style={{fontSize:'11px',fontWeight:700,color:'#7C3AED',fontFamily:"'DM Sans',sans-serif"}}>Client-Ready Insight: </span>
            <span style={{fontSize:'11px',color:'#374151'}}>{result.growth_insight}</span>
          </div>}
          <div style={{display:'flex',gap:'8px'}}>
            {result.status!=='Approved'&&<button onClick={()=>{setResult(null);setPhase('submit')}} style={{padding:'8px 16px',background:'#FFF3ED',color:'#EE8256',border:'1px solid #F9C5AD',borderRadius:'8px',fontSize:'12px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Resubmit</button>}
            <button onClick={()=>setSelected(null)} style={{padding:'8px 16px',background:'transparent',color:'#6B7280',border:'1px solid #EBEBEB',borderRadius:'8px',fontSize:'12px',fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>← Back to Tasks</button>
          </div>
        </div>}
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div>
        {/* Header */}
        <div style={{background:'#111827',borderRadius:'14px',padding:'20px 24px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'5px'}}>28-Day Internship Program</div>
            <div style={{fontSize:'20px',fontWeight:'800',color:'#fff',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-.01em'}}>Your Tasks</div>
            <div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'3px'}}>Tasks open at 7PM IST daily · 26-hour window to submit</div>
          </div>
          <div style={{display:'flex',gap:'20px'}}>
            {[['7','Done','#16A34A'],['1','Active','#EE8256'],['12','Locked','#9CA3AF']].map(([n,l,c])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontSize:'24px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:c}}>{n}</div>
                <div style={{fontSize:'9px',color:'#6B7280'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
          {TASKS.map(t=>{
            const s=t.done?'done':t.active?'active':'locked'
            const c=CC[t.cat]||'#EE8256'
            return <div key={t.id} onClick={()=>openTask(t)} style={{borderRadius:'11px',padding:'13px',background:s==='done'?c+'08':s==='active'?'#fff':'#F6F5F3',border:s==='active'?`2px solid ${c}`:s==='done'?`1px solid ${c}20`:'1px solid #EBEBEB',cursor:s==='locked'?'default':'pointer',opacity:s==='locked'?.5:1,position:'relative',transition:'all .15s'}}>
              <div style={{position:'absolute',top:'9px',right:'9px',width:'18px',height:'18px',borderRadius:'50%',background:s==='done'?'#16A34A':s==='active'?c:'#F6F5F3',border:`1.5px solid ${s==='done'?'#16A34A':s==='active'?c:'#D4D4D4'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#fff'}}>
                {s==='done'?'✓':s==='active'?'●':'🔒'}
              </div>
              <div style={{fontSize:'8px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:c,marginBottom:'3px',letterSpacing:'.04em'}}>DAY {t.day} · {t.id}</div>
              <div style={{fontSize:'12px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:s==='locked'?'#9CA3AF':'#111827',lineHeight:1.3,marginBottom:'2px',paddingRight:'20px'}}>{t.title}</div>
              <div style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'8px'}}>{t.sub}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'9px',fontWeight:600,color:c,background:c+'15',border:`1px solid ${c}22`,borderRadius:'99px',padding:'1px 7px'}}>{t.cat}</span>
                <span style={{fontSize:'10px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:s==='done'?'#16A34A':c}}>+{t.pts}</span>
              </div>
            </div>
          })}
        </div>
      </div>
    </AppLayout>
  )
}
