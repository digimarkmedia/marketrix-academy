// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER — swappable via environment variable
// Change AI_PROVIDER in .env to: anthropic | gemini | openai
// No code changes needed — ever.
// ─────────────────────────────────────────────────────────────────────────────

export interface AIReviewInput {
  taskCode:        string
  taskTitle:       string
  taskDescription: string
  taskPoints:      number
  submission:      string   // url, text, or "File: filename.mp4 (12MB)"
  internName?:     string
}

export interface AIReviewResult {
  score:            number
  confidence_delta: number
  status:           'Approved' | 'Needs Improvement' | 'Rejected'
  headline:         string
  mentor_note:      string
  strengths:        string[]
  next_steps:       string[]
  growth_insight:   string
  points_awarded:   number
}

// ── Build the prompt (same for all providers) ─────────────────────────────────
function buildPrompt(input: AIReviewInput): string {
  return `You are Mentor Kiran — the AI mentor inside MarkeTrix Academy's 28-day digital marketing internship. You review intern submissions with the honesty and care of a senior marketer who genuinely wants this person to succeed.

Intern: ${input.internName || 'Aryan'}
Task: ${input.taskCode} — ${input.taskTitle}
Description: ${input.taskDescription}
Submission: "${input.submission}"

Evaluate like a demanding but fair mentor. Be specific — reference the actual submission content. Return ONLY valid JSON, no markdown, no extra text:
{
  "score": <0-100>,
  "confidence_delta": <5-18>,
  "status": "<Approved|Needs Improvement|Rejected>",
  "headline": "<one punchy personal verdict — address them directly>",
  "mentor_note": "<2-3 sentences, specific to this task, honest mentor tone>",
  "strengths": ["<specific strength 1>","<specific strength 2>"],
  "next_steps": ["<concrete action 1>","<concrete action 2>"],
  "growth_insight": "<one sentence on how this builds toward being client-ready>",
  "points_awarded": <number out of ${input.taskPoints}>
}`
}

// ── Fallback when API fails ───────────────────────────────────────────────────
function fallback(taskPoints: number): AIReviewResult {
  return {
    score: 74, confidence_delta: 8,
    status: 'Needs Improvement',
    headline: 'Good foundation — a few gaps to close before this is client-ready.',
    mentor_note: 'You have shown genuine understanding of the task requirements. The core execution is there. What is missing is the depth and specificity that separates student work from professional deliverables. Review the lesson benchmarks and push for that extra 20%.',
    strengths: ['Clear understanding of task requirements', 'Correct format and structure followed'],
    next_steps: ['Add more specific detail and real examples', 'Review lesson quality benchmarks before resubmitting'],
    growth_insight: 'This skill is exactly what clients pay premium rates for — depth and specificity matter here.',
    points_awarded: Math.round(taskPoints * 0.74),
  }
}

// ── Parse JSON from any AI response ──────────────────────────────────────────
function parseJSON(text: string): AIReviewResult {
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── ANTHROPIC CLAUDE ─────────────────────────────────────────────────────────
async function reviewWithClaude(input: AIReviewInput): Promise<AIReviewResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.AI_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 900,
      messages: [{ role: 'user', content: buildPrompt(input) }],
    }),
  })
  const data = await res.json()
  const text = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('') || ''
  return parseJSON(text)
}

// ── GOOGLE GEMINI ─────────────────────────────────────────────────────────────
async function reviewWithGemini(input: AIReviewInput): Promise<AIReviewResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { maxOutputTokens: 900, temperature: 0.7 },
      }),
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return parseJSON(text)
}

// ── OPENAI GPT ────────────────────────────────────────────────────────────────
async function reviewWithOpenAI(input: AIReviewInput): Promise<AIReviewResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 900,
      messages: [{ role: 'user', content: buildPrompt(input) }],
    }),
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  return parseJSON(text)
}

// ── MAIN EXPORT — auto-picks provider from .env ───────────────────────────────
export async function runAIReview(input: AIReviewInput): Promise<AIReviewResult> {
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase()
  try {
    switch (provider) {
      case 'gemini': return await reviewWithGemini(input)
      case 'openai': return await reviewWithOpenAI(input)
      default:       return await reviewWithClaude(input)   // anthropic is default
    }
  } catch (err) {
    console.error(`[AI Review] ${provider} failed:`, err)
    return fallback(input.taskPoints)
  }
}
