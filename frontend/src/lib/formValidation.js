/**
 * Client-side checks for the public forms. They only give instant feedback: the Flask API
 * repeats every rule and is the source of truth.
 */

export const isValidPhone = (value) => {
  const raw = String(value || '').trim()
  const digits = raw.replace(/\D/g, '')
  if (raw.startsWith('+')) return digits.length >= 8 && digits.length <= 15
  let d = digits
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d)
}

export const isValidEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || '').trim())

/** Local YYYY-MM-DD for <input type="date"> bounds. */
export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const addDays = (d, n) => {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

export const formatLongDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function validateReservation(v, { maxGuests }) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please tell us your name.'
  if (!v.phone.trim()) e.phone = 'Please enter a phone number so we can confirm.'
  else if (!isValidPhone(v.phone)) e.phone = 'Enter a valid 10-digit mobile number (or include your country code with +).'
  if (v.email.trim() && !isValidEmail(v.email)) e.email = 'That email address doesn’t look right.'
  const g = Number(v.guests)
  if (!g || g < 1) e.guests = 'Please choose the number of guests.'
  else if (g > maxGuests) e.guests = `For parties of more than ${maxGuests}, please call us.`
  if (!v.date) e.date = 'Please choose a date.'
  if (!v.time) e.time = 'Please choose a time.'
  if (v.notes.length > 500) e.notes = 'Please keep your note under 500 characters.'
  return e
}

export function validateContact(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please tell us your name.'
  if (v.phone.trim() && !isValidPhone(v.phone)) e.phone = 'Enter a valid 10-digit mobile number (or include your country code with +).'
  if (v.email.trim() && !isValidEmail(v.email)) e.email = 'That email address doesn’t look right.'
  if (!v.phone.trim() && !v.email.trim() && !e.phone && !e.email) e.phone = 'Please share a phone number or an email so we can reply.'
  if (v.message.trim().length < 5) e.message = 'Please write a short message.'
  else if (v.message.length > 1500) e.message = 'Please keep your message under 1500 characters.'
  return e
}
