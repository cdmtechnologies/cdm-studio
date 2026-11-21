"""Builds whiteboard scene files from a lesson script.

A script is a list of scenes; each scene is a list of cues (one narration sentence or two) with the drawings
that appear while it is spoken. Cue timing comes from:
  - an estimate (2.6 words a second) when there is no recording yet, or
  - timings.json, measured from the presenter's recording (one start time per cue).
"""
import json, math, os, random, sys

WPS = 2.6           # speaking speed for estimates (about 156 words a minute)
PAD = 0.7           # breathing space after each cue

INK = '#1f2937'
BLUE = '#1d4ed8'
RED = '#dc2626'
GREEN = '#15803d'
ORANGE = '#c2410c'

rnd = random.Random(7)


def j(v):
    return round(v + rnd.uniform(-1.6, 1.6), 1)


def text(t, x, y, size=64, font='EMSReadability', color=INK, width=6, align='left', **kw):
    return {'type': 'text', 'text': t, 'x': x, 'y': y, 'size': size, 'font': font, 'color': color, 'width': width, 'align': align, **kw}


def path(d, color=INK, width=6, **kw):
    return {'type': 'path', 'd': d, 'color': color, 'width': width, **kw}


def box(x, y, w, h, color=INK, width=6, **kw):
    # a slightly hand-drawn rectangle, drawn as one stroke
    d = f'M {j(x)} {j(y)} L {j(x + w)} {j(y)} L {j(x + w)} {j(y + h)} L {j(x)} {j(y + h)} L {j(x)} {j(y) + 3}'
    return path(d, color, width, **kw)


def line(x1, y1, x2, y2, color=INK, width=6, **kw):
    return path(f'M {x1} {y1} L {x2} {y2}', color, width, **kw)


def arrow(x1, y1, x2, y2, color=INK, width=6, bend=0, head=26, **kw):
    # bend > 0 curves the arrow; the head is drawn as part of the same stroke
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    nx, ny = -(y2 - y1), x2 - x1
    L = math.hypot(nx, ny) or 1
    cx, cy = mx + nx / L * bend, my + ny / L * bend
    # direction at the end of the curve
    dx, dy = x2 - cx, y2 - cy
    a = math.atan2(dy, dx)
    h1 = (x2 - head * math.cos(a - 0.45), y2 - head * math.sin(a - 0.45))
    h2 = (x2 - head * math.cos(a + 0.45), y2 - head * math.sin(a + 0.45))
    d = f'M {x1} {y1} Q {cx:.1f} {cy:.1f} {x2} {y2} M {h1[0]:.1f} {h1[1]:.1f} L {x2} {y2} L {h2[0]:.1f} {h2[1]:.1f}'
    return path(d, color, width, **kw)


def tick(x, y, s=40, color=GREEN, width=8, **kw):
    return path(f'M {x} {y} L {x + s * 0.4} {y + s * 0.45} L {x + s} {y - s * 0.6}', color, width, **kw)


def cross(x, y, s=40, color=RED, width=8, **kw):
    return path(f'M {x} {y} L {x + s} {y + s} M {x + s} {y} L {x} {y + s}', color, width, **kw)


def underline(x, y, w, color=ORANGE, width=6, **kw):
    return path(f'M {x} {y} Q {x + w / 2} {y + 10} {x + w} {y - 2}', color, width, **kw)


def circle(cx, cy, r, color=ORANGE, width=6, **kw):
    pts = []
    for i in range(0, 380, 20):
        a = math.radians(i - 100)
        rr = r * (1 + rnd.uniform(-0.03, 0.03))
        pts.append(f'{cx + rr * math.cos(a):.1f} {cy + rr * 0.8 * math.sin(a):.1f}')
    return path('M ' + ' L '.join(pts), color, width, **kw)


def flat(items):
    out = []
    for i in items:
        out.extend(flat(i) if isinstance(i, (list, tuple)) else [i])
    return out


def words(s):
    return len(s.split())


def build(lesson, scenes, timings=None):
    """scenes: list of (scene_name, [(say, [items...]), ...]). Returns scene dicts with absolute cue times."""
    out = []
    k = 0
    for name, cues in scenes:
        t = 0.4
        cs = []
        for say, items in cues:
            cs.append({'at': round(t, 2), 'say': say, 'items': flat(items)})
            # timings: seconds of speech for each cue (from the AI voice or a recording)
            dur = (timings[k] + PAD) if timings else words(say) / WPS + PAD
            t += dur
            k += 1
        out.append({'name': f'{lesson}-{name}', 'captions': not timings, 'speed': 1000, 'duration': round(t + 0.6, 2), 'cues': cs})
    return out


