import { useEffect, useState } from 'react'
import { api } from '@/services/api'

/**
 * Owner-managed content (menu dishes, offers, opening hours) from GET /api/public/content.
 * Fetched once per page load and shared. If the API is unreachable the site simply falls back
 * to the copy in config/content.js, so the public page never breaks.
 */
let pending = null

const load = () => {
  if (!pending) {
    pending = api
      .get('/public/content')
      .catch(() => {
        pending = null // allow a retry on the next mount
        return null
      })
  }
  return pending
}

export default function usePublicContent() {
  const [content, setContent] = useState(null)

  useEffect(() => {
    let alive = true
    load().then((data) => alive && setContent(data))
    return () => {
      alive = false
    }
  }, [])

  return {
    menu: content?.menu ?? {},
    offers: content?.offers ?? [],
    hours: content?.hours ?? null,
  }
}
