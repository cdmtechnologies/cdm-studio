"""Video scripts: Digital marketing and SEO."""
from build import Board, around, arrow, box, text, path, tick, cross, BLUE, RED, GREEN, ORANGE, INK
from lessons_lib import lesson, turn


@lesson('marketing-foundations')
def _():
    a, b, c = Board(), Board(), Board()
    return [
        ('1-farming', [
            ("Many people think marketing means posting adverts everywhere. That is like a farmer throwing seeds onto a road, and hoping.", [a.title('What marketing really is'), a.line('seeds on the road?', 70, color=RED)]),
            ("Real marketing is good farming: the right field, the right seed, water at the right time, and checking what grows.", [
                a.pair('the field', 'audience', 66, lfont='EMSFelix', lx=420, rx=1080), a.pair('the seed', 'offer', 66, lfont='EMSFelix', lx=420, rx=1080),
                a.pair('the water', 'message and channel', 66, lfont='EMSFelix', lx=420, rx=1080), a.pair('the harvest', 'measurement', 66, lfont='EMSFelix', lx=420, rx=1080)]),
        ]),
        ('2-value', [
            ("Before any post, answer one question in one sentence: why should this person choose you, over every other option, including doing nothing?", [b.title('The value proposition')]),
            ("For busy parents in Abuja, fresh food delivered in two hours, so dinner is never a crisis. Who, the problem, the benefit, and what is different.", [
                b.line('For busy parents in Abuja,', 66), b.line('fresh food delivered in 2 hours,', 66), b.line('so dinner is never a crisis.', 66), b.note('who + problem + benefit + difference', 62)]),
        ]),
        ('3-funnel', [
            ("People rarely buy the first time they hear of you. They move through a funnel: awareness, consideration, conversion, and loyalty.", [
                c.title('The funnel'), path('M 560 300 L 1360 300 L 1080 760 L 840 760 Z', INK, 7),
                [text(t, 960, y, 56, 'EMSFelix', align='center', color=col) for t, y, col in (('awareness', 380, BLUE), ('consideration', 500, BLUE), ('conversion', 620, GREEN), ('loyalty', 730, ORANGE))]]),
            ("Saying buy now to someone who has never heard of you is like proposing marriage on a first meeting. Each stage needs different content.", [
                text('"Buy now!" on day one?', 960, 900, 62, 'EMSFelix', color=RED, align='center')]),
        ]),
    ]


@lesson('marketing-audience')
def _():
    a, b = Board(), Board()
    return [
        ('1-persona', [
            ("You cannot talk to everyone. Imagine a speech to a crowd that is half children and half bank managers. Whatever you say, you lose one half.", [a.title('Know your audience')]),
            ("A persona describes one typical customer, built from real research. Ngozi, a nurse in Lagos, shops on her phone during breaks, and wants healthy meals for her children.", [
                a.line('Ngozi, 34, nurse in Lagos', 68, color=BLUE), a.line('goals  -  frustrations  -  where she spends time', 58), a.note('built from evidence, not guesses', 64)]),
        ]),
        ('2-research', [
            ("Talk to five to ten real customers. Ask about the last time they bought something like yours, not whether they would buy it in future.", [
                b.title('Research and positioning'), b.line('"Tell me about the last time you..."', 64, color=GREEN)]),
            ("People do not buy a drill. They buy a hole in the wall, to hang a family photo. Ask what job the customer is hiring your product to do.", [
                b.line('drill  ->  hole  ->  family photo', 70, color=ORANGE)]),
            ("Now build a persona and a positioning statement with the tutor.", [turn(b)]),
        ]),
    ]


@lesson('marketing-seo-basics')
def _():
    a, b = Board(), Board()
    return [
        ('1-librarian', [
            ("Google is a librarian who has read every page in the world. When you ask a question, it hands you the ten pages most likely to help.", [a.title('How search engines work')]),
            ("First it crawls, following links to discover pages. Then it indexes, filing each page in a huge catalogue. Then it ranks the best answers.", [
                a.line('crawl   ->   index   ->   rank', 84, color=BLUE)]),
            ("Ranking rewards relevance, quality and trust, links from other sites, which are like recommendation letters, and a fast, mobile-friendly page.", [
                a.note('relevance - trust - links - speed', 66)]),
        ]),
        ('2-intent', [
            ("The same words can mean different things, so match the intent. How to start poultry farming wants a guide. Buy power bank Abuja wants a product page.", [
                b.title('Search intent and keywords'), b.pair('how to ...', 'learn: a guide', 62, lfont='EMSReadability', lx=360, rx=1080), b.pair('buy ... Abuja', 'buy: a product page', 62, lfont='EMSReadability', lx=360, rx=1080)]),
            ("Long, specific searches have fewer people each, but those people know exactly what they want. SEO is like planting trees, not lighting fireworks.", [
                b.space(20), b.note('plant trees, not fireworks', 72, GREEN)]),
        ]),
    ]


