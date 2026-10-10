import { useEffect, useRef, useState } from 'react'
import { level } from './audio/engine'
import { suitUp } from './audio/sfx'
import { greetingClip, say } from './audio/voice'
import { Background } from './components/Background'
import { Icon } from './components/Icons'
import { Boot, Secured, VoiceRing } from './components/Overlays'
import { announceSecured } from './lib/events'
import { QuickAdd } from './components/QuickAdd'
import { saveSettings } from './db/db'
import { useNow, useSettings, useToday } from './db/hooks'
import { Barbell } from './pages/Barbell'
import { Home } from './pages/Home'
import { MODULES } from './lib/catalog'
import { Academics, Coming, Money, More } from './pages/Modules'
import { Settings } from './pages/Settings'
import { Tasks } from './pages/Tasks'
import { partOfDay, shanghaiParts, todayKey } from './lib/time'
import { isWonDay, platesLoaded } from './lib/wonday'

const TABS = [
  ['home', 'Home'],
  ['acad', 'Academics'],
  ['bar', 'Barbell'],
  ['task', 'Tasks'],
  ['more', 'More'],
] as const

const MORE_ROUTES = new Set(['more', 'settings', ...MODULES.map((m) => m.id)])

function useRoute(): [string, (r: string) => void] {
  const read = () => location.hash.replace(/^#\/?/, '') || 'home'
  const [r, setR] = useState(read)
  useEffect(() => {
    const on = () => setR(read())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return [r, (next) => (location.hash = `/${next}`)]
}

export default function App() {
  const s = useSettings()
  const today = useToday()
  const now = useNow()
  const [route, go] = useRoute()
  const [adding, setAdding] = useState(false)
  const [booting, setBooting] = useState<boolean | null>(null)
  const [talking, setTalking] = useState(false)
  const wasWon = useRef<boolean | null>(null)

  // Boot once per day (decided after settings load from IndexedDB).
  useEffect(() => {
    if (booting !== null) return
    const t = setTimeout(() => setBooting(s.lastBoot !== todayKey()), 250)
    return () => clearTimeout(t)
  }, [s.lastBoot, booting])

  async function speak(clip: Parameters<typeof say>[0]) {
    setTalking(true)
    level.speaking = true
    try {
      await say(clip)
    } finally {
      level.speaking = false
      setTalking(false)
    }
  }

  // DAY SECURED when today flips to a won day while the app is open.
  const won = isWonDay(today, s.plates, s.routine)
  useEffect(() => {
    if (wasWon.current === false && won) {
      announceSecured()
      if (s.sound) void speak('secured')
    }
    wasWon.current = won
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won])

  const { hour } = shanghaiParts(now)
  const tab = route === 'home' ? 'home' : route === 'academics' ? 'acad' : route === 'barbell' ? 'bar' : route === 'tasks' ? 'task' : MORE_ROUTES.has(route) ? 'more' : 'home'
  const page =
    route === 'academics' ? <Academics /> :
    route === 'barbell' ? <Barbell /> :
    route === 'tasks' ? <Tasks /> :
    route === 'more' ? <More go={go} /> :
    route === 'settings' ? <Settings /> :
    route === 'money' ? <Money /> :
    MODULES.some((m) => m.id === route) ? (
      <>
        <h1 className="h1">{MODULES.find((m) => m.id === route)!.name.toUpperCase()}</h1>
        <Coming id={route} />
      </>
    ) : <Home />

  return (
    <div className={`app ${s.calm ? 'calm' : ''}`}>
      <Background off={s.calm} />
      {!s.calm && <div className="scan" />}
      <div className="ret" aria-hidden="true">
        <i /><i /><i /><i />
      </div>

      <main className="main" key={route}>
        <header className="status">
          <span className="clock">{now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' })} CST</span>
          <span className="micro">SYS // {partOfDay(hour).toUpperCase()}</span>
          <span className="sync" title="Data saved on this device">
            <i />
            <span className="micro">LOCAL</span>
          </span>
        </header>
        {page}
      </main>

      <button className="fab" onClick={() => setAdding(true)} aria-label="Quick add">
        +
      </button>
      <nav className="tabs" aria-label="Main">
        {TABS.map(([k, n]) => (
          <button key={k} className={tab === k ? 'act' : ''} onClick={() => go(k === 'acad' ? 'academics' : k === 'bar' ? 'barbell' : k === 'task' ? 'tasks' : k)} aria-current={tab === k ? 'page' : undefined}>
            <Icon name={k} />
            {n}
          </button>
        ))}
      </nav>

      {adding && <QuickAdd onClose={() => setAdding(false)} />}
      <Secured />
      <VoiceRing active={talking} />
      {booting && (
        <Boot
          name={s.name}
          plates={`${platesLoaded(today, s.plates)}/${s.plates.length}`}
          sound={s.sound}
          onDone={(engaged) => {
            void saveSettings({ lastBoot: todayKey() })
            setTimeout(() => setBooting(false), 400)
            if (engaged) {
              const d = suitUp()
              setTimeout(() => void speak(greetingClip(partOfDay(hour))), d * 1000)
            }
          }}
        />
      )}
    </div>
  )
}
