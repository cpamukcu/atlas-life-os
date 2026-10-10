export const SECURED = 'atlas:secured'

/** Fire the DAY SECURED animation. */
export const announceSecured = () => window.dispatchEvent(new Event(SECURED))
