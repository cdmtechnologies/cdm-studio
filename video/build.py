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
            cs.append({'at': round(t, 2), 'say': say, 'items': items})
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
