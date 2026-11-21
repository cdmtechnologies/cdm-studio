"""AI narration with Kokoro (open-source text-to-speech, Apache 2.0), run in GitHub Actions.

  python voice.py <script module> <voice>     -> out/voice/<n>.wav and durations.json (seconds of speech per cue)
  python voice.py <script module> --mix       -> out/<scene>.wav for every scene, plus out/<lesson>.srt
"""
import json, os, re, sys
import numpy as np
import soundfile as sf

SR = 24000
# words the voice should say differently from how they are written
SAY = {r'\bVAT\b': 'V.A.T.', r'\bf-strings\b': 'F strings', r'\bf-string\b': 'F string', r'\bint\b': 'int', r'\bSQL\b': 'sequel'}


def spoken(t):
    for a, b in SAY.items():
        t = re.sub(a, b, t)
    return t


def cues(mod):
    for _, cs in mod.SCENES:
        for say, _ in cs:
            yield say


def speak(mod, voice):
    from kokoro import KPipeline
    pipe = KPipeline(lang_code=voice[0])  # a = American English, b = British English
    os.makedirs('out/voice', exist_ok=True)
    durs = []
    for i, say in enumerate(cues(mod)):
        parts = [a for _, _, a in pipe(spoken(say), voice=voice, speed=0.95)]
        audio = np.concatenate([np.asarray(p, dtype=np.float32) for p in parts])
        sf.write(f'out/voice/{i}.wav', audio, SR)
        durs.append(round(len(audio) / SR, 3))
        print(i, durs[-1], say[:60])
    json.dump(durs, open('durations.json', 'w'))


def stamp(t):
    ms = int(round(t * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


def mix(mod):
    from build import build
    durs = json.load(open('durations.json'))
    k, offset, srt = 0, 0.0, []
    for sc in build(mod.LESSON, mod.SCENES, durs):
        track = np.zeros(int(sc['duration'] * SR) + 1, dtype=np.float32)
        for c in sc['cues']:
            a, _ = sf.read(f'out/voice/{k}.wav', dtype='float32')
            start = int((c['at'] + 0.1) * SR)
            track[start:start + len(a)] += a[: len(track) - start]
            srt.append((offset + c['at'] + 0.1, offset + c['at'] + 0.1 + durs[k], c['say']))
            k += 1
        sf.write(f"out/{sc['name']}.wav", track, SR)
        offset += sc['duration']
    with open(f'out/{mod.LESSON}.srt', 'w') as f:
        for i, (a, b, t) in enumerate(srt, 1):
            f.write(f'{i}\n{stamp(a)} --> {stamp(b)}\n{t}\n\n')


if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    mod = __import__(sys.argv[1])
    if sys.argv[2] == '--mix':
        mix(mod)
    else:
        speak(mod, sys.argv[2])
