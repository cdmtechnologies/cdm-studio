// A tiny .zip writer (files stored without compression), for downloading a project with everything it needs.
const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })()
export function crc32(d: Uint8Array): number { let c = 0xffffffff; for (let i = 0; i < d.length; i++) c = TABLE[(c ^ d[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }

export function zip(files: Record<string, Uint8Array | string>): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const [rawName, raw] of Object.entries(files)) {
    const name = enc.encode(rawName.replace(/^\/+/, ''))
    const data = typeof raw === 'string' ? enc.encode(raw) : raw
    const crc = crc32(data)
    const local = new Uint8Array(30 + name.length)
    const v = new DataView(local.buffer)
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true)
    v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true)
    local.set(name, 30)
    const cen = new Uint8Array(46 + name.length)
    const w = new DataView(cen.buffer)
    w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true)
    w.setUint32(16, crc, true); w.setUint32(20, data.length, true); w.setUint32(24, data.length, true); w.setUint16(28, name.length, true); w.setUint32(42, offset, true)
    cen.set(name, 46)
    parts.push(local, data); central.push(cen)
    offset += local.length + data.length
  }
  const size = central.reduce((n, c) => n + c.length, 0)
  const end = new Uint8Array(22)
  const e = new DataView(end.buffer)
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, central.length, true); e.setUint16(10, central.length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true)
  const out = new Uint8Array(offset + size + 22)
  let p = 0
  for (const x of [...parts, ...central, end]) { out.set(x, p); p += x.length }
  return out
}

/** A square app icon drawn on a canvas: the project's emoji or first letter on a colour. */
export async function drawIcon(size: number, label: string, colour: string): Promise<string> {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = colour
  g.fillRect(0, 0, size, size)
  g.fillStyle = '#ffffff'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.font = `bold ${Math.round(size * 0.5)}px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
  g.fillText(label, size / 2, size / 2 + size * 0.03)
  return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}
