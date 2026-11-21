"""Video scripts: Data analytics, Cybersecurity, Ethical hacking, Cloud and DevOps."""
from lessons_lib import simple

# ---------------- Data analytics ----------------
simple('analytics-questions', [
    ('The analyst\'s job', [
        ("An analyst is like a detective for a business. The job is not to make charts. It is to help people make better decisions.", ['n:a detective for the business', 'g:data -> insight -> decision']),
        ("Describe what happened, diagnose why, predict what will happen, and recommend what to do.", ['b:describe  diagnose  predict  recommend']),
    ]),
    ('Ask better questions', [
        ("How are sales is too vague. Which five products lost the most revenue in the third quarter, by branch, so we can plan orders, is a question you can answer.", ['r:"How are sales?"', 'g:"Which 5 products lost the most, by branch?"']),
        ("Most of the work is getting and cleaning data. Then the answer is often simple.", ['T:']),
    ]),
])
simple('analytics-cleaning', [
    ('Cleaning messy data', [
        ("Real data is messy, like a kitchen after a party. Money typed as text, names typed five ways, and rows exported twice.", ['r:"N1,200"   " indomie "   "INDOMIE"']),
        ("If you add up before cleaning, the totals are simply wrong.", ['n:clean before you count']),
    ]),
    ('Rules of thumb', [
        ("Keep the raw file untouched. Make each column one type. Trim and standardise text. Remove true duplicates.", ['keep raw  -  one type  -  tidy text  -  dedupe']),
        ("And write down every rule you applied, so others can trust your numbers.", ['g:write down every rule', 'T:']),
    ]),
])
simple('analytics-stats', [
    ('Average is not enough', [
        ("If a billionaire walks into a bar, the average wealth in the room jumps, but nobody else got richer. That is why we also use the median: the middle value.", ['n:the billionaire in the bar', 'b:mean  vs  median']),
        ("Percentiles tell you more: a quarter of sales are below this, three quarters below that.", ['c:Q1   median   Q3']),
    ]),
    ('Spotting outliers', [
        ("The middle half of the data sits between Q1 and Q3. Anything far beyond it may be an outlier.", ['c:outlier > Q3 + 1.5 x (Q3 - Q1)']),
        ("Do not delete outliers blindly. They may be typing errors, or your most important customers.", ['r:investigate, do not delete', 'T:']),
    ]),
])
simple('analytics-pivot', [
    ('Pivot tables', [
        ("A pivot table sorts receipts into piles and counts each pile: sales by branch, by month, by product.", ['n:sort into piles, then count', 'b:branch x month -> total']),
        ("Choose the rows, the columns, and the number to summarise.", ['rows  +  columns  +  value']),
    ]),
    ('Shares and growth', [
        ("Wuse sold two million of eight million. Its share is one quarter, twenty-five percent.", ['c:share = part / total']),
        ("Growth compares with before: from five hundred thousand to six hundred thousand is up twenty percent.", ['c:growth = (new - old) / old', 'T:']),
    ]),
])
simple('analytics-trends', [
    ('Trends', [
        ("Daily sales jump up and down like waves on the sea. A moving average looks at the tide, not the waves.", ['n:look at the tide, not the waves', 'c:7-day moving average']),
        ("December always beats March. Compare December with last December, so the season cancels out.", ['g:year on year']),
    ]),
    ('Watch the traps', [
        ("Sales up twenty percent in a year of twenty-five percent inflation means real sales fell.", ['r:+20% sales, +25% prices -> real fall']),
        ("And a fall of fifty percent needs a rise of one hundred percent to recover.", ['b:-50% then +100%', 'T:']),
    ]),
])
simple('analytics-kpis', [
    ('KPIs', [
        ("A car dashboard shows a few numbers that matter: speed, fuel, warnings. A business dashboard should do the same.", ['n:speed, fuel, warnings']),
        ("Pick three to five key numbers, each compared with last period or a target.", ['g:N4.2m revenue, +12% vs last month']),
    ]),
    ('Good dashboards', [
        ("Put the most important numbers at the top, trends below, and details at the bottom.", ['top: KPIs   middle: trends   bottom: detail']),
        ("A number without a comparison means nothing. Always show against what.", ['r:always show "compared with what?"', 'T:']),
    ]),
])
simple('analytics-sql', [
    ('Getting data with SQL', [
        ("Spreadsheets run out of room. When data lives in company systems, analysts go to the source, and ask with SQL.", ['b:select ... from ... group by ...']),
        ("Nearly every report query has the same shape: choose rows, group them, summarise a measure.", ['n:like a pivot table, every time']),
    ]),
    ('Margins done right', [
        ("Gross margin is gross profit divided by revenue. Calculate it from the totals, not by averaging each row's margin.", ['g:sum(profit) / sum(revenue)', 'r:avg(row margin)']),
        ("Write the business question as a comment at the top of the query.", ['c:-- Which category earns most per branch?', 'T:']),
    ]),
])
simple('analytics-charts', [
    ('Choosing the right chart', [
        ("A chart is a picture of an answer. Start from the question, then pick the tool: a line for change over time, bars to compare.", ['b:time -> line      compare -> bars']),
        ("Pie charts with many slices are hard to read. Use a sorted bar chart instead.", ['r:9-slice pie', 'g:sorted bars']),
    ]),
    ('Honest charts', [
        ("Bars must start at zero, or small differences look huge.", ['n:bars start at zero']),
        ("Give each chart a title that says the insight: revenue fell eighteen percent after the price rise.", ['g:"Revenue fell 18% after the price rise"', 'T:']),
    ]),
])
simple('analytics-ab', [
    ('A/B tests', [
        ("Toss a fair coin ten times, and you might get six heads. Small samples wobble. An A/B test checks if a change really worked, or was luck.", ['n:six heads from a fair coin']),
        ("Split visitors at random. Half see the old page, half the new one. Then compare conversion rates.", ['A: 5.0%      B: 5.4%']),
    ]),
    ('Is it real?', [
        ("A z score beyond about two means a difference that big would rarely happen by luck alone.", ['c:|z| >= 1.96  ->  significant']),
        ("Decide the sample size first, run whole weeks, and do not stop early because you like the result.", ['r:no peeking, no early stopping', 'T:']),
    ]),
])
simple('analytics-cohorts', [
    ('Cohorts', [
        ("Picture filling a bucket with a hole in it. New customers are the water. Customers who never return are the leak.", ['n:the leaking bucket']),
        ("A cohort is a group who started in the same month. Follow each group, and see how many come back.", ['b:Sept: 100%  42%  30%']),
    ]),
    ('Retention and value', [
        ("Read across to see one group fade. Read down to see if newer groups stay longer: then your changes are working.", ['g:newer cohorts stay longer?']),
        ("Compare a customer's lifetime value with the cost to win them. If winning costs more, growth loses money.", ['c:lifetime value > cost to acquire', 'T:']),
    ]),
])
simple('analytics-forecast', [
    ('Forecasting', [
        ("A weather forecast says seventy percent chance of rain, not a promise. Business forecasts help plan stock, staff and cash, and they are always uncertain.", ['n:less wrong than guessing']),
        ("Start simple. Next month equals this month. Or this December equals last December. These baselines are hard to beat.", ['b:naive   seasonal naive   trend']),
    ]),
    ('Measure the error', [
        ("Compare forecasts with what really happened. MAPE is the average miss as a percentage: we are usually within eight percent.", ['c:MAPE = mean(|actual - forecast| / actual)']),
        ("Give a range, not a single number, and say your assumptions.", ['g:N3.8m to N4.6m, most likely N4.2m', 'T:']),
    ]),
])
simple('analytics-story', [
    ('Data storytelling', [
        ("People remember stories, not spreadsheets. Lead with the headline, then the evidence, then why it matters, then what to do.", ['headline -> evidence -> why -> action']),
        ("A recommendation needs an owner and a deadline, and a way to check it worked.", ['g:owner + deadline + check']),
    ]),
    ('Your analyst career', [
        ("Spreadsheets, SQL, a dashboard tool and clear writing will take you far. Help small businesses with monthly reports to build a portfolio.", ['b:Excel   SQL   Power BI   writing']),
        ("Your dashboard project is your first portfolio piece. Good luck!", ['T:Good luck!']),
    ]),
])

