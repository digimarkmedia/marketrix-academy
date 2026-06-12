'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useState } from 'react'

export default function Profile() {
  const [name, setName] = useState('Aryan Mehta')
  const [city, setCity] = useState('Bhopal, MP')
  const [bio, setBio] = useState('Digital marketing enthusiast. Learning Meta Ads, content strategy, and performance marketing.')
  const [expertise, setExpertise] = useState('Meta Ads, Instagram Content, Canva')
  const [exp, setExp] = useState('Junior — 6 months to 1 year')
  const [ig, setIg] = useState('')
  const [li, setLi] = useState('')
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000) }

  const inputStyle = {width:'100%',padding:'11px 14px',border:'1px solid #EBEBEB',borderRadius:'9px',fontSize:'13px',color:'#111827',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}

  return (
    <AppLayout>
      <div style={{maxWidth:'600px'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",color:'#111827',marginBottom:'4px'}}>My Profile</h2>
        <p style={{fontSize:'13px',color:'#6B7280',marginBottom:'20px'}}>Your profile is public — other interns and mentors can see it. Fill it in fully.</p>
        {/* Avatar */}
        <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'14px',padding:'18px',marginBottom:'12px',display:'flex',gap:'16px',alignItems:'flex-start'}}>
          <div style={{position:'relative'}}>
            <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'#FFF3ED',border:'2px solid #F9C5AD',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px',fontWeight:700,color:'#EE8256',fontFamily:"'DM Sans',sans-serif"}}>AM</div>
            <div style={{position:'absolute',bottom:0,right:0,width:'22px',height:'22px',borderRadius:'50%',background:'#EE8256',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',cursor:'pointer'}}>✏️</div>
          </div>
          <div>
            <div style={{fontSize:'18px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:'#111827'}}>{name}</div>
            <div style={{fontSize:'12px',color:'#6B7280',marginTop:'2px'}}>{city} · Batch 7</div>
            <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
              {[['⚡ Executor','#F59E0B','#FFFBEB','#F59E0B25'],['875 pts','#7C3AED','#F5F3FF','#7C3AED25'],['7/20 tasks','#16A34A','#F0FDF4','#16A34A25']].map(([l,c,bg,bd])=>(
                <span key={l} style={{fontSize:'10px',fontWeight:600,color:c,background:bg,border:`1px solid ${bd}`,borderRadius:'99px',padding:'2px 9px'}}>{l}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Form */}
        <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'14px',padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div>
              <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} style={inputStyle} onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
            </div>
            <div>
              <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>City</label>
              <input value={city} onChange={e=>setCity(e.target.value)} style={inputStyle} onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Short Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={2} style={{...inputStyle,resize:'none' as any,lineHeight:1.6}}/>
          </div>
          <div>
            <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Expertise</label>
            <input value={expertise} onChange={e=>setExpertise(e.target.value)} placeholder="Meta Ads, Canva, Copywriting..." style={inputStyle} onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
          </div>
          <div>
            <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Experience Level</label>
            <select value={exp} onChange={e=>setExp(e.target.value)} style={{...inputStyle,appearance:'none' as any,cursor:'pointer'}}>
              <option>Fresher — 0 to 6 months</option>
              <option>Junior — 6 months to 1 year</option>
              <option>Mid-level — 1 to 3 years</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div>
              <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Instagram</label>
              <input value={ig} onChange={e=>setIg(e.target.value)} placeholder="@yourhandle" style={inputStyle} onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
            </div>
            <div>
              <label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>LinkedIn</label>
              <input value={li} onChange={e=>setLi(e.target.value)} placeholder="linkedin.com/in/..." style={inputStyle} onFocus={e=>e.currentTarget.style.borderColor='#EE8256'} onBlur={e=>e.currentTarget.style.borderColor='#EBEBEB'}/>
            </div>
          </div>
          <button onClick={save} style={{alignSelf:'flex-start',padding:'10px 24px',background:saved?'#16A34A':'#EE8256',color:'#fff',border:'none',borderRadius:'9px',fontSize:'13px',fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>
            {saved?'Saved ✓':'Save Profile'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
