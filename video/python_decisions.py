from build import Board, around, arrow, tick, cross, text, path, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-decisions'


def s1():
    b = Board()
    return ('1-junction', [
        ("Until now, our programs followed one road. Real programs choose. Think of a road junction with a sign.", [
            b.title('Decisions: if and else'),
            path('M 960 900 L 960 600 M 960 600 L 600 330 M 960 600 L 1320 330', INK, 10)]),
        ("If the customer spent fifty thousand or more, take the discount road. Otherwise, take the normal road.", [
            text('amount >= 50000 ?', 1010, 760, 62, 'EMSNixish', color=BLUE),
            text('10% off', 520, 290, 70, 'EMSFelix', color=GREEN, align='center'),
            text('no discount', 1400, 290, 70, 'EMSFelix', color=RED, align='center')]),
        ("Your program checks the sign, and takes exactly one road.", [b.space(0)]),
    ])


def s2():
    b = Board()
    return ('2-syntax', [
        ("In Python, it looks like this. The line ends with a colon.", [
            b.title('if, elif, else'), b.code('if amount >= 50000:', 78, x=360), b.code('    print("10% off")', 78, x=360),
            b.code('else:', 78, x=360), b.code('    print("No discount")', 78, x=360)]),
        ("And the lines inside each branch are indented by four spaces. In Python, indentation is not decoration. It is how Python knows what belongs inside.", [
            path('M 368 458 L 368 474 L 478 474 L 478 458', ORANGE, 6), text('4 spaces', 1250, 437, 64, 'EMSFelix', color=ORANGE),
            arrow(1230, 420, 1080, 420, ORANGE, 5, head=22)]),
        ("Remember: two equals signs compare. One equals sign puts a value in a box.", [
            b.space(30), b.code('==   compares', 70, x=360, color=GREEN), b.code('=    puts in a box', 70, x=360, color=ORANGE)]),
    ])


def s3():
    b = Board()
    return ('3-functions', [
        ("Now, functions. A function is like a blender. You put things in, it does its job, and something comes out.", [
            b.title('Functions'), text('score', 300, 380, 70, 'EMSFelix', color=BLUE), arrow(500, 360, 700, 360, INK, 6),
            path('M 720 250 L 1180 250 L 1180 470 L 720 470 Z', INK, 7), text('grade()', 950, 385, 76, 'EMSNixish', color=BLUE, align='center'),
            arrow(1200, 360, 1400, 360, INK, 6), text('"A"', 1440, 380, 76, 'EMSNixish', color=GREEN)]),
        ("You build it once with def, and return sends the answer back. Then you can use it as often as you like.", [
            b.space(260), b.code('def grade(score):', 62, x=360), b.code('    if score >= 70:', 62, x=360), b.code('        return "A"', 62, x=360), b.code('    return "F"', 62, x=360)]),
        ("Check the highest grade first, because Python takes the first true road. Now write grade, delivery fee and can vote in the editor.", [
            text('highest check first', 1150, 690, 60, 'EMSFelix', color=ORANGE), text('Your turn!', 1150, 860, 90, 'EMSFelix', color=GREEN, width=8)]),
    ])


SCENES = [s1(), s2(), s3()]
