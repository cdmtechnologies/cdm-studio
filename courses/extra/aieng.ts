import type { Quiz } from '../../src/lessons/types'
import type { CourseLesson, CourseProject } from '../types'

// Advanced lessons added to AI engineering (they go before the final career lesson).
export const aiengMore: CourseLesson[] = [
  {
    id: 'aieng-tools',
    title: 'Tool use: letting AI call your functions',
    minutes: 35,
    kind: 'code',
    outline: 'How function calling works, describing tools with JSON Schema, validating the model\'s arguments and running the tool safely.',
    body: `## The model cannot press buttons, but it can ask you to

A language model on its own only produces text. It cannot check today's exchange rate, look up an order or send an SMS. **Tool use** (also called *function calling*) fixes that: you describe some functions to the model, and when a question needs one, the model replies with a structured request: *"please call get_order with order_id = 1042"*. **Your code** runs the function and sends the result back, and the model writes the final answer.

Think of the model as a clever receptionist who cannot leave the desk. You give the receptionist a list of phone extensions (the tools) with a note on what each department does. When a visitor asks something, the receptionist decides whom to call and what to ask, but the department (your code) does the actual work.

## Describing a tool

Each tool has a name, a description, and an **input schema** written in JSON Schema:

\`\`\`json
{
  "name": "get_order",
  "description": "Look up one customer order by its number. Use when the user asks about an order's status or delivery.",
  "input_schema": {
    "type": "object",
    "properties": { "order_id": { "type": "integer", "description": "The order number, e.g. 1042" } },
    "required": ["order_id"]
  }
}
\`\`\`

The **description is a prompt**: say when to use the tool and when not to. Good descriptions are the difference between a model that picks the right tool and one that guesses.

## The loop

1. Send the user's message plus the tool list.
2. If the model replies with a tool call, **validate** the arguments, run the function, and send the result back.
3. Repeat until the model gives a normal text answer.

## Never trust the arguments blindly

The model's tool call is a *suggestion* produced from text, possibly text written by an attacker (a web page or email can contain instructions: this is **prompt injection**). Treat tool arguments like form input from a stranger:

- Check every required field exists and has the right type.
- Reject unknown tools and unknown fields.
- Enforce permissions in **your** code: the model asking to read order 1042 does not mean this user may see order 1042.
- For actions that spend money or send messages, ask the human to confirm.

## Your task

1. \`validate(args, schema)\`: check an arguments object against a simple schema (\`type: "object"\`, \`properties\` with \`type\` of \`string\`, \`integer\`, \`number\` or \`boolean\`, and \`required\`). Return a list of error messages (empty when valid). Report a missing required field as \`"order_id is required"\`, a wrong type as \`"order_id must be integer"\`, and an extra field as \`"unknown field x"\`.
2. \`runTool(call, tools)\`: \`call\` is \`{ name, input }\`; \`tools\` maps a name to \`{ schema, fn }\`. Return \`{ error: "unknown tool" }\` for an unknown name, \`{ error: <errors joined with "; "> }\` when invalid, otherwise \`{ result: fn(input) }\`.`,
    task: 'Write validate and runTool.',
    starter: `<script>
  function validate(args, schema) {
    return []
  }
  function runTool(call, tools) {
  }
</script>
`,
    checks: [
      { label: 'valid arguments give no errors', test: `const s = { type: 'object', properties: { order_id: { type: 'integer' }, note: { type: 'string' } }, required: ['order_id'] }; return validate({ order_id: 1042 }, s).length === 0 && validate({ order_id: 7, note: 'hi' }, s).length === 0` },
      { label: 'missing, wrong type and unknown fields reported', test: `const s = { type: 'object', properties: { order_id: { type: 'integer' } }, required: ['order_id'] }; const a = validate({}, s), b = validate({ order_id: '1042' }, s), c = validate({ order_id: 1.5 }, s), d = validate({ order_id: 1, x: 2 }, s); return a.includes('order_id is required') && b.includes('order_id must be integer') && c.includes('order_id must be integer') && d.includes('unknown field x')` },
      { label: 'number and boolean types', test: `const s = { type: 'object', properties: { amount: { type: 'number' }, urgent: { type: 'boolean' } }, required: [] }; return validate({ amount: 2.5, urgent: false }, s).length === 0 && validate({ urgent: 'yes' }, s).includes('urgent must be boolean')` },
      { label: 'runTool runs valid calls and refuses the rest', test: `const tools = { get_order: { schema: { type: 'object', properties: { order_id: { type: 'integer' } }, required: ['order_id'] }, fn: (i) => 'order ' + i.order_id + ' shipped' } }; return runTool({ name: 'get_order', input: { order_id: 5 } }, tools).result === 'order 5 shipped' && runTool({ name: 'delete_all', input: {} }, tools).error === 'unknown tool' && runTool({ name: 'get_order', input: {} }, tools).error === 'order_id is required'` },
    ],
    hint: "For types: integer → Number.isInteger(v); number → typeof v === 'number' && Number.isFinite(v); string and boolean → typeof v === type. Loop over required, then over Object.keys(args).",
    solution: `<script>
  function validate(args, schema) {
    const errors = []
    const props = schema.properties || {}
    for (const r of schema.required || []) if (!(r in args)) errors.push(r + ' is required')
    for (const [k, v] of Object.entries(args)) {
      const p = props[k]
      if (!p) { errors.push('unknown field ' + k); continue }
      const ok = p.type === 'integer' ? Number.isInteger(v)
        : p.type === 'number' ? typeof v === 'number' && Number.isFinite(v)
        : typeof v === p.type
      if (!ok) errors.push(k + ' must be ' + p.type)
    }
    return errors
  }
  function runTool(call, tools) {
    const t = tools[call.name]
    if (!t) return { error: 'unknown tool' }
    const errors = validate(call.input || {}, t.schema)
    if (errors.length) return { error: errors.join('; ') }
    return { result: t.fn(call.input) }
  }
</script>
`,
  },
  {
    id: 'aieng-embeddings',
    title: 'Embeddings and semantic search',
    minutes: 35,
    kind: 'code',
    outline: 'What embeddings are, cosine similarity, nearest-neighbour search and how vector databases power RAG.',
    body: `## Meaning as a location

Imagine a huge map where every sentence has a position. Sentences that mean similar things sit close together: *"How do I get my money back?"* lands right next to *"refund policy"*, even though they share no words. An **embedding** is that position: a list of numbers (often 256 to 3,000 of them) produced by an embedding model.

Keyword search (last lessons) only finds shared words. **Semantic search** with embeddings finds shared *meaning*, across synonyms and even across languages.

## Measuring closeness: cosine similarity

Each embedding is a vector, an arrow pointing in some direction. Two arrows pointing the same way mean similar things. **Cosine similarity** measures the angle between them:

- \`1\`: same direction (very similar)
- \`0\`: unrelated
- \`-1\`: opposite

The formula: \`cos(a, b) = (a · b) / (|a| × |b|)\`, where \`a · b\` is the dot product (multiply matching numbers and add them up) and \`|a|\` is the length (the square root of the sum of squares).

## Semantic search in four steps

1. **Embed every chunk** of your documents once, and store the vectors.
2. **Embed the question** when it arrives.
3. **Find the nearest chunks** by cosine similarity: the top k.
4. Put those chunks into a grounded prompt (the RAG lesson).

## Vector databases

With millions of chunks, comparing the question to every vector is slow. **Vector databases** and extensions such as **pgvector** for PostgreSQL (available in Supabase) build special indexes for fast approximate nearest-neighbour search. The idea is the same as your code in this lesson, just at scale.

## Practical tips

- Use the **same embedding model** for documents and questions; vectors from different models are like coordinates on different maps.
- **Hybrid search** (keywords plus embeddings) often beats either alone, especially for names, codes and numbers.
- Set a **minimum similarity**: if nothing is close enough, say "I don't know" instead of grounding on irrelevant text.
- Re-embed when documents change.

## Your task

The vectors here are tiny (3 numbers) so you can check them by hand; real ones work exactly the same way.

1. \`dot(a, b)\`, \`norm(a)\` and \`cosine(a, b)\` (return \`0\` if either vector has length 0).
2. \`search(queryVec, docs, k, minScore = 0)\`: \`docs\` is a list of \`{ text, vec }\`. Return the top \`k\` as \`{ text, score }\` (score rounded to 3 decimals), highest first, leaving out any below \`minScore\`.`,
    task: 'Write dot, norm, cosine and search.',
    starter: `<script>
  function dot(a, b) {
  }
  function norm(a) {
  }
  function cosine(a, b) {
  }
  function search(queryVec, docs, k, minScore = 0) {
  }
</script>
`,
    checks: [
      { label: 'dot and norm', test: `return dot([1, 2, 3], [4, 5, 6]) === 32 && norm([3, 4]) === 5` },
      { label: 'cosine of same, opposite and unrelated directions', test: `return Math.abs(cosine([1, 2], [2, 4]) - 1) < 1e-9 && Math.abs(cosine([1, 0], [-1, 0]) + 1) < 1e-9 && Math.abs(cosine([1, 0], [0, 1])) < 1e-9 && cosine([0, 0], [1, 1]) === 0` },
      { label: 'search ranks by meaning', test: `const docs = [{ text: 'refunds', vec: [0.9, 0.1, 0] }, { text: 'delivery', vec: [0, 1, 0.2] }, { text: 'returns', vec: [0.8, 0.3, 0.1] }]; const r = search([1, 0.2, 0], docs, 2); return r.length === 2 && r[0].text === 'refunds' && r[1].text === 'returns' && r[0].score === 0.996` },
      { label: 'minScore leaves out weak matches', test: `const docs = [{ text: 'a', vec: [1, 0] }, { text: 'b', vec: [0, 1] }]; const r = search([1, 0.1], docs, 5, 0.5); return r.length === 1 && r[0].text === 'a'` },
    ],
    hint: 'cosine: const n = norm(a) * norm(b); return n === 0 ? 0 : dot(a, b) / n. search: docs.map(d => ({ text: d.text, score: Math.round(cosine(queryVec, d.vec) * 1000) / 1000 })).filter(…).sort(…).slice(0, k)',
    solution: `<script>
  function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0) }
  function norm(a) { return Math.sqrt(dot(a, a)) }
  function cosine(a, b) { const n = norm(a) * norm(b); return n === 0 ? 0 : dot(a, b) / n }
  function search(queryVec, docs, k, minScore = 0) {
    return docs
      .map((d) => ({ text: d.text, score: Math.round(cosine(queryVec, d.vec) * 1000) / 1000 }))
      .filter((d) => d.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
  }
</script>
`,
  },
  {
    id: 'aieng-multimodal',
    title: 'Images, speech and multimodal AI',
    minutes: 25,
    kind: 'read',
    outline: 'Vision models, document reading, speech-to-text and text-to-speech, image generation, and their limits.',
    body: `## AI that sees and hears

Modern models are **multimodal**: besides text, they can take in images, documents, audio and sometimes video, and some can produce images or speech. This opens up work that used to need a person looking at every page.

## Vision: reading pictures and documents

Send an image with a question and the model can:

- **Read documents**: invoices, receipts, ID-free forms, handwritten notes, tables in PDFs. Combine with structured output (lesson 3) to turn a photo of a receipt into JSON: vendor, date, items, total.
- **Describe and classify**: is this a photo of a damaged parcel? Which product is on the shelf?
- **Understand charts and screenshots**: "what does this error message on my screen mean?"

Limits: small or blurry text, unusual handwriting and dense tables cause mistakes. Models can misread numbers, which matters a lot for money. **Always validate**: check totals add up, dates are real, and ask a human to review low-confidence results.

## Speech-to-text and text-to-speech

- **Speech-to-text** (transcription) turns recordings into text: meeting notes, call-centre quality checks, voice notes on WhatsApp, captions for videos. Accuracy varies with accents, background noise and languages; test with your real users' voices.
- **Text-to-speech** reads text aloud in natural voices: accessibility, phone menus, learning apps for people who read less comfortably.

Together they make **voice assistants**: speech in, model in the middle, speech out. Latency (the delay) is the main design challenge.

## Image generation

Image models create pictures from descriptions: marketing drafts, illustrations, product mock-ups, social media graphics. Be careful:

- Do not present generated images as real photos of products, customers or events.
- Avoid copying artists' styles or real brands and characters; respect copyright and trademarks.
- Do not generate images of real people without consent.

## Costs and privacy

Images and audio use many more tokens than text, so they cost more. Resize images to what is needed. Photos and recordings often contain **personal data** (faces, voices, addresses): get consent, store as little as possible, and follow data protection law.

## Designing multimodal features

1. Decide what must be **extracted** (fields, labels, a transcript).
2. Ask for **structured output** with a confidence or "unsure" option.
3. **Validate** in code.
4. Route doubtful cases to a **human**.
5. Measure accuracy on a test set of real examples before launch (the evaluations lesson).`,
    quiz: [
      { q: 'A model reads a photographed receipt into JSON. What should your code do next?', options: ['Trust it completely', 'Validate it, for example check the items add up to the total', 'Delete the photo and the JSON'], answer: 1, why: 'Models can misread numbers.' },
      { q: 'Generated images should…', options: ['Be presented as real product photos', 'Not be passed off as real photos, and respect copyright and consent', 'Always copy a famous artist'], answer: 1, why: 'Honesty and rights matter.' },
      { q: 'Why test speech-to-text with your real users?', options: ['Accuracy varies with accents, noise and language', 'It is always perfect', 'It only works in English'], answer: 0, why: 'Test with the voices you will actually get.' },
    ],
  },
  {
    id: 'aieng-app',
    title: 'Shipping an AI feature: memory, retries and limits',
    minutes: 35,
    kind: 'code',
    outline: 'Conversation memory within a token budget, retries with exponential backoff, timeouts, rate limits and fallbacks.',
    body: `## From demo to product

A demo works once on the developer's laptop. A product works thousands of times a day for people on slow networks, while the AI provider is busy, with users who paste whole novels into the chat box. This lesson covers the engineering that makes the difference.

## Conversation memory

Models do not remember previous messages. Every request must send the conversation so far. But conversations grow, and every message costs tokens. Like a notebook with limited pages, you must decide what to keep:

- Always keep the **system prompt** (the rules).
- Keep the **most recent** messages, because they matter most.
- Drop (or summarise) the oldest messages when the budget is exceeded.
- Never cut a message in half; drop whole turns.

## Retries and exponential backoff

Networks fail and providers return "overloaded" or "rate limited" errors (HTTP 429, 500, 503, 529). Retrying immediately makes things worse, like everyone redialling a busy line at once. Wait longer each time: 1 second, then 2, then 4, then 8 (**exponential backoff**), with a little randomness (**jitter**) so many clients do not retry at the same moment. Give up after a few attempts and show a friendly message.

Do **not** retry errors that will never succeed: a bad request (400) or a wrong key (401) needs fixing, not repeating.

## Timeouts

Set a timeout on every call. A request that hangs for two minutes is worse than a clear error after 30 seconds.

## Limits protect you

- **Per-user limits** (messages per day, as CDM Studio does) stop one person, or one bot, from spending your whole budget.
- **Input limits**: cap the size of what users paste.
- **Output limits**: set \`max_tokens\`.
- **Spending alerts** at the provider.

## Fallbacks

If the best model is unavailable, fall back to a smaller one, a cached answer, or a non-AI path ("we could not generate a summary; here is the full text"). The feature should degrade, not disappear.

## Your task

1. \`trimHistory(system, messages, budget, count)\`: \`count(text)\` returns a token count. Return the most recent messages (keeping their order) such that \`count(system)\` plus the counts of the kept messages is within \`budget\`. Drop whole messages from the oldest end. Messages are \`{ role, content }\`.
2. \`backoff(attempt, base = 1000, max = 30000)\`: the wait in milliseconds before retry number \`attempt\` (starting at 1): \`base × 2^(attempt − 1)\`, never more than \`max\`. (Jitter is left out so it can be checked.)
3. \`shouldRetry(status, attempt, maxAttempts = 4)\`: \`true\` only for statuses 429, 500, 502, 503 or 529, and only while \`attempt < maxAttempts\`.`,
    task: 'Write trimHistory, backoff and shouldRetry.',
    starter: `<script>
  // a rough token counter for this lesson: about 4 characters per token
  const count = (text) => Math.ceil(text.length / 4)

  function trimHistory(system, messages, budget, count) {
    return messages
  }
  function backoff(attempt, base = 1000, max = 30000) {
  }
  function shouldRetry(status, attempt, maxAttempts = 4) {
  }
</script>
`,
    checks: [
      { label: 'keeps everything when it fits', test: `const m = [{ role: 'user', content: 'aaaa' }, { role: 'assistant', content: 'bbbb' }]; return trimHistory('ssss', m, 3, count).length === 2` },
      { label: 'drops the oldest whole messages first', test: `const m = [{ role: 'user', content: 'a'.repeat(40) }, { role: 'assistant', content: 'b'.repeat(8) }, { role: 'user', content: 'c'.repeat(8) }]; const t = trimHistory('ssss', m, 6, count); return t.length === 2 && t[0].content[0] === 'b' && t[1].content[0] === 'c'` },
      { label: 'never exceeds the budget', test: `const m = [{ role: 'user', content: 'x'.repeat(400) }]; return trimHistory('s'.repeat(8), m, 50, count).length === 0` },
      { label: 'exponential backoff with a cap', test: `return backoff(1) === 1000 && backoff(2) === 2000 && backoff(4) === 8000 && backoff(10) === 30000 && backoff(3, 500) === 2000` },
      { label: 'retries only temporary errors, a few times', test: `return shouldRetry(429, 1) && shouldRetry(503, 3) && !shouldRetry(503, 4) && !shouldRetry(400, 1) && !shouldRetry(401, 1) && shouldRetry(529, 1)` },
    ],
    hint: 'trimHistory: start with used = count(system), walk the messages from the end backwards, and stop as soon as the next message would go over the budget; unshift the ones you keep.',
    solution: `<script>
  const count = (text) => Math.ceil(text.length / 4)

  function trimHistory(system, messages, budget, count) {
    let used = count(system)
    const kept = []
    for (let i = messages.length - 1; i >= 0; i--) {
      const c = count(messages[i].content)
      if (used + c > budget) break
      used += c
      kept.unshift(messages[i])
    }
    return kept
  }
  function backoff(attempt, base = 1000, max = 30000) {
    return Math.min(max, base * 2 ** (attempt - 1))
  }
  function shouldRetry(status, attempt, maxAttempts = 4) {
    return [429, 500, 502, 503, 529].includes(status) && attempt < maxAttempts
  }
</script>
`,
  },
]

