import useMediaQuery from './useMediaQuery'

/** True when the visitor has asked their OS/browser for reduced motion. */
export default function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
