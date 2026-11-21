"""Extra worked-example scenes that make every lesson video longer (inserted before the last scene)."""
from lessons_lib import more

# ---------- Digital marketing ----------
more('marketing-foundations', 'The 4 Ps', [
    ("A classic checklist still works: product, price, place and promotion.", ['b:product   price   place   promotion']),
    ("Product: does it truly solve the problem? Price: how does it compare? Place: where can people get it, online, on WhatsApp, or at a stall? Promotion: how do they hear about it?", ['n:fix the product before the promotion']),
    ("If the product or the price is wrong, the best campaign only disappoints more people, faster.", ['r:great ads cannot save a bad product']),
])
more('marketing-audience', 'Positioning statement', [
    ("Positioning is the place you want to own in the customer's mind. Use this template.", ['For [audience] who [need],', '[brand] is the [category] that [benefit],', 'unlike [alternative], because [proof].']),
    ("For example: for busy nurses who want healthy family meals, Mama's Market is the delivery service that brings cooked food in two hours, unlike fast food, because everything is cooked fresh each morning.", ['g:clear, specific, provable']),
])
more('marketing-seo-basics', 'Keyword research', [
    ("Find the words people really type. Start typing in Google and read the suggestions. Read the People also ask box.", ['b:autocomplete   People also ask']),
    ("Google Search Console shows the searches that already bring people to your site. Google Trends shows the seasons, like a December rush.", ['c:Search Console   Google Trends']),
    ("Look at what already ranks for a search. Google is showing you the kind of page it thinks fits.", ['n:copy the shape, not the words']),
])
more('marketing-onpage', 'A page, before and after', [
    ("Before: the title just says Home, there are two big headings, an image with no description, and a link that says click here.", ['r:<title>Home</title>   two h1   alt=""   click here']),
    ("After: a specific title with the city, one clear heading, sections underneath, every image described, and links that say where they go.", ['g:specific title   one h1   alt text   clear links']),
    ("Same business, same products. Now both people and Google understand the page.", ['n:small changes, big difference']),
])
more('marketing-technical-seo', 'Speed and safety', [
    ("A slow page loses visitors before it even appears. Compress images, use modern formats like WebP, and do not autoplay big videos.", ['g:compress images, no autoplay']),
    ("Use https: browsers warn people away from sites without the padlock.", ['b:https everywhere']),
    ("A sitemap lists your pages for search engines. Search Console tells you which pages Google could not index, and why.", ['c:sitemap.xml   robots.txt']),
])
more('marketing-content', 'One idea, many formats', [
    ("Repurpose. One good guide becomes a blog post, five short videos, a carousel and an email.", ['guide -> blog + videos + carousel + email']),
    ("Google rewards first-hand experience: real photos, real numbers, real tips, and a named author.", ['g:show real experience']),
    ("A recipe from a cook who explains what went wrong the first time beats a copied list.", ['n:experience beats copying']),
])
more('marketing-social', 'Organic and paid', [
    ("Organic posts are free, but reach only some of your followers. Paid posts reach exactly the audience you choose, at a cost.", ['b:organic: free, limited   paid: targeted, costs money']),
    ("Use organic posts to learn what people love. Then put money behind the posts that already work.", ['g:boost what already works']),
    ("Post on a predictable schedule, and for teams, have someone approve posts before they go out.", ['n:a schedule and an approver']),
])
more('marketing-email', 'WhatsApp Business', [
    ("WhatsApp Business gives you a profile, a catalogue, quick replies, labels for customers, and broadcast lists.", ['b:profile   catalogue   quick replies   labels']),
    ("People only receive broadcasts if they saved your number. Keep messages personal and useful. Too many broadcasts, and people block you.", ['r:too many broadcasts = blocked', 'g:personal and useful']),
])
more('marketing-ads', 'Targeting and testing', [
    ("On Google, add negative keywords, like free or jobs, so you do not pay for the wrong clicks.", ['c:-free   -jobs   -how to make']),
    ("On social ads, retarget people who visited your site. They are far more likely to buy.", ['g:retarget past visitors']),
    ("Test one change at a time: headline, image, or audience. Let the numbers decide, and give tests enough time.", ['n:one change at a time']),
])
more('marketing-metrics', 'Attribution', [
    ("A customer sees an Instagram post, searches on Google a week later, then buys after an email. Which channel gets the credit?", ['Instagram -> Google -> email -> sale']),
    ("Last click gives it all to the email. Other models share the credit. Every model simplifies reality.", ['b:last click   shared credit']),
    ("Look at trends over weeks, rather than arguing about one number.", ['n:trends over arguments']),
])
more('marketing-local', 'Answering reviews', [
    ("Thank happy customers by name. For a bad review: apologise for the experience, do not argue, and offer to fix it privately.", ['g:"Sorry about the late delivery, Ada. Please call us on..."']),
    ("Never put order numbers or phone numbers in a public reply.", ['r:no private details in public']),
    ("Team up with businesses that share your customers but do not compete, like a gym and a healthy meal service.", ['n:partner, do not compete']),
])
more('marketing-plan', 'A 90-day rhythm', [
    ("Days one to thirty: fix the foundations: your Google profile, website basics, tracking, and a sign-up offer.", ['b:days 1-30: foundations']),
    ("Days thirty-one to sixty: test small ads, start email or WhatsApp journeys, and collect reviews.", ['b:days 31-60: tests']),
    ("Days sixty-one to ninety: double down on the winners, cut the losers, and write down what you learned.", ['g:days 61-90: double down']),
])

