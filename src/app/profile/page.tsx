export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/AppLayout'

export default function Profile() {
  const [profile, setProfile] = useState<any>({ full_name:'', city:'', bio:'', expertise:'', experience_level:'Fresher', instagram_url:'', linkedin_url:'' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) setProfile(data)
    } else {
      const u = localStorage.getItem('mtx_user')
      if (u) { const user = JSON.parse(u); setProfile((p: any) => ({ ...p, full_name: user.name, email: user.email })) }
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').update({ full_name: profile.full_name, city: profile.city, bio: profile.bio, expertise: profile.expertise, experience_level: profile.experience_level, instagram_url: profile.instagram_url, linkedin_url: profile.linkedin_url }).eq('id', session.user.id)
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const inp = { width:'100%', padding:'11px 14px', border:'1px solid #EBEBEB', borderRadius:'9px', fontSize:'13px', color:'#111827', outline:'none', fontFamily:'Plus Jakarta Sans,sans-serif' } as any
  const initials = profile.full_name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2) || '??'

  return (
    <AppLayout>
      <div style={{maxWidth:'600px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,color:'#111827',marginBottom:'4px'}}>My Profile</h2>
        <p style={{fontSize:'13px',color:'#6B7280',marginBottom:'20px'}}>Your profile is visible to mentors and other interns. Fill it in fully.</p>
        {/* Avatar card */}
        <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'14px',padding:'18px',marginBottom:'12px',display:'flex',gap:'16px',alignItems:'center'}}>
          <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'#FFF3ED',border:'2px solid #F9C5AD',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px',fontWeight:700,color:'#EE8256',flexShrink:0}}>{initials}</div>
          <div>
            <div style={{fontSize:'18px',fontWeight:700,color:'#111827'}}>{profile.full_name || 'Your Name'}</div>
            <div style={{fontSize:'12px',color:'#6B7280',marginTop:'2px'}}>{profile.city || 'Your City'} · Batch 7</div>
            <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
              <span style={{fontSize:'10px',fontWeight:600,color:'#F59E0B',background:'#FFFBEB',border:'1px solid #F59E0B25',borderRadius:'99px',padding:'2px 9px'}}>⚡ {profile.confidence_level || 'Explorer'}</span>
              <span style={{fontSize:'10px',fontWeight:600,color:'#7C3AED',background:'#F5F3FF',border:'1px solid #7C3AED25',borderRadius:'99px',padding:'2px 9px'}}>{profile.total_points || 0} pts</span>
            </div>
          </div>
        </div>
        {/* Form */}
        <div style={{background:'#fff',border:'1px solid #EBEBEB',borderRadius:'14px',padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Full Name</label><input value={profile.full_name||''} onChange={e=>setProfile((p:any)=>({...p,full_name:e.target.value}))} style={inp}/></div>
            <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>City</label><input value={profile.city||''} onChange={e=>setProfile((p:any)=>({...p,city:e.target.value}))} placeholder="Mumbai, India" style={inp}/></div>
          </div>
          <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Short Bio</label><textarea value={profile.bio||''} onChange={e=>setProfile((p:any)=>({...p,bio:e.target.value}))} rows={2} placeholder="Tell your fellow interns about yourself..." style={{...inp,resize:'none' as any,lineHeight:1.6}}/></div>
          <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Expertise</label><input value={profile.expertise||''} onChange={e=>setProfile((p:any)=>({...p,expertise:e.target.value}))} placeholder="Meta Ads, Canva, Copywriting..." style={inp}/></div>
          <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Experience Level</label>
            <select value={profile.experience_level||'Fresher'} onChange={e=>setProfile((p:any)=>({...p,experience_level:e.target.value}))} style={{...inp,appearance:'none' as any,cursor:'pointer'}}>
              <option>Fresher — 0 to 6 months</option>
              <option>Junior — 6 months to 1 year</option>
              <option>Mid-level — 1 to 3 years</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Instagram</label><input value={profile.instagram_url||''} onChange={e=>setProfile((p:any)=>({...p,instagram_url:e.target.value}))} placeholder="@yourhandle" style={inp}/></div>
            <div><label style={{fontSize:'11px',fontWeight:600,color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>LinkedIn</label><input value={profile.linkedin_url||''} onChange={e=>setProfile((p:any)=>({...p,linkedin_url:e.target.value}))} placeholder="linkedin.com/in/..." style={inp}/></div>
          </div>
          <button onClick={saveProfile} disabled={loading} style={{alignSelf:'flex-start',padding:'10px 24px',background:saved?'#16A34A':loading?'#D4D4D4':'#EE8256',color:'#fff',border:'none',borderRadius:'9px',fontSize:'13px',fontWeight:700,cursor:loading?'not-allowed':'pointer'}}>
            {saved?'Saved ✓':loading?'Saving...':'Save Profile'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
export const dynamic = 'force-dynamic'
