import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { GALLERY } from '@/config/content'
import { SITE } from '@/config/site'
import { getImagesByPrefix } from '@/lib/images'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import Lightbox from '@/components/ui/Lightbox'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Gallery.css'

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null)

  // Any `gallery-*` photo dropped into src/assets/images appears here automatically
  const photos = useMemo(
    () =>
      getImagesByPrefix(GALLERY.prefix).map((p, i) => ({
        ...p,
        alt: GALLERY.alts[p.name] ?? `${SITE.fullName}, photo ${i + 1}`,
      })),
    [],
  )

  return (
    <section id="gallery" className="gallery section" aria-labelledby="gallery-title">
      <div className="container">
        <header className="gallery__head">
          <span className="eyebrow eyebrow--center">{GALLERY.eyebrow}</span>
          <SplitText id="gallery-title" as="h2" className="gallery__title" text={GALLERY.title} onScroll stagger={0.08} />
          <GoldDivider />
          <Reveal>
            <p className="lead gallery__lead">{GALLERY.lead}</p>
          </Reveal>
        </header>

        {photos.length > 0 ? (
          <Reveal as="ul" className="gallery__grid" y={30} start="top 92%">
            {photos.map((photo, i) => (
              <li key={photo.name} className="gallery__cell">
                <button
                  type="button"
                  className="gallery__tile"
                  aria-label={`Open photo ${i + 1} of ${photos.length}: ${photo.alt}`}
                  onClick={() => setOpenIndex(i)}
                >
                  <img src={photo.src} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </Reveal>
        ) : (
          <Reveal className="gallery__empty" y={30}>
            <p className="lead">{GALLERY.emptyText}</p>
            {import.meta.env.DEV ? (
              <p className="gallery__hint">
                Dev note: add files named “gallery-01.jpg”, “gallery-02.jpg”… to src/assets/images.
              </p>
            ) : null}
            <Button href={SITE.instagram} icon={<Instagram size={16} />}>
              Follow on Instagram
            </Button>
          </Reveal>
        )}

        {photos.length > 0 ? (
          <div className="gallery__foot">
            <Button href={SITE.instagram} variant="ghost" icon={<Instagram size={15} />}>
              More on Instagram
            </Button>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {openIndex !== null ? (
          <Lightbox
            items={photos}
            index={openIndex}
            onChange={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