# ---------- UI/UX ----------
more('uiux-intro', 'Why businesses pay for design', [
    ("Every confusing step loses customers. If checkout takes nine taps instead of four, some people simply give up.", ['r:9 taps: people give up', 'g:4 taps: they finish']),
    ("Clear design means fewer support calls and fewer mistakes, like wrong transfers.", ['n:fewer mistakes, fewer calls']),
    ("And people judge whether a bank or shop is safe within seconds of seeing its screen.", ['b:trust in seconds']),
])
more('uiux-research', 'Problem statements', [
    ("Turn research into a clear problem: who, what they need, and why.", ['[user] needs a way to [need] because [insight]']),
    ("Busy parents need a way to know at once that the school received their payment, because chasing the bursar wastes hours.", ['g:describe the need, not the app']),
    ("Then ask: how might we confirm payments instantly? Each question opens new ideas.", ['n:How might we...?']),
])
more('uiux-structure', 'Navigation', [
    ("On phones, put three to five main sections in a bottom tab bar, always reachable by thumb.", ['b:Home   Orders   Search   Account']),
    ("A hamburger menu saves space, but people use hidden things less. Keep the most important actions visible.", ['r:hidden = used less']),
    ("Keep labels short and plain: Orders, not transaction history management.", ['g:"Orders"', 'r:"Transaction history management"']),
])
more('uiux-layout', 'The primary button', [
    ("On most screens there is one main action: buy, pay, or continue. Make it the most obvious button: filled colour, clear words.", ['g:[ Pay now ]   filled, clear']),
    ("Secondary actions like cancel or back are quieter: an outline or plain text.", ['b:( Cancel )   quiet']),
    ("CSS grid with auto-fill makes a grid that fits any screen, without a single media query.", ['c:repeat(auto-fill, minmax(200px, 1fr))']),
])
more('uiux-type', 'Choosing fonts', [
    ("Choose fonts made for screens: Inter, Roboto, Noto Sans, which supports Yoruba, Hausa and Igbo accents, or the system font, which loads instantly.", ['b:Inter   Roboto   Noto Sans   system-ui']),
    ("Use a few sizes that step up, like sixteen, twenty, twenty-four and thirty-two. Use bold for a few words, never whole paragraphs.", ['c:16  20  24  32  40']),
    ("Avoid whole sentences in capitals. It reads like shouting.", ['r:DO NOT SHOUT']),
])
more('uiux-colour', 'Working out contrast', [
    ("Turn each colour into its brightness, called luminance. Green counts most, because our eyes are most sensitive to it.", ['c:L = 0.2126 R + 0.7152 G + 0.0722 B']),
    ("Then divide the lighter by the darker, after adding a small amount to each.", ['c:ratio = (light + 0.05) / (dark + 0.05)']),
    ("Grey seven six seven six seven six on white just passes at four point five four. Lighter greys fail.", ['g:#767676 on white = 4.54 : 1']),
])
more('uiux-forms', 'Ask for less', [
    ("Every extra field loses some people. Ask only what you truly need now.", ['n:fewer fields, more sign-ups']),
    ("Use the right input type, so phones show the right keyboard: email, tel, or number. Autocomplete fills in names and addresses.", ['c:type="tel"   autocomplete="tel"']),
    ("After submitting, say what happened. Silence makes people press the button again, and again.", ['g:always show what happened']),
])
more('uiux-responsive', 'Thumb zones', [
    ("Most people hold a phone in one hand. The bottom middle of the screen is easiest to reach. The top corners are hardest.", ['g:bottom middle: easy', 'r:top corners: hard']),
    ("That is why important app actions sit at the bottom.", ['n:main actions at the bottom']),
    ("Test on a real, inexpensive phone, outdoors, with one hand.", ['b:real phone, outdoors, one hand']),
])
more('uiux-accessibility', 'POUR', [
    ("The accessibility guidelines group everything under four ideas: perceivable, operable, understandable and robust.", ['b:Perceivable  Operable  Understandable  Robust']),
    ("Can people see or hear it? Can they use it with any input? Is it clear? Does it work with assistive tools?", ['n:see it, use it, understand it']),
    ("Try your page with only the keyboard. Can you reach everything, and see where you are?", ['g:Tab, Enter, Space']),
])
more('uiux-testing', 'Making sense of findings', [
    ("List every problem, then rate it: how many people hit it, and how badly it blocked them.", ['c:priority = how many x how bad']),
    ("Fix the severe, common problems first. Look for patterns, not one person's opinion about colours.", ['g:patterns, not opinions']),
    ("Other methods help too: A B tests, analytics, surveys, and testing with screen readers.", ['b:A/B   analytics   surveys']),
])
more('uiux-systems', 'Components', [
    ("A design system also has ready-made components: buttons, inputs, cards and alerts, each with its states and rules.", ['b:button   input   card   alert']),
    ("Big examples include Google's Material Design and Apple's guidelines.", ['n:Material   Human Interface Guidelines']),
    ("Solve accessibility once, inside the component, and every screen gets it for free.", ['g:solve it once']),
])
more('uiux-career', 'Working with developers', [
    ("Talk to developers early, not at the end. Share your tokens, and design every state: loading, empty, error and success.", ['b:loading   empty   error   success']),
    ("Designers who understand a little HTML and CSS, like you now do, are much easier to work with.", ['g:you speak their language']),
])

