import { motion } from 'framer-motion'
import { pageVariants } from '@/animations/presets'
import useReducedMotion from '@/hooks/useReducedMotion'

/** Soft fade + lift between routes. Skipped entirely for reduced-motion users. */
export default function PageTransition({ children }) {
  const reduced = useReducedMotion()
  if (reduced) return children

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}
