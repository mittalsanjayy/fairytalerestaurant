/**
 * Editable page copy and image references.
 *
 * Copy here is written from the brand brief only (food, family, friends, celebrations, games,
 * late-night atmosphere). It makes no claims about history, awards, ingredients or hours.
 * Please have the owner review and adjust the wording before launch.
 *
 * Images: add the files to src/assets/images/ using these names (any of jpg/jpeg/png/webp/avif).
 */
export const HERO = {
  eyebrow: 'Kammanahalli · Bengaluru',
  title: 'WHERE EVERY MOMENT BECOMES A FAIRYTALE.',
  accentWords: ['FAIRYTALE.'],
  text: 'Experience extraordinary flavours, unforgettable celebrations and beautiful moments at Fairytale Café & Restaurant.',
  image: { name: 'hero-interior', alt: 'The warmly lit interior of Fairytale Café & Restaurant' },
  primaryCta: { label: 'Explore Our Menu', to: '/#menu' },
  secondaryCta: { label: 'Reserve Your Table', to: '/#reserve' },
}

export const ABOUT = {
  eyebrow: 'About Fairytale',
  title: 'MORE THAN A RESTAURANT. AN EXPERIENCE.',
  paragraphs: [
    'Fairytale is a destination for food, family, friends and celebrations: a place to arrive hungry and stay for the evening.',
    'From biryani and alfam to kebabs, tikka and mocktails, our table is made for sharing with the people you love.',
    'Come for a relaxed dinner, a birthday or an anniversary, or settle in for a late night with a game of carrom, chess or Ludo.',
  ],
  images: {
    main: { name: 'about-interior', alt: 'Guests dining at Fairytale Café & Restaurant' },
    accent: { name: 'about-detail', alt: 'A signature dish served at Fairytale' },
  },
  pillars: [
    { title: 'Atmosphere', text: 'Warm lighting and a setting made for lingering.' },
    { title: 'Food Quality', text: 'Biryani, alfam, kebabs and tikka, prepared with care.' },
    { title: 'Hospitality', text: 'Friendly service that makes every guest feel at home.' },
    { title: 'Dining Experience', text: 'Unhurried evenings, from the first plate to the last mocktail.' },
    { title: 'Social Gatherings', text: 'Carrom, chess and Ludo for friends and families.' },
    { title: 'Late-Night Atmosphere', text: 'A place to keep the evening going.' },
  ],
}

/* ==========================================================================
   PHASE 3 — Menu · Offers · Celebrations · Gallery
   ========================================================================== */

/**
 * MENU
 * Categories come from the brand brief only. `items` is deliberately empty: dish names, prices
 * and descriptions are business data and are entered by the owner (admin dashboard in Phase 5).
 * Until then, the section points guests to the full menu on Zomato.
 *
 * To add dishes now, fill `items` for a category:
 *   { name: 'Dish name', description: 'Optional one-liner', price: 000, veg: true | false | null }
 * `price` is a number in rupees (omit or null to hide it). `veg` null hides the veg/non-veg marker.
 */
export const MENU = {
  eyebrow: 'The Menu',
  title: 'A TABLE MADE FOR SHARING.',
  lead: 'Biryani, alfam, kebabs, tikka and mocktails: come hungry, order generously and share everything.',
  categories: [
    {
      id: 'biryani',
      label: 'Biryani',
      tagline: 'The centrepiece of the table.',
      text: 'Fragrant, generous and made to be passed around, biryani is the dish our evenings are built on.',
      image: { name: 'menu-biryani', alt: 'Biryani served at Fairytale' },
      items: [],
    },
    {
      id: 'alfam',
      label: 'Alfam',
      tagline: 'Smoky, juicy, shareable.',
      text: 'Alfam for the whole table, best enjoyed with friends and a little time to linger.',
      image: { name: 'menu-alfam', alt: 'Alfam served at Fairytale' },
      items: [],
    },
    {
      id: 'kebabs',
      label: 'Kebabs',
      tagline: 'Starters that start the evening.',
      text: 'Kebabs to begin with, to share, or to keep ordering all night.',
      image: { name: 'menu-kebabs', alt: 'Kebabs served at Fairytale' },
      items: [],
    },
    {
      id: 'tikka',
      label: 'Tikka',
      tagline: 'Char, spice and good company.',
      text: 'Tikka that pairs with everything on the table and everyone around it.',
      image: { name: 'menu-tikka', alt: 'Tikka served at Fairytale' },
      items: [],
    },
    {
      id: 'mocktails',
      label: 'Mocktails',
      tagline: 'Something cool for the long evening.',
      text: 'Mocktails to sip through dinner, a celebration, or one more round of carrom.',
      image: { name: 'menu-mocktails', alt: 'Mocktails served at Fairytale' },
      items: [],
    },
  ],
  emptyNote: 'Our full menu, with current dishes and prices, is on Zomato. You can also call us to ask about today’s menu.',
  fullMenuCta: { label: 'View Full Menu on Zomato' },
  callCta: { label: 'Call to Ask' },
}

/**
 * OFFERS
 * No offer is invented. Add real ones to `items` when the owner confirms them:
 *   { title: 'Offer name', description: 'What it is', terms: 'Optional: when/where it applies' }
 * While `items` is empty, a "ask us" panel is shown instead.
 */
