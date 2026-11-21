import type { Course } from './types'

export const uiux: Course = {
  id: 'uiux',
  title: 'UI/UX design',
  blurb: 'Design apps and websites people love to use: research, layout, typography, colour, accessibility, responsive design and design systems, built for real in HTML and CSS.',
  emoji: '🎨',
  colour: 'violet',
  level: 'Beginner',
  hours: 13,
  free: 2,
  skills: ['Design thinking and user research', 'Information architecture and user flows', 'Layout, spacing and visual hierarchy', 'Typography and colour (WCAG contrast)', 'Forms and interactive states', 'Responsive, mobile-first design', 'Accessibility', 'Design systems and tokens', 'Usability testing and case studies'],
  careers: ['UI designer', 'UX designer', 'Product designer', 'UX researcher', 'Front-end developer with design skills'],
  lessons: [
    {
      id: 'uiux-intro',
      title: 'What UI and UX really mean',
      minutes: 20,
      kind: 'read',
      outline: 'UX versus UI, why design matters to business, and the design thinking process.',
      body: `## The door test

Have you ever pushed a door that needed to be pulled? The door had a handle shaped for pulling, but a sign said "push". You felt silly, but the mistake was the designer's, not yours. Good design makes the right action obvious. That is the heart of this course.

## UX and UI

- **UX (user experience)** is how it feels to use something from start to finish: can people find what they need, understand it, and finish their task without frustration? UX is the *journey*.
- **UI (user interface)** is what people see and touch: buttons, colours, text, icons, spacing. UI is the *vehicle*.

A beautiful app that confuses people has good UI and bad UX. A plain app that is quick and obvious has good UX, and good UI would make it even better. Product designers do both.

## Why businesses pay for design

- Every confusing step loses customers. If checkout takes 9 taps instead of 4, some people simply give up.
- Clear design reduces support calls and mistakes (wrong transfers, wrong orders).
- Accessible design reaches more people, including about 1 in 6 people worldwide who live with a disability, and it is a legal requirement in many places.
- Trust: people judge whether a bank or shop is safe within seconds of seeing its screen.

## Design thinking

A process used by design teams worldwide. It is a loop, not a straight line:

1. **Empathise**: learn about the people and their real situation.
2. **Define**: write down the actual problem to solve.
3. **Ideate**: generate many possible solutions before choosing.
4. **Prototype**: make a cheap version quickly (paper sketches, then clickable screens).
5. **Test**: watch real people use it, learn, and go round the loop again.

The big idea: **you are not your user.** What seems obvious to you, who built it, may be confusing to a market trader using a cheap Android phone with a cracked screen in bright sunlight.

## What you will build

This course mixes thinking lessons with hands-on lessons where you design in real HTML and CSS, so your designs work in a browser, not just in a picture. Tools like **Figma** are used for drawing and prototyping in most companies; the principles you learn here apply in any tool.`,
      quiz: [
        { q: 'UX is mainly about…', options: ['The colours only', 'How it feels to use something from start to finish', 'The company logo'], answer: 1, why: 'UX is the whole experience; UI is what you see and touch.' },
        { q: 'A person pushes a door that needs pulling. Whose mistake is it?', options: ['The person', 'The designer', 'Nobody'], answer: 1, why: 'Good design makes the right action obvious.' },
        { q: '"You are not your user" means…', options: ['Users are always wrong', 'Your own sense of what is obvious may not match your users', 'Never use your own product'], answer: 1, why: 'Learn from the real people you design for.' },
      ],
    },
    {
      id: 'uiux-research',
      title: 'Understanding users',
      minutes: 25,
      kind: 'prompt',
      outline: 'User interviews, observation, journey maps, problem statements and "How might we" questions.',
      body: `## Design starts with listening

A tailor measures before cutting the cloth. A designer studies people before drawing screens. **User research** is that measuring tape.

## Interviews

Talk to 5 to 8 people who match your users. Good interviews:

- Ask about **past behaviour**, not opinions about the future. "Tell me about the last time you paid a school fee" beats "Would you use an app for school fees?" (People say yes to be polite.)
- Ask **open questions**: what, how, tell me about. Avoid yes / no questions.
- Ask **"why?"** gently, several times, to reach the real reason.
- Listen more than you talk. Silence makes people add the most useful details.
- Never sell or defend your idea during research.

## Observation

Watch people do the task where they normally do it: at the shop counter, in a bus, at the office. You will see workarounds (a notebook beside the till, a WhatsApp screenshot of an account number) that people would never mention in an interview, because to them it is normal.

## Journey maps

A **journey map** draws the steps a person takes to reach a goal, with what they do, think and feel at each step. Imagine a parent paying school fees: get the fee notice → find the account number → go to the bank or transfer → screenshot the receipt → send it to the school → wait for confirmation → chase the bursar when nobody replies. The low points on the map (waiting, chasing, uncertainty) are your design opportunities.

## Problem statements

Turn research into a clear problem:

> **[User]** needs a way to **[need]** because **[insight]**.
> *Busy parents need a way to know instantly that the school received their payment, because chasing the bursar wastes hours and causes worry.*

Notice: it does not mention an app or a solution. It describes the need.

## How might we…?

Rephrase the problem as optimistic questions that invite many ideas: *How might we confirm payments instantly? How might we remove the need to send receipts at all?* Each question opens a different set of solutions.

## Practise

Use the tutor to rehearse an interview and write a problem statement.`,
      practice: 'Choose a real everyday task (paying school fees, booking a clinic visit, buying data, ordering food). Ask the tutor to play a realistic user, and interview them using open questions about the last time they did it. Afterwards, ask the tutor to help you draw a short journey map with the low points, write one problem statement using the template, and suggest three "How might we" questions.',
    },
    {
      id: 'uiux-structure',
      title: 'Information architecture and user flows',
      minutes: 25,
      kind: 'read',
      outline: 'Organising content, navigation patterns, user flows, wireframes and why to sketch before you style.',
      body: `## A supermarket you can find your way around

In a good supermarket, you can find the rice without asking anyone: signs above the aisles, related things together, the most-bought items easy to reach. **Information architecture (IA)** is doing that for an app or website: organising and labelling content so people can find things.

## Organise by how users think

Group content the way your users think about it, not the way your company is organised. Customers do not care which department handles "returns"; they look for "Returns" near "My orders".

**Card sorting** reveals how users think: write each feature or topic on a card, ask people to group them and name the groups. Their labels are often better than yours.

## Navigation patterns

- **Bottom tab bar** (mobile): 3 to 5 main sections, always reachable by thumb. Used by most popular apps.
- **Top navigation** (web): a few main links, with the logo going home.
- **Hamburger menu**: hides links behind an icon. It saves space but people use hidden things less, so keep the most important actions visible.
- **Search**: essential when there is a lot of content.
- **Breadcrumbs**: Home › Phones › Power banks, showing where you are.

Keep labels short and plain: "Orders", not "Transaction history management".

## User flows

A **user flow** maps the screens and decisions for one task: *Open app → Choose product → Basket → Sign in? (yes / no) → Address → Pay → Confirmation*. Drawing it shows:

- Steps you can remove (do we really need sign-in before paying?).
- Dead ends (what happens if payment fails?).
- Missing screens (where does the user see delivery time?).

Every step you remove is a step where nobody can give up.

## Wireframes: sketch before you paint

A **wireframe** is a simple black-and-white sketch of a screen showing **what goes where**: header, image, title, price, button. No colours, no fonts. It is like an architect's floor plan before choosing paint. Because wireframes are quick and cheap, you can try many layouts and throw most away without regret.

Start on paper with a pen: it stops you fiddling with details too early. Then move to a tool like Figma for clickable prototypes.

## Fidelity

- **Low fidelity**: paper sketches, boxes and lines. For exploring ideas.
- **Mid fidelity**: grey wireframes with real content and layout.
- **High fidelity**: final colours, fonts and images, often clickable, for testing details and handing to developers.

Use real content as early as possible. Designs with "Lorem ipsum" often break when real product names turn out to be three times longer.`,
      quiz: [
        { q: 'Card sorting helps you…', options: ['Choose colours', 'Learn how users group and name content', 'Write code faster'], answer: 1, why: 'Users\' groupings reveal how they think.' },
        { q: 'A wireframe mainly shows…', options: ['Final colours and fonts', 'What goes where on a screen', 'The database'], answer: 1, why: 'It is a floor plan, not paint.' },
        { q: 'Why remove steps from a user flow?', options: ['Every step is a place people can give up', 'Developers like fewer screens', 'It looks modern'], answer: 0, why: 'Fewer steps means more people finish.' },
        { q: 'On mobile, the main sections of an app usually work best in…', options: ['A bottom tab bar with 3 to 5 items', 'A hidden menu only', 'A long footer'], answer: 0, why: 'Always visible and reachable by thumb.' },
      ],
    },
    {
      id: 'uiux-layout',
      title: 'Layout, spacing and hierarchy',
      minutes: 30,
      kind: 'code',
      outline: 'Visual hierarchy, a spacing scale, alignment, grouping (proximity) and building a product card with flexbox and grid.',
      body: `## Where do eyes go first?

When you open a newspaper, your eyes jump to the biggest headline, then the photo, then the smaller text. That order is **visual hierarchy**, and designers control it with size, weight, colour, position and space. Every screen should answer: *what is the one most important thing here?* Make that thing the most visible.

## Proximity: things that belong together sit together

Put related items close and unrelated items further apart. A price close to its product name reads as one unit; a price floating halfway between two products confuses. Space is not "empty": it is how people see groups.

## A spacing scale

Professional designs use a few spacing sizes over and over, often multiples of 4 or 8 pixels: 4, 8, 12, 16, 24, 32, 48. Like using standard brick sizes, it makes everything line up and feel calm. Random gaps (13px here, 21px there) make a design feel messy even when people cannot say why.

## Alignment

Line things up along a few invisible edges. Left-aligned text is easiest to read for long passages in left-to-right languages. Centre short headings if you like, but avoid centring long paragraphs.

## CSS tools for layout

\`\`\`css
.row { display: flex; gap: 16px; align-items: center; }     /* items in a line */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
.card { padding: 16px; border-radius: 12px; }
\`\`\`

- \`gap\` spaces items evenly: no more margins on every child.
- \`padding\` is space inside a box; \`margin\` is space outside it.
- \`grid\` with \`auto-fill\` and \`minmax\` makes a responsive grid with no media queries at all.

## The button is the goal

On most screens there is one **primary action** (Buy, Pay, Continue). Make it the most obvious button: filled colour, clear words. Secondary actions (Cancel, Back) are quieter: outlined or plain text.

## Your task

Build a product card in the starter:

1. The \`.products\` container uses **CSS grid** with a \`gap\` of at least 16px.
2. Each \`.card\` has a \`padding\` of at least 12px and a \`border-radius\` of at least 8px.
3. The product name (\`.card h3\`) is **bigger** than the description text (\`.card p\`).
4. The price (\`.price\`) is **bold** (font-weight 600 or more).
5. Each card has exactly one \`button.primary\` whose background colour is not transparent or white.`,
      task: 'Style the product grid and cards with a clear hierarchy.',
      starter: `<style>
  body { font-family: system-ui, sans-serif; margin: 24px; }
  /* your styles here */
</style>
<div class="products">
  <div class="card">
    <h3>Power bank 20,000mAh</h3>
    <p>Charges a phone four times. Fast charging.</p>
    <span class="price">18,000</span>
    <button class="primary">Add to basket</button>
  </div>
  <div class="card">
    <h3>Wireless earbuds</h3>
    <p>Six hours of music, pocket-size case.</p>
    <span class="price">9,500</span>
    <button class="primary">Add to basket</button>
  </div>
</div>
`,
      checks: [
        { label: 'products use grid with a gap of 16px or more', test: `const s = getComputedStyle(document.querySelector('.products')); return s.display === 'grid' && parseFloat(s.columnGap || s.gap) >= 16` },
        { label: 'cards have padding and rounded corners', test: `return [...document.querySelectorAll('.card')].every((c) => { const s = getComputedStyle(c); return parseFloat(s.paddingTop) >= 12 && parseFloat(s.paddingLeft) >= 12 && parseFloat(s.borderTopLeftRadius) >= 8 })` },
        { label: 'name is bigger than description', test: `const c = document.querySelector('.card'); return parseFloat(getComputedStyle(c.querySelector('h3')).fontSize) > parseFloat(getComputedStyle(c.querySelector('p')).fontSize)` },
        { label: 'price is bold', test: `return [...document.querySelectorAll('.price')].every((p) => Number(getComputedStyle(p).fontWeight) >= 600)` },
        { label: 'one filled primary button per card', test: `return [...document.querySelectorAll('.card')].every((c) => { const b = c.querySelectorAll('button.primary'); if (b.length !== 1) return false; const bg = getComputedStyle(b[0]).backgroundColor; return !/rgba\\(0, 0, 0, 0\\)|transparent|rgb\\(255, 255, 255\\)/.test(bg) && bg !== 'rgb(239, 239, 239)' && bg !== 'rgb(240, 240, 240)' })` },
      ],
      hint: '.products { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px } .card { padding: 16px; border-radius: 12px } .price { font-weight: 700 } .primary { background: #6d28d9; color: white }',
      solution: `<style>
  body { font-family: system-ui, sans-serif; margin: 24px; }
  .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
  .card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
  .card h3 { font-size: 18px; margin: 0; }
  .card p { font-size: 14px; color: #475569; margin: 0; }
  .price { font-weight: 700; font-size: 18px; }
  .primary { background: #6d28d9; color: white; border: 0; border-radius: 8px; padding: 12px 16px; font-weight: 600; }
</style>
<div class="products">
  <div class="card">
    <h3>Power bank 20,000mAh</h3>
    <p>Charges a phone four times. Fast charging.</p>
    <span class="price">18,000</span>
    <button class="primary">Add to basket</button>
  </div>
  <div class="card">
    <h3>Wireless earbuds</h3>
    <p>Six hours of music, pocket-size case.</p>
    <span class="price">9,500</span>
    <button class="primary">Add to basket</button>
  </div>
</div>
`,
    },
    {
      id: 'uiux-type',
      title: 'Typography that reads well',
      minutes: 30,
      kind: 'code',
      outline: 'Choosing fonts, a type scale, line height, line length, weights and readable text on every screen.',
      body: `## Text is most of the interface

Most of what people see on a screen is text: labels, buttons, prices, instructions. If the text is hard to read, nothing else matters. Typography is like a person's voice: the same words can sound calm and trustworthy, or rushed and confusing.

## Choosing fonts

- One or two font families are enough: one for headings and one for body text, or one for everything.
- For screens, choose fonts designed to be readable at small sizes: Inter, Roboto, Source Sans, Noto Sans (which covers many languages, including Yoruba, Hausa and Igbo diacritics), or the system font (\`system-ui\`), which loads instantly.
- Decorative fonts are for logos and big headlines only, never for paragraphs.

## A type scale

Use a few font sizes, each a step up from the last, rather than random sizes. For example: 14, 16, 20, 24, 32, 40 pixels. Body text on screens should usually be **16px or more**. Smaller text tires the eyes, and on phones people zoom or give up.

## Line height: room to breathe

Line height (leading) is the space between lines. Too tight and lines blur together like a crowded bus; too loose and the paragraph falls apart. For body text, **1.4 to 1.7** times the font size works well. Headings can be tighter (1.1 to 1.3).

## Line length

Long lines are hard to follow: your eye loses its place jumping back to the start. Aim for about **45 to 75 characters per line**. In CSS, the \`ch\` unit is roughly one character wide, so \`max-width: 65ch\` on paragraphs is a simple, reliable rule.

## Weight and emphasis

Use weight (regular 400, semibold 600, bold 700) to create hierarchy. Use bold for a few important words, not whole paragraphs. Avoid writing whole sentences in capitals: it reads as shouting and is harder to read.

## Contrast for text

Light grey text on white looks elegant in a design file and becomes unreadable on a phone in sunlight. The next lesson covers contrast in detail; for now, keep body text dark (near black) on light backgrounds.

## Your task

Improve the article's typography:

1. Body text (\`p\`) is at least **16px**.
2. Paragraph \`line-height\` is between **1.4 and 1.8** times the font size.
3. Paragraphs have a \`max-width\` of **75ch or less** (in pixels, no more than about 75 characters).
4. The \`h1\` is at least **1.75 times** the paragraph size and has a font-weight of **600 or more**.
5. The \`h1\` line-height is **tighter** than the paragraph line-height.`,
      task: 'Set readable sizes, line height and line length.',
      starter: `<style>
  body { font-family: Georgia, serif; margin: 24px; }
  h1 { font-size: 18px; font-weight: 400; line-height: 2; }
  p { font-size: 12px; line-height: 1; }
</style>
<article>
  <h1>How to save money on your phone data</h1>
  <p>Mobile data is one of the biggest monthly costs for many families. Most of it is used by videos that play automatically, apps that update in the background and photos that are shared in full size on group chats. A few settings can cut the bill in half without changing how you use your phone.</p>
  <p>Start with your video settings. Turn off autoplay on social media apps, and set streaming apps to download only on Wi-Fi. Then check which apps use the most data in your phone's settings, and limit their background data.</p>
</article>
`,
      checks: [
        { label: 'paragraphs are at least 16px', test: `return [...document.querySelectorAll('p')].every((p) => parseFloat(getComputedStyle(p).fontSize) >= 16)` },
        { label: 'paragraph line height 1.4 to 1.8', test: `const s = getComputedStyle(document.querySelector('p')); const r = parseFloat(s.lineHeight) / parseFloat(s.fontSize); return r >= 1.4 && r <= 1.8` },
        { label: 'line length of 75 characters or less', test: `const p = document.querySelector('p'); const s = getComputedStyle(p); const mw = s.maxWidth; if (mw === 'none') return false; const probe = document.createElement('span'); probe.style.font = s.font; probe.textContent = '0'.repeat(76); probe.style.position = 'absolute'; probe.style.whiteSpace = 'nowrap'; document.body.appendChild(probe); const w = probe.getBoundingClientRect().width; probe.remove(); return parseFloat(mw) <= w` },
        { label: 'heading is large and bold', test: `const h = parseFloat(getComputedStyle(document.querySelector('h1')).fontSize), p = parseFloat(getComputedStyle(document.querySelector('p')).fontSize); return h >= 1.75 * p && Number(getComputedStyle(document.querySelector('h1')).fontWeight) >= 600` },
        { label: 'heading line height is tighter', test: `const r = (el) => { const s = getComputedStyle(el); return parseFloat(s.lineHeight) / parseFloat(s.fontSize) }; return r(document.querySelector('h1')) < r(document.querySelector('p'))` },
      ],
      hint: 'p { font-size: 18px; line-height: 1.6; max-width: 65ch } h1 { font-size: 36px; font-weight: 700; line-height: 1.2 }',
      solution: `<style>
  body { font-family: Georgia, serif; margin: 24px; color: #1e293b; }
  h1 { font-size: 36px; font-weight: 700; line-height: 1.2; max-width: 22ch; }
  p { font-size: 18px; line-height: 1.6; max-width: 65ch; }
</style>
<article>
  <h1>How to save money on your phone data</h1>
  <p>Mobile data is one of the biggest monthly costs for many families. Most of it is used by videos that play automatically, apps that update in the background and photos that are shared in full size on group chats. A few settings can cut the bill in half without changing how you use your phone.</p>
  <p>Start with your video settings. Turn off autoplay on social media apps, and set streaming apps to download only on Wi-Fi. Then check which apps use the most data in your phone's settings, and limit their background data.</p>
</article>
`,
    },
    {
      id: 'uiux-colour',
      title: 'Colour and contrast',
      minutes: 35,
      kind: 'code',
      outline: 'Colour roles, the 60-30-10 idea, meaning and culture, WCAG contrast ratios, and coding a contrast checker.',
      body: `## Colour has jobs

In a well-designed interface, every colour has a **role**, like players in a football team:

- **Neutral** colours (white, greys, near-black) for backgrounds and text: most of the screen.
- **Primary** (brand) colour for the main actions and highlights.
- **Semantic** colours that carry meaning: green for success, red for errors and danger, amber for warnings, blue for information.

A simple balance is **60-30-10**: about 60% neutral background, 30% secondary surfaces and text, 10% accent. If everything is bright, nothing stands out.

## Never use colour alone

About 1 in 12 men and 1 in 200 women have some colour vision deficiency, most often trouble telling red from green. An error shown only by a red border may be invisible to them. Always add a second signal: an icon, a word ("Error: enter your phone number"), or a pattern.

## Culture and meaning

Colours carry meaning that varies across the world: white is for weddings in many places and for mourning in others; red means luck in China and danger almost everywhere on a screen. Green signals money and success in finance apps. Test with the people you design for.

## Contrast: can people read it?

**Contrast ratio** compares how light two colours are, from 1:1 (identical) to 21:1 (black on white). The international accessibility standard **WCAG** asks for:

- **4.5:1** for normal text (level AA)
- **3:1** for large text (about 24px, or 19px bold) and for icons and input borders
- **7:1** for the stricter AAA level

The calculation:

1. Convert each colour channel (0 to 255) to 0 to 1: \`c = value / 255\`.
2. Linearise: if \`c <= 0.03928\`, \`c / 12.92\`, otherwise \`((c + 0.055) / 1.055) ** 2.4\`.
3. **Relative luminance** \`L = 0.2126 R + 0.7152 G + 0.0722 B\`. (Green counts most because our eyes are most sensitive to it.)
4. **Ratio** = \`(lighter L + 0.05) / (darker L + 0.05)\`.

## Your task

Write a contrast checker:

1. \`hexToRgb(hex)\`: \`"#6d28d9"\` → \`[109, 40, 217]\`. Also accept the 3-digit form \`"#fff"\` → \`[255, 255, 255]\`.
2. \`luminance([r, g, b])\`: the relative luminance using the formula above.
3. \`contrast(hexA, hexB)\`: the contrast ratio rounded to 2 decimals (the order of the colours must not matter).
4. \`passesAA(fg, bg, large = false)\`: \`true\` when the ratio meets 4.5 (or 3 for large text).`,
      task: 'Write hexToRgb, luminance, contrast and passesAA.',
      starter: `<h1>Contrast checker</h1>
<script>
  function hexToRgb(hex) {
  }
  function luminance(rgb) {
  }
  function contrast(hexA, hexB) {
  }
  function passesAA(fg, bg, large = false) {
  }
</script>
`,
      checks: [
        { label: 'hexToRgb reads 6 and 3 digit colours', test: `return JSON.stringify(hexToRgb('#6d28d9')) === '[109,40,217]' && JSON.stringify(hexToRgb('#fff')) === '[255,255,255]'` },
        { label: 'luminance of black and white', test: `return luminance([0, 0, 0]) === 0 && Math.abs(luminance([255, 255, 255]) - 1) < 1e-9` },
        { label: 'black on white is 21', test: `return contrast('#000000', '#ffffff') === 21 && contrast('#ffffff', '#000000') === 21` },
        { label: 'real colour pairs', test: `return contrast('#767676', '#ffffff') === 4.54 && contrast('#6d28d9', '#ffffff') === 7.1` },
        { label: 'passesAA uses 4.5 and 3', test: `return passesAA('#767676', '#ffffff') && !passesAA('#999999', '#ffffff') && passesAA('#949494', '#ffffff', true)` },
      ],
      hint: 'contrast: const a = luminance(hexToRgb(hexA)), b = luminance(hexToRgb(hexB)); const hi = Math.max(a, b), lo = Math.min(a, b); return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100',
      solution: `<h1>Contrast checker</h1>
<script>
  function hexToRgb(hex) {
    let h = hex.replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }
  function luminance(rgb) {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  function contrast(hexA, hexB) {
    const a = luminance(hexToRgb(hexA)), b = luminance(hexToRgb(hexB))
    const hi = Math.max(a, b), lo = Math.min(a, b)
    return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100
  }
  function passesAA(fg, bg, large = false) {
    return contrast(fg, bg) >= (large ? 3 : 4.5)
  }
</script>
`,
    },
    {
      id: 'uiux-forms',
      title: 'Buttons, forms and feedback',
      minutes: 35,
      kind: 'code',
      outline: 'Interactive states, labels, helpful errors, keyboard focus and designing forms people can finish.',
      body: `## Forms are where money is made or lost

Sign-up, checkout, loan applications, school registration: the form is the moment of truth. A confusing form is like a shop where the cashier ignores you; people walk out.

## Every input needs a visible label

Placeholder text inside a box disappears as soon as you type, so people forget what the field was for. Use a real \`<label>\` above each field, connected with \`for\` and \`id\`:

\`\`\`html
<label for="phone">Phone number</label>
<input id="phone" type="tel" autocomplete="tel">
\`\`\`

Clicking the label then focuses the field, and screen readers read the label aloud.

## Ask for less

Every extra field loses some people. Ask only what you truly need now. Use the right \`type\` (\`email\`, \`tel\`, \`number\`) so phones show the right keyboard, and \`autocomplete\` so browsers can fill in names and addresses.

## Interactive states

A button is like a light switch: people need to know it worked. Design every state:

- **Default**
- **Hover** (mouse over it)
- **Focus** (selected with the keyboard): a clearly visible outline, never removed without a replacement. People using keyboards, switches and many assistive tools depend on it.
- **Active / pressed**
- **Disabled**: visibly faded, and explain why it is disabled if not obvious
- **Loading**: "Paying…" with the button disabled, so nobody pays twice

## Error messages that help

Bad: "Invalid input." Good: "Enter an 11-digit phone number, like 0803 123 4567."

- Say what went wrong **and** how to fix it, in plain words.
- Show the message **next to the field**, not only at the top.
- Do not rely on red colour alone: include text (and an icon if you like).
- Mark the field with \`aria-invalid="true"\` and connect the message with \`aria-describedby\` so screen readers announce it.
- Keep what the person typed. Never clear the whole form because of one mistake.

## Feedback after actions

After submitting, show what happened: a success message, the next step, or a clear error. Silence makes people press the button again, and again.

## Your task

The starter has a sign-up form. Make it usable:

1. Every \`input\` has a \`<label>\` connected with \`for\` and \`id\`.
2. The email field has \`type="email"\` and the phone field has \`type="tel"\`.
3. Buttons show a visible focus style: add a \`:focus-visible\` rule with an \`outline\` (the check focuses the button and looks for an outline).
4. Write \`validatePhone()\`: if \`#phone\` does not contain exactly 11 digits (ignore spaces), set \`aria-invalid="true"\` on it, put a helpful message (at least 20 characters, mentioning **11**) into \`#phone-error\`, and return \`false\`. Otherwise clear the message, remove \`aria-invalid\` and return \`true\`.
5. Connect the phone field to its error with \`aria-describedby="phone-error"\`.`,
      task: 'Add labels, input types, focus styles and a helpful phone error.',
      starter: `<style>
  body { font-family: system-ui, sans-serif; margin: 24px; }
  input { display: block; margin-bottom: 12px; padding: 10px; }
  button { padding: 12px 16px; background: #6d28d9; color: #fff; border: 0; border-radius: 8px; }
  button:focus { outline: none; }
</style>
<form id="signup" onsubmit="event.preventDefault(); validatePhone()">
  <input id="name" placeholder="Name">
  <input id="email" placeholder="Email">
  <input id="phone" placeholder="Phone">
  <p id="phone-error"></p>
  <button>Create account</button>
</form>
<script>
  function validatePhone() {
    return true
  }
</script>
`,
      checks: [
        { label: 'every input has a connected label', test: `return [...document.querySelectorAll('input')].every((i) => i.id && document.querySelector('label[for="' + i.id + '"]'))` },
        { label: 'email and tel input types', test: `return document.getElementById('email').type === 'email' && document.getElementById('phone').type === 'tel'` },
        { label: 'visible keyboard focus on the button', test: `const b = document.querySelector('button'); const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules] } catch (e) { return [] } }); return rules.some((r) => r.selectorText && /button[^,]*:focus-visible|:focus-visible/.test(r.selectorText) && r.style && r.style.outlineStyle && r.style.outlineStyle !== 'none' && b.matches(r.selectorText.replace(/:focus-visible/g, '')))` },
        { label: 'bad phone gets a helpful, connected error', test: `const p = document.getElementById('phone'); p.value = '0803 123'; const ok = validatePhone(); const msg = document.getElementById('phone-error').textContent; return ok === false && p.getAttribute('aria-invalid') === 'true' && msg.length >= 20 && msg.includes('11') && p.getAttribute('aria-describedby') === 'phone-error'` },
        { label: 'good phone clears the error', test: `const p = document.getElementById('phone'); p.value = '0803 123'; validatePhone(); p.value = '0803 123 4567'; return validatePhone() === true && !p.hasAttribute('aria-invalid') && document.getElementById('phone-error').textContent.trim() === ''` },
      ],
      hint: 'Count digits with p.value.replace(/\\D/g, "").length. Use p.setAttribute("aria-invalid", "true") and p.removeAttribute("aria-invalid"). Replace button:focus { outline: none } with button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px }.',
      solution: `<style>
  body { font-family: system-ui, sans-serif; margin: 24px; }
  label { display: block; font-weight: 600; margin-bottom: 4px; }
  input { display: block; margin-bottom: 12px; padding: 10px; }
  button { padding: 12px 16px; background: #6d28d9; color: #fff; border: 0; border-radius: 8px; }
  button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
  #phone-error { color: #b91c1c; }
</style>
<form id="signup" onsubmit="event.preventDefault(); validatePhone()">
  <label for="name">Full name</label>
  <input id="name" autocomplete="name">
  <label for="email">Email</label>
  <input id="email" type="email" autocomplete="email">
  <label for="phone">Phone number</label>
  <input id="phone" type="tel" autocomplete="tel" aria-describedby="phone-error">
  <p id="phone-error"></p>
  <button>Create account</button>
</form>
<script>
  function validatePhone() {
    const p = document.getElementById('phone')
    const err = document.getElementById('phone-error')
    if (p.value.replace(/\\D/g, '').length !== 11) {
      p.setAttribute('aria-invalid', 'true')
      err.textContent = 'Enter an 11-digit phone number, like 0803 123 4567.'
      return false
    }
    p.removeAttribute('aria-invalid')
    err.textContent = ''
    return true
  }
</script>
`,
    },
    {
      id: 'uiux-responsive',
      title: 'Responsive, mobile-first design',
      minutes: 30,
      kind: 'code',
      outline: 'Designing for small screens first, breakpoints with media queries, touch targets, thumb zones and slow networks.',
      body: `## Most people are on phones

In much of the world, and especially across Africa and Asia, most people reach the internet mainly through a phone. Often it is an affordable Android with a small screen, limited storage and expensive data. Designing for a large laptop first and "squeezing" it onto phones later is like building a house for a giant and then asking a child to live in it.

## Mobile first

Start with the smallest screen: one column, the most important content first, big tap targets. Then **add** layout for bigger screens with media queries:

\`\`\`css
.grid { display: grid; gap: 16px; }                         /* one column on phones */
@media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
\`\`\`

\`min-width\` media queries mean "from this width and up". Choose breakpoints where **your content** starts to look wrong, not for specific phone models.

## The viewport tag

Without \`<meta name="viewport" content="width=device-width, initial-scale=1">\`, phones pretend to be a wide desktop and shrink the page into a tiny unreadable picture.

## Touch targets and thumbs

Fingers are less precise than a mouse pointer. Make buttons and links at least **44 × 44 pixels** (Apple's guideline; Google suggests 48), with space between them, so people do not tap the wrong one. Most people hold a phone in one hand: the bottom middle of the screen is easiest to reach with the thumb, the top corners hardest. That is why important actions in apps sit at the bottom.

## Flexible everything

- Images: \`max-width: 100%; height: auto;\` so they never overflow.
- Avoid fixed widths like \`width: 1200px\`. Use percentages, \`max-width\` and grid.
- Text should never need sideways scrolling.

## Slow and expensive networks

Design for a weak 3G signal: compress images, avoid huge videos that autoplay, show content as it loads (skeleton screens), and keep pages light. Every megabyte costs your users money.

## Test on real devices

Browser developer tools can imitate phone sizes, but also test on a real, inexpensive phone, outdoors in sunlight, with one hand.

## Your task

Make the starter page mobile-first:

1. Add a viewport meta tag with \`width=device-width\`.
2. \`.features\` is a **single column** by default (on narrow screens).
3. Add a \`@media (min-width: …)\` rule that gives \`.features\` **3 columns** on wide screens.
4. All buttons and links in \`.actions\` are at least **44px tall**.
5. Images never overflow: \`max-width: 100%\`.`,
      task: 'Viewport, one column by default, 3 columns on wide screens, 44px targets and fluid images.',
      starter: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; margin: 16px; }
    .features { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .actions a, .actions button { padding: 4px 8px; font-size: 13px; }
  </style>
</head>
<body>
  <img src="https://picsum.photos/1400/500" width="1400" alt="A busy market street at sunrise">
  <div class="features">
    <div>Fast delivery</div><div>Pay on delivery</div><div>Fresh every day</div>
  </div>
  <div class="actions"><button>Order now</button> <a href="#menu">See the menu</a></div>
</body>
</html>
`,
      checks: [
        { label: 'viewport meta tag', test: `const v = document.querySelector('meta[name="viewport"]'); return !!v && /width=device-width/.test(v.content)` },
        { label: 'one column by default', test: `const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); const base = rules.filter((r) => r.selectorText === '.features'); return base.length > 0 && base.every((r) => !r.style.gridTemplateColumns || r.style.gridTemplateColumns.trim().split(/\\s+/).length === 1 || /^(1fr|100%)$/.test(r.style.gridTemplateColumns.trim()))` },
        { label: '3 columns in a min-width media query', test: `const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return rules.some((r) => r.media && /min-width/.test(r.media.mediaText) && [...r.cssRules].some((x) => x.selectorText === '.features' && (/repeat\\(\\s*3/.test(x.style.gridTemplateColumns) || x.style.gridTemplateColumns.trim().split(/\\s+/).length === 3)))` },
        { label: 'tap targets at least 44px tall', test: `return [...document.querySelectorAll('.actions a, .actions button')].every((el) => el.getBoundingClientRect().height >= 44)` },
        { label: 'images never overflow', test: `return [...document.querySelectorAll('img')].every((i) => getComputedStyle(i).maxWidth === '100%')` },
      ],
      hint: 'Change .features to grid-template-columns: 1fr, then add @media (min-width: 768px) { .features { grid-template-columns: repeat(3, 1fr) } }. For targets: .actions a, .actions button { display: inline-flex; align-items: center; min-height: 48px; padding: 0 16px }',
      solution: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; margin: 16px; }
    img { max-width: 100%; height: auto; }
    .features { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 768px) { .features { grid-template-columns: repeat(3, 1fr); } }
    .actions a, .actions button { display: inline-flex; align-items: center; min-height: 48px; padding: 0 16px; font-size: 16px; }
  </style>
</head>
<body>
  <img src="https://picsum.photos/1400/500" width="1400" alt="A busy market street at sunrise">
  <div class="features">
    <div>Fast delivery</div><div>Pay on delivery</div><div>Fresh every day</div>
  </div>
  <div class="actions"><button>Order now</button> <a href="#menu">See the menu</a></div>
</body>
</html>
`,
    },
    {
      id: 'uiux-accessibility',
      title: 'Accessibility: design for everyone',
      minutes: 35,
      kind: 'code',
      outline: 'Semantic HTML, landmarks, keyboard access, names for icon buttons, skip links and the POUR principles.',
      body: `## A ramp helps everyone

A ramp at a building's entrance was built for wheelchair users, but parents with buggies, delivery workers and travellers with suitcases all use it. Accessible design works the same way: captions help people in noisy buses, high contrast helps everyone in sunlight, clear language helps people reading in their second language.

## Who are we designing for?

People who are blind and use **screen readers** (which read the page aloud), people with low vision who zoom to 200% or more, people who cannot use a mouse and navigate with a **keyboard** or switch, people who are deaf or hard of hearing, people with dyslexia or cognitive disabilities, and anyone temporarily limited (a broken arm, a baby in one hand, a cracked screen).

## POUR

The WCAG guidelines group everything under four principles:

- **Perceivable**: people can see or hear the content (alt text, captions, contrast).
- **Operable**: people can use it with any input (keyboard, touch, voice), with enough time.
- **Understandable**: clear language, predictable behaviour, helpful errors.
- **Robust**: works with assistive technology, now and in future (valid, semantic HTML).

## Semantic HTML: the free superpower

Use the right element for the job and you get accessibility for free:

- \`<button>\` for actions (it works with Enter and Space and is announced as a button). A clickable \`<div>\` does none of that.
- \`<a href>\` for going somewhere.
- Headings \`<h1>\`–\`<h6>\` in order: screen reader users jump between headings like flipping chapters.
- **Landmarks**: \`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\` let people jump straight to the main content.
- \`<label>\` for every input (lesson 7).

## Names for icon buttons

A button showing only a 🔍 or ✕ icon has no words for a screen reader to read. Give it an accessible name: \`<button aria-label="Search">\`. The first rule of ARIA: use native HTML where possible; add ARIA only to fill gaps.

## Keyboard access

Try using a page with only the Tab, Enter, Space and arrow keys. Can you reach everything? Can you see where you are (focus outline)? Is the order logical? A **skip link** at the very top ("Skip to main content") lets keyboard users jump past a long menu on every page.

## Laws and standards

Accessibility is required by law for many organisations: the European Accessibility Act (from 2025), the Americans with Disabilities Act, the UK Equality Act, and in Nigeria the Discrimination Against Persons with Disabilities (Prohibition) Act. **WCAG 2.2 level AA** is the common target.

## Your task

Fix the starter page:

1. Wrap the menu in a \`<nav>\` and the main content in a \`<main id="main">\`.
2. Add a **skip link** as the first link on the page: \`<a href="#main">\` (it may be visually hidden until focused).
3. Replace the clickable \`<div class="buy">\` with a real \`<button>\` (keep the class).
4. Give the icon-only buttons (\`.icon\`) an \`aria-label\`.
5. The page has exactly one \`<h1>\`, and no heading level is skipped (for example h2 straight to h4).`,
      task: 'Landmarks, skip link, real buttons, icon labels and heading order.',
      starter: `<style>
  body { font-family: system-ui, sans-serif; margin: 16px; }
  .buy { background: #6d28d9; color: white; padding: 12px; display: inline-block; cursor: pointer; }
</style>
<div class="menu"><a href="#">Home</a> <a href="#">Shop</a> <a href="#">Contact</a></div>
<button class="icon">🔍</button>
<button class="icon">🛒</button>
<div class="content">
  <h1>Power banks</h1>
  <h4>20,000mAh power bank</h4>
  <p>Charges a phone four times.</p>
  <div class="buy" onclick="this.textContent = 'Added'">Add to basket</div>
</div>
`,
      checks: [
        { label: 'nav and main landmarks', test: `return !!document.querySelector('nav a') && !!document.querySelector('main#main h1')` },
        { label: 'skip link is the first link', test: `const a = document.querySelector('a'); return !!a && a.getAttribute('href') === '#main'` },
        { label: 'buy is a real button', test: `const b = document.querySelector('.buy'); return !!b && b.tagName === 'BUTTON'` },
        { label: 'icon buttons have names', test: `const i = [...document.querySelectorAll('.icon')]; return i.length >= 2 && i.every((b) => (b.getAttribute('aria-label') || '').trim().length >= 3)` },
        { label: 'one h1 and no skipped heading levels', test: `const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])); return hs.filter((n) => n === 1).length === 1 && hs.every((n, i) => i === 0 || n <= hs[i - 1] + 1)` },
      ],
      hint: 'Put <a class="skip" href="#main">Skip to main content</a> first, wrap the links in <nav>, change <div class="content"> to <main id="main">, h4 to h2, and the buy div to <button class="buy">.',
      solution: `<style>
  body { font-family: system-ui, sans-serif; margin: 16px; }
  .skip { position: absolute; left: -999px; }
  .skip:focus { left: 16px; top: 16px; background: #fff; padding: 8px; }
  .buy { background: #6d28d9; color: white; padding: 12px; border: 0; cursor: pointer; }
</style>
<a class="skip" href="#main">Skip to main content</a>
<header>
  <nav aria-label="Main"><a href="#">Home</a> <a href="#">Shop</a> <a href="#">Contact</a></nav>
  <button class="icon" aria-label="Search">🔍</button>
  <button class="icon" aria-label="Basket">🛒</button>
</header>
<main id="main">
  <h1>Power banks</h1>
  <h2>20,000mAh power bank</h2>
  <p>Charges a phone four times.</p>
  <button class="buy" onclick="this.textContent = 'Added'">Add to basket</button>
</main>
`,
    },
    {
      id: 'uiux-testing',
      title: 'Prototyping and usability testing',
      minutes: 30,
      kind: 'read',
      outline: 'Clickable prototypes, running a usability test with 5 people, writing tasks, measuring success and acting on findings.',
      body: `## Test before you build

Building software is expensive. Changing a sketch costs minutes; changing a finished app costs weeks. A **prototype** is a rehearsal before opening night: it lets you find problems while they are still cheap to fix.

## Prototypes

- **Paper prototypes**: hand-drawn screens; you play the computer, swapping papers as the person "taps". Surprisingly effective.
- **Clickable prototypes** in Figma (or similar tools): linked screens that feel like an app, without any code.
- **Coded prototypes**: when behaviour matters, like a live search, a quick HTML page (what you have been building in this course) is the most realistic test.

## Usability testing

Watch real people try to complete real tasks with your design, and learn where they struggle.

**How many people?** Research by the Nielsen Norman Group famously showed that testing with **about 5 people** finds most of the biggest problems. Test with 5, fix, and test again with 5 more, rather than once with 20.

**Writing tasks**: give a goal and context, not instructions. Good: *"You want to send ₦5,000 to your sister for her school books. Show me how you would do that."* Bad: *"Click Transfer, then enter the amount."* (That tests reading, not the design.)

## Running a session

1. Welcome the person and explain: *"We are testing the design, not you. You cannot do anything wrong."*
2. Ask them to **think aloud**: say what they are looking at, expecting and feeling.
3. Give one task at a time. **Do not help**, hint or explain, however painful it is to watch. If they ask "what should I do?", reply "what would you do if I weren't here?"
4. Note where they hesitate, make errors, or say "hmm".
5. At the end, ask what was easy, what was confusing, and anything else they noticed.

## What to measure

- **Task success**: did they finish?
- **Time on task** and **errors**.
- **Satisfaction**: a short survey such as the 10-question System Usability Scale (SUS).

## Making sense of findings

List every problem, then rate it: how many people hit it, and how badly it blocked them. Fix the severe, common ones first. Look for **patterns** across people, not one person's opinion about colours.

## Other methods

- **A/B testing** live: show two versions to different users and compare results (needs lots of traffic).
- **Analytics and heatmaps**: where people click, scroll and drop off.
- **Surveys** for opinions at scale; **interviews** for the reasons behind them.
- **Accessibility testing** with screen readers (VoiceOver, TalkBack, NVDA) and with disabled users.`,
      quiz: [
        { q: 'A good usability task is…', options: ['"Click Transfer, then enter 5000"', '"You want to send ₦5,000 to your sister. Show me how."', '"Do you like the colours?"'], answer: 1, why: 'Give a goal and context, not instructions.' },
        { q: 'About how many people find most of the big problems in one round?', options: ['1', '5', '50'], answer: 1, why: 'Test with 5, fix, then test again.' },
        { q: 'A participant gets stuck and asks you what to do. You should…', options: ['Show them the button', 'Ask what they would do if you were not there', 'End the test'], answer: 1, why: 'Helping hides the problem you are looking for.' },
        { q: 'Which problems should you fix first?', options: ['Severe ones that many people hit', 'The one a single person disliked', 'Colour preferences'], answer: 0, why: 'Prioritise by frequency and severity.' },
      ],
    },
    {
      id: 'uiux-systems',
      title: 'Design systems and dark mode',
      minutes: 35,
      kind: 'code',
      outline: 'Design tokens with CSS custom properties, reusable components, consistency at scale and theming for dark mode.',
      body: `## LEGO for interfaces

LEGO bricks come in a fixed set of shapes and colours, and that is exactly why you can build anything with them and it all fits together. A **design system** is a LEGO set for a product: agreed colours, type sizes, spacing, and ready-made components (buttons, inputs, cards, alerts), with rules for using them. Big examples: Google's **Material Design**, Apple's **Human Interface Guidelines**, IBM's **Carbon**, Shopify's **Polaris**.

## Why teams need one

- **Consistency**: every button looks and behaves the same, so users learn once.
- **Speed**: designers and developers reuse instead of reinventing.
- **Quality**: accessibility and states are solved once, in the component.
- **Change**: update the brand colour in one place and the whole product follows.

## Design tokens

**Tokens** are the named values at the heart of a system: \`color-primary\`, \`space-4\`, \`radius-md\`, \`font-size-lg\`. In CSS they become **custom properties** (variables):

\`\`\`css
:root {
  --color-primary: #6d28d9;
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --space-4: 16px;
  --radius: 12px;
}
.button { background: var(--color-primary); padding: var(--space-4); border-radius: var(--radius); }
\`\`\`

Name tokens by **role**, not by appearance: \`--color-danger\`, not \`--red\`. If the brand later chooses orange for danger, the name still makes sense.

## Dark mode with tokens

Because components use roles, switching themes means changing the token values only:

\`\`\`css
@media (prefers-color-scheme: dark) {
  :root { --color-bg: #0f172a; --color-text: #e2e8f0; }
}
\`\`\`

\`prefers-color-scheme\` follows the user's phone or computer setting. Dark mode is not just "invert everything": use dark grey rather than pure black, slightly lighter surfaces for raised cards, softer (less saturated) accent colours, and check contrast again in both themes.

## Documenting components

For each component, a design system records: what it is for, its variants (primary, secondary, danger), sizes, states, do and don't examples, accessibility notes and the code. Figma libraries and tools like Storybook hold the visual and coded versions side by side.

## Your task

Refactor the starter to use tokens:

1. In \`:root\`, define at least these custom properties: \`--color-primary\`, \`--color-bg\`, \`--color-text\`, \`--space\` and \`--radius\`.
2. \`body\` uses \`var(--color-bg)\` for its background and \`var(--color-text)\` for its colour.
3. \`.btn\` uses \`var(--color-primary)\`, \`var(--space)\` (in its padding) and \`var(--radius)\`.
4. Add a \`@media (prefers-color-scheme: dark)\` block that changes \`--color-bg\` and \`--color-text\` in \`:root\`.
5. No colour hex codes remain in the \`body\` and \`.btn\` rules (only in the token definitions).`,
      task: 'Introduce design tokens and a dark theme.',
      starter: `<style>
  body { background: #ffffff; color: #0f172a; font-family: system-ui, sans-serif; margin: 24px; }
  .btn { background: #6d28d9; color: #ffffff; padding: 12px 16px; border-radius: 10px; border: 0; }
</style>
<h1>Your basket</h1>
<p>2 items, total 27,500</p>
<button class="btn">Checkout</button>
`,
      checks: [
        { label: 'tokens defined in :root', test: `const s = getComputedStyle(document.documentElement); return ['--color-primary', '--color-bg', '--color-text', '--space', '--radius'].every((t) => s.getPropertyValue(t).trim() !== '')` },
        { label: 'body uses the colour tokens', test: `const r = [...document.styleSheets].flatMap((x) => [...x.cssRules]).filter((x) => x.selectorText === 'body').pop(); return !!r && /var\\(--color-bg\\)/.test(r.style.cssText) && /var\\(--color-text\\)/.test(r.style.cssText)` },
        { label: 'button uses primary, space and radius tokens', test: `const r = [...document.styleSheets].flatMap((x) => [...x.cssRules]).find((x) => x.selectorText === '.btn'); return !!r && ['--color-primary', '--space', '--radius'].every((t) => r.style.cssText.includes('var(' + t))` },
        { label: 'dark theme changes the tokens', test: `return [...document.styleSheets].flatMap((x) => [...x.cssRules]).some((r) => r.media && /prefers-color-scheme:\\s*dark/.test(r.media.mediaText) && [...r.cssRules].some((x) => x.selectorText === ':root' && x.style.getPropertyValue('--color-bg') && x.style.getPropertyValue('--color-text')))` },
        { label: 'no hex colours left in body and .btn', test: `const all = [...document.styleSheets].flatMap((x) => [...x.cssRules]); const rs = ['body', '.btn'].map((sel) => all.filter((x) => x.selectorText === sel).pop()); return rs.every((r) => !!r) && rs.every((r) => !/#[0-9a-f]{3,8}\\b|rgb\\(/i.test(r.style.cssText))` },
      ],
      hint: ':root { --color-primary: #6d28d9; --color-on-primary: #fff; --color-bg: #fff; --color-text: #0f172a; --space: 12px; --radius: 10px } then .btn { background: var(--color-primary); color: var(--color-on-primary); padding: var(--space) calc(var(--space) + 4px); border-radius: var(--radius) }',
      solution: `<style>
  :root {
    --color-primary: #6d28d9;
    --color-on-primary: #ffffff;
    --color-bg: #ffffff;
    --color-text: #0f172a;
    --space: 12px;
    --radius: 10px;
  }
  @media (prefers-color-scheme: dark) {
    :root { --color-bg: #0f172a; --color-text: #e2e8f0; --color-primary: #a78bfa; --color-on-primary: #0f172a; }
  }
  body { background: var(--color-bg); color: var(--color-text); font-family: system-ui, sans-serif; margin: 24px; }
  .btn { background: var(--color-primary); color: var(--color-on-primary); padding: var(--space) calc(var(--space) + 4px); border-radius: var(--radius); border: 0; }
</style>
<h1>Your basket</h1>
<p>2 items, total 27,500</p>
<button class="btn">Checkout</button>
`,
    },
    {
      id: 'uiux-career',
      title: 'Case studies, portfolio and AI in design',
      minutes: 30,
      kind: 'prompt',
      outline: 'Writing a design case study, building a portfolio, working with developers, using AI tools well, and finding work.',
      body: `## Show your thinking, not just pictures

Employers and clients hire designers for how they **think**: how they understand people, solve problems and make decisions. A gallery of pretty screens says little. A **case study** tells the story of a project like a short detective story: there was a problem, you investigated, you tried things, you found an answer, and here is the proof it worked.

## The shape of a case study

1. **The problem**, in one or two sentences, with who it affects and why it matters.
2. **Your role** and the constraints (time, team, budget, technology).
3. **Research**: what you did and the key insights (quotes, numbers, photos of sketches).
4. **Process**: flows, wireframes, the options you explored and why you rejected some.
5. **The solution**: final screens, with the reasons behind the important decisions.
6. **Testing and results**: what users did, what changed, and numbers where possible ("checkout completion rose from 54% to 71%").
7. **What you learned** and what you would do next.

Keep it scannable: headings, short paragraphs, big images with captions. Three strong case studies beat ten weak ones.

## No clients yet?

Redesign a real everyday service you know well (a school portal, a bus booking site, a local bank's app), do real research with real people, and say clearly that it is a self-initiated concept. Your final project in this course is a good first case study.

## Working with developers

Talk to developers early, not at the end. Share your design system and tokens, design every state (loading, empty, error, success), give real content examples, and be open to technical constraints. Designers who understand a little HTML and CSS (like you now do) are much easier to work with.

## AI in design

AI tools can generate layout ideas, write placeholder copy, summarise interview notes, suggest colour palettes and turn sketches into code. Use them to **explore faster**, then apply your judgement: AI does not know your users, often produces generic designs, and can miss accessibility. Never paste private user research data into public AI tools without permission.

## Finding work

- **Tools to learn next**: Figma (industry standard, free plan), FigJam for workshops, and a prototyping workflow.
- **Communities**: local design meetups, online design communities, and Figma Community files to learn from.
- **Where designers work**: product companies, agencies, banks and fintechs, e-commerce, government digital services, NGOs, and freelance work for small businesses worldwide.
- **Roles**: UI designer, UX designer, product designer, UX researcher, UX writer, design system designer.

## Practise

Use the tutor to outline your case study.`,
      practice: 'Pick a design project (your final project for this course, or a redesign of an app or website you use). Ask the tutor to interview you about it, one question at a time, following the 7-part case study shape from the lesson. Then ask it to draft the headings and a short summary for each part, and to point out where you need evidence such as a user quote, a sketch or a number.',
    },
  ],
  project: {
    title: 'Redesign a real screen, with a case study',
    lang: 'html',
    brief: `Choose a screen from a real app or website that frustrates people (a school portal login, a bus booking form, a food menu, a bank transfer screen). Research it with at least 3 real people, then **redesign it in CDM Studio** as a working, mobile-first page.

The same Studio project must include a short **case study section** below the design: the problem, what you learned from users (with at least one quote), the key design decisions and why, and how you tested it.

Use design tokens (CSS custom properties), real content, and make it accessible. You may use the AI builder for a first draft, but the research, decisions and final design must be yours.`,
    rubric: [
      'Clearly states the original problem and who it affects, with evidence from at least 3 real users (including a quote)',
      'The redesigned screen is mobile-first and responsive, with a viewport tag and layouts that adapt to wider screens',
      'Has a clear visual hierarchy with one obvious primary action',
      'Uses a consistent spacing and type scale through design tokens (CSS custom properties)',
      'Text and controls meet WCAG AA contrast and touch targets are at least 44px',
      'Uses semantic HTML: landmarks, ordered headings, labelled form fields and real buttons',
      'Designs at least two states beyond the default (for example error, empty, loading or success)',
      'Explains the key design decisions and the reasons for them',
      'Describes how the design was tested with users and what changed as a result',
      'Uses real, specific content rather than placeholder text',
    ],
  },
  exam: [
    { q: 'UI is to UX as…', options: ['The car is to the journey', 'The journey is to the car', 'Price is to product', 'Logo is to brand'], answer: 0, why: 'UI is what you touch; UX is the whole experience.' },
    { q: 'The first stage of design thinking is…', options: ['Prototype', 'Empathise', 'Test', 'Code'], answer: 1, why: 'Start by understanding people.' },
    { q: 'Which interview question is best?', options: ['"Would you use this app?"', '"Tell me about the last time you paid a school fee."', '"Do you like blue?"', '"Isn\'t this a great idea?"'], answer: 1, why: 'Ask about real past behaviour.' },
    { q: 'A good problem statement…', options: ['Names the solution, like "build an app"', 'Describes the user, their need and an insight', 'Lists features', 'Is only a number'], answer: 1, why: 'It describes the need, not the solution.' },
    { q: 'Card sorting is used to…', options: ['Test colours', 'Understand how users group and label content', 'Write code', 'Measure speed'], answer: 1, why: 'It shapes information architecture.' },
    { q: 'Wireframes should focus on…', options: ['Final colours', 'Layout and what goes where', 'Animations', 'Logos'], answer: 1, why: 'Structure before style.' },
    { q: 'Things that belong together should be placed…', options: ['Far apart', 'Close together', 'In different colours', 'In capitals'], answer: 1, why: 'The principle of proximity.' },
    { q: 'A spacing scale like 4, 8, 16, 24, 32 helps because…', options: ['It makes layouts consistent and aligned', 'It loads faster', 'Browsers require it', 'It hides content'], answer: 0, why: 'Repeated sizes make designs feel calm.' },
    { q: 'Comfortable body text line length is about…', options: ['10 to 20 characters', '45 to 75 characters', '150 to 200 characters', 'Any length'], answer: 1, why: 'Long lines make eyes lose their place.' },
    { q: 'Body text line height is usually best at…', options: ['1.0', '1.4 to 1.7', '3.0', '0.8'], answer: 1, why: 'Room to breathe without falling apart.' },
    { q: 'WCAG AA requires normal text to have a contrast ratio of at least…', options: ['2:1', '3:1', '4.5:1', '10:1'], answer: 2, why: 'Large text needs 3:1.' },
    { q: 'Why not show errors with a red border alone?', options: ['Red is ugly', 'People with colour vision deficiency may not see it', 'Borders are slow', 'It is against the law in all countries'], answer: 1, why: 'Add text or an icon too.' },
    { q: 'Placeholder text inside an input is not a substitute for a label because…', options: ['It disappears when you type', 'It is too colourful', 'Browsers block it', 'It is always in capitals'], answer: 0, why: 'People forget what the field was for.' },
    { q: 'Removing the focus outline from buttons without a replacement…', options: ['Makes the site faster', 'Leaves keyboard users unable to see where they are', 'Improves SEO', 'Is required by WCAG'], answer: 1, why: 'Visible focus is essential.' },
    { q: 'A good error message…', options: ['"Invalid input"', '"Error 422"', '"Enter an 11-digit phone number, like 0803 123 4567"', '"Try again"'], answer: 2, why: 'Say what is wrong and how to fix it.' },
    { q: 'Mobile-first CSS usually uses…', options: ['max-width media queries only', 'min-width media queries to add layout for bigger screens', 'No media queries', 'Fixed 1200px widths'], answer: 1, why: 'Start small and add.' },
    { q: 'The minimum comfortable touch target is about…', options: ['16 × 16px', '24 × 24px', '44 × 44px', '100 × 100px'], answer: 2, why: 'Fingers are less precise than pointers.' },
    { q: 'For an action, the most accessible element is…', options: ['<div onclick>', '<span>', '<button>', '<img>'], answer: 2, why: 'Buttons work with keyboards and screen readers by default.' },
    { q: 'An icon-only search button needs…', options: ['A bigger icon', 'An accessible name such as aria-label="Search"', 'A red colour', 'Nothing'], answer: 1, why: 'Screen readers need words.' },
    { q: 'In a usability test, when a participant struggles you should…', options: ['Explain the design', 'Stay quiet and observe', 'Take over the mouse', 'Stop the test'], answer: 1, why: 'Struggles are the findings.' },
    { q: 'Design tokens should be named by…', options: ['Appearance, like --red', 'Role, like --color-danger', 'Random numbers', 'The designer\'s name'], answer: 1, why: 'Roles stay meaningful when the look changes.' },
    { q: 'prefers-color-scheme: dark lets a site…', options: ['Follow the user\'s light or dark setting', 'Run faster at night', 'Hide content', 'Block screenshots'], answer: 0, why: 'Themes swap token values.' },
  ],
}
