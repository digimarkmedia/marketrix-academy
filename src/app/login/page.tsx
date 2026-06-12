'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'intern'|'admin'>('intern')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    // Demo login — in production connect to Supabase Auth
    setTimeout(() => {
      if (role === 'admin') {
        localStorage.setItem('mtx_role', 'admin')
        localStorage.setItem('mtx_user', JSON.stringify({ name: 'Shahbaz Shaikh', email, role: 'admin' }))
        router.push('/admin')
      } else {
        localStorage.setItem('mtx_role', 'intern')
        localStorage.setItem('mtx_user', JSON.stringify({ name: 'Aryan Mehta', email, role: 'intern' }))
        router.push('/dashboard')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      {/* Left panel */}
      <div style={{width:'44%',background:'#0F1117',display:'flex',flexDirection:'column',justifyContent:'center',padding:'52px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'300px',height:'300px',background:'#EE825615',borderRadius:'50%',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'-80px',left:'-40px',width:'240px',height:'240px',background:'#7C3AED10',borderRadius:'50%',filter:'blur(50px)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'48px'}}>
          <div style={{width:'40px',height:'40px',background:'#EE8256',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'900',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>M</div>
          <div>
            <div style={{fontSize:'18px',fontWeight:'800',color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>MarkeTrix</div>
            <div style={{fontSize:'10px',color:'#6B7280',letterSpacing:'.08em',textTransform:'uppercase'}}>Academy</div>
          </div>
        </div>
        <div style={{fontSize:'32px',fontWeight:'800',color:'#fff',fontFamily:"'DM Sans',sans-serif",lineHeight:'1.2',marginBottom:'16px',letterSpacing:'-.02em'}}>Your 28-Day<br/>Marketing<br/><span style={{color:'#EE8256'}}>Career Launch</span></div>
        <p style={{fontSize:'14px',color:'#9CA3AF',lineHeight:'1.7',marginBottom:'40px'}}>Watch lessons, complete real tasks, get instant AI feedback, and track your journey from fresher to client-ready marketer.</p>
        <div style={{display:'flex',gap:'28px'}}>
          {[['247','Active Interns','#EE8256'],['28','Day Program','#F59E0B'],['20','Real Tasks','#7C3AED']].map(([n,l,c])=>(
            <div key={l}><div style={{fontSize:'28px',fontWeight:'700',fontFamily:"'JetBrains Mono',monospace",color:c}}>{n}</div><div style={{fontSize:'10px',color:'#6B7280',marginTop:'2px'}}>{l}</div></div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',background:'#FAFAFA'}}>
        <div style={{width:'100%',maxWidth:'380px'}}>
          <div style={{marginBottom:'32px'}}>
            <h1 style={{fontSize:'24px',fontWeight:'800',fontFamily:"'DM Sans',sans-serif",color:'#111827',letterSpacing:'-.01em',marginBottom:'6px'}}>Welcome back</h1>
            <p style={{fontSize:'13px',color:'#6B7280'}}>Sign in with your credentials to continue.</p>
          </div>
          {/* Role toggle */}
          <div style={{display:'flex',background:'#F6F5F3',borderRadius:'10px',padding:'3px',gap:'2px',marginBottom:'22px'}}>
            {(['intern','admin'] as const).map(r=>(
              <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:'8px',borderRadius:'8px',fontSize:'13px',fontFamily:"'DM Sans',sans-serif",fontWeight:role===r?600:500,background:role===r?'#fff':'transparent',color:role===r?'#111827':'#6B7280',border:'none',cursor:'pointer',boxShadow:role===r?'0 1px 4px rgba(0,0,0,.07)':'none',transition:'all .15s'}}>
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'22px'}}>
            <div>
              <label style={{fontSize:'11px',fontWeight:'600',color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder={role==='admin'?'admin@marketrix.in':'aryan@marketrix.in'}
                style={{width:'100%',padding:'11px 14px',border:'1px solid #EBEBEB',borderRadius:'9px',fontSize:'13px',color:'#111827',background:'#fff',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor='#EE8256'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/>
            </div>
            <div>
              <label style={{fontSize:'11px',fontWeight:'600',color:'#6B7280',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.04em'}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                style={{width:'100%',padding:'11px 14px',border:'1px solid #EBEBEB',borderRadius:'9px',fontSize:'13px',color:'#111827',background:'#fff',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor='#EE8256'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
          </div>
          {error && <div style={{marginBottom:'14px',padding:'10px 14px',background:'#FEF2F2',border:'1px solid #DC262622',borderRadius:'8px',fontSize:'12px',color:'#DC2626'}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{width:'100%',padding:'13px',background:loading?'#D4D4D4':'#EE8256',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            {loading?<><div style={{width:'14px',height:'14px',borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',animation:'spin .7s linear infinite'}}/> Signing in...</>:'Sign In →'}
          </button>
          <p style={{fontSize:'11px',color:'#9CA3AF',textAlign:'center',marginTop:'14px'}}>Account created by your program admin. Contact them if you cannot log in.</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
