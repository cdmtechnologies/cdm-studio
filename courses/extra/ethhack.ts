import type { Quiz } from '../../src/lessons/types'
import type { CourseLesson, CourseProject } from '../types'

// Advanced lessons added to Ethical hacking and penetration testing (before the final reporting and career lesson).
// Everything stays defensive and legal: authorised targets, practice labs, and the fixes for each weakness.
export const ethhackMore: CourseLesson[] = [
  {
    id: 'ethhack-osint',
    title: 'Passive reconnaissance and OSINT, within scope',
    minutes: 30,
    kind: 'read',
    outline: 'What public information reveals about an organisation, DNS and certificate records, staff exposure, and the legal and ethical limits.',
    body: `## Looking before touching

Before any authorised test touches a system, testers study what the organisation has already made public. This is **passive reconnaissance**: collecting **open-source intelligence (OSINT)** without sending a single packet to the target's systems. Defenders do the same thing, because whatever a tester can find in an afternoon, a criminal can find too.

Think of a security consultant hired to review a bank branch. Before entering, they walk around the outside: which doors face the street, where the cameras point, what is visible through the windows. They do not pick any locks.

## Sources a tester reviews (for the organisation in scope)

- **The organisation's own website**: staff pages, job adverts (which reveal the technology used: "experience with Microsoft 365 and Fortinet firewalls"), documents with hidden metadata (author names, software versions).
- **DNS records**: the public "phone book" of the domain. Subdomains such as \`staging.\`, \`old.\` or \`vpn.\` often point to forgotten, unpatched systems.
- **Certificate transparency logs**: every public HTTPS certificate is recorded in open logs (searchable at sites like crt.sh), which list subdomains the organisation may have forgotten.
- **Code repositories**: public code sometimes contains passwords, API keys or internal addresses committed by mistake.
- **Breach notifications and leaked-password services** such as Have I Been Pwned, to see whether the organisation's email addresses appear in known breaches (never to use the leaked passwords).
- **Social media and professional networks**: who works there, in which roles, and what they post. Useful for judging phishing risk.

## The limits are strict

- Only research the organisation that **authorised** the engagement, within the written scope.
- Passive does not mean "anything goes". Do not log in with leaked credentials, do not trick staff, and do not access private accounts or groups by pretending to be someone.
- Collect the minimum personal data needed, store it securely, and delete it at the end of the engagement. Data protection laws (NDPA in Nigeria, GDPR in Europe) apply to testers too.
- Report exposed personal information carefully: the goal is to protect those people, not to embarrass them.

## Turning findings into defence

For each finding, recommend a fix:

| Finding | Fix |
|---|---|
| Forgotten \`staging\` subdomain running old software | Take it down or patch it; keep an asset inventory |
| API key in a public repository | Revoke it immediately, then remove it and scan repositories automatically |
| Staff emails in many breaches | Two-step sign-in for all, password manager rollout, phishing training |
| Job adverts listing exact firewall versions | Describe skills, not exact versions |
| Documents with author and software metadata | Strip metadata before publishing |

## Attack surface management

Mature organisations run this reconnaissance **on themselves**, continuously: monitoring new certificates, DNS changes and leaked credentials, so they find exposure before attackers do.`,
    quiz: [
      { q: 'Passive reconnaissance means…', options: ['Scanning every port quickly', 'Gathering public information without touching the target\'s systems', 'Logging in with leaked passwords'], answer: 1, why: 'No packets are sent to the target.' },
      { q: 'Certificate transparency logs can reveal…', options: ['Users\' passwords', 'Subdomains, including forgotten ones', 'Bank balances'], answer: 1, why: 'Every public certificate is logged openly.' },
      { q: 'You find working staff passwords in a public breach dump. You should…', options: ['Test them on the company\'s email', 'Not use them; report the exposure so the passwords are reset', 'Sell them'], answer: 1, why: 'Using leaked credentials is outside any normal scope and often illegal.' },
      { q: 'A public repository contains a live API key. The first fix is to…', options: ['Delete the file only', 'Revoke the key immediately, then clean the repository', 'Make the repository private and keep the key'], answer: 1, why: 'Assume it was already copied.' },
    ],
  },
  {
    id: 'ethhack-authz',
    title: 'Broken access control: finding and fixing IDOR',
    minutes: 35,
    kind: 'code',
    outline: 'Why broken access control tops the OWASP Top 10, how testers check object-level and function-level permissions, and writing the fix.',
    body: `## The hotel key that opens every room

Imagine a hotel where your key card opens room 214. Out of curiosity you try room 215, and it opens too. The lock checked that you had *a* key, not that it was *your* room. That is **broken access control**, and it is number one on the **OWASP Top 10**, the industry's list of the most serious web application risks.

## IDOR: changing a number in the address

A very common form is the **insecure direct object reference (IDOR)**:

\`\`\`
https://shop.example/invoices/1042   ← your invoice
https://shop.example/invoices/1043   ← someone else's invoice, if the server does not check
\`\`\`

The app authenticated you (it knows who you are) but did not authorise this request (check that invoice 1043 is yours). Real incidents have exposed millions of records this way: medical results, bank statements, ID documents.

## How a tester checks (on an authorised target)

1. Create **two test accounts** in the same app, user A and user B.
2. As A, note the IDs of A's objects (orders, invoices, messages, files).
3. As B, request A's objects by ID. Try reading, editing and deleting.
4. Check **functions** too: can a normal user call admin actions, like \`POST /api/users/7/role\`, by sending the request directly, even though the button is hidden?
5. Check every channel: web pages, the mobile app's API, file download links, exports.

Testers only use their own test accounts and test data, never real customers' records. If real data is exposed by accident, they stop, record the minimum evidence, and report it at once.

## The fix: check on the server, every time

- For every request, the **server** decides: *is this user allowed to do this action on this object?* Hiding a button is not security.
- **Deny by default**: if no rule allows it, refuse.
- Check **ownership** (the invoice belongs to this user) or **membership** (the user belongs to the company that owns it) and **role** (only managers may refund).
- Use the database to enforce it where possible. In PostgreSQL and Supabase, **row level security** policies make the database itself refuse rows a user may not see, even if the app has a bug.
- Return the **same** response for "does not exist" and "not yours" (often 404), so attackers cannot learn which IDs exist.
- Random, unguessable IDs (UUIDs) help, but they do not replace the check.

## Your task

Write the access check for an invoicing app.

- Users look like \`{ id, company, role }\` where role is \`"owner"\`, \`"manager"\`, \`"staff"\` or \`"auditor"\`.
- Invoices look like \`{ id, company, createdBy }\`.

1. \`canView(user, invoice)\`: only users of the **same company** may view. (An unknown role may not.)
2. \`canEdit(user, invoice)\`: same company, and either owner or manager, or staff editing an invoice **they created**. Auditors never edit.
3. \`canRefund(user, invoice)\`: same company and owner or manager only.
4. \`fetchInvoice(user, id, db)\`: \`db\` is a list of invoices. Return \`{ status: 200, invoice }\` when allowed to view; otherwise \`{ status: 404 }\`, the **same** for missing and forbidden.`,
    task: 'Write canView, canEdit, canRefund and fetchInvoice.',
    starter: `<script>
  const ROLES = ['owner', 'manager', 'staff', 'auditor']
  function canView(user, invoice) {
    return true
  }
  function canEdit(user, invoice) {
    return true
  }
  function canRefund(user, invoice) {
    return true
  }
  function fetchInvoice(user, id, db) {
    const invoice = db.find((i) => i.id === id)
    return { status: 200, invoice }
  }
</script>
`,
    checks: [
      { label: 'other companies cannot view', test: `const inv = { id: 1, company: 'A', createdBy: 'u1' }; return canView({ id: 'u1', company: 'A', role: 'staff' }, inv) && !canView({ id: 'x', company: 'B', role: 'owner' }, inv) && !canView({ id: 'y', company: 'A', role: 'intern' }, inv)` },
      { label: 'edit rules by role and creator', test: `const inv = { id: 1, company: 'A', createdBy: 'u1' }; return canEdit({ id: 'm', company: 'A', role: 'manager' }, inv) && canEdit({ id: 'u1', company: 'A', role: 'staff' }, inv) && !canEdit({ id: 'u2', company: 'A', role: 'staff' }, inv) && !canEdit({ id: 'au', company: 'A', role: 'auditor' }, inv) && !canEdit({ id: 'o', company: 'B', role: 'owner' }, inv)` },
      { label: 'refunds for owners and managers only', test: `const inv = { id: 1, company: 'A', createdBy: 'u1' }; return canRefund({ id: 'o', company: 'A', role: 'owner' }, inv) && !canRefund({ id: 'u1', company: 'A', role: 'staff' }, inv) && !canRefund({ id: 'o', company: 'B', role: 'owner' }, inv)` },
      { label: 'IDOR blocked with the same 404', test: `const db = [{ id: 1042, company: 'A', createdBy: 'u1' }, { id: 1043, company: 'B', createdBy: 'u9' }]; const me = { id: 'u1', company: 'A', role: 'staff' }; const a = fetchInvoice(me, 1042, db), b = fetchInvoice(me, 1043, db), c = fetchInvoice(me, 9999, db); return a.status === 200 && a.invoice.id === 1042 && b.status === 404 && !b.invoice && JSON.stringify(b) === JSON.stringify(c)` },
    ],
    hint: 'Start canView with: if (!user || !invoice || !ROLES.includes(user.role)) return false; return user.company === invoice.company. Build canEdit and canRefund on top of canView.',
    solution: `<script>
  const ROLES = ['owner', 'manager', 'staff', 'auditor']
  function canView(user, invoice) {
    if (!user || !invoice || !ROLES.includes(user.role)) return false
    return user.company === invoice.company
  }
  function canEdit(user, invoice) {
    if (!canView(user, invoice)) return false
    if (user.role === 'owner' || user.role === 'manager') return true
    return user.role === 'staff' && invoice.createdBy === user.id
  }
  function canRefund(user, invoice) {
    return canView(user, invoice) && (user.role === 'owner' || user.role === 'manager')
  }
  function fetchInvoice(user, id, db) {
    const invoice = db.find((i) => i.id === id)
    if (!invoice || !canView(user, invoice)) return { status: 404 }
    return { status: 200, invoice }
  }
</script>
`,
  },
  {
    id: 'ethhack-misconfig',
    title: 'Security misconfiguration and weak crypto',
    minutes: 35,
    kind: 'code',
    outline: 'Default passwords, debug modes, directory listing, old TLS, exposed admin panels, and coding a configuration review.',
    body: `## Leaving the keys in the door

Many breaches need no clever hacking at all. A database left open to the internet with no password, an admin panel at \`/admin\` with the default login \`admin / admin\`, a server showing full error messages with file paths and passwords: these are **security misconfigurations**, a permanent member of the OWASP Top 10. It is like buying a strong lock and leaving the key in it.

## What testers look for (on authorised systems)

- **Default or blank credentials** on routers, cameras, databases, admin panels and CMS installs.
- **Debug or development mode** in production, which shows stack traces, environment variables and internal paths.
- **Directory listing**: a web server showing every file in a folder, including backups like \`db_backup.sql\`.
- **Unnecessary services and sample apps** left installed.
- **Admin interfaces open to the whole internet** instead of a VPN or allow-list.
- **Overly permissive CORS** (\`Access-Control-Allow-Origin: *\` together with credentials).
- **Cloud storage buckets** set to public by mistake.
- **Missing security headers** (the Cybersecurity course covers these).

## Weak cryptography

- **Old TLS versions**: TLS 1.0 and 1.1 are retired; servers should accept only **TLS 1.2 and 1.3**.
- **Weak password hashing**: MD5 or SHA-1, or plain unsalted hashes, can be cracked fast. Passwords need slow, salted algorithms built for the job: **bcrypt**, **scrypt** or **Argon2**.
- **Hard-coded secrets** in code or config files committed to repositories.
- **Home-made encryption**: never invent your own; use well-reviewed libraries.

## Why it happens

Systems are set up in a hurry, defaults are kept "for now", a test server becomes production, or settings drift over time as different people make changes. The fix is a process, not a one-off clean-up:

- A **hardening checklist** or baseline (CIS Benchmarks exist for most systems).
- **Infrastructure as code** so settings are reviewed and repeatable (the Cloud course covers this).
- **Automated scanning** of configurations in the CI pipeline.
- Regular reviews and an up-to-date asset list.

## Your task

Write a configuration review that turns a server's settings into findings with severities.

\`config\` looks like \`{ debug, directoryListing, adminPublic, tlsVersions, passwordHash, users: [{ name, password }] }\`.

\`review(config)\` returns a list of \`{ issue, severity }\` with these rules:

| Condition | issue | severity |
|---|---|---|
| a user whose password is in \`DEFAULTS\` (or empty) | \`default password for NAME\` | \`critical\` |
| \`debug\` is true | \`debug mode on\` | \`high\` |
| \`adminPublic\` is true | \`admin panel public\` | \`high\` |
| \`tlsVersions\` includes \`"1.0"\` or \`"1.1"\` | \`old tls\` | \`medium\` |
| \`passwordHash\` is not bcrypt, scrypt or argon2 | \`weak password hashing\` | \`high\` |
| \`directoryListing\` is true | \`directory listing\` | \`medium\` |

Then \`sortFindings(findings)\` orders them critical, high, medium, low (keeping the original order within a severity).`,
    task: 'Write review and sortFindings.',
    starter: `<script>
  const DEFAULTS = ['admin', 'password', '123456', 'root', 'changeme', 'default']
  function review(config) {
    return []
  }
  function sortFindings(findings) {
    return findings
  }
</script>
`,
    checks: [
      { label: 'default and empty passwords are critical', test: `const f = review({ users: [{ name: 'admin', password: 'admin' }, { name: 'cam', password: '' }, { name: 'ada', password: 'x9!Lq-27-Blue' }], tlsVersions: ['1.2'], passwordHash: 'argon2' }); return f.length === 2 && f.every((x) => x.severity === 'critical') && f[0].issue === 'default password for admin' && f[1].issue === 'default password for cam'` },
      { label: 'debug, admin, tls and listing found', test: `const f = review({ debug: true, adminPublic: true, directoryListing: true, tlsVersions: ['1.0', '1.2'], passwordHash: 'bcrypt', users: [] }); const has = (i, s) => f.some((x) => x.issue === i && x.severity === s); return f.length === 4 && has('debug mode on', 'high') && has('admin panel public', 'high') && has('old tls', 'medium') && has('directory listing', 'medium')` },
      { label: 'weak hashing flagged', test: `const ok = ['bcrypt', 'scrypt', 'argon2'].every((h) => review({ passwordHash: h, tlsVersions: [], users: [] }).length === 0); return ok && review({ passwordHash: 'md5', tlsVersions: [], users: [] })[0].issue === 'weak password hashing'` },
      { label: 'findings sorted by severity', test: `const s = sortFindings([{ issue: 'a', severity: 'medium' }, { issue: 'b', severity: 'critical' }, { issue: 'c', severity: 'high' }, { issue: 'd', severity: 'low' }, { issue: 'e', severity: 'high' }]); return s.map((x) => x.issue).join('') === 'bcead'` },
    ],
    hint: "const RANK = { critical: 0, high: 1, medium: 2, low: 3 }; sort with (a, b) => RANK[a.severity] - RANK[b.severity] (Array sort is stable in modern browsers).",
    solution: `<script>
  const DEFAULTS = ['admin', 'password', '123456', 'root', 'changeme', 'default']
  function review(config) {
    const out = []
    for (const u of config.users || []) {
      if (!u.password || DEFAULTS.includes(String(u.password).toLowerCase())) out.push({ issue: 'default password for ' + u.name, severity: 'critical' })
    }
    if (config.debug) out.push({ issue: 'debug mode on', severity: 'high' })
    if (config.adminPublic) out.push({ issue: 'admin panel public', severity: 'high' })
    if ((config.tlsVersions || []).some((v) => v === '1.0' || v === '1.1')) out.push({ issue: 'old tls', severity: 'medium' })
    if (!['bcrypt', 'scrypt', 'argon2'].includes(String(config.passwordHash || '').toLowerCase())) out.push({ issue: 'weak password hashing', severity: 'high' })
    if (config.directoryListing) out.push({ issue: 'directory listing', severity: 'medium' })
    return out
  }
  const RANK = { critical: 0, high: 1, medium: 2, low: 3 }
  function sortFindings(findings) { return [...findings].sort((a, b) => RANK[a.severity] - RANK[b.severity]) }
</script>
`,
  },
  {
    id: 'ethhack-labs',
    title: 'Practising legally: labs, CTFs and bug bounties',
    minutes: 25,
    kind: 'read',
    outline: 'Building a home lab, deliberately vulnerable apps, capture-the-flag platforms, bug bounty rules and building a reputation.',
    body: `## Where to practise without breaking the law

A medical student practises on models and supervised patients, never on strangers in the street. Security learners need the same: places built for practice, where attacking is **allowed**. Testing systems you do not own or have written permission to test is a crime in most countries (in Nigeria under the Cybercrimes Act 2015, in the UK under the Computer Misuse Act, in the US under the CFAA), even "just to look".

## A home lab

Build a small lab on your own computer:

- **Virtual machines** with VirtualBox, VMware or Hyper-V, or **containers** with Docker, on a private network that cannot reach the internet or your home devices.
- **Deliberately vulnerable applications**, made for practice:
  - **OWASP Juice Shop**: a modern web shop full of the OWASP Top 10 flaws, with a built-in score board.
  - **DVWA** (Damn Vulnerable Web Application): classic web flaws at adjustable difficulty.
  - **OWASP WebGoat**: guided lessons with explanations.
  - **Metasploitable**: a deliberately weak Linux machine for practising scanning and service testing.
- Take **snapshots** so you can reset everything after each exercise.

## Online platforms

- **TryHackMe**: guided, browser-based rooms for beginners, with learning paths.
- **Hack The Box**: harder machines and an Academy with structured modules.
- **PortSwigger Web Security Academy**: free, excellent labs for every web vulnerability, from the makers of Burp Suite.
- **picoCTF** and other **capture-the-flag (CTF)** competitions: puzzles where you find a hidden "flag" string, in teams or alone. CTFs teach creativity and persistence.

Read each platform's rules: attack only the machines they give you.

## Bug bounty programmes

Many organisations invite the public to find and report security bugs, and pay rewards. Platforms such as **HackerOne**, **Bugcrowd** and **Intigriti** host these programmes.

- Read the **policy** first: what is in scope, what is out of scope (often denial-of-service, social engineering and physical attacks), and what testing is allowed.
- Use your **own test accounts**; never access or change other users' data. If you see real personal data, stop and report.
- Write clear reports: steps to reproduce, impact, and a suggested fix.
- Follow **coordinated disclosure**: give the organisation time to fix before discussing publicly.
- Organisations without a programme may still have a \`security.txt\` file or a vulnerability disclosure policy explaining how to report safely.

## Building a reputation and a career

- Write up what you learn (for retired machines and solved labs only, as platforms require) in a blog or on GitHub.
- Certifications employers recognise: CompTIA Security+ and PenTest+, eJPT, OSCP, and cloud security certificates.
- Join local and online communities, attend security meetups and conferences, and help others learn.
- Remember the blue team: understanding attacks makes you a far better defender, and defensive roles (SOC analyst, security engineer) are where most security jobs are.`,
    quiz: [
      { q: 'Testing a company\'s website without written permission "just to look" is…', options: ['Fine if nothing is damaged', 'Illegal in most countries', 'Allowed for students'], answer: 1, why: 'Authorisation is what makes testing legal.' },
      { q: 'OWASP Juice Shop and DVWA are…', options: ['Real banks', 'Deliberately vulnerable apps built for practice', 'Antivirus programs'], answer: 1, why: 'They exist so you can practise legally.' },
      { q: 'In a bug bounty, you notice other customers\' personal data. You should…', options: ['Download it as proof', 'Stop, keep minimal evidence and report it', 'Post it online'], answer: 1, why: 'Protect the people; report responsibly.' },
      { q: 'Before testing a bug bounty target you must…', options: ['Read the policy and scope', 'Ask a friend', 'Scan everything at full speed'], answer: 0, why: 'The policy defines what is allowed.' },
    ],
  },
]

