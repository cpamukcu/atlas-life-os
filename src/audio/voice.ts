import { audio, reverb } from './engine'

// Ryan (en-GB neural) clips, generated ahead of time by scripts/make-voice.sh.
export type Clip = 'hello-morning' | 'hello-afternoon' | 'hello-evening' | 'secured'

const cache = new Map<Clip, AudioBuffer>()
let current: AudioBufferSourceNode | null = null

async function load(clip: Clip): Promise<AudioBuffer> {
  const hit = cache.get(clip)
  if (hit) return hit
  const { c } = audio()
  const res = await fetch(`${import.meta.env.BASE_URL}voice/${clip}.mp3`)
  const buf = await c.decodeAudioData(await res.arrayBuffer())
  cache.set(clip, buf)
  return buf
}

/** Play a voice clip through the "AI in the room" effect: light echo, short comb shimmer, air. */
export async function say(clip: Clip): Promise<void> {
  const { c, master } = audio()
  const buf = await load(clip)
  current?.stop()
  const src = c.createBufferSource()
  src.buffer = buf

  const out = c.createGain()
  const air = c.createBiquadFilter()
  air.type = 'highshelf'
  air.frequency.value = 4000
  air.gain.value = 3
  out.connect(air).connect(master)

  const dry = c.createGain()
  dry.gain.value = 0.9
  src.connect(dry).connect(out)

  const conv = reverb(c, 0.7, 3)
  const wet = c.createGain()
  wet.gain.value = 0.22
  src.connect(conv).connect(wet).connect(out)

  const dl = c.createDelay()
  dl.delayTime.value = 0.011
  const fb = c.createGain()
  fb.gain.value = 0.35
  const comb = c.createGain()
  comb.gain.value = 0.18
  src.connect(dl)
  dl.connect(fb).connect(dl)
  dl.connect(comb).connect(out)

  current = src
  return new Promise((done) => {
    src.onended = () => done()
    src.start()
  })
}

export function greetingClip(part: 'morning' | 'afternoon' | 'evening'): Clip {
  return `hello-${part}`
}
