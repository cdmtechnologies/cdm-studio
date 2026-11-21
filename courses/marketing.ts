import type { Course } from './types'

export const marketing: Course = {
  id: 'marketing',
  title: 'Digital marketing and SEO',
  blurb: 'Get found on Google, grow on social media, run ads that pay for themselves and measure what works. Practical skills every business needs.',
  emoji: '📣',
  colour: 'rose',
  level: 'Beginner',
  hours: 12,
  free: 2,
  skills: ['Audience research and positioning', 'Search engine optimisation (on-page and technical)', 'Content and social media strategy', 'Email marketing', 'Paid ads (Google and Meta)', 'Marketing metrics: CTR, CPA, ROAS', 'Local SEO and WhatsApp marketing', 'Building a marketing plan'],
  careers: ['Digital marketing executive', 'SEO specialist', 'Social media manager', 'Performance (paid ads) marketer', 'Freelance marketer for small businesses'],
  lessons: [
    {
      id: 'marketing-foundations',
      title: 'What marketing really is',
      minutes: 20,
      kind: 'read',
      outline: 'Marketing versus selling, value propositions, the funnel and the 4 Ps, online and offline.',
      body: `## Marketing is not shouting

Many people think marketing means posting adverts everywhere. That is like a farmer throwing seeds onto a road and hoping. Real marketing is more like good farming: you choose the right field (the **audience**), plant the right seed (the **offer**), water at the right time (the **message** and **channel**), and keep checking what grows (the **measurement**).

A simple definition: **marketing is finding people who have a problem you can solve, and helping them choose you.** Selling is the last step of that journey. Marketing is everything that makes the sale easy.

## The value proposition

Before any post or advert, answer one question in one sentence: *why should this person choose you over every other option, including doing nothing?*

> For busy parents in Abuja who have no time to shop, *Mama's Market* delivers fresh food in 2 hours, so dinner is never a crisis.

A good value proposition names **who** it is for, the **problem**, the **benefit**, and what makes it **different**. If you cannot write it, no amount of advertising will fix the business.

## The funnel

People rarely buy the first time they hear of you. They move through stages, like water through a funnel that is wide at the top and narrow at the bottom:

1. **Awareness**: they discover you exist (a post, a search result, a friend's recommendation).
2. **Consideration**: they compare you, read reviews, visit your page.
3. **Conversion**: they buy, book or sign up.
4. **Loyalty**: they come back and tell others.

Each stage needs different content. An advert that says "Buy now!" to someone who has never heard of you is like proposing marriage on a first meeting.

## The 4 Ps

A classic checklist that still works:

- **Product**: what you sell, and does it truly solve the problem?
- **Price**: what it costs, and how that compares.
- **Place**: where people can get it (online shop, WhatsApp, a market stall, delivery apps).
- **Promotion**: how people hear about it.

Digital marketing is mostly about promotion and place, but if the product or price is wrong, the best campaign only makes more people disappointed, faster.

## Digital channels in this course

Search (SEO and Google Ads), social media (organic and paid), email and WhatsApp, content (articles, videos), and local listings (Google Business Profile). The skills are the same worldwide; the examples include Nigerian and global businesses.`,
      quiz: [
        { q: 'A strong value proposition names…', options: ['Only the price', 'Who it is for, the problem, the benefit and what is different', 'The company history'], answer: 1, why: 'It tells one kind of customer why to choose you.' },
        { q: 'Someone reading reviews and comparing prices is at which stage?', options: ['Awareness', 'Consideration', 'Loyalty'], answer: 1, why: 'They know you and are deciding.' },
        { q: 'If customers hate the product, more advertising will…', options: ['Fix it', 'Disappoint more people, faster', 'Make no difference'], answer: 1, why: 'Promotion cannot fix product or price problems.' },
      ],
    },
    {
      id: 'marketing-audience',
      title: 'Know your audience',
      minutes: 25,
      kind: 'prompt',
      outline: 'Customer personas, research methods, jobs to be done and positioning, practised with the AI tutor.',
      body: `## You cannot talk to "everyone"

Imagine giving a speech to a crowd where half are children and half are bank managers. Whatever you say, you lose one half. Marketing to "everyone" fails the same way. The narrower and clearer your audience, the sharper your message.

## Personas

A **persona** is a short, realistic description of one typical customer, built from real research:

> **Ngozi, 34, nurse in Lagos.** Works 12-hour shifts. Shops on her phone during breaks, mostly on Instagram and WhatsApp. Wants healthy meals for her two children but has no time to cook on weekdays. Worries about food hygiene and late deliveries. Trusts recommendations from other mothers.

Notice what matters: **goals**, **frustrations**, **where they spend time**, **what they trust**. Age and job are just context.

## Research: ask, watch, read

- **Talk to 5 to 10 real customers.** Ask about the last time they bought something like yours: what triggered it, what almost stopped them, what they compared.
- **Read reviews** of you and your competitors. Complaints are a gold mine of unmet needs.
- **Watch search behaviour**: the words people type into Google and YouTube (lesson 3 shows how).
- **Look at your own data**: which products sell, when, to whom.

Never invent a persona in an office and treat it as fact. A persona is a summary of evidence.

## Jobs to be done

People do not buy a drill; they buy a hole in the wall, so they can hang a family photo. Ask: *what job is the customer hiring this product to do?* A customer "hires" a food delivery app to avoid an argument about who cooks tonight. That insight changes your adverts completely.

## Positioning

Positioning is the place you want to own in the customer's mind. Use this template:

> For **[audience]** who **[need]**, **[brand]** is the **[category]** that **[key benefit]**, unlike **[alternative]**, because **[reason to believe]**.

## Practise

Use the tutor to build a persona and positioning statement for a real business.`,
      practice: 'Pick a real business (yours, a family business or one you know). Tell the tutor what it sells and to whom. Ask it to interview you, one question at a time, to build a persona (goals, frustrations, channels, trust). Then ask it to draft a positioning statement using the template in the lesson, and to point out which parts are assumptions you should check with real customers.',
    },
    {
      id: 'marketing-seo-basics',
      title: 'How search engines work',
      minutes: 30,
      kind: 'read',
      outline: 'Crawling, indexing and ranking, search intent, and keyword research with free tools.',
      body: `## Google is a librarian with a huge library

Imagine a librarian who has read every book in the world, and when you ask a question, hands you the ten pages most likely to help. To do that, the librarian must:

1. **Crawl**: send out robots ("spiders") that follow links from page to page, discovering new pages.
2. **Index**: read each page, understand what it is about, and file it in an enormous catalogue.
3. **Rank**: when someone searches, choose the best pages from the catalogue, in order.

**SEO** (search engine optimisation) means making your pages easy to find, easy to understand, and genuinely the best answer, so they rank high without paying for ads. Most people never scroll past the first page of results, and the top three results get most of the clicks.

## What decides ranking?

Google uses hundreds of signals, but they fall into a few groups:

- **Relevance**: does the page actually answer this search? (words, headings, topic coverage)
- **Quality and trust**: is it accurate, written by someone who knows, kept up to date? Google calls this **E-E-A-T**: experience, expertise, authoritativeness and trustworthiness.
- **Links**: do other trusted sites link to it? A link is like a recommendation letter.
- **Experience**: is it fast, mobile-friendly and safe (https)?
- **Location and personal context**: "pharmacy near me" depends on where you are.

## Search intent: why are they searching?

The same words can mean different things. Match the **intent**:

| Intent | Example | Best page |
|---|---|---|
| Informational | "how to start poultry farming" | a guide or video |
| Navigational | "cdm studio login" | the login page |
| Commercial | "best power bank 2026" | comparisons and reviews |
| Transactional | "buy power bank Abuja" | a product page with price and delivery |

Look at what already ranks for a search: Google is showing you the kind of page it believes fits the intent.

## Keyword research

A **keyword** is the phrase people type. Good keywords have enough searches, match your offer, and are not impossible to win.

- **Head terms** ("shoes") are popular but extremely competitive.
- **Long-tail keywords** ("women's flat shoes for wide feet Lagos") have fewer searches each, but the searchers know exactly what they want and convert better. Together, long-tail searches are most of all searches.

Free tools: Google's autocomplete and "People also ask", Google Search Console (your own site's real searches), Google Trends (seasonality), and Keyword Planner inside Google Ads.

## SEO takes time

SEO is like planting trees, not lighting fireworks. New pages often take weeks or months to rank. The reward is traffic that keeps coming without paying for every click.`,
      quiz: [
        { q: 'The three steps a search engine takes are…', options: ['Crawl, index, rank', 'Pay, post, promote', 'Write, share, like'], answer: 0, why: 'Discover pages, file them, then choose the best for each search.' },
        { q: '"buy power bank Abuja" has which intent?', options: ['Informational', 'Navigational', 'Transactional'], answer: 2, why: 'The person is ready to buy.' },
        { q: 'Long-tail keywords usually…', options: ['Have huge competition', 'Have fewer searches but convert better', 'Do not matter'], answer: 1, why: 'Specific searches come from people who know what they want.' },
        { q: 'A link from a trusted site to yours works like…', options: ['A recommendation', 'A penalty', 'An advert you pay for'], answer: 0, why: 'Links are a signal of trust.' },
      ],
    },
    {
      id: 'marketing-onpage',
      title: 'On-page SEO: build a page Google understands',
      minutes: 30,
      kind: 'code',
      outline: 'Title tags, meta descriptions, one clear H1, headings, image alt text and descriptive links, built in HTML.',
      body: `## The page is your shop window

On-page SEO is arranging your shop window so that both people walking past and Google's robots instantly understand what you sell. You control all of it, today, for free.

## The title tag

The \`<title>\` in the page's \`<head>\` is the blue headline in search results and the text on the browser tab. It is the single most important on-page element.

- Put the main keyword near the start.
- Keep it under about **60 characters** so it is not cut off.
- Make it specific and appealing: \`Fresh Food Delivery in Abuja in 2 Hours | Mama's Market\`.
- Every page needs a **different** title.

## The meta description

\`<meta name="description" content="…">\` is the grey text under the headline in results. It does not directly raise rankings, but a good one makes more people click. Aim for **70 to 160 characters**, describe the benefit, and include a reason to click.

## One H1, then a clear outline

The \`<h1>\` is the page's main heading, visible to readers. Use **one** per page, matching the title's topic. Then use \`<h2>\` for sections and \`<h3>\` inside them, like chapters and sub-chapters in a textbook. Headings help readers skim and help Google understand the structure.

## Images need alt text

Google cannot see pictures the way people do. The \`alt\` attribute describes the image: \`<img src="jollof.jpg" alt="Plate of jollof rice with fried plantain">\`. It also lets blind visitors using screen readers know what is there, so it is an accessibility requirement as well as an SEO one.

## Links that say where they go

"Click here" tells nobody anything. Write links that describe the destination: \`<a href="/menu">See this week's menu</a>\`. Linking between your own pages (internal links) helps Google discover them and understand which ones matter.

## Write for people first

Use the words your customers use, answer their questions fully and clearly, and never stuff the same keyword into every sentence. Google's systems are built to reward pages that people find helpful, and to demote pages written only for robots.

## Your task

Turn the starter into a well-optimised page for a food delivery business:

1. A \`<title>\` between 30 and 60 characters that includes the word \`Abuja\`.
2. A meta description between 70 and 160 characters.
3. Exactly **one** \`<h1>\`, and at least **two** \`<h2>\` sections.
4. Every image has a meaningful \`alt\` (at least 10 characters).
5. No link text says "click here", and there is at least one link.`,
      task: 'Optimise the page: title, meta description, headings, alt text and links.',
      starter: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Home</title>
</head>
<body>
  <h1>Welcome</h1>
  <h1>Our food</h1>
  <img src="https://picsum.photos/400/200" alt="">
  <p>We deliver food. <a href="#menu">Click here</a></p>
</body>
</html>
`,
      checks: [
        { label: 'title is 30 to 60 characters and mentions Abuja', test: `const t = document.title.trim(); return t.length >= 30 && t.length <= 60 && /abuja/i.test(t)` },
        { label: 'meta description is 70 to 160 characters', test: `const m = document.querySelector('meta[name="description"]'); const c = (m && m.getAttribute('content') || '').trim(); return c.length >= 70 && c.length <= 160` },
        { label: 'exactly one h1 and at least two h2', test: `return document.querySelectorAll('h1').length === 1 && document.querySelectorAll('h2').length >= 2` },
        { label: 'every image has meaningful alt text', test: `const imgs = [...document.querySelectorAll('img')]; return imgs.length > 0 && imgs.every((i) => (i.getAttribute('alt') || '').trim().length >= 10)` },
        { label: 'descriptive link text, no "click here"', test: `const a = [...document.querySelectorAll('a')]; return a.length > 0 && a.every((x) => !/click here|^here$/i.test(x.textContent.trim()) && x.textContent.trim().length >= 4)` },
      ],
      hint: 'Change the second h1 to an h2 and add another h2. Add <meta name="description" content="..."> inside the head. Count your title length.',
      solution: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Fresh Food Delivery in Abuja in 2 Hours | Mama's Market</title>
  <meta name="description" content="Order fresh groceries and home-cooked meals in Abuja and get them delivered in 2 hours. Pay on delivery or by transfer.">
</head>
<body>
  <h1>Fresh food delivered across Abuja in 2 hours</h1>
  <h2>What we deliver</h2>
  <img src="https://picsum.photos/400/200" alt="Basket of fresh tomatoes, peppers and yams">
  <p>Groceries, soups and ready meals. <a href="#menu">See this week's menu</a></p>
  <h2>How delivery works</h2>
  <p>Order before 6pm and we deliver the same day.</p>
</body>
</html>
`,
    },
    {
      id: 'marketing-technical-seo',
      title: 'Technical SEO and rich results',
      minutes: 30,
      kind: 'code',
      outline: 'Mobile viewport, language, canonical URLs, Open Graph tags for sharing, structured data (JSON-LD) and speed.',
      body: `## The plumbing behind the shop

Customers never see a building's plumbing, but if it fails, the shop closes. **Technical SEO** is the plumbing: settings that let search engines and social apps read your page correctly, and keep it fast and safe.

## Mobile first

Most people browse on phones, and Google ranks the mobile version of your site. Every page needs:

\`<meta name="viewport" content="width=device-width, initial-scale=1">\`

Without it, phones show a tiny desktop page that people pinch and abandon.

## Language and canonical URL

- \`<html lang="en">\` tells browsers and Google the language (use \`fr\`, \`ha\`, \`yo\` and so on for others).
- The same page can often be reached by several addresses (with \`?ref=whatsapp\`, with or without \`www\`). A **canonical** link names the one official address, so Google does not split its trust between copies:

\`<link rel="canonical" href="https://mamasmarket.ng/">\`

## Open Graph: how your link looks when shared

When someone pastes your link into WhatsApp, Facebook or LinkedIn, the app reads **Open Graph** tags to build the preview card:

\`\`\`html
<meta property="og:title" content="Fresh food in Abuja in 2 hours">
<meta property="og:description" content="Groceries and meals, delivered today.">
<meta property="og:image" content="https://mamasmarket.ng/share.jpg">
\`\`\`

A link with a clear picture and title gets far more clicks than a bare address. That makes these tags marketing, not just code.

## Structured data: filling in Google's form

Structured data is like filling in a standard form for Google instead of making it guess from your paragraphs. It uses the vocabulary from **schema.org**, written as JSON-LD inside a script tag:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Mama's Market",
  "telephone": "+2348000000000",
  "address": { "@type": "PostalAddress", "addressLocality": "Abuja", "addressCountry": "NG" }
}
</script>
\`\`\`

Types like \`Product\`, \`Recipe\`, \`Event\`, \`FAQPage\` and \`LocalBusiness\` can earn **rich results**: stars, prices, opening hours or questions shown right in Google. Test yours with Google's Rich Results Test.

## Speed and safety

- Compress images and give them sizes; use modern formats like WebP.
- Use **https** (a padlock): browsers warn visitors away from sites without it.
- Check your site in **Google PageSpeed Insights** and **Search Console**, which also lists pages Google could not index and why.
- A \`sitemap.xml\` lists your pages for crawlers; \`robots.txt\` tells crawlers what not to visit.

## Your task

Add the technical tags to the starter page:

1. A mobile \`viewport\` meta tag that includes \`width=device-width\`.
2. A \`lang\` attribute on the \`<html>\` tag.
3. A canonical link with an \`https://\` address.
4. Open Graph \`og:title\`, \`og:description\` and \`og:image\` tags (the image must be an https address).
5. A JSON-LD script describing a \`LocalBusiness\` with a \`name\` and an \`address\`. It must be valid JSON.`,
      task: 'Add viewport, lang, canonical, Open Graph tags and LocalBusiness structured data.',
      starter: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mama's Market: fresh food delivery in Abuja</title>
</head>
<body>
  <h1>Fresh food delivered in Abuja</h1>
</body>
</html>
`,
      checks: [
        { label: 'mobile viewport', test: `const v = document.querySelector('meta[name="viewport"]'); return !!v && /width=device-width/.test(v.getAttribute('content') || '')` },
        { label: 'page language set', test: `return (document.documentElement.getAttribute('lang') || '').length >= 2` },
        { label: 'https canonical link', test: `const c = document.querySelector('link[rel="canonical"]'); return !!c && /^https:\\/\\//.test(c.getAttribute('href') || '')` },
        { label: 'Open Graph title, description and https image', test: `const g = (p) => (document.querySelector('meta[property="og:' + p + '"]') || { getAttribute: () => '' }).getAttribute('content') || ''; return g('title').length > 0 && g('description').length > 0 && /^https:\\/\\//.test(g('image'))` },
        { label: 'valid LocalBusiness JSON-LD with name and address', test: `const s = document.querySelector('script[type="application/ld+json"]'); if (!s) return false; try { const d = JSON.parse(s.textContent); return /LocalBusiness|Restaurant|Store/.test(String(d['@type'])) && !!d.name && !!d.address } catch (e) { return false }` },
      ],
      hint: 'All of these go in the <head> except lang, which goes on the <html> tag itself: <html lang="en">.',
      solution: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mama's Market: fresh food delivery in Abuja</title>
  <link rel="canonical" href="https://mamasmarket.ng/">
  <meta property="og:title" content="Fresh food in Abuja in 2 hours">
  <meta property="og:description" content="Groceries and home-cooked meals, delivered today.">
  <meta property="og:image" content="https://mamasmarket.ng/share.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mama's Market",
    "telephone": "+2348000000000",
    "address": { "@type": "PostalAddress", "addressLocality": "Abuja", "addressCountry": "NG" }
  }
  </script>
</head>
<body>
  <h1>Fresh food delivered in Abuja</h1>
</body>
</html>
`,
    },
    {
      id: 'marketing-content',
      title: 'Content that people want',
      minutes: 30,
      kind: 'prompt',
      outline: 'Content pillars, formats, writing headlines and hooks, a content calendar, and using AI without losing your voice.',
      body: `## Content is the bait, not the hook

A fisherman chooses bait the fish actually like, not what the fisherman likes. Content marketing works the same way: create things your audience genuinely wants (answers, ideas, entertainment, inspiration), and they come to you, again and again, already trusting you before they buy.

## Content pillars

Pick 3 to 5 **pillars**: themes you will post about consistently, which connect what your audience cares about with what you sell. For a food delivery business:

1. **Quick family recipes** (helpful)
2. **Behind the scenes**: the market at 5am, the kitchen, the riders (trust)
3. **Customer stories** (social proof)
4. **Offers and new items** (selling, no more than about 1 in 5 posts)

## Formats

Short videos (Reels, TikTok, YouTube Shorts), carousels, articles and guides (great for SEO), live sessions, newsletters, podcasts, and WhatsApp status updates. Repurpose: one good guide becomes a blog post, five short videos, a carousel and an email.

## Hooks and headlines

People decide in about two seconds whether to keep reading or scrolling. Strong hooks:

- **A specific benefit**: "Dinner in 15 minutes with 5 ingredients"
- **A question they are asking**: "Is it cheaper to cook or order in Abuja?"
- **A surprising fact**: "Most food waste happens in the fridge, not the plate"
- **A story**: "Our rider got stuck in the rain, and the customer did this…"

## E-E-A-T and helpfulness

Google rewards content showing real **experience** and **expertise**: original photos, real numbers, first-hand tips, a named author. A recipe from a cook who explains what went wrong the first time beats a generic list copied from elsewhere.

## A content calendar

Plan a month ahead in a simple table: date, pillar, format, channel, hook, call to action, status. Consistency beats bursts of activity. (CDM Social can plan and draft this calendar with AI, with you approving each post.)

## AI as an assistant, not the author

AI can brainstorm ideas, draft outlines, suggest hooks and adapt one piece for different channels. Always add your own experience, check every fact, keep your brand voice, and never pretend AI images are real photos of your products or customers.

## Practise

Use the tutor to build pillars and a two-week calendar.`,
      practice: 'Tell the tutor about a business and its audience (or use your persona from lesson 2). Ask it to propose 4 content pillars, then a 2-week content calendar as a table with date, pillar, format, channel, hook and call to action. Then pick one post and ask for 5 alternative hooks, and ask which one fits a beginner audience best and why.',
    },
    {
      id: 'marketing-social',
      title: 'Social media marketing',
      minutes: 30,
      kind: 'read',
      outline: 'Choosing platforms, organic versus paid, algorithms, engagement, community management and handling complaints.',
      body: `## Go where your customers already are

Opening a shop in an empty street is a mistake, however beautiful the shop. Choose platforms by where **your** audience spends time:

| Platform | Strong for |
|---|---|
| Instagram | visual products, food, fashion, beauty, lifestyle |
| Facebook | broad reach, groups, older audiences, local communities, Marketplace |
| TikTok | short entertaining video, younger audiences, discovery |
| LinkedIn | business-to-business, recruitment, professional services |
| X (Twitter) | news, opinions, tech, customer service |
| YouTube | tutorials, reviews, long-form trust, search |
| WhatsApp | direct conversations, status updates, orders and support |

It is better to do two platforms well than six badly.

## How feeds decide what people see

Each platform's **algorithm** predicts what a person will enjoy and shows them that. It watches signals like watch time, saves, shares, comments and how quickly people engage after you post. You cannot trick it for long. What works: content people stop for, finish, and share.

## Organic and paid

- **Organic** posts are free but reach only part of your followers.
- **Paid** (boosted posts and ads) reaches exactly the audience you choose, at a cost (lesson 9).

A healthy approach: use organic posting to learn what people love, then put money behind the posts that already perform.

## Engagement and community

Social media is a conversation, not a billboard. Reply to comments and messages quickly, ask questions, share customer posts (with permission), and thank people. A business that answers in minutes wins trust that adverts cannot buy.

## Handling complaints in public

1. Respond fast and politely, even when the customer is rude.
2. Acknowledge the problem; do not argue.
3. Move details to a private message (phone numbers and order numbers stay out of public comments).
4. Fix it, then follow up publicly if appropriate.

Other potential customers are watching how you treat people. A well-handled complaint can win more customers than a hundred adverts.

## What to measure

Reach (how many saw it), engagement rate (interactions divided by reach), clicks, followers gained, and most importantly, **enquiries and sales** that came from social media. Likes feel good; sales pay salaries.

## Consistency and approvals

Post on a predictable schedule, keep brand colours and voice consistent, and for teams, have someone approve posts before they go out. One careless post can damage a brand for years.`,
      quiz: [
        { q: 'The best way to pick social platforms is…', options: ['Use every platform', 'Go where your audience already spends time', 'Only use the newest app'], answer: 1, why: 'Two platforms done well beat six done badly.' },
        { q: 'A customer complains angrily in the comments. First you should…', options: ['Delete the comment', 'Reply quickly and politely, then move details to a private message', 'Argue to defend the brand'], answer: 1, why: 'Others are watching how you treat people.' },
        { q: 'Engagement rate is…', options: ['Followers divided by posts', 'Interactions divided by reach', 'Money spent per post'], answer: 1, why: 'It shows how many who saw it interacted.' },
        { q: 'A sensible way to use paid promotion is to…', options: ['Boost posts that already perform well organically', 'Boost every post', 'Only boost posts nobody liked'], answer: 0, why: 'Organic results show what people love.' },
      ],
    },
    {
      id: 'marketing-email',
      title: 'Email and WhatsApp marketing',
      minutes: 30,
      kind: 'read',
      outline: 'Owning your audience, consent and data protection, list building, subject lines, segmentation and automated journeys.',
      body: `## Rented land and owned land

Your social media followers live on rented land: the platform can change the rules or close your account tomorrow. Your **email list** and **WhatsApp contacts** (with permission) are owned land: you can reach those people directly, for years. Smart businesses use social media to bring people onto their owned land.

## Consent comes first

Sending marketing messages to people who did not agree is spam, it damages your reputation, and in many countries it breaks the law.

- **Nigeria**: the Nigeria Data Protection Act (NDPA 2023) requires a lawful basis, such as clear consent, for using personal data.
- **Europe and the UK**: GDPR and PECR require clear opt-in for marketing emails.
- **United States**: CAN-SPAM requires an easy unsubscribe link and your real business address.

Good practice everywhere: ask clearly, say what you will send and how often, make unsubscribing easy, and keep contact data secure. Never buy email lists.

## Building a list

Offer something genuinely useful in exchange for an email address or WhatsApp opt-in: a discount on the first order, a free guide, early access to new products, or a weekly price list. Put the sign-up on your website, in your social bio, at the till and on receipts.

## Writing emails that get opened

- **Subject line**: short, specific and honest. "Your weekend menu: 3 new soups" beats "Newsletter #14". Never mislead; it destroys trust.
- **Preview text**: the line shown after the subject. Use it to add a reason to open.
- **One main message and one clear button** per email.
- **Mobile friendly**: short paragraphs, big buttons.
- **From a person**: "Ada from Mama's Market" feels more human than "noreply".

## Segmentation

Not everyone wants the same message. Split your list into **segments**: new subscribers, regular customers, people who have not bought for 90 days, people in different cities. A message that fits the reader gets far better results than one blast to everyone.

## Automated journeys

Some emails should send themselves when something happens:

1. **Welcome series** when someone subscribes (introduce yourself, best products, a first-order offer).
2. **Abandoned cart** reminder when someone leaves items in the basket.
3. **Thank you and review request** after a purchase.
4. **Win-back** for customers who have gone quiet.

## WhatsApp Business

WhatsApp Business gives you a business profile, a catalogue, quick replies, labels for customers and broadcast lists (people only receive broadcasts if they saved your number). The WhatsApp Business Platform (API) adds approved message templates and automation for larger businesses. Keep messages personal and useful; too many broadcasts and people block you.

## Measure

Open rate, click rate, unsubscribes, and above all, sales per email sent.`,
      quiz: [
        { q: 'Why build an email list when you have social followers?', options: ['Email is owned: you can reach people directly even if a platform changes its rules', 'Emails are always free to send to anyone', 'Social media is illegal'], answer: 0, why: 'Followers live on rented land.' },
        { q: 'Before sending marketing emails you need…', options: ['A bought list', 'Clear consent and an easy way to unsubscribe', 'Nothing'], answer: 1, why: 'Consent is required by law in many countries and builds trust.' },
        { q: 'An abandoned cart email is an example of…', options: ['An automated journey', 'A newsletter', 'Spam'], answer: 0, why: 'It sends itself when the event happens.' },
        { q: 'Segmentation means…', options: ['Sending the same message to everyone', 'Splitting the list so each group gets messages that fit', 'Deleting subscribers'], answer: 1, why: 'Relevant messages perform better.' },
      ],
    },
    {
      id: 'marketing-ads',
      title: 'Paid ads: Google and Meta',
      minutes: 35,
      kind: 'read',
      outline: 'Search versus social ads, targeting, budgets and bidding, ad copy, landing pages and the key ad metrics.',
      body: `## Ads are rented attention

SEO and organic posting are like growing your own vegetables: cheap, slow, lasting. Ads are like buying vegetables at the market: instant, but you pay every time. Both have a place. The goal of advertising is simple: **every naira or dollar spent should bring back more than it cost.**

## Two kinds of ads

- **Search ads (Google Ads, Bing)** appear when people search. They catch **existing demand**: someone typing "emergency plumber Wuse" wants a plumber now. You pay per click (PPC).
- **Social ads (Meta: Facebook and Instagram; TikTok; LinkedIn)** appear in feeds. They **create demand** by showing your product to people who match an audience, before they were searching. You usually pay per thousand views (CPM) or per result.

## Targeting

- Search: choose **keywords** and match types, add **negative keywords** to avoid wasted clicks ("free", "jobs", "how to make").
- Social: choose location, age, interests and behaviours, **lookalike** audiences (people similar to your customers), and **retargeting** (people who visited your site or engaged with you, who are much more likely to buy).

## Budgets and bidding

Set a daily budget you can afford to lose while learning. Start small, test, then increase spending on what works. Platforms offer automatic bidding toward a goal (clicks, leads, purchases); they need conversion tracking to learn.

## The key metrics

| Metric | Formula | Tells you |
|---|---|---|
| CTR (click-through rate) | clicks ÷ impressions | is the ad interesting? |
| CPC (cost per click) | cost ÷ clicks | how expensive is traffic? |
| CPM | cost ÷ impressions × 1000 | cost of attention |
| Conversion rate | conversions ÷ clicks | does the landing page persuade? |
| CPA (cost per acquisition) | cost ÷ conversions | what does one customer cost? |
| ROAS (return on ad spend) | revenue ÷ cost | money back per unit spent |

Example: you spend ₦50,000, get 20,000 impressions, 400 clicks and 20 sales worth ₦200,000. CTR = 2%, CPC = ₦125, conversion rate = 5%, CPA = ₦2,500, ROAS = 4 (₦4 back for every ₦1).

Always compare CPA with your **profit** per sale, not the price. If each sale makes ₦2,000 profit and CPA is ₦2,500, you are paying to lose money.

## Ad copy and the landing page

An ad makes a promise; the landing page must keep it. If the ad says "50% off power banks", the click must land on the power banks with the discount visible, not on the home page. Most wasted ad money is lost on poor landing pages, not poor ads.

## Testing

Run **A/B tests**: change one thing (headline, image, audience), keep everything else the same, and let the numbers decide. Give tests enough time and data before choosing a winner.

## Rules

Ads must be honest and follow platform policies and local law (for example, Nigeria's advertising regulator ARCON requires approval for some ads; financial, health and political ads have extra rules in most countries). Misleading ads get accounts banned.`,
      quiz: [
        { q: 'Search ads are best at…', options: ['Catching people already searching for what you sell', 'Making viral videos', 'Building an email list'], answer: 0, why: 'They match existing demand.' },
        { q: '₦30,000 spent brings 10 sales. The CPA is…', options: ['₦300', '₦3,000', '₦30,000'], answer: 1, why: '30,000 ÷ 10.' },
        { q: 'Ads cost ₦50,000 and bring ₦150,000 in sales. ROAS is…', options: ['0.33', '3', '100,000'], answer: 1, why: 'Revenue divided by cost.' },
        { q: 'An ad for discounted power banks should link to…', options: ['The home page', 'The power bank page showing the discount', 'The contact page'], answer: 1, why: 'The landing page must keep the ad\'s promise.' },
      ],
    },
    {
      id: 'marketing-metrics',
      title: 'Measure what works',
      minutes: 35,
      kind: 'code',
      outline: 'Build a campaign calculator in JavaScript: CTR, CPA, ROAS and break-even, plus UTM tracking links.',
      body: `## If you cannot measure it, you are guessing

A doctor does not prescribe without checking the temperature. A marketer should not spend without checking the numbers. In this lesson you will build the calculations every campaign report needs, and the tracking links that tell you where customers came from.

## UTM links: labels on your links

When someone arrives on your website, your analytics tool (like Google Analytics) wants to know where they came from. **UTM parameters** are labels you add to the end of a link:

\`\`\`
https://mamasmarket.ng/menu?utm_source=instagram&utm_medium=social&utm_campaign=december_promo
\`\`\`

- \`utm_source\`: the site or platform (instagram, newsletter, whatsapp)
- \`utm_medium\`: the type of channel (social, email, cpc, referral)
- \`utm_campaign\`: the campaign name

Use lowercase and the same spelling every time, or your reports split "Instagram" and "instagram" into two sources. Spaces and special characters must be **encoded** for URLs, which JavaScript's \`URL\` and \`URLSearchParams\` do for you.

## Attribution

A customer may see an Instagram post, search on Google a week later, then buy after an email. Which channel gets credit? "Last click" gives it all to the email. Other models share credit. Understand that every model simplifies reality, and look at trends rather than arguing about single numbers.

## Break-even CPA

The most important number in paid marketing: **how much can you afford to pay for one customer?** If a sale makes ₦4,000 profit, your CPA must stay below ₦4,000, or you lose money on every sale (unless repeat purchases make up for it, which is called **customer lifetime value**).

## Your task

In the \`<script>\` write:

1. \`ctr(clicks, impressions)\`: the click-through rate as a **percentage** rounded to 2 decimals. Return \`0\` when impressions is 0.
2. \`cpa(cost, conversions)\`: cost per conversion rounded to 2 decimals, or \`null\` when there are no conversions.
3. \`roas(revenue, cost)\`: revenue divided by cost, rounded to 2 decimals (\`0\` when cost is 0).
4. \`profitable(campaign, profitPerSale)\`: campaign is \`{ cost, conversions }\`. Return \`true\` when the CPA is below the profit per sale.
5. \`utmLink(url, source, medium, campaign)\`: add the three UTM parameters to the URL, converted to **lowercase** with spaces replaced by \`_\`. Keep any parameters the URL already has. Use \`new URL(url)\` and \`searchParams.set\`.`,
      task: 'Write ctr, cpa, roas, profitable and utmLink.',
      starter: `<h1>Campaign calculator</h1>
<script>
  function ctr(clicks, impressions) {
  }
  function cpa(cost, conversions) {
  }
  function roas(revenue, cost) {
  }
  function profitable(campaign, profitPerSale) {
  }
  function utmLink(url, source, medium, campaign) {
  }
</script>
`,
      checks: [
        { label: 'ctr as a percentage', test: `return ctr(400, 20000) === 2 && ctr(1, 3) === 33.33 && ctr(5, 0) === 0` },
        { label: 'cpa, and null with no conversions', test: `return cpa(50000, 20) === 2500 && cpa(100, 3) === 33.33 && cpa(100, 0) === null` },
        { label: 'roas', test: `return roas(200000, 50000) === 4 && roas(10, 3) === 3.33 && roas(10, 0) === 0` },
        { label: 'profitable compares CPA with profit per sale', test: `return profitable({ cost: 50000, conversions: 20 }, 4000) === true && profitable({ cost: 50000, conversions: 20 }, 2000) === false && profitable({ cost: 1000, conversions: 0 }, 5000) === false` },
        { label: 'utmLink adds tidy UTM parameters', test: `const u = new URL(utmLink('https://shop.ng/menu?item=rice', 'Instagram', 'Social', 'December Promo')); return u.searchParams.get('item') === 'rice' && u.searchParams.get('utm_source') === 'instagram' && u.searchParams.get('utm_medium') === 'social' && u.searchParams.get('utm_campaign') === 'december_promo'` },
      ],
      hint: 'Round with Math.round(x * 100) / 100. For utmLink: const u = new URL(url); const tidy = (s) => s.trim().toLowerCase().replace(/\\s+/g, "_"); u.searchParams.set("utm_source", tidy(source)) … return u.toString()',
      solution: `<h1>Campaign calculator</h1>
<script>
  const r2 = (x) => Math.round(x * 100) / 100
  function ctr(clicks, impressions) { return impressions ? r2(clicks / impressions * 100) : 0 }
  function cpa(cost, conversions) { return conversions ? r2(cost / conversions) : null }
  function roas(revenue, cost) { return cost ? r2(revenue / cost) : 0 }
  function profitable(campaign, profitPerSale) {
    const c = cpa(campaign.cost, campaign.conversions)
    return c !== null && c < profitPerSale
  }
  function utmLink(url, source, medium, campaign) {
    const u = new URL(url)
    const tidy = (s) => String(s).trim().toLowerCase().replace(/\\s+/g, '_')
    u.searchParams.set('utm_source', tidy(source))
    u.searchParams.set('utm_medium', tidy(medium))
    u.searchParams.set('utm_campaign', tidy(campaign))
    return u.toString()
  }
</script>
`,
    },
    {
      id: 'marketing-local',
      title: 'Local SEO, reviews and influencers',
      minutes: 30,
      kind: 'read',
      outline: 'Google Business Profile, maps rankings, reviews and how to answer them, influencer marketing and honest disclosure.',
      body: `## "Near me" is a goldmine

Searches like "pharmacy near me", "best suya in Wuse" or "car wash open now" come from people ready to act, often within the hour. For local businesses, the map results at the top of Google matter more than anything else.

## Google Business Profile

A free Google Business Profile is your shop's sign on Google Search and Maps. Set it up properly:

- Exact business name (no keyword stuffing), category, address or service area, phone, website and **opening hours**, including holidays.
- Real photos of the outside (so people find you), inside, products and team. Profiles with photos get many more requests for directions.
- Products, services and posts (offers, events, news).
- Answer the questions people ask on the profile.

Keep your name, address and phone **identical** everywhere online (website, Facebook, directories). Inconsistent details confuse both people and Google.

Local ranking depends mainly on **relevance** (does your profile match the search?), **distance** and **prominence** (reviews, links, how well-known you are).

## Reviews: word of mouth at scale

Most people read reviews before choosing a local business. Reviews are like a crowd outside a restaurant: people trust a busy place.

- **Ask** every happy customer: a QR code at the till, a link in the thank-you message. Ask soon after a good experience.
- **Never** buy reviews, write fake ones or offer rewards only for positive reviews. It breaks Google's rules and consumer laws in many countries, and fake reviews are increasingly detected and removed.
- **Reply to every review**, good and bad. Thank people by name. For negative reviews: apologise for the experience, avoid arguing, offer to fix it offline, and keep private details out.

## Influencer marketing

Influencers are people whose followers trust their recommendations. Small "micro-influencers" (a few thousand engaged local followers) often bring better results per naira than celebrities.

- Choose by **fit and engagement**, not follower count. Check that followers are real and in your market.
- Agree in writing: what they will post, when, usage rights, payment, and how you will track results (a unique discount code or UTM link).
- **Disclosure is required**: paid or gifted posts must be clearly labelled (#ad, "paid partnership"). Regulators such as the US FTC, the UK ASA and Nigeria's ARCON and consumer protection rules expect honest disclosure, and so do audiences.

## Partnerships

Team up with businesses that serve the same customers but do not compete: a gym and a healthy meal service, a wedding planner and a photographer. Share each other's audiences with joint offers.`,
      quiz: [
        { q: 'For a local business, the most important free listing is…', options: ['Google Business Profile', 'A paid billboard', 'A press release'], answer: 0, why: 'It powers the map results for "near me" searches.' },
        { q: 'The right response to a negative review is…', options: ['Ignore it', 'Apologise, avoid arguing and offer to fix it offline', 'Post a fake positive review to balance it'], answer: 1, why: 'Others judge you by how you respond.' },
        { q: 'A paid influencer post must…', options: ['Hide that it is paid', 'Be clearly labelled as an ad or partnership', 'Only show products'], answer: 1, why: 'Disclosure is a legal and trust requirement.' },
        { q: 'When choosing influencers, focus on…', options: ['Follower count only', 'Fit with your audience and real engagement', 'Who is cheapest'], answer: 1, why: 'Engaged, relevant audiences convert.' },
      ],
    },
    {
      id: 'marketing-plan',
      title: 'Your marketing plan and career',
      minutes: 30,
      kind: 'prompt',
      outline: 'Goals and KPIs, budget split, a 90-day plan, testing and reporting, plus certifications, portfolio and freelancing.',
      body: `## A plan turns activity into results

Posting every day without a plan is like driving fast without a destination: lots of fuel, no arrival. A simple marketing plan answers five questions:

1. **Where are we now?** Current sales, channels, what works, what customers say.
2. **Where do we want to be?** A **SMART goal**: specific, measurable, achievable, relevant, time-bound. *"Get 60 new paying customers a month from online channels by the end of March"*, not *"grow on social media"*.
3. **Who are we talking to?** Your persona and positioning (lesson 2).
4. **How will we get there?** Channels, content pillars, offers and a budget.
5. **How will we know?** KPIs (key performance indicators) checked every week.

## Choosing KPIs

Pick a few numbers that connect to money: enquiries, sales, cost per acquisition, ROAS, returning customers. Supporting numbers (reach, engagement, website visits, email sign-ups) explain *why* the main numbers move.

## Budget

A common starting approach: spend most of a small budget on what already works, some on promising experiments, and a little on bold tests (a 70 / 20 / 10 split). Keep enough to run tests long enough to learn.

## The 90-day rhythm

- **Days 1 to 30**: fix the foundations (Google Business Profile, website basics and SEO, tracking, a sign-up offer), start consistent content.
- **Days 31 to 60**: test ads with small budgets, start email or WhatsApp journeys, collect reviews.
- **Days 61 to 90**: double down on the winners, cut the losers, write down what you learned.

Review every week: what did we do, what happened, what will we change?

## Reporting

A good report leads with the result and the decision: *"Instagram ads brought 34 orders at ₦1,900 each, below our ₦3,000 limit. Recommendation: increase the budget by 30% next month."* Not 20 screenshots of charts.

## Careers and earning

- **Certifications** (free or low cost): Google Digital Garage and Google Skillshop (Google Ads, Analytics), Meta Blueprint, HubSpot Academy (inbound, content and email marketing), Semrush Academy (SEO).
- **Portfolio**: real results for real businesses. Start with a family business, a church, a friend's shop: document the before, what you did and the after. Your final project in this course is a portfolio piece.
- **Freelancing**: small businesses everywhere need help with Google Business Profiles, social media management, ads and SEO. Package your service clearly, with a monthly price and a report.
- **Jobs**: digital marketing executive, social media manager, SEO specialist, paid media specialist, content marketer, marketing analyst.

## Practise

Use the tutor to draft a 90-day plan.`,
      practice: 'Tell the tutor about a real business and its current situation. Ask it to help you write a one-page 90-day marketing plan: a SMART goal, the persona in two lines, 3 channels with reasons, a budget split, a week-by-week outline for the first month, and 4 KPIs with targets. Then ask it to play a sceptical business owner and challenge your plan with 3 tough questions.',
    },
  ],
  project: {
    title: 'Launch page and 30-day marketing plan',
    lang: 'html',
    brief: `Pick a real business (yours, a family business, a church, a school, a friend's shop) and build its **launch page** in CDM Studio, then put a **30-day marketing plan** on a second section of the same page (or the bottom of it).

**The launch page** must be search-friendly and persuasive: a clear value proposition, what you sell, proof (reviews, numbers or photos), and one clear call to action (WhatsApp, call, order or sign-up).

**The plan** must include: the target persona, a SMART goal, 3 channels with reasons, a content calendar for at least 2 weeks, a budget, the KPIs you will track, and UTM links for at least two channels.

Build it as a Studio project (use the AI builder if you like, but make sure the words and the plan are yours and specific to the business), then choose it below.`,
    rubric: [
      'Has a clear, specific value proposition near the top that names the audience and benefit',
      'Has a descriptive title tag and a meta description written for search',
      'Uses one h1, a logical heading structure and alt text on images',
      'Includes mobile viewport and Open Graph tags for sharing',
      'Shows proof or trust (reviews, numbers, photos or guarantees) and one clear call to action',
      'Describes a target persona and a SMART goal',
      'Chooses 3 channels with reasons and a content calendar covering at least 2 weeks',
      'States a budget and KPIs with targets, including cost per acquisition or ROAS',
      'Includes correctly built UTM links for at least two channels',
      'Content is specific to a real business rather than generic filler',
    ],
  },
  exam: [
    { q: 'Marketing is best described as…', options: ['Posting adverts everywhere', 'Finding people with a problem you solve and helping them choose you', 'Only selling', 'Making a logo'], answer: 1, why: 'Selling is the last step of marketing.' },
    { q: 'Which is a well-formed value proposition?', options: ['"We are the best"', '"For busy parents in Abuja, fresh food delivered in 2 hours, so dinner is never a crisis"', '"Quality products at good prices"', '"Since 2010"'], answer: 1, why: 'It names who, the problem, the benefit and the difference.' },
    { q: 'A persona should be based on…', options: ['Guesses in a meeting', 'Real research with customers and data', 'Competitors\' adverts only', 'Celebrity followers'], answer: 1, why: 'A persona summarises evidence.' },
    { q: 'Search engines work by…', options: ['Crawling, indexing and ranking pages', 'Ranking whoever pays most for organic results', 'Reading only titles', 'Asking users to vote'], answer: 0, why: 'Organic results are not bought.' },
    { q: '"how to start poultry farming" is which intent?', options: ['Transactional', 'Informational', 'Navigational', 'Local'], answer: 1, why: 'The person wants to learn.' },
    { q: 'The single most important on-page SEO element is usually…', options: ['The footer', 'The title tag', 'The font', 'The favicon'], answer: 1, why: 'It is the headline in search results.' },
    { q: 'Image alt text helps…', options: ['Only design', 'Search engines and blind visitors understand images', 'Images load faster', 'Nothing'], answer: 1, why: 'It is SEO and accessibility.' },
    { q: 'Open Graph tags control…', options: ['How your link looks when shared on WhatsApp, Facebook or LinkedIn', 'Your Google ranking directly', 'Page speed', 'Your password'], answer: 0, why: 'They build the preview card.' },
    { q: 'Structured data (JSON-LD with schema.org) can earn…', options: ['Rich results like stars, prices or hours in search', 'Free ads', 'More followers', 'A padlock'], answer: 0, why: 'It tells Google facts in a standard format.' },
    { q: 'A canonical link tells search engines…', options: ['The official address of a page that exists at several URLs', 'Your phone number', 'Which ads to show', 'The page language'], answer: 0, why: 'It stops trust being split between copies.' },
    { q: 'Content pillars are…', options: ['3 to 5 themes you post about consistently', 'Expensive adverts', 'Website columns', 'Influencers'], answer: 0, why: 'They connect audience interests with your business.' },
    { q: 'An email list is valuable because…', options: ['You own the direct connection to people who opted in', 'It is free to email anyone', 'It replaces a website', 'Platforms require it'], answer: 0, why: 'Social followers are on rented land.' },
    { q: 'Which is required before sending marketing emails in most countries?', options: ['Clear consent and an easy unsubscribe', 'A bought list', 'A paid plan', 'A logo'], answer: 0, why: 'Laws like NDPA and GDPR require a lawful basis.' },
    { q: 'You spend $200 and get 8 customers. The CPA is…', options: ['$8', '$25', '$1,600', '$200'], answer: 1, why: '200 ÷ 8.' },
    { q: '20,000 impressions and 300 clicks give a CTR of…', options: ['0.15%', '1.5%', '15%', '3%'], answer: 1, why: '300 ÷ 20,000 = 1.5%.' },
    { q: 'Ads cost ₦100,000 and produce ₦350,000 in sales. ROAS is…', options: ['3.5', '0.29', '250,000', '35%'], answer: 0, why: 'Revenue divided by cost.' },
    { q: 'Profit per sale is ₦3,000 and your CPA is ₦4,000. You are…', options: ['Making money on each sale', 'Losing money on each first sale', 'Breaking even', 'Unable to tell'], answer: 1, why: 'Compare CPA with profit, not price.' },
    { q: 'UTM parameters are used to…', options: ['Track which source, medium and campaign brought visitors', 'Speed up websites', 'Encrypt links', 'Rank higher'], answer: 0, why: 'They label links for analytics.' },
    { q: 'An A/B test should change…', options: ['Everything at once', 'One thing at a time', 'Nothing', 'Only the budget'], answer: 1, why: 'Otherwise you cannot tell what caused the difference.' },
    { q: 'Which review practice is acceptable?', options: ['Buying reviews', 'Writing your own reviews', 'Asking happy customers for honest reviews', 'Rewarding only 5-star reviews'], answer: 2, why: 'Fake or incentivised positive reviews break rules and laws.' },
    { q: 'A paid influencer post should be…', options: ['Clearly disclosed as an ad or partnership', 'Hidden as a normal post', 'Deleted after a day', 'Posted only on Sunday'], answer: 0, why: 'Disclosure is expected by law and by audiences.' },
    { q: 'A SMART goal is…', options: ['"Grow on social media"', '"Get 60 new paying customers a month from online channels by 31 March"', '"Be famous"', '"Post every day"'], answer: 1, why: 'Specific, measurable, achievable, relevant and time-bound.' },
  ],
}
