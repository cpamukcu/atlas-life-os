import { useEffect, useRef } from 'react'

/** Drifting light particles. Fewer on phones, paused when hidden, off in calm mode. */
export function Background({ off }: { off: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c || off || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const x = c.getContext('2d')
    if (!x) return
    let raf = 0
    let pts: { x: number; y: number; v: number; r: number; red: boolean }[] = []
    const size = () => {
      c.width = innerWidth
      c.height = innerHeight
      const n = innerWidth < 600 ? 22 : 55
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        v: 0.15 + Math.random() * 0.35,
        r: Math.random() * 1.4 + 0.3,
        red: Math.random() < 0.35,
      }))
    }
    const draw = () => {
      x.clearRect(0, 0, c.width, c.height)
      for (const p of pts) {
        p.y -= p.v
        if (p.y < 0) p.y = c.height
        x.fillStyle = p.red ? 'rgba(224,40,58,.55)' : 'rgba(0,229,255,.5)'
        x.beginPath()
        x.arc(p.x, p.y, p.r, 0, 7)
        x.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    const vis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) draw()
    }
    size()
    draw()
    addEventListener('resize', size)
    document.addEventListener('visibilitychange', vis)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
      document.removeEventListener('visibilitychange', vis)
      x.clearRect(0, 0, c.width, c.height)
    }
  }, [off])

  return <canvas id="bgfx" ref={ref} aria-hidden="true" />
}
