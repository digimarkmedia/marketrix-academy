export default function Home() {
  return (
    <div style={{minHeight:'100vh',background:'#111827',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px'}}>
      <div style={{width:'60px',height:'60px',background:'#EE8256',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'900',color:'#fff',fontFamily:'sans-serif'}}>M</div>
      <h1 style={{color:'#fff',fontFamily:'sans-serif',fontSize:'32px',fontWeight:'800',letterSpacing:'-0.02em'}}>MarkeTrix Academy</h1>
      <p style={{color:'#9CA3AF',fontFamily:'sans-serif',fontSize:'16px'}}>Internship OS — Coming Soon</p>
      <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
        <a href="/login" style={{padding:'12px 28px',background:'#EE8256',color:'#fff',borderRadius:'10px',fontFamily:'sans-serif',fontWeight:'700',textDecoration:'none',fontSize:'14px'}}>Intern Login</a>
        <a href="/admin" style={{padding:'12px 28px',background:'#1F2937',color:'#9CA3AF',borderRadius:'10px',fontFamily:'sans-serif',fontWeight:'600',textDecoration:'none',fontSize:'14px'}}>Admin</a>
      </div>
    </div>
  )
}
