import { useState } from 'react'
import { AREAS } from '../lib/catalog'
import { db, uid, type Task } from '../db/db'
import { useNow, useTasks } from '../db/hooks'
import { timeLeft, urgency } from '../lib/deadlines'
import { addDays, todayKey } from '../lib/time'

function group(t: Task, now: Date): string {
  if (t.done) return 'Done'
  if (!t.due) return 'Inbox'
  const d = new Date(t.due)
  if (d < now) return 'Overdue'
  const k = todayKey(d)
  const today = todayKey(now)
  if (k === today) return 'Today'
  if (k <= addDays(today, 7)) return 'This week'
  return 'Later'
}
const ORDER = ['Overdue', 'Today', 'This week', 'Later', 'Inbox', 'Done']

export function Tasks() {
  const tasks = useTasks()
  const now = useNow(30_000)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [area, setArea] = useState('School')
  const [showDone, setShowDone] = useState(false)

  async function add() {
    if (!title.trim()) return
    await db.tasks.add({ id: uid(), title: title.trim(), area, due: due ? new Date(due).toISOString() : undefined, done: false, createdAt: new Date().toISOString() })
    setTitle('')
    setDue('')
  }

  const groups = ORDER.map((g) => ({
    g,
    items: tasks.filter((t) => group(t, now) === g).sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9')),
  })).filter((x) => x.items.length)

  return (
    <>
      <h1 className="h1">TASKS</h1>
      <section className="panel">
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="field" placeholder="New task" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <div className="row">
            <input className="field mono sp" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
            <select className="field" style={{ width: 'auto' }} value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area">
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <button className="btn gold" onClick={add}>
            Add task
          </button>
        </div>
      </section>

      {groups.length === 0 && <div className="empty">Your task list is empty. Add the first one above.</div>}
      {groups.map(({ g, items }) =>
        g === 'Done' && !showDone ? (
          <button key={g} className="btn" style={{ width: '100%' }} onClick={() => setShowDone(true)}>
            Show {items.length} done
          </button>
        ) : (
          <section key={g} className="panel">
            <div className="panel-h">
              <span className="micro" style={{ color: g === 'Overdue' ? 'var(--red)' : undefined }}>
                {g.toUpperCase()}
              </span>
              <span className="micro">{items.length}</span>
            </div>
            {items.map((t) => {
              const u = t.due && !t.done ? urgency(new Date(t.due), now) : null
              return (
                <div key={t.id} className="dl">
                  <button
                    className={`switch ${t.done ? 'on' : ''}`}
                    style={{ width: 26, borderRadius: 4 }}
                    role="checkbox"
                    aria-checked={t.done}
                    aria-label={`Mark ${t.title} done`}
                    onClick={() => db.tasks.update(t.id, { done: !t.done, doneAt: t.done ? undefined : new Date().toISOString() })}
                  />
                  <span className="sp" style={{ textDecoration: t.done ? 'line-through' : undefined, color: t.done ? 'var(--muted)' : undefined }}>
                    {t.title}
                    <span className="micro" style={{ marginLeft: 8 }}>
                      {t.area}
                    </span>
                  </span>
                  {u && (
                    <span className="t" style={{ color: u === 'later' ? 'var(--muted)' : u === 'soon' ? 'var(--amber)' : 'var(--red)' }}>
                      {timeLeft(new Date(t.due!), now)}
                    </span>
                  )}
                  <button className="chip" style={{ minHeight: 32, padding: '4px 8px' }} onClick={() => db.tasks.delete(t.id)} aria-label={`Delete ${t.title}`}>
                    ✕
                  </button>
                </div>
              )
            })}
          </section>
        ),
      )}
    </>
  )
}