# ---------- AI engineering ----------
more('aieng-how-llms-work', 'Temperature', [
    ("Temperature controls how adventurous the model is. Low temperature picks the most likely words: good for facts and data.", ['c:temperature 0  ->  steady, repeatable']),
    ("Higher temperature takes more chances: good for brainstorming and creative writing.", ['c:temperature 1  ->  creative, varied']),
    ("For business tasks, start low.", ['n:start low for business tasks']),
])
more('aieng-templates', 'A full template', [
    ("Here is the shape of a strong template.", ['b:You are a helpful support agent for {shop}.', 'b:Task: reply to the message below.', 'b:Rules: polite, under 80 words, no promises.']),
    ("Then the example, then the customer's message between clear markers, so the model knows which part is data.", ['c:<<<MESSAGE {text} MESSAGE>>>']),
])
more('aieng-json', 'A worked check', [
    ("The model returns a name, a phone and a total. Your code checks each field before saving anything.", ['c:{"name": "Ada", "phone": "0803...", "total": 4500}']),
    ("Is the name present? Does the phone have eleven digits? Is the total a positive number?", ['g:present?   right format?   sensible?']),
    ("If anything fails, ask again with the error, once, or send it to a person.", ['n:retry once, then a human']),
])
more('aieng-tokens', 'Chunking a document', [
    ("Split a long handbook into chunks of a few hundred words, at paragraph breaks, not in the middle of sentences.", ['b:paragraph | paragraph | paragraph']),
    ("Let neighbouring chunks overlap a little, so an answer that spans the break is not lost.", ['g:small overlap']),
    ("Count tokens before you send, and refuse oversized input with a friendly message.", ['n:count before you send']),
])
more('aieng-rag', 'Finding the right chunks', [
    ("A simple way: count how many of the question's important words appear in each chunk, ignoring words like the and is.", ['c:score = shared important words']),
    ("Better systems use embeddings, which match meaning, not just words. You will meet them later in this course.", ['b:keywords  ->  embeddings']),
    ("Send only the top few chunks. More is not better: irrelevant text confuses the model.", ['n:a few good chunks, not many']),
])
more('aieng-evals', 'Building a test set', [
    ("Collect fifty real questions, with the answers a good expert would give, including tricky and off-topic ones.", ['b:50 real questions + expected answers']),
    ("Score each answer: correct, partly correct, or wrong. Track the score every time you change something.", ['g:score -> change -> score again']),
    ("Include attacks too, like ignore your instructions, and check the model refuses.", ['r:"Ignore your instructions..."']),
])
more('aieng-agents', 'A safe workflow', [
    ("Example: an agent reads new support emails, drafts replies, and files each one under the right label.", ['read -> draft -> label']),
    ("But a person approves each reply before it is sent, and the agent can never issue refunds by itself.", ['g:a person approves', 'r:no refunds without approval']),
    ("Log every step, so you can see what it did and why.", ['n:log everything']),
])
more('aieng-tools', 'The tool loop', [
    ("The user asks, where is my order? The model replies with a tool call: get order, number ten forty-two.", ['c:{"name": "get_order", "input": {"order_id": 1042}}']),
    ("Your code checks the request, runs it, and sends back the result. Then the model writes the answer.", ['b:ask -> tool call -> run -> answer']),
    ("Reject unknown tools and unknown fields, every time.", ['r:unknown tool? refuse']),
])
more('aieng-embeddings', 'Practical tips', [
    ("Use the same embedding model for documents and questions. Vectors from different models are like coordinates on different maps.", ['n:same model, same map']),
    ("Combine keywords and meaning, especially for names and codes. And set a minimum similarity: if nothing is close, say I don't know.", ['g:hybrid search + a minimum score']),
])
more('aieng-multimodal', 'Designing the feature', [
    ("Decide what to extract, ask for structured output with an unsure option, validate it in code, and send doubtful cases to a person.", ['extract -> structure -> validate -> human']),
    ("Images and audio cost more tokens than text, so resize images to what you need.", ['b:resize before sending']),
    ("Photos and voices are personal data. Get consent, and keep as little as possible.", ['r:consent first']),
])
more('aieng-app', 'Fallbacks', [
    ("If the best model is busy, fall back to a smaller one, a cached answer, or a plain path without AI.", ['b:best model -> smaller model -> no AI']),
    ("Do not retry errors that will never succeed, like a wrong key or a bad request. Those need fixing.", ['r:400 and 401: fix, do not retry']),
    ("Set a timeout on every call. A clear error after thirty seconds beats waiting forever.", ['g:timeouts on every call']),
])
more('aieng-responsible', 'Honesty with users', [
    ("Tell people when they are talking to AI, and when an answer might be wrong.", ['g:"This answer was written by AI"']),
    ("Keep a way to reach a human for important decisions, like loans, health and jobs.", ['n:a human for big decisions']),
    ("Respect copyright, and never use AI to deceive.", ['r:never deceive']),
])

