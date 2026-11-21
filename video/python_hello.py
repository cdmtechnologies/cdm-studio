from build import Board, around, box, arrow, tick, cross, circle, text, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-hello'


def s1():
    b = Board()
    return ('1-recipe', [
        ("Welcome to Python! A computer is a very fast, very obedient worker. But it understands nothing, unless you spell it out.", [b.title('Your first Python program')]),
        ("A program is like a recipe. The cook starts at the top, and follows one line at a time, in order.", [
            b.line('1. Wash the rice'), b.line('2. Boil the water'), b.line('3. Add the rice'),
            arrow(1500, 330, 1500, 600, ORANGE, 7, head=30), text('top to bottom', 1560, 480, 56, 'EMSFelix', color=ORANGE)]),
        ("Python is the language most people learn first, because it reads almost like English. Banks, Instagram and AI labs all use it.", [
            b.space(20), b.note('reads like English', 70, GREEN)]),
    ])


def s2():
    b = Board()
    return ('2-print', [
        ("Your first instruction is print. It shows something on the screen.", [b.title('print( )'), b.code('print("Hello, world!")', 90)]),
        ("The words inside quotes are text. Programmers call it a string: a string of letters.", [
            b.down(), (hw := b.line('Hello, world!', 84)), around(hw)]),
        ("Without quotes, Python calculates. Print five plus three shows eight. With quotes, it just shows the words.", [
            b.space(10), text('print(5 + 3)', 300, b.y, 70, 'EMSNixish', color=BLUE), text('8', 1100, b.y, 70),
            text('print("5 + 3")', 300, b.y + 110, 70, 'EMSNixish', color=BLUE), text('5 + 3', 1100, b.y + 110, 70)]),
    ])


def s3():
    b = Board()
    return ('3-comments', [
        ("Anything after a hash sign is a comment. Python skips it. It is a sticky note you leave for yourself and your team.", [
            b.title('Comments and errors'), b.code('# hours in a year', 76), b.code('print(365 * 24)', 76)]),
        ("Mistakes are normal. Forget a quote, and Python stops with a syntax error, and tells you the line.", [
            b.space(20), b.code('print("Hello)', 76), cross(1300, b.y - 170, 50, RED),
            b.line('SyntaxError: unterminated string', 56, color=RED)]),
        ("Always read the last line of an error first. Now open the editor, and write your first three lines of Python.", [
            b.note('read the LAST line first', 66), b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
