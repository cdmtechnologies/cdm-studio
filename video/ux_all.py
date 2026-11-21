"""Video scripts: UI/UX design."""
from build import Board, around, arrow, box, text, path, tick, cross, BLUE, RED, GREEN, ORANGE, INK
from lessons_lib import lesson, turn


@lesson('uiux-intro')
def _():
    a, b = Board(), Board()
    return [
        ('1-door', [
            ("Have you ever pushed a door that needed to be pulled? You felt silly. But the mistake was the designer's, not yours.", [
                a.title('What UI and UX mean'), box(800, 330, 320, 520, width=7), path('M 1060 560 L 1060 640', INK, 12), text('PUSH', 960, 430, 64, 'EMSFelix', color=RED, align='center')]),
            ("Good design makes the right action obvious. That is the heart of this course.", [text('make the right action obvious', 960, 960, 64, 'EMSFelix', color=GREEN, align='center')]),
        ]),
        ('2-uiux', [
            ("UX is the whole journey: can people find what they need, and finish without frustration? UI is the vehicle: buttons, colours, text and spacing.", [
                b.title('UX is the journey, UI is the vehicle'), b.pair('UX', 'the journey', 80, lfont='EMSFelix', lx=560, rx=1000), b.pair('UI', 'the vehicle', 80, lfont='EMSFelix', lx=560, rx=1000)]),
            ("Designers follow a loop: empathise, define, ideate, prototype, test, and round again. And remember: you are not your user.", [
                b.line('empathise -> define -> ideate -> prototype -> test', 56, color=BLUE), b.note('you are not your user', 70, ORANGE)]),
        ]),
    ]


@lesson('uiux-research')
def _():
    a, b = Board(), Board()
    return [
        ('1-tailor', [
            ("A tailor measures before cutting the cloth. A designer studies people before drawing screens.", [a.title('Understanding users')]),
            ("Ask about real past behaviour, not opinions about the future. People say yes to be polite.", [
                a.line('"Would you use this app?"', 64, color=RED), a.line('"Tell me about the last time you paid a fee."', 60, color=GREEN)]),
            ("Watch people too. You will see workarounds, like a notebook beside the till, that nobody mentions, because to them it is normal.", [a.note('watch for workarounds', 68)]),
        ]),
        ('2-journey', [
            ("A journey map draws each step towards a goal, with what people do, think and feel. The low points are your design opportunities.", [
                b.title('Journey maps'), path('M 300 520 Q 500 380 700 470 Q 900 720 1100 650 Q 1300 420 1600 400', BLUE, 7),
                text('waiting...', 960, 800, 60, 'EMSFelix', color=RED, align='center')]),
            ("Then write the problem, not the solution: parents need to know at once that the school received their payment.", [turn(b)]),
        ]),
    ]


@lesson('uiux-structure')
def _():
    a, b = Board(), Board()
    return [
        ('1-supermarket', [
            ("In a good supermarket, you find the rice without asking anyone. Information architecture does that for an app: organising content so people find things.", [
                a.title('Organising content'), a.line('group things the way users think', 66, color=GREEN)]),
            ("Card sorting shows how users think. They group the topics, and name the groups. Their labels are often better than yours.", [a.note('card sorting', 72)]),
        ]),
        ('2-wireframes', [
            ("A user flow maps the steps for one task. Every step you remove is a step where nobody can give up.", [
                b.title('Flows and wireframes'), b.line('open -> choose -> basket -> pay -> done', 62, color=BLUE)]),
            ("A wireframe is a floor plan, not the paint: what goes where, in simple boxes. Sketch on paper first, and use real content early.", [
                box(700, 560, 520, 330, width=6), box(740, 600, 440, 90, width=4), box(740, 720, 200, 140, width=4), box(980, 720, 200, 60, width=4, color=BLUE)]),
        ]),
    ]