@lesson('marketing-onpage')
def _():
    a, b = Board(), Board()
    return [
        ('1-window', [
            ("On-page SEO is arranging your shop window, so people and Google's robots understand at once what you sell.", [a.title('On-page SEO')]),
            ("The title tag is the blue headline in search results. Put the main keyword near the start, and keep it under sixty characters.", [
                a.code('<title>Fresh Food Delivery in Abuja | Mama\'s Market</title>', 50)]),
            ("The meta description is the grey text underneath. It does not raise rankings, but a good one makes more people click.", [
                a.code('<meta name="description" content="...">', 58)]),
        ]),
        ('2-structure', [
            ("Use one main heading, then smaller headings for sections, like chapters in a textbook.", [b.title('Headings, images and links'), b.code('<h1>  ->  <h2>  ->  <h3>', 70)]),
            ("Google cannot see pictures, so describe every image with alt text. And never write click here: say where the link goes.", [
                b.code('alt="Plate of jollof rice with fried plantain"', 56), b.line('"click here"', 60, color=RED), b.line('"See this week\'s menu"', 60, color=GREEN)]),
            ("Write for people first. Now optimise the page.", [turn(b)]),
        ]),
    ]


@lesson('marketing-technical-seo')
def _():
    a, b = Board(), Board()
    return [
        ('1-plumbing', [
            ("Technical SEO is the plumbing. Customers never see it, but if it fails, the shop closes.", [a.title('Technical SEO')]),
            ("Most people browse on phones, so every page needs the viewport tag. A canonical link names the one official address of a page.", [
                a.code('<meta name="viewport" content="width=device-width">', 50), a.code('<link rel="canonical" href="https://...">', 56)]),
            ("Open Graph tags decide how your link looks when it is shared on WhatsApp or Facebook: a picture and a title get far more clicks.", [
                a.code('<meta property="og:image" content="...">', 56, color=GREEN)]),
        ]),
        ('2-structured', [
            ("Structured data is like filling in Google's form, instead of making it guess from your paragraphs.", [
                b.title('Structured data'), b.code('"@type": "LocalBusiness",', 64), b.code('"name": "Mama\'s Market"', 64)]),
            ("It can earn rich results: stars, prices or opening hours, right in Google. Compress images, use https, and check your site in PageSpeed Insights.", [
                b.note('stars, prices, opening hours', 66), turn(b)]),
        ]),
    ]


@lesson('marketing-content')
def _():
    a, b = Board(), Board()
    return [
        ('1-bait', [
            ("A fisherman chooses bait the fish like, not what the fisherman likes. Create things your audience genuinely wants, and they come to you.", [a.title('Content people want')]),
            ("Pick three to five content pillars: themes you post about again and again. Helpful recipes, behind the scenes, customer stories, and offers.", [
                a.line('recipes   behind the scenes   stories   offers', 60, color=BLUE), a.note('sell in about 1 post in 5', 62)]),
        ]),
        ('2-hooks', [
            ("People decide in two seconds whether to keep reading. Lead with a specific benefit, a question they are asking, a surprising fact, or a story.", [
                b.title('Hooks and calendars'), b.line('"Dinner in 15 minutes with 5 ingredients"', 62, color=GREEN)]),
            ("Plan a month ahead in a simple calendar. Consistency beats bursts. AI can help draft, but always add your own experience and check the facts.", [
                b.line('date - pillar - format - hook - call to action', 56), turn(b)]),
        ]),
    ]


@lesson('marketing-social')
def _():
    a, b = Board(), Board()
    return [
        ('1-where', [
            ("Opening a shop in an empty street is a mistake, however beautiful the shop. Go where your customers already spend time.", [
                a.title('Social media marketing'), a.line('Instagram  TikTok  Facebook  LinkedIn  WhatsApp', 58, color=BLUE)]),
            ("Two platforms done well beat six done badly. Feeds show people what they stop for, finish and share. You cannot trick the algorithm for long.", [
                a.note('two done well beat six done badly', 66)]),
        ]),
        ('2-conversation', [
            ("Social media is a conversation, not a billboard. Reply quickly, ask questions, and thank people.", [b.title('A conversation, not a billboard')]),
            ("When someone complains in public: answer fast and politely, do not argue, move the details to a private message, and fix it. Everyone else is watching.", [
                b.line('fast  ->  polite  ->  private  ->  fixed', 66, color=GREEN)]),
            ("Likes feel good, but sales pay salaries. Measure enquiries and sales.", [b.note('likes feel good, sales pay salaries', 64)]),
        ]),
    ]


