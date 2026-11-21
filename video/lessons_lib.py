"""Shared helpers for course script files that register many lessons at once."""
from build import Board, GREEN

LESSONS = {}


def lesson(name):
    def reg(f):
        LESSONS[name] = f
        return f
    return reg


def turn(b, msg='Your turn!'):
    return b.note(msg, 90, GREEN)


def make_modules(names, src):
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    for n in names:
        open(os.path.join(here, n.replace('-', '_') + '.py'), 'w').write(f"import {src}\nfrom lessons_lib import LESSONS\n\nLESSON = '{n}'\nSCENES = LESSONS[LESSON]()\n")
