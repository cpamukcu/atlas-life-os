// Single place for identity and defaults. Rename the assistant here.
export const APP_NAME = 'ATLAS'
export const TIMEZONE = 'Asia/Shanghai'

export type PlateKind = 'gym' | 'minutes'

export interface PlateDef {
  id: string
  name: string
  color: string
  kind: PlateKind
}

export interface RoutineItem {
  id: string
  label: string
}

export interface Settings {
  name: string
  /** How the voice should pronounce the name ("Can" is said "Jan"). */
  spokenName: string
  plates: PlateDef[]
  routine: RoutineItem[]
  sound: boolean
  calm: boolean
  dailyBudget: number
  currency: string
  lastBoot: string
}

export const DEFAULT_SETTINGS: Settings = {
  name: 'Can',
  spokenName: 'Jan',
  plates: [
    { id: 'gym', name: 'Gym', color: '#FF8A3D', kind: 'gym' },
    { id: 'code', name: 'Coding', color: '#B388FF', kind: 'minutes' },
    { id: 'zh', name: 'Chinese', color: '#FF6EC7', kind: 'minutes' },
    { id: 'content', name: 'Content', color: '#64FFDA', kind: 'minutes' },
  ],
  routine: [
    { id: 'water', label: 'Glass of water' },
    { id: 'bed', label: 'Make bed' },
    { id: 'move', label: 'Stretch 5 min' },
    { id: 'plan', label: 'Plan the day' },
    { id: 'noor', label: 'Noor small step' },
  ],
  sound: false,
  calm: false,
  dailyBudget: 120,
  currency: '¥',
  lastBoot: '',
}
