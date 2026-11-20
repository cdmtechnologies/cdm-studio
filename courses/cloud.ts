import type { Course } from './types'

export const cloud: Course = {
  id: 'cloud',
  title: 'Cloud and DevOps essentials',
  blurb: 'How modern apps are hosted, deployed and kept running: cloud services, Git, CI/CD, containers, monitoring and cost control.',
  emoji: '☁️',
  colour: 'sky',
  level: 'Beginner',
  hours: 8,
  free: 2,
  skills: ['Cloud service models (IaaS, PaaS, SaaS)', 'Git and version control', 'CI/CD pipelines', 'Containers and Docker', 'Configuration and secrets', 'Monitoring, logs and uptime', 'Cloud cost control'],
  careers: ['Cloud support associate', 'Junior DevOps engineer', 'Site reliability (entry)', 'IT administrator'],
  lessons: [
    {
      id: 'cloud-basics',
      title: 'What "the cloud" really is',
      minutes: 15,
      kind: 'read',
      outline: 'Data centres, regions, IaaS/PaaS/SaaS and the shared responsibility model.',
      body: `## Someone else's computers, rented by the minute

"The cloud" is large data centres run by companies such as **Amazon Web Services (AWS)**, **Microsoft Azure** and **Google Cloud**, plus many smaller providers. Instead of buying servers, you rent computing, storage and services and pay for what you use.

Why businesses use it:

- **No big upfront cost**: start small, grow when customers grow
- **Scale**: handle a Black Friday rush, then scale back down
- **Reliability**: data copied across buildings and cities
- **Speed**: a new server or database in minutes, not weeks

## Regions and availability zones

Providers group data centres into **regions** (for example Europe-West, South Africa, US-East), each with several **availability zones** (separate buildings with their own power). Pick a region close to your users for speed, and consider where data must live by law (Nigeria's NDPA has rules on transferring personal data abroad).

## Service models

- **IaaS** (infrastructure): you rent virtual machines and manage the operating system yourself. *AWS EC2, Azure VMs.*
- **PaaS** (platform): you give your code; the provider runs it. *Netlify, Vercel, Heroku, Supabase, Google App Engine.*
- **SaaS** (software): you just use the app. *Gmail, Microsoft 365, CDM ERP.*
- **Serverless / functions**: small pieces of code that run on demand and cost nothing when idle. *Supabase Edge Functions, AWS Lambda.* CDM Studio's AI builder runs this way.

## Shared responsibility

The provider secures the buildings, hardware and its platform. **You** remain responsible for your accounts, passwords, access rights, data, and how you configure services. Most cloud breaches come from **customer mistakes**: a public storage bucket, a leaked key, an admin account without two-step sign-in.`,
      quiz: [
        { q: 'You upload code and the provider runs it without you managing servers. This is…', options: ['IaaS', 'PaaS', 'On-premises'], answer: 1, why: 'Platform as a service.' },
        { q: 'Who is responsible for a storage bucket you left public?', options: ['The cloud provider', 'You, the customer', 'Nobody'], answer: 1, why: 'Configuration is the customer\'s side of shared responsibility.' },
        { q: 'Why choose a region close to your users?', options: ['Lower latency (faster responses) and data rules', 'It is always cheaper', 'It is required for HTML'], answer: 0, why: 'Distance adds delay; laws may restrict data location.' },
      ],
    },
    {
      id: 'cloud-git',
      title: 'Git and version control',
      minutes: 25,
      kind: 'read',
      outline: 'Commits, branches, pull requests and the workflow every tech team uses.',
      body: `## Never lose work again

**Git** records every change to your project as a **commit** (a snapshot with a message). You can see who changed what and why, and go back to any earlier version. **GitHub**, **GitLab** and **Bitbucket** host Git repositories online and add collaboration tools.

## The core commands

\`\`\`bash
git clone https://github.com/you/shop.git   # copy a repository to your computer
git status                                   # what changed?
git add index.html                           # choose changes for the next commit
git commit -m "Add WhatsApp order button"   # save a snapshot with a clear message
git push                                     # send commits to GitHub
git pull                                     # get others' commits
\`\`\`

## Branches and pull requests

A **branch** is a separate line of work. The team keeps \`main\` working at all times:

1. Create a branch: \`git switch -c add-delivery-fee\`
2. Commit your changes there
3. Push and open a **pull request (PR)**: teammates review, automated tests run
4. **Merge** into main when approved

If two people change the same lines, Git reports a **merge conflict**; you choose the correct version and commit.

## Good habits

- Small commits with messages that say **why**: *"Fix VAT rounding on receipts"*, not *"update"*
- Never commit secrets (API keys, passwords, \`.env\` files). Use a \`.gitignore\` and the platform's secret store. If a key is ever pushed, **rotate it** (make a new one): deleting the commit is not enough, history keeps it.
- Protect \`main\`: require reviews and passing tests before merging

## Where you have seen this

CDM's own products are built this way: each change is a branch and a pull request, tests run on GitHub, and merging deploys the site.`,
      quiz: [
        { q: 'A commit is…', options: ['A saved snapshot of changes with a message', 'A web server', 'A password'], answer: 0, why: 'Commits are Git\'s history.' },
        { q: 'You accidentally pushed an API key to GitHub. The right fix is…', options: ['Delete the file and push again', 'Rotate (replace) the key, then remove it from the code', 'Make the repo private and forget it'], answer: 1, why: 'History keeps the old key; it must be replaced.' },
        { q: 'Why work on a branch and open a pull request?', options: ['To keep main working while changes are reviewed and tested', 'Branches are faster', 'GitHub charges less'], answer: 0, why: 'Review and tests protect main.' },
      ],
    },
    {
      id: 'cloud-cicd',
      title: 'CI/CD: automatic tests and deployment',
      minutes: 25,
      kind: 'code',
      outline: 'How pipelines work, and write a pipeline runner that stops at the first failing step.',
      body: `## Continuous integration and continuous delivery

- **CI**: every push runs automated checks (install, lint, tests, build). Problems are found in minutes, not by customers.
- **CD**: when checks pass on main, the app is deployed automatically (to a test environment, then production).

A pipeline is an ordered list of **steps**, often grouped in **jobs** that can depend on each other. If a step fails, the pipeline stops and nothing broken is deployed. CDM Studio itself deploys like this: tests, then the database, then server functions, then the website.

A GitHub Actions file looks like:

\`\`\`yaml
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
\`\`\`

## Your task: a tiny pipeline runner

\`run(steps)\` gets an array of \`{ name, run }\` where \`run()\` returns true (pass) or false (fail), or throws.

- Run steps **in order**; stop at the first failure (false or an error).
- Return \`{ ok, ran, failed }\`: \`ran\` lists the names of steps that were run, \`failed\` is the failing step's name (or null).

Then \`order(jobs)\`: \`jobs\` is an object like \`{ test: [], deploy: ['test'], build: ['test'] }\` mapping each job to the jobs it needs. Return a list of job names where every job comes after all its needs (keep the object's order when there is a choice). If there is a cycle, throw an Error.`,
      task: 'Write run(steps) and order(jobs).',
      starter: `<script>
  function run(steps) {
  }
  function order(jobs) {
  }
</script>
`,
      checks: [
        { label: 'all steps pass', test: `const r = run([{ name: 'install', run: () => true }, { name: 'test', run: () => true }]); return r.ok && r.ran.join() === 'install,test' && r.failed === null` },
        { label: 'stops at the first failure', test: `const r = run([{ name: 'install', run: () => true }, { name: 'test', run: () => false }, { name: 'deploy', run: () => true }]); return !r.ok && r.ran.join() === 'install,test' && r.failed === 'test'` },
        { label: 'a thrown error is a failure', test: `const r = run([{ name: 'build', run: () => { throw new Error('x') } }, { name: 'deploy', run: () => true }]); return !r.ok && r.failed === 'build' && r.ran.length === 1` },
        { label: 'jobs come after their needs', test: `const o = order({ deploy: ['build', 'test'], build: ['test'], test: [] }); return o.join() === 'test,build,deploy'` },
        { label: 'cycles are refused', test: `try { order({ a: ['b'], b: ['a'] }); return false } catch { return true }` },
      ],
      hint: "order: const out = []; while (out.length < names.length) { const next = names.find(n => !out.includes(n) && jobs[n].every(d => out.includes(d))); if (!next) throw new Error('cycle'); out.push(next) }",
      solution: `<script>
  function run(steps) {
    const ran = []
    for (const s of steps) {
      ran.push(s.name)
      let ok = false
      try { ok = s.run() === true } catch { ok = false }
      if (!ok) return { ok: false, ran, failed: s.name }
    }
    return { ok: true, ran, failed: null }
  }
  function order(jobs) {
    const names = Object.keys(jobs), out = []
    while (out.length < names.length) {
      const next = names.find((n) => !out.includes(n) && jobs[n].every((d) => out.includes(d)))
      if (!next) throw new Error('cycle')
      out.push(next)
    }
    return out
  }
</script>`,
    },
    {
      id: 'cloud-containers',
      title: 'Containers, Docker and Kubernetes',
      minutes: 20,
      kind: 'read',
      outline: 'Why containers exist, images vs containers, a Dockerfile explained, and what Kubernetes adds.',
      body: `## "It works on my computer"

Apps depend on a specific operating system, language version and libraries. A **container** packages the app **with everything it needs**, so it runs the same on a laptop, a test server and the cloud.

- An **image** is the packaged recipe (read-only).
- A **container** is a running copy of an image. You can run many containers from one image.
- **Docker** is the most common tool to build and run them. Images are shared through **registries** (Docker Hub, GitHub Container Registry).

## A Dockerfile, line by line

\`\`\`dockerfile
FROM node:22-alpine          # start from a small image with Node.js
WORKDIR /app                 # work inside /app
COPY package*.json ./        # copy the dependency list first (better caching)
RUN npm ci --omit=dev        # install production dependencies
COPY . .                     # copy the app code
USER node                    # do not run as root (safer)
EXPOSE 3000                  # the app listens on port 3000
CMD ["node", "server.js"]    # what to run when the container starts
\`\`\`

\`docker build -t shop-api .\` makes the image; \`docker run -p 3000:3000 shop-api\` starts a container.

## Containers vs virtual machines

A VM includes a whole operating system (heavy, minutes to start). Containers share the host's kernel (light, seconds to start), so you can run many more on the same machine.

## Kubernetes in one paragraph

When you run dozens or thousands of containers, **Kubernetes** (K8s) schedules them across many machines, restarts crashed ones, scales them with traffic, and rolls out new versions gradually. Cloud providers offer it managed (EKS, AKS, GKE). Many small teams never need it: a PaaS or serverless platform is simpler.

## Security basics

Use small official base images, update them, never bake secrets into images (pass them at run time), and do not run as root.`,
      quiz: [
        { q: 'An image vs a container:', options: ['They are the same', 'An image is the recipe; a container is a running copy', 'A container builds images'], answer: 1, why: 'Many containers can run from one image.' },
        { q: 'Why "USER node" in a Dockerfile?', options: ['Faster builds', 'Not running as root limits damage if the app is hacked', 'It is required'], answer: 1, why: 'Least privilege inside the container.' },
        { q: 'Where should an API key for a container go?', options: ['Inside the image', 'Passed at run time from a secret store', 'In the Dockerfile comments'], answer: 1, why: 'Images are shared; secrets must not be baked in.' },
      ],
    },
    {
      id: 'cloud-config',
      title: 'Configuration, environments and secrets',
      minutes: 25,
      kind: 'code',
      outline: 'Twelve-factor config, dev/staging/production, and validate an app\'s environment variables safely.',
      body: `## Same code, different settings

An app runs in several **environments**: your laptop (development), **staging** (a copy for testing), and **production** (real customers). The code is the same; the **configuration** differs: database address, payment keys (test vs live), email sender.

The widely used **twelve-factor** rule: keep configuration in **environment variables**, not in the code. Secrets (keys, passwords, tokens) belong in the platform's **secret store** (GitHub Actions secrets, Supabase secrets, AWS Secrets Manager), never in Git, never in a web page.

## Fail fast, never leak

At start-up, an app should check its configuration and refuse to start if something important is missing or wrong, with a clear message. That message must **never print secret values**: logs are read by many people and tools.

## Your task

\`checkConfig(env, spec)\`:

- \`spec\` describes each variable: \`{ name, required, type: 'string' | 'number' | 'url', secret }\`.
- Return \`{ ok, errors, summary }\`:
  - \`errors\`: messages like \`"PORT must be a number"\`, \`"DB_URL is missing"\`, \`"SITE_URL must be an https url"\`.
  - \`summary\`: an object of the values to log, where **secrets are shown as** \`"***"\` and missing values as \`null\`.
- Numbers: the text must be a valid finite number. URLs: must start with \`https://\` and parse with \`new URL\`.`,
      task: 'Write checkConfig(env, spec).',
      starter: `<script>
  const SPEC = [
    { name: 'PORT', required: true, type: 'number' },
    { name: 'SITE_URL', required: true, type: 'url' },
    { name: 'PAYSTACK_SECRET_KEY', required: true, type: 'string', secret: true },
    { name: 'SENTRY_DSN', required: false, type: 'url' },
  ]
  function checkConfig(env, spec) {
  }
</script>
`,
      checks: [
        { label: 'a good config passes', test: `const r = checkConfig({ PORT: '3000', SITE_URL: 'https://shop.ng', PAYSTACK_SECRET_KEY: 'sk_live_x' }, SPEC); return r.ok && r.errors.length === 0` },
        { label: 'missing required values are errors', test: `const r = checkConfig({ PORT: '3000', SITE_URL: 'https://shop.ng' }, SPEC); return !r.ok && r.errors.includes('PAYSTACK_SECRET_KEY is missing')` },
        { label: 'types are checked', test: `const r = checkConfig({ PORT: 'abc', SITE_URL: 'http://shop.ng', PAYSTACK_SECRET_KEY: 'x' }, SPEC); return r.errors.includes('PORT must be a number') && r.errors.includes('SITE_URL must be an https url')` },
        { label: 'secrets never appear in the summary', test: `const r = checkConfig({ PORT: '1', SITE_URL: 'https://a.ng', PAYSTACK_SECRET_KEY: 'sk_live_TOPSECRET' }, SPEC); return r.summary.PAYSTACK_SECRET_KEY === '***' && !JSON.stringify(r).includes('TOPSECRET')` },
        { label: 'optional missing values are fine and null', test: `const r = checkConfig({ PORT: '1', SITE_URL: 'https://a.ng', PAYSTACK_SECRET_KEY: 'k' }, SPEC); return r.ok && r.summary.SENTRY_DSN === null` },
      ],
      hint: "For each item: const v = env[s.name]; if (v === undefined || v === '') { if (s.required) errors.push(s.name + ' is missing'); summary[s.name] = null; continue } ... summary[s.name] = s.secret ? '***' : v",
      solution: `<script>
  const SPEC = [
    { name: 'PORT', required: true, type: 'number' }, { name: 'SITE_URL', required: true, type: 'url' },
    { name: 'PAYSTACK_SECRET_KEY', required: true, type: 'string', secret: true }, { name: 'SENTRY_DSN', required: false, type: 'url' },
  ]
  function checkConfig(env, spec) {
    const errors = [], summary = {}
    for (const s of spec) {
      const v = env[s.name]
      if (v === undefined || v === '') { if (s.required) errors.push(s.name + ' is missing'); summary[s.name] = null; continue }
      if (s.type === 'number' && !(v.trim() !== '' && Number.isFinite(Number(v)))) errors.push(s.name + ' must be a number')
      if (s.type === 'url') { let ok = v.startsWith('https://'); try { new URL(v) } catch { ok = false } if (!ok) errors.push(s.name + ' must be an https url') }
      summary[s.name] = s.secret ? '***' : v
    }
    return { ok: errors.length === 0, errors, summary }
  }
</script>`,
    },
    {
      id: 'cloud-monitoring',
      title: 'Monitoring, logs and uptime',
      minutes: 25,
      kind: 'code',
      outline: 'SLAs, error budgets and alerting; compute uptime and find error spikes in logs.',
      body: `## You cannot fix what you cannot see

Production systems need:

- **Logs**: what happened (requests, errors) with timestamps. Never log passwords, card numbers or secrets.
- **Metrics**: numbers over time (requests per minute, response time, error rate, CPU).
- **Traces**: one request's journey through several services.
- **Alerts**: a message (email, Slack, phone) when something crosses a threshold. Alert on what users feel (errors, slowness), not on every small blip, or people start ignoring alerts.
- **Uptime checks**: a service pings your site every minute from several countries.

Tools: Sentry (errors), Grafana and Prometheus (metrics), Better Stack or UptimeRobot (uptime), and each cloud's own monitoring.

## SLAs and error budgets

An **SLA** promises availability, for example **99.9%** a month. That allows about **43 minutes** of downtime in a 30-day month. The allowed downtime is the **error budget**: if you have used most of it, slow down risky releases.

| Availability | Downtime per 30 days |
|---|---|
| 99% | 7.2 hours |
| 99.9% | 43.2 minutes |
| 99.99% | 4.3 minutes |

## Your task

1. \`uptime(checks)\`: \`checks\` is an array of booleans (true = the site answered). Return the availability percentage rounded to 2 decimals.
2. \`downtimeBudget(slaPercent, days)\`: allowed downtime in minutes, rounded to 1 decimal.
3. \`errorSpikes(lines, limit)\`: \`lines\` are log strings like \`"2026-11-20T10:01:12Z ERROR payment failed"\`. Count \`ERROR\` lines per minute (the first 16 characters, \`YYYY-MM-DDTHH:MM\`) and return the minutes with **more than** \`limit\` errors, in time order.`,
      task: 'Write uptime, downtimeBudget and errorSpikes.',
      starter: `<script>
  function uptime(checks) {
  }
  function downtimeBudget(slaPercent, days) {
  }
  function errorSpikes(lines, limit) {
  }
</script>
`,
      checks: [
        { label: 'uptime percentage', test: `return uptime([true, true, true, false]) === 75 && uptime(Array(1000).fill(true).fill(false, 0, 1)) === 99.9` },
        { label: '99.9% over 30 days is 43.2 minutes', test: `return downtimeBudget(99.9, 30) === 43.2 && downtimeBudget(99, 30) === 432` },
        { label: 'error spikes per minute', test: `const L = ['2026-11-20T10:01:01Z ERROR a', '2026-11-20T10:01:30Z ERROR b', '2026-11-20T10:01:59Z INFO ok', '2026-11-20T10:02:00Z ERROR c', '2026-11-20T10:00:10Z ERROR d', '2026-11-20T10:00:11Z ERROR e']; return errorSpikes(L, 1).join() === '2026-11-20T10:00,2026-11-20T10:01'` },
        { label: 'only ERROR lines count', test: `return errorSpikes(['2026-11-20T10:01:01Z WARN x', '2026-11-20T10:01:02Z INFO y'], 0).length === 0` },
      ],
      hint: "errorSpikes: const n = {}; for (const l of lines) if (l.includes(' ERROR ')) { const m = l.slice(0, 16); n[m] = (n[m] || 0) + 1 } return Object.keys(n).filter(m => n[m] > limit).sort()",
      solution: `<script>
  function uptime(checks) { return Math.round((checks.filter(Boolean).length / checks.length) * 10000) / 100 }
  function downtimeBudget(sla, days) { return Math.round(days * 24 * 60 * (1 - sla / 100) * 10) / 10 }
  function errorSpikes(lines, limit) { const n = {}; for (const l of lines) if (l.includes(' ERROR ')) { const m = l.slice(0, 16); n[m] = (n[m] || 0) + 1 } return Object.keys(n).filter((m) => n[m] > limit).sort() }
</script>`,
    },
    {
      id: 'cloud-cost',
      title: 'Cloud costs, backups and your cloud career',
      minutes: 20,
      kind: 'read',
      outline: 'Keep cloud bills under control, plan backups and recovery, and the certifications that open cloud jobs.',
      body: `## The cloud bill surprise

Pay-as-you-go cuts both ways. Common surprises: servers left running over the weekend, oversized databases, data transfer out of the cloud, forgotten test environments, and logs kept forever.

Control costs with:

- **Budgets and alerts**: an email when spending passes 50%, 80% and 100% of the monthly budget
- **Right-sizing**: use the smallest size that meets the need; scale automatically
- **Free tiers and serverless** for small apps (many CDM products run on free or cheap plans)
- **Tagging** every resource with its project and owner, so you know what to delete
- **Reserved / committed use** discounts for steady workloads
- Exchange rates: bills are in dollars; plan for the naira moving

## Backups and disaster recovery

Two numbers define your plan:

- **RPO** (recovery point objective): how much data can you afford to lose? 24 hours means daily backups are enough; 5 minutes needs continuous replication.
- **RTO** (recovery time objective): how long can you be down? This decides how ready your standby must be.

Follow 3-2-1 (three copies, two media, one off-site), keep backups in a different account or region, and **test restores**.

## Cloud careers

- Entry: **cloud support associate**, **IT administrator**, **junior DevOps**
- Certifications: **AWS Certified Cloud Practitioner** → **AWS Solutions Architect Associate**; **Microsoft AZ-900** → **AZ-104**; **Google Cloud Digital Leader** → **Associate Cloud Engineer**; for containers, **CKA** (Kubernetes)
- Portfolio: deploy a real app with CI/CD, a custom domain, monitoring and a budget alert, and write up the architecture with a diagram. Your CDM Studio projects can be hosted on your own domain from the project's More menu.`,
      quiz: [
        { q: 'The cheapest way to stop surprise bills is…', options: ['Budgets with alerts and deleting unused resources', 'Bigger servers', 'Turning off monitoring'], answer: 0, why: 'Visibility plus cleanup.' },
        { q: 'RPO of 1 hour means…', options: ['You can be down for 1 hour', 'You can lose at most 1 hour of data', 'Backups once a day are fine'], answer: 1, why: 'RPO is about data loss; RTO is about downtime.' },
        { q: 'A good first AWS certification is…', options: ['AWS Certified Cloud Practitioner', 'CKA', 'PL-300'], answer: 0, why: 'It is the foundational AWS exam.' },
      ],
    },
  ],
  exam: [
    { q: 'Gmail and Microsoft 365 are examples of…', options: ['IaaS', 'PaaS', 'SaaS', 'On-premises'], answer: 2, why: 'You simply use the software.' },
    { q: 'Renting virtual machines and managing their operating system yourself is…', options: ['IaaS', 'PaaS', 'SaaS', 'Serverless'], answer: 0, why: 'Infrastructure as a service.' },
    { q: 'Under shared responsibility, who secures your user accounts and access rights?', options: ['The provider', 'You', 'The internet provider', 'Nobody'], answer: 1, why: 'Identity and configuration are the customer\'s job.' },
    { q: 'Availability zones are…', options: ['Separate data centres in a region with their own power', 'Time zones', 'Pricing plans', 'Browser tabs'], answer: 0, why: 'They provide resilience within a region.' },
    { q: '"git commit" does what?', options: ['Uploads to GitHub', 'Saves a snapshot of staged changes locally', 'Deletes a branch', 'Deploys the app'], answer: 1, why: 'Push sends commits to the remote.' },
    { q: 'A pull request is used to…', options: ['Review and test changes before merging into main', 'Download a file', 'Reset a password', 'Pay for hosting'], answer: 0, why: 'PRs gate changes.' },
    { q: 'A secret key was pushed to a public repo. What must you do first?', options: ['Rotate the key', 'Rename the file', 'Add a comment', 'Nothing if you delete it quickly'], answer: 0, why: 'Assume it is compromised; history and bots copy it fast.' },
    { q: 'Continuous integration means…', options: ['Every push runs automated checks', 'Developers never test', 'Deploying once a year', 'Paying monthly'], answer: 0, why: 'Find problems early.' },
    { q: 'A pipeline step fails. A good pipeline…', options: ['Continues and deploys anyway', 'Stops and does not deploy', 'Deletes the repo', 'Retries forever'], answer: 1, why: 'Broken builds must not reach users.' },
    { q: 'Containers mainly solve…', options: ['"It works on my machine" by packaging the app with its dependencies', 'Slow internet', 'Password reuse', 'Billing'], answer: 0, why: 'Same package everywhere.' },
    { q: 'Compared with virtual machines, containers are…', options: ['Heavier and slower to start', 'Lighter, sharing the host kernel', 'Exactly the same', 'Only for Windows'], answer: 1, why: 'No full guest OS.' },
    { q: 'Kubernetes is used to…', options: ['Write CSS', 'Schedule, restart and scale many containers across machines', 'Send emails', 'Design logos'], answer: 1, why: 'Container orchestration.' },
    { q: 'Where should production configuration such as a database password live?', options: ['In the source code', 'In environment variables from a secret store', 'In the web page', 'In the README'], answer: 1, why: 'Twelve-factor config and secret stores.' },
    { q: 'An app finds a required setting missing at start-up. It should…', options: ['Start anyway', 'Stop with a clear message that does not reveal secrets', 'Print all environment variables', 'Guess a value'], answer: 1, why: 'Fail fast, never leak.' },
    { q: 'Staging is…', options: ['A copy of production for testing before release', 'The live customer site', 'A backup tape', 'A coding language'], answer: 0, why: 'Test in a production-like environment.' },
    { q: '99.9% monthly availability allows about how much downtime in 30 days?', options: ['43 minutes', '7 hours', '4 minutes', '1 day'], answer: 0, why: '0.1% of 43,200 minutes.' },
    { q: 'Good alerting…', options: ['Alerts on every small blip', 'Alerts on what users feel, with sensible thresholds', 'Never alerts', 'Only emails once a month'], answer: 1, why: 'Too many alerts get ignored.' },
    { q: 'Which should never be written to logs?', options: ['Request times', 'Error messages', 'Passwords and card numbers', 'Status codes'], answer: 2, why: 'Logs are widely read.' },
    { q: 'RTO describes…', options: ['How long you can be down', 'How much data you can lose', 'Monthly cost', 'Number of servers'], answer: 0, why: 'Recovery time objective.' },
    { q: 'A simple way to avoid surprise cloud bills is…', options: ['Budgets with alerts', 'Bigger instances', 'Keeping all test servers on', 'Disabling tags'], answer: 0, why: 'Know before it is too late.' },
  ],
}
