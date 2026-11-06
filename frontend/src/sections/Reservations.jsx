import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarCheck, CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { RESERVATIONS as R } from '@/config/content'
import { SITE, whatsappLink } from '@/config/site'
import { ApiError, submitReservation } from '@/services/api'
import {
  addDays,
  formatLongDate,
  formatTime,
  isoDate,
  validateReservation,
} from '@/lib/formValidation'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import GoldDivider from '@/components/ui/GoldDivider'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Reservations.css'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  guests: '2',
  date: '',
  time: '',
  occasion: '',
  notes: '',
  website: '', // honeypot, must stay empty
}

export default function Reservations() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState(null)
  const formRef = useRef(null)
  const doneRef = useRef(null)

  const today = new Date()
  const minDate = isoDate(today)
  const maxDate = isoDate(addDays(today, R.maxAdvanceDays))

  // Celebrations cards fire this event to pre-select an occasion.
  useEffect(() => {
    const onPrefill = (e) => {
      const occasion = e.detail?.occasion
      if (occasion) setValues((v) => ({ ...v, occasion }))
    }
    window.addEventListener('fairytale:reserve', onPrefill)
    return () => window.removeEventListener('fairytale:reserve', onPrefill)
  }, [])

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus()
  }, [status])

  const focusFirstError = useCallback(() => {
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setFormError('')

    const found = validateReservation(values, { maxGuests: R.maxGuests })
    if (Object.keys(found).length > 0) {
      setErrors(found)
      focusFirstError()
      return
    }

    setStatus('sending')
    try {
      const res = await submitReservation({ ...values, guests: Number(values.guests) })
      setResult({ ...res.reservation, date: values.date, time: values.time, guests: Number(values.guests), name: values.name.trim() })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      if (err instanceof ApiError && err.details) {
        setErrors(err.details)
        setFormError(err.message)
        focusFirstError()
      } else {
        setFormError(
          err instanceof ApiError
            ? err.message
            : 'Something went wrong. Please try again, or call us.',
        )
      }
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setFormError('')
    setResult(null)
    setStatus('idle')
  }

  const confirmMessage = result
    ? `Hello Fairytale, I just requested a table (ref ${result.reference}) for ${result.guests} on ${formatLongDate(result.date)} at ${formatTime(result.time)}. Name: ${result.name}.`
    : ''

  return (
    <section id="reserve" className="reserve section" aria-labelledby="reserve-title">
      <div className="container reserve__layout">
        <div className="reserve__intro">
          <span className="eyebrow">{R.eyebrow}</span>
          <SplitText
            id="reserve-title"
            as="h2"
            className="reserve__title"
            text={R.title}
            onScroll
            stagger={0.08}
          />
          <GoldDivider />
          <Reveal>
            <p className="lead">{R.lead}</p>
            <p className="reserve__notice">
              <CalendarCheck size={16} aria-hidden="true" /> {R.notice}
            </p>
            <p className="reserve__large">{R.largeParty}</p>
            <div className="reserve__alt">
              <Button href={SITE.phoneHref} variant="ghost" icon={<Phone size={15} />}>
                {SITE.phone}
              </Button>
              <Button
                href={whatsappLink('Hello Fairytale, I would like to reserve a table.')}
                variant="ghost"
                icon={<MessageCircle size={15} />}
              >
                WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="reserve__panel">
          {status === 'done' && result ? (
            <div className="reserve__done" role="status">
              <CheckCircle2 size={40} strokeWidth={1.25} aria-hidden="true" className="reserve__tick" />
              <h3 ref={doneRef} tabIndex={-1}>
                {R.success.title}
              </h3>
              <p>{R.success.text}</p>
              <dl className="reserve__summary">
                <div>
                  <dt>Reference</dt>
                  <dd className="reserve__ref">{result.reference}</dd>
                </div>
                <div>
                  <dt>When</dt>
                  <dd>
                    {formatLongDate(result.date)}, {formatTime(result.time)}
                  </dd>
                </div>
                <div>
                  <dt>Guests</dt>
                  <dd>{result.guests}</dd>
                </div>
              </dl>
              <div className="reserve__done-actions">
                <Button href={whatsappLink(confirmMessage)} icon={<MessageCircle size={15} />}>
                  {R.success.whatsappLabel}
                </Button>
                <Button variant="ghost" onClick={reset}>
                  {R.success.anotherLabel}
                </Button>
              </div>
            </div>
          ) : (
            <form ref={formRef} className="reserve__form" onSubmit={onSubmit} noValidate>
              <Field label="Full name" name="name" value={values.name} onChange={onChange} error={errors.name} autoComplete="name" required />
              <div className="reserve__row">
                <Field label="Phone" name="phone" type="tel" inputMode="tel" value={values.phone} onChange={onChange} error={errors.phone} autoComplete="tel" placeholder="98450 12345" required />
                <Field label="Email" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" optional />
              </div>
              <div className="reserve__row reserve__row--3">
                <Field label="Date" name="date" type="date" value={values.date} onChange={onChange} error={errors.date} min={minDate} max={maxDate} required />
                <Field label="Time" name="time" type="time" value={values.time} onChange={onChange} error={errors.time} required />
                <Field as="select" label="Guests" name="guests" value={values.guests} onChange={onChange} error={errors.guests} required>
                  {Array.from({ length: R.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </Field>
              </div>
              <Field as="select" label="Occasion" name="occasion" value={values.occasion} onChange={onChange} error={errors.occasion} optional>
                {R.occasions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Field>
              <Field as="textarea" label="Anything we should know?" name="notes" rows={3} maxLength={500} value={values.notes} onChange={onChange} error={errors.notes} hint="Seating preferences, a cake, dietary needs…" optional />

              <div className="hp-field" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange} />
                </label>
              </div>

              {formError ? (
                <p className="form-alert" role="alert">
                  {formError}
                </p>
              ) : null}

              <Button type="submit" size="lg" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request this table'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
