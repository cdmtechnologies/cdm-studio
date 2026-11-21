#!/usr/bin/env bash
# Makes one lesson video with AI narration: ./make.sh <script module> <voice>
# Voices (Kokoro): af_heart, af_bella (American female), am_michael, am_fenrir (American male), bf_emma (British female), bm_george (British male)
set -euo pipefail
cd "$(dirname "$0")"
mod=$1; voice=${2:-af_heart}
rm -rf out scenes; mkdir -p out
python voice.py "$mod" "$voice"
python build.py "$mod" durations.json
python voice.py "$mod" --mix
: > out/list.txt
for s in scenes/*.json; do
  name=$(basename "$s" .json)
  node render.mjs "$s" "out/$name.silent.mp4"
  ffmpeg -y -loglevel error -i "out/$name.silent.mp4" -i "out/$name.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest "out/$name.mp4"
  echo "file '$name.mp4'" >> out/list.txt
done
lesson=$(python -c "import sys; sys.path.insert(0, '.'); print(__import__('$mod').LESSON)")
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy "out/$lesson-$voice.mp4"
ls -la out/*.mp4 out/*.srt
