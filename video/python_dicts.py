from build import Board, around, arrow, text, path, box, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-dicts'


def s1():
    b = Board()
    return ('1-phonebook', [
        ("A list finds things by position. A dictionary finds things by name, like a phone book.", [
            b.title('Dictionaries'), b.code('prices = {"bread": 1200, "milk": 900}', 70)]),
        ("You look up bread, and you get its price. The name is the key. What you get back is the value.", [
            b.code('prices["bread"]   ->   1200', 72), text('key', 700, b.y - 200, 60, 'EMSFelix', color=ORANGE), text('value', 1240, b.y - 200, 60, 'EMSFelix', color=ORANGE)]),
        ("Get is a safe lookup. If the key is missing, you get the default instead of an error.", [
            b.space(70), b.code('prices.get("sugar", 0)   ->   0', 72, color=GREEN)]),
    ])


def s2():
    b = Board()
    return ('2-tally', [
        ("The counting pattern is a tally sheet. For each new name, start at zero. Each time you see it again, add one stroke.", [
            b.title('Counting'), b.code('counts[fruit] = counts.get(fruit, 0) + 1', 64)]),
        ("Mango, orange, mango, gives mango two, and orange one.", [
            b.line('mango  ||      orange  |', 80, font='EMSFelix', color=INK)]),
        ("Swap the one for an amount, and the same line gives sales per branch. That one line is the heart of every report.", [
            b.code('totals[branch] = totals.get(branch, 0) + amount', 60, color=GREEN)]),
    ])


def s3():
    b = Board()
    return ('3-records', [
        ("Real data looks like a table, and in Python each row is a dictionary. This is the same shape as JSON, which websites use to send data.", [
            b.title('Records'), b.code('{"branch": "Wuse", "amount": 5000}', 66), b.code('{"branch": "Garki", "amount": 7000}', 66)]),
        ("To find the best branch, find the key with the biggest total. Max with key equals totals dot get does it in one line.", [
            b.space(20), b.code('max(totals, key=totals.get)', 70, color=GREEN)]),
        ("Now write word counts, sales by branch and top branch.", [b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
