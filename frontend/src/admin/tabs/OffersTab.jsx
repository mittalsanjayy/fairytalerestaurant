import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { ApiError } from '@/services/api'
import { adminApi } from '../adminApi'
import useAdminData from '../useAdminData'

const BLANK = { title: '', description: '', terms: '', is_active: true }

export default function OffersTab() {
  const { items, setItems, loading, error, reload } = useAdminData('/offers')
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }))
  }
  const open = (item) => {
    setMessage('')
    setErrors({})
    setForm(item ? { ...item } : { ...BLANK })
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { title, description, terms, is_active } = form
    try {
      if (form.id) await adminApi.put(`/offers/${form.id}`, { title, description, terms, is_active })
      else await adminApi.post('/offers', { title, description, terms, is_active })
      setForm(null)
      await reload()
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details)
      else setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (o) => {
    if (!window.confirm(`Delete the offer “${o.title}”?`)) return
    try {
      await adminApi.del(`/offers/${o.id}`)
      setItems((list) => list.filter((x) => x.id !== o.id))
    } catch (err) {
      setMessage(err.message)
    }
  }

  const toggle = async (o) => {
    try {
      await adminApi.put(`/offers/${o.id}`, { ...o, is_active: !o.is_active })
      await reload()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <p className="admin-help">
        Active offers appear on the website within a minute. With none active, visitors see the “Ask what’s on today” panel.
      </p>
      {!form ? <Button size="sm" onClick={() => open(null)}>Add an offer</Button> : null}
      {error || message ? <p className="form-alert" role="alert">{error || message}</p> : null}

      {form ? (
        <form className="admin-form" onSubmit={save} noValidate>
          <h3>{form.id ? 'Edit offer' : 'New offer'}</h3>
          <Field label="Title" name="title" value={form.title} onChange={set} error={errors.title} maxLength={120} required />
          <Field as="textarea" rows={3} label="Description" name="description" value={form.description} onChange={set} error={errors.description} maxLength={400} required />
          <Field label="Terms" name="terms" value={form.terms} onChange={set} error={errors.terms} maxLength={200} hint="For example: valid on weekdays, dine-in only." optional />
          <label className="admin-check">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={set} /> Show on the website
          </label>
          <div className="admin-actions">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save offer'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      {loading ? <p className="admin-empty">Loading…</p> : null}
      {!loading && items.length === 0 ? <p className="admin-empty">No offers yet.</p> : null}
      <ul className="admin-list">
        {items.map((o) => (
          <li key={o.id} className={`admin-card admin-card--compact ${o.is_active ? '' : 'is-hidden'}`}>
            <div className="admin-card__main">
              <p className="admin-card__title">{o.title}</p>
              <p className="admin-body">{o.description}</p>
              {o.terms ? <p className="admin-muted">{o.terms}</p> : null}
              {o.is_active ? null : <p className="admin-muted">Hidden from the website</p>}
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-link" onClick={() => open(o)}><Pencil size={14} aria-hidden="true" /> Edit</button>
              <button type="button" className="admin-link" onClick={() => toggle(o)}>{o.is_active ? 'Hide' : 'Show'}</button>
              <button type="button" className="admin-link admin-link--danger" onClick={() => remove(o)}><Trash2 size={14} aria-hidden="true" /> Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