# ---------- Machine learning ----------
more('ml-what-is-ml', 'Features and labels', [
    ("Features are the facts you know: house size, location, number of rooms. The label is what you want to predict: the price.", ['b:features -> label', 'c:size, rooms, area  ->  price']),
    ("Training shows the model many rows where the label is known. Then it predicts labels for new rows.", ['g:learn from known, predict the unknown']),
])
more('ml-data-prep', 'Missing values', [
    ("Some rows have blanks. You can drop them, or fill them with a sensible value like the median.", ['b:drop   or   fill with median']),
    ("But note how many you filled. If half the column is blank, the column may not be useful at all.", ['n:count what you filled']),
    ("Categories like city need turning into numbers before most models can use them.", ['c:Lagos -> [0, 0, 1]']),
])
more('ml-regression', 'Reading the result', [
    ("If the slope is fifty thousand, each extra square metre adds about fifty thousand naira to the price.", ['c:slope = 50,000 per square metre']),
    ("R squared tells you how much of the variation the line explains. One is perfect. Zero explains nothing.", ['b:R squared: 0 to 1']),
    ("A straight line cannot follow curves. Plot your data first.", ['n:always plot first']),
])
more('ml-knn', 'A worked vote', [
    ("A new customer is close to three others. Two of them repaid their loans, and one did not.", ['repaid, repaid, defaulted']),
    ("With k equals three, the vote is two to one: predict repaid.", ['g:2 vs 1  ->  repaid']),
    ("k nearest neighbours is simple and needs no training, but it slows down as the data grows.", ['n:simple, but slow on big data']),
])
more('ml-metrics', 'A worked example', [
    ("A fraud model flags fifty transactions. Forty are really fraud. There were eighty frauds in total.", ['flagged 50   right 40   total fraud 80']),
    ("Precision: forty out of fifty, eighty percent. Recall: forty out of eighty, fifty percent. It is accurate when it rings, but misses half.", ['c:precision 80%   recall 50%']),
    ("F one combines both into one number, when you need a balance.", ['n:F1 balances both']),
])
more('ml-overfitting', 'Signs of overfitting', [
    ("Ninety-nine percent on training data, but seventy percent on test data? The model memorised.", ['r:train 99%   test 70%']),
    ("Simpler models, more data, and limits on depth help. Regularisation gently punishes complexity.", ['g:simpler + more data + limits']),
])
more('ml-clustering', 'Choosing k', [
    ("How many groups? Try several values of k, and watch how tight the groups are.", ['c:k = 2, 3, 4, 5 ...']),
    ("When adding another group stops helping much, you have found the elbow.", ['n:the elbow']),
    ("Scale the features first, or the biggest numbers decide the groups.", ['r:scale first']),
])
more('ml-logistic', 'Reading the weights', [
    ("A positive weight pushes towards yes. A negative weight pushes towards no.", ['g:+ weight -> yes', 'r:- weight -> no']),
    ("Missed payments might have a big negative weight on repayment. Income a positive one.", ['b:missed payments: -2.1   income: +0.8']),
    ("That is why regulators like logistic regression: you can tell a customer why.", ['n:you can explain why']),
])
more('ml-trees', 'A worked split', [
    ("Six customers: three good, three bad. Split at income fifty thousand. The left side is all bad, the right side all good.", ['left: bad bad bad   right: good good good']),
    ("Both sides are pure, so the impurity is zero. That is the best split possible.", ['g:gini = 0  ->  perfect split']),
    ("Trees also show which features matter most. But importance is not cause.", ['n:importance is not cause']),
])
more('ml-features', 'Time and leakage', [
    ("For anything over time, train on earlier dates and test on later ones. Never shuffle the future into training.", ['g:train: Jan-Sep   test: Oct-Dec']),
    ("And never use a feature known only after the outcome, like the number of debt collection calls, to predict default.", ['r:no features from the future']),
])
more('ml-neural', 'Training', [
    ("Training repeats three steps: predict, measure how wrong, and nudge every weight to be a little less wrong.", ['predict -> loss -> nudge weights']),
    ("Backpropagation works out, from the output backwards, how much each weight was to blame.", ['b:backpropagation']),
    ("Libraries like PyTorch do this automatically, often on graphics cards.", ['n:PyTorch, TensorFlow']),
])
more('ml-deploy', 'Model cards', [
    ("Write a short model card: what the model is for, the data, the results, the limits, and fairness risks.", ['b:purpose   data   results   limits   risks']),
    ("It helps people use the model wisely, and helps you remember why you built it that way.", ['n:use it wisely']),
])

