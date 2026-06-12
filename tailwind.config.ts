import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['DM Sans', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand:  { DEFAULT:'#EE8256', dark:'#D96B3A', light:'#FFF3ED', border:'#F9C5AD' },
        ink:    { DEFAULT:'#111827', md:'#374151', lt:'#6B7280', xl:'#9CA3AF' },
        surface:{ DEFAULT:'#FFFFFF', alt:'#F6F5F3', page:'#FAFAFA' },
      },
    },
  },
  plugins: [],
}
export default config
