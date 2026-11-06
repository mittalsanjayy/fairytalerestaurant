import useMediaQuery from './useMediaQuery'
import useReducedMotion from './useReducedMotion'

/**
 * One place to decide how heavy the experience should be.
 *
 *  - isMobile:        narrow viewport  -> lighter parallax, fewer particles, no 3D
 *  - hasFinePointer:  mouse/trackpad   -> custom cursor and hover effects allowed
 *  - allowHeavyFx:    desktop AND motion allowed -> 3D, large particle fields, magnetic effects
 */
export default function useDeviceCapabilities() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = useReducedMotion()

  return {
    isMobile,
    hasFinePointer,
    reducedMotion,
    allowHeavyFx: !isMobile && !reducedMotion,
  }
}
