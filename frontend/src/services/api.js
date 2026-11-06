/**
 * Thin fetch wrapper for the Flask REST API.
 * - JSON and FormData (file uploads) supported
 * - Timeout + readable errors
 * - Optional bearer token (admin routes, Phase 5)
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details // field-level validation errors from the server
  }
}

async function request(path, { method = 'GET', body, token, signal, headers = {} } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const options = {
    method,
    signal: controller.signal,
    headers: { Accept: 'application/json', ...headers },
  }
  if (token) options.headers.Authorization = `Bearer ${token}`
  if (body !== undefined) {
    if (isForm) {
      options.body = body // browser sets the multipart boundary
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Please check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }

  let data = null
  if (response.status !== 204) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.message || data?.error || `Request failed (${response.status})`, {
      status: response.status,
      details: data?.errors ?? null,
    })
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

/** Public forms (Phase 4). Both resolve with the server's JSON or throw ApiError (with `details` per field). */
export const submitReservation = (payload) => api.post('/reservations', payload)
export const submitContact = (payload) => api.post('/contact', payload)
