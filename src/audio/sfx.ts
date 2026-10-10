import { audio, env, noise, reverb } from './engine'

/** Original "suit-up" power-on: servos and clunks, a charging whine, then the online hit. ~4.5s. */
export function suitUp(): number {
  const { c, master } = audio()
  const t = c.currentTime + 0.05
  const rv = reverb(c, 2.5)
  const rg = c.createGain()
  rg.gain.value = 0.4
  rv.connect(rg)
  rg.connect(master)

  const servo = (t0: number, f0: number, f1: number, d: number) => {
    const o = c.createOscillator()
    const bp = c.createBiquadFilter()
    const g = c.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f0, t0)
    o.frequency.exponentialRampToValueAtTime(f1, t0 + d)
    bp.type = 'bandpass'
    bp.Q.value = 6
    bp.frequency.setValueAtTime(f0 * 4, t0)
    bp.frequency.exponentialRampToValueAtTime(f1 * 5, t0 + d)
    env(g, t0, 0.04, 0.14, d - 0.1, 0.08)
    o.connect(bp).connect(g)
    g.connect(master)
    g.connect(rv)
    o.start(t0)
    o.stop(t0 + d + 0.2)
  }
  const clunk = (t0: number, v: number) => {
    const n = noise(c, 0.12)
    const lp = c.createBiquadFilter()
    const g = c.createGain()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    env(g, t0, 0.002, v, 0.01, 0.09)
    n.connect(lp).connect(g)
    g.connect(master)
    g.connect(rv)
    n.start(t0)
    const o = c.createOscillator()
    const og = c.createGain()
    o.frequency.setValueAtTime(140, t0)
    o.frequency.exponentialRampToValueAtTime(55, t0 + 0.1)
    env(og, t0, 0.002, v * 0.9, 0, 0.14)
    o.connect(og).connect(master)
    o.start(t0)
    o.stop(t0 + 0.2)
  }

  servo(t, 70, 210, 0.45)
  clunk(t + 0.47, 0.55)
  servo(t + 0.55, 110, 330, 0.4)
  clunk(t + 0.97, 0.5)
  servo(t + 1.05, 160, 480, 0.25)
  clunk(t + 1.32, 0.6)

  const w = c.createOscillator()
  const wg = c.createGain()
  const tr = c.createOscillator()
  const tg = c.createGain()
  w.frequency.setValueAtTime(320, t + 1.35)
  w.frequency.exponentialRampToValueAtTime(2800, t + 2.4)
  wg.gain.setValueAtTime(0, t + 1.35)
  wg.gain.linearRampToValueAtTime(0.07, t + 2.35)
  wg.gain.linearRampToValueAtTime(0, t + 2.45)
  tr.frequency.value = 22
  tg.gain.value = 0.03
  tr.connect(tg).connect(wg.gain)
  w.connect(wg)
  wg.connect(master)
  wg.connect(rv)
  w.start(t + 1.35)
  w.stop(t + 2.5)
  tr.start(t + 1.35)
  tr.stop(t + 2.5)

  const T = t + 2.45
  const k = c.createOscillator()
  const kg = c.createGain()
  k.frequency.setValueAtTime(150, T)
  k.frequency.exponentialRampToValueAtTime(36, T + 0.45)
  env(kg, T, 0.003, 0.7, 0, 0.7)
  k.connect(kg).connect(master)
  k.start(T)
  k.stop(T + 0.9)

  const nb = noise(c, 0.4)
  const hp = c.createBiquadFilter()
  const ng = c.createGain()
  hp.type = 'highpass'
  hp.frequency.value = 2500
  env(ng, T, 0.002, 0.12, 0, 0.35)
  nb.connect(hp).connect(ng)
  ng.connect(master)
  ng.connect(rv)
  nb.start(T)

  ;[523.25, 1307, 2213, 3301, 4410].forEach((f, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.value = f
    env(g, T, 0.003, (0.07 / (i + 1)) * 2, 0, 1.6 - i * 0.2)
    o.connect(g)
    g.connect(master)
    g.connect(rv)
    o.start(T)
    o.stop(T + 2)
  })

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 5
  lp.frequency.setValueAtTime(400, T)
  lp.frequency.exponentialRampToValueAtTime(4000, T + 0.35)
  lp.frequency.exponentialRampToValueAtTime(1000, T + 2.5)
  const pg = c.createGain()
  env(pg, T, 0.02, 0.13, 0.5, 2.2)
  lp.connect(pg)
  pg.connect(master)
  pg.connect(rv)
  ;[73.42, 110, 146.83, 220, 277.18, 329.63].forEach((f) =>
    [-7, 7].forEach((d) => {
      const o = c.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.detune.value = d
      o.connect(lp)
      o.start(T)
      o.stop(T + 3.3)
    }),
  )
  return 4.3
}

/** Short bright blip for taps (only when sound is on). */
export function blip(freq = 1760) {
  const { c, master } = audio()
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.frequency.value = freq
  env(g, t, 0.003, 0.06, 0.02, 0.08)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.15)
}
