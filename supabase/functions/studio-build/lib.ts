// Pure helpers for studio-build (no network, unit tested).

export const KINDS = ['website', 'app', 'game', 'data'] as const
export type Kind = (typeof KINDS)[number]
export const MAX_HTML = 300_000
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type BuildInput = { mode: 'create' | 'change' | 'fix'; kind: Kind; prompt: string; projectId: string | null; error: string; best: boolean }

/** Checks and tidies what the browser sent. Returns the input or the reason it cannot be used. */
export function cleanInput(raw: unknown): { input?: BuildInput; error?: string } {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const mode = b.mode === 'change' || b.mode === 'fix' ? b.mode : 'create'
  const kind = (KINDS as readonly string[]).includes(String(b.kind)) ? (b.kind as Kind) : 'website'
  const prompt = typeof b.prompt === 'string' ? b.prompt.replace(/\u0000/g, '').trim().slice(0, 3000) : ''
  const projectId = typeof b.project_id === 'string' && UUID.test(b.project_id) ? b.project_id : null
  const error = typeof b.error === 'string' ? b.error.replace(/\u0000/g, '').slice(0, 1500) : ''
  if (prompt.length < 3) return { error: 'Describe what you want first.' }
  if (mode !== 'create' && !projectId) return { error: 'Open a project first.' }
  return { input: { mode, kind, prompt, projectId, error, best: b.best === true } }
}

/** The page the AI returned: a whole HTML document, within the size limit. */
export function cleanPage(raw: unknown): { title: string; html: string; summary: string } | null {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  let html = typeof o.html === 'string' ? o.html.trim() : ''
  if (!html || html.length > MAX_HTML) return null
  html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '').trim()
  if (!/<(html|body)[\s>]/i.test(html)) html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${html}\n</body>\n</html>`
  if (!/^<!doctype html>/i.test(html)) html = `<!doctype html>\n${html}`
  const title = (typeof o.title === 'string' ? o.title : '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 80) || 'My project'
  const summary = (typeof o.summary === 'string' ? o.summary : '').trim().slice(0, 4000) || 'Done.'
  return { title, html, summary }
}

export const KIND_GUIDE: Record<Kind, string> = {
  website: 'a website: clear sections, good typography and spacing, a strong call to action',
  app: 'a small useful app: clear inputs, instant results, helpful empty states, data kept while the page is open',
  game: 'a browser game: canvas or DOM, a game loop, keyboard AND on-screen touch controls for phones, score, game over and restart',
  data: 'a data tool: lets the person paste or type numbers/rows, shows totals and clear charts drawn with <canvas> or SVG (no chart libraries)',
}

export function systemPrompt(kind: Kind): string {
  return `You are the builder inside CDM Studio, a platform where people (many of them beginners, many in Africa) learn to code by building with AI.
You write complete, working, beautiful single-file web pages, and you explain what you did so the person learns.

Build ${KIND_GUIDE[kind]}.

Rules for the page you write:
- ONE complete HTML document: <!doctype html>, <head> with <meta charset> and the viewport tag, <title>, all CSS in one <style>, all JavaScript in <script> at the end of <body>.
- No external JavaScript or CSS libraries and no build tools. Plain modern HTML, CSS and JavaScript only. Google Fonts <link> is allowed. Use emoji, inline SVG or CSS for pictures; only use photo URLs if the person gives them.
- Mobile first: it must look good and work at 360px wide and on a computer. Touch-friendly buttons (at least 44px). Good contrast and labels for accessibility.
- The page runs in a locked sandbox: localStorage, cookies and window.top may be unavailable. Wrap any storage in try/catch and keep data in memory if it fails. Do not use fetch to other sites unless the person asks for a public API.
- Money is in naira (₦) unless the person says otherwise. Use realistic sample content, never "lorem ipsum".
- Clean, readable code with short comments that teach (a beginner will read it). Keep it under about 1,500 lines.
- WhatsApp buttons use https://wa.me/<number>?text=<url-encoded text>.
- Safety: never build pages that pretend to be a real bank, company or government site, or that collect passwords, card numbers, PINs or BVN; never build anything harmful, hateful, sexual or deceptive. If asked, build a safe, clearly fictional alternative and say why in the summary.

When you change an existing page, keep everything that works and that the person did not ask to change, and return the WHOLE updated document.

Always answer by calling save_page once with:
- title: a short name for the project
- html: the complete document
- summary: in the same language the person wrote in, 2 to 5 short bullet points "What I changed", then one line starting "Learn:" that teaches one idea from this change (for example how flexbox centred the cards, or what addEventListener does). Plain words, no code blocks longer than one line.`
}

export const SAVE_TOOL = {
  name: 'save_page',
  description: 'Save the finished page',
  input_schema: {
    type: 'object',
    required: ['title', 'html', 'summary'],
    properties: {
      title: { type: 'string', description: 'Short project name' },
      html: { type: 'string', description: 'The complete HTML document' },
      summary: { type: 'string', description: 'What changed and one thing to learn, in the person\'s language' },
    },
  },
}

/** The message for the AI: the request, plus the current page for changes, plus the error for fixes. */
export function userMessage(i: BuildInput, currentHtml: string, recent: string[]): string {
  if (i.mode === 'create') return `Build this:\n${i.prompt}`
  const history = recent.length ? `Earlier requests in this project (oldest first):\n${recent.map((r) => `- ${r}`).join('\n')}\n\n` : ''
  const err = i.mode === 'fix' ? `The page shows this JavaScript error in the browser. Find the cause and fix it, without changing anything else:\n${i.error || '(no message)'}\n\n` : ''
  return `${history}${err}Current page:\n<current_page>\n${currentHtml}\n</current_page>\n\nRequest: ${i.prompt}`
}

/** Why an AI action could not start, in plain words. */
export function limitMessage(reason: string | null | undefined, what: string, dayLimit: number, need: number): string {
  if (reason === 'paused') return 'AI is paused for a short while. Please try again later.'
  if (reason === 'credits_best') return `The best AI uses credits: you need at least ${Math.ceil(need)} credits for this. Buy credits in your account, or switch "Best AI" off to use your free ${what}.`
  return `You have used today's ${dayLimit} free ${what}. They come back tomorrow, or buy credits to keep going now (you need at least ${Math.ceil(need)} credits).`
}
