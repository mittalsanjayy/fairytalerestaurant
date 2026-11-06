import { useCallback, useEffect, useState } from 'react'
import Seo from '@/components/ui/Seo'
import { getToken, setToken, setUnauthorizedHandler } from './adminApi'
import Login from './Login'
import Dashboard from './Dashboard'
import './admin.css'

export default function AdminApp() {
  const [token, setTokenState] = useState(getToken)
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')

  const signOut = useCallback((message = '') => {
    setToken(null)
    setTokenState(null)
    setNotice(typeof message === 'string' ? message : '')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => signOut('Your session has ended. Please sign in again.'))
  }, [signOut])

  const onLoggedIn = (res) => {
    setToken(res.token)
    setEmail(res.email)
    setNotice('')
    setTokenState(res.token)
  }

  return (
    <div className="admin">
      <Seo title="Admin | Fairytale" path="/admin" noindex />
      {token ? (
        <Dashboard email={email} onSignOut={() => signOut()} />
      ) : (
        <Login onLoggedIn={onLoggedIn} notice={notice} />
      )}
    </div>
  )
}
