import { partOfDay } from './time'

export interface GreetingInput {
  name: string
  hour: number
  classesToday: number
  urgentDeadlineHours: number | null
  platesLeft: number
  platesTotal: number
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const num = (n: number) => WORDS[n] ?? String(n)
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** ATLAS greeting built from today's data. Calm, short, never guilt-tripping. */
export function buildGreeting(g: GreetingInput): { hello: string; body: string } {
  const hello = `Good ${partOfDay(g.hour)}, ${g.name}.`
  const bits: string[] = []
  if (g.classesToday > 0) bits.push(`${num(g.classesToday)} class${g.classesToday > 1 ? 'es' : ''} today`)
  if (g.urgentDeadlineHours !== null) bits.push(`one deadline in ${g.urgentDeadlineHours} hours`)

  if (g.platesLeft === 0 && g.platesTotal > 0) {
    const lead = bits.length ? `${cap(bits.join(', '))}. ` : ''
    return { hello, body: `${lead}All plates loaded. Well done.` }
  }
  const plates =
    g.platesLeft === g.platesTotal
      ? `${num(g.platesTotal)} plates waiting`
      : `${num(g.platesLeft)} plate${g.platesLeft > 1 ? 's' : ''} left to load`
  bits.push(plates)
  const list = bits.length > 1 ? `${bits.slice(0, -1).join(', ')}, and ${bits[bits.length - 1]}` : bits[0]
  return { hello, body: `${cap(list)}. Let's secure the day.` }
}
