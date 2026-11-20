import { useEffect, useState } from 'react'
import { TRACKS, LESSON_COUNT } from '../lessons'
import { href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Icon } from '../components/ui'

type Prices = { free_builds_daily: number; premium_builds_daily: number; free_tutor_daily: number; premium_tutor_daily: number; price_monthly_ngn: number; price_yearly_ngn: number; price_monthly_usd: number; price_yearly_usd: number }

export const COLOURS: Record<string, string> = {
  violet: 'from-violet-500 to-fuchsia-500', sky: 'from-sky-500 to-cyan-500', emerald: 'from-emerald-500 to-teal-500', amber: 'from-amber-500 to-orange-500', rose: 'from-rose-500 to-pink-500',
}

export default function Landing() {
  const [p, setP] = useState<Prices | null>(null)
  useEffect(() => {
    supabase.from('settings').select('free_builds_daily, premium_builds_daily, free_tutor_daily, premium_tutor_daily, price_monthly_ngn, price_yearly_ngn, price_monthly_usd, price_yearly_usd').maybeSingle().then(({ data }) => setP(data as Prices | null))
  }, [])

  return (
    <div className="space-y-16 pb-8">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-200">Free to start · works on your phone</p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Learn AI. <span className="text-violet-300">Build anything.</span></h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Short hands-on lessons in AI, websites, apps, games and data. Then describe what you want and watch AI build it, with every change explained so you learn as you go.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={href('learn')} className="btn btn-primary px-5 py-3 text-base"><Icon.book /> Start learning</a>
              <a href={href('build')} className="btn bg-white px-5 py-3 text-base text-slate-900 hover:bg-violet-50"><Icon.sparkle /> Build with AI</a>
            </div>
            <p className="mt-4 text-sm text-slate-400">{LESSON_COUNT} lessons ready · no installs · your work saved online</p>
          </div>
          <Demo />
        </div>
      </section>

      {/* why */}
      <section>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Built to teach you, not just to build for you</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Every change explained', 'After each AI change you get a short "what changed and why", so you understand your own project.'],
            ['Fix errors in one tap', 'If your page breaks, Studio sees the error and the AI fixes it for you, then tells you what was wrong.'],
            ['See and edit the code', 'Switch to Code any time, change it yourself, and ask "explain this" on anything you do not understand.'],
            ['Lessons that check your work', 'Each lesson runs your code and ticks off each step, with hints and an AI tutor that guides instead of giving answers.'],
            ['Publish and remix', 'One tap gives you a link to share on WhatsApp. Others can remix your project to make their own.'],
            ['Your language', 'The tutor answers in the language you write in: English, Pidgin, Hausa, Yoruba, Igbo, French and more.'],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Icon.check /></div>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tracks */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">What you can learn</h2>
          <a href={href('learn')} className="text-sm font-semibold text-violet-700 hover:underline">All lessons</a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRACKS.map((t) => (
            <a key={t.id} href={href(`learn/${t.lessons[0].id}`)} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-20 items-center justify-center bg-gradient-to-br text-4xl ${COLOURS[t.colour]}`}>{t.emoji}</div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-violet-700">{t.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{t.lessons.length} lessons</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section id="pricing">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Simple pricing</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-lg font-bold">Free</h3>
            <p className="mt-1 text-3xl font-bold">₦0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✓ Every lesson, with checks and hints</li>
              <li>✓ {p?.free_tutor_daily ?? 20} AI tutor questions a day</li>
              <li>✓ {p?.free_builds_daily ?? 8} AI builds a day</li>
              <li>✓ Publish and share your projects</li>
            </ul>
            <a href={href('learn')} className="btn btn-ghost mt-6 w-full">Start free</a>
          </div>
          <div className="card relative border-violet-300 p-6 ring-2 ring-violet-200">
            <span className="absolute right-4 top-4 rounded-full bg-violet-700 px-2.5 py-0.5 text-xs font-bold text-white">Best for builders</span>
            <h3 className="text-lg font-bold">Premium</h3>
            <p className="mt-1 text-3xl font-bold">₦{(p?.price_monthly_ngn ?? 3000).toLocaleString()}<span className="text-base font-medium text-slate-500"> / month</span></p>
            <p className="text-sm text-slate-500">or ₦{(p?.price_yearly_ngn ?? 30000).toLocaleString()} a year · ${p?.price_monthly_usd ?? 5} / month outside Nigeria</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✓ {p?.premium_builds_daily ?? 80} AI builds a day, with our strongest AI model</li>
              <li>✓ {p?.premium_tutor_daily ?? 200} tutor questions a day</li>
              <li>✓ Download your projects as files</li>
              <li>✓ No automatic renewals: pay only when you want</li>
            </ul>
            <a href={href('account')} className="btn btn-primary mt-6 w-full">Get Premium</a>
          </div>
        </div>
      </section>

      {/* faq */}
      <section>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Questions</h2>
        <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {[
            ['Do I need to know coding?', 'No. Start with "AI for everyone" or "Build websites": every lesson starts from zero. In Build you only need to describe what you want.'],
            ['Can I use it on my phone?', 'Yes. Lessons and the builder work in any modern phone browser. A laptop is more comfortable for longer code.'],
            ['Who owns what I build?', 'You do. Download it or publish it. Published projects can be remixed by others, so only publish what you are happy to share.'],
            ['Is it safe?', 'Projects run in a locked sandbox that cannot reach your account. Never put passwords or private data into a project or the chat.'],
            ['How do I pay?', 'Card or bank transfer through Paystack, in naira or US dollars. Premium does not renew by itself.'],
          ].map(([q, a]) => (
            <details key={q} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">{q}<span className="float-right text-slate-400 group-open:rotate-90">›</span></summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

/** A small looping picture of the builder: a prompt types itself, then a page appears. */
function Demo() {
  const prompt = 'A menu page for Mama Nkechi’s Kitchen with a WhatsApp order button'
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v > prompt.length + 40 ? 0 : v + 1)), 60)
    return () => clearInterval(id)
  }, [])
  const done = n > prompt.length + 6
  return (
    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10" aria-hidden="true">
      <div className="rounded-xl bg-white/10 px-3 py-2 font-mono text-sm text-violet-100">{prompt.slice(0, n)}<span className="animate-pulse">▍</span></div>
      <div className={`mt-3 overflow-hidden rounded-xl bg-orange-50 p-4 text-slate-900 transition-all duration-700 ${done ? 'opacity-100' : 'opacity-25'}`}>
        <p className="text-lg font-bold text-orange-700">Mama Nkechi’s Kitchen</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {[['Jollof rice', '₦3,500'], ['Egusi soup', '₦4,000'], ['Suya', '₦2,500'], ['Fried plantain', '₦1,500']].map(([a, b]) => (
            <div key={a} className="rounded-lg bg-white p-2 shadow-sm"><p className="font-semibold">{a}</p><p className="text-orange-700">{b}</p></div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-bold text-white">Order on WhatsApp</p>
      </div>
      <p className={`mt-2 text-xs text-violet-200 transition-opacity ${done ? 'opacity-100' : 'opacity-0'}`}>✓ Made a 4-item menu grid and a WhatsApp button that opens a chat with the order.</p>
    </div>
  )
}
