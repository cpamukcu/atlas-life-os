const P: Record<string, string> = {
  home: 'M3 11l9-7 9 7v9H3z M9 20v-6h6v6',
  acad: 'M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5',
  bar: 'M2 12h20 M5 7h3v10H5z M16 7h3v10h-3z',
  task: 'M4 4h16v16H4z M8 12l3 3 5-6',
  more: 'M4 12h.01 M12 12h.01 M20 12h.01',
}

export function Icon({ name }: { name: keyof typeof P | string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" strokeWidth={name === 'more' ? 3 : undefined}>
      <path d={P[name]} />
    </svg>
  )
}
