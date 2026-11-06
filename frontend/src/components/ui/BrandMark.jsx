import './BrandMark.css'

import logo from '@/assets/brand/logo-mark.webp'

/**
 * The client's official circular logo (src/assets/brand/logo-mark.webp, transparent outside the
 * circle). Used everywhere via <Emblem size={px} />. It is decorative here: the surrounding link
 * or heading carries the accessible name. To change the logo, replace that file (square, with
 * transparency) and the icons in /public (see docs/brand/).
 */
export function Emblem({ size = 64, className = '' }) {
  return (
    <img
      className={`emblem ${className}`.trim()}
      src={logo}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable="false"
    />
  )
}

export default function BrandMark({ size = 'md', showEmblem = true, className = '' }) {
  return (
    <div className={`brand brand--${size} ${className}`.trim()}>
      {showEmblem ? <Emblem size={size === 'xl' ? 150 : size === 'lg' ? 110 : 76} /> : null}
      <span className="brand__name text-gold">FAIRYTALE</span>
      <span className="brand__sub">CAFÉ &amp; RESTAURANT</span>
    </div>
  )
}
