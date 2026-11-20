// The AI builder: project types, starter ideas and small helpers.
import { callFunction } from './supabase'

export type Kind = 'website' | 'app' | 'game' | 'data'
export type Project = { id: string; title: string; kind: Kind; html: string; published: boolean; slug: string | null; views: number; updated_at: string; remix_of?: string | null }
export type Version = { id: number; html: string; prompt: string | null; summary: string | null; source: string; created_at: string }

export const KINDS: { id: Kind; label: string; emoji: string; hint: string }[] = [
  { id: 'website', label: 'Website', emoji: '🌐', hint: 'A business page, portfolio, event or landing page' },
  { id: 'app', label: 'App', emoji: '📱', hint: 'A tool: calculator, tracker, quiz, planner' },
  { id: 'game', label: 'Game', emoji: '🎮', hint: 'Arcade, puzzle, quiz or word game' },
  { id: 'data', label: 'Data', emoji: '📊', hint: 'Charts and dashboards from numbers you paste' },
]

export const IDEAS: Record<Kind, string[]> = {
  website: [
    'A one-page site for "Mama Nkechi\'s Kitchen" in Abuja: menu with prices in naira, opening hours, and a WhatsApp order button. Warm orange colours.',
    'A personal portfolio for a young accountant: about me, skills, 3 projects, and a contact form.',
    'A wedding invitation page with a countdown to the date, the venue on a map link, and an RSVP form.',
  ],
  app: [
    'A shop profit calculator: enter cost price, selling price and quantity; show profit and margin, and keep a list of items.',
    'A study planner: I enter my exam date and subjects, it makes a daily timetable I can tick off.',
    'A savings goal tracker with a progress bar, deposits list and how much to save each week.',
  ],
  game: [
    'A space dodge game: move left and right with arrow keys or on-screen buttons, avoid falling rocks, score goes up over time.',
    'A quiz game about African capitals: 10 questions, 4 choices, timer, and a score screen.',
    'A memory card matching game with 12 cards and a move counter.',
  ],
  data: [
    'A sales dashboard: I paste rows like "Bread, 4, 1200" and it shows total sales, best seller and a bar chart.',
    'A monthly budget chart: income and expenses by category with a pie chart and what is left.',
    'A class results analyser: paste names and scores; show average, highest, lowest and a grade chart.',
  ],
}

export const QUICK_CHANGES = ['Make it look more modern', 'Make it work well on phones', 'Add a dark mode switch', 'Use bigger, friendlier text', 'Add simple animations']

/** mode: paid from the free allowance or from credits; charged: credits taken; credits: balance after. */
export type Charge = { mode: 'free' | 'credits'; charged: number; credits: number; free_left: number }
export type BuildReply = Charge & { project: Project; summary: string; version_id: number }

export function build(body: { project_id?: string; kind?: Kind; prompt: string; mode?: 'create' | 'change' | 'fix'; error?: string; best?: boolean }) {
  return callFunction<BuildReply>('studio-build', body)
}
export function explain(project_id: string, question?: string) {
  return callFunction<{ reply: string }>('studio-tutor', { mode: 'explain', project_id, message: question || '' })
}

export const shareUrl = (slug: string) => `${location.origin}${location.pathname}#/p/${slug}`
export const kindOf = (k: string) => KINDS.find((x) => x.id === k) ?? KINDS[0]

export function download(name: string, html: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  a.download = `${name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'project'}.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
