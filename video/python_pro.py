from build import Board, around, arrow, text, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-pro'


def s1():
    b = Board()
    return ('1-comprehensions', [
        ("Many loops build a new list from an old one. A comprehension does it in one line, and reads like a sentence.", [
            b.title('Python like a professional'), b.code('[p * 1.075 for p in prices]', 76)]),
        ("Give me the price times one point oh seven five, for each price in prices. Add an if, to keep only some.", [
            b.code('[p for p in prices if p > 1000]', 76)]),
    ])


def s2():
    b = Board()
    return ('2-sorting', [
        ("To sort records, tell sorted what to compare with key. It is like telling a librarian: arrange by title, by author, or by year.", [
            b.title('Sorting with a key'), b.code('sorted(products, key=lambda p: p["sold"],', 62), b.code('       reverse=True)', 62)]),
        ("A lambda is a tiny function with no name. Reverse equals True puts the best sellers first.", [
            b.space(30), b.note('best sellers first', 72, GREEN)]),
    ])


def s3():
    b = Board()
    return ('3-library', [
        ("Python ships with hundreds of modules: math, statistics, dates, files and more. Math dot ceil rounds up: how many buses for 130 pupils?", [
            b.title('Batteries included'), b.code('math.ceil(130 / 50)   ->   3', 72), b.code('statistics.median([5, 1, 9, 3])   ->   4', 64)]),
        ("Use clear names, small functions, and no magic numbers. Then write with vat, top products, buses needed and median sale.", [
            b.space(30), b.note('clear names, small functions', 66), b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
