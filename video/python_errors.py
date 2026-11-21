from build import Board, around, arrow, text, path, cross, tick, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-errors'


def s1():
    b = Board()
    return ('1-traceback', [
        ("When Python cannot do something, it raises an exception, and prints a traceback. Errors are messages, not failures.", [
            b.title('Errors are messages'), b.code('total = int("twelve")', 76)]),
        ("Read it from the bottom. The last line names the kind of error, and what went wrong.", [
            b.line('ValueError: invalid literal for int()', 60, color=RED), arrow(1600, b.y - 40, 1460, b.y - 120, ORANGE, 6, head=24),
            text('start here', 1600, b.y + 10, 60, 'EMSFelix', color=ORANGE)]),
        ("Value error, type error, key error, name error: each tells you exactly where to look.", [
            b.space(40), b.line('ValueError   TypeError   KeyError   NameError', 58, color=INK)]),
    ])


def s2():
    b = Board()
    return ('2-net', [
        ("Try and except is a safety net, like the net under a trapeze artist. Usually it is not needed. When something slips, the show goes on.", [
            b.title('try and except'), b.code('try:', 76, x=480), b.code('    qty = int(text)', 76, x=480), b.code('except ValueError:', 76, x=480), b.code('    qty = 0', 76, x=480)]),
        ("Always catch a specific error. A bare except catches everything, even your own typos, and hides real bugs.", [
            b.space(20), text('except:', 480, b.y, 70, 'EMSNixish', color=RED), cross(800, b.y - 50, 50, RED), text('hides bugs', 900, b.y, 62, 'EMSFelix', color=RED)]),
        ("", []),
    ][:2])


def s3():
    b = Board()
    return ('3-raise', [
        ("Sometimes your function should refuse to continue, like a bank teller refusing a cheque with no signature. Raise an error with a clear message.", [
            b.title('raise: refuse bad input'), b.code('if amount > balance:', 74, x=420), b.code('    raise ValueError("Not enough money")', 66, x=420)]),
        ("Check data at the door. A clear error now is far better than a wrong total in next month's report.", [
            b.space(30), b.note('fail early, with a clear message', 70)]),
        ("Now write safe divide, parse quantity and total quantities.", [b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
