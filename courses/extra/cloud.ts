import type { Quiz } from '../../src/lessons/types'
import type { CourseLesson, CourseProject } from '../types'

// Advanced lessons added to Cloud and DevOps essentials (before the final costs, backups and career lesson).
export const cloudMore: CourseLesson[] = [
  {
    id: 'cloud-linux',
    title: 'The Linux command line',
    minutes: 30,
    kind: 'read',
    outline: 'Why servers run Linux, moving around the file system, reading logs, permissions, processes, SSH and package managers.',
    body: `## The language of servers

Most of the cloud runs on **Linux**: web servers, databases, containers and phones running Android all use it. Servers usually have no screen or mouse. You talk to them by typing commands into a **terminal** (the shell). It looks old-fashioned, but it is like a skilled driver using a manual gearbox: precise, fast and scriptable.

## Finding your way around

The file system is a tree of folders, starting at \`/\` (the root).

| Command | Does |
|---|---|
| \`pwd\` | print where you are |
| \`ls -la\` | list files, including hidden ones, with details |
| \`cd /var/log\` | change folder (\`cd ..\` goes up one) |
| \`mkdir backups\` | make a folder |
| \`cp a b\`, \`mv a b\`, \`rm a\` | copy, move or rename, delete (there is no recycle bin!) |
| \`cat file\`, \`less file\` | show a file (less lets you scroll; press q to quit) |
| \`nano file\` | a simple text editor |

Important places: \`/etc\` (configuration), \`/var/log\` (logs), \`/home/<name>\` (users' files), \`/tmp\` (temporary files).

## Reading logs

When something breaks, logs tell the story:

- \`tail -n 50 app.log\` shows the last 50 lines; \`tail -f app.log\` follows new lines live.
- \`grep "ERROR" app.log\` finds lines containing a word; \`grep -i\` ignores case.
- **Pipes** (\`|\`) send one command's output into the next, like a factory line: \`grep ERROR app.log | wc -l\` counts the error lines.
- \`journalctl -u nginx --since "1 hour ago"\` reads a service's logs on systems using systemd.

## Permissions

Every file has an owner, a group, and permissions to **r**ead, **w**rite and e**x**ecute, for the owner, the group and everyone else. \`ls -l\` shows them like \`-rw-r-----\`. \`chmod\` changes permissions and \`chown\` changes the owner. Secrets such as \`.env\` files should be readable by the app's user only (\`chmod 600\`). Never fix a problem with \`chmod 777\`, which lets anyone do anything.

\`sudo\` runs a command as the administrator (root). Use it only when needed, like a master key you return after use.

## Processes and services

- \`ps aux\` or \`top\` / \`htop\` show running programs and their CPU and memory use.
- \`systemctl status nginx\`, \`systemctl restart nginx\` check and restart a service.
- \`df -h\` shows disk space and \`free -h\` memory. "Disk full" is one of the most common causes of outages.

## Connecting and installing

- **SSH** connects securely to a remote server: \`ssh ada@203.0.113.10\`. Use **SSH keys** instead of passwords, and disable password login on servers.
- **Package managers** install software: \`apt\` on Ubuntu and Debian (\`sudo apt update && sudo apt upgrade\` installs security updates), \`dnf\` on Fedora and Red Hat.

## Practise safely

Use a free cloud trial, a Raspberry Pi, WSL on Windows, or the terminal on a Mac. Be careful with \`rm -rf\`: double-check the path before pressing Enter.`,
    quiz: [
      { q: 'Which command shows the last lines of a log and keeps following new ones?', options: ['cat app.log', 'tail -f app.log', 'rm app.log'], answer: 1, why: 'tail -f follows the file live.' },
      { q: 'grep ERROR app.log | wc -l…', options: ['Deletes errors', 'Counts the lines containing ERROR', 'Renames the file'], answer: 1, why: 'The pipe sends matching lines to wc -l, which counts them.' },
      { q: 'A secret .env file should be…', options: ['chmod 777 so everyone can read it', 'Readable only by the app\'s user, for example chmod 600', 'Emailed to the team'], answer: 1, why: 'Least privilege for secrets.' },
      { q: 'The safer way to sign in to servers is…', options: ['SSH keys with password login disabled', 'A short password', 'Telnet'], answer: 0, why: 'Keys resist guessing and are not sent over the network.' },
    ],
  },
  {
    id: 'cloud-network',
    title: 'Networking for the cloud',
    minutes: 35,
    kind: 'code',
    outline: 'IP addresses, CIDR ranges, private networks, ports, DNS, load balancers and firewall rules, with a CIDR checker in code.',
    body: `## Addresses, streets and gates

Every device on a network has an **IP address**, like a house number. An IPv4 address is four numbers from 0 to 255: \`203.0.113.10\`. Behind each address, programs listen on numbered **ports**, like flats in a building: web servers on 80 (HTTP) and 443 (HTTPS), SSH on 22, PostgreSQL on 5432.

## CIDR: describing a whole street at once

Cloud networks are described with **CIDR** notation, like \`10.0.0.0/16\`. The number after the slash says how many of the 32 bits are fixed (the "street name"); the rest can vary (the house numbers):

- \`/32\`: exactly one address
- \`/24\`: 256 addresses (\`10.0.1.0\` to \`10.0.1.255\`)
- \`/16\`: 65,536 addresses
- \`0.0.0.0/0\`: **every** address on the internet

The number of addresses is \`2^(32 − prefix)\`.

## Private networks

Some ranges are reserved for private networks that are not reachable from the internet: \`10.0.0.0/8\`, \`172.16.0.0/12\` and \`192.168.0.0/16\`. Your home Wi-Fi uses one, and so does a cloud **VPC** (virtual private cloud), where you split the range into **subnets**:

- **Public subnet**: the load balancer, reachable from the internet.
- **Private subnets**: app servers and databases, with no direct internet access.

This is like a bank: the public enters the banking hall; the vault is behind several locked doors.

## Firewall rules (security groups)

Rules say which traffic may come in: *allow TCP port 443 from 0.0.0.0/0* (anyone may visit the website), *allow 5432 only from 10.0.2.0/24* (only the app servers may reach the database). Default to **deny**, and never open databases or SSH to \`0.0.0.0/0\`.

## DNS, load balancers and CDNs

- **DNS** turns names (\`cdmtechnologies.github.io\`) into IP addresses. Records: \`A\` (IPv4), \`AAAA\` (IPv6), \`CNAME\` (an alias to another name), \`MX\` (mail), \`TXT\` (verification and email security). Changes take time to spread (the TTL).
- A **load balancer** spreads visitors across several servers and stops sending traffic to unhealthy ones.
- A **CDN** (content delivery network) keeps copies of files in cities around the world, so a visitor in Lagos downloads from Lagos, not from Virginia.

## Converting an address to a number

To check whether an address is inside a range, treat the four parts as one 32-bit number: \`a × 256³ + b × 256² + c × 256 + d\`. Then the range starts at the network address and contains \`2^(32 − prefix)\` addresses. (In JavaScript, plain arithmetic is safer than bit operators here, because bit operators work on signed 32-bit numbers.)

## Your task

1. \`ipToNumber(ip)\`: \`"10.0.1.5"\` → \`167772421\`. Return \`null\` for anything that is not four whole numbers from 0 to 255.
2. \`cidrSize(cidr)\`: the number of addresses in a range like \`"10.0.0.0/24"\` (256).
3. \`inCidr(ip, cidr)\`: \`true\` when the address is inside the range.
4. \`isPrivate(ip)\`: \`true\` for the three private ranges.
5. \`allowed(rules, ip, port)\`: \`rules\` is a list of \`{ port, from }\` (\`from\` is a CIDR). Return \`true\` only if some rule matches both the port and the source address (default deny).`,
    task: 'Write ipToNumber, cidrSize, inCidr, isPrivate and allowed.',
    starter: `<script>
  function ipToNumber(ip) {
  }
  function cidrSize(cidr) {
  }
  function inCidr(ip, cidr) {
  }
  function isPrivate(ip) {
  }
  function allowed(rules, ip, port) {
    return true
  }
</script>
`,
    checks: [
      { label: 'IP addresses become numbers', test: `return ipToNumber('10.0.1.5') === 167772421 && ipToNumber('255.255.255.255') === 4294967295 && ipToNumber('10.0.1') === null && ipToNumber('10.0.1.300') === null && ipToNumber('a.b.c.d') === null` },
      { label: 'range sizes', test: `return cidrSize('10.0.0.0/24') === 256 && cidrSize('10.0.0.0/16') === 65536 && cidrSize('1.2.3.4/32') === 1 && cidrSize('0.0.0.0/0') === 4294967296` },
      { label: 'inside or outside a range', test: `return inCidr('10.0.2.77', '10.0.2.0/24') && !inCidr('10.0.3.1', '10.0.2.0/24') && inCidr('8.8.8.8', '0.0.0.0/0') && inCidr('192.168.1.9', '192.168.1.9/32') && !inCidr('192.168.1.10', '192.168.1.9/32')` },
      { label: 'private ranges', test: `return isPrivate('10.20.30.40') && isPrivate('172.20.0.1') && !isPrivate('172.32.0.1') && isPrivate('192.168.0.1') && !isPrivate('8.8.8.8')` },
      { label: 'firewall rules default to deny', test: `const rules = [{ port: 443, from: '0.0.0.0/0' }, { port: 5432, from: '10.0.2.0/24' }]; return allowed(rules, '41.58.1.2', 443) && allowed(rules, '10.0.2.9', 5432) && !allowed(rules, '41.58.1.2', 5432) && !allowed(rules, '10.0.2.9', 22) && !allowed([], '10.0.0.1', 443)` },
    ],
    hint: 'inCidr: const [base, p] = cidr.split("/"); const size = 2 ** (32 - Number(p)); const start = Math.floor(ipToNumber(base) / size) * size; const n = ipToNumber(ip); return n >= start && n < start + size',
    solution: `<script>
  function ipToNumber(ip) {
    const parts = String(ip).split('.')
    if (parts.length !== 4) return null
    let n = 0
    for (const p of parts) {
      if (!/^\\d{1,3}$/.test(p) || Number(p) > 255) return null
      n = n * 256 + Number(p)
    }
    return n
  }
  function cidrSize(cidr) { return 2 ** (32 - Number(cidr.split('/')[1])) }
  function inCidr(ip, cidr) {
    const base = cidr.split('/')[0]
    const size = cidrSize(cidr)
    const start = Math.floor(ipToNumber(base) / size) * size
    const n = ipToNumber(ip)
    return n !== null && n >= start && n < start + size
  }
  function isPrivate(ip) { return ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'].some((c) => inCidr(ip, c)) }
  function allowed(rules, ip, port) { return rules.some((r) => r.port === port && inCidr(ip, r.from)) }
</script>
`,
  },
  {
    id: 'cloud-iac',
    title: 'Infrastructure as code',
    minutes: 35,
    kind: 'code',
    outline: 'Why servers should be described in code, declarative tools like Terraform, plan and apply, drift, and coding a plan step.',
    body: `## The recipe, not the meal

Setting up servers by clicking through a cloud console is like cooking a great meal without writing the recipe: it works once, but nobody (including you) can repeat it exactly, and when something changes, nobody knows what. **Infrastructure as code (IaC)** writes the recipe: servers, networks, databases, firewall rules and DNS records are described in files, stored in Git, reviewed like any other code, and created by a tool.

## Declarative: describe the result

Most IaC tools are **declarative**. You describe **what you want** to exist, not the steps to get there:

\`\`\`hcl
resource "aws_s3_bucket" "invoices" {
  bucket = "cdm-invoices-prod"
}
resource "aws_db_instance" "main" {
  engine         = "postgres"
  instance_class = "db.t4g.small"
  storage        = 50
}
\`\`\`

The tool compares that **desired state** with what really exists (the **actual state**) and works out the changes.

Popular tools: **Terraform** and its open-source fork **OpenTofu** (any cloud), **Pulumi** (in real programming languages), **AWS CloudFormation**, **Azure Bicep**, and **Ansible** for configuring servers. Supabase migrations, which CDM Studio uses for its database, follow the same spirit: every change is a reviewed file applied by a pipeline.

## Plan, then apply

1. **Plan**: the tool shows what it *would* do: create 2, update 1, delete 1. Nothing changes yet.
2. **Review**: a teammate checks the plan, especially anything being **deleted** or **replaced**.
3. **Apply**: the tool makes the changes.

The plan step is your safety net. "Destroy 1 database" in a plan should stop everyone in their tracks.

## Benefits

- **Repeatable**: build an identical test environment in minutes.
- **Reviewable**: changes go through pull requests, with history in Git.
- **Recoverable**: if a region fails, rebuild from code.
- **Consistent**: security settings are applied the same way every time, and scanners can check the code before it runs.

## Drift

**Drift** happens when someone changes infrastructure by hand, so reality no longer matches the code. The next plan will try to undo the manual change, which can surprise people. Rule: all changes go through code. Run plans regularly to detect drift.

## State and secrets

Tools like Terraform keep a **state file** describing what they created. Store it remotely with locking (so two people cannot apply at once), and protect it: it can contain secrets. Never put passwords in IaC files; reference a secrets manager instead.

## Your task

Write the heart of a plan step. Desired and actual states are objects mapping a resource name to its settings, for example \`{ "db": { size: 50, engine: "postgres" } }\`.

1. \`plan(desired, actual)\`: return \`{ create, update, delete }\`: lists of resource names to create (in desired, not actual), update (in both, with any setting different) and delete (in actual, not desired). Sort each list alphabetically.
2. \`summary(p)\`: a string like \`"Plan: 1 to create, 2 to update, 0 to delete"\`.
3. \`dangerous(p, actual)\`: the names of resources that would be **deleted** and whose \`kind\` in \`actual\` is \`"database"\` or \`"bucket"\` (sorted).`,
    task: 'Write plan, summary and dangerous.',
    starter: `<script>
  function plan(desired, actual) {
    return { create: [], update: [], delete: [] }
  }
  function summary(p) {
  }
  function dangerous(p, actual) {
  }
</script>
`,
    checks: [
      { label: 'creates, updates and deletes found', test: `const d = { web: { kind: 'server', size: 2 }, db: { kind: 'database', size: 100 }, cdn: { kind: 'cdn' } }; const a = { web: { kind: 'server', size: 1 }, db: { kind: 'database', size: 100 }, old: { kind: 'server' } }; const p = plan(d, a); return JSON.stringify(p) === JSON.stringify({ create: ['cdn'], update: ['web'], delete: ['old'] })` },
      { label: 'added or removed settings count as updates', test: `const p = plan({ a: { x: 1, y: 2 }, b: { x: 1 } }, { a: { x: 1 }, b: { x: 1, z: 3 } }); return JSON.stringify(p.update) === '["a","b"]' && p.create.length === 0 && p.delete.length === 0` },
      { label: 'no changes when equal', test: `const s = { a: { x: 1 } }; const p = plan(s, { a: { x: 1 } }); return p.create.length + p.update.length + p.delete.length === 0` },
      { label: 'plan summary', test: `return summary({ create: ['a'], update: ['b', 'c'], delete: [] }) === 'Plan: 1 to create, 2 to update, 0 to delete'` },
      { label: 'dangerous deletes flagged', test: `const a = { db: { kind: 'database' }, logs: { kind: 'bucket' }, vm: { kind: 'server' }, keep: { kind: 'database' } }; const p = plan({ keep: { kind: 'database' } }, a); return JSON.stringify(dangerous(p, a)) === '["db","logs"]'` },
    ],
    hint: 'Two settings objects differ if they have a different set of keys or any key with a different value. JSON.stringify of each, with keys sorted, is a quick way to compare.',
    solution: `<script>
  const same = (a, b) => {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort()
    return JSON.stringify(ka) === JSON.stringify(kb) && ka.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]))
  }
  function plan(desired, actual) {
    const create = Object.keys(desired).filter((n) => !(n in actual)).sort()
    const update = Object.keys(desired).filter((n) => n in actual && !same(desired[n], actual[n])).sort()
    const del = Object.keys(actual).filter((n) => !(n in desired)).sort()
    return { create, update, delete: del }
  }
  function summary(p) { return 'Plan: ' + p.create.length + ' to create, ' + p.update.length + ' to update, ' + p.delete.length + ' to delete' }
  function dangerous(p, actual) { return p.delete.filter((n) => ['database', 'bucket'].includes(actual[n] && actual[n].kind)).sort() }
</script>
`,
  },
  {
    id: 'cloud-serverless',
    title: 'Serverless, managed databases and scaling',
    minutes: 30,
    kind: 'read',
    outline: 'Functions as a service, managed databases, scaling up and out, caching, queues, and choosing the right building blocks.',
    body: `## Renting a taxi instead of owning a car

Owning a car means paying for it even while it sits in the garage, plus fuel, servicing and insurance. A taxi costs more per trip but nothing when you are not travelling. **Serverless** computing is the taxi: you upload a function, and the cloud runs it only when a request arrives, charging per call and per millisecond. When nobody calls it, it costs (almost) nothing.

## Functions as a service

Examples: **AWS Lambda**, **Google Cloud Run functions**, **Azure Functions**, **Cloudflare Workers**, **Netlify** and **Vercel** functions, and **Supabase Edge Functions** (which CDM Studio uses for payments, the AI tutor and marking projects).

Good for: APIs with uneven traffic, webhooks (a payment provider calling you when a payment succeeds), scheduled jobs, image resizing, sending emails.

Watch out for:

- **Cold starts**: the first call after a quiet period can be slower while the function starts.
- **Time limits**: functions usually stop after seconds to minutes; long jobs need queues or containers.
- **Statelessness**: each call may run on a fresh machine, so store data in a database or storage, not in memory.

## Managed databases

Running a database yourself means handling backups, updates, replication and failover at 3am. **Managed databases** (Amazon RDS, Google Cloud SQL, Azure Database, Supabase, Neon, MongoDB Atlas) do that for you. You still own the **design**, the **security rules** and the **queries**, and you should still test restoring backups.

## Scaling

- **Scale up (vertical)**: a bigger machine. Simple, but there is a ceiling and it usually needs a restart.
- **Scale out (horizontal)**: more machines behind a load balancer. Needs stateless app servers, but grows much further. **Autoscaling** adds and removes machines based on load.

Databases are usually the hardest part to scale. Common steps: add **indexes** to slow queries, use **read replicas** for reports, and **cache** frequent results.

## Caches and queues

- A **cache** (Redis, a CDN, or the browser) keeps recent answers close at hand, like a shopkeeper keeping the most-sold items at the counter instead of the storeroom. Decide how long cached data may be stale.
- A **queue** (Amazon SQS, Google Pub/Sub, RabbitMQ) holds jobs to be done later, like a ticket system at a busy bank. The web request just adds a ticket ("send this receipt", "generate this report") and returns quickly; workers process tickets at their own pace. Queues absorb spikes and let failed jobs be retried.

## Choosing building blocks

| Need | Often a good choice |
|---|---|
| A static website | Static hosting plus a CDN (GitHub Pages, Netlify, Cloudflare Pages) |
| A small API with uneven traffic | Serverless functions |
| Steady heavy traffic, long-running work | Containers (Cloud Run, Kubernetes) or virtual machines |
| Relational data with rules | Managed PostgreSQL |
| Files, images, backups | Object storage (S3, Supabase Storage) |
| Background jobs | A queue with workers |

Start simple and managed. Every extra moving part is something that can fail at night.`,
    quiz: [
      { q: 'Serverless functions are usually charged…', options: ['A fixed monthly fee for a machine', 'Per call and time used', 'Per user signed up'], answer: 1, why: 'You pay when they run.' },
      { q: 'Why should serverless functions not keep data in memory between calls?', options: ['Each call may run on a fresh machine', 'Memory is illegal', 'It makes them faster'], answer: 0, why: 'Functions are stateless; use a database or storage.' },
      { q: 'Adding more servers behind a load balancer is…', options: ['Scaling up', 'Scaling out', 'Caching'], answer: 1, why: 'Horizontal scaling adds machines.' },
      { q: 'A queue helps a website by…', options: ['Making slow jobs happen later so requests return quickly', 'Encrypting passwords', 'Replacing the database'], answer: 0, why: 'Workers process tickets at their own pace.' },
    ],
  },
  {
    id: 'cloud-iam',
    title: 'Cloud security and least privilege (IAM)',
    minutes: 35,
    kind: 'code',
    outline: 'The shared responsibility model, identities and roles, policies with allow and deny, wildcards, and coding a policy evaluator.',
    body: `## Who holds which keys

A big office building has a master key, floor keys and room keys. The cleaner gets keys to the corridors, not the safe. In the cloud, **identity and access management (IAM)** decides who (people, servers, functions) can do what to which resources. Most cloud breaches are not clever attacks on the provider; they are **misconfigured permissions** and **leaked keys** on the customer's side.

## Shared responsibility

The cloud provider secures the buildings, hardware and core services ("security **of** the cloud"). **You** secure what you put in it ("security **in** the cloud"): your accounts, permissions, data, network rules, app code and settings. A provider's perfect data centre does not help if your storage bucket is public.

## Identities

- **Users** for people, each with two-step sign-in. No shared logins.
- **Roles** for machines and services: a server or function assumes a role and gets short-lived credentials automatically. No long-lived keys pasted into code.
- **Groups** to give the same permissions to a team.

The **root** or owner account is the master key: protect it with a hardware security key, never use it day to day, and set up alerts if it is used.

## Policies

Permissions are written as **policies**: lists of statements that **allow** or **deny** actions on resources.

\`\`\`json
{ "effect": "allow", "action": "storage:GetObject", "resource": "invoices/*" }
{ "effect": "deny",  "action": "storage:DeleteObject", "resource": "*" }
\`\`\`

The evaluation rules used by the major clouds:

1. Start with **implicit deny**: nothing is allowed unless a statement allows it.
2. An explicit **deny** always wins over any allow.
3. Wildcards: \`*\` matches anything. \`storage:*\` means every storage action; \`invoices/*\` means everything under invoices.

## Least privilege

Give each identity the **minimum** permissions it needs, for the minimum time:

- Start narrow and add permissions when something genuinely needs them, rather than starting with \`"action": "*"\`.
- Separate environments (development, staging, production), ideally in separate accounts or projects.
- Review permissions regularly; remove unused ones and leavers' access.
- Use the provider's tools that report unused permissions and public resources.

## Keys and secrets

- Prefer roles and short-lived credentials over access keys.
- If keys are needed, keep them in a secrets manager, rotate them, and never commit them to Git (scanners such as GitHub secret scanning look for them, and so do attackers, within minutes).
- Turn on **audit logs** (AWS CloudTrail, Google Cloud Audit Logs, Azure Activity Log) so you can see who did what.

## Your task

Write a small policy evaluator.

1. \`matches(pattern, value)\`: \`*\` matches any run of characters; everything else must match exactly. \`matches("storage:*", "storage:GetObject")\` is true; \`matches("invoices/*", "receipts/1")\` is false.
2. \`evaluate(policies, action, resource)\`: return \`"deny"\` if any **deny** statement matches both the action and the resource; otherwise \`"allow"\` if any **allow** statement matches; otherwise \`"deny"\` (implicit).
3. \`tooBroad(policies)\`: the indexes of **allow** statements whose action **and** resource are both exactly \`"*"\`.`,
    task: 'Write matches, evaluate and tooBroad.',
    starter: `<script>
  function matches(pattern, value) {
  }
  function evaluate(policies, action, resource) {
    return 'allow'
  }
  function tooBroad(policies) {
  }
</script>
`,
    checks: [
      { label: 'wildcard matching', test: `return matches('storage:*', 'storage:GetObject') && matches('*', 'anything') && matches('invoices/*', 'invoices/2026/1.pdf') && !matches('invoices/*', 'receipts/1') && matches('db:Read', 'db:Read') && !matches('db:Read', 'db:ReadWrite') && matches('a*c', 'abbbc') && !matches('a.c', 'abc')` },
      { label: 'implicit deny', test: `return evaluate([], 'storage:GetObject', 'invoices/1') === 'deny' && evaluate([{ effect: 'allow', action: 'db:*', resource: '*' }], 'storage:GetObject', 'x') === 'deny'` },
      { label: 'allow when a statement matches', test: `return evaluate([{ effect: 'allow', action: 'storage:Get*', resource: 'invoices/*' }], 'storage:GetObject', 'invoices/9') === 'allow'` },
      { label: 'explicit deny always wins', test: `const p = [{ effect: 'allow', action: '*', resource: '*' }, { effect: 'deny', action: 'storage:DeleteObject', resource: 'backups/*' }]; return evaluate(p, 'storage:DeleteObject', 'backups/jan') === 'deny' && evaluate(p, 'storage:DeleteObject', 'tmp/x') === 'allow'` },
      { label: 'over-broad allows found', test: `return JSON.stringify(tooBroad([{ effect: 'allow', action: '*', resource: '*' }, { effect: 'deny', action: '*', resource: '*' }, { effect: 'allow', action: 'db:*', resource: '*' }, { effect: 'allow', action: '*', resource: '*' }])) === '[0,3]'` },
    ],
    hint: "matches: turn the pattern into a regular expression: escape every special character except *, replace * with .*, and anchor it: new RegExp('^' + pattern.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*') + '$')",
    solution: `<script>
  function matches(pattern, value) {
    const re = new RegExp('^' + pattern.split('*').map((s) => s.replace(/[.+?^\${}()|[\\]\\\\]/g, '\\\\$&')).join('.*') + '$')
    return re.test(value)
  }
  function evaluate(policies, action, resource) {
    const hit = (p) => matches(p.action, action) && matches(p.resource, resource)
    if (policies.some((p) => p.effect === 'deny' && hit(p))) return 'deny'
    if (policies.some((p) => p.effect === 'allow' && hit(p))) return 'allow'
    return 'deny'
  }
  function tooBroad(policies) {
    return policies.map((p, i) => (p.effect === 'allow' && p.action === '*' && p.resource === '*' ? i : -1)).filter((i) => i >= 0)
  }
</script>
`,
  },
]