export const aiengProject: CourseProject = {
  title: 'An AI tool for a real job',
  lang: 'html',
  brief: `Build an AI-powered tool in CDM Studio that saves someone real time at work: a customer-reply drafter for a shop, a lesson-plan helper for a teacher, a receipt-to-spreadsheet reader, a job-description writer for HR.

**It must:** use a reusable prompt template with clear instructions, ask the AI for **structured output** (JSON) and validate it in code, handle errors and empty or oversized input gracefully, control cost (input limits, short outputs), and include at least one **guardrail** (for example refusing off-topic requests, or flagging low-confidence results for a human).

Use the AI features available in Studio projects. Add a short "How it works" section on the page explaining the prompt design, the validation and the guardrail.`,
  rubric: [
    'Solves a specific, real work task for a named kind of user',
    'Uses a clear prompt template with role, task, rules and examples or format',
    'Requests structured output (JSON) and parses it safely',
    'Validates the AI result in code before showing or using it',
    'Handles errors, empty input and oversized input with friendly messages',
    'Controls cost, for example by limiting input size or output length',
    'Includes at least one guardrail such as off-topic refusal or human review of doubtful results',
    'Has a clean, usable interface with clear feedback while the AI is working',
    'Explains how it works: the prompt design, validation and guardrail',
  ],
}

