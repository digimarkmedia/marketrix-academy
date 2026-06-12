-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETRIX ACADEMY — COMPLETE DATABASE SCHEMA
-- Run this entire file in: Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  email             text unique not null,
  full_name         text not null,
  avatar_url        text,
  role              text not null default 'intern', -- intern | mentor | manager | super_admin
  batch_id          uuid,
  confidence_score  integer not null default 0,
  confidence_level  text not null default 'Explorer',
  total_points      integer not null default 0,
  streak_days       integer not null default 0,
  last_active_at    timestamptz default now(),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── BATCHES ───────────────────────────────────────────────────────────────────
create table public.batches (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,       -- "Batch 7"
  code        text unique not null, -- "BATCH7-2025" — intern registration code
  start_date  date not null,
  end_date    date not null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ── TASKS ─────────────────────────────────────────────────────────────────────
create table public.tasks (
  id                  uuid default uuid_generate_v4() primary key,
  task_number         integer unique not null, -- 1-20
  task_code           text unique not null,    -- T01, T02...
  title               text not null,
  mission_title       text not null,
  description         text not null,
  instructions        text[] not null default '{}',
  video_url           text,       -- YouTube or Loom embed URL
  video_type          text default 'youtube', -- youtube | loom
  video_duration      text,
  category            text not null,
  points              integer not null,
  day_number          integer not null,
  allows_url          boolean default true,
  allows_text         boolean default true,
  allows_file         boolean default true,
  max_file_size_mb    integer default 500,
  allowed_file_types  text[] default array['video/*','audio/*','image/*','application/pdf','.zip'],
  created_at          timestamptz default now()
);

-- ── INTERN TASKS (progress per intern) ───────────────────────────────────────
create table public.intern_tasks (
  id            uuid default uuid_generate_v4() primary key,
  intern_id     uuid references public.profiles(id) on delete cascade,
  task_id       uuid references public.tasks(id),
  batch_id      uuid references public.batches(id),
  status        text not null default 'locked', -- locked | available | in_progress | submitted | completed
  video_watched boolean default false,
  unlocked_at   timestamptz,
  started_at    timestamptz,
  submitted_at  timestamptz,
  completed_at  timestamptz,
  due_date      date,
  unique(intern_id, task_id)
);

-- ── SUBMISSIONS (core table — file upload lives here) ─────────────────────────
create table public.submissions (
  id              uuid default uuid_generate_v4() primary key,
  intern_id       uuid references public.profiles(id) on delete cascade,
  task_id         uuid references public.tasks(id),
  batch_id        uuid references public.batches(id),
  intern_task_id  uuid references public.intern_tasks(id),

  -- What was submitted
  submission_type text not null, -- url | text | file | mixed
  submission_url  text,
  submission_text text,
  submission_note text,

  -- File upload (Supabase Storage)
  file_url        text,   -- public URL from Supabase Storage
  file_path       text,   -- storage path: submissions/{batch}/{task}/{intern}/{filename}
  file_name       text,
  file_size_bytes bigint,
  file_type       text,   -- MIME type

  -- AI Review
  ai_score            integer,
  ai_status           text,   -- Approved | Needs Improvement | Rejected
  ai_headline         text,
  ai_mentor_note      text,
  ai_strengths        text[],
  ai_next_steps       text[],
  ai_growth_insight   text,
  ai_points_awarded   integer,
  ai_confidence_delta integer,
  ai_reviewed_at      timestamptz,

  -- Mentor override
  mentor_id           uuid references public.profiles(id),
  mentor_score        integer,
  mentor_note         text,
  mentor_status       text,
  mentor_reviewed_at  timestamptz,

  -- Final resolved
  final_status        text default 'pending',
  points_awarded      integer default 0,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── MEETINGS ──────────────────────────────────────────────────────────────────
create table public.meetings (
  id            uuid default uuid_generate_v4() primary key,
  batch_id      uuid references public.batches(id),
  title         text not null,
  meeting_type  text not null, -- training | community | doubt
  meeting_date  date not null,
  start_time    time not null,
  end_time      time not null,
  meeting_link  text not null,
  recording_url text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now()
);

-- ── ATTENDANCE ────────────────────────────────────────────────────────────────
create table public.attendance (
  id          uuid default uuid_generate_v4() primary key,
  intern_id   uuid references public.profiles(id) on delete cascade,
  meeting_id  uuid references public.meetings(id),
  batch_id    uuid references public.batches(id),
  status      text not null, -- present | absent | late
  marked_at   timestamptz default now(),
  marked_by   uuid references public.profiles(id),
  unique(intern_id, meeting_id)
);

-- ── LEAVE REQUESTS ────────────────────────────────────────────────────────────
create table public.leave_requests (
  id              uuid default uuid_generate_v4() primary key,
  intern_id       uuid references public.profiles(id) on delete cascade,
  batch_id        uuid references public.batches(id),
  reason          text not null,
  start_date      date not null,
  end_date        date not null,
  attachment_url  text,
  attachment_path text,
  status          text default 'pending', -- pending | approved | rejected
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  reviewer_note   text,
  created_at      timestamptz default now()
);

-- ── COMMUNITY POSTS ───────────────────────────────────────────────────────────
create table public.community_posts (
  id              uuid default uuid_generate_v4() primary key,
  author_id       uuid references public.profiles(id) on delete cascade,
  batch_id        uuid,
  content         text not null,
  is_pinned       boolean default false,
  is_announcement boolean default false,
  community_type  text default 'batch', -- batch | open
  likes_count     integer default 0,
  created_at      timestamptz default now()
);

-- ── PORTFOLIO ITEMS ───────────────────────────────────────────────────────────
create table public.portfolio_items (
  id            uuid default uuid_generate_v4() primary key,
  intern_id     uuid references public.profiles(id) on delete cascade,
  item_type     text not null, -- website | landing_page | ad_creatives | ad_copies | videos | reporting
  title         text not null,
  description   text,
  url           text,
  file_url      text,
  file_path     text,
  thumbnail_url text,
  is_complete   boolean default false,
  submission_id uuid references public.submissions(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(intern_id, item_type)
);

-- ── MENTOR CHAT ───────────────────────────────────────────────────────────────
create table public.mentor_messages (
  id          uuid default uuid_generate_v4() primary key,
  intern_id   uuid references public.profiles(id) on delete cascade,
  role        text not null, -- intern | mentor
  content     text not null,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles         enable row level security;
alter table public.intern_tasks      enable row level security;
alter table public.submissions       enable row level security;
alter table public.attendance        enable row level security;
alter table public.leave_requests    enable row level security;
alter table public.community_posts   enable row level security;
alter table public.portfolio_items   enable row level security;
alter table public.mentor_messages   enable row level security;

-- Profiles: users see own profile, admins see all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Submissions: interns see own, mentors see all
create policy "Interns can view own submissions"
  on public.submissions for select using (auth.uid() = intern_id);
create policy "Interns can insert own submissions"
  on public.submissions for insert with check (auth.uid() = intern_id);
create policy "Interns can update own submissions"
  on public.submissions for update using (auth.uid() = intern_id);

-- Intern tasks: own only
create policy "Interns can view own tasks"
  on public.intern_tasks for select using (auth.uid() = intern_id);
create policy "Interns can update own tasks"
  on public.intern_tasks for update using (auth.uid() = intern_id);

-- Attendance: own only
create policy "Interns can view own attendance"
  on public.attendance for select using (auth.uid() = intern_id);

-- Leave: own only
create policy "Interns can view own leave"
  on public.leave_requests for select using (auth.uid() = intern_id);
create policy "Interns can insert leave"
  on public.leave_requests for insert with check (auth.uid() = intern_id);

-- Community: all authenticated users can read, own posts to write
create policy "Authenticated can view posts"
  on public.community_posts for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert posts"
  on public.community_posts for insert with check (auth.uid() = author_id);

-- Portfolio: own only
create policy "Interns can manage own portfolio"
  on public.portfolio_items for all using (auth.uid() = intern_id);

-- Mentor chat: own only
create policy "Interns can manage own chat"
  on public.mentor_messages for all using (auth.uid() = intern_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase → Storage → New Bucket
-- OR uncomment and run here
-- ═══════════════════════════════════════════════════════════════════════════

-- insert into storage.buckets (id, name, public) values ('submissions', 'submissions', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('leave-attachments', 'leave-attachments', false);

-- Storage policy for submissions bucket
-- create policy "Interns can upload own submissions"
--   on storage.objects for insert with check (
--     bucket_id = 'submissions' and auth.uid()::text = (storage.foldername(name))[3]
--   );
-- create policy "Public can view submissions"
--   on storage.objects for select using (bucket_id = 'submissions');

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Tasks (all 20)
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.tasks (task_number, task_code, title, mission_title, description, instructions, video_type, video_duration, category, points, day_number, allows_url, allows_text, allows_file) values
(1,'T01','Research the Arena','Meta Ads & YouTube Research','Understand the competitive landscape of Meta Ads and YouTube content. Analyse top-performing ads, identify winning angles, and document your findings.',
 array['Search Meta Ads Library for 10 digital marketing or coaching ads','Screenshot 5 ads — explain WHY each works','Find 3 YouTube channels in coaching/marketing niche with 10K+ subscribers','Document the top 3 content formats they use','Submit a Google Doc or Notion page with all findings'],
 'youtube','18 min','Research',50,1,true,true,false),

(2,'T02','Study the Players','Instagram & LinkedIn Profile Research','Audit 10 strong personal brands. Understand what makes their profiles convert attention into followers and leads.',
 array['Find 5 Instagram profiles in marketing/business niche','Find 5 LinkedIn profiles of marketing consultants or coaches','For each: note bio clarity, content consistency, CTA strength','Screenshot each profile with your analysis','Identify 3 things to replicate on your own profile'],
 'youtube','14 min','Research',50,2,true,true,false),

(3,'T03','Define Your Ideal Client','ICP Creation & Content Calendar','Build a detailed Ideal Customer Profile and create a 30-day content calendar based on your ICP pain points and desires.',
 array['Define ICP: demographics, psychographics, pain points, desires','Identify where your ICP spends time online','Create a 30-day content calendar with post types and topics','Include 10 hook ideas in your ICP''s own language','Submit ICP doc + content calendar'],
 'youtube','22 min','Strategy',75,3,true,false,true),

(4,'T04','Build Your Digital Home','Profile Setup — Instagram & LinkedIn','Set up your fully optimised Instagram and LinkedIn profiles using everything from T01–T03.',
 array['Write Instagram bio: clear value proposition + CTA','Set up LinkedIn headline, about section, featured section','Add a professional profile photo','Pin your best content / create Instagram highlights covers','Submit screenshots of both profiles + URLs'],
 'youtube','26 min','Execution',75,4,true,false,true),

(5,'T05','Find Your Voice','Write 5 Instagram + 5 LinkedIn Posts','Write 10 posts using proven copywriting frameworks. Focus on hooks that stop the scroll and CTAs that drive action.',
 array['Write 5 Instagram captions: educational, story, controversy, tips, CTA','Write 5 LinkedIn posts: career insight, case study, opinion, lesson, offer','Each post must have: Hook, Body (3–5 lines), CTA','Use at least 2 different frameworks','Submit all 10 posts in one Google Doc'],
 'youtube','31 min','Content',100,5,true,true,false),

(6,'T06','Design That Stops Scroll','Instagram Post Design','Design 5 Instagram post graphics using Canva or Figma. Apply your personal brand identity.',
 array['Design 5 Instagram carousels or static posts in Canva','Use a consistent colour palette (max 3 colours)','Each design: hook text + visual element + your branding','Export at 1080×1080px or 1080×1350px','Submit Canva share link + exported images'],
 'youtube','20 min','Design',100,6,true,false,true),

(7,'T07','Show Your Face','AI Avatar Video + Self Shot Video','Create one AI avatar video using HeyGen or Synthesia, and record one self-shot talking-head video.',
 array['Create a 60–90 second AI avatar video using HeyGen (free trial)','Topic: any digital marketing tip you learned','Record a self-shot 60-second talking head video','Basic edit: cut silences, add captions if possible','Submit both video links (Drive, Loom, or YouTube unlisted)'],
 'youtube','28 min','Video',125,7,true,false,true),

(8,'T08','Give Your Brand a Voice','AI Voice Clone + Ad Voiceover','Clone your voice using ElevenLabs or Murf. Record professional voiceovers for two ad scripts — one cold, one warm.',
 array['Create a voice clone on ElevenLabs (free tier)','Write 2 ad scripts: 1 cold audience, 1 warm/retargeting','Generate voiceovers for both scripts (30–60 seconds each)','Download audio files (MP3)','Submit: Drive link to both audio files + the 2 written scripts'],
 'youtube','19 min','Audio',125,8,true,true,true),

(9,'T09','Own Your Corner of the Internet','Personal Brand Website','Build your personal brand website with portfolio, about page, services section, and contact form.',
 array['Choose Framer (recommended), Webflow, or Carrd','Pages required: Home, About, Portfolio/Work, Contact','Must include: your ICP, services, one case study','Add social links and a contact form','Submit your live website URL'],
 'youtube','34 min','Web',150,9,true,false,false),

(10,'T10','Hunt Real Opportunities','Local Business Research','Research 5 local businesses. Identify their marketing gaps, social presence, and growth opportunities.',
 array['Pick 5 local businesses (restaurant, gym, clinic, salon, coaching)','Check Instagram, Facebook, Google Business, website','For each: score 1–10 on social presence, ads, website quality','Identify #1 marketing gap for each','Write a 1-para pitch for each explaining how you''d help'],
 'youtube','16 min','Research',75,10,true,true,false),

(11,'T11','Write Words That Sell','Landing Page Copy','Write complete conversion-optimised landing page copy for one business from T10.',
 array['Choose 1 business from your T10 research','Write: headline, subheadline, benefits, CTA, FAQ','Use the PAPA framework (Problem, Agitate, Proof, Action)','Write at least 3 alternative headlines','Submit as a Google Doc with clear section labels'],
 'youtube','38 min','Copy',100,11,true,true,false),

(12,'T12','Build the Machine','Build a Landing Page','Take your T11 copy and build an actual live landing page on a real URL.',
 array['Use Carrd (free), Framer, or similar tool','Implement your T11 copy exactly','Add a functional contact/lead form','Make it mobile responsive — test on phone','Submit live URL + screenshot'],
 'youtube','42 min','Web',150,12,true,false,true),

(13,'T13','Create 10 Weapons','5 Ad Copy Sets + 5 Ad Designs','Write 5 complete ad copy sets and design 5 matching ad creatives as a unified campaign.',
 array['Write 5 ad copy sets: hook, primary text, headline, description, CTA','Each targets a different stage of awareness','Design 5 matching creatives in Canva','Creatives must match the copy''s emotion','Submit: Google Doc for copies + Canva links for designs'],
 'youtube','45 min','Ads',150,13,true,false,true),

(14,'T14','Go Authentic','UGC Scripts + Video Creation','Write 3 UGC-style video scripts and record yourself delivering them.',
 array['Write 3 UGC scripts: problem-solution, testimonial-style, tutorial','Record yourself delivering each (30–60 seconds each)','Edit: remove pauses, add subtitles if possible','Create a simple cover thumbnail for each','Submit: Drive/YouTube links to all 3 videos + scripts'],
 'youtube','29 min','Video',150,14,true,false,true),

(15,'T15','Attack a Niche','Gym Research + Ad Creatives','Research 3 gym businesses. Create a targeted 3-ad campaign for one as if you were their marketer.',
 array['Research 3 gyms in your city on Instagram and Google','Pick 1 gym with the clearest marketing gap','Write 3 ad copy sets for their primary offer','Design 3 matching ad creatives','Submit: full campaign brief + background + target audience + 3 ads'],
 'youtube','24 min','Ads',125,15,true,false,true),

(16,'T16','Launch Like a Pro','Meta Ads Campaign Setup','Set up a complete Meta Ads campaign — campaign, ad set, and ad level. Document every setting.',
 array['Create a test campaign in Meta Ads Manager (draft — no spend needed)','Set up: campaign objective, ad set targeting, ad creative','Screenshot every step with annotations explaining choices','Write a brief explanation of your targeting rationale','Submit: screenshot PDF + written rationale'],
 'youtube','52 min','Ads',200,16,true,false,true),

(17,'T17','Speak Client Language','Client Reporting Sheet','Build a professional client reporting template in Google Sheets.',
 array['Build in Google Sheets: Summary, Ad Performance, Lead Tracker, Recommendations tabs','Summary tab: spend, leads, CPL, ROAS with auto-calculated formulas','Ad Performance: breakdown by campaign, ad set, creative','Add conditional formatting (red/green) for KPI status','Submit Google Sheets link (view access)'],
 'youtube','21 min','Strategy',100,17,true,false,false),

(18,'T18','30 Real Conversations','Outreach 30 People + Local Business Pitch','Do actual outreach to 30 potential clients. Record at least one discovery call.',
 array['Create a tracking sheet: name, platform, date, message, response','Send 30 outreach messages using the template from the lesson','Book at least 1 discovery call or in-person meeting','Record the call (with permission) or write a detailed debrief','Submit: tracking sheet + call recording/debrief'],
 'youtube','41 min','Sales',200,18,true,true,true),

(19,'T19','Sell the Internship','Internship Program Ad Creatives + Videos','Create promotional content for MarkeTrix Academy itself. This will be used.',
 array['Write 2 ad copy sets for the internship program','Design 2 ad creatives (static + story format)','Record a 60-second video testimonial/promo — you are the face','Create a reel cover and caption','Submit all files + copies in one Google Drive folder'],
 'youtube','18 min','Ads',175,19,true,false,true),

(20,'T20','Present Yourself to the World','Portfolio — Complete & Launch','Compile your complete portfolio with all deliverables from T01–T19. Write case studies. This is your proof.',
 array['Update your T09 website with all portfolio pieces','Write a 2-para case study for at least 5 tasks','Add screenshots, links, and results where possible','Record a 2-minute portfolio walkthrough video','Submit: final portfolio URL + walkthrough video link'],
 'youtube','33 min','Portfolio',250,20,true,false,true);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED BATCH
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.batches (name, code, start_date, end_date, is_active) values
('Batch 7', 'BATCH7-2025', '2025-05-01', '2025-06-28', true);
