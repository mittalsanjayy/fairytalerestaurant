/**
 * Client photography lookup.
 *
 * Drop images into src/assets/images/ and reference them by file name WITHOUT the extension:
 *   getImage('hero-interior')  ->  src/assets/images/hero-interior.jpg (or .webp / .png / .avif)
 *
 * Returns null when the photo has not been added yet, so sections can show a graceful fallback
 * instead of a broken image.
 */
const modules = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const index = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop()
  index[file.replace(/\.[^.]+$/, '').toLowerCase()] = url
}

export const getImage = (name) => index[name.toLowerCase()] ?? null

/**
 * Every photo whose file name starts with `prefix`, sorted by name.
 *   getImagesByPrefix('gallery-')  ->  [{ name: 'gallery-01', src: '...' }, ...]
 * Lets the gallery grow by simply dropping files into src/assets/images (no code changes).
 */
export const getImagesByPrefix = (prefix) =>
  Object.keys(index)
    .filter((name) => name.startsWith(prefix.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({ name, src: index[name] }))
