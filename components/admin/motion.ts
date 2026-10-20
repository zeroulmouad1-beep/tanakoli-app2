"use client"

/**
 * Motion presets for the admin console.
 * Durations stay inside the 150–400ms window with a natural "ease-out-quint"
 * style curve — no springs, no bounce.
 */

type Easing = [number, number, number, number]

export const EASE_OUT: Easing = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT: Easing = [0.4, 0, 0.2, 1]

/** Parent wrapper: staggers its children in on first paint. */
export const stagger = (each = 0.06, delay = 0.05) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: each, delayChildren: delay },
  },
})

/** Default reveal for cards and sections. */
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
}

/** Slightly larger reveal, used for the whole page sections. */
export const fadeUpLg = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
}

/** Row / list item reveal (used by transactions + drivers). */
export const rowIn = (index: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(index, 14) * 0.025 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: EASE_IN_OUT },
  },
})

/** Small inline notices (error / success). */
export const noticeIn = {
  initial: { opacity: 0, y: -6, height: 0 },
  animate: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -6, height: 0 },
}
