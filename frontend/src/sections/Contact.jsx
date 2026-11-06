import { useRef, useState } from 'react'
import { CheckCircle2, Clock, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react'
import { CONTACT as C } from '@/config/content'
import { SITE, fullAddress, mapsDirectionsUrl, whatsappLink } from '@/config/site'
import { ApiError, submitContact } from '@/services/api'
import { formatTime, validateContact } from '@/lib/formValidation'
import usePublicContent from '@/hooks/usePublicContent'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import GoldDivider from '@/components/ui/GoldDivider'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Contact.css'

const EMPTY = { name: '', phone: '', email: '', message: '', website: '' }

export default function Contact() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [formError, setFormError] = useState('')
  const formRef = useRef(null)
  const { hours } = usePublicContent()

  const focusFirstError = () =>
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setFormError('')

    const found = validateContact(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      focusFirstError()
      return
    }

    setStatus('sending')
    try {
      await submitContact(values)
      setStatus('done')
      setValues(EMPTY)
    } catch (err) {
      setStatus('idle')
      if (err instanceof ApiError && err.details) {
        setErrors(err.details)
        setFormError(err.message)
        focusFirstError()
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again, or call us.')
      }
    }
  }

  return (
    <section id="contact" className="contact section" aria-labelledby="contact-title">
      <div className="container contact__layout">
        <div className="contact__info">
          <span className="eyebrow">{C.eyebrow}</span>
          <SplitText id="contact-title" as="h2" className="contact__title" text={C.title} onScroll stagger={0.08} />
          <GoldDivider />
          <Reveal>
            <p className="lead">{C.lead}</p>

            <ul className="contact__list">
              <li>
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <address>{fullAddress()}</address>
                  <a href={mapsDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                    Get directions
                  </a>
                </div>
              </li>
              {hours?.days ? (
                <li>
                  <Clock size={18} aria-hidden="true" />
                  <div>
                    <table className="contact__hours">
                      <caption className="sr-only">Opening hours</caption>
                      <tbody>
                        {hours.days.map((d) => (
                          <tr key={d.day}>
                            <th scope="row">{d.day}</th>
                            <td>{d.closed ? 'Closed' : `${formatTime(d.open)} – ${formatTime(d.close)}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {hours.note ? <span>{hours.note}</span> : null}
                  </div>
                </li>
              ) : null}
              <li>
                <Phone size={18} aria-hidden="true" />
                <div>
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                  {hours?.days ? null : <span>{C.hoursNote}</span>}
                </div>
              </li>
              <li>
                <MessageCircle size={18} aria-hidden="true" />
                <div>
                  <a href={whatsappLink(C.whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    Message on WhatsApp
                  </a>
                </div>
              </li>
              <li>
                <Instagram size={18} aria-hidden="true" />
                <div>
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                    @fairytale.restaurant
                  </a>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="contact__panel">
          {status === 'done' ? (
            <div className="contact__done" role="status">
              <CheckCircle2 size={40} strokeWidth={1.25} aria-hidden="true" className="reserve__tick" />
              <h3>MESSAGE SENT.</h3>
              <p>{C.success}</p>
              <Button variant="ghost" onClick={() => setStatus('idle')}>
                Send another message
              </Button>
            </div>
          ) : (
            <form ref={formRef} className="contact__form" onSubmit={onSubmit} noValidate>
              <Field label="Name" name="name" value={values.name} onChange={onChange} error={errors.name} autoComplete="name" required />
              <div className="contact__row">
                <Field label="Phone" name="phone" type="tel" inputMode="tel" value={values.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
                <Field label="Email" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" hint="Phone or email, so we can reply." />
              </div>
              <Field as="textarea" label="Message" name="message" rows={5} maxLength={1500} value={values.message} onChange={onChange} error={errors.message} required />

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
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
