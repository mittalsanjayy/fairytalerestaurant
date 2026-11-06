import { api } from '@/services/api'

/**
 * Admin session. The token lives in sessionStorage: it ends when the tab closes and the
 * server expires it after JWT_EXPIRES_HOURS regardless.
 */
const KEY = 'fairytale:admin-token'
let onUnauthorized = () => {}

export const getToken = () => {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}
export const setToken = (token) => {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* storage blocked: the session just won't survive a reload */
  }
}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

async function call(method, path, body) {
  try {
    return await api[method](path, ...(body === undefined ? [{ token: getToken() }] : [body, { token: getToken() }]))
  } catch (err) {
    if (err.status === 401 && path !== '/admin/auth/login') onUnauthorized()
    throw err
  }
}

export const adminApi = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }),
  get: (path) => call('get', `/admin${path}`),
  post: (path, body) => call('post', `/admin${path}`, body),
  put: (path, body) => call('put', `/admin${path}`, body),
  patch: (path, body) => call('patch', `/admin${path}`, body),
  del: (path) => call('delete', `/admin${path}`),
}