export const cloudProject: CourseProject = {
  title: 'Deployment and operations plan for a real app',
  lang: 'text',
  brief: `Pick a real app or website (one you built in CDM Studio, a project at work or school, or a realistic business app such as a clinic booking system) and write the **deployment and operations plan** a small team could follow to run it reliably in the cloud. Paste the text here (about 1,000 to 2,500 words). You may include short code or config snippets.

Include:

1. **Architecture**: the parts (front end, API, database, storage, background jobs) and where each runs, with reasons. A simple text diagram is fine.
2. **Network and security**: public and private parts, firewall rules, HTTPS, IAM roles with least privilege, and how secrets are stored.
3. **CI/CD**: the pipeline steps from a Git push to production, including tests and how a bad release is rolled back.
4. **Infrastructure as code**: which tool and what it manages, and how changes are reviewed.
5. **Monitoring**: health checks, logs, metrics and alerts, with who gets alerted and an example alert threshold.
6. **Backups and recovery**: what is backed up, how often, where, how restores are tested, and target recovery times.
7. **Costs**: an estimated monthly cost and three ways to keep it down.
8. **A runbook** for one likely incident (for example "the site is down" or "the disk is full"), step by step.`,
  rubric: [
    'Describes a clear architecture with reasons for where each part runs',
    'Separates public and private parts with sensible firewall rules and HTTPS',
    'Applies least privilege with roles and keeps secrets out of code',
    'Defines a CI/CD pipeline with automated tests and a rollback method',
    'Uses infrastructure as code with reviewed changes',
    'Plans monitoring with health checks, logs, metrics and specific alerts',
    'Defines backups following good practice, including restore testing and recovery targets',
    'Estimates monthly costs and gives practical ways to reduce them',
    'Includes a step-by-step runbook for a realistic incident',
  ],
}

