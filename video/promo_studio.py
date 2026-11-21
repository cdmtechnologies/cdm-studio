from build import Board, around, box, arrow, tick, text, BLUE, GREEN, ORANGE, INK

LESSON = 'promo-studio'


def s1():
    b = Board(top=260)
    return ('1-hello', [
        ("Want to learn tech? Meet CDM Studio.", [b.title('CDM Studio', 140), b.space(40), b.note('Learn. Build. Get certified.', 80)]),
    ])


def s2():
    b = Board()
    return ('2-courses', [
        ("Ten courses: Python, SQL, AI, data, cybersecurity and more.", [
            b.title('10 courses'), b.line('Python  ·  SQL  ·  AI engineering', 70, color=BLUE),
            b.line('Data analytics  ·  Machine learning', 70, color=BLUE), b.line('Cybersecurity  ·  Cloud  ·  UI/UX', 70, color=BLUE)]),
        ("Every lesson has a short video like this, and you practise in your browser.", [
            b.space(10), (v := b.note('a video every lesson + practice', 66)), around(v)]),
    ])


def s3():
    b = Board(top=230)
    return ('3-certificate', [
        ("Pass the final project and exam, and earn your certificate.", [
            box(560, 160, 800, 300, INK, 7), text('CERTIFICATE', 960, 290, 84, 'EMSFelix', align='center', width=8), tick(960, 400, 50)]),
        ("The first lessons are free. Start today.", [b.space(380), b.line('First lessons free', 80, color=GREEN),
            b.line('cdmtechnologies.github.io/cdm-studio', 58, font='EMSNixish', color=BLUE)]),
        ("See you in class.", []),
    ])


SCENES = [s1(), s2(), s3()]
