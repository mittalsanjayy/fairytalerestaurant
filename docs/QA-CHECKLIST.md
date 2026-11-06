# Launch QA checklist

## Automated (run first)

```bash
cd frontend
npm install
npm run build && npm run preview     # terminal 1  (http://localhost:4173)
npm run qa                           # terminal 2
```

`npm run qa` opens the site at 360, 390, 768, 1280 and 1920 px wide and fails on: horizontal scrolling, console errors or failed requests, images without alt text, unlabeled form fields, or anything other than one `<h1>`. It warns about tap targets under 40 px and saves full-page screenshots to `frontend/qa-report/`: **look at them**; automation cannot judge beauty. (It runs with reduced motion on, so it skips the intro curtain.)
For a hosted site: `QA_URL=https://your-domain npm run qa`.

Also run `pytest` in `backend/`.

## Performance (Chrome DevTools → Lighthouse, mobile, on the *preview or live* site, not `npm run dev`)

Targets: Performance 85+, Accessibility 95+, Best Practices 95+, SEO 95+.
If Performance is low, in order of likelihood:
1. Photos not optimised → `npm run optimize-images`.
2. The hero image is the largest element: confirm it is a WebP under ~400 KB.
3. Test on a throttled phone profile; the GSAP/Framer chunks are the heaviest scripts.

## Manual, on a real phone and a laptop

- [ ] Intro plays once per visit, never blocks the page for more than a few seconds, and is skipped with "reduce motion" on.
- [ ] Every nav link scrolls to the right section; the mobile menu opens, traps focus, closes with Esc.
- [ ] Reserve form: submit with errors (messages appear beside fields), then a valid request (reference shown, WhatsApp button opens a prefilled chat).
- [ ] The booking appears in `/admin`; confirm it and open the WhatsApp-guest link.
- [ ] Contact form works; message appears in `/admin`.
- [ ] Add a dish, an offer and opening hours in `/admin`; they appear on the site within a minute.
- [ ] Keyboard only: Tab through the whole page; focus is always visible; forms usable without a mouse.
- [ ] Screen reader spot check (VoiceOver / TalkBack / NVDA): headings, form labels and errors are read out.
- [ ] Phone, directions, WhatsApp and Instagram links go to the right place.
- [ ] Link preview: paste the URL into WhatsApp and check the title/description (add a social image if you want a picture).
- [ ] `https://your-domain/robots.txt` and `/sitemap.xml` use the real domain, not `your-domain.example`.
- [ ] Owner receives the email alert (if SMTP configured).
- [ ] Test the 404 page and a refresh on `/admin` (SPA fallback works).
