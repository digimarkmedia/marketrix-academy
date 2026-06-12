'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => { router.push('/login') }, [router])
  return (
    <div style={{minHeight:'100vh',background:'#111827',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'60px',height:'60px',background:'#EE8256',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'900',color:'#fff',margin:'0 auto 16px',fontFamily:'sans-serif'}}>M</div>
        <p style={{color:'#9CA3AF',fontFamily:'sans-serif'}}>Loading MarkeTrix Academy...</p>
      </div>
    </div>
  )
}
