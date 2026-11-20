import type { Track } from './types'

export const ai: Track = {
  id: 'ai',
  title: 'AI for everyone',
  blurb: 'What AI is, how to ask it well, how to check its answers, and how to build with it.',
  colour: 'violet',
  emoji: '✨',
  lessons: [
    {
      id: 'ai-what-is-ai',
      title: 'What AI really is',
      minutes: 6,
      kind: 'read',
      body: `## A very good guesser of words

The AI chat tools you hear about (Claude, ChatGPT, Gemini) are **large language models**. They learned from a huge amount of text and became very good at one thing: predicting what text should come next.

That simple skill turns out to be powerful. To continue a question well, the model has to pick up grammar, facts, reasoning steps and even how code works.

## What it is good at

- Explaining things in simple words, in many languages
- Writing and rewriting: emails, posts, summaries, lesson notes
- Writing code, and explaining code line by line
- Brainstorming ideas and plans

## Where it goes wrong

- It can sound sure and still be **wrong** (people call this a *hallucination*)
- It may not know recent news unless it can search
- It does not *know you* unless you tell it what you need

> Think of AI as a fast, well-read assistant: brilliant at first drafts, but you are still the editor.`,
      quiz: [
        { q: 'What is a large language model mainly trained to do?', options: ['Search Google for you', 'Predict the next words of a text', 'Store every fact in the world exactly'], answer: 1, why: 'It learned patterns in text so it can continue it well. That is why it can also be confidently wrong.' },
        { q: 'An AI answer sounds very confident. What should you do?', options: ['Trust it: confident means correct', 'Check important facts in a reliable source', 'Ask the same question until it agrees with you'], answer: 1, why: 'Confidence is not proof. Check facts that matter, such as figures, laws, health or money.' },
      ],
    },
    {
      id: 'ai-prompts',
      title: 'Asking AI well (prompting)',
      minutes: 10,
      kind: 'prompt',
      body: `## The 4 parts of a good prompt

1. **Role or context**: who is asking, and why. *"I run a small pharmacy in Abuja."*
2. **Task**: exactly what you want. *"Write a WhatsApp message announcing our new opening hours."*
3. **Details and limits**: length, tone, language, what to include or avoid. *"Under 60 words, friendly, in English and Pidgin."*
4. **Format**: how you want the answer. *"Give me 3 versions as a numbered list."*

## Weak vs strong

- Weak: *"write about my shop"*
- Strong: *"I sell phone accessories in Lagos to students. Write 3 short Instagram captions for our back-to-school sale (20% off chargers). Fun tone, max 2 emojis each."*

## Keep the conversation going

If the answer is not right, do not start again. Say what to change: *"Shorter, and mention we deliver."*`,
      practice: 'Write a prompt with all 4 parts for something real in your life or work. Send it to the tutor: it will answer, then score your prompt and show how to make it stronger.',
      quiz: [
        { q: 'Which prompt will usually give the best answer?', options: ['"Write a business plan"', '"I want to open a small bakery in Kano with ₦2m. Write a one-page plan: costs, first 3 products, and how to get the first 50 customers. Use simple English and a table for costs."', '"Plan!!!"'], answer: 1, why: 'It gives context, a clear task, limits and a format.' },
      ],
    },
    {
      id: 'ai-check-answers',
      title: 'Checking AI answers',
      minutes: 7,
      kind: 'prompt',
      body: `## The 3-question check

Before you use an AI answer for anything important, ask:

1. **Can I verify it?** Look for the fact in an official or trusted source (a government site, the company's own page, a textbook).
2. **Does it add up?** Check numbers yourself. A calculator beats a guess.
3. **Is it current?** Prices, laws and people in office change. Ask the AI where the information comes from and how recent it is.

## Ask the AI to help you check

- *"How sure are you about this? What could be wrong?"*
- *"Give me the sources I should check this against."*
- *"Show your working step by step."*

## Never paste private things

Do not paste passwords, card numbers, PINs or other people's private data into any AI chat.`,
      practice: 'Ask the tutor a factual question you can check (for example "What is the capital of Australia?" or a calculation). Then ask it "How sure are you, and how can I check?"',
    },
    {
      id: 'ai-build-with-ai',
      title: 'Build a web page with AI',
      minutes: 10,
      kind: 'read',
      body: `## You describe it, AI writes the code

In **Build** you type what you want, for example:

> *A one-page site for "Mama Nkechi's Kitchen": menu with prices in naira, opening hours, a WhatsApp order button, warm orange colours.*

The AI writes the HTML, CSS and JavaScript, and you see it running straight away. Then you keep talking to it: *"make the menu two columns"*, *"add a photo gallery"*.

## Learn while you build

Every change comes with a short **what changed and why**, and you can open the **Code** tab to see and edit the code yourself. Tap **Explain** on any project to have the code explained line by line.

## Share it

Press **Publish** to get a link anyone can open, and others can **remix** it to make their own version.

Go to **Build** now and make your first page.`,
      quiz: [
        { q: 'The AI made your page but the button is the wrong colour. What is the fastest fix?', options: ['Start a new project', 'Tell it: "make the order button green"', 'Give up'], answer: 1, why: 'Keep the conversation going. The AI changes the current page.' },
      ],
    },
    {
      id: 'ai-at-work',
      title: 'AI at work: 10 everyday uses',
      minutes: 8,
      kind: 'prompt',
      body: `## Ten things AI can do for you today

1. Turn rough notes into a clear email
2. Summarise a long document into 5 bullet points
3. Explain a hard topic for a 12-year-old
4. Draft social media posts for a week
5. Make a study timetable from your exam date
6. Write Excel formulas (*"sum column C where column A is 'Lagos'"*)
7. Practise an interview: *"Ask me 5 questions for an accountant job, one at a time"*
8. Translate and adjust tone
9. Brainstorm business names or product ideas
10. Debug code: paste the error and ask what it means

## Your turn

Pick one that matters to you this week and try it with the tutor.`,
      practice: 'Pick one of the 10 uses and try it with the tutor, using what you learned about good prompts.',
    },
  ],
}
