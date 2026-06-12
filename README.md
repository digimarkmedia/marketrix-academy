# MarkeTrix Academy — Internship OS
### Next.js 15 + Supabase + AI Mentor (Claude / Gemini / GPT)

---

## QUICK START (5 steps)

### Step 1 — Create Supabase Project
1. Go to **supabase.com** → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Copy your **Service Role Key** from Settings → API (keep secret)

### Step 2 — Run Database Schema
1. Supabase dashboard → **SQL Editor** → New Query
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — this creates all tables + seeds all 20 tasks

### Step 3 — Create Storage Buckets
In Supabase dashboard → **Storage** → New Bucket:
- Name: `submissions` → Public: **ON**
- Name: `avatars` → Public: **ON**
- Name: `leave-attachments` → Public: **OFF**

### Step 4 — Set Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

AI_PROVIDER=anthropic
AI_API_KEY=your-anthropic-api-key
```

### Step 5 — Install and Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

---

## HOW TO ADD YOUR LESSON VIDEOS

### Using YouTube (recommended)
1. Upload your lesson video to YouTube
2. Set visibility to **Unlisted** (not public, not private)
3. Copy the video URL: `https://youtube.com/watch?v=ABC123`
4. In Supabase → **Table Editor** → `tasks` table
5. Find the task row (T01, T02 etc.)
6. Set `video_url` to: `https://www.youtube.com/embed/ABC123`
7. Set `video_type` to: `youtube`

### Using Loom
1. Record your lesson on Loom
2. Copy share link
3. Set `video_url` to: `https://www.loom.com/embed/YOUR_LOOM_ID`
4. Set `video_type` to: `loom`

### The flow after you add videos:
- Intern opens task → video plays in the lesson screen
- Progress bar fills as they watch
- When 100% → "Start Task" button unlocks automatically
- They can also click "Already watched" to skip manually

---

## HOW FILE UPLOAD WORKS

For tasks T07 (video), T08 (audio), T14 (video), T19 (video), T20 (portfolio):

1. Intern clicks task → watches lesson
2. Clicks "Start Task" → submission screen opens
3. Selects "File Upload" tab
4. Drags/drops or browses for file (MP4, MOV, MP3, PDF, etc.)
5. Real upload progress bar shows % as file uploads to **Supabase Storage**
6. After upload → AI Mentor Kiran reviews the submission
7. Intern gets: score, confidence boost, strengths, next steps

**Files are stored in Supabase Storage at:**
`submissions/{taskCode}/{internId}/{uuid}_{filename}`

**Max file size:** 500MB (configurable in `src/lib/upload.ts`)

---

## SWITCH AI PROVIDER

Change one line in `.env.local` — zero code changes needed:

```env
# Use Anthropic Claude (default)
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...

# Switch to Google Gemini
AI_PROVIDER=gemini
AI_API_KEY=AIza...

# Switch to OpenAI GPT-4o
AI_PROVIDER=openai
AI_API_KEY=sk-...
```

---

## DEPLOY TO VERCEL

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/marketrix-os
git push -u origin main

# 2. Go to vercel.com → New Project → Import from GitHub

# 3. Add Environment Variables in Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    AI_PROVIDER
#    AI_API_KEY

# 4. Click Deploy
```

---

## PROJECT STRUCTURE

```
src/
├── app/
│   ├── layout.tsx                    ← fonts, toast, global wrapper
│   ├── globals.css
│   ├── page.tsx                      ← main app (journey map)
│   └── api/
│       ├── ai-review/route.ts        ← AI review endpoint
│       └── submissions/route.ts      ← save submission + run AI
│
├── components/
│   └── tasks/
│       └── TaskDetail.tsx            ← video player → start → upload → review
│
└── lib/
    ├── ai.ts                         ← swappable AI (Claude/Gemini/OpenAI)
    ├── upload.ts                     ← Supabase Storage file upload
    └── supabase/
        ├── client.ts                 ← browser client
        └── server.ts                 ← server client

supabase/
└── schema.sql                        ← run once to set up entire DB
```

---

## API ENDPOINTS

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ai-review | Run AI review (standalone) |
| POST | /api/submissions | Save submission + run AI review |
| GET  | /api/submissions | Get current user's submissions |

---

## SUPPORT

Built for MarkeTrix Academy · Batch 7 · 2025
