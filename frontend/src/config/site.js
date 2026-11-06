/**
 * Business information — single source of truth for the frontend.
 *
 * Only facts supplied by the client appear here. Anything unknown is `null`
 * and is either hidden in the UI or managed from the admin dashboard (Phase 5).
 * Do NOT invent opening hours, prices or reviews.
 */
export const SITE = {
  name: 'FAIRYTALE',
  subtitle: 'CAFÉ & RESTAURANT',
  fullName: 'Fairytale Café & Restaurant',
  tagline: 'Good Food. Great Vibes. Unforgettable Moments.',
  description:
    'Fairytale Café & Restaurant, Kammanahalli, Bengaluru. Biryani, alfam, kebabs, tikka and mocktails, plus celebrations and late-night dining.',

  address: {
    line1: '4M, 408, Kammanahalli Main Road, near Petrol Pump',
    line2: 'HRBR Layout 2nd Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560043',
    country: 'India',
  },

  phone: '+91 7026360944',
  phoneHref: 'tel:+917026360944',

  // EDITABLE PLACEHOLDER: assumed to be the same number as the phone above. Confirm with the client.
  whatsappNumber: '917026360944',

  instagram: 'https://www.instagram.com/fairytale.restaurant/',
  zomato: 'https://zomato.onelink.me/xqzv/50myiccq',

  // Business hours are managed from the admin dashboard (Phase 5). Never hardcode them here.
  hours: null,
}

export const fullAddress = () => {
  const a = SITE.address
  return `${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.postalCode}`
}

export const whatsappLink = (message = '') =>
  `https://wa.me/${SITE.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`

export const mapsDirectionsUrl = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`
