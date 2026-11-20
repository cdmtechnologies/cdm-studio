// The prompt bank: ready prompts with blanks to fill in. {Blank|example} becomes a box with that example.
import type { Kind } from './builder'

export type PromptTemplate = { id: string; title: string; text: string; build?: Kind }
export type PromptGroup = { id: string; title: string; emoji: string; blurb: string; items: PromptTemplate[] }

export const PROMPT_BANK: PromptGroup[] = [
  {
    id: 'websites', title: 'Websites', emoji: '🌐', blurb: 'Business pages, portfolios, events',
    items: [
      { id: 'w-business', build: 'website', title: 'Small business website', text: 'Build a one-page website for {Business name|Mama Nkechi\'s Kitchen}, a {Type of business|restaurant} in {City|Abuja}. Sections: a header with the name and a short promise, {Main things you sell|our menu with prices in naira}, opening hours, customer reviews, a map link and a big WhatsApp button to {WhatsApp number|08012345678}. Colours: {Colours|warm orange and cream}. Friendly, modern, works perfectly on phones.' },
      { id: 'w-portfolio', build: 'website', title: 'Personal portfolio / CV', text: 'Build a personal portfolio for {Your name|Ada Okoro}, a {Your job|young accountant}. Sections: about me, skills as tags, {Number|3} projects with short write-ups, work history as a timeline, and a contact form that opens an email to {Email|ada@example.com}. Clean and professional, {Colours|navy and white}.' },
      { id: 'w-event', build: 'website', title: 'Event or wedding page', text: 'Build a page for {Event|Tobi and Amaka\'s wedding} on {Date|12 December 2026} at {Venue|Transcorp Hilton, Abuja}. Include a live countdown, the programme, a dress code section, a gallery of placeholder photos, directions link and an RSVP form that shows a thank-you message. Elegant, {Colours|gold and white}.' },
      { id: 'w-church', build: 'website', title: 'Church, school or NGO site', text: 'Build a website for {Organisation|Grace Community Church} in {City|Lagos}. Sections: welcome message, service or class times, upcoming events, our team, ways to give or support (bank details placeholder), and contact. Warm and welcoming, easy to read for older people.' },
    ],
  },
  {
    id: 'apps', title: 'Apps and tools', emoji: '📱', blurb: 'Calculators, trackers, planners',
    items: [
      { id: 'a-pos', build: 'app', title: 'Shop sales tracker', text: 'Build a simple sales tracker for a {Type of shop|provision store}. I add products with price and stock, record sales with quantity, and it shows today\'s total, best sellers, and products running low (below {Low stock level|5}). Keep everything in the page while it is open, with an export to CSV button.' },
      { id: 'a-budget', build: 'app', title: 'Budget planner', text: 'Build a monthly budget planner. I enter my income ({Monthly income|₦250,000}) and expenses by category (rent, food, transport, data, savings...). Show what is left, a pie chart of spending, and a warning when a category goes over its limit.' },
      { id: 'a-study', build: 'app', title: 'Study timetable maker', text: 'Build a study planner for {Exam|ICAN Skills level} on {Exam date|20 May 2027}. I enter my subjects and how many hours a day I can study ({Hours a day|3}); it makes a day-by-day timetable to the exam with revision weeks at the end, and I can tick off sessions.' },
      { id: 'a-quiz', build: 'app', title: 'Quiz for a class', text: 'Build a quiz app about {Topic|basic accounting} for {Who|SS2 students}: {Number of questions|10} multiple-choice questions, a timer per question, instant feedback with the right answer explained, and a final score with a "try again" button.' },
    ],
  },
  {
    id: 'games', title: 'Games', emoji: '🎮', blurb: 'Arcade, puzzle and word games',
    items: [
      { id: 'g-dodge', build: 'game', title: 'Arcade dodge game', text: 'Build an arcade game where {Hero|a danfo bus} dodges {Obstacles|potholes and okadas} on a road. Arrow keys and on-screen buttons to move, speed increases over time, coins to collect, a score, best score kept while open, and a game-over screen with restart. Bright, fun colours.' },
      { id: 'g-word', build: 'game', title: 'Word guessing game', text: 'Build a word guessing game like Wordle with {Language|English} words about {Theme|Nigerian food}. 6 tries, coloured hints, an on-screen keyboard for phones, and a share-your-result button.' },
      { id: 'g-memory', build: 'game', title: 'Memory card game', text: 'Build a memory card matching game with {Number of pairs|8} pairs of {Pictures|African animals} emoji, a move counter, a timer, and a celebration when all pairs are found.' },
      { id: 'g-trivia', build: 'game', title: 'Trivia show', text: 'Build a trivia game show about {Topic|African capitals and history} with 3 rounds of rising difficulty, a 15-second timer, lifelines (50:50 and skip), and a final leaderboard for {Players|2} players taking turns on one phone.' },
    ],
  },
  {
    id: 'data', title: 'Data analysis', emoji: '📊', blurb: 'Questions to ask your spreadsheet',
    items: [
      { id: 'd-sales', title: 'Sales overview', text: 'Using my sales data, show total {Measure|amount} by {Group|branch}, the {Number|5} best-selling items, and how sales moved {Period|week by week}. Point out anything unusual.' },
      { id: 'd-compare', title: 'Compare two periods', text: 'Compare {First period|September} with {Second period|October}: total {Measure|amount}, change in %, and which {Group|items} grew or fell the most.' },
      { id: 'd-customers', title: 'Customers', text: 'Who are my top {Number|10} customers by {Measure|amount}, how often do they buy, and how much of total sales do they make up?' },
      { id: 'd-dashboard', build: 'data', title: 'Dashboard from pasted numbers', text: 'Build a dashboard where I paste rows like "{Example row|Bread, 4, 1200}" ({Columns|item, quantity, price}). Show total sales, number of items, best seller, a bar chart by item and a table I can sort.' },
    ],
  },
  {
    id: 'business', title: 'Business and marketing', emoji: '💼', blurb: 'Plans, messages and offers',
    items: [
      { id: 'b-plan', title: 'One-page business plan', text: 'I want to start {Business|a bakery} in {City|Kano} with {Money|₦2,000,000}. Write a one-page plan: what I sell and to whom, startup costs in a table, monthly costs, prices, how I get my first {Number|50} customers, and the 3 biggest risks. Simple English.' },
      { id: 'b-whatsapp', title: 'WhatsApp broadcast', text: 'Write {Number|3} short WhatsApp broadcast messages for {Business|my pharmacy} announcing {News|our new opening hours, 7am to 10pm}. Friendly, under 60 words each, one with a little Pidgin.' },
      { id: 'b-price', title: 'Pricing my product', text: 'Help me price {Product|a 50cl zobo drink}. My costs per unit: {Costs|₦250}. Competitors sell at {Competitor price|₦500}. Suggest 3 price options with profit per unit and how many I must sell a month to make {Target|₦300,000}.' },
      { id: 'b-email', title: 'Professional email', text: 'Write a polite, professional email to {Who|a client who has not paid an invoice} about {Topic|invoice INV-104 of ₦450,000, now 30 days late}. Firm but friendly, under 120 words, with a clear next step.' },
    ],
  },
  {
    id: 'study', title: 'Study and careers', emoji: '🎓', blurb: 'Learn faster, get hired',
    items: [
      { id: 's-explain', title: 'Explain a hard topic', text: 'Explain {Topic|deferred tax} to me like I am {Level|a first-year accounting student}. Use a simple Nigerian example with numbers, then give me 3 practice questions with answers hidden at the end.' },
      { id: 's-interview', title: 'Interview practice', text: 'Act as an interviewer for a {Job|graduate trainee accountant} role at {Company type|a bank}. Ask me {Number|5} questions one at a time, wait for my answer, then score it out of 10 and show a better answer.' },
      { id: 's-cv', title: 'Improve my CV', text: 'Improve this CV section for a {Job|data analyst} role. Make each point start with an action word and show results with numbers. Here it is: {Paste your CV section|...}' },
      { id: 's-plan', title: 'Learning plan', text: 'Make me a {Weeks|6}-week plan to learn {Skill|Excel for data analysis} from zero, {Hours|5} hours a week, with free resources and a small project each week.' },
    ],
  },
  {
    id: 'content', title: 'Content and social media', emoji: '✍️', blurb: 'Posts, captions and scripts',
    items: [
      { id: 'c-week', title: 'A week of posts', text: 'Plan {Number|7} social media posts for {Business|my fashion boutique in Lagos} for {Platform|Instagram}. For each: the idea, the caption (under 40 words, max 3 emojis), and 5 hashtags. Mix tips, products and customer stories.' },
      { id: 'c-video', title: 'Short video script', text: 'Write a {Seconds|30}-second video script for {Platform|TikTok} about {Topic|why small shops should keep sales records}. Hook in the first 3 seconds, 3 quick points, and a call to action. Show what is on screen and what is said.' },
      { id: 'c-blog', title: 'Blog article', text: 'Write a {Words|600}-word blog article titled "{Title|5 ways to save money on data in Nigeria}" for {Readers|students}. Short paragraphs, sub-headings, practical tips, and a short conclusion.' },
    ],
  },
  {
    id: 'code', title: 'Coding help', emoji: '🧑‍💻', blurb: 'Fix, explain and improve code',
    items: [
      { id: 'x-fix', title: 'Fix my error', text: 'My {Language|JavaScript} code shows this error: {Error message|Uncaught TypeError: Cannot read properties of null}. Explain what it means in simple words, find the cause in my code below, and show the fixed lines.\n{Your code|...}' },
      { id: 'x-explain', title: 'Explain code line by line', text: 'Explain this {Language|HTML and CSS} code line by line for a beginner, then suggest 2 small changes I can try to learn more.\n{Your code|...}' },
      { id: 'x-feature', build: 'website', title: 'Add a feature to my project', text: 'Add {Feature|a dark mode switch that remembers my choice} to my page. Keep everything else the same and explain what you changed.' },
    ],
  },
]

export type Blank = { key: string; label: string; example: string }
const RE = /\{([^|{}]+)\|([^{}]*)\}/g

export function blanksOf(text: string): Blank[] {
  const out: Blank[] = []
  for (const m of text.matchAll(RE)) if (!out.some((b) => b.label === m[1])) out.push({ key: m[1], label: m[1], example: m[2] })
  return out
}

/** The prompt with the person's answers (or the examples where a box is empty). */
export function fill(text: string, values: Record<string, string>): string {
  return text.replace(RE, (_m, label: string, example: string) => (values[label]?.trim() ? values[label].trim() : example))
}

export const PENDING_BUILD = 'cdm-studio-pending-build'
