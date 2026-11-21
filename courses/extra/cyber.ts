import type { CourseLesson, CourseProject } from '../types'

// Advanced lessons added to Cybersecurity essentials (before the final careers lesson).
export const cyberMore: CourseLesson[] = [
  {
    id: 'cyber-backups',
    title: 'Ransomware, backups and cloud accounts',
    minutes: 30,
    kind: 'read',
    outline: 'How ransomware works, the 3-2-1 backup rule, testing restores, and securing email and cloud accounts.',
    body: `## The kidnapping of data

**Ransomware** is malicious software that locks (encrypts) a victim's files and demands payment for the key. Modern gangs also **steal** the data first and threaten to publish it, so even victims with backups feel pressure to pay. Hospitals, schools, banks, councils and small shops have all been hit, and some businesses never reopen.

## How it gets in

- **Phishing emails** with infected attachments or links to fake login pages (lesson 3).
- **Stolen or guessed passwords** for remote access (RDP, VPNs) without two-step sign-in.
- **Unpatched software**: known holes in servers, routers and apps that were never updated.
- **Pirated software** and dodgy downloads carrying hidden malware.

Once inside, attackers often wait days or weeks, quietly spreading to other computers and looking for the backups, **so they can delete those first**.

## The 3-2-1 rule

Backups are the seatbelt of computing: boring, until the day they save you. Keep:

- **3** copies of important data (the original plus two backups),
- on **2** different kinds of storage (for example a server and a cloud service),
- with **1** copy **offline or immutable** (cannot be changed or deleted, even by an administrator, for a set time).

The offline or immutable copy is what defeats ransomware: an attacker who controls your network cannot reach it.

## A backup you have not restored is a hope, not a backup

Test restoring files regularly, for example every quarter: pick a folder and a database, restore them to a separate place, and check they open and are complete. Write down how long it took. Many organisations discover during a crisis that their backups were failing silently for months.

## Securing email and cloud accounts

Your email is the master key: it can reset every other password. Protect it, and any cloud service (Google Workspace, Microsoft 365, Supabase, banking portals), with:

- **Two-step sign-in** for every account, using an authenticator app or security key rather than SMS where possible.
- **Separate admin accounts**: do daily work with a normal account; use the admin one only when needed.
- **Least privilege**: staff get only the access their job needs; remove access the day someone leaves.
- **Alerts** for new sign-ins, new forwarding rules (attackers secretly forward a CEO's email) and mass downloads.
- **Updates** switched on automatically for phones, laptops and routers.

## Phones are computers too

Use a screen lock, keep the system updated, install apps only from official stores, turn on remote wipe (Find My Device or Find My iPhone), and be careful with SIM-swap risks: ask your mobile network about a SIM lock PIN.

## If ransomware strikes

Disconnect affected machines from the network (do not switch them off, which can destroy evidence), call your incident response contact, preserve logs, restore from clean backups, and report it to the authorities (in Nigeria, ngCERT; in other countries, the national cyber agency or police). Paying a ransom funds crime, does not guarantee the key works, and may be illegal if the gang is under sanctions.`,
    quiz: [
      { q: 'The 3-2-1 backup rule means…', options: ['3 passwords, 2 devices, 1 email', '3 copies, 2 kinds of storage, 1 offline or immutable', '3 backups a day for 2 weeks'], answer: 1, why: 'The offline copy defeats ransomware.' },
      { q: 'Why test restoring backups?', options: ['It is required by every law', 'Backups can fail silently; a restore proves they work', 'It makes backups faster'], answer: 1, why: 'An untested backup is only a hope.' },
      { q: 'An attacker adds a hidden forwarding rule to the CEO\'s email. Which control helps catch it?', options: ['Alerts for new forwarding rules', 'A bigger mailbox', 'A new logo'], answer: 0, why: 'Monitoring account changes catches quiet attacks.' },
      { q: 'During a ransomware attack you should first…', options: ['Pay quickly', 'Disconnect affected machines from the network', 'Delete the logs'], answer: 1, why: 'Stop the spread and keep the evidence.' },
    ],
  },
  {
    id: 'cyber-headers',
    title: 'HTTPS, security headers and safe cookies',
    minutes: 35,
    kind: 'code',
    outline: 'What HTTPS protects, the security headers every site should send, cookie flags, and coding a header audit.',
    body: `## Locks on the doors and windows

HTTPS is like an armoured van between the visitor's browser and your website: nobody on the café Wi-Fi can read or change what is inside. But a website has more doors and windows than that one van. **Security headers** are instructions the server sends with every page, telling the browser how to protect the visitor. They cost nothing and block whole families of attacks.

## HTTPS and HSTS

Every site, even a simple brochure site, should use HTTPS (free certificates come from Let's Encrypt and most hosts). **HSTS** (\`Strict-Transport-Security\`) tells the browser: *"only ever talk to me over HTTPS, for the next year"*, which stops attackers downgrading visitors to plain HTTP.

\`Strict-Transport-Security: max-age=31536000; includeSubDomains\`

A \`max-age\` of at least 6 months (15,552,000 seconds) is a sensible minimum.

## The essential headers

| Header | Protects against | Good value |
|---|---|---|
| \`Content-Security-Policy\` | XSS: scripts from places you did not allow | \`default-src 'self'\` plus only what you need |
| \`X-Content-Type-Options\` | the browser guessing a file is a script | \`nosniff\` |
| \`Referrer-Policy\` | leaking full addresses to other sites | \`strict-origin-when-cross-origin\` |
| \`frame-ancestors\` (in CSP) or \`X-Frame-Options\` | **clickjacking**: your page hidden inside another site to trick clicks | \`frame-ancestors 'none'\` or \`DENY\` |
| \`Permissions-Policy\` | pages using camera, microphone or location without need | \`camera=(), microphone=()\` |

A Content Security Policy with \`'unsafe-inline'\` in \`script-src\` lets any injected inline script run, which undoes most of its protection against XSS.

## Cookies

Session cookies are the keys to a signed-in account (the sessions lesson in Ethical hacking covers attacks). Set these flags:

- \`Secure\`: only sent over HTTPS.
- \`HttpOnly\`: JavaScript cannot read it, so an XSS bug cannot steal it.
- \`SameSite=Lax\` or \`Strict\`: not sent with requests started by other sites, which blocks most cross-site request forgery (CSRF).

## Checking a site

Free scanners like Mozilla Observatory and securityheaders.com grade a site's headers. Your browser's developer tools (Network tab) show the headers on every response. In this lesson you will write the checking logic yourself.

## Your task

Headers are given as an object with **lower-case** names, for example \`{ "strict-transport-security": "max-age=31536000" }\`.

1. \`hstsOk(headers)\`: \`true\` when HSTS exists with a \`max-age\` of at least 15,552,000.
2. \`cspProblems(csp)\`: a list of problems in a CSP string: \`"missing default-src"\` if there is no \`default-src\`, \`"unsafe-inline scripts"\` if \`script-src\` (or, when there is no \`script-src\`, \`default-src\`) contains \`'unsafe-inline'\`, and \`"no frame-ancestors"\` if \`frame-ancestors\` is missing.
3. \`cookieProblems(setCookie)\`: for a \`Set-Cookie\` value, list which of \`"Secure"\`, \`"HttpOnly"\` and \`"SameSite"\` are missing (case-insensitive).
4. \`audit(headers)\`: a list of findings: \`"no https enforcement"\` when HSTS is not ok, \`"no csp"\` when there is no CSP (otherwise each CSP problem), \`"no nosniff"\` when \`x-content-type-options\` is not \`nosniff\`, and for \`set-cookie\`, \`"cookie missing X"\` for each missing flag.`,
    task: 'Write hstsOk, cspProblems, cookieProblems and audit.',
    starter: `<script>
  function hstsOk(headers) {
  }
  function cspProblems(csp) {
    return []
  }
  function cookieProblems(setCookie) {
    return []
  }
  function audit(headers) {
    return []
  }
</script>
`,
    checks: [
      { label: 'HSTS needs at least 6 months', test: `return hstsOk({ 'strict-transport-security': 'max-age=31536000; includeSubDomains' }) === true && hstsOk({ 'strict-transport-security': 'max-age=300' }) === false && hstsOk({}) === false` },
      { label: 'CSP problems found', test: `const a = cspProblems("script-src 'self' 'unsafe-inline'"), b = cspProblems("default-src 'self'; frame-ancestors 'none'"), c = cspProblems("default-src 'self' 'unsafe-inline'"); return a.includes('missing default-src') && a.includes('unsafe-inline scripts') && a.includes('no frame-ancestors') && b.length === 0 && c.includes('unsafe-inline scripts')` },
      { label: 'cookie flags checked', test: `return JSON.stringify(cookieProblems('sid=abc; Path=/')) === '["Secure","HttpOnly","SameSite"]' && cookieProblems('sid=abc; secure; httponly; samesite=Lax').length === 0` },
      { label: 'full audit of a weak site', test: `const f = audit({ 'x-content-type-options': 'none', 'set-cookie': 'sid=1; Secure' }); return ['no https enforcement', 'no csp', 'no nosniff', 'cookie missing HttpOnly', 'cookie missing SameSite'].every((x) => f.includes(x)) && f.length === 5` },
      { label: 'a strong site passes', test: `return audit({ 'strict-transport-security': 'max-age=63072000', 'content-security-policy': "default-src 'self'; frame-ancestors 'none'", 'x-content-type-options': 'nosniff', 'set-cookie': 'sid=1; Secure; HttpOnly; SameSite=Strict' }).length === 0` },
    ],
    hint: "Split a CSP into directives with csp.split(';').map(d => d.trim().split(/\\s+/)). Find max-age with /max-age=(\\d+)/.",
    solution: `<script>
  function hstsOk(headers) {
    const m = /max-age=(\\d+)/i.exec(headers['strict-transport-security'] || '')
    return !!m && Number(m[1]) >= 15552000
  }
  function cspProblems(csp) {
    const d = {}
    for (const part of csp.split(';')) {
      const [name, ...vals] = part.trim().split(/\\s+/)
      if (name) d[name.toLowerCase()] = vals
    }
    const out = []
    if (!d['default-src']) out.push('missing default-src')
    const scripts = d['script-src'] || d['default-src'] || []
    if (scripts.includes("'unsafe-inline'")) out.push('unsafe-inline scripts')
    if (!d['frame-ancestors']) out.push('no frame-ancestors')
    return out
  }
  function cookieProblems(setCookie) {
    const parts = setCookie.split(';').map((p) => p.trim().toLowerCase())
    return ['Secure', 'HttpOnly', 'SameSite'].filter((f) => !parts.some((p) => p === f.toLowerCase() || p.startsWith(f.toLowerCase() + '=')))
  }
  function audit(headers) {
    const out = []
    if (!hstsOk(headers)) out.push('no https enforcement')
    if (!headers['content-security-policy']) out.push('no csp')
    else out.push(...cspProblems(headers['content-security-policy']))
    if ((headers['x-content-type-options'] || '').toLowerCase() !== 'nosniff') out.push('no nosniff')
    if (headers['set-cookie']) for (const f of cookieProblems(headers['set-cookie'])) out.push('cookie missing ' + f)
    return out
  }
</script>
`,
  },
  {
    id: 'cyber-risk',
    title: 'Risk assessment for a small business',
    minutes: 35,
    kind: 'code',
    outline: 'Assets, threats and controls, likelihood times impact, a risk register, treatment options and simple security policies.',
    body: `## You cannot protect everything equally

A small business has limited money and time. A security plan that tries to fix everything at once fixes nothing. **Risk assessment** is how professionals decide what to protect first, like a doctor doing triage in a busy emergency room: the most serious, most likely problems get attention first.

## Step 1: list the assets

What would hurt to lose? Customer data, the accounting system, the bank login, the website, the POS, staff laptops, the WhatsApp Business number, the domain name. Note who owns each one.

## Step 2: threats and weaknesses

For each asset, what could go wrong? Phishing of the accountant's email, ransomware on the shared PC, a stolen laptop with no encryption, an ex-employee who still has access, a supplier hacked and used to send fake invoices.

## Step 3: score each risk

Give each risk a **likelihood** and an **impact**, each from 1 (low) to 5 (high):

**Risk score = likelihood × impact** (1 to 25)

| Score | Level | Action |
|---|---|---|
| 15 to 25 | **High** | act now |
| 8 to 14 | **Medium** | plan within weeks |
| 1 to 7 | **Low** | accept or monitor |

The numbers are judgement, not science, but they force a clear conversation and a ranked list.

## Step 4: treat each risk

Four options:

- **Reduce**: add controls (two-step sign-in, backups, training, disk encryption). The most common choice.
- **Avoid**: stop the risky activity (do not store card numbers at all; let the payment provider do it).
- **Transfer**: share it (cyber insurance, a managed IT provider with a contract).
- **Accept**: consciously live with a low risk, and write down that you did.

After a control is added, score the **residual risk**: what is left.

## The risk register

A simple table (a spreadsheet is fine): risk, asset, likelihood, impact, score, level, owner, treatment, due date, residual score. Review it every few months and after any incident or big change.

## Policies people can follow

Short, clear rules beat long documents nobody reads: an acceptable use policy (one page), a password and two-step sign-in rule, a "verify bank detail changes by phone" rule for payments, a joiners and leavers checklist, and an incident contact card. Frameworks such as **CIS Controls**, **NIST CSF**, **ISO 27001** and the UK's **Cyber Essentials** offer proven checklists as you grow.

## Your task

Risks are objects \`{ name, likelihood, impact }\` with values from 1 to 5.

1. \`score(risk)\`: likelihood × impact. Throw an \`Error\` if either value is not a whole number from 1 to 5.
2. \`level(score)\`: \`"high"\`, \`"medium"\` or \`"low"\` using the table above.
3. \`register(risks)\`: a new list with \`score\` and \`level\` added to each risk, sorted by score highest first (ties keep their original order).
4. \`topActions(risks, n)\`: the names of up to \`n\` risks that are **high**, in register order.`,
    task: 'Write score, level, register and topActions.',
    starter: `<script>
  const RISKS = [
    { name: 'Phishing of the accounts email', likelihood: 4, impact: 4 },
    { name: 'Stolen laptop without encryption', likelihood: 2, impact: 4 },
    { name: 'Ransomware on shared PC', likelihood: 3, impact: 5 },
    { name: 'Website defaced', likelihood: 2, impact: 2 },
    { name: 'Fake supplier invoice paid', likelihood: 3, impact: 4 },
  ]
  function score(risk) {
  }
  function level(score) {
  }
  function register(risks) {
  }
  function topActions(risks, n) {
  }
</script>
`,
    checks: [
      { label: 'score multiplies and validates', test: `let threw = 0; for (const bad of [{ likelihood: 0, impact: 3 }, { likelihood: 6, impact: 1 }, { likelihood: 2.5, impact: 2 }]) { try { score(bad) } catch (e) { threw++ } } return score({ likelihood: 3, impact: 5 }) === 15 && threw === 3` },
      { label: 'levels follow the table', test: `return level(25) === 'high' && level(15) === 'high' && level(14) === 'medium' && level(8) === 'medium' && level(7) === 'low' && level(1) === 'low'` },
      { label: 'register adds score and level and sorts', test: `const r = register(RISKS); return r.length === 5 && r[0].name === 'Phishing of the accounts email' && r[0].score === 16 && r[1].score === 15 && r[2].name === 'Fake supplier invoice paid' && r[4].level === 'low' && RISKS[0].score === undefined` },
      { label: 'top actions are the high risks', test: `return JSON.stringify(topActions(RISKS, 5)) === JSON.stringify(['Phishing of the accounts email', 'Ransomware on shared PC']) && topActions(RISKS, 1).length === 1` },
    ],
    hint: 'register: risks.map((r, i) => ({ ...r, score: score(r), level: level(score(r)), i })).sort((a, b) => b.score - a.score || a.i - b.i), then remove i if you like.',
    solution: `<script>
  const RISKS = [
    { name: 'Phishing of the accounts email', likelihood: 4, impact: 4 },
    { name: 'Stolen laptop without encryption', likelihood: 2, impact: 4 },
    { name: 'Ransomware on shared PC', likelihood: 3, impact: 5 },
    { name: 'Website defaced', likelihood: 2, impact: 2 },
    { name: 'Fake supplier invoice paid', likelihood: 3, impact: 4 },
  ]
  const ok = (v) => Number.isInteger(v) && v >= 1 && v <= 5
  function score(risk) {
    if (!ok(risk.likelihood) || !ok(risk.impact)) throw new Error('Likelihood and impact must be whole numbers from 1 to 5')
    return risk.likelihood * risk.impact
  }
  function level(s) { return s >= 15 ? 'high' : s >= 8 ? 'medium' : 'low' }
  function register(risks) {
    return risks
      .map((r, i) => ({ r: { ...r, score: score(r), level: level(score(r)) }, i }))
      .sort((a, b) => b.r.score - a.r.score || a.i - b.i)
      .map((x) => x.r)
  }
  function topActions(risks, n) { return register(risks).filter((r) => r.level === 'high').slice(0, n).map((r) => r.name) }
</script>
`,
  },
]

