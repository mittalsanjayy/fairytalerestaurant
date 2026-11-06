import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { MENU } from '@/config/content'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { ApiError } from '@/services/api'
import { adminApi } from '../adminApi'
import useAdminData from '../useAdminData'

const BLANK = { category: MENU.categories[0].id, name: '', description: '', price: '', veg: '', is_available: true }
const vegToValue = (v) => (v === true ? 'veg' : v === false ? 'nonveg' : '')
const valueToVeg = (v) => (v === 'veg' ? true : v === 'nonveg' ? false : null)

export default function MenuTab() {
  const { items, setItems, loading, error, reload } = useAdminData('/menu-items')
  const [form, setForm] = useState(null) // null = closed; otherwise values (+ id when editing)
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
    setForm(item ? { ...item, price: item.price ?? '', veg: vegToValue(item.veg) } : { ...BLANK })
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const body = {
      category: form.category, name: form.name, description: form.description,
      price: form.price === '' ? null : Number(form.price),
      veg: valueToVeg(form.veg), is_available: form.is_available,
    }
    try {
      if (form.id) await adminApi.put(`/menu-items/${form.id}`, body)
      else await adminApi.post('/menu-items', body)
      setForm(null)
      await reload()
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details)
      else setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    try {
      await adminApi.del(`/menu-items/${item.id}`)
      setItems((list) => list.filter((x) => x.id !== item.id))
    } catch (err) {
      setMessage(err.message)
    }
  }

  const toggleAvailable = async (item) => {
    try {
      await adminApi.put(`/menu-items/${item.id}`, { ...item, is_available: !item.is_available })
      await reload()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <p className="admin-help">
        Dishes you add here appear on the website’s Menu within a minute. A category with no dishes keeps the “see the full menu on Zomato” message.
      </p>
      {!form ? <Button size="sm" onClick={() => open(null)}>Add a dish</Button> : null}
      {error || message ? <p className="form-alert" role="alert">{error || message}</p> : null}

      {form ? (
        <form className="admin-form" onSubmit={save} noValidate>
          <h3>{form.id ? 'Edit dish' : 'New dish'}</h3>
          <div className="admin-grid">
            <Field as="select" label="Category" name="category" value={form.category} onChange={set} error={errors.category} required>
              {MENU.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Field>
            <Field label="Dish name" name="name" value={form.name} onChange={set} error={errors.name} maxLength={120} required />
            <Field label="Price (₹)" name="price" type="number" inputMode="numeric" min="0" value={form.price} onChange={set} error={errors.price} optional />
            <Field as="select" label="Veg / non-veg" name="veg" value={form.veg} onChange={set} error={errors.veg}>
              <option value="">No marker</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-vegetarian</option>
            </Field>
          </div>
          <Field label="Short description" name="description" value={form.description} onChange={set} error={errors.description} maxLength={300} optional />
          <label className="admin-check">
            <input type="checkbox" name="is_available" checked={form.is_available} onChange={set} /> Show on the website
          </label>
          <div className="admin-actions">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save dish'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      {loading ? <p className="admin-empty">Loading…</p> : null}
      {MENU.categories.map((c) => {
        const rows = items.filter((i) => i.category === c.id)
        return (
          <section key={c.id} className="admin-group">
            <h3>{c.label} <span className="admin-muted">({rows.length})</span></h3>
            {rows.length === 0 ? <p className="admin-empty">No dishes yet.</p> : null}
            <ul className="admin-list">
              {rows.map((i) => (
                <li key={i.id} className={`admin-card admin-card--compact ${i.is_available ? '' : 'is-hidden'}`}>
                  <div className="admin-card__main">
                    <p className="admin-card__title">
                      {i.name} {i.price != null ? <span className="admin-muted">· ₹{i.price}</span> : null}
                      {i.veg === true ? <span className="admin-muted"> · Veg</span> : i.veg === false ? <span className="admin-muted"> · Non-veg</span> : null}
                    </p>
                    {i.description ? <p className="admin-muted">{i.description}</p> : null}
                    {i.is_available ? null : <p className="admin-muted">Hidden from the website</p>}
                  </div>
                  <div className="admin-actions">
                    <button type="button" className="admin-link" onClick={() => open(i)}><Pencil size={14} aria-hidden="true" /> Edit</button>
                    <button type="button" className="admin-link" onClick={() => toggleAvailable(i)}>{i.is_available ? 'Hide' : 'Show'}</button>
                    <button type="button" className="admin-link admin-link--danger" onClick={() => remove(i)}><Trash2 size={14} aria-hidden="true" /> Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
