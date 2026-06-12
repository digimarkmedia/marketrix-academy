'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/tasks', label: 'My Tasks' },
  { path: '/classes', label: 'Live Classes' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/profile', label: 'My Profile' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      supabase.from('profiles').select('full_name,confidence_level,total_points,streak_days').eq('id', session.user.id).single().then(({ data }) => {
        setUser({ name: data?.full_name || session.user.email, ...data })
      })
    })
  }, [router])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  if (!user) return (
    <div style={{minHeight:'100vh',background:'#FAFAFA',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}><div style={{width:'40px',height:'40px',background:'#EE8256',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:900,color:'#fff',margin:'0 auto 12px'}}>M</div><p style={{color:'#9CA3AF',fontSize:'13px'}}>Loading...</p></div>
    </div>
  )

  return (
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
      <div style={{width:'220px',background:'#fff',borderRight:'1px solid #EBEBEB',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,height:'100vh',zIndex:50}}>
        <div style={{padding:'16px 14px',borderBottom:'1px solid #EBEBEB',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',background:'#EE8256',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',fontWeight:900,color:'#fff'}}>M</div>
          <div><div style={{fontSize:'13px',fontWeight:700,color:'#111827'}}>MarkeTrix</div><div style={{fontSize:'9px',color:'#9CA3AF'}}>Batch 7</div></div>
        </div>
        <nav style={{padding:'10px',flex:1}}>
          {NAV.map(n=>(
            <button key={n.path} onClick={()=>router.push(n.path)} style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'9px',background:pathname===n.path?'#FFF3ED':'transparent',color:pathname===n.path?'#EE8256':'#6B7280',fontSize:'13px',fontWeight:pathname===n.path?600:500,border:'none',cursor:'pointer',marginBottom:'1px',textAlign:'left'}}>{n.label}</button>
          ))}
        </nav>
        <div style={{padding:'12px 14px',borderTop:'1px solid #EBEBEB',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#FFF3ED',border:'1.5px solid #F9C5AD',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#EE8256'}}>
            {user?.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)||'??'}
          </div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:'12px',fontWeight:600,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div><div style={{fontSize:'10px',color:'#9CA3AF'}}>{user?.confidence_level||'Explorer'}</div></div>
          <button onClick={logout} style={{color:'#9CA3AF',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}} title="Logout">⇥</button>
        </div>
      </div>
      <div style={{marginLeft:'220px',flex:1,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <div style={{height:'52px',background:'#fff',borderBottom:'1px solid #EBEBEB',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontSize:'16px',fontWeight:700,color:'#111827'}}>{NAV.find(n=>n.path===pathname)?.label||'MarkeTrix'}</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',background:'#F6F5F3',borderRadius:'7px',padding:'4px 12px'}}>
              <span style={{fontSize:'10px',color:'#6B7280'}}>Points</span>
              <span style={{fontSize:'13px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#7C3AED'}}>{user?.total_points||0}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'4px',background:'#FFFBEB',borderRadius:'6px',padding:'4px 9px'}}>
              <span>⚡</span>
              <span style={{fontSize:'11px',fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'#D97706'}}>{user?.streak_days||0}</span>
            </div>
          </div>
        </div>
        <main style={{padding:'24px',flex:1,background:'#FAFAFA'}}>{children}</main>
      </div>
    </div>
  )
}
