import type { Track } from './types'

export const games: Track = {
  id: 'games',
  title: 'Make games',
  blurb: 'Draw, animate and control things on a canvas, then put it together into a real game.',
  colour: 'amber',
  emoji: '🎮',
  lessons: [
    {
      id: 'game-canvas',
      title: 'Drawing on a canvas',
      minutes: 10,
      kind: 'code',
      body: `## The canvas is a drawing board

\`\`\`html
<canvas id="c" width="320" height="200"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d')
  ctx.fillStyle = 'orange'
  ctx.fillRect(20, 20, 80, 50)          // x, y, width, height
  ctx.beginPath()
  ctx.arc(200, 100, 30, 0, Math.PI * 2) // a circle: x, y, radius
  ctx.fill()
</script>
\`\`\`

x goes right, y goes **down** from the top-left corner.`,
      task: 'Draw a green rectangle and a circle of any colour on the canvas.',
      starter: `<canvas id="c" width="320" height="200" style="background:#0f172a"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d')
  // draw here
</script>
`,
      checks: [
        { label: 'Something is drawn', test: `const d = document.getElementById('c').getContext('2d').getImageData(0, 0, 320, 200).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false` },
        { label: 'There is green on the canvas', test: `const d = document.getElementById('c').getContext('2d').getImageData(0, 0, 320, 200).data; for (let i = 0; i < d.length; i += 4) if (d[i+1] > 100 && d[i+1] > d[i] + 40 && d[i+1] > d[i+2] + 40) return true; return false` },
        { label: 'You used arc() for a circle', test: `return [...document.querySelectorAll('script')].some((s) => /\\.arc\\s*\\(/.test(s.textContent))` },
      ],
    },
    {
      id: 'game-loop',
      title: 'Animation: the game loop',
      minutes: 12,
      kind: 'code',
      body: `## Draw, move, repeat

Games redraw the screen about 60 times a second:

\`\`\`js
let x = 0
function frame() {
  ctx.clearRect(0, 0, 320, 200)   // wipe
  ctx.fillRect(x, 80, 30, 30)     // draw
  x = x + 2                       // move
  if (x > 320) x = -30            // wrap around
  requestAnimationFrame(frame)    // again next frame
}
frame()
\`\`\``,
      task: 'Make the ball move to the right and come back from the left side when it leaves the canvas. Keep its position in the variable x.',
      starter: `<canvas id="c" width="320" height="200" style="background:#0f172a"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d')
  let x = 20
  function frame() {
    ctx.clearRect(0, 0, 320, 200)
    ctx.fillStyle = 'gold'
    ctx.beginPath(); ctx.arc(x, 100, 15, 0, Math.PI * 2); ctx.fill()
    // move x, wrap it, and ask for the next frame
  }
  frame()
</script>
`,
      checks: [
        { label: 'x changes over time', test: `const a = x; await new Promise(r => setTimeout(r, 300)); return x !== a` },
        { label: 'x wraps around (stays between -50 and 370)', test: `for (let i = 0; i < 30; i++) { await new Promise(r => setTimeout(r, 100)); if (x > 370 || x < -50) return false } return true` },
      ],
      hint: 'x += 3; if (x > 335) x = -15; requestAnimationFrame(frame)',
    },
    {
      id: 'game-keys',
      title: 'Keyboard and touch controls',
      minutes: 12,
      kind: 'code',
      body: `## Listen for keys

\`\`\`js
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') player.x -= 20
  if (e.key === 'ArrowRight') player.x += 20
})
\`\`\`

On phones there are no arrow keys, so add buttons that do the same thing. Keep the player inside the canvas with \`Math.max\` and \`Math.min\`.`,
      task: 'Move player.x 20 left or right with the arrow keys, and never let it go below 0 or above 280.',
      starter: `<canvas id="c" width="320" height="200" style="background:#0f172a"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d')
  const player = { x: 140, y: 160 }
  function draw() { ctx.clearRect(0, 0, 320, 200); ctx.fillStyle = '#38bdf8'; ctx.fillRect(player.x, player.y, 40, 20); requestAnimationFrame(draw) }
  draw()
  // listen for ArrowLeft and ArrowRight here
</script>
`,
      checks: [
        { label: 'ArrowRight moves right by 20', test: `const a = player.x; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); return player.x === Math.min(280, a + 20)` },
        { label: 'ArrowLeft moves left by 20', test: `player.x = 140; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); return player.x === 120` },
        { label: 'It stays inside (0 to 280)', test: `for (let i = 0; i < 30; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); const r = player.x === 280; for (let i = 0; i < 30; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); return r && player.x === 0` },
      ],
    },
    {
      id: 'game-dodge',
      title: 'Your first game: Dodge!',
      minutes: 20,
      kind: 'code',
      body: `## Put it together

A game needs: things that move, a player, a **collision** check, and a score.

Two boxes touch when they overlap on both x and y:

\`\`\`js
function hit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y
}
\`\`\`

The game below is almost done: write \`hit\` and the game works. Use the arrow keys to dodge.`,
      task: 'Write hit(a, b) so it returns true when the two boxes overlap, false when they do not.',
      starter: `<canvas id="c" width="320" height="240" style="background:#0f172a;display:block;margin:auto"></canvas>
<p id="score" style="text-align:center;font-family:sans-serif">Score: 0</p>
<script>
  const ctx = document.getElementById('c').getContext('2d')
  const player = { x: 140, y: 210, w: 40, h: 16 }
  let rocks = [], score = 0, over = false

  function hit(a, b) {
    // return true when a and b overlap
    return false
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - 24)
    if (e.key === 'ArrowRight') player.x = Math.min(280, player.x + 24)
  })
  function frame() {
    if (over) return
    if (Math.random() < 0.04) rocks.push({ x: Math.random() * 300, y: -20, w: 20, h: 20 })
    ctx.clearRect(0, 0, 320, 240)
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(player.x, player.y, player.w, player.h)
    ctx.fillStyle = '#f97316'
    for (const r of rocks) { r.y += 3; ctx.fillRect(r.x, r.y, r.w, r.h); if (hit(player, r)) over = true }
    rocks = rocks.filter(r => r.y < 260)
    score++
    document.getElementById('score').textContent = over ? 'Game over! Score: ' + score : 'Score: ' + score
    requestAnimationFrame(frame)
  }
  frame()
</script>
`,
      checks: [
        { label: 'Overlapping boxes hit', test: `return hit({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }) === true` },
        { label: 'Boxes apart do not hit', test: `return hit({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 }) === false` },
        { label: 'Boxes above each other do not hit', test: `return hit({ x: 0, y: 0, w: 10, h: 10 }, { x: 0, y: 30, w: 10, h: 10 }) === false` },
      ],
      hint: 'return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y',
    },
  ],
}
