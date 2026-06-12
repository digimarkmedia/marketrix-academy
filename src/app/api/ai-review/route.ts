import { NextRequest, NextResponse } from 'next/server'
import { runAIReview } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await runAIReview({
      taskCode:        body.taskCode,
      taskTitle:       body.taskTitle,
      taskDescription: body.taskDescription,
      taskPoints:      body.taskPoints,
      submission:      body.submission,
      internName:      body.internName,
    })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
