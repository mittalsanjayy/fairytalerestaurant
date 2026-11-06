import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { ApiError } from '@/services/api'
import { adminApi } from '../adminApi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
// Deliberately blank: opening hours are the owner's to enter, never assumed.
const BLANK = DAYS.map((day) => ({ day, open: '', close: '', closed: false }))

export default function HoursTab() {
  const [days, setDays] = useState(BLANK)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('loading') // loading | idle | saving | saved
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminApi
      .get('/hours')
      .then(({ hours }) => {
        if (hours?.days) {
          setDays(hours.days)
          setNote(hours.note || '')
        }
        setStatus('idle')
      })
      .catch((err) => {
        setMessage(err.message)
        setStatus('idle')
      })
  }, [])

  const update = (i, patch) => {
    setStatus('idle')
    setDays((list) => list.map((d, j) => (j === i ? { ...d, ...patch } : d)))
    setErrors({})
  }

  const save = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setMessage('')
    try {
      await adminApi.put('/hours', { days, note })
      setStatus('saved')
    } catch (err) {
      setStatus('idle')
      if (err instanceof ApiError && err.details) setErrors(err.details)
      else setMessage(err.message)
    }
  }

  return (
    <form className="admin-form" onSubmit={save} noValidate>
      <p className="admin-help">
        Opening hours show in the Contact section once saved. Leave a day’s times empty only if it is marked closed. A closing time after midnight (for example 01:00) is fine.
      </p>
      {days.map((d, i) => (
        <div key={d.day} className="admin-hours-row">
          <span className="admin-hours-day">{d.day}</span>
          <label className="admin-check">
            <input type="checkbox" checked={d.closed} onChange={(e) => update(i, { closed: e.target.checked })} /> Closed
          </label>
          <Field label="Opens" name={`open-${i}`} type="time" value={d.open} disabled={d.closed} onChange={(e) => update(i, { open: e.target.value })} error={errors[d.day]} />
          <Field label="Closes" name={`close-${i}`} type="time" value={d.close} disabled={d.closed} onChange={(e) => update(i, { close: e.target.value })} />
        </div>
      ))}
      <Field label="Note" name="note" value={note} maxLength={200} onChange={(e) => { setNote(e.target.value); setStatus('idle') }} error={errors.note} hint="For example: holiday timings may vary." optional />
      {message ? <p className="form-alert" role="alert">{message}</p> : null}
      {status === 'saved' ? <p className="admin-note" role="status">Saved. The website updates within a minute.</p> : null}
      <div className="admin-actions">
        <Button type="submit" size="sm" disabled={status === 'saving' || status === 'loading'}>
          {status === 'saving' ? 'Saving…' : 'Save hours'}
        </Button>
      </div>
    </form>
  )
}
