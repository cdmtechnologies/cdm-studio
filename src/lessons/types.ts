// Lessons are plain data. A code lesson runs the learner's page in a sandbox and checks it with small tests that run
// inside the sandbox (each `test` is the body of a function that returns true when the step is done).

export type Check = { label: string; test: string }
export type Quiz = { q: string; options: string[]; answer: number; why: string }

export type Lesson = {
  id: string
  title: string
  minutes: number
  /** what the learner reads first (Markdown) */
  body: string
  /** 'code': edit the starter and pass the checks; 'prompt': practise with the AI tutor; 'read': read and answer the quiz */
  kind: 'code' | 'prompt' | 'read'
  task?: string
  /** code lessons: the language of the starter (default html). Python and SQL run in the browser with WebAssembly. */
  lang?: 'html' | 'python' | 'sql'
  /** SQL lessons: statements that create and fill the practice tables before the learner's query runs */
  setup?: string
  starter?: string
  checks?: Check[]
  /** shown on request; never needed to pass */
  hint?: string
  quiz?: Quiz[]
  /** for 'prompt' lessons: what the learner is asked to try with the AI */
  practice?: string
  /** an advanced lesson: its content is loaded from the server after it is unlocked with credits */
  paid?: boolean
  /** what a locked lesson teaches */
  outline?: string
}

export type Track = {
  id: string
  title: string
  blurb: string
  colour: string
  emoji: string
  lessons: Lesson[]
  soon?: string
  /** certified course details (courses/*.ts) */
  course?: { level: string; hours: number; free: number; skills: string[]; careers: string[]; examQuestions: number; project?: { title: string; brief: string; lang: string; rubric: string[]; pass_pct: number } }
}