# ---------- Data analytics ----------
more('analytics-questions', 'Four kinds of analysis', [
    ("Descriptive: what happened? Sales fell ten percent. Diagnostic: why? A competitor opened next door.", ['b:what happened?   why?']),
    ("Predictive: what will happen? December will be thirty percent higher. Prescriptive: what should we do? Order more stock in November.", ['g:what next?   what to do?']),
])
more('analytics-cleaning', 'A worked clean-up', [
    ("Money like naira one comma two hundred: remove the symbol and commas, then convert to a number.", ['c:"N1,200"  ->  1200']),
    ("Names like space indomie space: trim, then use one consistent case.", ['c:" INDOMIE "  ->  "Indomie"']),
    ("Two identical rows? Check before deleting. Two identical sales might be real.", ['n:check before deleting']),
])
more('analytics-stats', 'A worked median', [
    ("Sales of two, nine, four and seven. Sort them: two, four, seven, nine. The middle two are four and seven, so the median is five and a half.", ['c:2, 4, 7, 9  ->  median 5.5']),
    ("Add one huge sale of a hundred, and the mean jumps. The median barely moves.", ['g:the median is steady']),
])
more('analytics-pivot', 'A worked pivot', [
    ("Rows: branches. Columns: months. Values: total sales. Now you can read across a branch, and down a month.", ['b:branch x month -> sales']),
    ("Add a total row and a share column, and the story starts to appear.", ['g:totals and shares']),
])
more('analytics-trends', 'A worked moving average', [
    ("Three days of sales: ten, fourteen and twelve. The three-day average is twelve. Next day, drop the oldest and add the newest.", ['c:(10 + 14 + 12) / 3 = 12']),
    ("The line becomes smooth, and the real trend shows through.", ['g:smooth line, clear trend']),
])
more('analytics-kpis', 'Choosing KPIs', [
    ("A good KPI connects to money or customers, changes with your actions, and is easy to understand.", ['b:matters   changes   simple']),
    ("Revenue, gross margin, returning customers and stock cover are common choices for a shop.", ['g:revenue   margin   returning   stock cover']),
    ("Too many KPIs means no focus. Pick a few.", ['n:a few, not fifty']),
])
more('analytics-sql', 'Check your numbers', [
    ("Before sharing, sanity-check. Does the total match the finance report? Any negative quantities or zero prices?", ['n:does it match finance?']),
    ("Do the group totals add up to the grand total? If not, something was filtered or doubled.", ['g:groups add up to the total']),
])
more('analytics-charts', 'Colour with purpose', [
    ("Use grey for most of the data, and one strong colour to highlight what matters.", ['b:grey + one highlight']),
    ("Use the same colour for the same thing on every chart in a report.", ['g:consistent colours']),
    ("Check that it still works for colour-blind readers.", ['n:not red versus green alone']),
])
more('analytics-ab', 'Reading results honestly', [
    ("Significant is not the same as important. A tiny lift can be significant with huge traffic, but not worth the cost.", ['r:significant  !=  important']),
    ("And not significant does not mean no effect. Maybe the test was too small.", ['n:maybe the test was too small']),
    ("Check guardrail numbers too, like complaints and refunds.", ['g:check complaints and refunds']),
])
more('analytics-cohorts', 'A worked cohort', [
    ("In September, one hundred and twenty new customers. Fifty came back in October. That is forty-two percent month one retention.", ['c:50 / 120 = 42%']),
    ("In October, one hundred and fifty new customers, and seventy-two came back. Forty-eight percent. Retention is improving.", ['g:42%  ->  48%']),
])
more('analytics-forecast', 'A worked trend', [
    ("Sales of three, five, seven and nine. The line goes up by two each month. The forecast for next month is eleven.", ['c:3, 5, 7, 9  ->  11']),
    ("But straight lines never bend, and real growth always slows. Do not stretch a trend far into the future.", ['r:do not stretch it too far']),
])
more('analytics-story', 'A worked headline', [
    ("Weak: sales by month. Strong: Garki sales fell eighteen percent after the price rise in August.", ['r:"Sales by month"', 'g:"Garki fell 18% after the August price rise"']),
    ("Then the recommendation: restore the old price on the top five products for one month, owned by the Garki manager, and measure weekly.", ['n:owner + deadline + measure']),
])

