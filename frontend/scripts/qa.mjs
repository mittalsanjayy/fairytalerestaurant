/**
 * Automated responsive smoke test. Needs the production preview running:
 *     npm run build && npm run preview          (terminal 1)
 *     npm run qa                                (terminal 2)
 * Optional: QA_URL=https://your-domain.example npm run qa
 *
 * For each viewport it checks: no horizontal scroll, no console errors / failed requests,
 * every image has alt text, every form control has a label, tap targets >= 40px (warning),
 * and writes a full-page screenshot to qa-report/. Exit code 1 on any failure.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const URL = process.env.QA_URL || 'http://localhost:4173'
const VIEWPORTS = [
  { name: 'phone-small', width: 360, height: 740 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
]

await mkdir('qa-report', { recursive: true })
const browser = await chromium.launch()
let failures = 0

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'reduce', // skips the intro curtain and scroll animations so the test is deterministic
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  const problems = []
  const warnings = []

  page.on('console', (m) => m.type() === 'error' && problems.push(`console error: ${m.text()}`))
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`))
  page.on('response', (r) => {
    const u = r.url()
    // /api calls legitimately fail when no backend is running; flag everything else.
    if (r.status() >= 400 && !u.includes('/api/')) problems.push(`HTTP ${r.status()}: ${u}`)
  })

  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  const report = await page.evaluate(() => {
    const doc = document.documentElement
    const overflowX = doc.scrollWidth - doc.clientWidth
    const noAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc || i.src)
    const unlabeled = [...document.querySelectorAll('input:not([type=hidden]):not([tabindex="-1"]), select, textarea')]
      .filter((el) => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
      .map((el) => el.name || el.type)
    const small = [...document.querySelectorAll('a[href], button')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const visible = r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
        return visible && (r.height < 40 || r.width < 40) && !el.closest('.skip-link')
      })
      .map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30))
    return { overflowX, noAlt, unlabeled, small, h1: document.querySelectorAll('h1').length }
  })

  if (report.overflowX > 1) problems.push(`horizontal scroll: page is ${report.overflowX}px wider than the viewport`)
  if (report.noAlt.length) problems.push(`images without alt: ${report.noAlt.join(', ')}`)
  if (report.unlabeled.length) problems.push(`unlabeled form controls: ${report.unlabeled.join(', ')}`)
  if (report.h1 !== 1) problems.push(`expected exactly one <h1>, found ${report.h1}`)
  if (report.small.length) warnings.push(`small tap targets: ${[...new Set(report.small)].join(' | ')}`)

  await page.screenshot({ path: `qa-report/${vp.name}-${vp.width}.png`, fullPage: true })
  await context.close()

  console.log(`${problems.length ? '✗' : '✓'} ${vp.name} ${vp.width}×${vp.height}`)
  problems.forEach((p) => console.log(`    FAIL  ${p}`))
  warnings.forEach((w) => console.log(`    warn  ${w}`))
  failures += problems.length
}

await browser.close()
console.log(failures ? `\n${failures} problem(s). Screenshots in qa-report/` : '\nAll checks passed. Screenshots in qa-report/')
process.exit(failures ? 1 : 0)