# ---------------- Cybersecurity ----------------
simple('cyber-mindset', [
    ('Think like an attacker', [
        ("A burglar walks round a house looking for the open window. Defenders must think the same way: where is my open window?", ['n:find the open window first']),
        ("Security protects three things: keep data secret, keep it correct, and keep systems available.", ['b:confidentiality  integrity  availability']),
    ]),
    ('Threats and risk', [
        ("A threat is what could cause harm. A weakness is the open window. Risk is how likely, times how bad.", ['c:risk = likelihood x impact']),
        ("You cannot fix everything at once, so fix the biggest risks first.", ['g:biggest risks first', 'T:']),
    ]),
])
simple('cyber-passwords', [
    ('Passwords', [
        ("Attackers do not guess one password at a time. They try millions, and they try leaked passwords from other sites.", ['r:Password123   abuja2026']),
        ("Length beats complexity. Three or four random words make a long, memorable password.", ['g:blue-mango-tree-river']),
    ]),
    ('Managers and two-step sign-in', [
        ("A password manager is a safe for all your keys. You remember one strong password, it remembers the rest.", ['n:one strong password to remember']),
        ("Two-step sign-in adds a second lock: even a stolen password is not enough. Turn it on everywhere, especially email.", ['b:password + code from an app', 'T:']),
    ]),
])
simple('cyber-phishing', [
    ('Phishing', [
        ("Phishing is fishing for people: a fake message as bait, hoping you bite. Your account is suspended, click here.", ['r:"Your account is suspended. Click here."']),
        ("Warning signs: urgency, fear, a strange sender address, a link that does not match, and requests for codes or passwords.", ['n:urgency + fear = stop and check']),
    ]),
    ('Stop and verify', [
        ("Hover over links before you click. Real banks never ask for your PIN or one-time code.", ['g:banks never ask for your PIN or OTP']),
        ("When in doubt, call back using a number you already know, not the one in the message.", ['b:call back on a number you trust', 'T:']),
    ]),
])
simple('cyber-crypto', [
    ('Hashing', [
        ("A hash is like a fingerprint for data: the same input always gives the same print, but you cannot rebuild the person from the fingerprint.", ['n:a fingerprint for data', 'c:sha256("hello") -> 2cf24d...']),
        ("Websites store password hashes, not passwords. A salt makes every hash unique, even for the same password.", ['g:store hashes, add salt']),
    ]),
    ('Encryption', [
        ("Encryption is a locked box: only someone with the key can open it. HTTPS locks the box between your phone and the website.", ['b:plain text -> locked box -> plain text']),
        ("Never invent your own encryption. Use well-tested tools.", ['r:never roll your own crypto', 'T:']),
    ]),
])
simple('cyber-xss', [
    ('Cross-site scripting', [
        ("If a website shows what users type without care, an attacker can type code instead of a name, and it runs in other people's browsers.", ['r:name = <script>steal()</script>']),
        ("It is like a notice board where someone pins a trap instead of a notice.", ['n:a trap on the notice board']),
    ]),
    ('The fix', [
        ("Treat user text as text, never as code. Use text content, not inner HTML, and escape special characters.", ['g:textContent, not innerHTML', 'c:< becomes &lt;']),
        ("A content security policy adds a second wall, blocking scripts you did not allow.", ['T:']),
    ]),
])
simple('cyber-access', [
    ('Access control', [
        ("Authentication asks who are you. Authorisation asks what may you do. Most breaches inside apps are authorisation mistakes.", ['b:who are you?   what may you do?']),
        ("Check permissions on the server for every request. Hiding a button is not security.", ['r:hidden button is not security']),
    ]),
    ('Rate limiting', [
        ("Attackers try thousands of passwords a minute. Rate limiting is a bouncer: after five wrong tries, wait.", ['n:five tries, then wait']),
        ("Show the same message for a wrong email or a wrong password, so attackers cannot learn which accounts exist.", ['g:same message for both', 'T:']),
    ]),
])
simple('cyber-network', [
    ('Networks and Wi-Fi', [
        ("Public Wi-Fi is like shouting in a crowded market. Anyone nearby may be listening. Use HTTPS sites, or a trusted VPN.", ['r:public Wi-Fi: assume others listen']),
        ("At home and work, change the router's default password, and keep it updated.", ['g:change default passwords']),
    ]),
    ('Devices', [
        ("Every phone and laptop is a door. Lock screens, automatic updates, and encryption keep the doors shut.", ['b:screen lock   updates   encryption']),
        ("Separate guest Wi-Fi from business systems, like a waiting room that does not open into the office.", ['n:guests in the waiting room', 'T:']),
    ]),
])
simple('cyber-incident', [
    ('When something goes wrong', [
        ("Fire drills happen before fires. Plan your response before an incident, not during it.", ['n:practise before the fire']),
        ("Prepare, detect, contain, remove the cause, recover, and learn.", ['prepare -> detect -> contain -> recover -> learn']),
    ]),
    ('Stay calm', [
        ("Disconnect affected machines, keep the evidence, change passwords from a clean device, and tell the right people.", ['g:contain, keep evidence, inform']),
        ("Afterwards, write down what happened and what you will change. No blame, just better.", ['b:lessons learned', 'T:']),
    ]),
])
simple('cyber-backups', [
    ('Ransomware', [
        ("Ransomware locks your files and demands money for the key. Hospitals, schools and shops have all been hit.", ['r:your files are locked']),
        ("Backups are the seatbelt of computing: boring, until the day they save you. Keep three copies, on two kinds of storage, with one offline.", ['c:3 copies - 2 kinds - 1 offline']),
    ]),
    ('Test the restore', [
        ("A backup you have never restored is a hope, not a backup. Test restoring every few months.", ['g:test the restore']),
        ("Protect email above all, because it can reset every other password. Two-step sign-in everywhere.", ['n:email is the master key', 'T:']),
    ]),
])
simple('cyber-headers', [
    ('Security headers', [
        ("HTTPS is an armoured van between browser and website. Security headers are extra locks on every door and window, and they cost nothing.", ['n:free locks on every window']),
        ("HSTS says: always use HTTPS. A content security policy blocks scripts you did not allow.", ['c:Strict-Transport-Security', 'c:Content-Security-Policy']),
    ]),
    ('Safe cookies', [
        ("A session cookie is the key to a signed-in account. Mark it Secure, HttpOnly and SameSite.", ['g:Secure; HttpOnly; SameSite=Lax']),
        ("Free scanners grade your site's headers. Now write your own header audit.", ['T:']),
    ]),
])
simple('cyber-risk', [
    ('Risk assessment', [
        ("A small business cannot protect everything equally. Like a doctor in a busy emergency room, treat the most serious, most likely problems first.", ['n:triage']),
        ("List what matters, what could go wrong, then score each risk: likelihood times impact.", ['c:score = likelihood x impact (1 to 25)']),
    ]),
    ('Treat each risk', [
        ("Reduce it, avoid it, transfer it with insurance, or accept it on purpose, and write it down.", ['b:reduce   avoid   transfer   accept']),
        ("Keep a risk register, and review it every few months.", ['g:a living risk register', 'T:']),
    ]),
])
simple('cyber-career', [
    ('Security careers', [
        ("Security needs many kinds of people: analysts who watch for attacks, engineers who build defences, and testers who find weaknesses first.", ['b:analyst   engineer   tester']),
        ("Start with certificates like CompTIA Security plus, and practise in legal labs.", ['g:Security+  and legal labs']),
    ]),
    ('Your portfolio', [
        ("Write up what you learn, help a small business with its security, and share your assessments, with permission.", ['n:show your work']),
        ("Your final project is a real security assessment. Good luck!", ['T:Good luck!']),
    ]),
])

