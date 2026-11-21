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


def simple(name, spec):
    """A lesson from a compact spec: [(scene title, [(narration, [lines...]), ...]), ...]
    Line prefixes: 'c:' code, 'n:' handwritten note, 'g:' green, 'r:' red, 'b:' blue, 'T:' your-turn note; no prefix = plain text."""
    from build import BLUE, RED, GREEN, ORANGE

    def build_():
        out = []
        for i, (title, cues) in enumerate(spec):
            b = Board(top=170)
            cs = []
            for j, (say, lines) in enumerate(cues):
                items = [b.title(title)] if j == 0 else []
                for ln in lines:
                    k, t = (ln[:2], ln[2:]) if len(ln) >= 2 and ln[1] == ':' and ln[0] in 'cngrbT' else ('', ln)
                    if k == 'c:': items.append(b.code(t, 76))
                    elif k == 'n:': items.append(b.note(t, 76))
                    elif k == 'g:': items.append(b.line(t, 74, color=GREEN))
                    elif k == 'r:': items.append(b.line(t, 74, color=RED))
                    elif k == 'b:': items.append(b.line(t, 74, color=BLUE))
                    elif k == 'T:': items.append(turn(b, t or 'Your turn!'))
                    else: items.append(b.line(t, 74))
                cs.append((say, items))
            if b.y > 1060:
                raise ValueError(f'{name} scene {i + 1} is too tall ({b.y:.0f})')
            import re
            out.append((f'{i + 1}-' + re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:20], cs))
        return out
    LESSONS[name] = build_
