/**
 * Primary navigation.
 * `live: false` items are hidden until their section exists, so no link ever points at nothing.
 * Flip the flag as each phase ships the section (Phase 3: Menu, Offers, Celebrations, Gallery;
 * Phase 4: Contact).
 */
export const NAV_LINKS = [
  { label: 'Our Story', to: '/#about', live: true },
  { label: 'Menu', to: '/#menu', live: true },
  { label: 'Offers', to: '/#offers', live: true },
  { label: 'Celebrations', to: '/#celebrations', live: true },
  { label: 'Gallery', to: '/#gallery', live: true },
  { label: 'Reserve', to: '/#reserve', live: true },
  { label: 'Contact', to: '/#contact', live: true },
]

export const liveLinks = () => NAV_LINKS.filter((link) => link.live)
