from build import text, path, box, line, arrow, tick, cross, underline, circle, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-values'
F = 'EMSFelix'      # handwriting for titles
C = 'EMSNixish'     # code

SCENES = [
    ('1-boxes', [
        ("Imagine you sell phone accessories at a market stall.", [
            text('Variables', 960, 150, 120, F, align='center', width=8),
            underline(700, 175, 520),
        ]),
        ("You keep your things in boxes, and every box has a label, so you always find what you need.", [
            box(300, 420, 420, 300, width=7),
            box(1200, 420, 420, 300, width=7),
            text('price', 510, 395, 64, F, color=BLUE, align='center'),
            text('quantity', 1410, 395, 64, F, color=BLUE, align='center'),
        ]),
        ("In Python, a variable is exactly that: a labelled box that holds a value.", [
            text('1500', 510, 600, 110, align='center', width=8),
            text('3', 1410, 600, 110, align='center', width=8),
            text('a labelled box that holds a value', 960, 880, 64, align='center', color=ORANGE),
        ]),
    ]),
    ('2-equals', [
        ("Here is how you fill a box in Python: price equals fifteen hundred.", [
            text('price = 1500', 960, 260, 130, C, color=BLUE, align='center', width=8),
        ]),
        ("But careful. This equals sign is not the equals of maths. It means: take the value on the right, and put it into the box on the left.", [
            arrow(1270, 310, 700, 310, RED, 7, bend=-110, head=30),
            text('put into', 985, 470, 68, F, color=RED, align='center'),
            text('(not "is equal to")', 985, 545, 50, F, color=RED, align='center'),
        ]),
        ("That is why count equals count plus one makes sense: take what is in the box, add one, and put it back.", [
            text('count = count + 1', 960, 720, 100, C, color=BLUE, align='center', width=7),
            arrow(1260, 760, 640, 760, ORANGE, 6, bend=-60, head=24),
            text('take it, add 1, put it back', 960, 900, 56, F, color=ORANGE, align='center'),
        ]),
    ]),
    ('3-types', [
        ("Boxes can hold different kinds of things.", [
            text('Kinds of values', 960, 140, 100, F, align='center', width=8),
            underline(640, 165, 640),
        ]),
        ("Whole numbers are called int. Decimals are float. Text in quotes is a string, and True or False is a bool.", [
            text('42', 420, 290, 80, C, color=BLUE), arrow(620, 278, 780, 278, INK, 5, head=20), text('int', 820, 300, 70, F),
            text('3.5', 420, 390, 80, C, color=BLUE), arrow(620, 368, 780, 368, INK, 5, head=20), text('float', 820, 390, 70, F),
            text('"Abuja"', 420, 490, 80, C, color=BLUE), arrow(720, 468, 860, 468, INK, 5, head=20), text('str  (text)', 900, 490, 70, F),
            text('True', 420, 590, 80, C, color=BLUE), arrow(640, 568, 780, 568, INK, 5, head=20), text('bool  (yes or no)', 820, 590, 70, F),
        ]),
        ("Python will not mix them carelessly. Quote five, plus three, is an error. Convert on purpose: int of five, plus three, gives eight.", [
            text('"5" + 3', 420, 780, 80, C, color=INK), cross(800, 730, 50, RED), text('error', 900, 780, 60, F, color=RED),
            text('int("5") + 3  =  8', 420, 900, 80, C, color=INK), tick(1240, 870, 56, GREEN),
        ]),
    ]),
    ('4-fstrings', [
        ("Finally, f-strings. Think of a printed form with blanks to fill in.", [
            text('f-strings', 960, 150, 110, F, align='center', width=8),
            line(380, 340, 640, 340, INK, 5), text('bought', 670, 335, 70, F), line(930, 340, 1080, 340, INK, 5), text('items', 1110, 335, 70, F),
        ]),
        ("Put the letter f before the quotes, and your variables inside curly brackets. Python fills in the blanks for you.", [
            text('f"{name} bought {items} items"', 960, 520, 84, C, color=BLUE, align='center', width=7),
            circle(515, 492, 150, ORANGE, 5),
            arrow(960, 570, 960, 670, INK, 6, head=26),
            text('Chika bought 3 items', 960, 770, 90, align='center', width=8),
        ]),
        ("Now it is your turn. Open the editor and build a receipt with VAT.", [
            text('Your turn!', 960, 920, 100, F, color=GREEN, align='center', width=8),
        ]),
    ]),
]
