import { useMemo, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { whatsappLink } from '@/config/site'
import { formatLongDate, formatTime } from '@/lib/formValidation'
import Field from '@/components/ui/Field'
import { adminApi } from '../adminApi'
import useAdminData from '../useAdminData'

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled', completed: 'Completed' }

export default function ReservationsTab({ onChanged }) {
  const [status, setStatus] = useState('pending')
  const [upcoming, setUpcoming] = useState(true)
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState('')

  const path = useMemo(() => {
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (upcoming) p.set('upcoming', '1')
    if (search.trim()) p.set('q', search.trim())
    return `/reservations?${p}`
  }, [status, upcoming, search])

  const { items, setItems, loading, error } = useAdminData(path)

  const change = async (row, next) => {
    setActionError('')
    try {
      const { item } = await adminApi.patch(`/reservations/${row.id}`, { status: next })
      setItems((list) => list.map((r) => (r.id === item.id ? item : r)))
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const confirmText = (r) =>
    `Hello ${r.name}, your table at Fairytale is confirmed for ${r.guests} on ${formatLongDate(r.date)} at ${formatTime(r.time)} (ref ${r.reference}). See you soon!`

  return (
    <>
      <div className="admin-filters">
        <Field as="select" label="Status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Field>
        <Field label="Search" name="q" placeholder="Name, phone or reference" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label className="admin-check">
          <input type="checkbox" checked={upcoming} onChange={(e) => setUpcoming(e.target.checked)} /> Upcoming only
        </label>
      </div>

      {error || actionError ? <p className="form-alert" role="alert">{error || actionError}</p> : null}
      {loading ? <p className="admin-empty">Loading…</p> : null}
      {!loading && !error && items.length === 0 ? <p className="admin-empty">No reservations match.</p> : null}

      <ul className="admin-list">
        {items.map((r) => (
          <li key={r.id} className="admin-card">
            <div className="admin-card__main">
              <p className="admin-card__title">
                {formatLongDate(r.date)}, {formatTime(r.time)} · {r.guests} guest{r.guests === 1 ? '' : 's'}
              </p>
              <p><strong>{r.name}</strong> <span className="admin-muted">· {r.reference}</span></p>
              <p className="admin-muted">
                {r.phone}{r.email ? ` · ${r.email}` : ''}{r.occasion ? ` · ${r.occasion}` : ''}
              </p>
              {r.notes ? <p className="admin-notes">“{r.notes}”</p> : null}
            </div>
            <div className="admin-card__side">
              <span className={`admin-pill admin-pill--${r.status}`}>{STATUS_LABEL[r.status]}</span>
              <Field as="select" label="Change status" name={`status-${r.id}`} value={r.status} onChange={(e) => change(r, e.target.value)}>
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Field>
              <div className="admin-actions">
                <a className="admin-link" href={`tel:${r.phone}`}><Phone size={14} aria-hidden="true" /> Call</a>
                <a className="admin-link" href={whatsappLink(confirmText(r)).replace(/wa\.me\/\d+/, `wa.me/${r.phone.replace(/\D/g, '')}`)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={14} aria-hidden="true" /> WhatsApp guest
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
