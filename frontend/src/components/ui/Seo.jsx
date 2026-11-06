import { useEffect } from 'react'
import { SITE } from '@/config/site'

function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(create)
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
}

const setMeta = (attr, key, content) =>
  upsert(`meta[${attr}="${key}"]`, 'meta', { [attr]: key, content })

/**
 * Per-page SEO. Updates <title>, description, canonical and Open Graph tags on
 * route change. Defaults come from src/config/site.js.
 */
export default function Seo({ title, description = SITE.description, path = '/', noindex = false }) {
  useEffect(() => {
    const url = `${window.location.origin}${path}`

    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
  }, [title, description, path, noindex])

  return null
}