export const ethhackProject: CourseProject = {
  title: 'Penetration test report on a practice target',
  lang: 'text',
  brief: `Run an authorised test against a **practice target you are allowed to attack**: OWASP Juice Shop or DVWA running in your own lab, a TryHackMe or Hack The Box machine (following their rules on write-ups), or an app **you built yourself**. Do not test any system you do not own or have written permission to test.

Write a professional penetration test report (paste the text here, about 1,000 to 2,500 words):

1. **Executive summary** for non-technical managers: overall risk and the top three fixes.
2. **Scope and rules of engagement**: the target, dates, what was allowed and not allowed, and the written basis for authorisation (for a practice target, say which one and why it is allowed).
3. **Methodology**: the phases you followed (reconnaissance, scanning, testing, reporting).
4. **Findings**: at least 4, each with a title, severity (critical, high, medium or low) with your reasoning, affected component, steps to reproduce, evidence (describe it; do not paste real personal data or working exploit code), impact, and a clear **remediation**.
5. **Positive observations**: what was done well.
6. **Conclusion and retest plan**.`,
  rubric: [
    'Targets only an authorised practice system or the learner\'s own app, and states the basis for authorisation',
    'Defines scope and rules of engagement clearly',
    'Has an executive summary a non-technical manager can understand',
    'Describes a structured methodology',
    'Reports at least 4 findings, each with severity and a reasoned rating',
    'Each finding has reproducible steps and evidence without real personal data or weaponised exploit code',
    'Each finding explains the business impact',
    'Each finding gives a specific, correct remediation',
    'Includes positive observations and a retest plan',
    'Is professional, clear and well organised',
  ],
}

export const ethhackExam: Quiz[] = [
  { q: 'Passive reconnaissance…', options: ['Sends exploit traffic to the target', 'Uses public information without touching the target\'s systems', 'Requires no authorisation ever, for any target', 'Means guessing passwords'], answer: 1, why: 'It studies what is already public, within scope.' },
  { q: 'Changing /invoices/1042 to /invoices/1043 shows someone else\'s invoice. This is…', options: ['XSS', 'IDOR (broken access control)', 'Phishing', 'A DNS error'], answer: 1, why: 'The server did not check ownership.' },
  { q: 'The correct fix for IDOR is…', options: ['Hide the invoice number', 'Check on the server that the user may access that object', 'Use longer URLs only', 'Disable the page'], answer: 1, why: 'Authorisation must be checked on every request.' },
  { q: 'Passwords should be stored with…', options: ['MD5', 'Plain text', 'A slow salted algorithm such as bcrypt or Argon2', 'Base64'], answer: 2, why: 'Fast hashes are cracked quickly.' },
  { q: 'A legal place to practise web attacks is…', options: ['Any company\'s website', 'OWASP Juice Shop in your own lab', 'A friend\'s bank account', 'A government portal'], answer: 1, why: 'Deliberately vulnerable apps exist for practice.' },
]
