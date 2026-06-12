'use client'
import { useState, useRef, useCallback } from 'react'
import { uploadSubmissionFile, formatFileSize, MAX_FILE_SIZE_BYTES } from '@/lib/upload'
import toast from 'react-hot-toast'

// ── types ─────────────────────────────────────────────────────────────────────
interface Task {
  id:               string
  task_code:        string
  title:            string
  mission_title:    string
  description:      string
  instructions:     string[]
  video_url?:       string
  video_type:       string
  video_duration:   string
  category:         string
  points:           number
  day_number:       number
  allows_url:       boolean
  allows_text:      boolean
  allows_file:      boolean
}

interface Props {
  task:     Task
  status:   'completed' | 'active' | 'locked'
  internId: string
  onBack:   () => void
}

const CAT_COLORS: Record<string, string> = {
  Research:'#2563EB', Strategy:'#7C3AED', Execution:'#EE8256',
  Content:'#EE8256', Design:'#EC4899', Video:'#D97706',
  Audio:'#D97706', Web:'#16A34A', Copy:'#7C3AED',
  Ads:'#EE8256', Sales:'#16A34A', Portfolio:'#7C3AED',
}

export default function TaskDetail({ task, status, internId, onBack }: Props) {
  const col = CAT_COLORS[task.category] || '#EE8256'

  // ── state ──────────────────────────────────────────────────────────────────
  const [phase, setPhase]                 = useState<'lesson'|'submit'|'done'>('lesson')
  const [videoWatched, setVideoWatched]   = useState(status === 'completed')
  const [watchPct, setWatchPct]           = useState(status === 'completed' ? 100 : 0)
  const [submitType, setSubmitType]       = useState<'url'|'text'|'file'>(
    task.allows_url ? 'url' : task.allows_text ? 'text' : 'file'
  )
  const [urlVal, setUrlVal]               = useState('')
  const [textVal, setTextVal]             = useState('')
  const [note, setNote]                   = useState('')
  const [file, setFile]                   = useState<File | null>(null)
  const [dragging, setDragging]           = useState(false)
  const [uploadPct, setUploadPct]         = useState(0)
  const [uploading, setUploading]         = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [result, setResult]               = useState<any>(null)
  const [error, setError]                 = useState<string | null>(null)
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const watchTimerRef                     = useRef<NodeJS.Timeout | null>(null)

  // ── video progress simulation ─────────────────────────────────────────────
  const handleIframeLoad = useCallback(() => {
    if (videoWatched) return
    let pct = watchPct
    watchTimerRef.current = setInterval(() => {
      pct += 1.2
      const next = Math.min(Math.round(pct), 100)
      setWatchPct(next)
      if (next >= 100) {
        if (watchTimerRef.current) clearInterval(watchTimerRef.current)
        setVideoWatched(true)
        toast.success('Lesson complete! Start Task is now unlocked.')
      }
    }, 250)
  }, [videoWatched, watchPct])

  const markWatched = () => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current)
    setWatchPct(100)
    setVideoWatched(true)
    toast.success('Marked as watched — Start Task unlocked.')
  }

  // ── file handling ─────────────────────────────────────────────────────────
  const handleFileSelect = (f: File) => {
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError('File too large. Maximum 500MB allowed.')
      return
    }
    setError(null)
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const hasContent =
      (submitType === 'url'  && urlVal.trim()) ||
      (submitType === 'text' && textVal.trim()) ||
      (submitType === 'file' && file)

    if (!hasContent) { setError('Please add your submission before continuing.'); return }

    setError(null)
    setSubmitting(true)

    try {
      let fileUrl: string | undefined
      let filePath: string | undefined
      let fileName: string | undefined
      let fileSizeBytes: number | undefined
      let fileType: string | undefined

      // ── Step 1: Upload file to Supabase Storage (if file submission) ──────
      if (submitType === 'file' && file) {
        setUploading(true)
        const uploaded = await uploadSubmissionFile(
          file, task.task_code, internId,
          (pct) => setUploadPct(pct)
        )
        setUploading(false)
        fileUrl      = uploaded.url
        filePath     = uploaded.path
        fileName     = uploaded.name
        fileSizeBytes= uploaded.size
        fileType     = uploaded.type
      }

      // ── Step 2: Save submission + run AI review via API route ─────────────
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId:          task.id,
          taskCode:        task.task_code,
          taskTitle:       task.title,
          taskDescription: task.description,
          taskPoints:      task.points,
          submissionType:  submitType,
          submissionUrl:   submitType === 'url'  ? urlVal  : undefined,
          submissionText:  submitType === 'text' ? textVal : undefined,
          submissionNote:  note || undefined,
          fileUrl, filePath, fileName, fileSizeBytes, fileType,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Submission failed')
      }

      const data = await response.json()
      setResult(data)
      setPhase('done')
      toast.success(`+${data.review?.points_awarded} points earned!`)
    } catch (e: any) {
      setError(e.message || 'Submission failed. Please try again.')
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  // ── Status colors ─────────────────────────────────────────────────────────
  const sColor: Record<string,string> = { Approved:'#16A34A', 'Needs Improvement':'#D97706', Rejected:'#DC2626' }
  const sBg:    Record<string,string> = { Approved:'#F0FDF4', 'Needs Improvement':'#FFFBEB', Rejected:'#FEF2F2' }

  // ── get available submission types ───────────────────────────────────────
  const subTypes = [
    task.allows_url  && 'url',
    task.allows_text && 'text',
    task.allows_file && 'file',
  ].filter(Boolean) as ('url'|'text'|'file')[]

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-5">
      {/* step indicator */}
      <div className="flex justify-between items-center">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-ink-lt border border-surface-alt rounded-lg px-3 py-1.5 hover:border-ink-xl transition-colors"
          style={{ fontFamily:'DM Sans, sans-serif' }}>
          ← All Tasks
        </button>
        <div className="flex items-center gap-1">
          {(['lesson','submit','done'] as const).map((s, i) => {
            const done   = ['lesson','submit','done'].indexOf(phase) > i
            const active = phase === s
            const labels = ['Watch Lesson','Submit Work','AI Review']
            return (
              <div key={s} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done ? 'bg-green-600 text-white' : active ? 'text-white' : 'bg-surface-alt text-ink-xl'}`}
                    style={{ background: active ? '#EE8256' : undefined, fontFamily:'JetBrains Mono, monospace' }}>
                    {done ? '✓' : i+1}
                  </div>
                  <span className={`text-xs font-semibold ${done ? 'text-green-600' : active ? 'text-ink' : 'text-ink-xl'}`}
                    style={{ fontFamily:'DM Sans, sans-serif' }}>
                    {labels[i]}
                  </span>
                </div>
                {i < 2 && <div className={`w-6 h-px ${done ? 'bg-green-600' : 'bg-surface-alt'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* task header */}
      <div className="bg-white rounded-xl p-4 flex justify-between items-center"
        style={{ borderLeft:`4px solid ${col}`, border:`1px solid ${col}25`, borderLeftWidth:4, borderLeftColor:col }}>
        <div>
          <div className="text-xs font-bold mb-1" style={{ fontFamily:'JetBrains Mono, monospace', color:col, letterSpacing:'0.04em' }}>
            DAY {task.day_number} · {task.task_code}
          </div>
          <div className="text-xl font-extrabold text-ink" style={{ fontFamily:'DM Sans, sans-serif', letterSpacing:'-0.01em' }}>
            {task.title}
          </div>
          <div className="text-sm text-ink-lt mt-0.5" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
            {task.mission_title}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color:col, background:col+'15', border:`1px solid ${col}22` }}>{task.category}</span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50" style={{ border:'1px solid #BBF7D0' }}>+{task.points} pts</span>
          {status === 'completed' && <span className="text-xs font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50">Completed</span>}
          {status === 'active'    && <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color:'#EE8256', background:'#FFF3ED' }}>Active</span>}
        </div>
      </div>

      {/* ═════ PHASE: LESSON ═════ */}
      {phase === 'lesson' && (
        <div className="flex flex-col gap-5">
          {/* Video player */}
          <div className="rounded-2xl overflow-hidden" style={{ background:'#0F1117' }}>
            <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom:'1px solid #1F2937' }}>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:9 }}>Lesson Video</div>
                <div className="text-sm font-semibold text-white" style={{ fontFamily:'DM Sans, sans-serif' }}>{task.title} — Lesson</div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color:'#EE8256', background:'#EE825620', fontSize:10 }}>{task.video_duration}</span>
                {videoWatched && <span className="text-xs font-semibold px-2 py-1 rounded-full text-green-400" style={{ background:'#16A34A20', fontSize:10 }}>Watched</span>}
              </div>
            </div>

            {/* iframe */}
            <div className="relative" style={{ paddingBottom:'56.25%', height:0 }}>
              {task.video_url ? (
                <iframe
                  src={task.video_url}
                  title={`${task.task_code} Lesson`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background:'#0D1117' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:'#1F2937' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#374151"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 font-medium mb-1" style={{ fontFamily:'DM Sans, sans-serif' }}>
                      Add your video URL in Supabase
                    </div>
                    <div className="text-xs text-gray-600" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                      Tasks table → video_url column → paste YouTube embed URL
                    </div>
                  </div>
                  <button onClick={markWatched} className="mt-2 text-xs px-4 py-2 rounded-lg transition-colors" style={{ border:'1px solid #374151', color:'#9CA3AF', background:'transparent', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                    Mark as watched to continue
                  </button>
                </div>
              )}
            </div>

            {/* progress bar */}
            <div className="px-5 py-3" style={{ background:'#0D1117' }}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-gray-500" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Watch progress</span>
                <span className="text-xs font-bold" style={{ fontFamily:'JetBrains Mono, monospace', color: videoWatched ? '#16A34A' : '#EE8256' }}>{watchPct}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background:'#1F2937' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width:`${watchPct}%`, background: videoWatched ? '#16A34A' : '#EE8256' }} />
              </div>
              {!videoWatched && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-600" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Watch the full lesson to unlock Start Task</span>
                  <button onClick={markWatched} className="text-xs underline" style={{ color:'#EE8256', background:'none', border:'none', cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                    Already watched
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl p-5" style={{ border:'1px solid #EBEBEB' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm font-bold text-ink mb-1" style={{ fontFamily:'DM Sans, sans-serif' }}>Task Instructions</div>
                <div className="text-xs text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Complete all steps, then submit for AI review.</div>
              </div>
            </div>
            <p className="text-sm text-ink-md leading-relaxed mb-4" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{task.description}</p>
            <div className="flex flex-col gap-2">
              {task.instructions.map((step, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    style={{ background:col+'15', border:`1px solid ${col}25`, color:col, fontFamily:'JetBrains Mono, monospace' }}>
                    {i+1}
                  </div>
                  <span className="text-sm text-ink-md leading-relaxed" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-5 flex justify-between items-center transition-all"
            style={{ background: videoWatched ? '#FFFFFF' : '#F6F5F3', border:`1px solid ${videoWatched ? col+'30' : '#EBEBEB'}` }}>
            <div>
              <div className="text-sm font-bold mb-1" style={{ fontFamily:'DM Sans, sans-serif', color: videoWatched ? '#111827' : '#6B7280' }}>
                {videoWatched ? 'Ready to start this mission?' : 'Watch the lesson to unlock this task'}
              </div>
              <div className="text-xs text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                {videoWatched
                  ? `Submit your work and get instant AI feedback from Mentor Kiran · +${task.points} pts`
                  : 'Everything you need is in the video above.'}
              </div>
            </div>
            {videoWatched ? (
              <button onClick={() => setPhase('submit')}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 min-w-[140px]"
                style={{ background:'#EE8256', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                Start Task →
              </button>
            ) : (
              <button disabled
                className="px-6 py-3 rounded-xl text-sm font-bold min-w-[140px]"
                style={{ background:'#F6F5F3', border:'1px solid #EBEBEB', color:'#9CA3AF', cursor:'not-allowed', fontFamily:'DM Sans, sans-serif' }}>
                🔒 Watch First
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═════ PHASE: SUBMIT ═════ */}
      {phase === 'submit' && (
        <div className="flex flex-col gap-4">
          {/* watched confirmation */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0' }}>
            <svg width="15" height="15" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            <span className="text-xs font-medium text-green-700" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
              Lesson watched — submitting {task.task_code}: {task.title}
            </span>
          </div>

          {/* submission form */}
          <div className="bg-white rounded-2xl p-5" style={{ border:'1px solid #EBEBEB' }}>
            <div className="text-sm font-bold text-ink mb-1" style={{ fontFamily:'DM Sans, sans-serif' }}>Submit Your Work</div>
            <div className="text-xs text-ink-lt mb-4" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
              Mentor Kiran reviews every submission with specific, honest feedback.
            </div>

            {/* type tabs */}
            {subTypes.length > 1 && (
              <div className="flex p-1 rounded-xl mb-4 gap-1" style={{ background:'#F6F5F3' }}>
                {subTypes.map(t => (
                  <button key={t} onClick={() => setSubmitType(t)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: submitType === t ? '#FFFFFF' : 'transparent', color: submitType === t ? '#111827' : '#6B7280', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', boxShadow: submitType === t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                    {t === 'url' ? 'Link / URL' : t === 'text' ? 'Description' : 'File Upload'}
                  </button>
                ))}
              </div>
            )}

            {/* URL */}
            {submitType === 'url' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                  Google Drive, Loom, YouTube (unlisted), Notion, Canva, or any public link
                </label>
                <input value={urlVal} onChange={e => setUrlVal(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-ink"
                  style={{ border:'1px solid #EBEBEB', fontFamily:'Plus Jakarta Sans, sans-serif', outline:'none' }} />
              </div>
            )}

            {/* Text */}
            {submitType === 'text' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                  Describe what you built, tools used, and paste any links
                </label>
                <textarea value={textVal} onChange={e => setTextVal(e.target.value)} rows={5}
                  placeholder="Describe your submission in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-ink resize-y leading-relaxed"
                  style={{ border:'1px solid #EBEBEB', fontFamily:'Plus Jakarta Sans, sans-serif', outline:'none' }} />
              </div>
            )}

            {/* File upload */}
            {submitType === 'file' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                  Upload your file — video (MP4/MOV), audio (MP3), PDF, images, ZIP · Max 500MB
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                  className="rounded-xl transition-all"
                  style={{ border:`2px dashed ${dragging ? '#EE8256' : file ? '#16A34A' : '#D4D4D4'}`, padding: file ? 16 : 32, textAlign:'center', cursor: file ? 'default' : 'pointer', background: dragging ? '#FFF3ED' : file ? '#F0FDF4' : '#F6F5F3' }}>
                  <input ref={fileInputRef} type="file"
                    accept="video/*,audio/*,image/*,.pdf,.zip,.mp4,.mov,.mp3,.doc,.docx,.xlsx"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

                  {file ? (
                    <div className="flex gap-3 items-center text-left">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0' }}>
                        <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink truncate" style={{ fontFamily:'DM Sans, sans-serif' }}>{file.name}</div>
                        <div className="text-xs text-ink-lt mt-0.5" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                          {formatFileSize(file.size)} · {file.type || 'file'}
                        </div>
                        {uploading && (
                          <div className="mt-2">
                            <div className="h-1 rounded-full" style={{ background:'#EBEBEB' }}>
                              <div className="h-full rounded-full transition-all" style={{ width:`${uploadPct}%`, background:'#EE8256' }} />
                            </div>
                            <div className="text-xs font-bold mt-1" style={{ color:'#EE8256', fontFamily:'JetBrains Mono, monospace' }}>
                              Uploading to Supabase {uploadPct}%...
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="text-ink-xl text-xl leading-none" style={{ background:'none', border:'none', cursor:'pointer' }}>×</button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background:'#FFFFFF', border:'1px solid #EBEBEB' }}>
                        <svg width="22" height="22" fill="none" stroke="#6B7280" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div className="text-sm font-semibold text-ink mb-1" style={{ fontFamily:'DM Sans, sans-serif' }}>Drop file here or click to browse</div>
                      <div className="text-xs text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Video, Audio, PDF, Images, ZIP · Max 500 MB</div>
                      <div className="text-xs text-ink-xl mt-2" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                        <strong className="text-ink">T07, T14, T19, T20:</strong> upload your video file directly here → goes to Supabase Storage
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* note */}
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-lt" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Note for Mentor Kiran (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder="Any context — challenges faced, tools used, questions..."
                className="w-full px-3 py-2 rounded-xl text-xs text-ink resize-none leading-relaxed"
                style={{ border:'1px solid #EBEBEB', fontFamily:'Plus Jakarta Sans, sans-serif', outline:'none' }} />
            </div>

            {error && (
              <div className="mt-3 px-4 py-2.5 rounded-xl" style={{ background:'#FEF2F2', border:'1px solid #DC262622' }}>
                <span className="text-xs text-red-600" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{error}</span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting || uploading}
              className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity"
              style={{ background: submitting || uploading ? '#D4D4D4' : '#EE8256', border:'none', cursor: submitting || uploading ? 'not-allowed' : 'pointer', fontFamily:'DM Sans, sans-serif' }}>
              {submitting && !uploading ? (
                <><Spinner /> Mentor Kiran is reviewing...</>
              ) : uploading ? (
                <><Spinner /> Uploading {uploadPct}%...</>
              ) : (
                'Submit for Mentor Review →'
              )}
            </button>
          </div>

          <button onClick={() => setPhase('lesson')}
            className="text-xs text-ink-lt self-start px-3 py-1.5 rounded-lg border transition-colors hover:border-ink-xl"
            style={{ border:'1px solid #EBEBEB', background:'transparent', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            ← Back to Lesson
          </button>
        </div>
      )}

      {/* ═════ PHASE: DONE (review result) ═════ */}
      {phase === 'done' && result && (() => {
        const review   = result.review || result
        const aiStatus = review.ai_status   || review.status
        const aiScore  = review.ai_score    || review.score    || 0
        const aiDelta  = review.ai_confidence_delta || review.confidence_delta || 8
        const aiPts    = review.ai_points_awarded   || review.points_awarded   || 0
        const sc = sColor[aiStatus] || '#D97706'
        const bg = sBg[aiStatus]   || '#FFFBEB'

        return (
          <div className="flex flex-col gap-4">
            {/* mentor card */}
            <div className="rounded-2xl p-6" style={{ background:'#0F1117', border:`1px solid ${sc}25` }}>
              <div className="flex gap-3 items-start mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,#7C3AED,#EE8256)' }}>
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-sm font-semibold text-white" style={{ fontFamily:'DM Sans, sans-serif' }}>Mentor Kiran</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color:sc, background:sc+'20', border:`1px solid ${sc}30`, fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                      {aiStatus}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white leading-snug" style={{ fontFamily:'DM Sans, sans-serif' }}>
                    {review.ai_headline || review.headline}
                  </div>
                </div>
              </div>

              {/* score + confidence + points */}
              <div className="grid gap-3 mb-5 p-4 rounded-xl" style={{ gridTemplateColumns:'auto 1fr auto', background:'#0D1117', alignItems:'center' }}>
                {/* ring */}
                <div style={{ position:'relative', width:64, height:64 }}>
                  <svg width="64" height="64" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#1F2937" strokeWidth="6"/>
                    <circle cx="32" cy="32" r="26" fill="none" stroke={sc} strokeWidth="6"
                      strokeDasharray={`${2*Math.PI*26*aiScore/100} ${2*Math.PI*26}`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:15, fontWeight:700, fontFamily:'JetBrains Mono, monospace', color:sc }}>{aiScore}</span>
                  </div>
                </div>
                {/* confidence boost */}
                <div>
                  <div className="text-xs text-gray-500 mb-2" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>Confidence score boost</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600" style={{ fontFamily:'JetBrains Mono, monospace' }}>42%</span>
                    <div className="flex-1 h-1.5 rounded-full relative overflow-hidden" style={{ background:'#1F2937' }}>
                      <div style={{ position:'absolute', left:0, top:0, height:'100%', width:'42%', background:'#D97706', borderRadius:99 }}/>
                      <div style={{ position:'absolute', left:'42%', top:0, height:'100%', width:`${aiDelta}%`, background:'#16A34A', borderRadius:99 }}/>
                    </div>
                    <span className="text-xs font-bold text-green-400" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                      +{aiDelta}% → {42+aiDelta}%
                    </span>
                  </div>
                </div>
                {/* points */}
                <div className="text-center px-4 py-3 rounded-xl" style={{ background:'#FFF3ED', border:'1px solid #F9C5AD' }}>
                  <div style={{ fontSize:26, fontWeight:700, fontFamily:'JetBrains Mono, monospace', color:'#EE8256', lineHeight:1 }}>+{aiPts}</div>
                  <div className="text-xs text-ink-lt mt-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>points</div>
                </div>
              </div>

              {/* mentor note */}
              <div className="p-4 rounded-xl" style={{ background:'#0D1117', borderLeft:'3px solid #7C3AED' }}>
                <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2" style={{ fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:9 }}>Mentor Note</div>
                <p className="text-sm leading-relaxed" style={{ color:'#D1D5DB', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
                  {review.ai_mentor_note || review.mentor_note}
                </p>
              </div>
            </div>

            {/* strengths + next steps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0' }}>
                <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3" style={{ fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:9 }}>What worked</div>
                {(review.ai_strengths || review.strengths || []).map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <svg width="13" height="13" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5"/></svg>
                    <span className="text-xs text-ink-md leading-relaxed" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background:'#FFFBEB', border:'1px solid #D9770622' }}>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3" style={{ fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:9 }}>Next steps</div>
                {(review.ai_next_steps || review.next_steps || []).map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <svg width="13" height="13" fill="none" stroke="#D97706" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <span className="text-xs text-ink-md leading-relaxed" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* growth insight */}
            {(review.ai_growth_insight || review.growth_insight) && (
              <div className="px-4 py-3 rounded-xl" style={{ background:'#F5F3FF', border:'1px solid #7C3AED22' }}>
                <span className="text-xs font-bold text-purple-700" style={{ fontFamily:'DM Sans, sans-serif' }}>Client-Ready Insight: </span>
                <span className="text-xs text-ink-md" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>{review.ai_growth_insight || review.growth_insight}</span>
              </div>
            )}

            <div className="flex gap-2">
              {aiStatus !== 'Approved' && (
                <button onClick={() => { setResult(null); setPhase('submit') }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background:'#FFF3ED', color:'#EE8256', border:'1px solid #F9C5AD', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                  Resubmit
                </button>
              )}
              <button onClick={onBack}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-ink-lt transition-colors"
                style={{ border:'1px solid #EBEBEB', background:'transparent', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                ← Back to Journey
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

const Spinner = () => (
  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white flex-shrink-0"
    style={{ animation:'spin 0.7s linear infinite' }} />
)