export const cyberProject: CourseProject = {
  title: 'Security assessment and 90-day plan for a real organisation',
  lang: 'text',
  brief: `Choose a real small organisation you know well (a family business, a school, a church, a clinic, a shop, a club) and, **with the owner's permission**, assess its security. Do not test or attack any systems: this is an interview and observation assessment, using only what the owner shows and tells you.

Write a report (paste the text here, about 800 to 2,000 words) with:

1. **Summary** for the owner in plain language: the three biggest risks and what to do first.
2. **Assets**: the important data, systems and accounts, and who owns them.
3. **Risk register**: at least 8 risks, each with likelihood, impact, score, level, treatment and an owner.
4. **Findings** on passwords and two-step sign-in, phishing awareness, backups (3-2-1 and restore testing), device updates and encryption, access for staff and leavers, and the website (HTTPS and headers, if it has one).
5. **A 90-day action plan**: what to do in weeks 1 to 2, by day 30, and by day 90, with costs where known.
6. **An incident response card**: who to call and the first five steps if something goes wrong.

Do not include any real passwords, account numbers or personal data in the report.`,
  rubric: [
    'States that the owner gave permission and that no systems were attacked or tested without consent',
    'Has a clear plain-language summary with the three biggest risks and first actions',
    'Lists the key assets with owners',
    'Includes a risk register of at least 8 risks scored as likelihood times impact, with levels and treatments',
    'Assesses passwords, two-step sign-in and phishing awareness with specific findings',
    'Assesses backups against the 3-2-1 rule and whether restores are tested',
    'Covers devices (updates, encryption, screen locks) and staff access including leavers',
    'Gives a realistic 90-day plan with priorities, owners and timing',
    'Includes an incident response card with contacts and first steps',
    'Contains no real passwords, account numbers or unnecessary personal data',
  ],
}