export const cloudExam: Quiz[] = [
  { q: 'tail -f /var/log/app.log…', options: ['Deletes the log', 'Shows the end of the log and follows new lines', 'Compresses the log', 'Copies the log'], answer: 1, why: 'It follows the file live.' },
  { q: 'How many addresses does 10.0.1.0/24 contain?', options: ['24', '256', '65,536', '1'], answer: 1, why: '2^(32 − 24) = 256.' },
  { q: 'A database port open to 0.0.0.0/0 means…', options: ['Only your office can reach it', 'The whole internet can try to reach it', 'It is encrypted', 'It is turned off'], answer: 1, why: '0.0.0.0/0 is every address.' },
  { q: 'In infrastructure as code, the plan step…', options: ['Shows what would change before anything changes', 'Deletes everything', 'Is optional decoration', 'Writes the code for you'], answer: 0, why: 'Review the plan before applying.' },
  { q: 'In cloud IAM, when an allow and an explicit deny both match…', options: ['Allow wins', 'Deny wins', 'The newest wins', 'Both are ignored'], answer: 1, why: 'Explicit deny always wins.' },
  { q: 'Under the shared responsibility model, a public storage bucket is the responsibility of…', options: ['The cloud provider', 'The customer who configured it', 'Nobody', 'The internet'], answer: 1, why: 'Security in the cloud is yours.' },
]
