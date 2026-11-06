import { getImage } from '@/lib/images'
import { Emblem } from './BrandMark'
import './Photo.css'

/**
 * Client photograph with a graceful fallback.
 *
 *   <Photo name="about-interior" alt="..." ratio="4 / 5" />   keeps its own aspect ratio
 *   <Photo name="..." alt="..." ratio={null} className="photo--fill" />   fills a sized parent
 *
 * If the file has not been added to src/assets/images yet, an on-brand panel is shown instead
 * (with a developer hint in dev mode only).
 */
export default function Photo({ name, alt, ratio = '4 / 5', priority = false, className = '' }) {
  const src = getImage(name)

  return (
    <div className={`photo ${className}`.trim()} style={ratio ? { aspectRatio: ratio } : undefined}>
      {src ? (
        <img
          className="photo__img"
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : undefined}
        />
      ) : (
        <div className="photo__empty" aria-hidden="true">
          <Emblem size={52} />
          {import.meta.env.DEV ? (
            <span className="photo__hint">Add “{name}.jpg” to src/assets/images</span>
          ) : null}
        </div>
      )}
    </div>
  )
}
