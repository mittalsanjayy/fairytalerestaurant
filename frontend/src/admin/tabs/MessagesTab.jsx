import { useState } from 'react'
import { Mail, Phone, Trash2 } from 'lucide-react'
import { adminApi } from '../adminApi'
import useAdminData from '../useAdminData'

const when = (iso) =>
  new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default function MessagesTab({ onChanged }) {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [actionError, setActionError] = useState('')
  const { items, setItems, loading, error } = useAdminData(`/messages${unreadOnly ? '?unread=1' : ''}`)

  const toggle = async (m) => {
    setActionError('')
    try {
      const { item } = await adminApi.patch(`/messages/${m.id}`, { is_read: !m.is_read })
      setItems((list) => list.map((x) => (x.id === item.id ? item : x)))
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return
    setActionError('')
    try {
      await adminApi.del(`/messages/${m.id}`)
      setItems((list) => list.filter((x) => x.id !== m.id))
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <div className="admin-filters">
        <label className="admin-check">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} /> Unread only
        </label>
      </div>
      {error || actionError ? <p className="form-alert" role="alert">{error || actionError}</p> : null}
      {loading ? <p className="admin-empty">Loading…</p> : null}
      {!loading && !error && items.length === 0 ? <p className="admin-empty">No messages.</p> : null}
      <ul className="admin-list">
        {items.map((m) => (
          <li key={m.id} className={`admin-card ${m.is_read ? '' : 'is-unread'}`}>
            <div className="admin-card__main">
              <p className="admin-card__title">{m.name} {m.is_read ? null : <span className="admin-badge">New</span>}</p>
              <p className="admin-muted">{when(m.created_at)}</p>
              <p className="admin-body">{m.message}</p>
            </div>
            <div className="admin-card__side">
              <div className="admin-actions">
                {m.phone ? <a className="admin-link" href={`tel:${m.phone}`}><Phone size={14} aria-hidden="true" /> {m.phone}</a> : null}
                {m.email ? <a className="admin-link" href={`mailto:${m.email}`}><Mail size={14} aria-hidden="true" /> {m.email}</a> : null}
              </div>
              <div className="admin-actions">
                <button type="button" className="admin-link" onClick={() => toggle(m)}>{m.is_read ? 'Mark unread' : 'Mark read'}</button>
                <button type="button" className="admin-link admin-link--danger" onClick={() => remove(m)}>
                  <Trash2 size={14} aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
