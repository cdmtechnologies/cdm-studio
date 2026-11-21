from build import Board, around, arrow, box, tick, text, path, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-loops'


def s1():
    b = Board()
    xs = [380, 640, 900, 1160, 1420]
    return ('1-lockers', [
        ("One variable holds one value. A list holds many, in order, like a row of numbered lockers.", [
            b.title('Lists'), [box(x, 330, 220, 200, width=6) for x in xs],
            [text(v, x + 110, 455, 60, align='center', color=BLUE) for x, v in zip(xs, ['12000', '8500', '15000', '9200', '11000'])]]),
        ("The first locker is number zero. Think of it as how many steps from the start.", [
            [text(str(i), x + 110, 600, 56, 'EMSFelix', color=ORANGE, align='center') for i, x in enumerate(xs)],
            text('sales[0]  =  12000', 960, 740, 70, 'EMSNixish', color=BLUE, align='center')]),
        ("Python can add up, count and find the biggest, for the whole list at once.", [
            text('sum(sales)    len(sales)    max(sales)', 960, 880, 62, 'EMSNixish', color=BLUE, align='center')]),
    ])


def s2():
    b = Board()
    return ('2-loop', [
        ("A for loop is a teacher walking down a row of desks, doing the same thing at each desk.", [
            b.title('for loops'), b.code('for amount in sales:', 80, x=420), b.code('    print(amount)', 80, x=420)]),
        ("The indented lines run once for every item. And amount holds the current item each time round.", [
            arrow(1450, 440, 1450, 620, ORANGE, 6, bend=-80), text('each item', 1500, 560, 60, 'EMSFelix', color=ORANGE)]),
        ("Range counts for you. Range one to five gives one, two, three and four, because the end is not included.", [
            b.space(60), b.code('range(1, 5)', 76), b.line('1, 2, 3, 4', 72), b.note('the end is not included', 60)]),
    ])


def s3():
    b = Board()
    return ('3-total', [
        ("The most useful loop pattern of all is the running total. It is exactly how a cashier counts a pile of notes.", [
            b.title('The running total'), b.code('total = 0', 76, x=460), b.code('for amount in sales:', 76, x=460), b.code('    total = total + amount', 76, x=460)]),
        ("Start at zero, and add each amount as you go. The same pattern counts things, or builds a new list.", [
            b.space(20), b.line('0  ->  12000  ->  20500  ->  35500 ...', 64, color=GREEN)]),
        ("Never divide by zero: if the list is empty, return zero. Now write average, count above, running totals and biggest.", [
            b.note('empty list? return 0', 64, RED), b.note('Your turn!', 84, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