# ---------- Cybersecurity ----------
more('cyber-mindset', 'Which goal was hit?', [
    ("When you hear about an attack, ask which goal it hit. Ransomware hits availability. A leaked customer list hits confidentiality.", ['b:ransomware -> availability', 'b:leaked list -> confidentiality']),
    ("A cashier quietly changing prices hits integrity.", ['b:changed prices -> integrity']),
])
more('cyber-passwords', 'Leaked passwords', [
    ("Websites get breached. If you reuse a password, a breach on one site opens all your accounts, like one key for your house, car and office.", ['r:one key for everything']),
    ("Check if your email appears in known breaches, and change any reused passwords now.", ['g:unique password for every site']),
])
more('cyber-phishing', 'Social engineering', [
    ("Attackers also phone, pretending to be the bank, IT support, or the boss who urgently needs a transfer.", ['r:"This is the CEO. Pay this invoice now."']),
    ("Create a simple rule: any change to bank details is confirmed by phone, on a known number.", ['g:verify bank changes by phone']),
])
more('cyber-crypto', 'Public and private keys', [
    ("Some encryption uses two keys: a public padlock anyone can use to lock a box, and a private key only you hold to open it.", ['b:public padlock   private key']),
    ("That is how HTTPS starts a secure connection with a website you have never met.", ['g:how HTTPS works']),
])
more('cyber-xss', 'A worked example', [
    ("A comment box shows names. An attacker types a script instead of a name. Every visitor's browser now runs it.", ['r:<script>...</script> as a name']),
    ("Display it as text, and the browser shows harmless characters instead of running code.", ['g:shown as text: harmless']),
])
more('cyber-access', 'Roles', [
    ("Group permissions into roles. A cashier can sell. A manager can sell and refund. The owner can do everything.", ['b:cashier: sell', 'b:manager: sell, refund', 'b:owner: everything']),
    ("Default to deny: if a role or permission is unknown, the answer is no.", ['g:default deny']),
])
more('cyber-network', 'Updates', [
    ("Updates fix known holes, like repairing a broken window as soon as you notice it.", ['n:repair the window quickly']),
    ("Turn on automatic updates for phones, laptops and routers. Many attacks use holes that were fixed months ago.", ['g:automatic updates on']),
])
more('cyber-incident', 'The first hour', [
    ("Someone clicked a bad link and typed their password. First: change that password from a clean device, and sign out all sessions.", ['g:change password, sign out everywhere']),
    ("Then check for new forwarding rules, new logins, and sent messages you did not write.", ['b:rules   logins   sent messages']),
])
more('cyber-backups', 'Securing cloud accounts', [
    ("Use separate admin accounts. Do daily work with a normal account, like keeping the master key in the safe.", ['n:the master key stays in the safe']),
    ("Remove access the day someone leaves, and get alerts for new sign-ins and new forwarding rules.", ['g:remove leavers on day one']),
])
more('cyber-headers', 'Clickjacking', [
    ("Attackers can hide your page inside theirs, and trick people into clicking your buttons. That is clickjacking.", ['r:your page, hidden in theirs']),
    ("One header line stops it: frame-ancestors none.", ["c:frame-ancestors 'none'"]),
])
more('cyber-risk', 'A worked register', [
    ("Phishing of the accounts email: likelihood four, impact four, score sixteen. High: act now.", ['r:phishing: 4 x 4 = 16  high']),
    ("Website defaced: two times two, four. Low: monitor.", ['g:defacement: 2 x 2 = 4  low']),
    ("After adding two-step sign-in, phishing drops to medium. That is your residual risk.", ['b:residual risk']),
])
more('cyber-career', 'Blue and red teams', [
    ("The blue team defends: monitoring, responding and hardening. The red team attacks, with permission, to find gaps.", ['b:blue: defend   red: test']),
    ("Most security jobs are on the blue side, and understanding attacks makes you a better defender.", ['g:most jobs defend']),
])

