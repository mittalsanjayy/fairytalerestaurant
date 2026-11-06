import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { Emblem } from '@/components/ui/BrandMark'
import Button from '@/components/ui/Button'
import { liveLinks } from '@/config/nav'
import { SITE } from '@/config/site'
import { EASE } from '@/animations/presets'
import './Header.css'

const menuVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE.out, staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: EASE.inOut } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.out } },
}

export default function Header() {
  const { pathname, hash } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const closeRef = useRef(null)
  const links = liveLinks()

  // Solid background after scrolling; hide on scroll down, reveal on scroll up
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (y > lastY + 6 && y > 240) setHidden(true)
      else if (y < lastY - 6 || y <= 240) setHidden(false)
      lastY = y
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route or hash changes
  useEffect(() => setOpen(false), [pathname, hash])

  // Mobile menu: scroll lock, Esc to close, focus trap, restore focus
  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusable = menuRef.current?.querySelectorAll('a[href], button:not([disabled])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      html.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open])

  const classes = ['header', scrolled && 'header--scrolled', hidden && !open && 'header--hidden']
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={classes}>
        <div className="header__bar container">
          <Link to="/" className="header__brand" aria-label="Fairytale Café & Restaurant, home">
            <Emblem size={46} />
            <span className="header__wordmark">
              <span className="header__name text-gold">{SITE.name}</span>
              <span className="header__sub">{SITE.subtitle}</span>
            </span>
          </Link>

          {links.length > 0 ? (
            <nav className="header__nav" aria-label="Primary">
              <ul className="header__list">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="header__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="header__actions">
            <Button
              size="sm"
              variant="ghost"
              href={SITE.phoneHref}
              className="header__call"
              icon={<Phone size={14} />}
            >
              Call us
            </Button>
            <button
              type="button"
              className="header__toggle"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="mobile-menu__top container">
              <span className="header__name text-gold">{SITE.name}</span>
              <button
                ref={closeRef}
                type="button"
                className="header__toggle"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="mobile-menu__nav container" aria-label="Mobile">
              <ul>
                <motion.li variants={itemVariants}>
                  <Link to="/" className="mobile-menu__link">
                    Home
                  </Link>
                </motion.li>
                {links.map((link) => (
                  <motion.li key={link.to} variants={itemVariants}>
                    <Link to={link.to} className="mobile-menu__link">
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div className="mobile-menu__foot container" variants={itemVariants}>
              <Button href={SITE.phoneHref} icon={<Phone size={16} />}>
                {SITE.phone}
              </Button>
              <p>
                {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