@lesson('uiux-layout')
def _():
    a, b = Board(), Board()
    return [
        ('1-hierarchy', [
            ("Open a newspaper, and your eyes jump to the biggest headline, then the photo, then the small text. That order is visual hierarchy.", [
                a.title('Layout and hierarchy'), a.line('BIG headline', 100), a.line('then the photo, then the small text', 48)]),
            ("On every screen, ask: what is the one most important thing here? Make that the most visible.", [a.note('one most important thing', 70)]),
        ]),
        ('2-space', [
            ("Things that belong together sit together. A price close to its product name reads as one unit. Space is how people see groups.", [
                b.title('Spacing and grids'), b.line('Power bank    18,000', 66), b.line('Earbuds    9,500', 66)]),
            ("Use a few spacing sizes, like four, eight, sixteen, twenty-four and thirty-two pixels, the way builders use standard bricks. Then lay out your product cards.", [
                b.code('4  8  16  24  32', 80, color=ORANGE), turn(b)]),
        ]),
    ]


@lesson('uiux-type')
def _():
    a, b = Board(), Board()
    return [
        ('1-voice', [
            ("Most of what people see on a screen is text. Typography is like a voice: the same words can sound calm and trustworthy, or rushed and confusing.", [
                a.title('Typography'), a.line('one or two fonts are enough', 68)]),
            ("Body text should be sixteen pixels or more. Smaller text tires the eyes, and on phones people give up.", [a.code('font-size: 16px or more', 70, color=GREEN)]),
        ]),
        ('2-lines', [
            ("Line height is space between lines. Too tight, and lines blur like a crowded bus. Aim for about one and a half.", [b.title('Line height and length'), b.code('line-height: 1.5', 74)]),
            ("Long lines are hard to follow: your eye loses its place. Keep lines to about sixty-five characters.", [b.code('max-width: 65ch', 74, color=GREEN), turn(b)]),
        ]),
    ]


@lesson('uiux-colour')
def _():
    a, b = Board(), Board()
    return [
        ('1-roles', [
            ("In a good interface, every colour has a job, like players in a football team: neutral for backgrounds, a brand colour for actions, and colours with meaning.", [
                a.title('Colour has jobs'), a.line('green = success    red = error    amber = warning', 58)]),
            ("About one man in twelve has trouble telling some colours apart. So never use colour alone: add a word or an icon.", [a.note('never colour alone', 72, RED)]),
        ]),
        ('2-contrast', [
            ("Contrast compares how light two colours are. Black on white is twenty-one to one. Normal text needs at least four and a half to one.", [
                b.title('Contrast'), b.pair('normal text', '4.5 : 1', 70, lfont='EMSFelix', lx=460, rx=1100), b.pair('large text', '3 : 1', 70, lfont='EMSFelix', lx=460, rx=1100)]),
            ("Light grey text looks elegant in a design file, and becomes unreadable on a phone in sunlight. Now build a contrast checker.", [turn(b)]),
        ]),
    ]


@lesson('uiux-forms')
def _():
    a, b = Board(), Board()
    return [
        ('1-labels', [
            ("Sign-up and checkout are where money is made or lost. A confusing form is like a cashier who ignores you: people walk out.", [a.title('Forms people can finish')]),
            ("Every field needs a visible label. Placeholder text disappears as soon as you type, and people forget what the field was for.", [
                a.code('<label for="phone">Phone number</label>', 60, color=GREEN)]),
            ("And a button is like a light switch: people need to know it worked. Design hover, focus, disabled and loading states.", [
                a.line('default   hover   focus   loading', 64, color=BLUE)]),
        ]),
        ('2-errors', [
            ("Invalid input helps nobody. Say what went wrong, and how to fix it, right next to the field.", [
                b.title('Helpful errors'), b.line('"Invalid input"', 64, color=RED), b.line('"Enter an 11-digit phone number, like 0803 123 4567"', 52, color=GREEN)]),
            ("Never clear the whole form because of one mistake. Now fix the sign-up form.", [turn(b)]),
        ]),
    ]


@lesson('uiux-responsive')
def _():
    a, b = Board(), Board()
    return [
        ('1-phones', [
            ("Most people reach the internet through a phone, often an affordable one with a small screen and expensive data.", [
                a.title('Mobile first'), box(860, 330, 200, 380, width=7), box(1240, 380, 460, 300, width=7), arrow(1080, 520, 1220, 520, INK, 5)]),
            ("Designing for a big laptop, then squeezing it onto phones, is like building a house for a giant and asking a child to live in it. Start small, then add.", [
                text('start small, then add', 960, 860, 70, 'EMSFelix', color=GREEN, align='center')]),
        ]),
        ('2-thumbs', [
            ("Fingers are less precise than a mouse. Make buttons at least forty-four pixels tall, with space between them.", [b.title('Thumbs and screens'), b.code('min-height: 44px', 76)]),
            ("Media queries add columns as the screen grows. And compress images: every megabyte costs your users money.", [
                b.code('@media (min-width: 768px) { ... }', 64, color=GREEN), turn(b)]),
        ]),
    ]


