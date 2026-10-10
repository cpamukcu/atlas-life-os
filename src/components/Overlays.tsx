import { useEffect, useRef, useState } from 'react'
import { level } from '../audio/engine'

import { SECURED } from '../lib/events'

/** "DAY SECURED" flash when the day turns into a won day. */
export function Secured() {
  const [k, setK] = useState(0)
  useEffect(() => {
    const on = () => setK((v) => v + 1)
    window.addEventListener(SECURED, on)
    return () => window.removeEventListener(SECURED, on)
  }, [])
  if (!k) return null
  return (
    <div className="secured" key={k} aria-live="polite">
      <span>DAY SECURED</span>
    </div>
  )
}

/** Boot sequence, at most once per day, skippable. With sound on it waits for a tap (iOS needs one to play audio). */
export function Boot({
  name,
  plates,
  sound,
  onDone,
}: {
  name: string
  plates: string
  sound: boolean
  onDone: (engaged: boolean) => void
}) {
  const lines = ['> SYNCING ACADEMIC SYSTEMS... OK', `> PLATES LOADED ........ ${plates}`, `> WELCOME BACK, ${name.toUpperCase()}.`]
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const finished = useRef(false)

  const finish = (engaged: boolean) => {
    if (finished.current) return
    finished.current = true
    setDone(true)
    onDone(engaged)
  }

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(lines.length)
      if (!sound) finish(false)
      return
    }
    const ts = lines.map((_, i) => setTimeout(() => setShown(i + 1), 150 + i * 380))
    if (!sound) ts.push(setTimeout(() => finish(false), 1450))
    return () => ts.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`boot ${done ? 'done' : ''}`} onClick={() => finish(sound)} role="button" aria-label="Skip boot">
      {lines.slice(0, shown).map((l) => (
        <div key={l}>{l}</div>
      ))}
      {sound && shown === lines.length && <div className="engage">TAP TO ENGAGE</div>}
      <div className="skip">{sound ? 'tap anywhere' : 'tap to skip'}</div>
    </div>
  )
}

/** Speech-reactive rings shown while ATLAS talks. */
export function VoiceRing({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active) return
    const c = ref.current
    const x = c?.getContext('2d')
    if (!c || !x) return
    const W = 520
    const M = W / 2
    let raf = 0
    let e = 0
    let time = 0
    let last = 0
    const ring = (r: number, amp: number, k: number, alpha: number, w: number, color: string) => {
      x.beginPath()
      for (let i = 0; i <= 200; i++) {
        const a = (i / 200) * Math.PI * 2
        const d = Math.sin(a * 5 + time * 2.6 + k) * 0.5 + Math.sin(a * 9 - time * 4.1 + k * 2) * 0.3 + Math.sin(a * 14 + time * 6 + k * 3) * 0.2
        const rr = r + d * amp + Math.sin(time * 1.2 + k) * 2
        const px = M + rr * Math.cos(a)
        const py = M + rr * Math.sin(a)
        if (i) x.lineTo(px, py)
        else x.moveTo(px, py)
      }
      x.closePath()
      x.strokeStyle = color.replace('A', String(alpha))
      x.lineWidth = w
      x.stroke()
    }
    const frame = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0)
      last = ts
      e += (level.value - e) * 0.3
      time += dt * (1 + e * 1.5)
      x.clearRect(0, 0, W, W)
      const g = x.createRadialGradient(M, M, 10, M, M, 200)
      g.addColorStop(0, `rgba(0,229,255,${0.1 + e * 0.2})`)
      g.addColorStop(0.6, `rgba(224,40,58,${0.04 + e * 0.08})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      x.fillStyle = g
      x.fillRect(0, 0, W, W)
      x.shadowColor = '#00E5FF'
      x.shadowBlur = 14 + e * 24
      ring(180, 6 + e * 34, 0, 0.85, 3, 'rgba(0,229,255,A)')
      ring(162, 4 + e * 24, 1.7, 0.55, 2, 'rgba(0,229,255,A)')
      x.shadowColor = '#E0283A'
      ring(198, 3 + e * 18, 3.1, 0.6, 1.5, 'rgba(224,40,58,A)')
      x.shadowBlur = 6
      ring(110, 2 + e * 10, 4.2, 0.35, 1.5, 'rgba(255,201,74,A)')
      x.shadowBlur = 0
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
  if (!active) return null
  return <canvas ref={ref} className="voice-ring" width={520} height={520} aria-hidden="true" />
}
