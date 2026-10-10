import { db } from '../db/db'
import { useExpenses, useSettings } from '../db/hooks'
import { MODULES } from '../lib/catalog'
import { todayKey } from '../lib/time'


export function Academics() {
  return (
    <>
      <h1 className="h1">ACADEMICS</h1>
      <section className="panel">
        <div className="panel-h">
          <span className="micro">ZJU SYNC // OFFLINE</span>
          <span className="micro" style={{ color: 'var(--amber)' }}>
            PHASE 2
          </span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Your timetable from yjsy.zju.edu.cn and deadlines from courses.zju.edu.cn will appear here. The sync runs only on your Mac, after you log in yourself. Until then, add deadlines as tasks with the School area.
        </p>
      </section>
    </>
  )
}

export function Money() {
  const exp = useExpenses()
  const s = useSettings()
  const key = todayKey()
  const month = key.slice(0, 7)
  const today = exp.filter((e) => e.date === key)
  const monthTotal = exp.filter((e) => e.date.startsWith(month)).reduce((a, e) => a + e.amount, 0)
  const todayTotal = today.reduce((a, e) => a + e.amount, 0)
  const pct = Math.min(100, (todayTotal / s.dailyBudget) * 100)

  return (
    <>
      <h1 className="h1">MONEY</h1>
      <section className="panel">
        <div className="panel-h">
          <span className="micro">TODAY // THREAT LEVEL</span>
          <span className="micro" style={{ color: 'var(--text)' }}>
            {s.currency}
            {Math.round(todayTotal)} / {s.currency}
            {s.dailyBudget}
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(224,40,58,.15)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--green)', transition: 'width .3s' }} />
        </div>
        <div className="micro" style={{ marginTop: 8 }}>
          THIS MONTH {s.currency}
          {Math.round(monthTotal)}
        </div>
      </section>
      <section className="panel">
        <div className="panel-h">
          <span className="micro">TODAY'S EXPENSES</span>
        </div>
        {today.length === 0 && <div className="empty">Nothing spent yet. Use + to log an expense in seconds.</div>}
        {today.map((e) => (
          <div key={e.id} className="dl">
            <span className="sp">
              {e.category}
              {e.note && <span style={{ color: 'var(--muted)' }}> · {e.note}</span>}
            </span>
            <span className="t">
              {s.currency}
              {e.amount}
            </span>
            <button className="chip" style={{ minHeight: 32, padding: '4px 8px' }} onClick={() => db.expenses.delete(e.id)} aria-label="Delete expense">
              ✕
            </button>
          </div>
        ))}
      </section>
      <Coming id="money" />
    </>
  )
}

export function Coming({ id }: { id: string }) {
  const m = MODULES.find((x) => x.id === id)!
  return (
    <section className="panel">
      <div className="panel-h">
        <span className="micro">{m.name.toUpperCase()} // COMING</span>
        <span className="micro" style={{ color: 'var(--amber)' }}>
          {m.phase.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{m.blurb}</p>
    </section>
  )
}

export function More({ go }: { go: (r: string) => void }) {
  return (
    <>
      <h1 className="h1">MODULES</h1>
      {MODULES.map((m) => (
        <button key={m.id} className="panel" style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => go(m.id)}>
          <div className="panel-h" style={{ marginBottom: 4 }}>
            <span className="micro">{m.name.toUpperCase()}</span>
            <span className="micro" style={{ color: 'var(--amber)' }}>
              {m.phase.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{m.blurb}</div>
        </button>
      ))}
      <button className="btn gold" style={{ width: '100%', marginTop: 4 }} onClick={() => go('settings')}>
        Settings
      </button>
    </>
  )
}