@lesson('uiux-accessibility')
def _():
    a, b = Board(), Board()
    return [
        ('1-ramp', [
            ("A ramp was built for wheelchair users, but parents with buggies and travellers with suitcases use it too. Accessible design helps everyone.", [
                a.title('Design for everyone'), path('M 400 760 L 1200 520 L 1500 520', INK, 8)]),
            ("Some people use screen readers, some use only a keyboard, some zoom to two hundred percent. Design so all of them can finish the task.", [
                text('screen readers   keyboards   zoom', 960, 900, 60, align='center', color=BLUE)]),
        ]),
        ('2-html', [
            ("Use the right element and you get accessibility for free. A real button works with the keyboard. A clickable div does not.", [
                b.title('Semantic HTML'), b.code('<button>  not  <div onclick>', 72)]),
            ("Give icon buttons a name, keep headings in order, and add a skip link. Now fix the page.", [b.code('aria-label="Search"', 70, color=GREEN), turn(b)]),
        ]),
    ]


@lesson('uiux-testing')
def _():
    a, b = Board(), Board()
    return [
        ('1-rehearsal', [
            ("Changing a sketch costs minutes. Changing a finished app costs weeks. A prototype is a rehearsal before opening night.", [
                a.title('Prototypes and testing'), a.line('paper  ->  clickable  ->  coded', 70, color=BLUE)]),
            ("Testing with about five people finds most of the biggest problems. Test, fix, then test again.", [a.note('5 people, fix, repeat', 72)]),
        ]),
        ('2-session', [
            ("Give a goal, not instructions: you want to send five thousand naira to your sister. Show me how.", [
                b.title('Running a test'), b.line('"Show me how you would send N5,000"', 62, color=GREEN)]),
            ("Ask them to think aloud, and do not help, however painful. Where they struggle is exactly what you came to find.", [b.note('stay quiet and watch', 72, ORANGE)]),
        ]),
    ]


@lesson('uiux-systems')
def _():
    a, b = Board(), Board()
    return [
        ('1-lego', [
            ("LEGO bricks come in a fixed set of shapes and colours. That is exactly why everything fits together. A design system is a LEGO set for a product.", [
                a.title('Design systems'), [box(x, 360, 160, 100, width=6, color=c) for x, c in ((600, BLUE), (800, RED), (1000, GREEN), (1200, ORANGE))]]),
            ("Tokens are the named values at its heart: colours, spacing and corners. Name them by role, like colour danger, not by look, like red.", [
                a.space(300), a.code('--color-primary   --space   --radius', 64)]),
        ]),
        ('2-dark', [
            ("Because components use roles, dark mode just swaps the token values.", [b.title('Dark mode with tokens'), b.code('@media (prefers-color-scheme: dark)', 64)]),
            ("Change the brand colour in one place, and the whole product follows. Now refactor the page with tokens.", [b.note('change once, everywhere follows', 66), turn(b)]),
        ]),
    ]


@lesson('uiux-career')
def _():
    a, b = Board(), Board()
    return [
        ('1-case', [
            ("Employers hire designers for how they think. A case study tells a project like a short detective story: the problem, the investigation, the answer, and the proof.", [
                a.title('Your case study'), a.line('problem -> research -> decisions -> results', 60, color=BLUE)]),
            ("Three strong case studies beat ten weak ones. Your final project here is a great first one.", [a.note('3 strong beat 10 weak', 72)]),
        ]),
        ('2-ai', [
            ("Use AI to explore faster, then apply your judgement: AI does not know your users, and often misses accessibility.", [
                b.title('AI and your career'), b.line('explore with AI, decide with judgement', 62, color=GREEN)]),
            ("Learn Figma next, join design communities, and start building your portfolio. Good luck!", [turn(b, 'Good luck!')]),
        ]),
    ]
