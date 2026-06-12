import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'MarkeTrix Academy — Internship OS',
  description: 'The 28-day career transformation platform for digital marketing freshers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", background:'#FAFAFA', margin:0 }}>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:13, borderRadius:10, border:'1px solid #EBEBEB' },
          success: { iconTheme: { primary:'#16A34A', secondary:'#fff' } },
        }} />
        {children}
      </body>
    </html>
  )
}
