import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAIReview } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      taskId, taskCode, taskTitle, taskDescription, taskPoints,
      submissionType, submissionUrl, submissionText, submissionNote,
      fileUrl, filePath, fileName, fileSizeBytes, fileType,
    } = body

    // Run AI review
    const submissionContent = submissionUrl || submissionText || (fileName ? `File uploaded: ${fileName}` : '')
    const aiResult = await runAIReview({
      taskCode, taskTitle, taskDescription, taskPoints,
      submission: submissionContent,
      internName: user.user_metadata?.full_name,
    })

    // Save to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        intern_id:       user.id,
        task_id:         taskId,
        submission_type: submissionType,
        submission_url:  submissionUrl,
        submission_text: submissionText,
        submission_note: submissionNote,
        file_url:        fileUrl,
        file_path:       filePath,
        file_name:       fileName,
        file_size_bytes: fileSizeBytes,
        file_type:       fileType,
        ai_score:            aiResult.score,
        ai_status:           aiResult.status,
        ai_headline:         aiResult.headline,
        ai_mentor_note:      aiResult.mentor_note,
        ai_strengths:        aiResult.strengths,
        ai_next_steps:       aiResult.next_steps,
        ai_growth_insight:   aiResult.growth_insight,
        ai_points_awarded:   aiResult.points_awarded,
        ai_confidence_delta: aiResult.confidence_delta,
        ai_reviewed_at:      new Date().toISOString(),
        final_status:        'ai_reviewed',
        points_awarded:      aiResult.points_awarded,
      })
      .select()
      .single()

    if (error) throw error

    // Update intern task status
    await supabase
      .from('intern_tasks')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('intern_id', user.id)
      .eq('task_id', taskId)

    // Update intern total points
    await supabase.rpc('increment_points', {
      p_intern_id: user.id,
      p_points:    aiResult.points_awarded,
    })

    return NextResponse.json({ submission: data, review: aiResult })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('submissions')
      .select('*, tasks(task_code, title)')
      .eq('intern_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
