import { useCallback, useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { Emblem } from '@/components/ui/BrandMark'
import { adminApi } from './adminApi'
import ReservationsTab from './tabs/ReservationsTab'
import MessagesTab from './tabs/MessagesTab'
import MenuTab from './tabs/MenuTab'
import OffersTab from './tabs/OffersTab'
import HoursTab from './tabs/HoursTab'

const TABS = [
  { id: 'reservations', label: 'Reservations', badge: 'pending_reservations', Panel: ReservationsTab },
  { id: 'messages', label: 'Messages', badge: 'unread_messages', Panel: MessagesTab },
  { id: 'menu', label: 'Menu', Panel: MenuTab },
  { id: 'offers', label: 'Offers', Panel: OffersTab },
  { id: 'hours', label: 'Hours', Panel: HoursTab },
]

export default function Dashboard({ email, onSignOut }) {
  const [active, setActive] = useState('reservations')
  const [overview, setOverview] = useState(null)
  const tabRefs = useRef({})

  const refreshOverview = useCallback(() => {
    adminApi.get('/overview').then(setOverview).catch(() => {})
  }, [])
  useEffect(refreshOverview, [refreshOverview])

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active)
    let n = null
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length
    if (n === null) return
    e.preventDefault()
    setActive(TABS[n].id)
    tabRefs.current[TABS[n].id]?.focus()
  }

  const { Panel } = TABS.find((t) => t.id === active)

  return (
    <>
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <Emblem size={36} />
          <span>Fairytale · Owner dashboard</span>
        </div>
        <button type="button" className="admin-link" onClick={onSignOut}>
          <LogOut size={15} aria-hidden="true" /> Sign out
        </button>
      </header>

      <main className="admin-main">
        {overview ? (
          <p className="admin-summary">
            <strong>{overview.today_reservations}</strong> booking{overview.today_reservations === 1 ? '' : 's'} today ·{' '}
            <strong>{overview.pending_reservations}</strong> awaiting confirmation ·{' '}
            <strong>{overview.unread_messages}</strong> unread message{overview.unread_messages === 1 ? '' : 's'}
          </p>
        ) : null}

        <div className="admin-tabs" role="tablist" aria-label="Dashboard sections" onKeyDown={onKeyDown}>
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => (tabRefs.current[t.id] = el)}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={t.id === active}
              aria-controls="admin-panel"
              tabIndex={t.id === active ? 0 : -1}
              className={`admin-tab ${t.id === active ? 'is-active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
              {t.badge && overview?.[t.badge] > 0 ? <span className="admin-badge">{overview[t.badge]}</span> : null}
            </button>
          ))}
        </div>

        <section id="admin-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="admin-panel">
          <Panel onChanged={refreshOverview} />
        </section>
      </main>
    </>
  )
}
