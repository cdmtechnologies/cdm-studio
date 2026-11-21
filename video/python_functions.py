from build import Board, around, arrow, box, text, path, cross, tick, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-functions'


def s1():
    b = Board()
    return ('1-parts', [
        ("Good programs are built like a car: engine, wheels, brakes. Each part made and tested on its own. Functions are those parts.", [
            b.title('Functions in depth'), [box(x, 330, 300, 170, width=6) for x in (330, 810, 1290)],
            [text(t, x + 150, 430, 56, 'EMSFelix', align='center') for x, t in zip((330, 810, 1290), ('vat()', 'invoice()', 'split_bill()'))]]),
        ("Each function should do one job, with a clear name, and be small enough to understand at a glance.", [
            b.space(260), b.note('one job, clear name, small', 70)]),
        ("A coffee machine gives you a medium cup unless you choose otherwise. Parameters can have defaults too.", [
            b.code('def vat(amount, rate=7.5):', 76), b.code('vat(1000)  ->  75.0', 70, color=GREEN)]),
    ])


def s2():
    b = Board()
    return ('2-return', [
        ("A function can return several values at once. Unpack them on the other side.", [
            b.title('Return, not print'), b.code('return subtotal, vat, total', 72), b.code('s, v, t = invoice_total(items)', 72)]),
        ("Print shows the answer, but gives nothing back. It is like a calculator that flashes the answer, then forgets it.", [
            b.space(30), b.line('print  ->  shows it, gives nothing back', 62, color=RED), b.line('return  ->  hands the answer back', 62, color=GREEN)]),
        ("Variables inside a function are local: scribbles on a whiteboard, wiped clean after each meeting. Pass things in, and return results out.", [
            b.note('inside stays inside', 70)]),
    ])


def s3():
    b = Board()
    return ('3-build', [
        ("Build big things from small, trusted pieces. Invoice total can call vat, which you already tested.", [
            b.title('Small pieces, big results'), b.code('v = vat(subtotal, rate)', 76)]),
        ("And a docstring, the first line inside a function, explains what it does, for your team and for AI assistants.", [
            b.code('"""VAT on an amount, rounded to 2 decimals."""', 58, color=ORANGE)]),
        ("Now write vat, invoice total and split bill.", [b.space(30), b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