# ---------------- Ethical hacking ----------------
simple('ethhack-ethics', [
    ('Hacking with permission', [
        ("A locksmith opening your door because you asked is a service. Opening a stranger's door is burglary. Ethical hacking is the same skill, with permission.", ['g:with permission: a service', 'r:without permission: a crime']),
        ("Get written permission, and a clear scope: what you may test, when, and how.", ['n:written permission + scope']),
    ]),
    ('The rules', [
        ("Stay inside the scope, protect any data you see, and report everything to the owner, not to the internet.", ['b:scope   protect data   report privately']),
        ("Laws like Nigeria's Cybercrimes Act apply to everyone. Permission is what makes testing legal.", ['T:']),
    ]),
])
simple('ethhack-method', [
    ('How a test works', [
        ("A penetration test is a planned health check for a system, done in clear phases.", ['plan -> discover -> test -> report']),
        ("First agree the scope and rules. Then learn about the target, look for weaknesses, and confirm them carefully.", ['n:careful, never destructive']),
    ]),
    ('The report is the product', [
        ("The client pays for the report: what was found, how serious it is, and how to fix it.", ['g:findings + severity + fixes']),
        ("A great tester is also a great teacher. Write so a busy manager understands.", ['b:write for the manager', 'T:']),
    ]),
])
simple('ethhack-recon', [
    ('Reading scan results', [
        ("A scan of an in-scope server is like walking around a building and noting every door: which are open, and what is behind them.", ['c:22/tcp open ssh   80/tcp open http']),
        ("Some doors should never face the street: databases, remote desktop, and old telnet.", ['r:3306 mysql   3389 rdp   23 telnet']),
    ]),
    ('From doors to findings', [
        ("Old software versions are like old locks with known weaknesses. Note them, and check for updates.", ['n:old version = known weakness']),
        ("Turn the scan into a clear list of exposed services, and the risky ones first.", ['g:risky services first', 'T:']),
    ]),
])
simple('ethhack-injection', [
    ('Injection flaws', [
        ("Injection happens when an app mixes user input into a command. It is like a form where someone writes an instruction in the name box, and the clerk obeys.", ['n:the clerk who obeys the form']),
        ("In SQL, a quote mark in a name can change the query's meaning.", ["r:' or '1'='1"]),
    ]),
    ('The fix', [
        ("Parameterised queries send the command and the values separately, so a value is never run as code.", ['g:parameterised queries']),
        ("Validate input, and give the database account only the permissions it needs.", ['b:validate + least privilege', 'T:']),
    ]),
])
simple('ethhack-sessions', [
    ('Sessions and tokens', [
        ("After you sign in, a session token is like a wristband at an event. Anyone wearing your wristband gets in as you.", ['n:the wristband']),
        ("Testers check that tokens are long and random, sent only over HTTPS, and hidden from scripts.", ['g:random, HTTPS only, HttpOnly']),
    ]),
    ('Expiry and sign-out', [
        ("Tokens should expire, and signing out should really end the session on the server.", ['b:expire + real sign-out']),
        ("A new token after sign-in stops attackers planting one in advance.", ['c:new session id after login', 'T:']),
    ]),
])
simple('ethhack-risk', [
    ('Rating findings', [
        ("Not every finding is an emergency. Rate each one by how easy it is to exploit, and how bad the damage would be.", ['c:severity = likelihood x impact']),
        ("Critical, high, medium, low: a shared scale helps managers decide what to fix first.", ['b:critical  high  medium  low']),
    ]),
    ('Context matters', [
        ("A weakness on a public payment page matters more than the same one on an internal test server.", ['n:where it is changes how bad it is']),
        ("Explain your rating, so people trust it.", ['g:always explain the rating', 'T:']),
    ]),
])
simple('ethhack-logs', [
    ('The blue team view', [
        ("Logs are the building's CCTV. Attackers leave footprints: many failed logins, odd times, strange addresses.", ['n:logs are CCTV', 'r:50 failed logins in 1 minute']),
        ("Defenders read logs to spot attacks early, before damage is done.", ['g:spot it early']),
    ]),
    ('Patterns to watch', [
        ("Count failures per address, look for logins from new countries, and watch for requests full of quote marks and script tags.", ['b:failures   new places   strange requests']),
        ("Understanding attacks makes you a far better defender.", ['T:']),
    ]),
])
simple('ethhack-osint', [
    ('Looking before touching', [
        ("Before touching any system, testers study what the organisation has already made public, like a consultant walking round the outside of a bank branch.", ['n:look, do not touch']),
        ("Websites, job adverts, public certificates and code can reveal forgotten systems and leaked keys.", ['b:website   jobs   certificates   code']),
    ]),
    ('Strict limits', [
        ("Only research the organisation that authorised you. Never use leaked passwords, and never trick staff.", ['r:never use leaked passwords']),
        ("Turn each finding into a fix, like revoking a leaked key at once.", ['g:every finding gets a fix', 'T:']),
    ]),
])
simple('ethhack-authz', [
    ('Broken access control', [
        ("Your hotel key opens room two fourteen. You try two fifteen, and it opens too. The lock checked you had a key, not that it was your room.", ['n:the hotel key that opens every room']),
        ("Change an invoice number in a link, and see someone else's invoice. That is IDOR, and it tops the OWASP list.", ['r:/invoices/1042  ->  /invoices/1043']),
    ]),
    ('Check every request', [
        ("Testers use two test accounts, and try to reach each other's data.", ['b:user A  vs  user B']),
        ("The fix: the server checks ownership on every request, and answers the same for missing and forbidden.", ['g:check ownership, every time', 'T:']),
    ]),
])
simple('ethhack-misconfig', [
    ('Misconfiguration', [
        ("Many breaches need no clever hacking: a default password, a debug page, a database open to the internet. A strong lock with the key left in it.", ['n:the key left in the lock', 'r:admin / admin']),
        ("Testers check for defaults, debug modes, open admin panels and file listings.", ['b:defaults   debug   admin   listings']),
    ]),
    ('Weak crypto', [
        ("Old TLS versions and fast password hashes like MD5 are weak. Use TLS one point two or newer, and bcrypt or Argon2.", ['g:TLS 1.2+   bcrypt / Argon2']),
        ("Fix it with a hardening checklist and automatic checks, not a one-off clean-up.", ['T:']),
    ]),
])
simple('ethhack-labs', [
    ('Practise legally', [
        ("A medical student practises on models, never on strangers in the street. Security learners need practice targets too.", ['n:practise on models']),
        ("Build a home lab, and use apps made to be attacked, like OWASP Juice Shop, or platforms like TryHackMe.", ['b:Juice Shop   DVWA   TryHackMe']),
    ]),
    ('Bug bounties', [
        ("Some companies invite you to find bugs, and pay rewards. Read the rules first, and use only your own test accounts.", ['g:read the policy first']),
        ("Write up what you learn, and build a reputation the right way.", ['T:']),
    ]),
])
simple('ethhack-report', [
    ('Reporting', [
        ("Your report is the product. Start with a short summary a manager understands, then the details for engineers.", ['summary -> findings -> fixes']),
        ("Each finding needs steps to reproduce, evidence without private data, the impact, and a clear fix.", ['g:reproduce + evidence + impact + fix']),
    ]),
    ('Disclosure and career', [
        ("Report privately, and give the owner time to fix before anything is public.", ['n:coordinated disclosure']),
        ("Your pen test report project is your first portfolio piece. Good luck!", ['T:Good luck!']),
    ]),
])

