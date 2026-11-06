import { useCallback, useEffect, useState } from 'react'
import { adminApi } from './adminApi'

/** Loads `path` (GET) and returns { items, loading, error, reload, setItems }. */
export default function useAdminData(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.get(path)
      setItems(data.items ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, setItems, loading, error, reload }
}