export const OFFERS = {
  eyebrow: 'Offers',
  title: 'SPECIAL MOMENTS, SPECIALLY SERVED.',
  lead: 'Current offers and seasonal specials appear here as soon as the owner adds them.',
  items: [],
  empty: {
    title: 'Ask What’s On Today',
    text: 'Offers can change from time to time. Call or message us on WhatsApp and we’ll tell you what is available right now.',
    whatsappMessage: 'Hello Fairytale, could you tell me about your current offers?',
  },
}

/**
 * CELEBRATIONS
 * Occasions only; no packages, decor, cakes or prices are promised. Enquiries go straight to
 * WhatsApp with a prefilled message. Each card also opens the reservation form with the occasion pre-selected (Phase 4).
 */
export const CELEBRATIONS = {
  eyebrow: 'Celebrations',
  title: 'THE MOMENTS WORTH MARKING.',
  lead: 'Birthdays, anniversaries and long evenings with the people you love. Tell us the occasion and we’ll take it from there.',
  occasions: [
    {
      id: 'birthdays',
      reserveOccasion: 'birthday',
      title: 'Birthdays',
      text: 'A table for the birthday and everyone who came to celebrate it.',
      image: { name: 'celebration-birthday', alt: 'A birthday celebration at Fairytale' },
      message: 'Hello Fairytale, I would like to plan a birthday celebration. Date: , Number of guests: .',
    },
    {
      id: 'anniversaries',
      reserveOccasion: 'anniversary',
      title: 'Anniversaries',
      text: 'An unhurried, warmly lit evening for two, or for the whole family.',
      image: { name: 'celebration-anniversary', alt: 'An anniversary dinner at Fairytale' },
      message: 'Hello Fairytale, I would like to plan an anniversary dinner. Date: , Number of guests: .',
    },
    {
      id: 'family',
      reserveOccasion: 'family',
      title: 'Family Gatherings',
      text: 'Big tables, shared plates and room for every generation.',
      image: { name: 'celebration-family', alt: 'A family gathering at Fairytale' },
      message: 'Hello Fairytale, I would like to book a family gathering. Date: , Number of guests: .',
    },
    {
      id: 'friends',
      reserveOccasion: 'friends',
      title: 'Friends’ Nights',
      text: 'Late dinners, mocktails, and a game of carrom, chess or Ludo.',
      image: { name: 'celebration-friends', alt: 'Friends together at Fairytale' },
      message: 'Hello Fairytale, I would like to plan an evening out with friends. Date: , Number of guests: .',
    },
  ],
  cta: { label: 'Enquire on WhatsApp' },
  reserveLabel: 'Reserve a table',
}

/**
 * GALLERY
 * Any file named `gallery-*` in src/assets/images appears automatically (gallery-01.jpg,
 * gallery-02.jpg, ...). Optional: give a photo a description below, keyed by file name without
 * extension, for screen readers. Photos without one get a generic description.
 */
export const GALLERY = {
  eyebrow: 'Gallery',
  title: 'A GLIMPSE OF THE EVENING.',
  lead: 'Warm lights, shared plates and good company.',
  prefix: 'gallery-',
  alts: {
    // 'gallery-01': 'Warm hanging lights above the dining area',
  },
  emptyText: 'Photographs from Fairytale are on their way. In the meantime, see what we’re up to on Instagram.',
}

/* ==========================================================================
   PHASE 4 — Reservations · Contact
   ========================================================================== */

/**
 * RESERVATIONS
 * A request form, not an instant booking: nothing is confirmed until the restaurant calls or
 * messages back. No opening hours, table counts or deposits are promised. `maxGuests` must match
 * MAX_PARTY_SIZE in backend/.env; `maxAdvanceDays` must match MAX_ADVANCE_DAYS.
 */
export const RESERVATIONS = {
  eyebrow: 'Reservations',
  title: 'RESERVE YOUR TABLE.',
  lead: 'Tell us when you’d like to join us and who’s coming. We’ll get back to you to confirm your table.',
  maxGuests: 20,
  maxAdvanceDays: 90,
  occasions: [
    { value: '', label: 'No special occasion' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'family', label: 'Family gathering' },
    { value: 'friends', label: 'Friends’ night' },
    { value: 'other', label: 'Something else' },
  ],
  notice: 'This is a request, not a confirmed booking. We’ll confirm by phone or WhatsApp.',
  largeParty: 'Planning for more than 20 guests? Please call us so we can arrange it properly.',
  success: {
    title: 'REQUEST RECEIVED.',
    text: 'Thank you. We’ll confirm your table shortly by phone or WhatsApp.',
    whatsappLabel: 'Message us on WhatsApp',
    anotherLabel: 'Make another request',
  },
}

/**
 * CONTACT
 * Hours are intentionally absent until the owner supplies them (admin dashboard, Phase 5).
 */
export const CONTACT = {
  eyebrow: 'Contact',
  title: 'COME AND SAY HELLO.',
  lead: 'Questions, feedback or a celebration to plan? Write to us, call, or message us on WhatsApp.',
  hoursNote: 'Not sure about today’s timings? Give us a call.',
  whatsappMessage: 'Hello Fairytale, I have a question.',
  success: 'Thank you. We’ve received your message and will get back to you soon.',
}
