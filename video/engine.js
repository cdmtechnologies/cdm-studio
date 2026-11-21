// Whiteboard engine: draws single-stroke text and shapes progressively, with a hand holding a marker at the pen tip.
// Runs inside a page; render.mjs calls window.WB.load(scene, fonts) once and window.WB.frame(t) for every frame.
(() => {
  const NS = 'http://www.w3.org/2000/svg'
  const W = 1920, H = 1080
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag)
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
    if (parent) parent.appendChild(e)
    return e
  }
  const fonts = {}
  function parseFont(name, svgText) {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
    const f = doc.querySelector('font')
    const face = doc.querySelector('font-face')
    const glyphs = {}
    for (const g of doc.querySelectorAll('glyph')) {
      const u = g.getAttribute('unicode')
      if (u == null) continue
      glyphs[u] = { d: g.getAttribute('d') || '', adv: Number(g.getAttribute('horiz-adv-x') || f.getAttribute('horiz-adv-x')) }
    }
    fonts[name] = { glyphs, upm: Number(face.getAttribute('units-per-em') || 1000), adv: Number(f.getAttribute('horiz-adv-x')) }
  }

  let svg, layer, handG, capEl, items = [], scene, home
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

  function textWidth(t, font, size) {
    const F = fonts[font], s = size / F.upm
    let w = 0
    for (const ch of t) w += ((F.glyphs[ch] || {}).adv ?? F.adv) * s
    return w
  }

  // build one drawable item: a list of strokes, each { node, len, ctm }
  function buildItem(it) {
    const g = el('g', {}, layer)
    const strokes = []
    const stroke = it.color || '#1f2937'
    const width = it.width || 6
    const add = (d, transform) => {
      for (const sub of d.split(/(?=M)/).map((x) => x.trim()).filter(Boolean)) {
        const p = el('path', { d: sub, fill: 'none', stroke, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, g)
        if (transform) p.setAttribute('transform', transform)
        strokes.push({ node: p })
      }
    }
    if (it.type === 'text') {
      const F = fonts[it.font || 'EMSReadability'], s = it.size / F.upm
      let x = it.x
      if (it.align === 'center') x -= textWidth(it.text, it.font || 'EMSReadability', it.size) / 2
      for (const ch of it.text) {
        const gl = F.glyphs[ch]
        if (gl && gl.d) add(gl.d, `translate(${x} ${it.y}) scale(${s} ${-s})`)
        x += (gl ? gl.adv : F.adv) * s
      }
    } else if (it.type === 'path') add(it.d)
    else if (it.type === 'fill') {
      // a solid shape that fades in (highlights, sticky notes)
      const p = el('path', { d: it.d, fill: it.fill, opacity: 0 }, g)
      return { ...it, g, strokes: [], fillNode: p, len: 0 }
    }
    let len = 0
    for (const s of strokes) {
      const m = s.node.getCTM()
      const l0 = s.node.getTotalLength()
      // length on screen: scale the local length by the transform's scale
      const sc = Math.hypot(m.a, m.b)
      s.local = l0; s.len = l0 * sc; s.m = m
      s.node.setAttribute('stroke-dasharray', `${l0 + 1} ${l0 + 1}`)
      s.node.setAttribute('stroke-dashoffset', l0 + 1)
      len += s.len
    }
    return { ...it, g, strokes, len }
  }

  function pointOf(s, localLen) {
    const p = s.node.getPointAtLength(localLen)
    return { x: s.m.a * p.x + s.m.c * p.y + s.m.e, y: s.m.b * p.x + s.m.d * p.y + s.m.f }
  }

  function load(sc, fontTexts) {
    for (const [n, t] of Object.entries(fontTexts)) parseFont(n, t)
    scene = sc
    document.body.innerHTML = ''
    document.body.style.margin = 0
    svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` })
    document.body.appendChild(svg)
    const defs = el('defs', {}, svg)
    const grad = el('radialGradient', { id: 'board', cx: '50%', cy: '45%', r: '75%' }, defs)
    el('stop', { offset: '0%', 'stop-color': '#ffffff' }, grad)
    el('stop', { offset: '100%', 'stop-color': '#eceff1' }, grad)
    const sh = el('filter', { id: 'shadow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs)
    el('feDropShadow', { dx: 10, dy: 16, stdDeviation: 12, 'flood-color': '#000', 'flood-opacity': 0.18 }, sh)
    el('rect', { width: W, height: H, fill: 'url(#board)' }, svg)
    layer = el('g', {}, svg)
    items = []
    // sequence: items of a cue are drawn one after another from the cue's start
    sc.cues.forEach((cue, ci) => {
      const built = cue.items.map((it) => buildItem(it))
      const base = built.map((b, i) => (cue.items[i].dur ?? (b.type === 'fill' ? 0.4 : Math.max(0.25, b.len / (cue.items[i].speed || sc.speed || 900)))) + (cue.items[i].gap ?? 0.22))
      const next = sc.cues[ci + 1]
      const startAt = cue.at + (cue.delay ?? 0.3)
      const window = (next ? next.at - 0.35 : (sc.duration ?? 1e9) - 0.6) - startAt
      const total = base.reduce((a, b) => a + b, 0)
      const k = total > window && window > 0 ? window / total : 1
      let t = startAt
      built.forEach((b, i) => {
        const it = cue.items[i]
        if (it.at != null) t = cue.at + it.at
        b.start = t
        b.dur = (base[i] - (it.gap ?? 0.22)) * k
        t = b.start + b.dur + (it.gap ?? 0.22) * k
        items.push(b)
      })
    })
    home = { x: W + 120, y: H + 160 }
    handG = el('g', { filter: 'url(#shadow)' }, svg)
    drawHand(handG)
    if (sc.captions) {
      el('rect', { x: 0, y: H - 118, width: W, height: 118, fill: 'rgba(15,23,42,.82)' }, svg)
      capEl = el('text', { x: W / 2, y: H - 46, 'text-anchor': 'middle', 'font-family': 'Inter, sans-serif', 'font-size': 36, 'font-weight': 500, fill: '#fff' }, svg)
    }
    return items.reduce((m, i) => Math.max(m, i.start + i.dur), 0)
  }

  // An original flat illustration: a right hand holding a marker, seen from the back, with the marker tip at (0, 0).
  // Drawn with the marker pointing down the +y axis, then tilted so the arm comes in from the bottom right.
  function drawHand(g) {
    const skin = '#a0663f', skinDark = '#7f4b2c', skinLight = '#b97b51', nail = '#e8c4a8'
    const sleeve = '#1d4ed8', sleeveDark = '#1e3a8a'
    const mc = scene?.markerColor || '#1f2937'
    const cap = (x1, y1, x2, y2, w, fill, parent) => {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI
      return el('rect', { x: 0, y: -w / 2, width: L, height: w, rx: w / 2, fill, transform: `translate(${x1} ${y1}) rotate(${a})` }, parent)
    }
    const h = el('g', { transform: 'rotate(-38) scale(0.85)' }, g)
    // marker
    el('path', { d: 'M -6 4 L 6 4 L 12 44 L -12 44 Z', fill: mc }, h)
    el('rect', { x: -17, y: 40, width: 34, height: 320, rx: 9, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 3 }, h)
    el('rect', { x: -18, y: 250, width: 36, height: 40, rx: 6, fill: mc }, h)
    // thumb on the right of the marker
    cap(18, 96, 70, 205, 46, skinDark, h)
    // back of the hand and the folded fingers
    el('ellipse', { cx: 10, cy: 265, rx: 108, ry: 120, fill: skin }, h)
    cap(-44, 150, -96, 250, 50, skin, h) // ring finger, folded
    cap(-74, 200, -108, 280, 44, skinLight, h) // little finger, folded
    // index and middle fingers along the marker
    cap(-26, 120, -60, 240, 50, skinLight, h)
    cap(-6, 62, -36, 200, 48, skin, h)
    el('ellipse', { cx: -8, cy: 72, rx: 10, ry: 14, fill: nail, opacity: 0.45, transform: 'rotate(-12 -8 72)' }, h)
    // knuckles
    for (const [x, y] of [[-30, 205], [-62, 238], [-88, 262]]) el('path', { d: `M ${x - 10} ${y + 6} q 10 -10 20 0`, fill: 'none', stroke: skinDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.55 }, h)
    // wrist and sleeve
    el('path', { d: 'M -78 330 L 92 320 L 104 520 L -76 532 Z', fill: skin }, h)
    el('path', { d: 'M -110 470 L 130 452 L 170 1100 L -150 1120 Z', fill: sleeve }, h)
    el('path', { d: 'M -110 470 L 130 452 L 134 500 L -108 518 Z', fill: sleeveDark }, h)
  }

  let last = null
  function frame(t) {
    let active = null, done = null
    for (const it of items) {
      const p = it.dur ? Math.min(1, Math.max(0, (t - it.start) / it.dur)) : t >= it.start ? 1 : 0
      if (it.fillNode) { it.fillNode.setAttribute('opacity', p * (it.opacity ?? 1)); continue }
      let rem = p * it.len
      let tip = null
      for (const s of it.strokes) {
        const drawn = Math.min(s.len, Math.max(0, rem))
        const local = (drawn / s.len) * s.local
        s.node.setAttribute('stroke-dashoffset', s.local + 1 - local)
        if (rem > 0 && rem <= s.len) tip = pointOf(s, local)
        rem -= s.len
      }
      if (p > 0 && p < 1 && it.strokes.length) active = tip || pointOf(it.strokes[it.strokes.length - 1], it.strokes[it.strokes.length - 1].local)
      if (p >= 1 && it.strokes.length) done = { it, pt: pointOf(it.strokes[it.strokes.length - 1], it.strokes[it.strokes.length - 1].local) }
    }
    let pos
    if (active) pos = active
    else {
      // between items: glide to the next start if it is soon, else rest off the board
      const next = items.find((i) => i.start > t && i.strokes.length)
      const from = done ? done.pt : home
      if (next && next.start - t < 0.9) {
        const to = pointOf(next.strokes[0], 0)
        const prevEnd = done ? done.it.start + done.it.dur : next.start - 0.9
        const span = Math.max(0.05, next.start - prevEnd)
        const k = ease(Math.min(1, Math.max(0, (t - prevEnd) / span)))
        pos = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }
      } else {
        const prevEnd = done ? done.it.start + done.it.dur : 0
        const k = ease(Math.min(1, Math.max(0, (t - prevEnd) / 0.8)))
        pos = { x: from.x + (home.x - from.x) * k, y: from.y + (home.y - from.y) * k }
      }
    }
    // a small natural wobble
    const wob = active ? Math.sin(t * 23) * 1.2 : 0
    handG.setAttribute('transform', `translate(${pos.x + wob} ${pos.y + wob})`)
    if (capEl) {
      const c = [...scene.cues].reverse().find((c) => t >= c.at)
      const txt = c ? c.say : ''
      if (capEl.dataset.txt !== txt) {
        capEl.dataset.txt = txt
        capEl.textContent = ''
        const words = txt.split(' '), lines = ['']
        for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).length > 72) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim() }
        lines.forEach((ln, i) => el('tspan', { x: W / 2, dy: i === 0 ? (lines.length > 1 ? -42 : 0) : 46 }, capEl).textContent = ln)
      }
    }
    // fade the board out at the end of the scene
    if (scene.duration && scene.fade !== false) layer.setAttribute('opacity', Math.min(1, Math.max(0, (scene.duration - t) / 0.4)))
    last = pos
  }
  window.WB = { load, frame, textWidth: (t, f, s) => textWidth(t, f, s) }
})()
