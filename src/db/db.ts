import Dexie, { type EntityTable } from 'dexie'
import { DEFAULT_SETTINGS, type Settings } from '../config'
import type { DayLog } from '../lib/wonday'

export interface Task {
  id: string
  title: string
  area: string
  due?: string
  done: boolean
  doneAt?: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: string
  note: string
  date: string
  createdAt: string
}

export interface Note {
  id: string
  text: string
  createdAt: string
}

interface SettingsRow extends Settings {
  id: 'me'
}

// Local-first store (IndexedDB). A sync backend plugs in behind these tables later.
export const db = new Dexie('atlas') as Dexie & {
  settings: EntityTable<SettingsRow, 'id'>
  days: EntityTable<DayLog, 'date'>
  tasks: EntityTable<Task, 'id'>
  expenses: EntityTable<Expense, 'id'>
  notes: EntityTable<Note, 'id'>
}

db.version(1).stores({
  settings: 'id',
  days: 'date',
  tasks: 'id, due, done',
  expenses: 'id, date',
  notes: 'id, createdAt',
})

export const uid = () => crypto.randomUUID()

export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get('me')
  return { ...DEFAULT_SETTINGS, ...row }
}

export async function saveSettings(patch: Partial<Settings>) {
  const cur = await getSettings()
  await db.settings.put({ ...cur, ...patch, id: 'me' })
}

/** Ask the browser not to evict our data (iOS may still clear it; export regularly). */
export async function requestPersistence() {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist()
  } catch {
    // not supported
  }
}
