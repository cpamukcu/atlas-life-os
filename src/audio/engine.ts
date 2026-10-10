// Shared Web Audio graph: everything ends in `master`, and `level` exposes
// how loud ATLAS is right now so the voice ring can follow it.

let ctx: AudioContext | null = null
let master: GainNode
let analyser: AnalyserNode

export const level = { value: 0, speaking: false }

export function audio(): { c: AudioContext; master: GainNode; analyser: AnalyserNode } {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.8
    analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    master.connect(analyser)
    analyser.connect(ctx.destination)
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return
      if (document.hidden) void ctx.suspend()
      else void ctx.resume()
    })
    startMeter()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { c: ctx, master, analyser }
}

function startMeter() {
  const buf = new Uint8Array(1024)
  const tick = () => {
    analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (const v of buf) {
      const d = (v - 128) / 128
      sum += d * d
    }
    level.value = Math.min(1, Math.sqrt(sum / buf.length) * 5)
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function reverb(c: AudioContext, sec: number, decay = 2.5): ConvolverNode {
  const n = Math.floor(c.sampleRate * sec)
  const b = c.createBuffer(2, n, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay)
  }
  const v = c.createConvolver()
  v.buffer = b
  return v
}

export function noise(c: AudioContext, sec: number): AudioBufferSourceNode {
  const n = Math.floor(c.sampleRate * sec)
  const b = c.createBuffer(1, n, c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const s = c.createBufferSource()
  s.buffer = b
  return s
}

export function env(g: GainNode, t: number, a: number, peak: number, hold: number, r: number) {
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + a)
  g.gain.setValueAtTime(peak, t + a + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r)
}
