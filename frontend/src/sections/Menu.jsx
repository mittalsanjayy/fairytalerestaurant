import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import { MENU } from '@/config/content'
import { SITE } from '@/config/site'
import { EASE } from '@/animations/presets'
import useReducedMotion from '@/hooks/useReducedMotion'
import usePublicContent from '@/hooks/usePublicContent'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Menu.css'

const formatPrice = (price) =>
  typeof price === 'number' ? `₹${new Intl.NumberFormat('en-IN').format(price)}` : null

function VegMark({ veg }) {
  if (veg === null || veg === undefined) return null
  return (
    <span
      className={`menu__veg ${veg ? 'menu__veg--veg' : 'menu__veg--nonveg'}`}
      role="img"
      aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
    />
  )
}

export default function Menu() {
  const [activeId, setActiveId] = useState(MENU.categories[0].id)
  const tabRefs = useRef({})
  const reduced = useReducedMotion()
  const { menu } = usePublicContent()
  const base = MENU.categories.find((c) => c.id === activeId) ?? MENU.categories[0]
  // Dishes entered in the admin dashboard win; config/content.js is the fallback.
  const liveItems = menu[base.id] ?? []
  const category = { ...base, items: liveItems.length > 0 ? liveItems : base.items }
  const hasItems = category.items.length > 0

  // WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the first/last
  const onTabKeyDown = (event) => {
    const ids = MENU.categories.map((c) => c.id)
    const current = ids.indexOf(activeId)
    let next = null
    if (event.key === 'ArrowRight') next = (current + 1) % ids.length
    else if (event.key === 'ArrowLeft') next = (current - 1 + ids.length) % ids.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = ids.length - 1
    if (next === null) return
    event.preventDefault()
    setActiveId(ids[next])
    tabRefs.current[ids[next]]?.focus()
  }

  const panelMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.out } },
        exit: { opacity: 0, transition: { duration: 0.2, ease: EASE.inOut } },
      }

  return (
    <section id="menu" className="menu section" aria-labelledby="menu-title">
      <div className="container">
        <header className="menu__head">
          <span className="eyebrow eyebrow--center">{MENU.eyebrow}</span>
          <SplitText id="menu-title" as="h2" className="menu__title" text={MENU.title} onScroll stagger={0.08} />
          <GoldDivider />
          <Reveal>
            <p className="lead menu__lead">{MENU.lead}</p>
          </Reveal>
        </header>

        <div
          className="menu__tabs"
          role="tablist"
          aria-label="Menu categories"
          onKeyDown={onTabKeyDown}
        >
          {MENU.categories.map((c) => {
            const selected = c.id === activeId
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[c.id] = el
                }}
                id={`menu-tab-${c.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`menu-panel-${c.id}`}
                tabIndex={selected ? 0 : -1}
                className={`menu__tab ${selected ? 'is-active' : ''}`.trim()}
                onClick={() => setActiveId(c.id)}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={category.id}
            id={`menu-panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`menu-tab-${category.id}`}
            tabIndex={0}
            className="menu__panel"
            {...panelMotion}
          >
            <div className="menu__media">
              <Photo name={category.image.name} alt={category.image.alt} ratio={null} className="photo--fill" />
            </div>

            <div className="menu__body">
              <h3 className="menu__cat-title">{category.label}</h3>
              <p className="menu__tagline">{category.tagline}</p>
              <p className="menu__text">{category.text}</p>

              {hasItems ? (
                <ul className="menu__items">
                  {category.items.map((item) => {
                    const price = formatPrice(item.price)
                    return (
                      <li key={item.name} className="menu__item">
                        <div className="menu__item-row">
                          <VegMark veg={item.veg} />
                          <span className="menu__item-name">{item.name}</span>
                          {price ? <span className="menu__item-leader" aria-hidden="true" /> : null}
                          {price ? <span className="menu__item-price">{price}</span> : null}
                        </div>
                        {item.description ? <p className="menu__item-desc">{item.description}</p> : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="menu__note">{MENU.emptyNote}</p>
              )}

              <div className="menu__actions">
                <Button href={SITE.zomato} icon={<ArrowRight size={16} />}>
                  {MENU.fullMenuCta.label}
                </Button>
                <Button href={SITE.phoneHref} variant="ghost" icon={<Phone size={15} />}>
                  {MENU.callCta.label}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
