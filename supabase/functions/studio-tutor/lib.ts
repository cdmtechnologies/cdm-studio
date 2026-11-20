// Pure helpers for studio-tutor (unit tested).
export type Turn = { role: 'user' | 'assistant'; content: string }
type Meta = { track: string; title: string; kind: string; task: string | null; practice: string | null; hint: string | null; body: string } | null

/** Earlier turns from the browser: well-formed text only, newest 8, starting with the learner. */
export function cleanHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return []
  const out: Turn[] = []
  for (const m of raw.slice(-8)) {
    const role = (m as { role?: unknown })?.role
    const content = (m as { content?: unknown })?.content
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) continue
    const text = content.replace(/\u0000/g, '').slice(0, role === 'user' ? 2000 : 3000)
    if (out.length && out[out.length - 1].role === role) out[out.length - 1] = { role, content: text }
    else out.push({ role, content: text })
  }
  while (out.length && out[0].role !== 'user') out.shift()
  // the new question is added after these, so the history must end with the tutor
  while (out.length && out[out.length - 1].role !== 'assistant') out.pop()
  return out
}

const BASE = `You are the tutor in CDM Studio, a friendly platform where people (many of them beginners, many in Africa) learn AI, web development, apps, games and data.
- Reply in the language the learner writes in (English, Pidgin, Hausa, Yoruba, Igbo, French and others).
- Be warm, short and concrete: a few sentences or a short list. Use simple words and everyday examples.
- Format with Markdown; code in fenced blocks, short.
- Never ask for or accept passwords, card numbers, PINs or other private data; if shared, tell them not to.
- Stay on learning and building. Politely decline harmful requests.`

export function tutorSystem(mode: 'help' | 'practice' | 'explain', lesson: Meta): string {
  const ctx = lesson ? `\n\nThe learner is on the lesson "${lesson.title}" (${lesson.track}).${lesson.task ? `\nTask: ${lesson.task}` : ''}${lesson.practice ? `\nPractice: ${lesson.practice}` : ''}\nLesson text: ${lesson.body}${lesson.hint ? `\nOfficial hint: ${lesson.hint}` : ''}` : ''
  if (mode === 'practice') {
    return `${BASE}${ctx}

The learner is practising writing prompts. First answer their prompt properly, as a helpful AI assistant would (keep it reasonably short).
Then add a section starting "**Prompt coach:**" that scores their prompt out of 10 on the 4 parts (context, task, details/limits, format) in one line each, and gives an improved version of their prompt in a quote block.`
  }
  if (mode === 'explain') {
    return `${BASE}

Explain the learner's project for a beginner: what each part of the page does (structure, style, behaviour), naming the key HTML elements, CSS ideas and JavaScript functions, and point out 2 things they could try changing themselves to learn. Under 350 words.`
  }
  return `${BASE}${ctx}

Teach, do not just solve: first give a hint or a guiding question that moves them one step forward, and point at the line or idea to look at. Explain error messages in plain words.
Only give the complete solution if the learner clearly asks for it again after a hint, or says they want to see the answer, and then explain each part.`
}
