from build import Board, around, arrow, text, path, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-strings'


def s1():
    b = Board()
    return ('1-slices', [
        ("Text in Python is a string, and a string behaves like a list of characters.", [
            b.title('Working with text'), b.code('city = "Port Harcourt"', 80)]),
        ("You can slice it like a loaf of bread. From the start position, up to but not including the end.", [
            b.code('city[0:4]   ->   "Port"', 76), b.code('city[-8:]   ->   "Harcourt"', 76)]),
        ("Len tells you how many characters it has.", [b.code('len(city)   ->   13', 76)]),
    ])


def s2():
    b = Board()
    return ('2-tools', [
        ("Every string carries a tool belt of methods. You call them with a dot.", [b.title('String methods')]),
        ("Strip removes spaces at the ends. Title capitalises each word. Replace swaps text. Split cuts text into a list.", [
            b.pair('"  ada ".strip()', '"ada"', 64, lx=260, rx=1260), b.pair('"ada obi".title()', '"Ada Obi"', 64, lx=260, rx=1260),
            b.pair('"1,200".replace(",", "")', '"1200"', 64, lx=260, rx=1260), b.pair('"a,b,c".split(",")', "['a','b','c']", 64, lx=260, rx=1260)]),
        ("Strings never change themselves. Methods give you a new string, so keep the result in a variable.", [
            b.code('name = name.strip()', 70, color=GREEN)]),
    ])


def s3():
    b = Board()
    return ('3-clean', [
        ("Real data is typed by real people, and people are inconsistent.", [
            b.title('Cleaning real text'), b.line('"0803 123 4567"   "+234-803-123-4567"', 62, color=RED)]),
        ("Keep only the digits, then turn a local zero into two three four. Now both numbers match.", [
            b.down(), b.line('2348031234567', 84, color=GREEN)]),
        ("That is everyday work in offices around the world. Now write initials, clean phone and mask email.", [
            b.note('Your turn!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
