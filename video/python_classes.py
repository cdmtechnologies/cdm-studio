from build import Board, around, arrow, box, text, path, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-classes'


def s1():
    b = Board()
    house = 'M {x} 520 L {x} 400 L {m} 320 L {r} 400 L {r} 520 Z'
    return ('1-blueprint', [
        ("An architect draws one blueprint, and builders use it to put up many houses. Each house is separate: paint one blue, and the others stay white.", [
            b.title('Classes and objects'), path(house.format(x=300, m=400, r=500), BLUE, 6), text('blueprint', 400, 600, 56, 'EMSFelix', color=BLUE, align='center'),
            arrow(560, 420, 760, 420, INK, 6), [path(house.format(x=x, m=x + 100, r=x + 200), INK, 6) for x in (820, 1100, 1380)]]),
        ("In Python, the blueprint is a class, and each house built from it is an object.", [
            text('class', 400, 700, 70, 'EMSNixish', color=BLUE, align='center'), text('objects', 1200, 700, 70, 'EMSNixish', color=INK, align='center')]),
    ])


def s2():
    b = Board()
    return ('2-parts', [
        ("init runs when an object is built, and sets up its starting data. Self means this particular object.", [
            b.title('Inside a class'), b.code('class Account:', 66, x=360), b.code('    def __init__(self, owner, balance=0):', 60, x=360), b.code('        self.balance = balance', 60, x=360)]),
        ("Methods are functions that belong to the object. Deposit changes this account's balance, not everyone's.", [
            b.code('    def deposit(self, amount):', 60, x=360), b.code('        self.balance += amount', 60, x=360)]),
    ])


def s3():
    b = Board()
    return ('3-rules', [
        ("Keep the rules next to the data. The only way to change a balance is through deposit and withdraw, and they check the rules first.", [
            b.title('Keep objects valid'), b.code('if amount > self.balance:', 70), b.code('    raise ValueError("Insufficient funds")', 62)]),
        ("A history list gives you a statement for free, like a bank's ledger. Now build your Account class.", [
            b.space(30), b.code("history: [('deposit', 2000), ('withdraw', 300)]", 56, color=GREEN), b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
