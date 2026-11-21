from build import Board, around, arrow, text, tick, cross, BLUE, RED, GREEN, ORANGE, INK

LESSON = 'python-ai-career'


def s1():
    b = Board()
    return ('1-pair', [
        ("AI can write a working Python function in seconds. But it is like a very fast junior colleague who is confident, even when wrong.", [
            b.title('Python with AI'), b.line('AI = a fast junior colleague', 72)]),
        ("You are the senior. Read it, test it, and understand every line before you trust it.", [
            b.line('read   ->   test   ->   understand', 72, color=GREEN)]),
        ("Ask it to explain code, to debug with the full error, to write test cases, and to review your work.", [
            b.space(20), b.note('explain, debug, test, review', 70)]),
    ])


def s2():
    b = Board()
    return ('2-prompt', [
        ("A strong prompt has context. Fix my code is weak.", [b.title('Good prompts'), (w := b.line('"fix my code"', 74, color=RED)), cross(1250, w['y'] - 55, 50, RED)]),
        ("Strong: say what the function should do, what it does instead, and paste the code and the input. Never paste passwords or customers' data.", [
            b.line('what it should do  +  what happens  +  code', 60, color=GREEN), tick(1700, b.y - 120, 50), b.note('never paste passwords or private data', 62, RED)]),
    ])


def s3():
    b = Board()
    return ('3-next', [
        ("Next steps: pandas for data, FastAPI or Django for websites, automation for office work, and AI apps.", [
            b.title('Where Python takes you'), b.line('data  -  web  -  automation  -  AI', 70, color=BLUE)]),
        ("Put three to five small, real projects on GitHub. Your final project in this course is a great first one. Good luck!", [
            b.space(30), b.note('3 to 5 real projects on GitHub', 70), b.note('Good luck!', 90, GREEN)]),
    ])


SCENES = [s1(), s2(), s3()]