@lesson('marketing-email')
def _():
    a, b = Board(), Board()
    return [
        ('1-land', [
            ("Your social media followers live on rented land: the platform can change the rules tomorrow. Your email list is owned land.", [
                a.title('Email and WhatsApp'), a.pair('followers', 'rented land', 70, lfont='EMSFelix', lcolor=RED, lx=460, rx=1080), a.pair('email list', 'owned land', 70, lfont='EMSFelix', lcolor=GREEN, lx=460, rx=1080)]),
            ("But consent comes first. Ask clearly, say what you will send, and make it easy to unsubscribe. Never buy lists.", [a.note('consent first, never buy lists', 66, RED)]),
        ]),
        ('2-journeys', [
            ("Write short, honest subject lines, one message, and one clear button. Split your list into segments, so each group gets what fits.", [
                b.title('Emails that work'), b.line('"Your weekend menu: 3 new soups"', 64, color=GREEN)]),
            ("Some emails send themselves: a welcome series, an abandoned basket reminder, a thank-you with a review request, and a win-back.", [
                b.line('welcome   basket   thank you   win-back', 62, color=BLUE)]),
        ]),
    ]


@lesson('marketing-ads')
def _():
    a, b = Board(), Board()
    return [
        ('1-rent', [
            ("SEO is like growing your own vegetables: cheap, slow, lasting. Ads are buying at the market: instant, but you pay every time.", [a.title('Paid ads')]),
            ("Search ads catch people already searching. Social ads show your product to people who match an audience, before they were searching.", [
                a.pair('Google search ads', 'existing demand', 62, lfont='EMSReadability', lx=320, rx=1100), a.pair('Facebook, Instagram ads', 'new demand', 62, lfont='EMSReadability', lx=320, rx=1100)]),
        ]),
        ('2-numbers', [
            ("Spend fifty thousand, get four hundred clicks and twenty sales worth two hundred thousand. Cost per sale: two thousand five hundred. Return: four to one.", [
                b.title('The numbers that matter'), b.pair('CPA = cost / sales', '2,500', 66, lfont='EMSNixish', lx=360, rx=1260), b.pair('ROAS = revenue / cost', '4', 66, lfont='EMSNixish', lx=360, rx=1260)]),
            ("Always compare cost per sale with your profit per sale, not the price. And make sure the landing page keeps the ad's promise.", [
                b.note('CPA must stay below profit per sale', 66, RED)]),
        ]),
    ]


@lesson('marketing-metrics')
def _():
    a, b = Board(), Board()
    return [
        ('1-measure', [
            ("A doctor does not prescribe without checking the temperature. A marketer should not spend without checking the numbers.", [
                a.title('Measure what works'), a.code('ctr = clicks / impressions', 66), a.code('cpa = cost / conversions', 66), a.code('roas = revenue / cost', 66)]),
            ("The most important number: how much can you afford to pay for one customer? If a sale makes four thousand profit, keep cost per sale below that.", [
                a.note('break-even: CPA < profit per sale', 66)]),
        ]),
        ('2-utm', [
            ("UTM labels on your links tell analytics where each visitor came from: the source, the medium, and the campaign.", [
                b.title('UTM links'), b.code('?utm_source=instagram&utm_medium=social', 56), b.code('&utm_campaign=december_promo', 56)]),
            ("Use lowercase and the same spelling every time, or Instagram and instagram become two sources. Now build the campaign calculator.", [
                b.note('same spelling, every time', 66), turn(b)]),
        ]),
    ]


@lesson('marketing-local')
def _():
    a, b = Board(), Board()
    return [
        ('1-near-me', [
            ("Near me searches come from people ready to act within the hour. For local businesses, the map results matter most.", [
                a.title('Local SEO and reviews'), a.line('"pharmacy near me"   "best suya in Wuse"', 62, color=BLUE)]),
            ("A free Google Business Profile is your sign on Google Maps: exact name, opening hours, real photos, and the same details everywhere online.", [
                a.note('hours, photos, same details everywhere', 64)]),
        ]),
        ('2-reviews', [
            ("Reviews are like a crowd outside a restaurant: people trust a busy place. Ask every happy customer. Never buy or fake reviews.", [
                b.title('Reviews and influencers'), b.line('ask, never fake', 76, color=GREEN)]),
            ("Reply to every review, good and bad. And paid influencer posts must be clearly labelled as ads. Audiences and regulators expect honesty.", [
                b.line('#ad  /  paid partnership', 70, color=ORANGE)]),
        ]),
    ]


@lesson('marketing-plan')
def _():
    a, b = Board(), Board()
    return [
        ('1-plan', [
            ("Posting every day without a plan is like driving fast without a destination: lots of fuel, no arrival.", [a.title('Your marketing plan')]),
            ("Set a SMART goal: specific, measurable, achievable, relevant and time-bound. Sixty new paying customers a month by March, not grow on social media.", [
                a.line('"60 new paying customers a month by March"', 60, color=GREEN), a.line('"grow on social media"', 60, color=RED)]),
            ("Spend most on what works, some on promising tests, and a little on bold experiments. Review every week.", [a.note('70 / 20 / 10', 80)]),
        ]),
        ('2-career', [
            ("Certificates from Google, Meta and HubSpot help. But real results for real businesses help more. Start with a family business, and document before and after.", [
                b.title('Your marketing career'), b.line('portfolio = real before-and-after results', 60, color=BLUE)]),
            ("Your final project is your first portfolio piece. Good luck!", [turn(b, 'Good luck!')]),
        ]),
    ]
