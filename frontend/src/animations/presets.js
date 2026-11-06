/**
 * Shared motion language. Keep every animation on these curves and durations
 * so the whole site moves with one, deliberate, expensive-feeling rhythm.
 */

// Framer Motion (UI transitions)
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: EASE.inOut } },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE.out } },
}

export const staggerContainer = (stagger = 0.1, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

// GSAP (scroll storytelling, hero, parallax)
export const GSAP_EASE = {
  out: 'power3.out',
  expo: 'expo.out',
  inOut: 'power3.inOut',
}
