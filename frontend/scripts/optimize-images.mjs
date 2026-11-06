/**
 * Shrinks client photography for the web. Run from frontend/:   npm run optimize-images
 *
 * - Hero / about / menu / celebration photos: longest side 2400px. Gallery photos: 1600px.
 * - Output is WebP (quality 80), written next to the original in src/assets/images.
 * - Originals are moved to src/assets/images/_originals/ (git-ignored, never bundled), so
 *   nothing is lost and re-running is safe: it always works from the originals.
 */
import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/images')
const originals = path.join(dir, '_originals')
const EXT = /\.(jpe?g|png|webp|avif)$/i
const kb = (n) => `${Math.round(n / 1024)} KB`

await mkdir(originals, { recursive: true })

// Work from originals when they exist, so repeated runs never re-compress an already-compressed file.
const sources = new Map()
for (const f of await readdir(originals)) if (EXT.test(f)) sources.set(path.parse(f).name, path.join(originals, f))
for (const f of await readdir(dir)) {
  if (!EXT.test(f)) continue
  const name = path.parse(f).name
  if (!sources.has(name)) {
    const dest = path.join(originals, f)
    await rename(path.join(dir, f), dest)
    sources.set(name, dest)
  }
}

let before = 0
let after = 0
for (const [name, src] of sources) {
  const max = name.toLowerCase().startsWith('gallery-') ? 1600 : 2400
  const out = path.join(dir, `${name}.webp`)
  await sharp(src)
    .rotate() // respect the camera's orientation flag
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out)
  const [a, b] = [(await stat(src)).size, (await stat(out)).size]
  before += a
  after += b
  console.log(`${name.padEnd(28)} ${kb(a).padStart(9)} -> ${kb(b).padStart(8)}`)
}
if (sources.size === 0) console.log('No photos found in src/assets/images yet.')
else console.log(`\nTotal ${kb(before)} -> ${kb(after)}`)
