import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAIReview } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      taskId, taskCode, taskTitle, taskDescription, taskPoints,
      submissionType, submissionUrl, submissionText, submissionNote,
      fileUrl, filePath, fileName, fileSizeBytes, fileType,
    } = body

    const submissionContent = submissionUrl || submissionText || (fileName ? `File uploaded: ${fileName}` : '')
    const aiResult = await runAIReview({
      taskCode, taskTitle, taskDescription, taskPoints,
      submission: submissionContent,
    })

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        intern_id: user.id,
        task_id: taskId,
        submission_type: submissionType,
        submission_url: submissionUrl,
        submission_text: submissionText,
        submission_note: submissionNote,
        file_url: fileUrl,
        file_path: filePath,
        file_name: fileName,
        file_size_bytes: fileSizeBytes,
        file_type: fileType,
        ai_score: aiResult.score,
        ai_status: aiResult.status,
        ai_headline: aiResult.headline,
        ai_mentor_note: aiResult.mentor_note,
        ai_strengths: aiResult.strengths,
        ai_next_steps: aiResult.next_steps,
        ai_growth_insight: aiResult.growth_insight,
        ai_points_awarded: aiResult.points_awarded,
        ai_confidence_delta: aiResult.confidence_delta,
        ai_reviewed_at: new Date().toISOString(),
        final_status: 'ai_reviewed',
        points_awarded: aiResult.points_awarded,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ submission: data, review: aiResult })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const s
cat > src/app/api/ai-review/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { runAIReview } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await runAIReview({
      taskCode: body.taskCode,
      taskTitle: body.taskTitle,
      taskDescription: body.taskDescription,
      taskPoints: body.taskPoints,
      submission: body.submission,
      internName: body.internName,
    })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
