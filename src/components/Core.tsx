import type { PlateDef } from '../config'

export interface TimelineEvent {
  start: number
  end: number
  color: string
}

const C = 150
function polar(r: number, h: number): [number, number] {
  const a = (h / 24) * 2 * Math.PI - Math.PI / 2
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
function arc(r: number, s: number, e: number) {
  const [x1, y1] = polar(r, s)
  const [x2, y2] = polar(r, e)
  return `M${x1} ${y1}A${r} ${r} 0 ${e - s > 12 ? 1 : 0} 1 ${x2} ${y2}`
}

/** Outer ring = today's 24h timeline with a "now" hand. Inner ring = barbell plates. */
export function Core({
  plates,
  loaded,
  events,
  hour,
}: {
  plates: PlateDef[]
  loaded: boolean[]
  events: TimelineEvent[]
  hour: number
}) {
  const n = plates.length
  const seg = 24 / Math.max(1, n)
  const count = loaded.filter(Boolean).length
  const ticks = Array.from({ length: 24 }, (_, h) => {
    const [a, b] = polar(134, h)
    const [c, d] = polar(h % 6 ? 129 : 124, h)
    return <line key={h} x1={a} y1={b} x2={c} y2={d} stroke={h % 6 ? '#3a2a30' : '#7a5a60'} strokeWidth={1} />
  })
  const labels = [0, 6, 12, 18].map((h) => {
    const [x, y] = polar(146, h)
    return (
      <text key={h} x={x} y={y + 3} fill="#7a6a70" fontFamily="JetBrains Mono" fontSize={9} textAnchor="middle">
        {String(h).padStart(2, '0')}
      </text>
    )
  })

  return (
    <div className="core mat" role="img" aria-label={`${count} of ${n} plates loaded`}>
      <svg viewBox="0 0 300 300">
        <g className="spinr">
          <circle cx={C} cy={C} r={149} fill="none" stroke="#FFC94A" strokeOpacity={0.75} strokeWidth={2} strokeDasharray="46 10 6 10" />
        </g>
        <g className="spin">
          <circle cx={C} cy={C} r={141} fill="none" stroke="rgba(224,40,58,.75)" strokeWidth={1} strokeDasharray="2 6" />
        </g>
        <g className="spin2">
          <circle cx={C} cy={C} r={97} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={7} strokeDasharray="1.5 4" />
        </g>
        <circle cx={C} cy={C} r={112} fill="none" stroke="#1a1014" strokeWidth={9} />
        {ticks}
        {labels}
        {events.map((e, i) => (
          <path key={i} d={arc(112, e.start, Math.max(e.end, e.start + 0.25))} stroke={e.color} strokeWidth={9} fill="none" style={{ filter: `drop-shadow(0 0 4px ${e.color})` }} />
        ))}
        <circle cx={C} cy={C} r={104} fill="none" stroke="#E0283A" strokeOpacity={0.35} strokeWidth={1} />
        <circle cx={C} cy={C} r={84} fill="none" stroke="#140c10" strokeWidth={10} />
        {plates.map((p, i) => (
          <path
            key={p.id}
            d={arc(84, i * seg + 0.4, (i + 1) * seg - 0.4)}
            stroke={p.color}
            strokeWidth={10}
            fill="none"
            opacity={loaded[i] ? 1 : 0.15}
            style={loaded[i] ? { filter: `drop-shadow(0 0 5px ${p.color})`, transition: 'opacity .3s' } : { transition: 'opacity .3s' }}
          />
        ))}
        <g transform={`rotate(${(hour / 24) * 360} ${C} ${C})`}>
          <line x1={C} y1={C} x2={C} y2={20} stroke="var(--cyan)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 4px var(--cyan))' }} />
          <circle cx={C} cy={22} r={4} fill="var(--cyan)" />
        </g>
        <circle cx={C} cy={C} r={66} fill="var(--bg)" />
        <g className="spinr">
          <circle cx={C} cy={C} r={61} fill="none" stroke="#00E5FF" strokeOpacity={0.7} strokeWidth={3} strokeDasharray="14 5" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
        </g>
        <circle cx={C} cy={C} r={54} fill="none" stroke="#E0283A" strokeOpacity={0.9} strokeWidth={2} style={{ filter: 'drop-shadow(0 0 5px #E0283A)' }} />
      </svg>
      <div className="mid">
        <div className="big">
          {count}/{n}
        </div>
        <div className="micro" style={{ marginTop: 4 }}>
          Plates loaded
        </div>
      </div>
    </div>
  )
}
