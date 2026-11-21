from build import Board, around, arrow, text, path, cross, tick, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-csv'


def s1():
    b = Board()
    return ('1-csv', [
        ("Almost every system can export a CSV file: bank statements, sales, school results. It is just text, one row per line, with commas between columns.", [
            b.title('Reading CSV data'), b.line('date,branch,product,amount', 64, font='EMSNixish'), b.line('2026-11-01,Wuse,Bread,1200', 64, font='EMSNixish'),
            b.line('2026-11-01,Garki,Milk,900', 64, font='EMSNixish')]),
        ("If a spreadsheet is a printed table, a CSV is that same table read out over the phone: plain, and understood everywhere.", [
            b.space(20), b.note('the language spreadsheets speak', 70)]),
    ])


def s2():
    b = Board()
    return ('2-reader', [
        ("Python comes with batteries included. The csv module reads each row as a dictionary, using the first line as the column names.", [
            b.title('csv.DictReader'), b.code('import csv', 70, x=360), b.code('rows = list(csv.DictReader(file))', 70, x=360)]),
        ("But notice: every value arrives as text, even the amount. You must convert numbers yourself.", [
            b.space(20), (r := b.code("{'amount': '1200'}", 74)), around(r, RED), b.note('text, not a number!', 64, RED)]),
    ])


def s3():
    b = Board()
    return ('3-clean', [
        ("Real exports have blank amounts and typos. The professional habit: never crash on one bad row, and never silently include it.", [
            b.title('Skip, count, report'), b.code('try:', 68, x=420), b.code('    amount = float(row["amount"])', 68, x=420), b.code('except ValueError:', 68, x=420),
            b.code('    bad += 1', 68, x=420), b.code('    continue', 68, x=420)]),
        ("Skip it, count it, and report it. Now load the sales data and summarise it by branch.", [
            text('Your turn!', 1500, 700, 90, 'EMSFelix', color=GREEN, width=8)]),
    ])


SCENES = [s1(), s2(), s3()]