export const aiengExam: Quiz[] = [
  { q: 'With tool use, who actually runs the function?', options: ['The model', 'Your code, after validating the arguments', 'The user', 'The AI provider\'s website'], answer: 1, why: 'The model only requests a call.' },
  { q: 'A tool description should mainly say…', options: ['The programmer\'s name', 'When to use the tool and what its inputs mean', 'Nothing; the name is enough', 'The price'], answer: 1, why: 'The description is a prompt.' },
  { q: 'Cosine similarity of 1 between two embeddings means…', options: ['They are unrelated', 'They point the same way: very similar meaning', 'They are opposites', 'One is empty'], answer: 1, why: '1 is the same direction.' },
  { q: 'Embeddings for documents and questions should come from…', options: ['Any two models', 'The same embedding model', 'A random generator', 'A spreadsheet'], answer: 1, why: 'Different models are like different maps.' },
  { q: 'An AI provider returns 429 (rate limited). The best response is…', options: ['Retry immediately in a loop', 'Retry with exponential backoff, a few times', 'Never retry', 'Delete the API key'], answer: 1, why: 'Back off so the service can recover.' },
  { q: 'When a conversation exceeds the token budget, you should first drop…', options: ['The system prompt', 'The oldest whole messages', 'The latest user message', 'Half of each message'], answer: 1, why: 'Keep rules and recent context.' },
]
