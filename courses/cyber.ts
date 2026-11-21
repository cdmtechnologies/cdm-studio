import type { Course } from './types'
import { cyberMore, cyberProject } from './extra/cyber'

export const cyber: Course = {
  id: 'cyber',
  title: 'Cybersecurity essentials',
  blurb: 'Protect people, businesses and websites: passwords, phishing, encryption, secure web code and incident response.',
  emoji: '🛡️',
  colour: 'emerald',
  level: 'Beginner',
  hours: 8,
  free: 2,
  skills: ['Threat thinking', 'Password and account security', 'Phishing and scam spotting', 'Hashing and encryption', 'Secure web code (XSS, input checks)', 'Incident response'],
  careers: ['IT support', 'SOC analyst (junior)', 'Security-aware developer', 'Small business IT lead'],
  lessons: [
    {
      id: 'cyber-mindset',
      title: 'Think like an attacker, act like a defender',
      minutes: 15,
      kind: 'read',
      outline: 'The CIA triad, threats, vulnerabilities and risk.',
      body: `## Why security matters to everyone

Every business now runs on data: customer phone numbers, sales records, bank details, staff salaries. When that data is stolen, changed or locked away, the business can stop overnight. Cybersecurity is the work of keeping it **safe, correct and available**.

## The CIA triad

Security people check every system against three goals:

- **Confidentiality**: only the right people can see the data. *A payroll file is readable by HR, not by every staff member.*
- **Integrity**: the data is correct and nobody changed it without permission. *A cashier cannot quietly lower a price after a sale.*
- **Availability**: the system works when it is needed. *The shop's POS is up on a busy Saturday.*

When you hear about an attack, ask which of the three it hit. Ransomware hits availability (and often confidentiality). A fake bank alert hits integrity. A leaked customer list hits confidentiality.

## Threat, vulnerability, risk

- A **threat** is anything that could cause harm: a scammer, a careless employee, a flood, a power cut.
- A **vulnerability** is a weakness the threat can use: a reused password, an unpatched phone, a door with no lock.
- **Risk** = how likely the harm is × how bad it would be.

> You cannot remove every risk. Security is choosing which risks to reduce first, with the time and money you have.

## Thinking like an attacker

Attackers look for the **easiest way in**, not the cleverest. Most real attacks in small businesses start with:

1. A **stolen or guessed password** (often reused from another site that was hacked)
2. A **phishing message** that tricks someone into clicking, paying or sharing a code
3. **Unpatched software** with a known hole
4. **Too much access**: everyone uses the admin account

A defender's job is to make each of these harder, and to notice quickly when something goes wrong.

## Defence in depth

Never trust a single lock. Layer your protections so that if one fails, the next one still stops the attacker:

- Strong, unique passwords **and** two-step sign-in
- Staff who can spot scams **and** limits on what each account can do
- Backups **and** a tested plan for restoring them

## The least privilege rule

Give every person and every app **only the access they need, for only as long as they need it**. A cashier needs to sell; she does not need to delete the sales history. This one rule stops a huge share of damage.`,
      quiz: [
        { q: 'Ransomware locks a pharmacy\'s POS until they pay. Which goal is hit first?', options: ['Confidentiality', 'Integrity', 'Availability'], answer: 2, why: 'The system stops working when it is needed: that is availability.' },
        { q: 'What is a vulnerability?', options: ['A person who attacks', 'A weakness a threat can use', 'The cost of an attack'], answer: 1, why: 'A threat uses a vulnerability; risk combines how likely and how bad.' },
        { q: 'What does "least privilege" mean?', options: ['Give everyone admin so work is faster', 'Give each person only the access they need', 'Remove all passwords'], answer: 1, why: 'Limiting access limits the damage from mistakes and stolen accounts.' },
      ],
    },
    {
      id: 'cyber-passwords',
      title: 'Passwords, password managers and two-step sign-in',
      minutes: 20,
      kind: 'code',
      outline: 'What makes a password strong, and build a password strength checker.',
      body: `## Why passwords fail

Attackers rarely "guess" a password one by one. They use:

- **Credential stuffing**: trying email + password pairs leaked from other sites. If you reuse passwords, one leak opens all your accounts.
- **Dictionary attacks**: millions of common passwords and words per second (\`password123\`, \`Lagos2024\`, your child's name).
- **Phishing**: simply asking you for it on a fake page.

## What actually makes a password strong

1. **Length beats complexity.** \`correct-horse-battery-staple\` is far stronger than \`P@ss1!\`.
2. **Unique for every site.** Then a leak somewhere else does not matter.
3. **Not personal.** No names, birthdays, phone numbers or your business name.

The easy way to do all three: a **password manager** (Bitwarden, 1Password, the one built into your phone). It makes and remembers long random passwords; you remember one strong passphrase.

## Two-step sign-in (2FA)

Even a perfect password can be phished. Two-step sign-in adds something you **have** (an authenticator app code) to something you **know**. Prefer an authenticator app over SMS codes, which can be stolen with a SIM swap. **Never** read a code to anyone who calls you, even "your bank".

## Your task: a strength checker

Many sign-up forms show how strong a password is. You will write the logic. Score a password from 0 to 4:

- +1 if it is at least **12** characters long
- +1 if it has **both** lower case and upper case letters
- +1 if it has a **digit**
- +1 if it has a **symbol** (anything that is not a letter or digit)
- But if it contains a common word from the \`COMMON\` list (ignore case), the score is **0** no matter what.

Use regular expressions: \`/[a-z]/.test(p)\` is true when \`p\` has a lower case letter.`,
      task: 'Finish strength(p) so it returns a score from 0 to 4 using the rules above.',
      starter: `<h2>Password strength</h2>
<input id="pw" placeholder="Type a password" style="padding:10px;width:100%;max-width:320px">
<p id="out">Score: 0 / 4</p>
<script>
  const COMMON = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome']

  function strength(p) {
    // your code: return a number from 0 to 4
    return 0
  }

  document.getElementById('pw').addEventListener('input', (e) => {
    document.getElementById('out').textContent = 'Score: ' + strength(e.target.value) + ' / 4'
  })
</script>
`,
      checks: [
        { label: 'a short lower-case word scores 0', test: `return strength('abc') === 0` },
        { label: 'length 12+ gives a point', test: `return strength('abcdefghijkl') === 1` },
        { label: 'all four rules give 4', test: `return strength('Blue-Mango-Tree-7') === 4` },
        { label: 'mixed case and a digit, short: 2', test: `return strength('Abc9') === 2` },
        { label: 'a common word scores 0', test: `return strength('MyPassword-2026!!') === 0` },
        { label: 'common words are found in any case', test: `return strength('QWERTY-is-Long-9') === 0` },
      ],
      hint: "let s = 0; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++. Check COMMON first with p.toLowerCase().includes(word).",
      solution: `<h2>Password strength</h2>
<input id="pw">
<p id="out"></p>
<script>
  const COMMON = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome']
  function strength(p) {
    if (COMMON.some((w) => p.toLowerCase().includes(w))) return 0
    let s = 0
    if (p.length >= 12) s++
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
</script>`,
    },
    {
      id: 'cyber-phishing',
      title: 'Phishing, scams and social engineering',
      minutes: 20,
      kind: 'code',
      outline: 'How scams work, the red flags, and build a link checker that spots look-alike domains.',
      body: `## The human is the target

**Social engineering** means tricking people instead of breaking computers. It works because it uses normal human feelings: fear, urgency, greed, helpfulness and respect for authority.

Common forms:

- **Phishing** emails and **smishing** (SMS) that copy a bank, a delivery company or your boss
- **Vishing**: phone calls from "customer care" asking for your OTP or PIN
- **Fake payment alerts**: a doctored screenshot or SMS saying money was sent
- **Business email compromise**: a message that looks like it is from the MD: *"Pay this supplier urgently, I'm in a meeting."*

## Red flags

1. **Urgency or threat**: "Your account will be blocked in 1 hour."
2. **A request for secrets**: OTP, PIN, password, BVN, card details. Real banks never ask.
3. **A link that does not match**: the text says one thing, the address goes somewhere else.
4. **A look-alike domain**: \`paystack-verify.com\`, \`micros0ft.com\`, \`gtbank.secure-login.ng\`.
5. **A change of bank details** for a supplier, by email only.

## Reading a web address

In \`https://login.bank.com.evil.ng/reset\`, the real site is decided by the **end of the host name**: here it is \`evil.ng\`, not \`bank.com\`. Everything before it is just a label the attacker chose.

## The rule that saves money

**Verify through a second channel.** If a message asks for money or secrets, call the person or company on a number you already have (not the one in the message).

## Your task: a link checker

Write \`isTrusted(url, trusted)\` that returns true only when the link is **https** and its host **is** a trusted domain or **ends with "." + a trusted domain** (so \`www.paystack.com\` is fine, \`paystack.com.evil.ng\` is not). Use \`new URL(url)\`, which throws on nonsense, so wrap it in try/catch and return false.`,
      task: 'Write isTrusted(url, trusted) using new URL(...).protocol and .hostname.',
      starter: `<h2>Is this link safe?</h2>
<script>
  const TRUSTED = ['paystack.com', 'gtbank.com', 'cdmtechnologies.github.io']

  function isTrusted(url, trusted) {
    // your code
    return false
  }
</script>
`,
      checks: [
        { label: 'the real site is trusted', test: `return isTrusted('https://paystack.com/pay', TRUSTED) === true` },
        { label: 'a sub-domain of a trusted site is fine', test: `return isTrusted('https://www.gtbank.com/login', TRUSTED) === true` },
        { label: 'a look-alike ending in another domain is refused', test: `return isTrusted('https://paystack.com.verify-now.ng/pay', TRUSTED) === false` },
        { label: 'a name that only contains the domain is refused', test: `return isTrusted('https://mypaystack.com', TRUSTED) === false` },
        { label: 'http (not secure) is refused', test: `return isTrusted('http://paystack.com', TRUSTED) === false` },
        { label: 'nonsense is refused without crashing', test: `return isTrusted('not a link', TRUSTED) === false` },
      ],
      hint: "try { const u = new URL(url); if (u.protocol !== 'https:') return false; return trusted.some(d => u.hostname === d || u.hostname.endsWith('.' + d)) } catch { return false }",
      solution: `<script>
  const TRUSTED = ['paystack.com', 'gtbank.com', 'cdmtechnologies.github.io']
  function isTrusted(url, trusted) {
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:') return false
      return trusted.some((d) => u.hostname === d || u.hostname.endsWith('.' + d))
    } catch { return false }
  }
</script>`,
    },
    {
      id: 'cyber-crypto',
      title: 'Hashing and encryption in practice',
      minutes: 25,
      kind: 'code',
      outline: 'Hashing vs encryption, salts, HTTPS, and hash data with the browser\'s Web Crypto API.',
      body: `## Two different tools

- **Encryption** scrambles data with a **key** so it can be **unscrambled** later by someone with the key. Use it for data you need to read again: messages, backups, files.
- **Hashing** turns data into a fixed-length "fingerprint" that **cannot** be turned back. The same input always gives the same hash; a tiny change gives a completely different hash.

## Where hashing is used

- **Storing passwords**: a site should never store your password, only a slow, salted hash of it. When you sign in, it hashes what you typed and compares.
- **Checking files were not changed**: download pages publish the SHA-256 of a file; you hash your copy and compare.
- **Fingerprints** in apps: Android apps are identified by the SHA-256 of their signing certificate.

## Salts and slow hashes

If two people use the same password, they would get the same hash, and attackers keep huge tables of hashes for common passwords. A **salt** (random text added to each password before hashing) makes every hash unique. Password hashing must also be **slow** (bcrypt, scrypt, Argon2) so guessing billions is impractical. Plain SHA-256 is fast: great for fingerprints, wrong for passwords on its own.

## Encryption you use every day

- **HTTPS** encrypts everything between the browser and the site. Never type a password on a page without it.
- **End-to-end encryption** (WhatsApp, Signal) means only the two phones can read messages.
- **Disk encryption** (BitLocker, FileVault, phone encryption) protects a stolen laptop.

## Your task: SHA-256 in the browser

Browsers include the Web Crypto API. Hashing is **asynchronous** (it returns a Promise):

\`\`\`js
const bytes = new TextEncoder().encode('hello')
const digest = await crypto.subtle.digest('SHA-256', bytes)   // an ArrayBuffer
\`\`\`

Write \`async function sha256(text)\` that returns the hash as **64 lower-case hex characters**. Turn each byte into 2 hex digits: \`b.toString(16).padStart(2, '0')\`.

Then write \`async function sameFile(a, b)\` that returns true when the two texts have the same hash.`,
      task: 'Write sha256(text) returning lower-case hex, and sameFile(a, b) using it.',
      starter: `<h2>Fingerprints</h2>
<script>
  async function sha256(text) {
    // your code
  }

  async function sameFile(a, b) {
    // your code
  }
</script>
`,
      checks: [
        { label: 'sha256 of "hello" is right', test: `return (await sha256('hello')) === '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'` },
        { label: 'it is 64 hex characters', test: `return /^[0-9a-f]{64}$/.test(await sha256('CDM Studio'))` },
        { label: 'one letter changes everything', test: `return (await sha256('Hello')) !== (await sha256('hello'))` },
        { label: 'sameFile spots identical text', test: `return (await sameFile('invoice 42', 'invoice 42')) === true` },
        { label: 'sameFile spots a change', test: `return (await sameFile('pay 5000', 'pay 50000')) === false` },
      ],
      hint: "const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('')",
      solution: `<script>
  async function sha256(text) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  async function sameFile(a, b) { return (await sha256(a)) === (await sha256(b)) }
</script>`,
    },
    {
      id: 'cyber-xss',
      title: 'Secure web code: stop XSS',
      minutes: 25,
      kind: 'code',
      outline: 'How cross-site scripting works, and make a comment wall safe by escaping and using textContent.',
      body: `## Untrusted input is dangerous

Any text that comes from a user (a name, a comment, a search, a product review) may contain code. If your page puts that text into the HTML as **HTML**, the browser runs it. This is **cross-site scripting (XSS)**, one of the most common web attacks.

Example: a comment wall does

\`\`\`js
wall.innerHTML += '<li>' + comment + '</li>'
\`\`\`

and someone posts \`<img src=x onerror="steal()">\`. Every visitor's browser now runs \`steal()\`, which can read what they type, change prices on the page or send their session to the attacker.

## The fixes

1. **Treat input as text, not HTML.** Use \`element.textContent = value\`: the browser shows it as letters, never runs it.
2. **When you must build HTML strings, escape** the five special characters: \`&\` → \`&amp;\`, \`<\` → \`&lt;\`, \`>\` → \`&gt;\`, \`"\` → \`&quot;\`, \`'\` → \`&#39;\`. Escape \`&\` **first**, or you will escape your own escapes.
3. **Check input on the server too.** Anything in the browser can be bypassed; the server must check lengths, formats and permissions again.
4. **Never put user input into** \`eval\`, \`new Function\`, \`setTimeout("string")\` or \`href="javascript:..."\`.

## Validation vs escaping

- **Validation** says *"is this allowed?"* (an 11-digit phone, an email, a number between 1 and 100). Reject what does not fit.
- **Escaping** says *"show it safely"*. You need both.

## Your task

1. Write \`escapeHtml(s)\` that escapes all five characters.
2. Fix \`addComment(text)\` so it adds an \`<li>\` whose **textContent** is the text (no innerHTML with the comment).
3. Write \`validName(s)\`: true only for 2 to 40 characters made of letters, spaces, hyphens and apostrophes (\`/^[A-Za-z' -]{2,40}$/\`).`,
      task: 'Write escapeHtml, make addComment safe with textContent, and write validName.',
      starter: `<h2>Comment wall</h2>
<ul id="wall"></ul>
<script>
  const wall = document.getElementById('wall')

  function escapeHtml(s) {
    // your code
  }

  function addComment(text) {
    // UNSAFE: fix this line
    wall.innerHTML += '<li>' + text + '</li>'
  }

  function validName(s) {
    // your code
  }
</script>
`,
      checks: [
        { label: 'escapeHtml escapes < and >', test: `return escapeHtml('<b>') === '&lt;b&gt;'` },
        { label: 'escapeHtml escapes & first, then quotes', test: `return escapeHtml(\`a & "b" 'c'\`) === 'a &amp; &quot;b&quot; &#39;c&#39;'` },
        { label: 'a comment with code is shown as text', test: `wall.innerHTML = ''; addComment('<img src=x id=evil>'); return !document.getElementById('evil') && wall.textContent.includes('<img')` },
        { label: 'each comment is its own <li>', test: `wall.innerHTML = ''; addComment('one'); addComment('two'); return wall.querySelectorAll('li').length === 2` },
        { label: 'validName accepts real names', test: `return validName("Ngozi O'Neil-Ade") === true` },
        { label: 'validName refuses code and too short', test: `return validName('<script>') === false && validName('A') === false` },
      ],
      hint: "escapeHtml: s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;'). addComment: const li = document.createElement('li'); li.textContent = text; wall.appendChild(li)",
      solution: `<ul id="wall"></ul>
<script>
  const wall = document.getElementById('wall')
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') }
  function addComment(text) { const li = document.createElement('li'); li.textContent = text; wall.appendChild(li) }
  function validName(s) { return /^[A-Za-z' -]{2,40}$/.test(s) }
</script>`,
    },
    {
      id: 'cyber-access',
      title: 'Access control and rate limiting',
      minutes: 25,
      kind: 'code',
      outline: 'Roles and permissions, brute-force protection, and build a role check plus a login limiter.',
      body: `## Authentication vs authorisation

- **Authentication**: *who are you?* (password, two-step code, fingerprint)
- **Authorisation**: *what may you do?* (sell, refund, see salaries, change prices)

Most serious breaches inside apps are authorisation mistakes: a cashier can open the admin page by typing its address, or changing an ID in a link shows someone else's invoice (called **IDOR**, insecure direct object reference). The fix is to **check permissions on the server for every request**, not just hide buttons.

## Roles

Group permissions into roles, and give people roles:

| Role | Can |
|---|---|
| cashier | sell |
| manager | sell, refund, see reports |
| owner | everything |

Default to **deny**: if a role is unknown, or a permission is not listed, the answer is no.

## Brute force and rate limiting

An attacker can try thousands of passwords or OTP codes per minute. **Rate limiting** caps attempts: for example, after 5 failed sign-ins in 15 minutes, block that account (or IP) for a while. Always show the **same** message for "wrong email" and "wrong password" so attackers cannot learn which emails exist.

## Your task

1. Write \`can(role, action)\` using the \`ROLES\` table. Unknown roles or actions return **false**.
2. Write a limiter: \`attempt(user, ok, now)\` records a sign-in attempt at time \`now\` (milliseconds). It returns **'blocked'** if the user already has **5 failed attempts within the last 15 minutes** (before this one), otherwise **'ok'** when \`ok\` is true or **'fail'** when false. A successful sign-in clears that user's failures.`,
      task: 'Write can(role, action) and attempt(user, ok, now) as described.',
      starter: `<script>
  const ROLES = {
    cashier: ['sell'],
    manager: ['sell', 'refund', 'reports'],
    owner: ['sell', 'refund', 'reports', 'prices', 'staff'],
  }

  function can(role, action) {
    // your code
  }

  const WINDOW = 15 * 60 * 1000
  const fails = {} // user -> array of times of failed attempts

  function attempt(user, ok, now) {
    // your code
  }
</script>
`,
      checks: [
        { label: 'a cashier can sell', test: `return can('cashier', 'sell') === true` },
        { label: 'a cashier cannot refund', test: `return can('cashier', 'refund') === false` },
        { label: 'unknown roles are denied', test: `return can('hacker', 'sell') === false && can('owner', 'delete_everything') === false` },
        { label: '5 failures then blocked', test: `for (const k in fails) delete fails[k]; const t = 1e9; for (let i = 0; i < 5; i++) attempt('ada', false, t + i); return attempt('ada', true, t + 10) === 'blocked'` },
        { label: 'old failures expire after 15 minutes', test: `for (const k in fails) delete fails[k]; const t = 2e9; for (let i = 0; i < 5; i++) attempt('bayo', false, t); return attempt('bayo', true, t + 16 * 60 * 1000) === 'ok'` },
        { label: 'success clears failures', test: `for (const k in fails) delete fails[k]; const t = 3e9; for (let i = 0; i < 4; i++) attempt('chi', false, t); attempt('chi', true, t + 1); for (let i = 0; i < 4; i++) attempt('chi', false, t + 2); return attempt('chi', false, t + 3) === 'fail'` },
      ],
      hint: "can: return (ROLES[role] || []).includes(action). attempt: const recent = (fails[user] || []).filter(x => now - x < WINDOW); if (recent.length >= 5) return 'blocked'; if (ok) { fails[user] = []; return 'ok' } fails[user] = [...recent, now]; return 'fail'",
      solution: `<script>
  const ROLES = { cashier: ['sell'], manager: ['sell', 'refund', 'reports'], owner: ['sell', 'refund', 'reports', 'prices', 'staff'] }
  function can(role, action) { return Object.prototype.hasOwnProperty.call(ROLES, role) && ROLES[role].includes(action) }
  const WINDOW = 15 * 60 * 1000
  const fails = {}
  function attempt(user, ok, now) {
    const recent = (fails[user] || []).filter((x) => now - x < WINDOW)
    if (recent.length >= 5) { fails[user] = recent; return 'blocked' }
    if (ok) { fails[user] = []; return 'ok' }
    fails[user] = [...recent, now]
    return 'fail'
  }
</script>`,
    },
    {
      id: 'cyber-network',
      title: 'Networks, Wi-Fi and devices',
      minutes: 20,
      kind: 'read',
      outline: 'Firewalls, safe Wi-Fi, updates, backups and mobile device security for a small business.',
      body: `## How data travels

Your phone talks to a website through many networks: your Wi-Fi router, your internet provider, undersea cables, the website's host. Anyone in the middle could read unencrypted traffic, which is why **HTTPS everywhere** matters.

Key words:

- **IP address**: the number that identifies a device on a network.
- **Port**: a numbered "door" on a device for a service (443 for HTTPS, 22 for SSH).
- **Firewall**: rules that decide which traffic may come in or go out. Close every port you do not need.
- **VPN**: an encrypted tunnel, useful on public Wi-Fi and to reach office systems safely.

## Wi-Fi for a shop or office

1. Change the router's **default admin password** (attackers know them all).
2. Use **WPA2 or WPA3** with a long passphrase. Never "open" or WEP.
3. Put customers on a **guest network**, separate from the POS and office computers.
4. Turn off **WPS** (the push-button pairing), which is easy to attack.
5. Update the router's firmware.

## Updates are security fixes

Most attacks use holes that were **already fixed**. Turn on automatic updates for phones, computers, browsers and apps. Replace devices that no longer get updates.

## Backups: the 3-2-1 rule

- **3** copies of important data
- on **2** different kinds of storage
- with **1** copy **off-site** or offline (so ransomware cannot reach it)

A backup you have never restored is a hope, not a backup. Test a restore every few months.

## Phones and laptops

- Screen lock with a PIN, fingerprint or face
- Disk encryption on (most phones do this automatically with a screen lock)
- Install apps only from the official store
- "Find my device" on, so a lost phone can be locked or wiped
- Separate staff accounts; no shared admin passwords

## Public Wi-Fi

Assume someone is watching. Use HTTPS sites only, avoid banking or admin work, or use your phone's data or a trusted VPN.`,
      quiz: [
        { q: 'Which Wi-Fi setup is best for a shop?', options: ['One open network for everyone', 'WPA3 or WPA2, with customers on a separate guest network', 'WEP with the default password'], answer: 1, why: 'Strong encryption plus separating customers from business devices.' },
        { q: 'What is the "1" in the 3-2-1 backup rule?', options: ['One password', 'One copy off-site or offline', 'One backup a year'], answer: 1, why: 'An off-site or offline copy survives fire, theft and ransomware.' },
        { q: 'Why do updates matter for security?', options: ['They add colours', 'Most attacks use holes that updates already fixed', 'They make the device slower'], answer: 1, why: 'Unpatched software is one of the commonest ways in.' },
        { q: 'What does a firewall do?', options: ['Cools the server', 'Decides which network traffic is allowed', 'Stores passwords'], answer: 1, why: 'Firewall rules allow or block traffic by address and port.' },
      ],
    },
    {
      id: 'cyber-incident',
      title: 'Incident response: when something goes wrong',
      minutes: 20,
      kind: 'prompt',
      outline: 'The 6 steps of incident response, and practise writing a response plan with the AI tutor.',
      body: `## Breaches happen. Speed decides the damage.

**Incident response** is the plan you follow when you suspect an attack: a staff member clicked a phishing link, money left the account, files are encrypted, customers report strange messages from your number.

## The 6 steps (NIST style)

1. **Prepare**: know who to call, where backups are, how to reach your bank, and keep a list of every system and admin account.
2. **Detect and analyse**: what happened, when, which accounts and devices? Keep notes with times.
3. **Contain**: stop it spreading. Disconnect the infected computer from the network (do not switch it off: evidence lives in memory), reset passwords, sign out all sessions, freeze cards.
4. **Eradicate**: remove the cause: malware, the attacker's access, the forwarding rule they added to the email.
5. **Recover**: restore from clean backups, bring systems back carefully, watch for the attacker returning.
6. **Lessons learned**: what failed, what will change? Update the plan.

## Who to tell

- Your **bank** immediately for any money movement (minutes matter for recalls)
- **Customers** whose data was exposed, honestly and quickly, with what they should do
- The **regulator** where the law requires it (in Nigeria, the NDPA 2023 requires notifying the Nigeria Data Protection Commission of serious personal data breaches within 72 hours)
- The **police / cybercrime unit** for fraud

## Evidence

Keep screenshots, emails (with full headers), logs, transaction references and a timeline. Do not "clean up" before you have recorded what you saw.

## Practise

Use the tutor to build a one-page incident response plan for a real or imagined business. A good plan names people, phone numbers to call, and the first 5 actions in order.`,
      practice: 'Write a prompt asking the AI to create a one-page incident response plan for a business you know (say what the business is, how many staff, what systems it uses, and what format you want). Then ask it what the first 5 actions should be if a staff member reports clicking a phishing link.',
    },
    ...cyberMore,
    {
      id: 'cyber-career',
      title: 'Security careers, certifications and your portfolio',
      minutes: 15,
      kind: 'read',
      outline: 'Roles in security, the certifications employers ask for, and how to build proof of skill.',
      body: `## Where security people work

- **SOC analyst**: watches alerts in a Security Operations Centre and investigates the suspicious ones. A common first job.
- **IT support with security duties**: sets up devices, accounts, backups and 2FA for a company.
- **Penetration tester (ethical hacker)**: is paid to attack systems, with written permission, and report the holes.
- **Security engineer**: builds the defences: firewalls, identity, cloud security.
- **GRC (governance, risk, compliance)**: policies, audits, data protection (NDPA, GDPR, ISO 27001).
- **Secure developer**: writes code that resists attacks (everything you practised with XSS and access control).

## Certifications employers recognise

Start: **CompTIA Security+**, **ISC2 Certified in Cybersecurity (CC)** (often free to sit), **Google Cybersecurity Certificate**. Later: CySA+, CEH, OSCP (hands-on hacking), cloud security certificates (AWS, Azure). Your CDM Studio certificate shows the foundations and is a good first line on your CV; follow it with one of these.

## Build proof, not just certificates

- Home lab: a spare laptop with free tools, practising on deliberately vulnerable apps (OWASP Juice Shop, DVWA)
- Capture the Flag (CTF) games: TryHackMe, Hack The Box, picoCTF
- Write up what you learned in short posts; share your CDM Studio projects (your link checker, strength meter, safe comment wall)
- Help a local business: set up 2FA, backups and guest Wi-Fi, and write a one-page report

## The law and ethics

**Only test systems you own or have written permission to test.** In Nigeria the Cybercrimes Act makes unauthorised access a crime, even "just to look". Good security people are trusted because they follow this rule without exception.

## Next steps

Finish the final exam to earn your certificate, add it to LinkedIn and your CV, and pick your next certification.`,
      quiz: [
        { q: 'You find a website with a hole. What may you do?', options: ['Test it fully to prove the point', 'Only test systems you own or have written permission to test', 'Post the hole on social media'], answer: 1, why: 'Unauthorised access is illegal even with good intentions; report responsibly instead.' },
        { q: 'A good first security job that watches and investigates alerts is…', options: ['SOC analyst', 'Graphic designer', 'Database clerk'], answer: 0, why: 'Security Operations Centre analysts triage alerts; many careers start here.' },
        { q: 'Which is a widely recognised entry-level security certification?', options: ['CompTIA Security+', 'ICAN ATS', 'IELTS'], answer: 0, why: 'Security+ (and ISC2 CC) are common entry-level certificates.' },
      ],
    },
  ],
  project: cyberProject,
  exam: [
    { q: 'Ransomware encrypts a company\'s files. Which part of the CIA triad is hit first?', options: ['Confidentiality', 'Integrity', 'Availability', 'Authorisation'], answer: 2, why: 'The data cannot be used when needed.' },
    { q: 'Risk is best described as…', options: ['Any attacker', 'Likelihood × impact', 'A weakness in software', 'A firewall rule'], answer: 1, why: 'Risk combines how likely and how bad.' },
    { q: 'Which password is strongest?', options: ['P@ss1!', 'Lagos2026', 'river-tomato-candle-orbit-42', 'qwerty123456'], answer: 2, why: 'Length and randomness beat short complex passwords; the others are common patterns.' },
    { q: 'What is credential stuffing?', options: ['Guessing letters one by one', 'Trying leaked email + password pairs on other sites', 'Encrypting stolen data', 'Sending fake invoices'], answer: 1, why: 'It works because people reuse passwords.' },
    { q: 'Why is an authenticator app better than SMS codes?', options: ['It is more colourful', 'SMS can be stolen with a SIM swap', 'SMS is always slower', 'Apps never need a phone'], answer: 1, why: 'SIM swap fraud redirects SMS codes to the attacker.' },
    { q: 'In https://paystack.com.secure-pay.ng/login, which domain really controls the page?', options: ['paystack.com', 'secure-pay.ng', 'login', 'https'], answer: 1, why: 'The end of the host name decides the real site.' },
    { q: 'A supplier emails new bank details for an urgent payment. The safest action is…', options: ['Pay quickly to keep the relationship', 'Reply to the email to confirm', 'Call the supplier on a number you already had', 'Forward it to all staff'], answer: 2, why: 'Verify through a second, trusted channel.' },
    { q: 'What is the main difference between hashing and encryption?', options: ['Hashing is reversible, encryption is not', 'Encryption can be reversed with a key; hashing cannot be reversed', 'They are the same', 'Hashing needs a key'], answer: 1, why: 'Hashes are one-way fingerprints.' },
    { q: 'Why add a salt before hashing passwords?', options: ['To make hashes shorter', 'So identical passwords get different hashes and precomputed tables fail', 'To allow reversing the hash', 'To speed up sign-in'], answer: 1, why: 'Salts defeat rainbow tables and reveal nothing about shared passwords.' },
    { q: 'Which is right for storing passwords?', options: ['Plain text', 'Plain SHA-256', 'A slow salted hash such as bcrypt or Argon2', 'Base64'], answer: 2, why: 'Password hashes must be salted and slow.' },
    { q: 'A page does list.innerHTML += comment. What attack does this allow?', options: ['SQL injection', 'Cross-site scripting (XSS)', 'Brute force', 'DDoS'], answer: 1, why: 'User text is treated as HTML and can run scripts.' },
    { q: 'The safest way to show user text on a page is…', options: ['innerHTML', 'textContent', 'eval', 'document.write'], answer: 1, why: 'textContent shows text and never runs it.' },
    { q: 'When escaping HTML, which character must be replaced first?', options: ['<', '"', '&', '>'], answer: 2, why: 'Otherwise you double-escape your own entities.' },
    { q: 'Changing ?invoice=104 to ?invoice=105 shows another customer\'s invoice. This is…', options: ['IDOR, an authorisation flaw', 'A strong password', 'Encryption', 'A phishing email'], answer: 0, why: 'The server failed to check the person may see that record.' },
    { q: 'Unknown roles in an access check should get…', options: ['Full access', 'Read access', 'No access (default deny)', 'Admin after a delay'], answer: 2, why: 'Default deny is safe when something unexpected happens.' },
    { q: 'What does rate limiting sign-ins protect against?', options: ['Power cuts', 'Brute-force guessing', 'Slow internet', 'Spam folders'], answer: 1, why: 'Limiting attempts makes guessing impractical.' },
    { q: 'Customers should use the shop\'s Wi-Fi…', options: ['On the same network as the POS', 'On a separate guest network', 'With the router admin password', 'Only with WPS'], answer: 1, why: 'Keep untrusted devices away from business systems.' },
    { q: 'In the 3-2-1 backup rule, why keep one copy offline or off-site?', options: ['To save money', 'So ransomware, fire or theft cannot reach every copy', 'Because cloud is illegal', 'To make restores faster'], answer: 1, why: 'Isolation protects at least one copy.' },
    { q: 'A computer is infected. During containment you should…', options: ['Switch it off immediately and wipe it', 'Disconnect it from the network and record evidence', 'Keep using it', 'Email the malware to colleagues'], answer: 1, why: 'Isolate first; keep evidence for analysis.' },
    { q: 'Under Nigeria\'s NDPA 2023, a serious personal data breach should be reported to the regulator within…', options: ['72 hours', '30 days', '1 year', 'Never'], answer: 0, why: 'The NDPA sets a 72-hour notification duty for serious breaches.' },
  ],
}