# ---------- Ethical hacking ----------
more('ethhack-ethics', 'Rules of engagement', [
    ("Before testing, agree in writing: the targets, the dates and times, what is not allowed, and who to call if something breaks.", ['b:targets   times   limits   contacts']),
    ("If you find real personal data, stop, keep the minimum evidence, and report it at once.", ['r:stop and report']),
])
more('ethhack-method', 'Avoid causing harm', [
    ("Test like a careful doctor: confirm a weakness gently, never destroy data, and avoid slowing down a live business.", ['g:gentle, careful, non-destructive']),
    ("Keep notes of everything you do, with times, so the client can match it to their logs.", ['n:notes with timestamps']),
])
more('ethhack-recon', 'Reading versions', [
    ("A line like vsftpd two point three point four tells you the software and version. Old versions may have known weaknesses.", ['c:21/tcp open ftp vsftpd 2.3.4']),
    ("Filtered means a firewall is answering. Closed means nothing is listening.", ['b:open   filtered   closed']),
])
more('ethhack-injection', 'Other injections', [
    ("The same mistake appears with system commands, templates and search queries: user input mixed into instructions.", ['b:SQL   commands   templates']),
    ("The fix is always the same idea: keep data separate from instructions.", ['g:data separate from instructions']),
])
more('ethhack-sessions', 'Common findings', [
    ("Testers often find tokens in web addresses, sessions that never expire, and sign-out that does nothing on the server.", ['r:tokens in URLs   no expiry   fake sign-out']),
    ("Each finding gets a simple fix: cookies with the right flags, short expiry, and real server-side sign-out.", ['g:flags + expiry + real sign-out']),
])
more('ethhack-risk', 'A worked rating', [
    ("An admin page open to the internet, with no password: easy to exploit, huge damage. Critical.", ['r:open admin, no password: critical']),
    ("A missing header on a brochure page: hard to exploit, small damage. Low.", ['g:missing header on a brochure page: low']),
])
more('ethhack-logs', 'A worked detection', [
    ("Fifty failed logins from one address in one minute, then one success. That is a password-guessing attack that worked.", ['r:50 failures, then success']),
    ("Lock the account, block the address, reset the password, and check what was accessed.", ['g:lock, block, reset, investigate']),
])
more('ethhack-osint', 'Attack surface management', [
    ("Mature organisations run this research on themselves, all the time: new certificates, DNS changes and leaked keys.", ['b:watch yourself first']),
    ("They find forgotten systems before attackers do.", ['g:find it first']),
])
more('ethhack-authz', 'Database rules', [
    ("In databases like PostgreSQL and Supabase, row level security makes the database itself refuse rows a user may not see.", ['c:using (owner_id = auth.uid())']),
    ("Even if the app has a bug, the data stays protected.", ['g:a second wall']),
])
more('ethhack-misconfig', 'Hardening checklists', [
    ("Benchmarks like the CIS checklists list safe settings for most systems.", ['b:CIS Benchmarks']),
    ("Put settings in code, scan them automatically, and keep an up-to-date list of every system you run.", ['g:code + scans + inventory']),
])
more('ethhack-labs', 'A home lab', [
    ("Use virtual machines on a private network that cannot reach the internet or your home devices.", ['b:VirtualBox   private network']),
    ("Take snapshots, so you can reset everything after each exercise.", ['g:snapshot, break, reset']),
])
more('ethhack-report', 'A worked finding', [
    ("Title: invoices visible to other customers. Severity: high. Steps: sign in as user B, open invoice ten forty-two.", ['r:High: invoices visible to other customers']),
    ("Impact: any customer can read others' bills. Fix: check ownership on the server for every invoice request.", ['g:fix: check ownership on every request']),
])

