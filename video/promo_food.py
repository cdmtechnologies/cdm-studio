from build import Board, around, tick, text, BLUE, GREEN, ORANGE, INK

LESSON = 'promo-food'


def s1():
    b = Board(top=280)
    return ('1-question', [
        ("What should I eat today? CDM Food plans your meals for you.", [b.note('What should I eat today?', 90), b.space(60), b.title('CDM Food', 140)]),
    ])


def s2():
    b = Board()
    return ('2-plan', [
        ("Pick your country, and its local menu loads.", [b.title('Your meal plan'), b.pair('your country', 'local menu', 70)]),
        ("Ask the AI to change it for your taste, budget or health.", [b.pair('Ask AI', 'your own plan', 70), b.space(20),
            b.line('taste  ·  budget  ·  health', 66, color=ORANGE)]),
    ])


def s3():
    b = Board(top=200)
    return ('3-track', [
        ("Track your weight and goals, tick off the meals you eat, and start free today.", [
            b.line('Breakfast', 72, x=560), tick(1200, b.y - 120, 40), b.line('Lunch', 72, x=560), tick(1200, b.y - 120, 40),
            b.line('Dinner', 72, x=560), b.space(40), b.line('Start free', 84, color=GREEN),
            b.line('cdm-food.netlify.app', 64, font='EMSNixish', color=BLUE)]),
    ])


SCENES = [s1(), s2(), s3()]