if __name__ == '__main__':
    mod = __import__(sys.argv[1])
    timings = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
    for sc in build(mod.LESSON, mod.SCENES, timings):
        os.makedirs('scenes', exist_ok=True)
        json.dump(sc, open(f"scenes/{sc['name']}.json", 'w'), indent=1)
        print(sc['name'], sc['duration'])


# ---------- automatic layout: write a board from top to bottom without placing every item by hand ----------
import xml.etree.ElementTree as _ET
_ADV = {}


def _font(name):
    if name not in _ADV:
        root = _ET.parse(os.path.join(os.path.dirname(os.path.abspath(__file__)), name + '.svg')).getroot()
        ns = '{http://www.w3.org/2000/svg}'
        f = root.find(f'.//{ns}font')
        d = int(f.get('horiz-adv-x'))
        _ADV[name] = (d, {g.get('unicode'): float(g.get('horiz-adv-x', d)) for g in root.iter(f'{ns}glyph') if g.get('unicode')})
    return _ADV[name]


def width(t, font, size):
    d, g = _font(font)
    return sum(g.get(ch, d) for ch in t) * size / 1000


class Board:
    """Writes lines down the board, shrinking any line that would not fit."""
    MAXW = 1720

    def __init__(self, top=150):
        self.y = top

    def _fit(self, t, font, size):
        w = width(t, font, size)
        return size * self.MAXW / w if w > self.MAXW else size

    def title(self, t, size=104):
        s = self._fit(t, 'EMSFelix', size)
        w = width(t, 'EMSFelix', s)
        out = [text(t, 960, self.y, s, 'EMSFelix', align='center', width=8), underline(960 - w / 2 - 20, self.y + 26, w + 40)]
        self.y += s + 70
        return out

    def line(self, t, size=66, font='EMSReadability', color=INK, x=None, gap=None, **kw):
        s = self._fit(t, font, size)
        it = text(t, 960 if x is None else x, self.y, s, font, color=color, align='center' if x is None else 'left', width=7 if s > 80 else 6, **kw)
        self.y += gap if gap is not None else s * 1.45
        return it

    def code(self, t, size=72, color=BLUE, **kw):
        return self.line(t, size, 'EMSNixish', color, **kw)

    def note(self, t, size=60, color=ORANGE, **kw):
        return self.line(t, size, 'EMSFelix', color, **kw)

    def down(self, x=960, h=90):
        a = arrow(x, self.y - 55, x, self.y + h - 75, INK, 6, head=24)
        self.y += h + 10
        return a

    def pair(self, left, right, size=66, lfont='EMSNixish', rfont='EMSFelix', lx=360, rx=1000, lcolor=BLUE, rcolor=INK):
        lw = width(left, lfont, size)
        a0 = max(rx - 190, lx + lw + 30)
        rx = max(rx, a0 + 150)
        out = [text(left, lx, self.y, size, lfont, color=lcolor), arrow(a0, self.y - size * 0.3, rx - 40, self.y - size * 0.3, INK, 5, head=20), text(right, rx, self.y, size, rfont, color=rcolor)]
        self.y += size * 1.5
        return out

    def space(self, h=40):
        self.y += h
        return []


def around(it, color=ORANGE, width=5):
    """A hand-drawn loop around a text item (from Board.line, Board.code or text)."""
    w = width_of(it)
    x0 = it['x'] - (w / 2 if it.get('align') == 'center' else 0)
    cx, cy = x0 + w / 2, it['y'] - it['size'] * 0.33
    rx, ry = w / 2 + 40, it['size'] * 0.75
    pts = []
    for i in range(0, 380, 15):
        a = math.radians(i - 100)
        k = 1 + rnd.uniform(-0.025, 0.025)
        pts.append(f'{cx + rx * k * math.cos(a):.1f} {cy + ry * k * math.sin(a):.1f}')
    return path('M ' + ' L '.join(pts), color, width)


def width_of(it):
    return width(it['text'], it.get('font', 'EMSReadability'), it['size'])