# ---------------- Cloud and DevOps ----------------
simple('cloud-basics', [
    ('What the cloud is', [
        ("The cloud is someone else's computers that you rent, like using a hotel instead of building a house.", ['n:rent, do not build']),
        ("You pay for what you use, grow in minutes, and someone else handles the power, cooling and hardware.", ['g:pay as you go, grow in minutes']),
    ]),
    ('Kinds of service', [
        ("Rent a bare machine, rent a ready platform, or rent finished software, like renting land, a kitchen, or ordering a meal.", ['b:IaaS   PaaS   SaaS']),
        ("Big providers include AWS, Google Cloud and Azure, plus simpler ones like Netlify and Supabase.", ['T:']),
    ]),
])
simple('cloud-git', [
    ('Version control', [
        ("Git is a time machine for your code. Every save point, called a commit, can be visited again.", ['n:a time machine for code', 'c:git commit -m "Add receipts"']),
        ("Branches let you try ideas without breaking the working version, like drafts of a letter.", ['b:main   feature-branch']),
    ]),
    ('Working together', [
        ("A pull request asks the team to review a change before it joins the main branch.", ['g:review before merge']),
        ("Never commit passwords or keys. Once pushed, assume they are public.", ['r:never commit secrets', 'T:']),
    ]),
])
simple('cloud-cicd', [
    ('CI/CD', [
        ("A factory checks every product on the line before it ships. CI CD does the same for code: every change is tested and deployed automatically.", ['n:the factory line', 'push -> test -> build -> deploy']),
        ("If a test fails, the line stops, and nothing broken reaches customers.", ['g:failing test = no deploy']),
    ]),
    ('Small and often', [
        ("Small, frequent releases are safer than one giant release, like small steps instead of a big jump.", ['b:small steps, often']),
        ("And always have a quick way to roll back.", ['n:one-click rollback', 'T:']),
    ]),
])
simple('cloud-containers', [
    ('Containers', [
        ("Before shipping containers, cargo was loaded piece by piece, and every port worked differently. A software container packs an app with everything it needs, and runs the same everywhere.", ['n:the shipping container', 'g:works the same everywhere']),
        ("Docker builds and runs containers.", ['c:docker run -p 8080:80 my-app']),
    ]),
    ('Kubernetes', [
        ("With many containers, Kubernetes is the harbour master: it places them, restarts failed ones, and adds more when busy.", ['b:place   restart   scale']),
        ("Start simple. Many apps never need Kubernetes.", ['T:']),
    ]),
])
simple('cloud-config', [
    ('Configuration', [
        ("The same app runs in development, testing and production. Settings change, but the code stays the same.", ['b:dev   staging   production']),
        ("Keep settings in environment variables, not in the code.", ['c:DATABASE_URL=...']),
    ]),
    ('Secrets', [
        ("Secrets are the keys to the kingdom. Store them in a secrets manager, never in Git, and give each app only the keys it needs.", ['r:never in Git', 'g:secrets manager + least privilege']),
        ("Rotate them, like changing the locks when a staff member leaves.", ['n:change the locks', 'T:']),
    ]),
])
simple('cloud-monitoring', [
    ('Monitoring', [
        ("A doctor watches a patient's heartbeat, not just waits for collapse. Watch your app's health all the time.", ['n:watch the heartbeat']),
        ("Logs say what happened. Metrics count how much. Uptime checks ask: is it up right now?", ['b:logs   metrics   uptime']),
    ]),
    ('Useful alerts', [
        ("Alert on what users feel: errors, slowness, downtime. Too many alerts, and people ignore them all.", ['g:alert on what users feel', 'r:too many alerts = no alerts']),
        ("Every alert needs an owner, and a runbook that says what to do.", ['T:']),
    ]),
])
simple('cloud-linux', [
    ('The Linux command line', [
        ("Most of the cloud runs on Linux, and servers have no screen. You talk to them by typing, like a skilled driver with a manual gearbox.", ['c:pwd   ls   cd   cat']),
        ("Logs live in var log. Tail dash f follows new lines live, and grep finds words.", ['c:tail -f app.log | grep ERROR']),
    ]),
    ('Safe habits', [
        ("Use SSH keys, not passwords, and sudo only when needed, like a master key you return after use.", ['g:SSH keys, sudo only when needed']),
        ("And check the path twice before you delete anything.", ['r:rm -rf: check twice', 'T:']),
    ]),
])
simple('cloud-network', [
    ('Networking', [
        ("An IP address is a house number, and ports are the flats in the building: 443 for websites, 22 for SSH.", ['c:203.0.113.10:443']),
        ("CIDR describes a whole street of addresses. Slash twenty-four is two hundred and fifty-six addresses.", ['b:10.0.1.0/24  ->  256 addresses']),
    ]),
    ('Public and private', [
        ("Like a bank: the public enters the banking hall, but the vault is behind locked doors. Keep databases in private subnets.", ['g:database in a private subnet']),
        ("Firewall rules default to deny. Never open a database to the whole internet.", ['r:never 5432 from 0.0.0.0/0', 'T:']),
    ]),
])
simple('cloud-iac', [
    ('Infrastructure as code', [
        ("Setting up servers by clicking is like cooking a great meal without writing the recipe. Infrastructure as code writes the recipe.", ['n:write the recipe']),
        ("Describe what should exist, and the tool works out the changes.", ['b:desired state  vs  actual state']),
    ]),
    ('Plan, then apply', [
        ("The plan shows what would change before anything changes. Destroy one database should stop everyone in their tracks.", ['r:Plan: 1 to destroy (database)']),
        ("All changes through code, reviewed like any other code.", ['g:review every plan', 'T:']),
    ]),
])
simple('cloud-serverless', [
    ('Serverless', [
        ("Owning a car costs money even when parked. Serverless is a taxi: pay only for each trip.", ['n:the taxi, not the car']),
        ("Upload a function, and the cloud runs it when a request arrives. Perfect for webhooks and uneven traffic.", ['b:request -> function -> response']),
    ]),
    ('Scaling', [
        ("Scale up with a bigger machine, or scale out with more machines behind a load balancer.", ['g:up: bigger   out: more']),
        ("Caches keep popular answers close, and queues hold slow jobs for later, like tickets at a busy bank.", ['c:cache   queue', 'T:']),
    ]),
])
simple('cloud-iam', [
    ('Cloud security', [
        ("The cloud provider secures the building. You secure what you put inside: accounts, permissions and data.", ['b:security OF the cloud  vs  IN the cloud']),
        ("Most cloud breaches are wrong permissions and leaked keys, not clever attacks.", ['r:wrong permissions, leaked keys']),
    ]),
    ('Least privilege', [
        ("Give each identity the minimum it needs, like a cleaner who gets corridor keys, not the safe.", ['n:corridor keys, not the safe']),
        ("Deny by default, and an explicit deny always wins.", ['g:default deny, explicit deny wins', 'T:']),
    ]),
])
simple('cloud-cost', [
    ('Cloud costs', [
        ("A cloud bill is like a running tap. Forgotten test servers and huge machines leak money all month.", ['n:turn off the taps']),
        ("Set budgets with alerts, tag resources by project, and switch off what you do not use.", ['g:budgets + tags + switch off']),
    ]),
    ('Backups and career', [
        ("Back up data, and test restoring it. Cloud engineers who keep systems reliable and costs low are always in demand.", ['b:reliable  +  affordable']),
        ("Your operations plan project is your first portfolio piece. Good luck!", ['T:Good luck!']),
    ]),
])
