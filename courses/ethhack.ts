import type { Course } from './types'

export const ethhack: Course = {
  id: 'ethhack',
  title: 'Ethical hacking and penetration testing',
  blurb: 'Learn how professional, authorised security testers think and work: scope and law, methodology, finding and rating weaknesses, and reporting them so they get fixed.',
  emoji: '🕵️',
  colour: 'emerald',
  level: 'Intermediate',
  hours: 10,
  free: 2,
  skills: ['Ethics, law and rules of engagement', 'Penetration testing methodology', 'Reading scan results', 'Injection flaws and their fixes', 'Session and token checks', 'Rating risk (CVSS-style)', 'Spotting attacks in logs', 'Writing findings and responsible disclosure'],
  careers: ['Junior penetration tester', 'Bug bounty hunter', 'Application security analyst', 'SOC analyst'],
  lessons: [
    {
      id: 'ethhack-ethics',
      title: 'Hacking with permission: ethics, law and scope',
      minutes: 20,
      kind: 'read',
      outline: 'What makes hacking ethical, the law in Nigeria and abroad, written permission, scope and rules of engagement.',
      body: `## The one rule

An **ethical hacker** (penetration tester, "pentester", red teamer) attacks systems **with the owner's written permission**, inside an agreed **scope**, to find weaknesses **before criminals do**, and reports them so they get fixed. Without permission the same actions are a crime, however good your intentions.

- In Nigeria, the **Cybercrimes (Prohibition, Prevention, etc.) Act 2015** (amended 2024) makes unauthorised access to a computer system an offence, with fines and prison terms.
- The UK's Computer Misuse Act, the US Computer Fraud and Abuse Act and similar laws elsewhere say the same.
- "I was only looking", "it was not protected" or "I wanted to help" are not defences.

## What permission looks like

Before any test, professionals sign:

1. **A contract or statement of work** with the system owner (not just an employee who says "go ahead")
2. **Scope**: exactly which systems are in (these web addresses, these IP ranges, this app) and which are **out** (third-party services, other customers, payment processors)
3. **Rules of engagement**: dates and times, what is allowed (no denial of service, no social engineering of staff unless agreed), how to handle real customer data you see, and who to call in an emergency
4. **A safe harbour / authorisation letter** you can show if anyone asks

If you find something outside scope, **stop and ask**. If a system belongs to someone else (a hosting company, a cloud provider), their permission matters too; most cloud providers publish rules for testing what you host with them.

## Bug bounties and disclosure

Many companies run **bug bounty programmes** (HackerOne, Bugcrowd, Intigriti, their own pages) that give public permission to test **specific** things under **specific** rules, and pay for valid findings. Read the policy every time: it is your permission and its limits.

If you stumble on a weakness with no programme, use **responsible (coordinated) disclosure**: report privately to the owner, give them reasonable time to fix (often 90 days), and never use or publish the weakness or the data first.

## The ethics beyond the law

- Do the minimum needed to prove a finding. Do not download, keep or look through more personal data than you must.
- Never damage, change or delete real data.
- Keep findings confidential; the report is for the client.
- Tell the truth in your report, including what you could not test.

This course teaches the defender's understanding of attacks: how testers work, how to read their results, how weaknesses are found and fixed. Practise only on systems you own or on legal training labs.`,
      quiz: [
        { q: 'A friend\'s company website looks weak. Can you test it if your friend works there and says it is fine?', options: ['Yes, a staff member agreed', 'Only with written permission from someone authorised to give it, inside an agreed scope', 'Yes, if you do not change anything'], answer: 1, why: 'Permission must come from the system owner in writing, with a defined scope.' },
        { q: 'During a test you find a server that is not in your scope. You should…', options: ['Test it quickly while you are there', 'Stop and ask the client before touching it', 'Report it on social media'], answer: 1, why: 'Out-of-scope systems are off limits until the owner agrees.' },
        { q: 'Responsible disclosure means…', options: ['Publishing the bug immediately', 'Reporting privately and giving the owner time to fix before anything is public', 'Selling the bug'], answer: 1, why: 'Coordinated disclosure protects users while the fix is made.' },
      ],
    },
    {
      id: 'ethhack-method',
      title: 'How a penetration test works',
      minutes: 20,
      kind: 'read',
      outline: 'The phases of a test, testing frameworks, the kinds of tests, and building a legal practice lab.',
      body: `## The phases

Every professional methodology (PTES, OWASP Web Security Testing Guide, NIST SP 800-115) follows the same shape:

1. **Planning and scoping**: goals, scope, rules, contacts (lesson 1).
2. **Reconnaissance (information gathering)**: what does the target expose? Web addresses, sub-domains, technologies, public documents, staff roles. *Passive* recon uses public information only; *active* recon touches the target (allowed only in scope).
3. **Scanning and enumeration**: which services are running, which versions, which pages and inputs exist.
4. **Vulnerability analysis**: which of those could be weak? Outdated software with known issues (CVEs), weak settings, missing checks on inputs or permissions.
5. **Exploitation (proof)**: carefully demonstrating that a weakness is real and what it allows, with the least possible impact.
6. **Post-exploitation**: within the rules, what could an attacker reach from there? Often stops at a screenshot as proof.
7. **Reporting**: clear findings, evidence, risk rating, and how to fix each one. **The report is the product.**
8. **Retest**: check the fixes work.

## Kinds of tests

- **Black box**: the tester starts with almost nothing, like an outside attacker.
- **Grey box**: some knowledge or a normal user account (most common for web apps).
- **White box**: full information, including source code; finds the most per hour.
- **Red team**: a long, stealthy exercise testing people, processes and detection, not just technology.
- **Vulnerability assessment**: wide scanning and listing of weaknesses without exploiting them.

## The OWASP Top 10

The best-known list of web application risks (2021 edition): broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable and outdated components, identification and authentication failures, software and data integrity failures, security logging and monitoring failures, and server-side request forgery. You met several in Cybersecurity essentials; this course goes deeper on finding, rating and reporting them.

## Your practice lab (legal and free)

- **TryHackMe** and **Hack The Box**: guided rooms and machines you are allowed to attack
- **OWASP Juice Shop**, **DVWA** and **WebGoat**: deliberately vulnerable web apps to run on your own computer
- **PortSwigger Web Security Academy**: free web security labs
- **picoCTF** and other Capture the Flag (CTF) games
- Common tools you will meet there: Nmap (scanning), Burp Suite or OWASP ZAP (web proxies), Wireshark (traffic), and the Kali Linux distribution, which bundles many tools.

Never point tools at systems outside these labs or your written scope.`,
      quiz: [
        { q: 'Which phase produces what the client actually pays for?', options: ['Scanning', 'Exploitation', 'Reporting'], answer: 2, why: 'Findings only help when they are clearly reported with fixes.' },
        { q: 'A grey-box web test usually means…', options: ['The tester has some information, such as a normal user account', 'The tester has the full source code', 'The tester knows nothing'], answer: 0, why: 'Grey box sits between black and white box.' },
        { q: 'Where may you practise attacking web apps legally?', options: ['Any site without a login', 'Training labs such as Juice Shop, DVWA or PortSwigger Academy', 'Government sites, as they are public'], answer: 1, why: 'Use labs built for practice, or systems you own.' },
      ],
    },
    {
      id: 'ethhack-recon',
      title: 'Reading scan results like a tester',
      minutes: 25,
      kind: 'code',
      outline: 'Turn raw service-scan output into a list of exposed services and flag the risky ones.',
      body: `## From a scan to a picture of the target

After scanning an **in-scope** host, a tester gets lines like these (a simplified version of what tools such as Nmap print):

\`\`\`text
21/tcp   open     ftp       vsftpd 2.3.4
22/tcp   open     ssh       OpenSSH 8.9
23/tcp   open     telnet
80/tcp   open     http      nginx 1.18.0
443/tcp  open     https     nginx 1.18.0
3306/tcp filtered mysql
3389/tcp closed   ms-wbt-server
\`\`\`

- **open**: something answers on that port.
- **closed**: nothing listens there.
- **filtered**: a firewall stops the probe, so the state is unknown.

The skill is **judgement**: which open services should not be reachable from the internet, or are old?

## Red flags

- **Plain-text protocols**: telnet (23) and FTP (21) send passwords unencrypted. Use SSH and SFTP instead.
- **Databases and admin services on the internet**: MySQL (3306), PostgreSQL (5432), MongoDB (27017), Redis (6379), remote desktop (3389) should sit behind a firewall or VPN.
- **Old versions**: a version number lets you look up known vulnerabilities (CVEs) in public databases such as NVD. Old software is one of the commonest real findings.

Defenders run the same checks on their own systems: "attack surface management".

## Your task

1. \`parseScan(text)\`: return an array of \`{ port, proto, state, service, version }\` for every line that starts with a port like \`22/tcp\`. \`port\` is a number; \`version\` is the rest of the line after the service (trimmed), or \`''\`.
2. \`openServices(rows)\`: only the rows whose state is \`'open'\`.
3. \`flags(rows)\`: for each **open** row, return a message when it is risky:
   - service \`telnet\` or \`ftp\`: \`"PORT SERVICE: sends passwords unencrypted"\`
   - port in \`RISKY_EXPOSED\`: \`"PORT SERVICE: should not be reachable from the internet"\`
   (Check unencrypted first; one message per row at most.)`,
      task: 'Write parseScan, openServices and flags.',
      starter: `<script>
  const RISKY_EXPOSED = [3306, 5432, 27017, 6379, 3389, 445]
  const SCAN = \`Starting scan of 192.0.2.10 (in scope: test-server)
21/tcp   open     ftp       vsftpd 2.3.4
22/tcp   open     ssh       OpenSSH 8.9
23/tcp   open     telnet
80/tcp   open     http      nginx 1.18.0
3306/tcp open     mysql     MySQL 5.5.62
3389/tcp closed   ms-wbt-server
5432/tcp filtered postgresql
Scan done\`

  function parseScan(text) {
  }
  function openServices(rows) {
  }
  function flags(rows) {
  }
</script>
`,
      checks: [
        { label: 'parses every port line', test: `const r = parseScan(SCAN); return r.length === 7 && r[0].port === 21 && r[0].proto === 'tcp' && r[0].service === 'ftp' && r[0].version === 'vsftpd 2.3.4'` },
        { label: 'missing versions are empty text', test: `return parseScan(SCAN).find(r => r.port === 23).version === ''` },
        { label: 'only open services', test: `return openServices(parseScan(SCAN)).map(r => r.port).join() === '21,22,23,80,3306'` },
        { label: 'unencrypted logins flagged', test: `const f = flags(parseScan(SCAN)); return f.includes('21 ftp: sends passwords unencrypted') && f.includes('23 telnet: sends passwords unencrypted')` },
        { label: 'exposed database flagged, closed and filtered ignored', test: `const f = flags(parseScan(SCAN)); return f.includes('3306 mysql: should not be reachable from the internet') && f.length === 3` },
      ],
      hint: "parseScan: text.split('\\n').map(l => l.trim()).filter(l => /^\\d+\\/(tcp|udp)\\s/.test(l)).map(l => { const [pp, state, service, ...rest] = l.split(/\\s+/); const [port, proto] = pp.split('/'); return { port: Number(port), proto, state, service, version: rest.join(' ') } })",
      solution: `<script>
  const RISKY_EXPOSED = [3306, 5432, 27017, 6379, 3389, 445]
  const SCAN = \`Starting scan of 192.0.2.10 (in scope: test-server)
21/tcp   open     ftp       vsftpd 2.3.4
22/tcp   open     ssh       OpenSSH 8.9
23/tcp   open     telnet
80/tcp   open     http      nginx 1.18.0
3306/tcp open     mysql     MySQL 5.5.62
3389/tcp closed   ms-wbt-server
5432/tcp filtered postgresql
Scan done\`
  function parseScan(text) {
    return text.split('\\n').map((l) => l.trim()).filter((l) => /^\\d+\\/(tcp|udp)\\s/.test(l)).map((l) => {
      const [pp, state, service, ...rest] = l.split(/\\s+/)
      const [port, proto] = pp.split('/')
      return { port: Number(port), proto, state, service, version: rest.join(' ') }
    })
  }
  function openServices(rows) { return rows.filter((r) => r.state === 'open') }
  function flags(rows) {
    const out = []
    for (const r of openServices(rows)) {
      if (r.service === 'telnet' || r.service === 'ftp') out.push(r.port + ' ' + r.service + ': sends passwords unencrypted')
      else if (RISKY_EXPOSED.includes(r.port)) out.push(r.port + ' ' + r.service + ': should not be reachable from the internet')
    }
    return out
  }
</script>`,
    },
    {
      id: 'ethhack-injection',
      title: 'Injection flaws: how they happen and how they are fixed',
      minutes: 30,
      kind: 'code',
      outline: 'Why mixing data into commands is dangerous, and build the fix: parameterised queries and allow-lists.',
      body: `## Data that turns into commands

**Injection** happens when an app builds a command (an SQL query, a shell command, an LDAP or template expression) by **gluing user input into the command text**. If the input contains the command language's special characters, it changes what the command does.

A login check built like this:

\`\`\`js
"SELECT * FROM users WHERE email = '" + email + "' AND password_hash = '" + hash + "'"
\`\`\`

lets input containing a quote end the string early and add its own conditions. Testers find these by sending carefully chosen characters (a single quote, for instance) to every input and watching for errors or changed behaviour, **only in scope**.

## The real fix: parameterised queries

Never build commands from strings. Send the command and the data **separately**: the database treats the data purely as a value, whatever characters it contains.

\`\`\`js
db.query('SELECT * FROM users WHERE email = $1', [email])   // node-postgres
supabase.from('users').select().eq('email', email)           // query builders do this for you
\`\`\`

Also:

- **Allow-lists** for things that cannot be parameters (column names for sorting, table names): only accept values from a fixed list.
- **Least privilege**: the app's database account should not be able to drop tables or read other apps' data.
- **Do not show database errors** to users; log them on the server.
- "Escaping" or blocking bad words (blacklists) is fragile and easy to get wrong. Detection is useful for **logging and alerts**, never as the defence.

## Your task

1. \`query(sql, params)\`: a safe query **object** builder. Count the \`?\` placeholders in \`sql\`; if the number of \`params\` differs, throw an Error. Return \`{ text, values }\` where \`text\` has each \`?\` replaced by \`$1\`, \`$2\`, … (in order) and \`values\` is a copy of params. User data never goes into \`text\`.
2. \`sortColumn(input)\`: return \`input\` if it is one of \`ALLOWED_SORT\`, otherwise \`'created_at'\`.
3. \`looksSuspicious(input)\`: for **logging only**, true if the text contains a single quote followed later by \`or\`/\`and\` (any case) or contains \`--\`, \`;\` or \`/*\`.`,
      task: 'Write query, sortColumn and looksSuspicious.',
      starter: `<script>
  const ALLOWED_SORT = ['created_at', 'name', 'price', 'stock']

  function query(sql, params) {
  }
  function sortColumn(input) {
  }
  function looksSuspicious(input) {
  }
</script>
`,
      checks: [
        { label: 'placeholders become $1, $2', test: `const q = query('SELECT * FROM users WHERE email = ? AND active = ?', ['a@b.ng', true]); return q.text === 'SELECT * FROM users WHERE email = $1 AND active = $2' && q.values[0] === 'a@b.ng'` },
        { label: 'input never enters the query text', test: `const evil = "x' OR '1'='1"; const q = query('SELECT * FROM users WHERE email = ?', [evil]); return !q.text.includes(evil) && q.values[0] === evil` },
        { label: 'wrong number of values is refused', test: `try { query('SELECT ? , ?', [1]); return false } catch { return true }` },
        { label: 'values are copied', test: `const p = [1]; const q = query('SELECT ?', p); p.push(2); return q.values.length === 1` },
        { label: 'sort columns come from an allow-list', test: `return sortColumn('price') === 'price' && sortColumn('price; DROP TABLE users') === 'created_at'` },
        { label: 'suspicious input is noticed for the logs', test: `return looksSuspicious("x' or 1=1") && looksSuspicious('a -- b') && !looksSuspicious("O'Neil") && !looksSuspicious('Mama Nkechi')` },
      ],
      hint: "query: const n = (sql.match(/\\?/g) || []).length; if (n !== params.length) throw new Error('wrong number of values'); let i = 0; return { text: sql.replace(/\\?/g, () => '$' + (++i)), values: [...params] }",
      solution: `<script>
  const ALLOWED_SORT = ['created_at', 'name', 'price', 'stock']
  function query(sql, params) {
    const n = (sql.match(/\\?/g) || []).length
    if (n !== params.length) throw new Error('wrong number of values')
    let i = 0
    return { text: sql.replace(/\\?/g, () => '$' + ++i), values: [...params] }
  }
  function sortColumn(input) { return ALLOWED_SORT.includes(input) ? input : 'created_at' }
  function looksSuspicious(input) { return /'.*\\b(or|and)\\b/i.test(input) || /--|;|\\/\\*/.test(input) }
</script>`,
    },
    {
      id: 'ethhack-sessions',
      title: 'Sessions and tokens: what testers check',
      minutes: 30,
      kind: 'code',
      outline: 'How sign-in tokens work, common token mistakes, and write the checks a server must make on a JWT.',
      body: `## Who is this request from?

After you sign in, a web app gives your browser a **session cookie** or a **token** that proves who you are on every request. If an attacker can steal, guess, forge or reuse it, they become you. Testers check:

- **Cookies**: \`HttpOnly\` (JavaScript cannot read it), \`Secure\` (only over HTTPS), \`SameSite\` (limits cross-site requests), sensible expiry, and a new session ID after sign-in.
- **Sign-out** really ends the session on the server.
- **Access control on every request**: changing an ID in the address (\`/invoices/105\`) must not show someone else's data (IDOR).
- **Tokens**: especially **JSON Web Tokens (JWTs)**.

## JWTs in one minute

A JWT has three parts separated by dots: \`header.payload.signature\`, each **base64url**-encoded. The header says which algorithm signed it (\`alg\`), the payload holds **claims** such as \`sub\` (user), \`exp\` (expiry, in seconds since 1970), \`iss\` (issuer) and \`aud\` (audience). The signature proves the server made it.

**Anyone can decode** a JWT: it is signed, not secret. Never put passwords or private data in it.

Classic mistakes testers look for (and servers must prevent):

- Accepting \`"alg": "none"\` (no signature at all)
- Not checking \`exp\`, so stolen tokens work forever
- Not checking \`iss\` and \`aud\`, so a token for another app is accepted
- Weak signing secrets that can be guessed
- Trusting claims like \`"role": "admin"\` without verifying the signature first

## Your task

1. \`decodePart(part)\`: base64url → text → JSON. (base64url uses \`-\` and \`_\` instead of \`+\` and \`/\`, and may drop the \`=\` padding; \`atob\` needs standard base64.)
2. \`checkClaims(token, now, expected)\`: **after** a real signature check (done elsewhere by a library), apply the claim rules. Return a list of problems (empty if fine):
   - \`'alg none not allowed'\` if the header's \`alg\` is \`none\` (any case)
   - \`'expired'\` if \`exp\` is missing or \`exp <= now\` (\`now\` in seconds)
   - \`'wrong issuer'\` if \`iss !== expected.iss\`
   - \`'wrong audience'\` if \`aud\` (a string or an array) does not include \`expected.aud\`
   - \`'malformed'\` (only this) if the token does not have 3 parts or cannot be decoded.`,
      task: 'Write decodePart and checkClaims.',
      starter: `<script>
  // makes test tokens (unsigned: the signature check is a library's job; we check the claims)
  const b64u = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')
  const make = (h, p) => b64u(h) + '.' + b64u(p) + '.sig'

  function decodePart(part) {
  }
  function checkClaims(token, now, expected) {
  }
</script>
`,
      checks: [
        { label: 'decodes base64url without padding', test: `return decodePart(b64u({ sub: 'u1', name: 'Ada?>' })).name === 'Ada?>'` },
        { label: 'a good token has no problems', test: `return checkClaims(make({ alg: 'HS256' }, { iss: 'cdm', aud: 'shop', exp: 2000 }), 1000, { iss: 'cdm', aud: 'shop' }).length === 0` },
        { label: 'alg none is refused', test: `return checkClaims(make({ alg: 'None' }, { iss: 'cdm', aud: 'shop', exp: 2000 }), 1000, { iss: 'cdm', aud: 'shop' }).includes('alg none not allowed')` },
        { label: 'expired or missing exp', test: `const e = { iss: 'cdm', aud: 'shop' }; return checkClaims(make({ alg: 'HS256' }, { iss: 'cdm', aud: 'shop', exp: 1000 }), 1000, e).includes('expired') && checkClaims(make({ alg: 'HS256' }, { iss: 'cdm', aud: 'shop' }), 1, e).includes('expired')` },
        { label: 'issuer and audience (string or list)', test: `const e = { iss: 'cdm', aud: 'shop' }; const a = checkClaims(make({ alg: 'HS256' }, { iss: 'evil', aud: ['blog'], exp: 2000 }), 1000, e); const b = checkClaims(make({ alg: 'HS256' }, { iss: 'cdm', aud: ['blog', 'shop'], exp: 2000 }), 1000, e); return a.includes('wrong issuer') && a.includes('wrong audience') && b.length === 0` },
        { label: 'malformed tokens', test: `const e = { iss: 'cdm', aud: 'shop' }; return JSON.stringify(checkClaims('abc', 1, e)) === '["malformed"]' && JSON.stringify(checkClaims('a.b.c', 1, e)) === '["malformed"]'` },
      ],
      hint: "decodePart: let s = part.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(atob(s)). In checkClaims, wrap the decoding in try/catch and return ['malformed'] on failure.",
      solution: `<script>
  const b64u = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')
  const make = (h, p) => b64u(h) + '.' + b64u(p) + '.sig'
  function decodePart(part) { let s = part.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(atob(s)) }
  function checkClaims(token, now, expected) {
    const parts = String(token).split('.')
    if (parts.length !== 3) return ['malformed']
    let h, p
    try { h = decodePart(parts[0]); p = decodePart(parts[1]) } catch { return ['malformed'] }
    const out = []
    if (String(h.alg).toLowerCase() === 'none') out.push('alg none not allowed')
    if (typeof p.exp !== 'number' || p.exp <= now) out.push('expired')
    if (p.iss !== expected.iss) out.push('wrong issuer')
    const aud = Array.isArray(p.aud) ? p.aud : [p.aud]
    if (!aud.includes(expected.aud)) out.push('wrong audience')
    return out
  }
</script>`,
    },
    {
      id: 'ethhack-risk',
      title: 'Rating and prioritising findings',
      minutes: 25,
      kind: 'code',
      outline: 'Likelihood and impact, CVSS severity bands, and sort a list of findings so the worst get fixed first.',
      body: `## Not every bug is an emergency

A test may find 40 issues. The client needs to know **which to fix this week**. Testers rate each finding by:

- **Likelihood / exploitability**: can it be reached from the internet? Does it need a login or special conditions? Is there public exploit code?
- **Impact**: confidentiality, integrity and availability (the CIA triad): could an attacker read all customer data, change payments, or take the service down?

The industry standard is **CVSS** (Common Vulnerability Scoring System), which turns these factors into a score from **0.0 to 10.0** with severity bands:

| Score | Severity |
|---|---|
| 0.0 | None |
| 0.1 to 3.9 | Low |
| 4.0 to 6.9 | Medium |
| 7.0 to 8.9 | High |
| 9.0 to 10.0 | Critical |

Context matters: the same weakness is more urgent on an internet-facing payment page than on an internal test server. Good reports give the CVSS score **and** a plain-language business impact.

## Your task

1. \`severity(score)\`: the band name for a score (use the table; scores outside 0..10 throw an Error).
2. \`prioritise(findings)\`: \`findings\` are \`{ title, score, internet }\`. Sort so that higher scores come first; for equal scores, internet-facing (\`internet: true\`) first; then by title A to Z. Return a new array of \`{ title, score, severity }\` without changing the input.
3. \`summary(findings)\`: an object counting findings per severity, e.g. \`{ Critical: 1, High: 2, Medium: 0, Low: 1, None: 0 }\` (all five keys always present).`,
      task: 'Write severity, prioritise and summary.',
      starter: `<script>
  const FINDINGS = [
    { title: 'Outdated jQuery on blog', score: 4.3, internet: true },
    { title: 'SQL injection in login', score: 9.8, internet: true },
    { title: 'Missing HttpOnly on session cookie', score: 5.4, internet: true },
    { title: 'Default admin password on test server', score: 9.8, internet: false },
    { title: 'Verbose error messages', score: 3.1, internet: true },
  ]
  function severity(score) {
  }
  function prioritise(findings) {
  }
  function summary(findings) {
  }
</script>
`,
      checks: [
        { label: 'severity bands', test: `return severity(0) === 'None' && severity(3.9) === 'Low' && severity(4) === 'Medium' && severity(7) === 'High' && severity(9) === 'Critical' && severity(10) === 'Critical'` },
        { label: 'scores outside 0 to 10 are refused', test: `try { severity(11); return false } catch { return true }` },
        { label: 'worst first, internet-facing breaks ties', test: `return prioritise(FINDINGS).map(f => f.title).slice(0, 2).join('|') === 'SQL injection in login|Default admin password on test server'` },
        { label: 'each row gets its severity, input unchanged', test: `const p = prioritise(FINDINGS); return p[4].severity === 'Low' && FINDINGS[0].title === 'Outdated jQuery on blog' && !('severity' in FINDINGS[0])` },
        { label: 'summary counts every band', test: `return JSON.stringify(summary(FINDINGS)) === JSON.stringify({ Critical: 2, High: 0, Medium: 2, Low: 1, None: 0 })` },
      ],
      hint: "prioritise: [...findings].sort((a, b) => b.score - a.score || Number(b.internet) - Number(a.internet) || a.title.localeCompare(b.title)).map(f => ({ title: f.title, score: f.score, severity: severity(f.score) }))",
      solution: `<script>
  const FINDINGS = [
    { title: 'Outdated jQuery on blog', score: 4.3, internet: true }, { title: 'SQL injection in login', score: 9.8, internet: true },
    { title: 'Missing HttpOnly on session cookie', score: 5.4, internet: true }, { title: 'Default admin password on test server', score: 9.8, internet: false },
    { title: 'Verbose error messages', score: 3.1, internet: true },
  ]
  function severity(s) {
    if (!(s >= 0 && s <= 10)) throw new Error('score must be 0 to 10')
    return s === 0 ? 'None' : s < 4 ? 'Low' : s < 7 ? 'Medium' : s < 9 ? 'High' : 'Critical'
  }
  function prioritise(findings) {
    return [...findings].sort((a, b) => b.score - a.score || Number(b.internet) - Number(a.internet) || a.title.localeCompare(b.title)).map((f) => ({ title: f.title, score: f.score, severity: severity(f.score) }))
  }
  function summary(findings) {
    const out = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 }
    for (const f of findings) out[severity(f.score)]++
    return out
  }
</script>`,
    },
    {
      id: 'ethhack-logs',
      title: 'The blue-team view: spotting attacks in logs',
      minutes: 25,
      kind: 'code',
      outline: 'What scans, brute force and probing look like in web server logs, and build a simple detector.',
      body: `## Every test leaves footprints

Defenders (the **blue team**) watch logs for the same activity testers (the **red team**) create. Knowing both sides makes you better at each, and many careers start in the Security Operations Centre (SOC).

A web server access log line typically records the client IP, time, request, status code and user agent:

\`\`\`text
203.0.113.7 [2026-11-20T10:01:03Z] "GET /wp-login.php" 404 "sqlmap/1.7"
\`\`\`

Patterns that matter:

- **Brute force**: many \`401\` (unauthorised) responses to a login page from one IP in a short time.
- **Directory scanning / probing**: many \`404\` (not found) responses from one IP, often for \`/wp-admin\`, \`/.env\`, \`/.git/config\`, \`/phpmyadmin\`.
- **Known tool user agents**: scanners often announce themselves (\`sqlmap\`, \`nikto\`, \`nmap\`, \`masscan\`), though real attackers can change this.
- **Sensitive paths**: requests for \`/.env\` or \`/.git\` show someone hunting for leaked secrets.

Responses: rate-limit or block the IP, check whether any request **succeeded** (a \`200\` after many \`401\`s is an alarm), and make sure those files are never served.

## Your task

Log lines look like the example above. Write:

1. \`parseLine(line)\`: \`{ ip, path, status, agent }\` (status as a number), or \`null\` if the line does not match.
2. \`detect(lines, limit)\`: return alerts as strings, in this order per IP (IPs in order of first appearance):
   - \`"IP brute force: N failed logins"\` if more than \`limit\` responses with status 401
   - \`"IP scanning: N not-found requests"\` if more than \`limit\` responses with status 404
   - \`"IP scanner tool: AGENT"\` (once per IP) if the agent contains sqlmap, nikto, nmap or masscan (any case)
   - \`"IP asked for secrets: PATH"\` (once per IP, the first such path) if a path starts with \`/.env\` or \`/.git\``,
      task: 'Write parseLine and detect.',
      starter: `<script>
  const LOG = [
    '203.0.113.7 [2026-11-20T10:01:03Z] "GET /wp-login.php" 404 "sqlmap/1.7"',
    '203.0.113.7 [2026-11-20T10:01:04Z] "GET /.env" 404 "sqlmap/1.7"',
    '203.0.113.7 [2026-11-20T10:01:05Z] "GET /admin" 404 "sqlmap/1.7"',
    '198.51.100.4 [2026-11-20T10:02:00Z] "POST /login" 401 "Mozilla/5.0"',
    '198.51.100.4 [2026-11-20T10:02:01Z] "POST /login" 401 "Mozilla/5.0"',
    '198.51.100.4 [2026-11-20T10:02:02Z] "POST /login" 401 "Mozilla/5.0"',
    '198.51.100.4 [2026-11-20T10:02:03Z] "POST /login" 200 "Mozilla/5.0"',
    '192.0.2.50 [2026-11-20T10:03:00Z] "GET /" 200 "Mozilla/5.0"',
    'garbage line',
  ]
  function parseLine(line) {
  }
  function detect(lines, limit) {
  }
</script>
`,
      checks: [
        { label: 'parses a line', test: `const p = parseLine(LOG[0]); return p.ip === '203.0.113.7' && p.path === '/wp-login.php' && p.status === 404 && p.agent === 'sqlmap/1.7'` },
        { label: 'bad lines are null', test: `return parseLine('garbage line') === null` },
        { label: 'brute force found', test: `return detect(LOG, 2).includes('198.51.100.4 brute force: 3 failed logins')` },
        { label: 'scanning, tools and secret hunting found', test: `const d = detect(LOG, 2); return d.includes('203.0.113.7 scanning: 3 not-found requests') && d.includes('203.0.113.7 scanner tool: sqlmap/1.7') && d.includes('203.0.113.7 asked for secrets: /.env')` },
        { label: 'normal visitors raise nothing; order is per IP', test: `const d = detect(LOG, 2); return !d.some(x => x.startsWith('192.0.2.50')) && d.length === 4 && d[0].startsWith('203.0.113.7 scanning')` },
      ],
      hint: 'parseLine: const m = /^(\\S+) \\[[^\\]]+\\] "\\w+ (\\S+)" (\\d{3}) "([^"]*)"$/.exec(line); if (!m) return null. detect: group parsed lines by ip in an object (keep an array of IPs for order).',
      solution: `<script>
  const LOG = [
    '203.0.113.7 [2026-11-20T10:01:03Z] "GET /wp-login.php" 404 "sqlmap/1.7"', '203.0.113.7 [2026-11-20T10:01:04Z] "GET /.env" 404 "sqlmap/1.7"',
    '203.0.113.7 [2026-11-20T10:01:05Z] "GET /admin" 404 "sqlmap/1.7"', '198.51.100.4 [2026-11-20T10:02:00Z] "POST /login" 401 "Mozilla/5.0"',
    '198.51.100.4 [2026-11-20T10:02:01Z] "POST /login" 401 "Mozilla/5.0"', '198.51.100.4 [2026-11-20T10:02:02Z] "POST /login" 401 "Mozilla/5.0"',
    '198.51.100.4 [2026-11-20T10:02:03Z] "POST /login" 200 "Mozilla/5.0"', '192.0.2.50 [2026-11-20T10:03:00Z] "GET /" 200 "Mozilla/5.0"', 'garbage line',
  ]
  function parseLine(line) {
    const m = /^(\\S+) \\[[^\\]]+\\] "\\w+ (\\S+)" (\\d{3}) "([^"]*)"$/.exec(line)
    return m ? { ip: m[1], path: m[2], status: Number(m[3]), agent: m[4] } : null
  }
  function detect(lines, limit) {
    const by = {}, order = []
    for (const l of lines) { const p = parseLine(l); if (!p) continue; if (!by[p.ip]) { by[p.ip] = []; order.push(p.ip) } by[p.ip].push(p) }
    const out = []
    for (const ip of order) {
      const r = by[ip]
      const n401 = r.filter((x) => x.status === 401).length, n404 = r.filter((x) => x.status === 404).length
      if (n401 > limit) out.push(ip + ' brute force: ' + n401 + ' failed logins')
      if (n404 > limit) out.push(ip + ' scanning: ' + n404 + ' not-found requests')
      const tool = r.find((x) => /sqlmap|nikto|nmap|masscan/i.test(x.agent))
      if (tool) out.push(ip + ' scanner tool: ' + tool.agent)
      const sec = r.find((x) => x.path.startsWith('/.env') || x.path.startsWith('/.git'))
      if (sec) out.push(ip + ' asked for secrets: ' + sec.path)
    }
    return out
  }
</script>`,
    },
    {
      id: 'ethhack-report',
      title: 'Reporting, disclosure and your security career',
      minutes: 20,
      kind: 'prompt',
      outline: 'Write findings clients act on, report bugs responsibly, and plan certifications and a portfolio.',
      body: `## A finding clients can act on

Each finding in a professional report has:

1. **Title**: short and specific. *"SQL injection in /login lets anyone sign in as any user"*
2. **Severity**: CVSS score and band, plus business impact in plain words
3. **Affected assets**: exact addresses, parameters, versions
4. **Description**: what is wrong, in language a manager understands
5. **Evidence**: steps to reproduce at a safe level, screenshots, request and response (with real personal data **removed**)
6. **Recommendation**: the fix (parameterised queries, update to version X, turn on HttpOnly), and how to verify it
7. **References**: OWASP, CWE number, vendor advisory

The report opens with an **executive summary**: overall risk, the top 3 issues, and what to do first. It ends with what was **not** tested.

## Responsible disclosure in practice

- Report through the official channel (security.txt, a security@ email, the bug bounty page)
- Include enough to reproduce, nothing more; never threaten or demand payment
- Agree a timeline; follow up politely
- In a bounty programme, follow its rules exactly; duplicates and out-of-scope reports are normal, learn and move on

## Building a career

- **Foundations**: networking (TCP/IP, DNS, HTTP), Linux command line, one scripting language (Python or JavaScript), and web basics. Your CDM Studio courses in Cybersecurity, Cloud and Web cover much of this.
- **Hands-on practice**: TryHackMe paths, Hack The Box, PortSwigger Academy, CTFs. Write up what you learn (without spoiling live challenges).
- **Certifications employers ask for**: CompTIA Security+ and PenTest+, **eJPT** (entry, hands-on), **PNPT**, **CEH**, and the respected **OSCP** (hard, practical exam). Cloud and web certifications follow (OSWE, BSCP).
- **Jobs**: SOC analyst and vulnerability management roles are common entry points; junior penetration tester after hands-on certifications; freelance bug bounty alongside.
- **Reputation is everything**: in security, trust is the job. One illegal "test" can end a career before it starts.

## Practise

Ask the tutor to help you turn a lab finding into a professional write-up.`,
      practice: 'Describe a finding from a legal practice lab (for example: "In OWASP Juice Shop, the product search box showed a database error when I typed a single quote"). Ask the AI to help you write it up as a professional finding with title, severity and business impact, affected asset, description, safe reproduction steps, recommendation and references. Then ask it to write a 3-sentence executive summary.',
    },
  ],
  exam: [
    { q: 'What separates ethical hacking from a crime?', options: ['Good intentions', 'Written permission from the system owner, within an agreed scope', 'Using well-known tools', 'Not changing any data'], answer: 1, why: 'Authorisation and scope are what make testing legal.' },
    { q: 'Which Nigerian law makes unauthorised access to computer systems an offence?', options: ['The Cybercrimes (Prohibition, Prevention, etc.) Act 2015', 'The Companies and Allied Matters Act', 'The Evidence Act only', 'There is none'], answer: 0, why: 'The Cybercrimes Act covers unauthorised access.' },
    { q: 'Rules of engagement typically define…', options: ['The tester\'s salary', 'Dates, allowed techniques, data handling and emergency contacts', 'The company logo', 'Only the final report format'], answer: 1, why: 'They set the boundaries of the test.' },
    { q: 'A bug bounty programme is…', options: ['Permission to test anything the company owns, any way', 'Public permission to test specific targets under specific rules, with rewards', 'A way to sell stolen data', 'An insurance policy'], answer: 1, why: 'Its policy is the permission and its limits.' },
    { q: 'Passive reconnaissance means…', options: ['Running exploits slowly', 'Gathering information from public sources without touching the target', 'Scanning every port', 'Phishing staff'], answer: 1, why: 'Passive recon does not interact with the target systems.' },
    { q: 'In a scan, "filtered" usually means…', options: ['The service is definitely off', 'A firewall blocked the probe, so the state is unknown', 'The service is open', 'The scan failed completely'], answer: 1, why: 'Filtered ports did not answer due to filtering.' },
    { q: 'Why is an internet-reachable telnet service a finding?', options: ['It is slow', 'It sends passwords unencrypted', 'It uses too much memory', 'It cannot be logged'], answer: 1, why: 'Use SSH instead.' },
    { q: 'A database port (e.g. 3306) open to the whole internet should be…', options: ['Left as it is', 'Restricted behind a firewall or VPN', 'Moved to port 80', 'Renamed'], answer: 1, why: 'Databases should not be directly exposed.' },
    { q: 'The correct fix for SQL injection is…', options: ['Blocking words like SELECT', 'Parameterised queries (data sent separately from the command)', 'Hiding the login page', 'Longer passwords'], answer: 1, why: 'Parameters can never change the query structure.' },
    { q: 'A sort column chosen by the user should be checked with…', options: ['An allow-list of permitted column names', 'A blacklist of bad words', 'Nothing', 'A CAPTCHA'], answer: 0, why: 'Identifiers cannot be parameters, so allow-list them.' },
    { q: 'Anyone who has a JWT can…', options: ['Change its claims without detection', 'Decode and read its payload', 'Never read it', 'Make the server accept "alg: none" safely'], answer: 1, why: 'JWTs are signed, not encrypted.' },
    { q: 'A server receives a JWT with "alg": "none". It should…', options: ['Accept it if exp is valid', 'Refuse it', 'Accept it for admins only', 'Log the user in as a guest'], answer: 1, why: 'Unsigned tokens must never be trusted.' },
    { q: 'Changing /invoices/105 to /invoices/106 shows another customer\'s invoice. This is…', options: ['IDOR (broken access control)', 'Cross-site scripting', 'A strong design', 'Rate limiting'], answer: 0, why: 'The server failed to check ownership.' },
    { q: 'Which cookie setting stops JavaScript from reading a session cookie?', options: ['Secure', 'HttpOnly', 'Path', 'Domain'], answer: 1, why: 'HttpOnly hides it from scripts.' },
    { q: 'A CVSS score of 9.8 is…', options: ['Medium', 'High', 'Critical', 'Low'], answer: 2, why: '9.0 to 10.0 is Critical.' },
    { q: 'Two findings both score 9.8; one is internet-facing. Which first?', options: ['The internal one', 'The internet-facing one', 'Either, they are equal in every way', 'Neither'], answer: 1, why: 'Exposure raises real-world likelihood.' },
    { q: 'Many 401 responses for /login from one IP, then a 200, suggests…', options: ['A normal user', 'A brute-force attack that may have succeeded', 'A broken server', 'A search engine'], answer: 1, why: 'Investigate the successful sign-in at once.' },
    { q: 'Requests for /.env and /.git/config show someone…', options: ['Looking for leaked secrets and source code', 'Reading the blog', 'Updating the site', 'Testing fonts'], answer: 0, why: 'Those files often hold credentials.' },
    { q: 'Evidence in a pentest report should…', options: ['Include all customer data found', 'Prove the issue with personal data removed', 'Be left out', 'Be posted publicly'], answer: 1, why: 'Prove, minimise and protect data.' },
    { q: 'A respected, hands-on penetration testing certification with a practical exam is…', options: ['OSCP', 'PL-300', 'AZ-900', 'ICAN ATS'], answer: 0, why: 'OSCP is a well-known practical pentest certification.' },
  ],
}