# ---------- Cloud and DevOps ----------
more('cloud-basics', 'Regions and availability', [
    ("Clouds have regions around the world. Choose one close to your users, for speed, and to follow data laws.", ['b:region close to your users']),
    ("Spread important systems across zones, so one data centre failing does not take you down.", ['g:more than one zone']),
])
more('cloud-git', 'A daily workflow', [
    ("Pull the latest, create a branch, make small commits with clear messages, push, and open a pull request.", ['c:git pull   git switch -c fix-receipts', 'c:git commit   git push']),
    ("Write messages that say why, not just what.", ['g:"Fix VAT rounding on receipts"']),
])
more('cloud-cicd', 'A pipeline', [
    ("Every push runs the same steps: install, test, build, and deploy, only if everything passed.", ['install -> test -> build -> deploy']),
    ("CDM Studio itself works this way: every change is tested before it goes live.", ['n:CDM Studio does this too']),
])
more('cloud-containers', 'A Dockerfile', [
    ("A Dockerfile is the recipe for a container: start from a base, copy your code, install what it needs, and say how to run it.", ['c:FROM node:22', 'c:COPY . .', 'c:RUN npm install', 'c:CMD ["npm", "start"]']),
])
more('cloud-config', 'Twelve-factor habits', [
    ("Keep the same code everywhere, and change only the settings between environments.", ['g:same code, different settings']),
    ("Log to standard output, keep servers stateless, and store files and data in managed services.", ['b:stateless servers, managed data']),
])
more('cloud-monitoring', 'A runbook', [
    ("A runbook says exactly what to do when an alert fires: check this, restart that, call this person.", ['n:what to do at 3 a.m.']),
    ("Health checks, logs, metrics, and a calm, written plan.", ['g:check -> fix -> confirm -> write it up']),
])
more('cloud-linux', 'Permissions', [
    ("Every file has an owner, and permissions to read, write and run, for the owner, the group and everyone else.", ['c:-rw-r-----']),
    ("Secrets should be readable only by the app's user. Never fix a problem with chmod seven seven seven.", ['g:chmod 600 .env', 'r:chmod 777']),
])
more('cloud-network', 'DNS', [
    ("DNS is the internet's phone book: it turns names into addresses.", ['c:cdmtechnologies.github.io  ->  IP address']),
    ("A records point to addresses, CNAME records point to other names, and changes take time to spread.", ['b:A   CNAME   MX   TXT']),
])
more('cloud-iac', 'Drift', [
    ("Drift happens when someone changes things by hand, so reality no longer matches the code.", ['r:hand changes = drift']),
    ("The next plan will try to undo the change, which surprises people. All changes go through code.", ['g:all changes through code']),
])
more('cloud-serverless', 'Managed databases', [
    ("Running a database yourself means backups, updates and failover at three in the morning. Managed databases do that for you.", ['n:let someone else wake up at 3 a.m.']),
    ("You still own the design, the security rules and the queries.", ['b:you own the design and security']),
])
more('cloud-iam', 'Keys and audit logs', [
    ("Prefer short-lived credentials from roles. If you must use keys, keep them in a secrets manager and rotate them.", ['g:roles over keys']),
    ("Turn on audit logs, so you can always see who did what, and when.", ['b:who did what, when']),
])
more('cloud-cost', 'Estimating a bill', [
    ("Estimate before you build: servers, database, storage, bandwidth, and backups, each per month.", ['c:compute + database + storage + traffic']),
    ("Then compare the bill each month with the estimate, and investigate any surprise.", ['g:compare and investigate']),
])
